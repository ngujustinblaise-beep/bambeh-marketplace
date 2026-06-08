/**
 * src/pages/MarketplaceDetails.tsx
 * Bambeh Marketplace — Marketplace Item Detail Page
 *
 * CHANGES FROM ORIGINAL:
 *  ✅ ActionButtons (Contact Vendor / Report Ad / Share) added after description
 *  ✅ Share button in header removed — unified into ActionButtons
 *  ✅ ActionButtons receives sanitised seller phone and listing metadata
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Heart, ShoppingCart, MessageCircle,
  MapPin, Star, ShieldCheck, Eye, RefreshCw, AlertCircle,
  ChevronLeft, ChevronRight, Zap, Package,
} from "lucide-react";
import { getMarketplaceItemById, incrementMarketplaceView } from "@/services/marketplace.service";
import { useViewTracker } from "@/hooks/useViewTracker";
import type { MarketplaceItem } from "@/types/src_types_items";
// ✅ NEW: shared action buttons
import { ActionButtons } from "@/components/listings/ActionButtons";
import { useLang, t } from "@/hooks/useAppLang";

const CONDITION_LABELS: Record<string, string> = {
  new: "Neuf", like_new: "Comme neuf", good: "Bon état", fair: "Correct", poor: "À réparer",
};

const MarketplaceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useViewTracker(id, 'listings'); // ✅ increments view_count in Supabase
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiErr } = await getMarketplaceItemById(id);
      if (apiErr || !data) { setError(apiErr ?? "Article introuvable"); return; }
      setItem(data);
      void incrementMarketplaceView(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
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

  const images = item.images.map((img) => img.url);

  return (
    <div className="max-w-lg mx-auto pb-28">
      {/* Image carousel */}
      <div className="relative h-72 bg-gray-100">
        <button type="button" onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <button type="button" onClick={() => setFavorited((v) => !v)}
          aria-label={favorited ? "Remove from favourites" : "Save to favourites"}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <Heart className={`w-4 h-4 ${favorited ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
        </button>

        {images.length > 0 ? (
          <img src={images[imgIdx]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl"><Package /></div>
        )}

        {images.length > 1 && (
          <>
            <button type="button" onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm" disabled={imgIdx === 0}>
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button type="button" onClick={() => setImgIdx((i) => Math.min(images.length - 1, i + 1))}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm" disabled={imgIdx === images.length - 1}>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {images.map((_, i) => (
                <div  key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          </>
        )}

        {item.isFeatured && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> Mis en avant
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Price + title */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900 flex-1">{item.title}</h1>
            <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{CONDITION_LABELS[item.condition] ?? item.condition}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-2xl font-bold text-teal-700">{formatXAF(item.priceXAF)}</p>
            {item.isNegotiable && (
              <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Négociable</span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.location.city}</div>
          <div className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{item.viewCount} vues</div>
          <span>{new Date(item.createdAt).toLocaleDateString("fr-CM")}</span>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
        </div>

        {/* ✅ NEW: Contact / Report / Share action buttons */}
        <ActionButtons
          vendorPhone={item.seller?.phone}
          adTitle={item.title}
          adId={item.id}
          adType="marketplace"
        />

        {/* Seller */}
        {item.seller && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Vendeur</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center">
                {item.seller.avatarUrl
                  ? <img src={item.seller.avatarUrl} alt={item.seller.displayName} className="w-full h-full object-cover" />
                  : <span className="text-teal-600 font-bold text-base">{item.seller.displayName.charAt(0)}</span>
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold text-gray-900">{item.seller.displayName}</p>
                  {item.seller.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{item.seller.rating.toFixed(1)}</span>
                    <span>({item.seller.reviewCount})</span>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => navigate(`/vendor/${item.sellerId}`)}
                className="text-xs text-teal-600 hover:underline font-medium">Profil</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
        <button type="button" onClick={() => navigate(`/chat?sellerId=${item.sellerId}&listingId=${item.id}`)}
          className="flex-1 py-3 border border-teal-300 text-teal-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors">
          <MessageCircle className="w-4 h-4" />
          Contacter
        </button>
        <button type="button" onClick={() => navigate(`/checkout?listingId=${item.id}`)}
          className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
          <ShoppingCart className="w-4 h-4" />
          Acheter
        </button>
      </div>
    </div>
  );
};

export default MarketplaceDetails;
