// Test media upload endpoint
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testMediaUpload() {
  try {
    console.log('Testing media upload endpoint...');

    // First test if the endpoint is accessible
    console.log('1. Testing GET /api/media...');
    const getResponse = await axios.get('http://localhost:5000/api/media');
    console.log('✅ GET request successful:', getResponse.status);

    // Test POST request with minimal data
    console.log('2. Testing POST /api/media/upload with minimal data...');
    const formData = new FormData();
    formData.append('folder', 'test');
    formData.append('displayName', 'test-image');

    const postResponse = await axios.post('http://localhost:5000/api/media/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    console.log('✅ POST request successful:', postResponse.status);

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
  }
}

testMediaUpload();