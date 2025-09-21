'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PowerListEntries', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      listId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Lists',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      // Core identity
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      photo: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Profile or company image'
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Role / Title (e.g. CEO, Actor, Athlete)'
      },
      organization: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Company, Startup, or Institution'
      },

      // Classification
      category: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Category like Business, Sports, Tech, Lifestyle'
      },
      industry: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // Optional demographic fields
      age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'non-binary', 'other'),
        allowNull: true
      },

      // Story/Reasoning
      achievements: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Why this entry is on the list'
      },
      shortBio: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      // Ranking/order
      rank: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'If ordered, else null'
      },

      // SEO
      metaTitle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metaDescription: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // Status
      status: {
        type: Sequelize.ENUM('active', 'removed'),
        defaultValue: 'active',
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

    // Add indexes for better performance
    await queryInterface.addIndex('PowerListEntries', ['listId']);
    await queryInterface.addIndex('PowerListEntries', ['status']);
    await queryInterface.addIndex('PowerListEntries', ['rank']);
    await queryInterface.addIndex('PowerListEntries', ['category']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PowerListEntries');
  }
};