/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * APP.TSX â€” BAMBEH MARKETPLACE â€” SECURITY FORTRESS EDITION
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * âœ… WIDGETS: Chat Widget + Voice Widget ONLY â€” Cart widget permanently removed
 * â¬†ï¸ BackToTopButton â€” smart: bottom-20 mobile / bottom-6 desktop
 *    (fixes double-button â€” VendorLayout no longer renders its own)
 * ðŸ” SecurityInitializer, sessionManager, AdminProtectedRoute (1h TTL)
 * ðŸ” VendorProtectedRoute synchronous Â· initLoginRateLimiter (10 â†’ 30min lockout)
 * ðŸ” Hardened auth: no localStorage-only fallback for vendor/admin
 * ðŸ” ScrollToTop on every route change
 * ðŸŒ¿ TontinePage + FarmFreshPage FULLY DISPLAYED
 * ðŸŒ All  features: Escrow, Community, SellerRating, MeetSafely etc.
 * ðŸ“¦ Vendor: Orders, Reviews, Payments, Products, Onboarding, Withdraw
 * ðŸ’³ NotchPay: /payment/checkout Â· /payment/callback Â· /success Â· /failed
 * ðŸ”’ ESCROW: All marketplace/service/rental/exchange â†’ Escrow â†’ NotchPay
 *    Subscriptions + Donations â†’ Direct NotchPay (no escrow)
 * ðŸ—„ï¸  Supabase + FCM (see src/lib/supabase.ts + firebase.ts)
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { initializeAnalytics } from '@/utils/analytics/AnalyticsInit';
import { AppErrorBoundary, RouteTracker, PerformanceMonitor } from '@/components/app/AppEnhancers';
import AppProviders from '@/providers/AppProviders';
import ProtectedRoute from '@/components/security/ProtectedRoute';
import { ScrollToTop } from '@/components/utils/ScrollToTop';
import { NetworkProvider, NetworkStatusBar } from '@/components/network/NetworkMonitor';
import SecurityInitializer from '@/components/security/SecurityInitializer';
import sessionManager, { SESSION_KEYS } from '@/utils/auth/sessionManager';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import VendorLayout from '@/components/layout/VendorLayout';
import LanguageSelection from '@/pages/LanguageSelection';
import TermsAcceptance from '@/pages/TermsAcceptance';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ForgotCredentials from '@/pages/auth/ForgotCredentials';
import Home from '@/pages/Home';
import Jobs from '@/pages/Jobs';
import Marketplace from '@/pages/Marketplace';
import Services from '@/pages/Services';
import Rentals from '@/pages/Rentals';
import VehicleRentals from '@/pages/VehicleRentals';
import Exchange from '@/pages/Exchange';
import JobDetails from '@/pages/JobDetails';
import MarketplaceItemDetails from '@/pages/MarketplaceItemDetails';
import ServiceDetails from '@/pages/ServiceDetails';
import RentalDetails from '@/pages/RentalDetails';
import VehicleDetails from '@/pages/VehicleDetails';
import OrderTracking from '@/pages/OrderTracking';
import ExchangeItemDetails from '@/pages/ExchangeItemDetails';
import ExchangeItemPost from '@/pages/ExchangeItemPost';
import ExchangeOfferPage from '@/pages/ExchangeOfferPage';
import Profile from '@/pages/Profile';
import Cart from '@/pages/Cart';
import Favorites from '@/pages/Favorites';
import Notifications from '@/pages/Notifications';
import AlertsPage from '@/pages/AlertsPage';
import TrackOrder from '@/pages/TrackOrder';
import Orders from '@/pages/Orders';
import TrackingPage from '@/pages/TrackingPage';
import OfferService from '@/pages/OfferService';
import ListProperty from '@/pages/ListProperty';
import SellVehicle from '@/pages/SellVehicle';
import PostAd from '@/pages/PostAd';
import PostJobPage from '@/pages/PostJobPage';
import PostMarketplaceItemPage from '@/pages/PostMarketplaceItemPage';
import SubscriptionPlans from '@/pages/SubscriptionPlans';
import ZermPurchase from '@/pages/ZermPurchase';
import About from '@/pages/About';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import DonatePremium from '@/pages/DonatePremium';
import ReferralProgram from '@/pages/ReferralProgram';
import Chat from '@/pages/Chat';
import SearchResults from '@/pages/SearchResults';
import SavedSearches from '@/pages/SavedSearches';
import ReportIssuePage from '@/pages/ReportIssuePage';
import FlashDeals from '@/pages/FlashDeals';
import GroupBuying from '@/pages/GroupBuying';
import BambehAIChatbot from '@/pages/BambehAIChatbot';

// âœ… ONLY these two widgets kept per user request
import MovableChatWidget from '@/components/chat/MovableChatWidget';
import MovableVoiceControl from '@/components/voice/MovableVoiceControl';

// Vendor lazy imports
const VendorPortal                     = lazy(() => import('@/pages/vendor/VendorPortal'));
const VendorHome                       = lazy(() => import('@/pages/vendor/VendorHome'));
const VendorSignIn                     = lazy(() => import('@/pages/vendor/VendorSignIn'));
const VendorRegistration               = lazy(() => import('@/pages/vendor/VendorRegistration'));
const VendorAuthPage                   = lazy(() => import('@/pages/vendor/VendorAuthPage'));
const VendorSubscriptionPlans          = lazy(() => import('@/pages/vendor/VendorSubscriptionPlans'));
const VendorSubscriptionPlansExclusive = lazy(() => import('@/pages/vendor/VendorSubscriptionPlansExclusive'));
const VendorSecureDashboard            = lazy(() => import('@/pages/vendor/VendorSecureDashboard'));
const VendorAnalyticsEnhanced          = lazy(() => import('@/pages/vendor/VendorAnalyticsEnhanced'));
const VendorManageListings             = lazy(() => import('@/pages/vendor/VendorManageListings'));
const VendorMessagesPage               = lazy(() => import('@/pages/vendor/VendorMessagesPage'));
const VendorSettingsComplete           = lazy(() => import('@/pages/vendor/VendorSettingsComplete'));
const VendorProfile                    = lazy(() => import('@/pages/vendor/VendorProfile'));
const VendorFilter                     = lazy(() => import('@/pages/vendor/VendorFilter'));
const VendorCustomers                  = lazy(() => import('@/pages/vendor/VendorCustomers'));
const VendorRecommendations            = lazy(() => import('@/pages/vendor/VendorRecommendations'));
const VendorVerification               = lazy(() => import('@/pages/vendor/VendorVerification'));
const VendorNotifications              = lazy(() => import('@/pages/vendor/VendorNotifications'));
const VendorPremiumToolsEnhanced       = lazy(() => import('@/pages/vendor/VendorPremiumToolsEnhanced'));
const VendorSubscriptionPayment        = lazy(() => import('@/pages/vendor/VendorSubscriptionPayment'));
const VendorOrders                     = lazy(() => import('@/pages/vendor/VendorOrders'));
const VendorReviews                    = lazy(() => import('@/pages/vendor/VendorReviews'));
const VendorPayments                   = lazy(() => import('@/pages/vendor/VendorPayments'));
const VendorWithdraw                   = lazy(() => import('@/pages/vendor/VendorWithdraw'));
const VendorProducts                   = lazy(() => import('@/pages/vendor/VendorProducts'));
const VendorOnboardingChecklist        = lazy(() => import('@/pages/vendor/VendorOnboardingChecklist'));
const VendorSettingsAccountProfile     = lazy(() => import('@/pages/vendor/settings/VendorSettingsAccountProfile'));
const VendorSettingsStore              = lazy(() => import('@/pages/vendor/settings/VendorSettingsStore'));
const VendorSettingsNotification       = lazy(() => import('@/pages/vendor/settings/VendorSettingsNotification'));
const VendorSettingsPayment            = lazy(() => import('@/pages/vendor/settings/VendorSettingsPayment'));
const VendorSettingsSecurity           = lazy(() => import('@/pages/vendor/settings/VendorSettingsSecurity'));
const VendorSettingsShipping           = lazy(() => import('@/pages/vendor/settings/VendorSettingsShipping'));
const VendorSettingsBusinessHours      = lazy(() => import('@/pages/vendor/settings/VendorSettingsBusinessHours'));
const VendorSettingsLanguage           = lazy(() => import('@/pages/vendor/settings/VendorSettingsLanguage'));
const AnalyticsPro     = lazy(() => import('@/pages/vendor/premium/AnalyticsPro'));
const FeaturedListings = lazy(() => import('@/pages/vendor/premium/FeaturedListings'));
const BulkUpload       = lazy(() => import('@/pages/vendor/premium/BulkUpload'));
const PrioritySupport  = lazy(() => import('@/pages/vendor/premium/PrioritySupport'));
const VerifiedSeller   = lazy(() => import('@/pages/vendor/premium/VerifiedSeller'));
const AutoMessaging    = lazy(() => import('@/pages/vendor/premium/AutoMessaging'));

// Admin lazy imports
const AdminLogin                 = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard             = lazy(() => import('@/pages/admin/AdminDashboard'));
const CreateAdminPage            = lazy(() => import('@/pages/admin/CreateAdminPage'));
const AdminInbox                 = lazy(() => import('@/pages/admin/AdminInbox'));
const AdminSettings              = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminDisputeResolution     = lazy(() => import('@/pages/admin/AdminDisputeResolution'));
const AdminLiveChat              = lazy(() => import('@/pages/admin/AdminLiveChat'));
const AdminUserManagement        = lazy(() => import('@/pages/admin/AdminUserManagement'));
const AdminResolveDispute        = lazy(() => import('@/pages/admin/AdminResolveDispute'));
const AdminUserAccountManagement = lazy(() => import('@/pages/admin/AdminUserAccountManagement'));

// Help center lazy imports
const Help                   = lazy(() => import('@/pages/help/Help'));
const HelpGuides             = lazy(() => import('@/pages/help/HelpGuides'));
const VideoTutorials         = lazy(() => import('@/pages/help/VideoTutorials'));
const GettingStarted         = lazy(() => import('@/pages/help/GettingStarted'));
const CreatingAccount        = lazy(() => import('@/pages/help/CreatingAccount'));
const ProfileSetup           = lazy(() => import('@/pages/help/ProfileSetup'));
const UnderstandingZermCoins = lazy(() => import('@/pages/help/UnderstandingZermCoins'));
const BuyingSelling          = lazy(() => import('@/pages/help/BuyingSelling'));
const HowToPostAd            = lazy(() => import('@/pages/help/HowToPostAd'));
const SettingRightPrice      = lazy(() => import('@/pages/help/SettingRightPrice'));
const PaymentMethods         = lazy(() => import('@/pages/help/PaymentMethods'));
const SafetySecurity         = lazy(() => import('@/pages/help/SafetySecurity'));
const AvoidingScams          = lazy(() => import('@/pages/help/AvoidingScams'));
const MeetingSafely          = lazy(() => import('@/pages/help/MeetingSafely'));
const ReportingIssues        = lazy(() => import('@/pages/help/ReportingIssues'));
const ContactSupport         = lazy(() => import('@/pages/help/ContactSupport'));

// -specific lazy imports
const EscrowPage       = lazy(() => import('@/pages/EscrowPage'));
const SellerRatingPage = lazy(() => import('@/pages/SellerRatingPage'));
const OfflineModePage  = lazy(() => import('@/pages/OfflineModePage'));
const MeetSafelyPage   = lazy(() => import('@/pages/MeetSafelyPage'));
const CommunityPage    = lazy(() => import('@/pages/CommunityPage'));
const CommunityDetail  = lazy(() => import('@/pages/CommunityDetail'));
const TontinePage      = lazy(() => import('@/pages/TontinePage'));
const FarmFreshPage    = lazy(() => import('@/pages/FarmFreshPage'));
const MakeOfferPage    = lazy(() => import('@/pages/MakeOfferPage'));

// ðŸ’³ NotchPay payment lazy imports
const PaymentCheckout = lazy(() => import('@/pages/payment/PaymentCheckout'));
const PaymentCallback = lazy(() => import('@/pages/payment/PaymentCallback'));
const PaymentSuccess  = lazy(() => import('@/pages/payment/PaymentSuccess'));
const PaymentFailed   = lazy(() => import('@/pages/payment/PaymentFailed'));

// â¬†ï¸ BACK TO TOP BUTTON â€” centered, smart positioning
// bottom-20 on mobile (above 80px bottom nav) | bottom-6 on desktop
const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{ zIndex: 9996, position: 'fixed', left: '50%', transform: 'translateX(-50%)' }}
      className="bottom-20 md:bottom-6 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white flex items-center gap-2 shadow-lg shadow-teal-500/40 hover:from-teal-400 hover:to-teal-600 hover:-translate-y-1 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 text-sm font-semibold"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      Back to Top
    </button>
  );
};

// LOADING SCREEN
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-teal-600 mx-auto mb-6" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <div className="animate-ping rounded-full h-20 w-20 border-4 border-teal-400 opacity-75" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-teal-600 mb-2">BambÃ© Marketplace</h2>
      <p className="text-teal-500 font-medium animate-pulse">Loading your world-class experience...</p>
    </div>
  </div>
);

// ONBOARDING FLOW GUARD
const OnboardingFlowGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const checkingRef = useRef(true);
  const [, rerender] = useState(0);
  useEffect(() => {
    const publicPrefixes = [
      '/login', '/register', '/forgot-password', '/forgot-credentials',
      '/language', '/terms-acceptance', '/help', '/about', '/privacy',
      '/vendor', '/vendorsignin', '/vendor-signin', '/report-issue', '/admin',
    ];
    const isPublic = publicPrefixes.some(p => location.pathname.startsWith(p));
    if (!isPublic) {
      const hasLang  = localStorage.getItem('Bambeh_language');
      const hasTerms = localStorage.getItem('Bambeh_terms_accepted');
      if (!hasLang && location.pathname !== '/language') {
        navigate('/language', { replace: true });
      } else if (hasLang && !hasTerms && location.pathname !== '/terms-acceptance') {
        navigate('/terms-acceptance', { replace: true });
      }
    }
    checkingRef.current = false;
    rerender(n => n + 1);
  }, [location.pathname, navigate]);
  if (checkingRef.current) return <LoadingFallback />;
  return <>{children}</>;
};

// VENDOR AUTH CHECK â€” synchronous, 24h TTL
// ðŸ” No localStorage-only fallback â€” sessionManager is the single source of truth
const isVendorAuthenticated = (): boolean => {
  try {
    for (const key of SESSION_KEYS.vendor) {
      if (!sessionManager.isSessionValid(key)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const v = JSON.parse(raw);
        if (v?.isLoggedIn || v?.isVendor || v?.username || v?.email || v?.businessName || v?.id) return true;
      } catch { /* try next */ }
    }
    for (const key of SESSION_KEYS.user) {
      if (!sessionManager.isSessionValid(key)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const u = JSON.parse(raw);
        if (u?.isVendor && u?.username) return true;
      } catch { /* try next */ }
    }
    return false;
  } catch { return false; }
};

// VENDOR PROTECTED ROUTE
const VendorProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  if (!isVendorAuthenticated()) {
    localStorage.setItem('Bambeh_vendor_redirect', location.pathname);
    return <Navigate to="/vendor/signin" replace />;
  }
  return <>{children}</>;
};

// ADMIN AUTH CHECK â€” 1h TTL
// ðŸ” No localStorage-only fallback â€” sessionManager is the single source of truth
const isAdminAuthenticated = (): boolean => {
  try {
    const key = 'Bambeh_admin';
    if (sessionManager.isSessionValid(key)) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const a = JSON.parse(raw);
        if (a?.isAdmin || a?.role === 'admin' || a?.isLoggedIn) return true;
      }
    }
    return false;
  } catch { return false; }
};

// ADMIN PROTECTED ROUTE
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  if (!isAdminAuthenticated()) {
    localStorage.setItem('Bambeh_admin_redirect', location.pathname);
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

// LOGIN RATE LIMITER
const initLoginRateLimiter = (): void => {
  (window as any).Bambeh_checkRateLimit = (key: string) => {
    try {
      const raw = localStorage.getItem(`Bambeh_rate_${key}`);
      if (!raw) return { blocked: false, requiresCaptcha: false };
      const d = JSON.parse(raw);
      const now = Date.now();
      if (d.lockedUntil && now < d.lockedUntil) {
        return { blocked: true, requiresCaptcha: false, minutesLeft: Math.ceil((d.lockedUntil - now) / 60000) };
      }
      if (d.lastAttempt && now - d.lastAttempt > 30 * 60000) {
        localStorage.removeItem(`Bambeh_rate_${key}`);
        return { blocked: false, requiresCaptcha: false };
      }
      return { blocked: false, requiresCaptcha: d.count >= 5 };
    } catch { return { blocked: false, requiresCaptcha: false }; }
  };
  (window as any).Bambeh_recordLoginAttempt = (key: string, success: boolean): void => {
    try {
      if (success) { localStorage.removeItem(`Bambeh_rate_${key}`); return; }
      const raw = localStorage.getItem(`Bambeh_rate_${key}`);
      const d = raw ? JSON.parse(raw) : { count: 0, lastAttempt: 0, lockedUntil: 0 };
      d.count = (d.count || 0) + 1;
      d.lastAttempt = Date.now();
      if (d.count >= 10) d.lockedUntil = Date.now() + 30 * 60000;
      localStorage.setItem(`Bambeh_rate_${key}`, JSON.stringify(d));
    } catch { /* never block login on storage errors */ }
  };
};

// CAPACITOR INIT
const initializeCapacitor = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try { await StatusBar.setStyle({ style: Style.Light }); if (Capacitor.getPlatform() === 'android') await StatusBar.setBackgroundColor({ color: '#0d9488' }); } catch { /**/ }
  try { await SplashScreen.hide(); } catch { /**/ }
  try { CapacitorApp.addListener('backButton', ({ canGoBack }) => { canGoBack ? window.history.back() : CapacitorApp.exitApp(); }); } catch { /**/ }
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸš€ MAIN APP
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function App() {
  useEffect(() => {
    initializeCapacitor();
    initializeAnalytics();
    initLoginRateLimiter();
    if (import.meta.env.DEV) {
      console.log('%cðŸš€ Bambeh Marketplace â€” Security Fortress Edition', 'color:#0d9488;font-size:18px;font-weight:bold');
      console.log('%câœ… Widgets: Chat + Voice ONLY | Cart widget permanently removed', 'color:#10b981;font-weight:bold');
      console.log('%câœ… BackToTop (smart) | SecurityInitializer | AdminProtectedRoute (1h) | VendorProtectedRoute (sync)', 'color:#10b981;font-weight:bold');
      console.log('%cðŸ”’ Escrow: Marketplace/Service/Rental/Exchange â†’ Escrow â†’ NotchPay', 'color:#0891b2;font-weight:bold');
      console.log('%câš¡ Direct: Subscription/Donation/Zerm â†’ NotchPay (no escrow)', 'color:#7c3aed;font-weight:bold');
      console.log('%câœ… Tontine + Farm Fresh ACTIVE | All  features ACTIVE', 'color:#10b981;font-weight:bold');
    }
  }, []);

  return (
    <React.StrictMode>
      <AppErrorBoundary>
        <PerformanceMonitor>
          <AppProviders>
            <NetworkProvider>
              <BrowserRouter>
                <ScrollToTop />
                <NetworkStatusBar />
                {/* ðŸ” SecurityInitializer â€” session watchdog + Firebase App Check
                    Firebase duplicate-app fix: in firebase.ts use
                    getApps().length > 0 ? getApp() : initializeApp(config) */}
                <SecurityInitializer />
                <RouteTracker>
                  <OnboardingFlowGuard>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        {/* 1. ONBOARDING */}
                        <Route path="/language"         element={<LanguageSelection />} />
                        <Route path="/terms-acceptance" element={<TermsAcceptance />} />

                        {/* 2. AUTH */}
                        <Route path="/login"              element={<AuthLayout><Login /></AuthLayout>} />
                        <Route path="/register"           element={<AuthLayout><Register /></AuthLayout>} />
                        <Route path="/forgot-password"    element={<AuthLayout><ForgotPassword /></AuthLayout>} />
                        <Route path="/forgot-credentials" element={<ForgotCredentials />} />

                        {/* 3. PUBLIC MARKETPLACE */}
                        <Route path="/"             element={<MainLayout><Home /></MainLayout>} />
                        <Route path="/jobs"         element={<MainLayout><Jobs /></MainLayout>} />
                        <Route path="/marketplace"  element={<MainLayout><Marketplace /></MainLayout>} />
                        <Route path="/services"     element={<MainLayout><Services /></MainLayout>} />
                        <Route path="/rentals"      element={<MainLayout><Rentals /></MainLayout>} />
                        <Route path="/vehicles"     element={<MainLayout><VehicleRentals /></MainLayout>} />
                        <Route path="/exchange"     element={<MainLayout><Exchange /></MainLayout>} />
                        <Route path="/deals"        element={<MainLayout><FlashDeals /></MainLayout>} />
                        <Route path="/flash-deals"  element={<Navigate to="/deals" replace />} />
                        <Route path="/group-buying" element={<MainLayout><GroupBuying /></MainLayout>} />
                        <Route path="/ai-chat"      element={<MainLayout><BambehAIChatbot /></MainLayout>} />

                        {/* 4. DETAIL PAGES */}
                        <Route path="/jobs/:id"           element={<MainLayout><JobDetails /></MainLayout>} />
                        <Route path="/marketplace/:id"    element={<MainLayout><MarketplaceItemDetails /></MainLayout>} />
                        <Route path="/services/:id"       element={<MainLayout><ServiceDetails /></MainLayout>} />
                        <Route path="/rentals/:id"        element={<MainLayout><RentalDetails /></MainLayout>} />
                        <Route path="/vehicles/:id"       element={<MainLayout><VehicleDetails /></MainLayout>} />
                        <Route path="/exchange/:id"       element={<MainLayout><ExchangeItemDetails /></MainLayout>} />
                        <Route path="/exchange/post"      element={<MainLayout><ProtectedRoute><ExchangeItemPost /></ProtectedRoute></MainLayout>} />
                        <Route path="/exchange/offer/:id" element={<MainLayout><ProtectedRoute><ExchangeOfferPage /></ProtectedRoute></MainLayout>} />

                        {/* 5. USER PAGES */}
                        <Route path="/profile"       element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>} />
                        <Route path="/cart"          element={<MainLayout><Cart /></MainLayout>} />
                        <Route path="/favorites"     element={<MainLayout><ProtectedRoute><Favorites /></ProtectedRoute></MainLayout>} />
                        <Route path="/notifications" element={<MainLayout><ProtectedRoute><Notifications /></ProtectedRoute></MainLayout>} />
                        <Route path="/alerts"        element={<MainLayout><ProtectedRoute><AlertsPage /></ProtectedRoute></MainLayout>} />
                        <Route path="/orders"        element={<MainLayout><ProtectedRoute><Orders /></ProtectedRoute></MainLayout>} />
                        <Route path="/orders/:id"    element={<MainLayout><ProtectedRoute><OrderTracking /></ProtectedRoute></MainLayout>} />

                        {/* 6. POSTING FORMS */}
                        <Route path="/jobs/post"        element={<MainLayout><ProtectedRoute><PostJobPage /></ProtectedRoute></MainLayout>} />
                        <Route path="/marketplace/sell" element={<MainLayout><ProtectedRoute><PostMarketplaceItemPage /></ProtectedRoute></MainLayout>} />
                        <Route path="/services/offer"   element={<MainLayout><ProtectedRoute><OfferService /></ProtectedRoute></MainLayout>} />
                        <Route path="/rentals/list"     element={<MainLayout><ProtectedRoute><ListProperty /></ProtectedRoute></MainLayout>} />
                        <Route path="/vehicles/sell"    element={<MainLayout><ProtectedRoute><SellVehicle /></ProtectedRoute></MainLayout>} />
                        <Route path="/post-ad"          element={<MainLayout><ProtectedRoute><PostAd /></ProtectedRoute></MainLayout>} />

                        {/* 7. SUBSCRIPTION */}
                        <Route path="/subscription" element={<MainLayout><ProtectedRoute><SubscriptionPlans /></ProtectedRoute></MainLayout>} />
                        <Route path="/zerm/purchase" element={<MainLayout><ProtectedRoute><ZermPurchase /></ProtectedRoute></MainLayout>} />

                        {/* 8. VENDOR PUBLIC */}
                        <Route path="/vendor"                              element={<Navigate to="/vendor/home" replace />} />
                        <Route path="/vendor/portal"                       element={<VendorLayout><VendorPortal /></VendorLayout>} />
                        <Route path="/vendor/home"                         element={<VendorLayout><VendorHome /></VendorLayout>} />
                        <Route path="/vendor/signin"                       element={<VendorLayout><VendorSignIn /></VendorLayout>} />
                        <Route path="/vendor/register"                     element={<VendorLayout><VendorRegistration /></VendorLayout>} />
                        <Route path="/vendor/auth"                         element={<VendorLayout><VendorAuthPage /></VendorLayout>} />
                        <Route path="/vendor/subscription-plans"           element={<VendorLayout><VendorSubscriptionPlans /></VendorLayout>} />
                        <Route path="/vendor/subscription-plans-exclusive" element={<VendorLayout><VendorSubscriptionPlansExclusive /></VendorLayout>} />
                        <Route path="/vendor/plans"                element={<Navigate to="/vendor/subscription-plans" replace />} />
                        <Route path="/vendor/pricing"              element={<Navigate to="/vendor/subscription-plans" replace />} />
                        <Route path="/vendor/subscribe"            element={<Navigate to="/vendor/subscription-plans" replace />} />
                        <Route path="/vendor/secure-dashboard"     element={<Navigate to="/vendor/dashboard" replace />} />
                        <Route path="/vendor/subscription-payment" element={<Navigate to="/vendor/subscription" replace />} />
                        <Route path="/vendor/login"                element={<Navigate to="/vendor/signin" replace />} />
                        <Route path="/vendorsignin"                element={<Navigate to="/vendor/signin" replace />} />
                        <Route path="/vendor-signin"               element={<Navigate to="/vendor/signin" replace />} />

                        {/* 9. VENDOR PROTECTED */}
                        <Route path="/vendor/dashboard"       element={<VendorProtectedRoute><VendorLayout><VendorSecureDashboard /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/analytics"       element={<VendorProtectedRoute><VendorLayout><VendorAnalyticsEnhanced /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/listings"        element={<VendorProtectedRoute><VendorLayout><VendorManageListings /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/messages"        element={<VendorProtectedRoute><VendorLayout><VendorMessagesPage /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/settings"        element={<VendorProtectedRoute><VendorLayout><VendorSettingsComplete /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/profile"         element={<VendorProtectedRoute><VendorLayout><VendorProfile /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/filter"          element={<VendorProtectedRoute><VendorLayout><VendorFilter /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/customers"       element={<VendorProtectedRoute><VendorLayout><VendorCustomers /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/recommendations" element={<VendorProtectedRoute><VendorLayout><VendorRecommendations /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/verification"    element={<VendorProtectedRoute><VendorLayout><VendorVerification /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/notifications"   element={<VendorProtectedRoute><VendorLayout><VendorNotifications /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/premium-tools"   element={<VendorProtectedRoute><VendorLayout><VendorPremiumToolsEnhanced /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/subscription"    element={<VendorProtectedRoute><VendorLayout><VendorSubscriptionPayment /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/orders"              element={<VendorProtectedRoute><VendorLayout><VendorOrders /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/reviews"             element={<VendorProtectedRoute><VendorLayout><VendorReviews /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/payments"            element={<VendorProtectedRoute><VendorLayout><VendorPayments /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/payments/withdraw"   element={<VendorProtectedRoute><VendorLayout><VendorWithdraw /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/products"            element={<VendorProtectedRoute><VendorLayout><VendorProducts /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/onboarding"          element={<VendorProtectedRoute><VendorLayout><VendorOnboardingChecklist /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/settings/account"        element={<VendorProtectedRoute><VendorLayout><VendorSettingsAccountProfile /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/settings/store"          element={<VendorProtectedRoute><VendorLayout><VendorSettingsStore /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/settings/notifications"  element={<VendorProtectedRoute><VendorLayout><VendorSettingsNotification /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/settings/payment"        element={<VendorProtectedRoute><VendorLayout><VendorSettingsPayment /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/settings/security"       element={<VendorProtectedRoute><VendorLayout><VendorSettingsSecurity /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/settings/shipping"       element={<VendorProtectedRoute><VendorLayout><VendorSettingsShipping /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/settings/business-hours" element={<VendorProtectedRoute><VendorLayout><VendorSettingsBusinessHours /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/settings/language"       element={<VendorProtectedRoute><VendorLayout><VendorSettingsLanguage /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/premium/analytics-pro"     element={<VendorProtectedRoute><VendorLayout><AnalyticsPro /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/premium/featured-listings" element={<VendorProtectedRoute><VendorLayout><FeaturedListings /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/premium/bulk-upload"       element={<VendorProtectedRoute><VendorLayout><BulkUpload /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/premium/priority-support"  element={<VendorProtectedRoute><VendorLayout><PrioritySupport /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/premium/verified-seller"   element={<VendorProtectedRoute><VendorLayout><VerifiedSeller /></VendorLayout></VendorProtectedRoute>} />
                        <Route path="/vendor/premium/auto-messaging"    element={<VendorProtectedRoute><VendorLayout><AutoMessaging /></VendorLayout></VendorProtectedRoute>} />

                        {/* 10. ADMIN â€” 1h TTL */}
                        <Route path="/admin"                 element={<Navigate to="/admin/login" replace />} />
                        <Route path="/admin/login"           element={<AdminLogin />} />
                        <Route path="/admin/dashboard"       element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                        <Route path="/admin/create"          element={<AdminProtectedRoute><CreateAdminPage /></AdminProtectedRoute>} />
                        <Route path="/admin/resolve-dispute" element={<AdminProtectedRoute><AdminResolveDispute /></AdminProtectedRoute>} />
                        <Route path="/admin/user-management" element={<AdminProtectedRoute><AdminUserAccountManagement /></AdminProtectedRoute>} />
                        <Route path="/admin/inbox"           element={<AdminProtectedRoute><AdminInbox /></AdminProtectedRoute>} />
                        <Route path="/admin/settings"        element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
                        <Route path="/admin/disputes"        element={<AdminProtectedRoute><AdminDisputeResolution /></AdminProtectedRoute>} />
                        <Route path="/admin/live-chat"       element={<AdminProtectedRoute><AdminLiveChat /></AdminProtectedRoute>} />
                        <Route path="/admin/users"           element={<AdminProtectedRoute><AdminUserManagement /></AdminProtectedRoute>} />

                        {/* 11. HELP CENTER */}
                        <Route path="/help"                           element={<MainLayout><Help /></MainLayout>} />
                        <Route path="/help/contact"                   element={<MainLayout><ContactSupport /></MainLayout>} />
                        <Route path="/help/guides"                    element={<MainLayout><HelpGuides /></MainLayout>} />
                        <Route path="/help/video-tutorials"           element={<MainLayout><VideoTutorials /></MainLayout>} />
                        <Route path="/help/getting-started"           element={<MainLayout><GettingStarted /></MainLayout>} />
                        <Route path="/help/creating-account"          element={<MainLayout><CreatingAccount /></MainLayout>} />
                        <Route path="/help/profile-setup"             element={<MainLayout><ProfileSetup /></MainLayout>} />
                        <Route path="/help/understanding-zerm-coins"  element={<MainLayout><UnderstandingZermCoins /></MainLayout>} />
                        <Route path="/help/buying-selling"            element={<MainLayout><BuyingSelling /></MainLayout>} />
                        <Route path="/help/how-to-post-ad"            element={<MainLayout><HowToPostAd /></MainLayout>} />
                        <Route path="/help/setting-right-price"       element={<MainLayout><SettingRightPrice /></MainLayout>} />
                        <Route path="/help/payment-methods"           element={<MainLayout><PaymentMethods /></MainLayout>} />
                        <Route path="/help/safety-security"           element={<MainLayout><SafetySecurity /></MainLayout>} />
                        <Route path="/help/avoiding-scams"            element={<MainLayout><AvoidingScams /></MainLayout>} />
                        <Route path="/help/meeting-safely"            element={<MainLayout><MeetingSafely /></MainLayout>} />
                        <Route path="/help/reporting-issues"          element={<MainLayout><ReportingIssues /></MainLayout>} />

                        {/* 12. OTHER PAGES */}
                        <Route path="/about"          element={<MainLayout><About /></MainLayout>} />
                        <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
                        <Route path="/privacy"        element={<Navigate to="/privacy-policy" replace />} />
                        <Route path="/donate"         element={<MainLayout><DonatePremium /></MainLayout>} />
                        <Route path="/referral"       element={<MainLayout><ReferralProgram /></MainLayout>} />
                        <Route path="/report-issue"   element={<MainLayout><ReportIssuePage /></MainLayout>} />
                        <Route path="/track-orders"   element={<MainLayout><TrackOrder /></MainLayout>} />
                        <Route path="/tracking"       element={<MainLayout><TrackingPage /></MainLayout>} />
                        <Route path="/chat"           element={<MainLayout><ProtectedRoute><Chat /></ProtectedRoute></MainLayout>} />
                        <Route path="/search"         element={<MainLayout><SearchResults /></MainLayout>} />
                        <Route path="/saved-searches" element={<MainLayout><ProtectedRoute><SavedSearches /></ProtectedRoute></MainLayout>} />

                        {/* 12b. ðŸ’³ PAYMENT ROUTES (NotchPay) */}
                        <Route path="/payment/checkout" element={<MainLayout><ProtectedRoute><PaymentCheckout /></ProtectedRoute></MainLayout>} />
                        <Route path="/payment/callback" element={<MainLayout><PaymentCallback /></MainLayout>} />
                        <Route path="/payment/success"  element={<MainLayout><PaymentSuccess /></MainLayout>} />
                        <Route path="/payment/failed"   element={<MainLayout><PaymentFailed /></MainLayout>} />

                        {/* 13. REDIRECTS */}
                        <Route path="/sell-item" element={<Navigate to="/marketplace/sell" replace />} />
                        <Route path="/post-job"  element={<Navigate to="/jobs/post" replace />} />

                        {/* 14.  FEATURES */}
                        <Route path="/escrow"                  element={<MainLayout><ProtectedRoute><EscrowPage /></ProtectedRoute></MainLayout>} />
                        <Route path="/escrow/:orderId"         element={<MainLayout><ProtectedRoute><EscrowPage /></ProtectedRoute></MainLayout>} />
                        <Route path="/seller/:sellerId/rating" element={<MainLayout><SellerRatingPage /></MainLayout>} />
                        <Route path="/offline-mode"            element={<MainLayout><OfflineModePage /></MainLayout>} />
                        <Route path="/meet-safely"             element={<MainLayout><MeetSafelyPage /></MainLayout>} />
                        <Route path="/community"               element={<MainLayout><CommunityPage /></MainLayout>} />
                        <Route path="/community/:id"           element={<MainLayout><CommunityDetail /></MainLayout>} />
                        <Route path="/tontine"                 element={<MainLayout><ProtectedRoute><TontinePage /></ProtectedRoute></MainLayout>} />
                        <Route path="/farm-fresh"              element={<MainLayout><FarmFreshPage /></MainLayout>} />
                        <Route path="/make-offer/:listingId"   element={<MainLayout><ProtectedRoute><MakeOfferPage /></ProtectedRoute></MainLayout>} />

                        {/* 15. 404 */}
                        <Route path="*" element={
                          <MainLayout>
                            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 py-12 px-4">
                              <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
                                <div className="text-8xl font-bold text-teal-600 mb-4">404</div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                                <p className="text-gray-600 mb-8">Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                  <button onClick={() => window.history.back()} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-all">Go Back</button>
                                  <Link to="/" className="inline-block px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-bold shadow-lg transition-all">Go Home</Link>
                                </div>
                              </div>
                            </div>
                          </MainLayout>
                        } />
                      </Routes>

                      {/* âœ… Chat Widget + Voice Widget ONLY | â¬†ï¸ BackToTop centered on every page */}
                      <MovableChatWidget />
                      <MovableVoiceControl />
                      <BackToTopButton />
                    </Suspense>
                  </OnboardingFlowGuard>
                </RouteTracker>
              </BrowserRouter>
            </NetworkProvider>
          </AppProviders>
        </PerformanceMonitor>
      </AppErrorBoundary>
    </React.StrictMode>
  );
}



