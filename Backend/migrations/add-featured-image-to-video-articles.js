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

    // Add featuredImage column if it doesn't exist
    if (!existingColumns.includes('featuredImage')) {
      await queryInterface.addColumn('VideoArticles', 'featuredImage', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Path to the featured image file'
      });
    }

    // Add imageCaption column if it doesn't exist
    if (!existingColumns.includes('imageCaption')) {
      await queryInterface.addColumn('VideoArticles', 'imageCaption', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Caption for the featured image'
      });
    }

    // Add imageAlt column if it doesn't exist
    if (!existingColumns.includes('imageAlt')) {
      await queryInterface.addColumn('VideoArticles', 'imageAlt', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Alt text for the featured image for SEO'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('VideoArticles', 'featuredImage');
    await queryInterface.removeColumn('VideoArticles', 'imageCaption');
    await queryInterface.removeColumn('VideoArticles', 'imageAlt');
  }
};