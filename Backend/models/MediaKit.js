const { DataTypes } = require('sequelize');
const slugify = require('slugify');
const sequelize = require('../config/db');

const MediaKit = sequelize.define('MediaKit', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
      allowNull: false
    },
    featuredImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageCaption: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageAlt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pdfFile: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Path to the uploaded and optimized PDF file'
    },
    pdfOriginalName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Original filename of the uploaded PDF'
    },
    pdfSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Size of the PDF file in bytes'
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
    // Publishing information
    publishDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Analytics
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Audit fields
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
    }
  }, {
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (mediaKit, options) => {
        console.log('BEFORE CREATE HOOK: Starting for MediaKit');
        console.log('BEFORE CREATE HOOK: mediaKit.title:', mediaKit.title);
        console.log('BEFORE CREATE HOOK: mediaKit.slug:', mediaKit.slug);
        console.log('BEFORE CREATE HOOK: !mediaKit.slug:', !mediaKit.slug);
        console.log('BEFORE CREATE HOOK: mediaKit.title truthy:', !!mediaKit.title);

        // Auto-generate slug
        if (!mediaKit.slug && mediaKit.title) {
          console.log('BEFORE CREATE HOOK: Generating slug for title:', mediaKit.title);
          let baseSlug = slugify(mediaKit.title, { lower: true, strict: true });
          console.log('BEFORE CREATE HOOK: Generated baseSlug:', baseSlug);

          // Check for duplicate slugs using the sequelize instance
          let existingSlug = await sequelize.models.MediaKit.findOne({
            where: { slug: baseSlug }
          });

          if (existingSlug) {
            baseSlug = `${baseSlug}-${Date.now()}`;
            console.log('BEFORE CREATE HOOK: Slug exists, new slug:', baseSlug);
          }

          mediaKit.slug = baseSlug;
          console.log('BEFORE CREATE HOOK: Set mediaKit.slug to:', mediaKit.slug);
        } else {
          console.log('BEFORE CREATE HOOK: Not generating slug - slug exists or no title');
        }
        console.log('BEFORE CREATE HOOK: Ending');

        // Auto-generate meta title and description if not provided
        if (!mediaKit.metaTitle && mediaKit.title) {
          mediaKit.metaTitle = mediaKit.title;
        }
        if (!mediaKit.metaDescription && mediaKit.description) {
          mediaKit.metaDescription = mediaKit.description;
        }

        // Auto-generate alt text for featured image
        if (mediaKit.featuredImage && !mediaKit.imageAlt && mediaKit.title) {
          mediaKit.imageAlt = `Featured image for ${mediaKit.title}`;
        }
      },

      beforeUpdate: async (mediaKit, options) => {
        // Update slug if title changed
        if (mediaKit.changed('title') && mediaKit.title) {
          const newSlug = slugify(mediaKit.title, { lower: true, strict: true });
          const existingSlug = await sequelize.models.MediaKit.findOne({
            where: {
              slug: newSlug,
              id: { [sequelize.Sequelize.Op.ne]: mediaKit.id }
            }
          });
          if (!existingSlug) {
            mediaKit.slug = newSlug;
          }
        }
      }
    }
  });

  MediaKit.associate = (models) => {
    MediaKit.belongsTo(models.Admin, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    MediaKit.belongsTo(models.Admin, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };

module.exports = MediaKit;