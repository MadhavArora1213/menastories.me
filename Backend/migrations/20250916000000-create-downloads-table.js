'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Downloads', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [3, 255]
        }
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // File information
      fileUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      originalFileName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'File size in bytes'
      },
      fileType: {
        type: Sequelize.ENUM('pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'mp3', 'wav', 'zip', 'rar', 'other'),
        allowNull: false
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // Thumbnail/Preview
      thumbnailUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      previewUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // Status and publishing
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
        allowNull: false
      },
      // Category and tags
      categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id'
        }
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      // SEO and metadata
      metaTitle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metaDescription: {
        type: Sequelize.STRING,
        allowNull: true
      },
      keywords: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      // Publishing dates
      publishDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      scheduledPublishDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Analytics
      downloadCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // Admin tracking
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Admins',
          key: 'id'
        }
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Admins',
          key: 'id'
        }
      },
      // Additional metadata
      version: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'File version number'
      },
      language: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'en',
        comment: 'File language code'
      },
      license: {
        type: Sequelize.ENUM('all_rights_reserved', 'creative_commons', 'public_domain', 'fair_use'),
        defaultValue: 'all_rights_reserved'
      },
      copyright: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // Security
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      accessLevel: {
        type: Sequelize.ENUM('public', 'registered', 'premium'),
        defaultValue: 'public'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('Downloads', ['slug'], { unique: true });
    await queryInterface.addIndex('Downloads', ['status']);
    await queryInterface.addIndex('Downloads', ['fileType']);
    await queryInterface.addIndex('Downloads', ['categoryId']);
    await queryInterface.addIndex('Downloads', ['publishDate']);
    await queryInterface.addIndex('Downloads', ['createdBy']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Downloads');
  }
};