import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../api';

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RESTAURANTS'); // RESTAURANTS | USERS | LOGS
  const [previewDocModal, setPreviewDocModal] = useState(null); // { title, url }

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [rList, uList, rep, logs] = await Promise.all([
        api.fetchAdminRestaurants(),
        api.fetchAdminUsers(),
        api.fetchAdminReports(),
        api.fetchAuditLogs(),
      ]);

      setRestaurants(rList);
      setUsers(uList);
      setReports(rep);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading admin portal:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleUpdateStatus = async (restaurantId, appStatus) => {
    try {
      const updated = await api.updateAdminRestaurantStatus(restaurantId, appStatus);
      setRestaurants((prev) => prev.map((r) => (r.id === restaurantId ? updated : r)));
      alert(`✅ Business #${restaurantId} status updated to ${appStatus}`);
    } catch (err) {
      alert(`❌ Update failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#C1440E] border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="font-bold text-[#5C3A21]">Loading Admin Control Panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Metrics */}
      <div className="space-y-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[#5C3A21]">
            Platform Admin Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-[#4A3B2C]/80 font-medium">
            Manage food business approvals, registered users, and platform activity in Poblacion, Laang, Abra
          </p>
        </div>

        {/* Metrics Cards */}
        {reports && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm">
              <div className="text-xs font-mono font-bold text-[#4A3B2C]/70">Approved Businesses</div>
              <div className="font-display font-extrabold text-2xl text-[#C1440E] mt-1">{reports.approvedStores}</div>
            </div>

            <div className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm">
              <div className="text-xs font-mono font-bold text-[#4A3B2C]/70">Registered Users</div>
              <div className="font-display font-extrabold text-2xl text-[#5C3A21] mt-1">{reports.totalUsers}</div>
            </div>

            <div className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm">
              <div className="text-xs font-mono font-bold text-[#4A3B2C]/70">Total Platform Orders</div>
              <div className="font-display font-extrabold text-2xl text-[#4B6043] mt-1">{reports.totalOrders}</div>
            </div>

            <div className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm">
              <div className="text-xs font-mono font-bold text-[#4A3B2C]/70">Gross Platform Volume</div>
              <div className="font-display font-extrabold text-2xl text-[#C1440E] mt-1">₱{reports.grossRevenue.toFixed(0)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8D9B5] pb-1">
        <button
          onClick={() => setActiveTab('RESTAURANTS')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'RESTAURANTS' ? 'bg-[#C1440E] text-[#F7F1E3]' : 'bg-[#E8D9B5]/40 text-[#2B2118]'
          }`}
        >
          Food Businesses ({restaurants.length})
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'USERS' ? 'bg-[#C1440E] text-[#F7F1E3]' : 'bg-[#E8D9B5]/40 text-[#2B2118]'
          }`}
        >
          Platform Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'LOGS' ? 'bg-[#C1440E] text-[#F7F1E3]' : 'bg-[#E8D9B5]/40 text-[#2B2118]'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: RESTAURANTS APPROVAL */}
      {activeTab === 'RESTAURANTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurants.map((r) => (
              <div
                key={r.id}
                className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={r.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'}
                    alt={r.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#E8D9B5]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-lg text-[#5C3A21]">{r.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        r.app_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.app_status}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A3B2C]/80">
                      Owner: {r.owner_name} • Category: {r.category}
                    </p>
                    <p className="text-xs text-[#4A3B2C]/70 truncate">{r.address}</p>
                  </div>
                </div>

                {/* ── PERMITS INSPECTION STRIP ── */}
                <div className="bg-[#E8D9B5]/30 rounded-2xl p-3 border border-[#E8D9B5] space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#5C3A21] text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <i className="fas fa-file-shield text-[#C1440E]"></i>
                      <span>Submitted Food Compliance Permits:</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase text-[#4A3B2C]/70">
                      {r.permit_status || (r.business_permit && r.sanitary_permit && r.government_id ? 'VERIFIED' : 'PENDING_UPLOAD')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {r.business_permit ? (
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ title: `Mayor's / Business Permit — ${r.name}`, url: r.business_permit })}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <i className="fas fa-file-contract text-emerald-600"></i>
                        <span>Mayor's Permit 👁️</span>
                      </button>
                    ) : (
                      <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-xl font-medium">
                        ❌ Mayor's Permit Missing
                      </span>
                    )}

                    {r.sanitary_permit ? (
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ title: `Sanitary / Health Permit — ${r.name}`, url: r.sanitary_permit })}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <i className="fas fa-notes-medical text-emerald-600"></i>
                        <span>Sanitary Permit 👁️</span>
                      </button>
                    ) : (
                      <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-xl font-medium">
                        ❌ Sanitary Permit Missing
                      </span>
                    )}

                    {r.government_id ? (
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ title: `Owner Government ID — ${r.name} (${r.owner_name})`, url: r.government_id })}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <i className="fas fa-id-card text-emerald-600"></i>
                        <span>Owner ID 👁️</span>
                      </button>
                    ) : (
                      <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-xl font-medium">
                        ❌ Valid ID Missing
                      </span>
                    )}

                    {r.dti_permit && (
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ title: `DTI / Barangay Permit — ${r.name}`, url: r.dti_permit })}
                        className="bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <i className="fas fa-certificate text-blue-600"></i>
                        <span>DTI/Barangay 👁️</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#E8D9B5] text-xs font-bold">
                  {r.app_status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl"
                    >
                      Approve Store
                    </button>
                  )}

                  {r.app_status !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl"
                    >
                      Reject Application
                    </button>
                  )}

                  {r.app_status === 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'SUSPENDED')}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl"
                    >
                      Suspend Store
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'USERS' && (
        <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-md overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[#E8D9B5] font-mono uppercase text-[#C1440E]">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D9B5]/40 font-medium">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-mono font-bold">#{u.id}</td>
                  <td className="py-3 font-bold text-[#5C3A21]">{u.name}</td>
                  <td className="py-3 text-[#4A3B2C]">{u.email}</td>
                  <td className="py-3">
                    <span className="bg-[#E8D9B5] text-[#5C3A21] px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-[#4A3B2C]">{u.phone || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-md space-y-3">
          <h3 className="font-display font-bold text-lg text-[#5C3A21]">Audit Logs</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-[#E8D9B5]/30 rounded-2xl text-xs font-mono border border-[#E8D9B5] flex justify-between">
                <div>
                  <span className="font-bold text-[#C1440E]">{log.action}:</span> {log.details}
                </div>
                <div className="text-[10px] opacity-60">
                  {new Date(log.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PERMITS ZOOM PREVIEW MODAL ── */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F7F1E3] rounded-3xl overflow-hidden max-w-2xl w-full border border-[#E8D9B5] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-[#5C3A21] text-[#F7F1E3] flex items-center justify-between shadow">
              <div className="flex items-center gap-2">
                <i className="fas fa-file-contract text-[#C1440E]"></i>
                <h3 className="font-display font-bold text-sm sm:text-base">{previewDocModal.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDocModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#F7F1E3] flex items-center justify-center transition"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-neutral-900/5 min-h-[300px]">
              <img
                src={previewDocModal.url}
                alt={previewDocModal.title}
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg border border-[#E8D9B5]"
              />
            </div>

            <div className="p-3 bg-[#E8D9B5]/40 border-t border-[#E8D9B5] flex items-center justify-between text-xs text-[#5C3A21] font-semibold">
              <span>Platform Verification • Official Compliance Document</span>
              <button
                onClick={() => setPreviewDocModal(null)}
                className="bg-[#C1440E] text-[#F7F1E3] px-4 py-1.5 rounded-xl font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
