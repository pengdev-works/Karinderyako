/**
 * KarinderyaKo — Central API Helper
 * All fetch calls go through this module.
 * Base URL is set via VITE_API_URL environment variable.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE}/api${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

const get  = (path)        => request('GET',   path);
const post = (path, body)  => request('POST',  path, body);
const patch = (path, body) => request('PATCH', path, body);

// ── AUTH ──────────────────────────────────────────────────────
export const login = (email, password) =>
  post('/auth/login', { email, password });

export const registerVendor = (data) =>
  post('/auth/register/vendor', data);

export const registerRider = (data) =>
  post('/auth/register/rider', data);

// ── KARINDERYAS (Public) ──────────────────────────────────────
export const fetchKarinderyas = (category, search) => {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (search) params.append('search', search);
  const qs = params.toString() ? `?${params}` : '';
  return get(`/karinderyas${qs}`);
};

export const fetchMenu = (karinderyaId) =>
  get(`/karinderyas/${karinderyaId}/menu`);

// ── ORDERS ────────────────────────────────────────────────────
export const placeOrder = (data) =>
  post('/orders', data);

export const fetchOrders = (karinderyaId) => {
  const qs = karinderyaId ? `?karinderyaId=${karinderyaId}` : '';
  return get(`/orders${qs}`);
};

export const updateOrderStatus = (orderId, status, userRole) =>
  patch(`/orders/${orderId}/status`, { status, userRole });

// ── PRODUCTS ──────────────────────────────────────────────────
export const addProduct = (data) =>
  post('/products', data);

export const toggleProduct = (productId) =>
  patch(`/products/${productId}/toggle`, {});

// ── ADMIN ─────────────────────────────────────────────────────
export const fetchApplications = () =>
  get('/admin/applications');

export const approveApplication = (appId) =>
  post(`/admin/applications/${appId}/approve`, {});

export const rejectApplication = (appId) =>
  post(`/admin/applications/${appId}/reject`, {});

export const fetchAuditLogs = () =>
  get('/admin/audit-logs');

// ── AUDIT LOG ─────────────────────────────────────────────────
export const logEvent = (userRole, action, details, status = 'SUCCESS') =>
  post('/audit', { userRole, action, details, status }).catch(() => {});
