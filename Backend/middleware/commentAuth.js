const jwt = require('jsonwebtoken');
const { User, CommentOTP } = require('../models');

// Comment authentication middleware
const commentAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Comment authentication token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if token is for comment authentication
    if (decoded.type !== 'comment_auth') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type for comment authentication'
      });
    }

    // Find the user by email
    const user = await User.findOne({
      where: { email: decoded.email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set user information in request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'comment_user'
    };

    // Set comment-specific information
    req.commentAuth = {
      articleId: decoded.articleId,
      tokenType: 'comment_auth'
    };

    next();
  } catch (error) {
    console.error('Comment authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid comment authentication token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Comment authentication token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Comment authentication failed',
      error: error.message
    });
  }
};

module.exports = { commentAuthMiddleware };