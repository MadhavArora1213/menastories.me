const axios = require('axios');

// Test complete OTP flow: generate -> verify -> submit
async function testCompleteOTPFlow() {
  try {
    console.log('🔐 Testing complete OTP flow...\n');

    // Step 1: Generate OTP
    console.log('📤 Step 1: Generating OTP...');
    const otpResponse = await axios.post('http://localhost:5000/api/events/user/submit/send-otp', {
      email: 'test@example.com'
    });

    console.log('✅ OTP Response:', otpResponse.data);

    let otpToUse = '123456'; // Default fallback

    // Check if OTP was provided in response (fallback mode)
    if (otpResponse.data.otp) {
      otpToUse = otpResponse.data.otp;
      console.log(`📧 Using provided OTP: ${otpToUse}`);
    } else {
      console.log('⚠️ No OTP provided in response, using default test OTP');
    }

    // Step 2: Immediately try to submit event with the OTP
    console.log('\n📤 Step 2: Submitting event with OTP...');

    const eventData = {
      title: 'Test Event - OTP Flow',
      description: 'Testing complete OTP verification flow',
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
      tags: ['test', 'otp'],
      contactInfo: {
        email: 'test@example.com',
        phone: '+971501234567',
        organizer: 'Test Organizer'
      },
      acceptPrivacyPolicy: true,
      acceptEventRules: true,
      captchaToken: 'test',
      otpCode: otpToUse,
      submitterEmail: 'test@example.com',
      submitterName: 'Test User'
    };

    const submitResponse = await axios.post('http://localhost:5000/api/events/user/submit', eventData);

    console.log('✅ Event submission successful!');
    console.log('📄 Response:', submitResponse.data);

  } catch (error) {
    console.error('❌ OTP flow test failed:');

    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Error:', error.response.data);

      if (error.response.status === 400) {
        console.log('\n🔍 Possible causes for 400 error:');
        console.log('1. OTP expired (10 minutes limit)');
        console.log('2. OTP already used (one-time use)');
        console.log('3. Email mismatch between generation and verification');
        console.log('4. Invalid OTP format');
        console.log('5. Database connection issues');
      }
    } else {
      console.error('🚫 Network error:', error.message);
    }
  }
}

// Test OTP generation separately
async function testOTPGenerationOnly() {
  try {
    console.log('📧 Testing OTP generation only...');

    const response = await axios.post('http://localhost:5000/api/events/user/submit/send-otp', {
      email: 'test@example.com'
    });

    console.log('✅ OTP Generation Response:', response.data);

    if (response.data.otp) {
      console.log(`🎯 OTP Generated: ${response.data.otp}`);
      console.log('💡 Use this OTP in your event submission form');
    }

  } catch (error) {
    console.error('❌ OTP generation failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting OTP flow tests...\n');

  // Test 1: OTP generation only
  await testOTPGenerationOnly();
  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Complete flow
  await testCompleteOTPFlow();

  console.log('\n' + '='.repeat(60));
  console.log('📋 RECOMMENDATIONS:');
  console.log('1. If OTP expires, generate a new one');
  console.log('2. Use the exact OTP shown in the response');
  console.log('3. Submit the event immediately after OTP generation');
  console.log('4. Check server logs for detailed error information');
  console.log('5. Ensure database is properly connected');
  console.log('=' .repeat(60));
}

runAllTests();