const sequelize = require('../config/db');

const addCategoryColumn = async () => {
  try {
    // Check if column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Permissions' 
      AND column_name = 'category';
    `;
    
    const [checkResult] = await sequelize.query(checkQuery);
    
    if (checkResult.length === 0) {
      console.log('Adding "category" column to Permissions table...');
      
      // Add the category column with a default value
      await sequelize.query(`
        ALTER TABLE "Permissions" 
        ADD COLUMN "category" VARCHAR(255) NOT NULL DEFAULT 'General';
      `);
      
      console.log('Column added successfully!');
    } else {
      console.log('Category column already exists, no action needed.');
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

addCategoryColumn();