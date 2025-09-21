const axios = require('axios');

// Test the OTP functionality with a valid UUID
async function testOTPFix() {
  try {
    console.log('🧪 Testing OTP functionality with valid UUID...');

    // Generate a valid UUID for testing
    const testUUID = '550e8400-e29b-41d4-a716-446655440000';

    const response = await axios.post('http://localhost:5000/api/public/comments/send-otp', {
      name: 'Test User',
      email: 'test@example.com',
      articleId: testUUID
    });

    console.log('✅ OTP Request successful!');
    console.log('Response:', response.data);

  } catch (error) {
    console.log('❌ OTP Request failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Test with invalid UUID to verify validation
async function testInvalidUUID() {
  try {
    console.log('\n🧪 Testing OTP functionality with invalid UUID...');

    const response = await axios.post('http://localhost:5000/api/public/comments/send-otp', {
      name: 'Test User',
      email: 'test@example.com',
      articleId: 'invalid-uuid'
    });

    console.log('❌ This should have failed but didn\'t!');
    console.log('Response:', response.data);

  } catch (error) {
    console.log('✅ Invalid UUID correctly rejected!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// Test with the problematic value from the original error
async function testOriginalErrorValue() {
  try {
    console.log('\n🧪 Testing OTP functionality with original error value "1"...');

    const response = await axios.post('http://localhost:5000/api/public/comments/send-otp', {
      name: 'Test User',
      email: 'test@example.com',
      articleId: '1'
    });

    console.log('❌ This should have failed but didn\'t!');
    console.log('Response:', response.data);

  } catch (error) {
    console.log('✅ Original error value "1" correctly rejected!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting OTP fix tests...\n');

  await testOTPFix();
  await testInvalidUUID();
  await testOriginalErrorValue();

  console.log('\n✨ All tests completed!');
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/health');
    return true;
  } catch (error) {
    console.log('❌ Server is not running on localhost:5000');
    console.log('Please start the server first: cd Backend && npm start');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main();