const { DataTypes } = require('sequelize');
const slugify = require('slugify');
const sequelize = require('../config/db');

const Download = sequelize.define('Download', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255]
      }
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // File information
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalFileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'File size in bytes'
    },
    fileType: {
      type: DataTypes.ENUM('pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'mp3', 'wav', 'zip', 'rar', 'other'),
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Thumbnail/Preview
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    previewUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Status and publishing
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
      allowNull: false
    },
    // Category and tags
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    // SEO and metadata
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metaDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    keywords: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    // Publishing dates
    publishDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scheduledPublishDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Analytics
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Admin tracking
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Admins',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Admins',
        key: 'id'
      }
    },
    // Additional metadata
    version: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'File version number'
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'en',
      comment: 'File language code'
    },
    license: {
      type: DataTypes.ENUM('all_rights_reserved', 'creative_commons', 'public_domain', 'fair_use'),
      defaultValue: 'all_rights_reserved'
    },
    copyright: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Security
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    accessLevel: {
      type: DataTypes.ENUM('public', 'registered', 'premium'),
      defaultValue: 'public'
    }
  }, {
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (download) => {
        // Auto-generate slug
        if (!download.slug) {
          download.slug = slugify(download.title, { lower: true, strict: true });

          // Check for duplicate slugs
          const existingSlug = await Download.findOne({ where: { slug: download.slug } });
          if (existingSlug) {
            download.slug = `${download.slug}-${Date.now()}`;
          }
        }

        // Auto-generate meta title and description if not provided
        if (!download.metaTitle) {
          download.metaTitle = download.title;
        }
        if (!download.metaDescription && download.description) {
          download.metaDescription = download.description.substring(0, 160);
        }

        // Set publish date for published downloads
        if (download.status === 'published' && !download.publishDate) {
          download.publishDate = new Date();
        }
      },

      beforeUpdate: async (download) => {
        // Update slug if title changed
        if (download.changed('title')) {
          const newSlug = slugify(download.title, { lower: true, strict: true });
          const existingSlug = await Download.findOne({
            where: {
              slug: newSlug,
              id: { [sequelize.Sequelize.Op.ne]: download.id }
            }
          });
          if (!existingSlug) {
            download.slug = newSlug;
          }
        }

        // Set publish date when status changes to published
        if (download.changed('status') && download.status === 'published' && !download.publishDate) {
          download.publishDate = new Date();
        }
      }
    }
  });

  Download.associate = (models) => {
    Download.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });

    Download.belongsTo(models.Admin, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    Download.belongsTo(models.Admin, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };

module.exports = Download;