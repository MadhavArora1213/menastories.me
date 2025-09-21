const { createAdminUser } = require('./createAdminUser');
const AdminPanelTester = require('./testAdminPanel');

async function setupAndTest() {
  console.log('🚀 Setting up admin user and running tests...\n');

  try {
    // Create admin user first
    console.log('1. Creating admin user...');
    await createAdminUser();
    console.log('✅ Admin user created successfully\n');

    // Wait a moment for database to sync
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run tests
    console.log('2. Running admin panel tests...');
    const tester = new AdminPanelTester();
    await tester.runAllTests();

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupAndTest().then(() => {
    console.log('\n🎉 Setup and testing completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Setup and testing failed:', error);
    process.exit(1);
  });
}

module.exports = { setupAndTest };