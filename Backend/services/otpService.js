const { Otp } = require('../models');
const { sendOtpEmail } = require('./emailService');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to database
const saveOTP = async (identifier, type, otp) => {
  try {
    await Otp.destroy({ where: { identifier, type } });
    
    return await Otp.create({
      identifier,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
    });
  } catch (error) {
    console.error('Error saving OTP:', error);
    throw error;
  }
};

// Send email with OTP using Brevo
const sendEmailOTP = async (email, otp, purpose = 'verification') => {
  try {
    console.log(`📧 Sending ${purpose} OTP ${otp} to ${email} via Brevo`);
    const result = await sendOtpEmail(email, otp, purpose);
    console.log('📧 Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    console.error('❌ Full error details:', error);
    // Log for debugging but don't throw to continue with console fallback
    console.log(`📧 FALLBACK: Use this OTP to verify: ${otp}`);
    return false;
  }
};

// Verify OTP
const verifyOTP = async (identifier, type, providedOtp) => {
  try {
    const otpRecord = await Otp.findOne({
      where: {
        identifier,
        type,
        otp: providedOtp,
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!otpRecord) {
      return {
        verified: false,
        message: 'Invalid or expired OTP'
      };
    }

    // Delete the used OTP
    await otpRecord.destroy();

    return {
      verified: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Send OTP for event submission
const sendEventSubmissionOTP = async (email) => {
  try {
    const otp = generateOTP();
    await saveOTP(email, 'event_submission', otp);
    const emailSent = await sendEmailOTP(email, otp, 'event submission');
    if (emailSent) {
      return { success: true, message: 'OTP sent successfully' };
    } else {
      // Email failed but OTP is saved - return OTP for testing
      console.log(`📧 FALLBACK: Email failed, but OTP ${otp} saved for ${email}`);
      return { success: false, message: 'OTP saved but email failed to send.', otp };
    }
  } catch (error) {
    console.error('Error sending event submission OTP:', error);
    throw error;
  }
};

// Verify OTP for event submission
const verifyEventSubmissionOTP = async (email, providedOtp) => {
  try {
    const result = await verifyOTP(email, 'event_submission', providedOtp);
    return result;
  } catch (error) {
    console.error('Error verifying event submission OTP:', error);
    throw error;
  }
};

// Mark OTP as used (for cleanup)
const markOTPUsed = async (email, otp, type) => {
  try {
    // The verifyOTP function already deletes the OTP, so this is just for consistency
    return true;
  } catch (error) {
    console.error('Error marking OTP as used:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  saveOTP,
  sendEmailOTP,
  verifyOTP,
  sendEventSubmissionOTP,
  verifyEventSubmissionOTP,
  markOTPUsed
};