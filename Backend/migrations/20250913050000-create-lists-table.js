'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Lists', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [3, 255]
        }
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      featuredImage: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Relative path to storage/list/images/'
      },
      imageCaption: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imageAlt: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metaTitle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metaDescription: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      year: {
        type: Sequelize.ENUM('2025', '2024', '2023', '2022', '2021'),
        allowNull: true
      },
      recommended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      richLists: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      entrepreneurs: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      companies: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      leaders: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      entertainment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sports: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lifestyle: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      methodology: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
        allowNull: false
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
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
    await queryInterface.addIndex('Lists', ['slug'], { unique: true });
    await queryInterface.addIndex('Lists', ['status']);
    await queryInterface.addIndex('Lists', ['year']);
    await queryInterface.addIndex('Lists', ['recommended']);
    await queryInterface.addIndex('Lists', ['richLists']);
    await queryInterface.addIndex('Lists', ['entrepreneurs']);
    await queryInterface.addIndex('Lists', ['companies']);
    await queryInterface.addIndex('Lists', ['leaders']);
    await queryInterface.addIndex('Lists', ['entertainment']);
    await queryInterface.addIndex('Lists', ['sports']);
    await queryInterface.addIndex('Lists', ['lifestyle']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Lists');
  }
};