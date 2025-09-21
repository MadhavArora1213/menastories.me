const axios = require('axios');

// Test event submission endpoint
async function testEventSubmission() {
  try {
    console.log('🧪 Testing event submission endpoint...');

    const testEventData = {
      title: 'Test Event',
      description: 'This is a test event for verification',
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
      tags: ['test', 'event'],
      contactInfo: {
        email: 'test@example.com',
        phone: '+971501234567',
        organizer: 'Test Organizer'
      },
      acceptPrivacyPolicy: true,
      acceptEventRules: true,
      captchaToken: 'test',
      otpCode: '123456', // This will fail because we need a real OTP
      submitterEmail: 'test@example.com',
      submitterName: 'Test User'
    };

    const response = await axios.post('http://localhost:5000/api/events/user/submit', testEventData);

    console.log('✅ Event submission test response:', response.data);

  } catch (error) {
    console.error('❌ Event submission test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test OTP sending endpoint
async function testOTPSending() {
  try {
    console.log('🧪 Testing OTP sending endpoint...');

    const response = await axios.post('http://localhost:5000/api/events/user/submit/send-otp', {
      email: 'test@example.com'
    });

    console.log('✅ OTP sending test response:', response.data);

  } catch (error) {
    console.error('❌ OTP sending test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting event submission tests...\n');

  await testOTPSending();
  console.log('\n' + '='.repeat(50) + '\n');

  // Note: Event submission test will fail without proper OTP, but that's expected
  await testEventSubmission();
}

runTests();