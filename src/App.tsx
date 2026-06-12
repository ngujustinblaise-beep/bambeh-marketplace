import "@/lib/net-interceptor";
/**
 * App.tsx — Bambeh Online Marketplace
 * © 2026 BAMBEH SARL. All rights reserved.
 * support@bambeh.com | bambeh.com
 *
 * FIXED: Removed // @ts-nocheck directive.
 * All previously suppressed type issues have been resolved inline.
 * UPDATED: CamPay payment integration, CartProvider, LocationFilter,
 *          DonateButton, BAMBEH SARL branding, nav.message bug fix,
 *          share banner restricted to home page only.
 */

// ─── 1. React Core ────────────────────────────────────────────────────────────
import React, { Suspense, lazy, useEffect } from "react";

// ─── 1b. TanStack Query (React Query v5) ──────────────────────────────────────
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";

// ─── 1c. Per-Route Error Boundary ─────────────────────────────────────────────
import { RouteErrorBoundary } from "@/components/app/RouteErrorBoundary";

// ─── 2. Third-Party Libraries ─────────────────────────────────────────────────
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";
import AuthGate from "@/components/security/AuthGate";
import { NavigationService } from "@/utils/auth/safeRedirect";
import { logger, logDevBanner } from "@/utils/logger";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

// ─── 3. Internal Utils / Services ─────────────────────────────────────────────
import { initializeAnalytics } from "@/utils/analytics/AnalyticsInit";

// ─── 3b. BAMBEH SARL — CamPay & Cart Integration ─────────────────────────────
import { CartProvider } from "@/components/CartDrawer";
import { CartDrawer }   from "@/components/CartDrawer";
import { DonateButton } from "@/components/DonateButton";

// ─── 4. Internal Components ───────────────────────────────────────────────────
import {
  AppErrorBoundary,
  RouteTracker,
  PerformanceMonitor
} from "@/components/app/AppEnhancers";
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

// ─── 5. Internal Providers ────────────────────────────────────────────────────
import AppProviders from "@/providers/AppProviders";

// ─── 6. Layouts (Eager — used on nearly every route) ─────────────────────────
import MainLayout from "@/components/layout/MainLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import VendorLayout from "@/components/layout/VendorLayout";

// ─── 7. Eager Page Imports (first-screen only) ────────────────────────────────
import LanguageSelection from "@/pages/LanguageSelection";
import TermsAcceptance from "@/pages/TermsAcceptance";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// ─── 8. Lazy Page Imports ─────────────────────────────────────────────────────
// AUTH
const ForgotPassword    = lazy(() => import("@/pages/auth/ForgotPassword"));
const ForgotCredentials = lazy(() => import("@/pages/auth/ForgotCredentials"));

// CORE MARKETPLACE
const Home            = lazy(() => import("@/pages/Home"));
const Jobs            = lazy(() => import("@/pages/Jobs"));
const Marketplace     = lazy(() => import("@/pages/Marketplace"));
const Services        = lazy(() => import("@/pages/Services"));
const Rentals         = lazy(() => import("@/pages/Rentals"));
const VehicleRentals  = lazy(() => import("@/pages/VehicleRentals"));
const Exchange        = lazy(() => import("@/pages/Exchange"));
const FlashDeals      = lazy(() => import("@/pages/FlashDeals"));
const GroupBuying     = lazy(() => import("@/pages/GroupBuying"));
const BambehAIChatbot = lazy(() => import("@/pages/BambehAIChatbot"));

// DETAIL PAGES
const JobDetails              = lazy(() => import("@/pages/JobDetails"));
const MarketplaceItemDetails  = lazy(() => import("@/pages/MarketplaceItemDetails"));
const ServiceDetails          = lazy(() => import("@/pages/ServiceDetails"));
const RentalDetails           = lazy(() => import("@/pages/RentalDetails"));
const VehicleDetails          = lazy(() => import("@/pages/VehicleDetails"));
const ExchangeItemDetails     = lazy(() => import("@/pages/ExchangeItemDetails"));
const ExchangeItemPost        = lazy(() => import("@/pages/ExchangeItemPost"));
const ExchangeOfferPage       = lazy(() => import("@/pages/ExchangeOfferPage"));

// USER PAGES
const Profile       = lazy(() => import("@/pages/Profile"));
const Cart          = lazy(() => import("@/pages/Cart"));
const Favorites     = lazy(() => import("@/pages/Favorites"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const AlertsPage    = lazy(() => import("@/pages/AlertsPage"));
const Orders        = lazy(() => import("@/pages/Orders"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));

// SETTINGS
const UserSettings = lazy(() => import("@/pages/settings/UserSettings"));

// POSTING FORMS
const PostJobPage              = lazy(() => import("@/pages/PostJobPage"));
const PostMarketplaceItemPage  = lazy(() => import("@/pages/PostMarketplaceItemPage"));
const OfferService             = lazy(() => import("@/pages/OfferService"));
const ListProperty             = lazy(() => import("@/pages/ListProperty"));
const SellVehicle              = lazy(() => import("@/pages/SellVehicle"));
const PostAd                   = lazy(() => import("@/pages/PostAd"));

// LISTING EDIT FORMS
const EditMarketplaceListing = lazy(() => import("@/pages/EditMarketplaceListing"));
const EditJobListing         = lazy(() => import("@/pages/EditJobListing"));
const EditServiceListing     = lazy(() => import("@/pages/EditServiceListing"));
const MarketplaceDrafts      = lazy(() => import("@/pages/MarketplaceDrafts"));

// CATEGORY PAGES
const MarketplaceCategory = lazy(() => import("@/pages/MarketplaceCategory"));
const JobsCategory        = lazy(() => import("@/pages/JobsCategory"));

// SUBSCRIPTION / ZERM
const SubscriptionPlans = lazy(() => import("@/pages/SubscriptionPlans"));
const ZermPurchase      = lazy(() => import("@/pages/ZermPurchase"));
const CoinsPage         = lazy(() => import("@/pages/CoinsPage"));
const CoinsHistory      = lazy(() => import("@/pages/CoinsHistory"));
const CoinsTransfer     = lazy(() => import("@/pages/CoinsTransfer"));

// GENERAL PAGES
const About           = lazy(() => import("@/pages/About"));
const PrivacyPolicy   = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService  = lazy(() => import("@/pages/TermsOfService"));
const DonatePremium   = lazy(() => import("@/pages/DonatePremium"));
const ReferralProgram = lazy(() => import("@/pages/ReferralProgram"));
const Chat            = lazy(() => import("@/pages/Chat"));
const SearchResults   = lazy(() => import("@/pages/SearchResults"));
const SavedSearches   = lazy(() => import("@/pages/SavedSearches"));
const ReportIssuePage = lazy(() => import("@/pages/ReportIssuePage"));

// 404
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// VENDOR PAGES
const VendorPortal                    = lazy(() => import("@/pages/vendor/VendorPortal"));
const VendorHome                      = lazy(() => import("@/pages/vendor/VendorHome"));
const VendorSignIn                    = lazy(() => import("@/pages/vendor/VendorSignIn"));
const VendorRegistration              = lazy(() => import("@/pages/vendor/VendorRegistration"));
const VendorAuthPage                  = lazy(() => import("@/pages/vendor/VendorAuthPage"));
const VendorSubscriptionPlans         = lazy(() => import("@/pages/vendor/VendorSubscriptionPlans"));
const VendorSubscriptionPlansExclusive = lazy(() => import("@/pages/vendor/VendorSubscriptionPlansExclusive"));
const VendorSecureDashboard           = lazy(() => import("@/pages/vendor/VendorSecureDashboard"));
const VendorAnalyticsEnhanced         = lazy(() => import("@/pages/vendor/VendorAnalyticsEnhanced"));
const VendorManageListings            = lazy(() => import("@/pages/vendor/VendorManageListings"));
const VendorMessagesPage              = lazy(() => import("@/pages/vendor/VendorMessagesPage"));
const VendorSettingsComplete          = lazy(() => import("@/pages/vendor/VendorSettingsComplete"));
const VendorProfile                   = lazy(() => import("@/pages/vendor/VendorProfile"));
const VendorFilter                    = lazy(() => import("@/pages/vendor/VendorFilter"));
const VendorCustomers                 = lazy(() => import("@/pages/vendor/VendorCustomers"));
const VendorRecommendations           = lazy(() => import("@/pages/vendor/VendorRecommendations"));
const VendorVerification              = lazy(() => import("@/pages/vendor/VendorVerification"));
const VendorNotifications             = lazy(() => import("@/pages/vendor/VendorNotifications"));
const VendorPremiumToolsEnhanced      = lazy(() => import("@/pages/vendor/VendorPremiumToolsEnhanced"));
const VendorSubscriptionPayment       = lazy(() => import("@/pages/vendor/VendorSubscriptionPayment"));
const VendorOrders                    = lazy(() => import("@/pages/vendor/VendorOrders"));
const VendorReviews                   = lazy(() => import("@/pages/vendor/VendorReviews"));
const VendorPayments                  = lazy(() => import("@/pages/vendor/VendorPayments"));
const VendorWithdraw                  = lazy(() => import("@/pages/vendor/VendorWithdraw"));
const VendorProducts                  = lazy(() => import("@/pages/vendor/VendorProducts"));
const VendorOnboardingChecklist       = lazy(() => import("@/pages/vendor/VendorOnboardingChecklist"));
const VendorSettingsAccountProfile    = lazy(() => import("@/pages/vendor/settings/VendorSettingsAccountProfile"));
const VendorSettingsStore             = lazy(() => import("@/pages/vendor/settings/VendorSettingsStore"));
const VendorSettingsNotification      = lazy(() => import("@/pages/vendor/settings/VendorSettingsNotification"));
const VendorSettingsPayment           = lazy(() => import("@/pages/vendor/settings/VendorSettingsPayment"));
const VendorSettingsSecurity          = lazy(() => import("@/pages/vendor/settings/VendorSettingsSecurity"));
const VendorSettingsShipping          = lazy(() => import("@/pages/vendor/settings/VendorSettingsShipping"));
const VendorSettingsBusinessHours     = lazy(() => import("@/pages/vendor/settings/VendorSettingsBusinessHours"));
const VendorSettingsLanguage          = lazy(() => import("@/pages/vendor/settings/VendorSettingsLanguage"));
const AnalyticsPro                    = lazy(() => import("@/pages/vendor/premium/AnalyticsPro"));
const FeaturedListings                = lazy(() => import("@/pages/vendor/premium/FeaturedListings"));
const BulkUpload                      = lazy(() => import("@/pages/vendor/premium/BulkUpload"));
const PrioritySupport                 = lazy(() => import("@/pages/vendor/premium/PrioritySupport"));
const VerifiedSeller                  = lazy(() => import("@/pages/vendor/premium/VerifiedSeller"));
const AutoMessaging                   = lazy(() => import("@/pages/vendor/premium/AutoMessaging"));
const VendorPublicProfile             = lazy(() => import("@/pages/vendor/VendorPublicProfile"));

// ADMIN PAGES
const AdminLogin                  = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard              = lazy(() => import("@/pages/admin/AdminDashboard"));
const CreateAdminPage             = lazy(() => import("@/pages/admin/CreateAdminPage"));
const AdminInbox                  = lazy(() => import("@/pages/admin/AdminInbox"));
const AdminSettings               = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminDisputeResolution      = lazy(() => import("@/pages/admin/AdminDisputeResolution"));
const AdminLiveChat               = lazy(() => import("@/pages/admin/AdminLiveChat"));
const AdminUserManagement         = lazy(() => import("@/pages/admin/AdminUserManagement"));
const AdminResolveDispute         = lazy(() => import("@/pages/admin/AdminResolveDispute"));
const AdminUserAccountManagement  = lazy(() => import("@/pages/admin/AdminUserAccountManagement"));

// HELP CENTER
const Help                    = lazy(() => import("@/pages/help/Help"));
const HelpGuides              = lazy(() => import("@/pages/help/HelpGuides"));
const VideoTutorials          = lazy(() => import("@/pages/help/VideoTutorials"));
const GettingStarted          = lazy(() => import("@/pages/help/GettingStarted"));
const CreatingAccount         = lazy(() => import("@/pages/help/CreatingAccount"));
const ProfileSetup            = lazy(() => import("@/pages/help/ProfileSetup"));
const UnderstandingZermCoins  = lazy(() => import("@/pages/help/UnderstandingZermCoins"));
const BuyingSelling           = lazy(() => import("@/pages/help/BuyingSelling"));
const HowToPostAd             = lazy(() => import("@/pages/help/HowToPostAd"));
const SettingRightPrice       = lazy(() => import("@/pages/help/SettingRightPrice"));
const PaymentMethods          = lazy(() => import("@/pages/help/PaymentMethods"));
const SafetySecurity          = lazy(() => import("@/pages/help/SafetySecurity"));
const AvoidingScams           = lazy(() => import("@/pages/help/AvoidingScams"));
const MeetingSafely           = lazy(() => import("@/pages/help/MeetingSafely"));
const ReportingIssues         = lazy(() => import("@/pages/help/ReportingIssues"));
const ContactSupport          = lazy(() => import("@/pages/help/ContactSupport"));

// BAMBEH FEATURES
const EscrowPage          = lazy(() => import("@/pages/EscrowPage"));
const SellerRatingPage    = lazy(() => import("@/pages/SellerRatingPage"));
const OfflineModePage     = lazy(() => import("@/pages/OfflineModePage"));
const MeetSafelyPage      = lazy(() => import("@/pages/MeetSafelyPage"));
const CommunityPage       = lazy(() => import("@/pages/CommunityPage"));
const CommunityDetail     = lazy(() => import("@/pages/CommunityDetail"));
const TontinePage         = lazy(() => import("@/pages/TontinePage"));
const TontineDetail       = lazy(() => import("@/pages/TontineDetail"));
const TontineCreate       = lazy(() => import("@/pages/TontineCreate"));
const FarmFreshPage       = lazy(() => import("@/pages/FarmFreshPage"));
const FarmFreshDetail     = lazy(() => import("@/pages/FarmFreshDetail"));
const FarmFreshOrderPage  = lazy(() => import("@/pages/FarmFreshOrderPage"));
const FarmFreshSellerPage = lazy(() => import("@/pages/FarmFreshSellerPage"));
const MakeOfferPage       = lazy(() => import("@/pages/MakeOfferPage"));
const ComparisonTool      = lazy(() => import("@/pages/ComparisonTool"));
const SplashScreenPage    = lazy(() => import("@/pages/SplashScreen"));
const GroupBuyingDetail   = lazy(() => import("@/pages/GroupBuyingDetail"));
const BambehWelcomeScreen = lazy(() => import("@/pages/BambehWelcomeScreen"));
const HeavyLiftSpotlight  = lazy(() => import("@/pages/HeavyLiftSpotlight"));

// PAYMENT (CamPay via Bambeh Payment Server)
const PaymentCheckout = lazy(() => import("@/pages/payment/PaymentCheckout"));
const PaymentCallback = lazy(() => import("@/pages/payment/PaymentCallback"));
const PaymentPending  = lazy(() => import("@/pages/payment/PaymentPending"));
const PaymentSuccess  = lazy(() => import("@/pages/payment/PaymentSuccess"));
const PaymentFailed   = lazy(() => import("@/pages/payment/PaymentFailed"));

// ─── 9. Inline Components ─────────────────────────────────────────────────────

// ── BackToTopButton ──────────────────────────────────────────────────────────
const BackToTopButton = React.memo(function BackToTopButton() {
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9996] px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white flex items-center gap-2 shadow-lg shadow-teal-500/40 hover:from-teal-400 hover:to-teal-600 hover:-translate-y-1 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 text-sm font-semibold"
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
});

// ── RouteAwareWidgets ────────────────────────────────────────────────────────
const WIDGET_HIDDEN_PATHS = ["/language", "/terms-acceptance"];

// Share banner shows ONLY on home page to avoid covering content on other pages
const HOME_PATHS = ["/", "/home"];

const RouteAwareWidgets = React.memo(function RouteAwareWidgets() {
  const location = useLocation();
  const hidden = WIDGET_HIDDEN_PATHS.some((p) => location.pathname === p);
  if (hidden) return null;
  return (
    <>
      <MovableChatWidget defaultPosition="bottom-right" />
      <MovableVoiceControl />
      <MonthlyFeedbackBanner />
      <BackToTopButton />
      {/* CartDrawer is always available throughout the app */}
      <CartDrawer />
    </>
  );
});

// ── LoadingFallback ──────────────────────────────────────────────────────────
const LoadingFallback = React.memo(function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top brand bar */}
      <div className="bg-teal-600 h-14 w-full flex items-center px-4">
        <div className="h-6 w-28 bg-teal-500 rounded animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-teal-100 dark:bg-teal-900 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-2 flex items-center justify-center gap-2">
        <div className="h-4 w-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
        <span className="text-xs text-teal-600 font-medium animate-pulse">
          Bambeh Online Marketplace
        </span>
      </div>
    </div>
  );
});

// ── OnboardingFlowGuard ──────────────────────────────────────────────────────
// FIX: guardPassed initialised to `true` directly — eliminates the one-tick
// LoadingFallback flash that occurred when it was initialised to `false`.
// The useEffect was only setting it to true immediately anyway; removing it
// is correct and has no behavioural side-effects.
const OnboardingFlowGuard = React.memo(function OnboardingFlowGuard({
  children
}: { children: React.ReactNode }) {
  const location = useLocation();

  // FIX: Expanded publicPrefixes to include all legitimately public pages.
  // Previously, routes like /about, /search, /seller/*, /spotlight, etc. were
  // missing — causing first-time users to be bounced to /language when
  // browsing public content before completing onboarding.
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
    // Additional public routes:
    "/search",
    "/seller",
    "/offline-mode",
    "/meet-safely",
    "/marketplace",
    "/jobs",
    "/services",
    "/rentals",
    "/vehicles",
    "/exchange",
    "/subscription",
    "/referral",
    "/donate",
    "/farm-fresh",
  ];

  const isPublic = publicPrefixes.some((p) => location.pathname.startsWith(p));

  if (!isPublic) {
    const hasLang    = localStorage.getItem("Bambeh_language");
    const hasTerms   = localStorage.getItem("Bambeh_terms_accepted");
    // FIX: Read from localStorage (not sessionStorage) to match WelcomeWrapper.
    const hasWelcome = localStorage.getItem("Bambeh_welcome_shown");

    if (!hasLang && location.pathname !== "/language") {
      return <Navigate to="/language" replace />;
    }
    if (hasLang && !hasTerms && location.pathname !== "/terms-acceptance") {
      return <Navigate to="/terms-acceptance" replace />;
    }
    if (hasLang && hasTerms && !hasWelcome && location.pathname !== "/welcome") {
      return <Navigate to="/welcome" replace />;
    }
  }

  return <>{children}</>;
});

// ── AppInner ─────────────────────────────────────────────────────────────────
// Thin wrapper rendered INSIDE AppProviders so hooks that need context are safe.
function AppInner() {
  useMonthlyFeedback();
  return null;
}

// ─── CAPACITOR INIT ───────────────────────────────────────────────────────────
const initializeCapacitor = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#0d9488" });
    }
  } catch (e) {
    logger.warn("StatusBar init failed:", e);
  }

  try {
    await SplashScreen.hide();
  } catch (e) {
    logger.warn("SplashScreen hide failed:", e);
  }

  try {
    // Routes where the Android back button must be suppressed to prevent
    // double-payment or broken payment state.
    const BACK_LOCKED_ROUTES = [
      "/payment/checkout",
      "/payment/pending",
      "/payment/callback",
    ];

    CapacitorApp.addListener("backButton", ({ canGoBack }: { canGoBack: boolean }) => {
      const currentHash = window.location.hash.slice(1); // strip leading #
      const isPaymentRoute = BACK_LOCKED_ROUTES.some(r => currentHash.startsWith(r));

      if (isPaymentRoute) {
        // Silently suppress back during active payment to prevent double-submission
        logger.log("Back button suppressed during payment flow");
        return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });
  } catch (e) {
    logger.warn("BackButton listener failed:", e);
  }

  // FIX: NotchPay deep link handler — HashRouter stores routes in url.hash,
  // NOT url.pathname. Reading pathname always returns "/" with HashRouter.
  try {
    CapacitorApp.addListener("appUrlOpen", (event: { url: string }) => {
      logger.log("Deep link received:", event.url);
      try {
        const url = new URL(event.url);

        let path   = "/";
        let search = "";

        if (url.hash && url.hash.startsWith("#/")) {
          // Standard HashRouter deep link: bambeh.app/#/payment/callback?ref=abc
          const hashContent = url.hash.slice(1); // strip leading #
          const qIndex = hashContent.indexOf("?");
          if (qIndex !== -1) {
            path   = hashContent.slice(0, qIndex);
            search = hashContent.slice(qIndex);
          } else {
            path = hashContent;
          }
        } else if (url.pathname && url.pathname !== "/") {
          // Custom scheme fallback: bambeh://payment/callback
          path   = url.pathname;
          search = url.search;
        }

        if (path.startsWith("/payment")) {
          NavigationService.navigate(path + search, { replace: true });
          return;
        }
        if (path && path !== "/") {
          NavigationService.navigate(path + search, { replace: false });
          return;
        }
        NavigationService.navigate("/", { replace: true });
      } catch (parseError) {
        logger.warn("Deep link URL parse failed:", parseError);
        NavigationService.navigate("/", { replace: true });
      }
    });
  } catch (e) {
    logger.warn("Deep link handler failed:", e);
  }
};

// ── WelcomeWrapper ───────────────────────────────────────────────────────────
const WelcomeWrapper = React.memo(function WelcomeWrapper() {
  useEffect(() => {
    // FIX: Use localStorage (not sessionStorage) so the welcome screen is not
    // re-shown when Android kills and restores the WebView background session.
    localStorage.setItem("Bambeh_welcome_shown", "true");
  }, []);
  return <BambehWelcomeScreen />;
});

// ── AdminRouteWrapper ────────────────────────────────────────────────────────
const AdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children
}) => (
  <AuthGate require="admin">
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </AuthGate>
);

// ── NavigationBridge ─────────────────────────────────────────────────────────
function NavigationBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    NavigationService.register(navigate);
    // FIX: Do NOT pass null on cleanup. If NavigationBridge ever remounts
    // (HMR, React StrictMode double-invoke) the cleanup would null-out the
    // service just as the new mount re-registers — creating a window where
    // a Capacitor deep link fires null() and crashes.
    // The new mount's register() call is sufficient to keep the ref fresh.
    return () => {
      // intentionally empty — re-mount handles re-registration
    };
  }, [navigate]);
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {

  useEffect(() => {
    // One-time migration: remove the old chat widget position key only if it
    // still exists. After all users have been migrated this is a no-op.
    if (localStorage.getItem('Bambeh_chat_position')) {
      localStorage.removeItem('Bambeh_chat_position');
    }
    initializeCapacitor();
    initializeAnalytics();
    logDevBanner();
  }, []);

  return (
    <React.StrictMode>
      <AppErrorBoundary>
        <PerformanceMonitor>
          <QueryClientProvider client={queryClient}>
            {/* CartProvider wraps entire app so cart is accessible from any page */}
            <CartProvider>
            <AppProviders>
              <AppInner />
              <NetworkProvider>
              <HashRouter>
                <NavigationBridge />
                <ScrollToTop />
                <NetworkStatusBar />
                <SecurityInitializer />
                <RouteTracker>
                  <OnboardingFlowGuard>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>

                        {/* ── 1. ONBOARDING ──────────────────────────────────────── */}
                        <Route path="/welcome" element={<WelcomeWrapper />} />
                        <Route path="/language" element={<LanguageSelection />} />
                        <Route path="/terms-acceptance" element={<TermsAcceptance />} />

                        {/* ── 2. AUTH ─────────────────────────────────────────────── */}
                        <Route
                          path="/login"
                          element={<AuthLayout><Login /></AuthLayout>}
                        />
                        <Route
                          path="/register"
                          element={<AuthLayout><Register /></AuthLayout>}
                        />
                        <Route
                          path="/forgot-password"
                          element={<AuthLayout><ForgotPassword /></AuthLayout>}
                        />
                        <Route
                          path="/forgot-credentials"
                          element={<AuthLayout><ForgotCredentials /></AuthLayout>}
                        />

                        {/* ── 3. PUBLIC MARKETPLACE ──────────────────────────────── */}
                        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                        <Route path="/home" element={<Navigate to="/" replace />} />
                        <Route path="/jobs" element={<MainLayout><Jobs /></MainLayout>} />
                        <Route path="/marketplace" element={<MainLayout><Marketplace /></MainLayout>} />
                        <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
                        <Route path="/rentals" element={<MainLayout><Rentals /></MainLayout>} />
                        <Route path="/vehicles" element={<MainLayout><VehicleRentals /></MainLayout>} />
                        <Route path="/exchange" element={<MainLayout><Exchange /></MainLayout>} />

                        <Route
                          path="/deals"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription">
                                <FlashDeals />
                              </AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route path="/flash-deals" element={<Navigate to="/deals" replace />} />

                        <Route
                          path="/group-buying"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription">
                                <GroupBuying />
                              </AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/ai-chat"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription">
                                <BambehAIChatbot />
                              </AuthGate>
                            </MainLayout>
                          }
                        />

                        {/* ── 4. CATEGORY PAGES ─────────────────────────────────── */}
                        <Route
                          path="/marketplace/category/:category"
                          element={<MainLayout><MarketplaceCategory /></MainLayout>}
                        />
                        <Route
                          path="/jobs/category/:category"
                          element={<MainLayout><JobsCategory /></MainLayout>}
                        />

                        {/* ── 5. STATIC SUB-ROUTES — must come BEFORE dynamic :id routes ── */}
                        <Route
                          path="/jobs/post"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><PostJobPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/marketplace/sell"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><PostMarketplaceItemPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/services/offer"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><OfferService /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route path="/services/post" element={<Navigate to="/services/offer" replace />} />
                        <Route path="/offer-service" element={<Navigate to="/services/offer" replace />} />

                        <Route
                          path="/rentals/list"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><ListProperty /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route path="/rentals/post" element={<Navigate to="/rentals/list" replace />} />
                        <Route path="/list-property" element={<Navigate to="/rentals/list" replace />} />

                        <Route
                          path="/vehicles/sell"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><SellVehicle /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/post-ad"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><PostAd /></AuthGate>
                            </MainLayout>
                          }
                        />

                        <Route
                          path="/exchange/post"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><ExchangeItemPost /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/exchange/offer/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><ExchangeOfferPage /></AuthGate>
                            </MainLayout>
                          }
                        />

                        {/* ── 6. DETAIL PAGES ── */}
                        <Route
                          path="/jobs/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><JobDetails /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/marketplace/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><MarketplaceItemDetails /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/services/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><ServiceDetails /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/rentals/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><RentalDetails /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/vehicles/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><VehicleDetails /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/exchange/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><ExchangeItemDetails /></AuthGate>
                            </MainLayout>
                          }
                        />

                        {/* ── 7. USER PAGES ──────────────────────────────────────── */}
                        <Route
                          path="/profile"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><Profile /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/cart"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><Cart /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/favorites"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><Favorites /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><Notifications /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/alerts"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><AlertsPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/orders"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><Orders /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/orders/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><OrderTracking /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><UserSettings /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/settings/notifications"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><UserSettings /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/settings/privacy"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><UserSettings /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/settings/security"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><UserSettings /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/marketplace/edit/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><EditMarketplaceListing /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/jobs/edit/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><EditJobListing /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/services/edit/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><EditServiceListing /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/marketplace/drafts"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><MarketplaceDrafts /></AuthGate>
                            </MainLayout>
                          }
                        />

                        {/* ── 8. SUBSCRIPTION / ZERM COINS ──────────────────────── */}
                        <Route
                          path="/subscription"
                          element={<MainLayout><SubscriptionPlans /></MainLayout>}
                        />

                        {/* ── ZERM COINS WALLET ──────────────────────────────────
                         *  AuthGate: "user" (not "subscription") — any logged-in
                         *  user can access their wallet and buy coins.
                         *  /coins/buy   ← primary route (was /zerm/purchase → 404)
                         *  /coins/purchase + /zerm/purchase kept as redirects so
                         *  old links / push notifications still work.
                         * ──────────────────────────────────────────────────────── */}
                        <Route
                          path="/coins"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><CoinsPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/coins/buy"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><ZermPurchase /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/coins/transfer"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><CoinsTransfer /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/coins/history"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><CoinsHistory /></AuthGate>
                            </MainLayout>
                          }
                        />
                        {/* Legacy redirects — keeps old links alive */}
                        <Route path="/coins/purchase"  element={<Navigate to="/coins/buy" replace />} />
                        <Route path="/zerm/purchase"   element={<Navigate to="/coins/buy" replace />} />

                        {/* ── 9. VENDOR PUBLIC ───────────────────────────────────── */}
                        <Route path="/vendor" element={<Navigate to="/vendor/home" replace />} />
                        <Route path="/vendor/portal" element={<VendorLayout><VendorPortal /></VendorLayout>} />
                        <Route path="/vendor/home" element={<VendorLayout><VendorHome /></VendorLayout>} />
                        <Route path="/vendor/signin" element={<VendorLayout><VendorSignIn /></VendorLayout>} />
                        <Route path="/vendor/register" element={<VendorLayout><VendorRegistration /></VendorLayout>} />
                        <Route path="/vendor/auth" element={<VendorLayout><VendorAuthPage /></VendorLayout>} />
                        <Route path="/vendor/subscription-plans" element={<VendorLayout><VendorSubscriptionPlans /></VendorLayout>} />
                        <Route path="/vendor/subscription-plans-exclusive" element={<VendorLayout><VendorSubscriptionPlansExclusive /></VendorLayout>} />
                        <Route path="/vendor/profile/:vendorId" element={<MainLayout><VendorPublicProfile /></MainLayout>} />
                        <Route path="/vendor/plans" element={<Navigate to="/vendor/subscription-plans" replace />} />
                        <Route path="/vendor/pricing" element={<Navigate to="/vendor/subscription-plans" replace />} />
                        <Route path="/vendor/subscribe" element={<Navigate to="/vendor/subscription-plans" replace />} />
                        <Route path="/vendor/secure-dashboard" element={<Navigate to="/vendor/dashboard" replace />} />
                        <Route path="/vendor/subscription-payment" element={<Navigate to="/vendor/subscription" replace />} />
                        <Route path="/vendor/login" element={<Navigate to="/vendor/signin" replace />} />
                        <Route path="/vendorsignin" element={<Navigate to="/vendor/signin" replace />} />
                        <Route path="/vendor-signin" element={<Navigate to="/vendor/signin" replace />} />
                        <Route path="/vendor/manage-listings" element={<Navigate to="/vendor/listings" replace />} />

                        {/* ── 10. VENDOR PROTECTED ───────────────────────────────── */}
                        <Route path="/vendor/dashboard" element={<AuthGate require="vendor"><VendorLayout><VendorSecureDashboard /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/analytics" element={<AuthGate require="vendor"><VendorLayout><VendorAnalyticsEnhanced /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/listings" element={<AuthGate require="vendor"><VendorLayout><VendorManageListings /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/messages" element={<AuthGate require="vendor"><VendorLayout><VendorMessagesPage /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/settings" element={<AuthGate require="vendor"><VendorLayout><VendorSettingsComplete /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/profile" element={<AuthGate require="vendor"><VendorLayout><VendorProfile /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/filter" element={<AuthGate require="vendor"><VendorLayout><VendorFilter /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/customers" element={<AuthGate require="vendor"><VendorLayout><VendorCustomers /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/recommendations" element={<AuthGate require="vendor"><VendorLayout><VendorRecommendations /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/verification" element={<AuthGate require="vendor"><VendorLayout><VendorVerification /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/notifications" element={<AuthGate require="vendor"><VendorLayout><VendorNotifications /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/premium-tools" element={<AuthGate require="vendor"><VendorLayout><VendorPremiumToolsEnhanced /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/subscription" element={<AuthGate require="vendor"><VendorLayout><VendorSubscriptionPayment /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/orders" element={<AuthGate require="vendor"><VendorLayout><VendorOrders /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/reviews" element={<AuthGate require="vendor"><VendorLayout><VendorReviews /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/payments" element={<AuthGate require="vendor"><VendorLayout><VendorPayments /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/payments/withdraw" element={<AuthGate require="vendor"><VendorLayout><VendorWithdraw /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/products" element={<AuthGate require="vendor"><VendorLayout><VendorProducts /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/onboarding" element={<AuthGate require="vendor"><VendorLayout><VendorOnboardingChecklist /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/settings/account" element={<AuthGate require="vendor"><VendorLayout><VendorSettingsAccountProfile /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/settings/store" element={<AuthGate require="vendor"><VendorLayout><VendorSettingsStore /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/settings/notifications" element={<AuthGate require="vendor"><VendorLayout><VendorSettingsNotification /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/settings/payment" element={<AuthGate require="vendor"><VendorLayout><VendorSettingsPayment /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/settings/security" element={<AuthGate require="vendor"><VendorLayout><VendorSettingsSecurity /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/settings/shipping" element={<AuthGate require="vendor"><VendorLayout><VendorSettingsShipping /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/settings/business-hours" element={<AuthGate require="vendor"><VendorLayout><VendorSettingsBusinessHours /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/settings/language" element={<AuthGate require="vendor"><VendorLayout><VendorSettingsLanguage /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/premium/analytics-pro" element={<AuthGate require="vendor"><VendorLayout><AnalyticsPro /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/premium/featured-listings" element={<AuthGate require="vendor"><VendorLayout><FeaturedListings /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/premium/bulk-upload" element={<AuthGate require="vendor"><VendorLayout><BulkUpload /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/premium/priority-support" element={<AuthGate require="vendor"><VendorLayout><PrioritySupport /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/premium/verified-seller" element={<AuthGate require="vendor"><VendorLayout><VerifiedSeller /></VendorLayout></AuthGate>} />
                        <Route path="/vendor/premium/auto-messaging" element={<AuthGate require="vendor"><VendorLayout><AutoMessaging /></VendorLayout></AuthGate>} />

                        {/* ── 11. ADMIN ─────────────────────────────────────────── */}
                        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                        <Route
                          path="/admin/login"
                          element={
                            <Suspense fallback={<LoadingFallback />}>
                              <AdminLogin />
                            </Suspense>
                          }
                        />
                        <Route path="/admin/dashboard" element={<AdminRouteWrapper><AdminDashboard /></AdminRouteWrapper>} />
                        <Route path="/admin/create" element={<AdminRouteWrapper><CreateAdminPage /></AdminRouteWrapper>} />
                        <Route path="/admin/resolve-dispute" element={<AdminRouteWrapper><AdminResolveDispute /></AdminRouteWrapper>} />
                        <Route path="/admin/user-management" element={<AdminRouteWrapper><AdminUserAccountManagement /></AdminRouteWrapper>} />
                        <Route path="/admin/inbox" element={<AdminRouteWrapper><AdminInbox /></AdminRouteWrapper>} />
                        <Route path="/admin/settings" element={<AdminRouteWrapper><AdminSettings /></AdminRouteWrapper>} />
                        <Route path="/admin/disputes" element={<AdminRouteWrapper><AdminDisputeResolution /></AdminRouteWrapper>} />
                        <Route path="/admin/live-chat" element={<AdminRouteWrapper><AdminLiveChat /></AdminRouteWrapper>} />
                        <Route path="/admin/users" element={<AdminRouteWrapper><AdminUserManagement /></AdminRouteWrapper>} />

                        {/* ── 12. HELP CENTER ────────────────────────────────────── */}
                        <Route path="/help" element={<MainLayout><Help /></MainLayout>} />
                        <Route path="/help/contact" element={<MainLayout><ContactSupport /></MainLayout>} />
                        <Route path="/help/guides" element={<MainLayout><HelpGuides /></MainLayout>} />
                        <Route path="/help/video-tutorials" element={<MainLayout><VideoTutorials /></MainLayout>} />
                        <Route path="/help/getting-started" element={<MainLayout><GettingStarted /></MainLayout>} />
                        <Route path="/help/creating-account" element={<MainLayout><CreatingAccount /></MainLayout>} />
                        <Route path="/help/profile-setup" element={<MainLayout><ProfileSetup /></MainLayout>} />
                        <Route path="/help/understanding-zerm-coins" element={<MainLayout><UnderstandingZermCoins /></MainLayout>} />
                        <Route path="/help/buying-selling" element={<MainLayout><BuyingSelling /></MainLayout>} />
                        <Route path="/help/how-to-post-ad" element={<MainLayout><HowToPostAd /></MainLayout>} />
                        <Route path="/help/setting-right-price" element={<MainLayout><SettingRightPrice /></MainLayout>} />
                        <Route path="/help/payment-methods" element={<MainLayout><PaymentMethods /></MainLayout>} />
                        <Route path="/help/safety-security" element={<MainLayout><SafetySecurity /></MainLayout>} />
                        <Route path="/help/avoiding-scams" element={<MainLayout><AvoidingScams /></MainLayout>} />
                        <Route path="/help/meeting-safely" element={<MainLayout><MeetingSafely /></MainLayout>} />
                        <Route path="/help/reporting-issues" element={<MainLayout><ReportingIssues /></MainLayout>} />

                        {/* ── 13. GENERAL PAGES ──────────────────────────────────── */}
                        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
                        <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
                        <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
                        <Route path="/terms-of-service" element={<MainLayout><TermsOfService /></MainLayout>} />
                        <Route path="/donate" element={<MainLayout><DonatePremium /></MainLayout>} />
                        <Route path="/referral" element={<MainLayout><ReferralProgram /></MainLayout>} />
                        <Route path="/report-issue" element={<MainLayout><ReportIssuePage /></MainLayout>} />

                        <Route
                          path="/tracking"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><OrderTracking /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route path="/track-orders" element={<Navigate to="/tracking" replace />} />
                        <Route path="/order-tracking" element={<Navigate to="/tracking" replace />} />

                        <Route
                          path="/chat"
                          element={
                            <MainLayout>
                              <RouteErrorBoundary routeName="Chat">
                                <AuthGate require="subscription"><Chat /></AuthGate>
                              </RouteErrorBoundary>
                            </MainLayout>
                          }
                        />
                        <Route path="/search" element={<MainLayout><SearchResults /></MainLayout>} />
                        <Route
                          path="/saved-searches"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><SavedSearches /></AuthGate>
                            </MainLayout>
                          }
                        />

                        {/* ── 14. PAYMENT (CamPay) ───────────────────────────────── */}
                        <Route
                          path="/payment/checkout"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><PaymentCheckout /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/payment/callback"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><PaymentCallback /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/payment/pending"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><PaymentPending /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/payment/success"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><PaymentSuccess /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/payment/failed"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><PaymentFailed /></AuthGate>
                            </MainLayout>
                          }
                        />

                        {/* ── 15. REDIRECTS ──────────────────────────────────────── */}
                        <Route path="/sell-item" element={<Navigate to="/marketplace/sell" replace />} />
                        <Route path="/post-job" element={<Navigate to="/jobs/post" replace />} />

                        {/* ── 16. BAMBEH FEATURES ────────────────────────────────── */}
                        <Route path="/splash" element={<SplashScreenPage />} />
                        <Route path="/spotlight" element={<MainLayout><HeavyLiftSpotlight /></MainLayout>} />
                        <Route
                          path="/escrow"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><EscrowPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/escrow/:orderId"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><EscrowPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route path="/seller/:sellerId/rating" element={<MainLayout><SellerRatingPage /></MainLayout>} />
                        <Route path="/offline-mode" element={<MainLayout><OfflineModePage /></MainLayout>} />
                        <Route path="/meet-safely" element={<MainLayout><MeetSafelyPage /></MainLayout>} />

                        <Route
                          path="/community"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><CommunityPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/community/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><CommunityDetail /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/tontine"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><TontinePage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/tontine/create"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><TontineCreate /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/tontine/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><TontineDetail /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/farm-fresh"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><FarmFreshPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/farm-fresh/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><FarmFreshDetail /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/farm-fresh/order/:productId"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><FarmFreshOrderPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/farm-fresh/sell"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><FarmFreshSellerPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/make-offer/:listingId"
                          element={
                            <MainLayout>
                              <AuthGate require="user"><MakeOfferPage /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/compare"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><ComparisonTool /></AuthGate>
                            </MainLayout>
                          }
                        />
                        <Route
                          path="/group-buying/:id"
                          element={
                            <MainLayout>
                              <AuthGate require="subscription"><GroupBuyingDetail /></AuthGate>
                            </MainLayout>
                          }
                        />

                        {/* ── 17. 404 ────────────────────────────────────────────── */}
                        <Route
                          path="*"
                          element={<MainLayout><NotFoundPage /></MainLayout>}
                        />

                      </Routes>

                      <RouteAwareWidgets />
                    </Suspense>
                  </OnboardingFlowGuard>
                </RouteTracker>
              </HashRouter>
            </NetworkProvider>
            </AppProviders>
            </CartProvider>
            {import.meta.env.DEV && (
              <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
            )}
          </QueryClientProvider>
        </PerformanceMonitor>
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
