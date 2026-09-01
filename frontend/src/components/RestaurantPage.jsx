import React, { useState, useMemo } from 'react';

export default function RestaurantPage({
  restaurant,
  menuItems = [],
  loading = false,
  onBack,
  onSelectItem,
  cartCount,
  cartSubtotal,
  onOpenCart,
  isFav = false,
  onToggleFavorite,
}) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchMenu, setSearchMenu] = useState('');

  // Extract unique categories from menu items
  const categories = useMemo(() => {
    const set = new Set(menuItems.map((item) => item.category || 'Popular'));
    return ['ALL', ...Array.from(set)];
  }, [menuItems]);

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = activeCategory === 'ALL' || item.category === activeCategory;
      const matchSearch =
        !searchMenu ||
        item.name.toLowerCase().includes(searchMenu.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchMenu.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [menuItems, activeCategory, searchMenu]);

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-[#4A3B2C] text-lg font-bold">Restaurant not found.</p>
        <button onClick={onBack} className="mt-4 bg-[#C1440E] text-[#F7F1E3] px-4 py-2 rounded-xl font-bold">
          ← Back to Restaurants
        </button>
      </div>
    );
  }

  const isOpen = restaurant.status === 'open';

  return (
    <div className="min-h-screen pb-24">
      {/* ── COVER HEADER ───────────────────────────────────────────── */}
      <div className="relative h-64 sm:h-80 bg-[#5C3A21]">
        <img
          src={restaurant.photo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2118] via-transparent to-black/40"></div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={onBack}
            className="bg-[#F7F1E3]/90 hover:bg-[#F7F1E3] text-[#5C3A21] px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg transition-all flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Restaurants</span>
          </button>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => onToggleFavorite(restaurant.id)}
            className="w-10 h-10 rounded-2xl bg-[#F7F1E3]/90 hover:bg-[#F7F1E3] text-red-500 backdrop-blur-md flex items-center justify-center shadow-lg transition-all"
          >
            <i className={`fas fa-heart text-base ${isFav ? 'text-red-500' : 'text-[#4A3B2C]/40'}`}></i>
          </button>
        </div>
      </div>

      {/* ── RESTAURANT HEADER CARD ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-[#F7F1E3] rounded-3xl p-6 sm:p-8 border border-[#E8D9B5] shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Business Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-[#F7F1E3] bg-[#E8D9B5] overflow-hidden shadow-md shrink-0">
                <img
                  src={restaurant.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
                    isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isOpen ? 'Open Now' : 'Closed'}
                  </span>
                  <span className="bg-[#C1440E]/10 text-[#C1440E] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                    {restaurant.category || 'Filipino Food'}
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#5C3A21]">
                  {restaurant.name}
                </h1>

                <p className="text-xs sm:text-sm text-[#4A3B2C]/80 font-medium">
                  {restaurant.description || 'Authentic local home dishes in Poblacion, Laang, Abra.'}
                </p>
              </div>
            </div>

            {/* Delivery & Rating Quick Stats */}
            <div className="flex flex-wrap md:flex-col gap-3 w-full md:w-auto text-xs sm:text-sm font-semibold text-[#2B2118] border-t md:border-t-0 md:border-l border-[#E8D9B5] pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-2">
                <i className="fas fa-star text-amber-500 text-base"></i>
                <div>
                  {restaurant.review_count > 0 && restaurant.rating ? (
                    <>
                      <span className="font-bold text-[#5C3A21]">{Number(restaurant.rating).toFixed(1)}</span>
                      <span className="text-[#4A3B2C]/60 text-xs ml-1">({restaurant.review_count} {restaurant.review_count === 1 ? 'review' : 'reviews'})</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-[#5C3A21]">New</span>
                      <span className="text-[#4A3B2C]/60 text-xs ml-1">(No reviews yet)</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#4A3B2C]/80">
                <i className="fas fa-clock text-[#C1440E]"></i>
                <span>Prep: {restaurant.prep_time || '20–30 min'}</span>
              </div>

              <div className="flex items-center gap-2 text-[#4A3B2C]/80">
                <i className="fas fa-truck text-[#4B6043]"></i>
                <span>Delivery: ₱{Number(restaurant.delivery_fee || 30).toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Details Collapsible / Metadata Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E8D9B5]/60 text-xs text-[#4A3B2C]/80">
            <div className="flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-[#C1440E]"></i>
              <span className="truncate">{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-business-time text-[#5C3A21]"></i>
              <span>Hours: {restaurant.operating_hours || '8:00 AM - 8:00 PM'}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-phone text-[#4B6043]"></i>
              <span>Contact: {restaurant.phone || '0917-123-4567'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY MENU CATEGORY BAR ────────────────────────────────── */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#F7F1E3]/95 backdrop-blur-md border-b border-[#E8D9B5] my-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Horizontal Category Pill Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-[#C1440E] text-[#F7F1E3] border-[#C1440E] shadow-sm'
                      : 'bg-[#E8D9B5]/40 text-[#2B2118] border-[#D4C299] hover:bg-[#E8D9B5]'
                  }`}
                >
                  {cat === 'ALL' ? '🌟 All Items' : cat}
                </button>
              );
            })}
          </div>

          {/* Search inside store menu */}
          <div className="hidden sm:block relative w-56 shrink-0">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B2C]/50 text-xs"></i>
            <input
              type="text"
              placeholder="Search store menu..."
              value={searchMenu}
              onChange={(e) => setSearchMenu(e.target.value)}
              className="w-full bg-[#E8D9B5]/40 text-[#2B2118] pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium border border-[#D4C299] focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
            />
          </div>

        </div>
      </div>

      {/* ── MENU ITEMS GRID ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-[#E8D9B5]/40 rounded-3xl p-4 animate-pulse h-40"></div>
            ))}
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="bg-[#E8D9B5]/30 border-2 border-dashed border-[#D4C299] rounded-3xl p-8 text-center max-w-md mx-auto my-8">
            <i className="fas fa-utensils text-3xl text-[#5C3A21]/40 mb-2"></i>
            <h3 className="font-bold text-lg text-[#5C3A21]">No Menu Items</h3>
            <p className="text-xs text-[#4A3B2C]/70">No items available under this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item) => {
              const isAvailable = item.available !== false;
              return (
                <div
                  key={item.id}
                  onClick={() => isAvailable && onSelectItem(item)}
                  className={`bg-[#F7F1E3] rounded-3xl overflow-hidden border border-[#E8D9B5] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between p-4 group ${
                    isAvailable ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#5C3A21]/10 shrink-0 relative">
                      <img
                        src={item.photo || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[#F7F1E3] text-[10px] font-bold font-mono uppercase text-center px-1">
                          Sold Out
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between space-y-1.5">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-display font-extrabold text-base text-[#5C3A21] group-hover:text-[#C1440E] transition-colors">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#4A3B2C]/80 line-clamp-2 mt-0.5">
                          {item.description || 'Delicious freshly prepared meal.'}
                        </p>
                      </div>

                      {/* Price & Add Button */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono font-extrabold text-lg text-[#C1440E]">
                          ₱{Number(item.price).toFixed(0)}
                        </span>

                        <button
                          disabled={!isAvailable}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAvailable) onSelectItem(item);
                          }}
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-base transition-all shadow ${
                            isAvailable
                              ? 'bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] active:scale-95'
                              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CUSTOMER REVIEWS & RATINGS SECTION ──────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16 space-y-6">
        <div className="border-t border-[#E8D9B5] pt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-[#5C3A21] flex items-center gap-2">
              <i className="fas fa-star text-amber-500"></i>
              <span>Customer Reviews & Ratings</span>
            </h2>
            <p className="text-xs text-[#4A3B2C]/70 mt-0.5">
              Verified feedback from diners in Poblacion, Laang, Abra
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#E8D9B5]/60 px-4 py-2 rounded-2xl border border-[#D4C299]">
            <i className="fas fa-star text-amber-500 text-base"></i>
            {restaurant.review_count > 0 && restaurant.rating ? (
              <>
                <span className="font-display font-extrabold text-lg text-[#5C3A21]">
                  {Number(restaurant.rating).toFixed(1)}
                </span>
                <span className="text-xs text-[#4A3B2C]/70 font-semibold">
                  ({restaurant.review_count} {restaurant.review_count === 1 ? 'review' : 'reviews'})
                </span>
              </>
            ) : (
              <span className="font-bold text-xs text-[#5C3A21]">New (No reviews yet)</span>
            )}
          </div>
        </div>

        {/* Reviews List */}
        {!restaurant.reviews || restaurant.reviews.length === 0 ? (
          <div className="bg-[#F7F1E3] rounded-3xl p-8 border border-[#E8D9B5] text-center space-y-2 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#E8D9B5] text-[#5C3A21] flex items-center justify-center text-xl mx-auto">
              <i className="fas fa-comment-dots text-[#C1440E]"></i>
            </div>
            <h3 className="font-display font-bold text-base text-[#5C3A21]">No reviews yet</h3>
            <p className="text-xs text-[#4A3B2C]/70">
              Be the first customer to place an order and rate the food from {restaurant.name}!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurant.reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#5C3A21] text-[#F7F1E3] font-bold text-xs flex items-center justify-center">
                        {(rev.customer_name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#5C3A21]">{rev.customer_name || 'Verified Customer'}</div>
                        <div className="text-[10px] text-[#4A3B2C]/60">
                          {new Date(rev.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex text-amber-500 text-xs gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fas fa-star ${star <= Number(rev.rating) ? 'text-amber-500' : 'text-neutral-300'}`}
                        ></i>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#2B2118] font-medium leading-relaxed bg-[#E8D9B5]/20 p-3 rounded-2xl border border-[#E8D9B5]/40">
                    "{rev.comment || 'Great food and fast delivery!'}"
                  </p>
                </div>

                {/* Owner Reply */}
                {rev.reply && (
                  <div className="bg-[#4B6043]/10 border border-[#4B6043]/25 rounded-2xl p-3 space-y-1 text-xs">
                    <div className="font-bold text-[11px] text-[#4B6043] flex items-center gap-1.5">
                      <i className="fas fa-reply text-[10px]"></i>
                      <span>Response from {restaurant.name}:</span>
                    </div>
                    <p className="text-[11px] text-[#2B2118] italic pl-3 border-l-2 border-[#4B6043]/40">
                      "{rev.reply}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FLOATING VIEW CART BAR (MOBILE/DESKTOP STICKY) ───────────── */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md">
          <button
            onClick={onOpenCart}
            className="w-full bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] p-4 rounded-3xl shadow-2xl transition-all duration-300 flex items-center justify-between font-display font-extrabold border border-[#F7F1E3]/20 animate-bounce"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#F7F1E3] text-[#C1440E] flex items-center justify-center font-mono text-sm">
                {cartCount}
              </span>
              <span>View Cart</span>
            </div>
            <span className="font-mono text-lg">₱{cartSubtotal.toFixed(0)}</span>
          </button>
        </div>
      )}

    </div>
  );
}
