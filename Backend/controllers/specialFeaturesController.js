const { Article, SpecialFeature, ContentMetric, Tag, ContentTag } = require('../models');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const slugify = require('slugify');

// Get all special features
exports.getAllSpecialFeatures = async (req, res) => {
  try {
    const features = await SpecialFeature.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC']]
    });
    
    res.status(200).json({ features });
  } catch (error) {
    console.error('Get special features error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get content for trending section
exports.getTrendingContent = async (req, res) => {
  try {
    const { type = 'today', limit = 10 } = req.query;
    
    let timeFrame;
    let sortField = 'views';
    
    // Set time frame based on trending type
    switch (type) {
      case 'today':
        timeFrame = new Date();
        timeFrame.setHours(0, 0, 0, 0);
        break;
      case 'week':
        timeFrame = new Date();
        timeFrame.setDate(timeFrame.getDate() - 7);
        break;
      case 'month':
        timeFrame = new Date();
        timeFrame.setMonth(timeFrame.getMonth() - 1);
        break;
      case 'most_shared':
        timeFrame = new Date();
        timeFrame.setMonth(timeFrame.getMonth() - 1);
        sortField = 'shares';
        break;
      case 'most_commented':
        timeFrame = new Date();
        timeFrame.setMonth(timeFrame.getMonth() - 1);
        sortField = 'comments';
        break;
      case 'editors_picks':
        // For editors picks, we'll use tags instead of metrics
        const articles = await Article.findAll({
          include: [
            {
              model: Tag,
              where: { name: 'Editors Pick' },
              through: { attributes: [] }
            }
          ],
          where: { status: 'published' },
          order: [['publishDate', 'DESC']],
          limit: parseInt(limit)
        });
        
        return res.status(200).json({ articles });
      default:
        timeFrame = new Date();
        timeFrame.setHours(0, 0, 0, 0);
    }
    
    // Get trending articles based on metrics
    const articles = await Article.findAll({
      attributes: ['id', 'title', 'slug', 'summary', 'featuredImage', 'publishDate', 'authorId'],
      include: [
        {
          model: ContentMetric,
          attributes: ['views', 'uniqueViews', 'shares', 'comments'],
          where: {
            date: { [Op.gte]: timeFrame },
            contentType: 'article'
          },
          required: true
        }
      ],
      where: { 
        status: 'published'
      },
      order: [[sequelize.literal(`"ContentMetrics"."${sortField}"`), 'DESC']],
      limit: parseInt(limit)
    });
    
    res.status(200).json({ articles });
  } catch (error) {
    console.error('Get trending content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add article to Editor's Picks
exports.addToEditorsPicks = async (req, res) => {
  try {
    const { articleId } = req.body;
    
    // Find the article
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Find or create Editors Pick tag
    const [tag] = await Tag.findOrCreate({
      where: { 
        name: 'Editors Pick',
        type: 'special_feature'
      },
      defaults: {
        slug: 'editors-pick',
        type: 'special_feature'
      }
    });
    
    // Check if article already has this tag
    const existingTag = await ContentTag.findOne({
      where: {
        contentId: articleId,
        contentType: 'article',
        tagId: tag.id
      }
    });
    
    if (existingTag) {
      return res.status(400).json({ message: 'Article is already in Editor\'s Picks' });
    }
    
    // Add the tag to the article
    await ContentTag.create({
      contentId: articleId,
      contentType: 'article',
      tagId: tag.id
    });
    
    res.status(200).json({ 
      message: 'Article added to Editor\'s Picks successfully',
      article: {
        id: article.id,
        title: article.title
      }
    });
  } catch (error) {
    console.error('Add to editors picks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new special feature section
exports.createSpecialFeature = async (req, res) => {
  try {
    const { name, type, settings } = req.body;
    
    // Generate slug
    const slug = slugify(name, { lower: true });
    
    // Create feature
    const feature = await SpecialFeature.create({
      name,
      slug,
      type,
      settings
    });
    
    // Create a corresponding tag for this feature
    await Tag.create({
      name,
      slug,
      type: 'special_feature'
    });
    
    res.status(201).json({
      message: 'Special feature created successfully',
      feature
    });
  } catch (error) {
    console.error('Create special feature error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};