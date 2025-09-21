const jwt = require('jsonwebtoken');
const { User, Role, Admin } = require('../models');

// Main authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', expired: true });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Find user and include role
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'refreshToken', 'mfaSecret', 'passwordResetToken'] }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }
    
    // Check if account is locked
    if (user.isAccountLockedOut()) {
      return res.status(423).json({ message: 'Account is temporarily locked' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin authentication middleware
const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', expired: true });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find admin and include role
    const admin = await Admin.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password', 'mfaSecret', 'passwordResetToken'] }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    // Check if account is locked
    if (admin.isAccountLockedOut()) {
      return res.status(423).json({ message: 'Account is temporarily locked' });
    }

    // Add admin to request object
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findByPk(decoded.id, {
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password', 'refreshToken', 'mfaSecret', 'passwordResetToken'] }
        });
        
        if (user && user.isActive && !user.isAccountLockedOut()) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid or expired, continue without user
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if error
  }
};

// Role-based authorization middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!req.user.role) {
      return res.status(403).json({ message: 'No role assigned' });
    }
    
    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.user.role.name
      });
    }
    
    next();
  };
};

// Permission-based authorization middleware
const requirePermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied. No role assigned.' });
    }

    // Check if user has the required permission using the role's hasPermission method
    if (!req.user.role.hasPermission(permissionName)) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.',
        requiredPermission: permissionName,
        userRole: req.user.role.name
      });
    }

    next();
  };
};

// Admin only middleware (can manage users but not roles)
const requireAdmin = requireRole('Master Admin', 'Webmaster', 'Content Admin');

// Role management middleware (only Master Admin and Webmaster)
const requireRoleManager = requireRole('Master Admin', 'Webmaster');

// Editor and above middleware
const requireEditor = requireRole('Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors');

// Writer and above middleware
const requireWriter = requireRole('Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers');

// User management middleware (can manage users)
const requireUserManager = requireRole('Master Admin', 'Webmaster', 'Content Admin');

// Rate limiting middleware for sensitive operations
const sensitiveOperationLimit = (maxAttempts = 3, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const identifier = req.user?.id || req.ip;
    const now = Date.now();
    
    if (!attempts.has(identifier)) {
      attempts.set(identifier, []);
    }
    
    const userAttempts = attempts.get(identifier);
    
    // Clean old attempts
    const validAttempts = userAttempts.filter(attempt => now - attempt < windowMs);
    attempts.set(identifier, validAttempts);
    
    if (validAttempts.length >= maxAttempts) {
      return res.status(429).json({ 
        message: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Record this attempt
    validAttempts.push(now);
    next();
  };
};

module.exports = {
  authMiddleware,
  adminAuthMiddleware,
  optionalAuth,
  requireRole,
  requirePermission,
  requireAdmin,
  requireRoleManager,
  requireUserManager,
  requireEditor,
  requireWriter,
  sensitiveOperationLimit
};