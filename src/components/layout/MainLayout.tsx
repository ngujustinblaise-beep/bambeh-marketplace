/**
 * MainLayout.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/layout/MainLayout.tsx
 *
 * CHANGES FROM PREVIOUS VERSION:
 *  ✅ FeaturedAdsBar added below Header — shows featured marketplace listings
 *     to all users on every page. Hides itself when no featured listings exist.
 *  ✅ FeaturedAdsBar upgraded to FeaturedAdsStrip — full featured-ads system:
 *       • Up to 20 ads per set, auto-rotates every 30 s when >20 ads exist
 *       • Newest ads always on top
 *       • Time labels (days / weeks / months) in the active display language
 *       • Category-aware: each listing page can render its own filtered strip
 *       • Searchable across all 6 Bambeh languages
 *       • 500-ad capacity in Supabase (trigger evicts oldest on overflow)
 *       • Realtime — new ads appear instantly without page refresh
 *       • Hidden automatically on auth/vendor/admin/chat/payment routes
 *  ✅ All original behaviour preserved unchanged.
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

import React, { useState } from "react";
import { useLang } from '@/hooks/useAppLang';
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home, ShoppingBag, MessageCircle, Bell, User, Zap,
  Share2, X, Copy, Check, Facebook, Twitter, MessageSquare, ChevronUp, ChevronDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip"; // ✅ NEW


// ─── Types ────────────────────────────────────────────────────────────────────

interface MainLayoutProps {
  children?: React.ReactNode;
}

interface NavItem {
  label: string;
  labelKey?: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
}

// ─── Mobile bottom-nav items ──────────────────────────────────────────────────

const mobileNavItems: NavItem[] = [
  { label: "Home",          labelKey: "nav.home",          path: "/",              icon: Home                             },
  { label: "Marketplace",   labelKey: "nav.marketplace",   path: "/marketplace",   icon: ShoppingBag                      },
  { label: "Coins",         labelKey: "nav.coins",         path: "/coins",         icon: Zap,           requiresAuth: true },
  { label: "Messages",      labelKey: "nav.messages",      path: "/chat",          icon: MessageCircle, requiresAuth: true },
  { label: "Notifications", labelKey: "nav.notifications", path: "/notifications", icon: Bell,          requiresAuth: true },
  { label: "Profile",       labelKey: "common.profile",    path: "/profile",       icon: User,          requiresAuth: true },
];

// ─── Routes where the ads strip is suppressed ─────────────────────────────────
// Auth, vendor portal, admin, chat, payment — a strip is intrusive on these.
const ROUTES_WITHOUT_ADS = [
  "/login", "/register", "/forgot", "/vendor", "/admin", "/chat",
  "/payment", "/language-selection", "/terms-acceptance",
];

// ─── Share helpers ────────────────────────────────────────────────────────────

const APP_URL  = "https://bambeh.com";
const APP_NAME = "Bambeh — The Pulse of African Commerce";

function buildShareText(t: (k: string) => string): string {
  // NOTE: do NOT call hooks here — this is a plain helper function, not a component.
  const translated = t("share.appMessage");
  if (translated && translated !== "share.appMessage") return translated;
  return "🛒 Check out Bambeh — The Pulse of African Commerce! Buy, sell, find jobs, rent homes and more. Only 1% transaction fee — lowest in any marketplace!";
}

function whatsappUrl(text: string, url: string) {
  return `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;
}
function facebookUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
function twitterUrl(text: string, url: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

// ─── ShareMenu ────────────────────────────────────────────────────────────────

function ShareMenu({
  onClose, shareText, shareUrl, copied, onCopy,
}: {
  onClose: () => void; shareText: string; shareUrl: string; copied: boolean; onCopy: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose}/>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-5 pb-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-600" />
            Share Bambeh
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 mb-4">
          <p className="text-xs text-teal-700 leading-relaxed">{shareText}</p>
          <p className="text-xs text-teal-500 font-semibold mt-1">{shareUrl}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <a href={whatsappUrl(shareText, shareUrl)} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-2xl transition-colors">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-700">WhatsApp</span>
          </a>
          <a href={facebookUrl(shareUrl)} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-700">Facebook</span>
          </a>
          <a href={twitterUrl(shareText, shareUrl)} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <Twitter className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Twitter / X</span>
          </a>
        </div>
        <button
          onClick={onCopy}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border-2 transition-all ${
            copied ? "border-green-400 bg-green-50 text-green-700" : "border-gray-200 text-gray-700 hover:border-teal-400 hover:bg-teal-50"
          }`}
        >
          {copied ? <><Check className="w-4 h-4" /> Link Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
        </button>
      </div>
    </>
  );
}

// ─── Nav label helper ─────────────────────────────────────────────────────────

function resolveLabel(t: (k: string) => string, item: NavItem): string {
  if (!item.labelKey) return item.label;
  const translated = t(item.labelKey);
  return translated && translated !== item.labelKey ? translated : item.label;
}

// ─── MainLayout ───────────────────────────────────────────────────────────────

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t }           = useLanguage();
  const location        = useLocation();
  const navigate        = useNavigate();
  const { currentUser } = useAuth();
  const { unreadCount } = useNotifications();

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [navHidden, setNavHidden] = useState(false);

  const shareText = buildShareText(t);
  const shareUrl  = APP_URL;

  // ── Decide whether to show the ads strip on this route ────────────────────
  const shouldShowAds = !ROUTES_WITHOUT_ADS.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  // ── Share handlers ────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: APP_NAME, text: shareText, url: shareUrl });
        return;
      } catch { return; }
    }
    setShowShareMenu(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActivePath = (path: string): boolean => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !currentUser) { navigate("/login"); return; }
    navigate(path);
  };

  // ── Mobile bottom nav ─────────────────────────────────────────────────────
  const renderMobileBottomNav = () => (
    <>
      <button
        type="button"
        onClick={() => setNavHidden((v) => !v)}
        aria-label={navHidden ? "Show navigation" : "Hide navigation"}
        className={`md:hidden fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-12 h-7 rounded-t-xl bg-teal-600 text-white shadow-lg transition-all duration-300 ${navHidden ? "bottom-0" : "bottom-16"}`}
      >
        {navHidden ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t border-gray-100 transition-transform duration-300 ${navHidden ? "translate-y-full" : "translate-y-0"}`}>
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          if (item.requiresAuth && !currentUser) return null;

          const Icon     = item.icon;
          const isActive = isActivePath(item.path);
          const label    = resolveLabel(t, item);

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path, item.requiresAuth)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? "text-teal-600" : "text-gray-500 hover:text-teal-600"
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform`} />
                {item.path === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? "text-teal-600" : "text-gray-600"}`}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-10 h-0.5 bg-teal-600 rounded-t-full"/>
              )}
            </button>
          );
        })}

        {/* Share / Invite button */}
        <button
          onClick={handleShare}
          aria-label="Invite friends to Bambeh"
          className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all text-teal-600 hover:text-teal-700"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-xs font-medium text-teal-600">{t("common.share") || "Share"}</span>
        </button>
      </div>
    </nav>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* ✅ Featured ads strip — visible to all users on every applicable page.
       *
       *  • Renders null automatically when no ads exist — safe to leave here permanently.
       *  • Shows ALL categories in this global position (no `category` prop).
       *  • Hidden on auth / vendor / admin / chat / payment routes via shouldShowAds.
       *  • Time labels and UI text switch language with the active LanguageContext.
       *
       *  ADDING A CATEGORY-FILTERED STRIP TO INDIVIDUAL PAGES:
       *  Each listing page can add its own filtered strip inside its own JSX:
       *
       *    import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip";
       *    <FeaturedAdsStrip category="jobs" showHeader={false} />
       *
       *  Supported category values:
       *    "marketplace" | "jobs" | "services" | "rentals" | "vehicles" |
       *    "exchange"    | "farm-fresh" | "flash-deals" | "group-buying" | "general"
       */}
      {shouldShowAds && (
        <FeaturedAdsStrip showHeader maxVisible={20} />
      )}

      <main className="flex-1 pt-0 pb-20 md:pb-8">
        {children || <Outlet />}
      </main>

      <Footer />
      {renderMobileBottomNav()}

      {showShareMenu && (
        <ShareMenu
          onClose={() => setShowShareMenu(false)}
          shareText={shareText}
          shareUrl={shareUrl}
          copied={copied}
          onCopy={handleCopyLink}
        />
      )}
    </div>
  );
};

export default MainLayout;





