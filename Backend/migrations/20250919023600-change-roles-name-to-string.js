'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the name column from ENUM to STRING
    await queryInterface.changeColumn('Roles', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to ENUM if needed
    await queryInterface.changeColumn('Roles', 'name', {
      type: Sequelize.ENUM(
        'Master Admin',
        'Webmaster',
        'Content Admin',
        'Editor-in-Chief',
        'Section Editors',
        'Senior Writers',
        'Staff Writers',
        'Contributors',
        'Reviewers',
        'Social Media Manager'
      ),
      allowNull: false
    });
  }
};