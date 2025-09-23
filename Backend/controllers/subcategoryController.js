const { Subcategory, Category } = require('../models');
const { validationResult } = require('express-validator');
const slugify = require('slugify');
const { ImageUploadService } = require('../services/imageUploadService');
const imageService = new ImageUploadService();

// Get all subcategories with pagination and optional slug filtering
exports.getAllSubcategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const slug = req.query.slug; // Support slug filtering
    const categoryId = req.query.categoryId; // Support category filtering

    console.log('Backend received query params:', { page, limit, slug, categoryId, query: req.query });

    // If limit is very high (like 1000), return all subcategories without pagination
    const shouldReturnAll = limit >= 1000;

    // Build where clause for filtering
    let whereClause = {};
    if (slug) {
      whereClause.slug = slug;
    }
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Get total count for pagination
    const totalCount = await Subcategory.count({ where: whereClause });
    console.log('Total subcategories in database:', totalCount);

    let subcategories;
    let queryOptions = {
      where: whereClause,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['categoryId', 'ASC'], ['order', 'ASC']],
      attributes: { exclude: [] } // Ensure all fields are selected, including featureImage
    };

    if (shouldReturnAll) {
      // Return all subcategories without pagination
      console.log('Returning all subcategories without pagination');
      subcategories = await Subcategory.findAll(queryOptions);
    } else {
      // Use pagination
      const offset = (page - 1) * limit;
      queryOptions.limit = limit;
      queryOptions.offset = offset;
      subcategories = await Subcategory.findAll(queryOptions);
    }

    console.log('Subcategories found:', subcategories.length);
    console.log('Sample subcategory featureImage values:');
    subcategories.slice(0, 3).forEach((sub, index) => {
      console.log(`  ${index + 1}. ${sub.name}:`, sub.featureImage);
    });

    const totalPages = shouldReturnAll ? 1 : Math.ceil(totalCount / limit);

    res.json({
      success: true,
      count: subcategories.length,
      totalCount: totalCount,
      totalPages: totalPages,
      currentPage: shouldReturnAll ? 1 : page,
      data: subcategories,
      pagination: {
        page: shouldReturnAll ? 1 : page,
        limit: shouldReturnAll ? totalCount : limit,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNextPage: shouldReturnAll ? false : page < totalPages,
        hasPrevPage: shouldReturnAll ? false : page > 1,
        nextPage: shouldReturnAll ? null : (page < totalPages ? page + 1 : null),
        prevPage: shouldReturnAll ? null : (page > 1 ? page - 1 : null)
      }
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
      error: error.message
    });
  }
};

// Get subcategory by ID
exports.getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await Subcategory.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    res.json({
      success: true,
      data: subcategory
    });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategory',
      error: error.message
    });
  }
};

// Get subcategories by category ID
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.findAll({
      where: { categoryId },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['order', 'ASC']]
    });

    res.json({
      success: true,
      count: subcategories.length,
      data: subcategories
    });
  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
      error: error.message
    });
  }
};

// Create new subcategory
exports.createSubcategory = async (req, res) => {
  let uploadedImagePath = null;
  let tempFilePath = null;

  try {
    console.log('=== SUBCATEGORY CREATE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? 'File present' : 'No file');
    console.log('Request headers:', req.headers);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      categoryId,
      type = 'regular',
      status = 'active',
      order = 0,
      featureImage,
      metaTitle,
      metaDescription
    } = req.body;

    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    let counter = 1;
    let originalSlug = slug;

    while (await Subcategory.findOne({ where: { slug } })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    // Store temp file path for later processing (don't process yet)
    if (req.file) {
      tempFilePath = req.file.path;
    }

    // Process image first if provided
    let finalFeatureImage = null;
    if (tempFilePath && require('fs').existsSync(tempFilePath)) {
      try {
        console.log('🔄 Processing uploaded image with WebP optimization...');
        const processedFilename = await imageService.processImage(tempFilePath, {
          width: 1200,
          quality: 80, // Higher quality for WebP
          format: 'webp' // Use WebP for better compression
        });

        finalFeatureImage = imageService.generateImageUrl(processedFilename);
        uploadedImagePath = processedFilename; // Store for cleanup on error

        console.log('✅ Image processed successfully:', processedFilename);
        console.log('📸 Generated image URL:', finalFeatureImage);
      } catch (imageError) {
        console.error('❌ Error processing image:', imageError);
        finalFeatureImage = null;
      }
    }

    // Create subcategory WITH the processed image URL (if available)
    const subcategory = await Subcategory.create({
      name,
      slug,
      description,
      categoryId,
      type,
      status,
      order,
      featureImage: finalFeatureImage, // Store the image URL directly
      metaTitle,
      metaDescription,
      isActive: true
    });

    console.log('✅ Subcategory created successfully with ID:', subcategory.id);
    console.log('📝 Final subcategory data:', {
      id: subcategory.id,
      name: subcategory.name,
      featureImage: subcategory.featureImage
    });

    // Verify the image URL was stored correctly
    if (finalFeatureImage) {
      const verifySubcategory = await Subcategory.findByPk(subcategory.id);
      console.log('🔍 Database verification - Stored featureImage:', verifySubcategory.featureImage);

      if (verifySubcategory.featureImage !== finalFeatureImage) {
        console.error('❌ Image URL not stored correctly in database!');
        console.error('Expected:', finalFeatureImage);
        console.error('Actual:', verifySubcategory.featureImage);

        // Try to update it again
        await verifySubcategory.update({ featureImage: finalFeatureImage });
        console.log('🔄 Attempted to fix image URL in database');
      } else {
        console.log('✅ Image URL correctly stored in database');
      }
    }

    // Clean up temp file safely (only if image processing failed)
    if (tempFilePath && require('fs').existsSync(tempFilePath) && !finalFeatureImage) {
      if (imageService.safeDeleteFile) {
        await imageService.safeDeleteFile(tempFilePath);
      } else {
        // Fallback to synchronous delete if safeDeleteFile is not available
        try {
          const fs = require('fs');
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temp file (fallback):', cleanupError);
        }
      }
    }

    // Fetch with category info
    const createdSubcategory = await Subcategory.findByPk(subcategory.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    console.log('🎉 Final subcategory data being returned:', {
      id: createdSubcategory.id,
      name: createdSubcategory.name,
      featureImage: createdSubcategory.featureImage,
      hasImage: !!createdSubcategory.featureImage
    });

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: createdSubcategory
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);

    // Clean up uploaded image if it was processed but subcategory creation failed
    if (uploadedImagePath) {
      try {
        await imageService.deleteImage(uploadedImagePath);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded image:', cleanupError);
      }
    }

    // Clean up temp file safely
    if (tempFilePath && require('fs').existsSync(tempFilePath)) {
      if (imageService.safeDeleteFile) {
        try {
          await imageService.safeDeleteFile(tempFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      } else {
        // Fallback to synchronous delete if safeDeleteFile is not available
        try {
          const fs = require('fs');
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temp file (fallback):', cleanupError);
        }
      }
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Subcategory with this name already exists',
        error: 'Duplicate entry'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create subcategory',
      error: error.message
    });
  }
};

// Update subcategory
exports.updateSubcategory = async (req, res) => {
  let uploadedImagePath = null;
  let tempFilePath = null;

  try {
    const { id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('=== VALIDATION ERRORS ===');
      console.log('Validation errors found:', errors.array());
      console.log('Request body:', req.body);
      console.log('Request file:', req.file ? 'File present' : 'No file');

      const errorDetails = errors.array();
      const formattedErrors = errorDetails.map(err => {
        if (err && err.msg) {
          return `${err.param || 'field'}: ${err.msg}`;
        }
        return 'Validation error occurred';
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorDetails,
        formattedMessage: formattedErrors.join(', ')
      });
    }

    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    const {
      name,
      description,
      categoryId,
      type,
      status,
      order,
      featureImage,
      metaTitle,
      metaDescription
    } = req.body;

    // Verify category exists if categoryId is provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }

    // Generate new slug if name changed
    let slug = subcategory.slug;
    if (name && name !== subcategory.name) {
      slug = slugify(name, { lower: true, strict: true });

      // Check if new slug already exists
      let counter = 1;
      let originalSlug = slug;

      while (await Subcategory.findOne({
        where: { slug, id: { [require('sequelize').Op.ne]: id } }
      })) {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    // Store temp file path for later processing (don't process yet)
    if (req.file) {
      tempFilePath = req.file.path;
    }

    // Process image first if provided
    let finalFeatureImage = subcategory.featureImage; // Keep existing image by default
    if (tempFilePath && require('fs').existsSync(tempFilePath)) {
      try {
        console.log('🔄 Processing uploaded image with WebP optimization...');
        const processedFilename = await imageService.processImage(tempFilePath, {
          width: 1200,
          quality: 80, // Higher quality for WebP
          format: 'webp' // Use WebP for better compression
        });

        finalFeatureImage = imageService.generateImageUrl(processedFilename);
        uploadedImagePath = processedFilename; // Store for cleanup on error

        console.log('✅ Image processed successfully:', processedFilename);
        console.log('📸 Generated image URL:', finalFeatureImage);

        // Delete old image if it exists and is different from the new one
        if (subcategory.featureImage && subcategory.featureImage !== finalFeatureImage) {
          try {
            console.log('🗑️ Deleting old image:', subcategory.featureImage);
            await imageService.deleteImage(subcategory.featureImage);
            console.log('✅ Old image deleted successfully');
          } catch (deleteError) {
            console.error('❌ Error deleting old image:', deleteError);
            // Don't fail the update if old image deletion fails
          }
        }
      } catch (imageError) {
        console.error('❌ Error processing image:', imageError);
        finalFeatureImage = subcategory.featureImage; // Keep existing image on error
      }
    } else if (featureImage !== undefined) {
      // If no new file uploaded but featureImage is provided in body, use it
      finalFeatureImage = featureImage;
    }

    await subcategory.update({
      name: name || subcategory.name,
      slug,
      description: description !== undefined ? description : subcategory.description,
      categoryId: categoryId || subcategory.categoryId,
      type: type || subcategory.type,
      status: status || subcategory.status,
      order: order !== undefined ? order : subcategory.order,
      featureImage: finalFeatureImage,
      metaTitle: metaTitle !== undefined ? metaTitle : subcategory.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : subcategory.metaDescription
    });

    // Fetch updated subcategory with category info
    const updatedSubcategory = await Subcategory.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    console.log('✅ Subcategory updated successfully with ID:', updatedSubcategory.id);
    console.log('📝 Final subcategory data:', {
      id: updatedSubcategory.id,
      name: updatedSubcategory.name,
      featureImage: updatedSubcategory.featureImage,
      hasImage: !!updatedSubcategory.featureImage
    });

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: updatedSubcategory
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);

    // Clean up uploaded image if it was processed but subcategory update failed
    if (uploadedImagePath) {
      try {
        await imageService.deleteImage(uploadedImagePath);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded image:', cleanupError);
      }
    }

    // Clean up temp file safely
    if (tempFilePath && require('fs').existsSync(tempFilePath)) {
      if (imageService.safeDeleteFile) {
        try {
          await imageService.safeDeleteFile(tempFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      } else {
        // Fallback to synchronous delete if safeDeleteFile is not available
        try {
          const fs = require('fs');
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temp file (fallback):', cleanupError);
        }
      }
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Subcategory with this name already exists',
        error: 'Duplicate entry'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update subcategory',
      error: error.message
    });
  }
};

// Delete subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await Subcategory.findByPk(id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    await subcategory.destroy();

    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subcategory',
      error: error.message
    });
  }
};

// Toggle subcategory status
exports.toggleSubcategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await Subcategory.findByPk(id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    const newStatus = subcategory.status === 'active' ? 'inactive' : 'active';
    await subcategory.update({ status: newStatus });

    res.json({
      success: true,
      message: `Subcategory status updated to ${newStatus}`,
      data: { id: subcategory.id, status: newStatus }
    });
  } catch (error) {
    console.error('Error toggling subcategory status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle subcategory status',
      error: error.message
    });
  }
};

// Get subcategory statistics
exports.getSubcategoryStatistics = async (req, res) => {
  try {
    // Get total subcategories count
    const totalSubcategories = await Subcategory.count();

    // Get regular subcategories count
    const regularSubcategories = await Subcategory.count({
      where: { type: 'regular' }
    });

    // Get total categories count
    const totalCategories = await Category.count();

    res.json({
      success: true,
      data: {
        totalSubcategories,
        regularSubcategories,
        parentCategories: totalCategories
      }
    });
  } catch (error) {
    console.error('Error fetching subcategory statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategory statistics',
      error: error.message
    });
  }
};
