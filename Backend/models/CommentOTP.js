const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CommentOTP = sequelize.define('CommentOTP', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'OTP cannot be empty'
        },
        len: {
          args: [6, 6],
          msg: 'OTP must be exactly 6 characters'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [1, 100],
          msg: 'Name must be between 1 and 100 characters'
        }
      }
    },
    articleId: {
       type: DataTypes.UUID,
       allowNull: false,
       field: 'article_id'
     },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at'
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'used_at'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent'
    }
  }, {
    tableName: 'CommentOTPs',
    timestamps: true,
    indexes: [
      {
        fields: ['email', 'article_id']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['used']
      }
    ]
  });

  // Validate OTP
  CommentOTP.validateOTP = async function(email, otp, articleId) {
    try {
      const otpRecord = await this.findOne({
        where: {
          email,
          otp,
          articleId,
          used: false,
          expiresAt: {
            [sequelize.Sequelize.Op.gt]: new Date()
          }
        }
      });

      if (!otpRecord) {
        throw new Error('Invalid or expired OTP');
      }

      // Mark as used
      await otpRecord.update({
        used: true,
        usedAt: new Date()
      });

      return otpRecord;
    } catch (error) {
      console.error('Error validating OTP:', error);
      throw error;
    }
  };

  // Clean up expired OTPs
  CommentOTP.cleanupExpired = async function() {
    try {
      const result = await this.destroy({
        where: {
          expiresAt: {
            [sequelize.Sequelize.Op.lt]: new Date()
          }
        }
      });
      console.log(`Cleaned up ${result} expired OTPs`);
      return result;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      throw error;
    }
  };

  // Define associations
  CommentOTP.associate = function(models) {
    CommentOTP.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article'
    });
  };

  return CommentOTP;
};