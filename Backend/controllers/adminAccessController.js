const { Admin, Role, Permission } = require('../models');
const { getAccessibleMenuItems } = require('../middleware/rbacMiddleware');

// Get admin profile with role and permissions
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      include: [{
        model: Role,
        as: 'role',
        include: [{
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }]
      }],
      attributes: { exclude: ['password'] }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Get accessible menu items
    const permissions = admin.role?.permissions?.map(p => p.name) || [];
    const accessibleMenuItems = getAccessibleMenuItems(permissions);

    res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role?.name || 'No Role',
        accessLevel: admin.role?.accessLevel || 0,
        isAdmin: admin.role?.isAdmin || false,
        canManageUsers: admin.role?.canManageUsers || false,
        canManageRoles: admin.role?.canManageRoles || false,
        permissions: permissions,
        accessibleMenuItems: accessibleMenuItems,
        lastLoginAt: admin.lastLoginAt,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all roles with their permissions
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }],
      order: [['accessLevel', 'DESC']]
    });

    // Get user counts for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await Admin.count({ where: { roleId: role.id } });
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          accessLevel: role.accessLevel,
          isAdmin: role.isAdmin,
          canManageUsers: role.canManageUsers,
          canManageRoles: role.canManageRoles,
          permissions: role.permissions?.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            resource: p.resource,
            action: p.action
          })) || [],
          userCount
        };
      })
    );

    res.status(200).json({
      success: true,
      roles: rolesWithCounts
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const userCount = await Admin.count({ where: { roleId: role.id } });

    res.status(200).json({
      success: true,
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        accessLevel: role.accessLevel,
        isAdmin: role.isAdmin,
        canManageUsers: role.canManageUsers,
        canManageRoles: role.canManageRoles,
        permissions: role.permissions?.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          resource: p.resource,
          action: p.action
        })) || [],
        userCount
      }
    });
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });

    // Group permissions by resource
    const groupedPermissions = {};
    permissions.forEach(permission => {
      const resource = permission.resource || 'system';
      if (!groupedPermissions[resource]) {
        groupedPermissions[resource] = [];
      }
      groupedPermissions[resource].push({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action
      });
    });

    res.status(200).json({
      success: true,
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        resource: p.resource,
        action: p.action
      })),
      groupedPermissions
    });
  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check if admin has specific permission
exports.checkPermission = async (req, res) => {
  try {
    const { permission } = req.params;

    const admin = await Admin.findByPk(req.admin.id, {
      include: [{
        model: Role,
        as: 'role',
        include: [{
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }]
      }]
    });

    if (!admin || !admin.role) {
      return res.status(200).json({
        success: true,
        hasPermission: false,
        message: 'No role assigned'
      });
    }

    const hasPermission = admin.role.permissions.some(p => p.name === permission);

    res.status(200).json({
      success: true,
      hasPermission,
      permission,
      role: admin.role.name
    });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get admin access matrix (for debugging/admin purposes)
exports.getAccessMatrix = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }],
      order: [['accessLevel', 'DESC']]
    });

    const matrix = {};
    roles.forEach(role => {
      matrix[role.name] = {
        accessLevel: role.accessLevel,
        isAdmin: role.isAdmin,
        canManageUsers: role.canManageUsers,
        canManageRoles: role.canManageRoles,
        permissions: role.permissions?.map(p => p.name) || []
      };
    });

    res.status(200).json({
      success: true,
      accessMatrix: matrix,
      totalRoles: roles.length,
      totalPermissions: [...new Set(roles.flatMap(r => r.permissions?.map(p => p.name) || []))].length
    });
  } catch (error) {
    console.error('Get access matrix error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAdminProfile: exports.getAdminProfile,
  getAllRoles: exports.getAllRoles,
  getRoleById: exports.getRoleById,
  getAllPermissions: exports.getAllPermissions,
  checkPermission: exports.checkPermission,
  getAccessMatrix: exports.getAccessMatrix
};