const express = require('express');
const router = express.Router();
const specialFeaturesController = require('../controllers/specialFeaturesController');
const metricsController = require('../controllers/metricsController');
const tagController = require('../controllers/tagController');
const { adminAuthMiddleware: authMiddleware, requireAdminRole: authorize } = require('../middleware/adminAuth');

// Special Features routes
router.get('/', specialFeaturesController.getAllSpecialFeatures);
router.post('/', [authMiddleware, authorize('Master Admin', 'Content Admin')], specialFeaturesController.createSpecialFeature);

// Trending content routes
router.get('/trending', specialFeaturesController.getTrendingContent);
router.post('/editors-picks', [authMiddleware, authorize('Master Admin', 'Content Admin', 'Editor-in-Chief')], specialFeaturesController.addToEditorsPicks);

// Metrics tracking routes
router.post('/metrics/view', metricsController.trackView);
router.post('/metrics/share', metricsController.trackShare);
router.post('/metrics/comment', metricsController.trackComment);

// Tags routes
router.get('/tags', tagController.getAllTags);
router.post('/tags', [authMiddleware, authorize('Master Admin', 'Content Admin', 'Editor-in-Chief')], tagController.createTag);
router.post('/tags/content', [authMiddleware, authorize('Master Admin', 'Content Admin', 'Editor-in-Chief')], tagController.addTagsToContent);
router.delete('/tags/content', [authMiddleware, authorize('Master Admin', 'Content Admin', 'Editor-in-Chief')], tagController.removeTagFromContent);
router.get('/tags/:tagSlug/content', tagController.getContentByTag);

module.exports = router;