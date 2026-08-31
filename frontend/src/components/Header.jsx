import React, { useState } from 'react';

export default function Header({
  activeView,
  setActiveView,
  cartCount,
  cartSubtotal,
  onOpenCart,
  userSession,
  onOpenLogin,
  onLogout,
  searchQuery,
  setSearchQuery,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F7F1E3]/95 backdrop-blur-md border-b border-[#E8D9B5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveView('MARKETPLACE')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#C1440E] to-[#A03408] flex items-center justify-center text-[#F7F1E3] shadow-md group-hover:scale-105 transition-transform">
              <i className="fas fa-utensils text-lg sm:text-xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-[#5C3A21]">
                  KARINDERYA KO
                </span>
                <span className="bg-[#C1440E] text-[#F7F1E3] text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded">
                  ABRA
                </span>
              </div>
              <p className="text-[11px] text-[#4A3B2C]/70 font-medium hidden sm:block">
                Local Food Business Marketplace
              </p>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A3B2C]/50 text-sm"></i>
            <input
              type="text"
              placeholder="Search for restaurants or food in Poblacion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#E8D9B5]/40 text-[#2B2118] pl-10 pr-4 py-2 rounded-xl text-sm font-medium border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]/50 focus:bg-[#F7F1E3] transition-all placeholder:text-[#4A3B2C]/60"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A3B2C]/60 hover:text-[#C1440E] text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 font-semibold text-sm">
            <button
              onClick={() => setActiveView('MARKETPLACE')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeView === 'MARKETPLACE' || activeView === 'RESTAURANT_DETAIL'
                  ? 'bg-[#C1440E] text-[#F7F1E3] shadow-sm'
                  : 'text-[#2B2118] hover:bg-[#E8D9B5]/60 hover:text-[#C1440E]'
              }`}
            >
              <i className="fas fa-[#C1440E] fa-store mr-1.5 opacity-80"></i>
              Restaurants
            </button>

            <button
              onClick={() => setActiveView('ORDERS')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeView === 'ORDERS' || activeView === 'ORDER_TRACKER'
                  ? 'bg-[#C1440E] text-[#F7F1E3] shadow-sm'
                  : 'text-[#2B2118] hover:bg-[#E8D9B5]/60 hover:text-[#C1440E]'
              }`}
            >
              <i className="fas fa-receipt mr-1.5 opacity-80"></i>
              Orders
            </button>

            <button
              onClick={() => setActiveView('FAVORITES')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeView === 'FAVORITES'
                  ? 'bg-[#C1440E] text-[#F7F1E3] shadow-sm'
                  : 'text-[#2B2118] hover:bg-[#E8D9B5]/60 hover:text-[#C1440E]'
              }`}
            >
              <i className="fas fa-heart mr-1.5 opacity-80"></i>
              Favorites
            </button>
          </nav>

          {/* Actions: User Auth & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Session Profile Button */}
            {userSession ? (
              <div className="relative group">
                <button 
                  onClick={() => {
                    if (userSession.role === 'OWNER') setActiveView('OWNER_PORTAL');
                    else if (userSession.role === 'ADMIN') setActiveView('ADMIN_PANEL');
                    else setActiveView('PROFILE');
                  }}
                  className="flex items-center gap-2 bg-[#E8D9B5]/60 hover:bg-[#E8D9B5] text-[#5C3A21] px-3 py-1.5 rounded-xl border border-[#D4C299] text-xs sm:text-sm font-bold transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#5C3A21] text-[#F7F1E3] flex items-center justify-center text-xs font-mono">
                    {userSession.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{userSession.name}</span>
                  <span className="text-[10px] bg-[#C1440E]/10 text-[#C1440E] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase">
                    {userSession.role}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#F7F1E3] border border-[#E8D9B5] rounded-2xl shadow-xl py-2 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-[#E8D9B5]">
                    <div className="font-bold text-xs text-[#5C3A21]">{userSession.name}</div>
                    <div className="text-[10px] text-[#4A3B2C]/70 truncate">{userSession.email}</div>
                  </div>

                  {userSession.role === 'OWNER' && (
                    <button
                      onClick={() => setActiveView('OWNER_PORTAL')}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#5C3A21] hover:bg-[#E8D9B5] flex items-center gap-2"
                    >
                      <i className="fas fa-store text-[#C1440E]"></i>
                      <span>My Restaurant Store</span>
                    </button>
                  )}

                  {userSession.role === 'ADMIN' && (
                    <button
                      onClick={() => setActiveView('ADMIN_PANEL')}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#5C3A21] hover:bg-[#E8D9B5] flex items-center gap-2"
                    >
                      <i className="fas fa-user-shield text-[#C1440E]"></i>
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveView('PROFILE')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[#2B2118] hover:bg-[#E8D9B5] flex items-center gap-2"
                  >
                    <i className="fas fa-user-circle text-[#5C3A21]"></i>
                    <span>Profile Settings</span>
                  </button>

                  <button
                    onClick={() => setActiveView('ORDERS')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[#2B2118] hover:bg-[#E8D9B5] flex items-center gap-2"
                  >
                    <i className="fas fa-receipt text-[#5C3A21]"></i>
                    <span>Order History</span>
                  </button>

                  <div className="border-t border-[#E8D9B5] my-1"></div>

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-[#E8D9B5] hover:bg-[#D4C299] text-[#5C3A21] px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-[#5C3A21]/20 transition-all flex items-center gap-2 shadow-sm"
              >
                <i className="fas fa-user-circle text-[#C1440E]"></i>
                <span>Log In / Register</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
            >
              <i className="fas fa-shopping-bag text-sm group-hover:scale-110 transition-transform"></i>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#F7F1E3] text-[#C1440E] text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full shadow-inner">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Search Bar Mobile */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B2C]/50 text-xs"></i>
            <input
              type="text"
              placeholder="Search restaurants or food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#E8D9B5]/40 text-[#2B2118] pl-9 pr-3 py-1.5 rounded-xl text-xs font-medium border border-[#D4C299] focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
