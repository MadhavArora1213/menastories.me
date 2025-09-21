/**
 * Analytics Implementation Test Script
 * Tests all analytics functionality to ensure proper working
 */

const axios = require('axios');
const WebSocket = require('ws');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const WS_BASE_URL = process.env.WS_BASE_URL || 'ws://localhost:5000';

// Test data
const testData = {
  userId: 'test-user-' + Date.now(),
  sessionId: 'test-session-' + Date.now(),
  articleId: '550e8400-e29b-41d4-a716-446655440000',
  videoId: '550e8400-e29b-41d4-a716-446655440001',
  eventId: '550e8400-e29b-41d4-a716-446655440002',
  flipbookId: '550e8400-e29b-41d4-a716-446655440003',
  downloadId: '550e8400-e29b-41d4-a716-446655440004'
};

class AnalyticsTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Running test: ${testName}`, 'info');
      const result = await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED', result });
      this.log(`✅ ${testName} - PASSED`, 'success');
      return result;
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      this.log(`❌ ${testName} - FAILED: ${error.message}`, 'error');
      return null;
    }
  }

  async testWebsiteAnalytics() {
    const events = [
      {
        eventType: 'page_view',
        pageUrl: '/test-article',
        pageTitle: 'Test Article',
        referrer: 'https://google.com'
      },
      {
        eventType: 'user_engagement',
        clickType: 'link',
        elementText: 'Read More'
      },
      {
        eventType: 'search_performed',
        searchQuery: 'analytics',
        searchResults: 5
      }
    ];

    for (const event of events) {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
        category: 'website',
        data: {
          sessionId: testData.sessionId,
          userId: testData.userId,
          eventTimestamp: new Date().toISOString(),
          ...event
        }
      });

      if (response.data.success !== true) {
        throw new Error(`Website analytics tracking failed for ${event.eventType}`);
      }
    }
  }

  async testEngagementAnalytics() {
    const engagements = [
      {
        contentId: testData.articleId,
        contentType: 'article',
        eventType: 'view',
        engagementScore: 1
      },
      {
        contentId: testData.articleId,
        contentType: 'article',
        eventType: 'like',
        engagementScore: 5
      },
      {
        contentId: testData.videoId,
        contentType: 'video_article',
        eventType: 'view',
        watchTime: 120,
        currentTime: 60
      },
      {
        contentId: testData.eventId,
        contentType: 'event',
        eventType: 'registration_start'
      }
    ];

    for (const engagement of engagements) {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
        category: 'engagement',
        data: {
          sessionId: testData.sessionId,
          userId: testData.userId,
          eventTimestamp: new Date().toISOString(),
          ...engagement
        }
      });

      if (response.data.success !== true) {
        throw new Error(`Engagement analytics tracking failed for ${engagement.eventType}`);
      }
    }
  }

  async testVideoAnalytics() {
    const videoEvents = [
      {
        eventType: 'view_start',
        watchTime: 0,
        totalDuration: 300
      },
      {
        eventType: 'view_complete',
        watchTime: 300,
        totalDuration: 300
      }
    ];

    for (const event of videoEvents) {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
        category: 'video',
        data: {
          videoId: testData.videoId,
          sessionId: testData.sessionId,
          userId: testData.userId,
          eventTimestamp: new Date().toISOString(),
          ...event
        }
      });

      if (response.data.success !== true) {
        throw new Error(`Video analytics tracking failed for ${event.eventType}`);
      }
    }
  }

  async testEventAnalytics() {
    const eventEvents = [
      {
        eventType: 'view'
      },
      {
        eventType: 'registration_complete'
      }
    ];

    for (const event of eventEvents) {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
        category: 'event',
        data: {
          eventId: testData.eventId,
          sessionId: testData.sessionId,
          userId: testData.userId,
          eventTimestamp: new Date().toISOString(),
          ...event
        }
      });

      if (response.data.success !== true) {
        throw new Error(`Event analytics tracking failed for ${event.eventType}`);
      }
    }
  }

  async testFlipbookAnalytics() {
    const flipbookEvents = [
      {
        eventType: 'view_start',
        currentPage: 1,
        totalPages: 10
      },
      {
        eventType: 'page_turn',
        currentPage: 2,
        totalPages: 10,
        readTime: 30
      }
    ];

    for (const event of flipbookEvents) {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
        category: 'flipbook',
        data: {
          flipbookId: testData.flipbookId,
          sessionId: testData.sessionId,
          userId: testData.userId,
          eventTimestamp: new Date().toISOString(),
          ...event
        }
      });

      if (response.data.success !== true) {
        throw new Error(`Flipbook analytics tracking failed for ${event.eventType}`);
      }
    }
  }

  async testDownloadAnalytics() {
    const downloadEvents = [
      {
        eventType: 'download_start',
        fileSize: 1024000
      },
      {
        eventType: 'download_complete',
        fileSize: 1024000,
        downloadTime: 5
      }
    ];

    for (const event of downloadEvents) {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
        category: 'download',
        data: {
          downloadId: testData.downloadId,
          sessionId: testData.sessionId,
          userId: testData.userId,
          eventTimestamp: new Date().toISOString(),
          ...event
        }
      });

      if (response.data.success !== true) {
        throw new Error(`Download analytics tracking failed for ${event.eventType}`);
      }
    }
  }

  async testDashboardAPI() {
    const response = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'test-token'}`
      }
    });

    if (response.data.success !== true) {
      throw new Error('Dashboard API test failed');
    }

    if (!response.data.data.overview) {
      throw new Error('Dashboard response missing overview data');
    }

    return response.data;
  }

  async testRealtimeConnection() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/analytics`);

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, 5000);

      ws.onopen = () => {
        this.log('WebSocket connection established', 'success');
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(new Error(`WebSocket connection failed: ${error.message}`));
      };
    });
  }

  async testAnalyticsReport() {
    const response = await axios.get(`${API_BASE_URL}/api/analytics/report?format=json`, {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'test-token'}`
      }
    });

    if (response.data.success !== true) {
      throw new Error('Analytics report test failed');
    }

    return response.data;
  }

  async runAllTests() {
    this.log('🚀 Starting Analytics Implementation Tests', 'info');
    this.log('=' .repeat(50), 'info');

    // Test analytics tracking
    await this.runTest('Website Analytics Tracking', () => this.testWebsiteAnalytics());
    await this.runTest('User Engagement Analytics', () => this.testEngagementAnalytics());
    await this.runTest('Video Analytics Tracking', () => this.testVideoAnalytics());
    await this.runTest('Event Analytics Tracking', () => this.testEventAnalytics());
    await this.runTest('Flipbook Analytics Tracking', () => this.testFlipbookAnalytics());
    await this.runTest('Download Analytics Tracking', () => this.testDownloadAnalytics());

    // Test APIs
    await this.runTest('Dashboard API', () => this.testDashboardAPI());
    await this.runTest('Analytics Report API', () => this.testAnalyticsReport());

    // Test real-time features
    await this.runTest('Real-time WebSocket Connection', () => this.testRealtimeConnection());

    // Summary
    this.log('=' .repeat(50), 'info');
    this.log(`📊 Test Results: ${this.results.passed} passed, ${this.results.failed} failed`, 'info');

    if (this.results.failed === 0) {
      this.log('🎉 All analytics tests passed!', 'success');
    } else {
      this.log('⚠️  Some tests failed. Check the results above.', 'warning');
    }

    // Detailed results
    this.log('\n📋 Detailed Test Results:', 'info');
    this.results.tests.forEach((test, index) => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      this.log(`${index + 1}. ${status} ${test.name}`, test.status === 'PASSED' ? 'success' : 'error');
      if (test.error) {
        this.log(`   Error: ${test.error}`, 'error');
      }
    });

    return this.results;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new AnalyticsTester();
  tester.runAllTests()
    .then((results) => {
      process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = AnalyticsTester;