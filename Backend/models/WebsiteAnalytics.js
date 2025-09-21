const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WebsiteAnalytics = sequelize.define('WebsiteAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  eventType: {
    type: DataTypes.ENUM(
      'page_view',
      'session_start',
      'session_end',
      'user_engagement',
      'scroll_depth',
      'time_on_page',
      'bounce',
      'conversion',
      'search_performed',
      'social_share',
      'newsletter_signup',
      'contact_form_submit',
      'download_initiated',
      'video_play',
      'article_read',
      'comment_posted',
      'user_registration',
      'user_login',
      'error_occurred'
    ),
    allowNull: false
  },
  pageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  pageTitle: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  referrer: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl(value) {
        if (!value) return true; // Allow null/empty values
        try {
          const url = new URL(value);
          // Allow http and https protocols, including localhost
          return ['http:', 'https:'].includes(url.protocol);
        } catch {
          return false;
        }
      }
    }
  },
  referrerDomain: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  campaignSource: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  campaignMedium: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  campaignName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  campaignTerm: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  campaignContent: {
    type: DataTypes.STRING(100),
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
  screenResolution: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  viewportSize: {
    type: DataTypes.STRING(20),
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
  language: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sessionDuration: {
    type: DataTypes.INTEGER, // Duration in seconds
    allowNull: true
  },
  pageLoadTime: {
    type: DataTypes.INTEGER, // Page load time in milliseconds
    allowNull: true
  },
  timeOnPage: {
    type: DataTypes.INTEGER, // Time spent on page in seconds
    allowNull: true
  },
  scrollDepth: {
    type: DataTypes.DECIMAL(5, 2), // Scroll depth as percentage
    allowNull: true
  },
  isBounce: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  isConversion: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  conversionType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  conversionValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  searchQuery: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  searchResults: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  errorType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
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
  tableName: 'website_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['sessionId']
    },
    {
      fields: ['userId']
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
      fields: ['pageUrl']
    },
    {
      fields: ['referrerDomain']
    },
    {
      fields: ['campaignSource']
    },
    {
      fields: ['sessionId', 'eventTimestamp']
    }
  ]
});

// Instance methods
WebsiteAnalytics.prototype.getEventDetails = function() {
  return {
    id: this.id,
    eventType: this.eventType,
    pageInfo: {
      url: this.pageUrl,
      title: this.pageTitle
    },
    traffic: {
      referrer: this.referrer,
      referrerDomain: this.referrerDomain,
      campaign: {
        source: this.campaignSource,
        medium: this.campaignMedium,
        name: this.campaignName,
        term: this.campaignTerm,
        content: this.campaignContent
      }
    },
    deviceInfo: {
      type: this.deviceType,
      browser: this.browser,
      os: this.os,
      screenResolution: this.screenResolution,
      viewportSize: this.viewportSize
    },
    location: {
      country: this.country,
      region: this.region,
      city: this.city,
      language: this.language,
      timezone: this.timezone
    },
    engagement: {
      sessionDuration: this.sessionDuration,
      pageLoadTime: this.pageLoadTime,
      timeOnPage: this.timeOnPage,
      scrollDepth: this.scrollDepth,
      isBounce: this.isBounce
    },
    conversion: {
      isConversion: this.isConversion,
      conversionType: this.conversionType,
      conversionValue: this.conversionValue
    },
    timestamp: this.eventTimestamp,
    metadata: this.metadata
  };
};

// Static methods for analytics queries
WebsiteAnalytics.getTrafficStats = async function(startDate = null, endDate = null) {
  const whereClause = {};

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
      [require('sequelize').fn('COUNT', require('sequelize').fn('DISTINCT', require('sequelize').col('sessionId'))), 'uniqueSessions']
    ],
    group: ['eventType'],
    raw: true
  });

  return stats.reduce((acc, stat) => {
    acc[stat.eventType] = {
      count: parseInt(stat.count),
      uniqueSessions: parseInt(stat.uniqueSessions)
    };
    return acc;
  }, {});
};

WebsiteAnalytics.getPageStats = async function(startDate = null, endDate = null, limit = 20) {
  const whereClause = { eventType: 'page_view' };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'pageUrl',
      'pageTitle',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'pageViews'],
      [require('sequelize').fn('COUNT', require('sequelize').fn('DISTINCT', require('sequelize').col('sessionId'))), 'uniqueVisitors'],
      [require('sequelize').fn('AVG', require('sequelize').col('timeOnPage')), 'avgTimeOnPage'],
      [require('sequelize').fn('AVG', require('sequelize').col('scrollDepth')), 'avgScrollDepth']
    ],
    group: ['pageUrl', 'pageTitle'],
    raw: true,
    order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
    limit
  });

  return stats.map(stat => ({
    pageUrl: stat.pageUrl,
    pageTitle: stat.pageTitle,
    pageViews: parseInt(stat.pageViews),
    uniqueVisitors: parseInt(stat.uniqueVisitors),
    avgTimeOnPage: parseFloat(stat.avgTimeOnPage || 0),
    avgScrollDepth: parseFloat(stat.avgScrollDepth || 0)
  }));
};

WebsiteAnalytics.getDeviceStats = async function(startDate = null, endDate = null) {
  const whereClause = {};

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

WebsiteAnalytics.getGeographicStats = async function(startDate = null, endDate = null) {
  const whereClause = {};

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

WebsiteAnalytics.getTrafficSources = async function(startDate = null, endDate = null) {
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'referrerDomain',
      'campaignSource',
      'campaignMedium',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['referrerDomain', 'campaignSource', 'campaignMedium'],
    raw: true,
    order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
  });

  return stats.map(stat => ({
    referrerDomain: stat.referrerDomain,
    campaignSource: stat.campaignSource,
    campaignMedium: stat.campaignMedium,
    count: parseInt(stat.count)
  }));
};

WebsiteAnalytics.getConversionStats = async function(startDate = null, endDate = null) {
  const whereClause = { isConversion: true };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'conversionType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('conversionValue')), 'totalValue']
    ],
    group: ['conversionType'],
    raw: true
  });

  return stats.map(stat => ({
    conversionType: stat.conversionType,
    count: parseInt(stat.count),
    totalValue: parseFloat(stat.totalValue || 0)
  }));
};

WebsiteAnalytics.getRealtimeStats = async function(minutes = 5) {
  const startTime = new Date(Date.now() - minutes * 60 * 1000);

  const stats = await this.findAll({
    where: {
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

WebsiteAnalytics.getEngagementMetrics = async function(startDate = null, endDate = null) {
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const metrics = {
    totalSessions: 0,
    totalPageViews: 0,
    avgSessionDuration: 0,
    avgPageLoadTime: 0,
    bounceRate: 0,
    conversionRate: 0
  };

  // Get session stats
  const sessionStats = await this.findAll({
    where: { ...whereClause, eventType: 'session_start' },
    attributes: [
      [require('sequelize').fn('COUNT', require('sequelize').fn('DISTINCT', require('sequelize').col('sessionId'))), 'totalSessions']
    ],
    raw: true
  });

  metrics.totalSessions = parseInt(sessionStats[0]?.totalSessions || 0);

  // Get page view stats
  const pageViewStats = await this.findAll({
    where: { ...whereClause, eventType: 'page_view' },
    attributes: [
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalPageViews'],
      [require('sequelize').fn('AVG', require('sequelize').col('sessionDuration')), 'avgSessionDuration'],
      [require('sequelize').fn('AVG', require('sequelize').col('pageLoadTime')), 'avgPageLoadTime']
    ],
    raw: true
  });

  metrics.totalPageViews = parseInt(pageViewStats[0]?.totalPageViews || 0);
  metrics.avgSessionDuration = parseFloat(pageViewStats[0]?.avgSessionDuration || 0);
  metrics.avgPageLoadTime = parseFloat(pageViewStats[0]?.avgPageLoadTime || 0);

  // Get bounce rate
  const bounceStats = await this.findAll({
    where: { ...whereClause, isBounce: true },
    attributes: [
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'bounceCount']
    ],
    raw: true
  });

  const bounceCount = parseInt(bounceStats[0]?.bounceCount || 0);
  metrics.bounceRate = metrics.totalSessions > 0 ? (bounceCount / metrics.totalSessions) * 100 : 0;

  // Get conversion rate
  const conversionStats = await this.findAll({
    where: { ...whereClause, isConversion: true },
    attributes: [
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'conversionCount']
    ],
    raw: true
  });

  const conversionCount = parseInt(conversionStats[0]?.conversionCount || 0);
  metrics.conversionRate = metrics.totalSessions > 0 ? (conversionCount / metrics.totalSessions) * 100 : 0;

  return metrics;
};

module.exports = WebsiteAnalytics;