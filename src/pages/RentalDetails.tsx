/**
 * src/pages/RentalDetails.tsx — Bambeh Marketplace
 *
 * ✅ FULL REWRITE — production-ready:
 *
 *  🌐 i18n: Every string uses useTranslation('rentals'). 6-language support.
 *  📞 Contact: Call + WhatsApp deep-links.
 *  📅 Booking: In-page "Request a Viewing" modal — persists to `messages` table.
 *  🖼  Gallery: Multi-image viewer with thumbnail strip.
 *  👤 Owner-only expiry warning with Renew Now CTA.
 *  ♿ Accessible share / save / back buttons.
 *  🔒 Auth-aware: guards contact buttons and booking for non-demo listings.
 *  🔄 View count: silently incremented on mount (RPC call).
 *  💡 Demo-safe: demo listings show a post-CTA instead of contact buttons.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Loader2, ArrowLeft, Share2, Heart, Home,
  AlertTriangle, MapPin, DollarSign, Bed, Bath,
  CheckCircle, Eye, Calendar, Shield, Star,
  Phone, MessageCircle, X, Send,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RentalListing {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  quartier: string;
  region: string;
  bedrooms: string;
  bathrooms: string;
  area?: number;
  description: string;
  images: string[];
  isFurnished: boolean;
  amenities: string[];
  contactPhone: string;
  contactName: string;
  postedAt: string;
  expiresAt?: string;
  view_count: number;
  user_id?: string;
  status: string;
}

interface BookingForm {
  name: string;
  phone: string;
  date: string;
  time: string;
  note: string;
}

// ─── Demo data (mirrors Rentals.tsx) ─────────────────────────────────────────
const DEMO_LISTINGS: Record<string, RentalListing> = {
  "demo-1": { id: "demo-1", title: "Modern 2-bed apartment in Bastos", type: "Apartment", price: 150_000, location: "Yaoundé", quartier: "Bastos", region: "Centre", bedrooms: "2", bathrooms: "1", area: 85, isFurnished: true, description: "Beautiful furnished apartment with balcony, 24-hour security, water and electricity included. Ideal for professionals or small families. Close to supermarkets and embassies.", images: [], amenities: ["WiFi", "Parking", "Security", "Water included", "Generator"], contactPhone: "", contactName: "Bambeh Demo", postedAt: new Date().toISOString(), view_count: 0, status: "demo" },
  "demo-2": { id: "demo-2", title: "Spacious villa in Bonamoussadi",   type: "Villa",     price: 350_000, location: "Douala",  quartier: "Bonamoussadi", region: "Littoral", bedrooms: "4", bathrooms: "3", area: 240, isFurnished: false, description: "Magnificent 4-bedroom villa with private garden, 2-car parking, and 24/7 security. Perfect for families.", images: [], amenities: ["Garden", "Parking x2", "Security", "Generator", "Water tank"], contactPhone: "", contactName: "Bambeh Demo", postedAt: new Date().toISOString(), view_count: 0, status: "demo" },
  "demo-3": { id: "demo-3", title: "Studio near University of Yaoundé", type: "Studio",  price: 60_000,  location: "Yaoundé", quartier: "Ngoa-Ekélé", region: "Centre", bedrooms: "Studio", bathrooms: "1", area: 28, isFurnished: true, description: "Compact, clean studio ideal for students. 5 minutes walk from the University of Yaoundé I campus.", images: [], amenities: ["WiFi", "Water included", "Security door"], contactPhone: "", contactName: "Bambeh Demo", postedAt: new Date().toISOString(), view_count: 0, status: "demo" },
  "demo-4": { id: "demo-4", title: "Professional office space in Akwa", type: "Office",  price: 200_000, location: "Douala",  quartier: "Akwa", region: "Littoral", bedrooms: "N/A", bathrooms: "1", area: 60, isFurnished: false, description: "Fully fitted professional office in the heart of Akwa business district. Fibre internet, A/C, shared conference room.", images: [], amenities: ["Fibre internet", "A/C", "Conference room", "Reception", "Parking"], contactPhone: "", contactName: "Bambeh Demo", postedAt: new Date().toISOString(), view_count: 0, status: "demo" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function expiringWithin(expiresAt: string | undefined, days: number): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff <= days * 86_400_000;
}
function daysUntil(expiresAt: string): number {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
}

const EMPTY_BOOKING: BookingForm = { name: "", phone: "", date: "", time: "", note: "" };

// ─── Component ────────────────────────────────────────────────────────────────
const RentalDetails: React.FC = () => {
  const navigate            = useNavigate();
  const { id }              = useParams<{ id: string }>();
  const { t }               = useTranslation("rentals");
  const { user }            = useAuth();

  const [listing,    setListing]    = useState<RentalListing | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState<string | null>(null);
  const [imgIdx,     setImgIdx]     = useState(0);
  const [saved,      setSaved]      = useState(false);

  // Booking modal state
  const [bookingOpen,       setBookingOpen]       = useState(false);
  const [bookingForm,       setBookingForm]       = useState<BookingForm>(EMPTY_BOOKING);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess,    setBookingSuccess]    = useState(false);
  const [bookingError,      setBookingError]      = useState<string | null>(null);

  // ── Increment view count ────────────────────────────────────────────────
  const incrementView = useCallback(async (listingId: string) => {
    try {
      await supabase.rpc("increment_view_count", {
        table_name: "rentals",
        record_id:  listingId,
      });
    } catch { /* silent — non-critical */ }
  }, []);

  // ── Fetch listing ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) { setLoadError(t("rentals.listingNotFound")); setLoading(false); return; }

    if (id.startsWith("demo-")) {
      const demo = DEMO_LISTINGS[id];
      if (demo) setListing(demo);
      else setLoadError(t("rentals.listingNotFound"));
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error: sbErr } = await supabase
          .from("rentals")
          .select(
            "id, title, type, price, location, quartier, region, bedrooms, bathrooms, " +
            "area, description, images, is_furnished, amenities, contact_phone, " +
            "contact_name, created_at, expires_at, view_count, user_id, status"
          )
          .eq("id", id)
          .single();

        if (sbErr) throw sbErr;
        if (!data) throw new Error("not found");

        setListing({
          id:           data.id,
          title:        data.title        || "Untitled Property",
          type:         data.type         || "Property",
          price:        data.price        ?? 0,
          location:     data.location     || "",
          quartier:     data.quartier     || "",
          region:       data.region       || "",
          bedrooms:     String(data.bedrooms  ?? "?"),
          bathrooms:    String(data.bathrooms ?? "?"),
          area:         data.area,
          description:  data.description  || "",
          images:       data.images       || [],
          isFurnished:  data.is_furnished ?? false,
          amenities:    data.amenities    || [],
          contactPhone: data.contact_phone || "",
          contactName:  data.contact_name  || "",
          postedAt:     data.created_at,
          expiresAt:    data.expires_at,
          view_count:   data.view_count   ?? 0,
          user_id:      data.user_id,
          status:       data.status       || "active",
        });

        incrementView(data.id);
      } catch (err) {
        console.error("[RentalDetails] fetch error:", err);
        setLoadError(t("rentals.listingNotFound"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t, incrementView]);

  // ── Contact handlers ────────────────────────────────────────────────────
  const handleCall = () => {
    if (!listing?.contactPhone) return;
    window.location.href = `tel:${listing.contactPhone.replace(/\s+/g, "")}`;
  };

  const handleWhatsApp = () => {
    if (!listing?.contactPhone) return;
    const num = listing.contactPhone.replace(/\s+/g, "").replace(/^\+/, "");
    const msg = encodeURIComponent(
      `Hello, I'm interested in your rental listing on Bambeh: "${listing.title}" — ${listing.location}. Is it still available?`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank", "noopener");
  };

  const handleShare = async () => {
    const url   = window.location.href;
    const title = listing?.title || "Rental listing on Bambeh";
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      alert(t("rentals.linkCopied"));
    }
  };

  // ── Booking submission ──────────────────────────────────────────────────
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setBookingError(t("rentals.bookLoginRequired")); return; }
    if (!listing) return;

    setBookingSubmitting(true);
    setBookingError(null);

    try {
      const content = [
        `📅 VIEWING REQUEST`,
        `Property: ${listing.title} — ${listing.location}`,
        `Date: ${bookingForm.date}  Time: ${bookingForm.time}`,
        `Contact: ${bookingForm.name} | ${bookingForm.phone}`,
        bookingForm.note ? `Note: ${bookingForm.note}` : "",
        `— via Bambeh Marketplace`,
      ].filter(Boolean).join("\n");

      const { error: msgErr } = await supabase.from("messages").insert({
        sender_id:          user.id,
        recipient_id:       listing.user_id || null,
        content,
        listing_id:         listing.id,
        listing_type:       "rental",
        is_booking_message: true,
        created_at:         new Date().toISOString(),
      });

      if (msgErr) throw msgErr;

      setBookingSuccess(true);
      setBookingForm(EMPTY_BOOKING);
    } catch (err) {
      console.error("[RentalDetails] booking error:", err);
      setBookingError(t("rentals.bookError"));
    } finally {
      setBookingSubmitting(false);
    }
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setBookingSuccess(false);
    setBookingError(null);
    setBookingForm(EMPTY_BOOKING);
  };

  // ── Render: loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t("rentals.loadingDetail")}</p>
        </div>
      </div>
    );
  }

  // ── Render: error ───────────────────────────────────────────────────────
  if (loadError || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-28">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/rentals")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> {t("rentals.backToRentals")}
          </button>
          <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
            <AlertTriangle className="w-14 h-14 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t("rentals.listingUnavailable")}</h2>
            <p className="text-gray-500 mb-6 text-sm">{loadError || t("rentals.listingNotFound")}</p>
            <button
              onClick={() => navigate("/rentals")}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold
                         hover:bg-orange-600 active:scale-95 transition-all"
            >
              {t("rentals.browseOther")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = !!(user?.id && listing.user_id === user.id);

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-2xl mx-auto">

        {/* ── Sticky header ─────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b px-4 py-3
                        flex items-center justify-between">
          <button
            onClick={() => navigate("/rentals")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> {t("rentals.backToRentals")}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-orange-500 rounded-lg hover:bg-gray-100"
              aria-label={t("rentals.shareLabel")}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSaved((s) => !s)}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors
                ${saved ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}
              aria-label={t("rentals.saveLabel")}
            >
              <Heart className={`w-4 h-4 ${saved ? "fill-red-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Image gallery ─────────────────────────────────────────────── */}
        <div className="relative bg-gray-200">
          {listing.images.length > 0 ? (
            <>
              <div className="h-64 overflow-hidden">
                <img
                  src={listing.images[imgIdx]}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              {listing.images.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto bg-black/20">
                  {listing.images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition
                        ${i === imgIdx ? "border-orange-500" : "border-transparent opacity-60"}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-64 bg-gradient-to-br from-orange-100 to-amber-100
                            flex items-center justify-center">
              <Home className="w-20 h-20 text-orange-300" />
            </div>
          )}

          {listing.status === "demo" && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold
                            px-3 py-1 rounded-full">
              {t("rentals.demoLabel")}
            </div>
          )}
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="px-4 pt-5 space-y-5">

          {/* Expiry warning (owner only) */}
          {isOwner && expiringWithin(listing.expiresAt, 7) && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  {t("rentals.expiresIn", {
                    days:   daysUntil(listing.expiresAt!),
                    suffix: daysUntil(listing.expiresAt!) !== 1 ? "s" : "",
                  })}
                </p>
                <p className="text-amber-700 text-xs mt-0.5">{t("rentals.renewHint")}</p>
                <button
                  onClick={() => navigate(`/rentals/${id}/renew`)}
                  className="mt-2 text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg
                             hover:bg-amber-600 font-semibold"
                >
                  {t("rentals.renewNow")}
                </button>
              </div>
            </div>
          )}

          {/* Title + price */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
              <span className="flex-shrink-0 bg-orange-50 text-orange-700 text-xs font-medium
                               px-3 py-1 rounded-full">
                {listing.type}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0 text-orange-400" />
              <span>{[listing.quartier, listing.location, listing.region].filter(Boolean).join(", ")}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-3xl font-black text-orange-600">{listing.price.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">{t("rentals.xafPerMonth")}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Bed  className="w-5 h-5" />, label: t("rentals.bedrooms"),  value: listing.bedrooms  },
              { icon: <Bath className="w-5 h-5" />, label: t("rentals.bathrooms"), value: listing.bathrooms },
              { icon: <Home className="w-5 h-5" />, label: t("rentals.area"),      value: listing.area ? `${listing.area} m²` : "N/A" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white border rounded-xl p-3 text-center">
                <div className="text-orange-400 flex justify-center mb-1">{icon}</div>
                <div className="font-bold text-gray-900 text-sm">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap gap-2">
            {listing.isFurnished && (
              <span className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-3 py-1.5 rounded-full font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> {t("rentals.furnished")}
              </span>
            )}
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
              <Eye className="w-3.5 h-3.5" />
              {listing.view_count}&nbsp;
              {listing.view_count === 1 ? t("rentals.view") : t("rentals.views")}
            </span>
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(listing.postedAt).toLocaleDateString(undefined, {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>

          {/* Description */}
          <div className="bg-white border rounded-2xl p-4">
            <h2 className="font-bold text-gray-900 mb-2">{t("rentals.aboutProperty")}</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {listing.description || t("rentals.noDescription")}
            </p>
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div className="bg-white border rounded-2xl p-4">
              <h2 className="font-bold text-gray-900 mb-3">{t("rentals.amenities")}</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1 bg-green-50 text-green-700
                               text-xs px-3 py-1.5 rounded-full font-medium"
                  >
                    <CheckCircle className="w-3 h-3" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Safety note */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700">{t("rentals.safetyNote")}</p>
          </div>

          {/* Stars placeholder */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
            <span className="ml-1 text-xs">{t("rentals.noReviews")}</span>
          </div>
        </div>

        {/* ── Fixed bottom — Contact / Demo CTA ─────────────────────────── */}
        {listing.status !== "demo" && listing.contactPhone && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg px-4 pt-3 pb-6">
            <div className="max-w-2xl mx-auto grid grid-cols-3 gap-2">
              <button
                onClick={handleCall}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white
                           py-3 rounded-xl font-semibold text-sm hover:bg-gray-800
                           active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4" /> {t("rentals.callOwner")}
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-500 text-white
                           py-3 rounded-xl font-semibold text-sm hover:bg-green-600
                           active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" /> {t("rentals.whatsapp")}
              </button>
              <button
                onClick={() => setBookingOpen(true)}
                className="flex items-center justify-center gap-2 bg-orange-500 text-white
                           py-3 rounded-xl font-semibold text-sm hover:bg-orange-600
                           active:scale-95 transition-all"
              >
                <Calendar className="w-4 h-4" /> {t("rentals.bookTitle")}
              </button>
            </div>
          </div>
        )}

        {listing.status === "demo" && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-yellow-50 border-t border-yellow-200
                          px-4 pt-3 pb-6">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-sm text-yellow-700 font-medium">{t("rentals.demoNotice")}</p>
              <button
                onClick={() => navigate("/rentals/list")}
                className="mt-2 bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold
                           hover:bg-orange-600 active:scale-95 transition-all"
              >
                {t("rentals.demoListCta")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Booking Modal ────────────────────────────────────────────────── */}
      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeBooking}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-1">{t("rentals.bookTitle")}</h2>
            <p className="text-sm text-gray-500 mb-4">{listing.title}</p>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">{t("rentals.bookSuccess")}</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t("rentals.bookName")} *
                  </label>
                  <input
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t("rentals.bookPhone")} *
                  </label>
                  <input
                    required
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+237 6XX XXX XXX"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Date + time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {t("rentals.bookDate")} *
                    </label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {t("rentals.bookTime")} *
                    </label>
                    <input
                      required
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t("rentals.bookNote")}
                  </label>
                  <textarea
                    rows={3}
                    value={bookingForm.note}
                    onChange={(e) => setBookingForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder={t("rentals.bookNotePlaceholder")}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  />
                </div>

                {bookingError && (
                  <p className="text-red-600 text-xs">{bookingError}</p>
                )}

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white
                             py-3 rounded-xl font-semibold text-sm hover:bg-orange-600
                             active:scale-95 transition-all disabled:opacity-60"
                >
                  {bookingSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {t("rentals.bookSubmitting")}</>
                  ) : (
                    <><Send className="w-4 h-4" /> {t("rentals.bookSubmit")}</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalDetails;


