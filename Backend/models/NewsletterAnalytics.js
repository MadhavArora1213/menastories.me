const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NewsletterAnalytics = sequelize.define('NewsletterAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campaignId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'NewsletterCampaigns',
      key: 'id'
    }
  },
  subscriberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'NewsletterSubscribers',
      key: 'id'
    }
  },
  eventType: {
    type: DataTypes.ENUM(
      'sent', 'delivered', 'opened', 'clicked',
      'bounced', 'complained', 'unsubscribed',
      'forwarded', 'shared'
    ),
    allowNull: false
  },
  eventData: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      country: null,
      city: null,
      region: null,
      timezone: null
    }
  },
  deviceInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      type: null, // desktop, mobile, tablet
      os: null,
      browser: null,
      screenResolution: null
    }
  },
  emailClient: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkClicked: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timeToOpen: {
    type: DataTypes.INTEGER, // seconds
    allowNull: true
  },
  timeToClick: {
    type: DataTypes.INTEGER, // seconds
    allowNull: true
  },
  sessionDuration: {
    type: DataTypes.INTEGER, // seconds
    allowNull: true
  },
  isUnique: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  bounceType: {
    type: DataTypes.ENUM('hard', 'soft'),
    allowNull: true
  },
  bounceReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  complaintType: {
    type: DataTypes.ENUM('spam', 'abuse', 'other'),
    allowNull: true
  },
  unsubscribeReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referrer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  utmParameters: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'NewsletterAnalytics',
  indexes: [
    {
      fields: ['campaignId']
    },
    {
      fields: ['subscriberId']
    },
    {
      fields: ['eventType']
    },
    {
      fields: ['campaignId', 'eventType']
    },
    {
      fields: ['subscriberId', 'eventType']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['isUnique']
    }
  ],
  timestamps: true
});

// Instance methods
NewsletterAnalytics.prototype.getEventDescription = function() {
  const descriptions = {
    sent: 'Email was sent to subscriber',
    delivered: 'Email was successfully delivered',
    opened: 'Subscriber opened the email',
    clicked: 'Subscriber clicked a link in the email',
    bounced: `Email bounced (${this.bounceType})`,
    complained: `Subscriber marked as spam (${this.complaintType})`,
    unsubscribed: 'Subscriber unsubscribed',
    forwarded: 'Email was forwarded',
    shared: 'Email was shared'
  };

  return descriptions[this.eventType] || 'Unknown event';
};

NewsletterAnalytics.prototype.getDeviceType = function() {
  if (!this.userAgent) return 'unknown';

  const ua = this.userAgent.toLowerCase();

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

NewsletterAnalytics.prototype.getBrowserInfo = function() {
  if (!this.userAgent) return { name: 'unknown', version: 'unknown' };

  const ua = this.userAgent.toLowerCase();

  // Simple browser detection
  if (ua.includes('chrome') && !ua.includes('edg')) {
    return { name: 'Chrome', version: this.extractVersion(ua, 'chrome') };
  } else if (ua.includes('firefox')) {
    return { name: 'Firefox', version: this.extractVersion(ua, 'firefox') };
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    return { name: 'Safari', version: this.extractVersion(ua, 'safari') };
  } else if (ua.includes('edg')) {
    return { name: 'Edge', version: this.extractVersion(ua, 'edg') };
  } else if (ua.includes('opera')) {
    return { name: 'Opera', version: this.extractVersion(ua, 'opera') };
  }

  return { name: 'Other', version: 'unknown' };
};

NewsletterAnalytics.prototype.extractVersion = function(userAgent, browser) {
  const regex = new RegExp(`${browser}\\/([\\d.]+)`);
  const match = userAgent.match(regex);
  return match ? match[1] : 'unknown';
};

NewsletterAnalytics.prototype.getOSInfo = function() {
  if (!this.userAgent) return { name: 'unknown', version: 'unknown' };

  const ua = this.userAgent.toLowerCase();

  if (ua.includes('windows')) {
    return { name: 'Windows', version: this.extractWindowsVersion(ua) };
  } else if (ua.includes('mac os x') || ua.includes('macos')) {
    return { name: 'macOS', version: this.extractMacVersion(ua) };
  } else if (ua.includes('linux')) {
    return { name: 'Linux', version: 'unknown' };
  } else if (ua.includes('android')) {
    return { name: 'Android', version: this.extractVersion(ua, 'android') };
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    return { name: 'iOS', version: this.extractIOSVersion(ua) };
  }

  return { name: 'Other', version: 'unknown' };
};

NewsletterAnalytics.prototype.extractWindowsVersion = function(ua) {
  if (ua.includes('windows nt 10')) return '10';
  if (ua.includes('windows nt 6.3')) return '8.1';
  if (ua.includes('windows nt 6.2')) return '8';
  if (ua.includes('windows nt 6.1')) return '7';
  return 'unknown';
};

NewsletterAnalytics.prototype.extractMacVersion = function(ua) {
  const match = ua.match(/mac os x ([0-9_]+)/);
  return match ? match[1].replace(/_/g, '.') : 'unknown';
};

NewsletterAnalytics.prototype.extractIOSVersion = function(ua) {
  const match = ua.match(/os ([0-9_]+)/);
  return match ? match[1].replace(/_/g, '.') : 'unknown';
};

module.exports = NewsletterAnalytics;