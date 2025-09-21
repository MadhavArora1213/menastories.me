const {
  Article,
  VideoArticle,
  Subcategory,
  Event,
  List,
  PowerListEntry,
  MediaKit,
  FlipbookMagazine,
  Category
} = require('../models');
const { validationResult } = require('express-validator');

// SEO field mappings for different content types
const SEO_FIELD_MAPPINGS = {
  articles: {
    titleField: 'metaTitle',
    descriptionField: 'metaDescription',
    keywordsField: 'keywords',
    model: Article
  },
  videoArticles: {
    titleField: 'metaTitle',
    descriptionField: 'metaDescription',
    keywordsField: 'keywords',
    model: VideoArticle
  },
  subcategories: {
    titleField: 'metaTitle',
    descriptionField: 'metaDescription',
    model: Subcategory
  },
  events: {
    titleField: 'seoTitle',
    descriptionField: 'seoDescription',
    canonicalUrlField: 'canonicalUrl',
    model: Event
  },
  lists: {
    titleField: 'metaTitle',
    descriptionField: 'metaDescription',
    model: List
  },
  powerListEntries: {
    titleField: 'metaTitle',
    descriptionField: 'metaDescription',
    model: PowerListEntry
  },
  mediaKits: {
    titleField: 'metaTitle',
    descriptionField: 'metaDescription',
    keywordsField: 'keywords',
    model: MediaKit
  },
  flipbooks: {
    titleField: 'seoTitle',
    descriptionField: 'seoDescription',
    canonicalUrlField: 'canonicalUrl',
    model: FlipbookMagazine
  }
};

// Get SEO data for a specific content item
exports.getSEOData = async (req, res) => {
  try {
    const { contentType, id } = req.params;

    if (!SEO_FIELD_MAPPINGS[contentType]) {
      return res.status(400).json({
        message: 'Invalid content type',
        supportedTypes: Object.keys(SEO_FIELD_MAPPINGS)
      });
    }

    const mapping = SEO_FIELD_MAPPINGS[contentType];
    const Model = mapping.model;

    // Get the content item with basic info
    const content = await Model.findByPk(id, {
      attributes: ['id', 'title', 'slug', 'description', 'status', 'createdAt', 'updatedAt']
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Get SEO fields
    const seoFields = {};
    if (mapping.titleField) seoFields[mapping.titleField] = content[mapping.titleField];
    if (mapping.descriptionField) seoFields[mapping.descriptionField] = content[mapping.descriptionField];
    if (mapping.keywordsField) seoFields[mapping.keywordsField] = content[mapping.keywordsField];
    if (mapping.canonicalUrlField) seoFields[mapping.canonicalUrlField] = content[mapping.canonicalUrlField];

    res.json({
      content: {
        id: content.id,
        title: content.title,
        slug: content.slug,
        description: content.description,
        status: content.status,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt
      },
      seo: seoFields,
      contentType
    });
  } catch (error) {
    console.error('Get SEO data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update SEO data for a specific content item
exports.updateSEOData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contentType, id } = req.params;
    const { metaTitle, metaDescription, keywords, seoTitle, seoDescription, canonicalUrl } = req.body;

    if (!SEO_FIELD_MAPPINGS[contentType]) {
      return res.status(400).json({
        message: 'Invalid content type',
        supportedTypes: Object.keys(SEO_FIELD_MAPPINGS)
      });
    }

    const mapping = SEO_FIELD_MAPPINGS[contentType];
    const Model = mapping.model;

    // Find the content item
    const content = await Model.findByPk(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Prepare update data based on content type
    const updateData = {};

    if (mapping.titleField) {
      const titleValue = contentType === 'events' ? seoTitle : metaTitle;
      if (titleValue !== undefined) {
        updateData[mapping.titleField] = titleValue;
      }
    }

    if (mapping.descriptionField) {
      const descValue = contentType === 'events' || contentType === 'flipbooks' ? seoDescription : metaDescription;
      if (descValue !== undefined) {
        updateData[mapping.descriptionField] = descValue;
      }
    }

    if (mapping.keywordsField && keywords !== undefined) {
      updateData[mapping.keywordsField] = Array.isArray(keywords) ? keywords : [];
    }

    if (mapping.canonicalUrlField && canonicalUrl !== undefined) {
      updateData[mapping.canonicalUrlField] = canonicalUrl;
    }

    // Update the content
    await content.update(updateData);

    res.json({
      message: 'SEO data updated successfully',
      content: {
        id: content.id,
        title: content.title,
        slug: content.slug
      },
      seo: updateData
    });
  } catch (error) {
    console.error('Update SEO data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get SEO data for multiple content items
exports.getBulkSEOData = async (req, res) => {
  try {
    const { contentType, page = 1, limit = 20, search, status } = req.query;

    if (!SEO_FIELD_MAPPINGS[contentType]) {
      return res.status(400).json({
        message: 'Invalid content type',
        supportedTypes: Object.keys(SEO_FIELD_MAPPINGS)
      });
    }

    const mapping = SEO_FIELD_MAPPINGS[contentType];
    const Model = mapping.model;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (search) {
      whereClause.title = { [require('sequelize').Op.like]: `%${search}%` };
    }
    if (status) {
      whereClause.status = status;
    }

    // Get content items with SEO data
    const { count, rows } = await Model.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'title', 'slug', 'description', 'status', 'createdAt', 'updatedAt',
        mapping.titleField,
        mapping.descriptionField,
        mapping.keywordsField,
        mapping.canonicalUrlField
      ].filter(Boolean), // Remove undefined fields
      limit: parseInt(limit),
      offset,
      order: [['updatedAt', 'DESC']]
    });

    // Format response
    const results = rows.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      seo: {
        title: item[mapping.titleField],
        description: item[mapping.descriptionField],
        keywords: item[mapping.keywordsField],
        canonicalUrl: item[mapping.canonicalUrlField]
      },
      seoStatus: getSEOStatus(item, mapping)
    }));

    res.json({
      results,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      contentType
    });
  } catch (error) {
    console.error('Get bulk SEO data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk update SEO data
exports.bulkUpdateSEOData = async (req, res) => {
  try {
    const { contentType, updates } = req.body;

    if (!SEO_FIELD_MAPPINGS[contentType]) {
      return res.status(400).json({
        message: 'Invalid content type',
        supportedTypes: Object.keys(SEO_FIELD_MAPPINGS)
      });
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    const mapping = SEO_FIELD_MAPPINGS[contentType];
    const Model = mapping.model;
    const results = [];

    for (const update of updates) {
      try {
        const { id, ...seoData } = update;
        const content = await Model.findByPk(id);

        if (!content) {
          results.push({ id, success: false, error: 'Content not found' });
          continue;
        }

        // Prepare update data
        const updateData = {};
        if (seoData.metaTitle !== undefined && mapping.titleField) {
          updateData[mapping.titleField] = seoData.metaTitle;
        }
        if (seoData.metaDescription !== undefined && mapping.descriptionField) {
          updateData[mapping.descriptionField] = seoData.metaDescription;
        }
        if (seoData.keywords !== undefined && mapping.keywordsField) {
          updateData[mapping.keywordsField] = Array.isArray(seoData.keywords) ? seoData.keywords : [];
        }
        if (seoData.canonicalUrl !== undefined && mapping.canonicalUrlField) {
          updateData[mapping.canonicalUrlField] = seoData.canonicalUrl;
        }

        await content.update(updateData);
        results.push({ id, success: true, updated: updateData });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: { successCount, failureCount, totalCount: results.length }
    });
  } catch (error) {
    console.error('Bulk update SEO data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get SEO analytics and recommendations
exports.getSEOAnalytics = async (req, res) => {
  try {
    const { contentType } = req.params;

    if (!SEO_FIELD_MAPPINGS[contentType]) {
      return res.status(400).json({
        message: 'Invalid content type',
        supportedTypes: Object.keys(SEO_FIELD_MAPPINGS)
      });
    }

    const mapping = SEO_FIELD_MAPPINGS[contentType];
    const Model = mapping.model;

    // Get SEO statistics
    const totalCount = await Model.count();
    const withTitleCount = await Model.count({
      where: { [mapping.titleField]: { [require('sequelize').Op.not]: null } }
    });
    const withDescriptionCount = await Model.count({
      where: { [mapping.descriptionField]: { [require('sequelize').Op.not]: null } }
    });

    let withKeywordsCount = 0;
    if (mapping.keywordsField) {
      withKeywordsCount = await Model.count({
        where: {
          [mapping.keywordsField]: {
            [require('sequelize').Op.and]: [
              { [require('sequelize').Op.not]: null },
              { [require('sequelize').Op.not]: [] }
            ]
          }
        }
      });
    }

    // Calculate percentages
    const titleCoverage = totalCount > 0 ? Math.round((withTitleCount / totalCount) * 100) : 0;
    const descriptionCoverage = totalCount > 0 ? Math.round((withDescriptionCount / totalCount) * 100) : 0;
    const keywordsCoverage = mapping.keywordsField && totalCount > 0 ? Math.round((withKeywordsCount / totalCount) * 100) : 0;

    // Get items missing SEO data
    const missingSEO = await Model.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { [mapping.titleField]: null },
          { [mapping.descriptionField]: null }
        ]
      },
      attributes: ['id', 'title', 'slug', 'status'],
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      analytics: {
        totalContent: totalCount,
        seoCoverage: {
          title: { count: withTitleCount, percentage: titleCoverage },
          description: { count: withDescriptionCount, percentage: descriptionCoverage },
          keywords: mapping.keywordsField ? { count: withKeywordsCount, percentage: keywordsCoverage } : null
        }
      },
      recommendations: {
        missingSEO: missingSEO.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          status: item.status
        })),
        priority: getSEOPriority(titleCoverage, descriptionCoverage, keywordsCoverage)
      },
      contentType
    });
  } catch (error) {
    console.error('Get SEO analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Auto-generate SEO suggestions
exports.generateSEOSuggestions = async (req, res) => {
  try {
    const { contentType, id } = req.params;

    if (!SEO_FIELD_MAPPINGS[contentType]) {
      return res.status(400).json({
        message: 'Invalid content type',
        supportedTypes: Object.keys(SEO_FIELD_MAPPINGS)
      });
    }

    const mapping = SEO_FIELD_MAPPINGS[contentType];
    const Model = mapping.model;

    const content = await Model.findByPk(id, {
      attributes: ['id', 'title', 'description', 'excerpt']
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Generate SEO suggestions
    const suggestions = {
      title: generateTitleSuggestion(content.title, contentType),
      description: generateDescriptionSuggestion(content.description || content.excerpt, contentType),
      keywords: generateKeywordsSuggestion(content.title, content.description || content.excerpt)
    };

    res.json({
      content: {
        id: content.id,
        title: content.title
      },
      suggestions,
      contentType
    });
  } catch (error) {
    console.error('Generate SEO suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper functions
function getSEOStatus(item, mapping) {
  const hasTitle = item[mapping.titleField];
  const hasDescription = item[mapping.descriptionField];
  const hasKeywords = mapping.keywordsField ? (item[mapping.keywordsField] && item[mapping.keywordsField].length > 0) : true;

  if (hasTitle && hasDescription && hasKeywords) {
    return 'complete';
  } else if (hasTitle || hasDescription) {
    return 'partial';
  } else {
    return 'missing';
  }
}

function getSEOPriority(titleCoverage, descriptionCoverage, keywordsCoverage) {
  if (titleCoverage < 80 || descriptionCoverage < 80) {
    return 'high';
  } else if (keywordsCoverage < 70) {
    return 'medium';
  } else {
    return 'low';
  }
}

function generateTitleSuggestion(title, contentType) {
  if (!title) return '';

  // Remove common words and limit length
  const cleanTitle = title.replace(/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi, '').trim();
  const maxLength = 60;

  if (cleanTitle.length <= maxLength) {
    return cleanTitle;
  }

  return cleanTitle.substring(0, maxLength - 3) + '...';
}

function generateDescriptionSuggestion(description, contentType) {
  if (!description) return '';

  // Clean HTML and limit length
  const cleanDesc = description.replace(/<[^>]*>/g, '').trim();
  const maxLength = 160;

  if (cleanDesc.length <= maxLength) {
    return cleanDesc;
  }

  return cleanDesc.substring(0, maxLength - 3) + '...';
}

function generateKeywordsSuggestion(title, description) {
  if (!title && !description) return [];

  const text = `${title} ${description}`.toLowerCase();

  // Extract potential keywords (words longer than 3 characters)
  const words = text.match(/\b\w{4,}\b/g) || [];

  // Count frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort by frequency and return top 10
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

module.exports = {
  getSEOData: exports.getSEOData,
  updateSEOData: exports.updateSEOData,
  getBulkSEOData: exports.getBulkSEOData,
  bulkUpdateSEOData: exports.bulkUpdateSEOData,
  getSEOAnalytics: exports.getSEOAnalytics,
  generateSEOSuggestions: exports.generateSEOSuggestions
};