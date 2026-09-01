/**
 * KarinderyaKo — Central API Helper
 * Connects frontend to Express.js REST API
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050';

async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE}/api${path}`, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`API Error [${method} ${path}]:`, err.message);
    throw err;
  }
}

const get   = (path)       => request('GET',    path);
const post  = (path, body) => request('POST',   path, body);
const put   = (path, body) => request('PUT',    path, body);
const patch = (path, body) => request('PATCH',  path, body);
const del   = (path)       => request('DELETE', path);

// ── AUTH ──────────────────────────────────────────────────────
export const login = (email, password) =>
  post('/auth/login', { email, password });

export const registerCustomer = (data) =>
  post('/auth/register/customer', data);

export const registerVendor = (data) =>
  post('/auth/register/vendor', data);

// ── MARKETPLACE RESTAURANTS ────────────────────────────────────
export const fetchRestaurants = (category, search, openNow = false, sort = 'recommended') => {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (search) params.append('search', search);
  if (openNow) params.append('open_now', 'true');
  if (sort) params.append('sort', sort);
  const qs = params.toString() ? `?${params}` : '';
  return get(`/restaurants${qs}`);
};

export const fetchRestaurantById = (id) =>
  get(`/restaurants/${id}`);

export const fetchRestaurantMenu = (id) =>
  get(`/restaurants/${id}/menu`);

// ── ORDERS & CHECKOUT ─────────────────────────────────────────
export const placeOrder = (data) =>
  post('/orders', data);

export const fetchOrders = (params = {}) => {
  const cleanParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'undefined' && v !== 'null') {
      cleanParams.append(k, v);
    }
  });
  const qs = cleanParams.toString();
  return get(`/orders${qs ? `?${qs}` : ''}`);
};

export const fetchOrderById = (id) =>
  get(`/orders/${id}`);

export const updateOrderStatus = (orderId, status, userRole) =>
  patch(`/orders/${orderId}/status`, { status, userRole });

// ── FAVORITES & REVIEWS ───────────────────────────────────────
export const fetchFavorites = (userId) => {
  if (!userId || userId === 'undefined') return Promise.resolve([]);
  return get(`/favorites?userId=${userId}`);
};

export const toggleFavorite = (userId, karinderyaId) =>
  post('/favorites/toggle', { userId, karinderyaId });

export const submitReview = (data) =>
  post('/reviews', data);

// ── RESTAURANT OWNER PORTAL ───────────────────────────────────
export const fetchOwnerRestaurant = (ownerUserId) => {
  if (!ownerUserId || ownerUserId === 'undefined') return Promise.resolve(null);
  return get(`/owner/restaurant?ownerUserId=${ownerUserId}`);
};

export const updateOwnerRestaurant = (data) =>
  put('/owner/restaurant', data);

export const addMenuItem = (data) =>
  post('/owner/menu', data);

export const toggleMenuItem = (id) =>
  patch(`/owner/menu/${id}/toggle`, {});

export const deleteMenuItem = (id) =>
  del(`/owner/menu/${id}`);

export const replyToReview = (reviewId, replyText) =>
  post(`/owner/reviews/${reviewId}/reply`, { reply: replyText });

// ── PLATFORM ADMIN ────────────────────────────────────────────
export const fetchAdminRestaurants = () =>
  get('/admin/restaurants');

export const updateAdminRestaurantStatus = (id, appStatus) =>
  patch(`/admin/restaurants/${id}/status`, { appStatus });

export const fetchAdminUsers = () =>
  get('/admin/users');

export const fetchAdminReports = () =>
  get('/admin/reports');

export const fetchAuditLogs = () =>
  get('/admin/audit-logs');
