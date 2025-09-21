const sequelize = require('../config/db');

async function updateNewsletterEnum() {
  try {
    console.log('🔄 Updating NewsletterSubscribers enum to include website_popup...');

    // Add the new enum value to the existing enum type
    await sequelize.query(`
      DO $$
      BEGIN
        -- Add website_popup if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'enum_NewsletterSubscribers_subscriptionSource'
          AND e.enumlabel = 'website_popup'
        ) THEN
          ALTER TYPE "enum_NewsletterSubscribers_subscriptionSource" ADD VALUE 'website_popup';
        END IF;
      END
      $$;
    `);

    console.log('✅ NewsletterSubscribers enum updated successfully!');
    console.log('📊 Added enum value: website_popup');

  } catch (error) {
    console.error('❌ Error updating NewsletterSubscribers enum:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

updateNewsletterEnum();