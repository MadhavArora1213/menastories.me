const express = require('express');
const router = express.Router();
const ArticleController = require('../controllers/articleController');
const articleController = new ArticleController();
const { adminAuthMiddleware, requireContentAdmin } = require('../middleware/adminAuth');
const { commentAuthMiddleware } = require('../middleware/commentAuth');
const adminAuth = adminAuthMiddleware;
const multer = require('multer');
const BulkUploadService = require('../services/bulkUploadService');
const bulkUploadService = new BulkUploadService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + require('path').extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// RSS feed route (must come before parameterized routes)
router.get('/rss', articleController.getRSSFeed);

// Article CRUD routes
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticle);
router.post('/', adminAuth, upload.single('featured_image'), articleController.createArticle);
router.put('/:id', adminAuth, upload.single('featured_image'), articleController.updateArticle);
router.delete('/:id', adminAuth, articleController.deleteArticle);

// Author routes
router.get('/authors/all', articleController.getAllAuthors);
router.get('/authors/filtered', articleController.getFilteredAuthors);
router.post('/authors', adminAuth, upload.single('profile_image'), articleController.createAuthor);
router.get('/authors/:id', articleController.getAuthor);
router.put('/authors/:id', adminAuth, upload.single('profile_image'), articleController.updateAuthor);

// Category routes
router.get('/categories/filtered', articleController.getFilteredCategories);

// Category and tags routes
router.get('/category/:categoryId/tags', articleController.getTagsByCategory);
router.get('/category/:categoryId', articleController.getArticlesByCategory);

// Workflow routes
router.post('/:id/status', adminAuth, articleController.changeArticleStatus);
router.get('/:id/workflow-history', adminAuth, articleController.getWorkflowHistory);
router.post('/:id/assign-editor', adminAuth, articleController.assignEditor);

// Get suggested articles based on taxonomy
router.get('/:id/suggested', articleController.getSuggestedArticles);

// Publishing routes
router.post('/:id/schedule', adminAuth, articleController.scheduleArticle);
router.post('/:id/publish', adminAuth, articleController.publishArticle);
router.post('/:id/unpublish', adminAuth, articleController.unpublishArticle);

// Analytics routes
router.get('/:id/analytics', adminAuth, articleController.getArticleAnalytics);
router.post('/:id/view', articleController.trackView);

// Comment routes - use comment authentication for public comment operations
router.get('/:id/comments', articleController.getArticleComments);
router.post('/:id/comments', commentAuthMiddleware, articleController.createComment);
router.put('/:id/comments/:commentId', commentAuthMiddleware, articleController.updateComment);
router.delete('/:id/comments/:commentId', commentAuthMiddleware, articleController.deleteComment);

// Bulk upload routes
router.post('/bulk-upload', adminAuth, requireContentAdmin, async (req, res) => {
  try {
    const { driveLink, categoryId, authorId } = req.body;
    const userId = req.admin?.id;

    console.log('🔄 BULK UPLOAD REQUEST RECEIVED:');
    console.log('📋 Drive Link:', driveLink);
    console.log('📂 Category ID:', categoryId);
    console.log('👤 Author ID:', authorId);
    console.log('👨‍💼 User ID:', userId);

    // Validate required fields
    if (!driveLink) {
      console.error('❌ Validation Error: Google Drive link is required');
      return res.status(400).json({
        success: false,
        message: 'Google Drive link is required',
        logs: ['❌ Validation Error: Google Drive link is required']
      });
    }

    console.log('✅ Validation passed, starting bulk upload process...');

    // Process bulk upload
    const results = await bulkUploadService.processBulkUpload(driveLink, {
      categoryId,
      authorId,
      createdBy: userId
    });

    console.log('📊 BULK UPLOAD COMPLETED:');
    console.log(`✅ Successful: ${results.success.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    console.log(`📁 Total processed: ${results.processed}/${results.total}`);

    const response = {
      success: results.errors.length === 0 && results.success.length > 0,
      message: `Bulk upload completed. ${results.success.length} articles uploaded successfully, ${results.errors.length} errors.`,
      data: {
        summary: {
          total: results.total,
          processed: results.processed,
          successful: results.success.length,
          errors: results.errors.length
        },
        success: results.success,
        errors: results.errors,
        logs: results.logs
      }
    };

    // Return appropriate status code
    const statusCode = results.errors.length > 0 ? (results.success.length > 0 ? 207 : 400) : 200;
    res.status(statusCode).json(response);

  } catch (error) {
    console.error('💥 Critical bulk upload error:', error);
    console.error('Stack trace:', error.stack);

    res.status(500).json({
      success: false,
      message: 'Failed to process bulk upload',
      error: error.message,
      stack: error.stack,
      logs: [
        '💥 Critical bulk upload error occurred',
        `Error: ${error.message}`,
        `Stack: ${error.stack}`
      ]
    });
  }
});

// Get bulk upload progress (placeholder for future implementation)
router.get('/bulk-upload/progress/:uploadId', adminAuth, (req, res) => {
  // This would be implemented with WebSocket or polling for real-time progress
  res.json({
    success: true,
    message: 'Progress tracking not yet implemented',
    data: { status: 'completed' }
  });
});

module.exports = router;