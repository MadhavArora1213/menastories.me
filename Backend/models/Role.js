const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  accessLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Hierarchical access level (1-10, higher = more permissions)'
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this role has admin privileges'
  },
  canManageUsers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this role can manage other users'
  },
  canManageRoles: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this role can manage roles (Master Admin and Webmaster only)'
  },
  rolePermissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Specific permissions for this role'
  }
}, {
  hooks: {
    beforeCreate: (role) => {
      // Set default values based on role name for predefined roles
      const roleDefaults = {
        'Master Admin': {
          accessLevel: 10,
          isAdmin: true,
          canManageUsers: true,
          canManageRoles: true,
          permissions: {
            'system': true,
            'system.full_access': true,
            'system.user_management': true,
            'system.role_management': true,
            'system.site_config': true,
            'system.technical_access': true,
            'system.performance_monitoring': true,
            'system.maintenance': true,
            'content': true,
            'content.create': true,
            'content.edit': true,
            'content.delete': true,
            'content.publish': true,
            'content.moderate': true,
            'content.read': true,
            'content.view': true,
            'users': true,
            'users.view': true,
            'users.read': true,
            'users.manage_roles': true,
            'users.manage': true,
            'communication': true,
            'communication.manage': true,
            'analytics': true,
            'analytics.view': true,
            'analytics.read': true,
            'analytics.export': true,
            'security': true,
            'security.view_logs': true,
            'security.read': true,
            'security.manage': true,
            'security.manage_security': true
          }
        },
        'Webmaster': {
          accessLevel: 9,
          isAdmin: true,
          canManageUsers: true,
          canManageRoles: true,
          permissions: {
            'system': true,
            'system.technical_access': true,
            'system.performance_monitoring': true,
            'system.maintenance': true,
            'system.settings': true,
            'system.logs': true,
            'analytics': true,
            'analytics.view': true,
            'analytics.read': true,
            'analytics.export': true,
            'security': true,
            'security.view_logs': true,
            'security.read': true,
            'security.manage': true,
            'security.manage_security': true,
            'content.create': true,
            'content.edit': true,
            'content.delete': true,
            'content.publish': true,
            'users': true,
            'users.view': true,
            'users.read': true,
            'users.manage_roles': true,
            'users.manage': true
          }
        },
        'Content Admin': {
          accessLevel: 8,
          isAdmin: true,
          canManageUsers: false,
          canManageRoles: false,
          permissions: {
            'system': true,
            'system.dashboard.view': true,
            'system.settings': true,
            'content': true,
            'content.view': true,
            'content.read': true,
            'content.create': true,
            'content.edit': true,
            'content.delete': true,
            'content.publish': true,
            'content.moderate': true,
            'content.schedule': true,
            'content.approve': true,
            'content.quality_control': true,
            'analytics': true,
            'analytics.view': true,
            'analytics.read': true,
            'users': true,
            'users.view': true,
            'users.read': true,
            'users.view_content_users': true,
            'communication': true,
            'communication.manage': true
          }
        },
        'Editor-in-Chief': {
          accessLevel: 7,
          isAdmin: false,
          canManageUsers: false,
          canManageRoles: false,
          permissions: {
            'content.create': true,
            'content.edit': true,
            'content.delete': true,
            'content.publish': true,
            'content.approve': true,
            'content.quality_control': true,
            'editorial.strategy': true,
            'editorial.standards': true,
            'editorial.approvals': true
          }
        },
        'Section Editors': {
          accessLevel: 6,
          isAdmin: false,
          canManageUsers: false,
          canManageRoles: false,
          permissions: {
            'content.create': true,
            'content.edit': true,
            'content.delete': true,
            'content.publish': true,
            'content.section_oversight': true,
            'editorial.section_strategy': true,
            'editorial.writer_coordination': true
          }
        },
        'Senior Writers': {
          accessLevel: 5,
          isAdmin: false,
          canManageUsers: false,
          canManageRoles: false,
          permissions: {
            'content.create': true,
            'content.edit': true,
            'content.publish': true,
            'content.feature_articles': true,
            'content.investigative': true
          }
        },
        'Staff Writers': {
          accessLevel: 4,
          isAdmin: false,
          canManageUsers: false,
          canManageRoles: false,
          permissions: {
            'content.create': true,
            'content.edit': true,
            'content.publish': true,
            'content.daily_articles': true,
            'content.event_coverage': true
          }
        },
        'Contributors': {
          accessLevel: 3,
          isAdmin: false,
          canManageUsers: false,
          canManageRoles: false,
          permissions: {
            'content.create': true,
            'content.submit': true,
            'content.limited_edit': true
          }
        },
        'Reviewers': {
          accessLevel: 2,
          isAdmin: false,
          canManageUsers: false,
          canManageRoles: false,
          permissions: {
            'content.review': true,
            'content.fact_check': true,
            'content.quality_assurance': true,
            'content.approve': true
          }
        },
        'Social Media Manager': {
          accessLevel: 1,
          isAdmin: false,
          canManageUsers: false,
          canManageRoles: false,
          permissions: {
            'social.manage_platforms': true,
            'social.content_promotion': true,
            'social.engagement': true,
            'social.analytics': true
          }
        }
      };

      const defaults = roleDefaults[role.name];
      if (defaults) {
        // Apply predefined role defaults
        role.accessLevel = defaults.accessLevel;
        role.isAdmin = defaults.isAdmin;
        role.canManageUsers = defaults.canManageUsers;
        role.canManageRoles = defaults.canManageRoles;
        role.rolePermissions = defaults.permissions;
      } else {
        // For custom roles, set basic defaults
        role.accessLevel = role.accessLevel || 1;
        role.isAdmin = role.isAdmin !== undefined ? role.isAdmin : false;
        role.canManageUsers = role.canManageUsers !== undefined ? role.canManageUsers : false;
        role.canManageRoles = role.canManageRoles !== undefined ? role.canManageRoles : false;
        role.rolePermissions = role.rolePermissions || {};
      }
    }
  }
});

// Instance methods
Role.prototype.hasPermission = function(permission) {
  if (!this.rolePermissions) return false;

  // Check for exact permission match
  if (this.rolePermissions[permission]) {
    return true;
  }

  // Check wildcard permissions (e.g., 'content.*' covers 'content.create', 'content.edit', etc.)
  const permissionParts = permission.split('.');
  for (let i = permissionParts.length - 1; i > 0; i--) {
    const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*';
    if (this.rolePermissions[wildcardPermission]) {
      return true;
    }
  }

  // Check if user has any permission in this category (e.g., 'content.create' covers 'content')
  for (const userPerm in this.rolePermissions) {
    if (userPerm.startsWith(permission + '.')) {
      return true;
    }
  }

  return false;
};

Role.prototype.hasAnyPermission = function(permissions) {
  return permissions.some(permission => this.hasPermission(permission));
};

Role.prototype.getAllPermissions = function() {
  if (!this.rolePermissions) return [];
  return Object.keys(this.rolePermissions).filter(key => this.rolePermissions[key]);
};

module.exports = Role;