const sequelize = require('../config/db');
const { NewsletterSubscriber } = require('../models');

async function createTable() {
  try {
    console.log('🔄 Creating NewsletterSubscribers table...');

    // Force sync to create/recreate the table
    await NewsletterSubscriber.sync({ force: true });

    console.log('✅ NewsletterSubscribers table created successfully!');
    console.log('📊 Table structure:');
    console.log('- id (UUID, Primary Key)');
    console.log('- email (VARCHAR, Unique)');
    console.log('- phoneNumber (VARCHAR)');
    console.log('- whatsappConsent (BOOLEAN)');
    console.log('- marketingConsent (BOOLEAN)');
    console.log('- confirmationToken (VARCHAR)');
    console.log('- confirmedAt (DATETIME)');
    console.log('- unsubscribedAt (DATETIME)');
    console.log('- status (ENUM)');
    console.log('- subscriptionSource (ENUM)');
    console.log('- preferences (JSON)');
    console.log('- And more fields...');

  } catch (error) {
    console.error('❌ Error creating NewsletterSubscribers table:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createTable();