// BAMBEH_DEPLOY_TOKEN__HEADER_FIX127_CLEAN
/**
 * 3-LEVEL HEADER - BAMBEH MARKETPLACE
 * FILE LOCATION: src/components/layout/Header.tsx
 *
 * CHANGES FROM ORIGINAL:
 * - Removed local LANGUAGES array and local currentLanguage state
 * - Now uses useLanguage() from LanguageContext so language change
 *   actually re-renders the whole app in the chosen language
 * - Share button now has a visible label
 * - Search bar navigates to /search?q=...
 * - NotificationBell added to desktop header (right icons + utility bar)
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

import { useState } from 'react';
import { useLanguage } from "@/context/LanguageContext";
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, User, LogOut, LogIn, Search, Plus,
  Mic, MicOff, Crown, ArrowLeftRight,
  Globe, Settings, Package, Heart, Gift, ChevronRight, Share2,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/NotificationBell';
import { useLang, t } from "@/hooks/useAppLang";

type LanguageCode = "en" | "fr" | "pcm" | "ff" | "ar";
const AVAILABLE_LANGUAGES: { code: LanguageCode; name: string; flag: string }[] = [
  { code: "en",  name: "English",       flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "fr",  name: "Français", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { code: "pcm", name: "Pidgin",        flag: "\uD83C\uDDE8\uD83C\uDDF2" },
  { code: "ff",  name: "Fulfulde",      flag: "\uD83C\uDDE8\uD83C\uDDF2" },
  { code: "ar",  name: "العربية", flag: "\uD83C\uDDF8\uD83C\uDDE6" },
];
export default function Header() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate  = useNavigate();
  const { currentUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [isMenuOpen, setIsMenuOpen]               = useState(false);
  const [isVoiceActive, setIsVoiceActive]         = useState(false);
  const [searchQuery, setSearchQuery]             = useState('');
  const [showLanguageMenu, setShowLanguageMenu]   = useState(false);
  const [showMobileLanguages, setShowMobileLanguages] = useState(false);

  const getCurrentLanguage = () =>
    AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // ── Voice control ───────────────────────────────────────────────────────────────────────────────
  const toggleVoiceControl = () => {
    setIsVoiceActive(prev => !prev);
    if (!isVoiceActive) startVoiceRecognition();
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('voice.notSupported'));
      setIsVoiceActive(false);
      return;
    }
    const recognition = new SpeechRecognition();
    const langMap: Record<LanguageCode, string> = {
      // FIX127: 'ff' is not a valid speech tag (start() throws for Fulfulde
      // users) -> fr-FR engine; Fulfulde KEYWORDS below still route correctly.
      en: 'en-US', fr: 'fr-FR', pcm: 'en-NG', ff: 'fr-FR', ar: 'ar-SA'
    };
    recognition.lang = langMap[language] || 'en-US';
    recognition.continuous    = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      handleVoiceCommand(event.results[0][0].transcript.toLowerCase());
      setIsVoiceActive(false);
    };
    recognition.onerror = () => setIsVoiceActive(false);
    recognition.onend   = () => setIsVoiceActive(false);
    recognition.start();
  };

  // FIX127: 5-language voice commands (EN/FR/Pidgin/Arabic/Fulfulde) across ALL
  // sections. Anything unmatched falls through to the REAL universal /search
  // page (FIX126), so every utterance does something useful.
  const VOICE_ROUTES: Array<{ to: string; words: string[] }> = [
    { to: '/rentals',     words: ['house', 'rent', 'maison', 'louer', 'appartement', 'haus', 'منزل', 'إيجار', 'luwe', 'galle'] },
    { to: '/jobs',        words: ['job', 'work', 'emploi', 'travail', 'wok', 'وظيفة', 'عمل', 'golle'] },
    { to: '/marketplace', words: ['market', 'buy', 'shop', 'marché', 'acheter', 'boutique', 'سوق', 'شراء', 'luumo', 'sood'] },
    { to: '/vehicles',    words: ['car', 'vehicle', 'moto', 'voiture', 'véhicule', 'motto', 'سيارة', 'oto'] },
    { to: '/services',    words: ['service', 'خدمة', 'sarwis'] },
    { to: '/farm-fresh',  words: ['farm', 'food', 'tomato', 'vegetable', 'ferme', 'légume', 'chop', 'مزرعة', 'طعام', 'ndema', 'ñamdu', 'remuru'] },
    { to: '/exchange',    words: ['exchange', 'swap', 'trade', 'échange', 'troc', 'مقايضة', 'waylugol', 'waylu'] },
    { to: '/community',   words: ['community', 'group', 'communauté', 'groupe', 'مجتمع', 'renndo', 'goomu'] },
    { to: '/tontine',     words: ['tontine', 'njangi', 'saving', 'épargne', 'توفير'] },
    { to: '/coins',       words: ['coin', 'zerm', 'pièce', 'عملة'] },
    { to: '/corporate',   words: ['corporate', 'business', 'company', 'entreprise', 'société', 'شركة', 'sosiyete'] },
    { to: '/cart',        words: ['cart', 'basket', 'panier', 'سلة'] },
    { to: '/my-listings', words: ['my listing', 'my ads', 'mes annonces', 'إعلاناتي', 'jaayɗe am'] },
    { to: '/profile',     words: ['profile', 'account', 'profil', 'compte', 'حسابي', 'profil am'] },
    { to: '/post-ad',     words: ['post', 'sell', 'publier', 'vendre', 'sell am', 'بيع', 'نشر', 'yeey'] },
    { to: '/',            words: ['home', 'accueil', 'go home', 'الرئيسية', 'fuɗɗorde'] },
  ];

  const handleVoiceCommand = (command: string) => {
    for (const r of VOICE_ROUTES) {
      if (r.words.some(w => command.includes(w))) { navigate(r.to); return; }
    }
    // No section keyword matched -> universal real search (FIX126).
    navigate(`/search?q=${encodeURIComponent(command)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as LanguageCode);
    setShowLanguageMenu(false);
    setShowMobileLanguages(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Bambeh Marketplace',
        text: "Check out Bambeh — Africa's #1 Marketplace!",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto">

        {/* ── LEVEL 1 ─────────────────────────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-teal-700">

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-teal-700 rounded-lg transition-colors"
            style={{ touchAction: 'auto', WebkitTapHighlightColor: 'transparent', minWidth: '48px', minHeight: '48px' }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="relative">
              <img
                src="/bambeh-logo.png"
                alt="Bambeh Logo"
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.nextElementSibling;
                  if (fb) (fb as HTMLElement).classList.remove('hidden');
                }}
              />
              <div className="hidden w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-teal-600 font-bold text-2xl">B</span>
              </div>
            </div>
            <span className="text-2xl font-bold tracking-wide hidden sm:inline">Bambeh</span>
          </Link>

          {/* Desktop search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full flex">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search') + '...'}
                className="w-full pl-12 pr-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                type="submit"
                className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-3 rounded-r-lg font-semibold transition-colors"
              >
                {t('common.search')}
              </button>
            </div>
          </form>

          {/* ── Right icons (desktop) ─────────────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Share button */}
            <button
              onClick={handleShare}
              aria-label="Share this page"
              className="hidden md:flex items-center gap-1 px-3 py-2 hover:bg-teal-700 rounded-lg transition-colors text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('common.share')}</span>
            </button>

            {/* Voice button */}
            <button
              onClick={toggleVoiceControl}
              aria-label={isVoiceActive ? 'Stop voice' : 'Start voice'}
              className={`hidden md:flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                isVoiceActive ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-teal-700'
              }`}
            >
              {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* ── NOTIFICATION BELL — desktop header ───────────────────────────────────────────────
                Shows on desktop only (md:flex). On mobile the bottom
                nav already has a bell icon that navigates to /notifications.
            ─────────────────────────────────────────────────────────────────────────────────────── */}
            {/* FIX276: Sell is the money action - always on screen, signed in or not.
                A signed-out tap lands on the login page, which is the right
                place for it to land. */}
            <button
              type="button"
              onClick={() => navigate('/marketplace/sell')}
              aria-label={t('nav.sellItem') || 'Sell Item'}
              title={t('nav.sellItem') || 'Sell Item'}
              className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 font-bold text-teal-900 shadow-md transition-colors hover:bg-amber-300 active:scale-95"
              style={{ touchAction: 'auto', minHeight: '44px' }}
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">{t('nav.sellItem') || 'Sell Item'}</span>
            </button>

            {/* FIX186 - messages + notifications, all screen sizes */}
            {currentUser && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  aria-label={t('nav.messages') || 'Messages'}
                  title={t('nav.messages') || 'Messages'}
                  className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-teal-700"
                  style={{ touchAction: 'auto', minHeight: '44px', minWidth: '44px' }}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <NotificationBell />
              </div>
            )}

            {/* Login / Logout */}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-semibold shadow-md active:scale-95"
                style={{ touchAction: 'auto', minHeight: '44px' }}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">{t('common.logout')}</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 rounded-lg transition-colors font-semibold shadow-md active:scale-95"
                style={{ touchAction: 'auto', minHeight: '44px' }}
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">{t('common.login')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── LEVEL 2 — Desktop nav ─────────────────────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center justify-center gap-1 h-14 px-4 border-b border-teal-700">
          {[
            { to: '/marketplace', label: `📦 ${t('nav.marketplace')}` },
            { to: '/jobs',        label: `💼 ${t('nav.jobs')}`        },
            { to: '/services',    label: `🔧 ${t('nav.services')}`    },
            { to: '/rentals',     label: `🏠 ${t('nav.rentals')}`     },
            { to: '/vehicles',    label: `🚗 ${t('nav.vehicles')}`    },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 hover:bg-teal-700 rounded-lg transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/exchange"
            className="px-4 py-2 hover:bg-teal-700 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {t('nav.exchange')}
          </Link>
        </nav>

        {/* ── LEVEL 3 — Desktop utility bar ─────────────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center justify-between h-10 px-4 text-sm bg-teal-700/30">
          <div className="flex items-center gap-4">
            <Link to="/community" className="hover:text-teal-200 transition-colors">
              👥 {t('nav.community')}
            </Link>
            <Link to="/farm-fresh" className="hover:text-teal-200 transition-colors">
              🌿 Farm Fresh
            </Link>
            <Link to="/tontine" className="hover:text-teal-200 transition-colors">
              💰 Njangi
            </Link>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Language picker — DESKTOP */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 hover:bg-teal-700 px-3 py-1 rounded-lg transition-colors"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4" />
                <span>{getCurrentLanguage().flag} {getCurrentLanguage().name}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showLanguageMenu ? 'rotate-90' : ''}`} />
              </button>

              {showLanguageMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 w-44">
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors flex items-center gap-3 text-sm font-medium ${
                        language === lang.code ? 'bg-teal-50 text-teal-700' : ''
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && <span className="text-teal-500">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/subscription"
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors font-semibold shadow-md"
            >
              <Crown className="w-4 h-4" />
              <span className="text-sm">Subscribe</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-teal-700 rounded-lg transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">{t('common.profile')}</span>
            </Link>
          </div>
        </div>

        {/* ── MOBILE MENU ─────────────────────────────────────────────────────────────────────────── */}
        {isMenuOpen && (
          <div
            className="md:hidden bg-gradient-to-b from-teal-600 to-blue-700 border-t border-teal-700"
            style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="p-4 border-b border-teal-700">
              <div className="relative flex">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search') + '...'}
                  className="w-full pl-10 pr-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button type="submit" className="bg-teal-800 text-white px-4 rounded-r-lg font-semibold">
                  🔍
                </button>
              </div>
            </form>

            <nav className="flex flex-col space-y-1 pb-6">
              {/* Account */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                👤 {t('common.profile')}
              </div>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 bg-teal-700/50 hover:bg-teal-700 active:bg-teal-800 px-4 py-4 mx-2 rounded-lg transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '56px' }}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <span className="block font-semibold">{t('settings.editProfile')}</span>
                  <span className="text-xs text-teal-200">
                    {currentUser ? t('common.profile') : t('common.login')}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-teal-300" />
              </Link>

              {[
                { to: '/orders',      icon: <Package className="w-5 h-5" />,  label: t('nav.orders')      },
                { to: '/settings',    icon: <Settings className="w-5 h-5" />, label: t('common.settings') },
                { to: '/my-listings', icon: <Package className="w-5 h-5" />, label: t('nav.myListings')  },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                </Link>
              ))}

              <div className="border-t border-teal-700 my-2"/>

              {/* Language picker — MOBILE */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                🌍 {t('settings.language')}
              </div>
              <button
                onClick={() => setShowMobileLanguages(!showMobileLanguages)}
                className="flex items-center gap-3 bg-teal-700/30 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '48px' }}
              >
                <span className="text-lg">{getCurrentLanguage().flag}</span>
                <span className="flex-1 text-left">{getCurrentLanguage().name}</span>
                <ChevronRight className={`w-5 h-5 transition-transform ${showMobileLanguages ? 'rotate-90' : ''}`} />
              </button>
              {showMobileLanguages && (
                <div className="mx-2 bg-teal-800/30 rounded-lg overflow-hidden">
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setShowMobileLanguages(false);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left hover:bg-teal-700 active:bg-teal-800 px-4 py-3 transition-colors flex items-center gap-3 font-medium ${
                        language === lang.code ? 'bg-teal-700' : ''
                      }`}
                      style={{ touchAction: 'auto', minHeight: '48px' }}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && <span className="text-teal-300 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-teal-700 my-2"/>

              {/* Categories */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                📂 Categories
              </div>
              {[
                { to: '/marketplace', label: `📦 ${t('nav.marketplace')}` },
                { to: '/jobs',        label: `💼 ${t('nav.jobs')}`        },
                { to: '/services',    label: `🔧 ${t('nav.services')}`    },
                { to: '/rentals',     label: `🏠 ${t('nav.rentals')}`     },
                { to: '/vehicles',    label: `🚗 ${t('nav.vehicles')}`    },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/exchange"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '48px' }}
              >
                <ArrowLeftRight className="w-4 h-4" />
                {t('nav.exchange')}
              </Link>

              <div className="border-t border-teal-700 my-2"/>

              {/* Quick actions */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                ⚡ Quick Actions
              </div>
              <button
                onClick={() => { toggleVoiceControl(); setIsMenuOpen(false); }}
                className={`text-left hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium ${isVoiceActive ? 'bg-red-500' : ''}`}
                style={{ touchAction: 'auto', minHeight: '48px' }}
              >
                {isVoiceActive ? '🎤 ' + t('voice.listening') : '🎙️ ' + t('voice.tapToSpeak')}
              </button>
              <button
                onClick={() => { handleShare(); setIsMenuOpen(false); }}
                className="text-left flex items-center gap-2 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                style={{ touchAction: 'auto', minHeight: '48px' }}
              >
                <Share2 className="w-4 h-4" />
                {t('common.share')}
              </button>
              {[
                { to: '/coins',     label: `⚡ Zerm Coins Wallet`          },
                { to: '/cart',      label: `🛒 ${t('nav.cart')}`      },
                { to: '/favorites', label: `❤️ ${t('nav.favorites')}` },
                { to: '/referral',  label: '🎁 Referral Program'       },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/subscription"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-4 py-3 mx-2 rounded-lg transition-colors font-semibold text-white"
                style={{ touchAction: 'auto', minHeight: '48px' }}
              >
                <Crown className="w-5 h-5" />
                <span className="flex-1">Subscribe — CFA 100 only!</span>
              </Link>

              <div className="border-t border-teal-700 my-2"/>

              {/* Session */}
              <div className="px-4 py-3 text-xs font-bold text-teal-200 uppercase tracking-wider bg-teal-800/50">
                🔐 Session
              </div>
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="text-left flex items-center gap-3 bg-red-500/80 hover:bg-red-500 active:bg-red-600 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('common.logout')}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 px-4 py-3 mx-2 rounded-lg transition-colors font-medium"
                  style={{ touchAction: 'auto', minHeight: '48px' }}
                >
                  <LogIn className="w-5 h-5" />
                  <span>{t('common.login')} / {t('common.register')}</span>
                </Link>
              )}
              <div className="h-8"/>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
// BAMBEH_END_TOKEN__HEADER__COMPLETE
