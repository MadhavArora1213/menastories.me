const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VideoAnalytics = sequelize.define('VideoAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  videoId: {
    type: DataTypes.UUID,
    allowNull: false
    // Temporarily removed foreign key reference to allow sync
    // references: {
    //   model: 'VideoArticles',
    //   key: 'id'
    // }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true // Null for anonymous users
    // Temporarily removed foreign key reference to allow sync
    // references: {
    //   model: 'Users',
    //   key: 'id'
    // }
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: true // For tracking anonymous sessions
  },
  eventType: {
    type: DataTypes.ENUM(
      'view_start',
      'view_complete',
      'view_pause',
      'view_resume',
      'view_seek',
      'quality_change',
      'share',
      'like',
      'comment',
      'download',
      'embed_view'
    ),
    allowNull: false
  },
  watchTime: {
    type: DataTypes.INTEGER, // Watch time in seconds for this session
    allowNull: true,
    defaultValue: 0
  },
  totalDuration: {
    type: DataTypes.INTEGER, // Total video duration in seconds
    allowNull: true
  },
  currentTime: {
    type: DataTypes.INTEGER, // Current playback position in seconds
    allowNull: true
  },
  quality: {
    type: DataTypes.STRING(10), // e.g., '720p', '1080p'
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
    type: DataTypes.STRING(2), // ISO country code
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
    type: DataTypes.STRING(45), // IPv6 compatible
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON, // Additional event-specific data
    allowNull: true,
    defaultValue: {}
  },
  eventTimestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'video_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['videoId']
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
      fields: ['videoId', 'eventType']
    },
    {
      fields: ['videoId', 'eventTimestamp']
    }
  ]
});

// Instance methods
VideoAnalytics.prototype.getEventDetails = function() {
  return {
    id: this.id,
    eventType: this.eventType,
    watchTime: this.watchTime,
    currentTime: this.currentTime,
    quality: this.quality,
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
VideoAnalytics.getVideoStats = async function(videoId, startDate = null, endDate = null) {
  const whereClause = { videoId };

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
      [require('sequelize').fn('SUM', require('sequelize').col('watchTime')), 'totalWatchTime'],
      [require('sequelize').fn('AVG', require('sequelize').col('watchTime')), 'avgWatchTime']
    ],
    group: ['eventType'],
    raw: true
  });

  return stats.reduce((acc, stat) => {
    acc[stat.eventType] = {
      count: parseInt(stat.count),
      totalWatchTime: parseInt(stat.totalWatchTime || 0),
      avgWatchTime: parseFloat(stat.avgWatchTime || 0)
    };
    return acc;
  }, {});
};

VideoAnalytics.getDeviceStats = async function(videoId, startDate = null, endDate = null) {
  const whereClause = { videoId };

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

VideoAnalytics.getGeographicStats = async function(videoId, startDate = null, endDate = null) {
  const whereClause = { videoId };

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

VideoAnalytics.getWatchTimeDistribution = async function(videoId, startDate = null, endDate = null) {
  const whereClause = {
    videoId,
    eventType: 'view_complete'
  };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const completions = await this.findAll({
    where: whereClause,
    attributes: ['watchTime', 'totalDuration'],
    raw: true
  });

  const distribution = {
    fullViews: 0, // 90-100% watched
    highEngagement: 0, // 50-89% watched
    mediumEngagement: 0, // 25-49% watched
    lowEngagement: 0, // 1-24% watched
    bounces: 0 // 0% watched
  };

  completions.forEach(completion => {
    const watchPercentage = completion.totalDuration > 0
      ? (completion.watchTime / completion.totalDuration) * 100
      : 0;

    if (watchPercentage >= 90) {
      distribution.fullViews++;
    } else if (watchPercentage >= 50) {
      distribution.highEngagement++;
    } else if (watchPercentage >= 25) {
      distribution.mediumEngagement++;
    } else if (watchPercentage > 0) {
      distribution.lowEngagement++;
    } else {
      distribution.bounces++;
    }
  });

  return distribution;
};

VideoAnalytics.getRealtimeStats = async function(videoId, minutes = 5) {
  const startTime = new Date(Date.now() - minutes * 60 * 1000);

  const stats = await this.findAll({
    where: {
      videoId,
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

module.exports = VideoAnalytics;