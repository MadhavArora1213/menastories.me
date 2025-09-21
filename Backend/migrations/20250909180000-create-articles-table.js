'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Articles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
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
      featuredImage: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'featuredImage'
      },
      imageCaption: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'imageCaption'
      },
      imageAlt: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'imageAlt'
      },
      gallery: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        field: 'gallery'
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending_review', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'rejected'),
        defaultValue: 'draft',
        allowNull: false,
        field: 'status'
      },
      workflowStage: {
        type: Sequelize.ENUM('creation', 'section_editor_review', 'fact_checking', 'copy_editing', 'final_review', 'scheduling', 'published'),
        defaultValue: 'creation',
        field: 'workflowStage'
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id'
        },
        field: 'categoryId'
      },
      subcategoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Subcategories',
          key: 'id'
        },
        field: 'subcategoryId'
      },
      authorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Authors',
          key: 'id'
        },
        field: 'authorId'
      },
      coAuthors: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        field: 'coAuthors'
      },
      authorBioOverride: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'authorBioOverride'
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'featured'
      },
      heroSlider: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'heroSlider'
      },
      trending: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'trending'
      },
      pinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'pinned'
      },
      allowComments: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'allowComments'
      },
      readingTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Reading time in minutes',
        field: 'readingTime'
      },
      metaTitle: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'metaTitle'
      },
      metaDescription: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'metaDescription'
      },
      keywords: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        field: 'keywords'
      },
      publishDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'publishDate'
      },
      scheduledPublishDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'scheduled_publish_date'
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'viewCount'
      },
      likeCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'likeCount'
      },
      shareCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'shareCount'
      },
      assignedTo: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Admins',
          key: 'id'
        },
        field: 'assignedTo'
      },
      nextAction: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'nextAction'
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Admins',
          key: 'id'
        },
        field: 'createdBy'
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Admins',
          key: 'id'
        },
        field: 'updatedBy'
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
    await queryInterface.addIndex('Articles', ['slug'], { unique: true });
    await queryInterface.addIndex('Articles', ['status']);
    await queryInterface.addIndex('Articles', ['categoryId']);
    await queryInterface.addIndex('Articles', ['authorId']);
    await queryInterface.addIndex('Articles', ['publishDate']);
    await queryInterface.addIndex('Articles', ['scheduled_publish_date']);
    await queryInterface.addIndex('Articles', ['featured']);
    await queryInterface.addIndex('Articles', ['trending']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Articles');
  }
};