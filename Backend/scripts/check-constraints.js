const { sequelize } = require('../models');

async function checkConstraints() {
  try {
    console.log('Checking foreign key constraints on Articles table...');

    // Get all foreign key constraints for the Articles table
    const [constraints] = await sequelize.query(`
      SELECT
        conname as constraint_name,
        conrelid::regclass as table_name,
        confrelid::regclass as referenced_table,
        conkey as column_numbers,
        confkey as referenced_column_numbers
      FROM pg_constraint
      WHERE conrelid = '"Articles"'::regclass
      AND contype = 'f';
    `);

    console.log('Foreign key constraints found:');
    constraints.forEach(constraint => {
      console.log(`- ${constraint.constraint_name}: ${constraint.table_name} -> ${constraint.referenced_table}`);
    });

    if (constraints.length === 0) {
      console.log('No foreign key constraints found on Articles table.');
    }

  } catch (error) {
    console.error('❌ Error checking constraints:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkConstraints().then(() => {
  console.log('Constraint check completed.');
  process.exit(0);
});