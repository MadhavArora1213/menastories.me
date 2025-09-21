const { sequelize } = require('../models');

async function fixMediaTableSQLite() {
  try {
    console.log('🔧 Fixing Media table structure for SQLite...');

    // Check if columns exist and add them if they don't
    const columnsToAdd = [
      { name: 'thumbnailUrl', type: 'TEXT' },
      { name: 'optimizedUrl', type: 'TEXT' },
      { name: 'folderId', type: 'TEXT' }, // UUID as TEXT in SQLite
      { name: 'uploadedBy', type: 'TEXT' }, // UUID as TEXT in SQLite
      { name: 'lastAccessedAt', type: 'DATETIME' },
      { name: 'downloadCount', type: 'INTEGER DEFAULT 0' },
      { name: 'viewCount', type: 'INTEGER DEFAULT 0' },
      { name: 'isOptimized', type: 'INTEGER DEFAULT 0' }, // BOOLEAN as INTEGER in SQLite
      { name: 'optimizationLevel', type: 'INTEGER' },
      { name: 'isPublic', type: 'INTEGER DEFAULT 1' }, // BOOLEAN as INTEGER in SQLite
      { name: 'processingStatus', type: 'TEXT DEFAULT \'completed\'' },
      { name: 'status', type: 'TEXT DEFAULT \'active\'' },
      { name: 'license', type: 'TEXT DEFAULT \'all_rights_reserved\'' }
    ];

    // Get existing columns
    const [existingColumns] = await sequelize.query(
      "PRAGMA table_info(Media)"
    );

    const existingColumnNames = existingColumns.map(col => col.name);

    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        try {
          await sequelize.query(
            `ALTER TABLE Media ADD COLUMN ${column.name} ${column.type}`
          );
          console.log(`✅ Added column: ${column.name}`);
        } catch (error) {
          console.log(`⚠️  Failed to add column ${column.name}: ${error.message}`);
        }
      } else {
        console.log(`ℹ️  Column ${column.name} already exists`);
      }
    }

    // Create indexes
    const indexesToCreate = [
      'CREATE INDEX IF NOT EXISTS media_folder_id ON Media(folderId)',
      'CREATE INDEX IF NOT EXISTS media_uploaded_by ON Media(uploadedBy)',
      'CREATE INDEX IF NOT EXISTS media_type ON Media(type)',
      'CREATE INDEX IF NOT EXISTS media_status ON Media(status)',
      'CREATE INDEX IF NOT EXISTS media_processing_status ON Media(processingStatus)',
      'CREATE INDEX IF NOT EXISTS media_created_at ON Media(createdAt)'
    ];

    for (const indexQuery of indexesToCreate) {
      try {
        await sequelize.query(indexQuery);
        console.log(`✅ Created index: ${indexQuery.split(' ON ')[0]}`);
      } catch (error) {
        console.log(`⚠️  Index creation failed: ${error.message}`);
      }
    }

    console.log('🎉 Media table structure fixed successfully for SQLite!');

  } catch (error) {
    console.error('❌ Error fixing Media table:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixMediaTableSQLite()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = fixMediaTableSQLite;