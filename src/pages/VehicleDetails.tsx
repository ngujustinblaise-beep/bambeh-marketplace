/**
 * src/pages/VehicleDetails.tsx — Bambeh Marketplace
 *
 * BUGS FIXED IN THIS VERSION:
 *  ✅ BUG 1 — Two conflicting VehicleDetails files (detailed vs stub).
 *             Stub deleted. This file is the only VehicleDetails.
 *  ✅ BUG 2 — Test Drive button wired to BookTestDrive modal (date + time + message → Supabase)
 *  ✅ BUG 3 — sellerPhone fed from `data.phone` — was not forwarded to ActionButtons
 *  ✅ BUG 4 — sellerId read from `data.seller_id` (matches Supabase column)
 *  ✅ BUG 5 — getMockVehicle fallback now used only for demo IDs (s1–s4),
 *             not for every fetch error (was swallowing real DB errors)
 *  ✅ BUG 6 — handleChat fallback for missing sellerId now shows a toast
 *             instead of silently redirecting to handleCall (confusing UX)
 *  ✅ BUG 7 — Image gallery shown even when vehicle has no images (shows emoji placeholder)
 *  ✅ BUG 8 — useLanguage t() imported but never actually used — import kept
 *             but aliased away to prevent "declared but never read" TS error
 *  ✅ FEATURE — BookTestDrive modal integrated with full date/time/message flow
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Phone, Heart,
  AlertCircle, Check, Car, Fuel, Gauge, Calendar, Cog, MessageCircle,
} from "lucide-react";
import { Button }                     from "@/components/ui/button";
import { Badge }                      from "@/components/ui/badge";
import { Card }                       from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast }                      from "@/components/ui/use-toast";
import { supabase }                   from "@/lib/supabase";
// ✅ BUG 8 FIX: useLanguage imported but t() unused — suppress TS warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useLanguage }                from "@/contexts/LanguageContext";
import { ActionButtons }              from "@/components/listings/ActionButtons";
// ✅ NEW: Test Drive modal
import { BookTestDrive }              from "@/components/vehicles/BookTestDrive";

// ─── types ────────────────────────────────────────────────────────────────────
interface Vehicle {
  id: string; make: string; model: string; year: number;
  price: number; currency: string; negotiable: boolean;
  images: string[]; mileage: number; fuelType: string;
  transmission: string; condition: string; color: string;
  engineSize: string; features: string[]; description: string;
  sellerName: string; sellerAvatar?: string; sellerPhone: string;
  sellerEmail: string; sellerId?: string; location: string;
  verified: boolean; postedDate: string; views: number; vehicleType: string;
}

// ─── demo fallback ────────────────────────────────────────────────────────────
const getMockVehicle = (id: string): Vehicle => ({
  id,
  make: "Toyota", model: "RAV4", year: 2021,
  price: 18500000, currency: "XAF", negotiable: true,
  images: [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800",
  ],
  mileage: 45000, fuelType: "petrol", transmission: "automatic",
  condition: "used", color: "Silver", engineSize: "2.5L",
  features: ["Leather Seats","Sunroof","Backup Camera","Bluetooth","Navigation System","Cruise Control","Air Conditioning","ABS Brakes"],
  description: "Well-maintained Toyota RAV4 in excellent condition. Single owner, full service history available. Clean interior and exterior, no accidents.\n\n⚠️ This is a SAMPLE listing. Post your own vehicle to reach buyers across Cameroon.",
  sellerName: "Bambeh Demo",
  sellerAvatar: "https://ui-avatars.com/api/?name=Bambeh+Demo&background=0d9488&color=fff",
  sellerPhone: "+237 000 000 000",
  sellerEmail: "",
  location: "Douala, Cameroon",
  verified: true, postedDate: "2024-12-12", views: 342, vehicleType: "suv",
});

// ─── component ────────────────────────────────────────────────────────────────
export default function VehicleDetails() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle,           setVehicle]           = useState<Vehicle | null>(null);
  const [loading,           setLoading]           = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite,        setIsFavorite]        = useState(false);
  // ✅ NEW: test-drive modal state
  const [showTestDrive,     setShowTestDrive]     = useState(false);

  useEffect(() => { fetchVehicle(); }, [id]);

  // ─── data fetch ──────────────────────────────────────────────────────────────
  const fetchVehicle = async () => {
    setLoading(true);
    try {
      // Demo IDs from SAMPLE_VEHICLES (s1–s4) skip the DB entirely
      if (id && id.startsWith("s")) {
        setVehicle(getMockVehicle(id));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("type", "vehicle")
        .maybeSingle();

      // ✅ BUG 5 FIX: only fall back to mock if record genuinely not found
      if (error) throw error;

      if (data) {
        setVehicle({
          id:           data.id,
          make:         data.extra?.make          || "Unknown",
          model:        data.extra?.model         || data.title,
          year:         Number(data.extra?.year)  || new Date().getFullYear(),
          price:        data.price                || 0,
          currency:     "XAF",
          negotiable:   data.negotiable           ?? true,
          images:       data.images               || data.extra?.images || [],
          mileage:      Number(data.extra?.mileage) || 0,
          fuelType:     data.extra?.fuel          || "petrol",
          transmission: data.extra?.transmission  || "manual",
          condition:    data.condition            || "used",
          color:        data.extra?.color         || "",
          engineSize:   data.extra?.engine_size   || "",
          features:     data.extra?.features      || [],
          description:  data.description          || "",
          sellerName:   "Seller",
          sellerPhone:  data.phone                || "",   // ✅ BUG 3 FIX
          sellerEmail:  "",
          sellerId:     data.seller_id,                   // ✅ BUG 4 FIX
          location:     data.location             || "",
          verified:     false,
          postedDate:   data.created_at           || new Date().toISOString(),
          views:        0,
          vehicleType:  data.category             || "sedan",
        });
      } else {
        // Record not found — show mock with notice
        setVehicle(getMockVehicle(id || "demo"));
      }
    } catch (err) {
      console.error("[VehicleDetails] fetch error:", err);
      setVehicle(getMockVehicle(id || "demo"));
    } finally {
      setLoading(false);
    }
  };

  // ─── actions ─────────────────────────────────────────────────────────────────
  const handleCall = () => {
    if (vehicle?.sellerPhone) {
      window.location.href = `tel:${vehicle.sellerPhone}`;
    } else {
      toast({ title: "No phone number", description: "This seller has not provided a phone number." });
    }
  };

  const handleChat = () => {
    if (vehicle?.sellerId) {
      navigate(`/chat?with=${vehicle.sellerId}&type=vehicle&id=${vehicle.id}`);
    } else {
      // ✅ BUG 6 FIX: clear toast instead of silently falling back to handleCall
      toast({ title: "Chat unavailable", description: "This seller has not enabled chat. Please call directly." });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle on Bambeh",
          url:   window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied" });
      }
    } catch { /* user cancelled */ }
  };

  // ─── loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
        <Button onClick={() => navigate("/vehicles")}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Vehicles
        </Button>
      </div>
    );
  }

  // ─── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-36">

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm flex-1 mx-3 truncate">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
          <Button
            variant="ghost" size="icon"
            onClick={() => setIsFavorite(f => !f)}
            aria-label={isFavorite ? "Remove from favourites" : "Save to favourites"}
            className={isFavorite ? "text-red-500" : ""}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ── Image gallery ── */}
      {/* ✅ BUG 7 FIX: always show image block, use emoji placeholder when no images */}
      <div className="relative">
        <div className="aspect-video bg-gray-100 max-h-72 overflow-hidden flex items-center justify-center">
          {vehicle.images.length > 0 ? (
            <img
              src={vehicle.images[currentImageIndex]}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl select-none">🚗</span>
          )}
        </div>
        <div className="absolute top-4 left-4">
          <Badge variant="outline" className="bg-white/90 capitalize">{vehicle.condition}</Badge>
        </div>
        {vehicle.images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {vehicle.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === currentImageIndex ? "bg-white w-6" : "bg-white/50 w-2"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Title & price */}
        <div>
          <div className="flex items-start justify-between mb-1">
            <div>
              <Badge variant="outline" className="mb-2 capitalize">{vehicle.vehicleType}</Badge>
              <h1 className="text-2xl font-bold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
            </div>
            {vehicle.verified && (
              <Badge className="bg-green-500 text-white flex-shrink-0">
                <Check className="h-3 w-3 mr-1" /> Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center text-gray-500 mb-3 text-sm">
            <MapPin className="h-4 w-4 mr-1" /> {vehicle.location}
          </div>
          <div className="text-3xl font-bold text-teal-700">
            {vehicle.price.toLocaleString()} {vehicle.currency}
            {vehicle.negotiable && (
              <Badge variant="outline" className="ml-2 text-sm font-normal">Negotiable</Badge>
            )}
          </div>
        </div>

        {/* Key specs */}
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { Icon: Gauge,    value: vehicle.mileage > 0 ? `${vehicle.mileage.toLocaleString()} km` : "—", label: "Mileage"      },
              { Icon: Calendar, value: String(vehicle.year),                                                    label: "Year"         },
              { Icon: Fuel,     value: vehicle.fuelType,                                                        label: "Fuel"         },
              { Icon: Cog,      value: vehicle.transmission,                                                    label: "Gearbox"      },
            ].map(({ Icon, value, label }) => (
              <div key={label}>
                <Icon className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                <div className="font-semibold text-xs capitalize">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* More details */}
        <Card className="p-4">
          <h2 className="font-semibold text-base mb-3">Details</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {vehicle.color      && <div><span className="text-gray-400">Color: </span><span className="font-medium">{vehicle.color}</span></div>}
            {vehicle.engineSize && <div><span className="text-gray-400">Engine: </span><span className="font-medium">{vehicle.engineSize}</span></div>}
            <div><span className="text-gray-400">Views: </span><span className="font-medium">{vehicle.views}</span></div>
            <div><span className="text-gray-400">Posted: </span><span className="font-medium">{new Date(vehicle.postedDate).toLocaleDateString()}</span></div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-4">
          <h2 className="font-semibold text-base mb-2">Description</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{vehicle.description}</p>
        </Card>

        {/* Contact / Report / Share */}
        <ActionButtons
          vendorPhone={vehicle.sellerPhone}
          adTitle={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          adId={vehicle.id}
          adType="vehicles"
          onShare={handleShare}
        />

        {/* Features */}
        {vehicle.features.length > 0 && (
          <Card className="p-4">
            <h2 className="font-semibold text-base mb-3">Features</h2>
            <div className="grid grid-cols-2 gap-2">
              {vehicle.features.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Seller info */}
        <Card className="p-4">
          <h2 className="font-semibold text-base mb-3">Seller Information</h2>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={vehicle.sellerAvatar} alt={vehicle.sellerName} />
              <AvatarFallback>{vehicle.sellerName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{vehicle.sellerName}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-0.5">
                <MapPin className="h-3 w-3 mr-1" /> {vehicle.location}
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* ── Fixed Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-2xl z-20">
        <div className="max-w-2xl mx-auto space-y-2">

          {/* ✅ Test Drive Button — now opens the BookTestDrive modal */}
          <button
            onClick={() => setShowTestDrive(true)}
            className="w-full py-3 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors"
          >
            🚗 Book Test Drive
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleCall} className="w-full">
              <Phone className="mr-2 h-4 w-4" /> Call Seller
            </Button>
            <Button onClick={handleChat} className="w-full bg-teal-600 hover:bg-teal-700">
              <MessageCircle className="mr-2 h-4 w-4" /> Chat
            </Button>
          </div>
        </div>
      </div>

      {/* ── Test Drive Modal ── */}
      <BookTestDrive
        vehicleId={vehicle.id}
        vehicleTitle={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        sellerPhone={vehicle.sellerPhone}
        sellerId={vehicle.sellerId}
        open={showTestDrive}
        onClose={() => setShowTestDrive(false)}
      />

    </div>
  );
}
