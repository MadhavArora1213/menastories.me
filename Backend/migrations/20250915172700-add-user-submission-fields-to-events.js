'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns for user event submissions
    await queryInterface.addColumn('events', 'submittedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('events', 'isUserSubmitted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('events', 'reviewNotes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('events', 'reviewedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Admins',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('events', 'reviewedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Update the status enum to include new values
    await queryInterface.changeColumn('events', 'status', {
      type: Sequelize.ENUM(
        'draft',
        'pending_review',
        'published',
        'cancelled',
        'postponed',
        'completed',
        'rejected'
      ),
      allowNull: false,
      defaultValue: 'draft'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the new columns
    await queryInterface.removeColumn('events', 'submittedBy');
    await queryInterface.removeColumn('events', 'isUserSubmitted');
    await queryInterface.removeColumn('events', 'reviewNotes');
    await queryInterface.removeColumn('events', 'reviewedBy');
    await queryInterface.removeColumn('events', 'reviewedAt');

    // Revert the status enum
    await queryInterface.changeColumn('events', 'status', {
      type: Sequelize.ENUM(
        'draft',
        'published',
        'cancelled',
        'postponed',
        'completed'
      ),
      allowNull: false,
      defaultValue: 'draft'
    });
  }
};