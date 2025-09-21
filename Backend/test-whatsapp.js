require('dotenv').config();
const whatsappService = require('./services/whatsappService');

// Test WhatsApp OTP functionality
async function testWhatsAppOTP() {
  console.log('🧪 Testing WhatsApp OTP Service...\n');

  // Test phone number (replace with your actual number for testing)
  const testPhoneNumber = '+919877275894'; // Your working phone number

  console.log('\n📱 Test Configuration:');
  console.log(`   Phone Number: ${testPhoneNumber}`);
  console.log(`   Expected Local: ${testPhoneNumber.replace(/\D/g, '').substring(2)}`);
  console.log(`   WhatsApp ID: 807045049151812`);
  console.log('\n⚠️  Make sure to add this number to WhatsApp Business allowed recipients!');
  console.log('   Go to: https://business.facebook.com/');
  console.log('   Settings → Phone Numbers → Add Recipients\n');
  const testOTP = '123456';

  try {
    console.log(`📱 Sending OTP to: ${testPhoneNumber}`);
    console.log(`🔢 OTP Code: ${testOTP}\n`);

    const result = await whatsappService.sendOtp(testPhoneNumber, testOTP);

    console.log('✅ WhatsApp OTP Test Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.development || result.fallback) {
      console.log('\n⚠️  DEVELOPMENT MODE: OTP was logged to console instead of being sent via WhatsApp');
      console.log('📋 Check the console output above for the OTP code');
    } else {
      console.log('\n✅ WhatsApp message sent successfully!');
    }

  } catch (error) {
    console.error('❌ WhatsApp OTP Test Failed:');
    console.error(error.message);

    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Test WhatsApp configuration
function testWhatsAppConfig() {
  console.log('🔧 WhatsApp Configuration Check:\n');

  const config = {
    accessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: !!process.env.WHATSAPP_PHONE_ID,
    nodeEnv: process.env.NODE_ENV
  };

  console.log('Access Token Configured:', config.accessToken ? '✅' : '❌');
  console.log('Phone Number ID Configured:', config.phoneNumberId ? '✅' : '❌');
  console.log('Environment:', config.nodeEnv || 'development');

  if (!config.accessToken || !config.phoneNumberId) {
    console.log('\n⚠️  WhatsApp credentials not fully configured!');
    console.log('📝 Add these to your .env file:');
    console.log('   WHATSAPP_ACCESS_TOKEN=your_access_token_here');
    console.log('   WHATSAPP_PHONE_ID=your_phone_number_id_here');
  } else {
    console.log('\n✅ WhatsApp credentials configured!');
  }

  return config;
}

// Run tests
async function runTests() {
  console.log('🚀 WhatsApp OTP Testing Suite\n');
  console.log('=' .repeat(50));

  // Test configuration first
  const config = testWhatsAppConfig();

  console.log('\n' + '=' .repeat(50));

  // Test OTP sending
  if (config.accessToken && config.phoneNumberId) {
    await testWhatsAppOTP();
  } else {
    console.log('⚠️  Skipping OTP test due to missing configuration');
    console.log('📋 OTP will be logged to console in development mode');
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Testing Complete!');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--config-only')) {
  testWhatsAppConfig();
} else if (args.includes('--test-otp')) {
  testWhatsAppOTP();
} else {
  runTests();
}

module.exports = { testWhatsAppOTP, testWhatsAppConfig };