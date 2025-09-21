const sequelize = require('../config/db');

async function updateSecurityLogsEnum() {
  try {
    console.log('🔄 Updating SecurityLogs enum to include api_request and api_error...');

    // Add the new enum values to the existing enum type
    await sequelize.query(`
      DO $$
      BEGIN
        -- Add api_request if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'enum_SecurityLogs_eventType'
          AND e.enumlabel = 'api_request'
        ) THEN
          ALTER TYPE "enum_SecurityLogs_eventType" ADD VALUE 'api_request';
        END IF;

        -- Add api_error if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'enum_SecurityLogs_eventType'
          AND e.enumlabel = 'api_error'
        ) THEN
          ALTER TYPE "enum_SecurityLogs_eventType" ADD VALUE 'api_error';
        END IF;
      END
      $$;
    `);

    console.log('✅ SecurityLogs enum updated successfully!');
    console.log('📊 Added enum values: api_request, api_error');

  } catch (error) {
    console.error('❌ Error updating SecurityLogs enum:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

updateSecurityLogsEnum();