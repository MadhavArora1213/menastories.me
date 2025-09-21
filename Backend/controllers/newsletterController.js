const { NewsletterSubscriber, User } = require('../models');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Request body:', req.body);
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const {
      email,
      phoneNumber,
      whatsappConsent = false,
      marketingConsent = false,
      preferences = {},
      source = 'website',
      emailVerified = false,
      phoneVerified = false,
      recaptchaToken,
      termsAccepted,
      countryCode
    } = req.body;

    // Check if already subscribed
    const existingSubscriber = await NewsletterSubscriber.findOne({
      where: { email, status: 'active' }
    });

    if (existingSubscriber) {
      return res.status(400).json({
        message: 'You are already subscribed to our newsletter'
      });
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Create subscriber
    const subscriber = await NewsletterSubscriber.create({
      email,
      phoneNumber: phoneNumber || null,
      preferences: JSON.stringify(preferences),
      subscriptionSource: source,
      status: 'active', // Set to active by default for now
      confirmationToken: confirmationToken,
      unsubscribeToken: unsubscribeToken,
      gdprConsent: true,
      gdprConsentDate: new Date(),
      whatsappConsent: whatsappConsent || false,
      marketingConsent: marketingConsent || false
    });

    // Note: Confirmation email sending has been disabled
    console.log('Newsletter subscription created without email confirmation');

    const message = 'Successfully subscribed to newsletter!';

    res.status(201).json({
      message,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status
      }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Failed to subscribe to newsletter' });
  }
};

// Confirm subscription
exports.confirmSubscription = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({
      where: { confirmationToken: token, status: 'pending' }
    });

    if (!subscriber) {
      return res.status(400).json({
        message: 'Invalid or expired confirmation token'
      });
    }

    // Update subscriber status
    await subscriber.update({
      status: 'active',
      confirmedAt: new Date(),
      confirmationToken: null
    });

    // Send welcome email
    try {
      await emailService.sendNewsletterWelcome(subscriber.email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.json({
      message: 'Subscription confirmed successfully!',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status
      }
    });
  } catch (error) {
    console.error('Newsletter confirmation error:', error);
    res.status(500).json({ message: 'Failed to confirm subscription' });
  }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({
      where: { email, status: 'active' }
    });

    if (!subscriber) {
      return res.status(404).json({
        message: 'Subscriber not found'
      });
    }

    // Update status to unsubscribed
    await subscriber.update({
      status: 'unsubscribed',
      unsubscribedAt: new Date()
    });

    res.json({
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Failed to unsubscribe from newsletter' });
  }
};

// Update subscription preferences
exports.updatePreferences = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { preferences } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find subscriber by user ID or email
    const subscriber = await NewsletterSubscriber.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { userId },
          { email: req.user.email }
        ],
        status: 'active'
      }
    });

    if (!subscriber) {
      return res.status(404).json({
        message: 'Subscriber not found'
      });
    }

    // Update preferences
    await subscriber.update({
      preferences: JSON.stringify(preferences)
    });

    res.json({
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscriber = await NewsletterSubscriber.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { userId },
          { email: req.user.email }
        ]
      }
    });

    if (!subscriber) {
      return res.json({
        subscribed: false,
        status: null
      });
    }

    res.json({
      subscribed: subscriber.status === 'active',
      status: subscriber.status,
      preferences: JSON.parse(subscriber.preferences || '{}'),
      subscribedAt: subscriber.createdAt
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Failed to get subscription status' });
  }
};

// Admin: Get all subscribers
exports.getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { email: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await NewsletterSubscriber.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      subscribers: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get all subscribers error:', error);
    res.status(500).json({ message: 'Failed to get subscribers' });
  }
};

// Admin: Get subscriber by ID
exports.getSubscriberById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await NewsletterSubscriber.findByPk(id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    res.json({ subscriber });
  } catch (error) {
    console.error('Get subscriber by ID error:', error);
    res.status(500).json({ message: 'Failed to get subscriber' });
  }
};

// Admin: Update subscriber
exports.updateSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, preferences } = req.body;

    const subscriber = await NewsletterSubscriber.findByPk(id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (preferences) updateData.preferences = JSON.stringify(preferences);

    await subscriber.update(updateData);

    res.json({
      message: 'Subscriber updated successfully',
      subscriber
    });
  } catch (error) {
    console.error('Update subscriber error:', error);
    res.status(500).json({ message: 'Failed to update subscriber' });
  }
};

// Admin: Delete subscriber
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await NewsletterSubscriber.findByPk(id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    await subscriber.destroy();

    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ message: 'Failed to delete subscriber' });
  }
};

// Admin: Send newsletter
exports.sendNewsletter = async (req, res) => {
  try {
    const { subject, content, targetAudience = 'all', categories = [], tags = [] } = req.body;

    // Get active subscribers based on target audience and preferences
    let whereClause = { status: 'active' };

    if (targetAudience !== 'all') {
      // Filter by specific audience criteria
      if (targetAudience === 'category' && categories.length > 0) {
        // Find subscribers who have selected these categories in their preferences
        whereClause = {
          ...whereClause,
          [require('sequelize').Op.and]: [
            require('sequelize').literal(`JSON_EXTRACT(preferences, '$.categories') IS NOT NULL`),
            require('sequelize').literal(`JSON_OVERLAPS(JSON_EXTRACT(preferences, '$.categories'), JSON_ARRAY(${categories.map(cat => `'${cat}'`).join(',')}))`)
          ]
        };
      } else if (targetAudience === 'tag' && tags.length > 0) {
        // Find subscribers who have these tags
        whereClause.tags = {
          [require('sequelize').Op.overlap]: tags
        };
      }
    }

    const subscribers = await NewsletterSubscriber.findAll({
      where: whereClause,
      attributes: ['id', 'email', 'firstName', 'lastName', 'preferences']
    });

    // Filter subscribers based on their preferences if categories are specified
    let filteredSubscribers = subscribers;
    if (categories.length > 0 && targetAudience === 'all') {
      filteredSubscribers = subscribers.filter(subscriber => {
        const prefs = JSON.parse(subscriber.preferences || '{}');
        const subscriberCategories = prefs.categories || [];
        // Send to subscriber if they have at least one matching category or no category preferences (send all)
        return subscriberCategories.length === 0 || subscriberCategories.some(cat => categories.includes(cat));
      });
    }

    console.log(`Sending newsletter to ${filteredSubscribers.length} subscribers (filtered from ${subscribers.length})`);

    // Send newsletter to filtered subscribers
    const emailPromises = filteredSubscribers.map(subscriber => {
      // Personalize content if needed
      const personalizedContent = content.replace('{{firstName}}', subscriber.firstName || 'there');
      return emailService.sendNewsletter(subscriber.email, subject, personalizedContent, subscriber);
    });

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failureCount = results.filter(result => result.status === 'rejected').length;

    res.json({
      message: `Newsletter sent to ${successCount} subscribers successfully, ${failureCount} failed`,
      recipientCount: filteredSubscribers.length,
      successCount,
      failureCount
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({ message: 'Failed to send newsletter' });
  }
};

// Send email OTP
exports.sendEmailOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (you might want to create a separate OTP table)
    // For now, we'll use the existing Otp model
    const { Otp } = require('../models');

    // Delete any existing OTP for this email
    await Otp.destroy({ where: { identifier: email, type: 'email_verification' } });

    // Create new OTP
    await Otp.create({
      identifier: email,
      type: 'email_verification',
      otp: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP via email
    try {
      await emailService.sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send email OTP:', emailError);
      return res.status(500).json({ message: 'Failed to send email OTP' });
    }

    res.json({
      message: 'Email OTP sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ message: 'Failed to send email OTP' });
  }
};

// Send phone OTP via WhatsApp
exports.sendPhoneOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { phoneNumber } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    const { Otp } = require('../models');

    // Delete any existing OTP for this phone
    await Otp.destroy({ where: { identifier: phoneNumber, type: 'phone_verification' } });

    // Create new OTP
    await Otp.create({
      identifier: phoneNumber,
      type: 'phone_verification',
      otp: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP via WhatsApp
    try {
      const whatsappService = require('../services/whatsappService');
      const whatsappResult = await whatsappService.sendOtp(phoneNumber, otp);
      console.log('WhatsApp OTP result:', whatsappResult);
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp OTP:', whatsappError);
      // Don't fail the request, just log the error
      console.log(`[FALLBACK] WhatsApp OTP for ${phoneNumber}: ${otp}`);
    }

    res.json({
      message: 'WhatsApp OTP sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Send phone OTP error:', error);
    res.status(500).json({ message: 'Failed to send phone OTP' });
  }
};

// Verify email OTP
exports.verifyEmailOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, otp } = req.body;

    const { Otp } = require('../models');

    const otpRecord = await Otp.findOne({
      where: {
        identifier: email,
        type: 'email_verification',
        otp: otp,
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Delete the OTP after successful verification
    await otpRecord.destroy();

    res.json({
      message: 'Email verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ message: 'Failed to verify email OTP' });
  }
};

// Verify phone OTP
exports.verifyPhoneOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { phoneNumber, otp } = req.body;

    const { Otp } = require('../models');

    const otpRecord = await Otp.findOne({
      where: {
        identifier: phoneNumber,
        type: 'phone_verification',
        otp: otp,
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Delete the OTP after successful verification
    await otpRecord.destroy();

    res.json({
      message: 'Phone verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    res.status(500).json({ message: 'Failed to verify phone OTP' });
  }
};

// Unsubscribe with token (for email links)
exports.unsubscribeWithToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token } = req.params;

    const subscriber = await NewsletterSubscriber.findOne({
      where: { unsubscribeToken: token, status: 'active' }
    });

    if (!subscriber) {
      return res.status(400).json({
        message: 'Invalid or expired unsubscribe token'
      });
    }

    // Update status to unsubscribed
    await subscriber.update({
      status: 'unsubscribed',
      unsubscribedAt: new Date(),
      unsubscribeToken: null // Clear the token after use
    });

    res.json({
      message: 'Successfully unsubscribed from newsletter',
      unsubscribed: true
    });
  } catch (error) {
    console.error('Token unsubscribe error:', error);
    res.status(500).json({ message: 'Failed to unsubscribe from newsletter' });
  }
};

// Update preferences with token (for email links)
exports.updatePreferencesWithToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token } = req.params;
    const { preferences } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({
      where: { unsubscribeToken: token, status: 'active' }
    });

    if (!subscriber) {
      return res.status(400).json({
        message: 'Invalid or expired token'
      });
    }

    // Update preferences
    await subscriber.update({
      preferences: JSON.stringify(preferences)
    });

    res.json({
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Token preferences update error:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
};