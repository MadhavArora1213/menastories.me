require('dotenv').config();
const { sendEventSubmissionOTP } = require('./services/otpService');

async function testEventSubmissionOTP() {
  try {
    console.log('🧪 Testing event submission OTP service...');
    console.log('📧 BREVO_API_KEY configured:', !!process.env.BREVO_API_KEY);
    console.log('📧 BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL);

    const result = await sendEventSubmissionOTP('test@example.com');
    console.log('✅ Event submission OTP result:', result);

    if (result.success) {
      console.log('✅ OTP sent successfully via email');
    } else {
      console.log('⚠️  OTP saved but email failed - this is the fallback behavior');
      console.log('📧 OTP for testing:', result.otp);
    }

  } catch (error) {
    console.error('❌ Event submission OTP test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testEventSubmissionOTP();