const jwt = require('jsonwebtoken');
const { User } = require('../models');

// User authentication middleware (for regular users, not admins)
const userAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.userToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // Allow anonymous access for event submission
      req.user = null;
      return next();
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      // Token invalid or expired, allow anonymous access
      req.user = null;
      return next();
    }

    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'mfaSecret', 'mfaBackupCodes'] }
    });

    if (!user || !user.isActive) {
      // User not found or inactive, allow anonymous access
      req.user = null;
      return next();
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('User auth middleware error:', error);
    // Allow anonymous access on error
    req.user = null;
    next();
  }
};

// Require user authentication (fail if not authenticated)
const requireUserAuth = async (req, res, next) => {
  try {
    const token = req.cookies.userToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired user token' });
    }

    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'mfaSecret', 'mfaBackupCodes'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account has been deactivated' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Require user auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional user authentication (doesn't fail if no token)
const optionalUserAuth = async (req, res, next) => {
  try {
    const token = req.cookies.userToken || req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password', 'mfaSecret', 'mfaBackupCodes'] }
        });

        if (user && user.isActive) {
          req.user = user;
        } else {
          req.user = null;
        }
      } catch (error) {
        // Token invalid or expired, continue without user
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional user auth middleware error:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  userAuthMiddleware,
  requireUserAuth,
  optionalUserAuth
};