import React from 'react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Stores', icon: '🍽️' },
  { id: 'Rice Meals', label: 'Rice Meals', icon: '🍚' },
  { id: 'Chicken', label: 'Chicken', icon: '🍗' },
  { id: 'Pasta', label: 'Pasta', icon: '🍝' },
  { id: 'Filipino Food', label: 'Filipino Food', icon: '🥩' },
  { id: 'Burgers', label: 'Burgers', icon: '🍔' },
  { id: 'Noodles', label: 'Noodles', icon: '🍜' },
  { id: 'Drinks', label: 'Drinks', icon: '🥤' },
  { id: 'Desserts', label: 'Desserts', icon: '🍰' },
];

export default function MarketplaceHome({
  restaurants = [],
  loading = false,
  activeCategory = 'ALL',
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  onSelectRestaurant,
  onOpenVendorRegister,
  favorites = [],
  onToggleFavorite,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">

      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#5C3A21] via-[#3D2514] to-[#C1440E] text-[#F7F1E3] p-8 sm:p-12 shadow-2xl border border-[#D4C299]/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-[#C1440E]/30 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#F7F1E3]/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide uppercase text-[#E8D9B5]">
            <span className="w-2 h-2 rounded-full bg-[#C1440E] animate-pulse"></span>
            Poblacion, Laang, Abra Food Marketplace
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight text-[#F7F1E3]">
            Good food from local businesses, delivered to you.
          </h1>

          <p className="text-[#E8D9B5]/90 text-sm sm:text-lg font-normal leading-relaxed">
            Discover homemade meals, local favorites, and food businesses around your area.
          </p>

          {/* Search bar inside Hero */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#5C3A21]/60"></i>
              <input
                type="text"
                placeholder="Search restaurants or food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F7F1E3] text-[#2B2118] pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold shadow-inner focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
              />
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('restaurant-listings');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] font-display font-bold px-6 py-3.5 rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Explore Restaurants</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOD CATEGORIES SLIDER / GRID ──────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#5C3A21]">
            Food Categories
          </h2>
          <span className="text-xs text-[#4A3B2C]/70 font-medium">Select a category to filter stores</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border ${
                  isActive
                    ? 'bg-[#C1440E] text-[#F7F1E3] border-[#C1440E] shadow-md scale-[1.03]'
                    : 'bg-[#E8D9B5]/50 hover:bg-[#E8D9B5] text-[#2B2118] border-[#D4C299] hover:border-[#5C3A21]/30'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RESTAURANTS / FOOD BUSINESSES ─────────────────────────── */}
      <div id="restaurant-listings" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8D9B5] pb-4">
          <div>
            <div className="text-xs font-mono uppercase font-bold text-[#C1440E]">
              Local Marketplace • Poblacion, Laang, Abra
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#5C3A21]">
              Registered Food Businesses
            </h2>
            <p className="text-xs sm:text-sm text-[#4A3B2C]/80 mt-0.5">
              Click a store to open its menu and start your order
            </p>
          </div>

          <button
            onClick={onOpenVendorRegister}
            className="self-start sm:self-auto bg-[#E8D9B5] hover:bg-[#D4C299] text-[#5C3A21] border border-[#5C3A21]/30 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2"
          >
            <i className="fas fa-store text-[#C1440E]"></i>
            <span>Register Your Food Business</span>
          </button>
        </div>

        {/* Restaurants Grid / Loading Skeleton / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-[#E8D9B5]/40 rounded-3xl p-4 animate-pulse h-72 border border-[#E8D9B5]"></div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-[#E8D9B5]/30 border-2 border-dashed border-[#D4C299] rounded-3xl p-10 text-center max-w-xl mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E8D9B5] text-[#5C3A21] flex items-center justify-center text-3xl mx-auto shadow-inner">
              <i className="fas fa-store-slash"></i>
            </div>
            <h3 className="font-display font-bold text-xl text-[#5C3A21]">
              No Food Businesses Found
            </h3>
            <p className="text-[#4A3B2C]/80 text-sm max-w-md mx-auto">
              {searchQuery || activeCategory !== 'ALL'
                ? `No restaurants found matching "${searchQuery || activeCategory}". Try clearing your filter or search criteria.`
                : 'There are currently no registered food businesses listed in Poblacion, Laang, Abra.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
                className="bg-[#C1440E] text-[#F7F1E3] px-5 py-2 rounded-xl font-bold text-xs shadow"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => {
              const isOpen = restaurant.status === 'open';
              const isFav = favorites.includes(restaurant.id);

              return (
                <div
                  key={restaurant.id}
                  onClick={() => onSelectRestaurant(restaurant)}
                  className="group bg-[#F7F1E3] rounded-3xl overflow-hidden border border-[#E8D9B5] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative"
                >
                  {/* Business Cover Image & Logo Overlay */}
                  <div className="relative h-48 overflow-hidden bg-[#5C3A21]/10">
                    <img
                      src={restaurant.photo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-md backdrop-blur-md ${
                        isOpen ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-900/80 text-neutral-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`}></span>
                        {isOpen ? '🟢 OPEN NOW' : '🔴 CLOSED'}
                      </span>
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(restaurant.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#F7F1E3]/80 hover:bg-[#F7F1E3] backdrop-blur-md flex items-center justify-center shadow-md text-sm transition-transform active:scale-95"
                    >
                      <i className={`fas fa-heart ${isFav ? 'text-red-500' : 'text-[#4A3B2C]/40 hover:text-red-400'}`}></i>
                    </button>

                    {/* Business Logo Overlay */}
                    <div className="absolute -bottom-5 left-5">
                      <div className="w-14 h-14 rounded-2xl border-4 border-[#F7F1E3] bg-[#F7F1E3] overflow-hidden shadow-lg">
                        <img
                          src={restaurant.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="pt-7 p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display font-extrabold text-xl text-[#5C3A21] group-hover:text-[#C1440E] transition-colors truncate">
                          {restaurant.name}
                        </h3>
                      </div>

                      <p className="text-xs text-[#4A3B2C]/80 font-medium mt-0.5 line-clamp-1">
                        {restaurant.category} • {restaurant.address}
                      </p>
                    </div>

                    {/* Ratings & Meta Info */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E8D9B5]/60 font-semibold text-[#2B2118]">
                      <div className="flex items-center gap-1.5 bg-[#E8D9B5]/60 px-2.5 py-1 rounded-lg">
                        <i className="fas fa-star text-amber-500"></i>
                        <span className="font-bold text-[#5C3A21]">{restaurant.rating || 4.8}</span>
                        <span className="text-[#4A3B2C]/60 text-[11px]">({restaurant.review_count || 12})</span>
                      </div>

                      <div className="flex items-center gap-3 text-[#4A3B2C]/80">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-clock text-[#C1440E]/80 text-[11px]"></i>
                          <span>{restaurant.prep_time || '20–30 min'}</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <i className="fas fa-truck text-[#4B6043] text-[11px]"></i>
                          <span>₱{Number(restaurant.delivery_fee || 30).toFixed(0)}</span>
                        </span>
                      </div>
                    </div>

                    {/* View Menu CTA Button */}
                    <div className="pt-2">
                      <button className="w-full bg-[#E8D9B5]/70 group-hover:bg-[#C1440E] text-[#5C3A21] group-hover:text-[#F7F1E3] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                        <span>View Menu</span>
                        <i className="fas fa-chevron-right text-[10px]"></i>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
