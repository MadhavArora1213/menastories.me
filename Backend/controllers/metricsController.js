const { ContentMetric } = require('../models');
const { validationResult } = require('express-validator');

// Track article view
exports.trackView = async (req, res) => {
  try {
    const { contentId, contentType, isUnique } = req.body;
    
    // Get today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Find or create metrics for this content on this date
    let [metric, created] = await ContentMetric.findOrCreate({
      where: {
        contentId,
        contentType,
        date: today
      },
      defaults: {
        views: 1,
        uniqueViews: isUnique ? 1 : 0,
        shares: 0,
        comments: 0,
        likes: 0
      }
    });
    
    // If metric already exists, update it
    if (!created) {
      await metric.update({
        views: metric.views + 1,
        uniqueViews: isUnique ? metric.uniqueViews + 1 : metric.uniqueViews
      });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track article share
exports.trackShare = async (req, res) => {
  try {
    const { contentId, contentType, platform } = req.body;
    
    // Get today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Find or create metrics for this content on this date
    let [metric, created] = await ContentMetric.findOrCreate({
      where: {
        contentId,
        contentType,
        date: today
      },
      defaults: {
        views: 0,
        uniqueViews: 0,
        shares: 1,
        comments: 0,
        likes: 0
      }
    });
    
    // If metric already exists, update it
    if (!created) {
      await metric.update({
        shares: metric.shares + 1
      });
    }
    
    // Record the platform where content was shared (optional)
    console.log(`Content shared on ${platform}`);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track share error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track article comment
exports.trackComment = async (req, res) => {
  try {
    const { contentId, contentType } = req.body;
    
    // Get today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Find or create metrics for this content on this date
    let [metric, created] = await ContentMetric.findOrCreate({
      where: {
        contentId,
        contentType,
        date: today
      },
      defaults: {
        views: 0,
        uniqueViews: 0,
        shares: 0,
        comments: 1,
        likes: 0
      }
    });
    
    // If metric already exists, update it
    if (!created) {
      await metric.update({
        comments: metric.comments + 1
      });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};