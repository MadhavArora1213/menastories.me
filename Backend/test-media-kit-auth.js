// Test script to debug media kit authentication
const jwt = require('jsonwebtoken');
const { Admin } = require('./models');

async function testMediaKitAuth() {
  try {
    console.log('🔍 Testing Media Kit Authentication...\n');

    // Find an active admin
    const admin = await Admin.findOne({
      where: { isActive: true },
      include: [{ model: require('./models').Role, as: 'role' }]
    });

    if (!admin) {
      console.log('❌ No active admin found in database');
      return;
    }

    console.log('✅ Found admin:', admin.name, '(ID:', admin.id + ')');
    console.log('✅ Admin role:', admin.role?.name || 'No role assigned');
    console.log('✅ Admin active:', admin.isActive);

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Generated JWT token');
    console.log('📝 Token preview:', token.substring(0, 50) + '...');

    // Test the API call using built-in http module
    const http = require('http');
    const API_BASE_URL = 'http://localhost:5000';

    console.log('\n🌐 Testing API call to /api/media-kits...');

    const postData = JSON.stringify({
      title: 'Test Media Kit',
      description: 'Test description',
      content: 'Test content',
      status: 'draft'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/media-kits',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';

        console.log('📊 Response status:', res.statusCode);
        console.log('📊 Response headers:', res.headers);

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });

    console.log('📄 Response body:', response.data);

    if (response.status === 201 || response.status === 200) {
      console.log('✅ Media kit created successfully!');
    } else {
      console.log('❌ Failed to create media kit');

      // Try to parse error as JSON
      try {
        const errorData = JSON.parse(response.data);
        console.log('📋 Error details:', errorData);
      } catch (e) {
        console.log('📋 Raw error response:', response.data);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testMediaKitAuth();
}

module.exports = { testMediaKitAuth };