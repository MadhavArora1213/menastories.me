const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FlipbookAnalytics = sequelize.define('FlipbookAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  flipbookId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'flipbook_magazines',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  eventType: {
    type: DataTypes.ENUM(
      'view_start',
      'view_complete',
      'page_view',
      'page_turn',
      'zoom_change',
      'fullscreen_enter',
      'fullscreen_exit',
      'download_start',
      'download_complete',
      'share',
      'bookmark',
      'print_attempt',
      'search',
      'annotation_add',
      'annotation_remove'
    ),
    allowNull: false
  },
  currentPage: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalPages: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  readTime: {
    type: DataTypes.INTEGER, // Time spent in seconds
    allowNull: true,
    defaultValue: 0
  },
  totalReadTime: {
    type: DataTypes.INTEGER, // Cumulative read time for session
    allowNull: true,
    defaultValue: 0
  },
  zoomLevel: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
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
  tableName: 'flipbook_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['flipbookId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['sessionId']
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
      fields: ['currentPage']
    },
    {
      fields: ['flipbookId', 'eventType']
    },
    {
      fields: ['flipbookId', 'eventTimestamp']
    },
    {
      fields: ['flipbookId', 'sessionId']
    }
  ]
});

// Instance methods
FlipbookAnalytics.prototype.getEventDetails = function() {
  return {
    id: this.id,
    eventType: this.eventType,
    pageInfo: {
      current: this.currentPage,
      total: this.totalPages
    },
    engagement: {
      readTime: this.readTime,
      totalReadTime: this.totalReadTime,
      zoomLevel: this.zoomLevel
    },
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
    timestamp: this.eventTimestamp,
    metadata: this.metadata
  };
};

// Static methods for analytics queries
FlipbookAnalytics.getFlipbookStats = async function(flipbookId, startDate = null, endDate = null) {
  const whereClause = { flipbookId };

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
      [require('sequelize').fn('SUM', require('sequelize').col('readTime')), 'totalReadTime'],
      [require('sequelize').fn('AVG', require('sequelize').col('readTime')), 'avgReadTime']
    ],
    group: ['eventType'],
    raw: true
  });

  return stats.reduce((acc, stat) => {
    acc[stat.eventType] = {
      count: parseInt(stat.count),
      totalReadTime: parseInt(stat.totalReadTime || 0),
      avgReadTime: parseFloat(stat.avgReadTime || 0)
    };
    return acc;
  }, {});
};

FlipbookAnalytics.getPageStats = async function(flipbookId, startDate = null, endDate = null) {
  const whereClause = {
    flipbookId,
    eventType: 'page_view'
  };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'currentPage',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'viewCount'],
      [require('sequelize').fn('AVG', require('sequelize').col('readTime')), 'avgTimeOnPage']
    ],
    group: ['currentPage'],
    raw: true,
    order: [['currentPage', 'ASC']]
  });

  return stats.map(stat => ({
    pageNumber: parseInt(stat.currentPage),
    viewCount: parseInt(stat.viewCount),
    avgTimeOnPage: parseFloat(stat.avgTimeOnPage || 0)
  }));
};

FlipbookAnalytics.getReadingProgress = async function(flipbookId, sessionId) {
  const events = await this.findAll({
    where: {
      flipbookId,
      sessionId,
      eventType: {
        [require('sequelize').Op.in]: ['page_view', 'view_complete']
      }
    },
    attributes: ['currentPage', 'totalPages', 'eventType', 'eventTimestamp'],
    order: [['eventTimestamp', 'ASC']],
    raw: true
  });

  if (events.length === 0) return null;

  const lastEvent = events[events.length - 1];
  const uniquePages = [...new Set(events.map(e => e.currentPage))];

  return {
    sessionId,
    currentPage: lastEvent.currentPage,
    totalPages: lastEvent.totalPages,
    uniquePagesViewed: uniquePages.length,
    completionPercentage: lastEvent.totalPages > 0
      ? Math.round((uniquePages.length / lastEvent.totalPages) * 100)
      : 0,
    isCompleted: events.some(e => e.eventType === 'view_complete'),
    lastActivity: lastEvent.eventTimestamp
  };
};

FlipbookAnalytics.getDeviceStats = async function(flipbookId, startDate = null, endDate = null) {
  const whereClause = { flipbookId };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'deviceType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['deviceType'],
    raw: true
  });

  return stats.reduce((acc, stat) => {
    acc[stat.deviceType] = parseInt(stat.count);
    return acc;
  }, {});
};

FlipbookAnalytics.getGeographicStats = async function(flipbookId, startDate = null, endDate = null) {
  const whereClause = { flipbookId };

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
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['country', 'region', 'city'],
    raw: true,
    order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
  });

  return stats.map(stat => ({
    country: stat.country,
    region: stat.region,
    city: stat.city,
    count: parseInt(stat.count)
  }));
};

FlipbookAnalytics.getRealtimeStats = async function(flipbookId, minutes = 5) {
  const startTime = new Date(Date.now() - minutes * 60 * 1000);

  const stats = await this.findAll({
    where: {
      flipbookId,
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

FlipbookAnalytics.getEngagementMetrics = async function(flipbookId, startDate = null, endDate = null) {
  const whereClause = { flipbookId };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const metrics = {
    totalViews: 0,
    uniqueSessions: 0,
    avgReadTime: 0,
    completionRate: 0,
    bounceRate: 0,
    pageViews: 0
  };

  // Get total views
  const totalViews = await this.count({ where: { ...whereClause, eventType: 'view_start' } });
  metrics.totalViews = totalViews;

  // Get unique sessions
  const uniqueSessions = await this.count({
    where: whereClause,
    distinct: true,
    col: 'sessionId'
  });
  metrics.uniqueSessions = uniqueSessions;

  // Get average read time
  const readTimeStats = await this.findAll({
    where: { ...whereClause, eventType: 'view_complete' },
    attributes: [
      [require('sequelize').fn('AVG', require('sequelize').col('totalReadTime')), 'avgReadTime']
    ],
    raw: true
  });
  metrics.avgReadTime = parseFloat(readTimeStats[0]?.avgReadTime || 0);

  // Get completion rate
  const completions = await this.count({ where: { ...whereClause, eventType: 'view_complete' } });
  metrics.completionRate = totalViews > 0 ? (completions / totalViews) * 100 : 0;

  // Get page views
  const pageViews = await this.count({ where: { ...whereClause, eventType: 'page_view' } });
  metrics.pageViews = pageViews;

  return metrics;
};

module.exports = FlipbookAnalytics;