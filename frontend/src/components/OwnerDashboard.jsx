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

  // Reply State
  const [replyText, setReplyText] = useState({});

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

        // Fetch products and orders isolated to this store
        const [prodList, orderList] = await Promise.all([
          api.fetchRestaurantMenu(storeData.id),
          api.fetchOrders({ karinderyaId: storeData.id }),
        ]);

        setProducts(prodList);
        setOrders(orderList);
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
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#5C3A21]">Store Menu Items</h2>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] px-4 py-2 rounded-2xl text-xs font-bold shadow flex items-center gap-2"
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
        </div>
      )}

      {/* ── TAB 3: STORE SETTINGS ────────────────────────────────────── */}
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

    </div>
  );
}
