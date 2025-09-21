const sequelize = require('../config/db');
const Admin = require('../models/Admin');

const clearAdminUsers = async () => {
  try {
    console.log('Clearing all existing admin users...');

    // Delete all admin users (without truncate to avoid foreign key issues)
    const deletedCount = await Admin.destroy({
      where: {}
    });

    console.log(`Successfully deleted ${deletedCount} admin users`);

  } catch (error) {
    console.error('Error clearing admin users:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  clearAdminUsers();
}

module.exports = clearAdminUsers;