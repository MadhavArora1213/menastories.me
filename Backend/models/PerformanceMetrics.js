const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PerformanceMetrics = sequelize.define('PerformanceMetrics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL of the page being monitored'
  },
  pageType: {
    type: DataTypes.ENUM(
      'article',
      'category',
      'homepage',
      'search',
      'author',
      'contact',
      'about',
      'custom'
    ),
    defaultValue: 'article'
  },

  // Core Web Vitals (Google's metrics)
  largestContentfulPaint: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'LCP in milliseconds (target: <2500ms)'
  },
  firstInputDelay: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'FID in milliseconds (target: <100ms)'
  },
  cumulativeLayoutShift: {
    type: DataTypes.DECIMAL(4, 4),
    allowNull: true,
    comment: 'CLS score (target: <0.1)'
  },
  firstContentfulPaint: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'FCP in milliseconds'
  },
  timeToFirstByte: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'TTFB in milliseconds'
  },
  domContentLoaded: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'DOM content loaded time in milliseconds'
  },
  loadComplete: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'Full page load time in milliseconds'
  },

  // Performance Scores
  performanceScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Lighthouse performance score (0-100)'
  },
  accessibilityScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Lighthouse accessibility score (0-100)'
  },
  bestPracticesScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Lighthouse best practices score (0-100)'
  },
  seoScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Lighthouse SEO score (0-100)'
  },
  overallScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Overall Lighthouse score (0-100)'
  },

  // Resource Metrics
  totalRequests: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total number of HTTP requests'
  },
  totalSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total page size in bytes'
  },
  htmlSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'HTML document size in bytes'
  },
  cssSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'CSS resources size in bytes'
  },
  jsSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'JavaScript resources size in bytes'
  },
  imageSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Image resources size in bytes'
  },
  fontSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Font resources size in bytes'
  },

  // Resource Breakdown
  resourceBreakdown: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Detailed breakdown of resources by type'
  },

  // User Experience Metrics
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Browser user agent string'
  },
  deviceType: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
    allowNull: true
  },
  connectionType: {
    type: DataTypes.ENUM('4g', '3g', '2g', 'slow-2g', 'offline'),
    allowNull: true
  },
  screenResolution: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Screen resolution (e.g., 1920x1080)'
  },
  viewportSize: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Viewport size (e.g., 1920x1080)'
  },

  // Geographic Data
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IPv4 or IPv6 address'
  },

  // Performance Issues
  performanceIssues: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of performance issues found'
  },
  optimizationSuggestions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Suggested optimizations'
  },

  // Third-party Scripts
  thirdPartyScripts: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Third-party scripts and their impact'
  },

  // Caching Information
  cacheHit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the response was served from cache'
  },
  cacheAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Cache age in seconds'
  },

  // Server Information
  serverResponseTime: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'Server response time in milliseconds'
  },
  serverLocation: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Server location/country'
  },

  // CDN Information
  cdnUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether CDN was used'
  },
  cdnProvider: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'CDN provider name'
  },
  cdnResponseTime: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'CDN response time in milliseconds'
  },

  // JavaScript Metrics
  jsExecutionTime: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'JavaScript execution time in milliseconds'
  },
  jsHeapSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'JavaScript heap size in bytes'
  },
  unusedJsSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Unused JavaScript size in bytes'
  },

  // CSS Metrics
  cssProcessingTime: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'CSS processing time in milliseconds'
  },
  unusedCssSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Unused CSS size in bytes'
  },

  // Image Optimization
  imagesOptimized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether images are optimized'
  },
  imageOptimizationSavings: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Bytes saved through image optimization'
  },
  lazyLoadedImages: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of lazy-loaded images'
  },

  // Compression
  compressionEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether compression is enabled'
  },
  compressionRatio: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Compression ratio (original/compressed)'
  },

  // Mobile Performance
  mobileScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Mobile performance score (0-100)'
  },
  mobileIssues: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Mobile-specific performance issues'
  },

  // Accessibility
  accessibilityIssues: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Accessibility issues found'
  },

  // SEO Performance
  seoIssues: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'SEO-related performance issues'
  },

  // Custom Metrics
  customMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom performance metrics'
  },

  // Test Configuration
  testType: {
    type: DataTypes.ENUM('automated', 'manual', 'synthetic', 'real_user'),
    defaultValue: 'automated'
  },
  testEnvironment: {
    type: DataTypes.ENUM('development', 'staging', 'production'),
    defaultValue: 'production'
  },

  // Aggregation Data
  isAggregated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this is aggregated data'
  },
  aggregationPeriod: {
    type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly'),
    allowNull: true
  }
}, {
  tableName: 'PerformanceMetrics',
  indexes: [
    {
      fields: ['pageUrl', 'createdAt'],
      name: 'performance_metrics_url_created_at'
    },
    {
      fields: ['pageType', 'createdAt'],
      name: 'performance_metrics_type_created_at'
    },
    {
      fields: ['deviceType', 'createdAt'],
      name: 'performance_metrics_device_created_at'
    },
    {
      fields: ['overallScore'],
      name: 'performance_metrics_overall_score'
    },
    {
      fields: ['largestContentfulPaint'],
      name: 'performance_metrics_lcp'
    },
    {
      fields: ['firstInputDelay'],
      name: 'performance_metrics_fid'
    },
    {
      fields: ['cumulativeLayoutShift'],
      name: 'performance_metrics_cls'
    }
  ],
  hooks: {
    beforeCreate: (metrics) => {
      // Calculate overall score if individual scores are available
      if (!metrics.overallScore && metrics.performanceScore && metrics.accessibilityScore && metrics.bestPracticesScore && metrics.seoScore) {
        metrics.overallScore = Math.round(
          (metrics.performanceScore + metrics.accessibilityScore + metrics.bestPracticesScore + metrics.seoScore) / 4
        );
      }

      // Determine device type from user agent if not provided
      if (!metrics.deviceType && metrics.userAgent) {
        metrics.deviceType = determineDeviceType(metrics.userAgent);
      }
    }
  }
});

// Helper function to determine device type
function determineDeviceType(userAgent) {
  if (!userAgent) return 'desktop';

  const ua = userAgent.toLowerCase();

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
    return ua.includes('ipad') ? 'tablet' : 'mobile';
  }

  return 'desktop';
}

module.exports = PerformanceMetrics;