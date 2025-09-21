'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Drop table if it exists
    await queryInterface.dropTable('Comments', { cascade: true, ifExists: true });

    await queryInterface.createTable('Comments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'article_id',
        references: {
          model: 'Articles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      authorId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'author_id',
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      parentId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'parent_id',
        references: {
          model: 'Comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'spam', 'hidden'),
        allowNull: false,
        defaultValue: 'pending'
      },
      upvotes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      downvotes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_edited'
      },
      editedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'edited_at'
      },
      authorName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'author_name'
      },
      authorEmail: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'author_email'
      },
      authorWebsite: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'author_website'
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'ip_address'
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'user_agent'
      },
      moderatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'moderated_by',
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      moderatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'moderated_at'
      },
      moderationNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'moderation_notes'
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

    // Add indexes using database column names
    await queryInterface.addIndex('Comments', ['article_id']);
    await queryInterface.addIndex('Comments', ['author_id']);
    await queryInterface.addIndex('Comments', ['parent_id']);
    await queryInterface.addIndex('Comments', ['status']);
    await queryInterface.addIndex('Comments', ['createdAt']);
    await queryInterface.addIndex('Comments', ['article_id', 'status']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Comments');
  }
};
