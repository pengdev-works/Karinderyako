# KarinderyaKo 🍲
### Online Food Ordering Marketplace for Home-Based Karinderyas in Poblacion, Laang, Abra

A localized, foodpanda-style multi-vendor platform for home-based food businesses.

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React.js + Vite |
| Backend  | Node.js + Express.js |
| Database | Neon (Serverless PostgreSQL) |
| Hosting  | Frontend → Vercel · Backend → Render |

---

## Project Structure

```
Karinderyako/
├── backend/              ← Express.js REST API
│   ├── db/
│   │   ├── pool.js       ← Neon PostgreSQL connection
│   │   ├── schema.sql    ← Run this in Neon SQL Editor
│   │   └── seed.js       ← Creates demo accounts
│   ├── routes/api.js     ← All API endpoints
│   ├── middleware/       ← Security & geofence
│   ├── .env              ← ⚠️ SECRET — not in git
│   ├── .env.example      ← Template for .env
│   └── render.yaml       ← Render deployment config
│
└── frontend/             ← React.js app
    ├── src/
    │   ├── App.jsx        ← Main app with API calls
    │   ├── api.js         ← Central API helper
    │   └── components/   ← UI components
    ├── .env.development  ← Points to localhost:5000
    ├── .env.production   ← Points to Render URL
    └── vercel.json       ← Vercel deployment config
```

---

## Local Development Setup

### 1. Setup Neon Database
1. Go to [neon.tech](https://neon.tech) → Create free account
2. Create new project named `karinderyako`
3. Open **SQL Editor** → Paste and run `backend/db/schema.sql`
4. Copy your **Connection String** from the Connect panel

### 2. Configure Backend
```bash
cd backend

# Copy the template and fill in your Neon URL
copy .env.example .env
# Edit .env → paste your DATABASE_URL

npm install
```

### 3. Seed the Database
```bash
cd backend
npm run seed
# Creates demo accounts: owner / rider / admin
```

### 4. Start Backend
```bash
cd backend
npm run dev        # or: node index.js
# Runs on http://localhost:5000
# Visit http://localhost:5000/health to verify DB connection
```

### 5. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3001
```

---

## Demo Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Owner | owner@karinderyako.ph | owner123 |
| Rider | rider@karinderyako.ph | rider123 |
| Admin | admin@karinderyako.ph | admin123 |

---

## Deployment Guide

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "KarinderyaKo v2.0 - Full stack with Neon DB"
git remote add origin https://github.com/yourusername/karinderyako.git
git push -u origin main
```

### Step 2 — Deploy Backend to Render
1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repository
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Add Environment Variables:
   - `DATABASE_URL` → Your Neon connection string
   - `NODE_ENV` → `production`
   - `FRONTEND_URL` → *(set after Vercel deploy)*
5. Click **Deploy** → Copy your Render URL (e.g. `https://karinderyako-backend.onrender.com`)

### Step 3 — Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
3. Add Environment Variable:
   - `VITE_API_URL` → Your Render backend URL
4. Click **Deploy** → Copy your Vercel URL

### Step 4 — Update CORS on Render
1. Go back to Render → Your backend service → Environment
2. Update `FRONTEND_URL` → Your Vercel URL
3. Redeploy

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (owner/rider/admin) |
| POST | `/api/auth/register/vendor` | Submit karinderya application |
| POST | `/api/auth/register/rider` | Submit rider application |
| GET  | `/api/karinderyas` | List all verified karinderyas |
| GET  | `/api/karinderyas/:id/menu` | Get menu for a karinderya |
| POST | `/api/orders` | Place order (geofence enforced) |
| GET  | `/api/orders` | Get orders |
| PATCH | `/api/orders/:id/status` | Update delivery status |
| POST | `/api/products` | Add menu dish (owner) |
| PATCH | `/api/products/:id/toggle` | Toggle dish availability |
| GET  | `/api/admin/applications` | Get pending applications |
| POST | `/api/admin/applications/:id/approve` | Approve application |
| POST | `/api/admin/applications/:id/reject` | Reject application |
| GET  | `/api/admin/audit-logs` | Security audit log |
| GET  | `/health` | Health check with DB status |

---

## Geofence Policy
All orders and vendor registrations are restricted to **Poblacion, Laang, Abra** only.
Out-of-zone submissions are rejected and logged in the security audit trail.

---

*Capstone Project — KarinderyaKo Multi-Vendor Food Marketplace*
