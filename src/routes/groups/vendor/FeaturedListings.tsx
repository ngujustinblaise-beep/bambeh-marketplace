/**
 * src/pages/vendor/FeaturedListings.tsx
 * Bambeh Marketplace ? Featured Listings Manager
 * ? 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Star, ArrowLeft, Zap, Plus, RefreshCw, CheckCircle, Clock, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

interface FeaturedSlot {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  priceXAF: number;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "expired";
  placement: string;
}

const FeaturedListings: React.FC = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<FeaturedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) { setLoading(false); return; }
      const { data: vendor } = await supabase.from("vendor_profiles").select("id").eq("user_id", userId).single();
      if (!vendor) { setLoading(false); return; }
      setVendorId((vendor as { id: string }).id);

      const { data } = await supabase
        .from("featured_slots")
        .select("*, marketplace_items:listing_id(title, images)")
        .eq("vendor_id", (vendor as { id: string }).id)
        .order("start_date", { ascending: false });

      if (data) {
        setSlots(data.map((row) => {
          const listing = Array.isArray(row.marketplace_items) ? row.marketplace_items[0] : row.marketplace_items;
          const imgs = (listing?.images as { url: string }[]) ?? [];
          return {
            id: row.id as string,
            listingId: row.listing_id as string,
            listingTitle: (listing?.title as string) ?? "?",
            listingImage: imgs[0]?.url,
            priceXAF: row.price_xaf as number,
            startDate: row.start_date as string,
            endDate: row.end_date as string,
            status: row.status as FeaturedSlot["status"],
            placement: (row.placement as string) ?? "feed_inline",
          };
        }));
      }
      setLoading(false);
    };
    void load();
  }, []);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(n) + " FCFA";

  const activeCount = slots.filter((s) => s.status === "active").length;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h1 className="text-lg font-bold text-gray-900">Annonces en Vedette</h1>
        <span className="ml-auto text-xs text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
          {activeCount} actives
        </span>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-yellow-800">Boostez votre visibilit?</p>
          <p className="text-xs text-yellow-700 mt-0.5">Les annonces en vedette re?oivent 5? plus de vues que les annonces standard.</p>
        </div>
      </div>

      <button type="button" onClick={() => navigate("/vendor/featured/new")}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-colors">
        <Plus className="w-4 h-4" />
        Mettre une annonce en vedette
      </button>

      {loading ? (
        <div className="py-8 text-center"><RefreshCw className="w-5 h-5 text-gray-300 animate-spin mx-auto" /></div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Aucune annonce en vedette</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => (
            <div key={slot.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex">
              <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                {slot.listingImage
                  ? <img src={slot.listingImage} alt={slot.listingTitle} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-6 h-6" /></div>
                }
              </div>
              <div className="flex-1 p-3">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{slot.listingTitle}</p>
                <p className="text-xs text-gray-400 mt-0.5">{slot.placement}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    slot.status === "active" ? "text-green-600" :
                    slot.status === "pending" ? "text-yellow-600" : "text-gray-400"
                  }`}>
                    {slot.status === "active" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {slot.status === "active" ? "Actif" : slot.status === "pending" ? "En attente" : "Expir?"}
                  </span>
                  <span className="text-xs text-gray-400">?</span>
                  <span className="text-xs text-teal-700 font-medium">{formatXAF(slot.priceXAF)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(slot.startDate).toLocaleDateString("fr-CM")} ? {new Date(slot.endDate).toLocaleDateString("fr-CM")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedListings;





