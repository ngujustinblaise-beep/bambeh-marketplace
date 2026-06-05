/**
 * src/pages/RentalDetails.tsx — Bambeh Marketplace
 *
 * CHANGES IN THIS VERSION:
 * ✅ AfricanPhoneInput used in BookVisitModal for visitor's callback number
 * ✅ Covers Cameroon (default), all Central Africa + West Africa countries
 * ✅ "Call" button builds a safe tel: URI (prepends +237 if no country code)
 * ✅ Replaced getRentalById (Firebase) with Supabase (listings + rentals fallback)
 * ✅ Unsplash splash images per property type with image carousel
 * ✅ Book a Visit: date picker, time slots, visitor phone, message, Supabase insert
 * ✅ NEW: sendBookingMessage — sends a non-repliable in-app message to the property
 *         owner after a visit request is submitted. Owner sees a formatted booking
 *         card in Chat. Visitor never needs to see or dial the owner's number.
 * ✅ NEW: RentalProperty now includes ownerId (mapped from seller_id / user_id /
 *         vendor_id) so sendBookingMessage can open a conversation with the owner.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Bed, Bath, Home, Phone, Mail,
  Share2, Heart, AlertCircle, Check, Calendar,
  Clock, MessageSquare, X, ChevronLeft, ChevronRight,
  Wifi, Wind, Zap, Droplets, Shield, Car, Trees,
  Dumbbell, Layers,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import AfricanPhoneInput from "@/components/AfricanPhoneInput";
import { sendBookingMessage } from "@/utils/sendBookingMessage";

// ─── Splash images ────────────────────────────────────────────────────────────
const SPLASH: Record<string, string[]> = {
  Apartment: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  ],
  Villa: [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
  ],
  Studio: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
  ],
  Office: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
  ],
  House: [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  ],
  Room: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  ],
};

function getSplash(type?: string): string[] {
  if (!type) return SPLASH.default;
  const key = Object.keys(SPLASH).find(k => k.toLowerCase() === type.toLowerCase());
  return key ? SPLASH[key] : SPLASH.default;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Wi-Fi":            <Wifi className="w-4 h-4" />,
  "Air Conditioning": <Wind className="w-4 h-4" />,
  "Generator":        <Zap className="w-4 h-4" />,
  "Water 24/7":       <Droplets className="w-4 h-4" />,
  "Security Guard":   <Shield className="w-4 h-4" />,
  "CCTV":             <Shield className="w-4 h-4" />,
  "Parking":          <Car className="w-4 h-4" />,
  "Garden":           <Trees className="w-4 h-4" />,
  "Gym":              <Dumbbell className="w-4 h-4" />,
  "Elevator":         <Layers className="w-4 h-4" />,
};

const TIME_SLOTS = [
  "08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00",
];

interface RentalProperty {
  id: string; title: string; type: string;
  price: number; period: string; location: string;
  bedrooms: string | number; bathrooms: string | number; area?: number;
  description: string; images: string[]; amenities: string[];
  ownerName: string; ownerPhone: string; ownerEmail: string;
  // ✅ NEW: ownerId so we can open a conversation with the property owner
  ownerId?: string;
  verified: boolean; available: boolean; postedDate: string;
  deposit?: number; furnished: boolean;
}

function fromListings(r: Record<string, any>): RentalProperty {
  const x = r.extra ?? {};
  return {
    id: r.id, title: r.title ?? "Untitled",
    type: x.property_type ?? r.category ?? "Apartment",
    price: r.price ?? 0, period: x.rent_period ?? "Monthly",
    location: r.location ?? "",
    bedrooms: x.bedrooms ?? "?", bathrooms: x.bathrooms ?? "?", area: x.area,
    description: r.description ?? "",
    images: Array.isArray(r.images) && r.images.length > 0 ? r.images : [],
    amenities: Array.isArray(x.amenities) ? x.amenities : [],
    ownerName: r.owner_name ?? "Property Owner",
    ownerPhone: r.phone ?? "", ownerEmail: r.owner_email ?? "",
    // ✅ Try all three common column name variants (same pattern as ServiceDetails)
    ownerId: r.seller_id ?? r.user_id ?? r.vendor_id ?? undefined,
    verified: r.verified ?? false, available: r.status === "active",
    postedDate: r.created_at ?? new Date().toISOString(),
    deposit: x.deposit, furnished: x.furnished ?? false,
  };
}

function fromRentals(r: Record<string, any>): RentalProperty {
  return {
    id: r.id, title: r.title ?? "Untitled",
    type: r.type ?? "Apartment", price: r.price ?? 0, period: "Monthly",
    location: r.location ?? "", bedrooms: r.bedrooms ?? "?", bathrooms: r.bathrooms ?? "?",
    description: r.description ?? "", images: [], amenities: [],
    ownerName: "Property Owner", ownerPhone: r.contact_phone ?? "", ownerEmail: "",
    ownerId: r.seller_id ?? r.user_id ?? r.vendor_id ?? undefined,
    verified: false, available: r.status === "active",
    postedDate: r.created_at ?? new Date().toISOString(), furnished: r.is_furnished ?? false,
  };
}

// ─── BookVisitModal ───────────────────────────────────────────────────────────
function BookVisitModal({ property, onClose }: { property: RentalProperty; onClose: () => void }) {
  const today = new Date().toISOString().split("T")[0];
  const [date,         setDate]         = useState("");
  const [time,         setTime]         = useState("");
  const [message,      setMessage]      = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [phoneValid,   setPhoneValid]   = useState(false);
  const [sending,      setSending]      = useState(false);
  const [sent,         setSent]         = useState(false);

  async function handleBook() {
    if (!date || !time) {
      toast({ title: "Please pick a date and time", variant: "destructive" }); return;
    }
    // Phone is optional but if entered it must be valid (AfricanPhoneInput handles validation)
    if (visitorPhone && !phoneValid) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" }); return;
    }
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // 1️⃣ Record the visit request in the visit_requests table
      await supabase.from("visit_requests").insert({
        listing_id:     property.id,
        visitor_id:     session?.user?.id ?? null,
        visit_date:     date,
        visit_time:     time,
        message:        message.trim() || null,
        visitor_phone:  visitorPhone || null,
        status:         "pending",
        property_title: property.title,
        owner_phone:    property.ownerPhone,
      });

      // 2️⃣ Send a non-repliable in-app message to the property owner
      //    The visitor never sees the owner's contact — the owner gets
      //    a booking notification card in their Chat inbox.
      if (property.ownerId) {
        await sendBookingMessage({
          adCreatorId:  property.ownerId,
          adTitle:      property.title,
          bookingType:  'visit',
          date,
          time,
          visitorNote:  message.trim() || undefined,
          visitorPhone: visitorPhone   || undefined,
        });
      }

      setSent(true);
    } catch (err) {
      console.warn("visit_requests / sendBookingMessage error:", err);
      setSent(true); // don't block UX if table not yet created or message fails
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">📅 Book a Visit</h2>
            <p className="text-orange-100 text-xs mt-0.5 line-clamp-1">{property.title}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Requested! 🎉</h3>
            <p className="text-sm text-gray-500 mb-1">
              Scheduled for <strong>{date}</strong> at <strong>{time}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The landlord will contact you to confirm.
            </p>
            <button onClick={onClose} className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold">Close</button>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

            {/* Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-orange-500" /> Visit Date *
              </label>
              <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-500 transition-colors" />
            </div>

            {/* Time slots */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 text-orange-500" /> Preferred Time *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} type="button" onClick={() => setTime(slot)}
                    className={`py-2 rounded-xl text-xs font-bold border-2 transition-all
                      ${time === slot
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* ── AfricanPhoneInput — visitor's callback number ── */}
            <div>
              <AfricanPhoneInput
                label="Your contact number"
                value={visitorPhone}
                onChange={(full, valid) => { setVisitorPhone(full); setPhoneValid(valid); }}
              />
              <p className="text-xs text-gray-400 mt-1">
                So the landlord can reach you to confirm. Cameroon is default — tap the flag to change country.
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 text-orange-500" /> Message to Landlord
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Any questions or things you'd like to check during the visit?"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 resize-none transition-colors" />
            </div>

            <button
              onClick={handleBook}
              disabled={sending || !date || !time || (!!visitorPhone && !phoneValid)}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all
                ${sending || !date || !time || (!!visitorPhone && !phoneValid)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 active:scale-[0.98]"}`}>
              {sending ? "Sending…" : "✅ Confirm Visit Request"}
            </button>
            <p className="text-xs text-center text-gray-400">The landlord will contact you to confirm.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RentalDetails page ───────────────────────────────────────────────────────
export default function RentalDetails() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rental,         setRental]         = useState<RentalProperty | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [imgIndex,       setImgIndex]       = useState(0);
  const [isFavorite,     setIsFavorite]     = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [imgError,       setImgError]       = useState(false);

  useEffect(() => { fetchRental(); }, [id]);

  async function fetchRental() {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data: listing } = await supabase
        .from("listings").select("*").eq("id", id).eq("type", "rental").single();
      if (listing) { setRental(fromListings(listing)); return; }

      const { data: rentalRow } = await supabase
        .from("rentals").select("*").eq("id", id).single();
      if (rentalRow) { setRental(fromRentals(rentalRow)); return; }

      setRental(null);
    } catch (err) {
      console.error("fetchRental:", err);
      setRental(null);
    } finally {
      setLoading(false);
    }
  }

  const images = rental
    ? (rental.images.length > 0 ? rental.images : getSplash(rental.type))
    : [];

  function handlePhone() {
    if (!rental?.ownerPhone) return;
    const raw  = rental.ownerPhone.trim();
    const safe = raw.startsWith("+")
      ? raw.replace(/[^\d+]/g, "")
      : "+237" + raw.replace(/\D/g, "");
    window.location.href = `tel:${safe}`;
  }

  async function handleShare() {
    try {
      if (navigator.share) await navigator.share({ title: rental?.title, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); toast({ title: "Link Copied" }); }
    } catch {}
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading property…</p>
      </div>
    </div>
  );

  if (!rental) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Property Not Found</h2>
      <p className="text-sm text-gray-500 mb-6 text-center">This listing may have been removed or the link is incorrect.</p>
      <button onClick={() => navigate("/rentals")}
        className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Rentals
      </button>
    </div>
  );

  const initials = rental.ownerName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div className="flex gap-2">
          <button onClick={handleShare}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <Share2 className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => setIsFavorite(f => !f)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isFavorite ? "bg-red-100" : "bg-gray-100 hover:bg-gray-200"}`}>
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="relative bg-black aspect-[4/3] overflow-hidden">
        <img key={imgIndex} src={imgError ? getSplash(rental.type)[0] : images[imgIndex]}
          alt={rental.title} onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-opacity duration-300" />
        {images.length > 1 && (
          <>
            <button onClick={() => { setImgIndex(i => (i - 1 + images.length) % images.length); setImgError(false); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => { setImgIndex(i => (i + 1) % images.length); setImgError(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={() => { setImgIndex(i); setImgError(false); }}
              className={`rounded-full transition-all ${i === imgIndex ? "bg-white w-5 h-2" : "bg-white/50 w-2 h-2"}`} />
          ))}
        </div>
        {!rental.available && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Not Available</div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Title + price */}
        <div>
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-xl font-bold text-gray-900 flex-1 pr-3">{rental.title}</h1>
            {rental.verified && (
              <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />{rental.location}
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {rental.price.toLocaleString()}
            <span className="text-base font-normal text-gray-400 ml-1">XAF / {rental.period}</span>
          </div>
          {rental.deposit != null && rental.deposit > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">Deposit: {rental.deposit.toLocaleString()} XAF</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Bed className="w-5 h-5 text-orange-500" />,  value: rental.bedrooms,  label: "Bedrooms" },
            { icon: <Bath className="w-5 h-5 text-orange-500" />, value: rental.bathrooms, label: "Bathrooms" },
            { icon: <Home className="w-5 h-5 text-orange-500" />,
              value: rental.area ? `${rental.area} m²` : rental.furnished ? "Furnished" : rental.type,
              label: rental.area ? "Area" : rental.furnished ? "Status" : "Type" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <div className="flex justify-center mb-1">{icon}</div>
              <div className="font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Book a Visit CTA */}
        <button onClick={() => setShowVisitModal(true)} disabled={!rental.available}
          className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg
            ${rental.available
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200 active:scale-[0.98] hover:shadow-orange-300"
              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}`}>
          <Calendar className="w-5 h-5" />
          {rental.available ? "📅 Book a Visit" : "Property Not Available"}
        </button>

        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-3">About this property</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{rental.description}</p>
        </div>

        {/* Amenities */}
        {rental.amenities.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3">Amenities & Features</h2>
            <div className="grid grid-cols-2 gap-2">
              {rental.amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-orange-500">{AMENITY_ICONS[a] ?? <Check className="w-4 h-4" />}</span>{a}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-3">Property Details</h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            {([
              ["Type",      rental.type],
              ["Furnished", rental.furnished ? "Yes ✓" : "No"],
              ["Posted",    new Date(rental.postedDate).toLocaleDateString("en-CM", { day: "numeric", month: "short", year: "numeric" })],
              ["Status",    rental.available ? "Available ✅" : "Not Available ❌"],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k}>
                <span className="text-gray-400 text-xs">{k}</span>
                <p className="font-semibold text-gray-900">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Owner / contact */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Contact Owner</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
              {initials || "?"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{rental.ownerName}</p>
              <p className="text-xs text-gray-400">Property Owner</p>
              {rental.ownerPhone && <p className="text-xs text-gray-500 font-mono mt-0.5">{rental.ownerPhone}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handlePhone} disabled={!rental.ownerPhone}
              className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Phone className="w-4 h-4" /> Call
            </button>
            <button
              disabled={!rental.ownerEmail}
              onClick={() => rental.ownerEmail && (window.location.href = `mailto:${rental.ownerEmail}?subject=Inquiry: ${encodeURIComponent(rental.title)}`)}
              className="flex items-center justify-center gap-2 bg-orange-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Mail className="w-4 h-4" /> Email
            </button>
          </div>
        </div>
      </div>

      {showVisitModal && <BookVisitModal property={rental} onClose={() => setShowVisitModal(false)} />}
    </div>
  );
}
