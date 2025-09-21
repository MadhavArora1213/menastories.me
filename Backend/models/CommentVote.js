const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CommentVote = sequelize.define('CommentVote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Comments',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    voteType: {
      type: DataTypes.ENUM('up', 'down'),
      allowNull: false
    }
  }, {
    tableName: 'CommentVotes',
    timestamps: true,
    indexes: [
      {
        fields: ['commentId']
      },
      {
        fields: ['userId']
      },
      {
        unique: true,
        fields: ['commentId', 'userId']
      }
    ]
  });

  CommentVote.associate = (models) => {
    CommentVote.belongsTo(models.Comment, {
      foreignKey: 'commentId',
      as: 'comment'
    });
    
    CommentVote.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return CommentVote;
};