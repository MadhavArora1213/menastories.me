const { Category } = require('../models');
// const allowedCategories = require('../config/allowedCategories'); // Disabled for full CRUD flexibility
const { validationResult } = require('express-validator');
const slugify = require('slugify');
const { ImageUploadService } = require('../services/imageUploadService');
const imageService = new ImageUploadService();

// Get all categories with pagination and optional slug filtering
exports.getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const slug = req.query.slug; // Support slug filtering

    let whereClause = '';
    let bindParams = [limit, offset];

    // If slug is provided, filter by slug
    if (slug) {
      whereClause = 'WHERE "slug" = $3';
      bindParams = [limit, offset, slug];
    }

    // Get total count for pagination
    let totalCount;
    if (slug) {
      totalCount = await Category.count({ where: { slug } });
    } else {
      totalCount = await Category.count();
    }

    // Use raw SQL to bypass Sequelize table name issues
    const { sequelize } = require('../models');
    console.log('Executing raw SQL query for categories...');
    const results = await sequelize.query(`
      SELECT * FROM "Categories"
      ${whereClause}
      ORDER BY "order" ASC, "createdAt" DESC
      LIMIT $1 OFFSET $2
    `, {
      bind: bindParams,
      type: sequelize.QueryTypes.SELECT
    });
    console.log('Raw SQL query executed successfully, found', results.length, 'categories');
    const categories = results;

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      count: categories.length,
      totalCount: totalCount,
      totalPages: totalPages,
      currentPage: page,
      data: categories,
      pagination: {
        page: page,
        limit: limit,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [{
        model: require('../models').Subcategory,
        as: 'categorySubcategories',
        attributes: ['id', 'name', 'slug', 'description', 'status', 'order'],
        order: [['order', 'ASC']]
      }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  let uploadedImagePath = null;
  let tempFilePath = null;

  try {
    console.log('=== CATEGORY CREATE DEBUG ===');
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
      design = 'design1',
      status = 'active',
      featureImage,
      parentId,
      order = 0
    } = req.body;

    // Convert empty string parentId to null for root categories
    const processedParentId = (parentId === '' || parentId === undefined) ? null : parentId;

    console.log('Extracted data:', { name, description, design, status, featureImage, parentId, order });

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // Check if category with same slug already exists
    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Whitelist validation disabled - allow any category name
    console.log('Whitelist validation disabled - allowing any category name');
    console.log('Requested category name:', name);

    if (processedParentId) {
      const parent = await Category.findByPk(processedParentId);
      if (!parent) {
        return res.status(400).json({ success: false, message: 'Invalid parentId' });
      }
    }

    // Store temp file path for later processing (don't process yet)
    if (req.file) {
      tempFilePath = req.file.path;
    }

    // Create category first WITHOUT image (to avoid storage waste)
    const category = await Category.create({
      name,
      slug,
      description,
      design,
      status,
      featureImage: null, // Will be updated after successful creation
      parentId: processedParentId,
      order,
      isActive: true
    });

    console.log('✅ Category created successfully with ID:', category.id);

    // NOW process the image only if category creation succeeded
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

        // Update category with the processed image URL
        await category.update({ featureImage: finalFeatureImage });

        console.log('✅ Image processed and category updated successfully:', processedFilename);
      } catch (imageError) {
        console.error('❌ Error processing image:', imageError);
        // Don't fail the entire request if image processing fails
        // Category is already created successfully
        console.log('⚠️ Category created but image processing failed - category remains without image');
      }
    }

    // Clean up temp file
    if (tempFilePath && require('fs').existsSync(tempFilePath)) {
      require('fs').unlinkSync(tempFilePath);
    }

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);

    // Clean up uploaded image if it was processed but category creation failed
    if (uploadedImagePath) {
      try {
        await imageService.deleteImage(uploadedImagePath);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded image:', cleanupError);
      }
    }

    // Clean up temp file if it exists
    if (tempFilePath && require('fs').existsSync(tempFilePath)) {
      require('fs').unlinkSync(tempFilePath);
    }

    // Handle Neon DB specific errors
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please check your Neon DB connection.',
        error: 'Database temporarily unavailable'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
        error: 'Duplicate entry'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const {
      name,
      description,
      design,
      status,
      featureImage,
      parentId,
      order
    } = req.body;

    // Convert empty string parentId to null for root categories
    const processedParentId = (parentId === '' || parentId === undefined) ? null : parentId;

    // Generate new slug if name changed
    let slug = category.slug;
    if (name && name !== category.name) {
      slug = slugify(name, { lower: true, strict: true });
      
      // Check if new slug already exists
      const existingCategory = await Category.findOne({ 
        where: { slug, id: { [require('sequelize').Op.ne]: id } }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Whitelist validation for updates disabled - allow any category name
    console.log('Update whitelist validation disabled - allowing any category name');
    if (processedParentId !== null) {
      const parent = await Category.findByPk(processedParentId);
      if (!parent) {
        return res.status(400).json({ success: false, message: 'Invalid parentId' });
      }
    }

    // Update category
    await category.update({
      name: name || category.name,
      slug,
      description: description !== undefined ? description : category.description,
      design: design || category.design,
      status: status || category.status,
      featureImage: featureImage !== undefined ? featureImage : category.featureImage,
      parentId: parentId !== undefined ? processedParentId : category.parentId,
      order: order !== undefined ? order : category.order
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);

    // Handle Neon DB specific errors
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please check your Neon DB connection.',
        error: 'Database temporarily unavailable'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
        error: 'Duplicate entry'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [
        {
          model: require('../models').Category,
          as: 'subcategories',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check for dependent records that might prevent deletion
    const subcategoriesCount = category.subcategories ? category.subcategories.length : 0;

    console.log(`Deleting category "${category.name}" with ${subcategoriesCount} subcategories`);

    // Use transaction for safe deletion
    const { sequelize } = require('../models');
    const transaction = await sequelize.transaction();

    try {
      await category.destroy({ transaction });

      await transaction.commit();

      console.log(`✅ Category "${category.name}" deleted successfully`);

      res.json({
        success: true,
        message: 'Category deleted successfully',
        data: {
          deletedCategory: {
            id: category.id,
            name: category.name,
            subcategoriesDeleted: subcategoriesCount
          }
        }
      });
    } catch (deleteError) {
      await transaction.rollback();

      console.error('Error during category deletion:', deleteError);

      // Handle specific database constraint errors
      if (deleteError.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete category due to existing dependencies',
          error: 'Foreign key constraint violation',
          details: 'This category may have articles, subcategories, or other dependent records that prevent deletion.'
        });
      }

      throw deleteError; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Error deleting category:', error);

    // Handle Neon DB specific errors
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please check your Neon DB connection.',
        error: 'Database temporarily unavailable'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

// Toggle category status
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    await category.update({ status: newStatus });

    res.json({
      success: true,
      message: `Category status updated to ${newStatus}`,
      data: { id: category.id, status: newStatus }
    });
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle category status',
      error: error.message
    });
  }
};

// Update category design
exports.updateCategoryDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const { design } = req.body;

    if (!design || !['design1', 'design2', 'design3'].includes(design)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid design. Must be design1, design2, or design3'
      });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.update({ design });

    res.json({
      success: true,
      message: 'Category design updated successfully',
      data: { id: category.id, design }
    });
  } catch (error) {
    console.error('Error updating category design:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category design',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories: exports.getAllCategories,
  getCategoryById: exports.getCategoryById,
  createCategory: exports.createCategory,
  updateCategory: exports.updateCategory,
  deleteCategory: exports.deleteCategory,
  toggleCategoryStatus: exports.toggleCategoryStatus,
  updateCategoryDesign: exports.updateCategoryDesign
};