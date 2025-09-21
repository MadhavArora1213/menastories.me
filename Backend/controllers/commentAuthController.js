const { Op } = require('sequelize');
const crypto = require('crypto');
const { User, CommentOTP, Article } = require('../models/index');

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};


// Validate UUID format
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Send OTP endpoint
exports.sendOTP = async (req, res) => {
  try {
    console.log('=== SEND OTP DEBUG ===');
    console.log('Route hit successfully!');
    console.log('Request method:', req.method);
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));

    const { name, email, articleSlug } = req.body;

    // Validate input
    if (!name || !email || !articleSlug) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Name, email, and articleSlug are required',
        received: { name: !!name, email: !!email, articleSlug: !!articleSlug }
      });
    }

    console.log('✅ Basic validation passed');
    
    // Validate articleSlug format (basic string validation)
    if (typeof articleSlug !== 'string' || articleSlug.trim().length === 0 || articleSlug.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Invalid articleSlug format.'
      });
    }

    // Look up article by slug (check both Articles and VideoArticles tables)
    let article = await Article.findOne({
      where: { slug: articleSlug.trim() },
      attributes: ['id']
    });

    // If not found in Articles, check VideoArticles
    if (!article) {
      const { VideoArticle } = require('../models/index');
      article = await VideoArticle.findOne({
        where: { slug: articleSlug.trim() },
        attributes: ['id']
      });
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const articleId = article.id;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate name
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters'
      });
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser && existingUser.verified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please use a different email or login to your account.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await CommentOTP.create({
      email: email.toLowerCase(),
      otp,
      name: name.trim(),
      articleId,
      expiresAt
    });

    // Send OTP via email
    const emailService = require('../services/emailService');
    const emailSent = await emailService.sendOtpEmail(email, otp, 'comment verification', name);

    if (emailSent) {
      res.json({
        success: true,
        message: 'OTP sent successfully to your email address'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Verify OTP endpoint
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, articleSlug } = req.body;

    // Validate input
    if (!email || !otp || !articleSlug) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and articleSlug are required'
      });
    }

    // Validate articleSlug format (basic string validation)
    if (typeof articleSlug !== 'string' || articleSlug.trim().length === 0 || articleSlug.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Invalid articleSlug format.'
      });
    }

    // Look up article by slug (check both Articles and VideoArticles tables)
    let article = await Article.findOne({
      where: { slug: articleSlug.trim() },
      attributes: ['id']
    });

    // If not found in Articles, check VideoArticles
    if (!article) {
      const { VideoArticle } = require('../models/index');
      article = await VideoArticle.findOne({
        where: { slug: articleSlug.trim() },
        attributes: ['id']
      });
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const articleId = article.id;

    // Find OTP record
    const otpRecord = await CommentOTP.findOne({
      where: {
        email: email.toLowerCase(),
        otp,
        articleId,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        email: otpRecord.email,
        name: otpRecord.name,
        articleId: article.id,
        type: 'comment_auth'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2h' }
    );

    // Update OTP record as used
    await otpRecord.update({
      used: true,
      usedAt: new Date()
    });

    // Check if user exists
    let user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Create temporary user for commenting
      user = await User.create({
        name: otpRecord.name,
        email: email.toLowerCase(),
        password: 'temp_comment_password_123', // Temporary password for comment users
        verified: true,
        role: 'commenter',
        status: 'active'
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check OTP status endpoint
exports.checkOTPStatus = async (req, res) => {
  try {
    const { email, articleSlug } = req.query;

    if (!email || !articleSlug) {
      return res.status(400).json({
        success: false,
        message: 'Email and articleSlug are required'
      });
    }

    // Validate articleSlug format (basic string validation)
    if (typeof articleSlug !== 'string' || articleSlug.trim().length === 0 || articleSlug.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Invalid articleSlug format.'
      });
    }

    // Look up article by slug (check both Articles and VideoArticles tables)
    let article = await Article.findOne({
      where: { slug: articleSlug.trim() },
      attributes: ['id']
    });

    // If not found in Articles, check VideoArticles
    if (!article) {
      const { VideoArticle } = require('../models/index');
      article = await VideoArticle.findOne({
        where: { slug: articleSlug.trim() },
        attributes: ['id']
      });
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const articleId = article.id;

    const otpRecord = await CommentOTP.findOne({
      where: {
        email: email.toLowerCase(),
        articleId,
        used: false,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    res.json({
      success: true,
      hasValidOTP: !!otpRecord,
      expiresAt: otpRecord?.expiresAt
    });
  } catch (error) {
    console.error('Check OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
