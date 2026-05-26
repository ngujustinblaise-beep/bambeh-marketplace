/**
 * src/pages/ExchangeItem.tsx
 * Bambeh Marketplace — Exchange Item Detail
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, RefreshCcw, MapPin, Eye, MessageCircle,
  RefreshCw, AlertCircle, Heart, Share2, Package,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BambehImage, AvatarImage } from "@/components/ui/BambehImage";

interface ExchangeItemData {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  location: string;
  wantedItems: string;
  estimatedValueXAF?: number;
  allowCashSupplement: boolean;
  maxCashSupplementXAF?: number;
  viewCount: number;
  offerCount: number;
  status: string;
  createdAt: string;
}

const CONDITION_LABELS: Record<string, string> = {
  new: "Neuf", like_new: "Comme neuf", good: "Bon état", fair: "Correct", poor: "À réparer",
};

const ExchangeItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ExchangeItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from("exchange_items")
        .select("*, profiles:owner_id(display_name, avatar_url)")
        .eq("id", id)
        .single();

      if (dbErr || !data) { setError("Article introuvable"); return; }
      const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      setItem({
        id: data.id as string,
        ownerId: data.owner_id as string,
        ownerName: (profile?.display_name as string) ?? "—",
        ownerAvatar: profile?.avatar_url as string | undefined,
        title: data.title as string,
        description: data.description as string,
        category: data.category as string,
        condition: data.condition as string,
        images: (data.images as string[]) ?? [],
        location: (data.city as string) ?? "—",
        wantedItems: data.wanted_items as string,
        estimatedValueXAF: data.estimated_value_xaf as number | undefined,
        allowCashSupplement: Boolean(data.allow_cash_supplement),
        maxCashSupplementXAF: data.max_cash_supplement_xaf as number | undefined,
        viewCount: (data.view_count as number) ?? 0,
        offerCount: (data.offer_count as number) ?? 0,
        status: data.status as string,
        createdAt: data.created_at as string,
      });
      // Increment view
      await supabase.rpc("increment_view_count", { table_name: "exchange_items", record_id: id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(n) + " FCFA";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  );

  if (error || !item) return (
    <div className="p-4 space-y-3">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-sm text-red-600">{error ?? "Article introuvable"}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto pb-28">
      {/* Image */}
      <div className="relative h-72 bg-gray-100">
        <button type="button" onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <button type="button" onClick={() => setFavorited((v) => !v)}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <Heart className={`w-4 h-4 ${favorited ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
        </button>

        {item.images.length > 0 ? (
          <BambehImage src={item.images[imgIdx]} alt={item.title} width={448} height={288} objectFit="cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl"><Package /></div>
        )}

        {item.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
            {item.images.map((_, i) => (
              <button key={i} type="button" onClick={() => setImgIdx(i)}
                className={`w-2 h-2 rounded-full ${i === imgIdx ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCcw className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">Échange</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{CONDITION_LABELS[item.condition] ?? item.condition}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{item.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.viewCount}</span>
            <span>{item.offerCount} offre(s)</span>
          </div>
        </div>

        {item.estimatedValueXAF && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
            <p className="text-sm text-teal-700">Valeur estimée: <span className="font-bold">{formatXAF(item.estimatedValueXAF)}</span></p>
          </div>
        )}

        {/* Wanted */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCcw className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-orange-800">Souhaite échanger contre</h3>
          </div>
          <p className="text-sm text-orange-700 leading-relaxed">{item.wantedItems}</p>
          {item.allowCashSupplement && item.maxCashSupplementXAF && (
            <p className="text-xs text-orange-600 mt-2">
              Supplément cash accepté jusqu'à {formatXAF(item.maxCashSupplementXAF)}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center">
            {item.ownerAvatar
              ? <AvatarImage src={item.ownerAvatar} alt={item.ownerName} size={40} />
              : <span className="text-teal-600 font-bold">{item.ownerName.charAt(0)}</span>
            }
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{item.ownerName}</p>
            <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString("fr-CM")}</p>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
        <button type="button" className="w-11 h-11 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50">
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>
        <button type="button" onClick={() => navigate(`/chat?userId=${item.ownerId}&listingId=${item.id}`)}
          className="flex-1 py-3 border border-teal-300 text-teal-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors">
          <MessageCircle className="w-4 h-4" />
          Discuter
        </button>
        <button type="button" onClick={() => navigate(`/exchange/offer/${item.id}`)}
          className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
          <RefreshCcw className="w-4 h-4" />
          Faire une offre
        </button>
      </div>
    </div>
  );
};

export default ExchangeItem;
