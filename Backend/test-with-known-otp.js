const axios = require('axios');

// Test event submission with the known OTP from database
async function testWithKnownOTP() {
  try {
    console.log('🎯 Testing event submission with known OTP...\n');

    // Use the OTP that was just created in the database
    const knownOTP = '999999';
    const testEmail = 'test@example.com';

    console.log(`📧 Using OTP: ${knownOTP}`);
    console.log(`📧 For email: ${testEmail}`);

    const eventData = {
      title: 'Test Event - Known OTP',
      description: 'Testing with OTP from database',
      eventType: 'conference',
      category: 'business',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      venue: {
        name: 'Test Venue',
        address: '123 Test Street',
        city: 'Test City',
        country: 'UAE'
      },
      isVirtual: false,
      capacity: 100,
      price: 50,
      currency: 'USD',
      tags: ['test', 'known-otp'],
      contactInfo: {
        email: testEmail,
        phone: '+971501234567',
        organizer: 'Test Organizer'
      },
      acceptPrivacyPolicy: true,
      acceptEventRules: true,
      captchaToken: 'test',
      otpCode: knownOTP,
      submitterEmail: testEmail,
      submitterName: 'Test User',
      email: testEmail // Also include email field for anonymous submission
    };

    console.log('📤 Submitting event...');
    const response = await axios.post('http://localhost:5000/api/events/user/submit', eventData);

    console.log('✅ SUCCESS! Event submitted successfully!');
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Event submission failed:');

    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Error:', JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 400) {
        console.log('\n🔍 Troubleshooting 400 error:');
        console.log('1. Check if OTP expired (10 minutes)');
        console.log('2. Verify OTP matches exactly:', error.response.data.error);
        console.log('3. Ensure email matches between OTP generation and verification');
        console.log('4. Check if OTP was already used');
      }
    } else {
      console.error('🚫 Network error:', error.message);
    }
  }
}

// Test OTP verification directly
async function testOTPVerification() {
  try {
    console.log('🔐 Testing OTP verification directly...\n');

    const testEmail = 'test@example.com';
    const testOTP = '999999';

    console.log(`📧 Verifying OTP: ${testOTP} for ${testEmail}`);

    // This would normally be done through the API, but let's test the service directly
    const otpService = require('./services/otpService');

    const result = await otpService.verifyEventSubmissionOTP(testEmail, testOTP);

    console.log('✅ OTP Verification Result:', result);

  } catch (error) {
    console.error('❌ OTP verification test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Testing with known OTP...\n');

  // Test 1: Direct OTP verification
  await testOTPVerification();
  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Event submission with known OTP
  await testWithKnownOTP();

  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY:');
  console.log('If the event submission succeeds, the OTP system is working correctly.');
  console.log('If it fails, there might be an issue with the API endpoint or data format.');
  console.log('=' .repeat(60));
}

runTests();