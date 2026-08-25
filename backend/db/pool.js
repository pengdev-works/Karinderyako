/**
 * KarinderyaKo — Neon PostgreSQL Connection Pool
 * Uses the 'pg' package to connect to Neon serverless PostgreSQL
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon's managed PostgreSQL
  },
  max: 10,               // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Neon Database connection error:', err.message);
  } else {
    console.log('✅ Connected to Neon PostgreSQL Database');
    release();
  }
});

module.exports = pool;
