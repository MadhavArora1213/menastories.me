const { sequelize } = require('../models');

async function checkAssignedToConstraint() {
  try {
    console.log('Checking assignedTo foreign key constraint...');

    // Get the assignedTo constraint details
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
        AND tc.constraint_name = 'Articles_assignedTo_fkey';
    `);

    if (constraints.length > 0) {
      console.log('Current assignedTo constraint:', constraints[0]);
      console.log('According to the Article model, assignedTo should reference Admins table');
      console.log('Current database references:', constraints[0].referenced_table);
    } else {
      console.log('No assignedTo constraint found');
    }

  } catch (error) {
    console.error('❌ Error checking assignedTo constraint:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkAssignedToConstraint().then(() => {
  console.log('AssignedTo constraint check completed.');
  process.exit(0);
});