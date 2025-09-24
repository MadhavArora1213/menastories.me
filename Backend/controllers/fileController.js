const { File, User, Role } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { validationResult } = require('express-validator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/files');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain', 'text/csv',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-rar-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Also create an upload middleware that accepts 'image' field for frontend compatibility
const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload file
exports.uploadFile = [
  upload.single('file'), // Also handles 'image' field via multer's field name flexibility
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { isPublic, description, category, tags } = req.body;
      const userId = req.user.id;

      // Check if user has permission to upload files
      const userRole = req.user.role?.name;
      const allowedRoles = ['Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers'];

      if (!allowedRoles.includes(userRole)) {
        // Clean up uploaded file
        await fs.unlink(req.file.path);
        return res.status(403).json({
          message: 'Access denied. Insufficient permissions to upload files.',
          requiredRoles: allowedRoles
        });
      }

      // Create file record
      const file = await File.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/files/${req.file.filename}`,
        isPublic: isPublic === 'true' || isPublic === true,
        uploadedBy: userId,
        description: description || null,
        category: category || null,
        tags: tags ? JSON.parse(tags) : [],
        metadata: {
          originalName: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          size: req.file.size,
          uploadDate: new Date()
        }
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          size: file.size,
          url: file.url,
          isPublic: file.isPublic,
          uploadedBy: file.uploadedBy,
          createdAt: file.createdAt
        }
      });
    } catch (error) {
      console.error('File upload error:', error);

      // Clean up uploaded file if it exists
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }

      res.status(500).json({ message: 'Server error during file upload' });
    }
  }
];

// Upload image (for frontend compatibility - simpler response format)
exports.uploadImage = [
  uploadImage.single('featured_image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      // Return simple response format expected by frontend
      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          url: `/uploads/files/${req.file.filename}`
        }
      });
    } catch (error) {
      console.error('Image upload error:', error);

      // Clean up uploaded file if it exists
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to upload file'
      });
    }
  }
];

// Get all files (with RBAC)
exports.getFiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, isPublic, userId } = req.query;
    const offset = (page - 1) * limit;
    const userId_req = req.user.id;
    const userRole = req.user.role?.name;

    const whereClause = { isActive: true };

    // Apply filters based on user role and permissions
    if (userRole === 'Master Admin' || userRole === 'Webmaster' || userRole === 'Content Admin') {
      // Admins can see all files
    } else if (['Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers'].includes(userRole)) {
      // Moderators can see public files and their own files
      whereClause[require('sequelize').Op.or] = [
        { isPublic: true },
        { uploadedBy: userId_req }
      ];
    } else {
      // Regular users can only see their own files
      whereClause.uploadedBy = userId_req;
    }

    // Additional filters
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { originalName: { [require('sequelize').Op.like]: `%${search}%` } },
        { description: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic === 'true';
    }

    if (userId && (userRole === 'Master Admin' || userRole === 'Webmaster' || userRole === 'Content Admin')) {
      whereClause.uploadedBy = userId;
    }

    const { count, rows } = await File.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'email']
      }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['path'] } // Don't expose file paths
    });

    res.json({
      files: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get file by ID
exports.getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role?.name;

    const file = await File.findByPk(id, {
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'email']
      }],
      attributes: { exclude: ['path'] }
    });

    if (!file || !file.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check access permissions
    if (!file.canBeAccessedBy(userId, userRole)) {
      return res.status(403).json({
        message: 'Access denied. You do not have permission to view this file.'
      });
    }

    // Increment download count for access tracking
    await file.incrementDownloadCount();

    res.json({ file });
  } catch (error) {
    console.error('Get file by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role?.name;

    const file = await File.findByPk(id);

    if (!file || !file.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if file is expired
    if (file.isExpired()) {
      return res.status(410).json({ message: 'File has expired' });
    }

    // Check access permissions
    if (!file.canBeAccessedBy(userId, userRole)) {
      return res.status(403).json({
        message: 'Access denied. You do not have permission to download this file.'
      });
    }

    // Check if file exists on disk
    try {
      await fs.access(file.path);
    } catch (error) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Increment download count
    await file.incrementDownloadCount();

    // Set appropriate headers
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.size);

    // Stream file
    const fileStream = require('fs').createReadStream(file.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update file metadata
exports.updateFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { description, category, tags, isPublic } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role?.name;

    const file = await File.findByPk(id);

    if (!file || !file.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check modification permissions
    if (!file.canBeModifiedBy(userId, userRole)) {
      return res.status(403).json({
        message: 'Access denied. You do not have permission to modify this file.'
      });
    }

    // Update fields
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = JSON.parse(tags);
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    await file.update(updateData);

    res.json({
      message: 'File updated successfully',
      file: {
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        description: file.description,
        category: file.category,
        tags: file.tags,
        isPublic: file.isPublic,
        updatedAt: file.updatedAt
      }
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role?.name;

    const file = await File.findByPk(id);

    if (!file || !file.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check deletion permissions
    if (!file.canBeDeletedBy(userId, userRole)) {
      return res.status(403).json({
        message: 'Access denied. You do not have permission to delete this file.'
      });
    }

    // Soft delete by marking as inactive
    await file.update({ isActive: false });

    // Optionally, you could also delete the physical file
    // try {
    //   await fs.unlink(file.path);
    // } catch (error) {
    //   console.error('Error deleting physical file:', error);
    // }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get file statistics
exports.getFileStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role?.name;

    let whereClause = { isActive: true };

    // Apply role-based filtering
    if (!['Master Admin', 'Webmaster', 'Content Admin'].includes(userRole)) {
      if (['Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers'].includes(userRole)) {
        whereClause[require('sequelize').Op.or] = [
          { isPublic: true },
          { uploadedBy: userId }
        ];
      } else {
        whereClause.uploadedBy = userId;
      }
    }

    const stats = await File.findAll({
      where: whereClause,
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalFiles'],
        [require('sequelize').fn('SUM', require('sequelize').col('size')), 'totalSize'],
        [require('sequelize').fn('SUM', require('sequelize').col('downloadCount')), 'totalDownloads']
      ],
      raw: true
    });

    res.json({
      stats: stats[0] || { totalFiles: 0, totalSize: 0, totalDownloads: 0 }
    });
  } catch (error) {
    console.error('Get file stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadFile: exports.uploadFile,
  uploadImage: exports.uploadImage,
  getFiles: exports.getFiles,
  getFileById: exports.getFileById,
  downloadFile: exports.downloadFile,
  updateFile: exports.updateFile,
  deleteFile: exports.deleteFile,
  getFileStats: exports.getFileStats
};