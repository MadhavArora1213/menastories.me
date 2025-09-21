'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check existing columns in Authors table
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Authors' AND table_schema = 'public'
    `);
    const existingColumns = results.map(row => row.column_name);

    // Add social_media column if it doesn't exist
    if (!existingColumns.includes('social_media')) {
      await queryInterface.addColumn('Authors', 'social_media', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          twitter: null,
          linkedin: null,
          facebook: null,
          instagram: null,
          website: null
        }
      });
    }

    // Add expertise column if it doesn't exist
    if (!existingColumns.includes('expertise')) {
      await queryInterface.addColumn('Authors', 'expertise', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      });
    }

    // Add is_active column if it doesn't exist
    if (!existingColumns.includes('is_active')) {
      await queryInterface.addColumn('Authors', 'is_active', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the added columns
    await queryInterface.removeColumn('Authors', 'social_media');
    await queryInterface.removeColumn('Authors', 'expertise');
    await queryInterface.removeColumn('Authors', 'is_active');
  }
};