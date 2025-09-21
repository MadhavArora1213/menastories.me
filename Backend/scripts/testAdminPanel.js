const axios = require('axios');
const { sequelize } = require('../models');

const API_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  adminCredentials: {
    email: 'admin@echomagazine.com',
    password: 'Admin123!'
  },
  testUser: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'Test123!',
    role: 'author'
  }
};

class AdminPanelTester {
  constructor() {
    this.adminToken = null;
    this.testUserId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response;
    } catch (error) {
      return error.response || { status: 500, data: { message: error.message } };
    }
  }

  async testAdminAuthentication() {
    this.log('Testing Admin Authentication...', 'info');

    // Test admin login
    const loginResponse = await this.makeRequest('POST', '/api/admin/auth/login', testConfig.adminCredentials);

    if (loginResponse.status === 200 && loginResponse.data.token) {
      this.adminToken = loginResponse.data.token;
      this.log('✅ Admin login successful', 'success');
      return true;
    } else {
      this.log(`❌ Admin login failed: ${loginResponse.data.message}`, 'error');
      return false;
    }
  }

  async testUserManagement() {
    this.log('Testing User Management...', 'info');

    // Create test user
    const createResponse = await this.makeRequest('POST', '/admin/users', {
      ...testConfig.testUser,
      roleId: 3 // author role
    }, this.adminToken);

    if (createResponse.status === 201) {
      this.testUserId = createResponse.data.user.id;
      this.log('✅ User creation successful', 'success');
    } else {
      this.log(`❌ User creation failed: ${createResponse.data.message}`, 'error');
      return false;
    }

    // Get all users
    const getUsersResponse = await this.makeRequest('GET', '/api/admin/users', null, this.adminToken);
    if (getUsersResponse.status === 200) {
      this.log(`✅ Retrieved ${getUsersResponse.data.users.length} users`, 'success');
    } else {
      this.log(`❌ Get users failed: ${getUsersResponse.data.message}`, 'error');
    }

    // Update user
    const updateResponse = await this.makeRequest('PUT', `/admin/users/${this.testUserId}`, {
      firstName: 'Updated',
      lastName: 'TestUser'
    }, this.adminToken);

    if (updateResponse.status === 200) {
      this.log('✅ User update successful', 'success');
    } else {
      this.log(`❌ User update failed: ${updateResponse.data.message}`, 'error');
    }

    return true;
  }

  async testCategoryManagement() {
    this.log('Testing Category Management...', 'info');

    // Create test category
    const createResponse = await this.makeRequest('POST', '/api/categories', {
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test category for admin panel testing',
      status: 'active'
    }, this.adminToken);

    let categoryId;
    if (createResponse.status === 201) {
      categoryId = createResponse.data.category.id;
      this.log('✅ Category creation successful', 'success');
    } else {
      this.log(`❌ Category creation failed: ${createResponse.data.message}`, 'error');
      return false;
    }

    // Get all categories
    const getCategoriesResponse = await this.makeRequest('GET', '/api/categories', null, this.adminToken);
    if (getCategoriesResponse.status === 200) {
      this.log(`✅ Retrieved ${getCategoriesResponse.data.categories.length} categories`, 'success');
    } else {
      this.log(`❌ Get categories failed: ${getCategoriesResponse.data.message}`, 'error');
    }

    // Update category
    const updateResponse = await this.makeRequest('PUT', `/api/categories/${categoryId}`, {
      name: 'Updated Test Category',
      description: 'Updated test category description'
    }, this.adminToken);

    if (updateResponse.status === 200) {
      this.log('✅ Category update successful', 'success');
    } else {
      this.log(`❌ Category update failed: ${updateResponse.data.message}`, 'error');
    }

    // Delete category
    const deleteResponse = await this.makeRequest('DELETE', `/api/categories/${categoryId}`, null, this.adminToken);
    if (deleteResponse.status === 200) {
      this.log('✅ Category deletion successful', 'success');
    } else {
      this.log(`❌ Category deletion failed: ${deleteResponse.data.message}`, 'error');
    }

    return true;
  }

  async testTagManagement() {
    this.log('Testing Tag Management...', 'info');

    // Create test tag
    const createResponse = await this.makeRequest('POST', '/api/tags', {
      name: 'Test Tag',
      slug: 'test-tag',
      description: 'Test tag for admin panel testing',
      color: '#3b82f6',
      category: 'general'
    }, this.adminToken);

    let tagId;
    if (createResponse.status === 201) {
      tagId = createResponse.data.tag.id;
      this.log('✅ Tag creation successful', 'success');
    } else {
      this.log(`❌ Tag creation failed: ${createResponse.data.message}`, 'error');
      return false;
    }

    // Get all tags
    const getTagsResponse = await this.makeRequest('GET', '/api/tags', null, this.adminToken);
    if (getTagsResponse.status === 200) {
      this.log(`✅ Retrieved ${getTagsResponse.data.tags.length} tags`, 'success');
    } else {
      this.log(`❌ Get tags failed: ${getTagsResponse.data.message}`, 'error');
    }

    // Update tag
    const updateResponse = await this.makeRequest('PUT', `/api/tags/${tagId}`, {
      name: 'Updated Test Tag',
      description: 'Updated test tag description',
      color: '#ef4444'
    }, this.adminToken);

    if (updateResponse.status === 200) {
      this.log('✅ Tag update successful', 'success');
    } else {
      this.log(`❌ Tag update failed: ${updateResponse.data.message}`, 'error');
    }

    // Delete tag
    const deleteResponse = await this.makeRequest('DELETE', `/api/tags/${tagId}`, null, this.adminToken);
    if (deleteResponse.status === 200) {
      this.log('✅ Tag deletion successful', 'success');
    } else {
      this.log(`❌ Tag deletion failed: ${deleteResponse.data.message}`, 'error');
    }

    return true;
  }

  async testNewsletterSystem() {
    this.log('Testing Newsletter System...', 'info');

    // Test newsletter subscription
    const subscribeResponse = await this.makeRequest('POST', '/api/newsletter/subscribe', {
      email: 'newsletter-test@example.com',
      firstName: 'Newsletter',
      lastName: 'Test',
      preferences: {
        frequency: 'weekly',
        categories: ['Technology'],
        contentTypes: ['articles']
      }
    });

    if (subscribeResponse.status === 201) {
      this.log('✅ Newsletter subscription successful', 'success');
    } else {
      this.log(`❌ Newsletter subscription failed: ${subscribeResponse.data.message}`, 'error');
    }

    // Test newsletter sending (admin only)
    const sendResponse = await this.makeRequest('POST', '/api/admin/newsletter/send', {
      subject: 'Test Newsletter',
      content: '<h1>Test Newsletter Content</h1><p>This is a test newsletter.</p>',
      categories: ['Technology']
    }, this.adminToken);

    if (sendResponse.status === 200) {
      this.log(`✅ Newsletter sent to ${sendResponse.data.recipientCount} subscribers`, 'success');
    } else {
      this.log(`❌ Newsletter sending failed: ${sendResponse.data.message}`, 'error');
    }

    return true;
  }

  async testSecurityFeatures() {
    this.log('Testing Security Features...', 'info');

    // Test invalid login attempts
    const invalidLoginResponse = await this.makeRequest('POST', '/admin/auth/login', {
      email: 'admin@echomagazine.com',
      password: 'wrongpassword'
    });

    if (invalidLoginResponse.status === 401) {
      this.log('✅ Invalid login properly rejected', 'success');
    } else {
      this.log('❌ Invalid login not properly rejected', 'warning');
    }

    // Test admin profile access
    const profileResponse = await this.makeRequest('GET', '/admin/auth/profile', null, this.adminToken);
    if (profileResponse.status === 200) {
      this.log('✅ Admin profile access successful', 'success');
    } else {
      this.log(`❌ Admin profile access failed: ${profileResponse.data.message}`, 'error');
    }

    return true;
  }

  async cleanup() {
    this.log('Cleaning up test data...', 'info');

    // Delete test user if created
    if (this.testUserId) {
      const deleteResponse = await this.makeRequest('DELETE', `/admin/users/${this.testUserId}`, null, this.adminToken);
      if (deleteResponse.status === 200) {
        this.log('✅ Test user cleanup successful', 'success');
      } else {
        this.log(`❌ Test user cleanup failed: ${deleteResponse.data.message}`, 'warning');
      }
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Admin Panel Functionality Tests', 'info');
    this.log('=' .repeat(50), 'info');

    try {
      // Test authentication
      const authSuccess = await this.testAdminAuthentication();
      if (!authSuccess) {
        this.log('❌ Authentication test failed. Stopping tests.', 'error');
        return;
      }

      // Run all other tests
      await this.testUserManagement();
      await this.testCategoryManagement();
      await this.testTagManagement();
      await this.testNewsletterSystem();
      await this.testSecurityFeatures();

      // Cleanup
      await this.cleanup();

      this.log('=' .repeat(50), 'info');
      this.log('✅ All Admin Panel tests completed!', 'success');

    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'error');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new AdminPanelTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = AdminPanelTester;