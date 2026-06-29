/**
 * AnalyticsPro.tsx — Bambeh Marketplace · Vendor Analytics Pro
 * FILE LOCATION: src/pages/vendor/AnalyticsPro.tsx
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * NOTE: the DashboardOverview import path below was broken ("@\/pages/vendor.tsx/...").
 * It is corrected to a normal alias path. If your DashboardOverview lives elsewhere,
 * adjust this single import to the real location.
 */

import React, { useState, useEffect } from "react";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VendorAnalytics from "@/components/vendor/VendorAnalytics";
import DashboardOverview from "@/pages/vendor/components/DashboardOverview";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useAppLang";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const T: Record<Lang, { title: string; loading: string }> = {
  en: { title: "Analytics Pro", loading: "Loading vendor profile…" },
  fr: { title: "Analytics Pro", loading: "Chargement du profil vendeur…" },
  pidgin: { title: "Analytics Pro", loading: "Vendor profile dey load…" },
  ar: { title: "تحليلات احترافية", loading: "جاري تحميل ملف البائع…" },
  ff: { title: "Analytics Pro", loading: "Profil jeeyoowo ina loowee…" },
};

const AnalyticsPro: React.FC = () => {
  const navigate = useNavigate();
  const lang = (useLang() as Lang) || "en";
  const s = T[lang] || T.en;
  const isRtl = lang === "ar";
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) return;
      const { data } = await supabase
        .from("vendor_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (data) setVendorId((data as { id: string }).id);
    };
    void load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className={`w-5 h-5 text-gray-600 ${isRtl ? "rotate-180" : ""}`} />
        </button>
        <TrendingUp className="w-5 h-5 text-teal-600" />
        <h1 className="text-lg font-bold text-gray-900">{s.title}</h1>
      </div>

      {vendorId ? (
        <>
          <DashboardOverview vendorId={vendorId} />
          <VendorAnalytics vendorId={vendorId} />
        </>
      ) : (
        <div className="py-12 text-center text-gray-400">{s.loading}</div>
      )}
    </div>
  );
};

export default AnalyticsPro;
