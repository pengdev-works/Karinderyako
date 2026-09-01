/**
 * KarinderyaKo — Express.js Main Server
 * Backend for Neon PostgreSQL + Render deployment
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./db/pool');      // triggers DB connection test
const apiRouter = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 5050;

// ── CORS ──────────────────────────────────────────────────────
// Allow requests from frontend (Vercel production/preview and localhost)
const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(u => u.trim().replace(/\/$/, '')) // strip trailing slash
  .filter(Boolean);

const allowedStaticOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://karinderyako.vercel.app',
  ...envOrigins,
];

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow curl, Postman, server-to-server, mobile
  const cleanOrigin = origin.replace(/\/$/, '');
  if (allowedStaticOrigins.includes(cleanOrigin)) return true;
  // Allow all Vercel preview/production branch deployments
  if (/^https:\/\/karinderyako.*\.vercel\.app$/.test(cleanOrigin)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin "${origin}" not in allowed list:`, allowedStaticOrigins);
      callback(new Error(`CORS: Origin "${origin}" not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Explicit OPTIONS preflight handling
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── REQUEST LOGGER ────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── ROUTES ────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'UP',
      database: 'Neon PostgreSQL — Connected',
      system: 'KarinderyaKo API v2.0',
      geofence: 'Poblacion, Laang, Abra',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// ── ERROR HANDLER ─────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ── START ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('================================================');
  console.log(`  KarinderyaKo API running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Database:    Neon PostgreSQL`);
  console.log(`  Geofence:    Poblacion, Laang, Abra`);
  console.log('================================================');
});
