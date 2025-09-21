const { Download, Category, Admin } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const rssService = require('../services/rssService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/downloads/');
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow various file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'application/zip',
      'application/x-rar-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

class DownloadController {
  constructor() {
    // Bind methods to preserve context
    this.getAllDownloads = this.getAllDownloads.bind(this);
    this.getDownload = this.getDownload.bind(this);
    this.createDownload = this.createDownload.bind(this);
    this.updateDownload = this.updateDownload.bind(this);
    this.deleteDownload = this.deleteDownload.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
    this.generateStructuredData = this.generateStructuredData.bind(this);
  }

  // Get all downloads with filters and pagination
  async getAllDownloads(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category_id,
        file_type,
        search,
        sort_by = 'createdAt',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (status && status !== 'all') whereClause.status = status;
      if (category_id && category_id !== 'all') whereClause.categoryId = category_id;
      if (file_type && file_type !== 'all') whereClause.fileType = file_type;

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: downloads } = await Download.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'description', 'fileUrl', 'fileName', 'originalFileName',
          'fileSize', 'fileType', 'mimeType', 'thumbnailUrl', 'previewUrl', 'status',
          'categoryId', 'tags', 'metaTitle', 'metaDescription', 'keywords', 'publishDate',
          'downloadCount', 'viewCount', 'version', 'language', 'license', 'copyright',
          'isPublic', 'accessLevel', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
        ],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Admin,
            as: 'creator',
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
          downloads,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get downloads error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch downloads',
        error: error.message
      });
    }
  }

  // Get single download by ID or slug
  async getDownload(req, res) {
    try {
      const { id } = req.params;
      // Check if id is a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const whereClause = uuidRegex.test(id) ? { id: id } : { slug: id };

      const download = await Download.findOne({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'description', 'fileUrl', 'fileName', 'originalFileName',
          'fileSize', 'fileType', 'mimeType', 'thumbnailUrl', 'previewUrl', 'status',
          'categoryId', 'tags', 'metaTitle', 'metaDescription', 'keywords', 'publishDate',
          'downloadCount', 'viewCount', 'version', 'language', 'license', 'copyright',
          'isPublic', 'accessLevel', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
        ],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!download) {
        return res.status(404).json({
          success: false,
          message: 'Download not found'
        });
      }

      // Increment view count for published downloads
      if (download.status === 'published') {
        await download.increment('viewCount');
      }

      // Add JSON-LD structured data for published downloads
      if (download.status === 'published') {
        try {
          download.dataValues.structuredData = this.generateStructuredData(download);
        } catch (error) {
          console.error('Error generating structured data:', error);
        }
      }

      res.json({
        success: true,
        data: download
      });
    } catch (error) {
      console.error('Get download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch download',
        error: error.message
      });
    }
  }

  // Create new download
  async createDownload(req, res) {
    try {
      const {
        title,
        description,
        category_id,
        tags,
        meta_title,
        meta_description,
        seo_keywords,
        scheduled_publish_date,
        version,
        language,
        license,
        copyright,
        is_public,
        access_level
      } = req.body;

      const userId = req.admin?.id;

      // Validate required fields
      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }

      // Determine file type from extension
      const fileExtension = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      const fileTypeMap = {
        'pdf': 'pdf',
        'doc': 'doc',
        'docx': 'docx',
        'xls': 'xls',
        'xlsx': 'xlsx',
        'ppt': 'ppt',
        'pptx': 'pptx',
        'txt': 'txt',
        'jpg': 'jpg',
        'jpeg': 'jpeg',
        'png': 'png',
        'gif': 'gif',
        'webp': 'webp',
        'mp4': 'mp4',
        'avi': 'avi',
        'mov': 'mov',
        'mp3': 'mp3',
        'wav': 'wav',
        'zip': 'zip',
        'rar': 'rar'
      };

      const fileType = fileTypeMap[fileExtension] || 'other';

      // Handle file upload
      const fileName = req.file.filename;
      const fileUrl = `/storage/downloads/${fileName}`;

      // Parse JSON strings
      const parsedTags = tags ? JSON.parse(tags) : [];
      const parsedSeoKeywords = seo_keywords ? JSON.parse(seo_keywords) : [];

      // Generate slug from title
      let slug = req.body.slug;
      if (!slug && title) {
        const slugify = require('slugify');
        slug = slugify(title, { lower: true, strict: true });
        // Ensure slug is unique
        let counter = 1;
        let originalSlug = slug;
        while (await Download.findOne({ where: { slug } })) {
          slug = `${originalSlug}-${counter}`;
          counter++;
        }
      }

      // Create download data
      const downloadData = {
        title,
        slug,
        description,
        fileUrl,
        fileName,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        fileType,
        mimeType: req.file.mimetype,
        categoryId: category_id || null,
        tags: parsedTags,
        metaTitle: meta_title,
        metaDescription: meta_description,
        keywords: parsedSeoKeywords,
        scheduledPublishDate: scheduled_publish_date ? new Date(scheduled_publish_date) : null,
        version,
        language: language || 'en',
        license: license || 'all_rights_reserved',
        copyright,
        isPublic: is_public !== 'false',
        accessLevel: access_level || 'public',
        status: 'draft', // Master admin can publish directly
        createdBy: userId
      };

      // Set publish date for published downloads
      if (req.body.status === 'published') {
        downloadData.status = 'published';
        downloadData.publishDate = new Date();
      }

      const download = await Download.create(downloadData);

      // Update RSS feed if download is published
      if (downloadData.status === 'published') {
        await rssService.updateRSSFeed();
      }

      // Get complete download with associations
      const completeDownload = await Download.findByPk(download.id, {
        include: [
          { model: Category, as: 'category' },
          { model: Admin, as: 'creator' }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Download created successfully',
        data: completeDownload
      });
    } catch (error) {
      console.error('Create download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create download',
        error: error.message
      });
    }
  }

  // Update download
  async updateDownload(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const download = await Download.findByPk(id);
      if (!download) {
        return res.status(404).json({
          success: false,
          message: 'Download not found'
        });
      }

      // Handle file upload if new file provided
      let fileData = {};
      if (req.file) {
        const fileName = req.file.filename;
        const fileUrl = `/storage/downloads/${fileName}`;

        // Determine file type
        const fileExtension = path.extname(req.file.originalname).toLowerCase().replace('.', '');
        const fileTypeMap = {
          'pdf': 'pdf', 'doc': 'doc', 'docx': 'docx', 'xls': 'xls', 'xlsx': 'xlsx',
          'ppt': 'ppt', 'pptx': 'pptx', 'txt': 'txt', 'jpg': 'jpg', 'jpeg': 'jpeg',
          'png': 'png', 'gif': 'gif', 'webp': 'webp', 'mp4': 'mp4', 'avi': 'avi',
          'mov': 'mov', 'mp3': 'mp3', 'wav': 'wav', 'zip': 'zip', 'rar': 'rar'
        };

        const fileType = fileTypeMap[fileExtension] || 'other';

        fileData = {
          fileUrl,
          fileName,
          originalFileName: req.file.originalname,
          fileSize: req.file.size,
          fileType,
          mimeType: req.file.mimetype
        };

        // Delete old file if exists
        if (download.fileUrl) {
          try {
            const oldFilePath = path.join(__dirname, '..', download.fileUrl);
            await fs.unlink(oldFilePath);
          } catch (err) {
            console.warn('Could not delete old file:', err.message);
          }
        }
      }

      // Parse JSON strings
      const updateData = {
        ...req.body,
        ...fileData,
        updatedBy: userId
      };

      // Handle UUID fields
      if (updateData.categoryId === '') {
        updateData.categoryId = null;
      }

      // Handle publish date
      if (updateData.publishDate === 'Invalid date' || !updateData.publishDate) {
        updateData.publishDate = null;
      } else if (updateData.publishDate) {
        const date = new Date(updateData.publishDate);
        updateData.publishDate = isNaN(date.getTime()) ? null : date;
      }

      // Parse tags and keywords
      if (req.body.tags) {
        updateData.tags = JSON.parse(req.body.tags);
      }
      if (req.body.seo_keywords) {
        updateData.keywords = JSON.parse(req.body.seo_keywords);
      }

      // Update download
      await download.update(updateData);

      // Update RSS feed if download status changed to published or was already published
      if (req.body.status === 'published' || download.status === 'published') {
        await rssService.updateRSSFeed();
      }

      const updatedDownload = await Download.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Admin, as: 'creator' }
        ]
      });

      res.json({
        success: true,
        message: 'Download updated successfully',
        data: updatedDownload
      });
    } catch (error) {
      console.error('Update download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update download',
        error: error.message
      });
    }
  }

  // Delete download
  async deleteDownload(req, res) {
    try {
      const { id } = req.params;

      const download = await Download.findByPk(id);
      if (!download) {
        return res.status(404).json({
          success: false,
          message: 'Download not found'
        });
      }

      // Delete associated file
      if (download.fileUrl) {
        try {
          const filePath = path.join(__dirname, '..', download.fileUrl);
          await fs.unlink(filePath);
        } catch (err) {
          console.warn('Could not delete file:', err.message);
        }
      }

      // Update RSS feed if the deleted download was published
      if (download.status === 'published') {
        await rssService.updateRSSFeed();
      }

      await download.destroy();

      res.json({
        success: true,
        message: 'Download deleted successfully'
      });
    } catch (error) {
      console.error('Delete download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete download',
        error: error.message
      });
    }
  }

  // Handle file download
  async downloadFile(req, res) {
    try {
      const { id } = req.params;

      const download = await Download.findByPk(id);
      if (!download) {
        return res.status(404).json({
          success: false,
          message: 'Download not found'
        });
      }

      if (download.status !== 'published') {
        return res.status(404).json({
          success: false,
          message: 'Download not available'
        });
      }

      // Check access level
      if (download.accessLevel === 'registered' && !req.user) {
        return res.status(403).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (download.accessLevel === 'premium' && (!req.user || !req.user.isPremium)) {
        return res.status(403).json({
          success: false,
          message: 'Premium access required'
        });
      }

      const filePath = path.join(__dirname, '..', download.fileUrl);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Increment download count
      await download.increment('downloadCount');

      // Set appropriate headers
      res.setHeader('Content-Type', download.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${download.originalFileName}"`);

      // Stream the file
      const fileStream = require('fs').createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Download file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }

  // Generate JSON-LD structured data for downloads
  generateStructuredData(download) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const downloadUrl = `${baseUrl}/downloads/${download.id}`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "DataDownload",
      "name": download.title,
      "description": download.description || '',
      "url": downloadUrl,
      "datePublished": download.publishDate || download.createdAt,
      "dateModified": download.updatedAt,
      "publisher": {
        "@type": "Organization",
        "name": "Magazine Website",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "encodingFormat": download.mimeType,
      "fileSize": download.fileSize,
      "contentSize": this.formatFileSize(download.fileSize),
      "downloadUrl": `${baseUrl}/api/downloads/${download.id}/download`,
      "inLanguage": download.language || 'en',
      "license": download.license ? `https://creativecommons.org/licenses/${download.license}/` : undefined,
      "copyrightHolder": download.copyright ? {
        "@type": "Organization",
        "name": download.copyright
      } : undefined,
      "version": download.version || '1.0',
      "keywords": download.tags ? download.tags.join(', ') : '',
      "about": download.category ? {
        "@type": "Thing",
        "name": download.category.name
      } : undefined
    };

    // Remove undefined values
    Object.keys(structuredData).forEach(key => {
      if (structuredData[key] === undefined) {
        delete structuredData[key];
      }
    });

    return structuredData;
  }

  // Helper method to format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Middleware for file upload
  uploadMiddleware() {
    return upload.single('file');
  }
}

module.exports = DownloadController;