const { DataTypes } = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize) => {
  const VideoArticle = sequelize.define('VideoArticle', {
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
    youtubeUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
        isYouTubeUrl(value) {
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)/;
          if (!youtubeRegex.test(value)) {
            throw new Error('Must be a valid YouTube URL');
          }
        }
      },
      field: 'youtubeUrl'
    },
    videoType: {
      type: DataTypes.ENUM('youtube', 'youtube_shorts'),
      defaultValue: 'youtube',
      allowNull: false,
      field: 'videoType'
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in seconds
      allowNull: true,
      field: 'duration'
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'thumbnailUrl'
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
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal',
      allowNull: false,
      field: 'priority'
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
    // New fields for enhanced video article metadata
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
      beforeCreate: async (videoArticle) => {
        // Auto-generate slug
        if (!videoArticle.slug) {
          videoArticle.slug = slugify(videoArticle.title, { lower: true, strict: true });

          // Check for duplicate slugs
          const existingSlug = await VideoArticle.findOne({ where: { slug: videoArticle.slug } });
          if (existingSlug) {
            videoArticle.slug = `${videoArticle.slug}-${Date.now()}`;
          }
        }

        // Auto-calculate reading time
        if (videoArticle.content) {
          const wordCount = videoArticle.content.split(/\s+/).length;
          videoArticle.readingTime = Math.ceil(wordCount / 200);
        }

        // Auto-generate excerpt if not provided
        if (!videoArticle.excerpt && videoArticle.content) {
          videoArticle.excerpt = videoArticle.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
        }

        // Auto-generate meta title and description if not provided
        if (!videoArticle.metaTitle) {
          videoArticle.metaTitle = videoArticle.title;
        }
        if (!videoArticle.metaDescription) {
          videoArticle.metaDescription = videoArticle.excerpt || videoArticle.description;
        }

        // Auto-generate alt text for featured image
        if (videoArticle.featuredImage && !videoArticle.imageAlt) {
          videoArticle.imageAlt = `Featured image for ${videoArticle.title}`;
        }

        // Extract YouTube video ID and generate thumbnail
        if (videoArticle.youtubeUrl && !videoArticle.thumbnailUrl) {
          const videoId = videoArticle.extractYouTubeVideoId(videoArticle.youtubeUrl);
          if (videoId) {
            videoArticle.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
        }

        // Determine video type based on URL
        if (videoArticle.youtubeUrl) {
          if (videoArticle.youtubeUrl.includes('shorts')) {
            videoArticle.videoType = 'youtube_shorts';
          } else {
            videoArticle.videoType = 'youtube';
          }
        }

      },

      beforeUpdate: async (videoArticle) => {
        // Update reading time if content changed
        if (videoArticle.changed('content')) {
          const wordCount = videoArticle.content.split(/\s+/).length;
          videoArticle.readingTime = Math.ceil(wordCount / 200);
        }

        // Update slug if title changed
        if (videoArticle.changed('title')) {
          const newSlug = slugify(videoArticle.title, { lower: true, strict: true });
          const existingSlug = await VideoArticle.findOne({
            where: {
              slug: newSlug,
              id: { [sequelize.Sequelize.Op.ne]: videoArticle.id }
            }
          });
          if (!existingSlug) {
            videoArticle.slug = newSlug;
          }
        }

        // Update thumbnail if YouTube URL changed
        if (videoArticle.changed('youtubeUrl') && !videoArticle.thumbnailUrl) {
          const videoId = videoArticle.extractYouTubeVideoId(videoArticle.youtubeUrl);
          if (videoId) {
            videoArticle.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
        }
      }
    }
  });

  // Instance method to extract YouTube video ID
  VideoArticle.prototype.extractYouTubeVideoId = function(url) {
    if (!url) return null;

    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  VideoArticle.associate = (models) => {
    VideoArticle.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'videoCategory'
    });

    VideoArticle.belongsTo(models.Subcategory, {
      foreignKey: 'subcategoryId',
      as: 'subcategory'
    });

    VideoArticle.belongsTo(models.Author, {
      foreignKey: 'authorId',
      as: 'primaryAuthor'
    });

    VideoArticle.belongsTo(models.Admin, {
      foreignKey: 'assignedTo',
      as: 'assignedEditor'
    });

    VideoArticle.belongsTo(models.Admin, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    VideoArticle.belongsTo(models.Admin, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });

    VideoArticle.hasMany(models.VideoComment, {
      foreignKey: 'video_article_id',
      as: 'comments',
      onDelete: 'CASCADE'
    });

    VideoArticle.hasMany(models.VideoArticleView, {
      foreignKey: 'videoArticleId',
      as: 'videoViews',
      onDelete: 'CASCADE'
    });

    VideoArticle.belongsToMany(models.Tag, {
      through: models.VideoArticleTag,
      foreignKey: 'videoArticleId',
      otherKey: 'tagId',
      as: 'associatedTags',
      onDelete: 'CASCADE'
    });
  };

  return VideoArticle;
};