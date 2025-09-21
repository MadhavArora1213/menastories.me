const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Inspecting SQLite database...');
console.log(`📁 Database path: ${dbPath}`);

db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('❌ Error reading tables:', err.message);
    return;
  }

  console.log(`\n📊 Found ${tables.length} tables:`);

  tables.forEach((table, index) => {
    console.log(`${index + 1}. ${table.name}`);

    // Get row count for each table
    db.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, result) => {
      if (err) {
        console.log(`   ❌ Error counting rows in ${table.name}: ${err.message}`);
      } else {
        console.log(`   📈 Rows: ${result.count}`);
      }

      // Close database after processing all tables
      if (index === tables.length - 1) {
        db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err.message);
          } else {
            console.log('\n✅ Database inspection completed');
          }
        });
      }
    });
  });
});