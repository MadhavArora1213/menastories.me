const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// All user routes require authentication
router.use(authMiddleware);

// Saved articles
router.get('/saved-articles', userController.getSavedArticles);
router.post('/saved-articles/:articleId/toggle', userController.toggleSaveArticle);

// Liked articles
router.get('/liked-articles', userController.getLikedArticles);
router.post('/liked-articles/:articleId/toggle', userController.toggleLikeArticle);

// Reading history
router.get('/reading-history', userController.getReadingHistory);
router.post('/articles/:articleId/read', userController.markArticleAsRead);

// User statistics
router.get('/stats', userController.getUserStats);

module.exports = router;