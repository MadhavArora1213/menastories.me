const { Subcategory, Category } = require('./models');
const { ImageUploadService } = require('./services/imageUploadService');
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  try {
    console.log('🧪 Testing image upload process...');

    // Create a test image service
    const imageService = new ImageUploadService();

    // Create a test subcategory first
    const testCategory = await Category.findOne();
    if (!testCategory) {
      console.log('❌ No categories found, creating test category...');
      const newCategory = await Category.create({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category for image upload testing'
      });
      testCategory = newCategory;
    }

    console.log('📝 Creating test subcategory...');
    const timestamp = Date.now();
    const testSubcategory = await Subcategory.create({
      name: 'Test Image Upload ' + timestamp,
      slug: 'test-image-upload-' + timestamp,
      description: 'Testing image upload functionality',
      categoryId: testCategory.id,
      type: 'regular',
      status: 'active',
      order: 0,
      featureImage: null
    });

    console.log('✅ Test subcategory created with ID:', testSubcategory.id);

    // Test URL generation
    const testFilename = 'featured_image-1758351017212-131212862.png';
    const generatedUrl = imageService.generateImageUrl(testFilename);

    console.log('🔗 Generated URL:', generatedUrl);
    console.log('📁 Expected file path:', path.join(imageService.storagePath, testFilename));
    console.log('🔍 File exists:', fs.existsSync(path.join(imageService.storagePath, testFilename)));

    // Test updating the subcategory with the image URL
    console.log('📝 Updating subcategory with image URL...');
    await testSubcategory.update({ featureImage: generatedUrl });

    // Verify the update
    const updatedSubcategory = await Subcategory.findByPk(testSubcategory.id);
    console.log('✅ Updated subcategory featureImage:', updatedSubcategory.featureImage);

    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testImageUpload();