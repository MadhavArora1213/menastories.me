require('dotenv').config();
const axios = require('axios');

// Test the article API endpoints
async function testArticleAPI() {
  const baseURL = process.env.BASE_URL || 'http://localhost:5000';
  const apiURL = `${baseURL}/api/articles`;

  console.log('🧪 Testing Article API Endpoints...');
  console.log('Base URL:', baseURL);
  console.log('API URL:', apiURL);

  try {
    // Test 1: Get all authors
    console.log('\n📋 Test 1: Fetching authors...');
    const authorsResponse = await axios.get(`${apiURL}/authors/all`);
    console.log('✅ Authors fetched successfully:', authorsResponse.data.data.length, 'authors found');

    if (authorsResponse.data.data.length > 0) {
      console.log('Sample author:', authorsResponse.data.data[0].name);
    }

    // Test 2: Get all categories
    console.log('\n📂 Test 2: Fetching categories...');
    const categoriesResponse = await axios.get(`${apiURL}/categories/filtered`);
    console.log('✅ Categories fetched successfully:', categoriesResponse.data.data.length, 'categories found');

    // Test 3: Get tags by category
    if (categoriesResponse.data.data.length > 0) {
      console.log('\n🏷️  Test 3: Fetching tags for first category...');
      const firstCategory = categoriesResponse.data.data[0];
      const tagsResponse = await axios.get(`${apiURL}/category/${firstCategory.id}/tags`);
      console.log('✅ Tags fetched successfully for category:', firstCategory.name);
      console.log('Tags count:', tagsResponse.data.data.length);
    }

    // Test 4: Get all articles (should work even if empty)
    console.log('\n📄 Test 4: Fetching articles...');
    const articlesResponse = await axios.get(`${apiURL}/`);
    console.log('✅ Articles endpoint working, found:', articlesResponse.data.data.articles.length, 'articles');

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Authors API: Working');
    console.log('✅ Categories API: Working');
    console.log('✅ Tags API: Working');
    console.log('✅ Articles API: Working');

    console.log('\n🚀 Article management system is ready for use!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testArticleAPI().catch(console.error);
}

module.exports = { testArticleAPI };