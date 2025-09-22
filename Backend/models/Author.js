const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Author = sequelize.define('Author', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    social_media: {
      type: DataTypes.JSON,
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
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  Author.associate = (models) => {
    Author.hasMany(models.Article, {
      foreignKey: 'authorId',
      as: 'articles'
    });
  };

module.exports = Author;