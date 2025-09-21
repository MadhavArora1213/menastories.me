'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add '2026' to the enum_Lists_year enum type
    await queryInterface.sequelize.query("ALTER TYPE \"enum_Lists_year\" ADD VALUE '2026';");
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
