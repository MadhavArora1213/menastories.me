require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
});

async function checkAdmin() {
  try {
    console.log('Checking for admin user...');

    // Check if admin user exists
    const result = await pool.query(`
      SELECT a.id, a.email, a.name, r.name as role_name, r."rolePermissions"
      FROM "Admins" a
      LEFT JOIN "Roles" r ON a."roleId" = r.id
      WHERE a.email = $1
    `, ['masteradmin1@magazine.com']);

    if (result.rows.length > 0) {
      console.log('✅ Admin user found:', result.rows[0]);
    } else {
      console.log('❌ Admin user not found. Creating...');

      // Check if roles exist
      const roleResult = await pool.query('SELECT id, name FROM "Roles" WHERE name = $1', ['Master Admin']);

      if (roleResult.rows.length === 0) {
        console.log('❌ Master Admin role not found. Please run seed scripts first.');
        return;
      }

      const roleId = roleResult.rows[0].id;

      // Create admin user
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('MasterAdmin@123', 12);

      await pool.query(`
        INSERT INTO "Admins" (email, password, name, "roleId", "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, ['masteradmin1@magazine.com', hashedPassword, 'Master Admin', roleId, true]);

      console.log('✅ Admin user created successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkAdmin();