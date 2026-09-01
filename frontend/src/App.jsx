import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MarketplaceHome from './components/MarketplaceHome';
import RestaurantPage from './components/RestaurantPage';
import FoodDetailModal from './components/FoodDetailModal';
import MultiRestaurantCartModal from './components/MultiRestaurantCartModal';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './components/CheckoutPage';
import OrderTrackerPage from './components/OrderTrackerPage';
import OwnerDashboard from './components/OwnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import FavoritesPage from './components/FavoritesPage';
import LoginModal from './components/LoginModal';
import BottomNav from './components/BottomNav';
import * as api from './api';

export default function App() {
  // ── USER AUTH SESSION — persisted in localStorage ───────────────
  const [userSession, setUserSession] = useState(() => {
    try {
      const saved = localStorage.getItem('kko_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync session to localStorage whenever it changes
  const handleSetSession = (session) => {
    setUserSession(session);
    if (session) {
      localStorage.setItem('kko_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('kko_session');
    }
  };

  // ── ACTIVE NAVIGATION VIEW ────────────────────────────────────
  // MARKETPLACE | RESTAURANT_DETAIL | CHECKOUT | ORDER_TRACKER | ORDERS | FAVORITES | PROFILE | OWNER_PORTAL | ADMIN_PANEL
  const [activeView, setActiveView] = useState('MARKETPLACE');

  // ── MARKETPLACE DATA ──────────────────────────────────────────
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ── SELECTED RESTAURANT & MENU ────────────────────────────────
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null); // For detail modal

  // ── SINGLE-RESTAURANT CART ────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [cartRestaurant, setCartRestaurant] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Multi-restaurant conflict intercept modal
  const [isMultiCartModalOpen, setIsMultiCartModalOpen] = useState(false);
  const [pendingAddConfig, setPendingAddConfig] = useState(null);

  // ── ORDERS & TRACKING ─────────────────────────────────────────
  const [activeOrder, setActiveOrder] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);

  // ── FAVORITES & MODALS ────────────────────────────────────────
  const [favorites, setFavorites] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReasonMessage, setLoginReasonMessage] = useState('');
  const [loginInitialTab, setLoginInitialTab] = useState('LOGIN');

  const handleRequireLogin = (reason = '', tab = 'LOGIN') => {
    setLoginReasonMessage(reason);
    setLoginInitialTab(tab);
    setIsLoginModalOpen(true);
  };

  // ── FETCH MARKETPLACE RESTAURANTS ──────────────────────────────
  const loadRestaurants = useCallback(async () => {
    setLoadingRestaurants(true);
    try {
      const data = await api.fetchRestaurants(activeCategory, searchQuery);
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setLoadingRestaurants(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Load customer favorites on startup or login
  useEffect(() => {
    if (userSession) {
      api.fetchFavorites(userSession.id)
        .then((favs) => setFavorites(favs.map((f) => f.id)))
        .catch(() => {});
    }
  }, [userSession]);

  // ── OPEN DEDICATED RESTAURANT PAGE ─────────────────────────────
  const handleSelectRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setActiveView('RESTAURANT_DETAIL');
    setLoadingMenu(true);

    try {
      const fullRestaurant = await api.fetchRestaurantById(restaurant.id);
      const menu = await api.fetchRestaurantMenu(restaurant.id);
      setSelectedRestaurant(fullRestaurant);
      setSelectedMenu(menu);
    } catch (err) {
      console.error('Failed to load restaurant details:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  // ── ADD TO CART WITH SINGLE-RESTAURANT ENFORCEMENT ────────────
  const handleAddToCart = ({ item, qty, notes, restaurant }) => {
    const targetRest = restaurant || selectedRestaurant;

    // Check if cart already has items from a DIFFERENT restaurant
    if (cart.length > 0 && cartRestaurant && cartRestaurant.id !== targetRest.id) {
      setPendingAddConfig({ item, qty, notes, restaurant: targetRest });
      setIsMultiCartModalOpen(true);
      return;
    }

    // Direct addition to cart
    executeAddToCart({ item, qty, notes, restaurant: targetRest });
  };

  const executeAddToCart = ({ item, qty, notes, restaurant }) => {
    setCartRestaurant(restaurant);
    setCart((prev) => {
      // Check if item already exists in cart with same notes
      const existingIdx = prev.findIndex(
        (i) => i.id === item.id && (i.notes || '') === (notes || '')
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].qty += qty;
        return next;
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          qty,
          notes: notes || '',
          photo: item.photo,
        },
      ];
    });

    setIsCartOpen(true);
  };

  // Handle Multi-Restaurant Cart Conflict Resolution
  const handleConfirmClearAndAdd = () => {
    if (pendingAddConfig) {
      setCart([]);
      setCartRestaurant(pendingAddConfig.restaurant);
      executeAddToCart(pendingAddConfig);
      setPendingAddConfig(null);
    }
    setIsMultiCartModalOpen(false);
  };

  // ── CART CONTROLLER HELPERS ────────────────────────────────────
  const handleUpdateCartQty = (idx, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(idx);
      return;
    }
    setCart((prev) => {
      const next = [...prev];
      next[idx].qty = newQty;
      return next;
    });
  };

  const handleRemoveCartItem = (idx) => {
    setCart((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) setCartRestaurant(null);
      return next;
    });
  };

  const handleClearCart = () => {
    setCart([]);
    setCartRestaurant(null);
  };

  // ── PLACE ORDER ────────────────────────────────────────────────
  const handlePlaceOrder = async (orderData) => {
    setPlacingOrder(true);
    try {
      const res = await api.placeOrder(orderData);
      const createdOrder = await api.fetchOrderById(res.orderId);

      // Reset cart
      setCart([]);
      setCartRestaurant(null);
      setActiveOrder(createdOrder);
      setActiveView('ORDER_TRACKER');
    } catch (err) {
      alert(`❌ Order failed: ${err.message}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── FETCH ORDERS HISTORY ───────────────────────────────────────
  const loadCustomerOrders = useCallback(async () => {
    if (!userSession?.id) {
      setCustomerOrders([]);
      return;
    }
    try {
      const list = await api.fetchOrders({
        customerUserId: userSession.id,
      });
      setCustomerOrders(list || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }, [userSession]);

  useEffect(() => {
    if (activeView === 'ORDERS') {
      loadCustomerOrders();
    }
  }, [activeView, loadCustomerOrders]);

  // ── FAVORITE TOGGLE ────────────────────────────────────────────
  const handleToggleFavorite = async (restaurantId) => {
    if (!userSession) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const res = await api.toggleFavorite(userSession.id, restaurantId);
      if (res.isFavorite) {
        setFavorites((prev) => [...prev, restaurantId]);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== restaurantId));
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  // ── COMPUTED METRICS ───────────────────────────────────────────
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const favoriteRestaurants = restaurants.filter((r) => favorites.includes(r.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F1E3] text-[#2B2118] font-body selection:bg-[#C1440E] selection:text-[#F7F1E3]">
      
      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        userSession={userSession}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          handleSetSession(null);
          setActiveView('MARKETPLACE');
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Router View */}
      <main className="flex-1">
        
        {/* VIEW 1: MARKETPLACE HOME */}
        {activeView === 'MARKETPLACE' && (
          <MarketplaceHome
            restaurants={restaurants}
            loading={loadingRestaurants}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectRestaurant={handleSelectRestaurant}
            onOpenVendorRegister={() => setIsLoginModalOpen(true)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* VIEW 2: DEDICATED RESTAURANT PROFILE & MENU */}
        {activeView === 'RESTAURANT_DETAIL' && selectedRestaurant && (
          <RestaurantPage
            restaurant={selectedRestaurant}
            menuItems={selectedMenu}
            loading={loadingMenu}
            onBack={() => setActiveView('MARKETPLACE')}
            onSelectItem={(item) => setSelectedFoodItem(item)}
            cartCount={cartCount}
            cartSubtotal={cartSubtotal}
            onOpenCart={() => setIsCartOpen(true)}
            isFav={favorites.includes(selectedRestaurant.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* VIEW 3: CHECKOUT PAGE */}
        {activeView === 'CHECKOUT' && (
          <CheckoutPage
            cart={cart}
            cartRestaurant={cartRestaurant}
            userSession={userSession}
            onPlaceOrder={handlePlaceOrder}
            onBackToMenu={() => {
              if (selectedRestaurant) setActiveView('RESTAURANT_DETAIL');
              else setActiveView('MARKETPLACE');
            }}
            onRequireLogin={(tab) => {
              handleRequireLogin(
                '🔒 Please log in or register to complete your order and secure your delivery details.',
                tab || 'LOGIN'
              );
            }}
            loading={placingOrder}
          />
        )}

        {/* VIEW 4: ORDER TRACKER PAGE */}
        {activeView === 'ORDER_TRACKER' && activeOrder && (
          <OrderTrackerPage
            order={activeOrder}
            onBack={() => setActiveView('ORDERS')}
            onRefresh={async () => {
              const refreshed = await api.fetchOrderById(activeOrder.id);
              setActiveOrder(refreshed);
            }}
            onSubmitReview={async (data) => {
              await api.submitReview(data);
              const refreshed = await api.fetchOrderById(activeOrder.id);
              setActiveOrder(refreshed);
            }}
          />
        )}

        {/* VIEW 5: CUSTOMER ORDERS HISTORY */}
        {activeView === 'ORDERS' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#5C3A21] border-b border-[#E8D9B5] pb-4">
              Your Order History
            </h1>

            {customerOrders.length === 0 ? (
              <div className="bg-[#E8D9B5]/30 border-2 border-dashed border-[#D4C299] rounded-3xl p-10 text-center space-y-3">
                <i className="fas fa-receipt text-3xl text-[#5C3A21]/40 mb-1"></i>
                <h3 className="font-bold text-lg text-[#5C3A21]">No Orders Placed Yet</h3>
                <p className="text-xs text-[#4A3B2C]/70">Place an order from any local karinderya to track it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={async () => {
                      const full = await api.fetchOrderById(o.id);
                      setActiveOrder(full);
                      setActiveView('ORDER_TRACKER');
                    }}
                    className="bg-[#F7F1E3] rounded-3xl p-5 border border-[#E8D9B5] shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-lg text-[#C1440E]">#{o.id}</span>
                        <span className="bg-[#E8D9B5] text-[#5C3A21] text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                          {o.order_status}
                        </span>
                      </div>
                      <div className="font-bold text-[#5C3A21] mt-1">{o.karinderya_name}</div>
                      <div className="text-xs text-[#4A3B2C]/70">
                        {new Date(o.created_at).toLocaleString()} • {o.payment_method}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-[#E8D9B5] pt-2 sm:pt-0">
                      <div className="font-mono font-extrabold text-lg text-[#5C3A21]">
                        ₱{Number(o.total_amount).toFixed(0)}
                      </div>
                      <button className="bg-[#C1440E] text-[#F7F1E3] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow">
                        Track Order →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: FAVORITES PAGE */}
        {activeView === 'FAVORITES' && (
          <FavoritesPage
            favoriteRestaurants={favoriteRestaurants}
            onSelectRestaurant={handleSelectRestaurant}
            onRemoveFavorite={handleToggleFavorite}
            onBackToMarketplace={() => setActiveView('MARKETPLACE')}
          />
        )}

        {/* VIEW 7: OWNER DASHBOARD */}
        {activeView === 'OWNER_PORTAL' && (
          <OwnerDashboard
            userSession={userSession}
            onOpenMarketplace={() => setActiveView('MARKETPLACE')}
          />
        )}

        {/* VIEW 8: ADMIN DASHBOARD */}
        {activeView === 'ADMIN_PANEL' && (
          <AdminDashboard />
        )}

        {/* VIEW 9: USER PROFILE */}
        {activeView === 'PROFILE' && (
          <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
            <div className="bg-[#F7F1E3] rounded-3xl p-6 border border-[#E8D9B5] shadow-lg space-y-4">
              <h2 className="font-display font-extrabold text-2xl text-[#5C3A21] border-b border-[#E8D9B5] pb-3">
                User Account Profile
              </h2>
              {userSession ? (
                <div className="space-y-3 text-xs sm:text-sm font-semibold text-[#5C3A21]">
                  <div><span className="font-bold">Name:</span> {userSession.name}</div>
                  <div><span className="font-bold">Email:</span> {userSession.email}</div>
                  <div><span className="font-bold">Role:</span> <span className="bg-[#C1440E] text-[#F7F1E3] px-2 py-0.5 rounded text-xs">{userSession.role}</span></div>
                  {userSession.phone && <div><span className="font-bold">Phone:</span> {userSession.phone}</div>}
                  {userSession.address && <div><span className="font-bold">Address:</span> {userSession.address}</div>}

                  <div className="pt-4 border-t border-[#E8D9B5] flex gap-3">
                    {userSession.role === 'OWNER' && (
                      <button
                        onClick={() => setActiveView('OWNER_PORTAL')}
                        className="bg-[#C1440E] text-[#F7F1E3] px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Open Restaurant Store Portal
                      </button>
                    )}
                    {userSession.role === 'ADMIN' && (
                      <button
                        onClick={() => setActiveView('ADMIN_PANEL')}
                        className="bg-[#C1440E] text-[#F7F1E3] px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Open Admin Panel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-[#4A3B2C]/80">You are currently browsing as a Guest.</p>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-[#C1440E] text-[#F7F1E3] font-bold px-5 py-2 rounded-xl text-xs shadow"
                  >
                    Log In / Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ── MODALS & DRAWER ────────────────────────────────────────── */}

      {/* Food Item Detail Modal */}
      {selectedFoodItem && (
        <FoodDetailModal
          item={selectedFoodItem}
          restaurant={selectedRestaurant}
          onClose={() => setSelectedFoodItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Multi-Restaurant Conflict Alert Modal */}
      {isMultiCartModalOpen && (
        <MultiRestaurantCartModal
          currentRestaurantName={cartRestaurant?.name}
          newRestaurantName={pendingAddConfig?.restaurant?.name || 'New Restaurant'}
          onConfirmClearAndAdd={handleConfirmClearAndAdd}
          onCancel={() => {
            setIsMultiCartModalOpen(false);
            setPendingAddConfig(null);
          }}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartRestaurant={cartRestaurant}
        userSession={userSession}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          if (!userSession) {
            handleRequireLogin('🔒 Please log in or create an account to proceed to checkout and secure your order.');
          } else {
            setActiveView('CHECKOUT');
          }
        }}
      />

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginReasonMessage('');
        }}
        reasonMessage={loginReasonMessage}
        initialTab={loginInitialTab}
        onLoginSuccess={async (email, password) => {
          const user = await api.login(email, password);
          handleSetSession(user);
          if (user.role === 'OWNER') {
            setActiveView('OWNER_PORTAL');
          } else if (user.role === 'ADMIN') {
            setActiveView('ADMIN_PANEL');
          } else {
            // Customer
            if (cart.length > 0) {
              setActiveView('CHECKOUT');
              setIsCartOpen(false);
            }
          }
        }}
        onRegisterCustomerSuccess={(data) => api.registerCustomer(data)}
        onRegisterVendorSuccess={(data) => api.registerVendor(data)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-[#5C3A21] text-[#F7F1E3] py-8 border-t border-[#D4C299]/30 text-xs text-center space-y-2 mb-16 lg:mb-0">
        <div className="font-display font-extrabold text-base tracking-wide">
          KARINDERYA KO • POBLACION, LAANG, ABRA
        </div>
        <p className="text-[#E8D9B5]/70 max-w-md mx-auto">
          Local food-delivery marketplace connecting home karinderyas, customers, and food business owners.
        </p>
      </footer>

    </div>
  );
}
