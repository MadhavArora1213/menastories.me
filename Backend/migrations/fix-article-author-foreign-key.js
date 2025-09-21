'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the existing foreign key constraint that references Admins
    await queryInterface.removeConstraint('Articles', 'Articles_authorId_fkey');

    // Add the correct foreign key constraint that references Authors
    await queryInterface.addConstraint('Articles', {
      fields: ['authorId'],
      type: 'foreign key',
      name: 'Articles_authorId_fkey',
      references: {
        table: 'Authors',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to referencing Admins (if needed for rollback)
    await queryInterface.removeConstraint('Articles', 'Articles_authorId_fkey');

    await queryInterface.addConstraint('Articles', {
      fields: ['authorId'],
      type: 'foreign key',
      name: 'Articles_authorId_fkey',
      references: {
        table: 'Admins',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};