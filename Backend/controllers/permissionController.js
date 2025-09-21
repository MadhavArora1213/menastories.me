const { Permission } = require('../models');
const { validationResult } = require('express-validator');

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json({ permissions });
  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get permission by ID
exports.getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    res.status(200).json({ permission });
  } catch (error) {
    console.error('Get permission by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new permission (Master Admin only)
exports.createPermission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, resource, action } = req.body;
    
    // Check if permission with this name already exists
    const existingPermission = await Permission.findOne({ 
      where: { name } 
    });
    
    if (existingPermission) {
      return res.status(400).json({ message: 'Permission with this name already exists' });
    }
    
    // Create new permission
    const permission = await Permission.create({
      name,
      description,
      resource,
      action
    });
    
    res.status(201).json({
      message: 'Permission created successfully',
      permission
    });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Update permission
exports.updatePermission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, resource, action } = req.body;
    const permissionId = req.params.id;
    
    // Check if permission exists
    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    // If name is changing, check for duplicates
    if (name && name !== permission.name) {
      const existingPermission = await Permission.findOne({ 
        where: { name } 
      });
      
      if (existingPermission) {
        return res.status(400).json({ 
          message: 'Permission with this name already exists' 
        });
      }
    }
    
    // Update permission
    await permission.update({
      name: name || permission.name,
      description: description || permission.description,
      resource: resource || permission.resource,
      action: action || permission.action
    });
    
    res.status(200).json({
      message: 'Permission updated successfully',
      permission
    });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete permission
exports.deletePermission = async (req, res) => {
  try {
    const permissionId = req.params.id;
    
    // Check if permission exists
    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    // Check if permission is being used by any role
    // This would require scanning all roles' permissions JSON
    // For now, we'll allow deletion without this check
    
    // Delete permission
    await permission.destroy();
    
    res.status(200).json({ 
      message: 'Permission deleted successfully' 
    });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllPermissions: exports.getAllPermissions,
  getPermissionById: exports.getPermissionById,
  createPermission: exports.createPermission,
  updatePermission: exports.updatePermission,
  deletePermission: exports.deletePermission
};

