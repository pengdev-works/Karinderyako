-- ============================================================
-- KarinderyaKo — PostgreSQL Database Schema
-- Redesigned for Marketplace Food Delivery Platform
-- ============================================================

-- 1. Users Table (Customers, Owners, Riders, Admins)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('CUSTOMER', 'OWNER', 'RIDER', 'ADMIN')),
  phone         VARCHAR(30),
  address       TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 2. Food Businesses / Karinderyas Table
CREATE TABLE IF NOT EXISTS karinderyas (
  id              SERIAL PRIMARY KEY,
  owner_user_id   INT REFERENCES users(id) ON DELETE SET NULL,
  name            VARCHAR(200) NOT NULL,
  owner_name      VARCHAR(150),
  email           VARCHAR(255),
  phone           VARCHAR(30),
  category        VARCHAR(50)  NOT NULL DEFAULT 'Filipino Food',
  address         VARCHAR(300) NOT NULL,
  description     TEXT,
  photo           TEXT DEFAULT 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  logo            TEXT DEFAULT 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80',
  status          VARCHAR(20)  DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  app_status      VARCHAR(20)  DEFAULT 'APPROVED' CHECK (app_status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  rating          DECIMAL(3,1) DEFAULT 4.8,
  review_count    INT          DEFAULT 12,
  delivery_fee    DECIMAL(10,2) DEFAULT 30.00,
  prep_time       VARCHAR(30)  DEFAULT '20–30 min',
  operating_hours VARCHAR(100) DEFAULT '8:00 AM - 8:00 PM',
  delivery_area   VARCHAR(200) DEFAULT 'Poblacion, Laang & Nearby Barangays',
  verified        BOOLEAN      DEFAULT TRUE,
  created_at      TIMESTAMP    DEFAULT NOW()
);

-- 3. Menu Products Table
CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  karinderya_id INT REFERENCES karinderyas(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  category      VARCHAR(50)   DEFAULT 'Popular',
  photo         TEXT DEFAULT 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80',
  available     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 4. Customer Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id               VARCHAR(25)   PRIMARY KEY,
  karinderya_id    INT REFERENCES karinderyas(id) ON DELETE SET NULL,
  karinderya_name  VARCHAR(200),
  customer_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  customer_name    VARCHAR(150) NOT NULL,
  customer_phone   VARCHAR(30)  NOT NULL,
  delivery_address TEXT         NOT NULL,
  landmark         TEXT,
  delivery_notes   TEXT,
  subtotal         DECIMAL(10,2) NOT NULL,
  delivery_fee     DECIMAL(10,2) DEFAULT 30.00,
  total_amount     DECIMAL(10,2) NOT NULL,
  payment_method   VARCHAR(20)  DEFAULT 'COD',
  payment_status   VARCHAR(50)  DEFAULT 'PENDING (COD)',
  order_status     VARCHAR(30)  DEFAULT 'PLACED' CHECK (order_status IN ('PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
  rider_id         INT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- 5. Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      VARCHAR(25) REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INT REFERENCES products(id) ON DELETE SET NULL,
  product_name  VARCHAR(200) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  qty           INT NOT NULL DEFAULT 1,
  notes         TEXT
);

-- 6. Customer Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  order_id      VARCHAR(25) REFERENCES orders(id) ON DELETE CASCADE,
  karinderya_id INT REFERENCES karinderyas(id) ON DELETE CASCADE,
  user_id       INT REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(150) NOT NULL,
  rating        INT CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  reply         TEXT,
  reply_at      TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 7. Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id) ON DELETE CASCADE,
  karinderya_id INT REFERENCES karinderyas(id) ON DELETE CASCADE,
  created_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, karinderya_id)
);

-- 8. Applications Table (Business & Rider Registration Requests)
CREATE TABLE IF NOT EXISTS applications (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  owner_name    VARCHAR(150),
  address       VARCHAR(300) NOT NULL,
  category      VARCHAR(50)  DEFAULT 'Filipino Food',
  description   TEXT,
  role_type     VARCHAR(30)  NOT NULL CHECK (role_type IN ('Karinderya Owner', 'Delivery Rider')),
  email         VARCHAR(255),
  password_hash VARCHAR(255),
  vehicle       VARCHAR(200),
  app_status    VARCHAR(20)  DEFAULT 'PENDING',
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- 9. Security & Action Audit Logs
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
CREATE INDEX IF NOT EXISTS idx_orders_customer     ON orders(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_karinderya  ON reviews(karinderya_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user      ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created  ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_karinderyas_status  ON karinderyas(status);
CREATE INDEX IF NOT EXISTS idx_karinderyas_app     ON karinderyas(app_status);
