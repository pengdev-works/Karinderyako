import React, { useState, useEffect } from 'react';

export default function CheckoutPage({
  cart = [],
  cartRestaurant,
  userSession,
  onPlaceOrder,
  onBackToMenu,
  onRequireLogin,
  loading = false,
}) {
  const [name, setName] = useState(userSession?.name || '');
  const [phone, setPhone] = useState(userSession?.phone || '');
  const [address, setAddress] = useState(userSession?.address || 'Poblacion, Laang, Abra');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or E-WALLET
  const [error, setError] = useState('');

  // Sync with session if user logs in while on checkout
  useEffect(() => {
    if (userSession) {
      if (userSession.name) setName(userSession.name);
      if (userSession.phone) setPhone(userSession.phone);
      if (userSession.address) setAddress(userSession.address);
    }
  }, [userSession]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = Number(cartRestaurant?.delivery_fee || 30);
  const totalAmount = subtotal + deliveryFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userSession) {
      setError('Please log in or create an account to securely submit your order.');
      if (onRequireLogin) onRequireLogin('LOGIN');
      return;
    }
    if (!name || !phone || !address) {
      setError('Please fill in your name, contact number, and delivery address.');
      return;
    }
    setError('');

    onPlaceOrder({
      karinderyaId: cartRestaurant.id,
      customerUserId: userSession.id,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      deliveryAddress: address.trim(),
      landmark: landmark.trim(),
      deliveryNotes: notes.trim(),
      items: cart.map((i) => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        notes: i.notes || '',
      })),
      paymentMethod,
    });
  };

  if (!cartRestaurant || cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#E8D9B5] text-[#5C3A21] flex items-center justify-center text-3xl mx-auto">
          <i className="fas fa-shopping-cart text-[#C1440E]"></i>
        </div>
        <h2 className="font-display font-extrabold text-2xl text-[#5C3A21]">No Items in Cart</h2>
        <p className="text-sm text-[#4A3B2C]/70">Please add items from a restaurant menu before checking out.</p>
        <button
          onClick={onBackToMenu}
          className="bg-[#C1440E] text-[#F7F1E3] font-bold px-6 py-2.5 rounded-2xl shadow hover:bg-[#A03408] transition"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  // ── AUTHENTICATION REQUIRED GATE ──
  if (!userSession) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E8D9B5] pb-4">
          <button
            onClick={onBackToMenu}
            className="w-10 h-10 rounded-2xl bg-[#E8D9B5]/60 hover:bg-[#E8D9B5] text-[#5C3A21] flex items-center justify-center transition-all"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#5C3A21]">
              Secure Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[#4A3B2C]/80">
              Ordering from <strong>{cartRestaurant.name}</strong> • Total: <span className="font-mono font-bold text-[#C1440E]">₱{totalAmount.toFixed(0)}</span>
            </p>
          </div>
        </div>

        {/* Security Prompt Card */}
        <div className="bg-[#F7F1E3] rounded-3xl p-8 border border-[#E8D9B5] shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#C1440E]/10 text-[#C1440E] flex items-center justify-center text-4xl mx-auto border-2 border-[#C1440E]/20 shadow-sm">
            <i className="fas fa-shield-alt"></i>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-[#5C3A21]">
              Customer Login Required
            </h2>
            <p className="text-xs sm:text-sm text-[#4A3B2C]/80 leading-relaxed">
              To keep your transactions secure, verify your Poblacion delivery address, and track your rider in real time, please sign in or create an account.
            </p>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs font-semibold text-[#5C3A21]">
            <div className="bg-[#E8D9B5]/40 p-3.5 rounded-2xl border border-[#D4C299]/60 flex items-start gap-2.5">
              <i className="fas fa-motorcycle text-[#C1440E] text-base mt-0.5"></i>
              <div>
                <div className="font-bold">Live Tracking</div>
                <div className="text-[10px] text-[#4A3B2C]/70">Real-time rider updates</div>
              </div>
            </div>

            <div className="bg-[#E8D9B5]/40 p-3.5 rounded-2xl border border-[#D4C299]/60 flex items-start gap-2.5">
              <i className="fas fa-receipt text-[#4B6043] text-base mt-0.5"></i>
              <div>
                <div className="font-bold">Order History</div>
                <div className="text-[10px] text-[#4A3B2C]/70">Track receipts & status</div>
              </div>
            </div>

            <div className="bg-[#E8D9B5]/40 p-3.5 rounded-2xl border border-[#D4C299]/60 flex items-start gap-2.5">
              <i className="fas fa-lock text-[#5C3A21] text-base mt-0.5"></i>
              <div>
                <div className="font-bold">Verified Address</div>
                <div className="text-[10px] text-[#4A3B2C]/70">Poblacion geofenced</div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-sm mx-auto">
            <button
              onClick={() => onRequireLogin && onRequireLogin('LOGIN')}
              className="w-full sm:w-auto flex-1 bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] font-display font-extrabold py-3.5 px-6 rounded-2xl text-sm shadow-lg transition flex items-center justify-center gap-2"
            >
              <i className="fas fa-sign-in-alt"></i>
              <span>Sign In to Continue</span>
            </button>

            <button
              onClick={() => onRequireLogin && onRequireLogin('REG_CUSTOMER')}
              className="w-full sm:w-auto flex-1 bg-[#E8D9B5] hover:bg-[#D4C299] text-[#5C3A21] font-display font-extrabold py-3.5 px-6 rounded-2xl text-sm shadow transition flex items-center justify-center gap-2"
            >
              <i className="fas fa-user-plus"></i>
              <span>Create Account</span>
            </button>
          </div>

          <button
            onClick={onBackToMenu}
            className="text-xs text-[#5C3A21]/60 hover:text-[#5C3A21] font-bold underline"
          >
            ← Back to Store Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#E8D9B5] pb-4">
          <button
            onClick={onBackToMenu}
            className="w-10 h-10 rounded-2xl bg-[#E8D9B5]/60 hover:bg-[#E8D9B5] text-[#5C3A21] flex items-center justify-center transition-all"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#5C3A21]">
              Checkout Order
            </h1>
            <p className="text-xs sm:text-sm text-[#4A3B2C]/80">
              Complete your delivery details for <strong>{cartRestaurant.name}</strong>
            </p>
          </div>
        </div>

        {/* Verified User Card */}
        <div className="bg-[#4B6043]/10 border border-[#4B6043]/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4B6043] text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
              <i className="fas fa-user-check"></i>
            </div>
            <div>
              <div className="text-xs font-bold text-[#2B2118] flex items-center gap-2">
                <span>Ordering as <strong>{userSession.name}</strong></span>
                <span className="bg-[#4B6043] text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold">
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-[#4A3B2C]/70">
                {userSession.email} • Authenticated Customer Account
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#4B6043] font-bold flex items-center gap-1.5 self-end sm:self-center">
            <i className="fas fa-lock"></i>
            <span>Encrypted & Secured</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Info */}
            <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-[#5C3A21] flex items-center gap-2 border-b border-[#E8D9B5] pb-3">
                <i className="fas fa-map-marker-alt text-[#C1440E]"></i>
                <span>Customer Delivery Information</span>
              </h2>

              <div className="space-y-3 text-xs sm:text-sm font-semibold text-[#5C3A21]">
                <div>
                  <label className="block mb-1 font-bold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#E8D9B5]/30 text-[#2B2118] p-3 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#E8D9B5]/30 text-[#2B2118] p-3 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Delivery Address (Poblacion, Laang, Abra) *</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#E8D9B5]/30 text-[#2B2118] p-3 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold">Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Beside Barangay Hall"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-[#E8D9B5]/30 text-[#2B2118] p-3 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold">Delivery Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Leave at guardhouse"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#E8D9B5]/30 text-[#2B2118] p-3 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-[#5C3A21] flex items-center gap-2 border-b border-[#E8D9B5] pb-3">
                <i className="fas fa-wallet text-[#4B6043]"></i>
                <span>Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'COD' ? 'border-[#C1440E] bg-[#C1440E]/5 shadow-sm' : 'border-[#D4C299] bg-[#E8D9B5]/20'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-[#C1440E]"
                  />
                  <div>
                    <div className="font-bold text-sm text-[#5C3A21]">Cash on Delivery</div>
                    <div className="text-[11px] text-[#4A3B2C]/70">Pay upon food arrival</div>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'E-WALLET' ? 'border-[#C1440E] bg-[#C1440E]/5 shadow-sm' : 'border-[#D4C299] bg-[#E8D9B5]/20'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="E-WALLET"
                    checked={paymentMethod === 'E-WALLET'}
                    onChange={() => setPaymentMethod('E-WALLET')}
                    className="accent-[#C1440E]"
                  />
                  <div>
                    <div className="font-bold text-sm text-[#5C3A21]">E-Wallet (GCash / Maya)</div>
                    <div className="text-[11px] text-[#4A3B2C]/70">Record E-Wallet Payment</div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'E-WALLET' && (
                <div className="p-3 bg-[#E8D9B5]/40 rounded-2xl text-xs text-[#5C3A21] border border-[#D4C299]">
                  <i className="fas fa-info-circle text-[#C1440E] mr-1"></i>
                  Note: E-Wallet option will mark payment as <strong>RECORDED</strong> on your order receipt.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-lg space-y-4 sticky top-24">
              
              <div className="border-b border-[#E8D9B5] pb-3">
                <div className="text-[11px] font-mono font-bold uppercase text-[#C1440E]">
                  Target Restaurant
                </div>
                <h3 className="font-display font-extrabold text-xl text-[#5C3A21]">
                  {cartRestaurant.name}
                </h3>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs sm:text-sm font-medium border-b border-[#E8D9B5]/40 pb-2">
                    <div>
                      <div className="font-bold text-[#5C3A21]">
                        {item.name} <span className="text-[#C1440E]">× {item.qty}</span>
                      </div>
                      {item.notes && (
                        <div className="text-[10px] text-[#4A3B2C]/70 italic">"{item.notes}"</div>
                      )}
                    </div>
                    <div className="font-mono font-bold text-[#5C3A21]">
                      ₱{(item.price * item.qty).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-2 text-xs sm:text-sm pt-2 border-t border-[#E8D9B5]">
                <div className="flex justify-between text-[#4A3B2C]">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">₱{subtotal.toFixed(0)}</span>
                </div>

                <div className="flex justify-between text-[#4A3B2C]">
                  <span>Delivery Fee</span>
                  <span className="font-mono font-bold">₱{deliveryFee.toFixed(0)}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-[#5C3A21] border-t border-[#E8D9B5] pt-2">
                  <span>Grand Total</span>
                  <span className="font-mono text-xl text-[#C1440E]">₱{totalAmount.toFixed(0)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1440E] hover:bg-[#A03408] disabled:opacity-50 text-[#F7F1E3] font-display font-extrabold py-4 px-6 rounded-2xl text-base shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-[#C1440E] fa-check-circle"></i>
                    <span>Place Order — ₱{totalAmount.toFixed(0)}</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
