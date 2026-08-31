/**
 * KarinderyaKo — Neon PostgreSQL Connection Pool
 * Uses @neondatabase/serverless for WebSocket-based connectivity
 * (avoids TCP/firewall issues with standard pg driver)
 */
require('dotenv').config();
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Required for Node.js environments — provides WebSocket support
neonConfig.webSocketConstructor = ws;

// Clean connection string — remove unsupported params
const rawUrl = process.env.DATABASE_URL || '';
const cleanUrl = rawUrl
  .replace(/[&?]channel_binding=[^&]*/g, '')
  .replace(/sslmode=require/, 'sslmode=require'); // keep sslmode as-is

const pool = new Pool({ connectionString: cleanUrl });

pool.on('error', (err) => {
  console.error('Unexpected Neon pool error:', err.message);
});

module.exports = pool;
