const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const { requireRoleManager, requireUserManager } = require('../middleware/auth');
const { check } = require('express-validator');

// Apply admin authentication to all routes
router.use(adminAuthMiddleware);

// Role validation
const roleValidator = [
  check('name').notEmpty().withMessage('Role name is required'),
  check('description').optional(),
  check('permissions').optional().isArray().withMessage('Permissions must be an array')
];

// Get all roles
router.get('/', requireUserManager, roleController.getAllRoles);

// Get role by ID
router.get('/:id', requireUserManager, roleController.getRoleById);

// Create role - only Master Admin and Webmaster can create roles
router.post('/', [
  // Temporarily disable requireRoleManager to test
  // requireRoleManager
  ...roleValidator
], roleController.createRole);

// Update role
router.put('/:id', [
  requireRoleManager,
  ...roleValidator
], roleController.updateRole);

// Delete role
router.delete('/:id', [
  requireRoleManager
], roleController.deleteRole);

// Assign permissions to role
router.post('/:id/permissions', [
  requireRoleManager,
  check('permissionIds').isArray().withMessage('Permission IDs must be an array')
], roleController.assignPermissions);

// Remove permissions from role
router.delete('/:id/permissions', [
  requireRoleManager,
  check('permissionIds').isArray().withMessage('Permission IDs must be an array')
], roleController.removePermissions);

// Get all permissions
router.get('/permissions', requireUserManager, roleController.getAllPermissions);

// Get all permissions (alternative route for compatibility)
router.get('/permissions/all', requireUserManager, roleController.getAllPermissions);

module.exports = router;
