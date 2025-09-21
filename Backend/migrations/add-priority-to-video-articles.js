'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('VideoArticles', 'priority', {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal'
      });
    } catch (error) {
      // Column might already exist, continue
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('VideoArticles', 'priority');
  }
};