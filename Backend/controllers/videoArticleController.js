const { VideoArticle, Category, Subcategory, Author, Tag, Admin } = require('../models');
const { Op } = require('sequelize');

class VideoArticleController {
  constructor() {
    console.log('=== VideoArticleController constructor called ===');
    console.log('Controller methods available:', Object.getOwnPropertyNames(this.__proto__));

    // Bind methods to preserve 'this' context when used as route handlers
    this.getAllVideoArticles = this.getAllVideoArticles.bind(this);
    this.getVideoArticle = this.getVideoArticle.bind(this);
    this.createVideoArticle = this.createVideoArticle.bind(this);
    this.updateVideoArticle = this.updateVideoArticle.bind(this);
    this.deleteVideoArticle = this.deleteVideoArticle.bind(this);
    this.getAllAuthors = this.getAllAuthors.bind(this);
    this.getAllCategories = this.getAllCategories.bind(this);
    this.getSubcategoriesByCategory = this.getSubcategoriesByCategory.bind(this);
    this.getFilteredCategories = this.getFilteredCategories.bind(this);
    this.getAllTags = this.getAllTags.bind(this);
    this.getTagsByCategory = this.getTagsByCategory.bind(this);
    this.createAuthor = this.createAuthor.bind(this);
    this.getAuthor = this.getAuthor.bind(this);
    this.updateAuthor = this.updateAuthor.bind(this);
    this.getFilteredAuthors = this.getFilteredAuthors.bind(this);
    this.changeVideoArticleStatus = this.changeVideoArticleStatus.bind(this);
    this.publishVideoArticle = this.publishVideoArticle.bind(this);
    this.getComments = this.getComments.bind(this);
    this.addComment = this.addComment.bind(this);
    this.trackView = this.trackView.bind(this);
    this.getRSSFeed = this.getRSSFeed.bind(this);
  }

  // Get all video articles with filters and pagination
  async getAllVideoArticles(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category_id,
        subcategory_id,
        author_id,
        is_featured,
        is_trending,
        search,
        sort_by = 'createdAt',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (status && status !== 'all') whereClause.status = status;
      if (category_id && category_id !== 'all') whereClause.categoryId = category_id;
      if (subcategory_id && subcategory_id !== 'all') whereClause.subcategoryId = subcategory_id;
      if (author_id && author_id !== 'all') whereClause.authorId = author_id;
      if (is_featured !== undefined) whereClause.featured = is_featured === 'true';
      if (is_trending !== undefined) whereClause.trending = is_trending === 'true';

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
          { excerpt: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: videoArticles } = await VideoArticle.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'subtitle', 'content', 'excerpt', 'description',
          'featuredImage', 'imageCaption', 'imageAlt', 'youtubeUrl', 'videoType', 'duration', 'thumbnailUrl', 'status',
          'workflowStage', 'categoryId', 'subcategoryId', 'authorId', 'coAuthors',
          'authorBioOverride', 'featured', 'heroSlider', 'trending', 'pinned',
          'allowComments', 'readingTime', 'metaTitle', 'metaDescription', 'keywords', 'tags',
          'publishDate', 'scheduledPublishDate', 'viewCount', 'likeCount', 'shareCount',
          'assignedTo', 'nextAction', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
          // Note: 'priority' field temporarily removed until database column is added
        ],
        include: [
          {
            model: Category,
            as: 'videoCategory',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'primaryAuthor',
            attributes: ['id', 'name', 'profile_image', 'title']
          },
          {
            model: Admin,
            as: 'assignedEditor',
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [[sort_by, (sort_order || 'DESC').toUpperCase()]],
        distinct: true
      });

      // Convert Sequelize instances to plain objects
      const plainVideoArticles = videoArticles.map(article => article.toJSON());

      res.json({
        success: true,
        data: {
          videoArticles: plainVideoArticles,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get video articles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video articles',
        error: error.message
      });
    }
  }

  // Get single video article by ID or slug
  async getVideoArticle(req, res) {
    try {
      const { id } = req.params;
      // Check if id is a UUID (36 characters with dashes)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const whereClause = uuidRegex.test(id) ? { id: id } : { slug: id };

      const videoArticle = await VideoArticle.findOne({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'subtitle', 'content', 'excerpt', 'description',
          'featuredImage', 'imageCaption', 'imageAlt', 'youtubeUrl', 'videoType', 'duration', 'thumbnailUrl', 'status',
          'workflowStage', 'categoryId', 'subcategoryId', 'authorId', 'coAuthors',
          'authorBioOverride', 'featured', 'heroSlider', 'trending', 'pinned',
          'allowComments', 'readingTime', 'metaTitle', 'metaDescription', 'keywords', 'tags',
          'publishDate', 'scheduledPublishDate', 'viewCount', 'likeCount', 'shareCount',
          'assignedTo', 'nextAction', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
          // Note: 'priority' field temporarily removed until database column is added
        ],
        include: [
          {
            model: Category,
            as: 'videoCategory',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'primaryAuthor'
          },
          {
            model: Admin,
            as: 'assignedEditor',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!videoArticle) {
        return res.status(404).json({
          success: false,
          message: 'Video article not found'
        });
      }

      // Increment view count for published articles
      if (videoArticle.status === 'published') {
        await videoArticle.increment('viewCount');
      }

      // Generate structured data for SEO
      const structuredData = this.generateStructuredData(videoArticle);

      // Convert Sequelize instance to plain object
      const plainVideoArticle = videoArticle ? videoArticle.toJSON() : null;

      res.json({
        success: true,
        data: plainVideoArticle,
        structuredData: structuredData
      });
    } catch (error) {
      console.error('Get video article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video article',
        error: error.message
      });
    }
  }

  // Create new video article
  async createVideoArticle(req, res) {
    const transaction = await VideoArticle.sequelize.transaction();

    try {
      const {
        title,
        subtitle,
        content,
        excerpt,
        description,
        youtube_url,
        video_type,
        duration,
        category_id,
        subcategory_id,
        primary_author_id,
        co_authors,
        tags,
        is_featured,
        is_hero_slider,
        is_trending,
        is_pinned,
        allow_comments,
        meta_title,
        meta_description,
        seo_keywords,
        scheduled_publish_date,
        featured_image_caption,
        author_bio_override
      } = req.body;

      const userId = req.admin?.id;
      const userRole = req.admin?.role?.name || req.admin?.role;

      // Validate required fields
      if (!title || title.trim() === '') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      if (!category_id || category_id.trim() === '') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Category is required'
        });
      }

      if (!primary_author_id || primary_author_id.trim() === '') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Author is required'
        });
      }

      if (!youtube_url || youtube_url.trim() === '') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'YouTube URL is required'
        });
      }

      // Check permissions and status selection
      const adminRoles = ['Master Admin', 'Editor-in-Chief', 'Deputy Editor', 'Content Admin', 'Senior Editor'];
      let initialStatus = req.body.status || 'draft';

      if (userRole === 'Master Admin') {
        // Master Admin can select any status including published
        initialStatus = req.body.status || 'draft';
      } else if (adminRoles.includes(userRole)) {
        // Other admins can select draft, pending_review, approved, scheduled
        // But cannot select published directly
        if (req.body.status === 'published') {
          initialStatus = 'approved'; // Downgrade to approved if they try to publish
        } else {
          initialStatus = req.body.status || 'draft';
        }
      } else {
        // New publishers can only create drafts or pending_review
        initialStatus = req.body.status === 'pending_review' ? 'pending_review' : 'draft';
      }

      // Handle featured image upload
      let featuredImagePath = null;
      if (req.file) {
        try {
          const { ImageUploadService } = require('../services/imageUploadService');
          const imageService = new ImageUploadService();
          const processedFilename = await imageService.processImage(req.file.path, {
            width: 1200,
            height: 800,
            quality: 85,
            format: 'webp'
          });
          featuredImagePath = `/storage/images/${processedFilename}`;
        } catch (imageError) {
          console.error('Image processing error:', imageError);
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            message: 'Failed to process featured image',
            error: imageError.message
          });
        }
      }

      // Parse JSON strings with error handling
      let parsedCoAuthors = [];
      let parsedTags = [];
      let parsedSeoKeywords = [];

      try {
        parsedCoAuthors = co_authors ? JSON.parse(co_authors) : [];
        parsedTags = tags ? JSON.parse(tags) : [];
        parsedSeoKeywords = seo_keywords ? JSON.parse(seo_keywords) : [];
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON format in co_authors, tags, or seo_keywords',
          error: parseError.message
        });
      }

      // Generate slug from title if not provided
      let slug = req.body.slug;
      if (!slug && title) {
        try {
          const slugify = require('slugify');
          slug = slugify(title, { lower: true, strict: true });
          // Ensure slug is unique
          let counter = 1;
          let originalSlug = slug;
          while (await VideoArticle.findOne({ where: { slug }, transaction })) {
            slug = `${originalSlug}-${counter}`;
            counter++;
          }
        } catch (slugError) {
          console.error('Slug generation error:', slugError);
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            message: 'Failed to generate article slug',
            error: slugError.message
          });
        }
      }

      // Create video article with transaction
      const videoArticleData = {
        title,
        slug,
        subtitle,
        content,
        excerpt,
        description,
        youtubeUrl: youtube_url,
        videoType: video_type || 'youtube',
        duration: duration ? parseInt(duration) : null,
        categoryId: category_id,
        subcategoryId: subcategory_id || null,
        authorId: primary_author_id,
        coAuthors: parsedCoAuthors,
        tags: parsedTags,
        featured: is_featured === 'true',
        heroSlider: is_hero_slider === 'true',
        trending: is_trending === 'true',
        pinned: is_pinned === 'true',
        allowComments: allow_comments !== 'false',
        metaTitle: meta_title,
        metaDescription: meta_description,
        keywords: parsedSeoKeywords,
        scheduledPublishDate: scheduled_publish_date ? new Date(scheduled_publish_date) : null,
        featuredImage: featuredImagePath,
        imageCaption: featured_image_caption,
        authorBioOverride: author_bio_override,
        status: initialStatus,
        createdBy: userId
      };

      // Set publish date for published articles
      if (initialStatus === 'published') {
        videoArticleData.publishDate = new Date();
      }

      const videoArticle = await VideoArticle.create(videoArticleData, { transaction });

      // Auto-assign editor based on category if status is pending_review
      if (initialStatus === 'pending_review') {
        try {
          await this.autoAssignEditor(videoArticle, transaction);
        } catch (assignError) {
          console.error('Auto-assign editor error:', assignError);
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            message: 'Failed to assign editor',
            error: assignError.message
          });
        }
      }

      // Schedule publication if needed
      if (scheduled_publish_date && new Date(scheduled_publish_date) > new Date()) {
        try {
          await this.schedulePublication(videoArticle.id, scheduled_publish_date);
        } catch (scheduleError) {
          console.error('Schedule publication error:', scheduleError);
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            message: 'Failed to schedule publication',
            error: scheduleError.message
          });
        }
      }

      // Associate tags with video article
      if (parsedTags.length > 0) {
        try {
          const { Tag, VideoArticleTag } = require('../models');
          const tagRecords = [];

          for (const tagName of parsedTags) {
            let tag = await Tag.findOne({ where: { name: tagName }, transaction });
            if (!tag) {
              // Check if user has permission to create new tags
              if (userRole !== 'Master Admin') {
                await transaction.rollback();
                return res.status(403).json({
                  success: false,
                  message: `Tag "${tagName}" does not exist. Only Master Admin can create new tags. Please use existing tags or contact a Master Admin to create this tag.`
                });
              }
              tag = await Tag.create({
                name: tagName,
                slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                categoryId: category_id
              }, { transaction });
            }
            tagRecords.push(tag);
          }

          // Create tag associations
          const tagAssociations = tagRecords.map(tag => ({
            videoArticleId: videoArticle.id,
            tagId: tag.id
          }));

          await VideoArticleTag.bulkCreate(tagAssociations, { transaction });
        } catch (tagError) {
          console.error('Tag association error:', tagError);
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            message: 'Failed to associate tags',
            error: tagError.message
          });
        }
      }

      // Commit the transaction
      await transaction.commit();

      // Update RSS feed if video article is published
      if (initialStatus === 'published') {
        const rssService = require('../services/rssService');
        await rssService.updateRSSFeed();
      }

      // Get complete video article with associations (after commit)
      const completeVideoArticle = await VideoArticle.findByPk(videoArticle.id, {
        include: [
          { model: Category, as: 'videoCategory' },
          { model: Subcategory, as: 'subcategory' },
          { model: Author, as: 'primaryAuthor' }
        ]
      });

      // Convert Sequelize instance to plain object
      const plainCompleteVideoArticle = completeVideoArticle ? completeVideoArticle.toJSON() : null;

      res.status(201).json({
        success: true,
        message: 'Video article created successfully',
        data: plainCompleteVideoArticle
      });
    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();

      console.error('Create video article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create video article',
        error: error.message
      });
    }
  }

  // Update video article
  async updateVideoArticle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;
      const userRole = req.admin?.role?.name || req.admin?.role;

      console.log('=== UPDATE VIDEO ARTICLE START ===');
      console.log('Video Article ID:', id);
      console.log('Raw request body keys:', Object.keys(req.body));
      console.log('Raw request body title:', req.body.title);
      console.log('Raw request body metaTitle:', req.body.metaTitle);
      console.log('Raw request body priority:', req.body.priority);
      console.log('Full request body:', JSON.stringify(req.body, null, 2));
      console.log('User ID:', userId);
      console.log('User Role:', userRole);
      console.log('=== UPDATE VIDEO ARTICLE START ===');
      console.log('Video Article ID:', id);
      console.log('Raw request body keys:', Object.keys(req.body));
      console.log('Raw request body title:', req.body.title);
      console.log('Raw request body metaTitle:', req.body.metaTitle);
      console.log('Raw request body priority:', req.body.priority);
      console.log('Full request body:', JSON.stringify(req.body, null, 2));
      console.log('User ID:', userId);
      console.log('User Role:', userRole);

      const videoArticle = await VideoArticle.findByPk(id);
      if (!videoArticle) {
        console.log('Video article not found with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Video article not found'
        });
      }

      console.log('Current video article title:', videoArticle.title);

      // Check permissions
      const canEdit = this.checkEditPermission(videoArticle, userId, userRole);
      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to edit this video article'
        });
      }

      // Handle status changes with workflow
      if (req.body.status && req.body.status !== videoArticle.status) {
        const statusChange = await this.handleStatusChange(videoArticle, req.body.status, userId, req.body.review_notes);
        if (!statusChange.success) {
          return res.status(400).json(statusChange);
        }
      }

      // THE ISSUE IS HERE - Fix field mapping
      const updateData = {};

      // Map fields correctly from frontend to backend
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.subtitle !== undefined) updateData.subtitle = req.body.subtitle;
      if (req.body.content !== undefined) updateData.content = req.body.content;
      if (req.body.excerpt !== undefined) updateData.excerpt = req.body.excerpt;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.youtubeUrl !== undefined) updateData.youtubeUrl = req.body.youtubeUrl;
      if (req.body.videoType !== undefined) updateData.videoType = req.body.videoType;
      if (req.body.duration !== undefined) updateData.duration = req.body.duration;
      if (req.body.thumbnailUrl !== undefined) updateData.thumbnailUrl = req.body.thumbnailUrl;
      if (req.body.categoryId !== undefined) updateData.categoryId = req.body.categoryId;
      if (req.body.subcategoryId !== undefined) updateData.subcategoryId = req.body.subcategoryId;
      if (req.body.authorId !== undefined) updateData.authorId = req.body.authorId;
      if (req.body.authorBioOverride !== undefined) updateData.authorBioOverride = req.body.authorBioOverride;
      if (req.body.featured !== undefined) updateData.featured = req.body.featured;
      if (req.body.heroSlider !== undefined) updateData.heroSlider = req.body.heroSlider;
      if (req.body.trending !== undefined) updateData.trending = req.body.trending;
      if (req.body.pinned !== undefined) updateData.pinned = req.body.pinned;
      if (req.body.allowComments !== undefined) updateData.allowComments = req.body.allowComments;
      if (req.body.metaTitle !== undefined) updateData.metaTitle = req.body.metaTitle;
      if (req.body.metaDescription !== undefined) updateData.metaDescription = req.body.metaDescription;
      if (req.body.imageCaption !== undefined) updateData.imageCaption = req.body.imageCaption;
      if (req.body.imageAlt !== undefined) updateData.imageAlt = req.body.imageAlt;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.workflowStage !== undefined) updateData.workflowStage = req.body.workflowStage;
      if (req.body.publishDate !== undefined) updateData.publishDate = req.body.publishDate;
      if (req.body.scheduledPublishDate !== undefined) updateData.scheduledPublishDate = req.body.scheduledPublishDate;
      if (req.body.assignedTo !== undefined) updateData.assignedTo = req.body.assignedTo;
      if (req.body.nextAction !== undefined) updateData.nextAction = req.body.nextAction;
      if (req.body.reviewNotes !== undefined) updateData.reviewNotes = req.body.reviewNotes;
      if (req.body.rejectionReason !== undefined) updateData.rejectionReason = req.body.rejectionReason;
      if (req.body.deadline !== undefined) updateData.deadline = req.body.deadline;
      if (req.body.priority !== undefined) updateData.priority = req.body.priority;

      // Always set updatedBy
      updateData.updatedBy = userId;

      console.log('=== FIELD MAPPING RESULTS ===');
      console.log('updateData.title:', updateData.title);
      console.log('updateData.metaTitle:', updateData.metaTitle);
      console.log('updateData.priority:', updateData.priority);
      console.log('updateData keys:', Object.keys(updateData));

      console.log('=== UPDATE DATA PREPARED ===');
      console.log('Original request body keys:', Object.keys(req.body));
      console.log('Update data object:', JSON.stringify(updateData, null, 2));

      // Handle UUID fields - convert empty strings to null
      if (updateData.categoryId === '') {
        updateData.categoryId = null;
      }
      if (updateData.subcategoryId === '') {
        updateData.subcategoryId = null;
      }
      if (updateData.authorId === '') {
        updateData.authorId = null;
      }
      if (updateData.assignedTo === '') {
        updateData.assignedTo = null;
      }

      // Handle publishDate - convert 'Invalid date' to null
      if (updateData.publishDate === 'Invalid date' || !updateData.publishDate) {
        updateData.publishDate = null;
      } else if (updateData.publishDate) {
        // Ensure publishDate is a valid Date object
        const date = new Date(updateData.publishDate);
        updateData.publishDate = isNaN(date.getTime()) ? null : date;
      }

      // Handle empty strings for optional text fields
      if (updateData.imageCaption === '') {
        updateData.imageCaption = null;
      }
      if (updateData.authorBioOverride === '') {
        updateData.authorBioOverride = null;
      }

      console.log('=== PARSING JSON FIELDS ===');

      if (req.body.coAuthors && Array.isArray(req.body.coAuthors)) {
        console.log('Setting coAuthors array:', req.body.coAuthors);
        updateData.coAuthors = req.body.coAuthors;
      }

      if (req.body.tags && Array.isArray(req.body.tags)) {
        console.log('Setting tags array:', req.body.tags);
        updateData.tags = req.body.tags;
      }

      if (req.body.keywords && Array.isArray(req.body.keywords)) {
        console.log('Setting keywords array:', req.body.keywords);
        updateData.keywords = req.body.keywords;
      }

      // Handle featured image upload if provided
      if (req.file) {
        const { ImageUploadService } = require('../services/imageUploadService');
        const imageService = new ImageUploadService();
        const processedFilename = await imageService.processImage(req.file.path, {
          width: 1200,
          height: 800,
          quality: 85,
          format: 'webp'
        });
        updateData.featuredImage = `/storage/images/${processedFilename}`;
      }

      // Debugging output before Sequelize update
      console.log('=== SEQUELIZE UPDATE DEBUG ===');
      console.log('Current title in DB:', videoArticle.title);
      console.log('Title in updateData:', updateData.title);
      console.log('UpdateData keys:', Object.keys(updateData));
      console.log('Full updateData:', JSON.stringify(updateData, null, 2));

      // Update video article
      console.log('=== CALLING SEQUELIZE UPDATE ===');
      console.log('Update data being sent to Sequelize:', JSON.stringify(updateData, null, 2));
      const [updatedRowsCount] = await VideoArticle.update(updateData, {
        where: { id: id },
        returning: false
      });

      console.log('=== SEQUELIZE UPDATE RESULT ===');
      console.log('Updated rows count:', updatedRowsCount);

      // Reload the video article from database
      await videoArticle.reload();

      console.log('=== AFTER SEQUELIZE UPDATE AND RELOAD ===');
      console.log('Video article title after update and reload:', videoArticle.title);
      console.log('Video article metaTitle after update and reload:', videoArticle.metaTitle);
      console.log('Video article priority after update and reload:', videoArticle.priority);
      console.log('Video article data after reload:', {
        id: videoArticle.id,
        title: videoArticle.title,
        metaTitle: videoArticle.metaTitle,
        priority: videoArticle.priority,
        subtitle: videoArticle.subtitle,
        updatedAt: videoArticle.updatedAt
      });

      // Handle scheduled publication
      if (req.body.scheduled_publish_date && new Date(req.body.scheduled_publish_date) > new Date()) {
        await this.schedulePublication(videoArticle.id, req.body.scheduled_publish_date);
      }

      // Update tags association
      if (req.body.tags) {
        const parsedTags = JSON.parse(req.body.tags);
        const { Tag, VideoArticleTag } = require('../models');

        // Remove existing tag associations
        await VideoArticleTag.destroy({
          where: { videoArticleId: videoArticle.id }
        });

        if (parsedTags.length > 0) {
          const tagRecords = [];

          for (const tagName of parsedTags) {
            let tag = await Tag.findOne({ where: { name: tagName } });
            if (!tag) {
              // Check if user has permission to create new tags
              if (userRole !== 'Master Admin') {
                return res.status(403).json({
                  success: false,
                  message: `Tag "${tagName}" does not exist. Only Master Admin can create new tags. Please use existing tags or contact a Master Admin to create this tag.`
                });
              }
              tag = await Tag.create({
                name: tagName,
                slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                categoryId: videoArticle.categoryId
              });
            }
            tagRecords.push(tag);
          }

          // Create new tag associations
          const tagAssociations = tagRecords.map(tag => ({
            videoArticleId: videoArticle.id,
            tagId: tag.id
          }));

          await VideoArticleTag.bulkCreate(tagAssociations);
        }
      }

      // Update RSS feed if video article status changed to/from published
      if (req.body.status && ((req.body.status === 'published' && videoArticle.status !== 'published') ||
          (req.body.status !== 'published' && videoArticle.status === 'published'))) {
        const rssService = require('../services/rssService');
        await rssService.updateRSSFeed();
      }

      console.log('=== FETCHING UPDATED VIDEO ARTICLE ===');

      const updatedVideoArticle = await VideoArticle.findByPk(id, {
        attributes: [
          'id', 'title', 'slug', 'subtitle', 'content', 'excerpt', 'description',
          'featuredImage', 'imageCaption', 'imageAlt', 'youtubeUrl', 'videoType', 'duration', 'thumbnailUrl', 'status',
          'workflowStage', 'categoryId', 'subcategoryId', 'authorId', 'coAuthors',
          'authorBioOverride', 'featured', 'heroSlider', 'trending', 'pinned',
          'allowComments', 'readingTime', 'metaTitle', 'metaDescription', 'keywords', 'tags',
          'publishDate', 'scheduledPublishDate', 'viewCount', 'likeCount', 'shareCount',
          'assignedTo', 'nextAction', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
          // Note: 'priority' field temporarily removed until database column is added
        ],
        include: [
          { model: Category, as: 'videoCategory' },
          { model: Subcategory, as: 'subcategory' },
          { model: Author, as: 'primaryAuthor' },
          { model: Admin, as: 'assignedEditor' }
        ]
      });

      console.log('=== UPDATED VIDEO ARTICLE FETCHED ===');
      console.log('Final video article data:', {
        id: updatedVideoArticle?.id,
        title: updatedVideoArticle?.title,
        status: updatedVideoArticle?.status,
        updatedAt: updatedVideoArticle?.updatedAt,
        updatedBy: updatedVideoArticle?.updatedBy
      });

      console.log('=== UPDATE VIDEO ARTICLE SUCCESS - SENDING RESPONSE ===');
      console.log('Response data keys:', Object.keys(updatedVideoArticle || {}));

      // Convert Sequelize instance to plain object to ensure proper serialization
      const plainData = updatedVideoArticle ? updatedVideoArticle.toJSON() : null;

      res.json({
        success: true,
        message: 'Video article updated successfully',
        data: plainData
      });

      console.log('=== UPDATE VIDEO ARTICLE END ===');
    } catch (error) {
      console.error('=== UPDATE VIDEO ARTICLE ERROR ===');
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        sql: error.sql,
        parameters: error.parameters
      });
      console.error('Request details:', {
        id: req.params?.id,
        userId: req.admin?.id,
        userRole: req.admin?.role?.name || req.admin?.role,
        bodyKeys: Object.keys(req.body || {})
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update video article',
        error: error.message
      });
    }
  }

  // Delete video article
  async deleteVideoArticle(req, res) {
    const transaction = await VideoArticle.sequelize.transaction();

    try {
      const { id } = req.params;
      const userId = req.admin?.id;
      const userRole = req.admin?.role?.name || req.admin?.role;

      const videoArticle = await VideoArticle.findByPk(id, { transaction });
      if (!videoArticle) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Video article not found'
        });
      }

      // Check permissions
      const canDelete = this.checkDeletePermission(videoArticle, userId, userRole);
      if (!canDelete) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this video article'
        });
      }

      // Delete associated tags first to avoid foreign key constraint
      const { VideoArticleTag } = require('../models');
      await VideoArticleTag.destroy({
        where: { videoArticleId: id },
        transaction
      });

      // Delete associated comments
      const { VideoComment } = require('../models');
      await VideoComment.destroy({
        where: { videoId: id },
        transaction
      });

      // Delete associated views
      const { VideoArticleView } = require('../models');
      await VideoArticleView.destroy({
        where: { videoArticleId: id },
        transaction
      });

      // Finally delete the video article
      await videoArticle.destroy({ transaction });

      // Commit the transaction
      await transaction.commit();

      // Update RSS feed if deleted video article was published
      if (videoArticle.status === 'published') {
        const rssService = require('../services/rssService');
        await rssService.updateRSSFeed();
      }

      res.json({
        success: true,
        message: 'Video article deleted successfully'
      });
    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();

      console.error('Delete video article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete video article',
        error: error.message
      });
    }
  }

  // Get all authors
  async getAllAuthors(req, res) {
    try {
      const authors = await Author.findAll({
        where: { is_active: true },
        attributes: ['id', 'name', 'email', 'title', 'bio', 'profile_image', 'social_media'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: authors
      });
    } catch (error) {
      console.error('Get authors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch authors',
        error: error.message
      });
    }
  }

  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll({
        attributes: ['id', 'name', 'slug', 'description'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }
  }

  // Get subcategories by category
  async getSubcategoriesByCategory(req, res) {
    try {
      const { categoryId } = req.params;

      const subcategories = await Subcategory.findAll({
        where: { categoryId: categoryId },
        attributes: ['id', 'name', 'slug', 'description'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: subcategories
      });
    } catch (error) {
      console.error('Get subcategories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subcategories',
        error: error.message
      });
    }
  }

  // Get filtered categories based on video articles
  async getFilteredCategories(req, res) {
    try {
      const {
        status,
        author_id,
        is_featured,
        is_trending,
        search
      } = req.query;

      const whereClause = {};

      // Apply filters
      if (status && status !== 'all') whereClause.status = status;
      if (author_id && author_id !== 'all') whereClause.authorId = author_id;
      if (is_featured !== undefined) whereClause.featured = is_featured === 'true';
      if (is_trending !== undefined) whereClause.trending = is_trending === 'true';

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
          { excerpt: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const categories = await Category.findAll({
        include: [
          {
            model: VideoArticle,
            as: 'videoArticles',
            where: whereClause,
            required: true,
            attributes: []
          }
        ],
        attributes: ['id', 'name', 'slug'],
        order: [['name', 'ASC']],
        distinct: true
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get filtered categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch filtered categories',
        error: error.message
      });
    }
  }

  // Get all tags
  async getAllTags(req, res) {
    try {
      const tags = await Tag.findAll({
        attributes: ['id', 'name', 'slug'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('Get tags error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tags',
        error: error.message
      });
    }
  }

  // Get tags by category
  async getTagsByCategory(req, res) {
    try {
      const { categoryId } = req.params;

      // Handle "all" category case
      const whereClause = categoryId === 'all' ? {} : { categoryId: categoryId };

      const tags = await Tag.findAll({
        where: whereClause,
        attributes: ['id', 'name', 'description'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('Get tags by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tags',
        error: error.message
      });
    }
  }

  // Create new author
  async createAuthor(req, res) {
    try {
      const {
        name,
        email,
        bio,
        title,
        experience,
        education,
        social_media
      } = req.body;

      // Handle profile image upload
      let profileImagePath = null;
      if (req.file) {
        const fileName = `author-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        const uploadPath = path.join('/var/www/menastories/menastories.me/Backend/storage/images', fileName);

        await fs.rename(req.file.path, uploadPath);
        profileImagePath = `/storage/images/${fileName}`;
      }

      const author = await Author.create({
        name,
        email,
        bio,
        title,
        experience,
        education,
        profile_image: profileImagePath,
        social_media: social_media ? JSON.parse(social_media) : {}
      });

      res.status(201).json({
        success: true,
        message: 'Author created successfully',
        data: author
      });
    } catch (error) {
      console.error('Create author error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create author',
        error: error.message
      });
    }
  }

  // Get single author by ID
  async getAuthor(req, res) {
    try {
      const { id } = req.params;

      const author = await Author.findByPk(id, {
        attributes: ['id', 'name', 'email', 'title', 'bio', 'profile_image', 'social_media', 'experience', 'education']
      });

      if (!author) {
        return res.status(404).json({
          success: false,
          message: 'Author not found'
        });
      }

      res.json({
        success: true,
        data: author
      });
    } catch (error) {
      console.error('Get author error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch author',
        error: error.message
      });
    }
  }

  // Update author
  async updateAuthor(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        bio,
        title,
        experience,
        education,
        social_media
      } = req.body;

      const author = await Author.findByPk(id);
      if (!author) {
        return res.status(404).json({
          success: false,
          message: 'Author not found'
        });
      }

      // Handle profile image upload
      let profileImagePath = author.profile_image;
      if (req.file) {
        const fileName = `author-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        const uploadPath = path.join(__dirname, '../storage/images', fileName);

        await fs.rename(req.file.path, uploadPath);
        profileImagePath = `/storage/images/${fileName}`;

        // Delete old image if exists
        if (author.profile_image) {
          try {
            await fs.unlink(path.join(__dirname, '..', author.profile_image));
          } catch (err) {
            console.warn('Could not delete old image:', err.message);
          }
        }
      }

      await author.update({
        name,
        email,
        bio,
        title,
        experience,
        education,
        profile_image: profileImagePath,
        social_media: social_media ? JSON.parse(social_media) : author.social_media
      });

      res.json({
        success: true,
        message: 'Author updated successfully',
        data: author
      });
    } catch (error) {
      console.error('Update author error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update author',
        error: error.message
      });
    }
  }

  // Get filtered authors based on video articles
  async getFilteredAuthors(req, res) {
    try {
      const {
        status,
        category_id,
        subcategory_id,
        is_featured,
        is_trending,
        search
      } = req.query;

      const whereClause = {};

      // Apply filters
      if (status && status !== 'all') whereClause.status = status;
      if (category_id && category_id !== 'all') whereClause.categoryId = category_id;
      if (subcategory_id && subcategory_id !== 'all') whereClause.subcategoryId = subcategory_id;
      if (is_featured !== undefined) whereClause.featured = is_featured === 'true';
      if (is_trending !== undefined) whereClause.trending = is_trending === 'true';

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
          { excerpt: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const authors = await Author.findAll({
        include: [
          {
            model: VideoArticle,
            as: 'videoArticles',
            where: whereClause,
            required: true,
            attributes: []
          }
        ],
        attributes: ['id', 'name', 'email', 'title', 'bio', 'profile_image', 'social_media'],
        order: [['name', 'ASC']],
        distinct: true
      });

      res.json({
        success: true,
        data: authors
      });
    } catch (error) {
      console.error('Get filtered authors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch filtered authors',
        error: error.message
      });
    }
  }

  // Change video article status (workflow management)
  async changeVideoArticleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, review_notes } = req.body;
      const userId = req.admin?.id;
      const userRole = req.admin?.role?.name || req.admin?.role;

      const videoArticle = await VideoArticle.findByPk(id);
      if (!videoArticle) {
        return res.status(404).json({
          success: false,
          message: 'Video article not found'
        });
      }

      // Check if status change is allowed
      const statusChange = await this.validateStatusChange(videoArticle, status, userRole);
      if (!statusChange.allowed) {
        return res.status(403).json({
          success: false,
          message: statusChange.message
        });
      }

      // Handle specific status changes
      const updateData = { status, updatedBy: userId };

      if (review_notes) {
        updateData.reviewNotes = review_notes;
      }

      if (status === 'rejected' && !review_notes) {
        return res.status(400).json({
          success: false,
          message: 'Review notes are required when rejecting a video article'
        });
      }

      if (status === 'published') {
        updateData.publishDate = new Date();

        // Add tags to database
        if (videoArticle.tags && videoArticle.tags.length > 0) {
          await this.addTagsToDatabase(videoArticle.tags, videoArticle.categoryId);
        }
      }

      if (status === 'pending_review') {
        // Auto-assign editor
        await this.autoAssignEditor(videoArticle);
      }

      await videoArticle.update(updateData);

      // Create workflow history record
      await this.createWorkflowHistory(videoArticle.id, videoArticle.status, status, userId, review_notes);

      // Update RSS feed if status changed to/from published
      if ((videoArticle.status !== 'published' && status === 'published') ||
          (videoArticle.status === 'published' && status !== 'published')) {
        const rssService = require('../services/rssService');
        await rssService.updateRSSFeed();
      }

      const updatedVideoArticle = await VideoArticle.findByPk(id, {
        attributes: [
          'id', 'title', 'slug', 'subtitle', 'content', 'excerpt', 'description',
          'featuredImage', 'imageCaption', 'imageAlt', 'youtubeUrl', 'videoType', 'duration', 'thumbnailUrl', 'status',
          'workflowStage', 'categoryId', 'subcategoryId', 'authorId', 'coAuthors',
          'authorBioOverride', 'featured', 'heroSlider', 'trending', 'pinned',
          'allowComments', 'readingTime', 'metaTitle', 'metaDescription', 'keywords', 'tags',
          'publishDate', 'scheduledPublishDate', 'viewCount', 'likeCount', 'shareCount',
          'assignedTo', 'nextAction', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
          // Note: 'priority' field temporarily removed until database column is added
        ],
        include: [
          { model: Category, as: 'videoCategory' },
          { model: Author, as: 'primaryAuthor' },
          { model: Admin, as: 'assignedEditor' }
        ]
      });

      // Convert Sequelize instance to plain object
      const plainUpdatedVideoArticle = updatedVideoArticle ? updatedVideoArticle.toJSON() : null;

      res.json({
        success: true,
        message: `Video article status changed to ${status}`,
        data: plainUpdatedVideoArticle
      });
    } catch (error) {
      console.error('Change video article status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change video article status',
        error: error.message
      });
    }
  }


  checkEditPermission(videoArticle, userId, userRole) {
    console.log('=== VideoArticle checkEditPermission called ===');
    console.log('VideoArticle:', videoArticle ? videoArticle.id : 'null');
    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('VideoArticle createdBy:', videoArticle?.createdBy);
    console.log('VideoArticle status:', videoArticle?.status);

    // Check if video article is published - only Master Admin can edit published articles
    if (videoArticle?.status === 'published') {
      console.log('Video article is published, checking for Master Admin role');
      return userRole === 'Master Admin';
    }

    // Simple permission check - in a real app this would be more complex
    const adminRoles = ['Master Admin', 'Editor-in-Chief', 'Deputy Editor', 'Content Admin', 'Senior Editor'];
    console.log('Admin roles:', adminRoles);
    console.log('User role in admin roles:', adminRoles.includes(userRole));
    console.log('User is video article creator:', videoArticle?.createdBy === userId);

    const result = adminRoles.includes(userRole) || videoArticle?.createdBy === userId;
    console.log('Permission result:', result);

    return result;
  }

  checkDeletePermission(videoArticle, userId, userRole) {
    // Only allow deletion by the creator or high-level admins
    const deleteRoles = ['Master Admin', 'Editor-in-Chief'];
    return deleteRoles.includes(userRole) || videoArticle.createdBy === userId;
  }

  // Helper methods
  validateStatusChange(videoArticle, newStatus, userRole) {
    const statusTransitions = {
      draft: {
        allowed: ['pending_review'],
        roles: ['all']
      },
      pending_review: {
        allowed: ['in_review', 'rejected', 'draft'],
        roles: ['Master Admin', 'Editor-in-Chief', 'Deputy Editor', 'Content Admin', 'Senior Editor']
      },
      in_review: {
        allowed: ['approved', 'rejected', 'pending_review'],
        roles: ['Master Admin', 'Editor-in-Chief', 'Deputy Editor', 'Content Admin', 'Senior Editor']
      },
      approved: {
        allowed: ['scheduled', 'published', 'in_review'],
        roles: ['Master Admin', 'Editor-in-Chief', 'Deputy Editor', 'Content Admin']
      },
      scheduled: {
        allowed: ['published', 'approved'],
        roles: ['Master Admin', 'Editor-in-Chief', 'Deputy Editor', 'Content Admin']
      },
      published: {
        allowed: ['archived'],
        roles: ['Master Admin', 'Editor-in-Chief', 'Deputy Editor']
      },
      rejected: {
        allowed: ['draft', 'pending_review'],
        roles: ['all']
      },
      archived: {
        allowed: ['published'],
        roles: ['Master Admin', 'Editor-in-Chief']
      }
    };

    const transition = statusTransitions[videoArticle.status];

    if (!transition) {
      return { allowed: false, message: 'Invalid current status' };
    }

    if (!transition.allowed.includes(newStatus)) {
      return {
        allowed: false,
        message: `Cannot change status from ${videoArticle.status} to ${newStatus}`
      };
    }

    if (transition.roles[0] !== 'all' && !transition.roles.includes(userRole)) {
      return {
        allowed: false,
        message: 'You do not have permission to make this status change'
      };
    }

    return { allowed: true };
  }

  handleStatusChange(videoArticle, newStatus, userId, reviewNotes) {
    try {
      // Validate the status change
      const validation = this.validateStatusChange(videoArticle, newStatus, 'admin'); // Assuming admin role for now
      if (!validation.allowed) {
        return { success: false, message: validation.message };
      }

      // Update the video article
      videoArticle.update({
        status: newStatus,
        updatedBy: userId,
        reviewNotes: reviewNotes
      });

      return { success: true };
    } catch (error) {
      console.error('Handle status change error:', error);
      return { success: false, message: 'Failed to change status' };
    }
  }

  async autoAssignEditor(videoArticle, transaction = null) {
    try {
      // Simple auto-assignment logic - assign to first available editor
      const availableEditors = await Admin.findAll({
        where: {
          role: ['Editor-in-Chief', 'Deputy Editor', 'Senior Editor']
        },
        limit: 1
      });

      if (availableEditors.length > 0) {
        await videoArticle.update({ assignedTo: availableEditors[0].id }, { transaction });
      }
    } catch (error) {
      console.error('Auto-assign editor error:', error);
    }
  }

  async schedulePublication(videoArticleId, scheduledDate) {
    try {
      // In a real implementation, you would schedule this with a job queue
      console.log(`Video article ${videoArticleId} scheduled for publication at ${scheduledDate}`);
      return true;
    } catch (error) {
      console.error('Schedule publication error:', error);
      throw error;
    }
  }

  async addTagsToDatabase(tags, categoryId) {
    try {
      for (const tagName of tags) {
        const [tag, created] = await Tag.findOrCreate({
          where: { name: tagName },
          defaults: { categoryId: categoryId }
        });
      }
    } catch (error) {
      console.error('Add tags to database error:', error);
    }
  }

  async createWorkflowHistory(videoArticleId, fromStatus, toStatus, userId, notes) {
    try {
      // You would need to create an VideoArticleWorkflowHistory model
      // For now, we'll log it
      console.log('Video article workflow change:', {
        videoArticleId,
        fromStatus,
        toStatus,
        userId,
        notes,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error creating workflow history:', error);
    }
  }

  // Publish video article
  async publishVideoArticle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const videoArticle = await VideoArticle.findByPk(id);
      if (!videoArticle) {
        return res.status(404).json({
          success: false,
          message: 'Video article not found'
        });
      }

      if (videoArticle.status !== 'approved' && videoArticle.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Only approved or scheduled video articles can be published'
        });
      }

      // Handle featured image processing if new image is uploaded
      let featuredImagePath = videoArticle.featuredImage;
      if (req.file) {
        const { ImageUploadService } = require('../services/imageUploadService');
        const imageService = new ImageUploadService();
        const processedFilename = await imageService.processImage(req.file.path, {
          width: 1200,
          height: 800,
          quality: 85,
          format: 'webp'
        });
        featuredImagePath = `/storage/images/${processedFilename}`;
      }

      await videoArticle.update({
        status: 'published',
        publishDate: new Date(),
        updatedBy: userId,
        featuredImage: featuredImagePath
      });

      // Update RSS feed if video article is published
      const rssService = require('../services/rssService');
      await rssService.updateRSSFeed();

      // Convert Sequelize instance to plain object
      const plainVideoArticle = videoArticle ? videoArticle.toJSON() : null;

      res.json({
        success: true,
        message: 'Video article published successfully',
        data: plainVideoArticle
      });
    } catch (error) {
      console.error('Publish video article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish video article',
        error: error.message
      });
    }
  }

  // Publish scheduled video articles (for auto-publishing)
  async publishScheduledVideoArticles() {
    try {
      const now = new Date();

      const scheduledVideoArticles = await VideoArticle.findAll({
        where: {
          status: 'scheduled',
          scheduledPublishDate: {
            [Op.lte]: now
          }
        },
        attributes: [
          'id', 'title', 'slug', 'subtitle', 'content', 'excerpt', 'description',
          'youtubeUrl', 'videoType', 'duration', 'thumbnailUrl', 'status',
          'workflowStage', 'categoryId', 'subcategoryId', 'authorId', 'coAuthors',
          'authorBioOverride', 'featured', 'heroSlider', 'trending', 'pinned',
          'allowComments', 'readingTime', 'metaTitle', 'metaDescription', 'keywords',
          'tags', 'publishDate', 'scheduledPublishDate', 'viewCount', 'likeCount', 'shareCount',
          'assignedTo', 'nextAction', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
        ]
      });

      const publishedVideoArticles = [];

      for (const videoArticle of scheduledVideoArticles) {
        await videoArticle.update({
          status: 'published',
          publishDate: now
        });
        publishedVideoArticles.push(videoArticle);
      }

      // Update RSS feed if any scheduled articles were published
      if (publishedVideoArticles.length > 0) {
        const rssService = require('../services/rssService');
        await rssService.updateRSSFeed();
      }

      return publishedVideoArticles;
    } catch (error) {
      console.error('Error publishing scheduled video articles:', error);
      throw error;
    }
  }

  // Get comments for a video article
  async getComments(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const offset = (page - 1) * limit;

      const { VideoComment, User } = require('../models');

      const comments = await VideoComment.findAll({
        where: {
          videoId: id,
          status: 'active'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'avatar']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: error.message
      });
    }
  }

  // Add comment to video article
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content, timestamp } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { VideoComment } = require('../models');

      const comment = await VideoComment.create({
        videoId: id,
        userId: userId,
        content: content,
        timestamp: timestamp || null
      });

      const commentWithUser = await VideoComment.findByPk(comment.id, {
        include: [{
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'avatar']
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: commentWithUser
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error.message
      });
    }
  }

  // Track view for video article
  async trackView(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const { VideoArticleView } = require('../models');

      // Create view record
      await VideoArticleView.create({
        videoArticleId: id,
        userId: userId || null,
        ipAddress: ipAddress,
        userAgent: userAgent,
        referrer: req.get('Referrer') || null,
        deviceType: this.getDeviceType(userAgent),
        browser: this.getBrowser(userAgent),
        country: null // You can implement IP geolocation here
      });

      res.json({
        success: true,
        message: 'View tracked successfully'
      });
    } catch (error) {
      console.error('Track view error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track view',
        error: error.message
      });
    }
  }

  // Helper method to detect device type
  getDeviceType(userAgent) {
    if (!userAgent) return 'desktop';

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Helper method to detect browser
  getBrowser(userAgent) {
    if (!userAgent) return null;

    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    return 'Other';
  }

  // Get RSS feed for published video articles
  async getRSSFeed(req, res) {
    try {
      const { VideoArticle, Category, Author } = require('../models');

      const videoArticles = await VideoArticle.findAll({
        where: {
          status: 'published'
        },
        include: [
          {
            model: Category,
            as: 'videoCategory',
            attributes: ['name']
          },
          {
            model: Author,
            as: 'primaryAuthor',
            attributes: ['name']
          }
        ],
        order: [['publishDate', 'DESC']],
        limit: 50
      });

      const rssService = require('../services/rssService');

      // Generate RSS XML for video articles
      let rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Video Articles - Your Magazine</title>
    <description>Latest video articles from our magazine</description>
    <link>${process.env.BASE_URL || 'https://your-domain.com'}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Magazine CMS</generator>`;

      for (const article of videoArticles) {
        // Skip articles without required data
        if (!article.slug || !article.title) {
          console.warn('Skipping article in RSS feed - missing slug or title:', article.id);
          continue;
        }

        const videoId = this.extractYouTubeVideoId(article.youtubeUrl);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

        // Ensure we have a valid date
        let pubDate;
        try {
          pubDate = new Date(article.publishDate || article.createdAt);
          if (isNaN(pubDate.getTime())) {
            pubDate = new Date(); // Fallback to current date
          }
        } catch (dateError) {
          console.warn('Invalid date for article:', article.id, article.publishDate, article.createdAt);
          pubDate = new Date(); // Fallback to current date
        }

        rssXml += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.excerpt || article.description || ''}]]></description>
      <link>${process.env.BASE_URL || 'http://localhost:5000'}/video-articles/${article.slug}</link>
      <guid>${process.env.BASE_URL || 'http://localhost:5000'}/video-articles/${article.slug}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <category><![CDATA[${article.videoCategory?.name || 'Uncategorized'}]]></category>`;

        if (article.primaryAuthor) {
          rssXml += `
      <author><![CDATA[${article.primaryAuthor.name}]]></author>`;
        }

        if (thumbnailUrl) {
          rssXml += `
      <media:thumbnail url="${thumbnailUrl}" />
      <media:content url="${article.youtubeUrl}" type="application/x-shockwave-flash" />`;
        }

        rssXml += `
    </item>`;
      }

      rssXml += `
  </channel>
</rss>`;

      res.set('Content-Type', 'application/rss+xml');
      res.send(rssXml);
    } catch (error) {
      console.error('Get RSS feed error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate RSS feed',
        error: error.message
      });
    }
  }

  // Generate JSON-LD structured data for video article
  generateStructuredData(videoArticle) {
    try {
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

      // Extract YouTube video ID
      const videoId = this.extractYouTubeVideoId(videoArticle.youtubeUrl);
      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

      // Ensure we have valid dates
      let uploadDate;
      try {
        uploadDate = new Date(videoArticle.publishDate || videoArticle.createdAt);
        if (isNaN(uploadDate.getTime())) {
          uploadDate = new Date(); // Fallback to current date
        }
      } catch (dateError) {
        console.warn('Invalid upload date for article:', videoArticle.id);
        uploadDate = new Date(); // Fallback to current date
      }

      const structuredData = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": videoArticle.title || 'Untitled Video',
        "description": videoArticle.excerpt || videoArticle.description || 'Video article description',
        "thumbnailUrl": thumbnailUrl,
        "uploadDate": uploadDate.toISOString(),
        "duration": videoArticle.duration ? `PT${Math.floor(videoArticle.duration / 60)}M${videoArticle.duration % 60}S` : null,
        "contentUrl": videoArticle.youtubeUrl,
        "embedUrl": videoArticle.youtubeUrl,
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WatchAction",
          "userInteractionCount": videoArticle.viewCount || 0
        }
      };

      // Add author information
      if (videoArticle.primaryAuthor && videoArticle.primaryAuthor.name) {
        structuredData.author = {
          "@type": "Person",
          "name": videoArticle.primaryAuthor.name
        };
      }

      // Add publisher information
      structuredData.publisher = {
        "@type": "Organization",
        "name": "Your Magazine",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      };

      // Add category
      if (videoArticle.videoCategory && videoArticle.videoCategory.name) {
        structuredData.about = {
          "@type": "Thing",
          "name": videoArticle.videoCategory.name
        };
      }

      // Add tags as keywords
      if (videoArticle.tags && Array.isArray(videoArticle.tags) && videoArticle.tags.length > 0) {
        structuredData.keywords = videoArticle.tags.join(', ');
      }

      // Remove null/undefined values
      Object.keys(structuredData).forEach(key => {
        if (structuredData[key] === null || structuredData[key] === undefined) {
          delete structuredData[key];
        }
      });

      return structuredData;
    } catch (error) {
      console.error('Error generating structured data for article:', videoArticle.id, error);
      // Return minimal structured data as fallback
      return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": videoArticle.title || 'Untitled Video',
        "description": 'Video article'
      };
    }
  }

  // Helper method to extract YouTube video ID from URL
  extractYouTubeVideoId(url) {
    if (!url) return null;

    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"&?\/\s]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^"&?\/\s]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}

module.exports = VideoArticleController;