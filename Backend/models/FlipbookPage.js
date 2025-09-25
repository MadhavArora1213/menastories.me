const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/db');

const FlipbookPage = sequelize.define('FlipbookPage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  magazineId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'flipbook_magazines',
      key: 'id'
    }
  },
  pageNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  imagePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  thumbnailPath: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  highResImagePath: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  highResImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  imageWidth: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  imageHeight: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  imageSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  extractedText: {
    type: DataTypes.TEXT('long'),
    allowNull: true // OCR extracted text for search
  },
  searchableContent: {
    type: DataTypes.TEXT('long'),
    allowNull: true // Processed content for search indexing
  },
  hasText: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  textConfidence: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 1
    }
  },
  interactiveElements: {
    type: DataTypes.JSON, // Array of interactive elements (links, videos, etc.)
    allowNull: true,
    defaultValue: []
  },
  annotations: {
    type: DataTypes.JSON, // Page annotations and highlights
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
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
  processingError: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  averageViewTime: {
    type: DataTypes.INTEGER, // Average time spent on this page in seconds
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'flipbook_pages',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['magazineId', 'pageNumber']
    },
    {
      fields: ['magazineId']
    },
    {
      fields: ['pageNumber']
    },
    {
      fields: ['hasText']
    },
    {
      fields: ['processingStatus']
    },
    {
      fields: ['viewCount']
    }
  ]
});

// Instance methods
FlipbookPage.prototype.incrementViews = async function() {
  this.viewCount += 1;
  return this.save();
};

FlipbookPage.prototype.updateViewTime = async function(viewTimeSeconds) {
  // Calculate running average
  const totalViewTime = this.averageViewTime * this.viewCount + viewTimeSeconds;
  this.viewCount += 1;
  this.averageViewTime = Math.round(totalViewTime / this.viewCount);
  return this.save();
};

FlipbookPage.prototype.addAnnotation = async function(annotation) {
  const annotations = [...(this.annotations || [])];
  annotations.push({
    id: annotation.id || Date.now().toString(),
    type: annotation.type || 'highlight', // 'highlight', 'note', 'link'
    content: annotation.content,
    position: annotation.position, // { x, y, width, height }
    color: annotation.color || '#ffff00',
    userId: annotation.userId,
    createdAt: new Date(),
    ...annotation
  });
  this.annotations = annotations;
  return this.save();
};

FlipbookPage.prototype.removeAnnotation = async function(annotationId) {
  const annotations = (this.annotations || []).filter(
    annotation => annotation.id !== annotationId
  );
  this.annotations = annotations;
  return this.save();
};

FlipbookPage.prototype.addInteractiveElement = async function(element) {
  const elements = [...(this.interactiveElements || [])];
  elements.push({
    id: element.id || Date.now().toString(),
    type: element.type || 'link', // 'link', 'video', 'image', 'button'
    position: element.position, // { x, y, width, height }
    properties: element.properties || {},
    ...element
  });
  this.interactiveElements = elements;
  return this.save();
};

FlipbookPage.prototype.updateProcessingStatus = async function(status, error = null) {
  this.processingStatus = status;
  if (error !== null) {
    this.processingError = error;
  }
  return this.save();
};

FlipbookPage.prototype.getSearchableContent = function() {
  return this.searchableContent || this.extractedText || '';
};

FlipbookPage.prototype.searchInContent = function(query) {
  const content = this.getSearchableContent().toLowerCase();
  const searchTerm = query.toLowerCase();
  return content.includes(searchTerm);
};

FlipbookPage.prototype.getAnnotationsByUser = function(userId) {
  return (this.annotations || []).filter(
    annotation => annotation.userId === userId
  );
};

FlipbookPage.prototype.getInteractiveElements = function() {
  return this.interactiveElements || [];
};

// Static methods
FlipbookPage.getPagesByMagazine = async function(magazineId, options = {}) {
  const {
    page = 1,
    limit = 50,
    includeProcessed = true,
    includeAnnotations = false
  } = options;

  const offset = (page - 1) * limit;
  const whereClause = { magazineId };

  if (includeProcessed !== undefined) {
    whereClause.processingStatus = includeProcessed ? 'completed' : ['pending', 'processing'];
  }

  const pages = await this.findAll({
    where: whereClause,
    order: [['pageNumber', 'ASC']],
    limit,
    offset,
    attributes: includeAnnotations ? undefined : {
      exclude: ['annotations', 'interactiveElements']
    }
  });

  return pages;
};

FlipbookPage.searchInMagazine = async function(magazineId, query, options = {}) {
  const { limit = 20, page = 1 } = options;
  const offset = (page - 1) * limit;

  const pages = await this.findAll({
    where: {
      magazineId,
      processingStatus: 'completed',
      [Op.or]: [
        {
          extractedText: {
            [Op.iLike]: `%${query}%`
          }
        },
        {
          searchableContent: {
            [Op.iLike]: `%${query}%`
          }
        }
      ]
    },
    order: [['pageNumber', 'ASC']],
    limit,
    offset
  });

  return pages;
};

FlipbookPage.getMagazineStats = async function(magazineId) {
  const stats = await this.findAll({
    where: { magazineId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalPages'],
      [sequelize.fn('SUM', sequelize.col('viewCount')), 'totalViews'],
      [sequelize.fn('AVG', sequelize.col('averageViewTime')), 'avgViewTime'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('id'))), 'processedPages']
    ],
    where: {
      processingStatus: 'completed'
    },
    raw: true
  });

  return stats[0] || {
    totalPages: 0,
    totalViews: 0,
    avgViewTime: 0,
    processedPages: 0
  };
};

module.exports = FlipbookPage;