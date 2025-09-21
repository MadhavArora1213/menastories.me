'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.tableExists('VideoArticles');
    if (!tableExists) {
      await queryInterface.createTable('VideoArticles', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            len: [5, 255]
          }
        },
        slug: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false
        },
        subtitle: {
          type: Sequelize.STRING,
          allowNull: true
        },
        content: {
          type: Sequelize.TEXT('long'),
          allowNull: false
        },
        excerpt: {
          type: Sequelize.TEXT,
          allowNull: true,
          validate: {
            len: [0, 500]
          }
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        youtubeUrl: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            isUrl: true
          }
        },
        videoType: {
          type: Sequelize.ENUM('youtube', 'youtube_shorts'),
          defaultValue: 'youtube',
          allowNull: false
        },
        duration: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Duration in seconds'
        },
        thumbnailUrl: {
          type: Sequelize.STRING,
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('draft', 'pending_review', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'rejected'),
          defaultValue: 'draft',
          allowNull: false
        },
        workflowStage: {
          type: Sequelize.ENUM('creation', 'section_editor_review', 'fact_checking', 'copy_editing', 'final_review', 'scheduling', 'published'),
          defaultValue: 'creation'
        },
        categoryId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Categories',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        subcategoryId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Subcategories',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        authorId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Authors',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        coAuthors: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: []
        },
        authorBioOverride: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        featured: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        heroSlider: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        trending: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        pinned: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        allowComments: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        readingTime: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Reading time in minutes'
        },
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
        publishDate: {
          type: Sequelize.DATE,
          allowNull: true
        },
        scheduledPublishDate: {
          type: Sequelize.DATE,
          allowNull: true
        },
        viewCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        likeCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        shareCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        assignedTo: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Admins',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        nextAction: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        createdBy: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Admins',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        updatedBy: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Admins',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
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

      // Add indexes for better performance
      await queryInterface.addIndex('VideoArticles', ['status']);
      await queryInterface.addIndex('VideoArticles', ['categoryId']);
      await queryInterface.addIndex('VideoArticles', ['authorId']);
      await queryInterface.addIndex('VideoArticles', ['slug']);
      await queryInterface.addIndex('VideoArticles', ['publishDate']);
      await queryInterface.addIndex('VideoArticles', ['scheduledPublishDate']);
      await queryInterface.addIndex('VideoArticles', ['status', 'publishDate']);
      await queryInterface.addIndex('VideoArticles', ['createdAt']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VideoArticles');
  }
};