const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NewsletterTemplate = sequelize.define('NewsletterTemplate', {
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
      'welcome', 'newsletter', 'digest', 'breaking_news',
      'event', 'promotion', 'announcement', 'custom'
    ),
    defaultValue: 'newsletter'
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true
  },
  htmlContent: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  textContent: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  whatsappContent: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  variables: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      // Available variables for personalization
      subscriber: ['firstName', 'lastName', 'email', 'preferences'],
      content: ['title', 'excerpt', 'url', 'image', 'author', 'publishDate'],
      system: ['unsubscribeUrl', 'preferencesUrl', 'websiteUrl']
    }
  },
  styles: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      // Default styling
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    }
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  previewImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'archived'),
    defaultValue: 'draft'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  lastModifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true
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
  }
}, {
  tableName: 'NewsletterTemplates',
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isDefault']
    },
    {
      fields: ['createdBy']
    }
  ]
});

// Instance methods
NewsletterTemplate.prototype.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

NewsletterTemplate.prototype.getPreviewHtml = function(subscriberData = {}, contentData = {}) {
  let html = this.htmlContent;

  // Replace subscriber variables
  if (subscriberData) {
    html = html.replace(/\{\{subscriber\.(\w+)\}\}/g, (match, key) => {
      return subscriberData[key] || '';
    });
  }

  // Replace content variables
  if (contentData) {
    html = html.replace(/\{\{content\.(\w+)\}\}/g, (match, key) => {
      return contentData[key] || '';
    });
  }

  // Replace system variables
  const systemVars = {
    unsubscribeUrl: '{{unsubscribeUrl}}',
    preferencesUrl: '{{preferencesUrl}}',
    websiteUrl: '{{websiteUrl}}'
  };

  html = html.replace(/\{\{system\.(\w+)\}\}/g, (match, key) => {
    return systemVars[key] || '';
  });

  return html;
};

NewsletterTemplate.prototype.getPreviewText = function(subscriberData = {}, contentData = {}) {
  if (!this.textContent) {
    // Convert HTML to text if no text version exists
    return this.htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  let text = this.textContent;

  // Replace variables similar to HTML
  if (subscriberData) {
    text = text.replace(/\{\{subscriber\.(\w+)\}\}/g, (match, key) => {
      return subscriberData[key] || '';
    });
  }

  if (contentData) {
    text = text.replace(/\{\{content\.(\w+)\}\}/g, (match, key) => {
      return contentData[key] || '';
    });
  }

  return text;
};

NewsletterTemplate.prototype.validateTemplate = function() {
  const errors = [];

  if (!this.htmlContent) {
    errors.push('HTML content is required');
  }

  if (!this.name) {
    errors.push('Template name is required');
  }

  if (!this.slug) {
    errors.push('Template slug is required');
  }

  // Check for required variables
  const requiredVars = ['{{system.unsubscribeUrl}}'];
  for (const variable of requiredVars) {
    if (!this.htmlContent.includes(variable)) {
      errors.push(`Required variable ${variable} is missing`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = NewsletterTemplate;