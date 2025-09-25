const { Tag, ContentTag, Article } = require('../models');
const slugify = require('slugify');

// Get all tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [
        {
          model: require('../models/Category'),
          as: 'tagCategory',
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });

    // Populate category field for frontend compatibility
    const tagsWithCategory = tags.map(tag => {
      const tagData = tag.toJSON();
      if (tagData.tagCategory) {
        tagData.category = tagData.tagCategory.name;
      }
      return tagData;
    });

    res.status(200).json({ tags: tagsWithCategory });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const { name, type = 'regular', categoryId, category, parentId, description } = req.body;
    const userId = req.admin?.id;
    const userRole = req.admin?.role?.name || req.admin?.role;

    console.log('Create tag request:', { name, type, categoryId, category, parentId, description });

    // Check permissions - only Master Admin can create new tags
    if (userRole !== 'Master Admin') {
      return res.status(403).json({
        message: 'You do not have permission to create new tags. Please contact a Master Admin.'
      });
    }

    // Generate slug
    const slug = slugify(name, { lower: true });

    // Check if tag already exists
    const existingTag = await Tag.findOne({ where: { name } });
    if (existingTag) {
      return res.status(400).json({ message: 'Tag with this name already exists' });
    }

    // Validate parentId if provided
    if (parentId) {
      const parentTag = await Tag.findByPk(parentId);
      if (!parentTag) {
        return res.status(400).json({ message: 'Parent tag not found' });
      }
    }

    // Validate categoryId if provided
    let validatedCategoryId = categoryId;
    if (categoryId) {
      const Category = require('../models/Category');
      const categoryRecord = await Category.findByPk(categoryId);
      if (!categoryRecord) {
        return res.status(400).json({ message: 'Category not found' });
      }
      // If category name is provided but doesn't match, use the one from DB
      if (category && category !== categoryRecord.name) {
        console.log('Category name mismatch, using DB value:', categoryRecord.name);
      }
    }

    // Create tag
    const tag = await Tag.create({
      name,
      slug,
      type,
      categoryId: validatedCategoryId,
      parentId,
      description
    });

    // Fetch the created tag with category information
    const createdTag = await Tag.findByPk(tag.id, {
      include: [
        {
          model: require('../models/Category'),
          as: 'tagCategory',
          attributes: ['id', 'name']
        }
      ]
    });

    // Populate category field for frontend compatibility
    const tagData = createdTag.toJSON();
    if (tagData.tagCategory) {
      tagData.category = tagData.tagCategory.name;
    }

    console.log('Created tag:', tagData);

    res.status(201).json({
      message: 'Tag created successfully',
      tag: tagData
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add tags to content
exports.addTagsToContent = async (req, res) => {
  try {
    const { contentId, contentType, tagIds } = req.body;
    
    // Check if content exists (for articles)
    if (contentType === 'article') {
      const article = await Article.findByPk(contentId);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
    }
    
    // Verify all tags exist
    const tags = await Tag.findAll({
      where: { id: tagIds }
    });
    
    if (tags.length !== tagIds.length) {
      return res.status(400).json({ message: 'One or more tags do not exist' });
    }
    
    // Add tags to content
    const tagPromises = tagIds.map(tagId => 
      ContentTag.findOrCreate({
        where: {
          contentId,
          contentType,
          tagId
        }
      })
    );
    
    await Promise.all(tagPromises);
    
    res.status(200).json({
      message: 'Tags added successfully',
      contentId,
      contentType,
      tags: tags.map(tag => ({ id: tag.id, name: tag.name }))
    });
  } catch (error) {
    console.error('Add tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove tag from content
exports.removeTagFromContent = async (req, res) => {
  try {
    const { contentId, contentType, tagId } = req.body;
    
    await ContentTag.destroy({
      where: {
        contentId,
        contentType,
        tagId
      }
    });
    
    res.status(200).json({
      message: 'Tag removed successfully'
    });
  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get content by tag
exports.getContentByTag = async (req, res) => {
  try {
    const { tagSlug } = req.params;
    const { limit = 10, page = 1, contentType } = req.query;
    
    // Find tag by slug
    const tag = await Tag.findOne({ where: { slug: tagSlug } });
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    // Build query based on content type
    const query = {
      include: [
        {
          model: Tag,
          where: { id: tag.id },
          through: { attributes: [] }
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };
    
    if (contentType === 'article') {
      // For articles, only show published
      query.where = { status: 'published' };
      query.order = [['publishDate', 'DESC']];
      
      const articles = await Article.findAndCountAll(query);
      
      return res.status(200).json({
        tag,
        articles: articles.rows,
        totalCount: articles.count,
        page: parseInt(page),
        totalPages: Math.ceil(articles.count / parseInt(limit))
      });
    } else {
      // For generic content (future expansion)
      res.status(400).json({ message: 'Unsupported content type' });
    }
  } catch (error) {
    console.error('Get content by tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tags by type
exports.getTagsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const tags = await Tag.findAll({
      where: { type },
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({ tags });
  } catch (error) {
    console.error('Get tags by type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tag by id
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id, {
      include: [
        {
          model: require('../models/Category'),
          as: 'tagCategory',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Populate category field for frontend compatibility
    const tagData = tag.toJSON();
    if (tagData.tagCategory) {
      tagData.category = tagData.tagCategory.name;
    }

    res.status(200).json({ tag: tagData });
  } catch (error) {
    console.error('Get tag by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update tag
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, categoryId, category, parentId, description } = req.body;

    console.log('Update tag request:', { id, name, type, categoryId, category, parentId, description });

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Validate parentId if provided
    if (parentId) {
      const parentTag = await Tag.findByPk(parentId);
      if (!parentTag) {
        return res.status(400).json({ message: 'Parent tag not found' });
      }
    }

    // Validate categoryId if provided
    let validatedCategoryId = categoryId !== undefined ? categoryId : tag.categoryId;
    if (categoryId) {
      const Category = require('../models/Category');
      const categoryRecord = await Category.findByPk(categoryId);
      if (!categoryRecord) {
        return res.status(400).json({ message: 'Category not found' });
      }
      // If category name is provided but doesn't match, use the one from DB
      if (category && category !== categoryRecord.name) {
        console.log('Category name mismatch, using DB value:', categoryRecord.name);
      }
    }

    // Update tag properties
    tag.name = name || tag.name;
    tag.type = type || tag.type;
    tag.categoryId = validatedCategoryId;
    tag.parentId = parentId !== undefined ? parentId : tag.parentId;
    tag.description = description !== undefined ? description : tag.description;

    await tag.save();

    // Fetch the updated tag with category information
    const updatedTag = await Tag.findByPk(tag.id, {
      include: [
        {
          model: require('../models/Category'),
          as: 'tagCategory',
          attributes: ['id', 'name']
        }
      ]
    });

    // Populate category field for frontend compatibility
    const tagData = updatedTag.toJSON();
    if (tagData.tagCategory) {
      tagData.category = tagData.tagCategory.name;
    }

    console.log('Updated tag:', tagData);

    res.status(200).json({ message: 'Tag updated successfully', tag: tagData });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete tag
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    // Delete the tag
    await tag.destroy();
    
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Force delete tag (permanent deletion)
exports.forceDeleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if tag exists
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    // Remove all content associations first
    await ContentTag.destroy({
      where: { tagId: id }
    });
    
    // Permanently delete the tag
    await tag.destroy({ force: true });
    
    res.status(200).json({ message: 'Tag permanently deleted' });
  } catch (error) {
    console.error('Force delete tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllTags: exports.getAllTags,
  createTag: exports.createTag,
  addTagsToContent: exports.addTagsToContent,
  removeTagFromContent: exports.removeTagFromContent,
  getContentByTag: exports.getContentByTag,
  getTagsByType: exports.getTagsByType,
  getTagById: exports.getTagById,
  updateTag: exports.updateTag,
  deleteTag: exports.deleteTag,
  forceDeleteTag: exports.forceDeleteTag
};

