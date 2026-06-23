/**
 * src/pages/vendor/AnalyticsPro.tsx
 * Bambeh Marketplace — Vendor Analytics Pro Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React from "react";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VendorAnalytics from "@/components/vendor/VendorAnalytics";
import DashboardOverview from "@/pages/vendor/components/DashboardOverview";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useLang, t } from "@/hooks/useAppLang";

const AnalyticsPro: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <TrendingUp className="w-5 h-5 text-teal-600" />
        <h1 className="text-lg font-bold text-gray-900">Analytics Pro</h1>
      </div>
      {vendorId ? (
        <>
          <DashboardOverview vendorId={vendorId} />
          <VendorAnalytics vendorId={vendorId} />
        </>
      ) : (
        <div className="py-12 text-center text-gray-400">Chargement du profil vendeur...</div>
      )}
    </div>
  );
};

export default AnalyticsPro;




