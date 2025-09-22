const { DataTypes } = require('sequelize');
const slugify = require('slugify');
const sequelize = require('../config/db');

const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 255]
      }
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    featuredImage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'featuredImage'
    },
    imageCaption: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'imageCaption'
    },
    imageAlt: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'imageAlt'
    },
    gallery: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'gallery'
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_review', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'rejected'),
      defaultValue: 'draft',
      allowNull: false,
      field: 'status'
    },
    workflowStage: {
      type: DataTypes.ENUM('creation', 'section_editor_review', 'fact_checking', 'copy_editing', 'final_review', 'scheduling', 'published'),
      defaultValue: 'creation',
      field: 'workflowStage'
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      },
      field: 'categoryId'
    },
    subcategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Subcategories',
        key: 'id'
      },
      field: 'subcategoryId'
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Authors',
        key: 'id'
      },
      field: 'authorId'
    },
    coAuthors: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'coAuthors'
    },
    authorBioOverride: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'authorBioOverride'
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'featured'
    },
    heroSlider: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'heroSlider'
    },
    trending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'trending'
    },
    pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'pinned'
    },
    allowComments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'allowComments'
    },
    readingTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Reading time in minutes',
      field: 'readingTime'
    },
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'metaTitle'
    },
    metaDescription: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'metaDescription'
    },
    keywords: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'keywords'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'tags'
    },
    publishDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'publishDate'
    },
    scheduledPublishDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scheduled_publish_date'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'viewCount'
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'likeCount'
    },
    shareCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'shareCount'
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Admins',
        key: 'id'
      },
      field: 'assignedTo'
    },
    nextAction: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'nextAction'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Admins',
        key: 'id'
      },
      field: 'createdBy'
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Admins',
        key: 'id'
      },
      field: 'updatedBy'
    },
    // New fields for enhanced article metadata
    nationality: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'nationality'
    },
    age: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'age'
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'gender'
    },
    ethnicity: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ethnicity'
    },
    residency: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'residency'
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'industry'
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'position'
    },
    imageDisplayMode: {
      type: DataTypes.ENUM('single', 'multiple', 'slider'),
      defaultValue: 'single',
      allowNull: false,
      field: 'imageDisplayMode'
    },
    links: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'links'
    },
    socialEmbeds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'socialEmbeds'
    },
    externalLinkFollow: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'externalLinkFollow'
    },
    captchaVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'captchaVerified'
    },
    guidelinesAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'guidelinesAccepted'
    }
  }, {
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (article) => {
        // Auto-generate slug
        if (!article.slug) {
          article.slug = slugify(article.title, { lower: true, strict: true });
          
          // Check for duplicate slugs
          const existingSlug = await Article.findOne({ where: { slug: article.slug } });
          if (existingSlug) {
            article.slug = `${article.slug}-${Date.now()}`;
          }
        }
        
        // Auto-calculate reading time
        if (article.content) {
          const wordCount = article.content.split(/\s+/).length;
          article.readingTime = Math.ceil(wordCount / 200);
        }

        // Auto-generate excerpt if not provided
        if (!article.excerpt && article.content) {
          article.excerpt = article.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
        }

        // Auto-generate meta title and description if not provided
        if (!article.metaTitle) {
          article.metaTitle = article.title;
        }
        if (!article.metaDescription) {
          article.metaDescription = article.excerpt || article.description;
        }

        // Auto-generate alt text for featured image
        if (article.featuredImage && !article.imageAlt) {
          article.imageAlt = `Featured image for ${article.title}`;
        }
      },
      
      beforeUpdate: async (article) => {
        // Update reading time if content changed
        if (article.changed('content')) {
          const wordCount = article.content.split(/\s+/).length;
          article.readingTime = Math.ceil(wordCount / 200);
        }

        // Update slug if title changed
        if (article.changed('title')) {
          const newSlug = slugify(article.title, { lower: true, strict: true });
          const existingSlug = await Article.findOne({
            where: {
              slug: newSlug,
              id: { [sequelize.Sequelize.Op.ne]: article.id }
            }
          });
          if (!existingSlug) {
            article.slug = newSlug;
          }
        }
      }
    }
  });

  Article.associate = (models) => {
    Article.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
      onDelete: 'CASCADE'
    });

    Article.belongsTo(models.Subcategory, {
      foreignKey: 'subcategoryId',
      as: 'subcategory'
    });

    Article.belongsTo(models.Author, {
      foreignKey: 'authorId',
      as: 'primaryAuthor'
    });

    Article.belongsTo(models.Admin, {
      foreignKey: 'assignedTo',
      as: 'assignedEditor'
    });

    Article.belongsTo(models.Admin, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    Article.belongsTo(models.Admin, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });

    Article.hasMany(models.Comment, {
      foreignKey: 'article_id',
      as: 'comments'
    });

    Article.hasMany(models.ArticleView, {
      foreignKey: 'articleId',
      as: 'views'
    });
  };

module.exports = Article;