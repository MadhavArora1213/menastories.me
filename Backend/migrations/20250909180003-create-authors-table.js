'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Authors', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      profile_image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      experience: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      education: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      social_media: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          twitter: null,
          linkedin: null,
          facebook: null,
          instagram: null,
          website: null
        }
      },
      expertise: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      is_active: {
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
    await queryInterface.addIndex('Authors', ['email'], { unique: true });
    await queryInterface.addIndex('Authors', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Authors');
  }
};