const {
  EventAnalytics,
  FlipbookAnalytics,
  DownloadAnalytics,
  WebsiteAnalytics,
  UserEngagementAnalytics,
  VideoAnalytics,
  ArticleView,
  VideoArticleView,
  Article,
  VideoArticle,
  Event,
  FlipbookMagazine,
  Download
} = require('../models');
const { Op } = require('sequelize');

/**
 * Comprehensive Analytics Controller
 * Handles all analytics data collection and reporting
 */
class ComprehensiveAnalyticsController {

  /**
   * Handle incoming analytics events from frontend
   */
  async trackEvent(req, res) {
    try {
      const { category, data } = req.body;

      if (!category || !data) {
        return res.status(400).json({
          success: false,
          message: 'Category and data are required'
        });
      }

      let result;

      switch (category) {
        case 'website':
          result = await this.trackWebsiteEvent(data);
          break;
        case 'engagement':
          result = await this.trackEngagementEvent(data);
          break;
        case 'video':
          result = await this.trackVideoEvent(data);
          break;
        case 'event':
          result = await this.trackEventAnalytics(data);
          break;
        case 'flipbook':
          result = await this.trackFlipbookEvent(data);
          break;
        case 'download':
          result = await this.trackDownloadEvent(data);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid analytics category'
          });
      }

      res.status(200).json({
        success: true,
        message: 'Analytics event tracked successfully',
        data: result
      });

    } catch (error) {
      console.error('Analytics tracking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track analytics event',
        error: error.message
      });
    }
  }

  /**
   * Track website analytics events
   */
  async trackWebsiteEvent(data) {
    const eventData = {
      sessionId: data.sessionId,
      userId: data.userId,
      eventType: data.eventType,
      pageUrl: data.pageUrl,
      pageTitle: data.pageTitle,
      referrer: data.referrer,
      referrerDomain: data.referrer ? new URL(data.referrer).hostname : null,
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

    return await WebsiteAnalytics.create(eventData);
  }

  /**
   * Track user engagement events
   */
  async trackEngagementEvent(data) {
    const eventData = {
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
      ipAddress: data.ipAddress,
      engagementScore: data.engagementScore || this.calculateEngagementScore(data.eventType),
      timeSpent: data.timeSpent,
      interactionDepth: data.interactionDepth,
      sentiment: data.sentiment,
      tags: data.tags || [],
      metadata: data.metadata || {},
      eventTimestamp: data.eventTimestamp ? new Date(data.eventTimestamp) : new Date()
    };

    return await UserEngagementAnalytics.create(eventData);
  }

  /**
   * Track video analytics events
   */
  async trackVideoEvent(data) {
    const eventData = {
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
      ipAddress: data.ipAddress,
      metadata: data.metadata || {},
      eventTimestamp: data.eventTimestamp ? new Date(data.eventTimestamp) : new Date()
    };

    return await VideoAnalytics.create(eventData);
  }

  /**
   * Track event analytics
   */
  async trackEventAnalytics(data) {
    const eventData = {
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

    return await EventAnalytics.create(eventData);
  }

  /**
   * Track flipbook analytics
   */
  async trackFlipbookEvent(data) {
    const eventData = {
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

    return await FlipbookAnalytics.create(eventData);
  }

  /**
   * Track download analytics
   */
  async trackDownloadEvent(data) {
    const eventData = {
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

    return await DownloadAnalytics.create(eventData);
  }

  /**
   * Calculate engagement score based on event type
   */
  calculateEngagementScore(eventType) {
    const scores = {
      'view': 1,
      'like': 5,
      'unlike': -5,
      'share': 10,
      'bookmark': 3,
      'unbookmark': -3,
      'comment': 15,
      'reply': 8,
      'vote_up': 7,
      'vote_down': -7,
      'follow': 12,
      'unfollow': -12,
      'subscribe': 20,
      'unsubscribe': -20,
      'download': 25,
      'rate': 10,
      'review': 18,
      'report': -15,
      'hide': -10,
      'save': 4,
      'unsave': -4
    };

    return scores[eventType] || 1;
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardData(req, res) {
    try {
      const { startDate, endDate, contentType } = req.query;

      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.eventTimestamp = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const dashboardData = {
        overview: await this.getOverviewStats(dateFilter),
        traffic: await this.getTrafficStats(dateFilter),
        engagement: await this.getEngagementStats(dateFilter, contentType),
        content: await this.getContentStats(dateFilter, contentType),
        realtime: await this.getRealtimeStats()
      };

      res.status(200).json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard data',
        error: error.message
      });
    }
  }

  /**
   * Get overview statistics
   */
  async getOverviewStats(dateFilter) {
    const [
      websiteStats,
      engagementStats,
      contentStats
    ] = await Promise.all([
      this.getWebsiteOverview(dateFilter),
      this.getEngagementOverview(dateFilter),
      this.getContentOverview(dateFilter)
    ]);

    return {
      ...websiteStats,
      ...engagementStats,
      ...contentStats
    };
  }

  /**
   * Get website overview stats
   */
  async getWebsiteOverview(dateFilter) {
    const stats = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.fn('DISTINCT', WebsiteAnalytics.sequelize.col('sessionId'))), 'totalSessions'],
        [WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.col('id')), 'totalPageViews'],
        [WebsiteAnalytics.sequelize.fn('AVG', WebsiteAnalytics.sequelize.col('sessionDuration')), 'avgSessionDuration'],
        [WebsiteAnalytics.sequelize.fn('AVG', WebsiteAnalytics.sequelize.col('pageLoadTime')), 'avgPageLoadTime'],
        [WebsiteAnalytics.sequelize.fn('SUM', WebsiteAnalytics.sequelize.col('conversionValue')), 'totalConversionValue']
      ],
      raw: true
    });

    const stat = stats[0] || {};
    return {
      totalSessions: parseInt(stat.totalSessions || 0),
      totalPageViews: parseInt(stat.totalPageViews || 0),
      avgSessionDuration: parseFloat(stat.avgSessionDuration || 0),
      avgPageLoadTime: parseFloat(stat.avgPageLoadTime || 0),
      totalConversionValue: parseFloat(stat.totalConversionValue || 0)
    };
  }

  /**
   * Get engagement overview stats
   */
  async getEngagementOverview(dateFilter) {
    const stats = await UserEngagementAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [UserEngagementAnalytics.sequelize.fn('COUNT', UserEngagementAnalytics.sequelize.col('id')), 'totalInteractions'],
        [UserEngagementAnalytics.sequelize.fn('COUNT', UserEngagementAnalytics.sequelize.fn('DISTINCT', UserEngagementAnalytics.sequelize.col('userId'))), 'uniqueUsers'],
        [UserEngagementAnalytics.sequelize.fn('SUM', UserEngagementAnalytics.sequelize.col('engagementScore')), 'totalEngagementScore'],
        [UserEngagementAnalytics.sequelize.fn('AVG', UserEngagementAnalytics.sequelize.col('engagementScore')), 'avgEngagementScore']
      ],
      raw: true
    });

    const stat = stats[0] || {};
    return {
      totalInteractions: parseInt(stat.totalInteractions || 0),
      uniqueUsers: parseInt(stat.uniqueUsers || 0),
      totalEngagementScore: parseInt(stat.totalEngagementScore || 0),
      avgEngagementScore: parseFloat(stat.avgEngagementScore || 0)
    };
  }

  /**
   * Get content overview stats
   */
  async getContentOverview(dateFilter) {
    const [
      articleStats,
      videoStats,
      eventStats,
      flipbookStats,
      downloadStats
    ] = await Promise.all([
      Article.count(),
      VideoArticle.count(),
      Event.count(),
      FlipbookMagazine.count(),
      Download.count()
    ]);

    return {
      totalArticles: articleStats,
      totalVideos: videoStats,
      totalEvents: eventStats,
      totalFlipbooks: flipbookStats,
      totalDownloads: downloadStats
    };
  }

  /**
   * Get traffic statistics
   */
  async getTrafficStats(dateFilter) {
    const [
      deviceStats,
      geographicStats,
      referrerStats,
      campaignStats
    ] = await Promise.all([
      this.getDeviceBreakdown(dateFilter),
      this.getGeographicBreakdown(dateFilter),
      this.getReferrerBreakdown(dateFilter),
      this.getCampaignBreakdown(dateFilter)
    ]);

    return {
      devices: deviceStats,
      geography: geographicStats,
      referrers: referrerStats,
      campaigns: campaignStats
    };
  }

  /**
   * Get device breakdown
   */
  async getDeviceBreakdown(dateFilter) {
    const stats = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        'deviceType',
        [WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.col('id')), 'count']
      ],
      group: ['deviceType'],
      raw: true
    });

    return stats.reduce((acc, stat) => {
      acc[stat.deviceType] = parseInt(stat.count);
      return acc;
    }, {});
  }

  /**
   * Get geographic breakdown
   */
  async getGeographicBreakdown(dateFilter) {
    const stats = await WebsiteAnalytics.findAll({
      where: dateFilter,
      attributes: [
        'country',
        [WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.col('id')), 'count']
      ],
      group: ['country'],
      order: [[WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    return stats.map(stat => ({
      country: stat.country,
      count: parseInt(stat.count)
    }));
  }

  /**
   * Get referrer breakdown
   */
  async getReferrerBreakdown(dateFilter) {
    const stats = await WebsiteAnalytics.findAll({
      where: {
        ...dateFilter,
        referrerDomain: { [Op.ne]: null }
      },
      attributes: [
        'referrerDomain',
        [WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.col('id')), 'count']
      ],
      group: ['referrerDomain'],
      order: [[WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    return stats.map(stat => ({
      domain: stat.referrerDomain,
      count: parseInt(stat.count)
    }));
  }

  /**
   * Get campaign breakdown
   */
  async getCampaignBreakdown(dateFilter) {
    const stats = await WebsiteAnalytics.findAll({
      where: {
        ...dateFilter,
        campaignSource: { [Op.ne]: null }
      },
      attributes: [
        'campaignSource',
        'campaignMedium',
        [WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.col('id')), 'count']
      ],
      group: ['campaignSource', 'campaignMedium'],
      order: [[WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    return stats.map(stat => ({
      source: stat.campaignSource,
      medium: stat.campaignMedium,
      count: parseInt(stat.count)
    }));
  }

  /**
   * Get engagement statistics
   */
  async getEngagementStats(dateFilter, contentType) {
    const whereClause = { ...dateFilter };
    if (contentType) {
      whereClause.contentType = contentType;
    }

    const stats = await UserEngagementAnalytics.findAll({
      where: whereClause,
      attributes: [
        'eventType',
        [UserEngagementAnalytics.sequelize.fn('COUNT', UserEngagementAnalytics.sequelize.col('id')), 'count']
      ],
      group: ['eventType'],
      raw: true
    });

    return stats.reduce((acc, stat) => {
      acc[stat.eventType] = parseInt(stat.count);
      return acc;
    }, {});
  }

  /**
   * Get content statistics
   */
  async getContentStats(dateFilter, contentType) {
    const stats = {};

    if (!contentType || contentType === 'article') {
      stats.articles = await this.getArticleStats(dateFilter);
    }

    if (!contentType || contentType === 'video_article') {
      stats.videos = await this.getVideoStats(dateFilter);
    }

    if (!contentType || contentType === 'event') {
      stats.events = await this.getEventStats(dateFilter);
    }

    if (!contentType || contentType === 'flipbook') {
      stats.flipbooks = await this.getFlipbookStats(dateFilter);
    }

    if (!contentType || contentType === 'download') {
      stats.downloads = await this.getDownloadStats(dateFilter);
    }

    return stats;
  }

  /**
   * Get article statistics
   */
  async getArticleStats(dateFilter) {
    const viewStats = await ArticleView.findAll({
      where: dateFilter,
      attributes: [
        [ArticleView.sequelize.fn('COUNT', ArticleView.sequelize.col('id')), 'totalViews'],
        [ArticleView.sequelize.fn('COUNT', ArticleView.sequelize.fn('DISTINCT', ArticleView.sequelize.col('articleId'))), 'uniqueArticles'],
        [ArticleView.sequelize.fn('AVG', ArticleView.sequelize.col('readingTime')), 'avgReadingTime']
      ],
      raw: true
    });

    const engagementStats = await UserEngagementAnalytics.findAll({
      where: {
        ...dateFilter,
        contentType: 'article'
      },
      attributes: [
        [UserEngagementAnalytics.sequelize.fn('SUM', UserEngagementAnalytics.sequelize.col('engagementScore')), 'totalEngagement']
      ],
      raw: true
    });

    const stat = viewStats[0] || {};
    const engagement = engagementStats[0] || {};

    return {
      totalViews: parseInt(stat.totalViews || 0),
      uniqueArticles: parseInt(stat.uniqueArticles || 0),
      avgReadingTime: parseFloat(stat.avgReadingTime || 0),
      totalEngagement: parseInt(engagement.totalEngagement || 0)
    };
  }

  /**
   * Get video statistics
   */
  async getVideoStats(dateFilter) {
    const viewStats = await VideoArticleView.findAll({
      where: dateFilter.eventTimestamp ? {
        viewedAt: dateFilter.eventTimestamp
      } : {},
      attributes: [
        [VideoArticleView.sequelize.fn('COUNT', VideoArticleView.sequelize.col('id')), 'totalViews'],
        [VideoArticleView.sequelize.fn('COUNT', VideoArticleView.sequelize.fn('DISTINCT', VideoArticleView.sequelize.col('videoArticleId'))), 'uniqueVideos'],
        [VideoArticleView.sequelize.fn('AVG', VideoArticleView.sequelize.col('watchTime')), 'avgWatchTime']
      ],
      raw: true
    });

    const engagementStats = await UserEngagementAnalytics.findAll({
      where: {
        ...dateFilter,
        contentType: 'video_article'
      },
      attributes: [
        [UserEngagementAnalytics.sequelize.fn('SUM', UserEngagementAnalytics.sequelize.col('engagementScore')), 'totalEngagement']
      ],
      raw: true
    });

    const stat = viewStats[0] || {};
    const engagement = engagementStats[0] || {};

    return {
      totalViews: parseInt(stat.totalViews || 0),
      uniqueVideos: parseInt(stat.uniqueVideos || 0),
      avgWatchTime: parseFloat(stat.avgWatchTime || 0),
      totalEngagement: parseInt(engagement.totalEngagement || 0)
    };
  }

  /**
   * Get event statistics
   */
  async getEventStats(dateFilter) {
    const stats = await EventAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [EventAnalytics.sequelize.fn('COUNT', EventAnalytics.sequelize.col('id')), 'totalInteractions'],
        [EventAnalytics.sequelize.fn('COUNT', EventAnalytics.sequelize.fn('DISTINCT', EventAnalytics.sequelize.col('eventId'))), 'uniqueEvents']
      ],
      raw: true
    });

    const stat = stats[0] || {};

    return {
      totalInteractions: parseInt(stat.totalInteractions || 0),
      uniqueEvents: parseInt(stat.uniqueEvents || 0)
    };
  }

  /**
   * Get flipbook statistics
   */
  async getFlipbookStats(dateFilter) {
    const stats = await FlipbookAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [FlipbookAnalytics.sequelize.fn('COUNT', FlipbookAnalytics.sequelize.col('id')), 'totalInteractions'],
        [FlipbookAnalytics.sequelize.fn('COUNT', FlipbookAnalytics.sequelize.fn('DISTINCT', FlipbookAnalytics.sequelize.col('flipbookId'))), 'uniqueFlipbooks'],
        [FlipbookAnalytics.sequelize.fn('SUM', FlipbookAnalytics.sequelize.col('readTime')), 'totalReadTime']
      ],
      raw: true
    });

    const stat = stats[0] || {};

    return {
      totalInteractions: parseInt(stat.totalInteractions || 0),
      uniqueFlipbooks: parseInt(stat.uniqueFlipbooks || 0),
      totalReadTime: parseInt(stat.totalReadTime || 0)
    };
  }

  /**
   * Get download statistics
   */
  async getDownloadStats(dateFilter) {
    const stats = await DownloadAnalytics.findAll({
      where: dateFilter,
      attributes: [
        [DownloadAnalytics.sequelize.fn('COUNT', DownloadAnalytics.sequelize.col('id')), 'totalInteractions'],
        [DownloadAnalytics.sequelize.fn('COUNT', DownloadAnalytics.sequelize.fn('DISTINCT', DownloadAnalytics.sequelize.col('downloadId'))), 'uniqueDownloads']
      ],
      raw: true
    });

    const stat = stats[0] || {};

    return {
      totalInteractions: parseInt(stat.totalInteractions || 0),
      uniqueDownloads: parseInt(stat.uniqueDownloads || 0)
    };
  }

  /**
   * Get real-time statistics
   */
  async getRealtimeStats() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [
      websiteRealtime,
      engagementRealtime
    ] = await Promise.all([
      WebsiteAnalytics.findAll({
        where: {
          eventTimestamp: { [Op.gte]: fiveMinutesAgo }
        },
        attributes: [
          'eventType',
          [WebsiteAnalytics.sequelize.fn('COUNT', WebsiteAnalytics.sequelize.col('id')), 'count']
        ],
        group: ['eventType'],
        raw: true
      }),
      UserEngagementAnalytics.findAll({
        where: {
          eventTimestamp: { [Op.gte]: fiveMinutesAgo }
        },
        attributes: [
          'eventType',
          [UserEngagementAnalytics.sequelize.fn('COUNT', UserEngagementAnalytics.sequelize.col('id')), 'count']
        ],
        group: ['eventType'],
        raw: true
      })
    ]);

    return {
      website: websiteRealtime.reduce((acc, stat) => {
        acc[stat.eventType] = parseInt(stat.count);
        return acc;
      }, {}),
      engagement: engagementRealtime.reduce((acc, stat) => {
        acc[stat.eventType] = parseInt(stat.count);
        return acc;
      }, {})
    };
  }

  /**
   * Get analytics report for export
   */
  async getAnalyticsReport(req, res) {
    try {
      const { startDate, endDate, reportType, format = 'json' } = req.query;

      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.eventTimestamp = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      let reportData;

      switch (reportType) {
        case 'traffic':
          reportData = await this.getTrafficReport(dateFilter);
          break;
        case 'engagement':
          reportData = await this.getEngagementReport(dateFilter);
          break;
        case 'content':
          reportData = await this.getContentReport(dateFilter);
          break;
        case 'conversion':
          reportData = await this.getConversionReport(dateFilter);
          break;
        default:
          reportData = await this.getComprehensiveReport(dateFilter);
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csvData = this.convertToCSV(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.csv"`);
        return res.send(csvData);
      }

      res.status(200).json({
        success: true,
        reportType,
        dateRange: { startDate, endDate },
        data: reportData
      });

    } catch (error) {
      console.error('Analytics report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate analytics report',
        error: error.message
      });
    }
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    console.log('Converting to CSV, data structure:', JSON.stringify(data, null, 2));

    // Handle different report data structures
    if (data && data.sections) {
      // Comprehensive report with sections
      let csvContent = 'Section,Metric,Value\n';

      // Traffic section
      if (data.sections.traffic) {
        csvContent += 'Traffic,Report Type,' + (data.sections.traffic.reportType || 'traffic') + '\n';
        if (data.sections.traffic.summary) {
          csvContent += 'Traffic,Total Sessions,' + (data.sections.traffic.summary.totalSessions || 0) + '\n';
        }
        if (data.sections.traffic.data && data.sections.traffic.data.devices) {
          Object.entries(data.sections.traffic.data.devices).forEach(([device, count]) => {
            csvContent += 'Traffic,' + device + ',' + count + '\n';
          });
        }
      }

      // Engagement section
      if (data.sections.engagement) {
        csvContent += 'Engagement,Report Type,' + (data.sections.engagement.reportType || 'engagement') + '\n';
        if (data.sections.engagement.summary) {
          csvContent += 'Engagement,Total Interactions,' + (data.sections.engagement.summary.totalInteractions || 0) + '\n';
        }
        if (data.sections.engagement.data) {
          Object.entries(data.sections.engagement.data).forEach(([event, count]) => {
            csvContent += 'Engagement,' + event + ',' + count + '\n';
          });
        }
      }

      // Content section
      if (data.sections.content && data.sections.content.data) {
        csvContent += 'Content,Report Type,' + (data.sections.content.reportType || 'content') + '\n';

        if (data.sections.content.data.articles) {
          csvContent += 'Content,Article Views,' + (data.sections.content.data.articles.totalViews || 0) + '\n';
          csvContent += 'Content,Unique Articles,' + (data.sections.content.data.articles.uniqueArticles || 0) + '\n';
          csvContent += 'Content,Avg Reading Time,' + (data.sections.content.data.articles.avgReadingTime || 0) + '\n';
        }

        if (data.sections.content.data.videos) {
          csvContent += 'Content,Video Views,' + (data.sections.content.data.videos.totalViews || 0) + '\n';
          csvContent += 'Content,Unique Videos,' + (data.sections.content.data.videos.uniqueVideos || 0) + '\n';
          csvContent += 'Content,Avg Watch Time,' + (data.sections.content.data.videos.avgWatchTime || 0) + '\n';
        }

        if (data.sections.content.data.events) {
          csvContent += 'Content,Event Interactions,' + (data.sections.content.data.events.totalInteractions || 0) + '\n';
          csvContent += 'Content,Unique Events,' + (data.sections.content.data.events.uniqueEvents || 0) + '\n';
        }
      }

      return csvContent;
    }

    // Handle simple data structures
    if (Array.isArray(data)) {
      if (data.length === 0) return 'No data available\n';

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ];

      return csvRows.join('\n');
    }

    // Handle object data
    if (typeof data === 'object' && data !== null) {
      let csvContent = 'Metric,Value\n';

      // Add basic metadata
      if (data.generatedAt) {
        csvContent += 'Generated At,' + data.generatedAt + '\n';
      }
      if (data.reportType) {
        csvContent += 'Report Type,' + data.reportType + '\n';
      }

      // Add summary data
      if (data.summary) {
        Object.entries(data.summary).forEach(([key, value]) => {
          csvContent += 'Summary ' + key + ',' + value + '\n';
        });
      }

      // Add main data
      if (data.data) {
        if (typeof data.data === 'object') {
          Object.entries(data.data).forEach(([key, value]) => {
            if (typeof value === 'object') {
              // Handle nested objects
              Object.entries(value).forEach(([subKey, subValue]) => {
                csvContent += key + ' ' + subKey + ',' + subValue + '\n';
              });
            } else {
              csvContent += key + ',' + value + '\n';
            }
          });
        }
      }

      return csvContent;
    }

    // Fallback
    return 'No data available for CSV export\n';
  }

  /**
   * Create custom analytics report
   */
  async createCustomReport(req, res) {
    try {
      const { name, description, reportType, dateRange, metrics, filters, format } = req.body;

      // Get the report data based on the configuration
      const dateFilter = {};
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        dateFilter.eventTimestamp = {
          [Op.between]: [new Date(dateRange.startDate), new Date(dateRange.endDate)]
        };
      }

      let reportData;

      switch (reportType) {
        case 'traffic':
          reportData = await this.getTrafficReport(dateFilter);
          break;
        case 'engagement':
          reportData = await this.getEngagementReport(dateFilter);
          break;
        case 'content':
          reportData = await this.getContentReport(dateFilter);
          break;
        case 'conversion':
          reportData = await this.getConversionReport(dateFilter);
          break;
        default:
          reportData = await this.getComprehensiveReport(dateFilter);
      }

      if (format === 'pdf') {
        try {
          console.log('Generating PDF report...');

          // Generate PDF using pdf-lib with better error handling
          const { PDFDocument, rgb } = require('pdf-lib');
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          const { width, height } = page.getSize();

          // Set up basic page layout
          let yPosition = height - 50;

          // Add title with error handling
          try {
            const title = (name || 'Custom Analytics Report').substring(0, 50); // Limit title length
            page.drawText(title, {
              x: 50,
              y: yPosition,
              size: 18,
              color: rgb(0, 0, 0)
            });
            yPosition -= 35;
          } catch (titleError) {
            console.warn('Failed to add title to PDF:', titleError);
          }

          // Add description if provided
          if (description) {
            try {
              const desc = description.substring(0, 100); // Limit description length
              page.drawText(desc, {
                x: 50,
                y: yPosition,
                size: 12,
                color: rgb(0.3, 0.3, 0.3)
              });
              yPosition -= 25;
            } catch (descError) {
              console.warn('Failed to add description to PDF:', descError);
            }
          }

          // Add generation timestamp
          try {
            const timestamp = `Generated: ${new Date().toLocaleString()}`;
            page.drawText(timestamp, {
              x: 50,
              y: yPosition,
              size: 10,
              color: rgb(0.5, 0.5, 0.5)
            });
            yPosition -= 30;
          } catch (timeError) {
            console.warn('Failed to add timestamp to PDF:', timeError);
          }

          // Add basic report info
          try {
            const reportInfo = `Report Type: ${reportType || 'comprehensive'}\nDate Range: ${dateRange?.startDate || 'N/A'} to ${dateRange?.endDate || 'N/A'}`;
            page.drawText(reportInfo, {
              x: 50,
              y: yPosition,
              size: 10,
              color: rgb(0, 0, 0)
            });
            yPosition -= 40;
          } catch (infoError) {
            console.warn('Failed to add report info to PDF:', infoError);
          }

          // Add actual analytics data with proper formatting
          try {
            console.log('Report data structure:', JSON.stringify(reportData, null, 2));

            if (reportData) {
              // Add section headers and data based on report type
              if (reportType === 'traffic' && reportData.data && reportData.data.devices) {
                yPosition -= 20;
                page.drawText('Traffic Analytics:', {
                  x: 50,
                  y: yPosition,
                  size: 14,
                  color: rgb(0, 0, 0.5)
                });
                yPosition -= 20;

                // Device breakdown
                page.drawText('Device Types:', {
                  x: 70,
                  y: yPosition,
                  size: 12,
                  color: rgb(0, 0, 0)
                });
                yPosition -= 15;

                Object.entries(reportData.data.devices).forEach(([device, count]) => {
                  if (yPosition < 50) {
                    page = pdfDoc.addPage();
                    yPosition = height - 50;
                  }
                  page.drawText(`${device}: ${count}`, {
                    x: 90,
                    y: yPosition,
                    size: 10,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 12;
                });

                // Geographic data
                if (reportData.data.geography && reportData.data.geography.length > 0) {
                  yPosition -= 20;
                  page.drawText('Top Countries:', {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;

                  reportData.data.geography.slice(0, 5).forEach(geo => {
                    if (yPosition < 50) {
                      page = pdfDoc.addPage();
                      yPosition = height - 50;
                    }
                    page.drawText(`${geo.country || 'Unknown'}: ${geo.count}`, {
                      x: 90,
                      y: yPosition,
                      size: 10,
                      color: rgb(0, 0, 0)
                    });
                    yPosition -= 12;
                  });
                }
              }

              if (reportType === 'engagement' && reportData.data) {
                yPosition -= 20;
                page.drawText('Engagement Analytics:', {
                  x: 50,
                  y: yPosition,
                  size: 14,
                  color: rgb(0, 0, 0.5)
                });
                yPosition -= 20;

                page.drawText(`Total Interactions: ${reportData.summary?.totalInteractions || 0}`, {
                  x: 70,
                  y: yPosition,
                  size: 12,
                  color: rgb(0, 0, 0)
                });
                yPosition -= 15;

                page.drawText(`Unique Users: ${reportData.summary?.uniqueUsers || 0}`, {
                  x: 70,
                  y: yPosition,
                  size: 12,
                  color: rgb(0, 0, 0)
                });
                yPosition -= 15;

                // Show engagement events
                if (Object.keys(reportData.data).length > 0) {
                  yPosition -= 10;
                  page.drawText('Engagement Events:', {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;

                  Object.entries(reportData.data).slice(0, 10).forEach(([event, count]) => {
                    if (yPosition < 50) {
                      page = pdfDoc.addPage();
                      yPosition = height - 50;
                    }
                    page.drawText(`${event}: ${count}`, {
                      x: 90,
                      y: yPosition,
                      size: 10,
                      color: rgb(0, 0, 0)
                    });
                    yPosition -= 12;
                  });
                }
              }

              if (reportType === 'content' && reportData.data) {
                yPosition -= 20;
                page.drawText('Content Analytics:', {
                  x: 50,
                  y: yPosition,
                  size: 14,
                  color: rgb(0, 0, 0.5)
                });
                yPosition -= 20;

                if (reportData.data.articles) {
                  page.drawText(`Articles - Total Views: ${reportData.data.articles.totalViews || 0}`, {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;

                  page.drawText(`Articles - Unique Articles: ${reportData.data.articles.uniqueArticles || 0}`, {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;

                  if (reportData.data.articles.avgReadingTime) {
                    page.drawText(`Articles - Avg Reading Time: ${Math.round(reportData.data.articles.avgReadingTime)}s`, {
                      x: 70,
                      y: yPosition,
                      size: 12,
                      color: rgb(0, 0, 0)
                    });
                    yPosition -= 15;
                  }
                }

                if (reportData.data.videos) {
                  yPosition -= 10;
                  page.drawText(`Videos - Total Views: ${reportData.data.videos.totalViews || 0}`, {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;

                  page.drawText(`Videos - Unique Videos: ${reportData.data.videos.uniqueVideos || 0}`, {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;
                }

                if (reportData.data.events) {
                  yPosition -= 10;
                  page.drawText(`Events - Total Interactions: ${reportData.data.events.totalInteractions || 0}`, {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;
                }
              }

              if (reportType === 'comprehensive' && reportData.sections) {
                // Show summary for comprehensive report
                yPosition -= 20;
                page.drawText('Comprehensive Analytics Summary:', {
                  x: 50,
                  y: yPosition,
                  size: 14,
                  color: rgb(0, 0, 0.5)
                });
                yPosition -= 20;

                // Traffic summary
                if (reportData.sections.traffic?.summary) {
                  page.drawText(`Total Sessions: ${reportData.sections.traffic.summary.totalSessions || 0}`, {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;
                }

                // Engagement summary
                if (reportData.sections.engagement?.summary) {
                  page.drawText(`Total Interactions: ${reportData.sections.engagement.summary.totalInteractions || 0}`, {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;
                }

                // Content summary
                if (reportData.sections.content?.data?.articles) {
                  page.drawText(`Article Views: ${reportData.sections.content.data.articles.totalViews || 0}`, {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;
                }
              }

              // Add comprehensive data display for all report types
              if (reportData.sections) {
                yPosition -= 20;
                page.drawText('Detailed Analytics Data:', {
                  x: 50,
                  y: yPosition,
                  size: 14,
                  color: rgb(0, 0, 0.5)
                });
                yPosition -= 20;

                // Display traffic data
                if (reportData.sections.traffic?.data?.devices) {
                  page.drawText('Traffic by Device:', {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;

                  Object.entries(reportData.sections.traffic.data.devices).forEach(([device, count]) => {
                    if (yPosition < 50) {
                      page = pdfDoc.addPage();
                      yPosition = height - 50;
                    }
                    page.drawText(`${device}: ${count}`, {
                      x: 90,
                      y: yPosition,
                      size: 10,
                      color: rgb(0, 0, 0)
                    });
                    yPosition -= 12;
                  });
                }

                // Display engagement data
                if (reportData.sections.engagement?.data && Object.keys(reportData.sections.engagement.data).length > 0) {
                  yPosition -= 10;
                  page.drawText('Engagement Events:', {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;

                  Object.entries(reportData.sections.engagement.data).slice(0, 8).forEach(([event, count]) => {
                    if (yPosition < 50) {
                      page = pdfDoc.addPage();
                      yPosition = height - 50;
                    }
                    page.drawText(`${event}: ${count}`, {
                      x: 90,
                      y: yPosition,
                      size: 10,
                      color: rgb(0, 0, 0)
                    });
                    yPosition -= 12;
                  });
                }

                // Display content data
                if (reportData.sections.content?.data) {
                  yPosition -= 10;
                  page.drawText('Content Performance:', {
                    x: 70,
                    y: yPosition,
                    size: 12,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 15;

                  if (reportData.sections.content.data.articles) {
                    page.drawText(`Articles: ${reportData.sections.content.data.articles.totalViews || 0} views`, {
                      x: 90,
                      y: yPosition,
                      size: 10,
                      color: rgb(0, 0, 0)
                    });
                    yPosition -= 12;
                  }

                  if (reportData.sections.content.data.videos) {
                    page.drawText(`Videos: ${reportData.sections.content.data.videos.totalViews || 0} views`, {
                      x: 90,
                      y: yPosition,
                      size: 10,
                      color: rgb(0, 0, 0)
                    });
                    yPosition -= 12;
                  }

                  if (reportData.sections.content.data.events) {
                    page.drawText(`Events: ${reportData.sections.content.data.events.totalInteractions || 0} interactions`, {
                      x: 90,
                      y: yPosition,
                      size: 10,
                      color: rgb(0, 0, 0)
                    });
                    yPosition -= 12;
                  }
                }
              }

              // If no specific sections but we have data, show it
              if (!reportData.sections && reportData.data) {
                yPosition -= 20;
                page.drawText('Analytics Data:', {
                  x: 50,
                  y: yPosition,
                  size: 14,
                  color: rgb(0, 0, 0.5)
                });
                yPosition -= 20;

                // Display any available data
                const dataString = JSON.stringify(reportData.data, null, 2);
                const lines = dataString.split('\n').slice(0, 20); // Limit to first 20 lines

                lines.forEach(line => {
                  if (yPosition < 50) {
                    page = pdfDoc.addPage();
                    yPosition = height - 50;
                  }
                  page.drawText(line.substring(0, 80), { // Limit line length
                    x: 70,
                    y: yPosition,
                    size: 8,
                    color: rgb(0, 0, 0)
                  });
                  yPosition -= 10;
                });
              }

            } else {
              // No data available
              page.drawText('No analytics data available for the selected period.', {
                x: 50,
                y: yPosition,
                size: 12,
                color: rgb(0.5, 0, 0)
              });
            }
          } catch (dataError) {
            console.warn('Failed to add data to PDF:', dataError);
            // Add fallback text
            page.drawText('Report data could not be displayed in PDF format.', {
              x: 50,
              y: yPosition,
              size: 10,
              color: rgb(1, 0, 0)
            });
          }

          // Save the PDF
          const pdfBytes = await pdfDoc.save();
          console.log(`PDF generated successfully, size: ${pdfBytes.length} bytes`);

          // Ensure proper headers are set
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${(name || 'analytics_report').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`);
          res.setHeader('Content-Length', pdfBytes.length);
          res.setHeader('Cache-Control', 'no-cache');

          // Send the PDF buffer
          return res.send(Buffer.from(pdfBytes));

        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError);
          // Return error response instead of falling back to HTML
          return res.status(500).json({
            success: false,
            message: 'PDF generation failed',
            error: pdfError.message,
            reportName: name,
            description,
            reportType,
            dateRange,
            generatedAt: new Date().toISOString()
          });
        }

      } else if (format === 'json') {
        // Return JSON data
        return res.status(200).json({
          success: true,
          reportName: name,
          description,
          reportType,
          dateRange,
          data: reportData,
          generatedAt: new Date().toISOString()
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported format. Use "pdf" or "json"'
        });
      }

    } catch (error) {
      console.error('Custom report creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create custom report',
        error: error.message
      });
    }
  }

  // Additional report methods would be implemented here
  async getTrafficReport(dateFilter) {
    // Basic traffic report implementation
    const trafficData = await this.getTrafficStats(dateFilter);
    return {
      reportType: 'traffic',
      data: trafficData,
      summary: {
        totalSessions: trafficData.devices ? Object.values(trafficData.devices).reduce((a, b) => a + b, 0) : 0
      }
    };
  }

  async getEngagementReport(dateFilter) {
    // Basic engagement report implementation
    const engagementData = await this.getEngagementStats(dateFilter);
    return {
      reportType: 'engagement',
      data: engagementData,
      summary: {
        totalInteractions: Object.values(engagementData).reduce((a, b) => a + b, 0)
      }
    };
  }

  async getContentReport(dateFilter) {
    // Basic content report implementation
    const contentData = await this.getContentStats(dateFilter);
    return {
      reportType: 'content',
      data: contentData
    };
  }

  async getConversionReport(dateFilter) {
    // Basic conversion report implementation
    return {
      reportType: 'conversion',
      data: {},
      message: 'Conversion tracking not yet implemented'
    };
  }

  async getComprehensiveReport(dateFilter) {
    // Comprehensive report combining all data
    const [traffic, engagement, content] = await Promise.all([
      this.getTrafficReport(dateFilter),
      this.getEngagementReport(dateFilter),
      this.getContentReport(dateFilter)
    ]);

    return {
      reportType: 'comprehensive',
      sections: {
        traffic,
        engagement,
        content
      },
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = new ComprehensiveAnalyticsController();