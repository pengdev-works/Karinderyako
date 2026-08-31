/**
 * KarinderyaKo — Admin Registration CLI Script
 * Run with: node db/createAdmin.js "Admin Name" "admin@domain.com" "password123"
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createAdmin() {
  const args = process.argv.slice(2);
  const name = args[0] || 'Super Admin';
  const email = (args[1] || 'admin@karinderyako.ph').trim().toLowerCase();
  const password = args[2] || 'admin123';

  console.log(`🔐 Registering Platform Admin: ${name} <${email}>...`);

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'ADMIN')
       ON CONFLICT (email) DO UPDATE 
       SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'ADMIN'
       RETURNING id, name, email, role, created_at;`,
      [name, email, passwordHash]
    );

    const adminUser = result.rows[0];

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_role, action, details, status)
       VALUES ('ADMIN', 'ADMIN_REGISTERED', 'Admin account registered: ${email}', 'SUCCESS');`
    );

    console.log('================================================');
    console.log('✅ Admin Account Successfully Registered in Neon DB!');
    console.log(`   ID:       ${adminUser.id}`);
    console.log(`   Name:     ${adminUser.name}`);
    console.log(`   Email:    ${adminUser.email}`);
    console.log(`   Role:     ${adminUser.role}`);
    console.log('================================================');
  } catch (err) {
    console.error('❌ Failed to register admin:', err.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
