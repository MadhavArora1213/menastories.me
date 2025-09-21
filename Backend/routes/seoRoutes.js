const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const { body, param, query } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

// Validation middleware
const validateSEOUpdate = [
  param('contentType').isIn([
    'articles', 'videoArticles', 'subcategories', 'events',
    'lists', 'powerListEntries', 'mediaKits', 'flipbooks'
  ]),
  param('id').isUUID(),
  body('metaTitle').optional().isLength({ max: 60 }).withMessage('Meta title must be 60 characters or less'),
  body('metaDescription').optional().isLength({ max: 160 }).withMessage('Meta description must be 160 characters or less'),
  body('seoTitle').optional().isLength({ max: 60 }).withMessage('SEO title must be 60 characters or less'),
  body('seoDescription').optional().isLength({ max: 160 }).withMessage('SEO description must be 160 characters or less'),
  body('keywords').optional().isArray().withMessage('Keywords must be an array'),
  body('canonicalUrl').optional().isURL().withMessage('Canonical URL must be a valid URL')
];

const validateBulkUpdate = [
  body('contentType').isIn([
    'articles', 'videoArticles', 'subcategories', 'events',
    'lists', 'powerListEntries', 'mediaKits', 'flipbooks'
  ]),
  body('updates').isArray().withMessage('Updates must be an array'),
  body('updates.*.id').isUUID().withMessage('Each update must have a valid UUID id'),
  body('updates.*.metaTitle').optional().isLength({ max: 60 }),
  body('updates.*.metaDescription').optional().isLength({ max: 160 }),
  body('updates.*.seoTitle').optional().isLength({ max: 60 }),
  body('updates.*.seoDescription').optional().isLength({ max: 160 }),
  body('updates.*.keywords').optional().isArray(),
  body('updates.*.canonicalUrl').optional().isURL()
];

// Apply authentication to all routes
router.use(authMiddleware);

// Get SEO data for a specific content item
router.get('/:contentType/:id',
  [
    param('contentType').isIn([
      'articles', 'videoArticles', 'subcategories', 'events',
      'lists', 'powerListEntries', 'mediaKits', 'flipbooks'
    ]),
    param('id').isUUID()
  ],
  seoController.getSEOData
);

// Update SEO data for a specific content item
router.put('/:contentType/:id',
  validateSEOUpdate,
  seoController.updateSEOData
);

// Get bulk SEO data for content type
router.get('/bulk/:contentType',
  [
    param('contentType').isIn([
      'articles', 'videoArticles', 'subcategories', 'events',
      'lists', 'powerListEntries', 'mediaKits', 'flipbooks'
    ]),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('status').optional().isString()
  ],
  seoController.getBulkSEOData
);

// Bulk update SEO data
router.put('/bulk/:contentType',
  validateBulkUpdate,
  seoController.bulkUpdateSEOData
);

// Get SEO analytics for content type
router.get('/analytics/:contentType',
  [
    param('contentType').isIn([
      'articles', 'videoArticles', 'subcategories', 'events',
      'lists', 'powerListEntries', 'mediaKits', 'flipbooks'
    ])
  ],
  seoController.getSEOAnalytics
);

// Generate SEO suggestions for content item
router.get('/suggestions/:contentType/:id',
  [
    param('contentType').isIn([
      'articles', 'videoArticles', 'subcategories', 'events',
      'lists', 'powerListEntries', 'mediaKits', 'flipbooks'
    ]),
    param('id').isUUID()
  ],
  seoController.generateSEOSuggestions
);

// Get all supported content types
router.get('/content-types', (req, res) => {
  res.json({
    contentTypes: [
      'articles',
      'videoArticles',
      'subcategories',
      'events',
      'lists',
      'powerListEntries',
      'mediaKits',
      'flipbooks'
    ],
    seoFields: {
      articles: ['metaTitle', 'metaDescription', 'keywords'],
      videoArticles: ['metaTitle', 'metaDescription', 'keywords'],
      subcategories: ['metaTitle', 'metaDescription'],
      events: ['seoTitle', 'seoDescription', 'canonicalUrl'],
      lists: ['metaTitle', 'metaDescription'],
      powerListEntries: ['metaTitle', 'metaDescription'],
      mediaKits: ['metaTitle', 'metaDescription', 'keywords'],
      flipbooks: ['seoTitle', 'seoDescription', 'canonicalUrl']
    }
  });
});

module.exports = router;