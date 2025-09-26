const { FlipbookMagazine, FlipbookPage, User, Category } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Utility function to normalize file paths
function normalizeFilePath(filePath) {
  if (!filePath) return filePath;
  return filePath.replace(/\\/g, '/');
}

// Utility function to resolve file path with multiple strategies
async function resolveFilePath(storedPath) {
  if (!storedPath) return null;

  const normalizedPath = normalizeFilePath(storedPath);

  // Try the stored path first
  if (await fs.access(normalizedPath).then(() => true).catch(() => false)) {
    return normalizedPath;
  }

  // Try alternative paths
  const filename = path.basename(normalizedPath);
  const alternativePaths = [
    path.join(__dirname, '..', 'storage', 'flipbooks', filename),
    path.join(process.cwd(), 'storage', 'flipbooks', filename),
    path.join('/var/www/html/Backend/storage/flipbooks', filename),
    path.join('/home/menastories/public_html/Backend/storage/flipbooks', filename),
    path.join(__dirname, '..', '..', 'storage', 'flipbooks', filename),
    path.join(__dirname, '..', '..', 'Backend', 'storage', 'flipbooks', filename)
  ];

  for (const altPath of alternativePaths) {
    const normalizedAltPath = normalizeFilePath(altPath);
    if (await fs.access(normalizedAltPath).then(() => true).catch(() => false)) {
      return normalizedAltPath;
    }
  }

  return null;
}

// Helper function to check Ghostscript installation
async function checkGhostscriptInstallation() {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');

    // Try common Ghostscript installation paths on Windows
    const possiblePaths = [
      'C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs10.02.1\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs10.01.2\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs9.56.1\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs9.55.0\\bin\\gswin64c.exe',
      'gswin64c.exe', // Try PATH
      'gswin64.exe'   // Alternative executable name
    ];

    let attempts = 0;
    const maxAttempts = possiblePaths.length;

    function tryNextPath() {
      if (attempts >= maxAttempts) {
        reject(new Error('Ghostscript not found. Please install Ghostscript and ensure it\'s in your PATH.'));
        return;
      }

      const gsPath = possiblePaths[attempts];
      attempts++;

      console.log(`Trying Ghostscript path: ${gsPath}`);

      const gs = spawn(gsPath, ['--version']);

      gs.on('close', (code) => {
        if (code === 0) {
          console.log(`Ghostscript found at: ${gsPath}`);
          resolve(gsPath);
        } else {
          tryNextPath();
        }
      });

      gs.on('error', (error) => {
        console.log(`Ghostscript not found at ${gsPath}: ${error.message}`);
        tryNextPath();
      });
    }

    tryNextPath();
  });
}

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
      'application/x-pdf',
      'application/acrobat',
      'applications/vnd.pdf',
      'text/pdf',
      'text/x-pdf'
    ];

    const allowedExtensions = ['.pdf'];

    // Check MIME type
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
    }

    // Check file extension
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      return cb(new Error('Invalid file extension. Only .pdf files are allowed.'), false);
    }

    // Additional validation: check file size is reasonable
    if (file.size === 0) {
      return cb(new Error('File is empty.'), false);
    }

    cb(null, true);
  }
});

// Get categories from database
exports.getCategories = async (req, res) => {
  try {
    const { Category } = require('../models');
    const categories = await Category.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'slug', 'description'],
      order: [['name', 'ASC']]
    });

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Flipbook Magazine Controllers
exports.getFlipbookMagazines = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      magazineType,
      accessType,
      featured,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build where clause
    if (category && category !== 'all') {
      // Map frontend category to database enum value
      const categoryMapping = {
        'business-leadership': 'business',
        'culture-society': 'lifestyle',
        'entertainment': 'entertainment',
        'lifestyle': 'lifestyle',
        'people-profiles': 'people_profiles',
        'regional-focus': 'lifestyle',
        'special-sections': 'lifestyle',
        'business': 'business',
        'technology': 'technology',
        'health': 'health',
        'travel': 'travel',
        'food': 'food',
        'fashion': 'fashion',
        'sports': 'sports'
      };
      whereClause.category = categoryMapping[category] || category;
    }
    if (magazineType && magazineType !== 'all') whereClause.magazineType = magazineType;
    if (accessType && accessType !== 'all') whereClause.accessType = accessType;
    if (featured !== undefined && featured !== 'all') whereClause.isFeatured = featured === 'true';

    // Handle status filter
    if (status && status !== 'all') {
      if (status === 'published') {
        whereClause.isPublished = true;
      } else if (status === 'processing') {
        whereClause.processingStatus = 'processing';
      }
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Validate sortBy column exists
    const validSortColumns = ['createdAt', 'updatedAt', 'title', 'viewCount', 'downloadCount'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';

    const { rows: magazines, count: total } = await FlipbookMagazine.findAndCountAll({
      where: whereClause,
      order: [[safeSortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      magazines,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flipbook magazines:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      sortBy: safeSortBy,
      sortOrder
    });
    res.status(500).json({
      error: 'Failed to fetch flipbook magazines',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getFlipbookMagazineById = async (req, res) => {
  try {
    const { id } = req.params;

    const magazine = await FlipbookMagazine.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'avatar'],
          required: false
        }
      ]
    });

    if (!magazine) {
      return res.status(404).json({ error: 'Flipbook magazine not found' });
    }

    // Check access permissions
    if (magazine.accessType === 'premium' || magazine.accessType === 'paid') {
      // Implement subscription/payment check here
      if (!req.admin) {
        return res.status(403).json({ error: 'Authentication required for premium content' });
      }
      // Add subscription check logic
    }

    // Track view analytics
    if (req.admin) {
      // Implement view tracking
      await magazine.incrementViews();
    }

    res.json({ magazine });
  } catch (error) {
    console.error('Error fetching flipbook magazine:', error);
    res.status(500).json({ error: 'Failed to fetch flipbook magazine' });
  }
};

exports.createFlipbookMagazine = async (req, res) => {
  try {
    const magazineData = { ...req.body };

    // Map category slugs to database enum values
    const categoryMapping = {
      'business-leadership': 'business',
      'culture-society': 'lifestyle',
      'entertainment': 'entertainment',
      'lifestyle': 'lifestyle',
      'people-profiles': 'people_profiles',
      'regional-focus': 'lifestyle',
      'special-sections': 'lifestyle',
      'business': 'business',
      'technology': 'technology',
      'health': 'health',
      'travel': 'travel',
      'food': 'food',
      'fashion': 'fashion',
      'sports': 'sports'
    };

    if (magazineData.category && categoryMapping[magazineData.category]) {
      magazineData.category = categoryMapping[magazineData.category];
    }

    magazineData.createdBy = req.admin.id;

    const magazine = await FlipbookMagazine.create(magazineData);

    res.status(201).json({ magazine });
  } catch (error) {
    console.error('Error creating flipbook magazine:', error);
    res.status(500).json({ error: 'Failed to create flipbook magazine' });
  }
};

exports.updateFlipbookMagazine = async (req, res) => {
   try {
     const { id } = req.params;
     const updateData = { ...req.body };

     const magazine = await FlipbookMagazine.findByPk(id);
     if (!magazine) {
       return res.status(404).json({ error: 'Flipbook magazine not found' });
     }

     // Check permissions
     if (!req.admin) {
       return res.status(401).json({ error: 'Admin authentication required' });
     }

     if (magazine.createdBy !== req.admin.id && (!req.admin.role || req.admin.role.name !== 'Master Admin')) {
       return res.status(403).json({ error: 'Unauthorized to update this magazine' });
     }

     // Handle PDF file replacement
     if (req.file) {
       // Validate file type
       const allowedTypes = [
         'application/pdf',
         'application/x-pdf',
         'application/acrobat',
         'applications/vnd.pdf',
         'text/pdf',
         'text/x-pdf'
       ];

       if (!allowedTypes.includes(req.file.mimetype)) {
         return res.status(400).json({ error: 'Invalid file type. Only PDF files are allowed.' });
       }

       // Validate file size
       if (req.file.size > 100 * 1024 * 1024) {
         return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
       }

       // Delete old PDF file if it exists
       if (magazine.originalFilePath && await fs.access(magazine.originalFilePath).then(() => true).catch(() => false)) {
         try {
           await fs.unlink(magazine.originalFilePath);
         } catch (fileError) {
           console.error('Error deleting old PDF file:', fileError);
         }
       }

       // Set new file path with normalized path
       const normalizedPath = path.join(__dirname, '..', 'storage', 'flipbooks', req.file.filename).replace(/\\/g, '/');
       updateData.originalFilePath = normalizedPath;
       updateData.fileSize = req.file.size;

       // Reset processing status for new file
       updateData.processingStatus = 'pending';
       updateData.processingProgress = 0;
       // Don't set totalPages to null, preserve existing value or set to 0
       updateData.totalPages = 0;

       // Delete existing pages for reprocessing
       await FlipbookPage.destroy({ where: { magazineId: id } });
     }

     // Map category slugs to database enum values
     const categoryMapping = {
       'business-leadership': 'business',
       'culture-society': 'lifestyle',
       'entertainment': 'entertainment',
       'lifestyle': 'lifestyle',
       'people-profiles': 'people_profiles',
       'regional-focus': 'lifestyle',
       'special-sections': 'lifestyle',
       'business': 'business',
       'technology': 'technology',
       'health': 'health',
       'travel': 'travel',
       'food': 'food',
       'fashion': 'fashion',
       'sports': 'sports'
     };

     if (updateData.category && categoryMapping[updateData.category]) {
       updateData.category = categoryMapping[updateData.category];
     }

     await magazine.update(updateData);

     // Start background processing if new file was uploaded
     if (req.file) {
       setTimeout(async () => {
         try {
           let gsPath;
           try {
             gsPath = await checkGhostscriptInstallation();
           } catch (gsError) {
             console.error('Ghostscript not found:', gsError.message);
             await magazine.updateProcessingStatus('failed', null, gsError.message);
             return;
           }
           await processFlipbookPDF(magazine.id, req.file.path, gsPath);
         } catch (error) {
           console.error('Error processing updated flipbook:', error);
           await magazine.updateProcessingStatus('failed', null, error.message);
         }
       }, 1000);
     }

     const updatedMagazine = await FlipbookMagazine.findByPk(id, {
       include: [
         {
           model: User,
           as: 'author',
           attributes: ['id', 'name', 'email', 'avatar'],
           required: false
         }
       ]
     });

     res.json({ magazine: updatedMagazine });
   } catch (error) {
     console.error('Error updating flipbook magazine:', error);
     res.status(500).json({ error: 'Failed to update flipbook magazine' });
   }
};

exports.deleteFlipbookMagazine = async (req, res) => {
  try {
    const { id } = req.params;

    const magazine = await FlipbookMagazine.findByPk(id);
    if (!magazine) {
      return res.status(404).json({ error: 'Flipbook magazine not found' });
    }

    // Check permissions
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    if (magazine.createdBy !== req.admin.id && (!req.admin.role || !['Master Admin', 'Webmaster', 'Content Admin'].includes(req.admin.role.name))) {
      return res.status(403).json({ error: 'Unauthorized to delete this magazine' });
    }

    // Get all associated pages
    const pages = await FlipbookPage.findAll({ where: { magazineId: id } });

    // Delete page image files
    for (const page of pages) {
      try {
        if (page.imagePath && await fs.access(page.imagePath).then(() => true).catch(() => false)) {
          await fs.unlink(page.imagePath);
        }
        if (page.thumbnailPath && await fs.access(page.thumbnailPath).then(() => true).catch(() => false)) {
          await fs.unlink(page.thumbnailPath);
        }
        if (page.highResImagePath && await fs.access(page.highResImagePath).then(() => true).catch(() => false)) {
          await fs.unlink(page.highResImagePath);
        }
      } catch (fileError) {
        console.error('Error deleting page files:', fileError);
        // Continue with deletion even if file cleanup fails
      }
    }

    // Delete the original PDF file
    try {
      if (magazine.originalFilePath && await fs.access(magazine.originalFilePath).then(() => true).catch(() => false)) {
        await fs.unlink(magazine.originalFilePath);
      }
    } catch (fileError) {
      console.error('Error deleting original file:', fileError);
    }

    // Delete associated pages from database
    await FlipbookPage.destroy({ where: { magazineId: id } });

    // Delete the magazine
    await magazine.destroy();

    res.json({ message: 'Flipbook magazine and all associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting flipbook magazine:', error);
    res.status(500).json({ error: 'Failed to delete flipbook magazine' });
  }
};

// Flipbook Pages Controllers
exports.getFlipbookPages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    console.log(`getFlipbookPages called for magazine ID: ${id}`);

    const magazine = await FlipbookMagazine.findByPk(id);
    if (!magazine) {
      console.log(`Magazine ${id} not found`);
      return res.status(404).json({ error: 'Flipbook magazine not found' });
    }

    console.log(`Found magazine: ${magazine.title}, totalPages: ${magazine.totalPages}, originalFilePath: ${magazine.originalFilePath}`);

    const offset = (page - 1) * limit;
    let pages = await FlipbookPage.getPagesByMagazine(id, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    console.log(`Found ${pages.length} existing pages for magazine ${id}`);
    if (pages.length > 0) {
      console.log('Sample page data:', pages[0]);
    }

    // If no pages exist but magazine has totalPages > 0, try to create them
    if (pages.length === 0 && magazine.totalPages > 0 && magazine.originalFilePath) {
      console.log(`No pages found for magazine ${id}, attempting to create them...`);
      console.log(`Magazine details:`, {
        id: magazine.id,
        title: magazine.title,
        totalPages: magazine.totalPages,
        originalFilePath: magazine.originalFilePath
      });

      try {
        // Check if PDF file exists
        await fs.access(magazine.originalFilePath);

        // Try to recreate pages from the PDF
        const { spawn } = require('child_process');
        const path = require('path');

        // Create pages directory
        const pagesDir = path.join(path.dirname(magazine.originalFilePath), 'pages');
        await fs.mkdir(pagesDir, { recursive: true });

        // Generate page images
        for (let i = 1; i <= Math.min(magazine.totalPages, 50); i++) { // Limit to 50 pages for safety
          const pageImagePath = path.join(pagesDir, `page_${i}.png`);
          const thumbnailPath = path.join(pagesDir, `page_${i}_thumb.png`);

          try {
            // Check if page already exists
            await fs.access(pageImagePath);
            console.log(`Page ${i} already exists`);
          } catch {
            // Create page image using Ghostscript
            await new Promise((resolve, reject) => {
              const gs = spawn(gsPath, [
                '-sDEVICE=png16m',
                '-r150',
                `-dFirstPage=${i}`,
                `-dLastPage=${i}`,
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                `-sOutputFile=${pageImagePath}`,
                magazine.originalFilePath
              ]);

              gs.on('close', (code) => {
                if (code === 0) {
                  resolve();
                } else {
                  reject(new Error(`Ghostscript failed for page ${i}`));
                }
              });

              gs.on('error', reject);
            });

            // Create thumbnail
            await new Promise((resolve, reject) => {
              const gs = spawn(gsPath, [
                '-sDEVICE=png16m',
                '-r72',
                `-dFirstPage=${i}`,
                `-dLastPage=${i}`,
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                `-sOutputFile=${thumbnailPath}`,
                magazine.originalFilePath
              ]);

              gs.on('close', (code) => {
                if (code === 0) {
                  resolve();
                } else {
                  reject(new Error(`Ghostscript failed for thumbnail ${i}`));
                }
              });

              gs.on('error', reject);
            });
          }

          // Create page record in database
          // Convert absolute paths to relative URLs for frontend access
          const imageUrl = pageImagePath.replace(/\\/g, '/').replace(/.*[\/\\]storage/, '/storage');
          const thumbnailUrl = thumbnailPath.replace(/\\/g, '/').replace(/.*[\/\\]storage/, '/storage');

          await FlipbookPage.create({
            magazineId: id,
            pageNumber: i,
            imagePath: pageImagePath,
            imageUrl: imageUrl,
            thumbnailPath: thumbnailPath,
            thumbnailUrl: thumbnailUrl,
            processingStatus: 'completed'
          });

          console.log(`Created page ${i} for magazine ${id}`);
        }

        // Re-fetch pages after creation
        pages = await FlipbookPage.getPagesByMagazine(id, {
          page: parseInt(page),
          limit: parseInt(limit)
        });

        console.log(`Successfully created ${pages.length} pages for magazine ${id}`);

      } catch (creationError) {
        console.error('Error creating pages:', creationError);
        // Continue with empty pages array rather than failing
      }
    }

    res.json({
      magazine,
      pages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: magazine.totalPages,
        totalPages: Math.ceil(magazine.totalPages / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flipbook pages:', error);
    res.status(500).json({ error: 'Failed to fetch flipbook pages' });
  }
};

exports.getFlipbookPage = async (req, res) => {
  try {
    const { id, pageNumber } = req.params;

    const page = await FlipbookPage.findOne({
      where: { magazineId: id, pageNumber: parseInt(pageNumber) }
    });

    if (!page) {
      return res.status(404).json({ error: 'Flipbook page not found' });
    }

    // Track page view
    if (req.admin) {
      await page.incrementViews();
    }

    res.json({ page });
  } catch (error) {
    console.error('Error fetching flipbook page:', error);
    res.status(500).json({ error: 'Failed to fetch flipbook page' });
  }
};

// Upload and Processing
exports.uploadFlipbook = async (req, res) => {
  try {
    console.log('Upload controller reached');
    console.log('req.admin:', req.admin);
    console.log('req.file:', req.file);

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Basic PDF validation - check header and file integrity
    try {
      const buffer = await fs.readFile(req.file.path);

      console.log(`Validating uploaded file: ${req.file.originalname}`);
      console.log(`File size: ${buffer.length} bytes`);
      console.log(`MIME type: ${req.file.mimetype}`);
      console.log(`First 20 bytes: ${buffer.slice(0, 20).toString('hex')}`);

      // Check if file is empty
      if (buffer.length === 0) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: 'Uploaded file is empty' });
      }

      // Check PDF header
      if (!buffer.slice(0, 4).equals(Buffer.from('%PDF'))) {
        console.log('PDF header validation failed');
        await fs.unlink(req.file.path);
        return res.status(400).json({
          error: 'Invalid PDF file format',
          details: {
            expectedHeader: '%PDF',
            actualHeader: buffer.slice(0, 4).toString(),
            fileSize: buffer.length,
            mimeType: req.file.mimetype
          }
        });
      }

      // Additional validation: check for minimum PDF structure
      const bufferString = buffer.toString();
      if (!bufferString.includes('%%EOF')) {
        console.log('PDF trailer validation failed');
        await fs.unlink(req.file.path);
        return res.status(400).json({
          error: 'PDF file appears to be incomplete or corrupted',
          details: {
            hasPDFHeader: true,
            hasPDFTrailer: false,
            fileSize: buffer.length
          }
        });
      }

      console.log('PDF validation passed successfully');

    } catch (validationError) {
      console.error('File validation error:', validationError);
      // Clean up invalid file
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up invalid file:', cleanupError);
      }
      return res.status(400).json({
        error: 'File validation failed',
        details: validationError.message
      });
    }

    const { title, description, magazineType, category, accessType, price } = req.body;

    // Generate slug from title
    const baseSlug = (title || req.file.originalname).toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await FlipbookMagazine.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate title-based filename with flipbook prefix for better organization
    const titleForFilename = (title || 'untitled').toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .trim();

    // Ensure unique filename with flipbook prefix
    let filename = `flipbook_${titleForFilename}.pdf`;
    let fileCounter = 1;
    const storageDir = path.join(__dirname, '..', 'storage', 'flipbooks');
    while (await fs.access(path.join(storageDir, filename)).then(() => true).catch(() => false)) {
      filename = `flipbook_${titleForFilename}_${fileCounter}.pdf`;
      fileCounter++;
    }

    // Map category slugs to database enum values
    const categoryMapping = {
      'business-leadership': 'business',
      'culture-society': 'lifestyle',
      'entertainment': 'entertainment',
      'lifestyle': 'lifestyle',
      'people-profiles': 'people_profiles',
      'regional-focus': 'lifestyle',
      'special-sections': 'lifestyle',
      'business': 'business',
      'technology': 'technology',
      'health': 'health',
      'travel': 'travel',
      'food': 'food',
      'fashion': 'fashion',
      'sports': 'sports'
    };

    const mappedCategory = categoryMapping[category] || 'lifestyle';

    // Create magazine record WITHOUT storing the file path initially
    console.log('Admin info:', req.admin); // Debug log
    const magazineData = {
      title: title || req.file.originalname,
      slug,
      description,
      magazineType: magazineType || 'monthly',
      category: mappedCategory,
      accessType: accessType || 'free',
      price: price || 0,
      fileSize: req.file.size,
      createdBy: req.admin ? req.admin.id : '00000000-0000-0000-0000-000000000000',
      processingStatus: 'pending' // Set initial status
    };

    const magazine = await FlipbookMagazine.create(magazineData);

    // Store the temporary file path for processing
    const tempFilePath = req.file.path;

    // Start background processing
    setTimeout(async () => {
      try {
        console.log(`Starting background processing for magazine ${magazine.id}: ${magazine.title}`);
        console.log(`Temporary file path: ${tempFilePath}`);

        // Additional validation: Check file size after upload
        const stats = await fs.stat(tempFilePath);
        console.log(`Temporary file stats: size=${stats.size}, exists=${stats.isFile()}`);

        if (stats.size === 0) {
          throw new Error('Uploaded file is empty');
        }

        // Check if Ghostscript is available
        let gsPath;
        try {
          gsPath = await checkGhostscriptInstallation();
          console.log(`Ghostscript found at: ${gsPath}`);
        } catch (gsError) {
          console.error('Ghostscript not found:', gsError.message);
          await magazine.updateProcessingStatus('failed', null, gsError.message);
          return;
        }

        // Process the PDF
        console.log(`Starting PDF processing for magazine ${magazine.id}`);
        await processFlipbookPDF(magazine.id, tempFilePath, gsPath);

        // After successful processing, move to final location with title-based name
        const finalFilePath = path.join(__dirname, '..', 'storage', 'flipbooks', filename).replace(/\\/g, '/');
        console.log(`Moving processed file to final location: ${finalFilePath}`);

        // Move the processed file to final location
        await fs.rename(tempFilePath, finalFilePath);

        // Update magazine with final file path
        await magazine.update({
          originalFilePath: finalFilePath,
          processingStatus: 'completed'
        });

        console.log(`Flipbook ${magazine.id} processing completed successfully and file stored as: ${filename}`);
      } catch (error) {
        console.error(`Error processing flipbook ${magazine.id}:`, error);
        console.error('Error stack:', error.stack);

        await magazine.updateProcessingStatus('failed', null, error.message);

        // Clean up temporary file on error
        try {
          await fs.unlink(tempFilePath);
          console.log(`Cleaned up temporary file: ${tempFilePath}`);
        } catch (cleanupError) {
          console.error('Error cleaning up temporary file:', cleanupError);
        }
      }
    }, 1000);

    res.status(201).json({
      magazine,
      message: 'Flipbook uploaded successfully. Processing in background.'
    });
  } catch (error) {
    console.error('Error uploading flipbook:', error);
    res.status(500).json({ error: 'Failed to upload flipbook' });
  }
};

// PDF Processing Function with Ghostscript
async function processFlipbookPDF(magazineId, filePath, gsPath) {
  const magazine = await FlipbookMagazine.findByPk(magazineId);
  if (!magazine) {
    console.log(`Magazine ${magazineId} not found, skipping processing`);
    return;
  }

  const { spawn } = require('child_process');
  const path = require('path');
  const fs = require('fs').promises;

  try {
    console.log(`Starting PDF processing for magazine ${magazineId}: ${magazine.title}`);
    console.log(`Processing file: ${filePath}`);

    await magazine.updateProcessingStatus('processing', 0);

    // Validate Ghostscript installation
    let gsPath;
    try {
      gsPath = await checkGhostscriptInstallation();
      console.log(`Using Ghostscript at: ${gsPath}`);
    } catch (gsError) {
      throw new Error(`Ghostscript is not properly installed or accessible: ${gsError.message}`);
    }

    // Step 1: Optimize and compress PDF with Ghostscript
    const optimizedPath = filePath.replace('.pdf', '_optimized.pdf');
    await optimizePDFWithGhostscript(filePath, optimizedPath);

    // Step 2: Get PDF info to determine page count
    let totalPages = 0;

    try {
      const pdf = require('pdf-parse');
      const dataBuffer = await fs.readFile(optimizedPath);
      const data = await pdf(dataBuffer);
      totalPages = data.numpages;

      console.log(`PDF processing: Found ${totalPages} pages in ${magazineId} using pdf-parse`);
    } catch (pdfParseError) {
      console.warn(`pdf-parse failed for ${magazineId}:`, pdfParseError.message);
      // Fallback: Try to get page count using Ghostscript
      try {
        const { spawn } = require('child_process');
        const gs = spawn(gsPath, [
          '-q',
          '-dNODISPLAY',
          '-c', `(${optimizedPath}) (r) file runpdfbegin pdfpagecount = quit`
        ]);

        let output = '';
        gs.stdout.on('data', (data) => {
          output += data.toString();
        });

        await new Promise((resolve, reject) => {
          gs.on('close', (code) => {
            if (code === 0) {
              const match = output.match(/(\d+)/);
              if (match) {
                totalPages = parseInt(match[1]);
                console.log(`PDF processing: Found ${totalPages} pages in ${magazineId} using Ghostscript fallback`);
              }
              resolve();
            } else {
              reject(new Error(`Ghostscript page count failed with code ${code}`));
            }
          });
          gs.on('error', reject);
        });
      } catch (gsError) {
        console.error(`Both pdf-parse and Ghostscript failed for ${magazineId}:`, gsError.message);
        throw new Error(`Unable to determine page count: ${pdfParseError.message}`);
      }
    }

    if (totalPages === 0 || !totalPages) {
      throw new Error(`PDF parsing failed: No pages detected in the PDF file`);
    }

    // Step 3: Render pages to images with Ghostscript
    const pagesDir = path.join(path.dirname(filePath), 'pages');
    await fs.mkdir(pagesDir, { recursive: true });

    for (let i = 1; i <= totalPages; i++) {
      const pageImagePath = path.join(pagesDir, `page_${i}.png`);
      const thumbnailPath = path.join(pagesDir, `page_${i}_thumb.png`);

      // Render full-size page
      await renderPDFPageToImage(optimizedPath, i, pageImagePath, 150); // 150 DPI for full size
      // Render thumbnail
      await renderPDFPageToImage(optimizedPath, i, thumbnailPath, 72); // 72 DPI for thumbnail

      // Create page record
      // Convert absolute paths to relative URLs for frontend access
      const imageUrl = pageImagePath.replace(/\\/g, '/').replace(/.*[\/\\]storage/, '/storage');
      const thumbnailUrl = thumbnailPath.replace(/\\/g, '/').replace(/.*[\/\\]storage/, '/storage');

      await FlipbookPage.create({
        magazineId,
        pageNumber: i,
        imagePath: pageImagePath,
        imageUrl: imageUrl,
        thumbnailPath: thumbnailPath,
        thumbnailUrl: thumbnailUrl,
        processingStatus: 'completed'
      });

      // Update progress
      const progress = Math.round((i / totalPages) * 100);
      await magazine.update({ processingProgress: progress });
    }

    // Step 4: Update magazine with final info (file path will be set by caller)
    await magazine.update({
      totalPages,
      processingStatus: 'completed',
      processingProgress: 100
    });

    console.log(`Magazine ${magazineId} updated with ${totalPages} pages`);

    console.log(`Flipbook ${magazineId} processed successfully with ${totalPages} pages`);
  } catch (error) {
    console.error('Error processing PDF:', error);
    await magazine.updateProcessingStatus('failed', null, error.message);
    throw error; // Re-throw to let caller handle cleanup
  }
}

// Helper function to optimize PDF with Ghostscript
async function optimizePDFWithGhostscript(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');

    // Ghostscript command for PDF optimization and compression
    const gs = spawn(gsPath, [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/ebook', // Good balance of size and quality
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath
    ]);

    let stderr = '';
    gs.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    gs.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Ghostscript optimization failed with code ${code}. Error: ${stderr}`));
      }
    });

    gs.on('error', (error) => {
      reject(new Error(`Ghostscript process error: ${error.message}`));
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      gs.kill();
      reject(new Error('Ghostscript optimization timed out'));
    }, 5 * 60 * 1000);
  });
}

// Helper function to render PDF page to image with Ghostscript
async function renderPDFPageToImage(pdfPath, pageNumber, outputPath, dpi = 150) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');

    const gs = spawn(gsPath, [
      '-sDEVICE=png16m',
      `-r${dpi}`,
      '-dFirstPage=' + pageNumber,
      '-dLastPage=' + pageNumber,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      pdfPath
    ]);

    let stderr = '';
    gs.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    gs.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Ghostscript rendering failed with code ${code}. Error: ${stderr}`));
      }
    });

    gs.on('error', (error) => {
      reject(new Error(`Ghostscript rendering process error: ${error.message}`));
    });

    // Timeout after 2 minutes per page
    setTimeout(() => {
      gs.kill();
      reject(new Error(`Ghostscript rendering timed out for page ${pageNumber}`));
    }, 2 * 60 * 1000);
  });
}

// Table of Contents
exports.getTableOfContents = async (req, res) => {
  try {
    const { id } = req.params;

    const magazine = await FlipbookMagazine.findByPk(id);
    if (!magazine) {
      return res.status(404).json({ error: 'Flipbook magazine not found' });
    }

    const toc = magazine.getTableOfContents();

    res.json({ tableOfContents: toc });
  } catch (error) {
    console.error('Error fetching table of contents:', error);
    res.status(500).json({ error: 'Failed to fetch table of contents' });
  }
};

exports.updateTableOfContents = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableOfContents } = req.body;

    const magazine = await FlipbookMagazine.findByPk(id);
    if (!magazine) {
      return res.status(404).json({ error: 'Flipbook magazine not found' });
    }

    // Check permissions
    if (magazine.createdBy !== req.admin.id && req.admin.role.name !== 'Master Admin') {
      return res.status(403).json({ error: 'Unauthorized to update table of contents' });
    }

    await magazine.update({ tableOfContents });

    res.json({ tableOfContents: magazine.tableOfContents });
  } catch (error) {
    console.error('Error updating table of contents:', error);
    res.status(500).json({ error: 'Failed to update table of contents' });
  }
};

// Search within magazine
exports.searchInMagazine = async (req, res) => {
  try {
    const { id } = req.params;
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const magazine = await FlipbookMagazine.findByPk(id);
    if (!magazine) {
      return res.status(404).json({ error: 'Flipbook magazine not found' });
    }

    const pages = await FlipbookPage.searchInMagazine(id, query, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      magazine,
      searchResults: pages,
      query,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: pages.length
      }
    });
  } catch (error) {
    console.error('Error searching in magazine:', error);
    res.status(500).json({ error: 'Failed to search in magazine' });
  }
};

// Analytics
exports.getFlipbookAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const magazine = await FlipbookMagazine.findByPk(id);
    if (!magazine) {
      return res.status(404).json({ error: 'Flipbook magazine not found' });
    }

    // Check permissions
    if (magazine.createdBy !== req.admin.id && req.admin.role.name !== 'Master Admin') {
      return res.status(403).json({ error: 'Unauthorized to view analytics' });
    }

    const pageStats = await FlipbookPage.getMagazineStats(id);

    const analytics = {
      magazine,
      totalViews: magazine.viewCount,
      totalDownloads: magazine.downloadCount,
      totalShares: magazine.shareCount,
      averageReadTime: magazine.averageReadTime,
      pageStats
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching flipbook analytics:', error);
    res.status(500).json({ error: 'Failed to fetch flipbook analytics' });
  }
};

// Bulk operations
exports.bulkUpdateMagazines = async (req, res) => {
  try {
    const { magazineIds, updateData } = req.body;

    if (!magazineIds || !Array.isArray(magazineIds)) {
      return res.status(400).json({ error: 'Magazine IDs array is required' });
    }

    const result = await FlipbookMagazine.update(updateData, {
      where: { id: magazineIds }
    });

    res.json({
      message: `${result[0]} magazines updated successfully`,
      updatedCount: result[0]
    });
  } catch (error) {
    console.error('Error bulk updating magazines:', error);
    res.status(500).json({ error: 'Failed to bulk update magazines' });
  }
};

exports.bulkDeleteMagazines = async (req, res) => {
  try {
    const { magazineIds } = req.body;

    if (!magazineIds || !Array.isArray(magazineIds)) {
      return res.status(400).json({ error: 'Magazine IDs array is required' });
    }

    // Get all magazines to be deleted
    const magazines = await FlipbookMagazine.findAll({
      where: { id: magazineIds }
    });

    // Clean up files for each magazine
    for (const magazine of magazines) {
      // Get all associated pages
      const pages = await FlipbookPage.findAll({ where: { magazineId: magazine.id } });

      // Delete page image files
      for (const page of pages) {
        try {
          if (page.imagePath && await fs.access(page.imagePath).then(() => true).catch(() => false)) {
            await fs.unlink(page.imagePath);
          }
          if (page.thumbnailPath && await fs.access(page.thumbnailPath).then(() => true).catch(() => false)) {
            await fs.unlink(page.thumbnailPath);
          }
          if (page.highResImagePath && await fs.access(page.highResImagePath).then(() => true).catch(() => false)) {
            await fs.unlink(page.highResImagePath);
          }
        } catch (fileError) {
          console.error('Error deleting page files:', fileError);
        }
      }

      // Delete the original PDF file
      try {
        if (magazine.originalFilePath && await fs.access(magazine.originalFilePath).then(() => true).catch(() => false)) {
          await fs.unlink(magazine.originalFilePath);
        }
      } catch (fileError) {
        console.error('Error deleting original file:', fileError);
      }
    }

    // Delete associated pages from database
    await FlipbookPage.destroy({
      where: { magazineId: magazineIds }
    });

    const result = await FlipbookMagazine.destroy({
      where: { id: magazineIds }
    });

    res.json({
      message: `${result} magazines and all associated files deleted successfully`,
      deletedCount: result
    });
  } catch (error) {
    console.error('Error bulk deleting magazines:', error);
    res.status(500).json({ error: 'Failed to bulk delete magazines' });
  }
};

// Download Controllers
exports.downloadFlipbook = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== DOWNLOAD REQUEST DEBUG ===');
    console.log('Requested magazine ID:', id);
    console.log('Request headers:', req.headers);
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Admin status:', !!req.admin);

    const magazine = await FlipbookMagazine.findByPk(id);
    if (!magazine) {
      console.error('Magazine not found in database:', id);
      return res.status(404).json({ error: 'Flipbook magazine not found' });
    }

    console.log('Found magazine:', magazine.title, 'with ID:', magazine.id);
    console.log('Magazine access type:', magazine.accessType);

    // Allow downloads for free magazines regardless of authentication
    // Only require authentication for premium/paid content
    if (magazine.accessType === 'premium' || magazine.accessType === 'paid') {
      if (!req.admin) {
        console.log('Authentication required for premium/paid content');
        return res.status(403).json({ error: 'Authentication required for premium content' });
      }
    }

    // Check if file exists
    console.log(`Looking for PDF file: ${magazine.originalFilePath}`);

    if (!magazine.originalFilePath) {
      console.error(`No file path stored for magazine ${magazine.id}: ${magazine.title}`);
      const errorMessage = magazine.processingStatus === 'failed'
        ? 'This magazine failed to process and cannot be downloaded. Please contact support or try uploading the magazine again.'
        : 'This magazine is not available for download. The file may still be processing or may not have been uploaded successfully.';
      return res.status(404).json({
        error: errorMessage,
        magazine: {
          id: magazine.id,
          title: magazine.title,
          processingStatus: magazine.processingStatus,
          totalPages: magazine.totalPages,
          createdAt: magazine.createdAt
        }
      });
    }

    // Try to access the file with improved path resolution
    let finalPath = await resolveFilePath(magazine.originalFilePath);

    if (!finalPath) {
      console.error('File not found at any path for magazine:', magazine.title);
      console.error('Attempted paths:');
      console.error('- Original path:', magazine.originalFilePath);
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Update the stored path if it was resolved to a different location
    if (finalPath !== magazine.originalFilePath) {
      console.log(`Updating stored path from ${magazine.originalFilePath} to ${finalPath}`);
      await magazine.update({ originalFilePath: finalPath });
    }

    // Validate PDF structure before serving
    try {
      const buffer = await fs.readFile(finalPath);

      // Check PDF header
      if (!buffer.slice(0, 4).equals(Buffer.from('%PDF'))) {
        console.error(`Invalid PDF structure for magazine ${magazine.id}: Missing PDF header`);
        return res.status(500).json({ error: 'PDF file is corrupted or invalid' });
      }

      // Check file size
      if (buffer.length === 0) {
        console.error(`PDF file is empty for magazine ${magazine.id}`);
        return res.status(500).json({ error: 'PDF file is empty' });
      }

      console.log(`PDF validation passed. File size: ${buffer.length} bytes`);

    } catch (validationError) {
      console.error(`PDF validation failed for magazine ${magazine.id}:`, validationError.message);
      return res.status(500).json({ error: 'PDF file validation failed' });
    }

    // Update download count (only if admin is authenticated to avoid spam)
    if (req.admin) {
      await magazine.increment('downloadCount');
    }

    // Set headers for download with CORS support for hosted environment
    const fileName = `${magazine.slug || magazine.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    console.log(`Serving file: ${finalPath} as ${fileName}`);

    // Stream the file
    const fileStream = require('fs').createReadStream(finalPath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading file' });
      }
    });

    fileStream.on('open', () => {
      console.log('File stream opened successfully');
    });

    fileStream.on('end', () => {
      console.log('File stream ended successfully');
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading flipbook:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download flipbook' });
    }
  }
};

exports.downloadFlipbookPage = async (req, res) => {
  try {
    const { id, pageNumber } = req.params;

    const page = await FlipbookPage.findOne({
      where: { magazineId: id, pageNumber: parseInt(pageNumber) }
    });

    if (!page || !page.imagePath) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Check if file exists
    if (!await fs.access(page.imagePath).then(() => true).catch(() => false)) {
      return res.status(404).json({ error: 'Page file not found on server' });
    }

    // Set headers for download
    const fileName = `page_${pageNumber}.png`;
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file
    const fileStream = require('fs').createReadStream(page.imagePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming page file:', error);
      res.status(500).json({ error: 'Error downloading page' });
    });

  } catch (error) {
    console.error('Error downloading flipbook page:', error);
    res.status(500).json({ error: 'Failed to download flipbook page' });
  }
};

// Reprocess magazines with 0 pages
exports.reprocessZeroPageMagazines = async (req, res) => {
  try {
    const zeroPageMagazines = await FlipbookMagazine.findAll({
      where: {
        totalPages: 0,
        processingStatus: 'completed',
        originalFilePath: {
          [Op.ne]: null
        }
      }
    });

    console.log(`Found ${zeroPageMagazines.length} magazines with 0 pages to reprocess`);

    const results = [];
    for (const magazine of zeroPageMagazines) {
      try {
        console.log(`Reprocessing magazine: ${magazine.title} (${magazine.id})`);

        // Check if file exists
        if (!await fs.access(magazine.originalFilePath).then(() => true).catch(() => false)) {
          results.push({ id: magazine.id, title: magazine.title, error: 'File not found' });
          continue;
        }

        // Re-extract page count
        let totalPages = 0;
        try {
          const pdf = require('pdf-parse');
          const dataBuffer = await fs.readFile(magazine.originalFilePath);
          const data = await pdf(dataBuffer);
          totalPages = data.numpages;
        } catch (pdfParseError) {
          // Fallback to Ghostscript
          try {
            const { spawn } = require('child_process');
            const gs = spawn(gsPath, [
              '-q',
              '-dNODISPLAY',
              '-c', `(${magazine.originalFilePath}) (r) file runpdfbegin pdfpagecount = quit`
            ]);

            let output = '';
            gs.stdout.on('data', (data) => {
              output += data.toString();
            });

            await new Promise((resolve, reject) => {
              gs.on('close', (code) => {
                if (code === 0) {
                  const match = output.match(/(\d+)/);
                  if (match) {
                    totalPages = parseInt(match[1]);
                  }
                  resolve();
                } else {
                  reject(new Error(`Ghostscript failed with code ${code}`));
                }
              });
              gs.on('error', reject);
            });
          } catch (gsError) {
            results.push({
              id: magazine.id,
              title: magazine.title,
              error: `Both pdf-parse and Ghostscript failed: ${pdfParseError.message}`
            });
            continue;
          }
        }

        if (totalPages > 0) {
          await magazine.update({ totalPages });
          results.push({
            id: magazine.id,
            title: magazine.title,
            oldPages: 0,
            newPages: totalPages,
            status: 'success'
          });
          console.log(`Updated ${magazine.title}: 0 -> ${totalPages} pages`);
        } else {
          results.push({
            id: magazine.id,
            title: magazine.title,
            error: 'Still 0 pages after reprocessing'
          });
        }

      } catch (error) {
        results.push({
          id: magazine.id,
          title: magazine.title,
          error: error.message
        });
      }
    }

    res.json({
      message: `Reprocessed ${zeroPageMagazines.length} magazines`,
      results
    });

  } catch (error) {
    console.error('Error reprocessing magazines:', error);
    res.status(500).json({ error: 'Failed to reprocess magazines' });
  }
};

// Fix file paths for all magazines
exports.fixFilePaths = async (req, res) => {
  try {
    const magazines = await FlipbookMagazine.findAll({
      where: {
        originalFilePath: {
          [Op.ne]: null
        }
      }
    });

    console.log(`Checking file paths for ${magazines.length} magazines`);

    const results = [];
    const storageDir = path.join(__dirname, '..', 'storage', 'flipbooks');

    for (const magazine of magazines) {
      try {
        const currentPath = magazine.originalFilePath;
        const filename = path.basename(currentPath);
        const expectedPath = path.join(storageDir, filename);

        // Check if file exists at expected location
        let fileExists = false;
        let actualPath = currentPath;

        if (await fs.access(expectedPath).then(() => true).catch(() => false)) {
          fileExists = true;
          actualPath = expectedPath;
        } else if (await fs.access(currentPath).then(() => true).catch(() => false)) {
          fileExists = true;
        }

        if (fileExists && currentPath !== actualPath) {
          // Update path in database
          await magazine.update({ originalFilePath: actualPath });
          results.push({
            id: magazine.id,
            title: magazine.title,
            oldPath: currentPath,
            newPath: actualPath,
            status: 'updated'
          });
          console.log(`Updated path for ${magazine.title}: ${currentPath} -> ${actualPath}`);
        } else if (fileExists) {
          results.push({
            id: magazine.id,
            title: magazine.title,
            path: currentPath,
            status: 'ok'
          });
        } else {
          results.push({
            id: magazine.id,
            title: magazine.title,
            path: currentPath,
            status: 'missing'
          });
        }

      } catch (error) {
        results.push({
          id: magazine.id,
          title: magazine.title,
          error: error.message,
          status: 'error'
        });
      }
    }

    const summary = {
      total: magazines.length,
      updated: results.filter(r => r.status === 'updated').length,
      ok: results.filter(r => r.status === 'ok').length,
      missing: results.filter(r => r.status === 'missing').length,
      errors: results.filter(r => r.status === 'error').length
    };

    res.json({ summary, results });

  } catch (error) {
    console.error('Error fixing file paths:', error);
    res.status(500).json({ error: 'Failed to fix file paths' });
  }
};

// Identify corrupted PDFs
exports.identifyCorruptedPDFs = async (req, res) => {
  try {
    const magazines = await FlipbookMagazine.findAll({
      where: {
        originalFilePath: {
          [Op.ne]: null
        },
        processingStatus: 'completed'
      }
    });

    console.log(`Checking ${magazines.length} magazines for corruption`);

    const corrupted = [];
    const valid = [];

    for (const magazine of magazines) {
      try {
        // Check if file exists
        if (!await fs.access(magazine.originalFilePath).then(() => true).catch(() => false)) {
          corrupted.push({
            id: magazine.id,
            title: magazine.title,
            issue: 'File not found',
            filePath: magazine.originalFilePath
          });
          continue;
        }

        // Validate PDF structure
        const fs = require('fs');
        const buffer = fs.readFileSync(magazine.originalFilePath);

        // Check PDF header
        if (!buffer.slice(0, 4).equals(Buffer.from('%PDF'))) {
          corrupted.push({
            id: magazine.id,
            title: magazine.title,
            issue: 'Missing PDF header',
            filePath: magazine.originalFilePath
          });
          continue;
        }

        // Check for PDF trailer
        const bufferString = buffer.toString();
        if (!bufferString.includes('%%EOF')) {
          corrupted.push({
            id: magazine.id,
            title: magazine.title,
            issue: 'Missing PDF trailer',
            filePath: magazine.originalFilePath
          });
          continue;
        }

        valid.push({
          id: magazine.id,
          title: magazine.title,
          fileSize: magazine.fileSize,
          totalPages: magazine.totalPages
        });

      } catch (error) {
        corrupted.push({
          id: magazine.id,
          title: magazine.title,
          issue: `Validation error: ${error.message}`,
          filePath: magazine.originalFilePath
        });
      }
    }

    res.json({
      summary: {
        total: magazines.length,
        valid: valid.length,
        corrupted: corrupted.length
      },
      corrupted,
      valid: valid.slice(0, 10) // Show first 10 valid for reference
    });

  } catch (error) {
    console.error('Error identifying corrupted PDFs:', error);
    res.status(500).json({ error: 'Failed to identify corrupted PDFs' });
  }
};

// Regenerate PDFs for corrupted/missing files
exports.regeneratePDFs = async (req, res) => {
  try {
    const magazines = await FlipbookMagazine.findAll({
      where: {
        processingStatus: 'completed',
        originalFilePath: {
          [Op.ne]: null
        }
      },
      include: [
        {
          model: FlipbookPage,
          as: 'pages',
          required: false
        }
      ]
    });

    console.log(`Checking ${magazines.length} magazines for regeneration`);

    const results = [];
    const storageDir = path.join(__dirname, '..', 'storage', 'flipbooks');

    for (const magazine of magazines) {
      try {
        const currentPath = magazine.originalFilePath;
        const filename = path.basename(currentPath);

        // Check if file exists and is valid
        let needsRegeneration = false;
        let reason = '';

        if (!await fs.access(currentPath).then(() => true).catch(() => false)) {
          needsRegeneration = true;
          reason = 'File not found';
        } else {
          // Check file size
          const stats = await fs.stat(currentPath);
          if (stats.size === 0) {
            needsRegeneration = true;
            reason = 'File is empty';
          } else {
            // Check PDF validity
            try {
              const buffer = await fs.readFile(currentPath);
              if (!buffer.slice(0, 4).equals(Buffer.from('%PDF'))) {
                needsRegeneration = true;
                reason = 'Invalid PDF header';
              } else if (!buffer.includes('%%EOF')) {
                needsRegeneration = true;
                reason = 'Missing PDF trailer';
              }
            } catch (readError) {
              needsRegeneration = true;
              reason = `Read error: ${readError.message}`;
            }
          }
        }

        if (needsRegeneration && magazine.pages && magazine.pages.length > 0) {
          // Try to regenerate from existing pages
          console.log(`Attempting to regenerate PDF for: ${magazine.title}`);

          // This is a simplified regeneration - in practice, you'd need to reconstruct the PDF
          // For now, we'll mark it as needing manual intervention
          results.push({
            id: magazine.id,
            title: magazine.title,
            reason,
            status: 'needs_manual_regeneration',
            pagesAvailable: magazine.pages.length
          });
        } else if (needsRegeneration) {
          results.push({
            id: magazine.id,
            title: magazine.title,
            reason,
            status: 'cannot_regenerate',
            pagesAvailable: magazine.pages ? magazine.pages.length : 0
          });
        } else {
          results.push({
            id: magazine.id,
            title: magazine.title,
            status: 'ok'
          });
        }

      } catch (error) {
        results.push({
          id: magazine.id,
          title: magazine.title,
          error: error.message,
          status: 'error'
        });
      }
    }

    const summary = {
      total: magazines.length,
      ok: results.filter(r => r.status === 'ok').length,
      needsRegeneration: results.filter(r => r.status === 'needs_manual_regeneration').length,
      cannotRegenerate: results.filter(r => r.status === 'cannot_regenerate').length,
      errors: results.filter(r => r.status === 'error').length
    };

    res.json({ summary, results });

  } catch (error) {
    console.error('Error regenerating PDFs:', error);
    res.status(500).json({ error: 'Failed to regenerate PDFs' });
  }
};

// Automatic access type update (should be called by a cron job)
exports.updateExpiredAccessTypes = async () => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const expiredMagazines = await FlipbookMagazine.findAll({
      where: {
        accessType: 'free',
        publishedAt: {
          [Op.lt]: twoMonthsAgo
        }
      }
    });

    for (const magazine of expiredMagazines) {
      await magazine.update({ accessType: 'download' });
      console.log(`Updated access type for magazine: ${magazine.title}`);
    }

    return expiredMagazines.length;
  } catch (error) {
    console.error('Error updating expired access types:', error);
    return 0;
  }
};