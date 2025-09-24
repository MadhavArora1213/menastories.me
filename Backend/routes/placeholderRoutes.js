const express = require('express');
const router = express.Router();
const placeholderController = require('../controllers/placeholderController');

/**
 * Placeholder Image Routes
 * Handles generation of placeholder images for the application
 */

// Health check endpoint
router.get('/health', placeholderController.healthCheck);

// Generate placeholder image with dimensions in URL path
// Format: /placeholder/:width/:height/:text?
// Examples:
// - /placeholder/300/300
// - /placeholder/96/96/Avatar
// - /placeholder/800/600/Featured%20Image
router.get('/:width/:height/:text?', placeholderController.generatePlaceholder);

// Alternative format with query parameters
// Format: /placeholder?width=300&height=300&text=Placeholder&format=png
router.get('/', placeholderController.generatePlaceholder);

module.exports = router;