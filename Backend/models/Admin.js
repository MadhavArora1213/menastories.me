const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Roles',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isAccountLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockoutUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  mfaEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        system: true,
        security: true
      }
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Admins',
      key: 'id'
    }
  }
}, {
  tableName: 'Admins',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['roleId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['lastLoginAt']
    }
  ],
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password && !admin.password.startsWith('$2')) {
        admin.password = await bcrypt.hash(admin.password, 12);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password') && admin.password && !admin.password.startsWith('$2')) {
        admin.password = await bcrypt.hash(admin.password, 12);
      }
    }
  }
});

// Instance methods
Admin.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

Admin.prototype.hashPassword = async function() {
  this.password = await bcrypt.hash(this.password, 12);
};

Admin.prototype.isAccountLockedOut = function() {
  if (this.lockoutUntil && this.lockoutUntil > new Date()) {
    return true;
  }
  return false;
};

Admin.prototype.recordLoginAttempt = function(success = false) {
  if (success) {
    this.loginAttempts = 0;
    this.lockoutUntil = null;
    this.lastLoginAt = new Date();
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      // Lock account for 15 minutes after 5 failed attempts
      this.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
  }
  return this.save();
};

Admin.prototype.generateMfaBackupCodes = function() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  this.mfaBackupCodes = codes;
  return this.save();
};

Admin.prototype.useMfaBackupCode = function(code) {
  const index = this.mfaBackupCodes.indexOf(code);
  if (index > -1) {
    this.mfaBackupCodes.splice(index, 1);
    return this.save();
  }
  return false;
};

Admin.prototype.getFullPermissions = function() {
  // Combine role permissions with individual admin permissions
  const rolePermissions = this.role ? this.role.rolePermissions || {} : {};
  const adminPermissions = this.permissions || {};

  return {
    ...rolePermissions,
    ...adminPermissions
  };
};

Admin.prototype.hasPermission = function(permission) {
  const permissions = this.getFullPermissions();

  // Check direct permission
  if (permissions[permission]) {
    return true;
  }

  // Check nested permissions (e.g., 'social.manage_platforms' in social: ['manage_platforms', ...])
  const permissionParts = permission.split('.');
  if (permissionParts.length >= 2) {
    const category = permissionParts[0];
    const action = permissionParts.slice(1).join('.');
    if (permissions[category] && Array.isArray(permissions[category])) {
      return permissions[category].includes(action);
    }
  }

  // Check wildcard permissions (e.g., 'content.*' covers 'content.create', 'content.edit', etc.)
  for (let i = permissionParts.length - 1; i > 0; i--) {
    const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*';
    if (permissions[wildcardPermission]) {
      return true;
    }
  }

  return false;
};

module.exports = Admin;