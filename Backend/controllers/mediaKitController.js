const { MediaKit, Admin } = require('../models');
const { Op } = require('sequelize');
const rssService = require('../services/rssService');
const slugify = require('slugify');

class MediaKitController {
  constructor() {
    // Bind methods to preserve context
    this.getAllMediaKits = this.getAllMediaKits.bind(this);
    this.getMediaKit = this.getMediaKit.bind(this);
    this.createMediaKit = this.createMediaKit.bind(this);
    this.updateMediaKit = this.updateMediaKit.bind(this);
    this.deleteMediaKit = this.deleteMediaKit.bind(this);
    this.generateStructuredData = this.generateStructuredData.bind(this);
  }

  // Get all media kits with filters and pagination
  async getAllMediaKits(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        sort_by = 'createdAt',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (status && status !== 'all') whereClause.status = status;

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: mediaKits } = await MediaKit.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'description', 'status',
          'featuredImage', 'imageCaption', 'imageAlt',
          'audienceDemographics', 'digitalPresence', 'advertisingOpportunities',
          'brandGuidelines', 'documents', 'metaTitle', 'metaDescription',
          'keywords', 'publishDate', 'viewCount', 'downloadCount',
          'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
        ],
        include: [
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Admin,
            as: 'updater',
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
          mediaKits,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get media kits error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch media kits',
        error: error.message
      });
    }
  }

  // Get single media kit by ID or slug
  async getMediaKit(req, res) {
    try {
      const { id } = req.params;
      // Check if id is a UUID (36 characters with dashes)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const whereClause = uuidRegex.test(id) ? { id: id } : { slug: id };

      const mediaKit = await MediaKit.findOne({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'description', 'content', 'status',
          'featuredImage', 'imageCaption', 'imageAlt',
          'audienceDemographics', 'digitalPresence', 'advertisingOpportunities',
          'brandGuidelines', 'documents', 'metaTitle', 'metaDescription',
          'keywords', 'publishDate', 'viewCount', 'downloadCount',
          'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
        ],
        include: [
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!mediaKit) {
        return res.status(404).json({
          success: false,
          message: 'Media kit not found'
        });
      }

      // Increment view count for published media kits
      if (mediaKit.status === 'published') {
        await mediaKit.increment('viewCount');
      }

      // Add JSON-LD structured data for published media kits
      if (mediaKit.status === 'published') {
        try {
          mediaKit.dataValues.structuredData = this.generateStructuredData(mediaKit);
        } catch (error) {
          console.error('Error generating structured data:', error);
        }
      }

      res.json({
        success: true,
        data: mediaKit
      });
    } catch (error) {
      console.error('Get media kit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch media kit',
        error: error.message
      });
    }
  }

  // Create new media kit
  async createMediaKit(req, res) {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));

      const {
        title,
        description,
        content,
        status,
        featuredImage,
        imageCaption,
        imageAlt,
        audienceDemographics,
        digitalPresence,
        advertisingOpportunities,
        brandGuidelines,
        documents,
        metaTitle,
        metaDescription,
        keywords
      } = req.body;

      const userId = req.admin?.id;

      // Validate required fields
      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      // Parse JSON strings with error handling
      console.log('Parsing JSON fields:', {
        audienceDemographics: typeof audienceDemographics,
        digitalPresence: typeof digitalPresence,
        advertisingOpportunities: typeof advertisingOpportunities,
        brandGuidelines: typeof brandGuidelines,
        documents: typeof documents,
        keywords: typeof keywords
      });

      const parsedAudienceDemographics = audienceDemographics ? this.safeJsonParse(audienceDemographics, {}, 'audienceDemographics') : {};
      const parsedDigitalPresence = digitalPresence ? this.safeJsonParse(digitalPresence, {}, 'digitalPresence') : {};
      const parsedAdvertisingOpportunities = advertisingOpportunities ? this.safeJsonParse(advertisingOpportunities, [], 'advertisingOpportunities') : [];
      const parsedBrandGuidelines = brandGuidelines ? this.safeJsonParse(brandGuidelines, {}, 'brandGuidelines') : {};
      const parsedDocuments = documents ? this.safeJsonParse(documents, [], 'documents') : [];
      const parsedKeywords = keywords ? this.safeJsonParse(keywords, [], 'keywords') : [];

      // Generate slug
      const slugify = require('slugify');
      let baseSlug = slugify(title, { lower: true, strict: true });
      console.log('Generated slug:', baseSlug);

      // Check for duplicate slugs
      const existingSlug = await MediaKit.findOne({ where: { slug: baseSlug } });
      if (existingSlug) {
        baseSlug = `${baseSlug}-${Date.now()}`;
      }

      // Create media kit data
      const mediaKitData = {
        title,
        slug: baseSlug,
        description,
        content,
        status: status || 'draft',
        featuredImage,
        imageCaption,
        imageAlt,
        audienceDemographics: parsedAudienceDemographics,
        digitalPresence: parsedDigitalPresence,
        advertisingOpportunities: parsedAdvertisingOpportunities,
        brandGuidelines: parsedBrandGuidelines,
        documents: parsedDocuments,
        metaTitle,
        metaDescription,
        keywords: parsedKeywords,
        createdBy: userId
      };

      // Set publish date for published media kits
      if (status === 'published') {
        mediaKitData.publishDate = new Date();
      }

      const mediaKit = await MediaKit.create(mediaKitData);

      // Update RSS feed if media kit is published
      if (status === 'published') {
        await rssService.updateRSSFeed();
      }

      // Get complete media kit with associations
      const completeMediaKit = await MediaKit.findByPk(mediaKit.id, {
        include: [
          { model: Admin, as: 'creator' }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Media kit created successfully',
        data: completeMediaKit
      });
    } catch (error) {
      console.error('Create media kit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create media kit',
        error: error.message
      });
    }
  }

  // Update media kit
  async updateMediaKit(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const mediaKit = await MediaKit.findByPk(id);
      if (!mediaKit) {
        return res.status(404).json({
          success: false,
          message: 'Media kit not found'
        });
      }

      // Handle status changes
      if (req.body.status && req.body.status !== mediaKit.status) {
        if (req.body.status === 'published') {
          req.body.publishDate = new Date();
        }
      }

      // Parse JSON strings with error handling
      const updateData = { ...req.body, updatedBy: userId };

      if (req.body.audienceDemographics) {
        updateData.audienceDemographics = this.safeJsonParse(req.body.audienceDemographics, {}, 'audienceDemographics');
      }
      if (req.body.digitalPresence) {
        updateData.digitalPresence = this.safeJsonParse(req.body.digitalPresence, {}, 'digitalPresence');
      }
      if (req.body.advertisingOpportunities) {
        updateData.advertisingOpportunities = this.safeJsonParse(req.body.advertisingOpportunities, [], 'advertisingOpportunities');
      }
      if (req.body.brandGuidelines) {
        updateData.brandGuidelines = this.safeJsonParse(req.body.brandGuidelines, {}, 'brandGuidelines');
      }
      if (req.body.documents) {
        updateData.documents = this.safeJsonParse(req.body.documents, [], 'documents');
      }
      if (req.body.keywords) {
        updateData.keywords = this.safeJsonParse(req.body.keywords, [], 'keywords');
      }

      await mediaKit.update(updateData);

      // Update RSS feed if status changed to published or was already published
      if (req.body.status === 'published' || mediaKit.status === 'published') {
        await rssService.updateRSSFeed();
      }

      const updatedMediaKit = await MediaKit.findByPk(id, {
        include: [
          { model: Admin, as: 'creator' },
          { model: Admin, as: 'updater' }
        ]
      });

      res.json({
        success: true,
        message: 'Media kit updated successfully',
        data: updatedMediaKit
      });
    } catch (error) {
      console.error('Update media kit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update media kit',
        error: error.message
      });
    }
  }

  // Delete media kit
  async deleteMediaKit(req, res) {
    try {
      const { id } = req.params;

      const mediaKit = await MediaKit.findByPk(id);
      if (!mediaKit) {
        return res.status(404).json({
          success: false,
          message: 'Media kit not found'
        });
      }

      // Update RSS feed if the deleted media kit was published
      if (mediaKit.status === 'published') {
        await rssService.updateRSSFeed();
      }

      await mediaKit.destroy();

      res.json({
        success: true,
        message: 'Media kit deleted successfully'
      });
    } catch (error) {
      console.error('Delete media kit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete media kit',
        error: error.message
      });
    }
  }

  // Track media kit view
  async trackView(req, res) {
    try {
      const { id } = req.params;

      const mediaKit = await MediaKit.findByPk(id);
      if (!mediaKit) {
        return res.status(404).json({
          success: false,
          message: 'Media kit not found'
        });
      }

      // Only increment view count for published media kits
      if (mediaKit.status === 'published') {
        await mediaKit.increment('viewCount');
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

  // Track media kit download
  async trackDownload(req, res) {
    try {
      const { id } = req.params;

      const mediaKit = await MediaKit.findByPk(id);
      if (!mediaKit) {
        return res.status(404).json({
          success: false,
          message: 'Media kit not found'
        });
      }

      // Only increment download count for published media kits
      if (mediaKit.status === 'published') {
        await mediaKit.increment('downloadCount');
      }

      res.json({
        success: true,
        message: 'Download tracked successfully'
      });
    } catch (error) {
      console.error('Track download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track download',
        error: error.message
      });
    }
  }

  // Generate JSON-LD structured data for media kits
  generateStructuredData(mediaKit) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const mediaKitUrl = `${baseUrl}/media-kit/${mediaKit.slug}`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": mediaKit.title,
      "description": mediaKit.description || '',
      "url": mediaKitUrl,
      "datePublished": mediaKit.publishDate || mediaKit.createdAt,
      "dateModified": mediaKit.updatedAt,
      "image": mediaKit.featuredImage ? `${baseUrl}${mediaKit.featuredImage}` : undefined,
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
        "@id": mediaKitUrl
      },
      "about": {
        "@type": "Thing",
        "name": "Media Kit",
        "description": "Advertising and brand partnership information"
      }
    };

    // Remove undefined values
    Object.keys(structuredData).forEach(key => {
      if (structuredData[key] === undefined) {
        delete structuredData[key];
      }
    });

    return structuredData;
  }

  // Helper method to generate slug
  async generateSlug(title) {
    console.log('generateSlug called with title:', title, 'type:', typeof title);
    if (!title) {
      console.log('Title is falsy, returning null');
      return null;
    }

    try {
      let baseSlug = slugify(title, { lower: true, strict: true });
      console.log('Generated baseSlug:', baseSlug);

      // Check for duplicate slugs
      const existingSlug = await MediaKit.findOne({ where: { slug: baseSlug } });
      if (existingSlug) {
        baseSlug = `${baseSlug}-${Date.now()}`;
        console.log('Slug exists, new slug:', baseSlug);
      }

      console.log('Final slug:', baseSlug);
      return baseSlug;
    } catch (error) {
      console.error('Error in generateSlug:', error);
      return null;
    }
  }

  // Helper method to safely parse JSON
  safeJsonParse(value, defaultValue = null, fieldName = 'unknown') {
    if (!value) return defaultValue;
    if (typeof value === 'object') return value; // Already parsed
    try {
      console.log(`Parsing ${fieldName}:`, value);
      return JSON.parse(value);
    } catch (error) {
      console.error(`Failed to parse JSON for field '${fieldName}':`, {
        value: value,
        error: error.message,
        defaultValue: defaultValue
      });
      return defaultValue;
    }
  }
}

module.exports = MediaKitController;