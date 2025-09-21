const sequelize = require('../config/db');
require('dotenv').config();

const fixCommentsTable = async () => {
  try {
    console.log('🔧 Fixing Comments table structure...');
    
    // Check if authorId column already exists
    const columnExists = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'Comments' AND column_name = 'authorId'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (columnExists.length > 0) {
      console.log('✅ authorId column already exists');
    } else {
      console.log('➕ Adding authorId column...');
      
      // Add authorId column
      await sequelize.query(`
        ALTER TABLE "Comments" 
        ADD COLUMN "authorId" UUID,
        ADD CONSTRAINT "Comments_authorId_fkey" 
        FOREIGN KEY ("authorId") REFERENCES "Users"("id") ON DELETE SET NULL
      `);
      
      console.log('✅ authorId column added successfully');
    }
    
    // Check if other missing columns exist and add them
    const missingColumns = [
      {
        name: 'id',
        type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
        constraint: null
      },
      {
        name: 'upvotes',
        type: 'INTEGER NOT NULL DEFAULT 0',
        constraint: null
      },
      {
        name: 'downvotes',
        type: 'INTEGER NOT NULL DEFAULT 0',
        constraint: null
      },
      {
        name: 'isEdited',
        type: 'BOOLEAN NOT NULL DEFAULT false',
        constraint: null
      },
      {
        name: 'editedAt',
        type: 'TIMESTAMP WITH TIME ZONE',
        constraint: null
      },
      {
        name: 'ipAddress',
        type: 'CHARACTER VARYING',
        constraint: null
      },
      {
        name: 'userAgent',
        type: 'TEXT',
        constraint: null
      },
      {
        name: 'moderatedBy',
        type: 'UUID',
        constraint: 'FOREIGN KEY ("moderatedBy") REFERENCES "Users"("id") ON DELETE SET NULL'
      },
      {
        name: 'moderatedAt',
        type: 'TIMESTAMP WITH TIME ZONE',
        constraint: null
      },
      {
        name: 'moderationNotes',
        type: 'TEXT',
        constraint: null
      }
    ];
    
    for (const column of missingColumns) {
      const exists = await sequelize.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'Comments' AND column_name = '${column.name}'`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (exists.length === 0) {
        console.log(`➕ Adding ${column.name} column...`);
        
        let alterQuery = `ALTER TABLE "Comments" ADD COLUMN "${column.name}" ${column.type}`;
        
        if (column.constraint) {
          alterQuery += `, ADD CONSTRAINT "Comments_${column.name}_fkey" ${column.constraint}`;
        }
        
        await sequelize.query(alterQuery);
        console.log(`✅ ${column.name} column added successfully`);
      } else {
        console.log(`✅ ${column.name} column already exists`);
      }
    }
    
    // Update existing indexes to match the model
    console.log('🔗 Updating indexes...');
    
    // Add missing indexes
    const indexes = [
      { name: 'comments_author_id', fields: ['authorId'] },
      { name: 'comments_parent_id', fields: ['parentId'] },
      { name: 'comments_status', fields: ['status'] },
      { name: 'comments_created_at', fields: ['createdAt'] },
      { name: 'comments_article_status', fields: ['articleId', 'status'] }
    ];
    
    for (const index of indexes) {
      try {
        await sequelize.query(`
          CREATE INDEX IF NOT EXISTS "${index.name}" 
          ON "Comments" (${index.fields.map(f => `"${f}"`).join(', ')})
        `);
        console.log(`✅ Index ${index.name} created/verified`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Index ${index.name} already exists`);
        } else {
          console.log(`⚠️  Could not create index ${index.name}: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Comments table structure fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing Comments table:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Execute if run directly
if (require.main === module) {
  fixCommentsTable()
    .then(() => {
      console.log('✅ Fix completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Unhandled error:', err);
      process.exit(1);
    });
}

module.exports = fixCommentsTable;
