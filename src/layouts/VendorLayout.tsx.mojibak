/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * VendorLayout.tsx - REDESIGNED v2 (February 14, 2026)
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * 
 * v2 FIXES:
 * ✅ Profile dropdown z-index 9999 — appears ABOVE all banners
 * ✅ Colorful header with gradient accent line
 * ✅ Two-row header preserved
 * ✅ All routes preserved — zero routing changes
 * 
 * © 2026 Bambeh Marketplace. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, BarChart3, MessageSquare, Settings, Bell,
  User, LogOut, Menu, X, Crown, Store, Home, Star, Users, Search,
  ChevronDown, HelpCircle
} from 'lucide-react';

// ============================================================================
// LOGO COMPONENT
// ============================================================================
const BambehLogo = ({ size = 40, className = '' }: { size?: number; className?: string }) => {
  const [imgError, setImgError] = useState(false);
  const logoPaths = ['/bambeh-logo.png', '/logo.png', '/assets/bambeh-logo.png'];
  const [pi, setPi] = useState(0);
  const onErr = () => { if (pi < logoPaths.length - 1) setPi(p => p + 1); else setImgError(true); };
  if (imgError) return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#8B5CF6"/></linearGradient></defs>
      <rect width="40" height="40" rx="10" fill="url(#lg)"/><text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="system-ui">B</text>
    </svg>
  );
  return <img src={logoPaths[pi]} alt="Bambeh" width={size} height={size} className={`rounded-xl object-cover ${className}`} onError={onErr} />;
};

// ============================================================================
// NAV CONFIG
// ============================================================================
const navTabs = [
  { label: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard, group: 1 },
  { label: 'Listings', path: '/vendor/listings', icon: Package, group: 2 },
  { label: 'Analytics', path: '/vendor/analytics', icon: BarChart3, group: 2 },
  { label: 'Premium Tools', path: '/vendor/premium-tools', icon: Star, group: 2 },
  { label: 'Messages', path: '/vendor/messages', icon: MessageSquare, group: 3 },
  { label: 'Customers', path: '/vendor/customers', icon: Users, group: 3 },
];
const mobileBottomNav = [
  { label: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
  { label: 'Listings', path: '/vendor/listings', icon: Package },
  { label: 'Messages', path: '/vendor/messages', icon: MessageSquare },
  { label: 'Notifications', path: '/vendor/notifications', icon: Bell },
  { label: 'Profile', path: '/vendor/profile', icon: User },
];

// ============================================================================
// COMPONENT
// ============================================================================
interface VendorLayoutProps { children: React.ReactNode;  }

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [vendorName, setVendorName] = useState('Vendor');
  const [vendorInitial, setVendorInitial] = useState('V');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const d = localStorage.getItem('Bambeh_vendor');
      if (d) { const v = JSON.parse(d); const n = v.businessName || v.fullName || v.name || v.username || 'Vendor'; setVendorName(n); setVendorInitial(n.charAt(0).toUpperCase()); }
      else { const u = localStorage.getItem('bambe_current_user'); if (u) { const p = JSON.parse(u); const n = p.displayName || p.username || 'Vendor'; setVendorName(n); setVendorInitial(n.charAt(0).toUpperCase()); } }
    } catch (e) {}
  }, []);

  useEffect(() => { const h = () => setIsScrolled(window.scrollY > 10); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => { setIsMobileMenuOpen(false); setShowProfileMenu(false);
  }, [location]);

  const isActivePath = (p: string) => location.pathname === p || location.pathname.startsWith(p + '/');

  const handleLogout = () => {
    ['Bambeh_vendor','Bambeh_current_vendor','Bambeh_vendor_redirect','Bambeh_vendor_authenticated','Bambeh_vendor_auth_token','Bambeh_is_authenticated','Bambeh_auth_token','Bambeh_user','Bambeh_current_user','authToken'].forEach(k => localStorage.removeItem(k));
    window.location.href = '/vendor/signin';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { window.location.href = '/vendor/listings?search=' + encodeURIComponent(searchQuery.trim()); setSearchQuery(''); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* â•â•â• HEADER â•â•â• */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}>

        {/* Gradient accent line */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500" />

        {/* ROW 1 */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-2.5 group" title="Back to Marketplace">
                  <BambehLogo size={36} className="transform group-hover:scale-105 transition-transform shadow-sm" />
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">Bambeh</span>
                </Link>
                <Link to="/vendor/dashboard" className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold rounded-full hover:shadow-md transition-shadow">
                  <Store className="w-3 h-3" /><span className="hidden sm:inline">Vendor Portal</span><span className="sm:hidden">Vendor</span>
                </Link>
              </div>

              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search listings, orders, customers..."
      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 focus:bg-white transition-all" />
                </div>
              </form>

              <div className="flex items-center gap-1.5">
                <Link to="/" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Home className="w-3.5 h-3.5" /><span>Marketplace</span></Link>
                <Link to="/vendor/settings" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"><Settings className="w-5 h-5" /></Link>
                <Link to="/vendor/notifications" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all relative"><Bell className="w-5 h-5" /></Link>

                {/* PROFILE DROPDOWN — z-[9999] to always be on top */}
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-100 transition-all">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-sm">{vendorInitial}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setShowProfileMenu(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden" style={{ zIndex: 9999 }}>
                        <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 text-sm truncate">{vendorName}</p>
                          <p className="text-xs text-teal-600 font-medium">Vendor Account</p>
                        </div>
                        <div className="p-1.5">
                          <Link to="/vendor/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><User className="w-4 h-4 text-gray-400" />Profile</Link>
                          <Link to="/vendor/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Settings className="w-4 h-4 text-gray-400" />Settings</Link>
                          <Link to="/vendor/subscription-plans" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Crown className="w-4 h-4 text-amber-500" />Subscription</Link>
                          <Link to="/help" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><HelpCircle className="w-4 h-4 text-gray-400" />Help Center</Link>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"><LogOut className="w-4 h-4" />Logout</button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all ml-1">
                  {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Nav Tabs */}
        <div className="hidden lg:block bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center h-11 -mb-px">
              {navTabs.map((tab, i) => {
                const Icon = tab.icon;
                const isActive = isActivePath(tab.path);
                const showSep = i > 0 && navTabs[i - 1].group !== tab.group;
                return (
                  <React.Fragment key={tab.path}>
                    {showSep && <div className="w-px h-5 bg-gray-200 mx-2" />}
                    <Link to={tab.path} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${isActive ? 'border-teal-500 text-teal-700 bg-teal-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}>
                      <Icon className="w-4 h-4" /><span>{tab.label}</span>
                    </Link>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl max-h-[70vh] overflow-y-auto">
            <div className="px-4 py-3">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40" /></div>
              </form>
              <div className="space-y-1">
                {navTabs.map(tab => { const Icon = tab.icon; const a = isActivePath(tab.path); return (
                  <Link key={tab.path} to={tab.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${a ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'}`}><Icon className={`w-5 h-5 ${a ? 'text-teal-600' : 'text-gray-400'}`} /><span>{tab.label}</span></Link>
                );
              })}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
                <Link to="/vendor/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50"><User className="w-5 h-5 text-gray-400" />Profile</Link>
                <Link to="/vendor/subscription-plans" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700"><Crown className="w-5 h-5 text-amber-500" />Upgrade Plan</Link>
                <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50"><Home className="w-5 h-5 text-gray-400" />Back to Marketplace</Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 font-semibold"><LogOut className="w-5 h-5" />Logout</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-[7rem] lg:pt-[7rem] pb-24 md:pb-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="hidden md:block bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3"><BambehLogo size={32} /><span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bambeh Vendor</span></div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/help" className="hover:text-purple-600 transition-colors">Help Center</Link>
              <Link to="/privacy-policy" className="hover:text-purple-600 transition-colors">Privacy</Link>
              <Link to="/about" className="hover:text-purple-600 transition-colors">About</Link>
              <Link to="/help/contact" className="hover:text-purple-600 transition-colors">Contact</Link>
            </div>
            <p className="text-xs text-gray-400">&copy; 2026 Bambeh Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-2xl">
        <div className="flex items-center justify-around px-1 py-1.5">
          {mobileBottomNav.map(item => { const Icon = item.icon; const a = isActivePath(item.path); return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 ${a ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}`}>
              <Icon className={`w-5 h-5 ${a ? 'scale-110' : ''} transition-transform`} /><span className={`text-[10px] font-medium ${a ? 'text-teal-600' : 'text-gray-500'}`}>{item.label}</span>
            </Link>
          );
          })}
        </div>
      </nav>
    </div>
  );
};

export default VendorLayout;


