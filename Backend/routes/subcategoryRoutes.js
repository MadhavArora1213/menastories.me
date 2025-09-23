const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const { adminAuthMiddleware: authenticateAdmin } = require('../middleware/adminAuth');
const { validateSubcategory } = require('../middleware/validators');
const { upload } = require('../services/imageUploadService');

// Public routes
router.get('/', subcategoryController.getAllSubcategories);
router.get('/stats', subcategoryController.getSubcategoryStatistics);
router.get('/category/:categoryId', subcategoryController.getSubcategoriesByCategory);
router.get('/:id', subcategoryController.getSubcategoryById);

// Protected routes - require admin authentication
router.post('/', authenticateAdmin, upload.single('image'), validateSubcategory, subcategoryController.createSubcategory);
router.put('/:id', authenticateAdmin, upload.single('image'), validateSubcategory, subcategoryController.updateSubcategory);
router.delete('/:id', authenticateAdmin, subcategoryController.deleteSubcategory);

// Additional subcategory management routes
router.patch('/:id/status', authenticateAdmin, subcategoryController.toggleSubcategoryStatus);

module.exports = router;