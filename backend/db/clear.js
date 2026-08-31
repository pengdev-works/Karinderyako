require('dotenv').config();
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL.replace(/[&?]channel_binding=[^&]*/g, '') });

async function clean() {
  console.log('🗑️  Clearing all data except admin account...');
  await pool.query('DELETE FROM audit_logs');
  await pool.query('DELETE FROM favorites');
  await pool.query('DELETE FROM reviews');
  await pool.query('DELETE FROM order_items');
  await pool.query('DELETE FROM orders');
  await pool.query('DELETE FROM products');
  await pool.query('DELETE FROM karinderyas');
  await pool.query('DELETE FROM applications');
  await pool.query("DELETE FROM users WHERE role != 'ADMIN'");
  const r = await pool.query('SELECT id, name, email, role FROM users');
  console.log('✅ Done! Remaining accounts:');
  r.rows.forEach(u => console.log(`   [${u.role}] ${u.name} — ${u.email}`));
}

clean().catch(e => console.error('Error:', e.message)).finally(() => pool.end());
