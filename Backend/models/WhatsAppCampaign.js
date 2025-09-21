const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WhatsAppCampaign = sequelize.define('WhatsAppCampaign', {
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
  status: {
    type: DataTypes.ENUM(
      'draft', 'scheduled', 'sending', 'sent', 'paused',
      'cancelled', 'failed'
    ),
    defaultValue: 'draft'
  },
  // WhatsApp Business API Configuration
  whatsappBusinessAccountId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsappAccessToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  whatsappPhoneNumberId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsappTemplateName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsappTemplateLanguage: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  // Content
  message: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mediaType: {
    type: DataTypes.ENUM('image', 'video', 'document', 'audio'),
    allowNull: true
  },
  mediaCaption: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Targeting
  targetCriteria: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      whatsappEnabled: true,
      status: ['active'],
      preferences: {
        frequency: [],
        categories: []
      },
      tags: [],
      engagementScore: {
        min: 0,
        max: 1
      }
    }
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
  readCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  repliedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Performance Metrics
  deliveryRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  readRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  replyRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  failureRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  // WhatsApp API Response Tracking
  whatsappMessageId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsappResponse: {
    type: DataTypes.JSON,
    allowNull: true
  },
  whatsappErrors: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  // Automation
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  triggerType: {
    type: DataTypes.ENUM(
      'manual', 'scheduled', 'article_published',
      'event_notification', 'custom_event'
    ),
    defaultValue: 'manual'
  },
  triggerConditions: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Quick Replies (Interactive Buttons)
  quickReplies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  // Call-to-Action
  ctaType: {
    type: DataTypes.ENUM('url', 'phone', 'none'),
    defaultValue: 'none'
  },
  ctaUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ctaPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ctaText: {
    type: DataTypes.STRING,
    allowNull: true
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
  tableName: 'WhatsAppCampaigns',
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['status']
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
    },
    {
      fields: ['whatsappBusinessAccountId']
    }
  ]
});

// Instance methods
WhatsAppCampaign.prototype.calculateRates = function() {
  if (this.sentCount > 0) {
    this.deliveryRate = ((this.deliveredCount / this.sentCount) * 100).toFixed(2);
    this.readRate = ((this.readCount / this.sentCount) * 100).toFixed(2);
    this.replyRate = ((this.repliedCount / this.sentCount) * 100).toFixed(2);
    this.failureRate = ((this.failedCount / this.sentCount) * 100).toFixed(2);
  }
  return this.save();
};

WhatsAppCampaign.prototype.updateStats = function(stats) {
  Object.assign(this, stats);
  return this.calculateRates();
};

WhatsAppCampaign.prototype.canSend = function() {
  return ['draft', 'scheduled'].includes(this.status);
};

WhatsAppCampaign.prototype.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

WhatsAppCampaign.prototype.markAsCompleted = function() {
  this.status = 'sent';
  this.completedAt = new Date();
  return this.save();
};

WhatsAppCampaign.prototype.pause = function() {
  if (this.status === 'sending') {
    this.status = 'paused';
    return this.save();
  }
  return this;
};

WhatsAppCampaign.prototype.resume = function() {
  if (this.status === 'paused') {
    this.status = 'sending';
    return this.save();
  }
  return this;
};

WhatsAppCampaign.prototype.cancel = function() {
  if (['draft', 'scheduled', 'paused'].includes(this.status)) {
    this.status = 'cancelled';
    return this.save();
  }
  return this;
};

WhatsAppCampaign.prototype.getProgress = function() {
  if (this.totalRecipients === 0) return 0;
  return Math.round((this.sentCount / this.totalRecipients) * 100);
};

WhatsAppCampaign.prototype.getMessagePreview = function(subscriberData = {}) {
  let message = this.message;

  // Replace subscriber variables
  if (subscriberData.firstName) {
    message = message.replace(/\{\{firstName\}\}/g, subscriberData.firstName);
  }
  if (subscriberData.lastName) {
    message = message.replace(/\{\{lastName\}\}/g, subscriberData.lastName);
  }

  return message;
};

WhatsAppCampaign.prototype.validateWhatsAppMessage = function() {
  const errors = [];

  if (!this.message) {
    errors.push('Message content is required');
  }

  if (this.message && this.message.length > 4096) {
    errors.push('Message cannot exceed 4096 characters');
  }

  if (this.mediaUrl && !this.mediaType) {
    errors.push('Media type is required when media URL is provided');
  }

  if (this.ctaType === 'url' && !this.ctaUrl) {
    errors.push('CTA URL is required when CTA type is URL');
  }

  if (this.ctaType === 'phone' && !this.ctaPhone) {
    errors.push('CTA phone number is required when CTA type is phone');
  }

  if (this.quickReplies && this.quickReplies.length > 3) {
    errors.push('Maximum 3 quick replies allowed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = WhatsAppCampaign;