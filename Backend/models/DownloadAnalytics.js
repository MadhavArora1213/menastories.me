const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DownloadAnalytics = sequelize.define('DownloadAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  downloadId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'downloads',
      key: 'id'
    }
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
  eventType: {
    type: DataTypes.ENUM(
      'view',
      'download_start',
      'download_complete',
      'download_cancelled',
      'preview_view',
      'share',
      'bookmark',
      'rating_submit',
      'feedback_submit',
      'report_issue'
    ),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER, // Size in bytes at time of download
    allowNull: true
  },
  downloadSpeed: {
    type: DataTypes.INTEGER, // Download speed in bytes per second
    allowNull: true
  },
  downloadTime: {
    type: DataTypes.INTEGER, // Time taken to download in seconds
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
  tableName: 'download_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['downloadId']
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
      fields: ['downloadId', 'eventType']
    },
    {
      fields: ['downloadId', 'eventTimestamp']
    }
  ]
});

// Instance methods
DownloadAnalytics.prototype.getEventDetails = function() {
  return {
    id: this.id,
    eventType: this.eventType,
    downloadInfo: {
      fileSize: this.fileSize,
      downloadSpeed: this.downloadSpeed,
      downloadTime: this.downloadTime
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
DownloadAnalytics.getDownloadStats = async function(downloadId, startDate = null, endDate = null) {
  const whereClause = { downloadId };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
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

DownloadAnalytics.getConversionStats = async function(downloadId, startDate = null, endDate = null) {
  const whereClause = { downloadId };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const conversion = {
    views: 0,
    downloads_started: 0,
    downloads_completed: 0,
    conversion_rate: 0
  };

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'eventType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['eventType'],
    raw: true
  });

  stats.forEach(stat => {
    const count = parseInt(stat.count);
    switch (stat.eventType) {
      case 'view':
        conversion.views = count;
        break;
      case 'download_start':
        conversion.downloads_started = count;
        break;
      case 'download_complete':
        conversion.downloads_completed = count;
        break;
    }
  });

  conversion.conversion_rate = conversion.views > 0
    ? (conversion.downloads_completed / conversion.views) * 100
    : 0;

  return conversion;
};

DownloadAnalytics.getDeviceStats = async function(downloadId, startDate = null, endDate = null) {
  const whereClause = { downloadId };

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

DownloadAnalytics.getGeographicStats = async function(downloadId, startDate = null, endDate = null) {
  const whereClause = { downloadId };

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

DownloadAnalytics.getPerformanceStats = async function(downloadId, startDate = null, endDate = null) {
  const whereClause = {
    downloadId,
    eventType: 'download_complete'
  };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      [require('sequelize').fn('AVG', require('sequelize').col('downloadTime')), 'avgDownloadTime'],
      [require('sequelize').fn('AVG', require('sequelize').col('downloadSpeed')), 'avgDownloadSpeed'],
      [require('sequelize').fn('MIN', require('sequelize').col('downloadTime')), 'minDownloadTime'],
      [require('sequelize').fn('MAX', require('sequelize').col('downloadTime')), 'maxDownloadTime'],
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalDownloads']
    ],
    raw: true
  });

  if (stats.length === 0) {
    return {
      avgDownloadTime: 0,
      avgDownloadSpeed: 0,
      minDownloadTime: 0,
      maxDownloadTime: 0,
      totalDownloads: 0
    };
  }

  const stat = stats[0];
  return {
    avgDownloadTime: parseFloat(stat.avgDownloadTime || 0),
    avgDownloadSpeed: parseFloat(stat.avgDownloadSpeed || 0),
    minDownloadTime: parseFloat(stat.minDownloadTime || 0),
    maxDownloadTime: parseFloat(stat.maxDownloadTime || 0),
    totalDownloads: parseInt(stat.totalDownloads || 0)
  };
};

DownloadAnalytics.getRealtimeStats = async function(downloadId, minutes = 5) {
  const startTime = new Date(Date.now() - minutes * 60 * 1000);

  const stats = await this.findAll({
    where: {
      downloadId,
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

DownloadAnalytics.getTopDownloads = async function(limit = 10, startDate = null, endDate = null) {
  const whereClause = { eventType: 'download_complete' };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'downloadId',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'downloadCount']
    ],
    group: ['downloadId'],
    raw: true,
    order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
    limit
  });

  return stats.map(stat => ({
    downloadId: stat.downloadId,
    downloadCount: parseInt(stat.downloadCount)
  }));
};

module.exports = DownloadAnalytics;