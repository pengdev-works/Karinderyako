import React from 'react';

export default function Header({
  cartCount,
  openCartModal,
  openLoginModal,
  userSession,
  onLogout,
  activeView,
  setActiveView
}) {
  return (
    <>
      {/* Top Location Bar */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="geofence-pill">
            <i className="fas fa-map-marker-alt"></i>
            <span>Geofenced Service Area: <strong>Poblacion, Laang, Abra</strong></span>
          </div>
          <div className="top-bar-right">
            <span><i className="fas fa-motorcycle" style={{ color: '#0D9488' }}></i> Fast Local Delivery</span>
            <span><i className="fas fa-shield-alt" style={{ color: '#10B981' }}></i> Verified Karinderyas</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container nav-inner">
          {/* Logo */}
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setActiveView('MARKETPLACE'); }}>
            <div className="logo-icon"><i className="fas fa-utensils"></i></div>
            <div className="logo-text">Karinderya<span>Ko</span></div>
          </a>

          {/* Nav Links */}
          <ul className="nav-links">
            <li>
              <span
                className={`nav-link ${activeView === 'MARKETPLACE' ? 'active' : ''}`}
                onClick={() => setActiveView('MARKETPLACE')}
              >
                <i className="fas fa-store"></i> Food Marketplace
              </span>
            </li>
          </ul>

          {/* Right Actions */}
          <div className="nav-right">
            {/* Show user session or login button */}
            {userSession ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  background: '#1E293B',
                  color: '#5EEAD4',
                  borderRadius: '999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <i className="fas fa-user-circle"></i>
                  {userSession.name}
                  <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>({userSession.role})</span>
                </span>
                <button className="btn btn-outline btn-sm" onClick={onLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            ) : (
              <button className="btn btn-outline" onClick={openLoginModal} id="partner-login-btn">
                <i className="fas fa-sign-in-alt"></i> Partner Login
              </button>
            )}

            {/* Cart — only shown in customer/marketplace view */}
            {activeView === 'MARKETPLACE' && (
              <button className="btn btn-primary cart-btn" onClick={openCartModal} id="cart-btn">
                <i className="fas fa-shopping-basket"></i>
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
