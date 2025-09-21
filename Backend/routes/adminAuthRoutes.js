const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { check } = require('express-validator');
const { adminAuthMiddleware } = require('../middleware/adminAuth');

// Admin login route
router.post('/login', [
  check('email').isEmail().withMessage('Please provide a valid email address'),
  check('password').notEmpty().withMessage('Password is required'),
  check('mfaCode').optional().isLength({ min: 6, max: 6 }).withMessage('MFA code must be 6 digits')
], adminAuthController.adminLogin);

// Admin logout route
router.post('/logout', adminAuthMiddleware, adminAuthController.adminLogout);

// Get current admin profile
router.get('/profile', adminAuthMiddleware, adminAuthController.getAdminProfile);

// Update admin profile
router.put('/profile', adminAuthMiddleware, [
  check('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  check('email').optional().isEmail().withMessage('Please provide a valid email address')
], adminAuthController.updateAdminProfile);

// Change admin password
router.put('/change-password', adminAuthMiddleware, [
  check('currentPassword').notEmpty().withMessage('Current password is required'),
  check('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], adminAuthController.changeAdminPassword);

// MFA setup for admin
router.post('/mfa/setup', adminAuthMiddleware, adminAuthController.setupAdminMfa);

// MFA verification for admin
router.post('/mfa/verify', adminAuthMiddleware, [
  check('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], adminAuthController.verifyAdminMfa);

// Disable MFA for admin
router.post('/mfa/disable', adminAuthMiddleware, [
  check('password').notEmpty().withMessage('Password is required')
], adminAuthController.disableAdminMfa);

// Get admin login history
router.get('/login-history', adminAuthMiddleware, adminAuthController.getAdminLoginHistory);

// Get admin activity logs
router.get('/activity-logs', adminAuthMiddleware, adminAuthController.getAdminActivityLogs);

// Add route to check authentication status
router.get('/status', async (req, res) => {
  try {
    const token = req.cookies.adminToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        authenticated: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      res.clearCookie('adminToken');
      return res.status(401).json({
        authenticated: false,
        message: 'Invalid or expired token'
      });
    }

    // Find admin and include role
    const { Admin, Role } = require('../models');
    const admin = await Admin.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'mfaSecret', 'mfaBackupCodes'] }
    });

    if (!admin || !admin.isActive) {
      res.clearCookie('adminToken');
      return res.status(401).json({
        authenticated: false,
        message: 'Admin not found or inactive'
      });
    }

    res.json({
      authenticated: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role ? admin.role.name : null,
        permissions: admin.getFullPermissions(),
        lastLoginAt: admin.lastLoginAt,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error('Auth status check error:', error);
    res.status(500).json({
      authenticated: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
