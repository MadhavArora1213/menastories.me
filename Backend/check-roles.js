const { Role } = require('./models');

async function checkRoles() {
  try {
    const roles = await Role.findAll();
    console.log('Roles in database:');
    roles.forEach(r => {
      console.log(`  ${r.name} (Level: ${r.accessLevel})`);
    });
    console.log(`\nTotal roles: ${roles.length}`);
  } catch (error) {
    console.error('Error checking roles:', error);
  } finally {
    process.exit(0);
  }
}

checkRoles();