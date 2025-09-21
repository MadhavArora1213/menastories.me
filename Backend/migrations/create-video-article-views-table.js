'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.tableExists('VideoArticleViews');
    if (!tableExists) {
      await queryInterface.createTable('VideoArticleViews', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        videoArticleId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'VideoArticles',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        ipAddress: {
          type: Sequelize.STRING,
          allowNull: false
        },
        userAgent: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        referrer: {
          type: Sequelize.STRING,
          allowNull: true
        },
        viewedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        sessionId: {
          type: Sequelize.STRING,
          allowNull: true
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        watchTime: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Time spent watching video in seconds'
        },
        watchPercentage: {
          type: Sequelize.FLOAT,
          allowNull: true,
          comment: 'Percentage of video watched (0-100)'
        },
        videoQuality: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Video quality played (360p, 480p, 720p, 1080p, etc.)'
        },
        deviceType: {
          type: Sequelize.ENUM('desktop', 'mobile', 'tablet'),
          allowNull: true
        },
        browser: {
          type: Sequelize.STRING,
          allowNull: true
        },
        country: {
          type: Sequelize.STRING(2),
          allowNull: true,
          comment: 'ISO 3166-1 alpha-2 country code'
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
      await queryInterface.addIndex('VideoArticleViews', ['videoArticleId']);
      await queryInterface.addIndex('VideoArticleViews', ['ipAddress', 'videoArticleId']);
      await queryInterface.addIndex('VideoArticleViews', ['viewedAt']);
      await queryInterface.addIndex('VideoArticleViews', ['userId']);
      await queryInterface.addIndex('VideoArticleViews', ['deviceType']);
      await queryInterface.addIndex('VideoArticleViews', ['country']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VideoArticleViews');
  }
};