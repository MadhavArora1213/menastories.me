const express = require('express');
const router = express.Router();
const comprehensiveAnalyticsController = require('../controllers/comprehensiveAnalyticsController');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

// Public routes for tracking analytics events
router.post('/track', comprehensiveAnalyticsController.trackEvent);

// Admin-only routes for analytics dashboard and reports
router.get('/dashboard', authMiddleware, requireAdmin, comprehensiveAnalyticsController.getDashboardData);
router.get('/report', authMiddleware, requireAdmin, comprehensiveAnalyticsController.getAnalyticsReport);

// Specific analytics endpoints
router.get('/website/stats', authMiddleware, requireAdmin, async (req, res) => {
  // Implementation for website-specific stats
});

router.get('/engagement/stats', authMiddleware, requireAdmin, async (req, res) => {
  // Implementation for engagement-specific stats
});

router.get('/content/:type/stats', authMiddleware, requireAdmin, async (req, res) => {
  // Implementation for content-type specific stats
});

router.get('/realtime/stats', authMiddleware, requireAdmin, async (req, res) => {
  // Implementation for real-time stats
});

module.exports = router;