/**
 * src/pages/Profile.tsx - BAMBEH SARL
 * Production user profile page.
 *
 *  - Fully internationalised (English, French, Pidgin, Arabic, Fulfulde)
 *  - Language switches INSTANTLY via the global useLanguage() from @/App
 *  - RTL-aware layout for Arabic
 *  - Wired to real auth (useAuth from @/contexts/AuthContext)
 *  - Icons are NEVER translated (literal across all languages)
 *  - Non-ASCII stored as \u escapes => can never mojibake
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Package, ClipboardList, Heart, Bell, Bookmark,
  Crown, Gift, Settings as SettingsIcon, HelpCircle, PlusCircle,
  LogOut, ChevronRight, ChevronLeft, BadgeCheck, LogIn,
} from "lucide-react";
import { useLanguage } from "@/App";
import { useAuth } from "@/contexts/AuthContext";

type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";

const PROFILE_T: Record<LangCode, Record<string, string>> = {
  en: {
    profile: "Profile",
    guest: "Guest",
    signInPrompt: "Sign in to access your profile, listings and orders.",
    signIn: "Sign in",
    myListings: "My Listings",
    orders: "My Orders",
    favorites: "Favorites",
    notifications: "Notifications",
    savedSearches: "Saved Searches",
    subscription: "Subscription",
    referral: "Refer & Earn",
    settings: "Settings",
    help: "Help & Support",
    sell: "Sell something",
    logout: "Log out",
    account: "Account",
    activity: "Activity",
    more: "More",
    verified: "Verified",
    editProfile: "Edit profile"
  },
  fr: {
    profile: "Profil",
    guest: "Invit\u00e9",
    signInPrompt: "Connectez-vous pour acc\u00e9der \u00e0 votre profil, vos annonces et vos commandes.",
    signIn: "Se connecter",
    myListings: "Mes annonces",
    orders: "Mes commandes",
    favorites: "Favoris",
    notifications: "Notifications",
    savedSearches: "Recherches enregistr\u00e9es",
    subscription: "Abonnement",
    referral: "Parrainer et gagner",
    settings: "Param\u00e8tres",
    help: "Aide et assistance",
    sell: "Vendre un article",
    logout: "D\u00e9connexion",
    account: "Compte",
    activity: "Activit\u00e9",
    more: "Plus",
    verified: "V\u00e9rifi\u00e9",
    editProfile: "Modifier le profil"
  },
  pidgin: {
    profile: "Profile",
    guest: "Guest",
    signInPrompt: "Login make you fit see your profile, listings and orders.",
    signIn: "Login",
    myListings: "My Listings",
    orders: "My Orders",
    favorites: "Favorites",
    notifications: "Notifications",
    savedSearches: "Saved Searches",
    subscription: "Subscription",
    referral: "Refer & Earn",
    settings: "Settings",
    help: "Help & Support",
    sell: "Sell something",
    logout: "Log out",
    account: "Account",
    activity: "Activity",
    more: "More",
    verified: "Verified",
    editProfile: "Edit profile"
  },
  ar: {
    profile: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a",
    guest: "\u0636\u064a\u0641",
    signInPrompt: "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0645\u0644\u0641\u0643 \u0648\u0625\u0639\u0644\u0627\u0646\u0627\u062a\u0643 \u0648\u0637\u0644\u0628\u0627\u062a\u0643.",
    signIn: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    myListings: "\u0625\u0639\u0644\u0627\u0646\u0627\u062a\u064a",
    orders: "\u0637\u0644\u0628\u0627\u062a\u064a",
    favorites: "\u0627\u0644\u0645\u0641\u0636\u0644\u0629",
    notifications: "\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a",
    savedSearches: "\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629",
    subscription: "\u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643",
    referral: "\u0627\u062f\u0639\u064f \u0648\u0627\u0631\u0628\u062d",
    settings: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
    help: "\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0648\u0627\u0644\u062f\u0639\u0645",
    sell: "\u0628\u0639 \u0634\u064a\u0626\u064b\u0627",
    logout: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c",
    account: "\u0627\u0644\u062d\u0633\u0627\u0628",
    activity: "\u0627\u0644\u0646\u0634\u0627\u0637",
    more: "\u0627\u0644\u0645\u0632\u064a\u062f",
    verified: "\u0645\u0648\u062b\u0651\u0642",
    editProfile: "\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0645\u0644\u0641"
  },
  ff: {
    profile: "Konngol",
    guest: "Ko\u0257o",
    signInPrompt: "Naatu ngam yi\u0257de konngol, jeeyooji e komaaduuji maa.",
    signIn: "Naatu",
    myListings: "Jeeyooji am",
    orders: "Komaaduuji am",
    favorites: "Cu\u0253i\u0257aa\u0257i",
    notifications: "Tinndinooje",
    savedSearches: "\u0190tirteeji mara\u0257i",
    subscription: "Jokkondiral",
    referral: "Noddu & Hebu",
    settings: "Teelte",
    help: "Ballal & Faabo",
    sell: "Yeey huunde",
    logout: "Yaltu",
    account: "Konte",
    activity: "Golle",
    more: "\u0181eydu",
    verified: "Tabitin\u0257o",
    editProfile: "Waylu konngol"
  }
};

interface MenuRow {
  key: string;
  to: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export default function Profile() {
  const { language, isRtl } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const lang = (language as LangCode) in PROFILE_T ? (language as LangCode) : "en";
  const t = (k: string) => PROFILE_T[lang]?.[k] ?? PROFILE_T.en[k] ?? k;
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const initials = useMemo(() => {
    const base = (user?.name || user?.email || "").trim();
    if (!base) return "?";
    const parts = base.split(/[\s@.]+/).filter(Boolean);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }, [user]);

  const handleLogout = async () => {
    try { await logout(); } catch { /* no-op */ }
    navigate("/login", { replace: true });
  };

  const account: MenuRow[] = [
    { key: "myListings",    to: "/my-listings",    Icon: Package },
    { key: "orders",        to: "/orders",         Icon: ClipboardList },
    { key: "sell",          to: "/marketplace/sell", Icon: PlusCircle },
  ];
  const activity: MenuRow[] = [
    { key: "favorites",     to: "/favorites",      Icon: Heart },
    { key: "notifications", to: "/notifications",  Icon: Bell },
    { key: "savedSearches", to: "/saved-searches", Icon: Bookmark },
  ];
  const more: MenuRow[] = [
    { key: "subscription",  to: "/subscription",   Icon: Crown },
    { key: "referral",      to: "/referral",       Icon: Gift },
    { key: "settings",      to: "/settings",       Icon: SettingsIcon },
    { key: "help",          to: "/help",           Icon: HelpCircle },
  ];

  const Section = ({ title, rows }: { title: string; rows: MenuRow[] }) => (
    <div className="mb-5">
      <h2 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
        {rows.map(({ key, to, Icon }) => (
          <Link
            key={key}
            to={to}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300">
              <Icon className="w-5 h-5" />
            </span>
            <span className="flex-1 font-medium text-gray-800 dark:text-gray-100">{t(key)}</span>
            <Chevron className="w-4 h-4 text-gray-300" />
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header card */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-8 pb-14 text-white">
        <h1 className="text-lg font-bold mb-5">{t("profile")}</h1>
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover ring-2 ring-white/60"
            />
          ) : (
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-2xl font-bold uppercase ring-2 ring-white/40">
              {user ? initials : <User className="w-8 h-8" />}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-semibold truncate">{user?.name || t("guest")}</p>
              {user?.role === "verified" && <BadgeCheck className="w-4 h-4 text-emerald-300" />}
            </div>
            <p className="text-sm text-white/80 truncate">{user?.email || ""}</p>
            {user?.phone && <p className="text-sm text-white/70">{user.phone}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto -mt-8 px-3">
        {!user ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 text-center mb-5">
            <p className="text-gray-600 dark:text-gray-300 mb-4">{t("signInPrompt")}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
            >
              <LogIn className="w-5 h-5" />
              {t("signIn")}
            </Link>
          </div>
        ) : (
          <Link
            to="/settings"
            className="flex items-center justify-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-teal-600 dark:text-teal-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <User className="w-4 h-4" />
            {t("editProfile")}
          </Link>
        )}

        <Section title={t("account")}  rows={account} />
        <Section title={t("activity")} rows={activity} />
        <Section title={t("more")}     rows={more} />

        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t("logout")}
          </button>
        )}
      </div>
    </div>
  );
}
