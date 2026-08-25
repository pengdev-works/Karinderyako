import React from 'react';

export default function AdminDashboard({ auditLogs, pendingApplications, karinderyas, onApproveApplication, onRejectApplication }) {
  return (
    <div className="dashboard-wrap">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="dashboard-title">
              <i className="fas fa-shield-alt" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
              Admin Control Panel
            </div>
            <div className="dashboard-subtitle">
              Manage vendor/rider approvals, active listings, and security audit logs
            </div>
          </div>
          <span className="dashboard-badge info">
            <i className="fas fa-map-marker-alt"></i> Poblacion, Laang, Abra
          </span>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Pending Approvals</div>
            <div className="stat-value warning">{pendingApplications.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Karinderyas</div>
            <div className="stat-value success">{karinderyas.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Security Events</div>
            <div className="stat-value">{auditLogs.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Platform Status</div>
            <div className="stat-value success" style={{ fontSize: '1.2rem' }}>ACTIVE</div>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="section-header">
          <div>
            <h2 className="section-title">Pending Applications</h2>
            <p className="section-subtitle">Review and approve new vendor and rider registrations</p>
          </div>
        </div>

        {pendingApplications.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem' }}>
            <div className="empty-state-icon"><i className="fas fa-inbox"></i></div>
            <h3>No Pending Applications</h3>
            <p>All applications have been reviewed. New submissions will appear here.</p>
          </div>
        ) : (
          <div style={{ marginBottom: '2rem' }}>
            {pendingApplications.map((app) => (
              <div className="app-card" key={app.id}>
                <div className="app-info">
                  <h4>
                    {app.name}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: 'var(--warning-light)', color: '#92400E', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                      {app.roleType}
                    </span>
                  </h4>
                  <p>
                    <i className="fas fa-map-marker-alt" style={{ marginRight: 4, color: 'var(--accent)' }}></i>
                    {app.address}
                    {app.ownerName && ` — Owner: ${app.ownerName}`}
                    {app.description && ` — ${app.description}`}
                  </p>
                </div>
                <div className="app-actions">
                  <button className="btn btn-success btn-sm" onClick={() => onApproveApplication(app.id)}>
                    <i className="fas fa-check"></i> Approve
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => onRejectApplication && onRejectApplication(app.id)}>
                    <i className="fas fa-times"></i> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Karinderyas */}
        {karinderyas.length > 0 && (
          <>
            <div className="section-header">
              <div>
                <h2 className="section-title">Active Karinderyas</h2>
                <p className="section-subtitle">All approved and listed businesses</p>
              </div>
            </div>
            <div className="table-wrap" style={{ marginBottom: '2rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Category</th>
                    <th>Owner</th>
                    <th>Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {karinderyas.map((k) => (
                    <tr key={k.id}>
                      <td><strong>{k.name}</strong></td>
                      <td><span className="card-category">{k.category}</span></td>
                      <td>{k.ownerName}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{k.address}</td>
                      <td>
                        <span className="status-badge open" style={{ position: 'static' }}>Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Security Audit Log */}
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <i className="fas fa-shield-alt" style={{ color: 'var(--success)', marginRight: '0.5rem' }}></i>
              Security Audit Log
            </h2>
            <p className="section-subtitle">OWASP-compliant event log — all platform actions recorded</p>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '1.5rem', color: 'var(--gray-500)', border: '1px solid var(--gray-200)' }}>
            No security events recorded yet.
          </div>
        ) : (
          <div className="audit-log">
            {auditLogs.map((log) => (
              <div className="audit-log-item" key={log.id}>
                <div className={`log-dot ${log.status === 'SUCCESS' ? 'success' : log.status === 'BLOCKED' ? 'blocked' : 'pending'}`}></div>
                <div className="log-time">{log.timestamp}</div>
                <div className="log-action">{log.action}</div>
                <div className="log-details">{log.details}</div>
                <span className={`log-status ${log.status}`}>{log.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
