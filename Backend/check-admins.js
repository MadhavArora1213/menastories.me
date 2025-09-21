const { Admin, Role } = require('./models');

async function checkAdmins() {
  try {
    console.log('Checking admins...');

    const admins = await Admin.findAll({
      include: [{ model: Role, as: 'role' }],
      attributes: ['id', 'email', 'name', 'isActive']
    });

    if (admins.length === 0) {
      console.log('No admins found.');
    } else {
      console.log('Found admins:');
      admins.forEach(admin => {
        console.log(`- ${admin.email} (${admin.name}) - Active: ${admin.isActive}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAdmins();