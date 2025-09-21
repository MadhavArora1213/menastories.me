const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const {
  WebsiteAnalytics,
  UserEngagementAnalytics,
  VideoAnalytics,
  ArticleView,
  VideoArticleView,
  EventAnalytics,
  FlipbookAnalytics,
  DownloadAnalytics,
  Article,
  VideoArticle,
  Author,
  Category,
  Comment
} = require('../models');
const { adminAuthMiddleware, requireAdminRole, requireWebmaster } = require('../middleware/adminAuth');

// Track analytics event
router.post('/track', async (req, res) => {
  try {
    const { category, data } = req.body;

    if (!category || !data) {
      return res.status(400).json({
        success: false,
        message: 'Category and data are required'
      });
    }

    let eventData;

    switch (category) {
      case 'website':
        eventData = {
          sessionId: data.sessionId,
          userId: data.userId,
          eventType: data.eventType,
          pageUrl: data.pageUrl,
          pageTitle: data.pageTitle,
          referrer: data.referrer,
          referrerDomain: data.referrerDomain,
          campaignSource: data.campaignSource,
          campaignMedium: data.campaignMedium,
          campaignName: data.campaignName,
          campaignTerm: data.campaignTerm,
          campaignContent: data.campaignContent,
          deviceType: data.deviceType,
          browser: data.browser,
          os: data.os,
          screenResolution: data.screenResolution,
          viewportSize: data.viewportSize,
          country: data.country,
          region: data.region,
          city: data.city,
          language: data.language,
          timezone: data.timezone,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          sessionDuration: data.sessionDuration,
          pageLoadTime: data.pageLoadTime,
          timeOnPage: data.timeOnPage,
          scrollDepth: data.scrollDepth,
          isBounce: data.isBounce,
          isConversion: data.isConversion,
          conversionType: data.conversionType,
          conversionValue: data.conversionValue,
          searchQuery: data.searchQuery,
          searchResults: data.searchResults,
          errorType: data.errorType,
          errorMessage: data.errorMessage,
          metadata: data.metadata || {},
          eventTimestamp: data.eventTimestamp ? new Date(data.eventTimestamp) : new Date()
        };

        await WebsiteAnalytics.create(eventData);
        break;

      case 'engagement':
        eventData = {
          userId: data.userId,
          sessionId: data.sessionId,
          contentId: data.contentId,
          contentType: data.contentType,
          eventType: data.eventType,
          platform: data.platform || 'website',
          deviceType: data.deviceType,
          browser: data.browser,
          os: data.os,
          country: data.country,
          region: data.region,
          city: data.city,
          referrer: data.referrer,
          userAgent: data.userAgent,
          engagementScore: data.engagementScore || 1,
          timeSpent: data.timeSpent,
          interactionDepth: data.interactionDepth,
          sentiment: data.sentiment,
          tags: data.tags || [],
          metadata: data.metadata || {},
          eventTimestamp: data.eventTimestamp ? new Date(data.eventTimestamp) : new Date()
        };

        await UserEngagementAnalytics.create(eventData);
        break;

      case 'video':
        eventData = {
          videoId: data.videoId,
          userId: data.userId,
          sessionId: data.sessionId,
          eventType: data.eventType,
          watchTime: data.watchTime,
          totalDuration: data.totalDuration,
          currentTime: data.currentTime,
          quality: data.quality,
          deviceType: data.deviceType,
          browser: data.browser,
          os: data.os,
          country: data.country,
          region: data.region,
          city: data.city,
          referrer: data.referrer,
          userAgent: data.userAgent,
          metadata: data.metadata || {},
          eventTimestamp: data.eventTimestamp ? new Date(data.eventTimestamp) : new Date()
        };

        await VideoAnalytics.create(eventData);
        break;

      case 'event':
        eventData = {
          eventId: data.eventId,
          userId: data.userId,
          sessionId: data.sessionId,
          eventType: data.eventType,
          deviceType: data.deviceType,
          browser: data.browser,
          os: data.os,
          country: data.country,
          region: data.region,
          city: data.city,
          referrer: data.referrer,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          metadata: data.metadata || {},
          eventTimestamp: data.eventTimestamp ? new Date(data.eventTimestamp) : new Date()
        };

        await EventAnalytics.create(eventData);
        break;

      case 'flipbook':
        eventData = {
          flipbookId: data.flipbookId,
          userId: data.userId,
          sessionId: data.sessionId,
          eventType: data.eventType,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          readTime: data.readTime,
          totalReadTime: data.totalReadTime,
          zoomLevel: data.zoomLevel,
          deviceType: data.deviceType,
          browser: data.browser,
          os: data.os,
          country: data.country,
          region: data.region,
          city: data.city,
          referrer: data.referrer,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          metadata: data.metadata || {},
          eventTimestamp: data.eventTimestamp ? new Date(data.eventTimestamp) : new Date()
        };

        await FlipbookAnalytics.create(eventData);
        break;

      case 'download':
        eventData = {
          downloadId: data.downloadId,
          userId: data.userId,
          sessionId: data.sessionId,
          eventType: data.eventType,
          fileSize: data.fileSize,
          downloadSpeed: data.downloadSpeed,
          downloadTime: data.downloadTime,
          deviceType: data.deviceType,
          browser: data.browser,
          os: data.os,
          country: data.country,
          region: data.region,
          city: data.city,
          referrer: data.referrer,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          metadata: data.metadata || {},
          eventTimestamp: data.eventTimestamp ? new Date(data.eventTimestamp) : new Date()
        };

        await DownloadAnalytics.create(eventData);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid analytics category'
        });
    }

    res.json({
      success: true,
      message: 'Analytics event tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking analytics event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track analytics event'
    });
  }
});

// Get dashboard analytics
router.get('/dashboard', adminAuthMiddleware, requireWebmaster, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        eventTimestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }

    // Get website analytics
    const websiteStats = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [fn('COUNT', col('id')), 'totalEvents'],
        [fn('COUNT', fn('DISTINCT', col('sessionId'))), 'uniqueSessions'],
        [fn('AVG', col('sessionDuration')), 'avgSessionDuration'],
        [fn('SUM', col('timeOnPage')), 'totalTimeOnPage']
      ],
      raw: true
    });

    // Get engagement analytics
    const engagementStats = await UserEngagementAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [fn('COUNT', col('id')), 'totalInteractions'],
        [fn('COUNT', fn('DISTINCT', col('userId'))), 'uniqueUsers']
      ],
      raw: true
    });

    // Get top articles - simplified approach to avoid complex joins
    const topArticles = await Article.findAll({
      attributes: ['id', 'title', 'slug', 'viewCount'],
      order: [['viewCount', 'DESC']],
      limit: 10,
      raw: true
    });

    // Add recent views count to each article
    for (let article of topArticles) {
      const recentViewsCount = await ArticleView.count({
        where: {
          articleId: article.id,
          ...(dateFilter.eventTimestamp && {
            viewedAt: dateFilter.eventTimestamp
          })
        }
      });
      article.recentViews = recentViewsCount;
    }

    // Get device breakdown
    const deviceBreakdown = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        'deviceType',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['deviceType'],
      raw: true
    });

    // Get video analytics
    const videoStats = await VideoArticleView.findAll({
      where: dateFilter.eventTimestamp ? {
        viewedAt: dateFilter.eventTimestamp
      } : {},
      attributes: [
        [fn('COUNT', col('id')), 'totalVideoViews']
      ],
      raw: true
    });

    // Get event analytics
    const eventStats = await EventAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [fn('COUNT', col('id')), 'totalEventInteractions']
      ],
      raw: true
    });

    // Get flipbook analytics
    const flipbookStats = await FlipbookAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [fn('COUNT', col('id')), 'totalFlipbookInteractions']
      ],
      raw: true
    });

    // Get download analytics
    const downloadStats = await DownloadAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [fn('COUNT', col('id')), 'totalDownloadInteractions']
      ],
      raw: true
    });

    // Get top videos
    const topVideos = await VideoArticle.findAll({
      attributes: ['id', 'title', 'slug', 'viewCount'],
      order: [['viewCount', 'DESC']],
      limit: 10,
      raw: true
    });

    // Add recent views count to each video
    for (let video of topVideos) {
      const recentViewsCount = await VideoArticleView.count({
        where: {
          videoArticleId: video.id,
          ...(dateFilter.eventTimestamp && {
            viewedAt: dateFilter.eventTimestamp
          })
        }
      });
      video.recentViews = recentViewsCount;
    }

    // Get category stats
    const categoryStats = await Category.findAll({
      attributes: [
        'id', 'name',
        [fn('COUNT', fn('DISTINCT', Article.sequelize.col('articles.id'))), 'articleCount']
      ],
      include: [
        {
          model: Article,
          as: 'articles',
          attributes: [],
          where: { status: 'published' },
          required: false
        }
      ],
      group: ['Category.id', 'Category.name'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        traffic: {
          totalViews: parseInt(websiteStats[0]?.totalEvents || 0),
          uniqueVisitors: parseInt(engagementStats[0]?.uniqueUsers || 0),
          avgSessionDuration: Math.round(parseFloat(websiteStats[0]?.avgSessionDuration || 0)),
          totalTimeOnPage: parseInt(websiteStats[0]?.totalTimeOnPage || 0)
        },
        engagement: {
          totalInteractions: parseInt(engagementStats[0]?.totalInteractions || 0)
        },
        topArticles,
        deviceBreakdown,
        videoViews: parseInt(videoStats[0]?.totalVideoViews || 0),
        eventInteractions: parseInt(eventStats[0]?.totalEventInteractions || 0),
        flipbookInteractions: parseInt(flipbookStats[0]?.totalFlipbookInteractions || 0),
        downloadInteractions: parseInt(downloadStats[0]?.totalDownloadInteractions || 0),
        topVideos,
        categories: categoryStats
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics'
    });
  }
});

// Get real-time analytics
router.get('/realtime/stats', async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [
      activeUsers,
      recentPageViews,
      topPages
    ] = await Promise.all([
      UserEngagementAnalytics.count({
        where: {
          eventTimestamp: { [Op.gte]: fiveMinutesAgo }
        },
        distinct: true,
        col: 'sessionId'
      }),
      WebsiteAnalytics.count({
        where: {
          eventTimestamp: { [Op.gte]: fiveMinutesAgo },
          eventType: 'page_view'
        }
      }),
      WebsiteAnalytics.findAll({
        where: {
          eventTimestamp: { [Op.gte]: fiveMinutesAgo },
          eventType: 'page_view'
        },
        attributes: [
          'pageUrl',
          [fn('COUNT', col('id')), 'views']
        ],
        group: ['pageUrl'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 10,
        raw: true
      })
    ]);

    res.json({
      success: true,
      data: {
        activeUsers,
        currentPageViews: recentPageViews,
        topPages
      }
    });

  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time analytics'
    });
  }
});

// Get content performance analytics
router.get('/content-performance', async (req, res) => {
  try {
    const { startDate, endDate, sortBy = 'recentViews', sortOrder = 'DESC' } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        eventTimestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }

    // Get article performance - simplified approach
    const articles = await Article.findAll({
      attributes: ['id', 'title', 'slug', 'viewCount', 'publishDate'],
      include: [
        {
          model: Author,
          as: 'primaryAuthor',
          attributes: ['name']
        }
      ],
      limit: 50,
      raw: true
    });

    // Add performance metrics to each article
    const articlePerformance = [];
    for (let article of articles) {
      const viewStats = await ArticleView.findAll({
        where: {
          articleId: article.id,
          ...(dateFilter.eventTimestamp && {
            viewedAt: dateFilter.eventTimestamp
          })
        },
        attributes: [
          [fn('COUNT', col('id')), 'recentViews'],
          [fn('AVG', col('readingTime')), 'avgReadTime']
        ],
        raw: true
      });

      if (viewStats[0] && viewStats[0].recentViews > 0) {
        articlePerformance.push({
          ...article,
          recentViews: parseInt(viewStats[0].recentViews || 0),
          avgReadTime: parseFloat(viewStats[0].avgReadTime || 0),
          authorName: article['primaryAuthor.name'] || 'Unknown'
        });
      }
    }

    // Sort the results
    articlePerformance.sort((a, b) => {
      if (sortBy === 'recentViews') {
        return sortOrder === 'DESC' ? b.recentViews - a.recentViews : a.recentViews - b.recentViews;
      }
      return 0;
    });

    // Get category performance - simplified approach
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      raw: true
    });

    const categoryPerformance = [];
    for (let category of categories) {
      const articles = await Article.findAll({
        where: { categoryId: category.id },
        attributes: ['id']
      });

      const articleIds = articles.map(a => a.id);
      if (articleIds.length > 0) {
        const viewCount = await ArticleView.count({
          where: {
            articleId: { [Op.in]: articleIds },
            ...(dateFilter.eventTimestamp && {
              viewedAt: dateFilter.eventTimestamp
            })
          }
        });

        categoryPerformance.push({
          categoryName: category.name,
          views: viewCount
        });
      }
    }

    // Get author performance - simplified approach
    const authors = await Author.findAll({
      attributes: ['id', 'name'],
      raw: true
    });

    const authorPerformance = [];
    for (let author of authors) {
      const articles = await Article.findAll({
        where: { authorId: author.id },
        attributes: ['id', 'viewCount']
      });

      const totalArticles = articles.length;
      const totalViews = articles.reduce((sum, article) => sum + (article.viewCount || 0), 0);

      const articleIds = articles.map(a => a.id);
      let recentViews = 0;
      if (articleIds.length > 0) {
        recentViews = await ArticleView.count({
          where: {
            articleId: { [Op.in]: articleIds },
            ...(dateFilter.eventTimestamp && {
              viewedAt: dateFilter.eventTimestamp
            })
          }
        });
      }

      authorPerformance.push({
        authorName: author.name,
        totalArticles,
        totalViews,
        recentViews
      });
    }

    // Process author performance to calculate averages
    const processedAuthorPerformance = authorPerformance.map(author => ({
      authorName: author.authorName,
      totalArticles: parseInt(author.totalArticles),
      totalViews: parseInt(author.totalViews || 0),
      avgViewsPerArticle: author.totalArticles > 0 ?
        Math.round(parseInt(author.totalViews || 0) / parseInt(author.totalArticles)) : 0
    }));

    res.json({
      success: true,
      data: {
        articlePerformance: articlePerformance.map(article => ({
          ...article,
          recentViews: parseInt(article.recentViews || 0),
          viewCount: parseInt(article.viewCount || 0),
          avgReadTime: parseFloat(article.avgReadTime || 0),
          publishedAt: article.publishDate
        })),
        categoryPerformance: categoryPerformance.map(cat => ({
          categoryName: cat.categoryName,
          views: parseInt(cat.views || 0)
        })),
        authorPerformance: processedAuthorPerformance
      }
    });

  } catch (error) {
    console.error('Error fetching content performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content performance data'
    });
  }
});

// Get user behavior analytics
router.get('/user-behavior', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        eventTimestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }

    // Get device breakdown
    const deviceBreakdown = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        'deviceType',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['deviceType'],
      raw: true
    });

    // Get geographic data (simplified - would need IP geolocation service)
    const geographicData = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        'country',
        [fn('COUNT', col('id')), 'visits']
      ],
      group: ['country'],
      having: literal('COUNT("id") > 0'),
      raw: true
    });

    // Get browser data
    const browserData = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        'browser',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['browser'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        deviceBreakdown,
        geographicData,
        browserData
      }
    });

  } catch (error) {
    console.error('Error fetching user behavior:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user behavior data'
    });
  }
});

// Get author performance analytics
router.get('/author-performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        eventTimestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }

    // Get author performance - simplified approach
    const authors = await Author.findAll({
      attributes: ['id', 'name'],
      raw: true
    });

    const authorPerformance = [];
    for (let author of authors) {
      const articles = await Article.findAll({
        where: { authorId: author.id },
        attributes: ['id', 'viewCount']
      });

      const totalArticles = articles.length;
      const totalViews = articles.reduce((sum, article) => sum + (article.viewCount || 0), 0);

      const articleIds = articles.map(a => a.id);
      let recentViews = 0;
      if (articleIds.length > 0) {
        recentViews = await ArticleView.count({
          where: {
            articleId: { [Op.in]: articleIds },
            ...(dateFilter.eventTimestamp && {
              viewedAt: dateFilter.eventTimestamp
            })
          }
        });
      }

      authorPerformance.push({
        authorName: author.name,
        totalArticles,
        totalViews,
        recentViews
      });
    }

    // Process author performance to calculate averages
    const processedAuthorPerformance = authorPerformance.map(author => ({
      authorName: author.authorName,
      totalArticles: parseInt(author.totalArticles),
      totalViews: parseInt(author.totalViews || 0),
      avgViewsPerArticle: author.totalArticles > 0 ?
        Math.round(parseInt(author.totalViews || 0) / parseInt(author.totalArticles)) : 0
    }));

    res.json({
      success: true,
      data: {
        authorPerformance: processedAuthorPerformance
      }
    });

  } catch (error) {
    console.error('Error fetching author performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch author performance data'
    });
  }
});

// Get SEO analytics
router.get('/seo-analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        eventTimestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }

    // Get search queries and results
    const searchAnalytics = await WebsiteAnalytics.findAll({
      where: {
        ...dateFilter,
        eventType: 'search_performed'
      },
      attributes: [
        'searchQuery',
        'searchResults',
        [fn('COUNT', col('id')), 'totalSearches']
      ],
      group: ['searchQuery', 'searchResults'],
      raw: true
    });

    // Get page load times
    const pageLoadTimes = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        'pageUrl',
        [fn('AVG', col('pageLoadTime')), 'avgLoadTime'],
        [fn('COUNT', col('id')), 'totalViews']
      ],
      group: ['pageUrl'],
      having: literal('AVG("pageLoadTime") IS NOT NULL'),
      raw: true
    });

    res.json({
      success: true,
      data: {
        keywordSummary: searchAnalytics.map(item => ({
          keyword: item.searchQuery,
          totalImpressions: parseInt(item.totalSearches),
          totalClicks: parseInt(item.searchResults || 0)
        })),
        pageLoadTimes: pageLoadTimes.map(item => ({
          pageUrl: item.pageUrl,
          avgLoadTime: parseFloat(item.avgLoadTime || 0),
          totalViews: parseInt(item.totalViews)
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching SEO analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SEO analytics data'
    });
  }
});

// Get social analytics
router.get('/social-analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        eventTimestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }

    // Get social engagement data from user engagement analytics
    const socialEngagement = await UserEngagementAnalytics.findAll({
      where: {
        ...dateFilter,
        eventType: 'share'
      },
      attributes: [
        'platform',
        [fn('COUNT', col('id')), 'totalShares']
      ],
      group: ['platform'],
      raw: true
    });

    // Get total likes, shares, comments from articles
    const articleEngagement = await Article.findAll({
      attributes: [
        [fn('SUM', col('likeCount')), 'totalLikes'],
        [fn('SUM', col('shareCount')), 'totalShares']
      ],
      raw: true
    });

    // Get comment counts
    const commentCount = await Comment.count();

    res.json({
      success: true,
      data: {
        totalLikes: parseInt(articleEngagement[0]?.totalLikes || 0),
        totalShares: parseInt(articleEngagement[0]?.totalShares || 0) + socialEngagement.reduce((sum, item) => sum + parseInt(item.totalShares || 0), 0),
        totalComments: commentCount,
        totalViews: await Article.sum('viewCount') || 0,
        platformBreakdown: socialEngagement.map(item => ({
          platform: item.platform,
          shares: parseInt(item.totalShares || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching social analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social analytics data'
    });
  }
});

// Create custom report
router.post('/custom-reports', async (req, res) => {
  try {
    const {
      name,
      description,
      reportType,
      dateRange,
      metrics,
      filters,
      format = 'json'
    } = req.body;

    // Validate required fields
    if (!name || !reportType || !dateRange || !metrics) {
      return res.status(400).json({
        success: false,
        message: 'Name, reportType, dateRange, and metrics are required'
      });
    }

    // Generate report based on type
    let reportData = {};

    switch (reportType) {
      case 'traffic':
        reportData = await generateTrafficReport(dateRange, metrics, filters);
        break;
      case 'engagement':
        reportData = await generateEngagementReport(dateRange, metrics, filters);
        break;
      case 'content':
        reportData = await generateContentReport(dateRange, metrics, filters);
        break;
      case 'comprehensive':
        reportData = await generateComprehensiveReport(dateRange, metrics, filters);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    // Handle different export formats
    if (format === 'json') {
      const reportConfig = {
        id: Date.now().toString(),
        name,
        description,
        reportType,
        dateRange,
        metrics,
        filters,
        format,
        createdAt: new Date(),
        data: reportData
      };

      res.status(201).json({
        success: true,
        message: 'Custom report created successfully',
        data: reportConfig
      });
    } else {
      // Generate file download
      const fileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'csv':
          await generateCSVReport(res, reportData, fileName, name, description);
          break;
        case 'excel':
          await generateExcelReport(res, reportData, fileName, name, description);
          break;
        case 'pdf':
          await generatePDFReport(res, reportData, fileName, name, description);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Unsupported format'
          });
      }
    }

  } catch (error) {
    console.error('Error creating custom report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom report',
      error: error.message
    });
  }
});

// Helper functions for generating different report types
async function generateTrafficReport(dateRange, metrics, filters = {}) {
  const { startDate, endDate } = dateRange;
  let dateFilter = {};

  if (startDate && endDate) {
    dateFilter = {
      eventTimestamp: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };
  }

  const results = {};

  if (metrics.includes('pageViews')) {
    const pageViews = await WebsiteAnalytics.count({
      where: {
        ...dateFilter,
        eventType: 'page_view',
        ...filters
      }
    });
    results.pageViews = pageViews;
  }

  if (metrics.includes('uniqueVisitors')) {
    const uniqueVisitors = await UserEngagementAnalytics.count({
      where: {
        ...dateFilter,
        ...filters
      },
      distinct: true,
      col: 'sessionId'
    });
    results.uniqueVisitors = uniqueVisitors;
  }

  if (metrics.includes('sessionDuration')) {
    const sessionStats = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [fn('AVG', col('sessionDuration')), 'avgSessionDuration']
      ],
      raw: true
    });
    results.avgSessionDuration = parseFloat(sessionStats[0]?.avgSessionDuration || 0);
  }

  return results;
}

async function generateEngagementReport(dateRange, metrics, filters = {}) {
  const { startDate, endDate } = dateRange;
  let dateFilter = {};

  if (startDate && endDate) {
    dateFilter = {
      eventTimestamp: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };
  }

  const results = {};

  if (metrics.includes('totalInteractions')) {
    const totalInteractions = await UserEngagementAnalytics.count({
      where: {
        ...dateFilter,
        ...filters
      }
    });
    results.totalInteractions = totalInteractions;
  }

  if (metrics.includes('interactionTypes')) {
    const interactionTypes = await UserEngagementAnalytics.findAll({
      where: {
        ...dateFilter,
        ...filters
      },
      attributes: [
        'eventType',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['eventType'],
      raw: true
    });
    results.interactionTypes = interactionTypes;
  }

  return results;
}

async function generateContentReport(dateRange, metrics, filters = {}) {
  const { startDate, endDate } = dateRange;
  let dateFilter = {};

  if (startDate && endDate) {
    dateFilter = {
      eventTimestamp: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };
  }

  const results = {};

  if (metrics.includes('topArticles')) {
    const topArticles = await Article.findAll({
      attributes: ['id', 'title', 'slug', 'viewCount'],
      order: [['viewCount', 'DESC']],
      limit: 10,
      raw: true
    });
    results.topArticles = topArticles;
  }

  if (metrics.includes('videoViews')) {
    const videoViews = await VideoArticleView.count({
      where: dateFilter.eventTimestamp ? {
        viewedAt: dateFilter.eventTimestamp
      } : {}
    });
    results.videoViews = videoViews;
  }

  return results;
}

async function generateComprehensiveReport(dateRange, metrics, filters = {}) {
  const trafficData = await generateTrafficReport(dateRange, metrics, filters);
  const engagementData = await generateEngagementReport(dateRange, metrics, filters);
  const contentData = await generateContentReport(dateRange, metrics, filters);

  return {
    ...trafficData,
    ...engagementData,
    ...contentData,
    generatedAt: new Date(),
    dateRange
  };
}

// Helper functions for generating downloadable reports
async function generateCSVReport(res, reportData, fileName, reportName, description) {
  try {
    // Convert report data to CSV format
    let csvContent = `Report Name: ${reportName}\n`;
    csvContent += `Description: ${description}\n`;
    csvContent += `Generated: ${new Date().toISOString()}\n\n`;

    // Convert data object to CSV rows
    const flattenData = (data, prefix = '') => {
      const rows = [];

      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          rows.push(...flattenData(value, prefix ? `${prefix}.${key}` : key));
        } else if (Array.isArray(value)) {
          rows.push(`${prefix ? `${prefix}.` : ''}${key},${JSON.stringify(value)}`);
        } else {
          rows.push(`${prefix ? `${prefix}.` : ''}${key},${value}`);
        }
      }

      return rows;
    };

    const csvRows = flattenData(reportData);
    csvContent += 'Metric,Value\n';
    csvContent += csvRows.join('\n');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

    res.send(csvContent);
  } catch (error) {
    console.error('Error generating CSV report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSV report'
    });
  }
}

async function generateExcelReport(res, reportData, fileName, reportName, description) {
  try {
    // For Excel, we'll create a simple CSV format that Excel can open
    // In a production app, you'd use a library like exceljs
    let csvContent = `Report Name:,${reportName}\n`;
    csvContent += `Description:,${description}\n`;
    csvContent += `Generated:,${new Date().toISOString()}\n\n`;

    // Convert data to CSV format
    const flattenData = (data, prefix = '') => {
      const rows = [];

      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          rows.push(...flattenData(value, prefix ? `${prefix}.${key}` : key));
        } else if (Array.isArray(value)) {
          rows.push(`${prefix ? `${prefix}.` : ''}${key},"${JSON.stringify(value).replace(/"/g, '""')}"`);
        } else {
          rows.push(`${prefix ? `${prefix}.` : ''}${key},"${value}"`);
        }
      }

      return rows;
    };

    const csvRows = flattenData(reportData);
    csvContent += '"Metric","Value"\n';
    csvContent += csvRows.map(row => `"${row.split(',')[0]}","${row.split(',').slice(1).join(',')}"`).join('\n');

    // Set headers for Excel download (using CSV format that Excel can open)
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

    res.send(csvContent);
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Excel report'
    });
  }
}

async function generatePDFReport(res, reportData, fileName, reportName, description) {
  try {
    console.log('Generating PDF report...');

    // Generate PDF using pdf-lib
    const { PDFDocument, rgb } = require('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Set up basic page layout
    let yPosition = height - 50;
    const margin = 50;
    const lineHeight = 20;
    const fontSize = 10;

    // Helper function to add text with word wrapping
    const addText = (text, x, y, size = fontSize, color = rgb(0, 0, 0)) => {
      try {
        page.drawText(text, { x, y, size, color });
      } catch (error) {
        console.warn('Failed to add text to PDF:', error);
      }
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace = lineHeight) => {
      if (yPosition - requiredSpace < margin) {
        page = pdfDoc.addPage();
        yPosition = height - margin;
        return true;
      }
      return false;
    };

    // Add title
    const title = (reportName || 'Custom Analytics Report').substring(0, 50);
    addText(title, margin, yPosition, 18, rgb(0, 0, 0));
    yPosition -= 35;

    // Add description if provided
    if (description) {
      const desc = description.substring(0, 100);
      addText(desc, margin, yPosition, 12, rgb(0.3, 0.3, 0.3));
      yPosition -= 25;
    }

    // Add generation timestamp
    const timestamp = `Generated: ${new Date().toLocaleString()}`;
    addText(timestamp, margin, yPosition, 10, rgb(0.5, 0.5, 0.5));
    yPosition -= 40;

    // Add report header
    addText('ANALYTICS REPORT SUMMARY', margin, yPosition, 14, rgb(0, 0.2, 0.6));
    yPosition -= 30;

    // Function to format data for display
    const formatDataForDisplay = (data, prefix = '') => {
      const lines = [];

      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          if (data.length === 0) {
            lines.push(`${prefix}No data available`);
          } else {
            // Handle array of values
            data.forEach((item, index) => {
              if (typeof item === 'object' && item !== null) {
                lines.push(`${prefix}Item ${index + 1}:`);
                Object.entries(item).slice(0, 5).forEach(([key, value]) => {
                  const displayValue = formatValue(value);
                  if (displayValue !== null) {
                    lines.push(`  ${key}: ${displayValue}`);
                  }
                });
              } else {
                lines.push(`${prefix}${item}`);
              }
            });
          }
        } else {
          // Handle object
          Object.entries(data).forEach(([key, value]) => {
            const displayValue = formatValue(value, key);
            if (displayValue !== null) {
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                lines.push(`${key}:`);
                Object.entries(value).slice(0, 5).forEach(([subKey, subValue]) => {
                  const subDisplayValue = formatValue(subValue);
                  if (subDisplayValue !== null) {
                    lines.push(`  ${subKey}: ${subDisplayValue}`);
                  }
                });
              } else {
                lines.push(`${key}: ${displayValue}`);
              }
            }
          });
        }
      } else {
        const displayValue = formatValue(data);
        if (displayValue !== null) {
          lines.push(`${prefix}${displayValue}`);
        }
      }

      return lines;
    };

    // Helper function to format individual values
    const formatValue = (value, key = '') => {
      if (value === null || value === undefined) {
        return 'N/A';
      }

      if (typeof value === 'number') {
        // Format numbers nicely
        if (key.toLowerCase().includes('count') || key.toLowerCase().includes('total')) {
          return value.toLocaleString();
        }
        return value.toString();
      }

      if (typeof value === 'string') {
        // Handle date strings - check if it looks like a date
        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time') ||
            key.toLowerCase().includes('at') || key.toLowerCase().endsWith('at') ||
            key.toLowerCase().endsWith('At') || value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            }
          } catch (e) {
            // Not a valid date, continue
          }
        }

        // Limit string length for display
        if (value.length > 50) {
          return value.substring(0, 47) + '...';
        }
        return value;
      }

      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }

      if (Array.isArray(value)) {
        return `${value.length} items`;
      }

      if (typeof value === 'object') {
        return '[Object]';
      }

      return String(value);
    };

    // Debug: Log the report data structure
    console.log('Report data structure:', JSON.stringify(reportData, null, 2));

    // Process and display the report data
    const dataLines = formatDataForDisplay(reportData);

    console.log('Formatted data lines:', dataLines);

    for (const line of dataLines) {
      checkNewPage();
      addText(line, margin, yPosition, fontSize);
      yPosition -= lineHeight;
    }

    // Add footer
    checkNewPage(60);
    yPosition -= 20;
    addText('Report generated by Analytics System', margin, yPosition, 8, rgb(0.5, 0.5, 0.5));
    yPosition -= 15;
    addText('For internal use only', margin, yPosition, 8, rgb(0.5, 0.5, 0.5));

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    console.log(`PDF generated successfully, size: ${pdfBytes.length} bytes`);

    // Ensure proper headers are set
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
    res.setHeader('Content-Length', pdfBytes.length);
    res.setHeader('Cache-Control', 'no-cache');

    // Send the PDF buffer
    return res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
}

module.exports = router;