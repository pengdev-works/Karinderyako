import React from 'react';

export default function BottomNav({
  activeView,
  setActiveView,
  cartCount,
  onOpenCart,
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F7F1E3]/95 backdrop-blur-md border-t border-[#E8D9B5] shadow-2xl px-2 py-2">
      <div className="flex items-center justify-around text-center">
        
        {/* Home / Marketplace */}
        <button
          onClick={() => setActiveView('MARKETPLACE')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
            activeView === 'MARKETPLACE' || activeView === 'RESTAURANT_DETAIL'
              ? 'text-[#C1440E]'
              : 'text-[#4A3B2C]/70 hover:text-[#5C3A21]'
          }`}
        >
          <i className="fas fa-store text-base"></i>
          <span>Stores</span>
        </button>

        {/* Orders */}
        <button
          onClick={() => setActiveView('ORDERS')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
            activeView === 'ORDERS' || activeView === 'ORDER_TRACKER'
              ? 'text-[#C1440E]'
              : 'text-[#4A3B2C]/70 hover:text-[#5C3A21]'
          }`}
        >
          <i className="fas fa-receipt text-base"></i>
          <span>Orders</span>
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold text-[#C1440E]"
        >
          <div className="relative">
            <i className="fas fa-shopping-bag text-base"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#C1440E] text-[#F7F1E3] text-[9px] font-mono font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-[#F7F1E3]">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => setActiveView('FAVORITES')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
            activeView === 'FAVORITES'
              ? 'text-[#C1440E]'
              : 'text-[#4A3B2C]/70 hover:text-[#5C3A21]'
          }`}
        >
          <i className="fas fa-heart text-base"></i>
          <span>Favorites</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => setActiveView('PROFILE')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
            activeView === 'PROFILE' || activeView === 'OWNER_PORTAL' || activeView === 'ADMIN_PANEL'
              ? 'text-[#C1440E]'
              : 'text-[#4A3B2C]/70 hover:text-[#5C3A21]'
          }`}
        >
          <i className="fas fa-user-circle text-base"></i>
          <span>Profile</span>
        </button>

      </div>
    </div>
  );
}
