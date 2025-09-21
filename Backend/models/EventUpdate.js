const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EventUpdate = sequelize.define('EventUpdate', {
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 2000]
    }
  },
  updateType: {
    type: DataTypes.ENUM(
      'general',
      'schedule_change',
      'speaker_change',
      'venue_change',
      'registration_update',
      'important_announcement',
      'emergency',
      'sponsor_update',
      'networking_opportunity',
      'session_update',
      'catering_update',
      'transportation_update',
      'accommodation_update',
      'technical_update',
      'weather_update',
      'security_update'
    ),
    allowNull: false,
    defaultValue: 'general'
  },
  priority: {
    type: DataTypes.ENUM(
      'low',
      'normal',
      'high',
      'urgent'
    ),
    allowNull: false,
    defaultValue: 'normal'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  publishedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  attachments: {
    type: DataTypes.JSON, // Array of file attachments
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON, // Array of tags for filtering
    allowNull: true,
    defaultValue: []
  },
  targetAudience: {
    type: DataTypes.ENUM(
      'all',
      'registered',
      'attendees',
      'speakers',
      'sponsors',
      'exhibitors',
      'press',
      'vip'
    ),
    allowNull: false,
    defaultValue: 'all'
  },
  notificationSettings: {
    type: DataTypes.JSON, // { email, push, sms, inApp }
    allowNull: true,
    defaultValue: {
      email: true,
      push: true,
      sms: false,
      inApp: true
    }
  },
  statistics: {
    type: DataTypes.JSON, // { views, likes, shares, comments }
    allowNull: true,
    defaultValue: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isSticky: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  stickyUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  relatedSession: {
    type: DataTypes.UUID,
    allowNull: true
  },
  relatedSpeaker: {
    type: DataTypes.UUID,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true // Specific location within the event venue
  },
  actionRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  actionUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  actionText: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Admins',
      key: 'id'
    }
  }
}, {
  tableName: 'event_updates',
  timestamps: true,
  indexes: [
    {
      fields: ['eventId']
    },
    {
      fields: ['updateType']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['isPublished']
    },
    {
      fields: ['publishedAt']
    },
    {
      fields: ['targetAudience']
    },
    {
      fields: ['expiresAt']
    },
    {     
    
      fields: ['isSticky']
    },
    {
      fields: ['createdBy']
    }
  ]
});

// Instance methods
EventUpdate.prototype.publish = async function(publishedBy = null) {
  this.isPublished = true;
  this.publishedAt = new Date();
  this.publishedBy = publishedBy;
  await this.save();

  // Trigger notifications
  await this.sendNotifications();

  return this;
};

EventUpdate.prototype.unpublish = async function() {
  this.isPublished = false;
  this.publishedAt = null;
  this.publishedBy = null;
  return this.save();
};

EventUpdate.prototype.sendNotifications = async function() {
  // Implementation would send notifications based on settings
  // This would integrate with your notification/email service
  console.log(`Sending notifications for update ${this.id}`);

  // Example notification logic
  if (this.notificationSettings.email) {
    await this.sendEmailNotifications();
  }

  if (this.notificationSettings.push) {
    await this.sendPushNotifications();
  }

  if (this.notificationSettings.sms) {
    await this.sendSMSNotifications();
  }
};

EventUpdate.prototype.sendEmailNotifications = async function() {
  // Implementation would send email notifications
  console.log(`Sending email notifications for update ${this.id}`);
};

EventUpdate.prototype.sendPushNotifications = async function() {
  // Implementation would send push notifications
  console.log(`Sending push notifications for update ${this.id}`);
};

EventUpdate.prototype.sendSMSNotifications = async function() {
  // Implementation would send SMS notifications
  console.log(`Sending SMS notifications for update ${this.id}`);
};

EventUpdate.prototype.incrementViews = async function() {
  this.statistics = {
    ...this.statistics,
    views: (this.statistics.views || 0) + 1
  };
  return this.save();
};

EventUpdate.prototype.incrementLikes = async function() {
  this.statistics = {
    ...this.statistics,
    likes: (this.statistics.likes || 0) + 1
  };
  return this.save();
};

EventUpdate.prototype.incrementShares = async function() {
  this.statistics = {
    ...this.statistics,
    shares: (this.statistics.shares || 0) + 1
  };
  return this.save();
};

EventUpdate.prototype.addComment = async function() {
  this.statistics = {
    ...this.statistics,
    comments: (this.statistics.comments || 0) + 1
  };
  return this.save();
};

EventUpdate.prototype.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
};

EventUpdate.prototype.isStickyActive = function() {
  if (!this.isSticky) return false;
  if (!this.stickyUntil) return true;
  return new Date() <= new Date(this.stickyUntil);
};

EventUpdate.prototype.getShareUrl = function() {
  return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${this.eventId}/updates/${this.id}`;
};

EventUpdate.prototype.getTargetAudienceQuery = function() {
  const queries = {
    all: {},
    registered: { status: ['confirmed', 'attended'] },
    attendees: { status: 'attended' },
    speakers: { /* Query for speakers */ },
    sponsors: { /* Query for sponsors */ },
    exhibitors: { /* Query for exhibitors */ },
    press: { /* Query for press */ },
    vip: { /* Query for VIP attendees */ }
  };

  return queries[this.targetAudience] || queries.all;
};

EventUpdate.prototype.getPriorityColor = function() {
  const colors = {
    low: '#6B7280',
    normal: '#3B82F6',
    high: '#F59E0B',
    urgent: '#EF4444'
  };
  return colors[this.priority] || colors.normal;
};

EventUpdate.prototype.getPriorityIcon = function() {
  const icons = {
    low: '📝',
    normal: 'ℹ️',
    high: '⚠️',
    urgent: '🚨'
  };
  return icons[this.priority] || icons.normal;
};

EventUpdate.prototype.getUpdateTypeIcon = function() {
  const icons = {
    general: '📢',
    schedule_change: '📅',
    speaker_change: '🎤',
    venue_change: '🏢',
    registration_update: '🎫',
    important_announcement: '📣',
    emergency: '🚨',
    sponsor_update: '🤝',
    networking_opportunity: '👥',
    session_update: '📋',
    catering_update: '🍽️',
    transportation_update: '🚗',
    accommodation_update: '🏨',
    technical_update: '💻',
    weather_update: '🌤️',
    security_update: '🔒'
  };
  return icons[this.updateType] || icons.general;
};

// Static methods
EventUpdate.getPublishedUpdates = async function(eventId, options = {}) {
  const {
    limit = 20,
    offset = 0,
    priority,
    updateType,
    targetAudience,
    includeExpired = false
  } = options;

  const whereClause = {
    eventId,
    isPublished: true
  };

  if (priority) whereClause.priority = priority;
  if (updateType) whereClause.updateType = updateType;
  if (targetAudience) whereClause.targetAudience = targetAudience;

  if (!includeExpired) {
    whereClause[require('sequelize').Op.or] = [
      { expiresAt: null },
      { expiresAt: { [require('sequelize').Op.gt]: new Date() } }
    ];
  }

  return await this.findAll({
    where: whereClause,
    order: [
      ['isSticky', 'DESC'],
      ['priority', 'DESC'],
      ['publishedAt', 'DESC']
    ],
    limit,
    offset
  });
};

EventUpdate.getStickyUpdates = async function(eventId) {
  return await this.findAll({
    where: {
      eventId,
      isPublished: true,
      isSticky: true,
      [require('sequelize').Op.or]: [
        { stickyUntil: null },
        { stickyUntil: { [require('sequelize').Op.gt]: new Date() } }
      ]
    },
    order: [['publishedAt', 'DESC']]
  });
};

EventUpdate.getUpdatesByType = async function(eventId, updateType, limit = 10) {
  return await this.findAll({
    where: {
      eventId,
      updateType,
      isPublished: true
    },
    order: [['publishedAt', 'DESC']],
    limit
  });
};

EventUpdate.getRecentUpdates = async function(eventId, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return await this.findAll({
    where: {
      eventId,
      isPublished: true,
      publishedAt: {
        [require('sequelize').Op.gte]: since
      }
    },
    order: [['publishedAt', 'DESC']]
  });
};

EventUpdate.searchUpdates = async function(eventId, query, options = {}) {
  const { limit = 20, offset = 0 } = options;

  return await this.findAll({
    where: {
      eventId,
      isPublished: true,
      [require('sequelize').Op.or]: [
        { title: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { content: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { tags: { [require('sequelize').Op.contains]: [query] } }
      ]
    },
    order: [['publishedAt', 'DESC']],
    limit,
    offset
  });
};

EventUpdate.getUpdateStatistics = async function(eventId) {
  const updates = await this.findAll({
    where: { eventId, isPublished: true },
    attributes: [
      'updateType',
      'priority',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['updateType', 'priority']
  });

  return updates.reduce((stats, update) => {
    if (!stats[update.updateType]) {
      stats[update.updateType] = {};
    }
    stats[update.updateType][update.priority] = parseInt(update.dataValues.count);
    return stats;
  }, {});
};

module.exports = EventUpdate;