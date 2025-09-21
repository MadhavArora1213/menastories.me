const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function quickTest() {
  console.log('🔍 Quick Admin Login Test\n');

  try {
    // Test admin login
    console.log('Testing admin login...');
    const response = await axios.post(`${API_BASE_URL}/api/admin/auth/login`, {
      email: 'admin@echomagazine.com',
      password: 'Admin123!'
    });

    if (response.status === 200 && response.data.token) {
      console.log('✅ Admin login successful!');
      console.log('📧 Email: admin@echomagazine.com');
      console.log('🔑 Password: Admin123!');
      console.log('🎫 Token received:', response.data.token.substring(0, 20) + '...');
      return true;
    } else {
      console.log('❌ Admin login failed:', response.data.message);
      return false;
    }

  } catch (error) {
    console.log('❌ Admin login error:', error.response?.data?.message || error.message);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  quickTest().then((success) => {
    console.log('\n' + (success ? '🎉 Test completed successfully!' : '❌ Test failed!'));
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error('Test error:', error);
    process.exit(1);
  });
}

module.exports = { quickTest };