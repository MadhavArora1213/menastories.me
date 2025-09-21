const WebSocket = require('ws');
const { EventEmitter } = require('events');
const { Op, fn, col } = require('sequelize');

/**
 * Real-time Analytics Service using WebSockets
 * Provides live updates for analytics dashboard
 */
class RealtimeAnalyticsService extends EventEmitter {
  constructor(server) {
    super();
    this.wss = null;
    this.server = server;
    this.clients = new Set();
    this.updateIntervals = new Map();
    this.isRunning = false;

    // Analytics data cache
    this.cachedData = {
      website: {},
      engagement: {},
      realtime: {
        activeUsers: 0,
        currentSessions: new Set(),
        recentEvents: []
      }
    };

    this.init();
  }

  /**
   * Initialize the WebSocket server
   */
  init() {
    try {
      this.wss = new WebSocket.Server({
        server: this.server,
        path: '/ws/analytics'
      });

      this.wss.on('connection', this.handleConnection.bind(this));
      this.wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
      });

      console.log('✅ Real-time analytics WebSocket server initialized');
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
    }
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    console.log('🔗 New analytics WebSocket connection');

    // Add client to set
    this.clients.add(ws);

    // Send initial data
    this.sendToClient(ws, {
      type: 'initial_data',
      data: this.cachedData
    });

    // Handle client messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleClientMessage(ws, data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      console.log('❌ Analytics WebSocket connection closed');
      this.clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
      this.clients.delete(ws);
    });
  }

  /**
   * Handle messages from clients
   */
  handleClientMessage(ws, data) {
    switch (data.type) {
      case 'subscribe':
        this.handleSubscription(ws, data);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(ws, data);
        break;
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: Date.now() });
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  /**
   * Handle client subscription to specific analytics
   */
  handleSubscription(ws, data) {
    const { channels } = data;

    if (!ws.subscriptions) {
      ws.subscriptions = new Set();
    }

    if (Array.isArray(channels)) {
      channels.forEach(channel => ws.subscriptions.add(channel));
    } else if (channels) {
      ws.subscriptions.add(channels);
    }

    console.log('📡 Client subscribed to channels:', Array.from(ws.subscriptions));
  }

  /**
   * Handle client unsubscription
   */
  handleUnsubscription(ws, data) {
    const { channels } = data;

    if (!ws.subscriptions) return;

    if (Array.isArray(channels)) {
      channels.forEach(channel => ws.subscriptions.delete(channel));
    } else if (channels) {
      ws.subscriptions.delete(channels);
    }

    console.log('📡 Client unsubscribed from channels:', channels);
  }

  /**
   * Send message to specific client
   */
  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Failed to send message to client:', error);
        this.clients.delete(ws);
      }
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(data, channel = null) {
    const message = JSON.stringify(data);

    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        // If channel is specified, only send to subscribed clients
        if (channel && ws.subscriptions && !ws.subscriptions.has(channel)) {
          return;
        }

        try {
          ws.send(message);
        } catch (error) {
          console.error('Failed to broadcast to client:', error);
          this.clients.delete(ws);
        }
      } else {
        // Remove dead connections
        this.clients.delete(ws);
      }
    });
  }

  /**
   * Update cached analytics data
   */
  updateCachedData(type, data) {
    this.cachedData[type] = {
      ...this.cachedData[type],
      ...data,
      lastUpdated: Date.now()
    };

    // Broadcast update to clients
    this.broadcast({
      type: 'data_update',
      dataType: type,
      data: this.cachedData[type],
      timestamp: Date.now()
    }, type);
  }

  /**
   * Update real-time metrics
   */
  updateRealtimeMetrics(metrics) {
    this.cachedData.realtime = {
      ...this.cachedData.realtime,
      ...metrics,
      lastUpdated: Date.now()
    };

    // Add to recent events if it's an event
    if (metrics.event) {
      this.cachedData.realtime.recentEvents.unshift({
        ...metrics.event,
        timestamp: Date.now()
      });

      // Keep only last 50 events
      if (this.cachedData.realtime.recentEvents.length > 50) {
        this.cachedData.realtime.recentEvents = this.cachedData.realtime.recentEvents.slice(0, 50);
      }
    }

    // Broadcast real-time update
    this.broadcast({
      type: 'realtime_update',
      data: this.cachedData.realtime,
      timestamp: Date.now()
    }, 'realtime');
  }

  /**
   * Track user session
   */
  trackSession(sessionId, userId = null, action = 'start') {
    if (action === 'start') {
      this.cachedData.realtime.currentSessions.add(sessionId);
      this.cachedData.realtime.activeUsers = this.cachedData.realtime.currentSessions.size;
    } else if (action === 'end') {
      this.cachedData.realtime.currentSessions.delete(sessionId);
      this.cachedData.realtime.activeUsers = this.cachedData.realtime.currentSessions.size;
    }

    this.updateRealtimeMetrics({
      activeUsers: this.cachedData.realtime.activeUsers,
      event: {
        type: 'session_' + action,
        sessionId,
        userId
      }
    });
  }

  /**
   * Track analytics event
   */
  trackEvent(eventData) {
    this.updateRealtimeMetrics({
      event: eventData
    });
  }

  /**
   * Start periodic updates
   */
  startPeriodicUpdates() {
    if (this.isRunning) return;

    this.isRunning = true;

    // Update active users count every 30 seconds
    const activeUsersInterval = setInterval(() => {
      // Clean up old sessions (simulate session timeout)
      const now = Date.now();
      // In a real implementation, you'd check actual session activity

      this.updateRealtimeMetrics({
        activeUsers: this.cachedData.realtime.activeUsers
      });
    }, 30000);

    // Update dashboard data every 60 seconds
    const dashboardInterval = setInterval(async () => {
      try {
        // Fetch latest analytics data from database
        const latestData = await this.fetchLatestAnalyticsData();
        this.updateCachedData('dashboard', latestData);
      } catch (error) {
        console.error('Failed to fetch latest analytics data:', error);
      }
    }, 60000);

    this.updateIntervals.set('activeUsers', activeUsersInterval);
    this.updateIntervals.set('dashboard', dashboardInterval);

    console.log('⏰ Started periodic analytics updates');
  }

  /**
   * Stop periodic updates
   */
  stopPeriodicUpdates() {
    if (!this.isRunning) return;

    this.isRunning = false;

    this.updateIntervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`🛑 Stopped ${name} update interval`);
    });

    this.updateIntervals.clear();
  }

  /**
   * Fetch latest analytics data from database
   */
  async fetchLatestAnalyticsData() {
    try {
      // Import models dynamically to avoid circular dependencies
      const {
        WebsiteAnalytics,
        UserEngagementAnalytics,
        ArticleView,
        VideoArticleView,
        EventAnalytics,
        FlipbookAnalytics,
        DownloadAnalytics
      } = require('../models');

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // Get real-time stats
      const [
        websiteStats,
        engagementStats,
        articleViews,
        videoViews,
        eventInteractions,
        flipbookInteractions,
        downloadInteractions
      ] = await Promise.all([
        WebsiteAnalytics.findAll({
          where: { eventTimestamp: { [Op.gte]: fiveMinutesAgo } },
          attributes: [
            [fn('COUNT', col('id')), 'events']
          ],
          raw: true
        }),
        UserEngagementAnalytics.findAll({
          where: { eventTimestamp: { [Op.gte]: fiveMinutesAgo } },
          attributes: [
            [fn('COUNT', col('id')), 'interactions']
          ],
          raw: true
        }),
        ArticleView.count({ where: { viewedAt: { [Op.gte]: fiveMinutesAgo } } }),
        VideoArticleView.count({ where: { viewedAt: { [Op.gte]: fiveMinutesAgo } } }),
        EventAnalytics.count({ where: { eventTimestamp: { [Op.gte]: fiveMinutesAgo } } }),
        FlipbookAnalytics.count({ where: { eventTimestamp: { [Op.gte]: fiveMinutesAgo } } }),
        DownloadAnalytics.count({ where: { eventTimestamp: { [Op.gte]: fiveMinutesAgo } } })
      ]);

      return {
        websiteEvents: parseInt(websiteStats[0]?.events || 0),
        engagementInteractions: parseInt(engagementStats[0]?.interactions || 0),
        articleViews,
        videoViews,
        eventInteractions,
        flipbookInteractions,
        downloadInteractions,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Failed to fetch latest analytics data:', error);
      return {
        error: 'Failed to fetch data',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      connectedClients: this.clients.size,
      cachedData: this.cachedData,
      updateIntervals: Array.from(this.updateIntervals.keys())
    };
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stopPeriodicUpdates();

    if (this.wss) {
      this.wss.close(() => {
        console.log('🧹 Real-time analytics WebSocket server closed');
      });
    }

    this.clients.clear();
    this.removeAllListeners();
  }
}

module.exports = RealtimeAnalyticsService;