const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsappConsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  marketingConsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  confirmationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  unsubscribedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'bounced', 'complained', 'unsubscribed'),
    defaultValue: 'active'
  },
  subscriptionSource: {
    type: DataTypes.ENUM('website', 'admin', 'import', 'api', 'website_popup'),
    defaultValue: 'website'
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      frequency: 'weekly', // daily, weekly, monthly
      categories: [],
      authors: [],
      contentTypes: ['articles', 'news', 'events'],
      language: 'en'
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  gdprConsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  gdprConsentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gdprConsentIp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  unsubscribeToken: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  lastEmailSent: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastEmailOpened: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailOpenCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  emailClickCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bounceCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  complaintCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  engagementScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 1
    }
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'UTC'
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'NewsletterSubscribers',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['subscriptionSource']
    },
    {
      fields: ['gdprConsent']
    },
    {
      fields: ['engagementScore']
    },
    {
      fields: ['lastEmailSent']
    }
  ]
});

// Instance methods
NewsletterSubscriber.prototype.getFullName = function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.email;
};

NewsletterSubscriber.prototype.updateEngagementScore = function() {
  let score = 0;

  // Email opens (30% weight)
  if (this.emailOpenCount > 0) {
    score += Math.min(this.emailOpenCount * 0.1, 0.3);
  }

  // Email clicks (40% weight)
  if (this.emailClickCount > 0) {
    score += Math.min(this.emailClickCount * 0.15, 0.4);
  }

  // Recency (20% weight) - more recent activity = higher score
  if (this.lastEmailOpened) {
    const daysSinceLastOpen = (Date.now() - this.lastEmailOpened.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastOpen < 7) {
      score += 0.2;
    } else if (daysSinceLastOpen < 30) {
      score += 0.1;
    }
  }

  // Bounce penalty (10% weight)
  if (this.bounceCount > 0) {
    score -= Math.min(this.bounceCount * 0.05, 0.1);
  }

  this.engagementScore = Math.max(0, Math.min(1, score));
  return this.save();
};

NewsletterSubscriber.prototype.generateUnsubscribeToken = function() {
  const crypto = require('crypto');
  this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  return this.save();
};

module.exports = NewsletterSubscriber;