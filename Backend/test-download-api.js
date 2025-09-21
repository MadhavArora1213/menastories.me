const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testDownload = {
  title: 'Test Magazine Issue',
  description: 'A comprehensive test magazine issue for download testing',
  category: 'Magazines',
  tags: ['test', 'magazine', 'sample'],
  metaTitle: 'Test Magazine Issue - Download',
  metaDescription: 'Download our test magazine issue'
};

let authToken = '';
let createdDownloadId = '';

async function loginAsMasterAdmin() {
  try {
    console.log('🔐 Logging in as Master Admin...');
    const response = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
      email: 'admin@neonpulse.com', // Update with your actual admin email
      password: 'admin123' // Update with your actual admin password
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Successfully logged in as Master Admin');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to login:', error.response?.data?.message || error.message);
  }
  return false;
}

async function testCreateDownload() {
  try {
    console.log('📤 Testing download creation...');

    const formData = new FormData();
    formData.append('title', testDownload.title);
    formData.append('description', testDownload.description);
    formData.append('category', testDownload.category);
    formData.append('tags', JSON.stringify(testDownload.tags));
    formData.append('metaTitle', testDownload.metaTitle);
    formData.append('metaDescription', testDownload.metaDescription);

    // Create a test PDF file if it doesn't exist
    const testFilePath = path.join(__dirname, 'test-sample.pdf');
    if (!fs.existsSync(testFilePath)) {
      // Create a simple test file
      fs.writeFileSync(testFilePath, 'Test PDF content for download testing');
    }

    formData.append('file', fs.createReadStream(testFilePath), {
      filename: 'test-sample.pdf',
      contentType: 'application/pdf'
    });

    const response = await axios.post(`${API_BASE_URL}/downloads`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      createdDownloadId = response.data.data.id;
      console.log('✅ Download created successfully:', response.data.data.title);
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to create download:', error.response?.data?.message || error.message);
  }
  return false;
}

async function testGetDownloads() {
  try {
    console.log('📋 Testing download retrieval...');

    const response = await axios.get(`${API_BASE_URL}/downloads`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        status: 'published',
        limit: 10
      }
    });

    if (response.data.success) {
      console.log(`✅ Retrieved ${response.data.data.downloads.length} downloads`);
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to retrieve downloads:', error.response?.data?.message || error.message);
  }
  return false;
}

async function testUpdateDownload() {
  if (!createdDownloadId) {
    console.log('⚠️ Skipping update test - no download ID available');
    return false;
  }

  try {
    console.log('✏️ Testing download update...');

    const formData = new FormData();
    formData.append('title', 'Updated Test Magazine Issue');
    formData.append('description', 'Updated description for testing');

    const response = await axios.put(`${API_BASE_URL}/downloads/${createdDownloadId}`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      console.log('✅ Download updated successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to update download:', error.response?.data?.message || error.message);
  }
  return false;
}

async function testDownloadFile() {
  if (!createdDownloadId) {
    console.log('⚠️ Skipping download test - no download ID available');
    return false;
  }

  try {
    console.log('⬇️ Testing file download...');

    // First get the download details
    const getResponse = await axios.get(`${API_BASE_URL}/downloads/${createdDownloadId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (getResponse.data.success) {
      const download = getResponse.data.data;

      // Track the download
      await axios.post(`${API_BASE_URL}/downloads/${createdDownloadId}/track`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      console.log('✅ Download tracking successful');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to download file:', error.response?.data?.message || error.message);
  }
  return false;
}

async function testDeleteDownload() {
  if (!createdDownloadId) {
    console.log('⚠️ Skipping delete test - no download ID available');
    return false;
  }

  try {
    console.log('🗑️ Testing download deletion...');

    const response = await axios.delete(`${API_BASE_URL}/downloads/${createdDownloadId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      console.log('✅ Download deleted successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to delete download:', error.response?.data?.message || error.message);
  }
  return false;
}

async function testPublicAccess() {
  try {
    console.log('🌐 Testing public access to downloads...');

    const response = await axios.get(`${API_BASE_URL}/downloads`, {
      params: {
        status: 'published',
        limit: 5
      }
    });

    if (response.data.success) {
      console.log(`✅ Public access working - ${response.data.data.downloads.length} downloads available`);
      return true;
    }
  } catch (error) {
    console.error('❌ Public access failed:', error.response?.data?.message || error.message);
  }
  return false;
}

async function runTests() {
  console.log('🚀 Starting Download API Tests...\n');

  const results = {
    login: await loginAsMasterAdmin(),
    create: false,
    retrieve: false,
    update: false,
    download: false,
    delete: false,
    publicAccess: false
  };

  if (results.login) {
    results.create = await testCreateDownload();
    results.retrieve = await testGetDownloads();
    results.update = await testUpdateDownload();
    results.download = await testDownloadFile();
    results.delete = await testDeleteDownload();
  }

  results.publicAccess = await testPublicAccess();

  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(30));

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${test.charAt(0).toUpperCase() + test.slice(1)}`);
  });

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All tests passed! Download functionality is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
}

// Run tests
runTests().catch(console.error);