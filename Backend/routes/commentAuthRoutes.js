const express = require('express');
const router = express.Router();
const commentAuthController = require('../controllers/commentAuthController');

// Send OTP for comment authentication
router.post('/send-otp', commentAuthController.sendOTP);

// Verify OTP for comment authentication
router.post('/verify-otp', commentAuthController.verifyOTP);

// Check OTP status
router.get('/otp-status', commentAuthController.checkOTPStatus);

module.exports = router;