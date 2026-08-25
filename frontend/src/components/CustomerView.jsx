import React from 'react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Karinderyas', icon: 'fa-th-large' },
  { id: 'Luto-Bahay', label: 'Luto-Bahay', icon: 'fa-bowl-food' },
  { id: 'Ihaw-Ihaw', label: 'Ihaw-Ihaw', icon: 'fa-fire' },
  { id: 'Merienda', label: 'Merienda & Drinks', icon: 'fa-ice-cream' },
  { id: 'Silog', label: 'Silogan', icon: 'fa-egg' },
];

export default function CustomerView({
  karinderyas,
  activeCategory,
  setActiveCategory,
  onSelectKarinderya,
  activeOrder,
  openLoginModal,
}) {
  const getStepStatus = (stepName) => {
    if (!activeOrder) return '';
    const statuses = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = statuses.indexOf(activeOrder.orderStatus);
    const stepIdx = statuses.indexOf(stepName);
    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return '';
  };

  return (
    <div className="container" style={{ paddingTop: '0.5rem', paddingBottom: '2rem' }}>
      {/* Category Filter */}
      <div className="categories-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`cat-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            id={`cat-${cat.id}`}
          >
            <i className={`fas ${cat.icon}`}></i> {cat.label}
          </button>
        ))}
      </div>

      {/* Section Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Verified Karinderyas in Poblacion</h2>
          <p className="section-subtitle">Support local home-based food businesses in Laang, Abra</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={openLoginModal} id="become-partner-btn">
          <i className="fas fa-store"></i> Become a Partner
        </button>
      </div>

      {/* Karinderya Grid or Empty State */}
      {karinderyas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="fas fa-store-slash"></i>
          </div>
          <h3>No Karinderyas Listed Yet</h3>
          <p>
            There are no food businesses registered in Poblacion, Laang, Abra yet.
            Are you a home-based food seller? Join as a Partner!
          </p>
          <button className="btn btn-primary" onClick={openLoginModal} id="register-karinderya-btn">
            <i className="fas fa-plus-circle"></i> Register Your Karinderya
          </button>
        </div>
      ) : (
        <div className="karinderya-grid">
          {karinderyas.map((k) => (
            <div
              key={k.id}
              className="karinderya-card"
              onClick={() => onSelectKarinderya(k)}
              id={`karinderya-${k.id}`}
            >
              <div className="card-img-wrap">
                <img
                  src={k.photo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'}
                  alt={k.name}
                />
                <span className={`status-badge ${k.status}`}>{k.status}</span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{k.name}</h3>
                <span className="card-category">
                  <i className="fas fa-tag"></i> {k.category}
                </span>
                <p className="card-desc">{k.description}</p>
                <div className="card-location">
                  <i className="fas fa-map-marker-alt"></i> {k.address}
                </div>
                <div className="card-footer">
                  <div className="rating">
                    <i className="fas fa-star"></i>
                    {k.rating?.toFixed(1) || '5.0'}
                    <span>({k.reviewCount || 0} reviews)</span>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); onSelectKarinderya(k); }}>
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Order Tracker */}
      <div className="tracker-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Active Order Tracking</h2>
            <p className="section-subtitle">Real-time delivery status for your current order</p>
          </div>
        </div>

        {activeOrder ? (
          <div className="tracker-card">
            <div className="tracker-header">
              <div className="tracker-id">
                Order Ref: <span>{activeOrder.id}</span>
              </div>
              <span className="status-badge open" style={{ position: 'static' }}>{activeOrder.orderStatus}</span>
            </div>

            <div className="timeline">
              {[
                { key: 'PLACED', icon: 'fa-receipt', label: 'Placed' },
                { key: 'PREPARING', icon: 'fa-utensils', label: 'Preparing' },
                { key: 'OUT_FOR_DELIVERY', icon: 'fa-motorcycle', label: 'On the Way' },
                { key: 'DELIVERED', icon: 'fa-check', label: 'Delivered' },
              ].map((step) => (
                <div key={step.key} className={`timeline-step ${getStepStatus(step.key)}`}>
                  <div className="step-dot">
                    <i className={`fas ${step.icon}`}></i>
                  </div>
                  <div className="step-label">{step.label}</div>
                </div>
              ))}
            </div>

            <div className="tracker-details">
              <div className="tracker-detail">
                <strong>Karinderya:</strong><br />{activeOrder.karinderyaName}
              </div>
              <div className="tracker-detail">
                <strong>Delivery Address:</strong><br />{activeOrder.deliveryAddress}
              </div>
              <div className="tracker-detail">
                <strong>Payment:</strong><br />{activeOrder.paymentMethod} — {activeOrder.paymentStatus}
              </div>
              <div className="tracker-detail">
                <strong>Total Amount:</strong><br />₱{activeOrder.totalAmount?.toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          <div className="tracker-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
            <i className="fas fa-motorcycle" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block', color: 'var(--gray-300)' }}></i>
            No active orders yet. Select a Karinderya above to place your first order!
          </div>
        )}
      </div>
    </div>
  );
}
