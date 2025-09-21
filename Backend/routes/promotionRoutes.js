const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authMiddleware, authorize } = require('../middleware/adminAuth');

// Get promoted content
router.get('/content', authMiddleware, promotionController.getPromotedContent);

// Update article promotion
router.patch('/article/:id', [
  authMiddleware,
  authorize('Master Admin', 'Content Admin', 'Editor-in-Chief')
], promotionController.updateArticlePromotion);

// Campaign routes
router.get('/campaigns', authMiddleware, promotionController.getAllCampaigns);
router.post('/campaigns', [
  authMiddleware,
  authorize('Master Admin', 'Content Admin', 'Editor-in-Chief')
], promotionController.createCampaign);

module.exports = router;