const express = require('express');
const router = express.Router();
const DownloadController = require('../controllers/downloadController');
const downloadController = new DownloadController();
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const adminAuth = adminAuthMiddleware;

// Download CRUD routes
router.get('/', downloadController.getAllDownloads);
router.get('/:id', downloadController.getDownload);
router.post('/', adminAuth, downloadController.uploadMiddleware(), downloadController.createDownload);
router.put('/:id', adminAuth, downloadController.uploadMiddleware(), downloadController.updateDownload);
router.delete('/:id', adminAuth, downloadController.deleteDownload);

// File download route
router.get('/:id/download', downloadController.downloadFile);

module.exports = router;