'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const db = queryInterface.sequelize;

    // Add CASCADE delete for Articles -> Categories relationship
    try {
      console.log('Adding CASCADE delete constraint for Articles.categoryId');

      // Drop existing constraint if it exists
      await db.query(`
        ALTER TABLE "Articles"
        DROP CONSTRAINT IF EXISTS "Articles_categoryId_fkey";
      `);

      // Add new constraint with CASCADE delete
      await db.query(`
        ALTER TABLE "Articles"
        ADD CONSTRAINT "Articles_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE;
      `);

      console.log('Successfully added CASCADE delete for Articles.categoryId');
    } catch (error) {
      console.log('Error updating Articles.categoryId constraint:', error.message);
    }

    // Add CASCADE delete for Categories self-referencing relationship (parentId)
    try {
      console.log('Adding CASCADE delete constraint for Categories.parentId');

      // Drop existing constraint if it exists
      await db.query(`
        ALTER TABLE "Categories"
        DROP CONSTRAINT IF EXISTS "Categories_parentId_fkey";
      `);

      // Add new constraint with CASCADE delete
      await db.query(`
        ALTER TABLE "Categories"
        ADD CONSTRAINT "Categories_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "Categories"("id") ON DELETE CASCADE;
      `);

      console.log('Successfully added CASCADE delete for Categories.parentId');
    } catch (error) {
      console.log('Error updating Categories.parentId constraint:', error.message);
    }

    // Add CASCADE delete for Tags.categoryId constraint
    try {
      console.log('Adding CASCADE delete constraint for Tags.categoryId');

      // Drop existing constraint if it exists
      await db.query(`
        ALTER TABLE "Tags"
        DROP CONSTRAINT IF EXISTS "Tags_categoryId_fkey";
      `);

      // Add new constraint with CASCADE delete
      await db.query(`
        ALTER TABLE "Tags"
        ADD CONSTRAINT "Tags_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE;
      `);

      console.log('Successfully added CASCADE delete for Tags.categoryId');
    } catch (error) {
      console.log('Error updating Tags.categoryId constraint:', error.message);
    }

    // Note: Subcategories already have CASCADE delete to Categories via the model definition
    // and the existing migration system should handle this properly
  },

  async down(queryInterface, Sequelize) {
    const db = queryInterface.sequelize;

    // Rollback Articles.categoryId to SET NULL
    try {
      await db.query(`
        ALTER TABLE "Articles"
        DROP CONSTRAINT IF EXISTS "Articles_categoryId_fkey";
      `);

      await db.query(`
        ALTER TABLE "Articles"
        ADD CONSTRAINT "Articles_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL;
      `);

      console.log('Rolled back Articles.categoryId constraint to SET NULL');
    } catch (error) {
      console.log('Rollback failed for Articles.categoryId:', error.message);
    }

    // Rollback Tags.categoryId to SET NULL
    try {
      await db.query(`
        ALTER TABLE "Tags"
        DROP CONSTRAINT IF EXISTS "Tags_categoryId_fkey";
      `);

      await db.query(`
        ALTER TABLE "Tags"
        ADD CONSTRAINT "Tags_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL;
      `);

      console.log('Rolled back Tags.categoryId constraint to SET NULL');
    } catch (error) {
      console.log('Rollback failed for Tags.categoryId:', error.message);
    }

    // Rollback Categories.parentId to SET NULL
    try {
      await db.query(`
        ALTER TABLE "Categories"
        DROP CONSTRAINT IF EXISTS "Categories_parentId_fkey";
      `);

      await db.query(`
        ALTER TABLE "Categories"
        ADD CONSTRAINT "Categories_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "Categories"("id") ON DELETE SET NULL;
      `);

      console.log('Rolled back Categories.parentId constraint to SET NULL');
    } catch (error) {
      console.log('Rollback failed for Categories.parentId:', error.message);
    }
  }
};