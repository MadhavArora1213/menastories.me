const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ArticleWorkflowHistory = sequelize.define('ArticleWorkflowHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Articles',
        key: 'id'
      }
    },
    from_status: {
      type: DataTypes.ENUM('draft', 'pending_review', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'rejected'),
      allowNull: false
    },
    to_status: {
      type: DataTypes.ENUM('draft', 'pending_review', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'rejected'),
      allowNull: false
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Admins',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    tableName: 'article_workflow_history'
  });

  ArticleWorkflowHistory.associate = (models) => {
    ArticleWorkflowHistory.belongsTo(models.Article, {
      foreignKey: 'article_id',
      as: 'article'
    });
    
    ArticleWorkflowHistory.belongsTo(models.Admin, {
      foreignKey: 'changed_by',
      as: 'changedBy'
    });
  };

  return ArticleWorkflowHistory;
};