const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adding missing columns to SQLite database...');

db.serialize(() => {
  // Check if scheduled_publish_date column exists
  db.all("PRAGMA table_info(Articles)", (err, columns) => {
    if (err) {
      console.error('Error getting table info:', err);
      return;
    }

    const hasScheduledPublishDate = columns.some(col => col.name === 'scheduled_publish_date');

    if (!hasScheduledPublishDate) {
      console.log('📝 Adding scheduled_publish_date column...');
      db.run("ALTER TABLE Articles ADD COLUMN scheduled_publish_date DATETIME", (err) => {
        if (err) {
          console.error('Error adding scheduled_publish_date column:', err);
        } else {
          console.log('✅ scheduled_publish_date column added successfully');
        }
      });
    } else {
      console.log('✅ scheduled_publish_date column already exists');
    }

    // Check if description column exists
    const hasDescription = columns.some(col => col.name === 'description');

    if (!hasDescription) {
      console.log('📝 Adding description column...');
      db.run("ALTER TABLE Articles ADD COLUMN description TEXT", (err) => {
        if (err) {
          console.error('Error adding description column:', err);
        } else {
          console.log('✅ description column added successfully');
        }
      });
    } else {
      console.log('✅ description column already exists');
    }

    // Check if createdBy column exists
    const hasCreatedBy = columns.some(col => col.name === 'createdBy');

    if (!hasCreatedBy) {
      console.log('📝 Adding createdBy column...');
      db.run("ALTER TABLE Articles ADD COLUMN createdBy TEXT", (err) => {
        if (err) {
          console.error('Error adding createdBy column:', err);
        } else {
          console.log('✅ createdBy column added successfully');
        }
      });
    } else {
      console.log('✅ createdBy column already exists');
    }

    // Check if updatedBy column exists
    const hasUpdatedBy = columns.some(col => col.name === 'updatedBy');

    if (!hasUpdatedBy) {
      console.log('📝 Adding updatedBy column...');
      db.run("ALTER TABLE Articles ADD COLUMN updatedBy TEXT", (err) => {
        if (err) {
          console.error('Error adding updatedBy column:', err);
        } else {
          console.log('✅ updatedBy column added successfully');
        }
      });
    } else {
      console.log('✅ updatedBy column already exists');
    }

    // Close the database connection
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('🔒 Database connection closed');
        }
      });
    }, 1000);
  });
});