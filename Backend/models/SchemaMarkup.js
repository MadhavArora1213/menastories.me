const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SchemaMarkup = sequelize.define('SchemaMarkup', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to the content this schema applies to'
  },
  contentType: {
    type: DataTypes.ENUM(
      'article',
      'page',
      'category',
      'author',
      'organization',
      'website',
      'breadcrumb',
      'event',
      'product',
      'review',
      'faq',
      'howto',
      'recipe',
      'video',
      'image',
      'audio',
      'news',
      'job',
      'course',
      'book'
    ),
    allowNull: false
  },
  schemaType: {
    type: DataTypes.ENUM(
      'Article',
      'NewsArticle',
      'BlogPosting',
      'WebPage',
      'Organization',
      'Person',
      'Event',
      'Place',
      'LocalBusiness',
      'Product',
      'Review',
      'AggregateRating',
      'FAQPage',
      'HowTo',
      'Recipe',
      'VideoObject',
      'ImageObject',
      'AudioObject',
      'JobPosting',
      'Course',
      'Book',
      'BreadcrumbList',
      'SiteNavigationElement',
      'WebSite',
      'SearchAction'
    ),
    allowNull: false
  },

  // Schema.org JSON-LD Data
  jsonLdData: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Complete JSON-LD structured data object'
  },

  // Schema Validation
  isValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the schema markup is valid'
  },
  validationErrors: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Validation errors if any'
  },
  lastValidated: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last validation date'
  },

  // Schema Properties
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Schema name/title'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Schema description'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Schema URL'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Schema image URL'
  },

  // Article Schema Specific
  headline: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Article headline'
  },
  articleSection: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Article section/category'
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Article keywords'
  },
  wordCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Article word count'
  },
  timeRequired: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Time required to read (ISO 8601 duration)'
  },

  // Author Information
  authorName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Author name'
  },
  authorUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Author profile URL'
  },
  authorImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Author image URL'
  },

  // Organization Schema Specific
  organizationName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Organization name'
  },
  organizationLogo: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Organization logo URL'
  },
  organizationUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Organization website URL'
  },
  contactInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Organization contact information'
  },
  socialProfiles: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Social media profiles'
  },

  // Event Schema Specific
  eventName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Event name'
  },
  eventStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Event start date'
  },
  eventEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Event end date'
  },
  eventLocation: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Event location information'
  },
  eventOrganizer: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Event organizer information'
  },

  // Product Schema Specific
  productName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Product name'
  },
  productBrand: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Product brand'
  },
  productPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Product price'
  },
  productCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'AED',
    comment: 'Product price currency'
  },
  productAvailability: {
    type: DataTypes.ENUM('InStock', 'OutOfStock', 'PreOrder', 'Discontinued'),
    allowNull: true
  },

  // Review/Rating Schema Specific
  ratingValue: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    comment: 'Rating value (1-5)'
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of ratings'
  },
  bestRating: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 5.0,
    comment: 'Best possible rating'
  },
  worstRating: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 1.0,
    comment: 'Worst possible rating'
  },
  reviewAuthor: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Review author name'
  },
  reviewBody: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Review content'
  },

  // FAQ Schema Specific
  faqQuestions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'FAQ questions and answers'
  },

  // HowTo Schema Specific
  howToSteps: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'How-to steps'
  },
  howToTools: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Required tools for how-to'
  },
  howToSupplies: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Required supplies for how-to'
  },

  // Recipe Schema Specific
  recipeIngredients: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Recipe ingredients'
  },
  recipeInstructions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Recipe instructions'
  },
  recipeCookTime: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Recipe cooking time (ISO 8601 duration)'
  },
  recipePrepTime: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Recipe preparation time (ISO 8601 duration)'
  },
  recipeYield: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Recipe yield/servings'
  },
  recipeNutrition: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Recipe nutritional information'
  },

  // Video Schema Specific
  videoName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Video name'
  },
  videoDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Video description'
  },
  videoThumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Video thumbnail URL'
  },
  videoDuration: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Video duration (ISO 8601 duration)'
  },
  videoUploadDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Video upload date'
  },

  // Local Business Schema Specific (UAE-focused)
  businessName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Business name'
  },
  businessType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Business type'
  },
  businessAddress: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Business address information'
  },
  businessPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Business phone number'
  },
  businessHours: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Business operating hours'
  },
  businessGeo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Business geographic coordinates'
  },

  // Multilingual Support
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
    comment: 'Content language code'
  },
  alternateLanguages: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Alternate language versions'
  },

  // SEO Impact
  seoImpact: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated SEO impact score (0-100)'
  },
  richSnippetPotential: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Potential rich snippet types'
  },

  // Generation Settings
  autoGenerate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Automatically generate schema markup'
  },
  generationTemplate: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Template used for generation'
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom schema fields'
  },

  // Status and Analytics
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'draft', 'error'),
    defaultValue: 'active'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if generation failed'
  },
  lastGenerated: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time schema was generated'
  },
  usageStats: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Schema usage statistics'
  }
}, {
  tableName: 'SchemaMarkups',
  indexes: [
    {
      fields: ['contentId', 'contentType'],
      name: 'schema_markups_content'
    },
    {
      fields: ['schemaType'],
      name: 'schema_markups_type'
    },
    {
      fields: ['isValid'],
      name: 'schema_markups_valid'
    },
    {
      fields: ['status'],
      name: 'schema_markups_status'
    }
  ],
  hooks: {
    beforeCreate: (schema) => {
      // Validate JSON-LD structure
      if (schema.jsonLdData) {
        const validation = validateJsonLd(schema.jsonLdData, schema.schemaType);
        schema.isValid = validation.isValid;
        if (!validation.isValid) {
          schema.validationErrors = validation.errors;
        }
      }

      // Calculate SEO impact
      if (!schema.seoImpact) {
        schema.seoImpact = calculateSEOImpact(schema);
      }
    },
    beforeUpdate: (schema) => {
      // Re-validate on updates
      if (schema.changed('jsonLdData') && schema.jsonLdData) {
        const validation = validateJsonLd(schema.jsonLdData, schema.schemaType);
        schema.isValid = validation.isValid;
        if (!validation.isValid) {
          schema.validationErrors = validation.errors;
        }
      }
    }
  }
});

// Helper function to validate JSON-LD structure
function validateJsonLd(jsonLd, schemaType) {
  const errors = [];
  let isValid = true;

  // Basic structure validation
  if (!jsonLd['@context'] || jsonLd['@context'] !== 'https://schema.org') {
    errors.push('Missing or invalid @context');
    isValid = false;
  }

  if (!jsonLd['@type'] || jsonLd['@type'] !== schemaType) {
    errors.push(`Missing or invalid @type (expected: ${schemaType})`);
    isValid = false;
  }

  // Schema-specific validation
  switch (schemaType) {
    case 'Article':
    case 'NewsArticle':
    case 'BlogPosting':
      if (!jsonLd.headline) {
        errors.push('Article schema requires headline');
        isValid = false;
      }
      if (!jsonLd.author) {
        errors.push('Article schema requires author');
        isValid = false;
      }
      if (!jsonLd.datePublished) {
        errors.push('Article schema requires datePublished');
        isValid = false;
      }
      break;

    case 'Organization':
      if (!jsonLd.name) {
        errors.push('Organization schema requires name');
        isValid = false;
      }
      break;

    case 'Event':
      if (!jsonLd.name) {
        errors.push('Event schema requires name');
        isValid = false;
      }
      if (!jsonLd.startDate) {
        errors.push('Event schema requires startDate');
        isValid = false;
      }
      break;

    case 'Product':
      if (!jsonLd.name) {
        errors.push('Product schema requires name');
        isValid = false;
      }
      break;
  }

  return { isValid, errors };
}

// Helper function to calculate SEO impact
function calculateSEOImpact(schema) {
  let impact = 50; // Base impact

  // Schema type impact
  const typeImpacts = {
    'Article': 80,
    'NewsArticle': 85,
    'Organization': 70,
    'WebSite': 60,
    'BreadcrumbList': 40,
    'Product': 75,
    'Event': 65,
    'FAQPage': 90,
    'HowTo': 85,
    'Recipe': 80,
    'VideoObject': 70,
    'LocalBusiness': 75
  };

  impact = typeImpacts[schema.schemaType] || impact;

  // Validation impact
  if (!schema.isValid) {
    impact -= 20;
  }

  // Completeness impact
  if (schema.jsonLdData) {
    const data = schema.jsonLdData;
    let completeness = 0;

    if (data.name || data.headline) completeness += 20;
    if (data.description) completeness += 15;
    if (data.image) completeness += 15;
    if (data.url) completeness += 10;
    if (data.author || data.organization) completeness += 20;
    if (data.datePublished || data.dateCreated) completeness += 10;
    if (data.aggregateRating || data.review) completeness += 10;

    impact += Math.min(completeness, 30);
  }

  return Math.min(Math.max(impact, 0), 100);
}

module.exports = SchemaMarkup;