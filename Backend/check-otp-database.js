const { Otp } = require('./models');
const { Op } = require('sequelize');

// Check OTP records in database
async function checkOTPRecords() {
  try {
    console.log('🔍 Checking OTP records in database...\n');

    // Get all OTP records
    const allRecords = await Otp.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log('📋 Recent OTP records:');
    allRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}`);
      console.log(`   Email: ${record.identifier}`);
      console.log(`   Type: ${record.type}`);
      console.log(`   OTP: ${record.otp}`);
      console.log(`   Expires: ${record.expiresAt}`);
      console.log(`   Created: ${record.createdAt}`);
      console.log('   ---');
    });

    // Check for active OTPs for test@example.com
    const activeOTPs = await Otp.findAll({
      where: {
        identifier: 'test@example.com',
        type: 'event_submission',
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      order: [['createdAt', 'DESC']]
    });

    console.log(`\n🎯 Active OTPs for test@example.com: ${activeOTPs.length}`);
    activeOTPs.forEach((otp, index) => {
      console.log(`${index + 1}. OTP: ${otp.otp} (expires: ${otp.expiresAt})`);
    });

    if (activeOTPs.length === 0) {
      console.log('⚠️ No active OTPs found for test@example.com');
    }

  } catch (error) {
    console.error('❌ Error checking OTP database:', error);
  }
}

// Clean up old OTPs
async function cleanupOldOTPs() {
  try {
    console.log('🧹 Cleaning up expired OTPs...');

    const deletedCount = await Otp.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });

    console.log(`✅ Deleted ${deletedCount} expired OTPs`);

  } catch (error) {
    console.error('❌ Error cleaning up OTPs:', error);
  }
}

// Test OTP creation directly
async function testDirectOTPCreation() {
  try {
    console.log('🔧 Testing direct OTP creation...');

    const testOTP = '999999';
    const testEmail = 'test@example.com';

    // First, clean up any existing OTPs for this email
    await Otp.destroy({
      where: {
        identifier: testEmail,
        type: 'event_submission'
      }
    });

    // Create a new OTP
    const newOTP = await Otp.create({
      identifier: testEmail,
      otp: testOTP,
      type: 'event_submission',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    console.log('✅ Created OTP:', {
      id: newOTP.id,
      email: newOTP.identifier,
      otp: newOTP.otp,
      expiresAt: newOTP.expiresAt
    });

    return testOTP;

  } catch (error) {
    console.error('❌ Error creating OTP directly:', error);
    return null;
  }
}

// Run all checks
async function runChecks() {
  console.log('🚀 Starting OTP database checks...\n');

  await checkOTPRecords();
  console.log('\n' + '='.repeat(60) + '\n');

  await cleanupOldOTPs();
  console.log('\n' + '='.repeat(60) + '\n');

  const directOTP = await testDirectOTPCreation();
  console.log('\n' + '='.repeat(60) + '\n');

  if (directOTP) {
    console.log('💡 Test the event submission with this OTP:', directOTP);
    console.log('📧 Email: test@example.com');
    console.log('🔧 Type: event_submission');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('1. Use the OTP shown above in your event submission');
  console.log('2. Submit the event immediately (within 10 minutes)');
  console.log('3. Check server logs if it still fails');
  console.log('=' .repeat(60));
}

runChecks();