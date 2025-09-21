const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
let adminToken = null;

// Test data
const testCategory = {
  name: "Test Category",
  description: "This is a test category for API testing",
  design: "design1",
  status: "active",
  featureImage: "https://example.com/test-image.jpg",
  order: 1
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test admin login
const testAdminLogin = async () => {
  try {
    console.log('🔐 Testing admin login...');
    const response = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
      email: 'admin@magazine.com',
      password: 'Admin@123'
    });
    
    adminToken = response.data.token;
    console.log('✅ Admin login successful');
    console.log('Token:', adminToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
};

// Test create category
const testCreateCategory = async () => {
  try {
    console.log('\n📝 Testing category creation...');
    const response = await makeAuthRequest('POST', '/categories', testCategory);
    
    console.log('✅ Category created successfully');
    console.log('Category ID:', response.data.data.id);
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Category creation failed:', error.response?.data || error.message);
    return null;
  }
};

// Test get all categories
const testGetAllCategories = async () => {
  try {
    console.log('\n📋 Testing get all categories...');
    const response = await makeAuthRequest('GET', '/categories');
    
    console.log('✅ Categories retrieved successfully');
    console.log('Total categories:', response.data.count);
    return response.data.data;
  } catch (error) {
    console.error('❌ Get categories failed:', error.response?.data || error.message);
    return null;
  }
};

// Test get category by ID
const testGetCategoryById = async (categoryId) => {
  try {
    console.log('\n🔍 Testing get category by ID...');
    const response = await makeAuthRequest('GET', `/categories/${categoryId}`);
    
    console.log('✅ Category retrieved successfully');
    console.log('Category name:', response.data.data.name);
    return response.data.data;
  } catch (error) {
    console.error('❌ Get category by ID failed:', error.response?.data || error.message);
    return null;
  }
};

// Test update category design
const testUpdateCategoryDesign = async (categoryId) => {
  try {
    console.log('\n🎨 Testing category design update...');
    const response = await makeAuthRequest('PATCH', `/categories/${categoryId}/design`, {
      design: 'design2'
    });
    
    console.log('✅ Category design updated successfully');
    console.log('New design:', response.data.data.design);
    return true;
  } catch (error) {
    console.error('❌ Category design update failed:', error.response?.data || error.message);
    return false;
  }
};

// Test toggle category status
const testToggleCategoryStatus = async (categoryId) => {
  try {
    console.log('\n🔄 Testing category status toggle...');
    const response = await makeAuthRequest('PATCH', `/categories/${categoryId}/status`);
    
    console.log('✅ Category status toggled successfully');
    console.log('New status:', response.data.data.status);
    return true;
  } catch (error) {
    console.error('❌ Category status toggle failed:', error.response?.data || error.message);
    return false;
  }
};

// Test update category
const testUpdateCategory = async (categoryId) => {
  try {
    console.log('\n✏️ Testing category update...');
    const updateData = {
      name: "Updated Test Category",
      description: "This category has been updated",
      order: 2
    };
    
    const response = await makeAuthRequest('PUT', `/categories/${categoryId}`, updateData);
    
    console.log('✅ Category updated successfully');
    console.log('Updated name:', response.data.data.name);
    return true;
  } catch (error) {
    console.error('❌ Category update failed:', error.response?.data || error.message);
    return false;
  }
};

// Test delete category
const testDeleteCategory = async (categoryId) => {
  try {
    console.log('\n🗑️ Testing category deletion...');
    const response = await makeAuthRequest('DELETE', `/categories/${categoryId}`);
    
    console.log('✅ Category deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Category deletion failed:', error.response?.data || error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Category API Tests...\n');
  
  // Test admin login first
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without admin authentication');
    return;
  }
  
  // Test category creation
  const categoryId = await testCreateCategory();
  if (!categoryId) {
    console.log('❌ Cannot proceed without a test category');
    return;
  }
  
  // Test get all categories
  await testGetAllCategories();
  
  // Test get category by ID
  await testGetCategoryById(categoryId);
  
  // Test update category design
  await testUpdateCategoryDesign(categoryId);
  
  // Test toggle category status
  await testToggleCategoryStatus(categoryId);
  
  // Test update category
  await testUpdateCategory(categoryId);
  
  // Test delete category
  await testDeleteCategory(categoryId);
  
  console.log('\n🎉 All tests completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testAdminLogin,
  testCreateCategory,
  testGetAllCategories,
  testGetCategoryById,
  testUpdateCategoryDesign,
  testToggleCategoryStatus,
  testUpdateCategory,
  testDeleteCategory
};
