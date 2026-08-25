/**
 * KarinderyaKo — REST API Routes (Neon PostgreSQL)
 * All data operations use real SQL queries via pg Pool
 */
const express  = require('express');
const bcrypt   = require('bcryptjs');
const pool     = require('../db/pool');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// HELPER: Write to audit_logs table
// ─────────────────────────────────────────────────────────────
async function audit(userRole, action, details, status = 'SUCCESS') {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_role, action, details, status) VALUES ($1, $2, $3, $4)',
      [userRole, action, details, status]
    );
  } catch (_) { /* non-critical, don't fail the request */ }
}

// ─────────────────────────────────────────────────────────────
// HELPER: Geofence validator for Poblacion, Laang, Abra
// ─────────────────────────────────────────────────────────────
function isInGeofence(address) {
  const addr = (address || '').toLowerCase();
  return addr.includes('poblacion') && (addr.includes('laang') || addr.includes('abra'));
}

// =============================================================
// AUTH ROUTES
// =============================================================

/**
 * POST /api/auth/login
 * Authenticate owner / rider / admin
 * Body: { email, password }
 */
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      await audit('PUBLIC', 'LOGIN_FAILED', `No account found for ${email}`, 'BLOCKED');
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      await audit('PUBLIC', 'LOGIN_FAILED', `Wrong password for ${email}`, 'BLOCKED');
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If owner, fetch their karinderya
    let karinderya = null;
    if (user.role === 'OWNER') {
      const kRes = await pool.query(
        'SELECT * FROM karinderyas WHERE owner_user_id = $1 AND verified = TRUE LIMIT 1',
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
      karinderya: karinderya,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

/**
 * POST /api/auth/register/vendor
 * Submit karinderya owner registration (goes to pending applications)
 * Body: { name, ownerName, address, category, description, email, password }
 */
router.post('/auth/register/vendor', async (req, res) => {
  const { name, ownerName, address, category, description, email, password } = req.body;

  if (!name || !ownerName || !address || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  if (!isInGeofence(address)) {
    await audit('PUBLIC', 'GEOFENCE_REJECT', `Vendor reg rejected — address out of zone: "${address}"`, 'BLOCKED');
    return res.status(400).json({ error: 'GEOFENCE REJECTION: Business must be in Poblacion, Laang, Abra.' });
  }

  try {
    // Check if email is already registered
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'This email is already registered.' });

    await pool.query(
      `INSERT INTO applications (name, owner_name, address, category, description, role_type, email)
       VALUES ($1, $2, $3, $4, $5, 'Karinderya Owner', $6)`,
      [name, ownerName, address, category || 'Luto-Bahay', description || '', email.toLowerCase()]
    );

    await audit('PUBLIC', 'VENDOR_REGISTRATION', `Application submitted for "${name}" in Poblacion`, 'PENDING_APPROVAL');
    res.status(201).json({ message: `Application for "${name}" submitted! Pending admin approval.` });
  } catch (err) {
    console.error('Vendor registration error:', err);
    res.status(500).json({ error: 'Failed to submit vendor application.' });
  }
});

/**
 * POST /api/auth/register/rider
 * Submit delivery rider registration
 * Body: { name, vehicle, email, password }
 */
router.post('/auth/register/rider', async (req, res) => {
  const { name, vehicle, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'This email is already registered.' });

    await pool.query(
      `INSERT INTO applications (name, address, vehicle, role_type, email)
       VALUES ($1, 'Poblacion, Laang, Abra', $2, 'Delivery Rider', $3)`,
      [name, vehicle || '', email.toLowerCase()]
    );

    await audit('PUBLIC', 'RIDER_REGISTRATION', `Rider application submitted for "${name}"`, 'PENDING_APPROVAL');
    res.status(201).json({ message: `Rider application for "${name}" submitted! Pending admin approval.` });
  } catch (err) {
    console.error('Rider registration error:', err);
    res.status(500).json({ error: 'Failed to submit rider application.' });
  }
});

// =============================================================
// PUBLIC ROUTES — Karinderyas & Menus
// =============================================================

/**
 * GET /api/karinderyas
 * List all approved, verified karinderyas (with optional filters)
 * Query: ?category=Luto-Bahay&search=nena
 */
router.get('/karinderyas', async (req, res) => {
  const { category, search } = req.query;

  let query = 'SELECT * FROM karinderyas WHERE verified = TRUE';
  const params = [];

  if (category && category !== 'ALL') {
    params.push(category);
    query += ` AND UPPER(category) = UPPER($${params.length})`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
  }

  query += ' ORDER BY created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch karinderyas error:', err);
    res.status(500).json({ error: 'Failed to fetch karinderyas.' });
  }
});

/**
 * GET /api/karinderyas/:id/menu
 * Get all available menu items for a specific karinderya
 */
router.get('/karinderyas/:id/menu', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE karinderya_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch menu error:', err);
    res.status(500).json({ error: 'Failed to fetch menu.' });
  }
});

// =============================================================
// ORDER ROUTES — Customer
// =============================================================

/**
 * POST /api/orders
 * Place a new customer order (geofence enforced)
 * Body: { karinderyaId, karinderyaName, customerName, customerPhone, deliveryAddress, items, paymentMethod }
 */
router.post('/orders', async (req, res) => {
  const {
    karinderyaId, karinderyaName, customerName,
    customerPhone, deliveryAddress, items, paymentMethod
  } = req.body;

  if (!deliveryAddress || !items || items.length === 0)
    return res.status(400).json({ error: 'Delivery address and cart items are required.' });

  if (!isInGeofence(deliveryAddress)) {
    await audit('PUBLIC', 'GEOFENCE_REJECT', `Order rejected — address out of zone: "${deliveryAddress}"`, 'BLOCKED');
    return res.status(400).json({ error: 'GEOFENCE REJECTION: Delivery must be within Poblacion, Laang, Abra.' });
  }

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const subtotal = items.reduce((s, i) => s + (i.price * i.qty), 0);
  const deliveryFee = 25.00;
  const totalAmount = subtotal + deliveryFee;
  const paymentStatus = paymentMethod === 'GCASH' ? 'PAID (Simulated)' : 'PENDING (COD)';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert order
    await client.query(
      `INSERT INTO orders
        (id, karinderya_id, karinderya_name, customer_name, customer_phone,
         delivery_address, subtotal, delivery_fee, total_amount,
         payment_method, payment_status, order_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'PLACED')`,
      [orderId, karinderyaId, karinderyaName, customerName, customerPhone,
       deliveryAddress, subtotal, deliveryFee, totalAmount, paymentMethod, paymentStatus]
    );

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, qty)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.id || null, item.name, item.price, item.qty]
      );
    }

    await client.query('COMMIT');
    await audit('PUBLIC', 'ORDER_PLACED', `Order ${orderId} placed via ${paymentMethod} for ${customerName}`, 'SUCCESS');

    // Return the full order
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    const orderItemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

    res.status(201).json({
      message: `Order ${orderId} placed successfully!`,
      order: { ...orderResult.rows[0], items: orderItemsResult.rows },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order error:', err);
    res.status(500).json({ error: 'Failed to place order.' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/orders
 * Get orders — filtered by role
 * Query: ?karinderyaId=1 (for owner) | ?all=true (for rider/admin)
 */
router.get('/orders', async (req, res) => {
  const { karinderyaId, all } = req.query;
  try {
    let query = 'SELECT * FROM orders';
    const params = [];

    if (karinderyaId) {
      params.push(karinderyaId);
      query += ` WHERE karinderya_id = $1`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Update order delivery status
 * Body: { status, userRole }
 */
router.patch('/orders/:id/status', async (req, res) => {
  const { status, userRole } = req.body;
  const validStatuses = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  if (!validStatuses.includes(status))
    return res.status(400).json({ error: 'Invalid status value.' });

  try {
    const paymentStatus = status === 'DELIVERED' ? 'PAID (COD Collected)' : undefined;

    const result = await pool.query(
      `UPDATE orders
       SET order_status = $1 ${paymentStatus ? ', payment_status = $3' : ''}
       WHERE id = $2
       RETURNING *`,
      paymentStatus
        ? [status, req.params.id, paymentStatus]
        : [status, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Order not found.' });

    await audit(userRole || 'RIDER', 'ORDER_STATUS_UPDATE', `Order ${req.params.id} → ${status}`, 'SUCCESS');
    res.json({ message: 'Order status updated.', order: result.rows[0] });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// =============================================================
// PRODUCT / MENU ROUTES — Owner
// =============================================================

/**
 * POST /api/products
 * Owner adds a new dish to their menu
 * Body: { karinderyaId, name, description, price, category, photo }
 */
router.post('/products', async (req, res) => {
  const { karinderyaId, name, description, price, category, photo } = req.body;

  if (!karinderyaId || !name || !price)
    return res.status(400).json({ error: 'Karinderya ID, dish name, and price are required.' });

  try {
    const result = await pool.query(
      `INSERT INTO products (karinderya_id, name, description, price, category, photo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        karinderyaId, name, description || '',
        parseFloat(price), category || 'Luto-Bahay',
        photo || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'
      ]
    );

    await audit('OWNER', 'MENU_ADD_DISH', `Added dish "${name}" at ₱${parseFloat(price).toFixed(2)}`, 'SUCCESS');
    res.status(201).json({ message: 'Dish added to menu.', product: result.rows[0] });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Failed to add dish.' });
  }
});

/**
 * PATCH /api/products/:id/toggle
 * Toggle dish availability (in stock / sold out)
 */
router.patch('/products/:id/toggle', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE products SET available = NOT available WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Product not found.' });

    const p = result.rows[0];
    await audit('OWNER', 'STOCK_TOGGLE', `"${p.name}" set to available=${p.available}`, 'SUCCESS');
    res.json({ message: 'Stock status updated.', product: p });
  } catch (err) {
    console.error('Toggle product error:', err);
    res.status(500).json({ error: 'Failed to toggle product.' });
  }
});

// =============================================================
// ADMIN ROUTES
// =============================================================

/**
 * GET /api/admin/applications
 * Get all pending vendor/rider applications
 */
router.get('/admin/applications', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM applications WHERE app_status = 'PENDING' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

/**
 * POST /api/admin/applications/:id/approve
 * Admin approves a pending vendor or rider application
 */
router.post('/admin/applications/:id/approve', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the application
    const appResult = await client.query(
      'SELECT * FROM applications WHERE id = $1 AND app_status = $2',
      [req.params.id, 'PENDING']
    );

    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found or already processed.' });
    }

    const app = appResult.rows[0];

    // Generate a password for the new account
    const defaultPassword = app.role_type === 'Karinderya Owner' ? 'owner123' : 'rider123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const role = app.role_type === 'Karinderya Owner' ? 'OWNER' : 'RIDER';

    // Create the user account
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [app.owner_name || app.name, app.email || `${app.name.toLowerCase().replace(/\s/g, '')}@karinderyako.ph`, passwordHash, role]
    );

    const newUser = userResult.rows[0];
    let karinderya = null;

    // If vendor, also create the karinderya listing
    if (app.role_type === 'Karinderya Owner') {
      const kResult = await client.query(
        `INSERT INTO karinderyas
          (owner_user_id, name, category, address, description, verified)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING *`,
        [newUser.id, app.name, app.category, app.address, app.description || 'Home-based Karinderya in Poblacion, Laang, Abra.']
      );
      karinderya = kResult.rows[0];
    }

    // Mark application as approved
    await client.query(
      `UPDATE applications SET app_status = 'APPROVED' WHERE id = $1`,
      [req.params.id]
    );

    await client.query('COMMIT');
    await audit('ADMIN', 'ADMIN_APPROVE', `Approved ${app.role_type} "${app.name}"`, 'SUCCESS');

    res.json({
      message: `Application for "${app.name}" approved! Account created.`,
      user: { id: newUser.id, name: newUser.name, role: newUser.role },
      karinderya,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Approve application error:', err);
    res.status(500).json({ error: 'Failed to approve application.' });
  } finally {
    client.release();
  }
});

/**
 * POST /api/admin/applications/:id/reject
 * Admin rejects a pending application
 */
router.post('/admin/applications/:id/reject', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE applications SET app_status = 'REJECTED' WHERE id = $1 AND app_status = 'PENDING' RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Application not found or already processed.' });

    await audit('ADMIN', 'ADMIN_REJECT', `Rejected application for "${result.rows[0].name}"`, 'BLOCKED');
    res.json({ message: 'Application rejected.' });
  } catch (err) {
    console.error('Reject application error:', err);
    res.status(500).json({ error: 'Failed to reject application.' });
  }
});

/**
 * GET /api/admin/audit-logs
 * Fetch recent security audit logs
 */
router.get('/admin/audit-logs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

/**
 * POST /api/audit
 * Log a security event from the frontend
 * Body: { userRole, action, details, status }
 */
router.post('/audit', async (req, res) => {
  const { userRole, action, details, status } = req.body;
  await audit(userRole || 'PUBLIC', action || 'UNKNOWN', details || '', status || 'SUCCESS');
  res.json({ logged: true });
});

module.exports = router;
