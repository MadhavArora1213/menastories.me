const express = require('express');
const router = express.Router();
const { Article, Category, Tag, User, Author, Comment, CommentVote, CommentReport, ArticleView, ArticleShare } = require('../models');
const allowedCategories = require('../config/allowedCategories');
const { Op, Sequelize } = require('sequelize');
const { optionalAuth } = require('../middleware/auth');

// Get article by slug
router.get('/articles/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    
    const article = await Article.findOne({
      where: { 
        slug,
        status: 'published',
        publishedAt: {
          [Op.lte]: new Date()
        }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color', 'type'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar', 'bio', 'socialLinks', 'isEmailVerified']
        }
      ]
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get view count
    const viewCount = await ArticleView.count({
      where: { articleId: article.id }
    });

    // Get share count
    const shareCount = await ArticleShare.count({
      where: { articleId: article.id }
    });

    res.json({
      success: true,
      article: {
        ...article.toJSON(),
        viewCount,
        shareCount
      }
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article'
    });
  }
});

// Track article view
router.post('/articles/:slug/view', async (req, res) => {
  try {
    const { slug } = req.params;
    const { userAgent, referrer, timestamp } = req.body;
    
    const article = await Article.findOne({
      where: { slug },
      attributes: ['id']
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Create view record
    await ArticleView.create({
      articleId: article.id,
      ipAddress: req.ip,
      userAgent,
      referrer,
      viewedAt: timestamp || new Date()
    });

    // Update article view count
    await Article.increment('viewCount', {
      where: { id: article.id }
    });

    res.json({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track view'
    });
  }
});

// Get related articles
router.get('/articles/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      exclude, 
      limit = 6, 
      page = 0,
      algorithm = 'smart',
      categoryId,
      tags,
      authorId
    } = req.query;

    const baseArticle = await Article.findByPk(id, {
      include: [
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: Category, as: 'category' }
      ]
    });

    if (!baseArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    let whereClause = {
      id: { [Op.ne]: id },
      status: 'published',
      publishedAt: { [Op.lte]: new Date() }
    };

    if (exclude) {
      whereClause.id[Op.notIn] = Array.isArray(exclude) ? exclude : [exclude];
    }

    let orderClause = [['publishedAt', 'DESC']];
    let includeClause = [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'color']
      },
      {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name', 'slug', 'color'],
        through: { attributes: [] }
      },
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar']
      }
    ];

    // Apply algorithm-specific logic
    switch (algorithm) {
      case 'category':
        if (categoryId || baseArticle.categoryId) {
          whereClause.categoryId = categoryId || baseArticle.categoryId;
        }
        break;

      case 'tags':
        if (tags || baseArticle.tags.length > 0) {
          const tagIds = tags ? tags.split(',') : baseArticle.tags.map(t => t.id);
          includeClause.push({
            model: Tag,
            as: 'tags',
            where: { id: { [Op.in]: tagIds } },
            through: { attributes: [] },
            required: true
          });
        }
        break;

      case 'author':
        if (authorId || baseArticle.authorId) {
          whereClause.authorId = authorId || baseArticle.authorId;
        }
        break;

      case 'popular':
        orderClause = [['viewCount', 'DESC'], ['publishedAt', 'DESC']];
        break;

      case 'smart':
      default:
        // Smart algorithm: combination of category, tags, and popularity
        const smartQuery = `
          SELECT a.*, 
            (CASE WHEN a.categoryId = ${baseArticle.categoryId} THEN 5 ELSE 0 END +
             CASE WHEN EXISTS (
               SELECT 1 FROM ArticleTags at1 
               JOIN ArticleTags at2 ON at1.tagId = at2.tagId 
               WHERE at1.articleId = a.id AND at2.articleId = ${baseArticle.id}
             ) THEN 3 ELSE 0 END +
             (a.viewCount / 1000.0) +
             (DATEDIFF(NOW(), a.publishedAt) * -0.1)
            ) as relevanceScore
          FROM Articles a
          WHERE a.id != ${id} AND a.status = 'published' AND a.publishedAt <= NOW()
          ORDER BY relevanceScore DESC, a.publishedAt DESC
          LIMIT ${limit} OFFSET ${page * limit}
        `;
        
        const smartResults = await sequelize.query(smartQuery, {
          type: Sequelize.QueryTypes.SELECT
        });
        
        if (smartResults.length > 0) {
          const articleIds = smartResults.map(r => r.id);
          const relatedArticles = await Article.findAll({
            where: { id: { [Op.in]: articleIds } },
            include: includeClause,
            order: Sequelize.literal(`FIELD(id, ${articleIds.join(',')})`)
          });

          return res.json({
            success: true,
            articles: relatedArticles,
            total: smartResults.length,
            algorithm: 'smart'
          });
        }
        break;
    }

    const { count, rows } = await Article.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(page) * parseInt(limit)
    });

    res.json({
      success: true,
      articles: rows,
      total: count,
      algorithm
    });

  } catch (error) {
    console.error('Error fetching related articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related articles'
    });
  }
});

// Track article share
router.post('/articles/:id/share-count', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Create share record
    await ArticleShare.create({
      articleId: id,
      platform,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sharedAt: new Date()
    });

    // Get updated share count
    const shareCount = await ArticleShare.count({
      where: { articleId: id }
    });

    res.json({
      success: true,
      shareCount,
      message: 'Share tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking share:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track share'
    });
  }
});

// Get article comments
router.get('/articles/:slug/comments', async (req, res) => {
  try {
    console.log('Comment route called with params:', req.params);
    const { slug } = req.params;
    console.log('Extracted slug:', slug);
    const {
      page = 1,
      limit = 10,
      sort = 'newest'
    } = req.query;

    // First, find the article by slug in Articles table
    console.log('Looking up article with slug:', slug);
    let article = await Article.findOne({
      where: { slug },
      attributes: ['id', 'title', 'slug']
    });

    console.log('Article lookup result:', article);

    let isVideoArticle = false;

    // If not found in Articles, check VideoArticles table
    if (!article) {
      const { VideoArticle } = require('../models');
      article = await VideoArticle.findOne({
        where: { slug },
        attributes: ['id', 'title', 'slug']
      });

      if (!article) {
        console.log('Article not found for slug:', slug);
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      isVideoArticle = true;
      console.log('Video article found:', {
        id: article.id,
        slug: article.slug,
        title: article.title
      });
    } else {
      console.log('Regular article found:', {
        id: article.id,
        slug: article.slug,
        title: article.title
      });
    }

    // Handle video article comments
    if (isVideoArticle) {
      const { VideoComment } = require('../models');

      let orderClause;
      switch (sort) {
        case 'oldest':
          orderClause = [['createdAt', 'ASC']];
          break;
        case 'popular':
          orderClause = [['likeCount', 'DESC'], ['createdAt', 'DESC']];
          break;
        default:
          orderClause = [['isPinned', 'DESC'], ['createdAt', 'DESC']];
      }

      const { count, rows } = await VideoComment.findAndCountAll({
        where: {
          videoId: article.id,
          parentId: null,
          status: 'active'
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar', 'isEmailVerified'],
            required: false
          },
          {
            model: VideoComment,
            as: 'replies',
            where: { status: 'active' },
            required: false,
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'avatar', 'isEmailVerified'],
              required: false
            }]
          }
        ],
        order: orderClause,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      // Format video comments
      const formattedComments = rows.map(comment => ({
        ...comment.toJSON(),
        author: comment.user || {
          name: comment.metadata?.authorName || 'Anonymous',
          avatar: null,
          verified: false
        },
        upvotes: comment.likeCount,
        downvotes: comment.dislikeCount
      }));

      return res.json({
        success: true,
        comments: formattedComments,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    }

    // Handle regular article comments
    let orderClause;
    switch (sort) {
      case 'oldest':
        orderClause = [['createdAt', 'ASC']];
        break;
      case 'popular':
        orderClause = [['upvotes', 'DESC'], ['createdAt', 'DESC']];
        break;
      default:
        orderClause = [['createdAt', 'DESC']];
    }

    // Use manual query to ensure we use the correct article ID
    const { count, rows } = await Comment.findAndCountAll({
      where: {
        articleId: article.id, // Explicitly use the UUID
        parentId: null,
        status: 'approved'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar', 'isEmailVerified'],
          required: false
        },
        {
          model: Comment,
          as: 'replies',
          where: { status: 'approved' },
          required: false,
          attributes: ['id', 'authorId', 'content', 'parentId', 'status', 'upvotes', 'downvotes', 'isEdited', 'editedAt', 'authorName', 'authorEmail', 'authorWebsite', 'ipAddress', 'userAgent', 'moderatedBy', 'moderatedAt', 'moderationNotes', 'createdAt', 'updatedAt'],
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar', 'isEmailVerified'],
            required: false
          }]
        }
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Format comments to include anonymous author data
    const formattedComments = rows.map(comment => ({
      ...comment.toJSON(),
      author: comment.author || {
        name: comment.authorName || 'Anonymous',
        avatar: null,
        verified: false
      }
    }));

    res.json({
      success: true,
      comments: formattedComments,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
});

// Create comment
router.post('/articles/:slug/comments', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { content, parentId, author_name, author_email } = req.body;
    const userId = req.user?.id;

    console.log('Comment creation request:', {
      articleSlug: slug,
      userId,
      content: content?.substring(0, 50),
      author_name,
      author_email,
      hasParent: !!parentId
    });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment is too long (max 500 characters)'
      });
    }

    // Find article by slug in Articles table
    let article = await Article.findOne({
      where: { slug },
      attributes: ['id', 'title']
    });

    // If not found in Articles, check VideoArticles table
    if (!article) {
      const { VideoArticle } = require('../models');
      article = await VideoArticle.findOne({
        where: { slug },
        attributes: ['id', 'title']
      });

      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // This is a video article, use VideoComment model
      const { VideoComment } = require('../models');

      // If replying to a comment, verify parent exists
      if (parentId) {
        const parentComment = await VideoComment.findOne({
          where: { id: parentId, videoId: article.id }
        });

        if (!parentComment) {
          return res.status(404).json({
            success: false,
            message: 'Parent comment not found'
          });
        }
      }

      const comment = await VideoComment.create({
        videoId: article.id,
        userId: userId || null,
        content: content.trim(),
        parentId: parentId || null,
        status: 'active',
        likeCount: 0,
        dislikeCount: 0,
        metadata: {
          authorName: author_name,
          authorEmail: author_email,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      console.log('Video comment created:', {
        id: comment.id,
        status: comment.status,
        userId: comment.userId
      });

      const createdComment = await VideoComment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar', 'isEmailVerified'],
          required: false
        }]
      });

      return res.status(201).json({
        success: true,
        comment: createdComment,
        message: 'Comment posted successfully'
      });
    }

    // This is a regular article, use Comment model
    // If replying to a comment, verify parent exists
    if (parentId) {
      const parentComment = await Comment.findOne({
        where: { id: parentId, articleId: article.id }
      });

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    const comment = await Comment.create({
      articleId: article.id,
      authorId: userId || null, // Allow null for anonymous comments
      content: content.trim(),
      parentId: parentId || null,
      status: 'approved', // Auto-approve all comments
      upvotes: 0,
      downvotes: 0,
      authorName: author_name || null,
      authorEmail: author_email || null,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    console.log('Comment created:', {
      id: comment.id,
      status: comment.status,
      authorId: comment.authorId,
      authorName: comment.authorName
    });

    const createdComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar', 'isEmailVerified'],
        required: false // Allow comments without users
      }]
    });

    res.status(201).json({
      success: true,
      comment: createdComment,
      message: 'Comment posted successfully'
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment'
    });
  }
});

// Update comment
router.put('/articles/:articleSlug/comments/:commentId', optionalAuth, async (req, res) => {
  try {
    const { articleSlug, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find article by slug
    const article = await Article.findOne({
      where: { slug: articleSlug },
      attributes: ['id']
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const comment = await Comment.findOne({
      where: {
        id: commentId,
        articleId: article.id,
        authorId: userId
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or not authorized'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    await comment.update({
      content: content.trim(),
      isEdited: true
    });

    const updatedComment = await Comment.findByPk(commentId, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar', 'isEmailVerified']
      }]
    });

    res.json({
      success: true,
      comment: updatedComment,
      message: 'Comment updated successfully'
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment'
    });
  }
});

// Delete comment
router.delete('/articles/:articleSlug/comments/:commentId', optionalAuth, async (req, res) => {
  try {
    const { articleSlug, commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find article by slug
    const article = await Article.findOne({
      where: { slug: articleSlug },
      attributes: ['id']
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const comment = await Comment.findOne({
      where: {
        id: commentId,
        articleId: article.id,
        authorId: userId
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or not authorized'
      });
    }

    await comment.destroy();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
});

// Vote on comment
router.post('/comments/:id/vote', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to vote on comments'
      });
    }

    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already voted
    const existingVote = await CommentVote.findOne({
      where: { commentId: id, userId }
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        await existingVote.destroy();
        await comment.decrement(voteType === 'up' ? 'upvotes' : 'downvotes');
      } else {
        // Change vote
        await existingVote.update({ voteType });
        await comment.decrement(existingVote.voteType === 'up' ? 'upvotes' : 'downvotes');
        await comment.increment(voteType === 'up' ? 'upvotes' : 'downvotes');
      }
    } else {
      // New vote
      await CommentVote.create({ commentId: id, userId, voteType });
      await comment.increment(voteType === 'up' ? 'upvotes' : 'downvotes');
    }

    const updatedComment = await Comment.findByPk(id, {
      attributes: ['upvotes', 'downvotes']
    });

    const userVote = await CommentVote.findOne({
      where: { commentId: id, userId },
      attributes: ['voteType']
    });

    res.json({
      success: true,
      upvotes: updatedComment.upvotes,
      downvotes: updatedComment.downvotes,
      userVote: userVote?.voteType || null
    });

  } catch (error) {
    console.error('Error voting on comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to vote on comment'
    });
  }
});

// Report comment
router.post('/comments/:id/report', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to report comments'
      });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if already reported by this user
    const existingReport = await CommentReport.findOne({
      where: { commentId: id, reporterId: userId }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this comment'
      });
    }

    await CommentReport.create({
      commentId: id,
      reporterId: userId,
      reason: reason || 'inappropriate',
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Comment reported successfully'
    });

  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report comment'
    });
  }
});

// Generate PDF
router.get('/articles/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const { settings = {} } = req.query;

    const article = await Article.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: User, as: 'author' }
      ]
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // For now, return a simple response indicating PDF generation would happen here
    // In production, you'd use a library like Puppeteer or PDFKit
    res.json({
      success: true,
      message: 'PDF generation endpoint - would generate PDF here',
      articleId: id,
      settings
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF'
    });
  }
});

module.exports = router;

// Get all categories (public endpoint)
router.get('/categories', async (req, res) => {
  try {
    const { Category } = require('../models');

    const categories = await Category.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'slug', 'description', 'order', 'design', 'featureImage'],
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});
/**
 * Public homepage composition endpoint
 * Returns: dynamic navigation from database, featured, trending, and section summaries
 */
router.get('/homepage', async (req, res) => {
  try {
    const { Subcategory } = require('../models');

    // Fetch all active categories with their subcategories
    const categories = await Category.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'slug', 'description', 'order'],
      include: [{
        model: Subcategory,
        as: 'categorySubcategories',
        where: { status: 'active' },
        required: false,
        attributes: ['id', 'name', 'slug', 'description', 'order'],
        order: [['order', 'ASC']]
      }],
      order: [['order', 'ASC']]
    });

    // Build navigation structure for Header component
    const navigation = [
      // Static HOME entry
      {
        name: 'HOME',
        path: '/',
        isHome: true,
        megaMenu: [
          {
            category: 'Featured Content',
            items: [
              { name: 'Hero Slider', path: '/hero-slider' },
              { name: 'Trending Tags', path: '/trending-tags' },
              { name: 'Quick Access', path: '/quick-access' },
              { name: 'Suggested Reads', path: '/suggested-reads' },
              { name: 'Newsletter', path: '/newsletter' }
            ]
          }
        ],
        subcategories: ['Hero Slider', 'Trending Tags', 'Quick Access', 'Suggested Reads', 'Newsletter']
      }
    ];

    // Add dynamic categories from database
    categories.forEach(category => {
      // Use the actual slug from database
      const categorySlug = `/${category.slug}`;

      const subcategories = category.categorySubcategories || [];
      const subcategoryItems = subcategories.map(sub => ({
        name: sub.name,
        path: `${categorySlug}/${sub.slug}`
      }));

      navigation.push({
        name: category.name.toUpperCase(),
        path: categorySlug,
        isHome: false,
        megaMenu: [
          {
            category: 'All Categories',
            items: subcategoryItems
          }
        ],
        subcategories: subcategories.map(sub => sub.name)
      });
    });

    // Featured/trending/heroSlider using existing published flags if present
    const [featured, trending, heroSlider] = await Promise.all([
      Article.findAll({
        where: { featured: true, status: 'published' },
        limit: 6,
        order: [['publishDate', 'DESC']],
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: Author, as: 'primaryAuthor', attributes: ['id', 'name', 'profile_image'] }
        ]
      }).catch(() => []),
      Article.findAll({
        where: { trending: true, status: 'published' },
        limit: 10,
        order: [['publishDate', 'DESC']],
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: Author, as: 'primaryAuthor', attributes: ['id', 'name', 'profile_image'] }
        ]
      }).catch(() => []),
      Article.findAll({
        where: { heroSlider: true, status: 'published' },
        limit: 5,
        order: [['publishDate', 'DESC']],
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: Author, as: 'primaryAuthor', attributes: ['id', 'name', 'profile_image'] }
        ]
      }).catch(() => [])
    ]);

    // Debug logging
    console.log('Trending articles found:', trending.length);
    if (trending.length > 0) {
      trending.forEach(article => {
        console.log('-', article.title, '(trending:', article.trending, ', status:', article.status, ')');
      });
    }

    // Section summaries by a few recent articles per category
    const sections = {};
    for (const category of categories) {
      const articles = await Article.findAll({
        include: [{ model: Category, where: { id: category.id }, as: 'category' }],
        where: { status: 'published' },
        order: [['publishedAt', 'DESC']],
        limit: 6,
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] }
        ]
      }).catch(() => []);
      sections[category.name] = articles;
    }

    res.json({
      success: true,
      navigation,
      featured,
      trending,
      heroSlider,
      sections
    });
  } catch (error) {
    console.error('Homepage error:', error);
    res.status(200).json({ success: true, navigation: [], featured: [], trending: [], sections: {} });
  }
});