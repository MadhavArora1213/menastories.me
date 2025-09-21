const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NewsletterCampaign = sequelize.define('NewsletterCampaign', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('email', 'whatsapp', 'sms', 'push'),
    defaultValue: 'email'
  },
  category: {
    type: DataTypes.ENUM(
      'daily_digest', 'weekly_roundup', 'breaking_news',
      'category_news', 'author_news', 'event_notification',
      'promotion', 'announcement', 'custom'
    ),
    defaultValue: 'custom'
  },
  status: {
    type: DataTypes.ENUM(
      'draft', 'scheduled', 'sending', 'sent', 'paused',
      'cancelled', 'failed'
    ),
    defaultValue: 'draft'
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'NewsletterTemplates',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  whatsappContent: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  senderEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  replyToEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  // Targeting and Segmentation
  targetCriteria: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      // Subscriber filters
      status: ['active'],
      preferences: {
        frequency: [],
        categories: [],
        authors: [],
        contentTypes: []
      },
      tags: [],
      engagementScore: {
        min: 0,
        max: 1
      },
      subscriptionDate: {
        from: null,
        to: null
      },
      lastActivity: {
        from: null,
        to: null
      }
    }
  },
  segmentId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  // Scheduling
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Statistics
  totalRecipients: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deliveredCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  openedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clickedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bouncedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  complainedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unsubscribedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Performance Metrics
  openRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  clickRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  bounceRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  unsubscribeRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  // A/B Testing
  isAbTest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  abTestVariants: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  abTestWinner: {
    type: DataTypes.UUID,
    allowNull: true
  },
  // Automation
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  triggerType: {
    type: DataTypes.ENUM(
      'manual', 'scheduled', 'article_published',
      'user_registered', 'user_inactive', 'custom_event'
    ),
    defaultValue: 'manual'
  },
  triggerConditions: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Content
  featuredArticles: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  customContent: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  // Meta
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Admins',
      key: 'id'
    }
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
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'NewsletterCampaigns',
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['scheduledAt']
    },
    {
      fields: ['sentAt']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['isAutomated']
    }
  ]
});

// Instance methods
NewsletterCampaign.prototype.calculateRates = function() {
  if (this.sentCount > 0) {
    this.openRate = ((this.openedCount / this.sentCount) * 100).toFixed(2);
    this.clickRate = ((this.clickedCount / this.sentCount) * 100).toFixed(2);
    this.bounceRate = ((this.bouncedCount / this.sentCount) * 100).toFixed(2);
    this.unsubscribeRate = ((this.unsubscribedCount / this.sentCount) * 100).toFixed(2);
  }
  return this.save();
};

NewsletterCampaign.prototype.updateStats = function(stats) {
  Object.assign(this, stats);
  return this.calculateRates();
};

NewsletterCampaign.prototype.canSend = function() {
  return ['draft', 'scheduled'].includes(this.status);
};

NewsletterCampaign.prototype.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

NewsletterCampaign.prototype.markAsCompleted = function() {
  this.status = 'sent';
  this.completedAt = new Date();
  return this.save();
};

NewsletterCampaign.prototype.pause = function() {
  if (this.status === 'sending') {
    this.status = 'paused';
    return this.save();
  }
  return this;
};

NewsletterCampaign.prototype.resume = function() {
  if (this.status === 'paused') {
    this.status = 'sending';
    return this.save();
  }
  return this;
};

NewsletterCampaign.prototype.cancel = function() {
  if (['draft', 'scheduled', 'paused'].includes(this.status)) {
    this.status = 'cancelled';
    return this.save();
  }
  return this;
};

NewsletterCampaign.prototype.getProgress = function() {
  if (this.totalRecipients === 0) return 0;
  return Math.round((this.sentCount / this.totalRecipients) * 100);
};

NewsletterCampaign.prototype.getEstimatedCompletionTime = function() {
  if (this.sentCount === 0 || !this.sentAt) return null;

  const elapsed = Date.now() - this.sentAt.getTime();
  const sentSoFar = this.sentCount;
  const remaining = this.totalRecipients - sentSoFar;

  if (remaining <= 0) return 0;

  const timePerEmail = elapsed / sentSoFar;
  return Math.round((remaining * timePerEmail) / 1000); // in seconds
};

module.exports = NewsletterCampaign;