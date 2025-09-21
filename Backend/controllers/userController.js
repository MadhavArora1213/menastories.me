const { User, Article, UserArticleInteraction } = require('../models');
const { Op } = require('sequelize');

// Get user saved articles
exports.getSavedArticles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const savedArticles = await UserArticleInteraction.findAndCountAll({
      where: {
        userId,
        isSaved: true
      },
      include: [
        {
          model: Article,
          as: 'article',
          where: { status: 'published' },
          attributes: ['id', 'title', 'slug', 'excerpt', 'featuredImage', 'createdAt']
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const articles = savedArticles.rows.map(interaction => ({
      ...interaction.article.toJSON(),
      savedAt: interaction.updatedAt
    }));

    res.json({
      articles,
      totalCount: savedArticles.count,
      totalPages: Math.ceil(savedArticles.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get saved articles error:', error);
    res.status(500).json({ message: 'Failed to get saved articles' });
  }
};

// Get user liked articles
exports.getLikedArticles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const likedArticles = await UserArticleInteraction.findAndCountAll({
      where: {
        userId,
        isLiked: true
      },
      include: [
        {
          model: Article,
          as: 'article',
          where: { status: 'published' },
          attributes: ['id', 'title', 'slug', 'excerpt', 'featuredImage', 'createdAt']
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const articles = likedArticles.rows.map(interaction => ({
      ...interaction.article.toJSON(),
      likedAt: interaction.updatedAt
    }));

    res.json({
      articles,
      totalCount: likedArticles.count,
      totalPages: Math.ceil(likedArticles.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get liked articles error:', error);
    res.status(500).json({ message: 'Failed to get liked articles' });
  }
};

// Save/unsave article
exports.toggleSaveArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;

    // Check if article exists
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Find or create interaction
    let interaction = await UserArticleInteraction.findOne({
      where: { userId, articleId }
    });

    if (!interaction) {
      interaction = await UserArticleInteraction.create({
        userId,
        articleId,
        isSaved: true,
        firstSavedAt: new Date()
      });
    } else {
      interaction.isSaved = !interaction.isSaved;
      if (interaction.isSaved && !interaction.firstSavedAt) {
        interaction.firstSavedAt = new Date();
      }
      await interaction.save();
    }

    res.json({
      isSaved: interaction.isSaved,
      message: interaction.isSaved ? 'Article saved' : 'Article unsaved'
    });
  } catch (error) {
    console.error('Toggle save article error:', error);
    res.status(500).json({ message: 'Failed to toggle save article' });
  }
};

// Like/unlike article
exports.toggleLikeArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;

    // Check if article exists
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Find or create interaction
    let interaction = await UserArticleInteraction.findOne({
      where: { userId, articleId }
    });

    if (!interaction) {
      interaction = await UserArticleInteraction.create({
        userId,
        articleId,
        isLiked: true,
        firstLikedAt: new Date()
      });

      // Increment article like count
      await article.increment('likeCount');
    } else {
      const wasLiked = interaction.isLiked;
      interaction.isLiked = !interaction.isLiked;

      if (interaction.isLiked && !interaction.firstLikedAt) {
        interaction.firstLikedAt = new Date();
        await article.increment('likeCount');
      } else if (!interaction.isLiked && wasLiked) {
        await article.decrement('likeCount');
      }

      await interaction.save();
    }

    res.json({
      isLiked: interaction.isLiked,
      message: interaction.isLiked ? 'Article liked' : 'Article unliked'
    });
  } catch (error) {
    console.error('Toggle like article error:', error);
    res.status(500).json({ message: 'Failed to toggle like article' });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get interaction stats
    const interactions = await UserArticleInteraction.findAll({
      where: { userId },
      attributes: [
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.col('id')), 'totalInteractions'],
        [UserArticleInteraction.sequelize.fn('SUM', UserArticleInteraction.sequelize.literal('CASE WHEN isSaved = 1 THEN 1 ELSE 0 END')), 'totalSaves'],
        [UserArticleInteraction.sequelize.fn('SUM', UserArticleInteraction.sequelize.literal('CASE WHEN isLiked = 1 THEN 1 ELSE 0 END')), 'totalLikes'],
        [UserArticleInteraction.sequelize.fn('SUM', UserArticleInteraction.sequelize.literal('CASE WHEN isRead = 1 THEN 1 ELSE 0 END')), 'totalReads']
      ]
    });

    // Calculate daily streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyStreak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayInteractions = await UserArticleInteraction.findAll({
        where: {
          userId,
          updatedAt: {
            [Op.between]: [dayStart, dayEnd]
          },
          [Op.or]: [
            { isRead: true },
            { isSaved: true },
            { isLiked: true }
          ]
        }
      });

      if (dayInteractions.length > 0) {
        dailyStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Get user join date and last activity
    const user = await User.findByPk(userId, {
      attributes: ['createdAt', 'lastLoginAt']
    });

    res.json({
      stats: {
        dailyStreak,
        totalArticlesRead: parseInt(interactions[0]?.dataValues?.totalReads || 0),
        totalLikes: parseInt(interactions[0]?.dataValues?.totalLikes || 0),
        totalSaves: parseInt(interactions[0]?.dataValues?.totalSaves || 0),
        joinDate: user.createdAt,
        lastActive: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to get user stats' });
  }
};

// Mark article as read
exports.markArticleAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;

    // Check if article exists
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Find or create interaction
    let interaction = await UserArticleInteraction.findOne({
      where: { userId, articleId }
    });

    if (!interaction) {
      interaction = await UserArticleInteraction.create({
        userId,
        articleId,
        isRead: true,
        firstReadAt: new Date()
      });

      // Increment article view count
      await article.increment('viewCount');
    } else if (!interaction.isRead) {
      interaction.isRead = true;
      interaction.firstReadAt = new Date();
      await interaction.save();

      // Increment article view count
      await article.increment('viewCount');
    }

    res.json({
      isRead: true,
      message: 'Article marked as read'
    });
  } catch (error) {
    console.error('Mark article as read error:', error);
    res.status(500).json({ message: 'Failed to mark article as read' });
  }
};

// Get reading history
exports.getReadingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const readingHistory = await UserArticleInteraction.findAndCountAll({
      where: {
        userId,
        isRead: true
      },
      include: [
        {
          model: Article,
          as: 'article',
          where: { status: 'published' },
          attributes: ['id', 'title', 'slug', 'excerpt', 'featuredImage', 'readingTime']
        }
      ],
      order: [['firstReadAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const articles = readingHistory.rows.map(interaction => ({
      ...interaction.article.toJSON(),
      readAt: interaction.firstReadAt,
      timeSpent: interaction.timeSpent
    }));

    res.json({
      articles,
      totalCount: readingHistory.count,
      totalPages: Math.ceil(readingHistory.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get reading history error:', error);
    res.status(500).json({ message: 'Failed to get reading history' });
  }
};

module.exports = {
  getSavedArticles: exports.getSavedArticles,
  getLikedArticles: exports.getLikedArticles,
  toggleSaveArticle: exports.toggleSaveArticle,
  toggleLikeArticle: exports.toggleLikeArticle,
  getUserStats: exports.getUserStats,
  markArticleAsRead: exports.markArticleAsRead,
  getReadingHistory: exports.getReadingHistory
};