const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserEngagementAnalytics = sequelize.define('UserEngagementAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  contentType: {
    type: DataTypes.ENUM(
      'article',
      'video_article',
      'event',
      'flipbook',
      'download',
      'comment',
      'user_profile',
      'newsletter'
    ),
    allowNull: false
  },
  eventType: {
    type: DataTypes.ENUM(
      'view',
      'like',
      'unlike',
      'share',
      'bookmark',
      'unbookmark',
      'comment',
      'reply',
      'vote_up',
      'vote_down',
      'follow',
      'unfollow',
      'subscribe',
      'unsubscribe',
      'download',
      'rate',
      'review',
      'report',
      'hide',
      'save',
      'unsave'
    ),
    allowNull: false
  },
  platform: {
    type: DataTypes.ENUM(
      'website',
      'mobile_app',
      'social_facebook',
      'social_twitter',
      'social_linkedin',
      'social_whatsapp',
      'social_telegram',
      'email',
      'api'
    ),
    allowNull: false,
    defaultValue: 'website'
  },
  deviceType: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet', 'tv', 'unknown'),
    allowNull: false,
    defaultValue: 'unknown'
  },
  browser: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  os: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  referrer: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  engagementScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    comment: 'Score based on engagement type (view=1, like=5, share=10, comment=15, etc.)'
  },
  timeSpent: {
    type: DataTypes.INTEGER, // Time spent in seconds
    allowNull: true
  },
  interactionDepth: {
    type: DataTypes.DECIMAL(3, 2), // 0-1 scale of interaction depth
    allowNull: true
  },
  sentiment: {
    type: DataTypes.ENUM('positive', 'neutral', 'negative'),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  eventTimestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_engagement_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['sessionId']
    },
    {
      fields: ['contentId', 'contentType']
    },
    {
      fields: ['eventType']
    },
    {
      fields: ['eventTimestamp']
    },
    {
      fields: ['deviceType']
    },
    {
      fields: ['country']
    },
    {
      fields: ['platform']
    },
    {
      fields: ['engagementScore']
    },
    {
      fields: ['userId', 'eventTimestamp']
    },
    {
      fields: ['contentId', 'contentType', 'eventType']
    }
  ]
});

// Instance methods
UserEngagementAnalytics.prototype.getEngagementDetails = function() {
  return {
    id: this.id,
    eventType: this.eventType,
    content: {
      id: this.contentId,
      type: this.contentType
    },
    platform: this.platform,
    deviceInfo: {
      type: this.deviceType,
      browser: this.browser,
      os: this.os
    },
    location: {
      country: this.country,
      region: this.region,
      city: this.city
    },
    engagement: {
      score: this.engagementScore,
      timeSpent: this.timeSpent,
      interactionDepth: this.interactionDepth,
      sentiment: this.sentiment
    },
    timestamp: this.eventTimestamp,
    metadata: this.metadata
  };
};

// Calculate engagement score based on event type
UserEngagementAnalytics.prototype.calculateEngagementScore = function() {
  const scores = {
    'view': 1,
    'like': 5,
    'unlike': -5,
    'share': 10,
    'bookmark': 3,
    'unbookmark': -3,
    'comment': 15,
    'reply': 8,
    'vote_up': 7,
    'vote_down': -7,
    'follow': 12,
    'unfollow': -12,
    'subscribe': 20,
    'unsubscribe': -20,
    'download': 25,
    'rate': 10,
    'review': 18,
    'report': -15,
    'hide': -10,
    'save': 4,
    'unsave': -4
  };

  return scores[this.eventType] || 1;
};

// Static methods for analytics queries
UserEngagementAnalytics.getUserEngagementStats = async function(userId, startDate = null, endDate = null) {
  const whereClause = { userId };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'eventType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('engagementScore')), 'totalScore'],
      [require('sequelize').fn('AVG', require('sequelize').col('timeSpent')), 'avgTimeSpent']
    ],
    group: ['eventType'],
    raw: true
  });

  return stats.reduce((acc, stat) => {
    acc[stat.eventType] = {
      count: parseInt(stat.count),
      totalScore: parseInt(stat.totalScore || 0),
      avgTimeSpent: parseFloat(stat.avgTimeSpent || 0)
    };
    return acc;
  }, {});
};

UserEngagementAnalytics.getContentEngagementStats = async function(contentId, contentType, startDate = null, endDate = null) {
  const whereClause = { contentId, contentType };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'eventType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      [require('sequelize').fn('COUNT', require('sequelize').fn('DISTINCT', require('sequelize').col('userId'))), 'uniqueUsers'],
      [require('sequelize').fn('SUM', require('sequelize').col('engagementScore')), 'totalEngagementScore']
    ],
    group: ['eventType'],
    raw: true
  });

  return stats.reduce((acc, stat) => {
    acc[stat.eventType] = {
      count: parseInt(stat.count),
      uniqueUsers: parseInt(stat.uniqueUsers),
      totalEngagementScore: parseInt(stat.totalEngagementScore || 0)
    };
    return acc;
  }, {});
};

UserEngagementAnalytics.getTopEngagedContent = async function(contentType, limit = 10, startDate = null, endDate = null) {
  const whereClause = { contentType };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'contentId',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalInteractions'],
      [require('sequelize').fn('COUNT', require('sequelize').fn('DISTINCT', require('sequelize').col('userId'))), 'uniqueUsers'],
      [require('sequelize').fn('SUM', require('sequelize').col('engagementScore')), 'totalEngagementScore'],
      [require('sequelize').fn('AVG', require('sequelize').col('engagementScore')), 'avgEngagementScore']
    ],
    group: ['contentId'],
    raw: true,
    order: [[require('sequelize').fn('SUM', require('sequelize').col('engagementScore')), 'DESC']],
    limit
  });

  return stats.map(stat => ({
    contentId: stat.contentId,
    totalInteractions: parseInt(stat.totalInteractions),
    uniqueUsers: parseInt(stat.uniqueUsers),
    totalEngagementScore: parseInt(stat.totalEngagementScore || 0),
    avgEngagementScore: parseFloat(stat.avgEngagementScore || 0)
  }));
};

UserEngagementAnalytics.getEngagementTrends = async function(contentType, startDate, endDate, groupBy = 'day') {
  const whereClause = { contentType };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = require('sequelize').fn('DATE_FORMAT', require('sequelize').col('eventTimestamp'), '%Y-%m-%d %H:00:00');
      break;
    case 'day':
      dateFormat = require('sequelize').fn('DATE', require('sequelize').col('eventTimestamp'));
      break;
    case 'week':
      dateFormat = require('sequelize').fn('DATE_FORMAT', require('sequelize').col('eventTimestamp'), '%Y-%U');
      break;
    case 'month':
      dateFormat = require('sequelize').fn('DATE_FORMAT', require('sequelize').col('eventTimestamp'), '%Y-%m');
      break;
    default:
      dateFormat = require('sequelize').fn('DATE', require('sequelize').col('eventTimestamp'));
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      [dateFormat, 'period'],
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalInteractions'],
      [require('sequelize').fn('COUNT', require('sequelize').fn('DISTINCT', require('sequelize').col('userId'))), 'uniqueUsers'],
      [require('sequelize').fn('SUM', require('sequelize').col('engagementScore')), 'totalEngagementScore'],
      [require('sequelize').fn('AVG', require('sequelize').col('engagementScore')), 'avgEngagementScore']
    ],
    group: [dateFormat],
    raw: true,
    order: [[dateFormat, 'ASC']]
  });

  return stats.map(stat => ({
    period: stat.period,
    totalInteractions: parseInt(stat.totalInteractions),
    uniqueUsers: parseInt(stat.uniqueUsers),
    totalEngagementScore: parseInt(stat.totalEngagementScore || 0),
    avgEngagementScore: parseFloat(stat.avgEngagementScore || 0)
  }));
};

UserEngagementAnalytics.getDeviceEngagementStats = async function(contentType, startDate = null, endDate = null) {
  const whereClause = { contentType };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'deviceType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('engagementScore')), 'totalScore'],
      [require('sequelize').fn('AVG', require('sequelize').col('engagementScore')), 'avgScore']
    ],
    group: ['deviceType'],
    raw: true
  });

  return stats.reduce((acc, stat) => {
    acc[stat.deviceType] = {
      count: parseInt(stat.count),
      totalScore: parseInt(stat.totalScore || 0),
      avgScore: parseFloat(stat.avgScore || 0)
    };
    return acc;
  }, {});
};

UserEngagementAnalytics.getGeographicEngagementStats = async function(contentType, startDate = null, endDate = null) {
  const whereClause = { contentType };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'country',
      'region',
      'city',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('engagementScore')), 'totalScore']
    ],
    group: ['country', 'region', 'city'],
    raw: true,
    order: [[require('sequelize').fn('SUM', require('sequelize').col('engagementScore')), 'DESC']]
  });

  return stats.map(stat => ({
    country: stat.country,
    region: stat.region,
    city: stat.city,
    count: parseInt(stat.count),
    totalScore: parseInt(stat.totalScore || 0)
  }));
};

UserEngagementAnalytics.getRealtimeEngagementStats = async function(contentType, minutes = 5) {
  const startTime = new Date(Date.now() - minutes * 60 * 1000);

  const stats = await this.findAll({
    where: {
      contentType,
      eventTimestamp: {
        [require('sequelize').Op.gte]: startTime
      }
    },
    attributes: [
      'eventType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['eventType'],
    raw: true
  });

  return stats.reduce((acc, stat) => {
    acc[stat.eventType] = parseInt(stat.count);
    return acc;
  }, {});
};

module.exports = UserEngagementAnalytics;