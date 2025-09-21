'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Drop the existing foreign key constraint that references Users table
    await queryInterface.sequelize.query(`
      ALTER TABLE "flipbook_magazines"
      DROP CONSTRAINT IF EXISTS "flipbook_magazines_createdBy_fkey";
    `);

    // Add new foreign key constraint that references Admins table
    await queryInterface.sequelize.query(`
      ALTER TABLE "flipbook_magazines"
      ADD CONSTRAINT "flipbook_magazines_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "Admins"("id") ON DELETE SET NULL;
    `);
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
