const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin, AdminLoginLog, Role } = require('../models');
const { validationResult } = require('express-validator');

// Generate JWT token for admin
const generateAdminToken = (adminId) => {
  return jwt.sign(
    { id: adminId, type: 'admin' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );
};

// Admin login
exports.adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, mfaCode } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({
      where: { email: email.toLowerCase() },
      include: [{ model: Role, as: 'role' }]
    });

    if (!admin) {
      // Skip logging failed login attempt when admin is not found
      // This prevents null constraint violation in AdminLoginLog
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (admin.isAccountLockedOut()) {
      await AdminLoginLog.create({
        adminId: admin.id,
        action: 'failed_login',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        errorMessage: 'Account locked',
        timestamp: new Date()
      });

      return res.status(423).json({
        message: 'Account is temporarily locked due to too many failed login attempts',
        lockoutUntil: admin.lockoutUntil
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Admin account has been deactivated' });
    }

    // Verify password
    const isPasswordValid = await admin.checkPassword(password);
    if (!isPasswordValid) {
      await admin.recordLoginAttempt(false);

      await AdminLoginLog.create({
        adminId: admin.id,
        action: 'failed_login',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        errorMessage: 'Invalid password',
        timestamp: new Date()
      });

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check MFA if enabled
    if (admin.mfaEnabled) {
      if (!mfaCode) {
        return res.status(400).json({
          message: 'MFA code is required',
          mfaRequired: true
        });
      }

      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: admin.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
        window: 2 // Allow 2 time windows (30 seconds each)
      });

      if (!verified) {
        // Check backup codes
        const backupCodeUsed = await admin.useMfaBackupCode(mfaCode);
        if (!backupCodeUsed) {
          return res.status(401).json({ message: 'Invalid MFA code' });
        }
      }
    }

    // Record successful login
    await admin.recordLoginAttempt(true);

    // Generate token
    const token = generateAdminToken(admin.id);

    // Log successful login
    const loginLog = await AdminLoginLog.create({
      adminId: admin.id,
      action: 'login',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method,
      sessionId: token.substring(0, 16), // Store partial token as session ID
      timestamp: new Date()
    });

    // Parse user agent for device info
    await loginLog.parseUserAgent();

    // Set cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'strict'
    });

    res.json({
      message: 'Admin login successful',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role ? admin.role.name : null,
        permissions: admin.getFullPermissions()
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Admin auth status check
exports.adminAuthStatus = async (req, res) => {
  try {
    // Admin is already authenticated via middleware
    const admin = await Admin.findByPk(req.admin.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'mfaSecret', 'mfaBackupCodes'] }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      authenticated: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role?.name || 'admin',
        permissions: admin.getFullPermissions()
      }
    });

  } catch (error) {
    console.error('Auth status check error:', error);
    res.status(500).json({
      success: false,
      authenticated: false,
      message: 'Server error'
    });
  }
};

// Admin logout
exports.adminLogout = async (req, res) => {
  try {
    const token = req.cookies.adminToken;

    // Log logout
    if (req.admin) {
      await AdminLoginLog.create({
        adminId: req.admin.id,
        action: 'logout',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        timestamp: new Date()
      });
    }

    // Clear cookie
    res.clearCookie('adminToken');

    res.json({ message: 'Admin logout successful' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'mfaSecret', 'mfaBackupCodes'] }
    });

    res.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phoneNumber: admin.phoneNumber,
        department: admin.department,
        profileImage: admin.profileImage,
        preferences: admin.preferences,
        permissions: admin.getFullPermissions(),
        lastLoginAt: admin.lastLoginAt,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phoneNumber, department, profileImage } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (department) updateData.department = department;
    if (profileImage) updateData.profileImage = profileImage;

    updateData.updatedBy = req.admin.id;

    await req.admin.update(updateData);

    // Log profile update
    await AdminLoginLog.create({
      adminId: req.admin.id,
      action: 'profile_update',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method,
      requestData: updateData,
      timestamp: new Date()
    });

    res.json({
      message: 'Profile updated successfully',
      admin: req.admin
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change admin password
exports.changeAdminPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await req.admin.checkPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    req.admin.password = newPassword;
    await req.admin.hashPassword();

    // Log password change
    await AdminLoginLog.create({
      adminId: req.admin.id,
      action: 'password_change',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date()
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Setup MFA for admin
exports.setupAdminMfa = async (req, res) => {
  try {
    const speakeasy = require('speakeasy');
    const qrcode = require('qrcode');

    // Generate MFA secret
    const secret = speakeasy.generateSecret({
      name: `Magazine Admin (${req.admin.email})`,
      issuer: 'Magazine Website'
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan the QR code with your authenticator app'
    });
  } catch (error) {
    console.error('Setup admin MFA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify and enable MFA for admin
exports.verifyAdminMfa = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { code, secret } = req.body;
    const speakeasy = require('speakeasy');

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid MFA code' });
    }

    // Enable MFA for admin
    req.admin.mfaEnabled = true;
    req.admin.mfaSecret = secret;
    await req.admin.generateMfaBackupCodes();

    // Log MFA enable
    await AdminLoginLog.create({
      adminId: req.admin.id,
      action: 'mfa_enabled',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date()
    });

    res.json({
      message: 'MFA enabled successfully',
      backupCodes: req.admin.mfaBackupCodes
    });
  } catch (error) {
    console.error('Verify admin MFA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Disable MFA for admin
exports.disableAdminMfa = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { password } = req.body;

    // Verify password
    const isPasswordValid = await req.admin.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Disable MFA
    req.admin.mfaEnabled = false;
    req.admin.mfaSecret = null;
    req.admin.mfaBackupCodes = [];

    await req.admin.save();

    // Log MFA disable
    await AdminLoginLog.create({
      adminId: req.admin.id,
      action: 'mfa_disabled',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date()
    });

    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('Disable admin MFA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin login history
exports.getAdminLoginHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await AdminLoginLog.findAndCountAll({
      where: { adminId: req.admin.id },
      limit: parseInt(limit),
      offset,
      order: [['timestamp', 'DESC']],
      attributes: { exclude: ['requestData'] }
    });

    res.json({
      loginHistory: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get admin login history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin activity logs
exports.getAdminActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { adminId: req.admin.id };

    if (action) whereClause.action = action;
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp[require('sequelize').Op.gte] = new Date(startDate);
      if (endDate) whereClause.timestamp[require('sequelize').Op.lte] = new Date(endDate);
    }

    const { count, rows } = await AdminLoginLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['timestamp', 'DESC']]
    });

    res.json({
      activityLogs: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get admin activity logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  adminLogin: exports.adminLogin,
  adminLogout: exports.adminLogout,
  adminAuthStatus: exports.adminAuthStatus,
  getAdminProfile: exports.getAdminProfile,
  updateAdminProfile: exports.updateAdminProfile,
  changeAdminPassword: exports.changeAdminPassword,
  setupAdminMfa: exports.setupAdminMfa,
  verifyAdminMfa: exports.verifyAdminMfa,
  disableAdminMfa: exports.disableAdminMfa,
  getAdminLoginHistory: exports.getAdminLoginHistory,
  getAdminActivityLogs: exports.getAdminActivityLogs
};