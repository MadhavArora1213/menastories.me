'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MediaKits', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
        allowNull: false
      },
      featuredImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imageCaption: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imageAlt: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // Audience demographics data
      audienceDemographics: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'JSON object containing audience demographics data'
      },
      // Digital presence metrics
      digitalPresence: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'JSON object containing digital presence metrics'
      },
      // Advertising opportunities
      advertisingOpportunities: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'JSON array of advertising opportunities'
      },
      // Brand guidelines
      brandGuidelines: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'JSON object containing brand guidelines information'
      },
      // Downloadable documents
      documents: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'JSON array of downloadable documents'
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
      // Publishing information
      publishDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Analytics
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      downloadCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // Audit fields
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes (with error handling for existing indexes)
    try {
      await queryInterface.addIndex('MediaKits', ['slug'], { unique: true });
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('MediaKits', ['status']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('MediaKits', ['publishDate']);
    } catch (error) {
      // Index might already exist, continue
    }
    try {
      await queryInterface.addIndex('MediaKits', ['createdBy']);
    } catch (error) {
      // Index might already exist, continue
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MediaKits');
  }
};