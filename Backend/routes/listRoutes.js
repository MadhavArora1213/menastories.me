const express = require('express');
const router = express.Router();
const ListController = require('../controllers/listController');
const listController = new ListController();
const PowerListController = require('../controllers/powerListController');
const powerListController = new PowerListController();
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const adminAuth = adminAuthMiddleware;
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = '/var/www/menastories/menastories.me/Backend/storage/images/';
    if (file.fieldname === 'docx_file') {
      uploadPath = '/var/www/menastories/menastories.me/Backend/storage/docs/';
    }

    // Ensure directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('File filter check:', file.fieldname, file.mimetype);
    if (file.fieldname === 'docx_file') {
      if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.mimetype === 'text/plain' ||
          file.originalname.toLowerCase().endsWith('.txt')) {
        cb(null, true);
      } else {
        cb(new Error('Only .docx and .txt files are allowed for document upload'));
      }
    } else if (file.fieldname === 'featured_image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for featured image'));
      }
    } else {
      cb(null, true); // Allow other files
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB for all files
  }
});

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log('=== Route Level Middleware START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Original req.body:', req.body);
  console.log('Original req.files:', req.files);
  next();
};

// Power List routes (must be defined before generic routes)
router.get('/power-lists', powerListController.getAllPowerLists);
router.get('/power-lists/:id', powerListController.getPowerList);
router.post('/power-lists', adminAuth, upload.any(), powerListController.createPowerList);
router.put('/power-lists/:id', adminAuth, upload.any(), powerListController.updatePowerList);
router.delete('/power-lists/:id', adminAuth, powerListController.deletePowerList);

// Power List entries routes
router.get('/power-lists/:listId/entries', powerListController.getPowerListEntries);
router.get('/power-lists/entries/:id', powerListController.getPowerListEntry);
router.post('/power-lists/:listId/entries', adminAuth, upload.single('photo'), powerListController.createPowerListEntry);
router.put('/power-lists/entries/:id', adminAuth, upload.single('photo'), powerListController.updatePowerListEntry);
router.delete('/power-lists/entries/:id', adminAuth, powerListController.deletePowerListEntry);

// Power List DOCX parsing route
router.post('/power-lists/:listId/parse-docx', adminAuth, upload.single('docx_file'), powerListController.parseDocxFile);

// List CRUD routes
router.get('/', listController.getAllLists);
router.get('/:id', listController.getList);

// Create list route with proper multer middleware
router.post('/',
  debugMiddleware,
  adminAuth,
  upload.any(),
  (req, res, next) => {
    console.log('After route multer - req.body:', req.body);
    console.log('After route multer - req.files:', req.files);

    // Process form data - handle arrays from FormData
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (Array.isArray(req.body[key]) && req.body[key].length === 1) {
          req.body[key] = req.body[key][0];
        }
      });
    }

    console.log('Final processed req.body:', req.body);
    console.log('Final processed req.files:', req.files);
    next();
  },
  listController.createList
);

router.put('/:id', adminAuth, upload.any(), listController.updateList);
router.delete('/:id', adminAuth, listController.deleteList);

// List entries routes
router.get('/:listId/entries', listController.getListEntries);
router.get('/entries/:id', listController.getListEntry);
router.post('/:listId/entries', adminAuth, upload.any(), listController.createListEntry);
router.put('/entries/:id', adminAuth, upload.any(), listController.updateListEntry);
router.delete('/entries/:id', adminAuth, listController.deleteListEntry);

// DOCX parsing route
router.post('/:listId/parse-docx', adminAuth, upload.any(), listController.parseDocxFile);

// RSS feed route for lists
router.get('/rss/lists', async (req, res) => {
  try {
    const rssService = require('../services/rssService');
    const rssContent = await rssService.getRSSFeed();
    res.set('Content-Type', 'application/rss+xml');
    res.send(rssContent);
  } catch (error) {
    console.error('Get lists RSS feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lists RSS feed',
      error: error.message
    });
  }
});

// Test route for middleware
router.post('/test', debugMiddleware, (req, res) => {
  res.status(200).json({ success: true });
});

module.exports = router;