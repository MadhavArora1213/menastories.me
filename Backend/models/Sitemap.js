const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sitemap = sequelize.define('Sitemap', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sitemapType: {
    type: DataTypes.ENUM(
      'main',
      'articles',
      'categories',
      'tags',
      'authors',
      'images',
      'videos',
      'news',
      'custom'
    ),
    defaultValue: 'main'
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Sitemap filename (e.g., sitemap.xml, sitemap-articles.xml)'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Full URL to the sitemap file'
  },
  lastGenerated: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time the sitemap was generated'
  },
  lastModified: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time the sitemap content was modified'
  },
  totalUrls: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total number of URLs in the sitemap'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Sitemap file size in bytes'
  },
  compressionEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the sitemap is compressed (gzip)'
  },
  compressedSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Compressed file size in bytes'
  },

  // URL Configuration
  includeUrls: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Specific URLs to include in this sitemap'
  },
  excludeUrls: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'URLs to exclude from this sitemap'
  },
  urlFilters: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Filters for URL inclusion (content types, dates, etc.)'
  },

  // Content Types
  contentTypes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Content types included in this sitemap'
  },

  // Priority and Change Frequency
  defaultPriority: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.5,
    comment: 'Default priority for URLs (0.0 to 1.0)'
  },
  defaultChangeFrequency: {
    type: DataTypes.ENUM(
      'always',
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'never'
    ),
    defaultValue: 'weekly'
  },

  // Priority Rules
  priorityRules: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom priority rules based on content type, age, etc.'
  },

  // Change Frequency Rules
  changeFrequencyRules: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom change frequency rules'
  },

  // Multilingual Support
  languages: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Supported languages for hreflang'
  },
  defaultLanguage: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
    comment: 'Default language code'
  },

  // Mobile Support
  mobileOptimized: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether to include mobile-specific URLs'
  },

  // Image Sitemap Specific
  includeImages: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Include images in sitemap (for image sitemaps)'
  },
  imageSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Image-specific settings'
  },

  // Video Sitemap Specific
  includeVideos: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Include videos in sitemap (for video sitemaps)'
  },
  videoSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Video-specific settings'
  },

  // News Sitemap Specific
  includeNews: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Include news articles (for news sitemaps)'
  },
  newsSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'News-specific settings'
  },

  // Generation Settings
  autoGenerate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Automatically regenerate sitemap'
  },
  generationFrequency: {
    type: DataTypes.ENUM(
      'realtime',
      'hourly',
      'daily',
      'weekly',
      'manual'
    ),
    defaultValue: 'daily'
  },
  maxUrls: {
    type: DataTypes.INTEGER,
    defaultValue: 50000,
    comment: 'Maximum URLs per sitemap (Google limit: 50,000)'
  },

  // Submission Settings
  submitToSearchEngines: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Automatically submit to search engines'
  },
  searchEngineSubmissions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Search engine submission history and status'
  },

  // Validation
  isValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the sitemap is valid'
  },
  validationErrors: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Validation errors if any'
  },
  lastValidated: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last validation date'
  },

  // Statistics
  submissionStats: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Submission statistics and success rates'
  },
  crawlStats: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Search engine crawl statistics'
  },

  // Custom Configuration
  customConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom sitemap configuration'
  },

  // Status
  status: {
    type: DataTypes.ENUM(
      'active',
      'inactive',
      'generating',
      'error',
      'pending'
    ),
    defaultValue: 'active'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if generation failed'
  }
}, {
  tableName: 'Sitemaps',
  indexes: [
    {
      fields: ['sitemapType'],
      name: 'sitemaps_type'
    },
    {
      fields: ['filename'],
      name: 'sitemaps_filename'
    },
    {
      fields: ['status'],
      name: 'sitemaps_status'
    },
    {
      fields: ['lastGenerated'],
      name: 'sitemaps_last_generated'
    }
  ],
  hooks: {
    beforeCreate: (sitemap) => {
      // Auto-generate filename if not provided
      if (!sitemap.filename) {
        sitemap.filename = generateSitemapFilename(sitemap);
      }

      // Set default URL
      if (!sitemap.url) {
        sitemap.url = `${process.env.BASE_URL || 'https://your-domain.com'}/${sitemap.filename}`;
      }
    }
  }
});

// Helper function to generate sitemap filename
function generateSitemapFilename(sitemap) {
  const typeMap = {
    'main': 'sitemap.xml',
    'articles': 'sitemap-articles.xml',
    'categories': 'sitemap-categories.xml',
    'tags': 'sitemap-tags.xml',
    'authors': 'sitemap-authors.xml',
    'images': 'sitemap-images.xml',
    'videos': 'sitemap-videos.xml',
    'news': 'sitemap-news.xml'
  };

  return typeMap[sitemap.sitemapType] || `sitemap-${sitemap.sitemapType}.xml`;
}

module.exports = Sitemap;