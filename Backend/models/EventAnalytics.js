const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EventAnalytics = sequelize.define('EventAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'events',
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
      'view',
      'registration_start',
      'registration_complete',
      'attendee_checkin',
      'attendee_checkout',
      'share',
      'bookmark',
      'calendar_add',
      'reminder_set',
      'feedback_submit',
      'download_ics',
      'contact_organizer'
    ),
    allowNull: false
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
  tableName: 'event_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['eventId']
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
      fields: ['eventId', 'eventType']
    },
    {
      fields: ['eventId', 'eventTimestamp']
    }
  ]
});

// Instance methods
EventAnalytics.prototype.getEventDetails = function() {
  return {
    id: this.id,
    eventType: this.eventType,
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
EventAnalytics.getEventStats = async function(eventId, startDate = null, endDate = null) {
  const whereClause = { eventId };

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

EventAnalytics.getDeviceStats = async function(eventId, startDate = null, endDate = null) {
  const whereClause = { eventId };

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

EventAnalytics.getGeographicStats = async function(eventId, startDate = null, endDate = null) {
  const whereClause = { eventId };

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

EventAnalytics.getConversionFunnel = async function(eventId, startDate = null, endDate = null) {
  const whereClause = { eventId };

  if (startDate && endDate) {
    whereClause.eventTimestamp = {
      [require('sequelize').Op.between]: [startDate, endDate]
    };
  }

  const funnel = {
    views: 0,
    registration_starts: 0,
    registration_completes: 0,
    attendee_checkins: 0
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
        funnel.views = count;
        break;
      case 'registration_start':
        funnel.registration_starts = count;
        break;
      case 'registration_complete':
        funnel.registration_completes = count;
        break;
      case 'attendee_checkin':
        funnel.attendee_checkins = count;
        break;
    }
  });

  return funnel;
};

EventAnalytics.getRealtimeStats = async function(eventId, minutes = 5) {
  const startTime = new Date(Date.now() - minutes * 60 * 1000);

  const stats = await this.findAll({
    where: {
      eventId,
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

module.exports = EventAnalytics;