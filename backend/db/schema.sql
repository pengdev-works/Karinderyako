-- ============================================================
-- KarinderyaKo — PostgreSQL Database Schema
-- Run this in Neon SQL Editor: console.neon.tech → SQL Editor
-- ============================================================

-- 1. Users Table (Owners, Riders, Admins)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('OWNER', 'RIDER', 'ADMIN')),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 2. Karinderya Listings (Home-based Food Businesses)
CREATE TABLE IF NOT EXISTS karinderyas (
  id            SERIAL PRIMARY KEY,
  owner_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  name          VARCHAR(200) NOT NULL,
  category      VARCHAR(50)  NOT NULL DEFAULT 'Luto-Bahay',
  address       VARCHAR(300) NOT NULL,
  description   TEXT,
  photo         TEXT DEFAULT 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  status        VARCHAR(20)  DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  rating        DECIMAL(3,1) DEFAULT 5.0,
  review_count  INT          DEFAULT 0,
  verified      BOOLEAN      DEFAULT FALSE,
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- 3. Menu Products (Dishes per Karinderya)
CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  karinderya_id INT REFERENCES karinderyas(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  category      VARCHAR(50)   DEFAULT 'Luto-Bahay',
  photo         TEXT DEFAULT 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80',
  available     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 4. Customer Orders
CREATE TABLE IF NOT EXISTS orders (
  id               VARCHAR(20)   PRIMARY KEY,
  karinderya_id    INT REFERENCES karinderyas(id) ON DELETE SET NULL,
  karinderya_name  VARCHAR(200),
  customer_name    VARCHAR(150) NOT NULL,
  customer_phone   VARCHAR(30)  NOT NULL,
  delivery_address TEXT         NOT NULL,
  subtotal         DECIMAL(10,2) NOT NULL,
  delivery_fee     DECIMAL(10,2) DEFAULT 25.00,
  total_amount     DECIMAL(10,2) NOT NULL,
  payment_method   VARCHAR(20)  DEFAULT 'COD',
  payment_status   VARCHAR(50)  DEFAULT 'PENDING (COD)',
  order_status     VARCHAR(30)  DEFAULT 'PLACED',
  rider_id         INT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- 5. Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      VARCHAR(20) REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INT REFERENCES products(id) ON DELETE SET NULL,
  product_name  VARCHAR(200) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  qty           INT NOT NULL DEFAULT 1
);

-- 6. Pending Vendor & Rider Applications
CREATE TABLE IF NOT EXISTS applications (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  owner_name  VARCHAR(150),
  address     VARCHAR(300) NOT NULL,
  category    VARCHAR(50)  DEFAULT 'Luto-Bahay',
  description TEXT,
  role_type   VARCHAR(30)  NOT NULL CHECK (role_type IN ('Karinderya Owner', 'Delivery Rider')),
  email       VARCHAR(255),
  vehicle     VARCHAR(200),
  app_status  VARCHAR(20)  DEFAULT 'PENDING',
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- 7. Security Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id         SERIAL PRIMARY KEY,
  user_role  VARCHAR(30)  DEFAULT 'PUBLIC',
  action     VARCHAR(100) NOT NULL,
  details    TEXT,
  status     VARCHAR(30)  DEFAULT 'SUCCESS',
  created_at TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_karinderya ON products(karinderya_id);
CREATE INDEX IF NOT EXISTS idx_orders_karinderya   ON orders(karinderya_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created  ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_karinderyas_status  ON karinderyas(status);
