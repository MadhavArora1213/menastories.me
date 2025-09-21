const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api/public/comments`;
const ARTICLE_SLUG = 'cryptocurrency-regulation-global-perspectives'; // Use real article slug

async function testCommentSystem() {
  console.log('🧪 Testing Comment System...\n');

  try {
    // Step 1: Test sending OTP
    console.log('1️⃣ Testing OTP sending...');
    const otpResponse = await axios.post(`${API_BASE}/send-otp`, {
      name: 'Test User',
      email: 'test@example.com',
      articleSlug: ARTICLE_SLUG
    });

    console.log('✅ OTP sent successfully:', otpResponse.data.message);
    console.log('📧 Check your email for the OTP\n');

    // Step 2: Test OTP verification (you'll need to provide the actual OTP)
    const otp = '123456'; // Replace with actual OTP from email
    console.log('2️⃣ Testing OTP verification...');

    const verifyResponse = await axios.post(`${API_BASE}/verify-otp`, {
      email: 'test@example.com',
      otp: otp,
      articleSlug: ARTICLE_SLUG
    });

    console.log('✅ OTP verified successfully');
    console.log('🔑 Token received:', verifyResponse.data.token ? 'Yes' : 'No');
    const token = verifyResponse.data.token;

    if (!token) {
      throw new Error('No token received from OTP verification');
    }

    // Step 3: Test comment creation
    console.log('3️⃣ Testing comment creation...');
    const commentResponse = await axios.post(
      `${BASE_URL}/api/articles/${ARTICLE_SLUG}/comments`,
      {
        content: 'This is a test comment from the automated test script.'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Comment created successfully');
    console.log('📝 Comment data:', JSON.stringify(commentResponse.data, null, 2));

    // Step 4: Test getting comments
    console.log('4️⃣ Testing comment retrieval...');
    const commentsResponse = await axios.get(`${BASE_URL}/api/articles/${ARTICLE_SLUG}/comments`);

    console.log('✅ Comments retrieved successfully');
    console.log('📋 Number of comments:', commentsResponse.data.data.rows?.length || 0);

    console.log('\n🎉 All tests passed! Comment system is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Status code:', error.response?.status);
    console.error('Full error:', error.response?.data || error);

    if (error.response?.status === 404) {
      console.log('\n💡 Possible issues:');
      console.log('- Article slug might be incorrect');
      console.log('- Article might not exist');
      console.log('- Check if the backend server is running');
    }

    if (error.response?.status === 401) {
      console.log('\n💡 Possible issues:');
      console.log('- OTP might be incorrect or expired');
      console.log('- Token might be invalid');
      console.log('- Comment authentication middleware might have issues');
    }
  }
}

// Run the test
testCommentSystem();