'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check existing columns in flipbook_pages table
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'flipbook_pages' AND table_schema = 'public'
    `);
    const existingColumns = results.map(row => row.column_name);

    // Add imagePath column if it doesn't exist
    if (!existingColumns.includes('imagePath')) {
      await queryInterface.addColumn('flipbook_pages', 'imagePath', {
        type: Sequelize.STRING(500),
        allowNull: true,
        validate: {
          notEmpty: true
        }
      });
    }

    // Add thumbnailPath column if it doesn't exist
    if (!existingColumns.includes('thumbnailPath')) {
      await queryInterface.addColumn('flipbook_pages', 'thumbnailPath', {
        type: Sequelize.STRING(500),
        allowNull: true
      });
    }

    // Add highResImagePath column if it doesn't exist
    if (!existingColumns.includes('highResImagePath')) {
      await queryInterface.addColumn('flipbook_pages', 'highResImagePath', {
        type: Sequelize.STRING(500),
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns if we need to rollback
    await queryInterface.removeColumn('flipbook_pages', 'imagePath');
    await queryInterface.removeColumn('flipbook_pages', 'thumbnailPath');
    await queryInterface.removeColumn('flipbook_pages', 'highResImagePath');
  }
};