const { Article, Category, Subcategory, Author, Tag, Admin, Comment } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const rssService = require('../services/rssService');
const taxonomyService = require('../services/taxonomyService');

// Configure multer for file uploads using ImageUploadService paths
 const { ImageUploadService } = require('../services/imageUploadService');
 const imageService = new ImageUploadService();

 const storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, imageService.tempPath);
   },

   filename: function (req, file, cb) {
     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
   }
 });

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

class ArticleController {
  constructor() {
    console.log('=== ArticleController constructor called ===');
    console.log('this in constructor:', this);
    console.log('checkEditPermission method exists:', typeof this.checkEditPermission);
    console.log('schedulePublication method exists:', typeof this.schedulePublication);
    console.log('autoAssignEditor method exists:', typeof this.autoAssignEditor);
    console.log('addTagsToDatabase method exists:', typeof this.addTagsToDatabase);

    // Bind methods to preserve context
    this.getAllArticles = this.getAllArticles.bind(this);
    this.getArticle = this.getArticle.bind(this);
    this.createArticle = this.createArticle.bind(this);
    this.updateArticle = this.updateArticle.bind(this);
    this.deleteArticle = this.deleteArticle.bind(this);
    this.getAllAuthors = this.getAllAuthors.bind(this);
    this.getFilteredCategories = this.getFilteredCategories.bind(this);
    this.getFilteredAuthors = this.getFilteredAuthors.bind(this);
    this.createAuthor = this.createAuthor.bind(this);
    this.getAuthor = this.getAuthor.bind(this);
    this.updateAuthor = this.updateAuthor.bind(this);
    this.getTagsByCategory = this.getTagsByCategory.bind(this);
    this.getArticlesByCategory = this.getArticlesByCategory.bind(this);
    this.changeArticleStatus = this.changeArticleStatus.bind(this);
    this.getWorkflowHistory = this.getWorkflowHistory.bind(this);
    this.assignEditor = this.assignEditor.bind(this);
    this.scheduleArticle = this.scheduleArticle.bind(this);
    this.publishArticle = this.publishArticle.bind(this);
    this.unpublishArticle = this.unpublishArticle.bind(this);
    this.getArticleAnalytics = this.getArticleAnalytics.bind(this);
    this.trackView = this.trackView.bind(this);
    this.getRSSFeed = this.getRSSFeed.bind(this);
    this.getSuggestedArticles = this.getSuggestedArticles.bind(this);
    this.checkEditPermission = this.checkEditPermission.bind(this);
    this.checkDeletePermission = this.checkDeletePermission.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.autoAssignEditor = this.autoAssignEditor.bind(this);
    this.schedulePublication = this.schedulePublication.bind(this);
    this.addTagsToDatabase = this.addTagsToDatabase.bind(this);
    this.generateStructuredData = this.generateStructuredData.bind(this);
    this.validateStatusChange = this.validateStatusChange.bind(this);
    this.createWorkflowHistory = this.createWorkflowHistory.bind(this);
    this.publishScheduledArticles = this.publishScheduledArticles.bind(this);
    this.validateForeignKeyReferences = this.validateForeignKeyReferences.bind(this);
    this.getArticleComments = this.getArticleComments.bind(this);
    this.createComment = this.createComment.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    // Comment methods
    this.getArticleComments = this.getArticleComments.bind(this);
    this.createComment = this.createComment.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  // Get all articles with filters and pagination
  async getAllArticles(req, res) {
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

      const { count, rows: articles } = await Article.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'subtitle', 'content', 'excerpt', 'description',
          'featuredImage', 'imageCaption', 'imageAlt', 'gallery', 'status',
          'workflowStage', 'categoryId', 'subcategoryId', 'authorId', 'coAuthors',
          'authorBioOverride', 'featured', 'heroSlider', 'trending', 'pinned',
          'allowComments', 'readingTime', 'metaTitle', 'metaDescription', 'keywords',
          'publishDate', 'scheduledPublishDate', 'viewCount', 'likeCount', 'shareCount',
          'assignedTo', 'nextAction', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
        ],
        include: [
          {
            model: Category,
            as: 'category',
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
        order: [[sort_by, sort_order.toUpperCase()]],
        distinct: true
      });

      res.json({
        success: true,
        data: {
          articles,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get articles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch articles',
        error: error.message
      });
    }
  }

  // Get single article by ID or slug
  async getArticle(req, res) {
    try {
      const { id } = req.params;
      // Check if id is a UUID (36 characters with dashes)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const whereClause = uuidRegex.test(id) ? { id: id } : { slug: id };

      const article = await Article.findOne({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'subtitle', 'content', 'excerpt', 'description',
          'featuredImage', 'imageCaption', 'imageAlt', 'gallery', 'status',
          'workflowStage', 'categoryId', 'subcategoryId', 'authorId', 'coAuthors',
          'authorBioOverride', 'featured', 'heroSlider', 'trending', 'pinned',
          'allowComments', 'readingTime', 'metaTitle', 'metaDescription', 'keywords',
          'publishDate', 'scheduledPublishDate', 'viewCount', 'likeCount', 'shareCount',
          'assignedTo', 'nextAction', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt',
          'tags', 'nationality', 'age', 'gender', 'ethnicity', 'residency',
          'industry', 'position', 'imageDisplayMode', 'links', 'socialEmbeds',
          'externalLinkFollow', 'captchaVerified', 'guidelinesAccepted'
        ],
        include: [
          {
            model: Category,
            as: 'category',
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

      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Increment view count for published articles
      if (article.status === 'published') {
        await article.increment('viewCount');
      }

      // Add JSON-LD structured data for published articles
      if (article.status === 'published') {
        try {
          // Call the method directly to avoid context issues
          const generateStructuredData = (article) => {
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            const articleUrl = `${baseUrl}/article/${article.id}`;

            const structuredData = {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": article.title,
              "description": article.excerpt || article.description || '',
              "image": article.featuredImage ? `${baseUrl}${article.featuredImage}` : undefined,
              "datePublished": article.publishDate || article.createdAt,
              "dateModified": article.updatedAt,
              "author": {
                "@type": "Person",
                "name": article.primaryAuthor?.name || 'Unknown Author',
                "jobTitle": article.primaryAuthor?.title || undefined
              },
              "publisher": {
                "@type": "Organization",
                "name": "Magazine Website",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${baseUrl}/logo.png`
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": articleUrl
              },
              "articleSection": article.category?.name || 'General',
              "keywords": article.tags ? article.tags.join(', ') : '',
              "wordCount": article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0,
              "timeRequired": "PT5M", // Estimated reading time
              "url": articleUrl
            };

            // Remove undefined values
            Object.keys(structuredData).forEach(key => {
              if (structuredData[key] === undefined) {
                delete structuredData[key];
              }
            });

            // Clean up author object
            if (structuredData.author) {
              Object.keys(structuredData.author).forEach(key => {
                if (structuredData.author[key] === undefined) {
                  delete structuredData.author[key];
                }
              });
            }

            return structuredData;
          };

          article.dataValues.structuredData = generateStructuredData(article);
        } catch (error) {
          console.error('Error generating structured data:', error);
          // Continue without structured data if there's an error
        }
      }

      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      console.error('Get article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch article',
        error: error.message
      });
    }
  }

  // Create new article
  async createArticle(req, res) {
    try {
      // Check if user has permission to create articles
      if (!req.admin.hasPermission('content.create')) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to create articles'
        });
      }

      const {
        title,
        subtitle,
        content,
        excerpt,
        description,
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
        author_bio_override,
        // New fields
        nationality,
        age,
        gender,
        ethnicity,
        residency,
        industry,
        position,
        imageDisplayMode,
        links,
        socialEmbeds,
        externalLinkFollow,
        writerPosition,
        writerName,
        writerDate,
        contactEmail,
        contactPhone,
        captchaVerified,
        guidelinesAccepted
      } = req.body;

      const userId = req.admin?.id;

      // Validate required fields
      if (!category_id || category_id.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category is required'
        });
      }

      if (!primary_author_id || primary_author_id.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Author is required'
        });
      }

      // Check permissions for publishing - Master Admin can publish directly
      let initialStatus = 'draft';

      if (req.admin.hasPermission('content.publish')) {
        // Can publish directly
        initialStatus = req.body.status === 'published' ? 'published' : (req.body.status || 'draft');
      } else if (req.admin.hasPermission('content.edit')) {
        // Can create drafts and submit for review
        initialStatus = req.body.status === 'pending_review' ? 'pending_review' : 'draft';
      } else {
        // Limited permissions - only drafts
        initialStatus = 'draft';
      }

      // Handle featured image upload
       let featuredImagePath = null;
       if (req.file) {
         const { ImageUploadService } = require('../services/imageUploadService');
         const imageService = new ImageUploadService();
         const processedFilename = await imageService.processImage(req.file.path, {
           width: 1200,
           height: 800,
           quality: 85,
           format: 'webp'
         });
         // Use the ImageUploadService to generate proper public URL
         featuredImagePath = imageService.generateImageUrl(processedFilename);
       }

      // Handle gallery images
       let galleryImages = [];
       if (req.body.gallery && Array.isArray(req.body.gallery)) {
         // Gallery images are already processed and uploaded by frontend
         galleryImages = req.body.gallery.map(filename => ({
           url: imageService.generateImageUrl(filename),
           alt: '',
           caption: ''
         }));
       }

      // Parse JSON strings with error handling
      let parsedCoAuthors = [];
      let parsedTags = [];
      let parsedSeoKeywords = [];

      try {
        if (co_authors && co_authors !== '') {
          parsedCoAuthors = typeof co_authors === 'string' ? JSON.parse(co_authors) : co_authors;
        }
        if (tags && tags !== '') {
          parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }
        if (seo_keywords && seo_keywords !== '') {
          parsedSeoKeywords = typeof seo_keywords === 'string' ? JSON.parse(seo_keywords) : seo_keywords;
        }
      } catch (parseError) {
        console.error('JSON parsing error in createArticle:', parseError);
        console.error('co_authors value:', co_authors);
        console.error('tags value:', tags);
        console.error('seo_keywords value:', seo_keywords);
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON data in request',
          error: parseError.message
        });
      }

      // Generate slug from title if not provided
      let slug = req.body.slug;
      if (!slug && title) {
        const slugify = require('slugify');
        slug = slugify(title, { lower: true, strict: true });
        // Ensure slug is unique
        let counter = 1;
        let originalSlug = slug;
        while (await Article.findOne({ where: { slug } })) {
          slug = `${originalSlug}-${counter}`;
          counter++;
        }
      }

      // Create article data with new fields
      const articleData = {
        title,
        slug,
        subtitle,
        content,
        excerpt,
        description,
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
        gallery: galleryImages,
        authorBioOverride: author_bio_override,
        status: initialStatus,
        createdBy: userId,
        // New fields
        nationality,
        age,
        gender,
        ethnicity,
        residency,
        industry,
        position,
        imageDisplayMode: imageDisplayMode || 'single',
        links: (() => {
          try {
            return links && links !== '' ? (typeof links === 'string' ? JSON.parse(links) : links) : [];
          } catch (error) {
            console.error('Error parsing links:', error);
            return [];
          }
        })(),
        socialEmbeds: (() => {
          try {
            return socialEmbeds && socialEmbeds !== '' ? (typeof socialEmbeds === 'string' ? JSON.parse(socialEmbeds) : socialEmbeds) : [];
          } catch (error) {
            console.error('Error parsing socialEmbeds:', error);
            return [];
          }
        })(),
        externalLinkFollow: externalLinkFollow !== 'false',
        writerPosition,
        writerName,
        writerDate: writerDate ? new Date(writerDate) : null,
        contactEmail,
        contactPhone,
        captchaVerified: captchaVerified === 'true',
        guidelinesAccepted: guidelinesAccepted === 'true'
      };

      // Set publish date for published articles
      if (initialStatus === 'published') {
        articleData.publishDate = new Date();
      }

      const article = await Article.create(articleData);

      // Auto-categorize article based on taxonomy
      try {
        const categorization = await taxonomyService.autoCategorizeArticle({
          industry,
          position,
          nationality,
          age,
          gender,
          ethnicity,
          residency
        });

        if (categorization.section) {
          // Update article with suggested section/category if not already set
          await article.update({
            // You could map section to category here if needed
            // For now, we'll just log the suggestions
          });
          console.log('Auto-categorization suggestions:', categorization);
        }
      } catch (error) {
        console.error('Auto-categorization error:', error);
        // Continue with article creation even if categorization fails
      }

      // Auto-assign editor based on category if status is pending_review
      if (initialStatus === 'pending_review') {
        await this.autoAssignEditor(article);
      }

      // Schedule publication if needed
      if (scheduled_publish_date && new Date(scheduled_publish_date) > new Date()) {
        await this.schedulePublication(article.id, scheduled_publish_date);
      }

      // Add tags to database if article is published
      if (initialStatus === 'published' && parsedTags.length > 0) {
        await this.addTagsToDatabase(parsedTags, category_id);
      }

      // Update RSS feed if article is published
      if (initialStatus === 'published') {
        await rssService.updateRSSFeed();
      }

      // Get complete article with associations
      const completeArticle = await Article.findByPk(article.id, {
        include: [
          { model: Category, as: 'category' },
          { model: Subcategory, as: 'subcategory' },
          { model: Author, as: 'primaryAuthor' }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: completeArticle
      });
    } catch (error) {
      console.error('Create article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create article',
        error: error.message
      });
    }
  }

  // Update article
  async updateArticle(req, res) {
    const transaction = await Article.sequelize.transaction();

    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      console.log('=== UPDATE ARTICLE DEBUG ===');
      console.log('Article ID:', id);
      console.log('User ID:', userId);
      console.log('Admin object:', req.admin);
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      // Validate article ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid article ID format'
        });
      }

      const article = await Article.findByPk(id, { transaction });
      if (!article) {
        console.log('❌ Article not found with ID:', id);
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      console.log('✅ Found article:', article.id, 'Status:', article.status);
      console.log('Article current data:', JSON.stringify(article.toJSON(), null, 2));

      // Enhanced permission checking with detailed validation
      const permissionResult = await this.validateUpdatePermissions(article, req.admin, userId, req);
      if (!permissionResult.allowed) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: permissionResult.message,
          requiredPermissions: permissionResult.requiredPermissions,
          userPermissions: permissionResult.userPermissions
        });
      }

      // Validate foreign key references before update
      const validationResult = await this.validateForeignKeyReferences(req.body, transaction);
      if (!validationResult.valid) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid references provided',
          validationErrors: validationResult.errors
        });
      }

      // Handle status changes with workflow
      if (req.body.status && req.body.status !== article.status) {
        const statusChange = await this.handleStatusChange(article, req.body.status, userId, req.body.review_notes, transaction);
        if (!statusChange.success) {
          await transaction.rollback();
          return res.status(400).json(statusChange);
        }
      }

      // Handle featured image upload
       let featuredImagePath = article.featuredImage;

       // Handle file upload (when a new file is uploaded)
       if (req.file) {
         const { ImageUploadService } = require('../services/imageUploadService');
         const imageService = new ImageUploadService();
         const processedFilename = await imageService.processImage(req.file.path, {
           width: 1200,
           height: 800,
           quality: 85,
           format: 'webp'
         });
         // Use the ImageUploadService to generate proper public URL
         featuredImagePath = imageService.generateImageUrl(processedFilename);

         // Delete old image if exists
         if (article.featuredImage) {
           try {
             // Extract filename from the old URL to delete the file
             const oldUrl = new URL(article.featuredImage);
             const oldFilename = oldUrl.pathname.split('/').pop();
             await imageService.deleteImage(oldFilename);
           } catch (err) {
             console.warn('Could not delete old image:', err.message);
           }
         }
       }
       // Handle filename string (when frontend sends existing filename)
       else if (req.body.featuredImage && typeof req.body.featuredImage === 'string' && req.body.featuredImage.trim() !== '') {
         console.log('📸 Using existing filename from frontend:', req.body.featuredImage);
         const { ImageUploadService } = require('../services/imageUploadService');
         const imageService = new ImageUploadService();
         featuredImagePath = imageService.generateImageUrl(req.body.featuredImage);

         // Delete old image if exists and different from new one
         if (article.featuredImage && article.featuredImage !== featuredImagePath) {
           try {
             // Extract filename from the old URL to delete the file
             const oldUrl = new URL(article.featuredImage);
             const oldFilename = oldUrl.pathname.split('/').pop();
             await imageService.deleteImage(oldFilename);
           } catch (err) {
             console.warn('Could not delete old image:', err.message);
           }
         }
       }

       // Handle gallery images
       let galleryImages = article.gallery || [];
       if (req.body.gallery && Array.isArray(req.body.gallery)) {
         // Gallery images are already processed and uploaded by frontend
         galleryImages = req.body.gallery.map(filename => ({
           url: imageService.generateImageUrl(filename),
           alt: '',
           caption: ''
         }));
       }

      // Parse JSON strings
      console.log('🔄 Preparing update data...');
      const updateData = {
        ...req.body,
        updatedBy: userId,
        featuredImage: featuredImagePath
      };

      console.log('📝 Initial updateData object:', JSON.stringify(updateData, null, 2));

      // Handle UUID fields - convert empty strings to null
      console.log('🔧 Processing UUID fields...');
      if (updateData.categoryId === '') {
        updateData.categoryId = null;
        console.log('Set categoryId to null (was empty string)');
      }
      if (updateData.subcategoryId === '') {
        updateData.subcategoryId = null;
        console.log('Set subcategoryId to null (was empty string)');
      }
      if (updateData.authorId === '') {
        updateData.authorId = null;
        console.log('Set authorId to null (was empty string)');
      }
      if (updateData.assignedTo === '') {
        updateData.assignedTo = null;
        console.log('Set assignedTo to null (was empty string)');
      }

      // Enhanced date validation
      console.log('📅 Processing dates...');
      updateData.publishDate = this.validateAndParseDate(updateData.publishDate, 'publishDate');
      updateData.scheduledPublishDate = this.validateAndParseDate(updateData.scheduledPublishDate, 'scheduledPublishDate');
      updateData.writerDate = this.validateAndParseDate(updateData.writerDate, 'writerDate');

      // Handle empty strings for optional text fields
      console.log('📝 Processing optional text fields...');
      if (updateData.imageCaption === '') {
        updateData.imageCaption = null;
        console.log('Set imageCaption to null (was empty string)');
      }
      if (updateData.authorBioOverride === '') {
        updateData.authorBioOverride = null;
        console.log('Set authorBioOverride to null (was empty string)');
      }

      // Enhanced JSON parsing with improved error handling
      console.log('🔍 Starting enhanced JSON parsing for complex fields...');

      // Parse JSON fields using the enhanced parser
      updateData.coAuthors = this.parseJsonField(req.body.co_authors, 'co_authors', []);
      updateData.tags = this.parseJsonField(req.body.tags, 'tags', []);
      updateData.keywords = this.parseJsonField(req.body.seo_keywords, 'seo_keywords', []);
      updateData.gallery = galleryImages;

      // Validate parsed arrays
      if (updateData.coAuthors && !Array.isArray(updateData.coAuthors)) {
        console.log('⚠️ coAuthors is not an array, converting to empty array');
        updateData.coAuthors = [];
      }

      if (updateData.tags && !Array.isArray(updateData.tags)) {
        console.log('⚠️ tags is not an array, converting to empty array');
        updateData.tags = [];
      }

      if (updateData.keywords && !Array.isArray(updateData.keywords)) {
        console.log('⚠️ keywords is not an array, converting to empty array');
        updateData.keywords = [];
      }

      // Handle additional fields that might be sent from the frontend
      console.log('🔧 Processing additional fields...');
      try {
        if (req.body.nationality !== undefined) updateData.nationality = req.body.nationality;
        if (req.body.age !== undefined) updateData.age = req.body.age;
        if (req.body.gender !== undefined) updateData.gender = req.body.gender;
        if (req.body.ethnicity !== undefined) updateData.ethnicity = req.body.ethnicity;
        if (req.body.residency !== undefined) updateData.residency = req.body.residency;
        if (req.body.industry !== undefined) updateData.industry = req.body.industry;
        if (req.body.position !== undefined) updateData.position = req.body.position;
        if (req.body.imageDisplayMode !== undefined) updateData.imageDisplayMode = req.body.imageDisplayMode;

        // Parse additional JSON fields using enhanced parser
        console.log('🔍 Parsing additional JSON fields...');
        updateData.links = this.parseJsonField(req.body.links, 'links', []);
        updateData.socialEmbeds = this.parseJsonField(req.body.socialEmbeds, 'socialEmbeds', []);

        // Validate parsed arrays
        if (updateData.links && !Array.isArray(updateData.links)) {
          console.log('⚠️ links is not an array, converting to empty array');
          updateData.links = [];
        }

        if (updateData.socialEmbeds && !Array.isArray(updateData.socialEmbeds)) {
          console.log('⚠️ socialEmbeds is not an array, converting to empty array');
          updateData.socialEmbeds = [];
        }

        if (req.body.externalLinkFollow !== undefined) updateData.externalLinkFollow = req.body.externalLinkFollow === 'true';
        if (req.body.writerPosition !== undefined) updateData.writerPosition = req.body.writerPosition;
        if (req.body.writerName !== undefined) updateData.writerName = req.body.writerName;
        if (req.body.writerDate !== undefined) updateData.writerDate = req.body.writerDate ? new Date(req.body.writerDate) : null;
        if (req.body.contactEmail !== undefined) updateData.contactEmail = req.body.contactEmail;
        if (req.body.contactPhone !== undefined) updateData.contactPhone = req.body.contactPhone;
        if (req.body.captchaVerified !== undefined) updateData.captchaVerified = req.body.captchaVerified === 'true';
        if (req.body.guidelinesAccepted !== undefined) updateData.guidelinesAccepted = req.body.guidelinesAccepted === 'true';

        console.log('📋 Final updateData object before database update:');
        console.log(JSON.stringify(updateData, null, 2));
      } catch (parseError) {
        console.error('❌ Error processing additional fields:', parseError);
        console.error('Error details:', parseError.message);
        console.error('Stack trace:', parseError.stack);
        console.error('links value:', req.body.links);
        console.error('socialEmbeds value:', req.body.socialEmbeds);
        return res.status(400).json({
          success: false,
          message: 'Invalid data format in request',
          error: parseError.message,
          details: {
            links: req.body.links,
            socialEmbeds: req.body.socialEmbeds
          }
        });
      }

      // Update article with transaction
      console.log('💾 Attempting database update with transaction...');
      try {
        await article.update(updateData, { transaction });
        console.log('✅ Database update successful');
        await transaction.commit();
      } catch (dbError) {
        console.error('❌ Database update failed:', dbError);
        console.error('Error details:', dbError.message);
        console.error('Error code:', dbError.original?.code);
        console.error('Error fields:', dbError.fields);
        console.error('SQL:', dbError.sql);
        await transaction.rollback();

        // Provide more specific error messages based on error type
        let errorMessage = 'Database update failed';
        let statusCode = 400;

        if (dbError.original?.code === '23505') {
          errorMessage = 'Duplicate entry - a record with this information already exists';
        } else if (dbError.original?.code === '23503') {
          errorMessage = 'Invalid reference - the referenced record does not exist';
          statusCode = 400;
        } else if (dbError.original?.code === '23502') {
          errorMessage = 'Required field is missing or empty';
        } else if (dbError.original?.code === '22001') {
          errorMessage = 'Data too long for database field';
        }

        return res.status(statusCode).json({
          success: false,
          message: errorMessage,
          error: dbError.message,
          details: {
            code: dbError.original?.code,
            fields: dbError.fields,
            constraint: dbError.original?.constraint
          }
        });
      }

      // Handle scheduled publication
      if (req.body.scheduled_publish_date && new Date(req.body.scheduled_publish_date) > new Date()) {
        console.log('📅 Scheduling publication...');
        await this.schedulePublication(article.id, req.body.scheduled_publish_date);
      }

      // Add tags to database if article is published
      if (req.body.status === 'published' && req.body.tags && req.body.tags !== '') {
        console.log('🏷️ Processing tags for published article...');
        try {
          const parsedTags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
          await this.addTagsToDatabase(parsedTags, article.categoryId);
          console.log('✅ Tags processed successfully');
        } catch (parseError) {
          console.error('❌ Error parsing tags for database:', parseError);
          console.error('Tags value:', req.body.tags);
        }
      }

      // Update RSS feed if article status changed to published or was already published
      if (req.body.status === 'published' || article.status === 'published') {
        console.log('📡 Updating RSS feed...');
        await rssService.updateRSSFeed();
      }

      console.log('🔍 Fetching updated article with associations...');
      const updatedArticle = await Article.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Subcategory, as: 'subcategory' },
          { model: Author, as: 'primaryAuthor' },
          { model: Admin, as: 'assignedEditor' }
        ]
      });

      console.log('✅ Article update completed successfully');
      res.json({
        success: true,
        message: 'Article updated successfully',
        data: updatedArticle
      });
    } catch (error) {
      console.error('💥 Unexpected error in updateArticle:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);

      // Rollback transaction if it hasn't been committed yet
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update article - unexpected error occurred',
        error: error.message,
        stack: error.stack
      });
    }
  }

  // Delete article
  async deleteArticle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Check permissions for deleting
      if (!req.admin.hasPermission('content.delete')) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete articles'
        });
      }

      // Additional check for published articles - only certain roles can delete published content
      if (article.status === 'published' && !req.admin.hasPermission('content.moderate')) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete published articles'
        });
      }

      // Delete associated files
      if (article.featuredImage) {
        try {
          await fs.unlink(path.join(__dirname, '..', article.featuredImage));
        } catch (err) {
          console.warn('Could not delete featured image:', err.message);
        }
      }

      // Update RSS feed if the deleted article was published
      if (article.status === 'published') {
        await rssService.updateRSSFeed();
      }

      await article.destroy();

      res.json({
        success: true,
        message: 'Article deleted successfully'
      });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete article',
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

  // Get articles by category
  async getArticlesByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const {
        page = 1,
        limit = 10,
        status = 'published',
        sort_by = 'createdAt',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { categoryId: categoryId };

      // Apply status filter
      if (status && status !== 'all') {
        whereClause.status = status;
      }

      const { count, rows: articles } = await Article.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'primaryAuthor',
            attributes: ['id', 'name', 'profile_image', 'title']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [[sort_by, sort_order.toUpperCase()]],
        distinct: true
      });

      res.json({
        success: true,
        data: {
          articles,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get articles by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch articles',
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

  // Get filtered categories based on articles
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
            model: Article,
            as: 'articles',
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

  // Get filtered authors based on articles
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
            model: Article,
            as: 'articles',
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
        profileImagePath = `/var/www/menastories/menastories.me/Backend/storage/images/${fileName}`;
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
        const uploadPath = path.join('/var/www/menastories/menastories.me/Backend/storage/images', fileName);

        await fs.rename(req.file.path, uploadPath);
        profileImagePath = `/var/www/menastories/menastories.me/Backend/storage/images/${fileName}`;

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

  // Change article status (workflow management)
  async changeArticleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, review_notes } = req.body;

      const userId = req.admin?.id;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Check permissions based on the status change
      if (status === 'published' && !req.admin.hasPermission('content.publish')) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to publish articles'
        });
      }

      if ((status === 'approved' || status === 'rejected') && !req.admin.hasPermission('content.moderate')) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to approve or reject articles'
        });
      }

      // Check if status change is allowed
      const statusChange = await this.validateStatusChange(article, status, req.admin.role?.name || req.admin.role);
      if (!statusChange.allowed) {
        return res.status(403).json({
          success: false,
          message: statusChange.message
        });
      }

      // Handle specific status changes
      const updateData = { status, updatedBy: userId };

      if (reviewNotes) {
        updateData.reviewNotes = reviewNotes;
      }

      if (status === 'rejected' && !review_notes) {
        return res.status(400).json({
          success: false,
          message: 'Review notes are required when rejecting an article'
        });
      }

      if (status === 'published') {
        updateData.publishDate = new Date();
        
        // Add tags to database
        if (article.tags && article.tags.length > 0) {
          await this.addTagsToDatabase(article.tags, article.categoryId);
        }
      }

      if (status === 'pending_review') {
        // Auto-assign editor
        await this.autoAssignEditor(article);
      }

      await article.update(updateData);

      // Create workflow history record
      await this.createWorkflowHistory(article.id, article.status, status, userId, review_notes);

      const updatedArticle = await Article.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Author, as: 'primaryAuthor' },
          { model: Admin, as: 'assignedEditor' }
        ]
      });

      res.json({
        success: true,
        message: `Article status changed to ${status}`,
        data: updatedArticle
      });
    } catch (error) {
      console.error('Change article status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change article status',
        error: error.message
      });
    }
  }

  // Schedule article for publication
  async scheduleArticle(req, res) {
    try {
      const { id } = req.params;
      const { scheduled_publish_date } = req.body;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      if (article.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Only approved articles can be scheduled'
        });
      }

      if (new Date(scheduled_publish_date) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date must be in the future'
        });
      }

      await article.update({
        status: 'scheduled',
        scheduledPublishDate: scheduled_publish_date
      });

      res.json({
        success: true,
        message: 'Article scheduled successfully',
        data: article
      });
    } catch (error) {
      console.error('Schedule article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule article',
        error: error.message
      });
    }
  }

  // Helper method to validate status changes
  async validateStatusChange(article, newStatus, userRole) {
    const statusTransitions = {
      draft: {
        allowed: ['pending_review', 'published'], // Allow direct publishing from draft
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

    const transition = statusTransitions[article.status];

    if (!transition) {
      return { allowed: false, message: 'Invalid current status' };
    }

    if (!transition.allowed.includes(newStatus)) {
      return {
        allowed: false,
        message: `Cannot change status from ${article.status} to ${newStatus}`
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

  // Get workflow history
  async getWorkflowHistory(req, res) {
    try {
      const { id } = req.params;

      // For now, return empty array since we don't have ArticleWorkflowHistory model
      // In a real implementation, you would query the workflow history table
      const history = [];

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get workflow history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch workflow history',
        error: error.message
      });
    }
  }

  // Assign editor to article
  async assignEditor(req, res) {
    try {
      const { id } = req.params;
      const { editorId } = req.body;
      const userId = req.admin?.id;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      await article.update({
        assignedTo: editorId,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Editor assigned successfully',
        data: article
      });
    } catch (error) {
      console.error('Assign editor error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign editor',
        error: error.message
      });
    }
  }

  // Publish article
  async publishArticle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      if (article.status !== 'approved' && article.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Only approved or scheduled articles can be published'
        });
      }

      await article.update({
        status: 'published',
        publishDate: new Date(),
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Article published successfully',
        data: article
      });
    } catch (error) {
      console.error('Publish article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish article',
        error: error.message
      });
    }
  }

  // Unpublish article
  async unpublishArticle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      if (article.status !== 'published') {
        return res.status(400).json({
          success: false,
          message: 'Only published articles can be unpublished'
        });
      }

      await article.update({
        status: 'archived',
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Article unpublished successfully',
        data: article
      });
    } catch (error) {
      console.error('Unpublish article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unpublish article',
        error: error.message
      });
    }
  }

  // Get article analytics
  async getArticleAnalytics(req, res) {
    try {
      const { id } = req.params;

      const article = await Article.findByPk(id, {
        attributes: ['id', 'title', 'viewCount', 'likeCount', 'shareCount', 'commentCount']
      });

      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      res.json({
        success: true,
        data: {
          article: {
            id: article.id,
            title: article.title
          },
          analytics: {
            views: article.viewCount,
            likes: article.likeCount,
            shares: article.shareCount,
            comments: article.commentCount
          }
        }
      });
    } catch (error) {
      console.error('Get article analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch article analytics',
        error: error.message
      });
    }
  }

  // Track article view
  async trackView(req, res) {
    try {
      const { id } = req.params;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Only increment view count for published articles
      if (article.status === 'published') {
        await article.increment('viewCount');
      }

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

  // Create workflow history record
  async createWorkflowHistory(articleId, fromStatus, toStatus, userId, notes) {
    try {
      // You would need to create an ArticleWorkflowHistory model
      // For now, we'll log it
      console.log('Workflow change:', {
        articleId,
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

  // Enhanced validation and permission methods
  async validateUpdatePermissions(article, admin, userId, req) {
    try {
      console.log('🔐 Validating update permissions...');
      console.log('Article status:', article.status);
      console.log('User role:', admin.role?.name || admin.role);
      console.log('User ID:', userId);
      console.log('Article created by:', article.createdBy);

      // Check if admin object has required methods
      if (!admin || typeof admin.hasPermission !== 'function') {
        console.log('❌ Invalid admin object or missing hasPermission method');
        return {
          allowed: false,
          message: 'Invalid admin authentication',
          requiredPermissions: ['content.edit'],
          userPermissions: []
        };
      }

      const userPermissions = [];
      const requiredPermissions = [];

      // Basic edit permission check
      const hasEditPermission = admin.hasPermission('content.edit');
      userPermissions.push('content.edit');
      requiredPermissions.push('content.edit');

      if (!hasEditPermission) {
        console.log('❌ Missing content.edit permission');
        return {
          allowed: false,
          message: 'You do not have permission to edit articles',
          requiredPermissions,
          userPermissions
        };
      }

      // Enhanced permission checks based on article status
      if (article.status === 'published') {
        const hasModeratePermission = admin.hasPermission('content.moderate');
        userPermissions.push('content.moderate');
        requiredPermissions.push('content.moderate');

        if (!hasModeratePermission) {
          console.log('❌ Missing content.moderate permission for published article');
          return {
            allowed: false,
            message: 'You do not have permission to edit published articles. Content moderation permission required.',
            requiredPermissions,
            userPermissions
          };
        }
      }

      // Additional checks for status changes
      if (req.body.status) {
        if (req.body.status === 'published' && !admin.hasPermission('content.publish')) {
          userPermissions.push('content.publish');
          requiredPermissions.push('content.publish');
          return {
            allowed: false,
            message: 'You do not have permission to publish articles',
            requiredPermissions,
            userPermissions
          };
        }

        if ((req.body.status === 'approved' || req.body.status === 'rejected') &&
            !admin.hasPermission('content.moderate')) {
          userPermissions.push('content.moderate');
          requiredPermissions.push('content.moderate');
          return {
            allowed: false,
            message: 'You do not have permission to approve or reject articles',
            requiredPermissions,
            userPermissions
          };
        }
      }

      // Check if user is the creator (for draft articles)
      if (article.status === 'draft' && article.createdBy === userId) {
        console.log('✅ User is the creator of draft article - permission granted');
        return {
          allowed: true,
          message: 'Permission granted - user is article creator'
        };
      }

      // Check for master admin override
      if (admin.role?.name === 'Master Admin' || admin.role === 'Master Admin') {
        console.log('✅ Master Admin override - all permissions granted');
        return {
          allowed: true,
          message: 'Permission granted - Master Admin override'
        };
      }

      console.log('✅ All permission checks passed');
      return {
        allowed: true,
        message: 'Permission granted'
      };

    } catch (error) {
      console.error('❌ Error in validateUpdatePermissions:', error);
      return {
        allowed: false,
        message: 'Error validating permissions',
        error: error.message
      };
    }
  }

  async validateForeignKeyReferences(updateData, transaction) {
    try {
      console.log('🔍 Validating foreign key references...');
      console.log('Update data keys:', Object.keys(updateData));
      console.log('Update data values:', JSON.stringify(updateData, null, 2));

      const errors = [];

      // UUID validation regex
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // Validate category ID
      if (updateData.categoryId) {
        if (updateData.categoryId === '' || updateData.categoryId === 'null') {
          updateData.categoryId = null;
        } else {
          // First validate UUID format
          if (!uuidRegex.test(updateData.categoryId)) {
            errors.push(`Category ID ${updateData.categoryId} is not a valid UUID format`);
          } else {
            // Then check if category exists
            const category = await Category.findByPk(updateData.categoryId, { transaction });
            if (!category) {
              errors.push(`Category with ID ${updateData.categoryId} does not exist`);
            }
          }
        }
      }

      // Validate subcategory ID
      if (updateData.subcategoryId) {
        if (updateData.subcategoryId === '' || updateData.subcategoryId === 'null') {
          updateData.subcategoryId = null;
        } else {
          // First validate UUID format
          if (!uuidRegex.test(updateData.subcategoryId)) {
            errors.push(`Subcategory ID ${updateData.subcategoryId} is not a valid UUID format`);
          } else {
            // Then check if subcategory exists
            const subcategory = await Subcategory.findByPk(updateData.subcategoryId, { transaction });
            if (!subcategory) {
              errors.push(`Subcategory with ID ${updateData.subcategoryId} does not exist`);
            }
          }
        }
      }

      // Validate author ID
      if (updateData.authorId) {
        if (updateData.authorId === '' || updateData.authorId === 'null') {
          updateData.authorId = null;
        } else {
          // First validate UUID format
          if (!uuidRegex.test(updateData.authorId)) {
            errors.push(`Author ID ${updateData.authorId} is not a valid UUID format`);
          } else {
            // Then check if author exists
            const author = await Author.findByPk(updateData.authorId, { transaction });
            if (!author) {
              errors.push(`Author with ID ${updateData.authorId} does not exist`);
            }
          }
        }
      }

      // Validate assignedTo (admin) ID
      if (updateData.assignedTo) {
        if (updateData.assignedTo === '' || updateData.assignedTo === 'null') {
          updateData.assignedTo = null;
        } else {
          // First validate UUID format
          if (!uuidRegex.test(updateData.assignedTo)) {
            errors.push(`Admin ID ${updateData.assignedTo} is not a valid UUID format`);
          } else {
            // Then check if admin exists
            const admin = await Admin.findByPk(updateData.assignedTo, { transaction });
            if (!admin) {
              errors.push(`Admin with ID ${updateData.assignedTo} does not exist`);
            }
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        cleanedData: updateData
      };

    } catch (error) {
      console.error('❌ Error validating foreign key references:', error);
      return {
        valid: false,
        errors: ['Database validation error'],
        error: error.message
      };
    }
  }

  // Enhanced JSON parsing with comprehensive error handling
  parseJsonField(fieldValue, fieldName, defaultValue = null) {
    try {
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        console.log(`⏭️ Skipping ${fieldName} (undefined/null/empty)`);
        return defaultValue;
      }

      console.log(`🔍 Parsing ${fieldName} field:`, fieldValue);

      if (typeof fieldValue === 'string') {
        // Handle empty strings and whitespace
        const trimmed = fieldValue.trim();
        if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
          return defaultValue;
        }

        // Try to parse as JSON
        const parsed = JSON.parse(trimmed);
        console.log(`✅ Parsed ${fieldName}:`, parsed);
        return parsed;
      }

      // Already parsed
      console.log(`✅ ${fieldName} already parsed:`, fieldValue);
      return fieldValue;

    } catch (parseError) {
      console.error(`❌ JSON parsing error for ${fieldName}:`, parseError.message);
      console.error(`Raw value for ${fieldName}:`, fieldValue);
      console.error('Stack trace:', parseError.stack);

      // Return default value instead of throwing
      return defaultValue;
    }
  }

  // Enhanced date validation
  validateAndParseDate(dateValue, fieldName) {
    try {
      if (!dateValue || dateValue === '' || dateValue === 'Invalid date') {
        console.log(`📅 ${fieldName} is empty or invalid, setting to null`);
        return null;
      }

      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.log(`❌ Invalid date format for ${fieldName}:`, dateValue);
        return null;
      }

      console.log(`✅ Validated ${fieldName}:`, date);
      return date;

    } catch (error) {
      console.error(`❌ Error validating ${fieldName}:`, error);
      return null;
    }
  }

  // Helper methods
  async autoAssignEditor(article) {
    try {
      // Simple auto-assignment logic - assign to first available editor
      // In a real implementation, you might have more complex logic
      const availableEditors = await Admin.findAll({
        where: {
          role: ['Editor-in-Chief', 'Deputy Editor', 'Senior Editor']
        },
        limit: 1
      });

      if (availableEditors.length > 0) {
        await article.update({ assignedTo: availableEditors[0].id });
      }
    } catch (error) {
      console.error('Auto-assign editor error:', error);
    }
  }

  async schedulePublication(articleId, scheduledDate) {
    try {
      // In a real implementation, you would schedule this with a job queue
      console.log(`Article ${articleId} scheduled for publication at ${scheduledDate}`);
    } catch (error) {
      console.error('Schedule publication error:', error);
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

  checkEditPermission(article, userId, userRole) {
    console.log('=== checkEditPermission called ===');
    console.log('Article:', article ? article.id : 'null');
    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('Article createdBy:', article?.createdBy);
    console.log('Article status:', article?.status);

    // Check if article is published - only Master Admin can edit published articles
    if (article?.status === 'published') {
      console.log('Article is published, checking for Master Admin role');
      return userRole === 'Master Admin';
    }

    // Simple permission check - in a real app this would be more complex
    const adminRoles = ['Master Admin', 'Editor-in-Chief', 'Deputy Editor', 'Content Admin', 'Senior Editor'];
    console.log('Admin roles:', adminRoles);
    console.log('User role in admin roles:', adminRoles.includes(userRole));
    console.log('User is article creator:', article?.createdBy === userId);

    const result = adminRoles.includes(userRole) || article?.createdBy === userId;
    console.log('Permission result:', result);

    return result;
  }

  checkDeletePermission(article, userId, userRole) {
    // Only allow deletion by the creator or high-level admins
    const deleteRoles = ['Master Admin', 'Editor-in-Chief'];
    return deleteRoles.includes(userRole) || article.createdBy === userId;
  }

  async handleStatusChange(article, newStatus, userId, reviewNotes, transaction = null) {
    try {
      console.log('🔄 Handling status change from', article.status, 'to', newStatus);

      // Validate the status change
      const validation = await this.validateStatusChange(article, newStatus, 'admin'); // Assuming admin role for now
      if (!validation.allowed) {
        console.log('❌ Status change validation failed:', validation.message);
        return { success: false, message: validation.message };
      }

      // Prepare update data
      const updateData = {
        status: newStatus,
        updatedBy: userId
      };

      if (reviewNotes) {
        updateData.reviewNotes = reviewNotes;
      }

      // Update the article with transaction support
      await article.update(updateData, { transaction });

      console.log('✅ Status change successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Handle status change error:', error);
      console.error('Error details:', error.message);
      return {
        success: false,
        message: 'Failed to change status',
        error: error.message
      };
    }
  }

  // Publish scheduled articles (for auto-publishing)
  async publishScheduledArticles() {
    try {
      const now = new Date();

      const scheduledArticles = await Article.findAll({
        where: {
          status: 'scheduled',
          scheduledPublishDate: {
            [Op.lte]: now
          }
        }
      });

      const publishedArticles = [];

      for (const article of scheduledArticles) {
        await article.update({
          status: 'published',
          publishDate: now
        });
        publishedArticles.push(article);
      }

      return publishedArticles;
    } catch (error) {
      console.error('Error publishing scheduled articles:', error);
      throw error;
    }
  }

  // Get suggested articles based on shared tags
  async getSuggestedArticles(req, res) {
    try {
      const { id } = req.params;
      const { limit = 8 } = req.query;

      // Get the current article with tags
      const currentArticle = await Article.findByPk(id, {
        attributes: ['id', 'tags']
      });

      if (!currentArticle) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      const currentTags = currentArticle.tags || [];

      if (currentTags.length === 0) {
        // If current article has no tags, return recent articles from same category
        const articleWithCategory = await Article.findByPk(id, {
          attributes: ['categoryId']
        });

        const suggestions = await Article.findAll({
          where: {
            status: 'published',
            id: { [Op.ne]: id },
            categoryId: articleWithCategory.categoryId
          },
          attributes: [
            'id', 'title', 'slug', 'excerpt', 'featuredImage', 'imageCaption',
            'createdAt', 'tags'
          ],
          include: [
            { model: Author, as: 'primaryAuthor', attributes: ['name', 'title'] },
            { model: Category, as: 'category', attributes: ['name'] }
          ],
          order: [['createdAt', 'DESC']],
          limit: parseInt(limit)
        });

        return res.json({
          success: true,
          data: suggestions
        });
      }

      // Find articles that share at least one tag
      const allPublishedArticles = await Article.findAll({
        where: {
          status: 'published',
          id: { [Op.ne]: id }
        },
        attributes: [
          'id', 'title', 'slug', 'excerpt', 'featuredImage', 'imageCaption',
          'createdAt', 'tags'
        ],
        include: [
          { model: Author, as: 'primaryAuthor', attributes: ['name', 'title'] },
          { model: Category, as: 'category', attributes: ['name'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: 200 // Get more articles to filter by tags
      });

      // Filter articles that share at least one tag
      const suggestions = [];
      for (const article of allPublishedArticles) {
        const articleTags = article.tags || [];
        const hasCommonTag = currentTags.some(tag => articleTags.includes(tag));

        if (hasCommonTag) {
          suggestions.push(article);
          if (suggestions.length >= parseInt(limit)) {
            break;
          }
        }
      }

      // If we don't have enough suggestions with shared tags, fill with recent articles
      if (suggestions.length < parseInt(limit)) {
        const remainingLimit = parseInt(limit) - suggestions.length;
        const suggestedIds = suggestions.map(s => s.id);

        const additionalArticles = await Article.findAll({
          where: {
            status: 'published',
            id: { [Op.notIn]: [id, ...suggestedIds] }
          },
          attributes: [
            'id', 'title', 'slug', 'excerpt', 'featuredImage', 'imageCaption',
            'createdAt', 'tags'
          ],
          include: [
            { model: Author, as: 'primaryAuthor', attributes: ['name', 'title'] },
            { model: Category, as: 'category', attributes: ['name'] }
          ],
          order: [['createdAt', 'DESC']],
          limit: remainingLimit
        });

        suggestions.push(...additionalArticles);
      }

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Get suggested articles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suggested articles',
        error: error.message
      });
    }
  }

  // Get RSS feed
  async getRSSFeed(req, res) {
    try {
      const rssContent = await rssService.getRSSFeed();
      res.set('Content-Type', 'application/rss+xml');
      res.send(rssContent);
    } catch (error) {
      console.error('Get RSS feed error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch RSS feed',
        error: error.message
      });
    }
  }

  // Get comments for an article
  async getArticleComments(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Validate article exists
      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      const comments = await Comment.getByArticle(id, { page, limit });

      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      console.error('Get article comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: error.message
      });
    }
  }

  // Create a new comment
  async createComment(req, res) {
    try {
      const { id } = req.params;
      const { content, parentId } = req.body;
      const userId = req.user?.id;

      // Validate article exists
      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Check if comments are allowed for this article
      if (!article.allowComments) {
        return res.status(403).json({
          success: false,
          message: 'Comments are not allowed for this article'
        });
      }

      // Validate user is authenticated
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }

      // Create comment
      const comment = await Comment.create({
        articleId: id,
        authorId: userId,
        content: content.trim(),
        parentId: parentId || null,
        status: 'approved' // Set to approved for testing - in production this should be 'pending'
      });

      // Get complete comment with author info
      const completeComment = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar', 'isEmailVerified']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: completeComment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create comment',
        error: error.message
      });
    }
  }

  // Update a comment
  async updateComment(req, res) {
    try {
      const { id, commentId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      // Find comment
      const comment = await Comment.findOne({
        where: {
          id: commentId,
          articleId: id
        }
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Check permissions - only comment author can edit
      if (comment.authorId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own comments'
        });
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }

      // Update comment
      await comment.update({
        content: content.trim(),
        isEdited: true,
        editedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update comment',
        error: error.message
      });
    }
  }

  // Delete a comment
  async deleteComment(req, res) {
    try {
      const { id, commentId } = req.params;
      const userId = req.user?.id;

      // Find comment
      const comment = await Comment.findOne({
        where: {
          id: commentId,
          articleId: id
        }
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Check permissions - only comment author can delete
      if (comment.authorId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments'
        });
      }

      // Delete comment
      await comment.destroy();

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error.message
      });
    }
  }

  // Generate JSON-LD structured data for articles
  generateStructuredData(article) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const articleUrl = `${baseUrl}/article/${article.id}`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.excerpt || article.description || '',
      "image": article.featuredImage ? `${baseUrl}${article.featuredImage}` : undefined,
      "datePublished": article.publishDate || article.createdAt,
      "dateModified": article.updatedAt,
      "author": {
        "@type": "Person",
        "name": article.primaryAuthor?.name || article.writerName || 'Unknown Author',
        "jobTitle": article.primaryAuthor?.title || article.writerPosition || undefined,
        "nationality": article.nationality ? {
          "@type": "Country",
          "name": article.nationality
        } : undefined
      },
      "publisher": {
        "@type": "Organization",
        "name": "Magazine Website",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      },
      "articleSection": article.category?.name || 'General',
      "keywords": article.tags ? article.tags.join(', ') : '',
      "wordCount": article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0,
      "timeRequired": "PT5M", // Estimated reading time
      "url": articleUrl,
      // Enhanced metadata
      "about": article.industry ? {
        "@type": "Thing",
        "name": article.industry
      } : undefined,
      "mentions": article.position ? {
        "@type": "OrganizationRole",
        "name": article.position
      } : undefined,
      "contributor": article.writerName && article.writerName !== article.primaryAuthor?.name ? {
        "@type": "Person",
        "name": article.writerName,
        "jobTitle": article.writerPosition
      } : undefined
    };

    // Remove undefined values
    Object.keys(structuredData).forEach(key => {
      if (structuredData[key] === undefined) {
        delete structuredData[key];
      }
    });

    // Clean up author object
    if (structuredData.author) {
      Object.keys(structuredData.author).forEach(key => {
        if (structuredData.author[key] === undefined) {
          delete structuredData.author[key];
        }
      });
    }

    return structuredData;
  }

  // Comment methods
  async getArticleComments(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, sort = 'newest' } = req.query;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      const comments = await Comment.getByArticle(id, { page, limit, sort });

      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      console.error('Get article comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: error.message
      });
    }
  }

  async createComment(req, res) {
    try {
      const { id } = req.params;
      const { content, parentId } = req.body;
      const userId = req.user?.id;

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      if (!article.allowComments) {
        return res.status(403).json({
          success: false,
          message: 'Comments are not allowed for this article'
        });
      }

      const commentData = {
        articleId: id,
        authorId: userId,
        content,
        parentId: parentId || null,
        status: 'approved' // Set to approved for testing - in production this should be 'pending'
      };

      const comment = await Comment.create(commentData);

      res.status(201).json({
        success: true,
        message: 'Comment submitted successfully',
        data: comment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create comment',
        error: error.message
      });
    }
  }

  async updateComment(req, res) {
    try {
      const { id, commentId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.articleId !== id) {
        return res.status(400).json({
          success: false,
          message: 'Comment does not belong to this article'
        });
      }

      if (comment.authorId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own comments'
        });
      }

      await comment.update({ content });

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update comment',
        error: error.message
      });
    }
  }

  async deleteComment(req, res) {
    try {
      const { id, commentId } = req.params;
      const userId = req.user?.id;

      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.articleId !== id) {
        return res.status(400).json({
          success: false,
          message: 'Comment does not belong to this article'
        });
      }

      if (comment.authorId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments'
        });
      }

      await comment.destroy();

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error.message
      });
    }
  }

  // Middleware for file upload
  uploadMiddleware() {
    return upload.single('featured_image');
  }
}

module.exports = ArticleController;