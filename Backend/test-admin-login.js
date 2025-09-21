// Test admin login and media upload
const axios = require('axios');

async function testAdminLoginAndUpload() {
  try {
    console.log('Testing admin login and media upload...');

    // First, try to login as admin
    console.log('1. Attempting admin login...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'masteradmin1@magazine.com',
      password: 'MasterAdmin@123'
    }, {
      withCredentials: true
    });

    console.log('✅ Admin login successful!');
    console.log('Login response:', loginResponse.data);

    // Extract token from response or cookies
    const adminToken = loginResponse.data.token || loginResponse.headers['set-cookie'];

    // Now try media upload with authentication
    console.log('2. Testing media upload with authentication...');

    const formData = new FormData();
    formData.append('folder', 'test');
    formData.append('displayName', 'test-image');

    const uploadResponse = await axios.post('http://localhost:5000/api/media/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': adminToken ? `Bearer ${adminToken}` : undefined,
        'Cookie': loginResponse.headers['set-cookie']?.join('; ') || undefined
      },
      withCredentials: true
    });

    console.log('✅ Media upload successful!');
    console.log('Upload response:', uploadResponse.data);

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);

    if (error.response?.status === 401) {
      console.log('\n💡 This means you need to:');
      console.log('1. Create an admin user first, or');
      console.log('2. Login with correct admin credentials, or');
      console.log('3. Temporarily disable authentication for testing');
    }
  }
}

testAdminLoginAndUpload();