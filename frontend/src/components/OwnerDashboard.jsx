import React from 'react';

export default function OwnerDashboard({ karinderya, products, orders, onToggleStock, openAddDishModal }) {
  const myProducts = products.filter(p => p.karinderyaId === karinderya?.id);
  const myOrders = orders.filter(o => o.karinderyaId === karinderya?.id);
  const pendingOrders = myOrders.filter(o => o.orderStatus === 'PLACED' || o.orderStatus === 'PREPARING');

  return (
    <div className="dashboard-wrap">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="dashboard-title">
              <i className="fas fa-store" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
              {karinderya?.name || 'My Karinderya'}
            </div>
            <div className="dashboard-subtitle">
              Owner Portal — Manage menu, stock, and orders for your home-based karinderya
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="dashboard-badge">
              <i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i>
              Open — {karinderya?.address || 'Poblacion, Laang, Abra'}
            </span>
            <button className="btn btn-primary" onClick={openAddDishModal} id="add-dish-btn">
              <i className="fas fa-plus"></i> Add Dish
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Menu Items</div>
            <div className="stat-value primary">{myProducts.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Available Today</div>
            <div className="stat-value success">{myProducts.filter(p => p.available).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{myOrders.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value warning">{pendingOrders.length}</div>
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="section-header" style={{ marginTop: '0.5rem' }}>
          <div>
            <h2 className="section-title">My Menu Items</h2>
            <p className="section-subtitle">Toggle availability for each dish daily</p>
          </div>
        </div>

        {myProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-utensils"></i></div>
            <h3>No Dishes Added Yet</h3>
            <p>Your menu is empty. Click "Add Dish" to upload your first delicious homemade dish!</p>
            <button className="btn btn-primary" onClick={openAddDishModal}>
              <i className="fas fa-plus-circle"></i> Add Your First Dish
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Dish Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.photo || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'}
                        alt={p.name}
                        className="thumb"
                      />
                    </td>
                    <td><strong>{p.name}</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{p.description}</span></td>
                    <td><span className="card-category">{p.category}</span></td>
                    <td><strong style={{ color: 'var(--primary)' }}>₱{p.price.toFixed(2)}</strong></td>
                    <td>
                      <span className={`status-badge ${p.available ? 'open' : 'closed'}`} style={{ position: 'static' }}>
                        {p.available ? 'In Stock' : 'Sold Out'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.available ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => onToggleStock(p.id)}
                      >
                        {p.available ? 'Mark Sold Out' : 'Mark Available'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Incoming Orders */}
        {myOrders.length > 0 && (
          <>
            <div className="section-header" style={{ marginTop: '2rem' }}>
              <div>
                <h2 className="section-title">Incoming Orders</h2>
                <p className="section-subtitle">Customer orders for your karinderya</p>
              </div>
            </div>
            <div>
              {myOrders.map((o) => (
                <div className="order-card" key={o.id}>
                  <div className="order-card-header">
                    <div className="order-ref">Order {o.id} — {o.customerName}</div>
                    <span className="status-badge open" style={{ position: 'static' }}>{o.orderStatus}</span>
                  </div>
                  <div className="order-meta">
                    <span><i className="fas fa-map-marker-alt" style={{ color: 'var(--accent)', marginRight: 4 }}></i>{o.deliveryAddress}</span>
                    <span><i className="fas fa-money-bill-wave" style={{ color: 'var(--success)', marginRight: 4 }}></i>₱{o.totalAmount?.toFixed(2)} — {o.paymentMethod}</span>
                    <span><i className="fas fa-clock" style={{ color: 'var(--gray-400)', marginRight: 4 }}></i>{o.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
