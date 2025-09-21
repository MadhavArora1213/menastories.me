const { Media, MediaFolder, MediaUsage, Article, User, MediaTag, MediaTagRelation } = require('../models');
const cloudinary = require('../utils/cloudinary');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Upload a single file
exports.uploadMedia = async (req, res) => {
  try {
    console.log('=== MEDIA UPLOAD DEBUG ===');
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Body:', req.body);

    if (!req.files || !req.files.file || req.files.file.length === 0) {
      console.log('No files found in req.files.file');
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const file = req.files.file[0];
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? 'Buffer present' : 'No buffer'
    });
    const { folder = 'general', tags, caption, altText } = req.body;
    const allowedTypes = ['image', 'video', 'audio'];
    
    // Determine file type
    let fileType;
    if (file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      fileType = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
    } else {
      fileType = 'document';
    }

    // Check Cloudinary configuration
    console.log('Cloudinary config check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    });

    // Upload to Cloudinary with resource_type auto to handle different file types
    const result = await new Promise((resolve, reject) => {
      console.log('Starting Cloudinary upload...');
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          tags: tags ? JSON.parse(tags) : undefined
        },
        (error, result) => {
          if (error) {
            console.log('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.public_id);
            resolve(result);
          }
        }
      );

      console.log('Sending buffer to Cloudinary, size:', file.buffer.length);
      uploadStream.end(file.buffer);
    });

    // Generate thumbnail URL for images and videos
    let thumbnailUrl = null;
    if (fileType === 'image') {
      thumbnailUrl = cloudinary.url(result.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
      });
    } else if (fileType === 'video') {
      thumbnailUrl = cloudinary.url(result.public_id, {
        resource_type: 'video',
        width: 300,
        height: 300,
        crop: 'fill',
        start_offset: '0',
        end_offset: '1',
        format: 'jpg'
      });
    }

    // Create optimized URL for images
    let optimizedUrl = null;
    if (fileType === 'image') {
      optimizedUrl = cloudinary.url(result.public_id, {
        quality: 'auto',
        fetch_format: 'auto'
      });
    }

    // Create media record
    const media = await Media.create({
      url: result.secure_url,
      thumbnailUrl,
      optimizedUrl,
      publicId: result.public_id,
      type: fileType,
      mimeType: file.mimetype,
      originalFilename: file.originalname,
      displayName: file.originalname.split('.')[0],
      size: file.size,
      format: result.format,
      width: result.width,
      height: result.height,
      duration: result.duration,
      bitrate: result.bit_rate,
      frameRate: result.frame_rate,
      folder: folder,
      tags: tags ? JSON.parse(tags) : [],
      caption: caption,
      altText: altText,
      description: req.body.description,
      copyright: req.body.copyright,
      license: req.body.license || 'all_rights_reserved',
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      keywords: req.body.keywords ? JSON.parse(req.body.keywords) : [],
      cdnUrl: result.secure_url,
      isOptimized: fileType === 'image',
      uploadedBy: req.admin ? req.admin.id : (req.user ? req.user.id : null)
    });

    res.status(201).json({ media });
  } catch (error) {
    console.error('Media upload error:', error);

    // Handle Neon DB connection errors
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({
        message: 'Database connection error. Please check your Neon DB connection.',
        error: 'Database temporarily unavailable'
      });
    }

    // Handle Cloudinary-specific errors
    if (error.http_code) {
      console.error('Cloudinary Error:', error.message);
      return res.status(error.http_code).json({
        message: 'Cloudinary upload failed',
        error: error.message,
        code: error.http_code
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors
      });
    }

    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB.'
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Invalid file field name.'
      });
    }

    res.status(500).json({
      message: 'Server error during upload',
      error: error.message
    });
  }
};

// Upload multiple files
exports.uploadMultipleMedia = async (req, res) => {
  try {
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const { folder = 'general' } = req.body;
    const uploadedMedia = [];
    const files = req.files.files;

    for (const file of files) {
      // Determine file type
      let fileType;
      if (file.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        fileType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        fileType = 'audio';
      } else {
        fileType = 'document';
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      // Generate thumbnail URL for images and videos
      let thumbnailUrl = null;
      if (fileType === 'image') {
        thumbnailUrl = cloudinary.url(result.public_id, {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        });
      } else if (fileType === 'video') {
        thumbnailUrl = cloudinary.url(result.public_id, {
          resource_type: 'video',
          width: 300,
          height: 300,
          crop: 'fill',
          start_offset: '0',
          end_offset: '1',
          format: 'jpg'
        });
      }

      // Create optimized URL for images
      let optimizedUrl = null;
      if (fileType === 'image') {
        optimizedUrl = cloudinary.url(result.public_id, {
          quality: 'auto',
          fetch_format: 'auto'
        });
      }

      // Create media record
      const media = await Media.create({
        url: result.secure_url,
        thumbnailUrl,
        optimizedUrl,
        publicId: result.public_id,
        type: fileType,
        mimeType: file.mimetype,
        originalFilename: file.originalname,
        displayName: file.originalname.split('.')[0],
        size: file.size,
        format: result.format,
        width: result.width,
        height: result.height,
        duration: result.duration,
        bitrate: result.bit_rate,
        frameRate: result.frame_rate,
        folder: folder,
        cdnUrl: result.secure_url,
        isOptimized: fileType === 'image',
        uploadedBy: req.admin ? req.admin.id : (req.user ? req.user.id : null)
      });

      uploadedMedia.push(media);
    }

    res.status(201).json({ media: uploadedMedia });
  } catch (error) {
    console.error('Multiple media upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all media with filters and pagination
exports.getAllMedia = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 24,
      type,
      folder,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add type filter if provided
    if (type) {
      whereClause.type = type;
    }

    // Add folder filter if provided
    if (folder) {
      whereClause.folder = folder;
    }

    // Add search filter if provided
    if (search) {
      whereClause[Op.or] = [
        { originalFilename: { [Op.iLike]: `%${search}%` } },
        { caption: { [Op.iLike]: `%${search}%` } },
        { altText: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Execute query
    const { count, rows } = await Media.findAndCountAll({
      where: whereClause,
      offset,
      limit: parseInt(limit),
      order: [[sortBy, sortOrder]]
    });

    res.status(200).json({
      totalMedia: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      media: rows
    });
  } catch (error) {
    console.error('Get all media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get media by ID
exports.getMediaById = async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    res.status(200).json({ media });
  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update media metadata
exports.updateMedia = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { folder, caption, altText, tags } = req.body;
    
    const media = await Media.findByPk(req.params.id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Update Cloudinary metadata if needed
    if (folder && folder !== media.folder) {
      await cloudinary.uploader.rename(
        media.publicId,
        `${folder}/${media.publicId.split('/').pop()}`,
        { resource_type: media.type === 'video' ? 'video' : 'image' }
      );
      
      // Update the public ID and URL
      const result = await cloudinary.api.resource(
        `${folder}/${media.publicId.split('/').pop()}`,
        { resource_type: media.type === 'video' ? 'video' : 'image' }
      );
      
      media.publicId = result.public_id;
      media.url = result.secure_url;
      media.folder = folder;
    }
    
    // Update local database record
    if (caption !== undefined) media.caption = caption;
    if (altText !== undefined) media.altText = altText;
    if (tags !== undefined) media.tags = tags;
    
    await media.save();
    
    res.status(200).json({ media });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type === 'video' ? 'video' : 'image'
    });
    
    // Delete from database
    await media.destroy();
    
    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get media folders (aggregate)
exports.getMediaFolders = async (req, res) => {
  try {
    const folders = await Media.findAll({
      attributes: ['folder', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['folder'],
      order: [['folder', 'ASC']]
    });
    
    res.status(200).json({ folders });
  } catch (error) {
    console.error('Get media folders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new folder
exports.createFolder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    
    // Create folder in Cloudinary
    await cloudinary.api.create_folder(name);
    
    res.status(201).json({ message: 'Folder created successfully', folder: name });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get media stats
exports.getMediaStats = async (req, res) => {
  try {
    const imageCount = await Media.count({ where: { type: 'image' } });
    const videoCount = await Media.count({ where: { type: 'video' } });
    const audioCount = await Media.count({ where: { type: 'audio' } });
    const documentCount = await Media.count({ where: { type: 'document' } });
    const totalCount = await Media.count();
    
    // Get total size
    const sizeResult = await Media.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('size')), 'totalSize']],
      raw: true
    });
    
    const totalSize = sizeResult.totalSize || 0;
    
    res.status(200).json({
      totalCount,
      imageCount,
      videoCount,
      audioCount,
      documentCount,
      totalSize
    });
  } catch (error) {
    console.error('Get media stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get media usage
exports.getMediaUsage = async (req, res) => {
  try {
    const mediaId = req.params.id;
    const media = await Media.findByPk(mediaId);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Find articles using this media
    const articles = await Article.findAll({
      where: {
        [Op.or]: [
          { featuredImage: media.url },
          { socialImage: media.url },
          { gallery: { [Op.like]: `%${media.url}%` } },
          { embedMedia: { [Op.like]: `%${media.url}%` } }
        ]
      },
      attributes: ['id', 'title', 'slug', 'status']
    });
    
    res.status(200).json({
      media,
      usage: {
        articles
      }
    });
  } catch (error) {
    console.error('Get media usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk tag media
exports.bulkTagMedia = async (req, res) => {
  try {
    const { mediaIds, tagIds } = req.body;
    
    if (!mediaIds || !mediaIds.length || !tagIds || !tagIds.length) {
      return res.status(400).json({ message: 'Media IDs and tag IDs are required' });
    }
    
    // Create relationships for each media and tag
    const relations = [];
    for (const mediaId of mediaIds) {
      for (const tagId of tagIds) {
        relations.push({
          mediaId,
          tagId
        });
      }
    }
    
    await MediaTagRelation.bulkCreate(relations, { ignoreDuplicates: true });
    
    res.status(200).json({ message: 'Media tagged successfully' });
  } catch (error) {
    console.error('Bulk tag media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Move media to folder
exports.moveMediaToFolder = async (req, res) => {
  try {
    const { mediaIds, folderId } = req.body;
    
    if (!mediaIds || !mediaIds.length) {
      return res.status(400).json({ message: 'Media IDs are required' });
    }
    
    // Check if folder exists
    if (folderId) {
      const folder = await MediaFolder.findByPk(folderId);
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
    }
    
    // Update media records
    await Media.update(
      { folderId: folderId || null },
      { where: { id: mediaIds } }
    );
    
    res.status(200).json({ message: 'Media moved successfully' });
  } catch (error) {
    console.error('Move media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search media with advanced filters
exports.searchMedia = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 24,
      search,
      type,
      folder,
      tags,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    // Add type filter if provided
    if (type) {
      whereClause.type = type;
    }
    
    // Add folder filter if provided
    if (folder) {
      whereClause.folder = folder;
    }
    
    // Add date range filter if provided
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
    }
    
    // Add search filter if provided
    if (search) {
      whereClause[Op.or] = [
        { originalFilename: { [Op.like]: `%${search}%` } },
        { caption: { [Op.like]: `%${search}%` } },
        { altText: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Include tags if provided
    const include = [];
    if (tags && tags.length > 0) {
      const tagArray = tags.split(',');
      include.push({
        model: MediaTag,
        through: MediaTagRelation,
        where: { id: tagArray },
        required: true
      });
    }
    
    // Execute query
    const { count, rows } = await Media.findAndCountAll({
      where: whereClause,
      include,
      offset,
      limit: parseInt(limit),
      order: [[sortBy, sortOrder]]
    });
    
    res.status(200).json({
      totalMedia: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      media: rows
    });
  } catch (error) {
    console.error('Search media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = exports;
// Enhanced Media Controller with Gallery, Optimization, and Advanced Features

// Optimize media
exports.optimizeMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { quality = 80, format = 'auto' } = req.body;
    
    const media = await Media.findByPk(id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    if (media.type !== 'image') {
      return res.status(400).json({ message: 'Only images can be optimized' });
    }
    
    // Generate optimized version using Cloudinary
    const optimizedUrl = cloudinary.url(media.publicId, {
      quality: quality,
      fetch_format: format,
      flags: 'progressive'
    });
    
    // Update media record
    await media.update({
      optimizedUrl,
      isOptimized: true,
      optimizationLevel: Math.round(quality / 10),
      processingStatus: 'completed'
    });
    
    res.json({
      success: true,
      message: 'Media optimized successfully',
      media,
      optimizedUrl
    });
  } catch (error) {
    console.error('Optimize media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk delete media
exports.bulkDeleteMedia = async (req, res) => {
  try {
    const { mediaIds } = req.body;
    
    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ message: 'Media IDs are required' });
    }
    
    const media = await Media.findAll({
      where: { id: mediaIds }
    });
    
    if (media.length === 0) {
      return res.status(404).json({ message: 'No media found' });
    }
    
    // Delete from Cloudinary
    const deletePromises = media.map(item => 
      cloudinary.uploader.destroy(item.publicId, {
        resource_type: item.type === 'video' ? 'video' : 'image'
      })
    );
    
    await Promise.all(deletePromises);
    
    // Delete from database
    await Media.destroy({
      where: { id: mediaIds }
    });
    
    res.json({
      success: true,
      message: `${media.length} media items deleted successfully`
    });
  } catch (error) {
    console.error('Bulk delete media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get enhanced media usage with detailed tracking
exports.getEnhancedMediaUsage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const media = await Media.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Get usage from MediaUsage table
    const usage = await MediaUsage.findAll({
      where: { mediaId: id, isActive: true },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
    
    // Find articles using this media (legacy support)
    const articles = await Article.findAll({
      where: {
        [Op.or]: [
          { featuredImage: media.url },
          { socialImage: media.url },
          { gallery: { [Op.like]: `%${media.url}%` } },
          { embedMedia: { [Op.like]: `%${media.url}%` } }
        ]
      },
      attributes: ['id', 'title', 'slug', 'status', 'publishedAt']
    });
    
    // Update access tracking
    await media.update({
      viewCount: media.viewCount + 1,
      lastAccessedAt: new Date()
    });
    
    res.json({
      success: true,
      media,
      usage: {
        tracked: usage,
        articles
      },
      stats: {
        totalUsage: usage.length + articles.length,
        viewCount: media.viewCount,
        downloadCount: media.downloadCount
      }
    });
  } catch (error) {
    console.error('Get enhanced media usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get storage statistics
exports.getStorageStats = async (req, res) => {
  try {
    const stats = await Media.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalFiles'],
        [sequelize.fn('SUM', sequelize.col('size')), 'totalSize'],
        [sequelize.fn('AVG', sequelize.col('size')), 'averageSize']
      ],
      where: { status: 'active' },
      raw: true
    });
    
    const typeStats = await Media.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('size')), 'totalSize']
      ],
      where: { status: 'active' },
      group: ['type'],
      raw: true
    });
    
    const folderStats = await Media.findAll({
      attributes: [
        'folder',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('size')), 'totalSize']
      ],
      where: { status: 'active' },
      group: ['folder'],
      order: [[sequelize.fn('SUM', sequelize.col('size')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    // Get optimization stats
    const optimizationStats = await Media.findAll({
      attributes: [
        'isOptimized',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { 
        status: 'active',
        type: 'image'
      },
      group: ['isOptimized'],
      raw: true
    });
    
    res.json({
      success: true,
      overall: {
        totalFiles: parseInt(stats.totalFiles) || 0,
        totalSize: parseInt(stats.totalSize) || 0,
        averageSize: Math.round(parseFloat(stats.averageSize)) || 0
      },
      byType: typeStats.map(stat => ({
        type: stat.type,
        count: parseInt(stat.count),
        totalSize: parseInt(stat.totalSize) || 0
      })),
      byFolder: folderStats.map(stat => ({
        folder: stat.folder,
        count: parseInt(stat.count),
        totalSize: parseInt(stat.totalSize) || 0
      })),
      optimization: {
        optimized: optimizationStats.find(s => s.isOptimized)?.count || 0,
        unoptimized: optimizationStats.find(s => !s.isOptimized)?.count || 0
      }
    });
  } catch (error) {
    console.error('Get storage stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Folder management
exports.createMediaFolder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, parentId, color, icon } = req.body;
    
    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Check if parent exists
    let parentFolder = null;
    let depth = 0;
    let path = slug;
    
    if (parentId) {
      parentFolder = await MediaFolder.findByPk(parentId);
      if (!parentFolder) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
      depth = parentFolder.depth + 1;
      path = `${parentFolder.path}/${slug}`;
    }
    
    const folder = await MediaFolder.create({
      name,
      slug,
      description,
      parentId,
      color,
      icon,
      depth,
      path,
      createdBy: req.admin ? req.admin.id : (req.user ? req.user.id : null)
    });
    
    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Create media folder error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Folder with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMediaFolderTree = async (req, res) => {
  try {
    const folders = await MediaFolder.findAll({
      where: { status: 'active' },
      order: [['path', 'ASC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'firstName', 'lastName']
        }
      ]
    });
    
    // Build tree structure
    const buildTree = (parentId = null) => {
      return folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          ...folder.toJSON(),
          children: buildTree(folder.id)
        }));
    };
    
    const tree = buildTree();
    
    // Get folder statistics
    const folderStats = await Promise.all(
      folders.map(async (folder) => {
        const mediaCount = await Media.count({
          where: { 
            folderId: folder.id,
            status: 'active'
          }
        });
        
        const totalSize = await Media.sum('size', {
          where: { 
            folderId: folder.id,
            status: 'active'
          }
        }) || 0;
        
        return {
          folderId: folder.id,
          mediaCount,
          totalSize
        };
      })
    );
    
    res.json({
      success: true,
      tree,
      statistics: folderStats
    });
  } catch (error) {
    console.error('Get media folder tree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateMediaFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, parentId } = req.body;
    
    const folder = await MediaFolder.findByPk(id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Update fields
    const updates = {};
    if (name !== undefined) {
      updates.name = name;
      updates.slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (parentId !== undefined) {
      if (parentId && parentId !== folder.parentId) {
        const parentFolder = await MediaFolder.findByPk(parentId);
        if (!parentFolder) {
          return res.status(404).json({ message: 'Parent folder not found' });
        }
        updates.parentId = parentId;
        updates.depth = parentFolder.depth + 1;
        updates.path = `${parentFolder.path}/${updates.slug || folder.slug}`;
      } else if (!parentId) {
        updates.parentId = null;
        updates.depth = 0;
        updates.path = updates.slug || folder.slug;
      }
    }
    
    updates.lastModifiedBy = req.admin ? req.admin.id : (req.user ? req.user.id : null);
    
    await folder.update(updates);
    
    res.json({
      success: true,
      message: 'Folder updated successfully',
      folder
    });
  } catch (error) {
    console.error('Update media folder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteMediaFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { moveMediaTo } = req.body; // Optional: where to move media
    
    const folder = await MediaFolder.findByPk(id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Check if folder has media
    const mediaCount = await Media.count({
      where: { folderId: id, status: 'active' }
    });
    
    if (mediaCount > 0) {
      if (moveMediaTo) {
        // Move media to another folder
        await Media.update(
          { folderId: moveMediaTo },
          { where: { folderId: id } }
        );
      } else {
        // Move media to root (no folder)
        await Media.update(
          { folderId: null },
          { where: { folderId: id } }
        );
      }
    }
    
    // Check if folder has subfolders
    const subfolderCount = await MediaFolder.count({
      where: { parentId: id, status: 'active' }
    });
    
    if (subfolderCount > 0) {
      // Move subfolders to parent or root
      await MediaFolder.update(
        { parentId: folder.parentId },
        { where: { parentId: id } }
      );
    }
    
    // Soft delete the folder
    await folder.update({ status: 'deleted' });
    
    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('Delete media folder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};