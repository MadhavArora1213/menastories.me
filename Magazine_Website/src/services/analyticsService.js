/**
 * Analytics Service for tracking user interactions and sending data to backend
 */
class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.isInitialized = false;
    this.eventQueue = [];
    this.isOnline = navigator.onLine;
    this.apiEndpoint = '/api/analytics/track';
    this.analyticsBaseUrl = '/api/analytics';
    this.backendReady = false;

    // Bind methods
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);

    this.init();
  }

  /**
   * Initialize the analytics service
   */
  init() {
    if (this.isInitialized) return;

    // Get user ID from localStorage or context
    this.userId = this.getUserId();

    // Set up event listeners
    this.setupEventListeners();

    // Start heartbeat for session tracking
    this.startHeartbeat();

    // Initialize with delay to ensure backend is ready
    this.initializeWithDelay();

    this.isInitialized = true;
  }

  /**
   * Initialize analytics with delay to ensure backend is ready
   */
  async initializeWithDelay() {
    // Wait for backend to be ready
    await this.waitForBackendReady();

    // Track initial page view after backend is ready
    this.trackPageView();

    // Process any queued events
    this.processEventQueue();
  }

  /**
   * Wait for backend to be ready before making API calls
   */
  async waitForBackendReady(maxRetries = 10, retryDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Test backend connectivity with a simple health check
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: 'website',
            data: {
              eventType: 'health_check',
              test: true
            }
          })
        });

        // If we get a response (even if it's an error), the backend is reachable
        if (response.status === 400) {
          // Backend is ready but rejected our test request (expected)
          console.log('✅ Analytics backend is ready');
          return true;
        }

        // Any other response means backend is reachable
        console.log('✅ Analytics backend is ready');
        return true;

      } catch (error) {
        console.warn(`Analytics backend not ready (attempt ${attempt}/${maxRetries}):`, error.message);

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    console.warn('⚠️ Analytics backend not ready after maximum retries. Analytics will work offline.');
    return false;
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Before unload
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    // Click tracking for engagement
    document.addEventListener('click', this.handleClick.bind(this), true);

    // Scroll tracking
    this.setupScrollTracking();

    // Form interactions
    this.setupFormTracking();
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId() {
    const existing = localStorage.getItem('analytics_session_id');
    if (existing) {
      return existing;
    }

    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('analytics_session_id', sessionId);
    return sessionId;
  }

  /**
   * Get user ID from various sources
   */
  getUserId() {
    // Try to get from localStorage
    let userId = localStorage.getItem('user_id');

    // Try to get from global context (if available)
    if (!userId && window.userContext && window.userContext.id) {
      userId = window.userContext.id;
      localStorage.setItem('user_id', userId);
    }

    return userId;
  }

  /**
   * Set user ID (call this when user logs in)
   */
  setUserId(userId) {
    this.userId = userId;
    localStorage.setItem('user_id', userId);
  }

  /**
   * Get device and browser information
   */
  getDeviceInfo() {
    const ua = navigator.userAgent;
    const deviceInfo = {
      userAgent: ua,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Detect device type
    if (/Mobi|Android/i.test(ua)) {
      deviceInfo.deviceType = 'mobile';
    } else if (/Tablet|iPad/i.test(ua)) {
      deviceInfo.deviceType = 'tablet';
    } else {
      deviceInfo.deviceType = 'desktop';
    }

    // Detect browser
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      deviceInfo.browser = 'Chrome';
    } else if (ua.includes('Firefox')) {
      deviceInfo.browser = 'Firefox';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      deviceInfo.browser = 'Safari';
    } else if (ua.includes('Edg')) {
      deviceInfo.browser = 'Edge';
    } else {
      deviceInfo.browser = 'Other';
    }

    // Detect OS
    if (ua.includes('Windows')) {
      deviceInfo.os = 'Windows';
    } else if (ua.includes('Mac')) {
      deviceInfo.os = 'macOS';
    } else if (ua.includes('Linux')) {
      deviceInfo.os = 'Linux';
    } else if (ua.includes('Android')) {
      deviceInfo.os = 'Android';
    } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
      deviceInfo.os = 'iOS';
    } else {
      deviceInfo.os = 'Other';
    }

    return deviceInfo;
  }

  /**
   * Get geolocation information (if available)
   */
  async getGeoInfo() {
    try {
      // This would require a geolocation service or IP-based lookup
      // For now, return basic info
      return {
        country: null,
        region: null,
        city: null,
        ipAddress: null
      };
    } catch (error) {
      console.warn('Failed to get geo info:', error);
      return {
        country: null,
        region: null,
        city: null,
        ipAddress: null
      };
    }
  }

  /**
   * Track page view
   */
  async trackPageView(pageData = {}) {
    const deviceInfo = this.getDeviceInfo();
    const geoInfo = await this.getGeoInfo();

    const eventData = {
      eventType: 'page_view',
      pageUrl: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer,
      ...deviceInfo,
      ...geoInfo,
      sessionDuration: 0,
      timeOnPage: 0,
      scrollDepth: 0,
      ...pageData
    };

    this.trackEvent('website', eventData);

    // Start tracking time on page
    this.pageStartTime = Date.now();
    this.lastActivityTime = Date.now();
  }

  /**
   * Track user engagement event
   */
  trackEngagement(contentId, contentType, eventType, metadata = {}) {
    const eventData = {
      contentId,
      contentType,
      eventType,
      ...metadata
    };

    this.trackEvent('engagement', eventData);
  }

  /**
   * Track content interaction
   */
  trackContentInteraction(contentId, contentType, interactionType, metadata = {}) {
    this.trackEngagement(contentId, contentType, interactionType, {
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Track article reading progress
   */
  trackArticleProgress(articleId, progress, timeSpent, metadata = {}) {
    this.trackEngagement(articleId, 'article', 'reading_progress', {
      progress: Math.round(progress * 100) / 100, // Round to 2 decimal places
      timeSpent,
      ...metadata
    });
  }

  /**
   * Track video interaction
   */
  trackVideoInteraction(videoId, eventType, metadata = {}) {
    this.trackEngagement(videoId, 'video_article', eventType, {
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Track event interaction
   */
  trackEventInteraction(eventId, eventType, metadata = {}) {
    this.trackEngagement(eventId, 'event', eventType, {
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Track flipbook interaction
   */
  trackFlipbookInteraction(flipbookId, eventType, metadata = {}) {
    this.trackEngagement(flipbookId, 'flipbook', eventType, {
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Track download interaction
   */
  trackDownloadInteraction(downloadId, eventType, metadata = {}) {
    this.trackEngagement(downloadId, 'download', eventType, {
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Track search
   */
  trackSearch(query, resultsCount, searchType = 'global', metadata = {}) {
    const eventData = {
      eventType: 'search_performed',
      searchQuery: query,
      searchResults: resultsCount,
      searchType,
      ...metadata
    };

    this.trackEvent('website', eventData);
  }

  /**
   * Track social share
   */
  trackSocialShare(contentId, contentType, platform, metadata = {}) {
    this.trackEngagement(contentId, contentType, 'share', {
      platform,
      ...metadata
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formType, formData = {}, metadata = {}) {
    const eventData = {
      eventType: 'contact_form_submit',
      formType,
      ...formData,
      ...metadata
    };

    this.trackEvent('website', eventData);
  }

  /**
   * Track conversion
   */
  trackConversion(conversionType, value = null, metadata = {}) {
    const eventData = {
      eventType: 'conversion',
      conversionType,
      conversionValue: value,
      ...metadata
    };

    this.trackEvent('website', eventData);
  }

  /**
   * Track error
   */
  trackError(errorType, errorMessage, metadata = {}) {
    const eventData = {
      eventType: 'error_occurred',
      errorType,
      errorMessage,
      ...metadata
    };

    this.trackEvent('website', eventData);
  }

  /**
   * Generic event tracking
   */
  async trackEvent(eventCategory, eventData) {
    const baseEventData = {
      sessionId: this.sessionId,
      userId: this.userId,
      eventTimestamp: new Date().toISOString(),
      ...eventData
    };

    // Add device and geo info if not already present
    if (!baseEventData.deviceType) {
      const deviceInfo = this.getDeviceInfo();
      Object.assign(baseEventData, deviceInfo);
    }

    const event = {
      category: eventCategory,
      data: baseEventData
    };

    if (this.isOnline) {
      // Only send events if backend is ready or if it's a health check
      if (eventCategory === 'website' && eventData.eventType === 'health_check') {
        await this.sendEvent(event);
      } else if (this.backendReady) {
        await this.sendEvent(event);
      } else {
        // Backend not ready, queue the event
        this.queueEvent(event);
      }
    } else {
      this.queueEvent(event);
    }
  }

  /**
   * Manually initialize analytics service (call this when backend is confirmed ready)
   */
  async initializeAnalytics() {
    if (this.backendReady) return;

    const ready = await this.waitForBackendReady();
    if (ready) {
      this.backendReady = true;
      console.log('✅ Analytics service initialized successfully');

      // Track initial page view now that backend is ready
      this.trackPageView();

      // Process any queued events
      this.processEventQueue();
    }
  }

  /**
   * Check if backend is ready
   */
  async checkBackendStatus() {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'website',
          data: {
            eventType: 'health_check',
            test: true
          }
        })
      });

      return response.status === 400; // Backend ready but rejected test request
    } catch (error) {
      return false;
    }
  }

  /**
   * Send event to backend with retry logic
   */
  async sendEvent(event, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        });

        if (!response.ok) {
          // If it's a client error (4xx), don't retry
          if (response.status >= 400 && response.status < 500) {
            console.warn(`Analytics event rejected (4xx): ${response.status}`);
            return null;
          }

          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;

      } catch (error) {
        console.warn(`Failed to send analytics event (attempt ${attempt}/${maxRetries}):`, error.message);

        if (attempt === maxRetries) {
          // Final attempt failed, queue the event
          console.warn('All retry attempts failed, queuing event for later');
          this.queueEvent(event);
          return null;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Queue event for later sending
   */
  queueEvent(event) {
    this.eventQueue.push({
      ...event,
      queuedAt: Date.now()
    });

    // Store in localStorage as backup
    const stored = localStorage.getItem('analytics_queue') || '[]';
    const queue = JSON.parse(stored);
    queue.push(event);
    localStorage.setItem('analytics_queue', JSON.stringify(queue));
  }

  /**
   * Process queued events
   */
  async processEventQueue() {
    if (!this.isOnline || this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of eventsToSend) {
      await this.sendEvent(event);
    }

    // Clear localStorage queue
    localStorage.removeItem('analytics_queue');
  }

  /**
   * Set up scroll tracking
   */
  setupScrollTracking() {
    let maxScrollDepth = 0;
    let scrollTimeout;

    const trackScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);

        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;

          this.trackEvent('website', {
            eventType: 'scroll_depth',
            scrollDepth: maxScrollDepth,
            pageUrl: window.location.href
          });
        }
      }, 100);
    };

    window.addEventListener('scroll', trackScroll, { passive: true });
  }

  /**
   * Set up form tracking
   */
  setupFormTracking() {
    document.addEventListener('submit', (event) => {
      const form = event.target;
      const formType = form.getAttribute('data-analytics-form-type') || form.id || 'unknown';

      this.trackFormSubmission(formType, {
        formAction: form.action,
        formMethod: form.method
      });
    });
  }

  /**
   * Handle click events for engagement tracking
   */
  handleClick(event) {
    // Update last activity time
    this.lastActivityTime = Date.now();

    // Track clicks on specific elements
    const target = event.target;
    const clickableElement = target.closest('a, button, [data-analytics-click]');

    if (clickableElement) {
      const clickType = clickableElement.getAttribute('data-analytics-click') ||
                       (clickableElement.tagName === 'A' ? 'link' : 'button');

      this.trackEvent('website', {
        eventType: 'user_engagement',
        clickType,
        elementText: clickableElement.textContent?.trim().substring(0, 100),
        elementHref: clickableElement.href,
        pageUrl: window.location.href
      });
    }
  }

  /**
   * Handle online status change
   */
  handleOnline() {
    this.isOnline = true;
    this.processEventQueue();
  }

  /**
   * Handle offline status change
   */
  handleOffline() {
    this.isOnline = false;
  }

  /**
   * Handle page visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, track time spent
      const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
      this.trackEvent('website', {
        eventType: 'time_on_page',
        timeOnPage: timeSpent,
        pageUrl: window.location.href
      });
    } else {
      // Page is visible again
      this.pageStartTime = Date.now();
    }
  }

  /**
   * Handle before unload
   */
  handleBeforeUnload() {
    const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
    const sessionDuration = Math.round((Date.now() - (this.sessionStartTime || Date.now())) / 1000);

    // Send final events synchronously if possible
    this.trackEvent('website', {
      eventType: 'session_end',
      sessionDuration,
      timeOnPage: timeSpent,
      pageUrl: window.location.href
    });
  }

  /**
   * Start heartbeat for session tracking
   */
  startHeartbeat() {
    this.sessionStartTime = Date.now();

    setInterval(() => {
      if (!document.hidden) {
        this.trackEvent('website', {
          eventType: 'user_engagement',
          sessionDuration: Math.round((Date.now() - this.sessionStartTime) / 1000),
          pageUrl: window.location.href
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      sessionDuration: Math.round((Date.now() - (this.sessionStartTime || Date.now())) / 1000),
      pageUrl: window.location.href,
      referrer: document.referrer
    };
  }

  /**
   * Manually trigger event processing
   */
  flush() {
    return this.processEventQueue();
  }

  /**
   * Get date range options for analytics
   */
  getDateRanges() {
    return {
      today: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      yesterday: {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      last7days: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      last30days: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      last90days: {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    };
  }

  /**
   * Format date range for API calls
   */
  formatDateRange(startDate, endDate) {
    return {
      startDate: new Date(startDate).toISOString().split('T')[0],
      endDate: new Date(endDate).toISOString().split('T')[0]
    };
  }

  /**
   * Get dashboard analytics data
   */
  async getDashboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/analytics/dashboard${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get real-time analytics data
   */
  async getRealtimeAnalytics() {
    const response = await fetch('/api/analytics/realtime/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get content performance analytics
   */
  async getContentPerformance(params = {}) {
    // Convert params to URL query string for GET request
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.analyticsBaseUrl}/content-performance${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get user behavior analytics
   */
  async getUserBehavior(params = {}) {
    // Convert params to URL query string for GET request
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.analyticsBaseUrl}/user-behavior${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get author performance analytics
   */
  async getAuthorPerformance(params = {}) {
    // Convert params to URL query string for GET request
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.analyticsBaseUrl}/author-performance${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get SEO analytics
   */
  async getSEOAnalytics(params = {}) {
    // Convert params to URL query string for GET request
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.analyticsBaseUrl}/seo-analytics${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get social analytics
   */
  async getSocialAnalytics(params = {}) {
    // Convert params to URL query string for GET request
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.analyticsBaseUrl}/social-analytics${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Create custom report
   */
  async createCustomReport(reportConfig) {
    try {
      const response = await fetch(`${this.analyticsBaseUrl}/custom-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportConfig)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle file downloads for non-JSON formats
      if (reportConfig.format !== 'json') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Get filename from response headers or create one
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `analytics_report_${new Date().toISOString().split('T')[0]}.${reportConfig.format}`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create download link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return {
          success: true,
          message: `Report downloaded successfully as ${filename}`,
          downloaded: true
        };
      }

      // Return JSON response for JSON format
      return await response.json();
    } catch (error) {
      console.error('Error creating custom report:', error);
      throw error;
    }
  }

  /**
   * Format number for display
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value, total) {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = analyticsService;
} else if (typeof window !== 'undefined') {
  window.AnalyticsService = analyticsService;
}

export default analyticsService;