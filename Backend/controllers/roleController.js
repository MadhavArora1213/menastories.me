const { Role, Permission, RolePermission, Admin, User } = require('../models');
const { validationResult } = require('express-validator');
const sequelize = require('../config/db');

// Get all roles
// ]986 QS=-97X permissions and user counts
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    // Get user counts for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        try {
          const userCount = await Admin.count({ where: { roleId: role.id } });

          // Transform permissions array to rolePermissions object format expected by frontend
          const rolePermissions = {};
          if (role.permissions && role.permissions.length > 0) {
            role.permissions.forEach(permission => {
              const [resource, action] = permission.name.split('.');
              if (resource && action) {
                if (!rolePermissions[resource]) {
                  rolePermissions[resource] = [];
                }
                rolePermissions[resource].push(action);
              }
            });
          }

          const roleData = role.toJSON();
          return {
            ...roleData,
            userCount: userCount || 0,
            rolePermissions: rolePermissions,
            isAdmin: role.isAdmin,
            accessLevel: role.accessLevel,
            canManageUsers: role.canManageUsers,
            canManageRoles: role.canManageRoles
          };
        } catch (error) {
          console.error(`Error getting user count for role ${role.id}:`, error);
          const roleData = role.toJSON();
          return {
            ...roleData,
            userCount: 0,
            rolePermissions: {}
          };
        }
      })
    );

    res.status(200).json({ roles: rolesWithCounts });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        },
        {
          model: Admin,
          as: 'admins',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Transform permissions array to rolePermissions object format expected by frontend
    const rolePermissions = {};
    if (role.permissions && role.permissions.length > 0) {
      role.permissions.forEach(permission => {
        const [resource, action] = permission.name.split('.');
        if (resource && action) {
          if (!rolePermissions[resource]) {
            rolePermissions[resource] = [];
          }
          rolePermissions[resource].push(action);
        }
      });
    }

    const roleData = role.toJSON();
    const transformedRole = {
      ...roleData,
      rolePermissions: rolePermissions,
      isAdmin: role.isAdmin,
      accessLevel: role.accessLevel,
      canManageUsers: role.canManageUsers,
      canManageRoles: role.canManageRoles
    };

    res.status(200).json({ role: transformedRole });
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create role
exports.createRole = async (req, res) => {
  try {
    console.log('Create role request body:', JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, permissions, isAdmin, accessLevel, canManageUsers, canManageRoles } = req.body;
    console.log('Extracted permissions:', permissions);

    // Check if role with same name exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }

    // Create role with all fields
    const role = await Role.create({
      name,
      description,
      isAdmin: isAdmin !== undefined ? isAdmin : false,
      accessLevel: accessLevel !== undefined ? accessLevel : 1,
      canManageUsers: canManageUsers !== undefined ? canManageUsers : false,
      canManageRoles: canManageRoles !== undefined ? canManageRoles : false
    });
    
    // Assign permissions if provided
    if (permissions && permissions.length > 0) {
      const permissionNames = permissions.map(p => p.name || p);

      // Find existing permissions
      const foundPermissions = await Permission.findAll({
        where: { name: permissionNames }
      });

      let allPermissions = [...foundPermissions];

      // Create missing permissions
      const existingNames = foundPermissions.map(p => p.name);
      const missingNames = permissionNames.filter(name => !existingNames.includes(name));

      if (missingNames.length > 0) {
        console.log('Creating missing permissions:', missingNames);

        const newPermissions = [];
        for (const name of missingNames) {
          // Parse permission name to extract resource and action
          const parts = name.split('.');
          const resource = parts[0] || 'unknown';
          const action = parts[1] || 'unknown';

          const [permission] = await Permission.findOrCreate({
            where: { name },
            defaults: {
              name,
              resource,
              action,
              description: `Allows ${action} operations on ${resource}`
            }
          });
          newPermissions.push(permission);
        }

        allPermissions = [...foundPermissions, ...newPermissions];
      }

      // Create role-permission associations
      const rolePermissions = allPermissions.map(permission => ({
        roleId: role.id,
        permissionId: permission.id
      }));

      await RolePermission.bulkCreate(rolePermissions);
    }
    
    // Get role with permissions
    const roleWithPermissions = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    // Transform permissions array to rolePermissions object format expected by frontend
    const rolePermissions = {};
    if (roleWithPermissions.permissions && roleWithPermissions.permissions.length > 0) {
      roleWithPermissions.permissions.forEach(permission => {
        const [resource, action] = permission.name.split('.');
        if (resource && action) {
          if (!rolePermissions[resource]) {
            rolePermissions[resource] = [];
          }
          rolePermissions[resource].push(action);
        }
      });
    }

    const roleData = roleWithPermissions.toJSON();
    const transformedRole = {
      ...roleData,
      rolePermissions: rolePermissions,
      isAdmin: roleWithPermissions.isAdmin,
      accessLevel: roleWithPermissions.accessLevel,
      canManageUsers: roleWithPermissions.canManageUsers,
      canManageRoles: roleWithPermissions.canManageRoles
    };

    res.status(201).json({
      message: 'Role created successfully',
      role: transformedRole
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, permissions, isAdmin, accessLevel, canManageUsers, canManageRoles } = req.body;

    // Find role
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent updating Master Admin role
    if (role.name === 'Master Admin' && name !== 'Master Admin') {
      return res.status(403).json({ message: 'Cannot modify the Master Admin role name' });
    }

    // Update role with all fields
    await role.update({
      name: name || role.name,
      description: description !== undefined ? description : role.description,
      isAdmin: isAdmin !== undefined ? isAdmin : role.isAdmin,
      accessLevel: accessLevel !== undefined ? accessLevel : role.accessLevel,
      canManageUsers: canManageUsers !== undefined ? canManageUsers : role.canManageUsers,
      canManageRoles: canManageRoles !== undefined ? canManageRoles : role.canManageRoles
    });
    
    // Update permissions if provided
    if (permissions && permissions.length > 0) {
      const permissionNames = permissions.map(p => p.name || p);

      // Find existing permissions
      const foundPermissions = await Permission.findAll({
        where: { name: permissionNames }
      });

      let allPermissions = [...foundPermissions];

      // Create missing permissions
      const existingNames = foundPermissions.map(p => p.name);
      const missingNames = permissionNames.filter(name => !existingNames.includes(name));

      if (missingNames.length > 0) {
        console.log('Creating missing permissions:', missingNames);

        const newPermissions = [];
        for (const name of missingNames) {
          // Parse permission name to extract resource and action
          const parts = name.split('.');
          const resource = parts[0] || 'unknown';
          const action = parts[1] || 'unknown';

          const [permission] = await Permission.findOrCreate({
            where: { name },
            defaults: {
              name,
              resource,
              action,
              description: `Allows ${action} operations on ${resource}`
            }
          });
          newPermissions.push(permission);
        }

        allPermissions = [...foundPermissions, ...newPermissions];
      }

      // Remove existing permissions
      await RolePermission.destroy({
        where: { roleId: id }
      });

      // Create new role-permission associations
      const rolePermissions = allPermissions.map(permission => ({
        roleId: id,
        permissionId: permission.id
      }));

      await RolePermission.bulkCreate(rolePermissions);
    }
    
    // Get updated role with permissions
    const updatedRole = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    // Transform permissions array to rolePermissions object format expected by frontend
    const transformedPermissions = {};
    if (updatedRole.permissions && updatedRole.permissions.length > 0) {
      updatedRole.permissions.forEach(permission => {
        const [resource, action] = permission.name.split('.');
        if (resource && action) {
          if (!transformedPermissions[resource]) {
            transformedPermissions[resource] = [];
          }
          transformedPermissions[resource].push(action);
        }
      });
    }

    const roleData = updatedRole.toJSON();
    const transformedRole = {
      ...roleData,
      rolePermissions: transformedPermissions,
      isAdmin: updatedRole.isAdmin,
      accessLevel: updatedRole.accessLevel,
      canManageUsers: updatedRole.canManageUsers,
      canManageRoles: updatedRole.canManageRoles
    };

    res.status(200).json({
      message: 'Role updated successfully',
      role: transformedRole
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find role
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Prevent deleting Master Admin role
    if (role.name === 'Master Admin') {
      return res.status(403).json({ message: 'Cannot delete the Master Admin role' });
    }
    
    // Check if users have this role
    const usersWithRole = await Admin.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      return res.status(400).json({ message: `Cannot delete role. ${usersWithRole} users are assigned to this role.` });
    }
    
    // Delete role permissions
    await RolePermission.destroy({
      where: { roleId: id }
    });
    
    // Delete role
    await role.destroy();
    
    res.status(200).json({
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign permissions to role
exports.assignPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    // Find role
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Verify all permissions exist
    const foundPermissions = await Permission.findAll({
      where: { id: permissionIds }
    });

    if (foundPermissions.length !== permissionIds.length) {
      return res.status(400).json({ message: 'One or more permissions do not exist' });
    }

    // Create role-permission associations
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId: id,
      permissionId
    }));

    await RolePermission.bulkCreate(rolePermissions, {
      ignoreDuplicates: true
    });

    // Get updated role with permissions
    const updatedRole = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    // Transform permissions array to rolePermissions object format expected by frontend
    const transformedPermissions = {};
    if (updatedRole.permissions && updatedRole.permissions.length > 0) {
      updatedRole.permissions.forEach(permission => {
        const [resource, action] = permission.name.split('.');
        if (resource && action) {
          if (!transformedPermissions[resource]) {
            transformedPermissions[resource] = [];
          }
          transformedPermissions[resource].push(action);
        }
      });
    }

    const roleData = updatedRole.toJSON();
    const transformedRole = {
      ...roleData,
      rolePermissions: transformedPermissions
    };

    res.status(200).json({
      message: 'Permissions assigned successfully',
      role: transformedRole
    });
  } catch (error) {
    console.error('Assign permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove permissions from role
exports.removePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    // Find role
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Remove role-permission associations
    await RolePermission.destroy({
      where: {
        roleId: id,
        permissionId: permissionIds
      }
    });

    // Get updated role with permissions
    const updatedRole = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    // Transform permissions array to rolePermissions object format expected by frontend
    const transformedPermissions = {};
    if (updatedRole.permissions && updatedRole.permissions.length > 0) {
      updatedRole.permissions.forEach(permission => {
        const [resource, action] = permission.name.split('.');
        if (resource && action) {
          if (!transformedPermissions[resource]) {
            transformedPermissions[resource] = [];
          }
          transformedPermissions[resource].push(action);
        }
      });
    }

    const roleData = updatedRole.toJSON();
    const transformedRole = {
      ...roleData,
      rolePermissions: transformedPermissions
    };

    res.status(200).json({
      message: 'Permissions removed successfully',
      role: transformedRole
    });
  } catch (error) {
    console.error('Remove permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [['name', 'ASC']]
    });

    res.status(200).json({ permissions });
  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add permission to role
exports.addPermissionToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { resource, actions } = req.body;

    // Find the role
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Get or create permissions for the resource and actions
    const permissionPromises = actions.map(async (action) => {
      const permissionName = `${resource}.${action}`;
      const [permission] = await Permission.findOrCreate({
        where: { name: permissionName },
        defaults: {
          name: permissionName,
          resource: resource,
          action: action,
          description: `Allows ${action} operations on ${resource}`
        }
      });

      // Create role-permission association using Sequelize methods
      await RolePermission.findOrCreate({
        where: {
          roleId: role.id,
          permissionId: permission.id
        },
        defaults: {
          roleId: role.id,
          permissionId: permission.id
        }
      });

      return permission;
    });

    const permissions = await Promise.all(permissionPromises);

    res.status(200).json({
      message: 'Permissions added to role successfully',
      role: role.name,
      permissions: permissions.map(p => p.name)
    });
  } catch (error) {
    console.error('Error adding permissions to role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove permission from role
exports.removePermissionFromRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return res.status(400).json({ message: 'Permission IDs array is required' });
    }

    // Find the role
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Delete role-permission associations using Sequelize methods
    await RolePermission.destroy({
      where: {
        roleId: role.id,
        permissionId: permissionIds
      }
    });

    res.status(200).json({
      message: 'Permissions removed from role successfully',
      role: role.name
    });
  } catch (error) {
    console.error('Error removing permissions from role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllRoles: exports.getAllRoles,
  getRoleById: exports.getRoleById,
  createRole: exports.createRole,
  updateRole: exports.updateRole,
  deleteRole: exports.deleteRole,
  assignPermissions: exports.assignPermissions,
  removePermissions: exports.removePermissions,
  getAllPermissions: exports.getAllPermissions,
  addPermissionToRole: exports.addPermissionToRole,
  removePermissionFromRole: exports.removePermissionFromRole
};