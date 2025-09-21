const { Otp } = require('./models');
const { Op } = require('sequelize');

// Test OTP verification directly
async function testOTPVerificationDirect() {
  try {
    console.log('🔐 Testing OTP verification directly...\n');

    const testEmail = 'test@example.com';
    const testOTP = '999999';

    console.log(`📧 Verifying OTP: ${testOTP} for ${testEmail}`);

    // First, check if OTP exists in database
    const existingOTP = await Otp.findOne({
      where: {
        identifier: testEmail,
        type: 'event_submission',
        otp: testOTP
      }
    });

    if (!existingOTP) {
      console.log('❌ OTP not found in database');
      return;
    }

    console.log('✅ OTP found in database:', {
      id: existingOTP.id,
      identifier: existingOTP.identifier,
      otp: existingOTP.otp,
      type: existingOTP.type,
      expiresAt: existingOTP.expiresAt,
      createdAt: existingOTP.createdAt
    });

    // Check if OTP is expired
    const now = new Date();
    const isExpired = existingOTP.expiresAt <= now;

    console.log(`⏰ Current time: ${now.toISOString()}`);
    console.log(`⏰ OTP expires: ${existingOTP.expiresAt.toISOString()}`);
    console.log(`📊 Is expired: ${isExpired}`);

    if (isExpired) {
      console.log('❌ OTP has expired');
      return;
    }

    // Now try to verify using the service
    const otpService = require('./services/otpService');

    console.log('\n🔄 Testing service verification...');
    const result = await otpService.verifyEventSubmissionOTP(testEmail, testOTP);

    console.log('📋 Service verification result:', result);

    if (result.verified) {
      console.log('✅ OTP verification successful!');
    } else {
      console.log('❌ OTP verification failed:', result.message);
    }

  } catch (error) {
    console.error('❌ Error during OTP verification test:', error);
  }
}

// Test the exact query that the controller uses
async function testControllerQuery() {
  try {
    console.log('🔍 Testing exact controller query...\n');

    const testEmail = 'test@example.com';
    const testOTP = '999999';

    console.log(`📧 Testing query for: ${testEmail} with OTP: ${testOTP}`);

    const otpRecord = await Otp.findOne({
      where: {
        identifier: testEmail,
        type: 'event_submission',
        otp: testOTP,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    if (otpRecord) {
      console.log('✅ Controller query found OTP:', {
        id: otpRecord.id,
        identifier: otpRecord.identifier,
        otp: otpRecord.otp,
        type: otpRecord.type,
        expiresAt: otpRecord.expiresAt
      });
    } else {
      console.log('❌ Controller query found no OTP');

      // Let's see what OTPs do exist
      const allOTPs = await Otp.findAll({
        where: {
          identifier: testEmail,
          type: 'event_submission'
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      console.log('📋 Existing OTPs for this email:');
      allOTPs.forEach((otp, index) => {
        console.log(`${index + 1}. OTP: ${otp.otp}, Expires: ${otp.expiresAt}, Expired: ${otp.expiresAt <= new Date()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error during controller query test:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Testing OTP verification...\n');

  await testOTPVerificationDirect();
  console.log('\n' + '='.repeat(60) + '\n');

  await testControllerQuery();

  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY:');
  console.log('If the OTP verification works, the issue is in the event submission endpoint.');
  console.log('If it fails, there might be a database or service issue.');
  console.log('=' .repeat(60));
}

runTests();