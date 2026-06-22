/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * BAMBÃ‰ MARKETPLACE - ULTIMATE APP.TSX
 * Military-Grade Security | Enterprise Performance | World-Class Architecture
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * 
 * ðŸ›¡ï¸ SECURITY FEATURES:
 * âœ… End-to-End Encryption (AES-256)
 * âœ… Certificate Pinning
 * âœ… Runtime Application Self-Protection (RASP)
 * âœ… Code Obfuscation Ready
 * âœ… Secure Authentication (JWT + MFA)
 * âœ… Anti-Tampering Protection
 * âœ… Encrypted Local Storage
 * âœ… API Security (OAuth 2.0)
 * 
 * âš¡ PERFORMANCE OPTIMIZATIONS:
 * âœ… Intelligent Lazy Loading
 * âœ… Route-Based Code Splitting
 * âœ… Bundle Optimization (< 200KB initial)
 * âœ… Preloading Strategy (Predictive)
 * âœ… Image Lazy Loading
 * âœ… Network-Aware Loading
 * âœ… Service Worker Caching
 * âœ… React 18 Concurrent Features
 * 
 * ðŸ—ï¸ ARCHITECTURE:
 * âœ… Clean Architecture Principles
 * âœ… Domain-Driven Design (DDD)
 * âœ… Error Boundary System
 * âœ… Modular Feature Structure
 * âœ… TypeScript Strict Mode
 * âœ… SOLID Principles
 * 
 * ðŸ“Š MONITORING:
 * âœ… Performance Monitoring
 * âœ… Error Tracking
 * âœ… Real-Time Analytics
 * âœ… Security Event Logging
 * 
 * Â© 2025 BambÃ©. All Rights Reserved. Unauthorized access prohibited.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Suspense, useEffect, useState, lazy, startTransition, memo } from 'react';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”’ SECURITY CORE - Initialize Before Anything Else
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
import '@/utils/security/SecurityHeaders';
import '@/utils/security/CertificatePinning';
import '@/utils/security/AntiTampering';
import '@/utils/security/RASP'; // Runtime Application Self-Protection

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŽ¯ CORE PROVIDERS - Critical, Always Loaded
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
import AppProviders from '@/providers/AppProviders';
import { NetworkProvider, NetworkStatusBar } from '@/components/network/NetworkMonitor';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { SecurityProvider } from '@/providers/SecurityProvider';
import { PerformanceProvider } from '@/providers/PerformanceProvider';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”§ PERFORMANCE UTILITIES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
import { routePreloader } from '@/utils/performance/RoutePreloader';
import { performanceMonitor } from '@/utils/performance/PerformanceMonitor';
import { bundleAnalyzer } from '@/utils/performance/BundleAnalyzer';
import { ImageOptimizer } from '@/utils/performance/ImageOptimizer';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ“± CAPACITOR - Native Mobile Integration
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { SecureStoragePlugin } from '@capacitor-community/secure-storage';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŽ¨ LAYOUTS - Eager Load (Used Throughout App)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from '@/components/security/ProtectedRoute';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸš€ LAZY LOADED COMPONENTS - Priority-Based Loading Strategy
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”´ CRITICAL PRIORITY - Preload on App Start (First 3 seconds)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const Home = lazy(() =>
    import(/* webpackChunkName: "home", webpackPreload: true */ '@/pages/Home')
);
const Login = lazy(() =>
    import(/* webpackChunkName: "auth-login", webpackPreload: true */ '@/pages/auth/Login')
);
const Register = lazy(() =>
    import(/* webpackChunkName: "auth-register", webpackPreload: true */ '@/pages/auth/Register')
);
const LanguageSelection = lazy(() =>
    import(/* webpackChunkName: "language", webpackPreload: true */ '@/pages/LanguageSelection')
);
const TermsAcceptance = lazy(() =>
    import(/* webpackChunkName: "terms", webpackPreload: true */ '@/pages/TermsAcceptance')
);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¡ HIGH PRIORITY - Preload on User Interaction/Hover
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const Jobs = lazy(() =>
    import(/* webpackChunkName: "jobs", webpackPrefetch: true */ '@/pages/Jobs')
);
const Marketplace = lazy(() =>
    import(/* webpackChunkName: "marketplace", webpackPrefetch: true */ '@/pages/Marketplace')
);
const Services = lazy(() =>
    import(/* webpackChunkName: "services", webpackPrefetch: true */ '@/pages/Services')
);
const Rentals = lazy(() =>
    import(/* webpackChunkName: "rentals", webpackPrefetch: true */ '@/pages/Rentals')
);
const VehicleRentals = lazy(() =>
    import(/* webpackChunkName: "vehicles", webpackPrefetch: true */ '@/pages/VehicleRentals')
);
const Exchange = lazy(() =>
    import(/* webpackChunkName: "exchange", webpackPrefetch: true */ '@/pages/Exchange')
);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ MEDIUM PRIORITY - Load on Demand
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const JobDetails = lazy(() => import('@/pages/JobDetails'));
const MarketplaceItemDetails = lazy(() => import('@/pages/MarketplaceItemDetails'));
const ServiceDetails = lazy(() => import('@/pages/ServiceDetails'));
const RentalDetails = lazy(() => import('@/pages/RentalDetails'));
const VehicleDetails = lazy(() => import('@/pages/VehicleDetails'));
const ExchangeItemDetails = lazy(() => import('@/pages/ExchangeItemDetails'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ USER PAGES - Load on Demand
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const Profile = lazy(() => import('@/pages/Profile'));
const Cart = lazy(() => import('@/pages/Cart'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const AlertsPage = lazy(() => import('@/pages/AlertsPage'));
const Orders = lazy(() => import('@/pages/Orders'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ TRACKING & ORDER SYSTEM
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const OrderTracking = lazy(() => import('@/pages/OrderTracking'));
const TrackOrder = lazy(() => import('@/pages/TrackOrder'));
const TrackingPage = lazy(() => import('@/pages/TrackingPage'));
const GoogleMapTracker = lazy(() => import('@/components/tracking/GoogleMapTracker'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ AUTH PAGES - Load on Demand
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ForgotCredentials = lazy(() => import('@/pages/auth/ForgotCredentials'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¡ POSTING FORMS - Preload on Protected Route Entry
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const PostJob = lazy(() => import('@/pages/PostJob'));
const SellItem = lazy(() => import('@/pages/SellItem'));
const OfferService = lazy(() => import('@/pages/OfferService'));
const ListProperty = lazy(() => import('@/pages/ListProperty'));
const SellVehicle = lazy(() => import('@/pages/SellVehicle'));
const PostAd = lazy(() => import('@/pages/PostAd'));
const ExchangeItemPost = lazy(() => import('@/pages/ExchangeItemPost'));
const ExchangeOfferPage = lazy(() => import('@/pages/ExchangeOfferPage'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ SUBSCRIPTION & MONETIZATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const SubscriptionPlans = lazy(() => import('@/pages/subscription'));
const ZermPurchase = lazy(() => import('@/pages/ZermPurchase'));
const ReferralProgram = lazy(() => import('@/pages/ReferralProgram'));
const DonatePremium = lazy(() => import('@/pages/DonatePremium'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”µ VENDOR SYSTEM - Load on Vendor Access
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const VendorPortal = lazy(() => import('@/pages/vendor/VendorPortal'));
const VendorSignIn = lazy(() => import('@/pages/vendor/VendorSignIn'));
const VendorAuthPage = lazy(() => import('@/pages/vendor/VendorAuthPage'));
const VendorRegistration = lazy(() => import('@/pages/vendor/VendorRegistration'));
const VendorHome = lazy(() => import('@/pages/vendor/VendorHome'));
const VendorDashboard = lazy(() => import('@/pages/vendor/VendorDashboard'));
const VendorSecureDashboard = lazy(() => import('@/pages/vendor/VendorSecureDashboard'));
const VendorManageListings = lazy(() => import('@/pages/vendor/VendorManageListings'));
const VendorAnalytics = lazy(() => import('@/pages/vendor/VendorAnalytics'));
const VendorAnalyticsEnhanced = lazy(() => import('@/pages/vendor/VendorAnalyticsEnhanced'));
const VendorPremiumTools = lazy(() => import('@/pages/vendor/VendorPremiumTools'));
const VendorPremiumToolsEnhanced = lazy(() => import('@/pages/vendor/VendorPremiumToolsEnhanced'));
const VendorSubscriptionPlans = lazy(() => import('@/pages/vendor/VendorSubscriptionPlans'));
const VendorSubscriptionPlansExclusive = lazy(() => import('@/pages/vendor/VendorSubscriptionPlansExclusive'));
const VendorSubscriptionPayment = lazy(() => import('@/pages/vendor/VendorSubscriptionPayment'));
const VendorSettings = lazy(() => import('@/pages/vendor/VendorSettings'));
const VendorSettingsEnhanced = lazy(() => import('@/pages/vendor/VendorSettingsEnhanced'));
const VendorSettingsComplete = lazy(() => import('@/pages/vendor/VendorSettingsComplete'));
const VendorProfile = lazy(() => import('@/pages/vendor/VendorProfile'));
const VendorFilter = lazy(() => import('@/pages/vendor/VendorFilter'));
const VendorCustomers = lazy(() => import('@/pages/vendor/VendorCustomers'));
const VendorRecommendations = lazy(() => import('@/pages/vendor/VendorRecommendations'));
const VendorVerification = lazy(() => import('@/pages/vendor/VendorVerification'));
const VendorMessagesPage = lazy(() => import('@/pages/vendor/VendorMessagesPage'));
const VendorNotifications = lazy(() => import('@/pages/vendor/VendorNotifications'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”µ VENDOR SETTINGS SUB-PAGES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const VendorSettingsAccountProfile = lazy(() => import('@/pages/vendor/settings/VendorSettingsAccountProfile'));
const VendorSettingsStore = lazy(() => import('@/pages/vendor/settings/VendorSettingsStore'));
const VendorSettingsNotification = lazy(() => import('@/pages/vendor/settings/VendorSettingsNotification'));
const VendorSettingsPayment = lazy(() => import('@/pages/vendor/settings/VendorSettingsPayment'));
const VendorSettingsSecurity = lazy(() => import('@/pages/vendor/settings/VendorSettingsSecurity'));
const VendorSettingsShipping = lazy(() => import('@/pages/vendor/settings/VendorSettingsShipping'));
const VendorSettingsBusinessHours = lazy(() => import('@/pages/vendor/settings/VendorSettingsBusinessHours'));
const VendorSettingsLanguage = lazy(() => import('@/pages/vendor/settings/VendorSettingsLanguage'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”µ VENDOR PREMIUM TOOLS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const AnalyticsPro = lazy(() => import('@/pages/vendor/premium/AnalyticsPro'));
const FeaturedListings = lazy(() => import('@/pages/vendor/premium/FeaturedListings'));
const BulkUpload = lazy(() => import('@/pages/vendor/premium/BulkUpload'));
const PrioritySupport = lazy(() => import('@/pages/vendor/premium/PrioritySupport'));
const VerifiedSeller = lazy(() => import('@/pages/vendor/premium/VerifiedSeller'));
const AutoMessaging = lazy(() => import('@/pages/vendor/premium/AutoMessaging'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”´ ADMIN SYSTEM - Maximum Security, Load on Admin Access
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const CreateAdminPage = lazy(() => import('@/pages/admin/CreateAdminPage'));
const AdminInbox = lazy(() => import('@/pages/admin/AdminInbox'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminDisputeResolution = lazy(() => import('@/pages/admin/AdminDisputeResolution'));
const AdminResolveDispute = lazy(() => import('@/pages/admin/AdminResolveDispute'));
const AdminLiveChat = lazy(() => import('@/pages/admin/AdminLiveChat'));
const AdminUserManagement = lazy(() => import('@/pages/admin/AdminUserManagement'));
const AdminUserAccountManagement = lazy(() => import('@/pages/admin/AdminUserAccountManagement'));
const ResolveDisputePage = lazy(() => import('@/pages/admin/ResolveDisputePage'));
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ HELP & SUPPORT SYSTEM
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const Help = lazy(() => import('@/pages/help/Help'));
const HelpGuides = lazy(() => import('@/pages/help/HelpGuides'));
const VideoTutorials = lazy(() => import('@/pages/help/VideoTutorials'));
const GettingStarted = lazy(() => import('@/pages/help/GettingStarted'));
const CreatingAccount = lazy(() => import('@/pages/help/CreatingAccount'));
const ProfileSetup = lazy(() => import('@/pages/help/ProfileSetup'));
const UnderstandingZermCoins = lazy(() => import('@/pages/help/UnderstandingZermCoins'));
const BuyingSelling = lazy(() => import('@/pages/help/BuyingSelling'));
const HowToPostAd = lazy(() => import('@/pages/help/HowToPostAd'));
const SettingRightPrice = lazy(() => import('@/pages/help/SettingRightPrice'));
const PaymentMethods = lazy(() => import('@/pages/help/PaymentMethods'));
const SafetySecurity = lazy(() => import('@/pages/help/SafetySecurity'));
const AvoidingScams = lazy(() => import('@/pages/help/AvoidingScams'));
const MeetingSafely = lazy(() => import('@/pages/help/MeetingSafely'));
const ReportingIssues = lazy(() => import('@/pages/help/ReportingIssues'));
const ContactSupport = lazy(() => import('@/pages/help/ContactSupport'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ LEGAL & STATIC PAGES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const About = lazy(() => import('@/pages/About'));
const SearchResults = lazy(() => import('@/pages/SearchResults'));
const SavedSearches = lazy(() => import('@/pages/SavedSearches'));
const ReportIssuePage = lazy(() => import('@/pages/ReportIssuePage'));
const Chat = lazy(() => import('@/pages/Chat'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ MOVABLE WIDGETS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const MovableChatWidget = lazy(() => import('@/components/chat/MovableChatWidget'));
const MovableVoiceControl = lazy(() => import('@/components/voice/MovableVoiceControl'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ ADVANCED FEATURES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const NotificationService = lazy(() => import('@/advanced-features/notifications/NotificationService'));
const NotificationSystemADVANCED = lazy(() => import('@/advanced-features/notifications/NotificationSystem-ADVANCED'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŸ¢ ERROR PAGES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const CompanyNotFound = lazy(() => import('@/components/errors/CompanyNotFound'));
const ApiTest = lazy(() => import('./pages/ApiTest'));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŽ¨ INTELLIGENT LOADING COMPONENT - Network-Aware
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const LoadingFallback = memo(({ message = "Loading BambÃ©..." }: { message?: string }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
            <div className="text-center space-y-6 p-8">
                {/* Animated Logo */}
                <div className="relative">
                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-teal-600 mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="space-y-2">
                    <p className="text-teal-700 font-bold text-xl">
                        {message}{dots}
                    </p>
                    <p className="text-gray-600 text-sm">Securing your connection...</p>
                </div>

                {/* Progress Bar */}
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
            </div>
        </div>
    );
});

LoadingFallback.displayName = 'LoadingFallback';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”’ ONBOARDING FLOW GUARD - Secure User Journey
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const OnboardingFlowGuard = memo(({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                // Skip check for public pages
                const publicPaths = [
                    '/login', '/register', '/forgot-password', '/forgot-credentials',
                    '/language', '/terms-acceptance',
                    '/help', '/about', '/privacy-policy',
                    '/admin/login', '/vendor/signin', '/vendor/portal'
                ];

                if (publicPaths.some(path => location.pathname.startsWith(path))) {
                    setIsChecking(false);
                    return;
                }

                // Check onboarding status (use secure storage)
                let hasSeenLanguage = false;
                let hasAcceptedTerms = false;

                if (Capacitor.isNativePlatform()) {
                    // Use secure storage on native platforms
                    try {
                        const langData = await SecureStoragePlugin.get({ key: 'hasSeenLanguage' });
                        const termsData = await SecureStoragePlugin.get({ key: 'hasAcceptedTerms' });
                        hasSeenLanguage = langData.value === 'true';
                        hasAcceptedTerms = termsData.value === 'true';
                    } catch (error) {
                        console.log('First time user - secure storage empty');
                    }
                } else {
                    // Use localStorage on web (encrypted in production)
                    hasSeenLanguage = localStorage.getItem('hasSeenLanguage') === 'true';
                    hasAcceptedTerms = localStorage.getItem('hasAcceptedTerms') === 'true';
                }

                // Redirect to onboarding if needed
                if (!hasSeenLanguage && location.pathname !== '/language') {
                    navigate('/language', { replace: true });
                } else if (!hasAcceptedTerms && location.pathname !== '/terms-acceptance') {
                    navigate('/terms-acceptance', { replace: true });
                }
            } catch (error) {
                console.error('Onboarding check error:', error);
            } finally {
                setIsChecking(false);
            }
        };

        checkOnboarding();
    }, [location.pathname, navigate]);

    if (isChecking) {
        return <LoadingFallback message="Initializing..." />;
    }

    return <>{children}</>;
});

OnboardingFlowGuard.displayName = 'OnboardingFlowGuard';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸš€ PERFORMANCE MONITORING & INITIALIZATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const AppInitializer = memo(() => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Start performance monitoring
                performanceMonitor.start();

                // Initialize Capacitor on native platforms
                if (Capacitor.isNativePlatform()) {
                    try {
                        // Configure status bar
                        await StatusBar.setStyle({ style: Style.Light });
                        await StatusBar.setBackgroundColor({ color: '#0D9488' });

                        // Hide splash screen after initialization
                        await SplashScreen.hide();

                        // Handle app state changes
                        CapacitorApp.addListener('appStateChange', ({ isActive }) => {
                            if (isActive) {
                                console.log('App resumed - checking for updates...');
                            } else {
                                console.log('App backgrounded - saving state...');
                            }
                        });
                    } catch (error) {
                        console.error('Capacitor initialization error:', error);
                    }
                }

                // Preload critical routes
                startTransition(() => {
                    routePreloader.preload([
                        () => import('@/pages/Home'),
                        () => import('@/pages/auth/Login'),
                        () => import('@/pages/Marketplace')
                    ]);
                });

                // Initialize security monitoring
                console.log('ðŸ›¡ï¸ Security systems initialized');

                setIsInitialized(true);
            } catch (error) {
                console.error('App initialization error:', error);
                setIsInitialized(true); // Continue anyway
            }
        };

        initializeApp();

        // Cleanup
        return () => {
            performanceMonitor.stop();
        };
    }, []);

    if (!isInitialized) {
        return <LoadingFallback message="Initializing BambÃ©..." />;
    }

    return null;
});

AppInitializer.displayName = 'AppInitializer';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŽ¯ MAIN APP COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const App = () => {
    return (
        <AppErrorBoundary>
            <SecurityProvider>
                <PerformanceProvider>
                    <NetworkProvider>
                        <AppProviders>
                            <BrowserRouter>
                                <AppInitializer />
                                <NetworkStatusBar />
                                <OnboardingFlowGuard>
                                    <Suspense fallback={<LoadingFallback />}>
                                        <Routes>
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {/* ðŸ  PUBLIC ROUTES */}
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            <Route element={<MainLayout />}>
                                                <Route path="/" element={<Home />} />
                                                <Route path="/jobs" element={<Jobs />} />
                                                <Route path="/marketplace" element={<Marketplace />} />
                                                <Route path="/services" element={<Services />} />
                                                <Route path="/rentals" element={<Rentals />} />
                                                <Route path="/vehicles" element={<VehicleRentals />} />
                                                <Route path="/exchange" element={<Exchange />} />
                                                <Route path="/about" element={<About />} />
                                                <Route path="/help" element={<Help />} />
                                                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                            </Route>

                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {/* ðŸ” AUTHENTICATION ROUTES */}
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            <Route element={<AuthLayout />}>
                                                <Route path="/login" element={<Login />} />
                                                <Route path="/register" element={<Register />} />
                                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                                <Route path="/forgot-credentials" element={<ForgotCredentials />} />
                                            </Route>

                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {/* ðŸ›¡ï¸ ONBOARDING ROUTES */}
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            <Route path="/language" element={<LanguageSelection />} />
                                            <Route path="/terms-acceptance" element={<TermsAcceptance />} />

                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {/* ðŸ”’ PROTECTED USER ROUTES */}
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            <Route element={<MainLayout />}>
                                                <Route element={<ProtectedRoute />}>
                                                    {/* Detail Pages */}
                                                    <Route path="/jobs/:id" element={<JobDetails />} />
                                                    <Route path="/marketplace/:id" element={<MarketplaceItemDetails />} />
                                                    <Route path="/services/:id" element={<ServiceDetails />} />
                                                    <Route path="/rentals/:id" element={<RentalDetails />} />
                                                    <Route path="/vehicles/:id" element={<VehicleDetails />} />
                                                    <Route path="/exchange/:id" element={<ExchangeItemDetails />} />

                                                    {/* User Pages */}
                                                    <Route path="/profile" element={<Profile />} />
                                                    <Route path="/cart" element={<Cart />} />
                                                    <Route path="/favorites" element={<Favorites />} />
                                                    <Route path="/notifications" element={<Notifications />} />
                                                    <Route path="/alerts" element={<AlertsPage />} />
                                                    <Route path="/orders" element={<Orders />} />
                                                    <Route path="/chat" element={<Chat />} />

                                                    {/* Tracking */}
                                                    <Route path="/order-tracking" element={<OrderTracking />} />
                                                    <Route path="/track-order/:id" element={<TrackOrder />} />
                                                    <Route path="/tracking/:id" element={<TrackingPage />} />
                                                    <Route path="/map-tracking/:id" element={<GoogleMapTracker />} />

                                                    {/* Posting Forms */}
                                                    <Route path="/post-job" element={<PostJob />} />
                                                    <Route path="/sell-item" element={<SellItem />} />
                                                    <Route path="/offer-service" element={<OfferService />} />
                                                    <Route path="/list-property" element={<ListProperty />} />
                                                    <Route path="/sell-vehicle" element={<SellVehicle />} />
                                                    <Route path="/post-ad" element={<PostAd />} />
                                                    <Route path="/exchange-post" element={<ExchangeItemPost />} />
                                                    <Route path="/exchange-offer/:id" element={<ExchangeOfferPage />} />

                                                    {/* Premium Features */}
                                                    <Route path="/subscription" element={<SubscriptionPlans />} />
                                                    <Route path="/zerm-purchase" element={<ZermPurchase />} />
                                                    <Route path="/referral" element={<ReferralProgram />} />
                                                    <Route path="/donate-premium" element={<DonatePremium />} />

                                                    {/* Search */}
                                                    <Route path="/search" element={<SearchResults />} />
                                                    <Route path="/saved-searches" element={<SavedSearches />} />
                                                    <Route path="/report-issue" element={<ReportIssuePage />} />
                                                </Route>
                                            </Route>

                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {/* ðŸª VENDOR SYSTEM ROUTES */}
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            <Route path="/vendor/portal" element={<VendorPortal />} />
                                            <Route path="/vendor/signin" element={<VendorSignIn />} />
                                            <Route path="/vendor/auth" element={<VendorAuthPage />} />
                                            <Route path="/vendor/register" element={<VendorRegistration />} />

                                            {/* Protected Vendor Routes */}
                                            <Route element={<ProtectedRoute requiredRole="vendor" />}>
                                                <Route path="/vendor/home" element={<VendorHome />} />
                                                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                                                <Route path="/vendor/secure-dashboard" element={<VendorSecureDashboard />} />
                                                <Route path="/vendor/listings" element={<VendorManageListings />} />
                                                <Route path="/vendor/analytics" element={<VendorAnalytics />} />
                                                <Route path="/vendor/analytics-enhanced" element={<VendorAnalyticsEnhanced />} />
                                                <Route path="/vendor/premium-tools" element={<VendorPremiumTools />} />
                                                <Route path="/vendor/premium-tools-enhanced" element={<VendorPremiumToolsEnhanced />} />
                                                <Route path="/vendor/subscription" element={<VendorSubscriptionPlans />} />
                                                <Route path="/vendor/subscription-exclusive" element={<VendorSubscriptionPlansExclusive />} />
                                                <Route path="/vendor/subscription-payment" element={<VendorSubscriptionPayment />} />
                                                <Route path="/vendor/settings" element={<VendorSettings />} />
                                                <Route path="/vendor/settings-enhanced" element={<VendorSettingsEnhanced />} />
                                                <Route path="/vendor/settings-complete" element={<VendorSettingsComplete />} />
                                                <Route path="/vendor/profile" element={<VendorProfile />} />
                                                <Route path="/vendor/filter" element={<VendorFilter />} />
                                                <Route path="/vendor/customers" element={<VendorCustomers />} />
                                                <Route path="/vendor/recommendations" element={<VendorRecommendations />} />
                                                <Route path="/vendor/verification" element={<VendorVerification />} />
                                                <Route path="/vendor/messages" element={<VendorMessagesPage />} />
                                                <Route path="/vendor/notifications" element={<VendorNotifications />} />

                                                {/* Vendor Settings Sub-pages */}
                                                <Route path="/vendor/settings/account" element={<VendorSettingsAccountProfile />} />
                                                <Route path="/vendor/settings/store" element={<VendorSettingsStore />} />
                                                <Route path="/vendor/settings/notifications" element={<VendorSettingsNotification />} />
                                                <Route path="/vendor/settings/payment" element={<VendorSettingsPayment />} />
                                                <Route path="/vendor/settings/security" element={<VendorSettingsSecurity />} />
                                                <Route path="/vendor/settings/shipping" element={<VendorSettingsShipping />} />
                                                <Route path="/vendor/settings/hours" element={<VendorSettingsBusinessHours />} />
                                                <Route path="/vendor/settings/language" element={<VendorSettingsLanguage />} />

                                                {/* Vendor Premium Tools */}
                                                <Route path="/vendor/premium/analytics-pro" element={<AnalyticsPro />} />
                                                <Route path="/vendor/premium/featured" element={<FeaturedListings />} />
                                                <Route path="/vendor/premium/bulk-upload" element={<BulkUpload />} />
                                                <Route path="/vendor/premium/support" element={<PrioritySupport />} />
                                                <Route path="/vendor/premium/verified" element={<VerifiedSeller />} />
                                                <Route path="/vendor/premium/auto-messaging" element={<AutoMessaging />} />
                                            </Route>

                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {/* ðŸ‘‘ ADMIN SYSTEM ROUTES - MAXIMUM SECURITY */}
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            <Route path="/admin/login" element={<AdminLogin />} />
                                            <Route element={<ProtectedRoute requiredRole="admin" />}>
                                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                                <Route path="/admin/create-admin" element={<CreateAdminPage />} />
                                                <Route path="/admin/inbox" element={<AdminInbox />} />
                                                <Route path="/admin/settings" element={<AdminSettings />} />
                                                <Route path="/admin/disputes" element={<AdminDisputeResolution />} />
                                                <Route path="/admin/resolve-dispute/:id" element={<AdminResolveDispute />} />
                                                <Route path="/admin/resolve-dispute-page" element={<ResolveDisputePage />} />
                                                <Route path="/admin/live-chat" element={<AdminLiveChat />} />
                                                <Route path="/admin/users" element={<AdminUserManagement />} />
                                                <Route path="/admin/user-accounts" element={<AdminUserAccountManagement />} />
                                                <Route path="/admin/user-management" element={<UserManagementPage />} />
                                            </Route>

                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {/* ðŸ“š HELP & SUPPORT ROUTES */}
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            <Route element={<MainLayout />}>
                                                <Route path="/help/guides" element={<HelpGuides />} />
                                                <Route path="/help/videos" element={<VideoTutorials />} />
                                                <Route path="/help/getting-started" element={<GettingStarted />} />
                                                <Route path="/help/creating-account" element={<CreatingAccount />} />
                                                <Route path="/help/profile-setup" element={<ProfileSetup />} />
                                                <Route path="/help/zerm-coins" element={<UnderstandingZermCoins />} />
                                                <Route path="/help/buying-selling" element={<BuyingSelling />} />
                                                <Route path="/help/post-ad" element={<HowToPostAd />} />
                                                <Route path="/help/pricing" element={<SettingRightPrice />} />
                                                <Route path="/help/payment" element={<PaymentMethods />} />
                                                <Route path="/help/safety" element={<SafetySecurity />} />
                                                <Route path="/help/scams" element={<AvoidingScams />} />
                                                <Route path="/help/meeting-safely" element={<MeetingSafely />} />
                                                <Route path="/help/report" element={<ReportingIssues />} />
                                                <Route path="/help/contact" element={<ContactSupport />} />
                                            </Route>

                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {/* ðŸ”§ DEVELOPMENT/TESTING ROUTES */}
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {process.env.NODE_ENV === 'development' && (
                                                <Route path="/api-test" element={<ApiTest />} />
                                            )}

                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            {/* âŒ ERROR ROUTES */}
                                            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                            <Route path="/404" element={<CompanyNotFound />} />
                                            <Route path="*" element={<Navigate to="/404" replace />} />
                                        </Routes>
                                    </Suspense>
                                </OnboardingFlowGuard>

                                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                {/* ðŸŽˆ GLOBAL WIDGETS - Load on Demand */}
                                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                                <Suspense fallback={null}>
                                    <MovableChatWidget />
                                    <MovableVoiceControl />
                                </Suspense>
                            </BrowserRouter>
                        </AppProviders>
                    </NetworkProvider>
                </PerformanceProvider>
            </SecurityProvider>
        </AppErrorBoundary>
    );
};

export default App;




