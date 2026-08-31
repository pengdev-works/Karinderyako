import React from 'react';

export default function MultiRestaurantCartModal({
  currentRestaurantName,
  newRestaurantName,
  onConfirmClearAndAdd,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F7F1E3] rounded-3xl overflow-hidden max-w-md w-full border-2 border-[#C1440E] shadow-2xl p-6 space-y-6 text-center">
        
        {/* Warning Icon Header */}
        <div className="w-16 h-16 rounded-full bg-[#C1440E]/10 text-[#C1440E] flex items-center justify-center text-3xl mx-auto shadow-inner">
          <i className="fas fa-exclamation-triangle"></i>
        </div>

        <div className="space-y-2">
          <h3 className="font-display font-extrabold text-2xl text-[#5C3A21]">
            Clear Current Cart?
          </h3>
          <p className="text-xs sm:text-sm text-[#4A3B2C]/90 font-medium leading-relaxed">
            Your cart contains items from <strong className="text-[#C1440E]">{currentRestaurantName || 'another restaurant'}</strong>.
          </p>
          <p className="text-xs text-[#4A3B2C]/70">
            You can only order from one food business at a time. Would you like to clear your cart and start a new order with <strong className="text-[#5C3A21]">{newRestaurantName}</strong>?
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onConfirmClearAndAdd}
            className="w-full bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] font-display font-bold py-3 px-4 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-trash-alt text-xs"></i>
            <span>Clear Cart & Add Item</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full bg-[#E8D9B5]/60 hover:bg-[#E8D9B5] text-[#5C3A21] font-bold py-2.5 px-4 rounded-2xl text-sm border border-[#D4C299] transition-all"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
