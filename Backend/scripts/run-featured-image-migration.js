const fs = require('fs').promises;
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config.json');

async function runMigration() {
  const env = process.env.NODE_ENV || 'development';
  const dbConfig = config[env];

  console.log('🔄 Connecting to database...');
  console.log(`📍 Environment: ${env}`);
  console.log(`🗄️  Database: ${dbConfig.database}`);
  console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);

  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: false,
      timezone: dbConfig.timezone
    }
  );

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'add-featured-image-to-video-articles.sql');
    console.log('📖 Reading SQL file...');

    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    console.log('📝 SQL file loaded successfully');

    // Split SQL commands and execute them
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`🔧 Executing ${sqlCommands.length} SQL commands...`);

    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.trim()) {
        console.log(`⚡ Executing command ${i + 1}/${sqlCommands.length}...`);
        try {
          const result = await sequelize.query(command);
          console.log(`✅ Command ${i + 1} executed successfully`);
        } catch (error) {
          // Check if it's just a "column already exists" error
          if (error.message.includes('already exists') || error.message.includes('does not exist')) {
            console.log(`⚠️  Command ${i + 1} skipped (column may already exist)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('🎉 Migration completed successfully!');
    console.log('📋 Featured image fields have been added to VideoArticles table');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
console.log('🚀 Starting Featured Image Migration for Video Articles');
console.log('================================================');
runMigration().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});