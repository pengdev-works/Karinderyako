import React, { useState, useEffect, useCallback } from 'react';
import Header        from './components/Header';
import Hero          from './components/Hero';
import CustomerView  from './components/CustomerView';
import OwnerDashboard  from './components/OwnerDashboard';
import RiderDashboard  from './components/RiderDashboard';
import AdminDashboard  from './components/AdminDashboard';
import * as api from './api';

export default function App() {
  // ── Auth ────────────────────────────────────────────────────
  const [userSession, setUserSession] = useState(null);
  const [activeView, setActiveView]   = useState('MARKETPLACE');

  // ── Data from Neon DB ───────────────────────────────────────
  const [karinderyas,   setKarinderyas]   = useState([]);
  const [menuItems,     setMenuItems]     = useState([]);  // for open karinderya
  const [orders,        setOrders]        = useState([]);
  const [products,      setProducts]      = useState([]);  // owner's products
  const [applications,  setApplications]  = useState([]);
  const [auditLogs,     setAuditLogs]     = useState([]);

  // ── Loading / Error states ──────────────────────────────────
  const [loadingKarinderyas, setLoadingKarinderyas] = useState(false);
  const [apiError,           setApiError]           = useState('');

  // ── Customer Browse ─────────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = useState('');
  const [activeCategory,  setActiveCategory]  = useState('ALL');
  const [selectedKarinderya, setSelectedKarinderya] = useState(null);
  const [activeOrder,     setActiveOrder]     = useState(null);

  // ── Cart ────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);

  // ── Modals ──────────────────────────────────────────────────
  const [isLoginOpen,    setIsLoginOpen]    = useState(false);
  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [isCartOpen,     setIsCartOpen]     = useState(false);
  const [isAddDishOpen,  setIsAddDishOpen]  = useState(false);

  // ── Login form ──────────────────────────────────────────────
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError,    setLoginError]    = useState('');
  const [loginLoading,  setLoginLoading]  = useState(false);
  const [loginTab,      setLoginTab]      = useState('LOGIN');

  // ── Vendor reg form ─────────────────────────────────────────
  const [vName,     setVName]     = useState('');
  const [vOwner,    setVOwner]    = useState('');
  const [vAddress,  setVAddress]  = useState('Poblacion, Laang, Abra');
  const [vCategory, setVCategory] = useState('Luto-Bahay');
  const [vDesc,     setVDesc]     = useState('');
  const [vEmail,    setVEmail]    = useState('');
  const [vPassword, setVPassword] = useState('');
  const [vLoading,  setVLoading]  = useState(false);
  const [vError,    setVError]    = useState('');

  // ── Rider reg form ──────────────────────────────────────────
  const [rName,     setRName]     = useState('');
  const [rVehicle,  setRVehicle]  = useState('');
  const [rEmail,    setREmail]    = useState('');
  const [rPassword, setRPassword] = useState('');
  const [rLoading,  setRLoading]  = useState(false);
  const [rError,    setRError]    = useState('');

  // ── Add Dish form ───────────────────────────────────────────
  const [dishName,  setDishName]  = useState('');
  const [dishDesc,  setDishDesc]  = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCat,   setDishCat]   = useState('Luto-Bahay');
  const [dishPhoto, setDishPhoto] = useState('');
  const [dishLoading, setDishLoading] = useState(false);

  // ── Checkout form ───────────────────────────────────────────
  const [ckName,    setCkName]    = useState('');
  const [ckPhone,   setCkPhone]   = useState('');
  const [ckAddress, setCkAddress] = useState('Poblacion, Laang, Abra');
  const [ckPayment, setCkPayment] = useState('COD');
  const [ckLoading, setCkLoading] = useState(false);

  // ── Computed ─────────────────────────────────────────────────
  const cartCount    = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // ─────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────

  const loadKarinderyas = useCallback(async () => {
    setLoadingKarinderyas(true);
    try {
      const data = await api.fetchKarinderyas(activeCategory, searchQuery);
      setKarinderyas(data);
    } catch (err) {
      console.error('Load karinderyas error:', err);
    } finally {
      setLoadingKarinderyas(false);
    }
  }, [activeCategory, searchQuery]);

  // Load karinderyas on mount and when filters change
  useEffect(() => { loadKarinderyas(); }, [loadKarinderyas]);

  // Load dashboard data when user logs in
  useEffect(() => {
    if (!userSession) return;

    if (userSession.role === 'OWNER' && userSession.karinderya) {
      // Load owner's products and orders
      api.fetchMenu(userSession.karinderya.id)
        .then(setProducts)
        .catch(console.error);
      api.fetchOrders(userSession.karinderya.id)
        .then(setOrders)
        .catch(console.error);
    }

    if (userSession.role === 'RIDER') {
      api.fetchOrders()
        .then(setOrders)
        .catch(console.error);
    }

    if (userSession.role === 'ADMIN') {
      api.fetchApplications().then(setApplications).catch(console.error);
      api.fetchAuditLogs().then(setAuditLogs).catch(console.error);
    }
  }, [userSession]);

  // ─────────────────────────────────────────────────────────────
  // AUTH HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const user = await api.login(loginEmail.trim(), loginPassword);
      setUserSession(user);
      setIsLoginOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setActiveView('PORTAL');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    api.logEvent(userSession.role, 'USER_LOGOUT', `${userSession.name} logged out`);
    setUserSession(null);
    setActiveView('MARKETPLACE');
    setOrders([]);
    setProducts([]);
    setApplications([]);
    setAuditLogs([]);
  };

  const handleVendorReg = async (e) => {
    e.preventDefault();
    setVError('');
    setVLoading(true);
    try {
      const res = await api.registerVendor({
        name: vName, ownerName: vOwner, address: vAddress,
        category: vCategory, description: vDesc, email: vEmail, password: vPassword
      });
      alert(`✅ ${res.message}`);
      setVName(''); setVOwner(''); setVDesc(''); setVEmail(''); setVPassword('');
      setLoginTab('LOGIN');
    } catch (err) {
      setVError(err.message);
    } finally {
      setVLoading(false);
    }
  };

  const handleRiderReg = async (e) => {
    e.preventDefault();
    setRError('');
    setRLoading(true);
    try {
      const res = await api.registerRider({
        name: rName, vehicle: rVehicle, email: rEmail, password: rPassword
      });
      alert(`✅ ${res.message}`);
      setRName(''); setRVehicle(''); setREmail(''); setRPassword('');
      setLoginTab('LOGIN');
    } catch (err) {
      setRError(err.message);
    } finally {
      setRLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // MENU MODAL
  // ─────────────────────────────────────────────────────────────

  const handleSelectKarinderya = async (k) => {
    setSelectedKarinderya(k);
    setMenuItems([]);
    setIsMenuOpen(true);
    try {
      const items = await api.fetchMenu(k.id);
      setMenuItems(items);
    } catch (err) {
      console.error('Fetch menu error:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // CART & CHECKOUT
  // ─────────────────────────────────────────────────────────────

  const handleAddToCart = (product) => {
    if (cart.length > 0 && cart[0].karinderya_id !== product.karinderya_id) {
      if (!window.confirm('Your cart has items from another Karinderya. Clear cart?')) return;
      setCart([{ ...product, qty: 1 }]);
      return;
    }
    const idx = cart.findIndex((i) => i.id === product.id);
    if (idx > -1) {
      const updated = [...cart];
      updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
      setCart(updated);
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCkLoading(true);
    try {
      const res = await api.placeOrder({
        karinderyaId:    selectedKarinderya?.id,
        karinderyaName:  selectedKarinderya?.name || 'Karinderya',
        customerName:    ckName,
        customerPhone:   ckPhone,
        deliveryAddress: ckAddress,
        paymentMethod:   ckPayment,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      });
      setActiveOrder(res.order);
      setCart([]);
      setIsCartOpen(false);
      alert(`🎉 ${res.message}`);
      setCkName(''); setCkPhone(''); setCkAddress('Poblacion, Laang, Abra');
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setCkLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // OWNER HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handleAddDish = async (e) => {
    e.preventDefault();
    setDishLoading(true);
    try {
      const res = await api.addProduct({
        karinderyaId: userSession.karinderya?.id,
        name: dishName, description: dishDesc,
        price: dishPrice, category: dishCat, photo: dishPhoto,
      });
      setProducts((prev) => [...prev, res.product]);
      setIsAddDishOpen(false);
      alert(`✅ "${dishName}" added to your menu!`);
      setDishName(''); setDishDesc(''); setDishPrice(''); setDishPhoto('');
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setDishLoading(false);
    }
  };

  const handleToggleStock = async (productId) => {
    try {
      const res = await api.toggleProduct(productId);
      setProducts((prev) => prev.map((p) => p.id === productId ? res.product : p));
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RIDER HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await api.updateOrderStatus(orderId, status, userSession?.role);
      setOrders((prev) => prev.map((o) => o.id === orderId ? res.order : o));
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ADMIN HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handleApprove = async (appId) => {
    try {
      const res = await api.approveApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      if (res.karinderya) setKarinderyas((prev) => [...prev, res.karinderya]);
      alert(`✅ ${res.message}`);
      // Refresh audit logs
      api.fetchAuditLogs().then(setAuditLogs).catch(() => {});
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  const handleReject = async (appId) => {
    try {
      await api.rejectApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      alert('Application rejected.');
      api.fetchAuditLogs().then(setAuditLogs).catch(() => {});
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <Header
        cartCount={cartCount}
        openCartModal={() => setIsCartOpen(true)}
        openLoginModal={() => { setIsLoginOpen(true); setLoginError(''); setLoginTab('LOGIN'); }}
        userSession={userSession}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* ── MARKETPLACE (always accessible) ─────────────────── */}
      {activeView === 'MARKETPLACE' && (
        <>
          <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <CustomerView
            karinderyas={karinderyas}
            loading={loadingKarinderyas}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onSelectKarinderya={handleSelectKarinderya}
            activeOrder={activeOrder}
            openLoginModal={() => setIsLoginOpen(true)}
          />
        </>
      )}

      {/* ── OWNER PORTAL ────────────────────────────────────── */}
      {userSession?.role === 'OWNER' && activeView === 'PORTAL' && (
        <OwnerDashboard
          karinderya={userSession.karinderya}
          products={products}
          orders={orders}
          onToggleStock={handleToggleStock}
          openAddDishModal={() => setIsAddDishOpen(true)}
        />
      )}

      {/* ── RIDER PORTAL ────────────────────────────────────── */}
      {userSession?.role === 'RIDER' && activeView === 'PORTAL' && (
        <RiderDashboard
          orders={orders}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}

      {/* ── ADMIN PORTAL ────────────────────────────────────── */}
      {userSession?.role === 'ADMIN' && activeView === 'PORTAL' && (
        <AdminDashboard
          auditLogs={auditLogs}
          pendingApplications={applications}
          karinderyas={karinderyas}
          onApproveApplication={handleApprove}
          onRejectApplication={handleReject}
        />
      )}

      {/* ── Floating Dashboard Button (when logged in + on marketplace) */}
      {userSession && activeView === 'MARKETPLACE' && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50 }}>
          <button
            className="btn btn-primary"
            style={{ boxShadow: '0 8px 24px rgba(224,86,56,0.4)', padding: '0.75rem 1.5rem' }}
            onClick={() => setActiveView('PORTAL')}
          >
            <i className="fas fa-tachometer-alt"></i> My Dashboard
          </button>
        </div>
      )}

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <p>© 2025 <strong>KarinderyaKo</strong> — Supporting Local Home-Based Food Businesses in Poblacion, Laang, Abra</p>
          <p style={{ marginTop: '0.4rem', fontSize: '0.78rem', opacity: 0.7 }}>
            Capstone Project — Geofenced Multi-Vendor Marketplace · Powered by Neon · Hosted on Render + Vercel
          </p>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          MODAL: PARTNER LOGIN / REGISTER
          ═══════════════════════════════════════════════════════ */}
      {isLoginOpen && (
        <div className="modal-backdrop" onClick={() => setIsLoginOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Partner Portal</span>
              <button className="close-btn" onClick={() => setIsLoginOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Tabs */}
              <div className="login-tabs">
                {[
                  { key: 'LOGIN',           icon: 'fa-sign-in-alt', label: 'Login' },
                  { key: 'REGISTER_OWNER',  icon: 'fa-store',       label: 'Register Karinderya' },
                  { key: 'REGISTER_RIDER',  icon: 'fa-motorcycle',  label: 'Join as Rider' },
                ].map(tab => (
                  <div
                    key={tab.key}
                    className={`login-tab ${loginTab === tab.key ? 'active' : ''}`}
                    onClick={() => { setLoginTab(tab.key); setLoginError(''); setVError(''); setRError(''); }}
                  >
                    <i className={`fas ${tab.icon}`}></i> {tab.label}
                  </div>
                ))}
              </div>

              {/* ── LOGIN ── */}
              {loginTab === 'LOGIN' && (
                <>
                  <div className="auth-header">
                    <div className="auth-icon"><i className="fas fa-lock"></i></div>
                    <h3>Welcome Back</h3>
                    <p>Login to your Owner, Rider, or Admin portal</p>
                  </div>
                  <div className="demo-creds">
                    <strong>🔑 Demo Credentials (Prototype)</strong>
                    Owner: owner@karinderyako.ph / owner123<br />
                    Rider: rider@karinderyako.ph / rider123<br />
                    Admin: admin@karinderyako.ph / admin123
                  </div>
                  {loginError && (
                    <div className="alert alert-danger">
                      <i className="fas fa-exclamation-circle"></i> {loginError}
                    </div>
                  )}
                  <form onSubmit={handleLogin} id="login-form">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input id="login-email" type="email" className="form-control"
                        placeholder="owner@karinderyako.ph"
                        value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input id="login-password" type="password" className="form-control"
                        placeholder="Enter your password"
                        value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loginLoading} id="login-submit-btn">
                      {loginLoading ? <><i className="fas fa-spinner fa-spin"></i> Logging in...</> : <><i className="fas fa-sign-in-alt"></i> Login to Portal</>}
                    </button>
                  </form>
                </>
              )}

              {/* ── REGISTER OWNER ── */}
              {loginTab === 'REGISTER_OWNER' && (
                <>
                  <div className="auth-header">
                    <div className="auth-icon"><i className="fas fa-store"></i></div>
                    <h3>Register Your Karinderya</h3>
                    <p>Submit your business for admin review and approval</p>
                  </div>
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle"></i> An Admin will approve your listing. You can then login to manage your menu.
                  </div>
                  {vError && <div className="alert alert-danger"><i className="fas fa-exclamation-circle"></i> {vError}</div>}
                  <form onSubmit={handleVendorReg} id="vendor-reg-form">
                    <div className="form-group">
                      <label className="form-label">Business Name</label>
                      <input id="vendor-name" type="text" className="form-control"
                        placeholder="e.g. Aling Nena's Luto-Bahay"
                        value={vName} onChange={(e) => setVName(e.target.value)} required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Owner Full Name</label>
                        <input type="text" className="form-control" placeholder="Full name"
                          value={vOwner} onChange={(e) => setVOwner(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-control" value={vCategory} onChange={(e) => setVCategory(e.target.value)}>
                          <option>Luto-Bahay</option><option>Ihaw-Ihaw</option>
                          <option>Merienda</option><option>Silog</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Address</label>
                      <input type="text" className="form-control"
                        value={vAddress} onChange={(e) => setVAddress(e.target.value)} required />
                      <span className="form-hint success"><i className="fas fa-map-pin"></i> Must be within Poblacion, Laang, Abra</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Short Description</label>
                      <textarea className="form-control" placeholder="Describe your karinderya..."
                        value={vDesc} onChange={(e) => setVDesc(e.target.value)} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" placeholder="your@email.com"
                          value={vEmail} onChange={(e) => setVEmail(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Set Password</label>
                        <input type="password" className="form-control" placeholder="Choose password"
                          value={vPassword} onChange={(e) => setVPassword(e.target.value)} required />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={vLoading} id="vendor-submit-btn">
                      {vLoading ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</> : <><i className="fas fa-paper-plane"></i> Submit for Admin Review</>}
                    </button>
                  </form>
                </>
              )}

              {/* ── REGISTER RIDER ── */}
              {loginTab === 'REGISTER_RIDER' && (
                <>
                  <div className="auth-header">
                    <div className="auth-icon" style={{ background: 'linear-gradient(135deg, #0D9488, #0F766E)' }}>
                      <i className="fas fa-motorcycle"></i>
                    </div>
                    <h3>Join as Delivery Rider</h3>
                    <p>Deliver food orders within Poblacion, Laang, Abra</p>
                  </div>
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle"></i> The Admin will activate your rider account after review.
                  </div>
                  {rError && <div className="alert alert-danger"><i className="fas fa-exclamation-circle"></i> {rError}</div>}
                  <form onSubmit={handleRiderReg} id="rider-reg-form">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input id="rider-name" type="text" className="form-control" placeholder="Your full name"
                        value={rName} onChange={(e) => setRName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Vehicle & Plate Number</label>
                      <input type="text" className="form-control" placeholder="e.g. Honda Wave 125 (AB-1234)"
                        value={rVehicle} onChange={(e) => setRVehicle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Coverage Area</label>
                      <input type="text" className="form-control" value="Poblacion, Laang, Abra" readOnly />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" placeholder="your@email.com"
                          value={rEmail} onChange={(e) => setREmail(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Set Password</label>
                        <input type="password" className="form-control" placeholder="Choose password"
                          value={rPassword} onChange={(e) => setRPassword(e.target.value)} required />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={rLoading} id="rider-submit-btn">
                      {rLoading ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</> : <><i className="fas fa-paper-plane"></i> Submit Rider Application</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: KARINDERYA MENU
          ═══════════════════════════════════════════════════════ */}
      {isMenuOpen && selectedKarinderya && (
        <div className="modal-backdrop" onClick={() => setIsMenuOpen(false)}>
          <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selectedKarinderya.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                  <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent)' }}></i> {selectedKarinderya.address}
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsMenuOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {menuItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--gray-500)' }}>
                  <i className="fas fa-bowl-food" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'block', color: 'var(--gray-300)' }}></i>
                  No menu items yet. The owner hasn't added dishes.
                </div>
              ) : (
                <div className="menu-grid">
                  {menuItems.map((p) => (
                    <div className="menu-item" key={p.id}>
                      <img src={p.photo} alt={p.name} className="menu-item-img" />
                      <div className="menu-item-info">
                        <div className="menu-item-name">{p.name}</div>
                        <div className="menu-item-desc">{p.description}</div>
                        <div className="menu-item-bottom">
                          <div className="menu-item-price">₱{parseFloat(p.price).toFixed(2)}</div>
                          {p.available ? (
                            <button className="add-btn" onClick={() => handleAddToCart({ ...p, karinderya_id: p.karinderya_id })}>
                              <i className="fas fa-plus"></i>
                            </button>
                          ) : (
                            <span className="sold-out-tag">Sold Out</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {cart.length > 0 && (
                <div style={{ marginTop: '1.25rem', borderTop: '2px dashed var(--gray-200)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>{cartCount} item(s) in cart</span>
                  <button className="btn btn-primary" onClick={() => { setIsMenuOpen(false); setIsCartOpen(true); }}>
                    <i className="fas fa-shopping-basket"></i> View Cart (₱{cartSubtotal.toFixed(2)})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: CART & CHECKOUT
          ═══════════════════════════════════════════════════════ */}
      {isCartOpen && (
        <div className="modal-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title"><i className="fas fa-shopping-basket" style={{ color: 'var(--primary)' }}></i> Cart & Checkout</span>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--gray-500)' }}>
                  <i className="fas fa-shopping-basket" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: 'var(--gray-300)' }}></i>
                  Your cart is empty. Browse a karinderya to add dishes!
                </div>
              ) : (
                <>
                  {cart.map((item, idx) => (
                    <div className="cart-item" key={idx}>
                      <div className="cart-item-left">
                        <h4>{item.name}</h4>
                        <p>₱{parseFloat(item.price).toFixed(2)} × {item.qty}</p>
                      </div>
                      <div className="cart-item-price">₱{(item.price * item.qty).toFixed(2)}</div>
                    </div>
                  ))}
                  <div className="order-summary">
                    <div className="order-summary-row"><span>Subtotal</span><span>₱{cartSubtotal.toFixed(2)}</span></div>
                    <div className="order-summary-row"><span>Delivery Fee (Poblacion)</span><span>₱25.00</span></div>
                    <div className="order-summary-row total"><span>Total</span><strong>₱{(cartSubtotal + 25).toFixed(2)}</strong></div>
                  </div>
                  <form onSubmit={handleCheckout} id="checkout-form">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input id="checkout-name" type="text" className="form-control" placeholder="Your full name"
                        value={ckName} onChange={(e) => setCkName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input type="tel" className="form-control" placeholder="+63 9XX XXX XXXX"
                        value={ckPhone} onChange={(e) => setCkPhone(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Delivery Address</label>
                      <input type="text" className="form-control"
                        value={ckAddress} onChange={(e) => setCkAddress(e.target.value)} required />
                      <span className="form-hint success"><i className="fas fa-shield-alt"></i> Geofenced to Poblacion, Laang, Abra</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select className="form-control" value={ckPayment} onChange={(e) => setCkPayment(e.target.value)}>
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="GCASH">GCash / e-Wallet (Simulated)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={ckLoading} id="place-order-btn">
                      {ckLoading
                        ? <><i className="fas fa-spinner fa-spin"></i> Placing Order...</>
                        : <><i className="fas fa-check-circle"></i> Place Order — ₱{(cartSubtotal + 25).toFixed(2)}</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: ADD DISH (Owner)
          ═══════════════════════════════════════════════════════ */}
      {isAddDishOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddDishOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title"><i className="fas fa-plus" style={{ color: 'var(--primary)' }}></i> Add Menu Dish</span>
              <button className="close-btn" onClick={() => setIsAddDishOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddDish} id="add-dish-form">
                <div className="form-group">
                  <label className="form-label">Dish Name</label>
                  <input id="dish-name" type="text" className="form-control"
                    placeholder="e.g. Beef Sinigang sa Tamarind"
                    value={dishName} onChange={(e) => setDishName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input type="text" className="form-control" placeholder="Brief description..."
                    value={dishDesc} onChange={(e) => setDishDesc(e.target.value)} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (₱)</label>
                    <input type="number" step="0.01" className="form-control" placeholder="95.00"
                      value={dishPrice} onChange={(e) => setDishPrice(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={dishCat} onChange={(e) => setDishCat(e.target.value)}>
                      <option>Luto-Bahay</option><option>Ihaw-Ihaw</option>
                      <option>Merienda</option><option>Silog</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Photo URL (Optional)</label>
                  <input type="text" className="form-control" placeholder="https://..."
                    value={dishPhoto} onChange={(e) => setDishPhoto(e.target.value)} />
                  <span className="form-hint">Leave blank for a default food image</span>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={dishLoading} id="add-dish-submit-btn">
                  {dishLoading
                    ? <><i className="fas fa-spinner fa-spin"></i> Publishing...</>
                    : <><i className="fas fa-utensils"></i> Publish Dish to Menu</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
