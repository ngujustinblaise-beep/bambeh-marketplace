/**
 * MainLayout.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/layout/MainLayout.tsx
 *
 * FIXES:
 * 1. nav.messages was showing as literal text — translation key was missing
 *    FIXED: Nav labels now use hardcoded fallbacks so they always display correctly
 * 2. Purple square on homepage removed — was a leftover share button from old code
 * 3. Share strip and share menu retained and working correctly
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

import React, { useState } from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home, ShoppingBag, MessageCircle, Bell, User,
  Share2, X, Copy, Check, Facebook, Twitter, MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";

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

const mobileNavItems: NavItem[] = [
  { label: "Home",          labelKey: "nav.home",          path: "/",              icon: Home                             },
  { label: "Marketplace",   labelKey: "nav.marketplace",   path: "/marketplace",   icon: ShoppingBag                      },
  { label: "Messages",      labelKey: "nav.messages",      path: "/chat",          icon: MessageCircle, requiresAuth: true },
  { label: "Notifications", labelKey: "nav.notifications", path: "/notifications", icon: Bell,          requiresAuth: true },
  { label: "Profile",       labelKey: "common.profile",    path: "/profile",       icon: User,          requiresAuth: true },
];

// ── Share helpers ─────────────────────────────────────────────────────────────
const APP_URL  = "https://bambeh.com";
const APP_NAME = "Bambeh — Cameroon's #1 Marketplace";

function buildShareText(t: (k: string) => string): string {
  const translated = t("share.appMessage");
  if (translated && translated !== "share.appMessage") return translated;
  return "🛒 Check out Bambeh — Cameroon's #1 Marketplace! Buy, sell, find jobs, rent homes and more. Only 1% transaction fee!";
}

// ── Social share links ────────────────────────────────────────────────────────
function whatsappUrl(text: string, url: string) {
  return `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;
}
function facebookUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
function twitterUrl(text: string, url: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

// ── ShareMenu component (fallback for desktop / browsers without Web Share) ──
function ShareMenu({
  onClose,
  shareText,
  shareUrl,
  copied,
  onCopy,
}: {
  onClose: () => void;
  shareText: string;
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-5 pb-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-600" />
            Share Bambeh
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Preview of what will be shared */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 mb-4">
          <p className="text-xs text-teal-700 leading-relaxed">{shareText}</p>
          <p className="text-xs text-teal-500 font-semibold mt-1">{shareUrl}</p>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* WhatsApp */}
          <a
            href={whatsappUrl(shareText, shareUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-2xl transition-colors"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-700">WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl(shareUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-700">Facebook</span>
          </a>

          {/* Twitter / X */}
          <a
            href={twitterUrl(shareText, shareUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <Twitter className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Twitter / X</span>
          </a>
        </div>

        {/* Copy link */}
        <button
          onClick={onCopy}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border-2 transition-all ${
            copied
              ? "border-green-400 bg-green-50 text-green-700"
              : "border-gray-200 text-gray-700 hover:border-teal-400 hover:bg-teal-50"
          }`}
        >
          {copied
            ? <><Check className="w-4 h-4" /> Link Copied!</>
            : <><Copy className="w-4 h-4" /> Copy Link</>
          }
        </button>
      </div>
    </>
  );
}

// ── Helper: resolve nav label safely ─────────────────────────────────────────
// If t() returns the raw key (translation missing), use the hardcoded fallback.
function resolveLabel(t: (k: string) => string, item: NavItem): string {
  if (!item.labelKey) return item.label;
  const translated = t(item.labelKey);
  // If the translation system returns the key itself, it means the key is missing
  return translated && translated !== item.labelKey ? translated : item.label;
}

// ── Main component ────────────────────────────────────────────────────────────
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t }            = useLanguage();
  const location         = useLocation();
  const navigate         = useNavigate();
  const { currentUser }  = useAuth();
  const { unreadCount }  = useNotification();

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied,        setCopied]        = useState(false);

  const shareText = buildShareText(t);
  const shareUrl  = APP_URL;

  // ── Share handler ──────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: APP_NAME,
          text:  shareText,
          url:   shareUrl,
        });
        return;
      } catch {
        return; // User cancelled
      }
    }
    setShowShareMenu(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isActivePath = (path: string): boolean => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !currentUser) { navigate("/login"); return; }
    navigate(path);
  };

  // ── Mobile bottom nav ──────────────────────────────────────────────────────
  const renderMobileBottomNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl">

      {/* Share strip */}
      <div className="border-t-2 border-teal-100 bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold leading-none">
            Invite friends to Bambeh!
          </p>
          <p className="text-teal-200 text-xs mt-0.5 truncate">{shareUrl}</p>
        </div>

        <button
          onClick={handleShare}
          aria-label="Share Bambeh"
          className="flex items-center gap-1.5 bg-white text-teal-700 px-4 py-2 rounded-xl font-bold text-sm flex-shrink-0 hover:bg-teal-50 active:scale-95 transition-all shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Main nav row */}
      <div className="flex items-center justify-around px-2 py-2 border-t border-gray-100">
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
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? "text-teal-600" : "text-gray-600"}`}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-10 h-0.5 bg-teal-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-0 pb-28 md:pb-8">
        {children || <Outlet />}
      </main>

      <Footer />

      {renderMobileBottomNav()}

      {/* Social media share menu (desktop fallback) */}
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