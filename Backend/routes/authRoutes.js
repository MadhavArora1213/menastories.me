const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateEmail, validatePasswordChange } = require('../middleware/validators');
const { check } = require('express-validator');

// Middleware for protecting routes
const { authMiddleware, requireRoleManager, requireUserManager } = require('../middleware/auth');

// Public routes (no authentication required)

// Register new user
router.post('/register', [
  validateEmail,
  check('name').notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  check('phoneNumber').optional().matches(/^\+[1-9]\d{1,14}$/).withMessage('Phone number must be in international format'),
  check('termsAccepted').isBoolean().custom(value => {
    if (!value) {
      throw new Error('You must accept the terms and conditions');
    }
    return true;
  }),
  check('roleId').optional().isString().withMessage('Role ID must be a valid string')
], authController.register);

// Verify email with OTP
router.post('/verify-email', [
  validateEmail,
  check('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], authController.verifyEmail);

// Login user
router.post('/login', [
  check('email').isEmail().withMessage('Please provide a valid email address'),
  check('password').notEmpty().withMessage('Password is required'),
  check('mfaCode').optional().isLength({ min: 6, max: 6 }).withMessage('MFA code must be 6 digits')
], authController.login);

// Resend OTP
router.post('/resend-otp', [
  validateEmail
], authController.resendOTP);

// Refresh access token
router.post('/refresh-token', authController.refreshToken);

// Forgot password
router.post('/forgot-password', [
  validateEmail
], authController.forgotPassword);

// Reset password
router.post('/reset-password', [
  check('token').notEmpty().withMessage('Reset token is required'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], authController.resetPassword);

// Logout user
router.post('/logout', authController.logout);

// Protected routes (authentication required)

// Get user profile
router.get('/profile', authMiddleware, authController.getUserProfile);

// Update user profile
router.put('/profile', authMiddleware, [
  check('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  check('phoneNumber').optional().matches(/^\+[1-9]\d{1,14}$/).withMessage('Phone number must be in international format'),
  check('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  check('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
], authController.updateUserProfile);

// Change password
router.put('/change-password', authMiddleware, [
  check('currentPassword').notEmpty().withMessage('Current password is required'),
  check('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], authController.changePassword);

// MFA routes

// Setup MFA (get QR code and secret)
router.post('/mfa/setup', authMiddleware, authController.setupMfa);

// Verify MFA and enable it
router.post('/mfa/verify', authMiddleware, [
  check('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], authController.verifyMfa);

// Disable MFA
router.post('/mfa/disable', authMiddleware, [
  check('password').notEmpty().withMessage('Password is required')
], authController.disableMfa);

// Admin routes (require admin privileges)

// Register user with specific role (admin only)
router.post('/admin/register', requireRoleManager, [
  validateEmail,
  check('name').notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  check('phoneNumber').optional().matches(/^\+[1-9]\d{1,14}$/).withMessage('Phone number must be in international format'),
  check('roleId').notEmpty().withMessage('Role ID is required'),
  check('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], authController.adminRegisterUser);

// Get all users (admin only)
router.get('/admin/users', requireUserManager, authController.adminGetAllUsers);

// Get user by ID (admin only)
router.get('/admin/users/:id', requireUserManager, authController.adminGetUserById);

// Update user (admin only)
router.put('/admin/users/:id', requireUserManager, [
  check('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  check('email').optional().isEmail().withMessage('Please provide a valid email address'),
  check('phoneNumber').optional().matches(/^\+[1-9]\d{1,14}$/).withMessage('Phone number must be in international format'),
  check('roleId').optional().isString().withMessage('Role ID must be a valid string'),
  check('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  check('isAccountLocked').optional().isBoolean().withMessage('isAccountLocked must be a boolean')
], authController.adminUpdateUser);

// Delete user (admin only)
router.delete('/admin/users/:id', requireRoleManager, authController.adminDeleteUser);

// Bulk update user roles (admin only)
router.post('/admin/bulk-role-update', requireRoleManager, [
  check('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
  check('roleId').notEmpty().withMessage('Role ID is required')
], authController.adminBulkUpdateRoles);

// Get role history/audit logs (admin only)
router.get('/admin/role-history', requireUserManager, authController.adminGetRoleHistory);

module.exports = router;