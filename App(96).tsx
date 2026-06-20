/**
 * App.tsx â€” Bambeh Marketplace
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

// â”€â”€â”€ 1. React Core â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import React, { Suspense, lazy, useEffect, useRef, useCallback } from "react";

// â”€â”€â”€ 2. Third-Party Libraries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

// â”€â”€â”€ 3. Internal Utils / Services â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { initializeAnalytics } from "@/utils/analytics/AnalyticsInit";
import sessionManager, { SESSION_KEYS } from "@/utils/auth/sessionManager";

// â”€â”€â”€ 4. Internal Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import {
  AppErrorBoundary,
  RouteTracker,
  PerformanceMonitor
} from "@/components/app/AppEnhancers";
import ProtectedRoute from "@/components/security/ProtectedRoute";
import SecurityInitializer from "@/components/security/SecurityInitializer";
import { ScrollToTop } from "@/components/utils/ScrollToTop";
import {
  NetworkProvider,
  NetworkStatusBar
} from "@/components/network/NetworkMonitor";
import MovableChatWidget from "@/components/chat/MovableChatWidget";
import MovableVoiceControl from "@/components/voice/MovableVoiceControl";
import {
  useMonthlyFeedback,
  MonthlyFeedbackBanner
} from "@/hooks/useMonthlyFeedback";

// â”€â”€â”€ 5. Internal Providers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import AppProviders from "@/providers/AppProviders";

// â”€â”€â”€ 6. Layouts (Eager â€” used on nearly every route) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import MainLayout from "@/components/layout/MainLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import VendorLayout from "@/components/layout/VendorLayout";

// â”€â”€â”€ 7. Eager Page Imports (first-screen only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EXCEPTION: LanguageSelection, TermsAcceptance, Login, Register stay eager â€”
// they are the very first screens users hit; lazy-loading them would add latency.
import LanguageSelection from "@/pages/LanguageSelection";
import TermsAcceptance from "@/pages/TermsAcceptance";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// â”€â”€â”€ 8. Lazy Page Imports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// AUTH
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ForgotCredentials = lazy(() => import("@/pages/auth/ForgotCredentials"));

// CORE MARKETPLACE (all lazified â€” fixes BUG #2, critical bundle size)
const Home = lazy(() => import("@/pages/Home"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const Services = lazy(() => import("@/pages/Services"));
const Rentals = lazy(() => import("@/pages/Rentals"));
const VehicleRentals = lazy(() => import("@/pages/VehicleRentals"));
const Exchange = lazy(() => import("@/pages/Exchange"));
const FlashDeals = lazy(() => import("@/pages/FlashDeals"));
const GroupBuying = lazy(() => import("@/pages/GroupBuying"));
const BambehAIChatbot = lazy(() => import("@/pages/BambehAIChatbot"));

// DETAIL PAGES
const JobDetails = lazy(() => import("@/pages/JobDetails"));
const MarketplaceItemDetails = lazy(
  () => import("@/pages/MarketplaceItemDetails"),
);
const ServiceDetails = lazy(() => import("@/pages/ServiceDetails"));
const RentalDetails = lazy(() => import("@/pages/RentalDetails"));
const VehicleDetails = lazy(() => import("@/pages/VehicleDetails"));
const ExchangeItemDetails = lazy(() => import("@/pages/ExchangeItemDetails"));
const ExchangeItemPost = lazy(() => import("@/pages/ExchangeItemPost"));
const ExchangeOfferPage = lazy(() => import("@/pages/ExchangeOfferPage"));

// USER PAGES
const Profile = lazy(() => import("@/pages/Profile"));
const Cart = lazy(() => import("@/pages/Cart"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const AlertsPage = lazy(() => import("@/pages/AlertsPage"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));

// SETTINGS (new full user settings page â€” separate from Profile, fixes Issue #32)
const UserSettings = lazy(() => import("@/pages/settings/UserSettings"));

// POSTING FORMS
const PostJobPage = lazy(() => import("@/pages/PostJobPage"));
const PostMarketplaceItemPage = lazy(
  () => import("@/pages/PostMarketplaceItemPage"),
);
const OfferService = lazy(() => import("@/pages/OfferService"));
const ListProperty = lazy(() => import("@/pages/ListProperty"));
const SellVehicle = lazy(() => import("@/pages/SellVehicle"));
const PostAd = lazy(() => import("@/pages/PostAd"));

// LISTING EDIT FORMS (new â€” fixes Issue #33)
const EditMarketplaceListing = lazy(
  () => import("@/pages/EditMarketplaceListing"),
);
const EditJobListing = lazy(() => import("@/pages/EditJobListing"));
const EditServiceListing = lazy(() => import("@/pages/EditServiceListing"));
const MarketplaceDrafts = lazy(() => import("@/pages/MarketplaceDrafts"));

// CATEGORY PAGES (new â€” fixes Issue #23)
const MarketplaceCategory = lazy(() => import("@/pages/MarketplaceCategory"));
const JobsCategory = lazy(() => import("@/pages/JobsCategory"));

// SUBSCRIPTION / ZERM
const SubscriptionPlans = lazy(() => import("@/pages/SubscriptionPlans"));
const ZermPurchase = lazy(() => import("@/pages/ZermPurchase"));
const CoinsPage = lazy(() => import("@/pages/CoinsPage"));
const CoinsHistory = lazy(() => import("@/pages/CoinsHistory"));
const CoinsTransfer = lazy(() => import("@/pages/CoinsTransfer"));

// GENERAL PAGES
const About = lazy(() => import("@/pages/About"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const DonatePremium = lazy(() => import("@/pages/DonatePremium"));
const ReferralProgram = lazy(() => import("@/pages/ReferralProgram"));
const Chat = lazy(() => import("@/pages/Chat"));
const SearchResults = lazy(() => import("@/pages/SearchResults"));
const SavedSearches = lazy(() => import("@/pages/SavedSearches"));
const ReportIssuePage = lazy(() => import("@/pages/ReportIssuePage"));

// 404 (extracted from inline JSX â€” fixes BUG #7)
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// VENDOR PAGES
const VendorPortal = lazy(() => import("@/pages/vendor/VendorPortal"));
const VendorHome = lazy(() => import("@/pages/vendor/VendorHome"));
const VendorSignIn = lazy(() => import("@/pages/vendor/VendorSignIn"));
const VendorRegistration = lazy(
  () => import("@/pages/vendor/VendorRegistration"),
);
const VendorAuthPage = lazy(() => import("@/pages/vendor/VendorAuthPage"));
const VendorSubscriptionPlans = lazy(
  () => import("@/pages/vendor/VendorSubscriptionPlans"),
);
const VendorSubscriptionPlansExclusive = lazy(
  () => import("@/pages/vendor/VendorSubscriptionPlansExclusive"),
);
const VendorSecureDashboard = lazy(
  () => import("@/pages/vendor/VendorSecureDashboard"),
);
const VendorAnalyticsEnhanced = lazy(
  () => import("@/pages/vendor/VendorAnalyticsEnhanced"),
);
const VendorManageListings = lazy(
  () => import("@/pages/vendor/VendorManageListings"),
);
const VendorMessagesPage = lazy(
  () => import("@/pages/vendor/VendorMessagesPage"),
);
const VendorSettingsComplete = lazy(
  () => import("@/pages/vendor/VendorSettingsComplete"),
);
const VendorProfile = lazy(() => import("@/pages/vendor/VendorProfile"));
const VendorFilter = lazy(() => import("@/pages/vendor/VendorFilter"));
const VendorCustomers = lazy(() => import("@/pages/vendor/VendorCustomers"));
const VendorRecommendations = lazy(
  () => import("@/pages/vendor/VendorRecommendations"),
);
const VendorVerification = lazy(
  () => import("@/pages/vendor/VendorVerification"),
);
const VendorNotifications = lazy(
  () => import("@/pages/vendor/VendorNotifications"),
);
const VendorPremiumToolsEnhanced = lazy(
  () => import("@/pages/vendor/VendorPremiumToolsEnhanced"),
);
const VendorSubscriptionPayment = lazy(
  () => import("@/pages/vendor/VendorSubscriptionPayment"),
);
const VendorOrders = lazy(() => import("@/pages/vendor/VendorOrders"));
const VendorReviews = lazy(() => import("@/pages/vendor/VendorReviews"));
const VendorPayments = lazy(() => import("@/pages/vendor/VendorPayments"));
const VendorWithdraw = lazy(() => import("@/pages/vendor/VendorWithdraw"));
const VendorProducts = lazy(() => import("@/pages/vendor/VendorProducts"));
const VendorOnboardingChecklist = lazy(
  () => import("@/pages/vendor/VendorOnboardingChecklist"),
);
const VendorSettingsAccountProfile = lazy(
  () => import("@/pages/vendor/settings/VendorSettingsAccountProfile"),
);
const VendorSettingsStore = lazy(
  () => import("@/pages/vendor/settings/VendorSettingsStore"),
);
const VendorSettingsNotification = lazy(
  () => import("@/pages/vendor/settings/VendorSettingsNotification"),
);
const VendorSettingsPayment = lazy(
  () => import("@/pages/vendor/settings/VendorSettingsPayment"),
);
const VendorSettingsSecurity = lazy(
  () => import("@/pages/vendor/settings/VendorSettingsSecurity"),
);
const VendorSettingsShipping = lazy(
  () => import("@/pages/vendor/settings/VendorSettingsShipping"),
);
const VendorSettingsBusinessHours = lazy(
  () => import("@/pages/vendor/settings/VendorSettingsBusinessHours"),
);
const VendorSettingsLanguage = lazy(
  () => import("@/pages/vendor/settings/VendorSettingsLanguage"),
);
const AnalyticsPro = lazy(() => import("@/pages/vendor/premium/AnalyticsPro"));
const FeaturedListings = lazy(
  () => import("@/pages/vendor/premium/FeaturedListings"),
);
const BulkUpload = lazy(() => import("@/pages/vendor/premium/BulkUpload"));
const PrioritySupport = lazy(
  () => import("@/pages/vendor/premium/PrioritySupport"),
);
const VerifiedSeller = lazy(
  () => import("@/pages/vendor/premium/VerifiedSeller"),
);
const AutoMessaging = lazy(
  () => import("@/pages/vendor/premium/AutoMessaging"),
);

// VENDOR PUBLIC STOREFRONT (new â€” fixes Issue #23)
const VendorPublicProfile = lazy(
  () => import("@/pages/vendor/VendorPublicProfile"),
);

// ADMIN PAGES
const AdminLayout = lazy(() => import("@/components/layout/AdminLayout"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const CreateAdminPage = lazy(() => import("@/pages/admin/CreateAdminPage"));
const AdminInbox = lazy(() => import("@/pages/admin/AdminInbox"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminDisputeResolution = lazy(
  () => import("@/pages/admin/AdminDisputeResolution"),
);
const AdminLiveChat = lazy(() => import("@/pages/admin/AdminLiveChat"));
const AdminUserManagement = lazy(
  () => import("@/pages/admin/AdminUserManagement"),
);
const AdminResolveDispute = lazy(
  () => import("@/pages/admin/AdminResolveDispute"),
);
const AdminUserAccountManagement = lazy(
  () => import("@/pages/admin/AdminUserAccountManagement"),
);

// HELP CENTER
const Help = lazy(() => import("@/pages/help/Help"));
const HelpGuides = lazy(() => import("@/pages/help/HelpGuides"));
const VideoTutorials = lazy(() => import("@/pages/help/VideoTutorials"));
const GettingStarted = lazy(() => import("@/pages/help/GettingStarted"));
const CreatingAccount = lazy(() => import("@/pages/help/CreatingAccount"));
const ProfileSetup = lazy(() => import("@/pages/help/ProfileSetup"));
const UnderstandingZermCoins = lazy(
  () => import("@/pages/help/UnderstandingZermCoins"),
);
const BuyingSelling = lazy(() => import("@/pages/help/BuyingSelling"));
const HowToPostAd = lazy(() => import("@/pages/help/HowToPostAd"));
const SettingRightPrice = lazy(() => import("@/pages/help/SettingRightPrice"));
const PaymentMethods = lazy(() => import("@/pages/help/PaymentMethods"));
const SafetySecurity = lazy(() => import("@/pages/help/SafetySecurity"));
const AvoidingScams = lazy(() => import("@/pages/help/AvoidingScams"));
const MeetingSafely = lazy(() => import("@/pages/help/MeetingSafely"));
const ReportingIssues = lazy(() => import("@/pages/help/ReportingIssues"));
const ContactSupport = lazy(() => import("@/pages/help/ContactSupport"));

// -SPECIFIC
const EscrowPage = lazy(() => import("@/pages/EscrowPage"));
const SellerRatingPage = lazy(() => import("@/pages/SellerRatingPage"));
const OfflineModePage = lazy(() => import("@/pages/OfflineModePage"));
const MeetSafelyPage = lazy(() => import("@/pages/MeetSafelyPage"));
const CommunityPage = lazy(() => import("@/pages/CommunityPage"));
const CommunityDetail = lazy(() => import("@/pages/CommunityDetail"));
const TontinePage = lazy(() => import("@/pages/TontinePage"));
const TontineDetail = lazy(() => import("@/pages/TontineDetail"));
const TontineCreate = lazy(() => import("@/pages/TontineCreate"));
const FarmFreshPage = lazy(() => import("@/pages/FarmFreshPage"));
const FarmFreshOrderPage = lazy(() => import("@/pages/FarmFreshOrderPage"));
const FarmFreshSellerPage = lazy(() => import("@/pages/FarmFreshSellerPage"));
const MakeOfferPage = lazy(() => import("@/pages/MakeOfferPage"));
const ComparisonTool = lazy(() => import("@/pages/ComparisonTool"));
const SplashScreenPage = lazy(() => import("@/pages/SplashScreen"));
const GroupBuyingDetail = lazy(() => import("@/pages/GroupBuyingDetail"));
const BambehWelcomeScreen = lazy(() => import("@/pages/BambehWelcomeScreen"));
const HeavyLiftSpotlight = lazy(() => import("@/pages/HeavyLiftSpotlight"));

// PAYMENT (NotchPay)
const PaymentCheckout = lazy(() => import("@/pages/payment/PaymentCheckout"));
const PaymentCallback = lazy(() => import("@/pages/payment/PaymentCallback"));
const PaymentPending = lazy(() => import("@/pages/payment/PaymentPending"));
const PaymentSuccess = lazy(() => import("@/pages/payment/PaymentSuccess"));
const PaymentFailed = lazy(() => import("@/pages/payment/PaymentFailed"));

// â”€â”€â”€ 9. Inline Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// FIX #1: BackToTopButton â€” was missing its closing `}` which caused every
// component below it to be parsed as part of its function body.
const BackToTopButton = React.memo(function BackToTopButton() {
  const [visible, setVisible] = React.useState(false);

  const handleScroll = useCallback(() => {
    let ticking = false;
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };
  }, []);

  useEffect(() => {
    const h = handleScroll();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [handleScroll]);

  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      style={{
        zIndex: 9996,
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
      }}
      className="bottom-20 md:bottom-6 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white flex items-center gap-2 shadow-lg shadow-teal-500/40 hover:from-teal-400 hover:to-teal-600 hover:-translate-y-1 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 text-sm font-semibold"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
      Back to Top
    </button>
  );
}); // FIX #1 â€” closing brace restored

// ROUTE-AWARE WIDGETS â€” hidden on language selection and terms acceptance pages (Fix #2)
const WIDGET_HIDDEN_PATHS = ["/language", "/terms-acceptance"];
// FIX #2: RouteAwareWidgets was missing its closing `}` â€” restored below
const RouteAwareWidgets = React.memo(function RouteAwareWidgets() {
  const location = useLocation();
  const hidden = WIDGET_HIDDEN_PATHS.some((p) => location.pathname === p);
  if (hidden) return null;
  return (
    <>
      <MovableChatWidget />
      <MovableVoiceControl />
      <MonthlyFeedbackBanner />
      <BackToTopButton />
    </>
  );
}); // FIX #2 â€” closing brace restored

// LOADING FALLBACK â€” Skeleton-style (minimal spinner, can be upgraded per-route)
// FIX #3: LoadingFallback was missing its closing `}` â€” restored below
const LoadingFallback = React.memo(function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-teal-600 mx-auto mb-6" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <div className="animate-ping rounded-full h-20 w-20 border-4 border-teal-400 opacity-75" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-teal-600 mb-2">
          Bambeh Marketplace
        </h2>
        <p className="text-teal-500 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}); // FIX #3 â€” closing brace restored

// ONBOARDING FLOW GUARD â€” synchronous, no useRef flicker (fixes BUG #5)
// Flow: /language â†’ /terms-acceptance â†’ /welcome (once) â†’ app
const OnboardingFlowGuard = React.memo(function OnboardingFlowGuard({
  children
}: { children: React.ReactNode }) {
  const [guardPassed, setGuardPassed] = React.useState(false);
  React.useEffect(() => { setGuardPassed(true); }, []);
  const location = useLocation();

  const publicPrefixes = [
    "/login",
    "/register",
    "/forgot-password",
    "/forgot-credentials",
    "/language",
    "/terms-acceptance",
    "/help",
    "/about",
    "/privacy",
    "/vendor",
    "/vendorsignin",
    "/vendor-signin",
    "/report-issue",
    "/admin",
    "/splash",
    "/terms-of-service",
    "/welcome",
    "/spotlight",
  ];

  const isPublic = publicPrefixes.some((p) => location.pathname.startsWith(p));

  if (!isPublic) {
    const hasLang = localStorage.getItem("Bambeh_language");
    const hasTerms = localStorage.getItem("Bambeh_terms_accepted");
    const hasWelcome = localStorage.getItem("Bambeh_welcome_shown");
    if (!hasLang && location.pathname !== "/language") {
      return <Navigate to="/language" replace />;
    }
    if (hasLang && !hasTerms && location.pathname !== "/terms-acceptance") {
      return <Navigate to="/terms-acceptance" replace />;
    }
    // FIX #1 â€” Show the welcome animation exactly once after terms accepted
    if (
      hasLang &&
      hasTerms &&
      !hasWelcome &&
      location.pathname !== "/welcome"
    ) {
      return <Navigate to="/welcome" replace />;
    }
  }

  if (!guardPassed) return <LoadingFallback />;
  return <>{children}</>;
});

// â”€â”€â”€ VENDOR AUTH CHECK â€” strict (fixes SECURITY #3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FIX #4: Removed rogue async Firebase getDoc code that was injected inside
// this synchronous function, breaking all try/catch structure.
function isVendorAuthenticated(): boolean {
  try {
    for (const key of SESSION_KEYS.vendor) {
      if (!sessionManager.isSessionValid(key)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const v = JSON.parse(raw) as Record<string, unknown>;
        // STRICT: must have isVendor === true AND an id
        if (v?.isVendor === true && v?.id) return true;
      } catch (e) {
        console.warn("Vendor session parse failed:", e);
      }
    }
    for (const key of SESSION_KEYS.user) {
      if (!sessionManager.isSessionValid(key)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const u = JSON.parse(raw) as Record<string, unknown>;
        if (u?.isVendor === true && u?.id) return true;
      } catch (e) {
        console.warn("User session parse failed:", e);
      }
    }
    return false;
  } catch {
    return false;
  }
}

// â”€â”€â”€ USER AUTH CHECK â€” login status (used by SubscriptionRoute) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FIX #5: Added missing final `return false` after the for-loop
function isUserLoggedIn(): boolean {
  try {
    for (const key of SESSION_KEYS.user) {
      if (!sessionManager.isSessionValid(key)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const u = JSON.parse(raw) as Record<string, unknown>;
        if (u?.id || u?.uid) return true;
      } catch {
        /* ignore */
      }
    }
    return false;
  } catch {
    return false;
  }
}

// â”€â”€â”€ USER SUBSCRIPTION CHECK â€” subscription status (used by SubscriptionRoute)
// FIX #6: Removed `await getDoc(...)` Firebase call inside a sync function.
// Replaced with pure localStorage check consistent with the rest of the file.
function isUserSubscribed(): boolean {
  try {
    for (const key of SESSION_KEYS.user) {
      if (!sessionManager.isSessionValid(key)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const u = JSON.parse(raw) as Record<string, unknown>;
        if (
          (u?.id || u?.uid) &&
          (u?.isSubscribed === true ||
            u?.subscriptionActive === true ||
            (u?.subscription &&
              (u.subscription as Record<string, unknown>)?.active === true))
        )
          return true;
      } catch {
        /* ignore */
      }
    }
    // Also honour a dedicated subscription record written by SubscriptionPlans page
    try {
      const subRaw = localStorage.getItem("Bambeh_subscription");
      if (subRaw) {
        const sub = JSON.parse(subRaw);
        if (sub?.active === true || sub?.status === "active") return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  } catch {
    return false;
  }
}

// â”€â”€â”€ ADMIN AUTH CHECK â€” strict (fixes SECURITY #4) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function isAdminAuthenticated(): boolean {
  try {
    const key = "Bambeh_admin";
    if (sessionManager.isSessionValid(key)) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const a = JSON.parse(raw) as Record<string, unknown>;
        // STRICT: must have isAdmin === true AND role === 'admin'. isLoggedIn alone is NOT enough.
        if (a?.isAdmin === true && a?.role === "admin") return true;
      }
    }
    return false;
  } catch (e) {
    console.warn("isAdminAuthenticated error:", e);
    return false;
  }
}

// â”€â”€â”€ VENDOR PROTECTED ROUTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FIX #7: Removed references to undefined `guardPassed` variable (was only
// defined inside OnboardingFlowGuard, leaked here via corruption).
const VendorProtectedRoute = React.memo(function VendorProtectedRoute({
  children
}: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isVendorAuthenticated()) {
    // Validate redirect before storing (fixes SECURITY #6)
    const safe = location.pathname.startsWith("/vendor/")
      ? location.pathname
      : "/vendor/dashboard";
    localStorage.setItem("Bambeh_vendor_redirect", safe);
    return <Navigate to="/vendor/signin" replace />;
  }
  return <>{children}</>;
});

// â”€â”€â”€ ADMIN PROTECTED ROUTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FIX #8: Same `guardPassed` removal applied here
const AdminProtectedRoute = React.memo(function AdminProtectedRoute({
  children
}: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isAdminAuthenticated()) {
    // Validate redirect before storing (fixes SECURITY #6)
    const safe = location.pathname.startsWith("/admin/")
      ? location.pathname
      : "/admin/dashboard";
    localStorage.setItem("Bambeh_admin_redirect", safe);
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
});

// â”€â”€â”€ SUBSCRIPTION PROTECTED ROUTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Requires user to be BOTH logged-in AND subscribed.
// â€¢ Not logged in  â†’ /login  (stores intended path for post-login redirect)
// â€¢ Logged in, no subscription â†’ /subscription
// FIX #9: Same `guardPassed` removal applied here
const SubscriptionRoute = React.memo(function SubscriptionRoute({
  children
}: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isUserLoggedIn()) {
    // Save intended destination so Login can redirect back after success
    localStorage.setItem("Bambeh_post_login_redirect", location.pathname);
    return <Navigate to="/login" replace />;
  }
  if (!isUserSubscribed()) {
    return <Navigate to="/subscription" replace />;
  }
  return <>{children}</>;
});

// â”€â”€â”€ LOCAL AUTH ROUTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Requires login via localStorage only (no Firebase / subscription needed).
// Used for posting routes so logged-in users can post regardless of subscription.
// â€¢ Not logged in â†’ /login  (saves intended path for post-login redirect)
// FIX #10: Same `guardPassed` removal applied here
const LocalAuthRoute = React.memo(function LocalAuthRoute({
  children
}: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isUserLoggedIn()) {
    localStorage.setItem("Bambeh_post_login_redirect", location.pathname);
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
});

// â”€â”€â”€ RATE LIMITER â€” typed interface, no `any` (fixes TypeScript #20) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface RateLimitResult {
  blocked: boolean;
  requiresCaptcha: boolean;
  minutesLeft?: number;
}

interface RateLimitStore {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}

declare global {
  interface Window {
    Bambeh_checkRateLimit: (key: string) => RateLimitResult;
    Bambeh_recordLoginAttempt: (key: string, success: boolean) => void;
  }
}

// FIX #11: `return { blocked: false, requiresCaptcha: d.count >= 5 } catch`
// was missing the semicolon before catch. All try/catch blocks restructured.
const initLoginRateLimiter = (): void => {
  window.Bambeh_checkRateLimit = (key: string): RateLimitResult => {
    try {
      const raw = localStorage.getItem(`Bambeh_rate_${key}`);
      if (!raw) return { blocked: false, requiresCaptcha: false };
      const d = JSON.parse(raw) as RateLimitStore;
      const now = Date.now();
      if (d.lockedUntil && now < d.lockedUntil) {
        return {
          blocked: true,
          requiresCaptcha: false,
          minutesLeft: Math.ceil((d.lockedUntil - now) / 60000),
        };
      }
      if (d.lastAttempt && now - d.lastAttempt > 30 * 60000) {
        localStorage.removeItem(`Bambeh_rate_${key}`);
        return { blocked: false, requiresCaptcha: false };
      }
      return { blocked: false, requiresCaptcha: d.count >= 5 };
    } catch (e) {
      console.warn("Rate limit check failed:", e);
      return { blocked: false, requiresCaptcha: false };
    }
  };

  window.Bambeh_recordLoginAttempt = (key: string, success: boolean): void => {
    try {
      if (success) {
        localStorage.removeItem(`Bambeh_rate_${key}`);
        return;
      }
      const raw = localStorage.getItem(`Bambeh_rate_${key}`);
      const d: RateLimitStore = raw
        ? JSON.parse(raw)
        : { count: 0, lastAttempt: 0, lockedUntil: 0 };
      d.count = (d.count || 0) + 1;
      d.lastAttempt = Date.now();
      if (d.count >= 10) d.lockedUntil = Date.now() + 30 * 60000;
      localStorage.setItem(`Bambeh_rate_${key}`, JSON.stringify(d));
    } catch (e) {
      console.warn("Rate limit record failed:", e);
    }
  };
};

// â”€â”€â”€ CAPACITOR INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FIX #12: `await StatusBar.setBackgroundColor({ return { color:` had a rogue
// `return` keyword inside the object literal. All three try/catch blocks were
// also improperly collapsed â€” restructured with proper braces.
const initializeCapacitor = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#0d9488" });
    }
  } catch (e) {
    console.warn("StatusBar init failed:", e);
  }
  try {
    await SplashScreen.hide();
  } catch (e) {
    console.warn("SplashScreen hide failed:", e);
  }
  try {
    CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        if (!isUserLoggedIn() && !isVendorAuthenticated()) {
          window.location.href = "/login";
          return;
        }
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });
  } catch (e) {
    console.warn("BackButton listener failed:", e);
  }
};

// WELCOME WRAPPER â€” marks Bambeh_welcome_shown on mount so OnboardingFlowGuard
// never loops, then renders the animated welcome screen.
// FIX #13: `localStorage.setItem(...);, [])` had a stray comma breaking useEffect
const WelcomeWrapper = React.memo(function WelcomeWrapper() {
  useEffect(() => {
    localStorage.setItem("Bambeh_welcome_shown", "true");
  }, []);
  return <BambehWelcomeScreen />;
});

// â”€â”€â”€ ADMIN LAYOUT WRAPPER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Admin layout is lazy-loaded but used as a wrapper; we need a synchronous wrapper
// that passes through children while the real AdminLayout suspense-loads.
const AdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children
}) => (
  <AdminProtectedRoute>
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </AdminProtectedRoute>
);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN APP
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function App() {
  useMonthlyFeedback();

  // FIX #14: Missing closing `}` for the `if (import.meta.env.DEV)` block
  useEffect(() => {
    initializeCapacitor();
    initializeAnalytics();
    initLoginRateLimiter();
    if (import.meta.env.DEV) {
      console.log(
        "%cðŸš€ Bambeh Marketplace",
        "color:#0d9488;font-size:18px;font-weight:bold",
      );
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
                <SecurityInitializer />
                <RouteTracker>
                  <OnboardingFlowGuard>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        {/* â”€â”€ 1. ONBOARDING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        {/* FIX #1: WelcomeWrapper sets Bambeh_welcome_shown flag then renders animation */}
                        <Route path="/welcome" element={<WelcomeWrapper />} />
                        <Route
                          path="/language"
                          element={<LanguageSelection />}
                        />
                        <Route
                          path="/terms-acceptance"
                          element={<TermsAcceptance />}
                        />

                        {/* â”€â”€ 2. AUTH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/login"
                          element={
                            <AuthLayout>
                              <Login />
                            </AuthLayout>
                          }
                        />
                        <Route
                          path="/register"
                          element={
                            <AuthLayout>
                              <Register />
                            </AuthLayout>
                          }
                        />
                        <Route
                          path="/forgot-password"
                          element={
                            <AuthLayout>
                              <ForgotPassword />
                            </AuthLayout>
                          }
                        />
                        {/* FIX BUG #3: ForgotCredentials now has AuthLayout */}
                        <Route
                          path="/forgot-credentials"
                          element={
                            <AuthLayout>
                              <ForgotCredentials />
                            </AuthLayout>
                          }
                        />

                        {/* â”€â”€ 3. PUBLIC MARKETPLACE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/"
                          element={
                            <MainLayout>
                              <Home />
                            </MainLayout>
                          }
                        />
                        {/* FIX: /home alias â†’ / (welcome screen lands here after animation) */}
                        <Route
                          path="/home"
                          element={<Navigate to="/" replace />}
                        />
                        <Route
                          path="/jobs"
                          element={
                            <MainLayout>
                              <Jobs />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/marketplace"
                          element={
                            <MainLayout>
                              <Marketplace />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/services"
                          element={
                            <MainLayout>
                              <Services />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/rentals"
                          element={
                            <MainLayout>
                              <Rentals />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/vehicles"
                          element={
                            <MainLayout>
                              <VehicleRentals />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/exchange"
                          element={
                            <MainLayout>
                              <Exchange />
                            </MainLayout>
                          }
                        />
                        {/* FIX #3: Flash Deals are a premium/subscribed-user feature */}
                        <Route
                          path="/deals"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <FlashDeals />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/flash-deals"
                          element={<Navigate to="/deals" replace />}
                        />
                        {/* FIX #3: Group Buying requires subscription */}
                        <Route
                          path="/group-buying"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <GroupBuying />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/ai-chat"
                          element={
                            <MainLayout>
                              <BambehAIChatbot />
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ 4. CATEGORY PAGES (new â€” fixes Issue #23) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/marketplace/category/:category"
                          element={
                            <MainLayout>
                              <MarketplaceCategory />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/jobs/category/:category"
                          element={
                            <MainLayout>
                              <JobsCategory />
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ 5. STATIC SUB-ROUTES â€” must come BEFORE dynamic :id routes â”€â”€ */}
                        {/* FIX BUG: Static posting/action routes declared first so they are never
                            swallowed by the dynamic :id param routes below (same pattern already
                            applied to /exchange in BUG #1). */}
                        <Route
                          path="/jobs/post"
                          element={
                            <MainLayout>
                              <LocalAuthRoute>
                                <PostJobPage />
                              </LocalAuthRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/marketplace/sell"
                          element={
                            <MainLayout>
                              <LocalAuthRoute>
                                <PostMarketplaceItemPage />
                              </LocalAuthRoute>
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ SERVICE POSTING â€” canonical + aliases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/services/offer"
                          element={
                            <MainLayout>
                              <LocalAuthRoute>
                                <OfferService />
                              </LocalAuthRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/services/post"
                          element={<Navigate to="/services/offer" replace />}
                        />
                        <Route
                          path="/offer-service"
                          element={<Navigate to="/services/offer" replace />}
                        />

                        {/* â”€â”€ RENTAL POSTING â€” canonical + aliases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/rentals/list"
                          element={
                            <MainLayout>
                              <LocalAuthRoute>
                                <ListProperty />
                              </LocalAuthRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/rentals/post"
                          element={<Navigate to="/rentals/list" replace />}
                        />
                        <Route
                          path="/list-property"
                          element={<Navigate to="/rentals/list" replace />}
                        />

                        <Route
                          path="/vehicles/sell"
                          element={
                            <MainLayout>
                              <LocalAuthRoute>
                                <SellVehicle />
                              </LocalAuthRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/post-ad"
                          element={
                            <MainLayout>
                              <LocalAuthRoute>
                                <PostAd />
                              </LocalAuthRoute>
                            </MainLayout>
                          }
                        />

                        {/* FIX BUG: Static exchange routes BEFORE dynamic :id (was already fixed) */}
                        <Route
                          path="/exchange/post"
                          element={
                            <MainLayout>
                              <LocalAuthRoute>
                                <ExchangeItemPost />
                              </LocalAuthRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/exchange/offer/:id"
                          element={
                            <MainLayout>
                              <LocalAuthRoute>
                                <ExchangeOfferPage />
                              </LocalAuthRoute>
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ 6. DETAIL PAGES â€” dynamic :id AFTER all static sub-routes â”€â”€ */}
                        {/* FIX: Detail pages require login + active subscription.
                            SubscriptionRoute: not logged in â†’ /login | logged in no sub â†’ /subscription */}
                        <Route
                          path="/jobs/:id"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <JobDetails />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/marketplace/:id"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <MarketplaceItemDetails />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/services/:id"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <ServiceDetails />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/rentals/:id"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <RentalDetails />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/vehicles/:id"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <VehicleDetails />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/exchange/:id"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <ExchangeItemDetails />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ 7. USER PAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/profile"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        {/* FIX #3: Cart & Notifications require login + active subscription */}
                        <Route
                          path="/cart"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <Cart />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/favorites"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <Favorites />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <Notifications />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/alerts"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <AlertsPage />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/orders"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <Orders />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/orders/:id"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <OrderTracking />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />

                        {/* FIX Issue #32: /settings now has its own page, not just /profile */}
                        <Route
                          path="/settings"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <UserSettings />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/settings/notifications"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <UserSettings />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/settings/privacy"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <UserSettings />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/settings/security"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <UserSettings />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />

                        {/* FIX Issue #33: Edit & Draft routes (new) */}
                        <Route
                          path="/marketplace/edit/:id"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <EditMarketplaceListing />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/jobs/edit/:id"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <EditJobListing />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/services/edit/:id"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <EditServiceListing />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/marketplace/drafts"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <MarketplaceDrafts />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />

                        <Route
                          path="/subscription"
                          element={
                            <MainLayout>
                              <SubscriptionPlans />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/zerm/purchase"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <ZermPurchase />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/coins"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <CoinsPage />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        {/* FIX Issue #26: Coins audit trail + transfer (new) */}
                        <Route
                          path="/coins/history"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <CoinsHistory />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/coins/transfer"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <CoinsTransfer />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ 9. VENDOR PUBLIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/vendor"
                          element={<Navigate to="/vendor/home" replace />}
                        />
                        <Route
                          path="/vendor/portal"
                          element={
                            <VendorLayout>
                              <VendorPortal />
                            </VendorLayout>
                          }
                        />
                        <Route
                          path="/vendor/home"
                          element={
                            <VendorLayout>
                              <VendorHome />
                            </VendorLayout>
                          }
                        />
                        <Route
                          path="/vendor/signin"
                          element={
                            <VendorLayout>
                              <VendorSignIn />
                            </VendorLayout>
                          }
                        />
                        <Route
                          path="/vendor/register"
                          element={
                            <VendorLayout>
                              <VendorRegistration />
                            </VendorLayout>
                          }
                        />
                        <Route
                          path="/vendor/auth"
                          element={
                            <VendorLayout>
                              <VendorAuthPage />
                            </VendorLayout>
                          }
                        />
                        <Route
                          path="/vendor/subscription-plans"
                          element={
                            <VendorLayout>
                              <VendorSubscriptionPlans />
                            </VendorLayout>
                          }
                        />
                        <Route
                          path="/vendor/subscription-plans-exclusive"
                          element={
                            <VendorLayout>
                              <VendorSubscriptionPlansExclusive />
                            </VendorLayout>
                          }
                        />
                        {/* FIX Issue #23: Public vendor storefront (new) */}
                        <Route
                          path="/vendor/profile/:vendorId"
                          element={
                            <MainLayout>
                              <VendorPublicProfile />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/vendor/plans"
                          element={
                            <Navigate to="/vendor/subscription-plans" replace />
                          }
                        />
                        <Route
                          path="/vendor/pricing"
                          element={
                            <Navigate to="/vendor/subscription-plans" replace />
                          }
                        />
                        <Route
                          path="/vendor/subscribe"
                          element={
                            <Navigate to="/vendor/subscription-plans" replace />
                          }
                        />
                        <Route
                          path="/vendor/secure-dashboard"
                          element={<Navigate to="/vendor/dashboard" replace />}
                        />
                        <Route
                          path="/vendor/subscription-payment"
                          element={
                            <Navigate to="/vendor/subscription" replace />
                          }
                        />
                        <Route
                          path="/vendor/login"
                          element={<Navigate to="/vendor/signin" replace />}
                        />
                        <Route
                          path="/vendorsignin"
                          element={<Navigate to="/vendor/signin" replace />}
                        />
                        <Route
                          path="/vendor-signin"
                          element={<Navigate to="/vendor/signin" replace />}
                        />
                        {/* FIX: /vendor/manage-listings â†’ /vendor/listings (was causing 404) */}
                        <Route
                          path="/vendor/manage-listings"
                          element={<Navigate to="/vendor/listings" replace />}
                        />

                        {/* â”€â”€ 10. VENDOR PROTECTED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/vendor/dashboard"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSecureDashboard />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/analytics"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorAnalyticsEnhanced />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/listings"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorManageListings />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/messages"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorMessagesPage />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/settings"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSettingsComplete />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/profile"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorProfile />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/filter"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorFilter />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/customers"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorCustomers />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/recommendations"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorRecommendations />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/verification"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorVerification />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/notifications"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorNotifications />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/premium-tools"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorPremiumToolsEnhanced />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/subscription"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSubscriptionPayment />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/orders"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorOrders />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/reviews"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorReviews />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/payments"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorPayments />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/payments/withdraw"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorWithdraw />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/products"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorProducts />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/onboarding"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorOnboardingChecklist />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/settings/account"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSettingsAccountProfile />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/settings/store"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSettingsStore />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/settings/notifications"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSettingsNotification />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/settings/payment"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSettingsPayment />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/settings/security"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSettingsSecurity />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/settings/shipping"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSettingsShipping />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/settings/business-hours"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSettingsBusinessHours />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/settings/language"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VendorSettingsLanguage />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/premium/analytics-pro"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <AnalyticsPro />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/premium/featured-listings"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <FeaturedListings />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/premium/bulk-upload"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <BulkUpload />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/premium/priority-support"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <PrioritySupport />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/premium/verified-seller"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <VerifiedSeller />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/premium/auto-messaging"
                          element={
                            <VendorProtectedRoute>
                              <VendorLayout>
                                <AutoMessaging />
                              </VendorLayout>
                            </VendorProtectedRoute>
                          }
                        />

                        {/* â”€â”€ 11. ADMIN â€” 1h TTL, with AdminLayout (fixes BUG #4) â”€â”€ */}
                        <Route
                          path="/admin"
                          element={<Navigate to="/admin/login" replace />}
                        />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        {/* All admin pages share AdminLayout for consistent chrome */}
                        <Route
                          path="/admin/dashboard"
                          element={
                            <AdminRouteWrapper>
                              <AdminDashboard />
                            </AdminRouteWrapper>
                          }
                        />
                        <Route
                          path="/admin/create"
                          element={
                            <AdminRouteWrapper>
                              <CreateAdminPage />
                            </AdminRouteWrapper>
                          }
                        />
                        <Route
                          path="/admin/resolve-dispute"
                          element={
                            <AdminRouteWrapper>
                              <AdminResolveDispute />
                            </AdminRouteWrapper>
                          }
                        />
                        <Route
                          path="/admin/user-management"
                          element={
                            <AdminRouteWrapper>
                              <AdminUserAccountManagement />
                            </AdminRouteWrapper>
                          }
                        />
                        <Route
                          path="/admin/inbox"
                          element={
                            <AdminRouteWrapper>
                              <AdminInbox />
                            </AdminRouteWrapper>
                          }
                        />
                        <Route
                          path="/admin/settings"
                          element={
                            <AdminRouteWrapper>
                              <AdminSettings />
                            </AdminRouteWrapper>
                          }
                        />
                        <Route
                          path="/admin/disputes"
                          element={
                            <AdminRouteWrapper>
                              <AdminDisputeResolution />
                            </AdminRouteWrapper>
                          }
                        />
                        <Route
                          path="/admin/live-chat"
                          element={
                            <AdminRouteWrapper>
                              <AdminLiveChat />
                            </AdminRouteWrapper>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <AdminRouteWrapper>
                              <AdminUserManagement />
                            </AdminRouteWrapper>
                          }
                        />

                        {/* â”€â”€ 12. HELP CENTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/help"
                          element={
                            <MainLayout>
                              <Help />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/contact"
                          element={
                            <MainLayout>
                              <ContactSupport />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/guides"
                          element={
                            <MainLayout>
                              <HelpGuides />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/video-tutorials"
                          element={
                            <MainLayout>
                              <VideoTutorials />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/getting-started"
                          element={
                            <MainLayout>
                              <GettingStarted />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/creating-account"
                          element={
                            <MainLayout>
                              <CreatingAccount />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/profile-setup"
                          element={
                            <MainLayout>
                              <ProfileSetup />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/understanding-zerm-coins"
                          element={
                            <MainLayout>
                              <UnderstandingZermCoins />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/buying-selling"
                          element={
                            <MainLayout>
                              <BuyingSelling />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/how-to-post-ad"
                          element={
                            <MainLayout>
                              <HowToPostAd />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/setting-right-price"
                          element={
                            <MainLayout>
                              <SettingRightPrice />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/payment-methods"
                          element={
                            <MainLayout>
                              <PaymentMethods />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/safety-security"
                          element={
                            <MainLayout>
                              <SafetySecurity />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/avoiding-scams"
                          element={
                            <MainLayout>
                              <AvoidingScams />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/meeting-safely"
                          element={
                            <MainLayout>
                              <MeetingSafely />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/help/reporting-issues"
                          element={
                            <MainLayout>
                              <ReportingIssues />
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ 13. OTHER / GENERAL PAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/about"
                          element={
                            <MainLayout>
                              <About />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/privacy-policy"
                          element={
                            <MainLayout>
                              <PrivacyPolicy />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/privacy"
                          element={<Navigate to="/privacy-policy" replace />}
                        />
                        {/* FIX Issue #23: Terms of Service route (new, legally required) */}
                        <Route
                          path="/terms-of-service"
                          element={
                            <MainLayout>
                              <TermsOfService />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/donate"
                          element={
                            <MainLayout>
                              <DonatePremium />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/referral"
                          element={
                            <MainLayout>
                              <ReferralProgram />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/report-issue"
                          element={
                            <MainLayout>
                              <ReportIssuePage />
                            </MainLayout>
                          }
                        />
                        {/* FIX BUG #6: Duplicate tracking routes â€” canonical is /tracking */}
                        <Route
                          path="/tracking"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <OrderTracking />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/track-orders"
                          element={<Navigate to="/tracking" replace />}
                        />
                        {/* Redirect /order-tracking (old import) to /tracking */}
                        <Route
                          path="/order-tracking"
                          element={<Navigate to="/tracking" replace />}
                        />
                        <Route
                          path="/chat"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <Chat />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/search"
                          element={
                            <MainLayout>
                              <SearchResults />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/saved-searches"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <SavedSearches />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ 14. PAYMENT (NotchPay) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/payment/checkout"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <PaymentCheckout />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        {/* FIX ROUTE #22: Callback now protected â€” server validates signature */}
                        <Route
                          path="/payment/callback"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <PaymentCallback />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        {/* FIX Issue #25: Pending route (MTN/Orange Money can pend for minutes) */}
                        <Route
                          path="/payment/pending"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <PaymentPending />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/payment/success"
                          element={
                            <MainLayout>
                              <PaymentSuccess />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/payment/failed"
                          element={
                            <MainLayout>
                              <PaymentFailed />
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ 15. REDIRECTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="/sell-item"
                          element={<Navigate to="/marketplace/sell" replace />}
                        />
                        <Route
                          path="/post-job"
                          element={<Navigate to="/jobs/post" replace />}
                        />

                        {/* â”€â”€ 16.  FEATURES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route path="/splash" element={<SplashScreenPage />} />
                        <Route
                          path="/spotlight"
                          element={
                            <MainLayout>
                              <HeavyLiftSpotlight />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/escrow"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <EscrowPage />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/escrow/:orderId"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <EscrowPage />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/seller/:sellerId/rating"
                          element={
                            <MainLayout>
                              <SellerRatingPage />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/offline-mode"
                          element={
                            <MainLayout>
                              <OfflineModePage />
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/meet-safely"
                          element={
                            <MainLayout>
                              <MeetSafelyPage />
                            </MainLayout>
                          }
                        />
                        {/* FIX #3: Community, FarmFresh, Tontine, Compare, GroupBuyingDetail require subscription */}
                        <Route
                          path="/community"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <CommunityPage />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/community/:id"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <CommunityDetail />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/tontine"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <TontinePage />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        {/* FIX Issue #27: Tontine sub-routes (new) */}
                        <Route
                          path="/tontine/create"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <TontineCreate />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/tontine/:id"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <TontineDetail />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/farm-fresh"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <FarmFreshPage />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/farm-fresh/order/:productId"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <FarmFreshOrderPage />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/farm-fresh/sell"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <FarmFreshSellerPage />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/make-offer/:listingId"
                          element={
                            <MainLayout>
                              <ProtectedRoute>
                                <MakeOfferPage />
                              </ProtectedRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/compare"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <ComparisonTool />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/group-buying/:id"
                          element={
                            <MainLayout>
                              <SubscriptionRoute>
                                <GroupBuyingDetail />
                              </SubscriptionRoute>
                            </MainLayout>
                          }
                        />

                        {/* â”€â”€ 17. 404 (extracted component â€” fixes BUG #7) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <Route
                          path="*"
                          element={
                            <MainLayout>
                              <NotFoundPage />
                            </MainLayout>
                          }
                        />
                      </Routes>

                      <RouteAwareWidgets />
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
} // FIX #15 â€” closing brace for App() function restored



