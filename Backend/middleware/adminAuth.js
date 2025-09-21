const jwt = require('jsonwebtoken');
const { Admin, AdminLoginLog } = require('../models');

// Admin authentication middleware
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // Check for token in Authorization header first (for API requests)
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // Fallback to cookies for web requests
    if (!token) {
      token = req.cookies.adminToken;
    }

    console.log('=== ADMIN AUTH DEBUG ===');
    console.log('Authorization header:', req.header('Authorization'));
    console.log('Token from header:', token);
    console.log('Cookies:', req.cookies);
    console.log('adminToken cookie:', req.cookies.adminToken);

    if (!token) {
      console.log('No token found in header or cookies');
      // Redirect to admin login page for web requests
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Clear expired cookie
        res.clearCookie('adminToken');
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
          return res.redirect('/admin/login?expired=true');
        }
        return res.status(401).json({ message: 'Admin session expired', expired: true });
      }
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({ message: 'Invalid admin token' });
    }

    // Find admin and include role
    const admin = await Admin.findByPk(decoded.id, {
      include: [{
        model: require('../models').Role,
        as: 'role',
        attributes: ['id', 'name', 'rolePermissions']
      }],
      attributes: { exclude: ['password', 'mfaSecret'] }
    });

    if (!admin) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.redirect('/admin/login?inactive=true');
      }
      return res.status(403).json({ message: 'Admin account has been deactivated' });
    }

    // Add admin to request object
    req.admin = admin;
    console.log('Admin set in req.admin:', req.admin ? req.admin.id : 'undefined');

    // Log admin activity
    await AdminLoginLog.create({
      adminId: admin.id,
      action: 'page_access',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date()
    });

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/admin/login');
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Role-based authorization middleware for admins
const requireAdminRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    if (!req.admin.role) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.redirect('/admin/login?error=norole');
      }
      return res.status(403).json({ message: 'No admin role assigned' });
    }

    if (!roles.includes(req.admin.role.name)) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.status(403).render('admin/error', {
          title: 'Access Denied',
          message: 'You do not have permission to access this page.',
          requiredRoles: roles,
          userRole: req.admin.role.name
        });
      }
      return res.status(403).json({
        message: 'Access denied. Insufficient admin permissions.',
        requiredRoles: roles,
        userRole: req.admin.role.name
      });
    }

    next();
  };
};

// Specific role middlewares
const requireMasterAdmin = requireAdminRole('Master Admin');
const requireWebmaster = requireAdminRole('Master Admin', 'Webmaster');
const requireContentAdmin = requireAdminRole('Master Admin', 'Webmaster', 'Content Admin');
const requireEditorInChief = requireAdminRole('Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief');
const requireSectionEditor = requireAdminRole('Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors');
const requireSeniorWriter = requireAdminRole('Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Senior Writers');
const requireStaffWriter = requireAdminRole('Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers');
const requireContributor = requireAdminRole('Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers', 'Contributors');
const requireReviewer = requireAdminRole('Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers', 'Contributors', 'Reviewers');
const requireSocialMediaManager = requireAdminRole('Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers', 'Contributors', 'Reviewers', 'Social Media Manager');

// Optional admin authentication (doesn't fail if no token)
const optionalAdminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken || req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const admin = await Admin.findByPk(decoded.id, {
          include: [{
            model: require('../models').Role,
            as: 'role',
            attributes: ['id', 'name', 'rolePermissions']
          }],
          attributes: { exclude: ['password', 'mfaSecret'] }
        });

        if (admin && admin.isActive) {
          req.admin = admin;
        }
      } catch (error) {
        // Token invalid or expired, continue without admin
      }
    }

    next();
  } catch (error) {
    console.error('Optional admin auth middleware error:', error);
    next(); // Continue even if error
  }
};

module.exports = {
  adminAuthMiddleware,
  requireAdminRole,
  requireMasterAdmin,
  requireWebmaster,
  requireContentAdmin,
  requireEditorInChief,
  requireSectionEditor,
  requireSeniorWriter,
  requireStaffWriter,
  requireContributor,
  requireReviewer,
  requireSocialMediaManager,
  optionalAdminAuth
};