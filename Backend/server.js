require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const path = require('path');

const app = express();
app.set('trust proxy', 1); // trust first proxy

// ✅ Import unified DB config
const { sequelize, pool } = require('./config/db');

// Test pool connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error acquiring client from pool:', err.stack);
  } else {
    console.log('✅ Database connected successfully (pg Pool)');
    release();
  }
});

// Test Sequelize connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully (Sequelize)');
  } catch (err) {
    console.error('❌ Sequelize connection failed:', err.message);
  }
})();

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('🔍 Request received:', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    headers: req.headers,
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
    timestamp: new Date().toISOString()
  });
  next();
});

// Debug middleware specifically for video-articles and categories routes
app.use('*', (req, res, next) => {
  if (req.originalUrl.includes('video-articles') || req.originalUrl.includes('categories')) {
    console.log(`🔍 Route Request: ${req.method} ${req.originalUrl}`);
    console.log(`🎯 Base URL: ${req.baseUrl}, Path: ${req.path}`);
  }
  next();
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://menastories.me'
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'credentials']
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(xss());
app.use(cookieParser());

// Custom JSON parsing error handler - must be after express.json()
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ JSON Parsing Error:', err.message);
    console.error('📝 Raw body received:', err.body);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      error: 'Please ensure your request body contains valid JSON with double quotes for strings',
      received: err.body,
      hint: 'Example: {"name": "Test", "email": "test@example.com", "articleSlug": "test"}'
    });
  }
  next(err);
});

// ✅ Sync database models
const models = require('./models');
sequelize.sync({ alter: false, force: false })
  .then(() => console.log('✅ Database models synchronized'))
  .catch(err => console.error('❌ Sequelize sync failed:', err.message));

// Import controllers
const adminAuthController = require('./controllers/adminAuthController');

// Import ALL route modules at the top (MOVE THIS SECTION UP)
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const comprehensiveAnalyticsRoutes = require('./routes/comprehensiveAnalyticsRoutes');
const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const flipbookRoutes = require('./routes/flipbookRoutes');
const imageRoutes = require('./routes/imageRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const publicRoutes = require('./routes/publicRoutes');
const roleRoutes = require('./routes/roleRoutes');
const searchRoutes = require('./routes/searchRoutes');
const securityRoutes = require('./routes/securityRoutes');
const seoRoutes = require('./routes/seoRoutes');
const specialFeaturesRoutes = require('./routes/specialFeaturesRoutes');
const subcategoryController = require('./controllers/subcategoryController');
const tagRoutes = require('./routes/tagRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const videoArticleRoutes = require('./routes/videoArticleRoutes');
const listRoutes = require('./routes/listRoutes');
const taxonomyRoutes = require('./routes/taxonomyRoutes');
const mediaKitRoutes = require('./routes/mediaKitRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const fileRoutes = require('./routes/fileRoutes');
const commentAuthRoutes = require('./routes/commentAuthRoutes'); // MOVE THIS HERE

// Import multer for file uploads
const { upload } = require('./services/imageUploadService');

// Import middleware
const { adminAuthMiddleware } = require('./middleware/adminAuth');
const { validateSubcategory } = require('./middleware/validators');

// NOW you can use commentAuthRoutes because it's imported above
// Comment authentication routes - Move this up before other routes
app.use('/api/public/comments', commentAuthRoutes);

// Add debug middleware to log all requests to /api/public/comments
app.use('/api/public/comments/*', (req, res, next) => {
  console.log('🔍 Comment auth route hit:', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl
  });
  next();
});

// Serve static files from storage directory
app.use('/api/storage', express.static('/var/www/menastories/menastories.me/Backend/storage', {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set proper content type for images
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }

    // Add CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Serve download files with appropriate headers
app.use('/api/storage/downloads', express.static('/var/www/menastories/menastories.me/Backend/storage/downloads', {
  maxAge: '7d', // Cache downloads for 7 days
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Add CORS headers for downloads
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Specific route for images as fallback
app.get('/api/storage/images/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join('/var/www/menastories/menastories.me/Backend/storage', 'images', filename);

  console.log('🖼️  Image request:', filename);
  console.log('📁 Image path:', imagePath);
  console.log('🔍 __dirname:', __dirname);

  const fs = require('fs');
  if (fs.existsSync(imagePath)) {
    console.log('✅ Image found, serving file');
    const stats = fs.statSync(imagePath);
    console.log('📊 File size:', stats.size, 'bytes');

    // Set proper headers for image serving
    let contentType = 'image/webp';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filename.endsWith('.png')) {
      contentType = 'image/png';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    res.sendFile(imagePath);
  } else {
    console.log('❌ Image not found at path');
    // List files in the images directory for debugging
    try {
      const files = fs.readdirSync(path.join('/var/www/menastories/menastories.me/Backend/storage', 'images'));
      console.log('📂 Files in images directory:', files);
    } catch (error) {
      console.log('❌ Error reading images directory:', error.message);
    }
    res.status(404).json({
      success: false,
      message: 'Image not found',
      requestedFile: filename,
      availableFiles: fs.readdirSync(path.join('/var/www/menastories/menastories.me/Backend/storage', 'images')).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    });
  }
});

// RSS feed endpoint
app.get('/rss.xml', async (req, res) => {
  try {
    const rssService = require('./services/rssService');
    const rssContent = await rssService.getRSSFeed();
    res.set('Content-Type', 'application/rss+xml');
    res.send(rssContent);
  } catch (error) {
    console.error('Error serving RSS feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve RSS feed',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Image health check endpoint
app.get('/api/images/health', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const imagesDir = path.join('/var/www/menastories/menastories.me/Backend/storage', 'images');
    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    res.json({
      success: true,
      message: 'Image directory accessible',
      imagesDirectory: imagesDir,
      totalFiles: files.length,
      imageFiles: imageFiles.length,
      recentFiles: imageFiles.slice(-5), // Last 5 image files
      serverUrl: process.env.SERVER_URL || 'http://localhost:5000',
      viteApiUrl: process.env.VITE_API_URL || 'Not set',
      imageUrlPattern: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/storage/images/{filename}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accessing images directory',
      error: error.message
    });
  }
});

// Test image serving endpoint
app.get('/api/images/test/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join('/var/www/menastories/menastories.me/Backend/storage', 'images', filename);

  console.log('🧪 Test image request:', filename);
  console.log('📁 Test image path:', imagePath);

  const fs = require('fs');
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    console.log('✅ Test image found, size:', stats.size, 'bytes');

    // Determine content type
    let contentType = 'image/webp';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filename.endsWith('.png')) {
      contentType = 'image/png';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    res.sendFile(imagePath);
  } else {
    console.log('❌ Test image not found');
    res.status(404).json({
      success: false,
      message: 'Test image not found',
      requestedFile: filename,
      fullPath: imagePath,
      availableFiles: fs.readdirSync(path.join('/var/www/menastories/menastories.me/Backend/storage', 'images')).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    });
  }
});

// Admin authentication routes
app.use('/api/admin/auth', adminAuthRoutes);

// Add auth status route
app.get('/api/admin/auth/status', adminAuthController.adminAuthStatus);

// Admin routes
app.use('/api/admin', adminRoutes);

// Admin access control routes
const adminAccessController = require('./controllers/adminAccessController');
app.get('/api/admin/access-matrix', adminAccessController.getAccessMatrix);
app.get('/api/admin/profile', adminAccessController.getAdminProfile);
app.get('/api/admin/roles', adminAccessController.getAllRoles);
app.get('/api/admin/permissions', adminAccessController.getAllPermissions);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Comprehensive analytics routes
app.use('/api/analytics', comprehensiveAnalyticsRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Event routes
app.use('/api/events', eventRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// Category routes
app.use('/api/categories', categoryRoutes);

// Article routes
app.use('/api/articles', articleRoutes);

// Video article routes
app.use('/api/video-articles', videoArticleRoutes);

// List routes
app.use('/api/lists', listRoutes);

// Taxonomy routes
app.use('/api/taxonomy', taxonomyRoutes);

// Media kit routes
app.use('/api/media-kits', mediaKitRoutes);

// Download routes
app.use('/api/downloads', downloadRoutes);

// File routes
app.use('/api/files', fileRoutes);

// Image routes
app.use('/api/images', imageRoutes);

// Media routes
app.use('/api/media', mediaRoutes);

// Newsletter routes
app.use('/api/newsletter', newsletterRoutes);

// Promotion routes - temporarily commented out for debugging
// app.use('/api/promotion', promotionRoutes);

// Public routes
app.use('/api/public', publicRoutes);

// reCAPTCHA verification endpoint
app.post('/api/verify-recaptcha', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA token is required'
      });
    }

    // For development, allow bypass tokens
    if (token === 'development-bypass-token') {
      return res.json({
        success: true,
        message: 'reCAPTCHA verification bypassed for development'
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT';

    // Verify with Google reCAPTCHA
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    if (data.success) {
      res.json({
        success: true,
        message: 'reCAPTCHA verification successful'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed',
        errors: data['error-codes']
      });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'reCAPTCHA verification service unavailable',
      error: error.message
    });
  }
});

// Role routes - mount under /api/admin for consistency
app.use('/api/admin/roles', roleRoutes);

// Search routes
app.use('/api/search', searchRoutes);

// Security routes
app.use('/api/security', securityRoutes);

// SEO routes
app.use('/api/seo', seoRoutes);

// Special features routes
app.use('/api/special-features', specialFeaturesRoutes);

// Tag routes
app.use('/api/tags', tagRoutes);

// Team routes - temporarily commented out for debugging
// app.use('/api/team', teamRoutes);

// User routes
app.use('/api/users', userRoutes);

// Video routes - temporarily commented out for debugging
// app.use('/api/videos', videoRoutes);

// Flipbook routes
app.use('/api/flipbook', (req, res, next) => {
  console.log('Flipbook route hit:', req.method, req.path);
  next();
}, flipbookRoutes);

// Subcategory routes (specific routes before parameterized ones)
app.get('/api/subcategories/stats', subcategoryController.getSubcategoryStatistics);
app.get('/api/subcategories/category/:categoryId', subcategoryController.getSubcategoriesByCategory);
app.get('/api/subcategories', subcategoryController.getAllSubcategories);
app.get('/api/subcategories/:id', subcategoryController.getSubcategoryById);
app.post('/api/subcategories', adminAuthMiddleware, upload.single('image'), validateSubcategory, subcategoryController.createSubcategory);
app.put('/api/subcategories/:id', subcategoryController.updateSubcategory);
app.delete('/api/subcategories/:id', subcategoryController.deleteSubcategory);
app.patch('/api/subcategories/:id/status', subcategoryController.toggleSubcategoryStatus);

// ========================================
// NON-API ROUTES (without /api prefix)
// ========================================

// Video article routes without /api prefix
app.use('/video-articles', videoArticleRoutes);

// Category routes without /api prefix
app.use('/categories', categoryRoutes);

// Article routes without /api prefix
app.use('/articles', articleRoutes);

// Author routes without /api prefix (using videoArticleRoutes which contains author management)
app.use('/authors', videoArticleRoutes);

// Subcategory routes without /api prefix
app.get('/subcategories/stats', subcategoryController.getSubcategoryStatistics);
app.get('/subcategories/category/:categoryId', subcategoryController.getSubcategoriesByCategory);
app.get('/subcategories', subcategoryController.getAllSubcategories);
app.get('/subcategories/:id', subcategoryController.getSubcategoryById);

// Additional common endpoints without /api prefix
app.use('/tags', tagRoutes);
app.use('/search', searchRoutes);
app.use('/lists', listRoutes);
app.use('/media-kits', mediaKitRoutes);
app.use('/downloads', downloadRoutes);
app.use('/events', eventRoutes);
app.use('/newsletter', newsletterRoutes);

// Health check without /api prefix
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Articles by category without /api prefix
app.get('/categories/:id/articles', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const query = `
      SELECT a.*, c.name as category_name, c.slug as category_slug,
               array_agg(DISTINCT t.name) as tags
      FROM "Articles" a
      LEFT JOIN "Categories" c ON a."categoryId" = c.id
      LEFT JOIN "ArticleTags" at ON a.id = at."articleId"
      LEFT JOIN "Tags" t ON at."tagId" = t.id
      WHERE a."categoryId" = $1 AND a.status = 'published'
      GROUP BY a.id, c.name, c.slug
      ORDER BY a."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM "Articles"
      WHERE "categoryId" = $1 AND status = 'published'
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [id, limit, offset]),
      pool.query(countQuery, [id])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
});

// Tags routes - using the tagRoutes module





// Get articles by tag
app.get('/api/tags/:id/articles', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const query = `
      SELECT a.*, c.name as category_name, c.slug as category_slug,
              array_agg(t.name) as tags
      FROM "Articles" a
      LEFT JOIN "Categories" c ON a."categoryId" = c.id
      LEFT JOIN "ArticleTags" at ON a.id = at."articleId"
      LEFT JOIN "Tags" t ON at."tagId" = t.id
      WHERE a.id IN (
        SELECT DISTINCT at2."articleId"
        FROM "ArticleTags" at2
        WHERE at2."tagId" = $1
      )
      AND a.status = 'published'
      GROUP BY a.id, c.name, c.slug
      ORDER BY a."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT a.id) as total
      FROM "Articles" a
      JOIN "ArticleTags" at ON a.id = at."articleId"
      WHERE at."tagId" = $1 AND a.status = 'published'
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [id, limit, offset]),
      pool.query(countQuery, [id])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching articles by tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
});

// Get articles by category
app.get('/api/categories/:id/articles', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const query = `
      SELECT a.*, c.name as category_name, c.slug as category_slug,
              array_agg(DISTINCT t.name) as tags
      FROM "Articles" a
      LEFT JOIN "Categories" c ON a."categoryId" = c.id
      LEFT JOIN "ArticleTags" at ON a.id = at."articleId"
      LEFT JOIN "Tags" t ON at."tagId" = t.id
      WHERE a."categoryId" = $1 AND a.status = 'published'
      GROUP BY a.id, c.name, c.slug
      ORDER BY a."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM "Articles"
      WHERE "categoryId" = $1 AND status = 'published'
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [id, limit, offset]),
      pool.query(countQuery, [id])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
});

// Example route using pool
app.get('/api/debug/database', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM "Articles"');
    res.json({ success: true, articles: result.rows[0].total });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await pool.end();
  process.exit(0);
});

// Auto-publishing scheduler
const ArticleController = require('./controllers/articleController');
const articleController = new ArticleController();
const { publishScheduledArticles } = articleController;
const VideoArticleController = require('./controllers/videoArticleController');
const videoArticleController = new VideoArticleController();
const { publishScheduledVideoArticles } = videoArticleController;

// Run auto-publishing every minute
setInterval(async () => {
  try {
    // Auto-publish scheduled articles
    const publishedArticles = await publishScheduledArticles();
    if (publishedArticles && publishedArticles.length > 0) {
      console.log(`📅 Auto-published ${publishedArticles.length} scheduled articles`);
    }

    // Auto-publish scheduled video articles
    const publishedVideoArticles = await publishScheduledVideoArticles();
    if (publishedVideoArticles && publishedVideoArticles.length > 0) {
      console.log(`🎥 Auto-published ${publishedVideoArticles.length} scheduled video articles`);
    }
  } catch (error) {
    console.error('❌ Auto-publishing error:', error);
  }
}, 60000); // Check every minute

// Initialize scheduling service
require('./services/schedulingService');

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`⏰ Auto-publishing scheduler started (checks every minute)`);
});

// Initialize real-time analytics service
const RealtimeAnalyticsService = require('./services/realtimeAnalyticsService');
const realtimeAnalytics = new RealtimeAnalyticsService(server);
realtimeAnalytics.startPeriodicUpdates();

console.log('📈 Real-time analytics service initialized');

module.exports = app;