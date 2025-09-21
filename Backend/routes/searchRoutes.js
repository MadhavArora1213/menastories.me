const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { adminAuthMiddleware: authMiddleware, requireAdminRole: authorize } = require('../middleware/adminAuth');
const { check } = require('express-validator');

// Public routes
// Global search with advanced filtering
router.get('/global', searchController.globalSearch);

// Get search suggestions
router.get('/suggestions', searchController.getSearchSuggestions);

// Get available filters
router.get('/filters', searchController.getFilters);

// Protected routes (require authentication)
// Save search
router.post('/save', [
  authMiddleware,
  check('name').notEmpty().withMessage('Search name is required'),
  check('query').notEmpty().withMessage('Search query is required'),
  check('isPublic').optional().isBoolean()
], searchController.saveSearch);

// Get saved searches
router.get('/saved', authMiddleware, searchController.getSavedSearches);

// Delete saved search
router.delete('/saved/:id', authMiddleware, searchController.deleteSavedSearch);

// Admin only routes
// Get search analytics
router.get('/analytics', [
  authMiddleware,
  authorize('admin', 'editor')
], searchController.getSearchAnalytics);

module.exports = router;