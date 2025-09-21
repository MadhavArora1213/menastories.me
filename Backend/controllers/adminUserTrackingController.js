const { User, UserArticleInteraction, Article, NewsletterSubscriber } = require('../models');
const { Op } = require('sequelize');

// Get overall user statistics
exports.getUserStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.count();

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.count({
      where: {
        lastLoginAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newUsersToday = await User.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    // Total articles
    const totalArticles = await Article.count({ where: { status: 'published' } });

    // Interaction stats
    const interactionStats = await UserArticleInteraction.findAll({
      attributes: [
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.literal('CASE WHEN isRead = 1 THEN 1 END')), 'totalReads'],
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.literal('CASE WHEN isLiked = 1 THEN 1 END')), 'totalLikes'],
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.literal('CASE WHEN isSaved = 1 THEN 1 END')), 'totalSaves'],
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.literal('CASE WHEN isShared = 1 THEN 1 END')), 'totalShares']
      ]
    });

    const stats = interactionStats[0]?.dataValues || {};

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        newUsersToday,
        totalArticles,
        totalReads: parseInt(stats.totalReads || 0),
        totalLikes: parseInt(stats.totalLikes || 0),
        totalSaves: parseInt(stats.totalSaves || 0),
        totalShares: parseInt(stats.totalShares || 0)
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to get user stats' });
  }
};

// Get top active users
exports.getTopUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Calculate activity scores for users
    const usersWithScores = await UserArticleInteraction.findAll({
      attributes: [
        'userId',
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.literal('CASE WHEN isRead = 1 THEN 1 END')), 'readsCount'],
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.literal('CASE WHEN isLiked = 1 THEN 1 END')), 'likesCount'],
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.literal('CASE WHEN isSaved = 1 THEN 1 END')), 'savesCount'],
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.literal('CASE WHEN isShared = 1 THEN 1 END')), 'sharesCount'],
        [UserArticleInteraction.sequelize.fn('MAX', UserArticleInteraction.sequelize.col('updatedAt')), 'lastActivity']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'createdAt', 'lastLoginAt']
        }
      ],
      where: {
        userId: { [Op.ne]: null }
      },
      group: ['userId', 'user.id', 'user.name', 'user.email', 'user.createdAt', 'user.lastLoginAt'],
      order: [[UserArticleInteraction.sequelize.literal('(COUNT(CASE WHEN isRead = 1 THEN 1 END) + COUNT(CASE WHEN isLiked = 1 THEN 1 END) * 2 + COUNT(CASE WHEN isSaved = 1 THEN 1 END) * 3 + COUNT(CASE WHEN isShared = 1 THEN 1 END) * 5)'), 'DESC']],
      limit: parseInt(limit)
    });

    const users = usersWithScores.map(item => {
      const reads = parseInt(item.dataValues.readsCount || 0);
      const likes = parseInt(item.dataValues.likesCount || 0);
      const saves = parseInt(item.dataValues.savesCount || 0);
      const shares = parseInt(item.dataValues.sharesCount || 0);

      // Calculate activity score
      const activityScore = reads + (likes * 2) + (saves * 3) + (shares * 5);

      return {
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
        activityScore,
        articlesRead: reads,
        likesCount: likes,
        savesCount: saves,
        sharesCount: shares,
        lastActivity: item.dataValues.lastActivity,
        joinDate: item.user.createdAt,
        lastLogin: item.user.lastLoginAt
      };
    });

    res.json({ users });
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({ message: 'Failed to get top users' });
  }
};

// Get recent user activity
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const activities = await UserArticleInteraction.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Article,
          as: 'article',
          attributes: ['id', 'title', 'slug']
        }
      ],
      where: {
        [Op.or]: [
          { isRead: true },
          { isLiked: true },
          { isSaved: true },
          { isShared: true }
        ]
      },
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit)
    });

    const formattedActivities = activities.map(activity => {
      let type = 'view';
      let description = '';

      if (activity.isShared) {
        type = 'share';
        description = `Shared article "${activity.article?.title || 'Unknown'}" on ${activity.sharedPlatform || 'unknown platform'}`;
      } else if (activity.isSaved) {
        type = 'save';
        description = `Saved article "${activity.article?.title || 'Unknown'}"`;
      } else if (activity.isLiked) {
        type = 'like';
        description = `Liked article "${activity.article?.title || 'Unknown'}"`;
      } else if (activity.isRead) {
        type = 'read';
        description = `Read article "${activity.article?.title || 'Unknown'}"`;
      }

      return {
        id: activity.id,
        type,
        userId: activity.userId,
        userName: activity.user?.name || 'Unknown User',
        userEmail: activity.user?.email || '',
        articleId: activity.articleId,
        articleTitle: activity.article?.title || 'Unknown Article',
        articleSlug: activity.article?.slug || '',
        description,
        platform: activity.sharedPlatform,
        deviceType: activity.deviceType,
        timestamp: activity.updatedAt,
        timeSpent: activity.timeSpent
      };
    });

    res.json({ activities: formattedActivities });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Failed to get recent activity' });
  }
};

// Get engagement metrics
exports.getEngagementMetrics = async (req, res) => {
  try {
    // Average session duration (time spent reading)
    const avgSessionResult = await UserArticleInteraction.findAll({
      attributes: [
        [UserArticleInteraction.sequelize.fn('AVG', UserArticleInteraction.sequelize.col('timeSpent')), 'avgSessionDuration']
      ],
      where: {
        timeSpent: { [Op.ne]: null },
        isRead: true
      }
    });

    const avgSessionDuration = parseInt(avgSessionResult[0]?.dataValues?.avgSessionDuration || 0);

    // Average articles per user
    const totalUsersWithActivity = await UserArticleInteraction.count({
      distinct: true,
      col: 'userId',
      where: { isRead: true }
    });

    const totalReads = await UserArticleInteraction.count({
      where: { isRead: true }
    });

    const averageArticlesPerUser = totalUsersWithActivity > 0 ? totalReads / totalUsersWithActivity : 0;

    // Most read category
    const categoryStats = await UserArticleInteraction.findAll({
      attributes: [
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.col('UserArticleInteraction.id')), 'readCount']
      ],
      include: [
        {
          model: Article,
          as: 'article',
          attributes: ['categoryId'],
          include: [
            {
              model: require('../models').Category,
              as: 'category',
              attributes: ['name']
            }
          ]
        }
      ],
      where: { isRead: true },
      group: ['article.categoryId', 'article.category.id', 'article.category.name'],
      order: [[UserArticleInteraction.sequelize.literal('COUNT(UserArticleInteraction.id)'), 'DESC']],
      limit: 1
    });

    const mostReadCategory = categoryStats[0]?.article?.category?.name || 'N/A';

    // Peak activity hour
    const hourlyStats = await UserArticleInteraction.findAll({
      attributes: [
        [UserArticleInteraction.sequelize.fn('HOUR', UserArticleInteraction.sequelize.col('createdAt')), 'hour'],
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.col('id')), 'activityCount']
      ],
      group: [UserArticleInteraction.sequelize.fn('HOUR', UserArticleInteraction.sequelize.col('createdAt'))],
      order: [[UserArticleInteraction.sequelize.literal('COUNT(id)'), 'DESC']],
      limit: 1
    });

    const peakActivityHour = parseInt(hourlyStats[0]?.dataValues?.hour || 0);

    res.json({
      metrics: {
        averageSessionDuration: avgSessionDuration,
        averageArticlesPerUser: parseFloat(averageArticlesPerUser.toFixed(2)),
        mostReadCategory,
        peakActivityHour
      }
    });
  } catch (error) {
    console.error('Get engagement metrics error:', error);
    res.status(500).json({ message: 'Failed to get engagement metrics' });
  }
};

// Get user reading streaks
exports.getUserStreaks = async (req, res) => {
  try {
    const usersWithStreaks = await UserArticleInteraction.findAll({
      attributes: [
        'userId',
        [UserArticleInteraction.sequelize.fn('COUNT', UserArticleInteraction.sequelize.literal('DISTINCT DATE(createdAt)')), 'activeDays'],
        [UserArticleInteraction.sequelize.fn('MAX', UserArticleInteraction.sequelize.col('createdAt')), 'lastActivity']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      where: {
        isRead: true,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      group: ['userId', 'user.id', 'user.name', 'user.email'],
      having: UserArticleInteraction.sequelize.literal('COUNT(DISTINCT DATE(createdAt)) >= 7'),
      order: [[UserArticleInteraction.sequelize.literal('COUNT(DISTINCT DATE(createdAt))'), 'DESC']]
    });

    const streaks = usersWithStreaks.map(item => ({
      userId: item.userId,
      userName: item.user.name,
      userEmail: item.user.email,
      currentStreak: parseInt(item.dataValues.activeDays),
      lastActivity: item.dataValues.lastActivity
    }));

    res.json({ streaks });
  } catch (error) {
    console.error('Get user streaks error:', error);
    res.status(500).json({ message: 'Failed to get user streaks' });
  }
};

// Get newsletter subscriber statistics
exports.getNewsletterStats = async (req, res) => {
  try {
    const totalSubscribers = await NewsletterSubscriber.count();
    const activeSubscribers = await NewsletterSubscriber.count({
      where: { status: 'active' }
    });
    const whatsappEnabled = await NewsletterSubscriber.count({
      where: { whatsappConsent: true }
    });

    // Recent subscriptions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSubscriptions = await NewsletterSubscriber.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    res.json({
      stats: {
        totalSubscribers,
        activeSubscribers,
        whatsappEnabled,
        recentSubscriptions,
        conversionRate: totalSubscribers > 0 ? ((activeSubscribers / totalSubscribers) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({ message: 'Failed to get newsletter stats' });
  }
};

module.exports = {
  getUserStats: exports.getUserStats,
  getTopUsers: exports.getTopUsers,
  getRecentActivity: exports.getRecentActivity,
  getEngagementMetrics: exports.getEngagementMetrics,
  getUserStreaks: exports.getUserStreaks,
  getNewsletterStats: exports.getNewsletterStats
};