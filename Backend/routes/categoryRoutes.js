const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { adminAuthMiddleware: authenticateAdmin } = require('../middleware/adminAuth');
const { validateCategory } = require('../middleware/validators');
const { upload } = require('../services/imageUploadService');

// Public routes (if any)
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes - require admin authentication
router.post('/', authenticateAdmin, upload.single('image'), validateCategory, categoryController.createCategory);
router.put('/:id', authenticateAdmin, validateCategory, categoryController.updateCategory);
router.delete('/:id', authenticateAdmin, categoryController.deleteCategory);

// Additional category management routes
router.patch('/:id/status', authenticateAdmin, categoryController.toggleCategoryStatus);
router.patch('/:id/design', authenticateAdmin, categoryController.updateCategoryDesign);

module.exports = router;
