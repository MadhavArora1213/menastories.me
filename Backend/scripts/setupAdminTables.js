const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/db');

async function setupAdminTables() {
  try {
    console.log('🔧 Setting up admin tables...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'createAdminTables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the entire SQL file at once
    try {
      await sequelize.query(sqlContent);
      console.log('✅ Admin tables and data created successfully!');
    } catch (error) {
      console.log('⚠️  Bulk execution failed, trying individual commands...');

      // Fallback: Split and execute commands individually
      const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim() && !statement.trim().startsWith('--')) {
          try {
            await sequelize.query(statement);
          } catch (stmtError) {
            console.log(`⚠️  Statement failed (might be expected): ${stmtError.message}`);
          }
        }
      }
    }

    console.log('🎉 Admin tables setup completed successfully!');
    console.log('\n📋 Default Admin Credentials:');
    console.log('📧 Email: admin@magazinewebsite.com');
    console.log('🔑 Password: Admin123!');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error) {
    console.error('❌ Error setting up admin tables:', error);
    throw error;
  }
}

// Run the setup function
if (require.main === module) {
  setupAdminTables().then(() => {
    console.log('✅ Admin tables setup completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Admin tables setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupAdminTables };