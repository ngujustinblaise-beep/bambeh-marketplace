/**
 * src/pages/FlashDealDetail.tsx
 * Bambeh Marketplace — Flash Deal Detail Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Zap, Clock, ShoppingCart, Heart,
  Share2, RefreshCw, AlertCircle, Users, CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BambehImage } from "@/components/ui/BambehImage";

interface FlashDeal {
  id: string;
  listingId: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  imageUrl?: string;
  images: string[];
  originalPriceXAF: number;
  discountedPriceXAF: number;
  discountPercent: number;
  totalSlots: number;
  claimedSlots: number;
  endsAt: string;
  status: "active" | "sold_out" | "expired";
}

function useCountdown(endsAt: string) {
  const calcRemaining = useCallback(() => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    const totalSec = Math.floor(diff / 1000);
    return {
      hours: Math.floor(totalSec / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
      expired: false,
    };
  }, [endsAt]);

  const [remaining, setRemaining] = useState(calcRemaining);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [calcRemaining]);

  return remaining;
}

const FlashDealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<FlashDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from("flash_deals")
        .select("*, vendor_profiles:vendor_id(store_name)")
        .eq("id", id)
        .single();

      if (dbErr || !data) { setError("Offre introuvable"); return; }
      const vendor = Array.isArray(data.vendor_profiles) ? data.vendor_profiles[0] : data.vendor_profiles;
      setDeal({
        id: data.id as string,
        listingId: data.listing_id as string,
        vendorId: data.vendor_id as string,
        vendorName: (vendor?.store_name as string) ?? "—",
        title: data.title as string,
        description: data.description as string,
        imageUrl: (data.images as string[])?.[0],
        images: (data.images as string[]) ?? [],
        originalPriceXAF: data.original_price_xaf as number,
        discountedPriceXAF: data.discounted_price_xaf as number,
        discountPercent: data.discount_percent as number,
        totalSlots: data.total_slots as number,
        claimedSlots: data.claimed_slots as number,
        endsAt: data.ends_at as string,
        status: data.status as FlashDeal["status"],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const countdown = useCountdown(deal?.endsAt ?? new Date(Date.now() + 86400000).toISOString());

  const handleClaim = useCallback(async () => {
    if (!deal) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate("/login"); return; }

    setClaiming(true);
    try {
      const { error: dbErr } = await supabase
        .from("flash_deal_claims")
        .insert({ deal_id: deal.id, user_id: session.session.user.id, claimed_at: new Date().toISOString() });

      if (!dbErr) {
        setClaimed(true);
        setDeal((prev) => prev ? { ...prev, claimedSlots: prev.claimedSlots + 1 } : null);
      }
    } catch {
      // silent
    } finally {
      setClaiming(false);
    }
  }, [deal, navigate]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(n) + " FCFA";

  const pad = (n: number) => String(n).padStart(2, "0");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  );

  if (error || !deal) return (
    <div className="p-4 space-y-3">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-sm text-red-600">{error ?? "Offre introuvable"}</p>
      </div>
    </div>
  );

  const slotsLeft = deal.totalSlots - deal.claimedSlots;
  const fillPercent = Math.round((deal.claimedSlots / deal.totalSlots) * 100);
  const isSoldOut = deal.status === "sold_out" || slotsLeft <= 0;
  const isExpired = deal.status === "expired" || countdown.expired;

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Image */}
      <div className="relative h-72 bg-gray-100 overflow-hidden">
        <button type="button" onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <button type="button" onClick={() => setFavorited((v) => !v)}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <Heart className={`w-4 h-4 ${favorited ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
        </button>

        {deal.imageUrl ? (
          <BambehImage src={deal.imageUrl} alt={deal.title} width={448} height={288} objectFit="cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">⚡</div>
        )}

        {/* Discount badge */}
        <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-xl font-bold text-lg shadow-lg">
          -{deal.discountPercent}%
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Flash badge */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-yellow-600 uppercase tracking-wide">Flash Deal · {deal.vendorName}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900">{deal.title}</h1>

        {/* Price */}
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold text-red-600">{formatXAF(deal.discountedPriceXAF)}</p>
          <p className="text-base text-gray-400 line-through">{formatXAF(deal.originalPriceXAF)}</p>
          <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
            Économie: {formatXAF(deal.originalPriceXAF - deal.discountedPriceXAF)}
          </span>
        </div>

        {/* Countdown */}
        {!isExpired && (
          <div className="bg-gray-900 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-sm text-yellow-400 font-medium">Offre expire dans</p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { value: countdown.hours, label: "H" },
                { value: countdown.minutes, label: "M" },
                { value: countdown.seconds, label: "S" },
              ].map(({ value, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <span className="text-gray-400 text-xl font-bold">:</span>}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white font-mono">{pad(value)}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Slots progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{deal.claimedSlots} réclamés sur {deal.totalSlots}</span>
            </div>
            <span className="text-sm font-bold text-gray-700">{slotsLeft} restants</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${fillPercent >= 80 ? "bg-red-500" : "bg-teal-500"}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{fillPercent}% réclamé</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{deal.description}</p>
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
        <button type="button" className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>

        {claimed ? (
          <div className="flex-1 py-3 bg-green-100 border border-green-300 rounded-xl flex items-center justify-center gap-2 text-green-700 font-semibold">
            <CheckCircle className="w-5 h-5" />
            Deal réclamé!
          </div>
        ) : isSoldOut || isExpired ? (
          <div className="flex-1 py-3 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-medium">
            {isSoldOut ? "Épuisé" : "Offre expirée"}
          </div>
        ) : (
          <button type="button" onClick={handleClaim} disabled={claiming}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {claiming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            {claiming ? "Réclamation..." : `Réclamer — ${formatXAF(deal.discountedPriceXAF)}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default FlashDealDetail;
