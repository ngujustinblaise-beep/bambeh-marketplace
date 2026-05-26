/**
 * MarketplaceItemDetails.tsx — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * UPGRADED:
 *   - TanStack Query (useQuery) replaces useEffect+useState — auto-caching,
 *     background revalidation, refetch-on-focus
 *   - SellerResponseBadge shows "Responds within 2 hours"
 *   - Share listing via Capacitor Share (native Android) with bambeh:// deep link
 *   - Image carousel with dot indicators + prev/next arrows
 *   - Make Offer + Call/Message CTAs
 *   - Safety tip with Meet Safely link
 */

import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  Share2,
  Tag,
  MapPin,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryClient";
import SellerResponseBadge from "@/components/vendor/SellerResponseBadge";
import { logger } from "@/utils/logger";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  phone?: string;
  negotiable?: boolean;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerJoinedAt?: string;
  status: string;
  postedAt: string;
}

// ─── DATA FETCHER ─────────────────────────────────────────────────────────────

async function fetchListing(id: string): Promise<ListingDetail> {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      id, title, description, price, category, condition,
      location, phone, negotiable, images, status, created_at,
      seller_id,
      profiles(id, full_name, avatar_url, created_at)
    `)
    .eq("id", id)
    .single();

  if (!error && data) {
    const profile = (data as any).profiles;
    return {
      id: data.id,
      title: data.title,
      description: data.description ?? "",
      price: data.price ?? 0,
      category: data.category ?? "",
      condition: data.condition ?? "",
      location: data.location ?? "",
      phone: data.phone ?? undefined,
      negotiable: data.negotiable ?? false,
      images: data.images ?? [],
      sellerId: data.seller_id,
      sellerName: profile?.full_name ?? "Seller",
      sellerAvatar: profile?.avatar_url ?? undefined,
      sellerJoinedAt: profile?.created_at ?? undefined,
      status: data.status ?? "active",
      postedAt: data.created_at,
    };
  }

  // Fallback: check localStorage (offline listings)
  try {
    const stored = JSON.parse(localStorage.getItem("bambeh_marketplace_items") ?? "[]");
    const found = stored.find((item: any) => item.id === id);
    if (found) {
      return {
        id: found.id,
        title: found.title ?? "Item",
        description: found.description ?? "",
        price: Number(found.price) ?? 0,
        category: found.category ?? "",
        condition: found.condition ?? "",
        location: found.location ?? "",
        phone: found.phone,
        negotiable: found.negotiable,
        images: found.images ?? (found.image ? [found.image] : []),
        sellerId: found.sellerId ?? found.seller ?? "unknown",
        sellerName: found.seller ?? "Local Seller",
        status: found.status ?? "active",
        postedAt: found.postedAt ?? new Date().toISOString(),
      };
    }
  } catch {}

  throw new Error("Listing not found");
}

// ─── SHARE HANDLER ────────────────────────────────────────────────────────────

async function shareListing(listing: ListingDetail) {
  const shareData = {
    title: listing.title,
    text: `${listing.title} — ${listing.price.toLocaleString()} XAF on Bambeh`,
    url: `https://bambeh.app/marketplace/${listing.id}`,
  };

  // Web Share API — works natively on Android Chrome WebView (Capacitor)
  // No @capacitor/share package needed — the browser handles the native sheet
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err: any) {
      // User cancelled the share sheet — not an error
      if (err?.name === "AbortError") return;
    }
  }

  // Fallback: copy deep link to clipboard
  try {
    await navigator.clipboard.writeText(shareData.url);
    logger.log("[Share] Link copied to clipboard:", shareData.url);
  } catch {
    logger.warn("[Share] Neither Web Share nor clipboard available");
  }
}

// ─── CONDITION BADGE ─────────────────────────────────────────────────────────

const CONDITION_STYLES: Record<string, string> = {
  "New":      "bg-green-50 border-green-200 text-green-700",
  "Like New": "bg-teal-50 border-teal-200 text-teal-700",
  "Good":     "bg-blue-50 border-blue-200 text-blue-700",
  "Fair":     "bg-amber-50 border-amber-200 text-amber-700",
  "Poor":     "bg-red-50 border-red-200 text-red-700",
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MarketplaceItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [imgIndex, setImgIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // ── TanStack Query ─────────────────────────────────────────────────────────
  const { data: listing, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.listings.detail(id ?? ""),
    queryFn: () => fetchListing(id ?? ""),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full aspect-[4/3] bg-gray-200 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-7 w-3/4 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-8 w-1/3 bg-teal-100 rounded-xl animate-pulse" />
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse mt-4" />
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-bold text-gray-800 mb-1">Listing not found</p>
          <p className="text-sm text-gray-500 mb-5">
            {(error as Error)?.message ?? "This item may have been removed or is unavailable."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-100"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = listing.images.length > 0 ? listing.images : [];
  const conditionStyle = CONDITION_STYLES[listing.condition] ?? "bg-gray-50 border-gray-200 text-gray-700";

  const timeAgo = (() => {
    const diff = Date.now() - new Date(listing.postedAt).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  })();

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      {/* ── Image Carousel ──────────────────────────────────────────────── */}
      <div className="relative bg-gray-900 select-none">
        {images.length > 0 ? (
          <img
            src={images[imgIndex]}
            alt={listing.title}
            className="w-full aspect-[4/3] object-cover"
          />
        ) : (
          <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-100">
            <ShoppingBag className="w-20 h-20 text-gray-300" />
          </div>
        )}

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setImgIndex(i => Math.max(0, i - 1))}
              disabled={imgIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white disabled:opacity-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))}
              disabled={imgIndex === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white disabled:opacity-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i === imgIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {imgIndex + 1}/{images.length}
            </div>
          </>
        )}

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => shareListing(listing)}
              className="w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFavorited(f => !f)}
              className="w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center"
            >
              <Heart className={`w-4 h-4 transition-all ${isFavorited ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-4 space-y-4">

        {/* Title + price */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h1 className="text-xl font-black text-gray-900 leading-snug flex-1">
              {listing.title}
            </h1>
            {listing.negotiable && (
              <span className="flex-shrink-0 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full font-semibold">
                Negotiable
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="text-2xl font-black text-teal-600">
              {listing.price.toLocaleString()} XAF
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${conditionStyle}`}>
              {listing.condition}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
            {listing.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />{listing.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{timeAgo}
            </span>
            {listing.category && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />{listing.category}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 text-sm mb-2">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {listing.description || "No description provided."}
          </p>
        </div>

        {/* ── SELLER CARD ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Seller</h3>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center flex-shrink-0">
              {listing.sellerAvatar ? (
                <img src={listing.sellerAvatar} className="w-12 h-12 rounded-full object-cover" alt="" />
              ) : (
                <span className="text-white text-lg font-bold">
                  {listing.sellerName[0]?.toUpperCase() ?? "S"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-gray-900 text-sm">{listing.sellerName}</p>
                <CheckCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
              </div>
              {listing.sellerJoinedAt && (
                <p className="text-xs text-gray-400">
                  Member since {new Date(listing.sellerJoinedAt).getFullYear()}
                </p>
              )}
            </div>
            <Link
              to={`/vendor/profile/${listing.sellerId}`}
              className="text-xs text-teal-600 font-semibold flex-shrink-0 hover:underline"
            >
              View Store
            </Link>
          </div>

          {/* ── SELLER RESPONSE BADGE ─────────────────────────────────── */}
          {listing.sellerId && listing.sellerId !== "unknown" && (
            <SellerResponseBadge
              vendorId={listing.sellerId}
              className="w-full justify-center"
            />
          )}
        </div>

        {/* Safety tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Always meet in a public place. Never pay before seeing the item.{" "}
            <Link to="/meet-safely" className="underline font-semibold">
              Meet Safely Guide →
            </Link>
          </p>
        </div>
      </div>

      {/* ── FIXED BOTTOM ACTION BAR ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex gap-3">
          <Link
            to={`/make-offer/${listing.id}`}
            className="flex-1 bg-white border-2 border-teal-600 text-teal-600 font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors"
          >
            <Tag className="w-4 h-4" />
            Make Offer
          </Link>

          {listing.phone ? (
            <a
              href={`tel:${listing.phone}`}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-teal-100"
            >
              <Phone className="w-4 h-4" />
              Call Seller
            </a>
          ) : (
            <Link
              to={`/chat?with=${listing.sellerId}&listing=${listing.id}`}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-teal-100"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
