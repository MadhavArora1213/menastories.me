const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { body } = require('express-validator');

// Newsletter subscription routes - temporarily disable validation for debugging
router.post('/subscribe', (req, res, next) => {
  console.log('=== NEWSLETTER SUBSCRIBE REQUEST ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('====================================');
  next();
}, newsletterController.subscribe);

router.post('/unsubscribe', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], newsletterController.unsubscribe);

router.post('/confirm', [
  body('token')
    .notEmpty()
    .withMessage('Confirmation token is required')
], newsletterController.confirmSubscription);

router.get('/status', newsletterController.getSubscriptionStatus);

router.put('/preferences', [
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object')
], newsletterController.updatePreferences);

// OTP routes for verification
router.post('/send-email-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], newsletterController.sendEmailOtp);

router.post('/send-phone-otp', [
  body('phoneNumber')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number with country code')
], newsletterController.sendPhoneOtp);

router.post('/verify-email-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits')
], newsletterController.verifyEmailOtp);

router.post('/verify-phone-otp', [
  body('phoneNumber')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number with country code'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits')
], newsletterController.verifyPhoneOtp);

// Token-based routes for email links
router.post('/unsubscribe/:token', [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
], newsletterController.unsubscribeWithToken);

router.put('/preferences/:token', [
  body('token')
    .notEmpty()
    .withMessage('Token is required'),
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object')
], newsletterController.updatePreferencesWithToken);

// Admin routes for newsletter management
router.get('/admin/subscribers', newsletterController.getAllSubscribers);
router.get('/admin/subscribers/:id', newsletterController.getSubscriberById);
router.put('/admin/subscribers/:id', newsletterController.updateSubscriber);
router.delete('/admin/subscribers/:id', newsletterController.deleteSubscriber);
router.post('/admin/send-newsletter', newsletterController.sendNewsletter);

module.exports = router;