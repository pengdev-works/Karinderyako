import React from 'react';

export default function RiderDashboard({ orders, onUpdateStatus }) {
  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );
  const completedOrders = orders.filter((o) => o.orderStatus === 'DELIVERED');

  return (
    <div className="dashboard-wrap">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="dashboard-title">
              <i className="fas fa-motorcycle" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
              Delivery Rider Queue
            </div>
            <div className="dashboard-subtitle">
              Coverage Area: Poblacion, Laang, Abra — Pick up and deliver active orders
            </div>
          </div>
          <span className="dashboard-badge">
            <i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i>
            Active On Duty
          </span>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Active Deliveries</div>
            <div className="stat-value primary">{activeOrders.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Today</div>
            <div className="stat-value success">{completedOrders.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{orders.length}</div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="section-header">
          <div>
            <h2 className="section-title">Active Deliveries</h2>
            <p className="section-subtitle">Update delivery status as you complete each order</p>
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-motorcycle"></i></div>
            <h3>No Active Deliveries</h3>
            <p>All caught up! Incoming customer orders in Poblacion, Laang, Abra will appear here automatically.</p>
          </div>
        ) : (
          <div>
            {activeOrders.map((o) => (
              <div className="order-card" key={o.id}>
                <div className="order-card-header">
                  <div className="order-ref">Order {o.id} — {o.karinderyaName}</div>
                  <span className="status-badge open" style={{ position: 'static' }}>{o.orderStatus}</span>
                </div>
                <div className="order-meta">
                  <span><i className="fas fa-user" style={{ color: 'var(--accent)', marginRight: 4 }}></i>{o.customerName} — {o.customerPhone}</span>
                  <span><i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)', marginRight: 4 }}></i>Drop-off: {o.deliveryAddress}</span>
                  <span><i className="fas fa-money-bill-wave" style={{ color: 'var(--success)', marginRight: 4 }}></i>Collect: ₱{o.totalAmount?.toFixed(2)} ({o.paymentMethod})</span>
                </div>
                <div className="order-actions">
                  {o.orderStatus === 'PLACED' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onUpdateStatus(o.id, 'PREPARING')}
                    >
                      <i className="fas fa-utensils"></i> Mark Preparing
                    </button>
                  )}
                  {(o.orderStatus === 'PLACED' || o.orderStatus === 'PREPARING') && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onUpdateStatus(o.id, 'OUT_FOR_DELIVERY')}
                    >
                      <i className="fas fa-motorcycle"></i> Out for Delivery
                    </button>
                  )}
                  {o.orderStatus === 'OUT_FOR_DELIVERY' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => onUpdateStatus(o.id, 'DELIVERED')}
                    >
                      <i className="fas fa-check-circle"></i> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <>
            <div className="section-header" style={{ marginTop: '2rem' }}>
              <div>
                <h2 className="section-title">Completed Deliveries</h2>
                <p className="section-subtitle">Successfully delivered orders</p>
              </div>
            </div>
            {completedOrders.map((o) => (
              <div className="order-card" key={o.id} style={{ opacity: 0.7 }}>
                <div className="order-card-header">
                  <div className="order-ref">Order {o.id}</div>
                  <span className="status-badge open" style={{ position: 'static', background: 'var(--success)' }}>DELIVERED</span>
                </div>
                <div className="order-meta">
                  <span>{o.customerName} — {o.deliveryAddress}</span>
                  <span>₱{o.totalAmount?.toFixed(2)} Collected</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
