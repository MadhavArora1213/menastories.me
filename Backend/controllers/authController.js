const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const otpService = require('../services/otpService');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Rate limiting storage (in production, use Redis)
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// Helper function for rate limiting
const checkRateLimit = (identifier) => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || [];
  
  // Clean old attempts
  const validAttempts = attempts.filter(attempt => now - attempt < RATE_LIMIT_WINDOW);
  loginAttempts.set(identifier, validAttempts);
  
  return validAttempts.length < MAX_ATTEMPTS;
};

const recordAttempt = (identifier) => {
  const attempts = loginAttempts.get(identifier) || [];
  attempts.push(Date.now());
  loginAttempts.set(identifier, attempts);
};

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '48h' } // 48 hours as requested
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '30d' } // 30 days for refresh token
  );

  return { accessToken, refreshToken };
};

// Validate password strength
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  if (password.length < minLength) errors.push('Password must be at least 8 characters long');
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumbers) errors.push('Password must contain at least one number');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character');
  
  return errors;
};

// Register new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, roleId, phoneNumber, termsAccepted } = req.body;
    
    // Validate terms acceptance
    if (!termsAccepted) {
      return res.status(400).json({ message: 'You must accept the terms and conditions' });
    }
    
    // Validate password strength
    const passwordErrors = validatePasswordStrength(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: 'Password does not meet requirements', errors: passwordErrors });
    }
    
    // Rate limiting check
    if (!checkRateLimit(`register_${req.ip}`)) {
      return res.status(429).json({ message: 'Too many registration attempts. Please try again later.' });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      recordAttempt(`register_${req.ip}`);
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Validate role if provided
    let validatedRoleId = null;
    if (roleId) {
      // Check if roleId is a string name or UUID
      let role;
      if (roleId.includes('-') && roleId.length === 36) {
        // It's a UUID
        role = await Role.findByPk(roleId);
      } else {
        // It's a role name string - convert to proper format
        const roleName = roleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        role = await Role.findOne({ where: { name: roleName } });
      }

      if (!role) {
        return res.status(400).json({ message: 'Invalid role selected' });
      }

      // Check if role is allowed for public registration
      const allowedRoles = ['Contributors', 'Staff Writers'];
      if (!allowedRoles.includes(role.name)) {
        return res.status(400).json({ message: 'Role not available for public registration' });
      }
      validatedRoleId = role.id;
    } else {
      // Default to Contributors role
      const defaultRole = await Role.findOne({ where: { name: 'Contributors' } });
      validatedRoleId = defaultRole?.id;
    }
    
    // Generate OTP
    const otp = otpService.generateOTP();
    await otpService.saveOTP(email, 'registration', otp);
    await otpService.sendEmailOTP(email, otp, 'registration');
    
    // Store user with pending verification
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by the model hook
      phoneNumber,
      roleId: validatedRoleId,
      isEmailVerified: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsVersion: '1.0'
    });
    
    res.status(201).json({
      message: 'Registration started. Please verify your email.',
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify email with OTP
exports.verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;
    
    // Verify OTP
    const verification = await otpService.verifyOTP(email, 'registration', otp);
    if (!verification.verified) {
      return res.status(400).json({ message: verification.message });
    }
    
    // Update user verification status
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isEmailVerified = true;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    
    // Set JWT as cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, mfaCode } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    
    // Rate limiting check
    if (!checkRateLimit(`login_${clientIp}`)) {
      return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    }
    
    // Check if user exists
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });
    
    if (!user) {
      recordAttempt(`login_${clientIp}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if account is locked
    if (user.isAccountLockedOut()) {
      return res.status(423).json({
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated. Please contact support.' });
    }
    
    // Check password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      recordAttempt(`login_${clientIp}`);
      await user.incrementFailedLoginAttempts();
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if MFA setup is required for new users
    if (user.mfaSetupRequired) {
      return res.status(200).json({
        message: 'MFA setup required',
        requiresMfaSetup: true,
        userId: user.id
      });
    }

    // Check MFA if enabled
    if (user.isMfaEnabled) {
      if (!mfaCode) {
        return res.status(200).json({
          message: 'MFA required',
          requiresMfa: true,
          userId: user.id
        });
      }

      // Verify MFA code
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
        window: 2
      });

      if (!verified) {
        recordAttempt(`login_${clientIp}`);
        await user.incrementFailedLoginAttempts();
        return res.status(400).json({ message: 'Invalid MFA code' });
      }
    }
    
    // Reset failed login attempts on successful login
    await user.resetFailedLoginAttempts();
    
    // Update last login info
    user.lastLoginAt = new Date();
    user.lastLoginIp = clientIp;
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Save refresh token
    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();
    
    // Set tokens as HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 48 * 60 * 60 * 1000 // 48 hours
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ? {
          id: user.role.id,
          name: user.role.name
        } : null,
        isMfaEnabled: user.isMfaEnabled,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate and send new OTP
    const otp = otpService.generateOTP();
    await otpService.saveOTP(email, 'registration', otp);
    await otpService.sendEmailOTP(email, otp, 'registration');
    
    res.status(200).json({
      message: 'Verification code resent',
      email
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Find user and verify refresh token
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (user.refreshToken !== hashedToken || new Date() > user.refreshTokenExpires) {
      return res.status(401).json({ message: 'Refresh token expired or invalid' });
    }
    
    // Generate new access token
    const { accessToken } = generateTokens(user.id);
    
    // Set new access token as cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 48 * 60 * 60 * 1000 // 48 hours
    });
    
    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    
    // Rate limiting check
    if (!checkRateLimit(`forgot_${req.ip}`)) {
      return res.status(429).json({ message: 'Too many password reset attempts. Please try again later.' });
    }
    
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    // Send reset email using Brevo
    try {
      const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const { sendEmail } = require('../services/emailService');
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6;">Password Reset Request</h1>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password for your Magazine Website account.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </p>
            <p><strong>This link will expire in 10 minutes.</strong></p>
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated email from Magazine Website. Please do not reply to this email.</p>
          </div>
        </div>
      `;
      
      await sendEmail(email, 'Password Reset Request - Magazine Website', htmlContent);
      console.log(`Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Log the reset URL for development debugging
      console.log(`Password reset URL for ${email}: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`);
    }
    
    recordAttempt(`forgot_${req.ip}`);
    
    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;
    
    // Validate password strength
    const passwordErrors = validatePasswordStrength(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: 'Password does not meet requirements', errors: passwordErrors });
    }
    
    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }
    
    // Update password
    user.password = password; // Will be hashed by model hook
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshToken = null; // Invalidate all refresh tokens
    user.refreshTokenExpires = null;
    await user.save();
    
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Setup MFA
exports.setupMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      issuer: 'Magazine Website',
      name: `Magazine Website (${user.email})`,
      length: 20
    });
    
    // Save secret temporarily (user must verify before enabling)
    user.mfaSecret = secret.base32;
    await user.save();
    
    // Generate QR code with shorter data to avoid capacity issues
    let qrCodeUrl = null;
    try {
      // Try to generate QR code with full URL first
      qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    } catch (error) {
      console.warn('Full OTP URL too long for QR code, generating shorter version');
      try {
        // Fallback to just the secret key for QR code
        qrCodeUrl = await QRCode.toDataURL(secret.base32);
      } catch (fallbackError) {
        console.error('Even secret key is too long for QR code:', fallbackError);
        qrCodeUrl = null; // Will rely on manual entry
      }
    }

    res.status(200).json({
      message: 'MFA setup initiated',
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
      otpauthUrl: secret.otpauth_url // Full URL for manual entry if needed
    });
  } catch (error) {
    console.error('Setup MFA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Verify and enable MFA
exports.verifyMfa = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ message: 'MFA setup not initiated' });
    }
    
    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });
    
    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Enable MFA
    user.isMfaEnabled = true;
    user.mfaSetupRequired = false; // Mark setup as complete

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 8; i++) {
      backupCodes.push(crypto.randomBytes(5).toString('hex').toUpperCase());
    }
    user.mfaBackupCodes = backupCodes;

    await user.save();
    
    res.status(200).json({
      message: 'MFA enabled successfully',
      backupCodes
    });
  } catch (error) {
    console.error('Verify MFA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Disable MFA
exports.disableMfa = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    // Disable MFA
    user.isMfaEnabled = false;
    user.mfaSecret = null;
    user.mfaBackupCodes = [];
    await user.save();
    
    res.status(200).json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('Disable MFA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'refreshToken', 'mfaSecret', 'passwordResetToken'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role ? {
          id: user.role.id,
          name: user.role.name
        } : null,
        isMfaEnabled: user.isMfaEnabled,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        termsAccepted: user.termsAccepted,
        termsVersion: user.termsVersion,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { name, phoneNumber, bio, avatar } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (name !== undefined) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    
    await user.save();
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate new password strength
    const passwordErrors = validatePasswordStrength(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: 'New password does not meet requirements', errors: passwordErrors });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword; // Will be hashed by model hook
    user.refreshToken = null; // Invalidate all refresh tokens
    user.refreshTokenExpires = null;
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Register user with specific role (admin only)
exports.adminRegisterUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, roleId, phoneNumber, isActive = true } = req.body;

    // Validate password strength
    const passwordErrors = validatePasswordStrength(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: 'Password does not meet requirements', errors: passwordErrors });
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate role
    let validatedRoleId = null;
    if (roleId) {
      let role;
      if (roleId.includes('-') && roleId.length === 36) {
        role = await Role.findByPk(roleId);
      } else {
        const roleName = roleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        role = await Role.findOne({ where: { name: roleName } });
      }

      if (!role) {
        return res.status(400).json({ message: 'Invalid role selected' });
      }
      validatedRoleId = role.id;
    }

    // Create user (skip email verification for admin-created accounts)
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by model hook
      phoneNumber,
      roleId: validatedRoleId,
      isEmailVerified: true, // Admin-created accounts are pre-verified
      isActive,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsVersion: '1.0'
    });

    // Log admin action
    const { SecurityLog } = require('../models');
    await SecurityLog.create({
      eventType: 'user_created',
      severity: 'low',
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestData: {
        method: req.method,
        url: req.url,
        createdUserId: user.id,
        createdUserEmail: user.email
      },
      metadata: {
        adminUserId: req.user.id,
        adminUserEmail: req.user.email,
        targetUserId: user.id,
        targetUserEmail: user.email,
        assignedRole: roleId
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Admin register user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all users
exports.adminGetAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    if (role) {
      const roleRecord = await Role.findOne({ where: { name: role } });
      if (roleRecord) {
        whereClause.roleId = roleRecord.id;
      }
    }

    if (status) {
      whereClause.isActive = status === 'active';
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'refreshToken', 'mfaSecret', 'passwordResetToken'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Admin get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get user by ID
exports.adminGetUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'refreshToken', 'mfaSecret', 'passwordResetToken'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Admin get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update user
exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, roleId, isActive, isAccountLocked } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate role if provided
    if (roleId) {
      let role;
      if (roleId.includes('-') && roleId.length === 36) {
        role = await Role.findByPk(roleId);
      } else {
        const roleName = roleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        role = await Role.findOne({ where: { name: roleName } });
      }

      if (!role) {
        return res.status(400).json({ message: 'Invalid role selected' });
      }
      user.roleId = role.id;
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (isActive !== undefined) user.isActive = isActive;
    if (isAccountLocked !== undefined) {
      user.isAccountLocked = isAccountLocked;
      if (!isAccountLocked) {
        user.lockoutUntil = null;
        user.failedLoginAttempts = 0;
      }
    }

    await user.save();

    // Log admin action
    const { SecurityLog } = require('../models');
    await SecurityLog.create({
      eventType: 'user_updated',
      severity: 'low',
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestData: {
        method: req.method,
        url: req.url,
        updatedUserId: user.id
      },
      metadata: {
        adminUserId: req.user.id,
        adminUserEmail: req.user.email,
        targetUserId: user.id,
        targetUserEmail: user.email,
        changes: { name, email, phoneNumber, roleId, isActive, isAccountLocked }
      }
    });

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roleId: user.roleId,
        isActive: user.isActive,
        isAccountLocked: user.isAccountLocked
      }
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete user
exports.adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of the last Master Admin
    if (user.role && user.role.name === 'Master Admin') {
      const masterAdminCount = await User.count({
        include: [{
          model: Role,
          as: 'role',
          where: { name: 'Master Admin' }
        }]
      });

      if (masterAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last Master Admin' });
      }
    }

    await user.destroy();

    // Log admin action
    const { SecurityLog } = require('../models');
    await SecurityLog.create({
      eventType: 'user_deleted',
      severity: 'medium',
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestData: {
        method: req.method,
        url: req.url,
        deletedUserId: id
      },
      metadata: {
        adminUserId: req.user.id,
        adminUserEmail: req.user.email,
        deletedUserId: id,
        deletedUserEmail: user.email
      }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Bulk update user roles
exports.adminBulkUpdateRoles = async (req, res) => {
  try {
    const { userIds, roleId } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    // Validate role
    let role;
    if (roleId.includes('-') && roleId.length === 36) {
      role = await Role.findByPk(roleId);
    } else {
      const roleName = roleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      role = await Role.findOne({ where: { name: roleName } });
    }

    if (!role) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // Update users
    const [affectedRows] = await User.update(
      { roleId: role.id },
      { where: { id: { [require('sequelize').Op.in]: userIds } } }
    );

    // Log admin action
    const { SecurityLog } = require('../models');
    await SecurityLog.create({
      eventType: 'bulk_role_update',
      severity: 'medium',
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestData: {
        method: req.method,
        url: req.url,
        userIds,
        newRoleId: roleId
      },
      metadata: {
        adminUserId: req.user.id,
        adminUserEmail: req.user.email,
        affectedUsersCount: affectedRows,
        newRoleName: role.name,
        userIds
      }
    });

    res.json({
      message: `${affectedRows} users updated successfully`,
      affectedRows
    });
  } catch (error) {
    console.error('Admin bulk update roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get role history/audit logs
exports.adminGetRoleHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, eventType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      eventType: {
        [require('sequelize').Op.in]: ['user_created', 'user_updated', 'user_deleted', 'bulk_role_update']
      }
    };

    if (userId) {
      whereClause[require('sequelize').Op.or] = [
        { userId },
        { metadata: { [require('sequelize').Op.like]: `%"targetUserId":"${userId}"%` } }
      ];
    }

    if (eventType) {
      whereClause.eventType = eventType;
    }

    const { count, rows } = await require('../models').SecurityLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      logs: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Admin get role history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  register: exports.register,
  verifyEmail: exports.verifyEmail,
  login: exports.login,
  resendOTP: exports.resendOTP,
  logout: exports.logout,
  refreshToken: exports.refreshToken,
  forgotPassword: exports.forgotPassword,
  resetPassword: exports.resetPassword,
  setupMfa: exports.setupMfa,
  verifyMfa: exports.verifyMfa,
  disableMfa: exports.disableMfa,
  getUserProfile: exports.getUserProfile,
  updateUserProfile: exports.updateUserProfile,
  changePassword: exports.changePassword,
  adminRegisterUser: exports.adminRegisterUser,
  adminGetAllUsers: exports.adminGetAllUsers,
  adminGetUserById: exports.adminGetUserById,
  adminUpdateUser: exports.adminUpdateUser,
  adminDeleteUser: exports.adminDeleteUser,
  adminBulkUpdateRoles: exports.adminBulkUpdateRoles,
  adminGetRoleHistory: exports.adminGetRoleHistory
};
