const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

async function updateCategorySchema() {
  try {
    console.log('Starting category schema update...');
    
    // Check if the design column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Categories' 
      AND column_name = 'design'
    `);
    
    if (results.length === 0) {
      console.log('Adding design column...');
      await sequelize.query(`
        ALTER TABLE "Categories" 
        ADD COLUMN "design" VARCHAR(10) DEFAULT 'design1' NOT NULL
      `);
      
      // Add check constraint for design values
      await sequelize.query(`
        ALTER TABLE "Categories" 
        ADD CONSTRAINT "Categories_design_check" 
        CHECK ("design" IN ('design1', 'design2', 'design3'))
      `);
      console.log('Design column added successfully');
    } else {
      console.log('Design column already exists');
    }
    
    // Check if the status column exists
    const [statusResults] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Categories' 
      AND column_name = 'status'
    `);
    
    if (statusResults.length === 0) {
      console.log('Adding status column...');
      await sequelize.query(`
        ALTER TABLE "Categories" 
        ADD COLUMN "status" VARCHAR(10) DEFAULT 'active' NOT NULL
      `);
      
      // Add check constraint for status values
      await sequelize.query(`
        ALTER TABLE "Categories" 
        ADD CONSTRAINT "Categories_status_check" 
        CHECK ("status" IN ('active', 'inactive'))
      `);
      console.log('Status column added successfully');
    } else {
      console.log('Status column already exists');
    }
    
    // Check if the featureImage column exists
    const [imageResults] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Categories' 
      AND column_name = 'featureImage'
    `);
    
    if (imageResults.length === 0) {
      console.log('Adding featureImage column...');
      await sequelize.query(`
        ALTER TABLE "Categories" 
        ADD COLUMN "featureImage" TEXT
      `);
      console.log('FeatureImage column added successfully');
    } else {
      console.log('FeatureImage column already exists');
    }
    
    console.log('Category schema update completed successfully!');
    
  } catch (error) {
    console.error('Error updating category schema:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the update
updateCategorySchema();
