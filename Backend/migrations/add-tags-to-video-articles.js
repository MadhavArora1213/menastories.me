'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('VideoArticles', 'tags', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of tag names associated with the video article'
      });
    } catch (error) {
      // Column might already exist, continue
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('VideoArticles', 'tags');
  }
};