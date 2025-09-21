const { sendOtpEmail } = require('./services/emailService');

// Test email service directly
async function testEmailService() {
  try {
    console.log('📧 Testing email service...\n');

    // Test OTP email
    const testEmail = 'test@example.com';
    const testOTP = '123456';

    console.log(`📧 Sending OTP ${testOTP} to ${testEmail}...`);

    const result = await sendOtpEmail(testEmail, testOTP, 'event submission');

    console.log('✅ Email sent successfully!');
    console.log('📄 Result:', result);

  } catch (error) {
    console.error('❌ Email service test failed:');

    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    } else if (error.request) {
      console.error('🚫 No response received:', error.request);
    } else {
      console.error('⚠️ Request setup error:', error.message);
    }

    console.error('🔧 Full error:', error);
  }
}

// Test Brevo API key configuration
function testBrevoConfig() {
  console.log('🔧 Testing Brevo configuration...\n');

  console.log('📧 BREVO_API_KEY configured:', !!process.env.BREVO_API_KEY);
  console.log('📧 BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL);
  console.log('📧 BREVO_FROM_NAME:', process.env.BREVO_FROM_NAME);

  if (!process.env.BREVO_API_KEY) {
    console.log('❌ BREVO_API_KEY is not set!');
    console.log('💡 Please set BREVO_API_KEY in your .env file');
    return false;
  }

  if (!process.env.BREVO_FROM_EMAIL) {
    console.log('❌ BREVO_FROM_EMAIL is not set!');
    console.log('💡 Please set BREVO_FROM_EMAIL in your .env file');
    return false;
  }

  console.log('✅ Brevo configuration looks good');
  return true;
}

// Run tests
async function runTests() {
  console.log('🚀 Testing email service...\n');

  // Test configuration first
  const configOk = testBrevoConfig();
  console.log('\n' + '='.repeat(60) + '\n');

  if (!configOk) {
    console.log('❌ Configuration issues found. Please fix them before testing email sending.');
    return;
  }

  // Test email sending
  await testEmailService();

  console.log('\n' + '='.repeat(60));
  console.log('📋 TROUBLESHOOTING:');
  console.log('1. Check if BREVO_API_KEY is valid in Brevo dashboard');
  console.log('2. Verify BREVO_FROM_EMAIL is verified in Brevo');
  console.log('3. Check Brevo account has sufficient credits');
  console.log('4. Ensure recipient email is not in spam/junk folder');
  console.log('5. Check server firewall allows outbound connections');
  console.log('=' .repeat(60));
}

runTests();