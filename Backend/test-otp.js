require('dotenv').config();
const { sendEventSubmissionOTP } = require('./services/otpService');

async function testOTP() {
  try {
    console.log('Testing OTP service...');
    const result = await sendEventSubmissionOTP('test@example.com');
    console.log('OTP Result:', result);
  } catch (error) {
    console.error('OTP Error:', error);
  }
}

testOTP();