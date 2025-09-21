'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Roles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      accessLevel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      canManageUsers: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      canManageRoles: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      rolePermissions: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('Roles', ['name'], { unique: true });
    await queryInterface.addIndex('Roles', ['accessLevel']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Roles');
  }
};