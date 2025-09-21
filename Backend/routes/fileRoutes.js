const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authMiddleware } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules
const fileUploadValidation = [
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('tags').optional().isJSON().withMessage('Tags must be valid JSON')
];

const fileUpdateValidation = [
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('tags').optional().isJSON().withMessage('Tags must be valid JSON'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
];

// Routes

// POST /api/files/upload - Upload a file
router.post('/upload',
  authMiddleware,
  fileController.uploadFile
);

// GET /api/files - Get all files (with RBAC filtering)
router.get('/',
  authMiddleware,
  fileController.getFiles
);

// GET /api/files/stats - Get file statistics
router.get('/stats',
  authMiddleware,
  fileController.getFileStats
);

// GET /api/files/:id - Get file by ID
router.get('/:id',
  authMiddleware,
  fileController.getFileById
);

// GET /api/files/:id/download - Download file
router.get('/:id/download',
  authMiddleware,
  fileController.downloadFile
);

// PUT /api/files/:id - Update file metadata
router.put('/:id',
  authMiddleware,
  fileUpdateValidation,
  fileController.updateFile
);

// DELETE /api/files/:id - Delete file
router.delete('/:id',
  authMiddleware,
  fileController.deleteFile
);

module.exports = router;