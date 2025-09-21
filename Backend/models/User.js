const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Roles',
      key: 'id'
    }
  },
  // Multi-factor Authentication fields
  isMfaEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // Enable MFA by default for new users
  },
  mfaSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mfaBackupCodes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  mfaSetupRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // New users need to set up MFA
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isPhoneNumber(value) {
        if (value && !value.match(/^\+[1-9]\d{1,14}$/)) {
          throw new Error('Phone number must be in international format');
        }
      }
    }
  },
  // Security fields
  isAccountLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lockoutUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastLoginIp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refreshTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Terms and conditions tracking
  termsAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  termsAcceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  termsVersion: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '1.0'
  },
  // Profile fields
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }

      // Generate MFA secret for new users
      if (user.isMfaEnabled && !user.mfaSecret) {
        const crypto = require('crypto');
        user.mfaSecret = crypto.randomBytes(32).toString('hex');

        // Generate backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
          backupCodes.push(crypto.randomInt(100000, 999999).toString());
        }
        user.mfaBackupCodes = backupCodes;
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.isAccountLockedOut = function() {
  return this.isAccountLocked && this.lockoutUntil && new Date() < this.lockoutUntil;
};

User.prototype.incrementFailedLoginAttempts = async function() {
  const maxAttempts = 5;
  const lockoutDuration = 30 * 60 * 1000; // 30 minutes

  this.failedLoginAttempts += 1;

  if (this.failedLoginAttempts >= maxAttempts) {
    this.isAccountLocked = true;
    this.lockoutUntil = new Date(Date.now() + lockoutDuration);
  }

  await this.save();
};

User.prototype.resetFailedLoginAttempts = async function() {
  this.failedLoginAttempts = 0;
  this.isAccountLocked = false;
  this.lockoutUntil = null;
  await this.save();
};

User.prototype.generateRefreshToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(40).toString('hex');
  this.refreshToken = token;
  this.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return token;
};

User.prototype.isRefreshTokenValid = function(token) {
  return this.refreshToken === token &&
         this.refreshTokenExpires &&
         new Date() < this.refreshTokenExpires;
};

module.exports = User;