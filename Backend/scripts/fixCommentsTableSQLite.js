const sequelize = require('../config/db');
const { Comment } = require('../models');

async function fixCommentsTable() {
  try {
    console.log('🔧 Fixing Comments table structure for SQLite...');

    // Check if the Comments table exists
    const [results] = await sequelize.query(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='Comments';
    `);

    if (results.length === 0) {
      console.log('❌ Comments table does not exist');
      return;
    }

    // Get current columns in Comments table
    const [columns] = await sequelize.query(`
      PRAGMA table_info(Comments);
    `);

    const columnNames = columns.map(col => col.name);
    console.log('📋 Current columns:', columnNames);

    // Add missing columns if they don't exist
    const missingColumns = [];

    if (!columnNames.includes('authorId')) {
      missingColumns.push('authorId');
    }

    if (!columnNames.includes('parentId')) {
      missingColumns.push('parentId');
    }

    if (!columnNames.includes('status')) {
      missingColumns.push('status');
    }

    if (!columnNames.includes('isEdited')) {
      missingColumns.push('isEdited');
    }

    if (!columnNames.includes('editedAt')) {
      missingColumns.push('editedAt');
    }

    if (!columnNames.includes('upvotes')) {
      missingColumns.push('upvotes');
    }

    if (!columnNames.includes('downvotes')) {
      missingColumns.push('downvotes');
    }

    if (!columnNames.includes('replyCount')) {
      missingColumns.push('replyCount');
    }

    // Add missing columns
    for (const column of missingColumns) {
      let sql = '';
      switch (column) {
        case 'authorId':
          sql = 'ALTER TABLE Comments ADD COLUMN authorId UUID REFERENCES Users(id);';
          break;
        case 'parentId':
          sql = 'ALTER TABLE Comments ADD COLUMN parentId UUID REFERENCES Comments(id);';
          break;
        case 'status':
          sql = "ALTER TABLE Comments ADD COLUMN status VARCHAR(20) DEFAULT 'active';";
          break;
        case 'isEdited':
          sql = 'ALTER TABLE Comments ADD COLUMN isEdited BOOLEAN DEFAULT false;';
          break;
        case 'editedAt':
          sql = 'ALTER TABLE Comments ADD COLUMN editedAt TIMESTAMP;';
          break;
        case 'upvotes':
          sql = 'ALTER TABLE Comments ADD COLUMN upvotes INTEGER DEFAULT 0;';
          break;
        case 'downvotes':
          sql = 'ALTER TABLE Comments ADD COLUMN downvotes INTEGER DEFAULT 0;';
          break;
        case 'replyCount':
          sql = 'ALTER TABLE Comments ADD COLUMN replyCount INTEGER DEFAULT 0;';
          break;
      }

      if (sql) {
        try {
          await sequelize.query(sql);
          console.log(`✅ Added column: ${column}`);
        } catch (error) {
          console.log(`⚠️  Skipped: ${column} (${error.message})`);
        }
      }
    }

    // Drop old indexes if they exist
    const indexesToDrop = [
      'comments_author_id',
      'comments_article_id',
      'comments_parent_id',
      'comments_status',
      'comments_created_at'
    ];

    for (const indexName of indexesToDrop) {
      try {
        await sequelize.query(`DROP INDEX IF EXISTS "${indexName}";`);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (error) {
        console.log(`⚠️  Could not drop index ${indexName}: ${error.message}`);
      }
    }

    // Create new indexes
    const indexesToCreate = [
      'CREATE INDEX IF NOT EXISTS "comments_author_id" ON "Comments"("authorId");',
      'CREATE INDEX IF NOT EXISTS "comments_article_id" ON "Comments"("articleId");',
      'CREATE INDEX IF NOT EXISTS "comments_parent_id" ON "Comments"("parentId");',
      'CREATE INDEX IF NOT EXISTS "comments_status" ON "Comments"("status");',
      'CREATE INDEX IF NOT EXISTS "comments_created_at" ON "Comments"("createdAt");'
    ];

    for (const indexSql of indexesToCreate) {
      try {
        await sequelize.query(indexSql);
        console.log(`✅ Created index: ${indexSql.split('"')[1]}`);
      } catch (error) {
        console.log(`⚠️  Could not create index: ${error.message}`);
      }
    }

    console.log('🎉 Comments table structure fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing Comments table:', error);
    throw error;
  }
}

// Run the fix
fixCommentsTable()
  .then(() => {
    console.log('✅ Comments table fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });