/**
 * src/pages/VehicleDetails.tsx ? Bambeh Marketplace
 * Full vehicle detail page: multilingual, Supabase, image gallery,
 * Call / WhatsApp CTA, expiry warning, view count, share.
 * ? 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2, ArrowLeft, Share2, Heart, MapPin,
  Gauge, Fuel, Cog, Calendar, Users, Palette,
  Eye, CalendarDays, ShieldCheck, Star, Bell, Phone, MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/hooks/useAppLang";

// -------------------------------------------------------------
// i18n
// -------------------------------------------------------------
const I18N: Record<string, Record<string, string>> = {
  en: {
    back: "Vehicles",
    loading: "Loading vehicle details?",
    unavailable: "Vehicle unavailable",
    notFound: "This listing could not be found.",
    browseOther: "Browse other vehicles",
    vehicleSpecs: "Vehicle Specs",
    aboutVehicle: "About this vehicle",
    noDesc: "No description provided.",
    safetyNote: "Always inspect the vehicle in person and verify ownership documents before making any payment. Bambeh does not handle payments.",
    noReviews: "(No reviews yet)",
    callSeller: "Call Seller",
    whatsapp: "WhatsApp",
    demoNote: "This is a demo listing. List your own vehicle to appear here.",
    sellVehicle: "Sell a Vehicle",
    expiringSoon: "Your listing expires in",
    day: "day",
    days: "days",
    renewHint: "Renew it to keep receiving enquiries.",
    renewNow: "Renew Now",
    views: "views",
    mileage: "Mileage",
    fuel: "Fuel type",
    transmission: "Transmission",
    year: "Year",
    seats: "Seats",
    colour: "Colour",
    shareSuccess: "Link copied to clipboard!",
    sellerInfo: "Seller",
    saved: "Saved",
    save: "Save",
    whatsappMsg: "Hi, I'm interested in your vehicle listing on Bambeh: \"{title}\" ? {location}. Is it still available?",
  },
  fr: {
    back: "V?hicules",
    loading: "Chargement des d?tails?",
    unavailable: "V?hicule indisponible",
    notFound: "Cette annonce n'a pas pu ?tre trouv?e.",
    browseOther: "Parcourir d'autres v?hicules",
    vehicleSpecs: "Caract?ristiques",
    aboutVehicle: "? propos de ce v?hicule",
    noDesc: "Aucune description fournie.",
    safetyNote: "Inspectez toujours le v?hicule en personne et v?rifiez les documents de propri?t? avant tout paiement. Bambeh ne g?re pas les paiements.",
    noReviews: "(Aucun avis pour l'instant)",
    callSeller: "Appeler le vendeur",
    whatsapp: "WhatsApp",
    demoNote: "Ceci est une annonce de d?monstration. Listez votre propre v?hicule pour appara?tre ici.",
    sellVehicle: "Vendre un v?hicule",
    expiringSoon: "Votre annonce expire dans",
    day: "jour",
    days: "jours",
    renewHint: "Renouvelez-la pour continuer ? recevoir des demandes.",
    renewNow: "Renouveler maintenant",
    views: "vues",
    mileage: "Kilom?trage",
    fuel: "Carburant",
    transmission: "Transmission",
    year: "Ann?e",
    seats: "Si?ges",
    colour: "Couleur",
    shareSuccess: "Lien copi? dans le presse-papier!",
    sellerInfo: "Vendeur",
    saved: "Enregistr?",
    save: "Enregistrer",
    whatsappMsg: "Bonjour, je suis int?ress?(e) par votre v?hicule sur Bambeh: \"{title}\" ? {location}. Est-il encore disponible?",
  },
  ha: {
    back: "Ababen Hawa",
    loading: "Ana loda bayanan abin hawa?",
    unavailable: "Babu abin hawa",
    notFound: "Ba a sami wannan lissafin ba.",
    browseOther: "Nemo sauran ababen hawa",
    vehicleSpecs: "Bayanan Abin Hawa",
    aboutVehicle: "Game da wannan abin hawa",
    noDesc: "Babu bayani da aka bayar.",
    safetyNote: "Koyaushe duba abin hawa da kai kuma tabbatar da takardun mallakar kafin yin wani biya. Bambeh ba ta sarrafa biyan ku?i.",
    noReviews: "(Babu sake dubawa tukuna)",
    callSeller: "Kira Mai Sayar",
    whatsapp: "WhatsApp",
    demoNote: "Wannan misali ne. Lissafa naku abin hawa don bayyana a nan.",
    sellVehicle: "Sayar da Abin Hawa",
    expiringSoon: "Lissafin ku ya kare a cikin",
    day: "rana",
    days: "ranaku",
    renewHint: "Sabunta shi don ci gaba da kar?ar tambayoyi.",
    renewNow: "Sabunta Yanzu",
    views: "kallaye",
    mileage: "Nisan Tafiya",
    fuel: "Nau'in Man Fetur",
    transmission: "Watsa Iko",
    year: "Shekara",
    seats: "Kujeru",
    colour: "Launi",
    shareSuccess: "An kwafi hanyar ha?in!",
    sellerInfo: "Mai Sayarwa",
    saved: "An Ajiye",
    save: "Ajiye",
    whatsappMsg: "Sannu, ina sha'awar abin hawanku akan Bambeh: \"{title}\" ? {location}. Yana nan?",
  },
  ar: {
    back: "????????",
    loading: "???? ????? ?????? ????????",
    unavailable: "??????? ??? ?????",
    notFound: "?? ??? ?????? ??? ??? ???????.",
    browseOther: "???? ?????? ????",
    vehicleSpecs: "??????? ???????",
    aboutVehicle: "?? ??? ???????",
    noDesc: "?? ??? ????? ???.",
    safetyNote: "???? ??????? ?????? ?????? ????? ?? ????? ??????? ??? ????? ?? ???. ?? ?????? Bambeh ?? ?????????.",
    noReviews: "(?? ???? ??????? ???)",
    callSeller: "???? ???????",
    whatsapp: "??????",
    demoNote: "??? ????? ??????. ??? ?????? ?????? ????? ???.",
    sellVehicle: "??? ?????",
    expiringSoon: "????? ?????? ????",
    day: "???",
    days: "????",
    renewHint: "???? ????????? ?? ???? ???????????.",
    renewNow: "??? ????",
    views: "???????",
    mileage: "???? ???????",
    fuel: "??? ??????",
    transmission: "???? ??????",
    year: "?????",
    seats: "???????",
    colour: "?????",
    shareSuccess: "?? ??? ??????!",
    sellerInfo: "??????",
    saved: "?????",
    save: "???",
    whatsappMsg: "??????? ??? ???? ??????? ??? Bambeh: \"{title}\" ? {location}. ?? ?? ???? ??????",
  },
  pcm: {
    back: "Motors",
    loading: "Motor dey load?",
    unavailable: "Motor no dey",
    notFound: "We no find dis post.",
    browseOther: "Look other motors",
    vehicleSpecs: "Motor Details",
    aboutVehicle: "About dis motor",
    noDesc: "No description.",
    safetyNote: "Always check motor yourself and verify papers before you pay. Bambeh no dey handle payment.",
    noReviews: "(No reviews yet)",
    callSeller: "Call Seller",
    whatsapp: "WhatsApp",
    demoNote: "This na demo post. Post your own motor to show here.",
    sellVehicle: "Sell Motor",
    expiringSoon: "Your post go expire for",
    day: "day",
    days: "days",
    renewHint: "Renew am to keep getting messages.",
    renewNow: "Renew Now",
    views: "views",
    mileage: "Mileage",
    fuel: "Fuel Type",
    transmission: "Transmission",
    year: "Year",
    seats: "Seats",
    colour: "Colour",
    shareSuccess: "Link don copy!",
    sellerInfo: "Seller",
    saved: "Saved",
    save: "Save",
    whatsappMsg: "How far, I dey look your motor for Bambeh: \"{title}\" ? {location}. E still dey?",
  },
  ff: {
    back: "Laa?e",
    loading: "Laa?al njilloyinee?",
    unavailable: "Laa?al he?aaki",
    notFound: "Ja?tere nde he?aaki.",
    browseOther: "Yiyt laa?e go??e",
    vehicleSpecs: "Bay?e Laa?al",
    aboutVehicle: "E dow laa?al ngal",
    noDesc: "Bay?e alaa.",
    safetyNote: "Yiy laa?al maa e ne??o kadi njangu takkareeji dow ko adii hokku jawdi. Bambeh natta hawl ngawte.",
    noReviews: "(Tii?nde alaa hannde)",
    callSeller: "Noddu Soodotoo?o",
    whatsapp: "WhatsApp",
    demoNote: "Ngal misaali. Haa?tu laa?al maa ngam yiyeede haa no.",
    sellVehicle: "Yillitu Laa?al",
    expiringSoon: "Ja?tere maa timmata e",
    day: "day",
    days: "naye",
    renewHint: "Haa?tu ngam he?tude ?atakeeji.",
    renewNow: "Haa?tu Jooni",
    views: "yiyaa?e",
    mileage: "Laawol",
    fuel: "Susiyel",
    transmission: "Watse",
    year: "Hitaande",
    seats: "Too?e",
    colour: "Ranynde",
    shareSuccess: "Hakkille reenaa!",
    sellerInfo: "Soodotoo?o",
    saved: "?ow?aa",
    save: "?ow",
    whatsappMsg: "Jam, mi anndinorii laa?al maa e Bambeh: \"{title}\" ? {location}. ?um ?ii?",
  },
};

// -------------------------------------------------------------
// Demo vehicle data
// -------------------------------------------------------------
const DEMO_VEHICLES: Record<string, any> = {
  "demo-v1": { id:"demo-v1", title:"Toyota Camry 2020", price:8_500_000, location:"Yaound?", category:"Sedan", images:[], created_at:new Date().toISOString(), status:"demo", view_count:0, extra:{fuel:"Petrol",transmission:"Automatic",mileage:"45,000 km",year:2020,color:"Silver",seats:5}, description:"Well-maintained Toyota Camry 2020, single owner, full service history. Leather seats, reversing camera, push-start. No accident history.", contact_phone:"", contact_name:"Bambeh Demo" },
  "demo-v2": { id:"demo-v2", title:"Honda Activa Motorcycle", price:850_000, location:"Douala", category:"Motorcycle", images:[], created_at:new Date().toISOString(), status:"demo", view_count:0, extra:{fuel:"Petrol",transmission:"Manual",mileage:"12,000 km",year:2021,color:"Red",seats:2}, description:"Honda Activa in excellent condition, used mainly for city commute. New tyres, recent oil change. Ideal for students and professionals.", contact_phone:"", contact_name:"Bambeh Demo" },
  "demo-v3": { id:"demo-v3", title:"Toyota Land Cruiser V8 2019", price:35_000_000, location:"Yaound?", category:"SUV", images:[], created_at:new Date().toISOString(), status:"demo", view_count:0, extra:{fuel:"Diesel",transmission:"Automatic",mileage:"78,000 km",year:2019,color:"Black",seats:7}, description:"Iconic Land Cruiser V8, fully loaded with leather interior, sunroof, and advanced 4WD. Perfect for Cameroon's diverse terrain.", contact_phone:"", contact_name:"Bambeh Demo" },
  "demo-v4": { id:"demo-v4", title:"Nissan Pickup 4x4", price:12_000_000, location:"Bamenda", category:"Pickup", images:[], created_at:new Date().toISOString(), status:"demo", view_count:0, extra:{fuel:"Diesel",transmission:"Manual",mileage:"95,000 km",year:2018,color:"White",seats:5}, description:"Robust Nissan Pickup 4x4 with hardtop canopy. Great load capacity, ideal for business and off-road use. Bull bar and tow hitch included.", contact_phone:"", contact_name:"Bambeh Demo" },
};

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function expiringWithin(expiresAt?: string, days = 7): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff <= days * 86_400_000;
}
function daysLeft(expiresAt: string): number {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
}

// -------------------------------------------------------------
// Component
// -------------------------------------------------------------
const VehicleDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const { user } = useAuth();
  const lang     = (useLang() || "en") as string;
  const tr       = (key: string, vars?: Record<string,string>) => {
    let s = (I18N[lang] || I18N.en)[key] || I18N.en[key] || key;
    if (vars) Object.entries(vars).forEach(([k,v]) => { s = s.replace(`{${k}}`, v); });
    return s;
  };
  const isRtl = lang === "ar";

  const [vehicle,     setVehicle]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [saved,       setSaved]       = useState(false);
  const [imgIndex,    setImgIndex]    = useState(0);

  // -- Increment view count ------------------------------------
  const incrementView = useCallback(async (listingId: string) => {
    try {
      await supabase.rpc("increment_view_count", {
        table_name: "listings", record_id: listingId,
      });
    } catch { /* non-fatal */ }
  }, []);

  // -- Fetch ---------------------------------------------------
  useEffect(() => {
    if (!id) { setError("Invalid vehicle ID."); setLoading(false); return; }

    if (id.startsWith("demo-")) {
      const demo = DEMO_VEHICLES[id];
      demo ? setVehicle(demo) : setError("Demo vehicle not found.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error: sbErr } = await supabase
          .from("listings")
          .select("id,title,price,location,category,images,created_at,expires_at,extra,description,contact_phone,contact_name,user_id,status,view_count")
          .eq("id", id)
          .eq("type", "vehicle")
          .single();

        if (sbErr) throw sbErr;
        if (!data)  throw new Error("Vehicle not found.");

        setVehicle({
          ...data,
          extra:      data.extra      || {},
          images:     data.images     || [],
          view_count: data.view_count ?? 0,
          status:     data.status     || "active",
        });
        incrementView(data.id);
      } catch (err: any) {
        console.error("[VehicleDetails] fetch error:", err);
        setError(tr("notFound"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // -- Actions -------------------------------------------------
  const handleCall = () => {
    if (!vehicle?.contact_phone) return;
    window.location.href = `tel:${vehicle.contact_phone.replace(/\s+/g, "")}`;
  };

  const handleWhatsApp = () => {
    if (!vehicle?.contact_phone) return;
    const phone = vehicle.contact_phone.replace(/\s+/g, "").replace(/^\+/, "");
    const msg   = tr("whatsappMsg", { title: vehicle.title || "", location: vehicle.location || "" });
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  const handleShare = async () => {
    const url   = window.location.href;
    const title = vehicle?.title || "Vehicle listing on Bambeh";
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      alert(tr("shareSuccess"));
    }
  };

  // -- Specs array ---------------------------------------------
  const specs = vehicle ? [
    { icon: <Gauge    className="w-4 h-4"/>, label: tr("mileage"),      value: vehicle.extra?.mileage },
    { icon: <Fuel     className="w-4 h-4"/>, label: tr("fuel"),         value: vehicle.extra?.fuel },
    { icon: <Cog      className="w-4 h-4"/>, label: tr("transmission"), value: vehicle.extra?.transmission },
    { icon: <Calendar className="w-4 h-4"/>, label: tr("year"),         value: vehicle.extra?.year },
    { icon: <Users    className="w-4 h-4"/>, label: tr("seats"),        value: vehicle.extra?.seats ? `${vehicle.extra.seats} ${tr("seats")}` : undefined },
    { icon: <Palette  className="w-4 h-4"/>, label: tr("colour"),       value: vehicle.extra?.color },
  ].filter((s) => s.value) : [];

  const isOwner = user?.id && vehicle?.user_id === user.id;

  // -- Loading -------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{tr("loading")}</p>
        </div>
      </div>
    );
  }

  // -- Error / not found ----------------------------------------
  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-28" dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/vehicles")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> {tr("back")}
          </button>
          <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
            <AlertTriangle className="w-14 h-14 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("unavailable")}</h2>
            <p className="text-gray-500 text-sm mb-6">{error || tr("notFound")}</p>
            <button
              onClick={() => navigate("/vehicles")}
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all"
            >
              {tr("browseOther")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- Main render ----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 pb-28" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto">

        {/* -- Sticky top bar -- */}
        <div className={`sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
          <button
            onClick={() => navigate("/vehicles")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            {tr("back")}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-gray-100"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSaved((s) => !s)}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${saved ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}
              aria-label={saved ? tr("saved") : tr("save")}
            >
              <Heart className={`w-4 h-4 ${saved ? "fill-red-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* -- Image gallery -- */}
        <div className="bg-gray-200 relative">
          {vehicle.images.length > 0 ? (
            <>
              <div className="h-64 overflow-hidden">
                <img
                  src={vehicle.images[imgIndex]}
                  alt={vehicle.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              {vehicle.images.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto bg-black/20">
                  {vehicle.images.map((src: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition
                        ${i === imgIndex ? "border-green-500" : "border-transparent opacity-60"}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
              <span className="text-7xl">??</span>
            </div>
          )}

          {vehicle.status === "demo" && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              DEMO
            </div>
          )}
        </div>

        {/* -- Content -- */}
        <div className="px-4 pt-5 space-y-5">

          {/* Expiry warning (owner only) */}
          {isOwner && expiringWithin(vehicle.expires_at, 7) && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  {tr("expiringSoon")} {daysLeft(vehicle.expires_at!)} {daysLeft(vehicle.expires_at!) === 1 ? tr("day") : tr("days")}
                </p>
                <p className="text-amber-700 text-xs mt-0.5">{tr("renewHint")}</p>
                <button
                  onClick={() => navigate(`/vehicles/${id}/renew`)}
                  className="mt-2 text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 font-semibold"
                >
                  {tr("renewNow")}
                </button>
              </div>
            </div>
          )}

          {/* Title / price */}
          <div>
            <div className={`flex items-start justify-between gap-3 mb-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{vehicle.title}</h1>
              {vehicle.category && (
                <span className="flex-shrink-0 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                  {vehicle.category}
                </span>
              )}
            </div>

            <div className={`flex items-center gap-1 text-gray-600 text-sm mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
              <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{vehicle.location}</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-green-700">
                {vehicle.price.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm">XAF</span>
            </div>
          </div>

          {/* Specs grid */}
          {specs.length > 0 && (
            <div className="bg-white border rounded-2xl p-4">
              <h2 className="font-bold text-gray-900 mb-3">{tr("vehicleSpecs")}</h2>
              <div className="grid grid-cols-2 gap-3">
                {specs.map(({ icon, label, value }) => (
                  <div key={label} className={`flex items-center gap-2 text-sm ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span className="text-green-500">{icon}</span>
                    <div>
                      <div className="text-xs text-gray-400">{label}</div>
                      <div className="font-semibold text-gray-800 capitalize">{String(value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Views + date */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
              <Eye className="w-3.5 h-3.5" /> {vehicle.view_count} {tr("views")}
            </span>
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
              <CalendarDays className="w-3.5 h-3.5" />
              {new Date(vehicle.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>

          {/* Description */}
          <div className="bg-white border rounded-2xl p-4">
            <h2 className="font-bold text-gray-900 mb-2">{tr("aboutVehicle")}</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {vehicle.description || tr("noDesc")}
            </p>
          </div>

          {/* Safety tip */}
          <div className={`flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700">{tr("safetyNote")}</p>
          </div>

          {/* Star rating placeholder */}
          <div className={`flex items-center gap-1 text-sm text-gray-500 ${isRtl ? "flex-row-reverse" : ""}`}>
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            ))}
            <span className="ml-1 text-xs">{tr("noReviews")}</span>
          </div>
        </div>

        {/* -- Bottom CTA bar ? real listing -- */}
        {vehicle.status !== "demo" && vehicle.contact_phone && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg px-4 pt-3 pb-6">
            <div className={`max-w-2xl mx-auto grid grid-cols-2 gap-3 ${isRtl ? "dir-rtl" : ""}`}>
              <button
                onClick={handleCall}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white
                           py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4" />
                {tr("callSeller")}
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-500 text-white
                           py-3 rounded-xl font-semibold text-sm hover:bg-green-600 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {tr("whatsapp")}
              </button>
            </div>
          </div>
        )}

        {/* -- Bottom CTA bar ? demo -- */}
        {vehicle.status === "demo" && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-yellow-50 border-t border-yellow-200 px-4 pt-3 pb-6">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-sm text-yellow-700 font-medium">{tr("demoNote")}</p>
              <button
                onClick={() => navigate("/vehicles/sell")}
                className="mt-2 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all"
              >
                {tr("sellVehicle")}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VehicleDetails;





