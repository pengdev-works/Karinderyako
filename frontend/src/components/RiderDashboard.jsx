import React from 'react';

export default function RiderDashboard({ orders = [], onUpdateStatus }) {
  const activeOrders = orders.filter(
    (o) => (o.order_status || o.orderStatus) !== 'DELIVERED' && (o.order_status || o.orderStatus) !== 'CANCELLED'
  );
  const completedOrders = orders.filter(
    (o) => (o.order_status || o.orderStatus) === 'DELIVERED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-palayok text-kanin rounded-3xl p-6 sm:p-8 border-4 border-palayok-dark shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-banig font-bold">
            <i className="fas fa-motorcycle text-atsuete"></i>
            <span>Delivery Rider Queue</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-kanin mt-1">
            Poblacion Delivery Operations
          </h1>
          <p className="text-banig/80 text-xs sm:text-sm mt-1 font-body">
            Coverage Area: Poblacion, Laang, Abra — Pick up from karinderyas and deliver to customers
          </p>
        </div>

        <div className="flex items-center gap-2 bg-banana-leaf/40 text-emerald-200 border border-banana-leaf/60 px-4 py-2 rounded-2xl font-mono text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></span>
          <span>On Duty Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-banig/60 border-2 border-banig-dark/40 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-mono uppercase font-bold text-atsuete">Active Deliveries</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-atsuete mt-1">
            {activeOrders.length}
          </div>
        </div>
        <div className="bg-banig/60 border-2 border-banig-dark/40 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-mono uppercase font-bold text-banana-leaf">Completed Today</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-banana-leaf mt-1">
            {completedOrders.length}
          </div>
        </div>
        <div className="bg-banig/60 border-2 border-banig-dark/40 rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
          <div className="text-xs font-mono uppercase font-bold text-palayok">Total Orders</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-palayok mt-1">
            {orders.length}
          </div>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl text-palayok">
            Active Delivery Requests
          </h2>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-banig/40 border-2 border-dashed border-banig-dark rounded-2xl p-8 text-center">
            <i className="fas fa-motorcycle text-3xl text-palayok/40 mb-2 block"></i>
            <h3 className="font-display font-bold text-base text-palayok mb-1">No Pending Deliveries</h3>
            <p className="text-xs text-uling-light/80">All current orders in Poblacion have been delivered. New orders will automatically appear here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((o) => {
              const currentStatus = o.order_status || o.orderStatus || 'PLACED';
              const totalAmt = parseFloat(o.total_amount || o.totalAmount || 0).toFixed(2);
              return (
                <div key={o.id} className="bg-banig rounded-2xl border-2 border-banig-dark/40 p-5 shadow-karinderya space-y-4">
                  <div className="flex items-center justify-between border-b border-banig-dark/30 pb-3">
                    <div>
                      <div className="font-mono text-xs font-bold text-atsuete">Ref: {o.id}</div>
                      <h4 className="font-display font-bold text-base text-palayok leading-tight">
                        {o.karinderya_name || o.karinderyaName}
                      </h4>
                    </div>
                    <span className="bg-palayok text-kanin px-3 py-1 rounded-full text-xs font-mono font-bold">
                      {currentStatus}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-body text-uling">
                    <div className="flex items-start gap-2">
                      <i className="fas fa-user text-palayok mt-0.5"></i>
                      <span><strong>Customer:</strong> {o.customer_name || o.customerName} ({o.customer_phone || o.customerPhone})</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="fas fa-location-dot text-atsuete mt-0.5"></i>
                      <span><strong>Drop-off:</strong> {o.delivery_address || o.deliveryAddress}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="fas fa-money-bill-wave text-banana-leaf mt-0.5"></i>
                      <span><strong>Collect COD:</strong> <span className="font-mono font-bold text-atsuete">₱{totalAmt}</span> ({o.payment_method || o.paymentMethod})</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {currentStatus === 'PLACED' && (
                      <button
                        onClick={() => onUpdateStatus(o.id, 'PREPARING')}
                        className="bg-palayok hover:bg-palayok-dark text-kanin px-3.5 py-1.5 rounded-xl font-bold text-xs shadow transition-all"
                      >
                        <i className="fas fa-utensils mr-1"></i> Mark Preparing
                      </button>
                    )}
                    {(currentStatus === 'PLACED' || currentStatus === 'PREPARING') && (
                      <button
                        onClick={() => onUpdateStatus(o.id, 'OUT_FOR_DELIVERY')}
                        className="bg-atsuete hover:bg-atsuete-dark text-kanin px-3.5 py-1.5 rounded-xl font-bold text-xs shadow transition-all"
                      >
                        <i className="fas fa-motorcycle mr-1"></i> Out for Delivery
                      </button>
                    )}
                    {currentStatus === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => onUpdateStatus(o.id, 'DELIVERED')}
                        className="bg-banana-leaf hover:bg-banana-leaf/90 text-kanin px-4 py-2 rounded-xl font-bold text-xs shadow transition-all"
                      >
                        <i className="fas fa-check-circle mr-1"></i> Mark Delivered & COD Collected
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Deliveries */}
      {completedOrders.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-palayok">Completed Today</h3>
          <div className="bg-banig/40 rounded-2xl border border-banig-dark/30 p-4 divide-y divide-banig-dark/20 text-xs font-mono">
            {completedOrders.map((o) => (
              <div key={o.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-palayok">{o.id}</strong> — {o.customer_name || o.customerName} ({o.delivery_address || o.deliveryAddress})
                </div>
                <span className="text-banana-leaf font-bold">
                  DELIVERED · ₱{parseFloat(o.total_amount || o.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
