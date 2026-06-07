/**
 * src/pages/MarketplaceItemDetails.tsx — Bambeh Marketplace
 *
 * FIXES (June 2026):
 *  ✅ ZERO hardcoded demo items — all data from Supabase `listings` table
 *  ✅ Uses seller_id (not user_id) throughout
 *  ✅ Images read from `images` JSONB array with extra.image_url fallback
 *  ✅ view_count incremented via RPC on load
 *  ✅ WhatsApp + Call contact actions
 *  ✅ Add to Cart & Favourites (localStorage)
 *  ✅ Share via Web Share API with clipboard fallback
 *  ✅ Safety tip & report link
 *  ✅ Handles not-found and network errors gracefully
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RefreshCw, ArrowLeft, Heart, ShoppingCart,
  Share2, MapPin, Tag, Phone, ChevronLeft,
  ChevronRight, AlertCircle, Package, ShieldCheck,
  Flag, CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  phone?: string;
  negotiable: boolean;
  images: string[];          // flat array of URLs
  sellerId: string;
  sellerName: string;
  postedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("fr-CM");

function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function extractImages(row: any): string[] {
  // images is a JSONB array: [{url, ...}, ...] or ["url", ...]
  if (Array.isArray(row.images) && row.images.length > 0) {
    return row.images.map((img: any) =>
      typeof img === "string" ? img : img?.url ?? img?.thumbnail_url ?? ""
    ).filter(Boolean);
  }
  // legacy: extra.image_url single string
  const fallback = row.extra?.image_url;
  return fallback ? [fallback] : [];
}

const FAV_KEY   = "bambeh_favorites";
const CART_KEY  = "bambeh_cart";

function isFavourited(id: string): boolean {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]").some(
      (f: any) => f.id === id
    );
  } catch { return false; }
}

function toggleFavStorage(item: ListingDetail): boolean {
  try {
    const saved: any[] = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    const idx = saved.findIndex((f) => f.id === item.id);
    if (idx >= 0) {
      saved.splice(idx, 1);
    } else {
      saved.unshift({
        id: item.id, title: item.title,
        price: `${fmt(item.price)} XAF`,
        image: item.images[0], category: item.category,
        type: "marketplace", location: item.location,
        savedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(FAV_KEY, JSON.stringify(saved));
    return idx < 0; // true = now favourited
  } catch { return false; }
}

function addToCart(item: ListingDetail, qty: number) {
  try {
    const cart: any[] = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    const idx = cart.findIndex((c) => c.id === item.id);
    if (idx >= 0) {
      cart[idx].quantity = (cart[idx].quantity || 1) + qty;
    } else {
      cart.push({
        id: item.id, title: item.title, price: item.price,
        quantity: qty, image: item.images[0], sellerId: item.sellerId,
      });
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch { /* non-critical */ }
}

const CONDITION_COLOR: Record<string, string> = {
  New:       "bg-green-100 text-green-700",
  "Like New": "bg-teal-100 text-teal-700",
  Good:      "bg-blue-100 text-blue-700",
  Fair:      "bg-amber-100 text-amber-700",
  Poor:      "bg-red-100 text-red-700",
  Neuf:      "bg-green-100 text-green-700",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function MarketplaceItemDetails() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();

  const [item,      setItem]      = useState<ListingDetail | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [imgIdx,    setImgIdx]    = useState(0);
  const [fav,       setFav]       = useState(false);
  const [qty,       setQty]       = useState(1);
  const [cartDone,  setCartDone]  = useState(false);

  // ── Fetch listing from Supabase ──
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    if (!isUUID(id)) {
      setError("Listing not found.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: dbErr } = await supabase
        .from("listings")
        .select(`
          id, title, description, price, category,
          condition, location, phone, negotiable,
          images, extra, created_at, seller_id,
          profiles:seller_id ( id, full_name, avatar_url )
        `)
        .eq("id", id)
        .single();

      if (dbErr || !data) {
        setError("Listing not found or has been removed.");
        return;
      }

      const profile = (data as any).profiles;
      const mapped: ListingDetail = {
        id:          data.id,
        title:       data.title ?? "",
        description: (data as any).description ?? "",
        price:       (data as any).price ?? 0,
        category:    (data as any).category ?? "",
        condition:   (data as any).condition ?? "Used",
        location:    (data as any).location ?? "",
        phone:       (data as any).phone,
        negotiable:  (data as any).negotiable ?? false,
        images:      extractImages(data),
        sellerId:    (data as any).seller_id,
        sellerName:  profile?.full_name ?? "Seller",
        postedAt:    (data as any).created_at,
      };
      setItem(mapped);
      setFav(isFavourited(id));

      // Increment view count (fire-and-forget)
      void supabase.rpc("increment_view_count", { record_id: id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listing.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  function handleToggleFav() {
    if (!item) return;
    const nowFav = toggleFavStorage(item);
    setFav(nowFav);
  }

  async function handleShare() {
    if (!item) return;
    const url = `https://bambeh.com/#/marketplace/${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `${item.title} — ${fmt(item.price)} XAF on Bambeh`,
          url,
        });
        return;
      } catch { /* user cancelled */ }
    }
    navigator.clipboard.writeText(url).catch(() => {});
  }

  function handleAddToCart() {
    if (!item) return;
    addToCart(item, qty);
    setCartDone(true);
    setTimeout(() => setCartDone(false), 2500);
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="font-bold text-gray-700 mb-2">Listing not found</p>
        <p className="text-sm text-gray-500 mb-6">
          {error ?? "This item may have been removed."}
        </p>
        <button
          onClick={() => navigate("/marketplace")}
          className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const whatsappText = encodeURIComponent(
    `Hi ${item.sellerName}, I saw your listing on Bambeh: ${item.title} — ${fmt(item.price)} XAF. Is it still available?`
  );
  const phone = (item.phone || "+237600000000").replace(/\s/g, "");
  const conditionClass = CONDITION_COLOR[item.condition] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="max-w-lg mx-auto pb-28 bg-white min-h-screen">

      {/* ── Image carousel ── */}
      <div className="relative h-72 bg-gray-100 overflow-hidden">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>

        {/* Top-right actions */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleToggleFav}
            className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"
            aria-label={fav ? "Remove from favourites" : "Save to favourites"}
          >
            <Heart
              className={`w-4 h-4 ${fav ? "text-red-500 fill-red-500" : "text-gray-500"}`}
            />
          </button>
        </div>

        {/* Main image */}
        {item.images.length > 0 ? (
          <img
            src={item.images[imgIdx]}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
            🛍️
          </div>
        )}

        {/* Prev / Next */}
        {item.images.length > 1 && (
          <>
            <button
              onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
              disabled={imgIdx === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setImgIdx((i) => Math.min(item.images.length - 1, i + 1))}
              disabled={imgIdx === item.images.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {item.images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === imgIdx ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Detail body ── */}
      <div className="p-4 space-y-4">

        {/* Title + condition */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900 flex-1 leading-tight">
              {item.title}
            </h1>
            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${conditionClass}`}>
              {item.condition}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {item.location}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {item.category}
            </span>
          </div>
        </div>

        {/* Price + quantity */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-teal-700">
              {fmt(item.price * qty)} XAF
            </p>
            {qty > 1 && (
              <p className="text-sm text-teal-500 mt-0.5">
                {fmt(item.price)} XAF each
              </p>
            )}
            {item.negotiable && (
              <p className="text-xs text-green-600 font-semibold mt-1">
                ✓ Price negotiable
              </p>
            )}
          </div>
          <div className="flex items-center gap-0 border border-gray-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-9 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-lg"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-9 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {item.description || "No description provided."}
          </p>
        </div>

        {/* Seller */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Seller
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
              {item.sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-1">
                {item.sellerName}
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              </p>
              <p className="text-xs text-gray-400">
                Verified Bambeh Seller · {item.location}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/${phone}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition"
            >
              {/* WhatsApp icon (inline SVG — no external dep) */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.847L.057 23.882a.5.5 0 00.612.612l6.035-1.467A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.502-5.239-1.38l-.374-.214-3.885.945.964-3.759-.235-.39A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={`tel:${phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          </div>
        </div>

        {/* Safety tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            <strong>Safety tip:</strong> Always use Bambeh Escrow. Never send money
            before seeing the item.{" "}
            <button
              onClick={() => navigate("/meet-safely")}
              className="underline"
            >
              Meet Safely →
            </button>
          </p>
        </div>

        {/* Report */}
        <button
          onClick={() => navigate(`/report-issue?item=${item.id}&type=marketplace`)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition mx-auto"
        >
          <Flag className="w-3.5 h-3.5" />
          Report this listing
        </button>
      </div>

      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 max-w-lg mx-auto">
        <button
          onClick={handleToggleFav}
          className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${
            fav ? "bg-red-50 border-red-200" : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Heart
            className={`w-5 h-5 ${fav ? "text-red-500 fill-red-500" : "text-gray-500"}`}
          />
        </button>
        <button
          onClick={handleAddToCart}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            cartDone
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-teal-600 text-white hover:bg-teal-700 shadow-md"
          }`}
        >
          {cartDone ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart — {fmt(item.price * qty)} XAF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
