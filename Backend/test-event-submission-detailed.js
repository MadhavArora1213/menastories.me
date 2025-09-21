const axios = require('axios');

// Test event submission with detailed error logging
async function testEventSubmissionDetailed() {
  try {
    console.log('🧪 Testing event submission with detailed error logging...');

    // Test data that should pass all validations
    const testEventData = {
      title: 'Test Event for Validation',
      description: 'This is a test event to check validation errors',
      eventType: 'conference',
      category: 'business',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
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
      tags: ['test', 'validation'],
      contactInfo: {
        email: 'test@example.com',
        phone: '+971501234567',
        organizer: 'Test Organizer'
      },
      acceptPrivacyPolicy: true,
      acceptEventRules: true,
      captchaToken: 'test', // This should work in development
      otpCode: '123456', // This will likely fail - we need a real OTP
      submitterEmail: 'test@example.com',
      submitterName: 'Test User'
    };

    console.log('📤 Sending request with data:', JSON.stringify(testEventData, null, 2));

    const response = await axios.post('http://localhost:5000/api/events/user/submit', testEventData);

    console.log('✅ Event submission successful:', response.data);

  } catch (error) {
    console.error('❌ Event submission failed with detailed error:');

    if (error.response) {
      console.error('📊 Status Code:', error.response.status);
      console.error('📝 Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('📋 Response Headers:', error.response.headers);

      // Analyze the error
      if (error.response.status === 400) {
        console.log('🔍 This is a validation error. Common causes:');
        console.log('   - Missing required fields');
        console.log('   - Invalid OTP code');
        console.log('   - CAPTCHA verification failed');
        console.log('   - Email validation failed');
        console.log('   - Privacy policy not accepted');
      }
    } else if (error.request) {
      console.error('🚫 No response received. Network error:', error.request);
    } else {
      console.error('⚠️ Request setup error:', error.message);
    }

    console.error('🔧 Full error object:', error);
  }
}

// Test OTP generation first
async function testOTPGeneration() {
  try {
    console.log('🔐 Testing OTP generation...');

    const response = await axios.post('http://localhost:5000/api/events/user/submit/send-otp', {
      email: 'test@example.com'
    });

    console.log('✅ OTP generation successful:', response.data);

    // If OTP is provided in response, use it for submission test
    if (response.data.otp) {
      console.log('📧 OTP provided in response:', response.data.otp);
      return response.data.otp;
    }

  } catch (error) {
    console.error('❌ OTP generation failed:', error.response?.data || error.message);
  }

  return null;
}

// Main test function
async function runDetailedTests() {
  console.log('🚀 Starting detailed event submission tests...\n');

  // First test OTP generation
  const generatedOTP = await testOTPGeneration();
  console.log('\n' + '='.repeat(60) + '\n');

  // Then test event submission
  await testEventSubmissionDetailed();

  console.log('\n' + '='.repeat(60));
  console.log('📋 TROUBLESHOOTING TIPS:');
  console.log('1. Make sure the backend server is running on port 5000');
  console.log('2. Check if the database is properly connected');
  console.log('3. Verify that all required environment variables are set');
  console.log('4. Check the server logs for more detailed error information');
  console.log('5. Ensure the OTP service is properly configured');
  console.log('6. Verify that the email service (Brevo/Sendinblue) is working');
  console.log('=' .repeat(60));
}

runDetailedTests();