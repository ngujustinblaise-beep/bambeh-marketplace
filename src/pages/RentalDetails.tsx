import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft, Share2, Heart, Home, AlertTriangle, MapPin, Bed, Bath, Eye, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/App";

const DETAIL_T: Record<string, Record<string, string>> = {
  en: {
    "rental.title": "Property Details",
    "rental.back": "Back",
    "rental.notFound": "Property not found",
    "rental.browse": "Browse rentals",
    "rental.share": "Share",
    "rental.saved": "Saved",
    "rental.save": "Save",
    "rental.contact": "Contact",
    "rental.call": "Call",
    "rental.more": "Browse more rentals",
    "rental.description": "Description",
    "rental.bedrooms": "Bedrooms",
    "rental.bathrooms": "Bathrooms",
    "rental.views": "Views",
    "rental.month": "XAF / month",
    "rental.expiringSoon": "This listing is expiring soon."
  },
  fr: {
    "rental.title": "Détails du bien",
    "rental.back": "Retour",
    "rental.notFound": "Bien introuvable",
    "rental.browse": "Voir les locations",
    "rental.share": "Partager",
    "rental.saved": "Enregistré",
    "rental.save": "Enregistrer",
    "rental.contact": "Contact",
    "rental.call": "Appeler",
    "rental.more": "Voir plus de locations",
    "rental.description": "Description",
    "rental.bedrooms": "Chambres",
    "rental.bathrooms": "Salles de bain",
    "rental.views": "Vues",
    "rental.month": "XAF / mois",
    "rental.expiringSoon": "Cette annonce expire bientôt."
  },
  ar: {
    "rental.title": "تفاصيل العقار",
    "rental.back": "رجوع",
    "rental.notFound": "العقار غير موجود",
    "rental.browse": "تصفح الإيجارات",
    "rental.share": "مشاركة",
    "rental.saved": "تم الحفظ",
    "rental.save": "حفظ",
    "rental.contact": "التواصل",
    "rental.call": "اتصال",
    "rental.more": "تصفح المزيد من الإيجارات",
    "rental.description": "الوصف",
    "rental.bedrooms": "غرف النوم",
    "rental.bathrooms": "الحمامات",
    "rental.views": "المشاهدات",
    "rental.month": "XAF / شهر",
    "rental.expiringSoon": "هذا الإعلان سينتهي قريبًا."
  },
  ff: {
    "rental.title": "Piile Galal",
    "rental.back": "Fiiɗo",
    "rental.notFound": "Galal nde fof wonaa",
    "rental.browse": "Yewtu luwaaji",
    "rental.share": "Woppu",
    "rental.saved": "Naatnude",
    "rental.save": "Naatnu",
    "rental.contact": "Jokkondiral",
    "rental.call": "Wanngo",
    "rental.more": "Yewtu luwaaji goɗɗi",
    "rental.description": "Haala",
    "rental.bedrooms": "Cuuɗi heeɗi",
    "rental.bathrooms": "Daaɗi ndiyam",
    "rental.views": "Njiyaali",
    "rental.month": "XAF / lewru",
    "rental.expiringSoon": "Bayyinaango ndee dogii toɗɗii."
  },
  pidgin: {
    "rental.title": "Property Details",
    "rental.back": "Back",
    "rental.notFound": "Property no dey",
    "rental.browse": "Browse rentals",
    "rental.share": "Share",
    "rental.saved": "Saved",
    "rental.save": "Save",
    "rental.contact": "Contact",
    "rental.call": "Call",
    "rental.more": "Browse more rentals",
    "rental.description": "Description",
    "rental.bedrooms": "Bedrooms",
    "rental.bathrooms": "Bathrooms",
    "rental.views": "Views",
    "rental.month": "XAF / month",
    "rental.expiringSoon": "This listing go soon expire."
  }
};

const normLang = (l: string): string => {
  const v = String(l || "en").toLowerCase();
  if (v.startsWith("fr")) return "fr";
  if (v.startsWith("ar")) return "ar";
  if (v === "ff" || v.startsWith("ful")) return "ff";
  if (v === "pcm" || v === "pidgin") return "pidgin";
  return "en";
};

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

const DEMO_LISTINGS: Record<string, RentalListing> = {
  "demo-1": { id: "demo-1", title: "Modern 2-bed apartment in Bastos", type: "Apartment", price: 150000, location: "Yaoundé", quartier: "Bastos", region: "Centre", bedrooms: "2", bathrooms: "1", area: 85, isFurnished: true, description: "Beautiful furnished apartment with balcony, 24-hour security, water and electricity included.", images: [], amenities: ["Security", "Balcony"], contactPhone: "", contactName: "Demo Owner", postedAt: new Date().toISOString(), view_count: 0, status: "active" },
  "demo-2": { id: "demo-2", title: "Spacious villa in Bonamoussadi", type: "Villa", price: 350000, location: "Douala", quartier: "Bonamoussadi", region: "Littoral", bedrooms: "4", bathrooms: "3", area: 220, isFurnished: false, description: "Family villa with parking and garden.", images: [], amenities: ["Parking", "Garden"], contactPhone: "", contactName: "Demo Owner", postedAt: new Date().toISOString(), view_count: 0, status: "active" },
};

export default function RentalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = normLang(language);

  const t = useCallback((k: string) => ((DETAIL_T[lang] || DETAIL_T.en)[k]) ?? DETAIL_T.en[k] ?? k, [lang]);

  const [listing, setListing] = useState<RentalListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const loadListing = useCallback(async () => {
    if (!id) { setLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        const d = data as any;
        setListing({
          id: String(d.id),
          title: d.title || "Untitled Property",
          type: d.type || "Apartment",
          price: Number(d.price ?? 0),
          location: d.location || "",
          quartier: d.quartier || "",
          region: d.region || "",
          bedrooms: String(d.bedrooms ?? "?"),
          bathrooms: String(d.bathrooms ?? "?"),
          area: d.area,
          description: d.description || "",
          images: Array.isArray(d.images) ? d.images : [],
          isFurnished: !!d.is_furnished,
          amenities: Array.isArray(d.amenities) ? d.amenities : [],
          contactPhone: d.contact_phone || "",
          contactName: d.contact_name || "",
          postedAt: d.created_at || new Date().toISOString(),
          expiresAt: d.expires_at || undefined,
          view_count: Number(d.view_count ?? 0),
          user_id: d.user_id,
          status: d.status || "active",
        });
        return;
      }

      setListing(DEMO_LISTINGS[id] ?? null);
    } catch {
      setListing(DEMO_LISTINGS[id] ?? null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadListing(); }, [loadListing]);

  const copyLink = useCallback(() => {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-orange-600 mb-6">
          <ArrowLeft className="w-5 h-5" /> {t("rental.back")}
        </button>
        <div className="text-center py-16 text-gray-500">
          <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">{t("rental.notFound")}</p>
          <button onClick={() => navigate("/rentals")} className="mt-4 text-orange-600 underline text-sm">
            {t("rental.browse")}
          </button>
        </div>
      </div>
    );
  }

  const expiringSoon = listing.expiresAt ? (new Date(listing.expiresAt).getTime() - Date.now()) <= 3 * 86400000 : false;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl" aria-label={t("rental.back")}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-900 flex-1 truncate">{listing.title}</h2>
        <button onClick={copyLink} className="p-2 hover:bg-gray-100 rounded-xl" aria-label={t("rental.share")}>
          <Share2 className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border">
          <div className="h-64 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
            <Home className="w-16 h-16 text-orange-300" />
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">{listing.type}</p>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{listing.title}</h1>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}{listing.quartier ? `, ${listing.quartier}` : ""}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">{listing.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{t("rental.month")}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center"><Bed className="w-5 h-5 mx-auto text-gray-500 mb-1" /><p className="font-semibold">{listing.bedrooms}</p><p className="text-xs text-gray-500">{t("rental.bedrooms")}</p></div>
              <div className="bg-gray-50 rounded-xl p-3 text-center"><Bath className="w-5 h-5 mx-auto text-gray-500 mb-1" /><p className="font-semibold">{listing.bathrooms}</p><p className="text-xs text-gray-500">{t("rental.bathrooms")}</p></div>
              <div className="bg-gray-50 rounded-xl p-3 text-center"><Eye className="w-5 h-5 mx-auto text-gray-500 mb-1" /><p className="font-semibold">{listing.view_count}</p><p className="text-xs text-gray-500">{t("rental.views")}</p></div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t("rental.description")}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            {expiringSoon && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {t("rental.expiringSoon")}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSaved(v => !v)} className={`flex-1 py-3 rounded-xl font-semibold border ${saved ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-300 text-gray-700"}`}>
                <Heart className="w-4 h-4 inline-block mr-2" />
                {saved ? t("rental.saved") : t("rental.save")}
              </button>
              <button onClick={copyLink} className="flex-1 py-3 rounded-xl font-semibold bg-orange-500 text-white">
                {shareCopied ? t("rental.share") : t("rental.share")}
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t("rental.contact")}</h3>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{listing.contactName || "Owner"}</p>
                  <p className="text-sm text-gray-500">{listing.contactPhone || "No phone available"}</p>
                </div>
                {listing.contactPhone ? (
                  <a href={`tel:${listing.contactPhone}`} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t("rental.call")}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => navigate("/rentals")} className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold">
          {t("rental.more")}
        </button>
      </div>
    </div>
  );
}
