const { Article, Category, Tag, Admin, ArticleComment, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get content overview dashboard
exports.getContentOverview = async (req, res) => {
  try {
    const totalArticles = await Article.count();
    const publishedArticles = await Article.count({ where: { status: 'published' } });
    const draftArticles = await Article.count({ where: { status: 'draft' } });
    const archivedArticles = await Article.count({ where: { status: 'archived' } });
    
    const totalCategories = await Category.count();
    const totalTags = await Tag.count();
    
    // Most viewed articles
    const mostViewedArticles = await Article.findAll({
      attributes: ['id', 'title', 'slug', 'viewCount', 'publishDate'],
      where: { status: 'published' },
      order: [['viewCount', 'DESC']],
      limit: 5
    });
    
    // Most liked articles
    const mostLikedArticles = await Article.findAll({
      attributes: ['id', 'title', 'slug', 'likeCount', 'publishDate'],
      where: { status: 'published' },
      order: [['likeCount', 'DESC']],
      limit: 5
    });
    
    // Recent articles
    const recentArticles = await Article.findAll({
      attributes: ['id', 'title', 'slug', 'status', 'publishDate', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    res.status(200).json({
      counts: {
        totalArticles,
        publishedArticles,
        draftArticles,
        archivedArticles,
        totalCategories,
        totalTags
      },
      mostViewedArticles,
      mostLikedArticles,
      recentArticles
    });
  } catch (error) {
    console.error('Content overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get SEO performance data
exports.getSeoPerformance = async (req, res) => {
  try {
    // Articles with highest performance
    const topPerformingArticles = await Article.findAll({
      attributes: [
        'id', 'title', 'slug', 'metaTitle', 'metaDescription',
        'viewCount', 'likeCount', 'shareCount',
        [sequelize.literal('("viewCount" + ("likeCount" * 5) + ("shareCount" * 10))'), 'performanceScore']
      ],
      where: { status: 'published' },
      order: [[sequelize.literal('performanceScore'), 'DESC']],
      limit: 10
    });
    
    // Keywords performance
    const articlesWithKeywords = await Article.findAll({
      attributes: ['id', 'title', 'keywords', 'viewCount'],
      where: {
        keywords: { [Op.ne]: null },
        status: 'published'
      },
      order: [['viewCount', 'DESC']],
      limit: 50
    });
    
    // Process keyword data
    const keywordPerformance = {};
    articlesWithKeywords.forEach(article => {
      if (article.keywords && Array.isArray(article.keywords)) {
        article.keywords.forEach(keyword => {
          if (!keywordPerformance[keyword]) {
            keywordPerformance[keyword] = { keyword, occurrences: 0, totalViews: 0 };
          }
          keywordPerformance[keyword].occurrences++;
          keywordPerformance[keyword].totalViews += article.viewCount;
        });
      }
    });
    
    const keywordStats = Object.values(keywordPerformance)
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 20);
    
    res.status(200).json({ topPerformingArticles, keywordStats });
  } catch (error) {
    console.error('SEO performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export data for reports
exports.exportArticleStats = async (req, res) => {
  try {
    const { format = 'json', dateFrom, dateTo } = req.query;
    
    let whereClause = {};
    if (dateFrom && dateTo) {
      whereClause.createdAt = { [Op.between]: [new Date(dateFrom), new Date(dateTo)] };
    }
    
    // Get articles with stats
    const articles = await Article.findAll({
      attributes: [
        'id', 'title', 'slug', 'status', 'createdAt', 'publishDate',
        'viewCount', 'likeCount', 'shareCount'
      ],
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: Category,
          through: { attributes: [] },
          attributes: ['id', 'name']
        },
        {
          model: Tag,
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ],
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    // Format data for export
    const formattedData = articles.map(article => {
      const data = article.toJSON();
      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        status: data.status,
        author: `${data.author.firstName} ${data.author.lastName}`,
        categories: data.Categories.map(c => c.name).join(', '),
        tags: data.Tags.map(t => t.name).join(', '),
        created: data.createdAt,
        published: data.publishDate,
        views: data.viewCount,
        likes: data.likeCount,
        shares: data.shareCount
      };
    });
    
    if (format === 'csv') {
      // For actual CSV implementation, use json2csv package
      return res.status(200).send('CSV data would be generated here');
    }
    
    res.status(200).json({
      count: formattedData.length,
      data: formattedData
    });
  } catch (error) {
    console.error('Export article stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};