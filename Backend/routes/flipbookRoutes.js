const express = require('express');
const router = express.Router();
const flipbookController = require('../controllers/flipbookController');
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for flipbook uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'storage', 'flipbooks');
    // Ensure directory exists
    fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `flipbook-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for PDFs
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/x-pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
    }
  }
});

// Public routes (no authentication required)
router.get('/categories', flipbookController.getCategories);
router.get('/magazines', flipbookController.getFlipbookMagazines);
router.get('/magazines/:id', flipbookController.getFlipbookMagazineById);
router.get('/magazines/:id/pages', flipbookController.getFlipbookPages);
router.get('/magazines/:id/pages/:pageNumber', flipbookController.getFlipbookPage);
router.get('/magazines/:id/toc', flipbookController.getTableOfContents);
router.get('/search', flipbookController.searchInMagazine);

// Public download routes for free magazines
router.get('/download/:id', flipbookController.downloadFlipbook);
router.get('/magazines/:id/download', flipbookController.downloadFlipbook);

// Public page image routes (no authentication required)
router.get('/magazines/:id/pages/:pageNumber/image', async (req, res) => {
  try {
    const { id, pageNumber } = req.params;

    const page = await require('../models').FlipbookPage.findOne({
      where: { magazineId: id, pageNumber: parseInt(pageNumber) }
    });

    if (!page || !page.imagePath) {
      return res.status(404).json({ error: 'Page image not found' });
    }

    // Check if file exists
    if (!await fs.access(page.imagePath).then(() => true).catch(() => false)) {
      return res.status(404).json({ error: 'Image file not found on disk' });
    }

    // Serve the image with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Serve the image
    res.sendFile(page.imagePath);
  } catch (error) {
    console.error('Error serving page image:', error);
    res.status(500).json({ error: 'Failed to serve page image' });
  }
});

router.get('/magazines/:id/pages/:pageNumber/thumbnail', async (req, res) => {
  try {
    const { id, pageNumber } = req.params;

    const page = await require('../models').FlipbookPage.findOne({
      where: { magazineId: id, pageNumber: parseInt(pageNumber) }
    });

    if (!page || !page.thumbnailPath) {
      return res.status(404).json({ error: 'Page thumbnail not found' });
    }

    // Check if file exists
    if (!await fs.access(page.thumbnailPath).then(() => true).catch(() => false)) {
      return res.status(404).json({ error: 'Thumbnail file not found on disk' });
    }

    // Serve the thumbnail with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Serve the thumbnail
    res.sendFile(page.thumbnailPath);
  } catch (error) {
    console.error('Error serving page thumbnail:', error);
    res.status(500).json({ error: 'Failed to serve page thumbnail' });
  }
});

// Protected routes (admin authentication required)
router.use(adminAuthMiddleware);

// Admin-only routes
router.post('/magazines', flipbookController.createFlipbookMagazine);
router.put('/magazines/:id', upload.single('flipbook'), flipbookController.updateFlipbookMagazine);
router.delete('/magazines/:id', flipbookController.deleteFlipbookMagazine);

// Upload and processing (admin only)
router.post('/upload', (req, res, next) => {
  console.log('Upload route hit');
  next();
}, upload.single('flipbook'), flipbookController.uploadFlipbook);

// Table of contents
router.put('/magazines/:id/toc', flipbookController.updateTableOfContents);

// Analytics
router.get('/magazines/:id/analytics', flipbookController.getFlipbookAnalytics);

// Bulk operations
router.put('/bulk', flipbookController.bulkUpdateMagazines);
router.delete('/bulk', flipbookController.bulkDeleteMagazines);

// Admin download route (original protected route)
router.get('/admin/download/:id', flipbookController.downloadFlipbook);


// Bookmarks (user-specific)
router.post('/magazines/:id/bookmark', async (req, res) => {
  // Add bookmark
  res.json({ message: 'Bookmarking not implemented yet' });
});

router.delete('/magazines/:id/bookmark', async (req, res) => {
  // Remove bookmark
  res.json({ message: 'Bookmark removal not implemented yet' });
});

router.get('/bookmarks', async (req, res) => {
  // Get user bookmarks
  res.json({ message: 'Bookmarks retrieval not implemented yet' });
});

// Annotations
router.post('/magazines/:id/pages/:pageNumber/annotations', async (req, res) => {
  // Add annotation
  res.json({ message: 'Annotations not implemented yet' });
});

router.get('/magazines/:id/pages/:pageNumber/annotations', async (req, res) => {
  // Get page annotations
  res.json({ message: 'Annotations retrieval not implemented yet' });
});

router.delete('/annotations/:annotationId', async (req, res) => {
  // Delete annotation
  res.json({ message: 'Annotation deletion not implemented yet' });
});

// Sharing
router.post('/magazines/:id/share', async (req, res) => {
  // Share magazine
  res.json({ message: 'Sharing not implemented yet' });
});

// Downloads - Page downloads (admin only for now)
router.get('/magazines/:id/pages/:pageNumber/download', flipbookController.downloadFlipbookPage);

// Reprocessing
router.post('/reprocess-zero-pages', flipbookController.reprocessZeroPageMagazines);
router.get('/identify-corrupted', flipbookController.identifyCorruptedPDFs);
router.post('/fix-file-paths', flipbookController.fixFilePaths);
router.post('/regenerate-pdfs', flipbookController.regeneratePDFs);

// Reading progress
router.post('/magazines/:id/progress', async (req, res) => {
  // Update reading progress
  res.json({ message: 'Progress tracking not implemented yet' });
});

router.get('/magazines/:id/progress', async (req, res) => {
  // Get reading progress
  res.json({ message: 'Progress retrieval not implemented yet' });
});

// Statistics and reports
router.get('/stats', async (req, res) => {
  try {
    const { FlipbookMagazine } = require('../models');

    // Get basic statistics
    const totalMagazines = await FlipbookMagazine.count();
    const totalViews = await FlipbookMagazine.sum('viewCount') || 0;
    const totalDownloads = await FlipbookMagazine.sum('downloadCount') || 0;
    const processingCount = await FlipbookMagazine.count({
      where: { processingStatus: 'processing' }
    });

    const stats = {
      totalMagazines,
      totalViews,
      totalDownloads,
      processingCount
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching flipbook stats:', error);
    res.status(500).json({ error: 'Failed to fetch flipbook statistics' });
  }
});

router.get('/reports/popular', async (req, res) => {
  try {
    const { FlipbookMagazine } = require('../models');
    const popular = await FlipbookMagazine.findAll({
      where: { isPublished: true },
      order: [['viewCount', 'DESC']],
      limit: 10,
      attributes: ['id', 'title', 'viewCount', 'downloadCount', 'coverImageUrl']
    });
    res.json(popular);
  } catch (error) {
    console.error('Error fetching popular magazines:', error);
    res.status(500).json({ error: 'Failed to fetch popular magazines' });
  }
});

router.get('/reports/engagement', async (req, res) => {
  try {
    const { FlipbookMagazine } = require('../models');
    const engagement = await FlipbookMagazine.findAll({
      where: { isPublished: true },
      order: [['viewCount', 'DESC']],
      limit: 10,
      attributes: ['id', 'title', 'viewCount', 'downloadCount', 'shareCount', 'averageReadTime']
    });
    res.json(engagement);
  } catch (error) {
    console.error('Error fetching engagement reports:', error);
    res.status(500).json({ error: 'Failed to fetch engagement reports' });
  }
});

// Categories and tags
router.get('/tags', async (req, res) => {
  try {
    const tags = await require('../models').Tag.findAll({
      attributes: ['id', 'name', 'slug'],
      order: [['name', 'ASC']]
    });
    res.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Archive and collections
router.get('/archive', async (req, res) => {
  try {
    const { FlipbookMagazine } = require('../models');
    const archive = await FlipbookMagazine.findAll({
      where: { isPublished: true },
      order: [['publishedAt', 'DESC']],
      limit: 50,
      attributes: ['id', 'title', 'publishedAt', 'coverImageUrl', 'category']
    });
    res.json(archive);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ error: 'Failed to fetch archive' });
  }
});

router.get('/collections', async (req, res) => {
  try {
    const { FlipbookMagazine } = require('../models');
    const collections = await FlipbookMagazine.findAll({
      where: { isPublished: true, isFeatured: true },
      order: [['publishedAt', 'DESC']],
      limit: 20,
      attributes: ['id', 'title', 'coverImageUrl', 'category', 'magazineType']
    });
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size allowed is 100MB.'
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: error.message
    });
  }

  console.error('Flipbook route error:', error);
  res.status(500).json({
    error: 'An error occurred while processing the flipbook request.'
  });
});

module.exports = router;