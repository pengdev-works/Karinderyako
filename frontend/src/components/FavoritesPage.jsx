import React from 'react';

export default function FavoritesPage({
  favoriteRestaurants = [],
  onSelectRestaurant,
  onRemoveFavorite,
  onBackToMarketplace,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#E8D9B5] pb-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#5C3A21]">
            Favorite Food Businesses
          </h1>
          <p className="text-xs sm:text-sm text-[#4A3B2C]/80">
            Quickly re-order from your favorite local eateries
          </p>
        </div>

        <button
          onClick={onBackToMarketplace}
          className="bg-[#C1440E] text-[#F7F1E3] font-bold px-4 py-2 rounded-xl text-xs shadow"
        >
          Explore All Stores
        </button>
      </div>

      {favoriteRestaurants.length === 0 ? (
        <div className="bg-[#E8D9B5]/30 border-2 border-dashed border-[#D4C299] rounded-3xl p-12 text-center max-w-md mx-auto my-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#E8D9B5] text-red-500 flex items-center justify-center text-3xl mx-auto">
            <i className="fas fa-heart"></i>
          </div>
          <h3 className="font-display font-bold text-xl text-[#5C3A21]">No Favorites Saved</h3>
          <p className="text-xs text-[#4A3B2C]/70">
            Click the heart icon on any restaurant card to save it to your favorites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => onSelectRestaurant(restaurant)}
              className="group bg-[#F7F1E3] rounded-3xl overflow-hidden border border-[#E8D9B5] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between p-4 relative"
            >
              <div className="flex gap-4">
                <img
                  src={restaurant.photo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'}
                  alt={restaurant.name}
                  className="w-24 h-24 rounded-2xl object-cover"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-base text-[#5C3A21] group-hover:text-[#C1440E] transition-colors">
                      {restaurant.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(restaurant.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  </div>
                  <p className="text-xs text-[#4A3B2C]/80 line-clamp-1">{restaurant.category}</p>
                  <div className="text-xs font-bold text-[#5C3A21] pt-1">
                    {restaurant.review_count > 0 && restaurant.rating 
                      ? `⭐ ${Number(restaurant.rating).toFixed(1)} (${restaurant.review_count} reviews)` 
                      : `⭐ New (No reviews yet)`}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E8D9B5]">
                <button className="w-full bg-[#C1440E] text-[#F7F1E3] py-2 rounded-xl text-xs font-bold shadow">
                  Open Store Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
