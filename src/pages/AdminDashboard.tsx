/**
 * AdminDashboard.tsx — Bambeh Marketplace · Admin Dashboard
 * FILE LOCATION: src/routes/groups/admin/AdminDashboard.tsx
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * Self-contained 5-language UI (en · fr · pidgin · ar · ff). Reads the current
 * language from useLang() and falls back to English. No mojibake, no BOM.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/hooks/useAppLang";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const T: Record<Lang, { back: string; title: string; subtitle: string; backHome: string }> = {
  en: {
    back: "Back",
    title: "Admin Dashboard",
    subtitle: "Manage users, listings and settings.",
    backHome: "Back to home",
  },
  fr: {
    back: "Retour",
    title: "Tableau de bord Admin",
    subtitle: "Gérez les utilisateurs, les annonces et les paramètres.",
    backHome: "Retour à l’accueil",
  },
  pidgin: {
    back: "Go back",
    title: "Admin Dashboard",
    subtitle: "Manage users, listings and settings dem.",
    backHome: "Go back home",
  },
  ar: {
    back: "رجوع",
    title: "لوحة تحكم المشرف",
    subtitle: "إدارة المستخدمين والإعلانات والإعدادات.",
    backHome: "العودة إلى الرئيسية",
  },
  ff: {
    back: "Rutto",
    title: "Tabbal Ardorde",
    subtitle: "Toppito huɓɓunooɓe, jeeyooji e teelte.",
    backHome: "Rutto to galle",
  },
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lang = (useLang() as Lang) || "en";
  const s = T[lang] || T.en;
  const isRtl = lang === "ar";

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isRtl ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
            />
          </svg>
          {s.back}
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{s.title}</h1>
          <p className="text-gray-500 mb-6">{s.subtitle}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            {s.backHome}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
