import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../api';

export default function OwnerDashboard({ userSession, onOpenMarketplace }) {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ORDERS'); // ORDERS | MENU | PROFILE | REVIEWS | SALES

  // Profile Form State
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeCategory, setStoreCategory] = useState('Filipino Food');
  const [prepTime, setPrepTime] = useState('20–30 min');
  const [operatingHours, setOperatingHours] = useState('8:00 AM - 8:00 PM');
  const [storePhoto, setStorePhoto] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [storeStatus, setStoreStatus] = useState('open');
  const [saveLoading, setSaveLoading] = useState(false);

  // File upload helpers with client-side compression
  const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.85) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Cover photo must be under 10 MB'); return; }
    const dataUrl = await compressImage(file, 1200, 800, 0.85);
    setStorePhoto(dataUrl);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Logo must be under 5 MB'); return; }
    const dataUrl = await compressImage(file, 400, 400, 0.88);
    setStoreLogo(dataUrl);
  };

  // Add Product Form State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Popular');
  const [prodPhoto, setProdPhoto] = useState('');
  const [prodPhotoUploading, setProdPhotoUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('UPLOAD'); // 'UPLOAD' | 'URL'
  const [prodLoading, setProdLoading] = useState(false);

  const handleProductPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be under 10 MB');
      return;
    }
    setProdPhotoUploading(true);
    try {
      const compressed = await compressImage(file, 900, 900, 0.85);
      setProdPhoto(compressed);
    } catch (err) {
      alert('Failed to process image file');
    } finally {
      setProdPhotoUploading(false);
    }
  };

  // Business Documents & Food Safety Compliance State
  const [businessPermit, setBusinessPermit] = useState('');
  const [sanitaryPermit, setSanitaryPermit] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [dtiPermit, setDtiPermit] = useState('');
  const [docsLoading, setDocsLoading] = useState(false);
  const [previewDocModal, setPreviewDocModal] = useState(null); // { title, url }

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  // ── FETCH STORE DATA ─────────────────────────────────────────
  const loadOwnerData = useCallback(async () => {
    if (!userSession || userSession.role !== 'OWNER') return;
    setLoading(true);
    try {
      const storeData = await api.fetchOwnerRestaurant(userSession.id);
      setStore(storeData);

      if (storeData) {
        setStoreName(storeData.name || '');
        setStorePhone(storeData.phone || '');
        setStoreAddress(storeData.address || '');
        setStoreDesc(storeData.description || '');
        setStoreCategory(storeData.category || 'Filipino Food');
        setPrepTime(storeData.prep_time || '20–30 min');
        setOperatingHours(storeData.operating_hours || '8:00 AM - 8:00 PM');
        setStorePhoto(storeData.photo || '');
        setStoreLogo(storeData.logo || '');
        setStoreStatus(storeData.status || 'open');

        // Document permits
        setBusinessPermit(storeData.business_permit || '');
        setSanitaryPermit(storeData.sanitary_permit || '');
        setGovernmentId(storeData.government_id || '');
        setDtiPermit(storeData.dti_permit || '');

        // Fetch full restaurant (with reviews), menu, and orders
        const [fullStore, prodList, orderList] = await Promise.all([
          api.fetchRestaurantById(storeData.id),
          api.fetchRestaurantMenu(storeData.id),
          api.fetchOrders({ karinderyaId: storeData.id }),
        ]);

        setProducts(prodList || []);
        setOrders(orderList || []);
        setReviews(fullStore?.reviews || []);
      }
    } catch (err) {
      console.error('Error loading store portal:', err);
    } finally {
      setLoading(false);
    }
  }, [userSession]);

  useEffect(() => {
    loadOwnerData();
  }, [loadOwnerData]);

  // Document compliance checker
  const hasCompletedDocuments = Boolean(
    (store?.business_permit || businessPermit) &&
    (store?.sanitary_permit || sanitaryPermit) &&
    (store?.government_id || governmentId)
  );

  // Document file upload with client compression
  const handlePermitFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Document file must be under 15 MB');
      return;
    }
    try {
      const compressed = await compressImage(file, 1600, 1600, 0.88);
      if (type === 'BUSINESS') setBusinessPermit(compressed);
      else if (type === 'SANITARY') setSanitaryPermit(compressed);
      else if (type === 'GOV_ID') setGovernmentId(compressed);
      else if (type === 'DTI') setDtiPermit(compressed);
    } catch (err) {
      alert('Failed to process document file');
    }
  };

  // Document Upload Submit Handler
  const handleUploadDocuments = async (e) => {
    if (e) e.preventDefault();
    if (!businessPermit || !sanitaryPermit || !governmentId) {
      alert('⚠️ Please upload all 3 required documents: Mayor\'s / Business Permit, Sanitary / Health Permit, and Valid Government ID.');
      return;
    }
    setDocsLoading(true);
    try {
      const updatedStore = await api.uploadStoreDocuments({
        ownerUserId: userSession.id,
        karinderyaId: store.id,
        businessPermit,
        sanitaryPermit,
        governmentId,
        dtiPermit,
      });
      setStore(updatedStore);
      alert('✅ Documents uploaded successfully! Food safety verification complete and menu item creation is now unlocked.');
      setActiveTab('MENU');
    } catch (err) {
      alert(`❌ Document upload failed: ${err.message}`);
    } finally {
      setDocsLoading(false);
    }
  };

  // ── REPLY TO REVIEW ──────────────────────────────────────────
  const handleReplyReview = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) {
      alert('Please type a response before submitting.');
      return;
    }
    setReplyingId(reviewId);
    try {
      const updated = await api.replyToReview(reviewId, text.trim());
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply: updated.reply, reply_at: updated.reply_at } : r)));
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
      alert('✅ Reply posted successfully!');
    } catch (err) {
      alert(`❌ Failed to post reply: ${err.message}`);
    } finally {
      setReplyingId(null);
    }
  };

  // ── UPDATE STORE PROFILE ─────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const updated = await api.updateOwnerRestaurant({
        ownerUserId: userSession.id,
        name: storeName,
        phone: storePhone,
        address: storeAddress,
        description: storeDesc,
        category: storeCategory,
        prepTime,
        operatingHours,
        photo: storePhoto,
        logo: storeLogo,
        status: storeStatus,
      });
      setStore(updated);
      alert('✅ Store profile updated successfully!');
    } catch (err) {
      alert(`❌ Update failed: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // ── ADD NEW PRODUCT ──────────────────────────────────────────
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!store) return;
    if (!hasCompletedDocuments) {
      alert('⚠️ Mandatory Compliance: You must upload your Mayor\'s / Business Permit, Sanitary / Health Permit, and Valid Government ID before you can add food items to your menu.');
      setActiveTab('PERMITS');
      setIsAddProductOpen(false);
      return;
    }
    setProdLoading(true);
    try {
      const newProd = await api.addMenuItem({
        karinderyaId: store.id,
        ownerUserId: userSession.id,
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        category: prodCategory,
        photo: prodPhoto,
      });

      setProducts((prev) => [...prev, newProd]);
      setIsAddProductOpen(false);
      setProdName(''); setProdDesc(''); setProdPrice(''); setProdPhoto('');
      alert('✅ Menu item added!');
    } catch (err) {
      alert(`❌ Failed to add item: ${err.message}`);
    } finally {
      setProdLoading(false);
    }
  };

  // ── TOGGLE PRODUCT AVAILABILITY ──────────────────────────────
  const handleToggleProduct = async (prodId) => {
    try {
      const updated = await api.toggleMenuItem(prodId);
      setProducts((prev) => prev.map((p) => (p.id === prodId ? updated : p)));
    } catch (err) {
      alert(`Failed to update availability: ${err.message}`);
    }
  };

  // ── DELETE PRODUCT ───────────────────────────────────────────
  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.deleteMenuItem(prodId);
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
    } catch (err) {
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  // ── UPDATE ORDER STATUS ──────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await api.updateOrderStatus(orderId, newStatus, 'OWNER');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    } catch (err) {
      alert(`Failed to update order: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#C1440E] border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="font-bold text-[#5C3A21]">Loading Store Management Portal...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#E8D9B5] text-[#5C3A21] flex items-center justify-center text-3xl mx-auto">
          <i className="fas fa-store"></i>
        </div>
        <h2 className="font-display font-bold text-2xl text-[#5C3A21]">No Registered Store Found</h2>
        <p className="text-sm text-[#4A3B2C]/70">
          Your owner account does not have an active food business listing in Poblacion, Laang, Abra.
        </p>
        <button
          onClick={onOpenMarketplace}
          className="bg-[#C1440E] text-[#F7F1E3] font-bold px-5 py-2 rounded-xl"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isApproved = store.app_status === 'APPROVED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Store Header Banner */}
      <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#5C3A21] overflow-hidden border-2 border-[#E8D9B5] shrink-0">
            <img
              src={store.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl text-[#5C3A21]">
                {store.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {store.app_status || 'PENDING'}
              </span>
            </div>
            <p className="text-xs text-[#4A3B2C]/80 font-medium">
              Owner: {store.owner_name || userSession.name} • {store.category}
            </p>
          </div>
        </div>

        {/* Quick Open/Closed Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveProfile({ preventDefault: () => {} })}
            className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all shadow ${
              storeStatus === 'open' ? 'bg-emerald-600 text-[#F7F1E3]' : 'bg-neutral-600 text-[#F7F1E3]'
            }`}
          >
            Store Status: {storeStatus === 'open' ? '🟢 OPEN' : '🔴 CLOSED'}
          </button>
        </div>
      </div>

      {/* Tabs Navbar */}
      <div className="flex items-center gap-2 border-b border-[#E8D9B5] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'ORDERS'
              ? 'bg-[#C1440E] text-[#F7F1E3] shadow'
              : 'bg-[#E8D9B5]/40 text-[#2B2118] hover:bg-[#E8D9B5]'
          }`}
        >
          <i className="fas fa-receipt mr-2"></i>
          Incoming Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('MENU')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'MENU'
              ? 'bg-[#C1440E] text-[#F7F1E3] shadow'
              : 'bg-[#E8D9B5]/40 text-[#2B2118] hover:bg-[#E8D9B5]'
          }`}
        >
          <i className="fas fa-utensils mr-2"></i>
          Menu Items ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('PERMITS')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'PERMITS'
              ? 'bg-[#C1440E] text-[#F7F1E3] shadow'
              : 'bg-[#E8D9B5]/40 text-[#2B2118] hover:bg-[#E8D9B5]'
          }`}
        >
          <i className="fas fa-file-shield text-amber-500"></i>
          <span>Business Permits</span>
          {hasCompletedDocuments ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('REVIEWS')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'REVIEWS'
              ? 'bg-[#C1440E] text-[#F7F1E3] shadow'
              : 'bg-[#E8D9B5]/40 text-[#2B2118] hover:bg-[#E8D9B5]'
          }`}
        >
          <i className="fas fa-star text-amber-500 mr-1.5"></i>
          Customer Reviews ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'PROFILE'
              ? 'bg-[#C1440E] text-[#F7F1E3] shadow'
              : 'bg-[#E8D9B5]/40 text-[#2B2118] hover:bg-[#E8D9B5]'
          }`}
        >
          <i className="fas fa-store mr-2"></i>
          Store Settings
        </button>
      </div>

      {/* ── TAB 1: INCOMING ORDERS ──────────────────────────────────── */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#5C3A21]">Store Incoming Orders</h2>
            <button
              onClick={loadOwnerData}
              className="text-xs font-bold text-[#C1440E] bg-[#E8D9B5]/40 px-3 py-1.5 rounded-xl hover:bg-[#E8D9B5]"
            >
              <i className="fas fa-sync-alt mr-1"></i> Refresh Orders
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="bg-[#E8D9B5]/30 border-2 border-dashed border-[#D4C299] rounded-3xl p-8 text-center max-w-md mx-auto">
              <i className="fas fa-box-open text-3xl text-[#5C3A21]/40 mb-2"></i>
              <h3 className="font-bold text-lg text-[#5C3A21]">No Orders Yet</h3>
              <p className="text-xs text-[#4A3B2C]/70">Customer orders for your restaurant will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-md space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-lg text-[#C1440E]">#{o.id}</span>
                      <span className="text-xs font-mono font-bold bg-[#E8D9B5] px-2.5 py-1 rounded-full text-[#5C3A21]">
                        {o.order_status}
                      </span>
                    </div>

                    <div className="text-xs text-[#4A3B2C]">
                      <div className="font-bold text-[#5C3A21]">{o.customer_name} ({o.customer_phone})</div>
                      <div>Address: {o.delivery_address}</div>
                      {o.landmark && <div className="italic">Landmark: {o.landmark}</div>}
                    </div>

                    <div className="border-t border-[#E8D9B5] pt-2">
                      <div className="text-xs font-bold text-[#5C3A21] mb-1">Total: ₱{Number(o.total_amount).toFixed(0)} ({o.payment_method})</div>
                    </div>
                  </div>

                  {/* Status Controller Buttons */}
                  <div className="pt-2 border-t border-[#E8D9B5] flex flex-wrap gap-2 text-xs">
                    {o.order_status === 'PLACED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl"
                      >
                        Accept Order
                      </button>
                    )}

                    {o.order_status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'PREPARING')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl"
                      >
                        Start Preparing Food
                      </button>
                    )}

                    {o.order_status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'OUT_FOR_DELIVERY')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl"
                      >
                        Send Out for Delivery
                      </button>
                    )}

                    {o.order_status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'DELIVERED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl"
                      >
                        Mark as Delivered
                      </button>
                    )}

                    {o.order_status !== 'DELIVERED' && o.order_status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}
                        className="bg-red-100 text-red-700 hover:bg-red-200 font-bold px-3 py-1.5 rounded-xl"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MENU MANAGEMENT ──────────────────────────────────── */}
      {activeTab === 'MENU' && (
        <div className="space-y-6">
          {!hasCompletedDocuments ? (
            /* ── FOOD SAFETY & PERMIT COMPLIANCE GATE ── */
            <div className="bg-[#F7F1E3] rounded-3xl p-6 sm:p-8 border-2 border-[#C1440E]/30 shadow-xl space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start gap-4 border-b border-[#E8D9B5] pb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#C1440E]/10 text-[#C1440E] flex items-center justify-center text-3xl shrink-0 border border-[#C1440E]/20 shadow-sm">
                  <i className="fas fa-file-shield"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#5C3A21]">
                      Business Permits & Food Safety Verification Required
                    </h3>
                    <span className="bg-red-100 text-red-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A3B2C]/80 mt-1 leading-relaxed">
                    To comply with municipal regulations and safeguard customers in Poblacion, Laang, Abra, food vendors must upload their <strong>Mayor's / Business Permit</strong>, <strong>Sanitary & Health Permit</strong>, and <strong>Valid Government ID</strong> before adding dishes to their store menu.
                  </p>
                </div>
              </div>

              {/* 3 Upload Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-semibold text-[#5C3A21]">
                {/* 1. Mayor's Permit */}
                <div className="bg-[#E8D9B5]/25 rounded-2xl p-4 border border-[#D4C299] space-y-3 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#5C3A21]">1. Mayor's / Business Permit *</span>
                      {businessPermit ? (
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-md">✓ Attached</span>
                      ) : (
                        <span className="text-red-700 font-bold text-[10px] bg-red-100 px-2 py-0.5 rounded-md">Mandatory</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4A3B2C]/70 mt-0.5">Municipal / LGU Business Permit</p>
                  </div>

                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#C1440E]/40 rounded-xl bg-[#F7F1E3] cursor-pointer hover:bg-[#E8D9B5]/50 transition overflow-hidden relative group">
                    {businessPermit ? (
                      <>
                        <img src={businessPermit} alt="Business Permit" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold gap-1">
                          <i className="fas fa-camera"></i> Change
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-3">
                        <i className="fas fa-file-contract text-3xl text-[#C1440E]/60 mb-1"></i>
                        <div className="text-[11px] font-bold text-[#5C3A21]">Click to upload permit</div>
                        <div className="text-[9px] text-[#4A3B2C]/60">PNG, JPG, or PDF photo</div>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePermitFileChange(e, 'BUSINESS')} />
                  </label>

                  {businessPermit && (
                    <div className="flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ title: "Mayor's / Business Permit", url: businessPermit })}
                        className="text-[#C1440E] hover:underline font-bold"
                      >
                        <i className="fas fa-magnifying-glass mr-1"></i> Zoom View
                      </button>
                      <button
                        type="button"
                        onClick={() => setBusinessPermit('')}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Sanitary Permit */}
                <div className="bg-[#E8D9B5]/25 rounded-2xl p-4 border border-[#D4C299] space-y-3 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#5C3A21]">2. Sanitary / Health Permit *</span>
                      {sanitaryPermit ? (
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-md">✓ Attached</span>
                      ) : (
                        <span className="text-red-700 font-bold text-[10px] bg-red-100 px-2 py-0.5 rounded-md">Mandatory</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4A3B2C]/70 mt-0.5">Sanitation & Health Certificate</p>
                  </div>

                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#C1440E]/40 rounded-xl bg-[#F7F1E3] cursor-pointer hover:bg-[#E8D9B5]/50 transition overflow-hidden relative group">
                    {sanitaryPermit ? (
                      <>
                        <img src={sanitaryPermit} alt="Sanitary Permit" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold gap-1">
                          <i className="fas fa-camera"></i> Change
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-3">
                        <i className="fas fa-notes-medical text-3xl text-[#C1440E]/60 mb-1"></i>
                        <div className="text-[11px] font-bold text-[#5C3A21]">Click to upload permit</div>
                        <div className="text-[9px] text-[#4A3B2C]/60">Food hygiene inspection</div>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePermitFileChange(e, 'SANITARY')} />
                  </label>

                  {sanitaryPermit && (
                    <div className="flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ title: "Sanitary / Health Permit", url: sanitaryPermit })}
                        className="text-[#C1440E] hover:underline font-bold"
                      >
                        <i className="fas fa-magnifying-glass mr-1"></i> Zoom View
                      </button>
                      <button
                        type="button"
                        onClick={() => setSanitaryPermit('')}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Valid Government ID */}
                <div className="bg-[#E8D9B5]/25 rounded-2xl p-4 border border-[#D4C299] space-y-3 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#5C3A21]">3. Valid Government ID *</span>
                      {governmentId ? (
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-md">✓ Attached</span>
                      ) : (
                        <span className="text-red-700 font-bold text-[10px] bg-red-100 px-2 py-0.5 rounded-md">Mandatory</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#4A3B2C]/70 mt-0.5">Passport, PhilID, UMID, Driver's</p>
                  </div>

                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#C1440E]/40 rounded-xl bg-[#F7F1E3] cursor-pointer hover:bg-[#E8D9B5]/50 transition overflow-hidden relative group">
                    {governmentId ? (
                      <>
                        <img src={governmentId} alt="Government ID" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold gap-1">
                          <i className="fas fa-camera"></i> Change
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-3">
                        <i className="fas fa-id-card text-3xl text-[#C1440E]/60 mb-1"></i>
                        <div className="text-[11px] font-bold text-[#5C3A21]">Click to upload ID</div>
                        <div className="text-[9px] text-[#4A3B2C]/60">Front photo of valid ID</div>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePermitFileChange(e, 'GOV_ID')} />
                  </label>

                  {governmentId && (
                    <div className="flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ title: "Valid Government ID", url: governmentId })}
                        className="text-[#C1440E] hover:underline font-bold"
                      >
                        <i className="fas fa-magnifying-glass mr-1"></i> Zoom View
                      </button>
                      <button
                        type="button"
                        onClick={() => setGovernmentId('')}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8D9B5]">
                <div className="text-xs text-[#4A3B2C]/70 flex items-center gap-2">
                  <i className="fas fa-lock text-emerald-700"></i>
                  <span>Documents are encrypted and reviewed by platform officers for customer safety.</span>
                </div>

                <button
                  onClick={handleUploadDocuments}
                  disabled={docsLoading || !businessPermit || !sanitaryPermit || !governmentId}
                  className="w-full sm:w-auto bg-[#C1440E] hover:bg-[#A03408] disabled:opacity-50 text-[#F7F1E3] font-display font-extrabold py-3.5 px-8 rounded-2xl text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2"
                >
                  {docsLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Submitting Documents...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-shield-check"></i>
                      <span>Submit Documents & Unlock Menu</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ── REGULAR MENU MANAGEMENT ── */
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8D9B5] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-xl text-[#5C3A21]">Store Menu Items</h2>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <i className="fas fa-shield-check"></i> Verified Permits
                    </span>
                  </div>
                  <p className="text-xs text-[#4A3B2C]/70">Add and manage the delicious dishes available to customers</p>
                </div>

                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] px-4 py-2.5 rounded-2xl text-xs font-bold shadow flex items-center gap-2 self-start sm:self-auto"
                >
                  <i className="fas fa-plus"></i>
                  <span>Add Dish / Product</span>
                </button>
              </div>

              {/* Add Product Modal */}
              {isAddProductOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-[#F7F1E3] rounded-3xl p-6 max-w-md w-full border border-[#E8D9B5] shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-[#E8D9B5] pb-2">
                      <h3 className="font-display font-extrabold text-xl text-[#5C3A21]">Add New Menu Item</h3>
                      <button onClick={() => setIsAddProductOpen(false)} className="text-[#5C3A21] hover:text-[#C1440E] transition">
                        <i className="fas fa-times text-lg"></i>
                      </button>
                    </div>

                    <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs font-semibold text-[#5C3A21]">
                      <div>
                        <label className="block mb-1">Dish Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chicken Silog"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                        />
                      </div>

                      <div>
                        <label className="block mb-1">Description</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Crispy fried chicken served with sinangag rice and sunny-side-up egg..."
                          value={prodDesc}
                          onChange={(e) => setProdDesc(e.target.value)}
                          className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block mb-1">Price (₱) *</label>
                          <input
                            type="number"
                            required
                            step="1"
                            placeholder="99"
                            value={prodPrice}
                            onChange={(e) => setProdPrice(e.target.value)}
                            className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                          />
                        </div>

                        <div>
                          <label className="block mb-1">Category</label>
                          <select
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value)}
                            className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                          >
                            <option value="Popular">Popular</option>
                            <option value="Silog Meals">Silog Meals</option>
                            <option value="Rice Meals">Rice Meals</option>
                            <option value="Chicken">Chicken</option>
                            <option value="Sisig">Sisig</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Drinks">Drinks</option>
                            <option value="Desserts">Desserts</option>
                          </select>
                        </div>
                      </div>

                      {/* ── PHOTO UPLOAD SECTION ── */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-[#5C3A21]">Dish Photo</label>
                          <div className="flex bg-[#E8D9B5]/60 p-0.5 rounded-lg text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => setImageInputMode('UPLOAD')}
                              className={`px-2.5 py-0.5 rounded-md transition ${imageInputMode === 'UPLOAD' ? 'bg-[#C1440E] text-[#F7F1E3] shadow-sm' : 'text-[#5C3A21]/70 hover:text-[#5C3A21]'}`}
                            >
                              <i className="fas fa-upload mr-1"></i> Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageInputMode('URL')}
                              className={`px-2.5 py-0.5 rounded-md transition ${imageInputMode === 'URL' ? 'bg-[#C1440E] text-[#F7F1E3] shadow-sm' : 'text-[#5C3A21]/70 hover:text-[#5C3A21]'}`}
                            >
                              <i className="fas fa-link mr-1"></i> Image Link
                            </button>
                          </div>
                        </div>

                        {imageInputMode === 'UPLOAD' ? (
                          <div className="space-y-2">
                            <label
                              htmlFor="dishPhotoUpload"
                              className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-2xl border-2 border-dashed border-[#C1440E]/40 bg-[#E8D9B5]/30 cursor-pointer hover:bg-[#E8D9B5]/60 transition overflow-hidden relative group"
                            >
                              {prodPhoto ? (
                                <>
                                  <img
                                    src={prodPhoto}
                                    alt="Dish preview"
                                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white text-xs font-bold">
                                    <i className="fas fa-camera"></i> Change Photo
                                  </div>
                                </>
                              ) : prodPhotoUploading ? (
                                <div className="flex flex-col items-center gap-1.5 text-[#C1440E]">
                                  <i className="fas fa-spinner fa-spin text-2xl"></i>
                                  <span className="text-[11px] font-bold">Processing image...</span>
                                </div>
                              ) : (
                                <div className="text-center p-3">
                                  <div className="w-10 h-10 rounded-full bg-[#E8D9B5] text-[#C1440E] flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                                    <i className="fas fa-cloud-arrow-up text-lg"></i>
                                  </div>
                                  <p className="text-xs font-bold text-[#5C3A21]">Click or drag photo to upload</p>
                                  <p className="text-[10px] text-[#4A3B2C]/60 mt-0.5">PNG, JPG, WebP from phone or computer</p>
                                </div>
                              )}
                            </label>
                            <input
                              id="dishPhotoUpload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProductPhotoChange}
                            />
                            {prodPhoto && (
                              <div className="flex items-center justify-between text-[11px] pt-0.5">
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <i className="fas fa-check-circle"></i> Photo attached
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setProdPhoto('')}
                                  className="text-red-600 hover:text-red-800 font-bold hover:underline"
                                >
                                  <i className="fas fa-trash-alt mr-1"></i> Remove photo
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="url"
                              placeholder="https://images.unsplash.com/..."
                              value={prodPhoto}
                              onChange={(e) => setProdPhoto(e.target.value)}
                              className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                            />
                            {prodPhoto && (
                              <div className="w-full h-24 rounded-xl overflow-hidden border border-[#D4C299] relative">
                                <img src={prodPhoto} alt="URL Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={prodLoading || prodPhotoUploading}
                        className="w-full bg-[#C1440E] hover:bg-[#A03408] disabled:opacity-50 text-[#F7F1E3] font-display font-bold py-3 rounded-2xl shadow mt-3 transition flex items-center justify-center gap-2"
                      >
                        {prodLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Saving Dish...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus-circle"></i>
                            <span>Save Menu Item</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Products List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#F7F1E3] rounded-3xl p-4 border border-[#E8D9B5] shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={p.photo || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=200&q=80'}
                        alt={p.name}
                        className="w-20 h-20 rounded-2xl object-cover bg-neutral-200"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-[#5C3A21]">{p.name}</h3>
                        <div className="font-mono text-xs font-bold text-[#C1440E]">₱{Number(p.price).toFixed(0)}</div>
                        <div className="text-[10px] text-[#4A3B2C]/70">{p.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E8D9B5] pt-2 text-xs font-semibold">
                      <button
                        onClick={() => handleToggleProduct(p.id)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold ${
                          p.available !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {p.available !== false ? 'Available' : 'Unavailable'}
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 3: BUSINESS PERMITS & COMPLIANCE ────────────────────────── */}
      {activeTab === 'PERMITS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8D9B5] pb-4">
            <div>
              <h2 className="font-display font-bold text-xl text-[#5C3A21]">Business Permits & Compliance</h2>
              <p className="text-xs text-[#4A3B2C]/70">Required municipal food documents for Poblacion, Laang, Abra marketplace</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                hasCompletedDocuments ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {hasCompletedDocuments ? '✓ ALL MANDATORY PERMITS ATTACHED' : '⚠️ INCOMPLETE PERMITS'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-[#5C3A21]">
            {/* 1. Mayor's / Municipal Business Permit */}
            <div className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#5C3A21]">1. Mayor's / Business Permit</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${businessPermit ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {businessPermit ? 'Uploaded' : 'Required'}
                  </span>
                </div>
                <p className="text-[11px] text-[#4A3B2C]/70 mt-1">Official Municipal Business Permit for current calendar year</p>
              </div>

              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-[#C1440E]/40 rounded-2xl bg-[#E8D9B5]/20 cursor-pointer hover:bg-[#E8D9B5]/40 transition overflow-hidden relative group">
                {businessPermit ? (
                  <>
                    <img src={businessPermit} alt="Business Permit" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs">
                      <i className="fas fa-camera"></i> Change Document
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <i className="fas fa-file-contract text-4xl text-[#C1440E]/50 mb-2"></i>
                    <div className="font-bold text-xs">Click or drag Mayor's Permit photo</div>
                    <div className="text-[10px] text-[#4A3B2C]/60">JPEG, PNG, WebP</div>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePermitFileChange(e, 'BUSINESS')} />
              </label>

              {businessPermit && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDocModal({ title: "Mayor's / Business Permit", url: businessPermit })}
                    className="text-[#C1440E] font-bold hover:underline"
                  >
                    <i className="fas fa-magnifying-glass mr-1"></i> Preview Full Size
                  </button>
                  <button
                    type="button"
                    onClick={() => setBusinessPermit('')}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* 2. Sanitary & Health Permit */}
            <div className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#5C3A21]">2. Sanitary / Health Permit</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sanitaryPermit ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {sanitaryPermit ? 'Uploaded' : 'Required'}
                  </span>
                </div>
                <p className="text-[11px] text-[#4A3B2C]/70 mt-1">Sanitary inspection clearance for food preparation facilities</p>
              </div>

              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-[#C1440E]/40 rounded-2xl bg-[#E8D9B5]/20 cursor-pointer hover:bg-[#E8D9B5]/40 transition overflow-hidden relative group">
                {sanitaryPermit ? (
                  <>
                    <img src={sanitaryPermit} alt="Sanitary Permit" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs">
                      <i className="fas fa-camera"></i> Change Document
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <i className="fas fa-notes-medical text-4xl text-[#C1440E]/50 mb-2"></i>
                    <div className="font-bold text-xs">Click or drag Sanitary Permit photo</div>
                    <div className="text-[10px] text-[#4A3B2C]/60">JPEG, PNG, WebP</div>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePermitFileChange(e, 'SANITARY')} />
              </label>

              {sanitaryPermit && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDocModal({ title: "Sanitary / Health Permit", url: sanitaryPermit })}
                    className="text-[#C1440E] font-bold hover:underline"
                  >
                    <i className="fas fa-magnifying-glass mr-1"></i> Preview Full Size
                  </button>
                  <button
                    type="button"
                    onClick={() => setSanitaryPermit('')}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* 3. Valid Government ID */}
            <div className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#5C3A21]">3. Valid Government ID</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${governmentId ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {governmentId ? 'Uploaded' : 'Required'}
                  </span>
                </div>
                <p className="text-[11px] text-[#4A3B2C]/70 mt-1">Government ID of store owner (Passport, PhilID, Driver's, UMID)</p>
              </div>

              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-[#C1440E]/40 rounded-2xl bg-[#E8D9B5]/20 cursor-pointer hover:bg-[#E8D9B5]/40 transition overflow-hidden relative group">
                {governmentId ? (
                  <>
                    <img src={governmentId} alt="Government ID" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs">
                      <i className="fas fa-camera"></i> Change Document
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <i className="fas fa-id-card text-4xl text-[#C1440E]/50 mb-2"></i>
                    <div className="font-bold text-xs">Click or drag Owner Government ID</div>
                    <div className="text-[10px] text-[#4A3B2C]/60">JPEG, PNG, WebP</div>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePermitFileChange(e, 'GOV_ID')} />
              </label>

              {governmentId && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDocModal({ title: "Valid Government ID", url: governmentId })}
                    className="text-[#C1440E] font-bold hover:underline"
                  >
                    <i className="fas fa-magnifying-glass mr-1"></i> Preview Full Size
                  </button>
                  <button
                    type="button"
                    onClick={() => setGovernmentId('')}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* 4. DTI / Barangay Clearance (Optional) */}
            <div className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#5C3A21]">4. DTI / Barangay Clearance</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                    {dtiPermit ? 'Uploaded' : 'Optional'}
                  </span>
                </div>
                <p className="text-[11px] text-[#4A3B2C]/70 mt-1">DTI Business Name Certificate or Barangay Business Clearance</p>
              </div>

              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-[#C1440E]/40 rounded-2xl bg-[#E8D9B5]/20 cursor-pointer hover:bg-[#E8D9B5]/40 transition overflow-hidden relative group">
                {dtiPermit ? (
                  <>
                    <img src={dtiPermit} alt="DTI Permit" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs">
                      <i className="fas fa-camera"></i> Change Document
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <i className="fas fa-certificate text-4xl text-[#C1440E]/50 mb-2"></i>
                    <div className="font-bold text-xs">Click or drag DTI Certificate (Optional)</div>
                    <div className="text-[10px] text-[#4A3B2C]/60">JPEG, PNG, WebP</div>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePermitFileChange(e, 'DTI')} />
              </label>

              {dtiPermit && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDocModal({ title: "DTI Certificate / Barangay Clearance", url: dtiPermit })}
                    className="text-[#C1440E] font-bold hover:underline"
                  >
                    <i className="fas fa-magnifying-glass mr-1"></i> Preview Full Size
                  </button>
                  <button
                    type="button"
                    onClick={() => setDtiPermit('')}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleUploadDocuments}
              disabled={docsLoading || !businessPermit || !sanitaryPermit || !governmentId}
              className="bg-[#C1440E] hover:bg-[#A03408] disabled:opacity-50 text-[#F7F1E3] font-display font-bold py-3.5 px-8 rounded-2xl text-sm shadow-xl transition flex items-center gap-2"
            >
              {docsLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Saving Documents...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-floppy-disk"></i>
                  <span>Save & Submit Compliance Documents</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: CUSTOMER REVIEWS & RATINGS ────────────────────── */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-[#5C3A21]">Customer Reviews & Ratings</h2>
              <p className="text-xs text-[#4A3B2C]/70">Feedback submitted by verified customers who ordered from your store</p>
            </div>
            <button
              onClick={loadOwnerData}
              className="text-xs font-bold text-[#C1440E] bg-[#E8D9B5]/40 px-3 py-1.5 rounded-xl hover:bg-[#E8D9B5] transition"
            >
              <i className="fas fa-sync-alt mr-1"></i> Refresh Reviews
            </button>
          </div>

          {/* Rating Summary Card */}
          <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-md grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left md:border-r border-[#E8D9B5] md:pr-6 space-y-1">
              <div className="text-xs font-bold uppercase text-[#4A3B2C]/70 tracking-wider">Overall Rating</div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-display font-extrabold text-4xl text-[#5C3A21]">
                  {store.review_count > 0 && store.rating ? Number(store.rating).toFixed(1) : 'New'}
                </span>
                {store.review_count > 0 && (
                  <div className="flex text-amber-500 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fas fa-star ${star <= Math.round(Number(store.rating || 0)) ? 'text-amber-500' : 'text-neutral-300'}`}
                      ></i>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-[#4A3B2C]/80 font-medium">
                {reviews.length} total customer {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5 text-xs text-[#5C3A21] font-semibold">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => Number(r.rating) === stars).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-10 text-right">{stars} ★</span>
                    <div className="flex-1 h-2 bg-[#E8D9B5]/60 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-6 text-[11px] text-[#4A3B2C]/60 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="bg-[#E8D9B5]/30 border-2 border-dashed border-[#D4C299] rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#E8D9B5] text-[#5C3A21] flex items-center justify-center text-2xl mx-auto shadow-inner">
                <i className="fas fa-star-half-stroke text-amber-500"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[#5C3A21]">No Reviews Yet</h3>
              <p className="text-xs text-[#4A3B2C]/70">
                When customers complete their orders and rate their meals, their comments and star ratings will show here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-sm space-y-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E8D9B5]/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#5C3A21] text-[#F7F1E3] font-display font-extrabold flex items-center justify-center text-sm shadow-xs">
                        {(r.customer_name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#5C3A21] flex items-center gap-2">
                          <span>{r.customer_name || 'Verified Customer'}</span>
                          {r.order_id && (
                            <span className="bg-[#E8D9B5]/60 text-[#5C3A21] text-[10px] font-mono px-2 py-0.5 rounded-md">
                              Order #{r.order_id}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#4A3B2C]/60">
                          {new Date(r.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-[#E8D9B5]/60 px-3 py-1 rounded-xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fas fa-star text-xs ${
                            star <= Number(r.rating) ? 'text-amber-500' : 'text-neutral-300'
                          }`}
                        ></i>
                      ))}
                      <span className="font-bold text-xs text-[#5C3A21] ml-1">{r.rating}.0</span>
                    </div>
                  </div>

                  {/* Customer Comment */}
                  <p className="text-xs sm:text-sm text-[#2B2118] font-medium leading-relaxed bg-[#E8D9B5]/20 p-3 rounded-2xl border border-[#E8D9B5]/50">
                    "{r.comment || 'No written comment.'}"
                  </p>

                  {/* Owner Response Section */}
                  {r.reply ? (
                    <div className="bg-[#4B6043]/10 border border-[#4B6043]/30 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#4B6043]">
                        <span className="flex items-center gap-1.5">
                          <i className="fas fa-reply"></i>
                          <span>Your Response ({new Date(r.reply_at).toLocaleDateString()}):</span>
                        </span>
                        <span className="text-[10px] text-[#4B6043]/80 uppercase font-mono">Store Owner</span>
                      </div>
                      <p className="text-xs text-[#2B2118] font-medium italic">
                        "{r.reply}"
                      </p>
                    </div>
                  ) : (
                    <div className="pt-1 space-y-2">
                      <label className="block text-[11px] font-bold text-[#5C3A21]">
                        Reply to Customer as Store Owner:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Say thank you or respond to ${r.customer_name || 'customer'}...`}
                          value={replyText[r.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                          className="flex-1 bg-[#E8D9B5]/40 text-[#2B2118] px-3 py-2 rounded-xl text-xs border border-[#D4C299] focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
                        />
                        <button
                          onClick={() => handleReplyReview(r.id)}
                          disabled={replyingId === r.id || !replyText[r.id]?.trim()}
                          className="bg-[#C1440E] hover:bg-[#A03408] disabled:opacity-50 text-[#F7F1E3] text-xs font-bold px-4 py-2 rounded-xl shadow transition shrink-0 flex items-center gap-1.5"
                        >
                          {replyingId === r.id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-paper-plane text-[10px]"></i>
                          )}
                          <span>Post Reply</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: STORE SETTINGS ────────────────────────────────────── */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="bg-[#F7F1E3] rounded-3xl p-6 sm:p-8 border border-[#E8D9B5] shadow-lg space-y-6 max-w-3xl">
          <h2 className="font-display font-bold text-xl text-[#5C3A21]">Edit Business Profile</h2>

          <div className="space-y-4 text-xs sm:text-sm font-semibold text-[#5C3A21]">
            <div>
              <label className="block mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#E8D9B5]/40 p-3 rounded-2xl border border-[#D4C299]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-3 rounded-2xl border border-[#D4C299]"
                />
              </div>

              <div>
                <label className="block mb-1">Category</label>
                <input
                  type="text"
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-3 rounded-2xl border border-[#D4C299]"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Business Address (Poblacion, Laang, Abra) *</label>
              <input
                type="text"
                required
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full bg-[#E8D9B5]/40 p-3 rounded-2xl border border-[#D4C299]"
              />
            </div>

            <div>
              <label className="block mb-1">Description</label>
              <textarea
                rows={3}
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                className="w-full bg-[#E8D9B5]/40 p-3 rounded-2xl border border-[#D4C299]"
              />
            </div>

            {/* ── IMAGE UPLOADS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Cover Photo */}
              <div className="space-y-2">
                <label className="block mb-1">Cover Photo <span className="font-normal text-[#A03408]">(max 5 MB)</span></label>
                <label
                  htmlFor="coverPhotoInput"
                  className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-2xl border-2 border-dashed border-[#C1440E]/40 bg-[#E8D9B5]/30 cursor-pointer hover:bg-[#E8D9B5]/60 transition overflow-hidden relative"
                >
                  {storePhoto ? (
                    <img
                      src={storePhoto}
                      alt="Cover preview"
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <>
                      <i className="fa fa-image text-3xl text-[#C1440E]/50"></i>
                      <span className="text-xs text-[#5C3A21]/60">Click to upload cover photo</span>
                    </>
                  )}
                  {storePhoto && (
                    <span className="absolute bottom-1 right-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">Change</span>
                  )}
                </label>
                <input
                  id="coverPhotoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverPhotoChange}
                />
                {storePhoto && (
                  <button
                    type="button"
                    onClick={() => setStorePhoto('')}
                    className="text-xs text-red-500 hover:underline"
                  >Remove photo</button>
                )}
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <label className="block mb-1">Store Logo <span className="font-normal text-[#A03408]">(max 2 MB)</span></label>
                <label
                  htmlFor="logoInput"
                  className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-2xl border-2 border-dashed border-[#C1440E]/40 bg-[#E8D9B5]/30 cursor-pointer hover:bg-[#E8D9B5]/60 transition overflow-hidden relative"
                >
                  {storeLogo ? (
                    <img
                      src={storeLogo}
                      alt="Logo preview"
                      className="absolute inset-0 w-full h-full object-contain rounded-2xl p-2"
                    />
                  ) : (
                    <>
                      <i className="fa fa-store text-3xl text-[#C1440E]/50"></i>
                      <span className="text-xs text-[#5C3A21]/60">Click to upload logo</span>
                    </>
                  )}
                  {storeLogo && (
                    <span className="absolute bottom-1 right-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">Change</span>
                  )}
                </label>
                <input
                  id="logoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                {storeLogo && (
                  <button
                    type="button"
                    onClick={() => setStoreLogo('')}
                    className="text-xs text-red-500 hover:underline"
                  >Remove logo</button>
                )}
              </div>

            </div>

            <div>
              <label className="block mb-1">Store Status</label>
              <select
                value={storeStatus}
                onChange={(e) => setStoreStatus(e.target.value)}
                className="w-full bg-[#E8D9B5]/40 p-3 rounded-2xl border border-[#D4C299]"
              >
                <option value="open">🟢 Open for Orders</option>
                <option value="closed">🔴 Closed</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] font-display font-bold py-3.5 px-6 rounded-2xl text-sm shadow-lg"
          >
            {saveLoading ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>
        </form>
      )}

      {/* ── DOCUMENT ZOOM PREVIEW LIGHTBOX MODAL ────────────────── */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F7F1E3] rounded-3xl overflow-hidden max-w-2xl w-full border border-[#E8D9B5] shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-[#5C3A21] text-[#F7F1E3] flex items-center justify-between shadow">
              <div className="flex items-center gap-2">
                <i className="fas fa-file-contract text-[#C1440E]"></i>
                <h3 className="font-display font-bold text-sm sm:text-base">{previewDocModal.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDocModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#F7F1E3] flex items-center justify-center transition"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-neutral-900/5 min-h-[300px]">
              <img
                src={previewDocModal.url}
                alt={previewDocModal.title}
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg border border-[#E8D9B5]"
              />
            </div>

            <div className="p-3 bg-[#E8D9B5]/40 border-t border-[#E8D9B5] flex items-center justify-between text-xs text-[#5C3A21] font-semibold">
              <span>Official Food Compliance Document • Verified on KarinderyaKo</span>
              <button
                onClick={() => setPreviewDocModal(null)}
                className="bg-[#C1440E] text-[#F7F1E3] px-4 py-1.5 rounded-xl font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
