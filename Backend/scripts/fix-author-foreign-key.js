const { sequelize } = require('../models');

async function fixAuthorForeignKey() {
  try {
    console.log('Starting foreign key fix...');

    // Check if constraint already exists
    const [existingConstraints] = await sequelize.query(`
      SELECT conname FROM pg_constraint
      WHERE conrelid = '"Articles"'::regclass
      AND conname = 'Articles_authorId_fkey'
      AND contype = 'f';
    `);

    if (existingConstraints.length > 0) {
      console.log('Dropping existing foreign key constraint...');
      await sequelize.query(`
        ALTER TABLE "Articles" DROP CONSTRAINT "Articles_authorId_fkey";
      `);
    } else {
      console.log('No existing authorId foreign key constraint found.');
    }

    // Add the correct constraint
    console.log('Adding correct foreign key constraint...');
    await sequelize.query(`
      ALTER TABLE "Articles"
      ADD CONSTRAINT "Articles_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "Authors"("id")
      ON UPDATE CASCADE ON DELETE SET NULL;
    `);

    console.log('✅ Foreign key constraint fixed successfully!');

    // Verify the constraint
    const [constraints] = await sequelize.query(`
      SELECT
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM
        information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE
        tc.table_name = 'Articles'
        AND tc.constraint_name = 'Articles_authorId_fkey';
    `);

    if (constraints.length > 0) {
      console.log('Verification:', constraints[0]);
    } else {
      console.log('Constraint verification failed - constraint may not have been created');
    }

  } catch (error) {
    console.error('❌ Error fixing foreign key:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixAuthorForeignKey().then(() => {
  console.log('Foreign key fix completed.');
  process.exit(0);
});