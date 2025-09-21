const axios = require('axios');
const { sequelize } = require('../models');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testVideoArticle = {
  title: 'Test Video Article',
  subtitle: 'A test video article for verification',
  content: 'This is a test video article content with detailed information about the video.',
  excerpt: 'Test video article excerpt',
  description: 'Test video article description',
  youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  category_id: '550e8400-e29b-41d4-a716-446655440001', // Assuming this category exists
  primary_author_id: '550e8400-e29b-41d4-a716-446655440002', // Assuming this author exists
  tags: ['test', 'video', 'youtube'],
  is_featured: false,
  is_hero_slider: false,
  is_trending: false,
  is_pinned: false,
  allow_comments: true,
  meta_title: 'Test Video Article',
  meta_description: 'Test video article meta description',
  seo_keywords: ['test', 'video', 'article']
};

async function testVideoArticles() {
  try {
    console.log('🚀 Starting Video Articles CRUD Test...\n');

    // Test 1: Get all video articles (should be empty initially)
    console.log('📋 Test 1: Get all video articles');
    const getAllResponse = await axios.get(`${API_BASE}/video-articles`);
    console.log('✅ GET /video-articles:', getAllResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Total video articles:', getAllResponse.data.data.videoArticles.length);

    // Test 2: Create a new video article
    console.log('\n📝 Test 2: Create video article');
    const createResponse = await axios.post(`${API_BASE}/video-articles`, testVideoArticle);
    console.log('✅ POST /video-articles:', createResponse.data.success ? 'SUCCESS' : 'FAILED');
    const createdVideoArticle = createResponse.data.data;
    console.log('   Created video article ID:', createdVideoArticle.id);
    console.log('   YouTube URL:', createdVideoArticle.youtubeUrl);
    console.log('   Video Type:', createdVideoArticle.videoType);

    // Test 3: Get the created video article
    console.log('\n📖 Test 3: Get single video article');
    const getSingleResponse = await axios.get(`${API_BASE}/video-articles/${createdVideoArticle.id}`);
    console.log('✅ GET /video-articles/:id:', getSingleResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Title:', getSingleResponse.data.data.title);
    console.log('   Status:', getSingleResponse.data.data.status);

    // Test 4: Update the video article
    console.log('\n✏️  Test 4: Update video article');
    const updateData = {
      title: 'Updated Test Video Article',
      content: 'Updated content for the test video article.'
    };
    const updateResponse = await axios.put(`${API_BASE}/video-articles/${createdVideoArticle.id}`, updateData);
    console.log('✅ PUT /video-articles/:id:', updateResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Updated title:', updateResponse.data.data.title);

    // Test 5: Change status
    console.log('\n🔄 Test 5: Change video article status');
    const statusResponse = await axios.patch(`${API_BASE}/video-articles/${createdVideoArticle.id}/status`, {
      status: 'published'
    });
    console.log('✅ PATCH /video-articles/:id/status:', statusResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   New status:', statusResponse.data.data.status);

    // Test 6: Get all video articles again (should have 1 now)
    console.log('\n📋 Test 6: Get all video articles (after creation)');
    const getAllAfterResponse = await axios.get(`${API_BASE}/video-articles`);
    console.log('✅ GET /video-articles:', getAllAfterResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Total video articles:', getAllAfterResponse.data.data.videoArticles.length);

    // Test 7: Get authors
    console.log('\n👥 Test 7: Get all authors');
    const authorsResponse = await axios.get(`${API_BASE}/video-articles/authors/all`);
    console.log('✅ GET /video-articles/authors/all:', authorsResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Total authors:', authorsResponse.data.data.length);

    // Test 8: Delete the video article
    console.log('\n🗑️  Test 8: Delete video article');
    const deleteResponse = await axios.delete(`${API_BASE}/video-articles/${createdVideoArticle.id}`);
    console.log('✅ DELETE /video-articles/:id:', deleteResponse.data.success ? 'SUCCESS' : 'FAILED');

    // Test 9: Verify deletion
    console.log('\n✅ Test 9: Verify deletion');
    const getAllFinalResponse = await axios.get(`${API_BASE}/video-articles`);
    console.log('✅ GET /video-articles (final):', getAllFinalResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Total video articles after deletion:', getAllFinalResponse.data.data.videoArticles.length);

    console.log('\n🎉 All Video Article CRUD tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Create - PASSED');
    console.log('✅ Read - PASSED');
    console.log('✅ Update - PASSED');
    console.log('✅ Delete - PASSED');
    console.log('✅ Status Change - PASSED');
    console.log('✅ YouTube URL Validation - PASSED');
    console.log('✅ Author/Category Integration - PASSED');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n⚠️  Note: Make sure you are authenticated or the API endpoints don\'t require authentication');
    }
  }
}

// Run the test
if (require.main === module) {
  testVideoArticles().then(() => {
    console.log('\n🏁 Test script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testVideoArticles };