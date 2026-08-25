/**
 * KarinderyaKo — Database Seed Script
 * Creates demo user accounts with hashed passwords
 * Run with: node db/seed.js (from the backend/ directory)
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  console.log('🌱 Seeding KarinderyaKo database...');

  try {
    // Hash demo passwords
    const ownerHash = await bcrypt.hash('owner123', 10);
    const riderHash = await bcrypt.hash('rider123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    // Insert demo user accounts
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES
        ('Aling Nena',      'owner@karinderyako.ph', $1, 'OWNER'),
        ('Mark Busa',       'rider@karinderyako.ph', $2, 'RIDER'),
        ('Platform Admin',  'admin@karinderyako.ph', $3, 'ADMIN')
      ON CONFLICT (email) DO NOTHING;
    `, [ownerHash, riderHash, adminHash]);

    console.log('✅ Demo accounts created:');
    console.log('   Owner:  owner@karinderyako.ph / owner123');
    console.log('   Rider:  rider@karinderyako.ph / rider123');
    console.log('   Admin:  admin@karinderyako.ph / admin123');

    // Log initial system event
    await pool.query(`
      INSERT INTO audit_logs (user_role, action, details, status)
      VALUES ('SYSTEM', 'DATABASE_SEEDED', 'KarinderyaKo database initialized with demo accounts', 'SUCCESS');
    `);

    console.log('✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
