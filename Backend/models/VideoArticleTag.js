const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VideoArticleTag = sequelize.define('VideoArticleTag', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    videoArticleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'VideoArticles',
        key: 'id'
      },
      onDelete: 'CASCADE',
      field: 'videoArticleId'
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Tags',
        key: 'id'
      },
      onDelete: 'CASCADE',
      field: 'tagId'
    }
  }, {
    tableName: 'video_article_tags',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['videoArticleId', 'tagId']
      },
      {
        fields: ['videoArticleId']
      },
      {
        fields: ['tagId']
      }
    ]
  });

  VideoArticleTag.associate = (models) => {
    VideoArticleTag.belongsTo(models.VideoArticle, {
      foreignKey: 'videoArticleId',
      as: 'videoArticle'
    });

    VideoArticleTag.belongsTo(models.Tag, {
      foreignKey: 'tagId',
      as: 'tag'
    });
  };

  return VideoArticleTag;
};