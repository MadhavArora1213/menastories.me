const newsletterService = require('./controllers/newsletterController');

// Test the complete newsletter subscription flow
async function testNewsletterFlow() {
  console.log('🧪 Testing Newsletter Subscription Flow...\n');

  // Test data
  const testData = {
    email: 'test@example.com',
    countryCode: '+91',
    phoneNumber: '9876543210',
    whatsappConsent: true,
    termsAccepted: true,
    marketingConsent: false,
    emailVerified: true,
    phoneVerified: true,
    source: 'website_test'
  };

  const fullPhoneNumber = testData.countryCode + testData.phoneNumber.replace(/\D/g, '');

  console.log('📧 Test Email:', testData.email);
  console.log('📱 Test Phone:', fullPhoneNumber);
  console.log('✅ Email Verified:', testData.emailVerified);
  console.log('✅ Phone Verified:', testData.phoneVerified);
  console.log('');

  try {
    // Test subscription
    console.log('📝 Testing subscription...');
    const result = await newsletterService.subscribe(testData);
    console.log('✅ Subscription successful!');
    console.log('📊 Result:', result);
  } catch (error) {
    console.error('❌ Subscription failed:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Newsletter Flow Test Complete!');
}

// Test phone number formatting
function testPhoneFormatting() {
  console.log('📱 Testing Phone Number Formatting...\n');

  const testCases = [
    { input: '+919877275894', expected: '9877275894', description: 'Indian number with +91' },
    { input: '+1-555-123-4567', expected: '5551234567', description: 'US number with +1' },
    { input: '+44 20 7946 0958', expected: '2079460958', description: 'UK number with +44' },
    { input: '0987654321', expected: '0987654321', description: 'Plain 10-digit number' },
    { input: '919877275894', expected: '9877275894', description: 'Number with 91 prefix' }
  ];

  testCases.forEach((testCase, index) => {
    const cleanPhone = testCase.input.replace(/\D/g, '');
    let formattedPhone = cleanPhone;

    // Apply same logic as in the WhatsApp service
    if (testCase.input.startsWith('+')) {
      // Input has + sign, extract local number
      if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        formattedPhone = cleanPhone.substring(2); // Remove '91'
      } else if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
        formattedPhone = cleanPhone.substring(1); // Remove '1'
      } else if (cleanPhone.startsWith('44') && cleanPhone.length === 12) {
        formattedPhone = cleanPhone.substring(2); // Remove '44'
      }
    } else {
      // No + sign in input
      if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        formattedPhone = cleanPhone.substring(2); // Remove '91'
      } else if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
        formattedPhone = cleanPhone.substring(1); // Remove '1'
      }
      // For plain numbers, keep as is
    }

    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Input: ${testCase.input}`);
    console.log(`  Cleaned: ${cleanPhone}`);
    console.log(`  Extracted Local: ${formattedPhone}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  ✅ ${formattedPhone === testCase.expected ? 'PASS' : 'FAIL'}`);
    console.log('');
  });
}

// Test auto-detection feature
function testAutoDetection() {
  console.log('🤖 Testing Auto-Detection Feature...\n');

  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' }
  ];

  const testCases = [
    {
      input: '+919877275894',
      expectedCountry: '+91',
      expectedPhone: '9877275894',
      description: 'Indian number with +91'
    },
    {
      input: '+1-555-123-4567',
      expectedCountry: '+1',
      expectedPhone: '5551234567',
      description: 'US number with +1'
    },
    {
      input: '+442079460958',
      expectedCountry: '+44',
      expectedPhone: '2079460958',
      description: 'UK number with +44'
    },
    {
      input: '9877275894',
      expectedCountry: null,
      expectedPhone: '9877275894',
      description: 'Plain number (no auto-detection)'
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`Auto-Detection Test ${index + 1}: ${testCase.description}`);
    console.log(`  Input: ${testCase.input}`);

    const cleanValue = testCase.input.replace(/[^\d+]/g, '');
    let detectedCountry = null;
    let detectedPhone = cleanValue;

    // Try to match country codes
    if (cleanValue.startsWith('+')) {
      for (const country of countryCodes) {
        if (cleanValue.startsWith(country.code)) {
          detectedCountry = country.code;
          detectedPhone = cleanValue.substring(country.code.length);
          break;
        }
      }
    }

    console.log(`  Detected Country: ${detectedCountry || 'None'}`);
    console.log(`  Detected Phone: ${detectedPhone}`);
    console.log(`  Expected Country: ${testCase.expectedCountry || 'None'}`);
    console.log(`  Expected Phone: ${testCase.expectedPhone}`);

    const countryMatch = detectedCountry === testCase.expectedCountry;
    const phoneMatch = detectedPhone === testCase.expectedPhone;

    console.log(`  ✅ Country: ${countryMatch ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Phone: ${phoneMatch ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Overall: ${countryMatch && phoneMatch ? 'PASS' : 'FAIL'}`);
    console.log('');
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Newsletter System Test Suite\n');
  console.log('=' .repeat(50));

  // Test phone formatting
  testPhoneFormatting();

  console.log('=' .repeat(50));

  // Test auto-detection feature
  testAutoDetection();

  console.log('=' .repeat(50));

  // Test newsletter flow (commented out to avoid actual database operations)
  // await testNewsletterFlow();

  console.log('📋 To test actual subscription, uncomment the testNewsletterFlow() call');
  console.log('⚠️  Make sure to use test data that won\'t conflict with real users');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--format-only')) {
  testPhoneFormatting();
} else {
  runTests();
}

module.exports = { testNewsletterFlow, testPhoneFormatting };