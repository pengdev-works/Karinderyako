import React, { useState } from 'react';

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterCustomerSuccess,
  onRegisterVendorSuccess,
  reasonMessage = '',
  initialTab = 'LOGIN',
}) {
  const [tab, setTab] = useState(initialTab); // LOGIN | REG_CUSTOMER | REG_VENDOR
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update tab if initialTab prop changes
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Customer Reg State
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('Poblacion, Laang, Abra');

  // Vendor Reg State
  const [vName, setVName] = useState('');
  const [vOwner, setVOwner] = useState('');
  const [vAddress, setVAddress] = useState('Poblacion, Laang, Abra');
  const [vCategory, setVCategory] = useState('Filipino Food');
  const [vDesc, setVDesc] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vPassword, setVPassword] = useState('');

  if (!isOpen) return null;

  // Demo Fast Login Preset Helper
  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLoginSuccess(email, password);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onRegisterCustomerSuccess({
        name: cName,
        email: cEmail,
        password: cPassword,
        phone: cPhone,
        address: cAddress,
      });
      // Auto login after successful customer registration
      try {
        await onLoginSuccess(cEmail, cPassword);
        onClose();
      } catch {
        alert('✅ Account created successfully! Please sign in.');
        setTab('LOGIN');
        setEmail(cEmail);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorRegSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onRegisterVendorSuccess({
        name: vName,
        ownerName: vOwner,
        address: vAddress,
        category: vCategory,
        description: vDesc,
        email: vEmail,
        phone: vPhone,
        password: vPassword,
      });
      alert('✅ Food business registered! Log in with your seller account.');
      setTab('LOGIN');
      setEmail(vEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F7F1E3] rounded-3xl overflow-hidden max-w-lg w-full border border-[#E8D9B5] shadow-2xl space-y-0 relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-[#5C3A21] text-[#F7F1E3] flex items-center justify-between shadow-md shrink-0">
          <div>
            <h2 className="font-display font-extrabold text-xl flex items-center gap-2">
              <i className="fas fa-shield-alt text-[#C1440E]"></i>
              <span>Account Login & Registration</span>
            </h2>
            <p className="text-xs text-[#E8D9B5]/80">
              {reasonMessage || 'Karinderya Ko Food Marketplace • Poblacion, Laang'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#F7F1E3] flex items-center justify-center transition">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {reasonMessage && (
          <div className="bg-[#C1440E]/10 border-b border-[#C1440E]/20 px-5 py-2.5 text-xs text-[#C1440E] font-bold flex items-center gap-2">
            <i className="fas fa-lock"></i>
            <span>{reasonMessage}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#E8D9B5] bg-[#E8D9B5]/30 shrink-0">
          <button
            onClick={() => { setTab('LOGIN'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${
              tab === 'LOGIN' ? 'bg-[#F7F1E3] text-[#C1440E] border-b-2 border-[#C1440E]' : 'text-[#4A3B2C]/70 hover:text-[#5C3A21]'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setTab('REG_CUSTOMER'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${
              tab === 'REG_CUSTOMER' ? 'bg-[#F7F1E3] text-[#C1440E] border-b-2 border-[#C1440E]' : 'text-[#4A3B2C]/70 hover:text-[#5C3A21]'
            }`}
          >
            Customer Register
          </button>
          <button
            onClick={() => { setTab('REG_VENDOR'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${
              tab === 'REG_VENDOR' ? 'bg-[#F7F1E3] text-[#C1440E] border-b-2 border-[#C1440E]' : 'text-[#4A3B2C]/70 hover:text-[#5C3A21]'
            }`}
          >
            Register Store
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-sm"></i>
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold text-[#5C3A21]">
              <div>
                <label className="block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="customer@karinderyako.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-3 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                />
              </div>

              <div>
                <label className="block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-3 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1440E] hover:bg-[#A03408] text-[#F7F1E3] font-display font-extrabold py-3.5 rounded-2xl text-sm shadow-lg transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              {/* Demo Accounts Quick Login Buttons */}
              <div className="pt-3 border-t border-[#E8D9B5] space-y-2">
                <div className="text-[11px] font-bold text-[#4A3B2C]/70 uppercase tracking-wider text-center">
                  Quick Demo One-Click Fill:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('customer@karinderyako.ph', 'customer123')}
                    className="bg-[#E8D9B5]/60 hover:bg-[#E8D9B5] text-[#5C3A21] py-1.5 px-2 rounded-xl text-[11px] font-bold"
                  >
                    👤 Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('owner@karinderyako.ph', 'owner123')}
                    className="bg-[#E8D9B5]/60 hover:bg-[#E8D9B5] text-[#5C3A21] py-1.5 px-2 rounded-xl text-[11px] font-bold"
                  >
                    🏪 Store Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@karinderyako.ph', 'admin123')}
                    className="bg-[#E8D9B5]/60 hover:bg-[#E8D9B5] text-[#5C3A21] py-1.5 px-2 rounded-xl text-[11px] font-bold"
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER CUSTOMER */}
          {tab === 'REG_CUSTOMER' && (
            <form onSubmit={handleCustomerRegSubmit} className="space-y-3 text-xs font-semibold text-[#5C3A21]">
              <div>
                <label className="block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Juan Dela Cruz"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                />
              </div>

              <div>
                <label className="block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="juan@gmail.com"
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                />
              </div>

              <div>
                <label className="block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={cPassword}
                  onChange={(e) => setCPassword(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="09171234567"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Default Address</label>
                  <input
                    type="text"
                    value={cAddress}
                    onChange={(e) => setCAddress(e.target.value)}
                    className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1440E] text-[#F7F1E3] font-display font-extrabold py-3 rounded-2xl shadow mt-2"
              >
                {loading ? 'Creating Customer Account...' : 'Register Customer Account'}
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER STORE OWNER */}
          {tab === 'REG_VENDOR' && (
            <form onSubmit={handleVendorRegSubmit} className="space-y-3 text-xs font-semibold text-[#5C3A21]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aling Nena's Kitchen"
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nena Santos"
                    value={vOwner}
                    onChange={(e) => setVOwner(e.target.value)}
                    className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Business Address (Poblacion, Laang, Abra) *</label>
                <input
                  type="text"
                  required
                  value={vAddress}
                  onChange={(e) => setVAddress(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Filipino Food"
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value)}
                    className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="09171234567"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Owner Email *</label>
                <input
                  type="email"
                  required
                  placeholder="seller@karinderyako.ph"
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                />
              </div>

              <div>
                <label className="block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={vPassword}
                  onChange={(e) => setVPassword(e.target.value)}
                  className="w-full bg-[#E8D9B5]/40 p-2.5 rounded-xl border border-[#D4C299]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1440E] text-[#F7F1E3] font-display font-extrabold py-3 rounded-2xl shadow mt-2"
              >
                {loading ? 'Submitting Store Registration...' : 'Register Food Business'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
