import React from 'react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  cartRestaurant,
  userSession,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = Number(cartRestaurant?.delivery_fee || 30);
  const grandTotal = subtotal + (cart.length > 0 ? deliveryFee : 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#F7F1E3] w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-[#E8D9B5]">
        
        {/* Header */}
        <div className="p-5 bg-[#5C3A21] text-[#F7F1E3] flex items-center justify-between shadow-md shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <i className="fas fa-shopping-bag text-[#C1440E]"></i>
              <h2 className="font-display font-extrabold text-xl">Your Cart</h2>
            </div>
            {cartRestaurant && (
              <p className="text-xs text-[#E8D9B5]/80 font-medium truncate mt-0.5 max-w-[240px]">
                Ordering from {cartRestaurant.name}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#F7F1E3] flex items-center justify-center transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Cart Item List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#E8D9B5] text-[#5C3A21] flex items-center justify-center text-2xl mx-auto shadow-inner">
                <i className="fas fa-shopping-basket"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[#5C3A21]">Your Cart is Empty</h3>
              <p className="text-xs text-[#4A3B2C]/70 max-w-xs mx-auto">
                Explore local food businesses and add your favorite dishes to start an order.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#4A3B2C]/70 border-b border-[#E8D9B5] pb-2">
                <span>{cart.length} item(s) selected</span>
                <button
                  onClick={onClearCart}
                  className="text-red-600 hover:underline font-bold flex items-center gap-1"
                >
                  <i className="fas fa-trash text-[10px]"></i> Clear Cart
                </button>
              </div>

              {cart.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="bg-[#E8D9B5]/30 rounded-2xl p-3 border border-[#E8D9B5] flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-sm text-[#5C3A21]">{item.name}</h4>
                    {item.notes && (
                      <p className="text-[11px] text-[#C1440E] italic bg-[#C1440E]/5 p-1 rounded-lg">
                        Note: "{item.notes}"
                      </p>
                    )}
                    <div className="font-mono font-bold text-xs text-[#C1440E]">
                      ₱{Number(item.price).toFixed(0)} × {item.qty} = ₱{(item.price * item.qty).toFixed(0)}
                    </div>
                  </div>

                  {/* Quantity Controller & Delete */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      <i className="fas fa-times"></i>
                    </button>

                    <div className="flex items-center gap-1.5 bg-[#F7F1E3] px-2 py-1 rounded-xl border border-[#D4C299]">
                      <button
                        onClick={() => onUpdateQty(idx, item.qty - 1)}
                        className="text-[#5C3A21] font-bold text-xs w-5 h-5 flex items-center justify-center hover:bg-[#E8D9B5] rounded"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-xs text-[#5C3A21] w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => onUpdateQty(idx, item.qty + 1)}
                        className="text-[#5C3A21] font-bold text-xs w-5 h-5 flex items-center justify-center hover:bg-[#E8D9B5] rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 bg-[#E8D9B5]/50 border-t border-[#E8D9B5] space-y-3.5 shrink-0">
            {/* Login Notice if Guest */}
            {!userSession ? (
              <div className="bg-[#5C3A21]/10 rounded-2xl p-3 text-xs text-[#5C3A21] flex items-start gap-2.5 border border-[#D4C299]/70">
                <i className="fas fa-shield-halved text-[#C1440E] text-base mt-0.5 shrink-0"></i>
                <div>
                  <div className="font-bold">Login Required to Checkout</div>
                  <p className="text-[11px] text-[#4A3B2C]/80 mt-0.5">
                    Sign in to verify your address, secure payment, and track your rider in real time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] font-bold text-[#4B6043] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-check-circle"></i>
                  <span>Signed in as {userSession.name}</span>
                </span>
                <span className="text-[#5C3A21]/60 text-[10px]">Secure Session</span>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-[#4A3B2C] font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold">₱{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee ({cartRestaurant?.name || 'Store'})</span>
                <span className="font-mono font-bold">₱{deliveryFee.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#5C3A21] border-t border-[#E8D9B5] pt-2">
                <span>Total Amount</span>
                <span className="font-mono text-base text-[#C1440E]">₱{grandTotal.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] font-display font-extrabold py-3.5 px-6 rounded-2xl text-base shadow-xl transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <i className={`fas ${userSession ? 'fa-arrow-right' : 'fa-lock'} text-sm`}></i>
                <span>{userSession ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
              </span>
              <span className="font-mono text-lg">₱{grandTotal.toFixed(0)}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
