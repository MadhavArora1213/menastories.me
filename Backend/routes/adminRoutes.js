const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const adminAuthController = require('../controllers/adminAuthController');
const adminUserController = require('../controllers/adminUserController');
const roleController = require('../controllers/roleController');
const permissionController = require('../controllers/permissionController');
const adminController = require('../controllers/adminController');
const adminUserTrackingController = require('../controllers/adminUserTrackingController');
const commentController = require('../controllers/commentController');
const pdfController = require('../controllers/pdfController');
const { adminAuthMiddleware, requireAdminRole } = require('../middleware/adminAuth');

// Admin login route (public access)
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').notEmpty()
], adminAuthController.adminLogin);

// Debug: log available controller functions
console.log('adminUserController keys:', Object.keys(adminUserController));

// Start with Admin user management routes (Master Admin only)
router.post('/users', [
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 8 or more characters').isLength({ min: 8 }),
  check('name', 'Name is required').notEmpty(),
  check('roleId', 'Role ID is required').notEmpty()
], adminUserController.createAdmin);

// Make sure getAllAdmins exists before using it
if (typeof adminUserController.getAllAdmins === 'function') {
  console.log('Registering GET /users route');
  router.get('/users', adminAuthMiddleware, requireAdminRole('Master Admin'), adminUserController.getAllAdmins);
} else {
  throw new Error('adminUserController.getAllAdmins is undefined! Check your adminUserController export.');
}

router.get('/users/:id',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  adminUserController.getAdminById
);

router.put('/users/:id', [
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  check('email', 'Please include a valid email').optional().isEmail(),
  check('name', 'Name cannot be empty').optional().notEmpty()
], adminUserController.updateAdmin);

router.put('/users/:id/password', [
  adminAuthMiddleware,
  check('newPassword', 'New password must be 8 or more characters').isLength({ min: 8 })
], adminUserController.updatePassword);

router.delete('/users/:id',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  adminUserController.deleteAdmin
);

// Role management routes (Master Admin only)
router.get('/roles',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  roleController.getAllRoles
);

router.get('/roles/:id',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  roleController.getRoleById
);

router.post('/roles', [
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  check('name', 'Role name is required').notEmpty(),
  check('permissions', 'Permissions array is required').isArray()
], roleController.createRole);

router.put('/roles/:id', [
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  check('name', 'Role name cannot be empty').optional().notEmpty(),
  check('permissions', 'Permissions must be an array').optional().isArray()
], roleController.updateRole);

router.delete('/roles/:id',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  roleController.deleteRole
);

// Permission management routes (Master Admin only)
router.get('/permissions',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  permissionController.getAllPermissions
);

router.get('/permissions/:id',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  permissionController.getPermissionById
);

router.post('/permissions', [
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  check('name', 'Permission name is required').notEmpty(),
  check('resource', 'Resource name is required').notEmpty(),
  check('action', 'Action is required').notEmpty()
], permissionController.createPermission);

router.put('/permissions/:id', [
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  check('name', 'Permission name cannot be empty').optional().notEmpty(),
  check('resource', 'Resource name cannot be empty').optional().notEmpty(),
  check('action', 'Action cannot be empty').optional().notEmpty()
], permissionController.updatePermission);

router.delete('/permissions/:id',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  permissionController.deletePermission
);

// Enhanced role permission management
router.post('/roles/:id/permissions', [
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  check('resource', 'Resource name is required').notEmpty(),
  check('actions', 'Actions array is required').isArray()
], roleController.addPermissionToRole);

router.delete('/roles/:id/permissions', [
  adminAuthMiddleware,
  requireAdminRole('Master Admin')
], roleController.removePermissionFromRole);

// User Tracking and Analytics Routes
router.get('/user-stats',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  adminUserTrackingController.getUserStats
);

router.get('/top-users',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  adminUserTrackingController.getTopUsers
);

router.get('/recent-activity',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  adminUserTrackingController.getRecentActivity
);

router.get('/engagement-metrics',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  adminUserTrackingController.getEngagementMetrics
);

router.get('/user-streaks',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  adminUserTrackingController.getUserStreaks
);

router.get('/newsletter-stats',
  adminAuthMiddleware,
  requireAdminRole('Master Admin'),
  adminUserTrackingController.getNewsletterStats
);

// Comment Moderation Routes
router.get('/comments',
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin'),
  commentController.getCommentsForAdmin
);

router.get('/comments/stats',
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin'),
  commentController.getCommentStats
);

router.get('/comments/:id',
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin'),
  commentController.getCommentDetails
);

router.put('/comments/:id/moderate', [
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin'),
  check('action', 'Action is required').isIn(['approve', 'reject', 'spam', 'pending'])
], commentController.moderateComment);

router.post('/comments/bulk-moderate', [
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin'),
  check('commentIds', 'Comment IDs array is required').isArray(),
  check('action', 'Action is required').isIn(['approve', 'reject', 'spam', 'pending'])
], commentController.bulkModerateComments);

router.delete('/comments/:id',
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin'),
  commentController.deleteComment
);

router.get('/comments/reports',
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin'),
  commentController.getRecentReports
);

// PDF Generation Routes
router.post('/pdf/article', [
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin'),
  check('articleId', 'Article ID is required').notEmpty()
], pdfController.generateArticlePDF);

router.post('/pdf/comment-report', [
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin')
], pdfController.generateCommentReportPDF);

router.post('/pdf/report', [
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin'),
  check('title', 'Report title is required').notEmpty(),
  check('sections', 'Report sections are required').isArray()
], pdfController.generateCustomReportPDF);

router.post('/pdf/analytics', [
  adminAuthMiddleware,
  requireAdminRole('Content Moderator', 'Master Admin')
], pdfController.generateAnalyticsReportPDF);

// Admin Data Access Route (Admin only)
router.get('/data',
  adminAuthMiddleware,
  requireAdminRole('Master Admin', 'Webmaster', 'Content Admin'),
  adminController.getAdminData
);

// Get accessible menu items for current admin
router.get('/menu',
  adminAuthMiddleware,
  adminController.getMenuItems
);

// Technical Access Routes (Webmaster and Master Admin only)
router.get('/technical-access',
  adminAuthMiddleware,
  adminController.getTechnicalAccess
);

// Performance Monitoring Routes (Webmaster and Master Admin only)
router.get('/performance-monitoring',
  adminAuthMiddleware,
  adminController.getPerformanceMonitoring
);

module.exports = router;