'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.tableExists('Subcategories');
    if (!tableExists) {
      await queryInterface.createTable('Subcategories', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        categoryId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Categories',
            key: 'id'
          }
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
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
      await queryInterface.addIndex('Subcategories', ['slug'], { unique: true });
      await queryInterface.addIndex('Subcategories', ['categoryId']);
      await queryInterface.addIndex('Subcategories', ['order']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Subcategories');
  }
};