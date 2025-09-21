'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check existing columns in Articles table
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Articles' AND table_schema = 'public'
    `);
    const existingColumns = results.map(row => row.column_name);

    // Add scheduled_publish_date column if it doesn't exist
    if (!existingColumns.includes('scheduled_publish_date')) {
      await queryInterface.addColumn('Articles', 'scheduled_publish_date', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Articles', 'scheduled_publish_date');
  }
};