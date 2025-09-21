const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { adminAuthMiddleware } = require('../middleware/adminAuth');

// Serve images from storage directory
router.get('/articles/:articleId/:filename', (req, res) => {
  try {
    const { articleId, filename } = req.params;
    const imagePath = path.join('/var/www/menastories/menastories.me/Backend/storage/images/articles', articleId, filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the file
    const fileStream = fs.createReadStream(imagePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      res.status(500).json({ message: 'Error serving image' });
    });

  } catch (error) {
    console.error('Image serving error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve general images
router.get('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join('/var/www/menastories/menastories.me/Backend/storage/images', filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the file
    const fileStream = fs.createReadStream(imagePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      res.status(500).json({ message: 'Error serving image' });
    });

  } catch (error) {
    console.error('Image serving error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;