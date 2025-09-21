const express = require('express');
const router = express.Router();
const MediaKitController = require('../controllers/mediaKitController');
const mediaKitController = new MediaKitController();
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const adminAuth = adminAuthMiddleware;

// Media kit CRUD routes
router.get('/', mediaKitController.getAllMediaKits);
router.get('/:id', mediaKitController.getMediaKit);
router.post('/', adminAuth, mediaKitController.createMediaKit);
router.put('/:id', adminAuth, mediaKitController.updateMediaKit);
router.delete('/:id', adminAuth, mediaKitController.deleteMediaKit);

// Analytics routes
router.post('/:id/view', mediaKitController.trackView);
router.post('/:id/download', mediaKitController.trackDownload);

module.exports = router;