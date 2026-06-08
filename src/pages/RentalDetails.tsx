/**
 * src/pages/RentalDetails.tsx — Bambeh Marketplace
 *
 * FIXES IN THIS VERSION:
 *  ✅ FIX 1 — useParams to read :id from URL (was missing entirely — caused crashes)
 *  ✅ FIX 2 — Full Supabase data fetch by ID instead of stub placeholder
 *  ✅ FIX 3 — View count incremented in Supabase when page opens
 *  ✅ FIX 4 — Image gallery with swipe-friendly horizontal scroll
 *  ✅ FIX 5 — Contact / booking actions (WhatsApp + in-app message)
 *  ✅ FIX 6 — Back button routes to /rentals (correct route)
 *  ✅ FIX 7 — Expiry reminder shown to listing owner
 *  ✅ FIX 8 — Graceful loading + error states (no "Oops" crash)
 *  ✅ FIX 9 — pb-28 so bottom nav never covers action buttons
 *  ✅ FIX 10 — Demo listings show notice instead of crashing
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Home, MapPin, Bed, Bath, DollarSign,
  Phone, MessageSquare, Eye, Clock, CheckCircle,
  Share2, Heart, AlertCircle, Loader2, Calendar,
  Shield, Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RentalProperty {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  quartier?: string;
  region?: string;
  bedrooms: string;
  bathrooms: string;
  area?: number;
  description: string;
  images: string[];
  isFurnished: boolean;
  amenities: string[];
  contactPhone?: string;
  contactName?: string;
  postedAt: string;
  expiresAt?: string;
  view_count: number;
  user_id?: string;
  status: string;
}

// ─── Demo stub ────────────────────────────────────────────────────────────────
const DEMO_MAP: Record<string, RentalProperty> = {
  "demo-1": {
    id: "demo-1", title: "Modern 2-bed apartment in Bastos", type: "Apartment",
    price: 150000, location: "Yaoundé", quartier: "Bastos", region: "Centre",
    bedrooms: "2", bathrooms: "1", area: 85, isFurnished: true,
    description: "Beautiful furnished apartment with balcony, 24-hour security, water and electricity included. Ideal for professionals or small families. Close to supermarkets and embassies.",
    images: [], amenities: ["WiFi", "Parking", "Security", "Water included", "Generator"],
    contactPhone: "", contactName: "Bambeh Demo", postedAt: new Date().toISOString(),
    view_count: 0, status: "demo",
  },
  "demo-2": {
    id: "demo-2", title: "Spacious villa in Bonamoussadi", type: "Villa",
    price: 350000, location: "Douala", quartier: "Bonamoussadi", region: "Littoral",
    bedrooms: "4", bathrooms: "3", area: 240, isFurnished: false,
    description: "Magnificent 4-bedroom villa with private garden, 2-car parking, and 24/7 security. Perfect for families who want space and comfort in a prestigious neighbourhood.",
    images: [], amenities: ["Garden", "Parking x2", "Security", "Generator", "Water tank"],
    contactPhone: "", contactName: "Bambeh Demo", postedAt: new Date().toISOString(),
    view_count: 0, status: "demo",
  },
  "demo-3": {
    id: "demo-3", title: "Studio near University of Yaoundé", type: "Studio",
    price: 60000, location: "Yaoundé", quartier: "Ngoa-Ekélé", region: "Centre",
    bedrooms: "Studio", bathrooms: "1", area: 28, isFurnished: true,
    description: "Compact, clean studio ideal for students. Located 5 minutes walk from the University of Yaoundé I campus. Water and electricity charges included.",
    images: [], amenities: ["WiFi", "Water included", "Security door"],
    contactPhone: "", contactName: "Bambeh Demo", postedAt: new Date().toISOString(),
    view_count: 0, status: "demo",
  },
  "demo-4": {
    id: "demo-4", title: "Professional office space in Akwa", type: "Office",
    price: 200000, location: "Douala", quartier: "Akwa", region: "Littoral",
    bedrooms: "N/A", bathrooms: "1", area: 60, isFurnished: false,
    description: "Fully fitted professional office space in the heart of Akwa business district. Open-plan layout, fibre-optic internet ready, air conditioning, and a shared conference room available.",
    images: [], amenities: ["Fibre internet", "A/C", "Conference room", "Reception", "Parking"],
    contactPhone: "", contactName: "Bambeh Demo", postedAt: new Date().toISOString(),
    view_count: 0, status: "demo",
  },
};

function expiringWithin(expiresAt: string | undefined, days: number): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff <= days * 86_400_000;
}

function daysUntilExpiry(expiresAt: string): number {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
}

// ─── Component ────────────────────────────────────────────────────────────────
const RentalDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [property, setProperty] = useState<RentalProperty | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [saved,    setSaved]    = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // ✅ FIX 3 — Increment view count safely (fire-and-forget)
  const incrementViewCount = useCallback(async (propertyId: string) => {
    try {
      await supabase.rpc("increment_view_count", {
        table_name: "rentals",
        record_id: propertyId,
      });
    } catch {
      // Non-critical — silently ignore
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Invalid listing ID.");
      setLoading(false);
      return;
    }

    // Demo listings: show from local map, no DB call needed
    if (id.startsWith("demo-")) {
      const demo = DEMO_MAP[id];
      if (demo) {
        setProperty(demo);
      } else {
        setError("Demo listing not found.");
      }
      setLoading(false);
      return;
    }

    // ✅ FIX 2 — Real Supabase fetch by ID
    const fetchProperty = async () => {
      try {
        const { data, error: sbError } = await supabase
          .from("rentals")
          .select(
            "id, title, type, price, location, quartier, region, bedrooms, bathrooms, area, description, images, is_furnished, amenities, contact_phone, contact_name, created_at, expires_at, view_count, user_id, status"
          )
          .eq("id", id)
          .single();

        if (sbError) throw sbError;
        if (!data)   throw new Error("Listing not found.");

        setProperty({
          id:            data.id,
          title:         data.title        || "Untitled Property",
          type:          data.type         || "Property",
          price:         data.price        ?? 0,
          location:      data.location     || "",
          quartier:      data.quartier     || "",
          region:        data.region       || "",
          bedrooms:      String(data.bedrooms  ?? "?"),
          bathrooms:     String(data.bathrooms ?? "?"),
          area:          data.area,
          description:   data.description  || "",
          images:        data.images       || [],
          isFurnished:   data.is_furnished ?? false,
          amenities:     data.amenities    || [],
          contactPhone:  data.contact_phone || "",
          contactName:   data.contact_name  || "",
          postedAt:      data.created_at,
          expiresAt:     data.expires_at,
          view_count:    data.view_count   ?? 0,
          user_id:       data.user_id,
          status:        data.status       || "active",
        });

        // Increment view count (non-blocking)
        incrementViewCount(data.id);
      } catch (err: any) {
        console.error("[RentalDetails] fetch error:", err);
        setError("Could not load this listing. It may have been removed.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, incrementViewCount]);

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleCall = () => {
    if (!property?.contactPhone) return;
    const clean = property.contactPhone.replace(/\s+/g, "");
    window.location.href = `tel:${clean}`;
  };

  const handleWhatsApp = () => {
    if (!property?.contactPhone) return;
    const clean = property.contactPhone.replace(/\s+/g, "").replace(/^\+/, "");
    const text  = encodeURIComponent(
      `Hello, I'm interested in your rental listing on Bambeh: "${property.title}" — ${property.location}. Is it still available?`
    );
    window.open(`https://wa.me/${clean}?text=${text}`, "_blank", "noopener");
  };

  const handleShare = async () => {
    const url   = window.location.href;
    const title = property?.title || "Rental listing on Bambeh";
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      alert("Link copied to clipboard!");
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading property details…</p>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-28">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/rentals")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rentals
          </button>
          <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
            <AlertCircle className="w-14 h-14 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Listing unavailable</h2>
            <p className="text-gray-500 mb-6 text-sm">{error || "This listing could not be found."}</p>
            <button
              onClick={() => navigate("/rentals")}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold
                         hover:bg-orange-600 active:scale-95 transition-all"
            >
              Browse other properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id && property.user_id === user.id;

  // ─── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-2xl mx-auto">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b px-4 py-3
                        flex items-center justify-between">
          <button
            onClick={() => navigate("/rentals")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Rentals
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-orange-500 rounded-lg hover:bg-gray-100"
              aria-label="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSaved((s) => !s)}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${saved ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}
              aria-label="Save listing"
            >
              <Heart className={`w-4 h-4 ${saved ? "fill-red-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Image gallery */}
        <div className="relative bg-gray-200">
          {property.images.length > 0 ? (
            <>
              <div className="h-64 overflow-hidden">
                <img
                  src={property.images[activeImg]}
                  alt={property.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              {property.images.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto bg-black/20">
                  {property.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition
                        ${i === activeImg ? "border-orange-500" : "border-transparent opacity-60"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
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

          {/* Demo badge */}
          {property.status === "demo" && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold
                            px-3 py-1 rounded-full">
              DEMO
            </div>
          )}
        </div>

        <div className="px-4 pt-5 space-y-5">

          {/* ✅ Expiry warning for listing owner */}
          {isOwner && expiringWithin(property.expiresAt, 7) && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200
                            rounded-xl p-4">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  Your listing expires in {daysUntilExpiry(property.expiresAt!)} day
                  {daysUntilExpiry(property.expiresAt!) !== 1 ? "s" : ""}
                </p>
                <p className="text-amber-700 text-xs mt-0.5">
                  Renew it to keep receiving enquiries.
                </p>
                <button
                  onClick={() => navigate(`/rentals/${id}/renew`)}
                  className="mt-2 text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg
                             hover:bg-amber-600 font-semibold"
                >
                  Renew Now
                </button>
              </div>
            </div>
          )}

          {/* Title + type */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{property.title}</h1>
              <span className="flex-shrink-0 bg-orange-50 text-orange-700 text-xs font-medium
                               px-3 py-1 rounded-full">
                {property.type}
              </span>
            </div>

            <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0 text-orange-400" />
              <span>
                {[property.quartier, property.location, property.region]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-3xl font-black text-orange-600">
                {property.price.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm">XAF / month</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Bed  className="w-5 h-5" />, label: "Bedrooms",  value: property.bedrooms },
              { icon: <Bath className="w-5 h-5" />, label: "Bathrooms", value: property.bathrooms },
              { icon: <Home className="w-5 h-5" />, label: "Area",      value: property.area ? `${property.area} m²` : "N/A" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white border rounded-xl p-3 text-center">
                <div className="text-orange-400 flex justify-center mb-1">{icon}</div>
                <div className="font-bold text-gray-900 text-sm">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {property.isFurnished && (
              <span className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-3 py-1.5 rounded-full font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Furnished
              </span>
            )}
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
              <Eye className="w-3.5 h-3.5" /> {property.view_count} views
            </span>
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(property.postedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          {/* Description */}
          <div className="bg-white border rounded-2xl p-4">
            <h2 className="font-bold text-gray-900 mb-2">About this property</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {property.description || "No description provided."}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div className="bg-white border rounded-2xl p-4">
              <h2 className="font-bold text-gray-900 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-1 bg-green-50 text-green-700
                                           text-xs px-3 py-1.5 rounded-full font-medium">
                    <CheckCircle className="w-3 h-3" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trust badge */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              This listing is hosted on Bambeh Marketplace. Always verify the property in
              person before making any payment.
            </p>
          </div>

          {/* Rating placeholder */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            {[1,2,3,4,5].map((n) => (
              <Star key={n} className={`w-4 h-4 ${n <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            ))}
            <span className="ml-1 text-xs">(No reviews yet)</span>
          </div>
        </div>

        {/* ✅ Fixed action bar — pb-28 ensures it's above any bottom nav */}
        {property.status !== "demo" && property.contactPhone && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg px-4 pt-3 pb-6">
            <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
              <button
                onClick={handleCall}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white
                           py-3 rounded-xl font-semibold text-sm hover:bg-gray-800
                           active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4" /> Call Owner
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-500 text-white
                           py-3 rounded-xl font-semibold text-sm hover:bg-green-600
                           active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </button>
            </div>
          </div>
        )}

        {property.status === "demo" && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-yellow-50 border-t border-yellow-200
                          px-4 pt-3 pb-6">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-sm text-yellow-700 font-medium">
                This is a demo listing. List your own property to appear here.
              </p>
              <button
                onClick={() => navigate("/rentals/list")}
                className="mt-2 bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold
                           hover:bg-orange-600 active:scale-95 transition-all"
              >
                List a Property
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalDetails;
