'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check which columns exist and only add missing ones
    const existingColumns = await queryInterface.describeTable('Articles');
    const columnsToAdd = [];

    // Add writerPosition field if it doesn't exist
    if (!existingColumns.writerPosition) {
      columnsToAdd.push({
        name: 'writerPosition',
        column: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Position/title of the writer'
        }
      });
    }

    // Add writerName field if it doesn't exist
    if (!existingColumns.writerName) {
      columnsToAdd.push({
        name: 'writerName',
        column: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Name of the writer'
        }
      });
    }

    // Add writerDate field if it doesn't exist
    if (!existingColumns.writerDate) {
      columnsToAdd.push({
        name: 'writerDate',
        column: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date associated with the writer'
        }
      });
    }

    // Add contactEmail field if it doesn't exist
    if (!existingColumns.contactEmail) {
      columnsToAdd.push({
        name: 'contactEmail',
        column: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Contact email for the article'
        }
      });
    }

    // Add contactPhone field if it doesn't exist
    if (!existingColumns.contactPhone) {
      columnsToAdd.push({
        name: 'contactPhone',
        column: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Contact phone for the article'
        }
      });
    }

    // Add missing columns
    for (const { name, column } of columnsToAdd) {
      await queryInterface.addColumn('Articles', name, column);
    }

    console.log(`Added ${columnsToAdd.length} missing columns to Articles table`);
  },

  down: async (queryInterface, Sequelize) => {
    const columnsToRemove = ['writerPosition', 'writerName', 'writerDate', 'contactEmail', 'contactPhone'];

    for (const columnName of columnsToRemove) {
      try {
        await queryInterface.removeColumn('Articles', columnName);
      } catch (error) {
        console.log(`Column ${columnName} may not exist, skipping removal`);
      }
    }
  }
};