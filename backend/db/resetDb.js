/**
 * KarinderyaKo — Database Reset Script
 * Clears all seeded sample data from the Neon PostgreSQL database
 * Run with: node db/resetDb.js (from the backend/ directory)
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function resetDb() {
  console.log('🧹 Clearing all sample content and data from Neon PostgreSQL database...');

  try {
    // Truncate all tables in database
    await pool.query(`
      TRUNCATE TABLE order_items, orders, products, karinderyas, applications, users, audit_logs RESTART IDENTITY CASCADE;
    `);

    // Log fresh system start
    await pool.query(`
      INSERT INTO audit_logs (user_role, action, details, status)
      VALUES ('SYSTEM', 'DATABASE_RESET', 'Database wiped clean for production use in Poblacion, Laang, Abra', 'SUCCESS');
    `);

    console.log('================================================');
    console.log('✅ Database Successfully Wiped Clean!');
    console.log('   All sample users, karinderyas, dishes, and orders removed.');
    console.log('   Neon PostgreSQL database is now fresh and ready.');
    console.log('================================================');
  } catch (err) {
    console.error('❌ Reset error:', err.message);
  } finally {
    await pool.end();
  }
}

resetDb();
