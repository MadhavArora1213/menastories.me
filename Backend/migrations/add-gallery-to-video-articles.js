'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check existing columns in VideoArticles table
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'VideoArticles' AND table_schema = 'public'
    `);
    const existingColumns = results.map(row => row.column_name);

    // Add gallery column if it doesn't exist
    if (!existingColumns.includes('gallery')) {
      await queryInterface.addColumn('VideoArticles', 'gallery', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove gallery column from VideoArticles table
    await queryInterface.removeColumn('VideoArticles', 'gallery');
  }
};