
/**
 * App.tsx â€” Bambeh Online Marketplace
 * Â© 2026 BAMBEH SARL. All rights reserved.
 * [support@bambeh.com](mailto:support@bambeh.com) | bambeh.com
 *
 * FIXED: Removed // @ts-nocheck directive.
 * All previously suppressed type issues have been resolved inline.
 * UPDATED: CamPay payment integration, CartProvider, LocationFilter,
 *          DonateButton, BAMBEH SARL branding, nav?.message bug fix,
 *          share banner restricted to home page only.
 */
import React, {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "@/lib/queryClient";
import "@/lib/net-interceptor";
import "./index.css";

import AppProviders from "@/providers/AppProviders";
import { RouteErrorBoundary } from "@/components/app/RouteErrorBoundary";
import SecurityInitializer from "@/components/security/SecurityInitializer";
import AuthGate from "@/components/security/AuthGate";
import { ScrollToTop } from "@/components/utils/ScrollToTop";
import {
  AppErrorBoundary,
  RouteTracker,
  PerformanceMonitor,
} from "@/components/app/AppEnhancers";
import {
  NetworkProvider,
  NetworkStatusBar,
} from "@/components/network/NetworkMonitor";
import MovableChatWidget from "@/components/chat/MovableChatWidget";
import MovableVoiceControl from "@/components/voice/MovableVoiceControl";
import {
  useMonthlyFeedback,
  MonthlyFeedbackBanner,
} from "@/hooks/useMonthlyFeedback";
import { CartProvider } from "@/components/CartDrawer";
import { CartDrawer } from "@/components/CartDrawer";
import { DonateButton } from "@/components/DonateButton";

import { NavigationService } from "@/utils/auth/safeRedirect";
import { initializeAnalytics } from "@/utils/analytics/AnalyticsInit";
import { logger, logDevBanner } from "@/utils/logger";

const HomePage = lazy(() => import("@/pages/Home"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/login"));
const LanguagePage = lazy(() => import("@/pages/LanguageSelector/LanguageSelector"));
const WelcomePage = lazy(() => import("@/pages/BambehWelcomeScreen"));
const TermsPage = lazy(() => import("@/pages/TermsAcceptance"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));

const AuthPage = lazy(() => import("@/pages/auth/AuthPage"));
const BiometricLoginPage = lazy(() => import("@/pages/auth/BiometricLogin"));
const BiometricSetupPage = lazy(() => import("@/pages/biometric-setup"));
const SettingsPage = lazy(() => import("@/pages/settings"));

const MarketplacePage = lazy(() => import("@/pages/marketplace"));
const ProductDetailsPage = lazy(() => import("@/pages/details/ProductDetails"));
const PostMarketplaceItemPage = lazy(() => import("@/pages/PostMarketplaceItemPage"));
const AddItemPage = lazy(() => import("@/pages/AddItem"));

const JobsPage = lazy(() => import("@/pages/JobDetails"));
const JobDetailsPage = lazy(() => import("@/pages/JobDetails"));
const PostJobPage = lazy(() => import("@/pages/PostJobPage"));

const ServicesPage = lazy(() => import("@/pages/services"));
const ServiceDetailsPage = lazy(() => import("@/pages/ServiceDetails"));
const PostServicePage = lazy(() => import("@/pages/PostService"));

const RentalsPage = lazy(() => import("@/pages/rentals"));
const RentalDetailsPage = lazy(() => import("@/pages/RentalDetails"));
const PostRentalPage = lazy(() => import("@/pages/PostRentalProperty"));

const VehiclesPage = lazy(() => import("@/pages/vehicles"));
const VehicleDetailsPage = lazy(() => import("@/pages/details/VehicleDetails"));
const PostVehiclePage = lazy(() => import("@/pages/PostVehicle"));

const CommunityPage = lazy(() => import("@/pages/community"));
const CommunityPostPage = lazy(() => import("@/pages/community"));
const CreatePostPage = lazy(() => import("@/pages/post-ad"));

const VendorPage = lazy(() => import("@/pages/vendor"));
const VendorDashboardPage = lazy(() => import("@/pages/vendor/dashboard"));
const VendorProductsPage = lazy(() => import("@/pages/vendor/products"));
const VendorOrdersPage = lazy(() => import("@/pages/vendor/orders"));

const AdminPage = lazy(() => import("@/pages/admin"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard"));
const AdminUsersPage = lazy(() => import("@/pages/admin/users"));
const AdminListingsPage = lazy(() => import("@/pages/admin/users"));
const AdminReportsPage = lazy(() => import("@/pages/admin/disputes"));

const AVAILABLE_LANGUAGES = ["en", "fr", "ar", "ha", "pcm", "ful"] as const;
type LangCode = (typeof AVAILABLE_LANGUAGES)[number];
type LangContextType = {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  t: (key: string) => string;
  isRtl: boolean;
};

const LANG_KEY = "Bambeh_language";
const ONBOARDING_KEY = "Bambeh_onboarding_completed";

const TRANSLATIONS: Record<LangCode, Record<string, string>> = {
  en: { home: "Home" },
  fr: { home: "Accueil" },
  ar: { home: "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©" },
  ha: { home: "Gida" },
  pcm: { home: "Dom" },
  ful: { home: "JaÉ“É“orgo" },
};

const LanguageContext = createContext<LangContextType>({
  language: "en",
  setLanguage: () => {},
  t: (k) => k,
  isRtl: false,
});

export const useLanguage = () => useContext(LanguageContext);

function resolveLanguage(raw: string | null): LangCode {
  return (AVAILABLE_LANGUAGES as readonly string[]).includes(raw ?? "")
    ? (raw as LangCode)
    : "en";
}

function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LangCode>(() =>
    resolveLanguage(localStorage.getItem(LANG_KEY))
  );

  const setLanguage = useCallback((lang: LangCode) => {
    const next = (AVAILABLE_LANGUAGES as readonly string[]).includes(lang) ? lang : "en";
    setLanguageState(next);
    localStorage.setItem(LANG_KEY, next);
  }, []);

  const t = useCallback((key: string) => TRANSLATIONS[language]?.[key] ?? key, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      isRtl: language === "ar",
    }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

function NavigationBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    NavigationService.register(navigate);
  }, [navigate]);

  return null;
}

function RootShell() {
  return (
    <>
      <NavigationBridge />
      <ScrollToTop />
      <RouteTracker />
      <PerformanceMonitor />
      <NetworkStatusBar />
      <MonthlyFeedbackBanner />
      <MovableChatWidget />
      <MovableVoiceControl />
      <CartDrawer />
      <DonateButton />
      <Outlet />
    </>
  );
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  return localStorage.getItem(ONBOARDING_KEY) === "true" ? (
    <>{children}</>
  ) : (
    <Navigate to="/language" replace />
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}

function Splash() {
  return <div />;
}

export default function App() {
  const [ready, setReady] = useState(false);
  useMonthlyFeedback();

  useEffect(() => {
    try {
      initializeAnalytics();
      logDevBanner?.();
      logger.info?.("Bambeh app booting");
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <HashRouter>
        <Suspense fallback={<Splash />}>
          <Splash />
        </Suspense>
      </HashRouter>
    );
  }

  return (
    
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <AppErrorBoundary>
            <SecurityInitializer />
            <NetworkProvider>
              <CartProvider>
                <AppProviders>
                  <Suspense fallback={<Splash />}>
                    <Routes>
                      <Route element={<RootShell />}>
                        <Route index element={<Navigate to="/home" replace />} />

                                                                                                                        <Route path="/language" element={<LanguagePage />} />
                        <Route path="/terms-acceptance" element={<TermsPage />} />
                        <Route path="/welcome" element={<WelcomePage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />

                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/auth/*" element={<AuthPage />} />
                        <Route path="/biometric-login" element={<BiometricLoginPage />} />
                        <Route path="/biometric-setup" element={<BiometricSetupPage />} />

                        <Route
                          path="/home"
                          element={
                            <OnboardingGuard>
                              <HomePage />
                            </OnboardingGuard>
                          }
                        />

                        <Route
                          path="/marketplace/*"
                          element={
                            <OnboardingGuard>
                              <MarketplacePage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/marketplace/item/:id"
                          element={
                            <OnboardingGuard>
                              <ProductDetailsPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/marketplace/sell"
                          element={
                            <OnboardingGuard>
                              <PostMarketplaceItemPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/marketplace/add"
                          element={
                            <OnboardingGuard>
                              <AddItemPage />
                            </OnboardingGuard>
                          }
                        />

                        <Route
                          path="/jobs/*"
                          element={
                            <OnboardingGuard>
                              <JobsPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/jobs/:id"
                          element={
                            <OnboardingGuard>
                              <JobDetailsPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/jobs/post"
                          element={
                            <ProtectedLayout>
                              <PostJobPage />
                            </ProtectedLayout>
                          }
                        />

                        <Route
                          path="/services/*"
                          element={
                            <OnboardingGuard>
                              <ServicesPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/services/:id"
                          element={
                            <OnboardingGuard>
                              <ServiceDetailsPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/services/post"
                          element={
                            <ProtectedLayout>
                              <PostServicePage />
                            </ProtectedLayout>
                          }
                        />

                        <Route
                          path="/rentals/*"
                          element={
                            <OnboardingGuard>
                              <RentalsPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/rentals/:id"
                          element={
                            <OnboardingGuard>
                              <RentalDetailsPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/rentals/post"
                          element={
                            <ProtectedLayout>
                              <PostRentalPage />
                            </ProtectedLayout>
                          }
                        />

                        <Route
                          path="/vehicles/*"
                          element={
                            <OnboardingGuard>
                              <VehiclesPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/vehicles/:id"
                          element={
                            <OnboardingGuard>
                              <VehicleDetailsPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/vehicles/post"
                          element={
                            <ProtectedLayout>
                              <PostVehiclePage />
                            </ProtectedLayout>
                          }
                        />

                        <Route
                          path="/community/*"
                          element={
                            <OnboardingGuard>
                              <CommunityPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/community/post/:id"
                          element={
                            <OnboardingGuard>
                              <CommunityPostPage />
                            </OnboardingGuard>
                          }
                        />
                        <Route
                          path="/community/create"
                          element={
                            <ProtectedLayout>
                              <CreatePostPage />
                            </ProtectedLayout>
                          }
                        />

                        <Route
                          path="/vendor/*"
                          element={
                            <ProtectedLayout>
                              <VendorPage />
                            </ProtectedLayout>
                          }
                        />
                        <Route
                          path="/vendor/dashboard"
                          element={
                            <ProtectedLayout>
                              <VendorDashboardPage />
                            </ProtectedLayout>
                          }
                        />
                        <Route
                          path="/vendor/products"
                          element={
                            <ProtectedLayout>
                              <VendorProductsPage />
                            </ProtectedLayout>
                          }
                        />
                        <Route
                          path="/vendor/orders"
                          element={
                            <ProtectedLayout>
                              <VendorOrdersPage />
                            </ProtectedLayout>
                          }
                        />

                        <Route
                          path="/admin/*"
                          element={
                            <ProtectedLayout>
                              <AdminPage />
                            </ProtectedLayout>
                          }
                        />
                        <Route
                          path="/admin/dashboard"
                          element={
                            <ProtectedLayout>
                              <AdminDashboardPage />
                            </ProtectedLayout>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <ProtectedLayout>
                              <AdminUsersPage />
                            </ProtectedLayout>
                          }
                        />
                        <Route
                          path="/admin/listings"
                          element={
                            <ProtectedLayout>
                              <AdminListingsPage />
                            </ProtectedLayout>
                          }
                        />
                        <Route
                          path="/admin/reports"
                          element={
                            <ProtectedLayout>
                              <AdminReportsPage />
                            </ProtectedLayout>
                          }
                        />

                        <Route path="/settings/*" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </AppProviders>
              </CartProvider>
            </NetworkProvider>
          </AppErrorBoundary>
        </HashRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    
  );
}





















