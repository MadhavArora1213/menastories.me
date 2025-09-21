const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SEOMetadata = sequelize.define('SEOMetadata', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to article, page, or other content'
  },
  contentType: {
    type: DataTypes.ENUM(
      'article',
      'page',
      'category',
      'tag',
      'author',
      'media',
      'event',
      'product',
      'organization',
      'person'
    ),
    allowNull: false
  },
  // Basic Meta Tags
  title: {
    type: DataTypes.STRING(60),
    allowNull: true,
    comment: 'SEO title (50-60 characters optimal)'
  },
  metaDescription: {
    type: DataTypes.STRING(160),
    allowNull: true,
    comment: 'Meta description (150-160 characters optimal)'
  },
  canonicalUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Canonical URL to prevent duplicate content'
  },
  robotsDirective: {
    type: DataTypes.ENUM(
      'index,follow',
      'noindex,follow',
      'index,nofollow',
      'noindex,nofollow',
      'noarchive',
      'nosnippet',
      'noimageindex',
      'nocache'
    ),
    defaultValue: 'index,follow'
  },

  // Open Graph Tags (Facebook, LinkedIn)
  ogTitle: {
    type: DataTypes.STRING(95),
    allowNull: true,
    comment: 'Open Graph title'
  },
  ogDescription: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Open Graph description'
  },
  ogImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Open Graph image URL'
  },
  ogImageAlt: {
    type: DataTypes.STRING(125),
    allowNull: true,
    comment: 'Open Graph image alt text'
  },
  ogType: {
    type: DataTypes.ENUM(
      'website',
      'article',
      'book',
      'profile',
      'video.other',
      'music.song'
    ),
    defaultValue: 'website'
  },
  ogUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Open Graph URL'
  },
  ogSiteName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Open Graph site name'
  },

  // Twitter Card Tags
  twitterCard: {
    type: DataTypes.ENUM(
      'summary',
      'summary_large_image',
      'app',
      'player'
    ),
    defaultValue: 'summary_large_image'
  },
  twitterTitle: {
    type: DataTypes.STRING(70),
    allowNull: true,
    comment: 'Twitter card title'
  },
  twitterDescription: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Twitter card description'
  },
  twitterImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Twitter card image URL'
  },
  twitterImageAlt: {
    type: DataTypes.STRING(420),
    allowNull: true,
    comment: 'Twitter card image alt text'
  },
  twitterSite: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Twitter site handle (@username)'
  },
  twitterCreator: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Twitter creator handle (@username)'
  },

  // Structured Data (JSON-LD)
  structuredData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON-LD structured data for rich snippets'
  },

  // SEO Analysis Data
  seoScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Overall SEO score (0-100)'
  },
  readabilityScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Content readability score'
  },
  keywordDensity: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Keyword density analysis'
  },
  internalLinks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of internal links'
  },
  externalLinks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of external links'
  },
  wordCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Content word count'
  },
  headingStructure: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'H1, H2, H3 structure analysis'
  },

  // Performance Data
  pageLoadTime: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Page load time in seconds'
  },
  pageSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Page size in bytes'
  },
  mobileFriendly: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Mobile-friendly status'
  },

  // Local SEO (UAE-specific)
  localKeywords: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'UAE-specific local keywords'
  },
  businessInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Business information for local SEO'
  },
  geoTargeting: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Geographic targeting data'
  },

  // Social Media Integration
  socialShares: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Social media share counts'
  },
  socialEngagement: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Social engagement metrics'
  },

  // Technical SEO
  hreflangTags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Hreflang tags for internationalization'
  },
  schemaMarkup: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Schema.org markup data'
  },
  breadcrumbData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Breadcrumb structured data'
  },

  // Analytics Integration
  googleAnalytics: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Google Analytics data'
  },
  searchConsole: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Google Search Console data'
  },

  // Content Optimization
  targetKeywords: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Target keywords for optimization'
  },
  competitorAnalysis: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Competitor SEO analysis'
  },
  contentGaps: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Content gap analysis'
  },

  // Automation
  autoOptimize: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Enable automatic SEO optimization'
  },
  lastOptimized: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last automatic optimization date'
  },
  optimizationHistory: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'History of SEO optimizations'
  }
}, {
  tableName: 'SEOMetadata',
  indexes: [
    {
      fields: ['contentId', 'contentType'],
      name: 'seo_metadata_content'
    },
    {
      fields: ['seoScore'],
      name: 'seo_metadata_score'
    },
    {
      fields: ['canonicalUrl'],
      name: 'seo_metadata_canonical'
    },
    {
      fields: ['robotsDirective'],
      name: 'seo_metadata_robots'
    }
  ],
  hooks: {
    beforeCreate: (seo) => {
      // Auto-generate SEO score if not provided
      if (!seo.seoScore) {
        seo.seoScore = calculateSEOScore(seo);
      }

      // Set default Open Graph data if not provided
      if (!seo.ogTitle && seo.title) {
        seo.ogTitle = seo.title;
      }
      if (!seo.ogDescription && seo.metaDescription) {
        seo.ogDescription = seo.metaDescription;
      }
      if (!seo.twitterTitle && seo.title) {
        seo.twitterTitle = seo.title;
      }
      if (!seo.twitterDescription && seo.metaDescription) {
        seo.twitterDescription = seo.metaDescription;
      }
    },
    beforeUpdate: (seo) => {
      // Recalculate SEO score on updates
      seo.seoScore = calculateSEOScore(seo);
    }
  }
});

// Helper function to calculate SEO score
function calculateSEOScore(seo) {
  let score = 0;

  // Title optimization (30 points)
  if (seo.title) {
    const titleLength = seo.title.length;
    if (titleLength >= 30 && titleLength <= 60) {
      score += 30;
    } else if (titleLength >= 20 && titleLength <= 70) {
      score += 20;
    } else {
      score += 10;
    }
  }

  // Meta description (20 points)
  if (seo.metaDescription) {
    const descLength = seo.metaDescription.length;
    if (descLength >= 120 && descLength <= 160) {
      score += 20;
    } else if (descLength >= 100 && descLength <= 180) {
      score += 15;
    } else {
      score += 5;
    }
  }

  // Open Graph tags (15 points)
  let ogScore = 0;
  if (seo.ogTitle) ogScore += 5;
  if (seo.ogDescription) ogScore += 5;
  if (seo.ogImage) ogScore += 5;
  score += ogScore;

  // Twitter Card tags (10 points)
  let twitterScore = 0;
  if (seo.twitterTitle) twitterScore += 3;
  if (seo.twitterDescription) twitterScore += 3;
  if (seo.twitterImage) twitterScore += 4;
  score += twitterScore;

  // Structured data (15 points)
  if (seo.structuredData) {
    score += 15;
  }

  // Canonical URL (5 points)
  if (seo.canonicalUrl) {
    score += 5;
  }

  // Robots directive (5 points)
  if (seo.robotsDirective && seo.robotsDirective.includes('index')) {
    score += 5;
  }

  return Math.min(score, 100);
}

module.exports = SEOMetadata;