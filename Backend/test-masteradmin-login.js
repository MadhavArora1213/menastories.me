const axios = require('axios');

async function testMasterAdminLogin() {
  try {
    console.log('Testing master admin login...');

    const loginResponse = await axios.post('http://localhost:5000/api/admin/auth/login', {
      email: 'masteradmin1@magazine.com',
      password: 'MasterAdmin@123'
    }, {
      withCredentials: true
    });

    console.log('✅ Master admin login successful!');
    console.log('Login response:', loginResponse.data);

  } catch (error) {
    console.error('❌ Login test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

testMasterAdminLogin();