import React, { useState } from 'react';

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: 'fa-paper-plane', desc: 'Sent to restaurant' },
  { key: 'ACCEPTED', label: 'Restaurant Accepted', icon: 'fa-store', desc: 'Order confirmed by store' },
  { key: 'PREPARING', label: 'Preparing Food', icon: 'fa-utensils', desc: 'Kitchen is cooking your meal' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: 'fa-motorcycle', desc: 'Rider is on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'fa-box-open', desc: 'Enjoy your meal!' },
];

export default function OrderTrackerPage({
  order,
  onBack,
  onRefresh,
  onSubmitReview,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-display font-extrabold text-2xl text-[#5C3A21]">Order Not Found</h2>
        <button onClick={onBack} className="bg-[#C1440E] text-[#F7F1E3] font-bold px-5 py-2 rounded-xl">
          ← Back to Orders
        </button>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.order_status);
  const isDelivered = order.order_status === 'DELIVERED';

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (onSubmitReview) {
      onSubmitReview({
        orderId: order.id,
        karinderyaId: order.karinderya_id,
        customerName: order.customer_name,
        rating,
        comment,
      });
      setReviewSubmitted(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D9B5] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-[#E8D9B5]/60 hover:bg-[#E8D9B5] text-[#5C3A21] flex items-center justify-center transition-all"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-xl sm:text-2xl text-[#C1440E]">
                Order #{order.id}
              </span>
              <span className="bg-[#C1440E]/10 text-[#C1440E] text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                {order.payment_method || 'COD'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A3B2C]/80 font-medium">
              Restaurant: <strong className="text-[#5C3A21]">{order.karinderya_name}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="self-start sm:self-auto bg-[#E8D9B5] hover:bg-[#D4C299] text-[#5C3A21] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <i className="fas fa-[#C1440E] fa-sync-alt"></i>
          <span>Refresh Status</span>
        </button>
      </div>

      {/* ── STATUS TIMELINE ────────────────────────────────────────── */}
      <div className="bg-[#F7F1E3] rounded-3xl p-6 sm:p-8 border border-[#E8D9B5] shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8D9B5] pb-4">
          <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#5C3A21] flex items-center gap-2">
            <i className="fas fa-route text-[#C1440E]"></i>
            <span>Order Status Tracker</span>
          </h2>
          <span className="font-mono text-xs font-bold text-[#4B6043] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {order.order_status}
          </span>
        </div>

        {/* Step Cards Grid / Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {STATUS_STEPS.map((step, idx) => {
            const isDone = currentIdx > idx;
            const isCurrent = currentIdx === idx;

            return (
              <div
                key={step.key}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 relative ${
                  isDone
                    ? 'border-[#4B6043] bg-emerald-50/50 text-[#4B6043]'
                    : isCurrent
                    ? 'border-[#C1440E] bg-[#C1440E]/5 text-[#C1440E] shadow-md scale-[1.02]'
                    : 'border-[#E8D9B5] bg-[#E8D9B5]/20 text-[#4A3B2C]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isDone
                      ? 'bg-[#4B6043] text-[#F7F1E3]'
                      : isCurrent
                      ? 'bg-[#C1440E] text-[#F7F1E3] animate-pulse'
                      : 'bg-[#E8D9B5] text-[#5C3A21]/50'
                  }`}>
                    {isDone ? <i className="fas fa-check text-xs"></i> : <i className={`fas ${step.icon} text-xs`}></i>}
                  </div>
                  <span className="font-mono text-[10px] font-bold">Step {idx + 1}</span>
                </div>

                <div>
                  <div className="font-bold text-xs sm:text-sm leading-snug">{step.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5 line-clamp-2">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ORDER DETAILS BREAKDOWN ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer & Delivery Information */}
        <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-[#5C3A21] border-b border-[#E8D9B5] pb-2 flex items-center gap-2">
            <i className="fas fa-user-alt text-[#C1440E]"></i>
            <span>Customer Information</span>
          </h3>

          <div className="space-y-2 text-xs sm:text-sm text-[#4A3B2C]">
            <div>
              <span className="font-bold text-[#5C3A21]">Customer:</span> {order.customer_name}
            </div>
            <div>
              <span className="font-bold text-[#5C3A21]">Contact Number:</span> {order.customer_phone}
            </div>
            <div>
              <span className="font-bold text-[#5C3A21]">Delivery Address:</span> {order.delivery_address}
            </div>
            {order.landmark && (
              <div>
                <span className="font-bold text-[#5C3A21]">Landmark:</span> {order.landmark}
              </div>
            )}
            {order.delivery_notes && (
              <div>
                <span className="font-bold text-[#5C3A21]">Delivery Notes:</span> "{order.delivery_notes}"
              </div>
            )}
          </div>
        </div>

        {/* Item Receipts & Receipt Totals */}
        <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-[#5C3A21] border-b border-[#E8D9B5] pb-2 flex items-center gap-2">
            <i className="fas fa-receipt text-[#5C3A21]"></i>
            <span>Order Items Receipt</span>
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs text-[#2B2118] border-b border-[#E8D9B5]/40 pb-1.5">
                <div>
                  <span className="font-bold text-[#5C3A21]">{item.product_name}</span>
                  <span className="text-[#C1440E] font-bold ml-1">× {item.qty}</span>
                  {item.notes && <div className="text-[10px] text-[#4A3B2C]/70 italic">"{item.notes}"</div>}
                </div>
                <span className="font-mono font-bold">₱{(Number(item.product_price) * item.qty).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs text-[#4A3B2C] border-t border-[#E8D9B5] pt-3 font-semibold">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono font-bold">₱{Number(order.subtotal || 0).toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-mono font-bold">₱{Number(order.delivery_fee || 30).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#5C3A21] border-t border-[#E8D9B5] pt-2">
              <span>Total Amount</span>
              <span className="font-mono text-base text-[#C1440E]">₱{Number(order.total_amount || 0).toFixed(0)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── CUSTOMER REVIEW SECTION (IF DELIVERED) ──────────────────── */}
      {isDelivered && (
        <div className="bg-[#F7F1E3] rounded-3xl p-6 sm:p-8 border border-[#E8D9B5] shadow-lg space-y-4">
          <div className="border-b border-[#E8D9B5] pb-3">
            <h3 className="font-display font-extrabold text-lg text-[#5C3A21] flex items-center gap-2">
              <i className="fas fa-star text-amber-500"></i>
              <span>Rate Your Experience with {order.karinderya_name}</span>
            </h3>
            <p className="text-xs text-[#4A3B2C]/80">Share your review for this completed order.</p>
          </div>

          {reviewSubmitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2">
              <i className="fas fa-check-circle text-lg"></i>
              <span>Thank you for reviewing {order.karinderya_name}! Your feedback has been submitted.</span>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5C3A21]">Rating:</span>
                <div className="flex items-center gap-1 text-xl text-amber-500 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      onClick={() => setRating(star)}
                      className={`fas fa-star transition-transform hover:scale-110 ${
                        star <= rating ? 'text-amber-500' : 'text-neutral-300'
                      }`}
                    ></i>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="How was the food quality, taste, and delivery speed?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 text-[#2B2118] p-3 rounded-2xl text-xs font-medium border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                />
              </div>

              <button
                type="submit"
                className="bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] font-display font-bold px-6 py-2.5 rounded-2xl text-xs shadow transition-all"
              >
                Submit Store Review
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
