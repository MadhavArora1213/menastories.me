const { Article, Category, User, Tag, SavedSearch, SearchAnalytics } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const sequelize = require('../config/db');

// Filter options as specified in requirements
const filterOptions = {
  contentType: ['Breaking News', 'Exclusive Interview', 'Feature Story', 'Photo Gallery', 'Video Content'],
  personality: ['Celebrities', 'Politicians', 'Business Leaders', 'Artists', 'Athletes'],
  industry: ['Entertainment', 'Technology', 'Healthcare', 'Finance', 'Education'],
  demographic: ['Under 30', 'Young Professionals', 'Women Leaders', 'Millennials'],
  geographic: ['UAE', 'Dubai', 'Abu Dhabi', 'Middle East', 'International'],
  occasion: ['Awards Shows', 'Film Festivals', 'Fashion Week', 'Cultural Events']
};

// Global search with advanced filtering
exports.globalSearch = async (req, res) => {
  try {
    const startTime = Date.now();
    const {
      query = '',
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'DESC',
      contentType,
      personality,
      industry,
      demographic,
      geographic,
      occasion,
      category,
      author,
      tags,
      dateFrom,
      dateTo,
      readingTime,
      popularity,
      featured
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};
    let orderClause = [];

    // Base search query
    if (query.trim()) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { excerpt: { [Op.like]: `%${query}%` } },
        { content: { [Op.like]: `%${query}%` } },
        { metaDescription: { [Op.like]: `%${query}%` } }
      ];
    }

    // Advanced filters
    if (contentType) {
      whereClause.contentType = contentType;
    }

    if (personality) {
      whereClause.personality = { [Op.contains]: [personality] };
    }

    if (industry) {
      whereClause.industry = industry;
    }

    if (demographic) {
      whereClause.demographic = { [Op.contains]: [demographic] };
    }

    if (geographic) {
      whereClause.geographic = geographic;
    }

    if (occasion) {
      whereClause.occasion = occasion;
    }

    if (category) {
      whereClause.categoryId = category;
    }

    if (author) {
      whereClause.authorId = author;
    }

    if (featured !== undefined) {
      whereClause.featured = featured === 'true';
    }

    if (readingTime) {
      const [min, max] = readingTime.split('-').map(Number);
      whereClause.readingTime = {
        [Op.between]: [min || 0, max || 999]
      };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.publishedAt = {};
      if (dateFrom) {
        whereClause.publishedAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.publishedAt[Op.lte] = new Date(dateTo);
      }
    }

    // Only published articles
    whereClause.status = 'published';

    // Sorting
    switch (sortBy) {
      case 'date':
        orderClause.push(['publishedAt', sortOrder]);
        break;
      case 'popularity':
        orderClause.push(['views', sortOrder]);
        break;
      case 'readingTime':
        orderClause.push(['readingTime', sortOrder]);
        break;
      case 'title':
        orderClause.push(['title', sortOrder]);
        break;
      default: // relevance
      if (query.trim()) {
        // Simple relevance scoring based on title match priority
        orderClause.push([
          sequelize.literal(`CASE WHEN "title" ILIKE '%${query}%' THEN 1 ELSE 2 END`),
          'ASC'
        ]);
      }
      orderClause.push(['publishedAt', 'DESC']);
      break;
    }

    // Include relationships
    const include = [
      {
        model: Category,
        attributes: ['id', 'name', 'slug']
      },
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }
    ];

    // Tag filter
    if (tags) {
      const tagIds = tags.split(',');
      include.push({
        model: Tag,
        through: { attributes: [] },
        where: { id: tagIds },
        required: true
      });
    }

    const { count, rows } = await Article.findAndCountAll({
      where: whereClause,
      include,
      limit: parseInt(limit),
      offset,
      order: orderClause,
      distinct: true
    });

    const searchDuration = Date.now() - startTime;

    // Log search analytics
    try {
      await SearchAnalytics.create({
        query: query.trim(),
        userId: req.user?.id || null,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        filters: {
          contentType,
          personality,
          industry,
          demographic,
          geographic,
          occasion,
          category,
          author,
          tags,
          dateFrom,
          dateTo,
          readingTime,
          popularity,
          featured
        },
        resultCount: count,
        searchType: 'global',
        searchDuration
      });
    } catch (analyticsError) {
      console.error('Failed to log search analytics:', analyticsError);
    }

    res.json({
      success: true,
      results: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      searchDuration,
      query: query.trim()
    });

  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// Get search suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Get article title suggestions
    const articleSuggestions = await Article.findAll({
      where: {
        title: { [Op.like]: `%${query}%` },
        status: 'published'
      },
      attributes: ['title', 'slug'],
      limit: 5,
      order: [['views', 'DESC']]
    });

    // Get category suggestions
    const categorySuggestions = await Category.findAll({
      where: {
        name: { [Op.like]: `%${query}%` },
        status: 'active'
      },
      attributes: ['name', 'slug'],
      limit: 3
    });

    // Get tag suggestions
    const tagSuggestions = await Tag.findAll({
      where: {
        name: { [Op.like]: `%${query}%` }
      },
      attributes: ['name', 'slug'],
      limit: 3
    });

    // Get author suggestions
    const authorSuggestions = await User.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${query}%` } },
          { lastName: { [Op.like]: `%${query}%` } },
          { username: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'username', 'firstName', 'lastName'],
      limit: 3
    });

    const suggestions = {
      articles: articleSuggestions.map(article => ({
        type: 'article',
        title: article.title,
        slug: article.slug
      })),
      categories: categorySuggestions.map(cat => ({
        type: 'category',
        title: cat.name,
        slug: cat.slug
      })),
      tags: tagSuggestions.map(tag => ({
        type: 'tag',
        title: tag.name,
        slug: tag.slug
      })),
      authors: authorSuggestions.map(author => ({
        type: 'author',
        title: `${author.firstName} ${author.lastName}`,
        username: author.username,
        id: author.id
      }))
    };

    res.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
};

// Get available filters
exports.getFilters = async (req, res) => {
  try {
    // Get dynamic filter options from database
    const categories = await Category.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'slug'],
      order: [['name', 'ASC']]
    });

    const authors = await User.findAll({
      attributes: ['id', 'username', 'firstName', 'lastName'],
      order: [['firstName', 'ASC']]
    });

    const tags = await Tag.findAll({
      attributes: ['id', 'name', 'slug'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      filters: {
        ...filterOptions,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        })),
        authors: authors.map(author => ({
          id: author.id,
          name: `${author.firstName} ${author.lastName}`,
          username: author.username
        })),
        tags: tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug
        }))
      }
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get filters'
    });
  }
};

// Save search
exports.saveSearch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, query, filters, category, isPublic } = req.body;
    
    const savedSearch = await SavedSearch.create({
      userId: req.user?.id || null,
      name,
      query,
      filters,
      category,
      isPublic: isPublic || false,
      lastExecuted: new Date()
    });

    res.status(201).json({
      success: true,
      savedSearch
    });
  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save search'
    });
  }
};

// Get saved searches
exports.getSavedSearches = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = req.user 
      ? {
          [Op.or]: [
            { userId: req.user.id },
            { isPublic: true }
          ]
        }
      : { isPublic: true };

    const { count, rows } = await SavedSearch.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['lastExecuted', 'DESC']],
      include: [{
        model: User,
        attributes: ['username', 'firstName', 'lastName'],
        required: false
      }]
    });

    res.json({
      success: true,
      savedSearches: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved searches'
    });
  }
};

// Delete saved search
exports.deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    
    const whereClause = { id };
    if (req.user && !req.admin) {
      whereClause.userId = req.user.id;
    }

    const savedSearch = await SavedSearch.findOne({ where: whereClause });
    
    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: 'Saved search not found'
      });
    }

    await savedSearch.destroy();

    res.json({
      success: true,
      message: 'Saved search deleted successfully'
    });
  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete saved search'
    });
  }
};

// Get search analytics (Admin only)
exports.getSearchAnalytics = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
      searchType
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};

    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    if (searchType) {
      whereClause.searchType = searchType;
    }

    // Get analytics data
    const { count, rows } = await SearchAnalytics.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['username', 'firstName', 'lastName'],
        required: false
      }]
    });

    // Get summary statistics
    const totalSearches = await SearchAnalytics.count({ where: whereClause });
    
    const avgDuration = await SearchAnalytics.findOne({
      where: whereClause,
      attributes: [[sequelize.fn('AVG', sequelize.col('searchDuration')), 'avgDuration']],
      raw: true
    });

    const topQueries = await SearchAnalytics.findAll({
      where: whereClause,
      attributes: [
        'query',
        [sequelize.fn('COUNT', sequelize.col('query')), 'count']
      ],
      group: ['query'],
      order: [[sequelize.fn('COUNT', sequelize.col('query')), 'DESC']],
      limit: 10,
      raw: true
    });

    const noResultsCount = await SearchAnalytics.count({
      where: { ...whereClause, resultCount: 0 }
    });

    res.json({
      success: true,
      analytics: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      summary: {
        totalSearches,
        averageDuration: Math.round(avgDuration.avgDuration || 0),
        topQueries,
        noResultsCount,
        noResultsPercentage: totalSearches ? ((noResultsCount / totalSearches) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get search analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search analytics'
    });
  }
};

module.exports = exports;