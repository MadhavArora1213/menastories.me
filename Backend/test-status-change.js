const axios = require('axios');

// Test script to verify article status change functionality
async function testStatusChange() {
  try {
    console.log('🧪 Testing Article Status Change Functionality...\n');

    // First, login to get admin token
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (loginResponse.data.message !== 'Admin login successful') {
      throw new Error('Login failed: ' + (loginResponse.data.message || 'Unknown error'));
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');

    // Set up headers for authenticated requests
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // First, get all articles to see current status
    console.log('📋 Getting all articles...');
    const articlesResponse = await axios.get('http://localhost:5000/api/articles', { headers });

    if (articlesResponse.data.success && articlesResponse.data.data.articles.length > 0) {
      const articles = articlesResponse.data.data.articles;
      console.log(`✅ Found ${articles.length} articles`);

      // Find a draft article to test draft -> pending_review
      const draftArticle = articles.find(a => a.status === 'draft');
      if (draftArticle) {
        console.log(`\n📝 Testing Draft → Pending Review`);
        console.log(`Article: "${draftArticle.title}" (ID: ${draftArticle.id})`);

        const updateResponse = await axios.put(`http://localhost:5000/api/articles/${draftArticle.id}`, {
          status: 'pending_review',
          review_notes: 'Test status change from draft to pending review'
        }, { headers });

        if (updateResponse.data.success) {
          console.log('✅ Status change successful!');
          console.log('New status:', updateResponse.data.data.status);
        } else {
          console.log('❌ Status change failed');
          console.log('Response:', updateResponse.data);
          console.log('Status code:', updateResponse.status);
        }
      } else {
        console.log('⚠️ No draft articles found to test');
      }

      // Find a published article to test published -> archived
      const publishedArticle = articles.find(a => a.status === 'published');
      if (publishedArticle) {
        console.log(`\n📝 Testing Published → Archived`);
        console.log(`Article: "${publishedArticle.title}" (ID: ${publishedArticle.id})`);

        const updateResponse = await axios.put(`http://localhost:5000/api/articles/${publishedArticle.id}`, {
          status: 'archived',
          review_notes: 'Test status change from published to archived'
        }, { headers });

        if (updateResponse.data.success) {
          console.log('✅ Status change successful!');
          console.log('New status:', updateResponse.data.data.status);
        } else {
          console.log('❌ Status change failed:', updateResponse.data.message);
        }
      } else {
        console.log('⚠️ No published articles found to test');
      }

    } else {
      console.log('❌ No articles found or failed to fetch articles');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running on port 5000');
    console.log('2. Replace YOUR_ADMIN_TOKEN_HERE with a valid admin JWT token');
    console.log('3. Make sure you have admin permissions');
    console.log('4. Check the server logs for any errors');
  }
}

// Run the test
testStatusChange();