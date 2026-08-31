import React, { useState } from 'react';

export default function FoodDetailModal({
  item,
  restaurant,
  onClose,
  onAddToCart,
}) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const totalPrice = Number(item.price) * qty;

  const handleAdd = () => {
    onAddToCart({
      item,
      qty,
      notes: notes.trim(),
      restaurant,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F7F1E3] rounded-3xl overflow-hidden max-w-lg w-full border border-[#E8D9B5] shadow-2xl space-y-0 relative max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-[#F7F1E3] flex items-center justify-center transition-all"
        >
          <i className="fas fa-times text-sm"></i>
        </button>

        {/* Food Cover Image */}
        <div className="relative h-56 sm:h-64 bg-[#5C3A21] shrink-0">
          <img
            src={item.photo || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-[#5C3A21]/90 backdrop-blur-md text-[#F7F1E3] px-3 py-1 rounded-xl text-xs font-mono font-bold">
            {restaurant?.name || 'Local Karinderya'}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display font-extrabold text-2xl text-[#5C3A21]">
                {item.name}
              </h2>
              <span className="font-mono font-extrabold text-xl text-[#C1440E]">
                ₱{Number(item.price).toFixed(0)}
              </span>
            </div>

            <p className="text-sm text-[#4A3B2C]/80 mt-1">
              {item.description || 'Prepared fresh with authentic local ingredients.'}
            </p>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5C3A21] uppercase tracking-wider">
              Special Instructions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Less spicy please, no onions, extra sauce..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#E8D9B5]/40 text-[#2B2118] p-3 rounded-2xl text-xs font-medium border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] placeholder:text-[#4A3B2C]/50"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between border-t border-[#E8D9B5] pt-4">
            <span className="font-bold text-sm text-[#5C3A21]">Quantity</span>
            <div className="flex items-center gap-3 bg-[#E8D9B5]/60 p-1.5 rounded-2xl border border-[#D4C299]">
              <button
                disabled={qty <= 1}
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 rounded-xl bg-[#F7F1E3] text-[#5C3A21] disabled:opacity-40 font-bold flex items-center justify-center shadow-sm"
              >
                -
              </button>
              <span className="font-mono font-bold text-base w-6 text-center text-[#5C3A21]">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-8 h-8 rounded-xl bg-[#C1440E] text-[#F7F1E3] font-bold flex items-center justify-center shadow-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Add to Cart CTA Footer */}
        <div className="p-4 bg-[#E8D9B5]/40 border-t border-[#E8D9B5] shrink-0">
          <button
            onClick={handleAdd}
            className="w-full bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] font-display font-extrabold py-3.5 px-6 rounded-2xl text-base shadow-xl transition-all flex items-center justify-between"
          >
            <span>Add to Cart</span>
            <span className="font-mono text-lg">₱{totalPrice.toFixed(0)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
