const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { adminAuthMiddleware: authenticateAdmin } = require('../middleware/adminAuth');
const { validateTag } = require('../middleware/validators');

// Public routes
router.get('/', tagController.getAllTags);
router.get('/type/:type', tagController.getTagsByType);
router.get('/:id', tagController.getTagById);
router.get('/content/:tagSlug', tagController.getContentByTag);

// Protected routes - require admin authentication
router.post('/', authenticateAdmin, validateTag, tagController.createTag);
router.put('/:id', authenticateAdmin, validateTag, tagController.updateTag);
router.delete('/:id', authenticateAdmin, tagController.deleteTag);
router.delete('/:id/force', authenticateAdmin, tagController.forceDeleteTag);

// Tag-Content relationship management
router.post('/content', authenticateAdmin, tagController.addTagsToContent);
router.delete('/content', authenticateAdmin, tagController.removeTagFromContent);

module.exports = router;