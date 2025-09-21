const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test user credentials (you'll need to create these in your database)
const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    role: 'Master Admin'
  },
  moderator: {
    email: 'moderator@test.com',
    password: 'ModeratorPass123!',
    role: 'Content Admin'
  },
  user: {
    email: 'user@test.com',
    password: 'UserPass123!',
    role: 'Contributors'
  }
};

// Store tokens
let tokens = {};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (message) console.log(`   ${message}`);

  results.tests.push({ testName, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// Helper function to make API calls
async function apiCall(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${url}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data && (method === 'post' || method === 'put' || method === 'patch')) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test authentication
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...\n');

  // Test admin login
  const adminLogin = await apiCall('post', '/auth/login', testUsers.admin);
  if (adminLogin.success) {
    tokens.admin = adminLogin.data.token;
    logTest('Admin Login', true, `Token received: ${tokens.admin ? 'Yes' : 'No'}`);
  } else {
    logTest('Admin Login', false, `Error: ${adminLogin.error.message || 'Login failed'}`);
  }

  // Test moderator login
  const moderatorLogin = await apiCall('post', '/auth/login', testUsers.moderator);
  if (moderatorLogin.success) {
    tokens.moderator = moderatorLogin.data.token;
    logTest('Moderator Login', true);
  } else {
    logTest('Moderator Login', false, `Error: ${moderatorLogin.error.message || 'Login failed'}`);
  }

  // Test user login
  const userLogin = await apiCall('post', '/auth/login', testUsers.user);
  if (userLogin.success) {
    tokens.user = userLogin.data.token;
    logTest('User Login', true);
  } else {
    logTest('User Login', false, `Error: ${userLogin.error.message || 'Login failed'}`);
  }
}

// Test file management permissions
async function testFileManagement() {
  console.log('\n📁 Testing File Management RBAC...\n');

  // Test admin can access admin data
  const adminData = await apiCall('get', '/admin/data', null, tokens.admin);
  if (adminData.success) {
    logTest('Admin Data Access (Admin)', true, 'Admin can access admin data');
  } else {
    logTest('Admin Data Access (Admin)', false, `Error: ${adminData.error.message || 'Access denied'}`);
  }

  // Test moderator cannot access admin data
  const moderatorAdminData = await apiCall('get', '/admin/data', null, tokens.moderator);
  if (!moderatorAdminData.success && moderatorAdminData.status === 403) {
    logTest('Admin Data Access (Moderator)', true, 'Moderator correctly denied access to admin data');
  } else {
    logTest('Admin Data Access (Moderator)', false, 'Moderator should not access admin data');
  }

  // Test user cannot access admin data
  const userAdminData = await apiCall('get', '/admin/data', null, tokens.user);
  if (!userAdminData.success && userAdminData.status === 403) {
    logTest('Admin Data Access (User)', true, 'User correctly denied access to admin data');
  } else {
    logTest('Admin Data Access (User)', false, 'User should not access admin data');
  }

  // Test file listing (all roles should be able to list files)
  const adminFiles = await apiCall('get', '/files', null, tokens.admin);
  if (adminFiles.success) {
    logTest('File Listing (Admin)', true);
  } else {
    logTest('File Listing (Admin)', false, `Error: ${adminFiles.error.message || 'Failed to list files'}`);
  }

  const moderatorFiles = await apiCall('get', '/files', null, tokens.moderator);
  if (moderatorFiles.success) {
    logTest('File Listing (Moderator)', true);
  } else {
    logTest('File Listing (Moderator)', false, `Error: ${moderatorFiles.error.message || 'Failed to list files'}`);
  }

  const userFiles = await apiCall('get', '/files', null, tokens.user);
  if (userFiles.success) {
    logTest('File Listing (User)', true);
  } else {
    logTest('File Listing (User)', false, `Error: ${userFiles.error.message || 'Failed to list files'}`);
  }
}

// Test role-based file operations
async function testFileOperations() {
  console.log('\n🔧 Testing File Operations RBAC...\n');

  // Test file upload permissions
  // Note: This would require actual file data, so we'll test the endpoint access

  const testFileData = {
    filename: 'test.txt',
    originalName: 'test.txt',
    mimeType: 'text/plain',
    size: 1024,
    isPublic: true,
    description: 'Test file'
  };

  // Admin should be able to create files
  const adminFileCreate = await apiCall('post', '/files/upload', testFileData, tokens.admin);
  if (adminFileCreate.success || adminFileCreate.status === 400) { // 400 might be due to no file upload
    logTest('File Upload (Admin)', true, 'Admin has access to upload endpoint');
  } else if (adminFileCreate.status === 403) {
    logTest('File Upload (Admin)', false, 'Admin should have access to upload files');
  } else {
    logTest('File Upload (Admin)', false, `Unexpected error: ${adminFileCreate.error.message}`);
  }

  // Moderator should be able to create files
  const moderatorFileCreate = await apiCall('post', '/files/upload', testFileData, tokens.moderator);
  if (moderatorFileCreate.success || moderatorFileCreate.status === 400) {
    logTest('File Upload (Moderator)', true, 'Moderator has access to upload endpoint');
  } else if (moderatorFileCreate.status === 403) {
    logTest('File Upload (Moderator)', false, 'Moderator should have access to upload files');
  } else {
    logTest('File Upload (Moderator)', false, `Unexpected error: ${moderatorFileCreate.error.message}`);
  }

  // Regular user should NOT be able to create files
  const userFileCreate = await apiCall('post', '/files/upload', testFileData, tokens.user);
  if (!userFileCreate.success && userFileCreate.status === 403) {
    logTest('File Upload (User)', true, 'User correctly denied access to upload files');
  } else {
    logTest('File Upload (User)', false, 'User should not have access to upload files');
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...\n');

  // Test accessing protected endpoint without token
  const noTokenAccess = await apiCall('get', '/files');
  if (!noTokenAccess.success && noTokenAccess.status === 401) {
    logTest('Unauthorized Access (No Token)', true, 'Correctly denied access without token');
  } else {
    logTest('Unauthorized Access (No Token)', false, 'Should deny access without token');
  }

  // Test accessing admin endpoint with user token
  const userAdminAccess = await apiCall('get', '/admin/data', null, tokens.user);
  if (!userAdminAccess.success && userAdminAccess.status === 403) {
    logTest('Admin Access (User Token)', true, 'User correctly denied admin access');
  } else {
    logTest('Admin Access (User Token)', false, 'User should be denied admin access');
  }

  // Test invalid endpoint
  const invalidEndpoint = await apiCall('get', '/invalid-endpoint', null, tokens.admin);
  if (!invalidEndpoint.success && invalidEndpoint.status === 404) {
    logTest('Invalid Endpoint', true, 'Correctly returns 404 for invalid endpoint');
  } else {
    logTest('Invalid Endpoint', false, 'Should return 404 for invalid endpoint');
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting RBAC System Tests...\n');
  console.log('=' .repeat(50));

  try {
    await testAuthentication();
    await testFileManagement();
    await testFileOperations();
    await testErrorHandling();

    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.tests.filter(test => !test.passed).forEach(test => {
        console.log(`   - ${test.testName}: ${test.message}`);
      });
    }

    console.log('\n🎯 RBAC System Test Complete!');

  } catch (error) {
    console.error('❌ Test runner error:', error);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };