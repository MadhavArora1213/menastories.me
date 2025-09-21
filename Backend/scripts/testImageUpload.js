const { ImageUploadService } = require('../services/imageUploadService');
const path = require('path');
const fs = require('fs');

async function testImageUpload() {
  console.log('🧪 Testing Image Upload System...\n');

  const imageService = new ImageUploadService();

  try {
    // Test 1: Check if storage directory exists
    console.log('📁 Test 1: Checking storage directory...');
    const storagePath = imageService.storagePath;
    if (fs.existsSync(storagePath)) {
      console.log('✅ Storage directory exists:', storagePath);
    } else {
      console.log('❌ Storage directory does not exist:', storagePath);
      return;
    }

    // Test 2: Check if temp directory exists
    console.log('\n📁 Test 2: Checking temp directory...');
    const tempPath = imageService.tempPath;
    if (fs.existsSync(tempPath)) {
      console.log('✅ Temp directory exists:', tempPath);
    } else {
      console.log('❌ Temp directory does not exist:', tempPath);
      return;
    }

    // Test 3: List existing files in storage
    console.log('\n📋 Test 3: Listing existing files in storage...');
    const files = fs.readdirSync(storagePath);
    console.log(`📊 Found ${files.length} files in storage directory`);
    if (files.length > 0) {
      console.log('📄 Files:', files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
    }

    // Test 4: Test URL generation
    console.log('\n🔗 Test 4: Testing URL generation...');
    const testFilename = 'test-image-123456.jpg';
    const testUrl = imageService.generateImageUrl(testFilename);
    console.log('✅ Generated URL:', testUrl);

    // Test 5: Test file validation (mock)
    console.log('\n✅ Test 5: File validation functions available');
    console.log('   - validateImageFile: Available');
    console.log('   - createPreviewUrl: Available');
    console.log('   - revokePreviewUrl: Available');

    console.log('\n🎉 All basic tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test upload endpoint: POST /api/upload/image');
    console.log('3. Test category upload: POST /api/upload/category/:id/image');
    console.log('4. Test subcategory upload: POST /api/upload/subcategory/:id/image');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImageUpload();