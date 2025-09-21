'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.tableExists('Admins');
    if (!tableExists) {
      await queryInterface.createTable('Admins', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        roleId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Roles',
            key: 'id'
          }
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
        },
        isAccountLocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        lastLoginAt: {
          type: Sequelize.DATE,
          allowNull: true
        },
        loginAttempts: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        lockoutUntil: {
          type: Sequelize.DATE,
          allowNull: true
        },
        mfaEnabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        mfaSecret: {
          type: Sequelize.STRING,
          allowNull: true
        },
        mfaBackupCodes: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: []
        },
        passwordResetToken: {
          type: Sequelize.STRING,
          allowNull: true
        },
        passwordResetExpires: {
          type: Sequelize.DATE,
          allowNull: true
        },
        profileImage: {
          type: Sequelize.STRING,
          allowNull: true
        },
        phoneNumber: {
          type: Sequelize.STRING,
          allowNull: true
        },
        department: {
          type: Sequelize.STRING,
          allowNull: true
        },
        permissions: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: {}
        },
        preferences: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: {}
        },
        createdBy: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Admins',
            key: 'id'
          }
        },
        updatedBy: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Admins',
            key: 'id'
          }
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
      await queryInterface.addIndex('Admins', ['email'], { unique: true });
      await queryInterface.addIndex('Admins', ['roleId']);
      await queryInterface.addIndex('Admins', ['isActive']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Admins');
  }
};