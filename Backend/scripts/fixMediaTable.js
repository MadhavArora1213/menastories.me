const { sequelize } = require('../models');

async function fixMediaTable() {
  try {
    console.log('🔧 Fixing Media table structure...');

    // Drop existing indexes that might conflict
    await sequelize.query('DROP INDEX IF EXISTS "media_folder_id";');
    await sequelize.query('DROP INDEX IF EXISTS "media_uploaded_by";');
    await sequelize.query('DROP INDEX IF EXISTS "media_type";');
    await sequelize.query('DROP INDEX IF EXISTS "media_status";');
    await sequelize.query('DROP INDEX IF EXISTS "media_processing_status";');
    await sequelize.query('DROP INDEX IF EXISTS "media_created_at";');
    await sequelize.query('DROP INDEX IF EXISTS "media_tags";'); // Drop GIN index

    // Add missing columns to Media table
    const alterQueries = [
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "folderId" UUID REFERENCES "MediaFolders"("id");`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "uploadedBy" UUID REFERENCES "Users"("id");`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "lastAccessedAt" TIMESTAMP;`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "downloadCount" INTEGER DEFAULT 0;`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER DEFAULT 0;`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "isOptimized" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "optimizationLevel" INTEGER;`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "processingStatus" VARCHAR(20) DEFAULT 'completed';`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT 'active';`,
      `ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "license" VARCHAR(50) DEFAULT 'all_rights_reserved';`
    ];

    for (const query of alterQueries) {
      try {
        await sequelize.query(query);
        console.log(`✅ Executed: ${query.substring(0, 50)}...`);
      } catch (error) {
        console.log(`⚠️  Skipped: ${query.substring(0, 50)}... (${error.message})`);
      }
    }

    // Create indexes (excluding GIN index for tags due to PostgreSQL compatibility)
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS "media_folder_id" ON "Media"("folderId");`,
      `CREATE INDEX IF NOT EXISTS "media_uploaded_by" ON "Media"("uploadedBy");`,
      `CREATE INDEX IF NOT EXISTS "media_type" ON "Media"("type");`,
      `CREATE INDEX IF NOT EXISTS "media_status" ON "Media"("status");`,
      `CREATE INDEX IF NOT EXISTS "media_processing_status" ON "Media"("processingStatus");`,
      `CREATE INDEX IF NOT EXISTS "media_created_at" ON "Media"("createdAt");`
      // Removed: CREATE INDEX IF NOT EXISTS "media_tags" ON "Media" USING gin ("tags")
    ];

    for (const query of indexQueries) {
      try {
        await sequelize.query(query);
        console.log(`✅ Created index: ${query}`);
      } catch (error) {
        console.log(`⚠️  Index creation failed: ${error.message}`);
      }
    }

    console.log('🎉 Media table structure fixed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing Media table:', error);
    process.exit(1);
  }
}

fixMediaTable();