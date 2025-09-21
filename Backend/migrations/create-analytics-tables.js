'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create EventAnalytics table
    await queryInterface.createTable('event_analytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      eventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      sessionId: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      eventType: {
        type: Sequelize.ENUM(
          'view',
          'registration_start',
          'registration_complete',
          'attendee_checkin',
          'attendee_checkout',
          'share',
          'bookmark',
          'calendar_add',
          'reminder_set',
          'feedback_submit',
          'download_ics',
          'contact_organizer'
        ),
        allowNull: false
      },
      deviceType: {
        type: Sequelize.ENUM('desktop', 'mobile', 'tablet', 'tv', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
      },
      browser: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      os: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      referrer: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      eventTimestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create FlipbookAnalytics table
    await queryInterface.createTable('flipbook_analytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      flipbookId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'flipbook_magazines',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      sessionId: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      eventType: {
        type: Sequelize.ENUM(
          'view_start',
          'view_complete',
          'page_view',
          'page_turn',
          'zoom_change',
          'fullscreen_enter',
          'fullscreen_exit',
          'download_start',
          'download_complete',
          'share',
          'bookmark',
          'print_attempt',
          'search',
          'annotation_add',
          'annotation_remove'
        ),
        allowNull: false
      },
      currentPage: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      totalPages: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      readTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      totalReadTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      zoomLevel: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true
      },
      deviceType: {
        type: Sequelize.ENUM('desktop', 'mobile', 'tablet', 'tv', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
      },
      browser: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      os: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      referrer: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      eventTimestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create DownloadAnalytics table
    await queryInterface.createTable('download_analytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      downloadId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Downloads',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      sessionId: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      eventType: {
        type: Sequelize.ENUM(
          'view',
          'download_start',
          'download_complete',
          'download_cancelled',
          'preview_view',
          'share',
          'bookmark',
          'rating_submit',
          'feedback_submit',
          'report_issue'
        ),
        allowNull: false
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      downloadSpeed: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      downloadTime: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      deviceType: {
        type: Sequelize.ENUM('desktop', 'mobile', 'tablet', 'tv', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
      },
      browser: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      os: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      referrer: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      eventTimestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create WebsiteAnalytics table
    await queryInterface.createTable('website_analytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      sessionId: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      eventType: {
        type: Sequelize.ENUM(
          'page_view',
          'session_start',
          'session_end',
          'user_engagement',
          'scroll_depth',
          'time_on_page',
          'bounce',
          'conversion',
          'search_performed',
          'social_share',
          'newsletter_signup',
          'contact_form_submit',
          'download_initiated',
          'video_play',
          'article_read',
          'comment_posted',
          'user_registration',
          'user_login',
          'error_occurred'
        ),
        allowNull: false
      },
      pageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      pageTitle: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      referrer: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      referrerDomain: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      campaignSource: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      campaignMedium: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      campaignName: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      campaignTerm: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      campaignContent: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      deviceType: {
        type: Sequelize.ENUM('desktop', 'mobile', 'tablet', 'tv', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
      },
      browser: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      os: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      screenResolution: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      viewportSize: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      language: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sessionDuration: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      pageLoadTime: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      timeOnPage: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      scrollDepth: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      isBounce: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      isConversion: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      conversionType: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      conversionValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      searchQuery: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      searchResults: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      errorType: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      eventTimestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create UserEngagementAnalytics table
    await queryInterface.createTable('user_engagement_analytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      sessionId: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      contentId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      contentType: {
        type: Sequelize.ENUM(
          'article',
          'video_article',
          'event',
          'flipbook',
          'download',
          'comment',
          'user_profile',
          'newsletter'
        ),
        allowNull: false
      },
      eventType: {
        type: Sequelize.ENUM(
          'view',
          'like',
          'unlike',
          'share',
          'bookmark',
          'unbookmark',
          'comment',
          'reply',
          'vote_up',
          'vote_down',
          'follow',
          'unfollow',
          'subscribe',
          'unsubscribe',
          'download',
          'rate',
          'review',
          'report',
          'hide',
          'save',
          'unsave'
        ),
        allowNull: false
      },
      platform: {
        type: Sequelize.ENUM(
          'website',
          'mobile_app',
          'social_facebook',
          'social_twitter',
          'social_linkedin',
          'social_whatsapp',
          'social_telegram',
          'email',
          'api'
        ),
        allowNull: false,
        defaultValue: 'website'
      },
      deviceType: {
        type: Sequelize.ENUM('desktop', 'mobile', 'tablet', 'tv', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
      },
      browser: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      os: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      referrer: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      engagementScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      timeSpent: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      interactionDepth: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true
      },
      sentiment: {
        type: Sequelize.ENUM('positive', 'neutral', 'negative'),
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      eventTimestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes for performance (with error handling for existing indexes)
    try {
      await queryInterface.addIndex('event_analytics', ['eventId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('event_analytics', ['userId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('event_analytics', ['sessionId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('event_analytics', ['eventType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('event_analytics', ['eventTimestamp']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('event_analytics', ['deviceType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('event_analytics', ['country']);
    } catch (error) {
      // Index might already exist, continue
    }

    try {
      await queryInterface.addIndex('flipbook_analytics', ['flipbookId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('flipbook_analytics', ['userId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('flipbook_analytics', ['sessionId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('flipbook_analytics', ['eventType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('flipbook_analytics', ['eventTimestamp']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('flipbook_analytics', ['deviceType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('flipbook_analytics', ['country']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('flipbook_analytics', ['currentPage']);
    } catch (error) {
      // Index might already exist, continue
    }

    try {
      await queryInterface.addIndex('download_analytics', ['downloadId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('download_analytics', ['userId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('download_analytics', ['sessionId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('download_analytics', ['eventType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('download_analytics', ['eventTimestamp']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('download_analytics', ['deviceType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('download_analytics', ['country']);
    } catch (error) {
      // Index might already exist, continue
    }

    try {
      await queryInterface.addIndex('website_analytics', ['sessionId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('website_analytics', ['userId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('website_analytics', ['eventType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('website_analytics', ['eventTimestamp']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('website_analytics', ['deviceType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('website_analytics', ['country']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('website_analytics', ['pageUrl']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('website_analytics', ['referrerDomain']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('website_analytics', ['campaignSource']);
    } catch (error) {
      // Index might already exist, continue
    }

    try {
      await queryInterface.addIndex('user_engagement_analytics', ['userId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('user_engagement_analytics', ['sessionId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('user_engagement_analytics', ['contentId']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('user_engagement_analytics', ['contentType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('user_engagement_analytics', ['eventType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('user_engagement_analytics', ['eventTimestamp']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('user_engagement_analytics', ['deviceType']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('user_engagement_analytics', ['country']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('user_engagement_analytics', ['platform']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('user_engagement_analytics', ['engagementScore']);
    } catch (error) {
      // Index might already exist, continue
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_engagement_analytics');
    await queryInterface.dropTable('website_analytics');
    await queryInterface.dropTable('download_analytics');
    await queryInterface.dropTable('flipbook_analytics');
    await queryInterface.dropTable('event_analytics');
  }
};