const sequelize = require('../config/db');
require('dotenv').config();

const inspectCommentsTable = async () => {
  try {
    console.log('🔍 Inspecting Comments table structure...');
    
    // Check if Comments table exists
    const tableExists = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Comments'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (tableExists.length === 0) {
      console.log('❌ Comments table does not exist');
      return;
    }
    
    console.log('✅ Comments table exists');
    
    // Get table structure
    const columns = await sequelize.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = 'Comments' 
       ORDER BY ordinal_position`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\n📋 Comments table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check for indexes
    const indexes = await sequelize.query(
      `SELECT indexname, indexdef 
       FROM pg_indexes 
       WHERE tablename = 'Comments'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\n🔗 Comments table indexes:');
    if (indexes.length === 0) {
      console.log('  No indexes found');
    } else {
      indexes.forEach(idx => {
        console.log(`  - ${idx.indexname}: ${idx.indexdef}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error inspecting Comments table:', error);
  } finally {
    await sequelize.close();
  }
};

// Execute if run directly
if (require.main === module) {
  inspectCommentsTable()
    .then(() => {
      console.log('✅ Inspection completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Unhandled error:', err);
      process.exit(1);
    });
}

module.exports = inspectCommentsTable;
