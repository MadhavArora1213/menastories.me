const sequelize = require('../config/db');
const Role = require('../models/Role');
require('dotenv').config();

const updateAdminRole = async () => {
  try {
    console.log('Updating admin role...');
    
    // Find the existing Admin role
    const adminRole = await Role.findOne({ where: { name: 'Admin' } });
    
    if (!adminRole) {
      console.log('Admin role not found');
      return;
    }
    
    console.log('Current role:', adminRole.name);
    
    // Update the role name to Master Admin
    await adminRole.update({
      name: 'Master Admin',
      description: 'Full system access with all administrative privileges'
    });
    
    console.log('Successfully updated role to Master Admin');
    
  } catch (error) {
    console.error('Error updating admin role:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  updateAdminRole();
}

module.exports = updateAdminRole;