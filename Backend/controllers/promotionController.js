const { Article, ContentCampaign } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Get promoted content
exports.getPromotedContent = async (req, res) => {
  try {
    const now = new Date();
    
    // Get featured articles
    const featuredArticles = await Article.findAll({
      where: { featured: true, status: 'published' },
      limit: 5
    });
    
    // Get pinned articles
    const pinnedArticles = await Article.findAll({
      where: { pinned: true, status: 'published' },
      limit: 5
    });
    
    // Get trending articles
    const trendingArticles = await Article.findAll({
      where: { trending: true, status: 'published' },
      limit: 5
    });
    
    // Get sponsored articles
    const sponsoredArticles = await Article.findAll({
      where: { 
        sponsoredUntil: { [Op.gt]: now },
        status: 'published'
      },
      limit: 5
    });
    
    // Get boosted articles
    const boostedArticles = await Article.findAll({
      where: { boostLevel: { [Op.gt]: 0 }, status: 'published' },
      order: [['boostLevel', 'DESC']],
      limit: 5
    });
    
    res.status(200).json({
      featuredArticles,
      pinnedArticles,
      trendingArticles,
      sponsoredArticles,
      boostedArticles
    });
  } catch (error) {
    console.error('Get promoted content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update article promotion status
exports.updateArticlePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      featured, pinned, trending, sponsoredUntil, boostLevel,
      promotionCategory, seasonal, campaignId, showOnHomepage
    } = req.body;
    
    // Check if article exists
    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Update promotion fields
    await article.update({
      featured: featured !== undefined ? featured : article.featured,
      pinned: pinned !== undefined ? pinned : article.pinned,
      trending: trending !== undefined ? trending : article.trending,
      sponsoredUntil: sponsoredUntil !== undefined ? sponsoredUntil : article.sponsoredUntil,
      boostLevel: boostLevel !== undefined ? boostLevel : article.boostLevel,
      promotionCategory: promotionCategory !== undefined ? promotionCategory : article.promotionCategory,
      seasonal: seasonal !== undefined ? seasonal : article.seasonal,
      campaignId: campaignId !== undefined ? campaignId : article.campaignId,
      showOnHomepage: showOnHomepage !== undefined ? showOnHomepage : article.showOnHomepage
    });
    
    res.status(200).json({ message: 'Article promotion updated' });
  } catch (error) {
    console.error('Update article promotion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await ContentCampaign.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ campaigns });
  } catch (error) {
    console.error('Get all campaigns error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create campaign
exports.createCampaign = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, targetAudience, budget, goals } = req.body;

    const campaign = await ContentCampaign.create({
      name,
      description,
      startDate,
      endDate,
      targetAudience,
      budget,
      goals
    });

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};