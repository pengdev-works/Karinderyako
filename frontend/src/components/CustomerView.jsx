import React from 'react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Karinderyas', icon: 'fa-table-cells-large' },
  { id: 'Luto-Bahay', label: 'Luto-Bahay', icon: 'fa-bowl-rice' },
  { id: 'Ihaw-Ihaw', label: 'Ihaw-Ihaw', icon: 'fa-fire' },
  { id: 'Merienda', label: 'Merienda & Drinks', icon: 'fa-glass-water' },
  { id: 'Silog', label: 'Silogan', icon: 'fa-egg' },
];

export default function CustomerView({
  karinderyas = [],
  loading = false,
  activeCategory,
  setActiveCategory,
  onSelectKarinderya,
  activeOrder,
  openLoginModal,
}) {
  // Helper to render chalk tally marks for the signature Tally Board element
  const renderTallyMarks = (stepName) => {
    if (!activeOrder) return '○';
    const sequence = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = sequence.indexOf(activeOrder.orderStatus);
    const stepIdx = sequence.indexOf(stepName);

    if (currentIdx > stepIdx) {
      return '✓ DONE';
    } else if (currentIdx === stepIdx) {
      if (stepName === 'PLACED') return '| [TALLY 1]';
      if (stepName === 'PREPARING') return '|| [TALLY 2]';
      if (stepName === 'OUT_FOR_DELIVERY') return '||| [TALLY 3]';
      if (stepName === 'DELIVERED') return '|||| / [TALLY 4]';
      return '● IN PROGRESS';
    } else {
      return '○ QUEUED';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Category Pills */}
      <div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border-2 ${
                  isActive
                    ? 'bg-atsuete text-kanin border-atsuete shadow-md scale-[1.02]'
                    : 'bg-banig/60 text-uling border-banig hover:bg-banig hover:border-palayok/30'
                }`}
              >
                <i className={`fas ${cat.icon} ${isActive ? 'text-kanin' : 'text-atsuete'}`}></i>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-banig pb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-atsuete font-bold">
            Service Area: Poblacion, Laang, Abra
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-palayok">
            Verified Home Karinderyas
          </h2>
          <p className="text-uling-light/80 text-xs sm:text-sm mt-0.5">
            Support authentic local food sellers in your barangay
          </p>
        </div>

        <button
          onClick={openLoginModal}
          id="become-partner-btn"
          className="self-start sm:self-auto bg-banig hover:bg-banig-dark text-palayok border-2 border-palayok/40 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2"
        >
          <i className="fas fa-store text-atsuete"></i>
          <span>Become a Partner Seller</span>
        </button>
      </div>

      {/* Loading Skeleton or Empty State or Karinderya Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-banig/50 rounded-2xl p-4 animate-pulse h-64 border border-banig"></div>
          ))}
        </div>
      ) : karinderyas.length === 0 ? (
        <div className="bg-banig/40 border-2 border-dashed border-banig-dark rounded-3xl p-10 text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-banig text-palayok flex items-center justify-center text-2xl mx-auto mb-4 shadow">
            <i className="fas fa-store-slash"></i>
          </div>
          <h3 className="font-display font-bold text-xl text-palayok mb-2">
            No Karinderyas Listed Yet
          </h3>
          <p className="text-uling-light/80 text-sm mb-6 max-w-md mx-auto font-body">
            There are currently no food sellers registered under this filter in Poblacion, Laang, Abra. Be the first business owner to list your home eatery!
          </p>
          <button
            onClick={openLoginModal}
            id="register-karinderya-btn"
            className="bg-atsuete hover:bg-atsuete-dark text-kanin px-6 py-2.5 rounded-xl font-display font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <i className="fas fa-plus-circle"></i>
            <span>Register Your Karinderya</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {karinderyas.map((k) => {
            const isOpen = k.status === 'open' || k.status === 'OPEN' || !k.status;
            return (
              <div
                key={k.id}
                id={`karinderya-${k.id}`}
                onClick={() => onSelectKarinderya(k)}
                className="bg-banig rounded-2xl overflow-hidden border-2 border-banig-dark/40 shadow-karinderya hover:shadow-karinderya-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col group"
              >
                {/* Photo Header */}
                <div className="relative h-44 overflow-hidden bg-palayok/20">
                  <img
                    src={k.photo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'}
                    alt={k.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold shadow ${
                      isOpen ? 'bg-banana-leaf text-kanin' : 'bg-uling/80 text-banig'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-300 animate-ping' : 'bg-red-400'}`}></span>
                      {isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-palayok/90 backdrop-blur-sm text-kanin px-2.5 py-1 rounded-lg text-xs font-mono font-semibold">
                    <i className="fas fa-tag text-atsuete mr-1.5"></i>
                    {k.category || 'Luto-Bahay'}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-palayok group-hover:text-atsuete transition-colors leading-tight mb-1">
                      {k.name}
                    </h3>
                    <p className="text-uling-light/80 text-xs line-clamp-2 mb-3">
                      {k.description || 'Home-cooked Filipino specials prepared daily in Poblacion.'}
                    </p>
                    <div className="text-xs font-mono text-banana-leaf font-bold flex items-center gap-1.5">
                      <i className="fas fa-location-dot text-atsuete"></i>
                      <span>{k.address}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-banig-dark/30 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-palayok">
                      <i className="fas fa-star text-amber-500"></i>
                      {(k.review_count || k.reviewCount) > 0 && k.rating ? (
                        <>
                          <span>{parseFloat(k.rating).toFixed(1)}</span>
                          <span className="text-uling-light/60 font-normal">({k.review_count || k.reviewCount})</span>
                        </>
                      ) : (
                        <span>New</span>
                      )}
                    </div>
                    <span className="bg-palayok text-kanin group-hover:bg-atsuete font-display text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
                      View Menu →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SIGNATURE ELEMENT: Tally Board Status Tracker */}
      <div className="pt-8">
        <div className="bg-palayok text-kanin rounded-3xl p-6 sm:p-8 border-4 border-palayok-dark shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-banig/20 pb-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-banig font-bold">
                <i className="fas fa-clipboard-list text-atsuete"></i>
                <span>Karinderya Tally Board · Order Slip</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-kanin mt-1">
                Active Order Checklist
              </h3>
            </div>
            {activeOrder ? (
              <div className="bg-banig text-palayok px-4 py-1.5 rounded-xl font-mono text-xs font-bold border border-banig-dark">
                Ref: <span className="text-atsuete font-extrabold">{activeOrder.id}</span>
              </div>
            ) : (
              <span className="text-xs font-mono text-banig/60">No active order</span>
            )}
          </div>

          {activeOrder ? (
            <div className="space-y-6">
              {/* Tally Mark Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'PLACED', title: '1. Order Placed', desc: 'Received by Karinderya', tally: '|' },
                  { key: 'PREPARING', title: '2. Cooking & Packing', desc: 'Preparing in kitchen', tally: '||' },
                  { key: 'OUT_FOR_DELIVERY', title: '3. Out for Delivery', desc: 'Rider on the way', tally: '|||' },
                  { key: 'DELIVERED', title: '4. Delivered', desc: 'Enjoy your luto-bahay!', tally: '|||| /' },
                ].map((step) => {
                  const status = renderTallyMarks(step.key);
                  const isDone = status.includes('DONE');
                  const isCurrent = status.includes('TALLY') || status.includes('PROGRESS');

                  return (
                    <div
                      key={step.key}
                      className={`p-4 rounded-2xl border-2 transition-all font-mono ${
                        isCurrent
                          ? 'bg-atsuete/90 border-banig text-kanin shadow-lg scale-[1.02]'
                          : isDone
                          ? 'bg-banana-leaf/40 border-banana-leaf text-emerald-200'
                          : 'bg-palayok-dark/60 border-banig/10 text-banig/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold tracking-wider">{step.title}</span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-black/30 font-mono text-amber-300">
                          {step.tally}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-90 mb-3">{step.desc}</div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-amber-300 animate-ping' : isDone ? 'bg-emerald-400' : 'bg-gray-500'}`}></span>
                        <span>{status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary Strip */}
              <div className="bg-kanin/10 border border-banig/20 rounded-2xl p-4 font-mono text-xs text-banig grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-banig/60 block text-[10px] uppercase">Karinderya</span>
                  <strong className="text-kanin">{activeOrder.karinderya_name || activeOrder.karinderyaName}</strong>
                </div>
                <div>
                  <span className="text-banig/60 block text-[10px] uppercase">Delivery Address</span>
                  <strong className="text-kanin">{activeOrder.delivery_address || activeOrder.deliveryAddress}</strong>
                </div>
                <div>
                  <span className="text-banig/60 block text-[10px] uppercase">Payment</span>
                  <strong className="text-amber-300">₱{parseFloat(activeOrder.total_amount || activeOrder.totalAmount || 0).toFixed(2)} ({activeOrder.payment_method || activeOrder.paymentMethod})</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-banig/70 font-mono text-xs">
              <i className="fas fa-clipboard text-2xl text-atsuete mb-2 block"></i>
              <span>No active orders in progress. Select a home karinderya above to place your order!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
