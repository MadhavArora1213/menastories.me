// Test Cloudinary configuration
const cloudinary = require('./utils/cloudinary');

async function testCloudinary() {
  try {
    console.log('🧪 Testing Cloudinary Configuration...\n');

    // Check environment variables
    console.log('Environment Variables:');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not set');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('\n❌ Cloudinary is not configured!');
      console.log('\n📋 To set up Cloudinary:');
      console.log('1. Go to https://cloudinary.com/');
      console.log('2. Create a free account');
      console.log('3. Get your Cloud Name, API Key, and API Secret from the dashboard');
      console.log('4. Add these to your .env file:');
      console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
      console.log('   CLOUDINARY_API_KEY=your_api_key');
      console.log('   CLOUDINARY_API_SECRET=your_api_secret');
      return;
    }

    // Test Cloudinary connection
    console.log('\n🔄 Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);

    // Get account info
    console.log('\n📊 Getting account info...');
    const account = await cloudinary.api.usage();
    console.log('✅ Account info retrieved!');
    console.log('Plan:', account.plan);
    console.log('Credits used:', account.credits?.used || 'N/A');
    console.log('Credits limit:', account.credits?.limit || 'N/A');

    console.log('\n🎉 Cloudinary is properly configured and working!');

  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);

    if (error.message.includes('Invalid credentials')) {
      console.log('\n💡 Check your Cloudinary credentials in the .env file');
    } else if (error.message.includes('Network')) {
      console.log('\n💡 Check your internet connection');
    }
  }
}

testCloudinary();