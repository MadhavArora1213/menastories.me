const express = require('express');
const router = express.Router();
const VideoArticleController = require('../controllers/videoArticleController');
const videoArticleController = new VideoArticleController();
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const { check } = require('express-validator');
const multer = require('multer');

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

// Get all video articles with filters and pagination (public for dashboard)
router.get('/', videoArticleController.getAllVideoArticles);

// Get single video article by ID or slug (public for dashboard)
router.get('/:id', videoArticleController.getVideoArticle);

// Apply admin authentication to write operations
router.use(adminAuthMiddleware);

// Create new video article
router.post('/', upload.single('featured_image'), [
  check('title', 'Title is required and must be between 5-255 characters').isLength({ min: 5, max: 255 }),
  check('content', 'Content is required').notEmpty(),
  check('youtube_url', 'Valid YouTube URL is required').isURL(),
  check('category_id', 'Category ID is required').notEmpty(),
  check('primary_author_id', 'Author ID is required').notEmpty()
], videoArticleController.createVideoArticle);

// Update video article
router.put('/:id', upload.single('featured_image'), (req, res, next) => {
  console.log('=== VIDEO ARTICLE UPDATE ROUTE HIT ===');
  console.log('Route params:', req.params);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request body keys:', Object.keys(req.body || {}));
  console.log('Request file:', req.file ? 'present' : 'not present');
  next();
}, videoArticleController.updateVideoArticle);

// Delete video article
router.delete('/:id', videoArticleController.deleteVideoArticle);

// Change video article status
router.patch('/:id/status', [
  check('status', 'Status is required').isIn(['draft', 'pending_review', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'rejected'])
], videoArticleController.changeVideoArticleStatus);

// Get all authors
router.get('/authors/all', videoArticleController.getAllAuthors);

// Get single author by ID
router.get('/authors/:id', videoArticleController.getAuthor);

// Create new author
router.post('/authors', upload.single('profile_image'), [
  check('name', 'Name is required').notEmpty(),
  check('email', 'Valid email is required').isEmail()
], videoArticleController.createAuthor);

// Update author
router.put('/authors/:id', upload.single('profile_image'), videoArticleController.updateAuthor);

// Get filtered categories
router.get('/categories/filtered', videoArticleController.getFilteredCategories);

// Get filtered authors
router.get('/authors/filtered', videoArticleController.getFilteredAuthors);

// Get tags by category
router.get('/tags/category/:categoryId', videoArticleController.getTagsByCategory);

// Get video articles by category
// router.get('/categories/:categoryId/articles', videoArticleController.getVideoArticlesByCategory);

// Assign editor to video article
// router.post('/:id/assign-editor', [
//   check('editorId', 'Editor ID is required').notEmpty()
// ], videoArticleController.assignEditor);

// Schedule video article for publication
// router.post('/:id/schedule', [
//   check('scheduled_publish_date', 'Scheduled publish date is required').isISO8601()
// ], videoArticleController.scheduleVideoArticle);

// Publish video article
router.post('/:id/publish', videoArticleController.publishVideoArticle);

// Unpublish video article
// router.post('/:id/unpublish', videoArticleController.unpublishVideoArticle);

// Get video article analytics
// router.get('/:id/analytics', videoArticleController.getVideoArticleAnalytics);

// Track video article view
// router.post('/:id/track-view', videoArticleController.trackView);

// Get workflow history
// router.get('/:id/workflow-history', videoArticleController.getWorkflowHistory);

// Comments routes
router.get('/:id/comments', videoArticleController.getComments);
router.post('/:id/comments', videoArticleController.addComment);

// Track view
router.post('/:id/track-view', videoArticleController.trackView);

// Tags routes
router.get('/tags/all', videoArticleController.getAllTags);

// RSS feed
router.get('/rss', videoArticleController.getRSSFeed);

module.exports = router;