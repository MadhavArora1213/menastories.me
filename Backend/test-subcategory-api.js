const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testSubcategoryEndpoints() {
  console.log('🧪 Testing Subcategory API Endpoints...\n');

  try {
    // Test 1: Get all subcategories
    console.log('1. Testing GET /api/subcategories');
    const allSubcategories = await axios.get(`${API_BASE_URL}/subcategories`);
    console.log(`✅ Found ${allSubcategories.data.count} subcategories`);
    console.log('Sample subcategory:', allSubcategories.data.data[0]?.name || 'None');

    // Test 2: Get subcategories by category
    console.log('\n2. Testing GET /api/subcategories/category/:categoryId');
    if (allSubcategories.data.data.length > 0) {
      const categoryId = allSubcategories.data.data[0].categoryId;
      const categorySubcategories = await axios.get(`${API_BASE_URL}/subcategories/category/${categoryId}`);
      console.log(`✅ Found ${categorySubcategories.data.count} subcategories for category ${categoryId}`);
    }

    // Test 3: Get single subcategory
    console.log('\n3. Testing GET /api/subcategories/:id');
    if (allSubcategories.data.data.length > 0) {
      const subcategoryId = allSubcategories.data.data[0].id;
      const singleSubcategory = await axios.get(`${API_BASE_URL}/subcategories/${subcategoryId}`);
      console.log(`✅ Retrieved subcategory: ${singleSubcategory.data.data.name}`);
    }

    // Test 4: Get categories with subcategories
    console.log('\n4. Testing GET /api/categories (with subcategories)');
    const categoriesWithSubcategories = await axios.get(`${API_BASE_URL}/categories`);
    console.log(`✅ Found ${categoriesWithSubcategories.data.count} categories`);
    if (categoriesWithSubcategories.data.data.length > 0) {
      const firstCategory = categoriesWithSubcategories.data.data[0];
      console.log(`✅ Category "${firstCategory.name}" has ${firstCategory.subcategories?.length || 0} subcategories`);
    }

    console.log('\n🎉 All subcategory endpoint tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testSubcategoryEndpoints();