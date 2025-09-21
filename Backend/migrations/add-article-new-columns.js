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

    // Add description column if it doesn't exist
    if (!existingColumns.includes('description')) {
      await queryInterface.addColumn('Articles', 'description', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    // Add categoryId column if it doesn't exist
    if (!existingColumns.includes('categoryId')) {
      await queryInterface.addColumn('Articles', 'categoryId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    // Add heroSlider column if it doesn't exist
    if (!existingColumns.includes('heroSlider')) {
      await queryInterface.addColumn('Articles', 'heroSlider', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    // Update existing subcategoryId reference to point to Subcategories instead of Tags
    await queryInterface.changeColumn('Articles', 'subcategoryId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Subcategories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new columns
    await queryInterface.removeColumn('Articles', 'description');
    await queryInterface.removeColumn('Articles', 'categoryId');
    await queryInterface.removeColumn('Articles', 'heroSlider');

    // Revert subcategoryId reference back to Tags
    await queryInterface.changeColumn('Articles', 'subcategoryId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Tags',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};