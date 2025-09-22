const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PowerListEntry = sequelize.define('PowerListEntry', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    listId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Lists',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    // Core identity
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Profile or company image'
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Role / Title (e.g. CEO, Actor, Athlete)'
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Company, Startup, or Institution'
    },

    // Classification
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Category like Business, Sports, Tech, Lifestyle'
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Optional demographic fields
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'non-binary', 'other'),
      allowNull: true
    },

    // Story/Reasoning
    achievements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Why this entry is on the list'
    },
    shortBio: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // Ranking/order
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'If ordered, else null'
    },

    // SEO
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metaDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Status
    status: {
      type: DataTypes.ENUM('active', 'removed'),
      defaultValue: 'active'
    }
  }, {
    timestamps: true
  });

  PowerListEntry.associate = (models) => {
    PowerListEntry.belongsTo(models.List, {
      foreignKey: 'listId',
      as: 'list'
    });
  };

module.exports = PowerListEntry;