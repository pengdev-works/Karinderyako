import React, { useState, useEffect } from 'react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Customer Reg State
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [showCPassword, setShowCPassword] = useState(false);
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
  const [showVPassword, setShowVPassword] = useState(false);

  // Sync tab on modal open
  useEffect(() => {
    if (isOpen && initialTab) {
      setTab(initialTab);
      setError('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLoginSuccess(email.trim(), password);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
        name: cName.trim(),
        email: cEmail.trim(),
        password: cPassword,
        phone: cPhone.trim(),
        address: cAddress.trim(),
      });
      // Auto login after successful customer registration
      try {
        await onLoginSuccess(cEmail.trim(), cPassword);
        onClose();
      } catch {
        setTab('LOGIN');
        setEmail(cEmail);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
        name: vName.trim(),
        ownerName: vOwner.trim(),
        address: vAddress.trim(),
        category: vCategory,
        description: vDesc.trim(),
        email: vEmail.trim(),
        phone: vPhone.trim(),
        password: vPassword,
      });
      setTab('LOGIN');
      setEmail(vEmail);
    } catch (err) {
      setError(err.message || 'Vendor registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FDFBF7] rounded-[2rem] overflow-hidden max-w-md w-full border border-[#E8D9B5] shadow-2xl relative max-h-[92vh] flex flex-col transition-all">
        
        {/* Modern Brand Header */}
        <div className="relative bg-gradient-to-br from-[#4A2E1B] via-[#5C3A21] to-[#3D2514] text-[#F7F1E3] p-6 shrink-0 overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E8D9B5_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#C1440E] text-[#F7F1E3] flex items-center justify-center text-xl shadow-lg border border-[#F7F1E3]/20">
                <i className="fas fa-bowl-rice"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-xl tracking-tight text-[#F7F1E3]">
                    Karinderya<span className="text-[#E8D9B5]">Ko</span>
                  </h2>
                  <span className="bg-[#C1440E]/80 text-[#F7F1E3] text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Poblacion
                  </span>
                </div>
                <p className="text-xs text-[#E8D9B5]/80 font-medium mt-0.5">
                  {tab === 'LOGIN' && 'Welcome back! Sign in to your account.'}
                  {tab === 'REG_CUSTOMER' && 'Create your customer account to start ordering.'}
                  {tab === 'REG_VENDOR' && 'Register your karinderya food business.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#F7F1E3] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>

          {/* Context Reason Alert Banner */}
          {reasonMessage && (
            <div className="mt-4 bg-[#C1440E]/20 border border-[#C1440E]/40 rounded-xl px-3 py-2 text-xs text-[#F7F1E3] font-semibold flex items-center gap-2 backdrop-blur-xs">
              <i className="fas fa-lock text-[#E8D9B5] text-xs"></i>
              <span>{reasonMessage}</span>
            </div>
          )}
        </div>

        {/* Modern Pill Switcher Tabs */}
        <div className="p-3 bg-[#E8D9B5]/30 border-b border-[#E8D9B5]/70 shrink-0">
          <div className="flex bg-[#E8D9B5]/50 p-1 rounded-2xl gap-1">
            <button
              onClick={() => { setTab('LOGIN'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'LOGIN'
                  ? 'bg-[#FDFBF7] text-[#C1440E] shadow-sm font-extrabold'
                  : 'text-[#5C3A21]/70 hover:text-[#5C3A21]'
              }`}
            >
              <i className="fas fa-sign-in-alt text-xs"></i>
              <span>Sign In</span>
            </button>

            <button
              onClick={() => { setTab('REG_CUSTOMER'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'REG_CUSTOMER'
                  ? 'bg-[#FDFBF7] text-[#C1440E] shadow-sm font-extrabold'
                  : 'text-[#5C3A21]/70 hover:text-[#5C3A21]'
              }`}
            >
              <i className="fas fa-user-plus text-xs"></i>
              <span>Register</span>
            </button>

            <button
              onClick={() => { setTab('REG_VENDOR'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'REG_VENDOR'
                  ? 'bg-[#FDFBF7] text-[#C1440E] shadow-sm font-extrabold'
                  : 'text-[#5C3A21]/70 hover:text-[#5C3A21]'
              }`}
            >
              <i className="fas fa-store text-xs"></i>
              <span>Sell Food</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <i className="fas fa-circle-exclamation text-red-500 text-base shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* ── TAB 1: LOGIN ── */}
          {tab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5C3A21]">
                  Email Address
                </label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/40 text-xs"></i>
                  <input
                    type="email"
                    required
                    placeholder="e.g. juan@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] pl-10 pr-4 py-3 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium placeholder:text-[#5C3A21]/30 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5C3A21]">
                  Password
                </label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/40 text-xs"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] pl-10 pr-11 py-3 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium placeholder:text-[#5C3A21]/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/50 hover:text-[#5C3A21] text-xs"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1440E] hover:bg-[#A03408] active:scale-[0.99] disabled:opacity-50 text-[#F7F1E3] font-display font-extrabold py-3.5 rounded-2xl text-sm shadow-lg shadow-[#C1440E]/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to KarinderyaKo</span>
                    <i className="fas fa-arrow-right text-xs"></i>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-[#4A3B2C]/70">
                  New to KarinderyaKo?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('REG_CUSTOMER'); setError(''); }}
                    className="text-[#C1440E] font-bold hover:underline"
                  >
                    Create a Customer Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ── TAB 2: REGISTER CUSTOMER ── */}
          {tab === 'REG_CUSTOMER' && (
            <form onSubmit={handleCustomerRegSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5C3A21]">Full Name *</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/40 text-xs"></i>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] pl-10 pr-4 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium placeholder:text-[#5C3A21]/30 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5C3A21]">Email Address *</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/40 text-xs"></i>
                  <input
                    type="email"
                    required
                    placeholder="e.g. maria@gmail.com"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] pl-10 pr-4 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium placeholder:text-[#5C3A21]/30 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5C3A21]">Password *</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/40 text-xs"></i>
                  <input
                    type={showCPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] pl-10 pr-11 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium placeholder:text-[#5C3A21]/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCPassword(!showCPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/50 hover:text-[#5C3A21] text-xs"
                  >
                    <i className={`fas ${showCPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#5C3A21]">Phone Number</label>
                  <div className="relative">
                    <i className="fas fa-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/40 text-xs"></i>
                    <input
                      type="tel"
                      placeholder="09171234567"
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      className="w-full bg-[#E8D9B5]/25 text-[#2B2118] pl-10 pr-3 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium placeholder:text-[#5C3A21]/30 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#5C3A21]">Delivery Area</label>
                  <div className="relative">
                    <i className="fas fa-map-marker-alt absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/40 text-xs"></i>
                    <input
                      type="text"
                      value={cAddress}
                      onChange={(e) => setCAddress(e.target.value)}
                      className="w-full bg-[#E8D9B5]/25 text-[#2B2118] pl-10 pr-3 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1440E] hover:bg-[#A03408] active:scale-[0.99] disabled:opacity-50 text-[#F7F1E3] font-display font-extrabold py-3.5 rounded-2xl text-sm shadow-lg shadow-[#C1440E]/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle text-xs"></i>
                    <span>Create Customer Account</span>
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <p className="text-xs text-[#4A3B2C]/70">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('LOGIN'); setError(''); }}
                    className="text-[#C1440E] font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ── TAB 3: REGISTER STORE OWNER ── */}
          {tab === 'REG_VENDOR' && (
            <form onSubmit={handleVendorRegSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#5C3A21]">Store Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aling Nena's Kitchen"
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] px-3.5 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium placeholder:text-[#5C3A21]/30 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#5C3A21]">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nena Santos"
                    value={vOwner}
                    onChange={(e) => setVOwner(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] px-3.5 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium placeholder:text-[#5C3A21]/30 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5C3A21]">Business Address *</label>
                <input
                  type="text"
                  required
                  value={vAddress}
                  onChange={(e) => setVAddress(e.target.value)}
                  className="w-full bg-[#E8D9B5]/25 text-[#2B2118] px-3.5 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#5C3A21]">Food Category</label>
                  <input
                    type="text"
                    placeholder="Filipino Food"
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] px-3.5 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#5C3A21]">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="09171234567"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] px-3.5 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5C3A21]">Owner Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="seller@karinderyako.ph"
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                  className="w-full bg-[#E8D9B5]/25 text-[#2B2118] px-3.5 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5C3A21]">Store Password *</label>
                <div className="relative">
                  <input
                    type={showVPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={vPassword}
                    onChange={(e) => setVPassword(e.target.value)}
                    className="w-full bg-[#E8D9B5]/25 text-[#2B2118] pl-3.5 pr-11 py-2.5 rounded-2xl border border-[#D4C299] focus:outline-none focus:ring-2 focus:ring-[#C1440E] text-xs font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVPassword(!showVPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C3A21]/50 hover:text-[#5C3A21] text-xs"
                  >
                    <i className={`fas ${showVPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1440E] hover:bg-[#A03408] active:scale-[0.99] disabled:opacity-50 text-[#F7F1E3] font-display font-extrabold py-3.5 rounded-2xl text-sm shadow-lg shadow-[#C1440E]/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Registering Business...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-store text-xs"></i>
                    <span>Register Karinderya Business</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Security & Privacy Footer */}
        <div className="px-6 py-3 bg-[#E8D9B5]/20 border-t border-[#E8D9B5]/50 flex items-center justify-center gap-2 text-[10px] text-[#5C3A21]/60 font-semibold shrink-0">
          <i className="fas fa-shield-halved text-[#4B6043]"></i>
          <span>Secured Transaction • Poblacion, Laang, Abra Delivery</span>
        </div>

      </div>
    </div>
  );
}
