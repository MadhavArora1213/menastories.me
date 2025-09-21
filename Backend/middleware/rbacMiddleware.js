const { Admin, Role, Permission } = require('../models');

// Middleware to check if user has required permission
const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Get admin from request (set by auth middleware)
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get admin with role
      const adminWithRole = await Admin.findByPk(admin.id, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!adminWithRole || !adminWithRole.role) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned to user'
        });
      }

      // Check if admin has the required permission using the model's method
      const hasPermission = adminWithRole.hasPermission(requiredPermission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${requiredPermission}`,
          requiredPermission
        });
      }

      // Add role and permissions to request for later use
      req.adminRole = adminWithRole.role;
      req.adminPermissions = adminWithRole.getFullPermissions();

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during permission check'
      });
    }
  };
};

// Middleware to check if user has any of the required permissions
const requireAnyPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const adminWithRole = await Admin.findByPk(admin.id, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!adminWithRole || !adminWithRole.role) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned to user'
        });
      }

      const hasPermission = adminWithRole.hasPermission(requiredPermissions);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required one of: ${requiredPermissions.join(', ')}`,
          requiredPermissions
        });
      }

      req.adminRole = adminWithRole.role;
      req.adminPermissions = adminWithRole.getFullPermissions();

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during permission check'
      });
    }
  };
};

// Middleware to check if user has admin privileges
const requireAdmin = (req, res, next) => {
  if (!req.admin || !req.adminRole || !req.adminRole.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
  }
  next();
};

// Middleware to check if user can manage users
const requireUserManagement = (req, res, next) => {
  if (!req.admin || !req.adminRole || !req.adminRole.canManageUsers) {
    return res.status(403).json({
      success: false,
      message: 'User management privileges required'
    });
  }
  next();
};

// Middleware to check if user can manage roles
const requireRoleManagement = (req, res, next) => {
  if (!req.admin || !req.adminRole || !req.adminRole.canManageRoles) {
    return res.status(403).json({
      success: false,
      message: 'Role management privileges required'
    });
  }
  next();
};

// File access control based on permissions
const checkFileAccess = (fileType, action = 'view') => {
  return async (req, res, next) => {
    try {
      const permissionName = `files.${fileType}.${action}`;

      if (!req.adminPermissions || !req.adminPermissions.includes(permissionName)) {
        return res.status(403).json({
          success: false,
          message: `Access denied to ${fileType} ${action}`,
          requiredPermission: permissionName
        });
      }

      next();
    } catch (error) {
      console.error('File access control error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during file access check'
      });
    }
  };
};

// Get accessible menu items based on permissions
const getAccessibleMenuItems = (permissions) => {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'dashboard',
      permission: 'system.dashboard.view'
    },
    {
      name: 'Articles',
      path: '/admin/articles',
      icon: 'article',
      permission: 'content.view'
    },
    {
      name: 'Video Articles',
      path: '/admin/video-articles',
      icon: 'video',
      permission: 'content.view'
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: 'category',
      permission: 'content.view'
    },
    {
      name: 'Authors',
      path: '/admin/authors',
      icon: 'author',
      permission: 'content.view'
    },
    {
      name: 'Media',
      path: '/admin/media',
      icon: 'media',
      permission: 'content.view'
    },
    {
      name: 'Newsletter',
      path: '/admin/newsletter',
      icon: 'newsletter',
      permission: 'content.view'
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: 'analytics',
      permission: 'analytics.view'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: 'users',
      permission: 'users.view'
    },
    {
      name: 'Roles',
      path: '/admin/roles',
      icon: 'roles',
      permission: 'system.role_management'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: 'settings',
      permission: 'system.site_config'
    },
    {
      name: 'Security',
      path: '/admin/security',
      icon: 'security',
      permission: 'security.view_logs'
    },
    {
      name: 'Technical Access',
      path: '/admin/technical-access',
      icon: 'system',
      permission: 'system.technical_access'
    },
    {
      name: 'Performance Monitoring',
      path: '/admin/performance-monitoring',
      icon: 'analytics',
      permission: 'system.performance_monitoring'
    },
    {
      name: 'Events',
      path: '/admin/events',
      icon: 'events',
      permission: 'content.view'
    },
    {
      name: 'Flipbooks',
      path: '/admin/flipbooks',
      icon: 'flipbook',
      permission: 'content.view'
    },
    {
      name: 'Downloads',
      path: '/admin/downloads',
      icon: 'download',
      permission: 'content.view'
    },
    {
      name: 'Lists',
      path: '/admin/lists',
      icon: 'list',
      permission: 'content.view'
    }
  ];

  // Filter menu items based on permissions (checking if user has the required permission)
  return menuItems.filter(item => {
    // For permissions object, check if the permission key exists and is true
    if (typeof permissions === 'object') {
      return permissions[item.permission] === true;
    }
    // For array format (backward compatibility)
    return Array.isArray(permissions) && permissions.includes(item.permission);
  });
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAdmin,
  requireUserManagement,
  requireRoleManagement,
  checkFileAccess,
  getAccessibleMenuItems
};