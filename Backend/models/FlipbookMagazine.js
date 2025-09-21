const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FlipbookMagazine = sequelize.define('FlipbookMagazine', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9-]+$/i
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  coverImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  originalFilePath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      notEmpty: true
    }
  },
  totalPages: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  magazineType: {
    type: DataTypes.ENUM(
      'monthly',
      'special',
      'annual',
      'digital_only',
      'print_digital',
      'interactive'
    ),
    allowNull: false,
    defaultValue: 'monthly'
  },
  category: {
    type: DataTypes.ENUM(
      'people_profiles',
      'entertainment',
      'lifestyle',
      'business',
      'technology',
      'health',
      'travel',
      'food',
      'fashion',
      'sports'
    ),
    allowNull: false,
    defaultValue: 'lifestyle',
    validate: {
      isIn: [['people_profiles', 'entertainment', 'lifestyle', 'business', 'technology', 'health', 'travel', 'food', 'fashion', 'sports']]
    }
  },
  accessType: {
    type: DataTypes.ENUM(
      'free',
      'subscriber',
      'premium',
      'paid'
    ),
    allowNull: false,
    defaultValue: 'free'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  publicationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  issueNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  volumeNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tableOfContents: {
    type: DataTypes.JSON, // Array of TOC items with page numbers
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
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
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  allowDownload: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  allowPrint: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  allowShare: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  shareCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  averageReadTime: {
    type: DataTypes.INTEGER, // Average read time in minutes
    allowNull: false,
    defaultValue: 0
  },
  seoTitle: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  seoDescription: {
    type: DataTypes.STRING(160),
    allowNull: true
  },
  canonicalUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  processingStatus: {
    type: DataTypes.ENUM(
      'pending',
      'processing',
      'completed',
      'failed'
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
  processingProgress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  processingError: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true, // Temporarily allow null to bypass constraint
    defaultValue: null
    // Temporarily removed foreign key reference to allow sync
    // references: {
    //   model: 'Admins',
    //   key: 'id'
    // }
  }
}, {
  tableName: 'flipbook_magazines',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['magazineType']
    },
    {
      fields: ['category']
    },
    {
      fields: ['accessType']
    },
    {
      fields: ['isPublished']
    },
    {
      fields: ['publishedAt']
    },
    {
      fields: ['isFeatured']
    },
    {
      fields: ['publicationDate']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['viewCount']
    },
    {
      fields: ['processingStatus']
    }
  ]
});

// Instance methods
FlipbookMagazine.prototype.incrementViews = async function() {
  this.viewCount += 1;
  return this.save();
};

FlipbookMagazine.prototype.incrementDownloads = async function() {
  this.downloadCount += 1;
  return this.save();
};

FlipbookMagazine.prototype.incrementShares = async function() {
  this.shareCount += 1;
  return this.save();
};

FlipbookMagazine.prototype.updateReadTime = async function(readTimeMinutes) {
  // Calculate running average
  const totalReadTime = this.averageReadTime * this.viewCount + readTimeMinutes;
  this.viewCount += 1;
  this.averageReadTime = Math.round(totalReadTime / this.viewCount);
  return this.save();
};

FlipbookMagazine.prototype.getEstimatedReadTime = function() {
  // Estimate based on page count (roughly 2 minutes per page)
  return Math.max(this.totalPages * 2, 5);
};

FlipbookMagazine.prototype.getTableOfContents = function() {
  return this.tableOfContents || [];
};

FlipbookMagazine.prototype.addToTableOfContents = async function(item) {
  const toc = [...(this.tableOfContents || [])];
  toc.push({
    id: item.id || Date.now().toString(),
    title: item.title,
    pageNumber: item.pageNumber,
    level: item.level || 1,
    children: item.children || []
  });
  this.tableOfContents = toc;
  return this.save();
};

FlipbookMagazine.prototype.updateProcessingStatus = async function(status, progress = null, error = null) {
  this.processingStatus = status;
  if (progress !== null) {
    this.processingProgress = progress;
  }
  if (error !== null) {
    this.processingError = error;
  }
  return this.save();
};

FlipbookMagazine.prototype.getShareUrl = function(pageNumber = null) {
  const baseUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/flipbook/${this.slug}`;
  return pageNumber ? `${baseUrl}?page=${pageNumber}` : baseUrl;
};

FlipbookMagazine.prototype.getEmbedCode = function(options = {}) {
  const {
    width = '100%',
    height = '600px',
    showControls = true,
    startPage = 1
  } = options;

  return `<iframe
    src="${this.getShareUrl(startPage)}?embed=true"
    width="${width}"
    height="${height}"
    frameborder="0"
    allowfullscreen
    ${showControls ? '' : 'data-hide-controls="true"'}
  ></iframe>`;
};

module.exports = FlipbookMagazine;