/**
 * KarinderyaKo — REST API Routes (Neon PostgreSQL)
 * Redesigned for Marketplace Food Delivery Platform
 */
const express = require('express');
const bcrypt  = require('bcryptjs');
const pool    = require('../db/pool');

const router = express.Router();

// ── HELPER: Audit Logger ─────────────────────────────────────
async function audit(userRole, action, details, status = 'SUCCESS') {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_role, action, details, status) VALUES ($1, $2, $3, $4)',
      [userRole, action, details, status]
    );
  } catch (_) { /* non-critical */ }
}

// Auto-migrate business permit columns if not present
(async () => {
  try {
    await pool.query(`
      ALTER TABLE karinderyas ADD COLUMN IF NOT EXISTS business_permit TEXT;
      ALTER TABLE karinderyas ADD COLUMN IF NOT EXISTS sanitary_permit TEXT;
      ALTER TABLE karinderyas ADD COLUMN IF NOT EXISTS government_id TEXT;
      ALTER TABLE karinderyas ADD COLUMN IF NOT EXISTS dti_permit TEXT;
      ALTER TABLE karinderyas ADD COLUMN IF NOT EXISTS permit_status VARCHAR(30) DEFAULT 'PENDING_UPLOAD';
      ALTER TABLE karinderyas ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `);
  } catch (err) {
    console.warn('Permit columns migration notice:', err.message);
  }
})();

// ── HELPER: Geofence Check (Poblacion, Laang, Abra) ───────────
function isInGeofence(address) {
  if (!address) return true;
  const addr = address.toLowerCase();
  return addr.includes('poblacion') || addr.includes('laang') || addr.includes('abra');
}

// =============================================================
// AUTH ROUTES
// =============================================================

/**
 * POST /api/auth/login
 */
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const cleanEmail = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      await audit('PUBLIC', 'LOGIN_FAILED', `No account found for ${cleanEmail}`, 'BLOCKED');
      return res.status(401).json({ error: 'Account not found. Please register first.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      await audit('PUBLIC', 'LOGIN_FAILED', `Wrong password for ${cleanEmail}`, 'BLOCKED');
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // If store owner, fetch their associated business profile
    let karinderya = null;
    if (user.role === 'OWNER') {
      const kRes = await pool.query(
        'SELECT * FROM karinderyas WHERE owner_user_id = $1 LIMIT 1',
        [user.id]
      );
      karinderya = kRes.rows[0] || null;
    }

    await audit(user.role, 'USER_LOGIN', `${user.name} logged in as ${user.role}`, 'SUCCESS');

    res.json({
      id:         user.id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
      phone:      user.phone,
      address:    user.address,
      karinderya: karinderya,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

/**
 * POST /api/auth/register/customer
 */
router.post('/auth/register/customer', async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required.' });

  try {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'This email is already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, address)
       VALUES ($1, $2, $3, 'CUSTOMER', $4, $5)
       RETURNING id, name, email, role, phone, address`,
      [name, cleanEmail, passwordHash, phone || '', address || 'Poblacion, Laang, Abra']
    );

    const newUser = userRes.rows[0];
    await audit('CUSTOMER', 'CUSTOMER_REGISTER', `Customer "${name}" registered (${cleanEmail})`, 'SUCCESS');

    res.status(201).json({
      message: 'Account created successfully!',
      user: newUser,
    });
  } catch (err) {
    console.error('Customer registration error:', err);
    res.status(500).json({ error: 'Failed to create customer account.' });
  }
});

/**
 * POST /api/auth/register/vendor
 */
router.post('/auth/register/vendor', async (req, res) => {
  const { name, ownerName, address, category, description, email, password, phone, operatingHours, deliveryArea } = req.body;

  if (!name || !ownerName || !address || !email || !password)
    return res.status(400).json({ error: 'All primary business fields are required.' });

  if (!isInGeofence(address)) {
    await audit('PUBLIC', 'GEOFENCE_REJECT', `Vendor reg rejected — address out of zone: "${address}"`, 'BLOCKED');
    return res.status(400).json({ error: 'GEOFENCE REJECTION: Business must be in Poblacion, Laang, Abra area.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'This email is already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. User
      const userRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role, phone, address)
         VALUES ($1, $2, $3, 'OWNER', $4, $5)
         RETURNING *`,
        [ownerName, cleanEmail, passwordHash, phone || '', address]
      );
      const newUser = userRes.rows[0];

      // 2. Karinderya (Set to APPROVED for demo instant access)
      const kRes = await client.query(
        `INSERT INTO karinderyas (
           owner_user_id, name, owner_name, email, phone, category, address, description,
           operating_hours, delivery_area, app_status, verified
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'APPROVED', TRUE)
         RETURNING *`,
        [
          newUser.id, name, ownerName, cleanEmail, phone || '',
          category || 'Filipino Food', address,
          description || 'Local home food business in Poblacion, Laang, Abra.',
          operatingHours || '8:00 AM - 8:00 PM',
          deliveryArea || 'Poblacion, Laang & Nearby Barangays'
        ]
      );

      // 3. Application Record
      await client.query(
        `INSERT INTO applications (name, owner_name, address, category, description, role_type, email, password_hash, app_status)
         VALUES ($1, $2, $3, $4, $5, 'Karinderya Owner', $6, $7, 'APPROVED')`,
        [name, ownerName, address, category || 'Filipino Food', description || '', cleanEmail, passwordHash]
      );

      await client.query('COMMIT');
      await audit('PUBLIC', 'VENDOR_REGISTRATION', `Food business "${name}" registered for ${ownerName}`, 'SUCCESS');

      res.status(201).json({ message: `Business registered successfully! Log in with ${cleanEmail}.` });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Vendor registration error:', err);
    res.status(500).json({ error: 'Failed to register food business.' });
  }
});

// =============================================================
// PUBLIC MARKETPLACE ROUTES
// =============================================================

/**
 * GET /api/restaurants
 * Returns list of approved food businesses
 */
router.get('/restaurants', async (req, res) => {
  const { category, search, open_now, sort } = req.query;

  try {
    let query = `
      SELECT k.*, 
             (SELECT COUNT(*) FROM products p WHERE p.karinderya_id = k.id AND p.available = TRUE) as product_count
      FROM karinderyas k
      WHERE k.app_status = 'APPROVED'
    `;
    const params = [];

    if (category && category !== 'ALL') {
      params.push(category);
      query += ` AND k.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      query += ` AND (k.name ILIKE $${params.length} OR k.description ILIKE $${params.length} OR k.category ILIKE $${params.length})`;
    }

    if (open_now === 'true') {
      query += ` AND k.status = 'open'`;
    }

    // Sort order
    if (sort === 'rating') {
      query += ` ORDER BY k.rating DESC NULLS LAST, k.review_count DESC`;
    } else if (sort === 'delivery_fee') {
      query += ` ORDER BY k.delivery_fee ASC`;
    } else {
      query += ` ORDER BY k.status DESC, k.rating DESC NULLS LAST, k.id ASC`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch restaurants error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants.' });
  }
});

/**
 * GET /api/restaurants/:id
 * Single restaurant profile
 */
router.get('/restaurants/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const kRes = await pool.query('SELECT * FROM karinderyas WHERE id = $1 LIMIT 1', [id]);
    if (kRes.rows.length === 0)
      return res.status(404).json({ error: 'Restaurant not found.' });

    const restaurant = kRes.rows[0];

    // Fetch store reviews
    const reviewsRes = await pool.query(
      'SELECT * FROM reviews WHERE karinderya_id = $1 ORDER BY created_at DESC LIMIT 20',
      [id]
    );

    res.json({
      ...restaurant,
      reviews: reviewsRes.rows,
    });
  } catch (err) {
    console.error('Fetch restaurant error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurant details.' });
  }
});

/**
 * GET /api/restaurants/:id/menu
 * Single restaurant's menu items
 */
router.get('/restaurants/:id/menu', async (req, res) => {
  const { id } = req.params;

  try {
    const productsRes = await pool.query(
      'SELECT * FROM products WHERE karinderya_id = $1 ORDER BY category ASC, id ASC',
      [id]
    );

    res.json(productsRes.rows);
  } catch (err) {
    console.error('Fetch menu error:', err);
    res.status(500).json({ error: 'Failed to fetch menu items.' });
  }
});

// =============================================================
// ORDER & CHECKOUT ROUTES
// =============================================================

/**
 * POST /api/orders
 * Customer places an order for ONE specific restaurant
 */
router.post('/orders', async (req, res) => {
  const {
    karinderyaId,
    customerUserId,
    customerName,
    customerPhone,
    deliveryAddress,
    landmark,
    deliveryNotes,
    items,
    paymentMethod,
  } = req.body;

  if (!customerUserId || isNaN(Number(customerUserId)) || Number(customerUserId) <= 0) {
    return res.status(401).json({ error: 'Customer login is required to place a secure order.' });
  }

  if (!karinderyaId || !customerName || !customerPhone || !deliveryAddress || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required order details or items.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 0. Verify customer user exists
    const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [Number(customerUserId)]);
    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(401).json({ error: 'Invalid or expired customer account session. Please log in again.' });
    }

    // 1. Fetch restaurant
    const kRes = await client.query('SELECT * FROM karinderyas WHERE id = $1 LIMIT 1', [karinderyaId]);
    if (kRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Target food business not found.' });
    }
    const karinderya = kRes.rows[0];

    // 2. Calculate subtotal & delivery fee
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.price) * Number(item.qty);
    }
    const deliveryFee = Number(karinderya.delivery_fee || 30.00);
    const totalAmount = subtotal + deliveryFee;

    // Generate unique order ID
    const orderId = `KK-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Insert Order
    await client.query(
      `INSERT INTO orders (
         id, karinderya_id, karinderya_name, customer_user_id, customer_name, customer_phone,
         delivery_address, landmark, delivery_notes, subtotal, delivery_fee, total_amount,
         payment_method, payment_status, order_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'PLACED')`,
      [
        orderId,
        karinderya.id,
        karinderya.name,
        customerUserId || null,
        customerName,
        customerPhone,
        deliveryAddress,
        landmark || '',
        deliveryNotes || '',
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod || 'COD',
        paymentMethod === 'E-WALLET' ? 'RECORDED (E-WALLET)' : 'PENDING (COD)',
      ]
    );

    // 4. Insert Order Items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, qty, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.productId || null, item.name, item.price, item.qty, item.notes || '']
      );
    }

    await client.query('COMMIT');
    await audit('CUSTOMER', 'ORDER_PLACED', `Order ${orderId} placed for ${karinderya.name} (₱${totalAmount})`, 'SUCCESS');

    res.status(201).json({
      orderId,
      message: 'Order placed successfully!',
      totalAmount,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order placement error:', err);
    res.status(500).json({ error: 'Failed to place order.' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/orders
 * Returns customer's orders or owner's store orders
 */
router.get('/orders', async (req, res) => {
  const { customerUserId, karinderyaId } = req.query;

  try {
    const validKarinderyaId = Number(karinderyaId);
    const validCustomerId = Number(customerUserId);

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (karinderyaId && !isNaN(validKarinderyaId) && validKarinderyaId > 0) {
      params.push(validKarinderyaId);
      query += ` AND karinderya_id = $${params.length}`;
    } else if (customerUserId && !isNaN(validCustomerId) && validCustomerId > 0) {
      params.push(validCustomerId);
      query += ` AND customer_user_id = $${params.length}`;
    } else {
      // If no valid ID is provided or user is not logged in / undefined, return empty array cleanly
      return res.json([]);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

/**
 * GET /api/orders/:id
 * Single order details with items
 */
router.get('/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id]);
    if (orderRes.rows.length === 0)
      return res.status(404).json({ error: 'Order not found.' });

    const order = orderRes.rows[0];
    const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);

    res.json({
      ...order,
      items: itemsRes.rows,
    });
  } catch (err) {
    console.error('Fetch order detail error:', err);
    res.status(500).json({ error: 'Failed to fetch order details.' });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Update status (PLACED -> ACCEPTED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED)
 */
router.patch('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, userRole } = req.body;

  const validStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status.' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Order not found.' });

    const updatedOrder = result.rows[0];
    await audit(userRole || 'OWNER', 'ORDER_STATUS_UPDATE', `Order ${id} status updated to ${status}`, 'SUCCESS');

    res.json(updatedOrder);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// =============================================================
// FAVORITES & REVIEWS
// =============================================================

/**
 * GET /api/favorites
 */
router.get('/favorites', async (req, res) => {
  const { userId } = req.query;
  const validUserId = Number(userId);
  if (!userId || isNaN(validUserId) || validUserId <= 0) return res.json([]);

  try {
    const result = await pool.query(
      `SELECT k.* FROM favorites f 
       JOIN karinderyas k ON f.karinderya_id = k.id 
       WHERE f.user_id = $1`,
      [validUserId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch favorites error:', err);
    res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
});

/**
 * POST /api/favorites/toggle
 */
router.post('/favorites/toggle', async (req, res) => {
  const { userId, karinderyaId } = req.body;
  if (!userId || !karinderyaId)
    return res.status(400).json({ error: 'User ID and Karinderya ID required.' });

  try {
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND karinderya_id = $2',
      [userId, karinderyaId]
    );

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE id = $1', [existing.rows[0].id]);
      return res.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      await pool.query(
        'INSERT INTO favorites (user_id, karinderya_id) VALUES ($1, $2)',
        [userId, karinderyaId]
      );
      return res.json({ isFavorite: true, message: 'Added to favorites' });
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
});

/**
 * POST /api/reviews
 */
router.post('/reviews', async (req, res) => {
  const { orderId, karinderyaId, userId, customerName, rating, comment } = req.body;

  if (!orderId || !karinderyaId || !rating) {
    return res.status(400).json({ error: 'Order ID, restaurant ID, and rating are required.' });
  }

  try {
    const reviewRes = await pool.query(
      `INSERT INTO reviews (order_id, karinderya_id, user_id, customer_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [orderId, karinderyaId, userId || null, customerName || 'Customer', rating, comment || '']
    );

    // Update restaurant average rating
    await pool.query(
      `UPDATE karinderyas 
       SET rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE karinderya_id = $1),
           review_count = (SELECT COUNT(*) FROM reviews WHERE karinderya_id = $1)
       WHERE id = $1`,
      [karinderyaId]
    );

    res.status(201).json(reviewRes.rows[0]);
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// =============================================================
// RESTAURANT OWNER PORTAL ROUTES (STRICT DATA ISOLATION)
// =============================================================

/**
 * GET /api/owner/restaurant
 */
router.get('/owner/restaurant', async (req, res) => {
  const { ownerUserId } = req.query;
  const validOwnerId = Number(ownerUserId);
  if (!ownerUserId || isNaN(validOwnerId) || validOwnerId <= 0) {
    return res.status(400).json({ error: 'Valid owner user ID required.' });
  }

  try {
    const kRes = await pool.query('SELECT * FROM karinderyas WHERE owner_user_id = $1 LIMIT 1', [validOwnerId]);
    if (kRes.rows.length === 0) return res.status(404).json({ error: 'No business registered under this account.' });

    res.json(kRes.rows[0]);
  } catch (err) {
    console.error('Fetch owner store error:', err);
    res.status(500).json({ error: 'Failed to fetch store details.' });
  }
});

/**
 * PUT /api/owner/restaurant
 */
router.put('/owner/restaurant', async (req, res) => {
  const { ownerUserId, name, phone, address, description, category, prepTime, operatingHours, photo, logo, status } = req.body;

  if (!ownerUserId) return res.status(400).json({ error: 'Owner user ID required.' });

  try {
    const result = await pool.query(
      `UPDATE karinderyas
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           description = COALESCE($4, description),
           category = COALESCE($5, category),
           prep_time = COALESCE($6, prep_time),
           operating_hours = COALESCE($7, operating_hours),
           photo = COALESCE($8, photo),
           logo = COALESCE($9, logo),
           status = COALESCE($10, status)
       WHERE owner_user_id = $11
       RETURNING *`,
      [name, phone, address, description, category, prepTime, operatingHours, photo, logo, status, ownerUserId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Store not found.' });

    await audit('OWNER', 'UPDATE_STORE_PROFILE', `Owner updated store profile for "${result.rows[0].name}"`, 'SUCCESS');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update store profile error:', err);
    res.status(500).json({ error: 'Failed to update store profile.' });
  }
});

/**
 * POST /api/owner/documents
 * Upload Business Permit, Sanitary Permit, Valid ID, and DTI certificate
 */
router.post('/owner/documents', async (req, res) => {
  const { ownerUserId, karinderyaId, businessPermit, sanitaryPermit, governmentId, dtiPermit } = req.body;

  if (!ownerUserId && !karinderyaId) {
    return res.status(400).json({ error: 'Owner user ID or Store ID is required.' });
  }

  if (!businessPermit || !sanitaryPermit || !governmentId) {
    return res.status(400).json({
      error: 'Please upload all 3 required documents: Mayor\'s / Business Permit, Sanitary / Health Permit, and Valid Government ID.'
    });
  }

  try {
    const result = await pool.query(
      `UPDATE karinderyas
       SET business_permit = COALESCE($1, business_permit),
           sanitary_permit = COALESCE($2, sanitary_permit),
           government_id = COALESCE($3, government_id),
           dti_permit = COALESCE($4, dti_permit),
           permit_status = 'UNDER_REVIEW',
           verified = TRUE
       WHERE owner_user_id = $5 OR id = $6
       RETURNING *`,
      [businessPermit, sanitaryPermit, governmentId, dtiPermit, ownerUserId || null, karinderyaId || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Food business not found.' });
    }

    await audit('OWNER', 'UPLOAD_PERMITS', `Uploaded compliance permits for "${result.rows[0].name}"`, 'SUCCESS');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Upload documents error:', err);
    res.status(500).json({ error: 'Failed to upload business permits.' });
  }
});

/**
 * POST /api/owner/menu
 */
router.post('/owner/menu', async (req, res) => {
  const { karinderyaId, ownerUserId, name, description, price, category, photo } = req.body;

  if (!karinderyaId || !name || !price)
    return res.status(400).json({ error: 'Restaurant ID, item name, and price are required.' });

  try {
    // Ownership check & Document Compliance Check
    const kRes = await pool.query('SELECT * FROM karinderyas WHERE id = $1', [karinderyaId]);
    if (kRes.rows.length === 0 || (ownerUserId && String(kRes.rows[0].owner_user_id) !== String(ownerUserId))) {
      return res.status(403).json({ error: 'FORBIDDEN: You do not own this restaurant.' });
    }

    const store = kRes.rows[0];
    // Enforce business permit & sanitary permit & government ID before adding food
    if (!store.business_permit || !store.sanitary_permit || !store.government_id) {
      return res.status(403).json({
        error: 'Compliance requirement: You must upload your Mayor\'s / Business Permit, Sanitary / Health Permit, and Valid Government ID before you can add food items to your menu.'
      });
    }

    const prodRes = await pool.query(
      `INSERT INTO products (karinderya_id, name, description, price, category, photo, available)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING *`,
      [
        karinderyaId,
        name,
        description || '',
        price,
        category || 'Popular',
        photo || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80'
      ]
    );

    await audit('OWNER', 'ADD_MENU_ITEM', `Added product "${name}" to store #${karinderyaId}`, 'SUCCESS');
    res.status(201).json(prodRes.rows[0]);
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Failed to add menu item.' });
  }
});

/**
 * PATCH /api/owner/menu/:id/toggle
 */
router.patch('/owner/menu/:id/toggle', async (req, res) => {
  const { id } = req.params;

  try {
    const prodRes = await pool.query(
      'UPDATE products SET available = NOT available WHERE id = $1 RETURNING *',
      [id]
    );
    if (prodRes.rows.length === 0) return res.status(404).json({ error: 'Menu item not found.' });

    res.json(prodRes.rows[0]);
  } catch (err) {
    console.error('Toggle menu item error:', err);
    res.status(500).json({ error: 'Failed to update item availability.' });
  }
});

/**
 * DELETE /api/owner/menu/:id
 */
router.delete('/owner/menu/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Menu item deleted.' });
  } catch (err) {
    console.error('Delete menu item error:', err);
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

/**
 * POST /api/owner/reviews/:id/reply
 */
router.post('/owner/reviews/:id/reply', async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) return res.status(400).json({ error: 'Reply text required.' });

  try {
    const reviewRes = await pool.query(
      `UPDATE reviews SET reply = $1, reply_at = NOW() WHERE id = $2 RETURNING *`,
      [reply, id]
    );

    if (reviewRes.rows.length === 0) return res.status(404).json({ error: 'Review not found.' });

    res.json(reviewRes.rows[0]);
  } catch (err) {
    console.error('Reply to review error:', err);
    res.status(500).json({ error: 'Failed to post review reply.' });
  }
});

// =============================================================
// PLATFORM ADMIN ROUTES
// =============================================================

/**
 * GET /api/admin/restaurants
 */
router.get('/admin/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM karinderyas ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch admin restaurants error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants for admin.' });
  }
});

/**
 * PATCH /api/admin/restaurants/:id/status
 */
router.patch('/admin/restaurants/:id/status', async (req, res) => {
  const { id } = req.params;
  const { appStatus } = req.body;

  if (!['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(appStatus)) {
    return res.status(400).json({ error: 'Invalid app status.' });
  }

  try {
    const result = await pool.query(
      'UPDATE karinderyas SET app_status = $1 WHERE id = $2 RETURNING *',
      [appStatus, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Restaurant not found.' });

    await audit('ADMIN', 'UPDATE_BUSINESS_STATUS', `Updated business #${id} status to ${appStatus}`, 'SUCCESS');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Admin update status error:', err);
    res.status(500).json({ error: 'Failed to update business status.' });
  }
});

/**
 * GET /api/admin/users
 */
router.get('/admin/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, phone, address, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

/**
 * GET /api/admin/reports
 */
router.get('/admin/reports', async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const storesCount = await pool.query('SELECT COUNT(*) FROM karinderyas WHERE app_status = \'APPROVED\'');
    const ordersCount = await pool.query('SELECT COUNT(*), COALESCE(SUM(total_amount), 0) as gross_revenue FROM orders');

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      approvedStores: parseInt(storesCount.rows[0].count),
      totalOrders: parseInt(ordersCount.rows[0].count),
      grossRevenue: parseFloat(ordersCount.rows[0].gross_revenue),
    });
  } catch (err) {
    console.error('Fetch reports error:', err);
    res.status(500).json({ error: 'Failed to fetch admin reports.' });
  }
});

/**
 * GET /api/admin/applications
 */
router.get('/admin/applications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM applications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

/**
 * GET /api/admin/audit-logs
 */
router.get('/admin/audit-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

module.exports = router;
