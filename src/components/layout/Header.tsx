/**
 * 3-LEVEL HEADER - ANDROID COMPLETE
 * FILE LOCATION: src/components/layout/Header.tsx
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Bell, User, LogOut, LogIn, Search, MessageCircle, Mic, MicOff, Gift, Crown, ArrowLeftRight, Heart, Globe, Package, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LANGUAGES = [
  { code: 'en',  name: 'English',  flag: '🇬🇧' },
  { code: 'fr',  name: 'Français', flag: '🇫🇷' },
  { code: 'ar',  name: 'العربية', flag: '🇸🇦' },
  { code: 'ha',  name: 'Hausa',    flag: '🇳🇬' },
  { code: 'ff',  name: 'Fulfulde', flag: '🇨🇲' },
  { code: 'pcm', name: 'Pidgin',   flag: '🇨🇲' },
];

export default function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen]               = useState(false);
  const [isVoiceActive, setIsVoiceActive]         = useState(false);
  const [searchQuery, setSearchQuery]             = useState('');
  const [showLanguageMenu, setShowLanguageMenu]   = useState(false);
  const [showMobileLanguages, setShowMobileLanguages] = useState(false);
  const [currentLanguage, setCurrentLanguage]     = useState(() => localStorage.getItem('Bambeh_language') || 'en');

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(localStorage.getItem('Bambeh_language') || 'en');
    };
    window.addEventListener('storage', handleLanguageChange);
    const interval = setInterval(handleLanguageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleVoiceControl = () => {
    setIsVoiceActive(prev => !prev);
    if (!isVoiceActive) {
      console.log('Voice control activated');
    } else {
      console.log('Voice control deactivated');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('Bambeh_language', langCode);
    const html = document.documentElement;
    html.lang = langCode;
    html.dir  = langCode === 'ar' ? 'rtl' : 'ltr';
    setShowLanguageMenu(false);
    setShowMobileLanguages(false);
  };

  const getCurrentLanguage = () => LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto">

        {/* ── LEVEL 1 ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-teal-700">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-teal-700 rounded-lg transition-colors"
            style={{ touchAction: 'auto', WebkitTapHighlightColor: 'transparent', minWidth: '48px', minHeight: '48px' }}
            aria-label="Toggle menu">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="relative">
              <img src="/bambeh-logo.png" alt="Bambeh Logo" className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.nextElementSibling;
                  if (fb) (fb as HTMLElement).classList.remove('hidden');
                }} />
              <div className="hidden w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-teal-600 font-bold text-2xl">B</span>
              </div>
            </div>
            <span className="text-2xl font-bold tracking-wide hidden sm:inline">Bambeh</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, jobs, services, rentals..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
          </form>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-semibold shadow-md active:scale-95"
                style={{ touchAction: 'auto', minHeight: '44px' }}>
                <LogOut className="w-5 h-5" /><span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 rounded-lg transition-colors font-semibold shadow-md active:scale-95"
                style={{ touchAction: 'auto', minHeight: '44px' }}>
                <LogIn className="w-5 h-5" /><span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── LEVEL 2 ─────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center justify-center gap-1 h-14 px-4 border-b border-teal-700">
          {[
            { to: '/marketplace', label: '📦 Marketplace' },
            { to: '/jobs',        label: '💼 Jobs'        },
            { to: '/services',    label: '🔧 Services'    },
            { to: '/rentals',     label: '🏠 Rentals'     },
            { to: '/vehicles',    label: '🚗 Car Rentals' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="px-4 py-2 hover:bg-teal-700 rounded-lg transition-colors font-medium">{item.label}</Link>
          ))}
          <Link to="/exchange" className="px-4 py-2 hover:bg-teal-700 rounded-lg transition-colors font-medium flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4" />Exchange
          </Link>
        </nav>

        {/* ── LEVEL 3 ─────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center justify-center gap-4 h-12 px-4">
          <button onClick={toggleVoiceControl}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium ${isVoiceActive ? 'bg-red-500 animate-pulse' : 'hover:bg-teal-700'}`}>
            {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="text-sm">{isVoiceActive ? 'Listening...' : 'Voice'}</span>
          </button>
          {[
            { to: '/cart',      icon: <ShoppingCart className="w-4 h-4" />, label: 'Cart'      },
            { to: '/alerts',    icon: <Bell className="w-4 h-4" />,          label: 'Alerts'    },
            { to: '/favorites', icon: <Heart className="w-4 h-4" />,         label: 'Favorites' },
            { to: '/referral',  icon: <Gift className="w-4 h-4" />,          label: 'Referral'  },
          ].map(item => (
            <Link key={item.to} to={item.to} className="flex items-center gap-2 px-3 py-1.5 hover:bg-teal-700 rounded-lg transition-colors font-medium">
              {item.icon}<span className="text-sm">{item.label}</span>
            </Link>
          ))}

          {/* Language */}
          <div className="relative">
            <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-teal-700 rounded-lg transition-colors font-medium">
              <Globe className="w-4 h-4" /><span className="text-sm">{getCurrentLanguage().name}</span>
            </button>
            {showLanguageMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white text-gray-900 rounded-lg shadow-xl py-2 min-w-[180px] z-50">
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-4 py-2 hover:bg-teal-50 flex items-center gap-3 ${currentLanguage === lang.code ? 'bg-teal-100' : ''}`}>
                    <span>{lang.name}</span>
                    {currentLanguage === lang.code && <span className="ml-auto text-teal-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/subscription" className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors font-semibold shadow-md">
            <Crown className="w-4 h-4" /><span className="text-sm">Subscribe</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 hover:bg-teal-700 rounded-lg transition-colors font-medium">
            <User className="w-4 h-4" /><span className="text-sm">Profile</span>
          </Link>
        </div>

        {/* ── MOBILE MENU ──────────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-b from-teal-600 to-blue-700 border-t border-teal-700"
            style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <form onSubmit={handleSearch} className="p-4 border-b border-teal-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
            </form>

            <nav className="flex flex-col space-y-1 pb-6">
              {/* Account */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">👤 My Account</div>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 bg-teal-700/50 hover:bg-teal-700 active:bg-teal-800 px-4 py-4 mx-2 rounded-lg transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '56px' }}>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center"><User className="w-6 h-6 text-teal-600" /></div>
                <div className="flex-1">
                  <span className="block font-semibold">My Profile</span>
                  <span className="text-xs text-teal-200">{currentUser ? 'View & Edit Profile' : 'Login to view profile'}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-teal-300" />
              </Link>
              {[
                { to: '/profile?tab=orders', icon: <Package className="w-5 h-5" />, label: 'My Orders',  badge: 'Track' },
                { to: '/settings',           icon: <Settings className="w-5 h-5" />, label: 'Settings',   badge: null   },
              ].map(item => (
                <Link key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}>
                  {item.icon}<span className="flex-1">{item.label}</span>
                  {item.badge && <span className="text-xs bg-teal-800 px-2 py-1 rounded">{item.badge}</span>}
                </Link>
              ))}

              <div className="border-t border-teal-700 my-2" />

              {/* Language */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">🌍 Language</div>
              <button onClick={() => setShowMobileLanguages(!showMobileLanguages)}
                className="flex items-center gap-3 bg-teal-700/30 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '48px' }}>
                <span className="flex-1 text-left">{getCurrentLanguage().name}</span>
                <ChevronRight className={`w-5 h-5 transition-transform ${showMobileLanguages ? 'rotate-90' : ''}`} />
              </button>
              {showMobileLanguages && (
                <div className="mx-2 bg-teal-800/30 rounded-lg overflow-hidden">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code}
                      onClick={() => { handleLanguageChange(lang.code); setShowMobileLanguages(false); }}
                      className={`w-full text-left hover:bg-teal-700 active:bg-teal-800 px-4 py-3 transition-colors flex items-center gap-3 font-medium ${currentLanguage === lang.code ? 'bg-teal-700' : ''}`}
                      style={{ touchAction: 'auto', minHeight: '48px' }}>
                      <span className="flex-1">{lang.name}</span>
                      {currentLanguage === lang.code && <span className="text-teal-300">✓</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-teal-700 my-2" />

              {/* Categories */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">📂 Categories</div>
              {[
                { to: '/marketplace', label: '📦 Marketplace' },
                { to: '/jobs',        label: '💼 Jobs'        },
                { to: '/services',    label: '🔧 Services'    },
                { to: '/rentals',     label: '🏠 Rentals'     },
                { to: '/vehicles',    label: '🚗 Car Rentals' },
              ].map(item => (
                <Link key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}>{item.label}</Link>
              ))}
              <Link to="/exchange" onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '48px' }}>
                <ArrowLeftRight className="w-4 h-4" />Exchange
              </Link>

              <div className="border-t border-teal-700 my-2" />

              {/* Quick Actions */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">⚡ Quick Actions</div>
              <button onClick={() => { toggleVoiceControl(); setIsMenuOpen(false); }}
                className={`text-left hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium ${isVoiceActive ? 'bg-red-500' : ''}`}
                style={{ touchAction: 'auto', minHeight: '48px' }}>
                {isVoiceActive ? '🎤 Voice Active' : '🎙️ Voice Control'}
              </button>
              {[
                { to: '/cart',      label: '🛒 Cart'            },
                { to: '/alerts',    label: '🔔 Alerts'          },
                { to: '/favorites', label: '❤️ Favorites'       },
                { to: '/referral',  label: '🎁 Referral Program'},
              ].map(item => (
                <Link key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}>{item.label}</Link>
              ))}
              <Link to="/subscription" onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-4 py-3 mx-2 rounded-lg transition-colors font-semibold text-white"
                style={{ touchAction: 'auto', minHeight: '48px' }}>
                <Crown className="w-5 h-5" /><span className="flex-1">Subscribe — CFA 100 only!</span>
              </Link>

              <div className="border-t border-teal-700 my-2" />

              {/* Session */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">🔐 Session</div>
              {currentUser ? (
                <button onClick={handleLogout}
                  className="text-left flex items-center gap-3 bg-red-500/80 hover:bg-red-500 active:bg-red-600 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}>
                  <LogOut className="w-5 h-5" /><span>Logout</span>
                </button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}>
                  <LogIn className="w-5 h-5" /><span>Login / Register</span>
                </Link>
              )}
              <div className="h-8" />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
