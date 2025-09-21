const sqlite3 = require('sqlite3').verbose();
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Import models
const Category = require('../models/Category');
const Tag = require('../models/Tag');

console.log('🚀 Starting SQLite to PostgreSQL migration...');

// SQLite connection
const sqlitePath = path.join(__dirname, '../database.sqlite');
const sqliteDb = new sqlite3.Database(sqlitePath);

// PostgreSQL connection
const postgresSequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function migrateData() {
  try {
    // Test PostgreSQL connection
    console.log('🔗 Testing PostgreSQL connection...');
    await postgresSequelize.authenticate();
    console.log('✅ PostgreSQL connection successful');

    // Create tables in PostgreSQL if they don't exist
    console.log('📋 Creating tables in PostgreSQL...');

    // Create Categories table
    await postgresSequelize.query(`
      CREATE TABLE IF NOT EXISTS "Categories" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        design VARCHAR(50) DEFAULT 'design1' CHECK (design IN ('design1', 'design2', 'design3')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        "featureImage" VARCHAR(255),
        "parentId" UUID REFERENCES "Categories"(id),
        "order" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(name, "parentId")
      );
    `);

    // Create Tags table
    await postgresSequelize.query(`
      CREATE TABLE IF NOT EXISTS "Tags" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        type VARCHAR(50) DEFAULT 'regular' CHECK (type IN ('regular', 'special_feature', 'trending', 'multimedia', 'interactive', 'event')),
        category VARCHAR(255),
        "categoryId" UUID REFERENCES "Categories"(id),
        "parentId" UUID REFERENCES "Tags"(id),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ Tables created successfully');

    // List of tables to migrate (only those with data)
    const tablesToMigrate = [
      { name: 'Categories', rows: 7 },
      { name: 'Tags', rows: 56 }
    ];

    // Migrate each table
    for (const table of tablesToMigrate) {
      console.log(`📤 Migrating ${table.name} data...`);

      try {
        const tableData = await new Promise((resolve, reject) => {
          sqliteDb.all(`SELECT * FROM ${table.name}`, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

        if (tableData.length > 0) {
          console.log(`📊 Found ${tableData.length} ${table.name.toLowerCase()} to migrate`);

          // Get column information for the table
          const columnInfo = await new Promise((resolve, reject) => {
            sqliteDb.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
              if (err) reject(err);
              else resolve(columns);
            });
          });

          const columnNames = columnInfo.map(col => col.name);
          const placeholders = columnNames.map((_, i) => `$${i + 1}`).join(', ');

          for (const row of tableData) {
            try {
              // Prepare data for bulk insert
              const insertData = {};
              columnNames.forEach(colName => {
                const value = row[colName];
                // Handle UUID conversion for PostgreSQL
                if (colName === 'id' && !value) {
                  // Skip ID if null/empty to let PostgreSQL generate it
                  return;
                }
                // Convert SQLite boolean values (0/1) to PostgreSQL boolean
                if (typeof value === 'number' && (colName.includes('is') || colName.includes('Active'))) {
                  insertData[colName] = value === 1;
                } else {
                  insertData[colName] = value;
                }
              });

              // Use Sequelize's create method for better compatibility
              if (table.name === 'Categories') {
                await Category.create(insertData, { ignoreDuplicates: true });
              } else if (table.name === 'Tags') {
                await Tag.create(insertData, { ignoreDuplicates: true });
              }

            } catch (insertError) {
              console.log(`⚠️  Skipping ${table.name} row: ${insertError.message}`);
            }
          }

          console.log(`✅ ${table.name} migration completed`);
        } else {
          console.log(`ℹ️  No ${table.name.toLowerCase()} data found`);
        }

      } catch (tableError) {
        console.log(`❌ Error migrating ${table.name}: ${tableError.message}`);
      }
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close connections
    sqliteDb.close();
    await postgresSequelize.close();
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });