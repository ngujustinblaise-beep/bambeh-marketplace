/**
 * src/pages/ListProperty.tsx — Bambeh Marketplace
 *
 * ✅ FULL REWRITE — production-ready rental posting form:
 *
 *  i18n: Inline 5-language dictionary keyed by useLang()
 *        (en / fr / pidgin / ar / ff). No react-i18next.
 *  📸 Images: upload up to 8 photos → Supabase Storage bucket "rental-images".
 *             Image re-ordering by drag or remove-and-re-add.
 *  Supabase: inserts to the unified `listings` table (type='rental');
 *            status='active', expires_at = now + 30 days.
 *  🔒 Auth-gated: redirects to /login if not authenticated.
 *  ✅ Validation: required fields highlighted, friendly error messages.
 *  🎨 Clean, card-section layout — consistent with Bambeh orange/teal palette.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/hooks/useAppLang";
import {
  Home, ArrowLeft, Upload, X, Loader2,
  CheckCircle, AlertCircle, Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  title:        string;
  type:         string;
  price:        string;
  location:     string;
  quartier:     string;
  region:       string;
  bedrooms:     string;
  bathrooms:    string;
  area:         string;
  isFurnished:  boolean;
  description:  string;
  amenities:    string;   // comma-separated input
  contactPhone: string;
  contactName:  string;
}

const EMPTY_FORM: FormState = {
  title: "", type: "Apartment", price: "", location: "",
  quartier: "", region: "", bedrooms: "1", bathrooms: "1",
  area: "", isFurnished: false, description: "",
  amenities: "", contactPhone: "", contactName: "",
};

const PROPERTY_TYPES = [
  "Apartment", "Villa", "Studio", "House", "Office", "Room", "Shop",
];
const CITIES = [
  "Yaound\u00e9", "Douala", "Bafoussam", "Garoua", "Maroua",
  "Bamenda", "Ngaound\u00e9r\u00e9", "Bertoua", "Ebolowa", "Kumba", "Other",
];
const REGIONS = [
  "Adamawa", "Centre", "East", "Far North", "Littoral",
  "North", "North West", "South", "South West", "West",
];
const BEDROOM_OPTIONS = ["Studio", "1", "2", "3", "4", "5", "6+", "N/A"];
const BATH_OPTIONS    = ["1", "2", "3", "4+"];

// ─── Image upload helpers ─────────────────────────────────────────────────────
async function uploadImage(file: File, userId: string): Promise<string> {
  const ext  = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("rental-images")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from("rental-images").getPublicUrl(path);
  return data.publicUrl;
}

// --- i18n: inline 5-language dictionary (en / fr / pidgin / ar / ff) ---
// Keyed to match useLang() codes exactly. Missing lang -> English fallback.
const STR: Record<string, Record<string, string>> = {
  postTitle: {
    en: "Post a Rental Property", fr: "Publier un bien a louer",
    pidgin: "Post House for Rent", ar: "\u0646\u0634\u0631 \u0639\u0642\u0627\u0631 \u0644\u0644\u0625\u064a\u062c\u0627\u0631", ff: "Waylo Suudu Luwaari",
  },
  postSubtitle: {
    en: "Fill in the details to list your property",
    fr: "Remplissez les d\u00e9tails pour publier votre bien",
    pidgin: "Put the details make your house show", ar: "\u0623\u062f\u062e\u0644 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0644\u0639\u0631\u0636 \u0639\u0642\u0627\u0631\u0643",
    ff: "Hebbin humpito ngam holliraa suudu maa",
  },
  formTitle: {
    en: "Title", fr: "Titre", pidgin: "Title", ar: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", ff: "Tiitoonde",
  },
  formTitlePlaceholder: {
    en: "e.g. Modern 2-bedroom apartment in Bastos",
    fr: "ex. Appartement moderne 2 chambres \u00e0 Bastos",
    pidgin: "e.g. Fine 2-room apartment for Bastos",
    ar: "\u0645\u062b\u0627\u0644: \u0634\u0642\u0629 \u0639\u0635\u0631\u064a\u0629 \u0628\u063a\u0631\u0641\u062a\u064a\u0646 \u0641\u064a \u0628\u0627\u0633\u062a\u0648\u0633", ff: "misal. Suudu moyyo pati 2 e Bastos",
  },
  formType: {
    en: "Type", fr: "Type", pidgin: "Type", ar: "\u0627\u0644\u0646\u0648\u0639", ff: "Sifa",
  },
  formPrice: {
    en: "Price (XAF/month)", fr: "Prix (XAF/mois)", pidgin: "Price (XAF/month)",
    ar: "\u0627\u0644\u0633\u0639\u0631 (\u0641\u0631\u0646\u0643/\u0634\u0647\u0631)", ff: "Coggu (XAF/lewru)",
  },
  formPricePlaceholder: {
    en: "e.g. 75000", fr: "ex. 75000", pidgin: "e.g. 75000", ar: "\u0645\u062b\u0627\u0644: 75000", ff: "misal. 75000",
  },
  formLocation: {
    en: "City", fr: "Ville", pidgin: "Town", ar: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629", ff: "Wuro",
  },
  allCities: {
    en: "Select city", fr: "Choisir une ville", pidgin: "Choose town",
    ar: "\u0627\u062e\u062a\u0631 \u0627\u0644\u0645\u062f\u064a\u0646\u0629", ff: "Su\u0253o wuro",
  },
  formQuartier: {
    en: "Neighbourhood", fr: "Quartier", pidgin: "Quarter", ar: "\u0627\u0644\u062d\u064a", ff: "Leegal",
  },
  formRegion: {
    en: "Region", fr: "R\u00e9gion", pidgin: "Region", ar: "\u0627\u0644\u062c\u0647\u0629", ff: "Diiwaan",
  },
  formBedrooms: {
    en: "Bedrooms", fr: "Chambres", pidgin: "Rooms", ar: "\u063a\u0631\u0641 \u0627\u0644\u0646\u0648\u0645", ff: "Cuu\u0257i \u0257aanor\u0257i",
  },
  formBathrooms: {
    en: "Bathrooms", fr: "Salles de bain", pidgin: "Bathroom", ar: "\u0627\u0644\u062d\u0645\u0627\u0645\u0627\u062a", ff: "Cuu\u0257i lootor\u0257i",
  },
  formArea: {
    en: "Area (m\u00b2)", fr: "Surface (m\u00b2)", pidgin: "Size (m\u00b2)", ar: "\u0627\u0644\u0645\u0633\u0627\u062d\u0629 (\u0645\u00b2)", ff: "Njaajeendi (m2)",
  },
  formAreaPlaceholder: {
    en: "e.g. 80", fr: "ex. 80", pidgin: "e.g. 80", ar: "\u0645\u062b\u0627\u0644: 80", ff: "misal. 80",
  },
  formFurnished: {
    en: "Furnished", fr: "Meubl\u00e9", pidgin: "E get furniture", ar: "\u0645\u0641\u0631\u0648\u0634", ff: "Ina wa\u0257i kaake",
  },
  formDescription: {
    en: "Description", fr: "Description", pidgin: "Description", ar: "\u0627\u0644\u0648\u0635\u0641", ff: "Sifaa",
  },
  formDescPlaceholder: {
    en: "Describe the property, rules, availability...",
    fr: "D\u00e9crivez le bien, les r\u00e8gles, la disponibilit\u00e9...",
    pidgin: "Talk about the house, rules, when e ready...",
    ar: "\u0635\u0641 \u0627\u0644\u0639\u0642\u0627\u0631 \u0648\u0627\u0644\u0634\u0631\u0648\u0637 \u0648\u0627\u0644\u062a\u0648\u0641\u0631...", ff: "Sifo suudu, laabi, ndeen woni...",
  },
  formAmenities: {
    en: "Amenities", fr: "\u00c9quipements", pidgin: "Extra things", ar: "\u0627\u0644\u0645\u0631\u0627\u0641\u0642", ff: "Kaake go\u0257\u0257e",
  },
  formAmenitiesPlaceholder: {
    en: "e.g. Wifi, Parking, Water, Generator",
    fr: "ex. Wifi, Parking, Eau, Groupe \u00e9lectrog\u00e8ne",
    pidgin: "e.g. Wifi, Parking, Water, Generator",
    ar: "\u0645\u062b\u0627\u0644: \u0648\u0627\u064a \u0641\u0627\u064a\u060c \u0645\u0648\u0642\u0641\u060c \u0645\u0627\u0621\u060c \u0645\u0648\u0644\u062f", ff: "misal. Wifi, Parking, Ndiyam, Generator",
  },
  formPhotos: {
    en: "Add Photos", fr: "Ajouter des photos", pidgin: "Add Photo", ar: "\u0623\u0636\u0641 \u0635\u0648\u0631\u0627", ff: "\u0181eydu Nate",
  },
  formPhotosHint: {
    en: "Up to 8 photos. The first is the cover.",
    fr: "Jusqu'\u00e0 8 photos. La premi\u00e8re est la couverture.",
    pidgin: "Reach 8 photo. First one na cover.",
    ar: "\u062d\u062a\u0649 8 \u0635\u0648\u0631. \u0627\u0644\u0623\u0648\u0644\u0649 \u0647\u064a \u0627\u0644\u063a\u0644\u0627\u0641.", ff: "Haa nate 8. Aranndeere woni hoore.",
  },
  formPhone: {
    en: "Contact Phone", fr: "T\u00e9l\u00e9phone de contact", pidgin: "Phone Number",
    ar: "\u0647\u0627\u062a\u0641 \u0627\u0644\u0627\u062a\u0635\u0627\u0644", ff: "Telefol jokkondiral",
  },
  formPhonePlaceholder: {
    en: "e.g. 6XX XXX XXX", fr: "ex. 6XX XXX XXX", pidgin: "e.g. 6XX XXX XXX",
    ar: "\u0645\u062b\u0627\u0644: 6XX XXX XXX", ff: "misal. 6XX XXX XXX",
  },
  formName: {
    en: "Contact Name", fr: "Nom du contact", pidgin: "Your Name", ar: "\u0627\u0633\u0645 \u062c\u0647\u0629 \u0627\u0644\u0627\u062a\u0635\u0627\u0644", ff: "Innde jokkondiral",
  },
  formNamePlaceholder: {
    en: "Your name", fr: "Votre nom", pidgin: "Your name", ar: "\u0627\u0633\u0645\u0643", ff: "Innde maa",
  },
  formSubmit: {
    en: "Publish Listing", fr: "Publier l'annonce", pidgin: "Publish am", ar: "\u0646\u0634\u0631 \u0627\u0644\u0625\u0639\u0644\u0627\u0646", ff: "Saakto Suudu",
  },
  formSubmitting: {
    en: "Publishing...", fr: "Publication...", pidgin: "E dey publish...", ar: "\u062c\u0627\u0631\u064d \u0627\u0644\u0646\u0634\u0631...", ff: "Ina saaktee...",
  },
  formSuccess: {
    en: "Your property is now live!", fr: "Votre bien est en ligne !",
    pidgin: "Your house don show now!", ar: "\u0639\u0642\u0627\u0631\u0643 \u0645\u0646\u0634\u0648\u0631 \u0627\u0644\u0622\u0646!", ff: "Suudu maa woni e laabi!",
  },
  loadingDetail: {
    en: "Taking you to your listing...", fr: "Redirection vers votre annonce...",
    pidgin: "We dey take you go your listing...", ar: "\u062c\u0627\u0631\u064d \u062a\u0648\u062c\u064a\u0647\u0643 \u0625\u0644\u0649 \u0625\u0639\u0644\u0627\u0646\u0643...",
    ff: "Ina na\u0253ee to ja\u014bde maa...",
  },
  formError: {
    en: "Could not publish. Please try again.",
    fr: "\u00c9chec de la publication. R\u00e9essayez.",
    pidgin: "E no fit publish. Try again.", ar: "\u062a\u0639\u0630\u0631 \u0627\u0644\u0646\u0634\u0631. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.", ff: "Rokkitaako. Toppito.",
  },
  formLoginRequired: {
    en: "Please log in to post a property.",
    fr: "Connectez-vous pour publier un bien.",
    pidgin: "Login first before you post house.", ar: "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0646\u0634\u0631 \u0639\u0642\u0627\u0631.", ff: "Naatir ngam waylo suudu.",
  },
  backToRentals: {
    en: "Back to rentals", fr: "Retour aux locations", pidgin: "Go back to rentals",
    ar: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0625\u064a\u062c\u0627\u0631\u0627\u062a", ff: "Rutto to luwaari",
  },
  isRequired: {
    en: "is required", fr: "est requis", pidgin: "dey required", ar: "\u0645\u0637\u0644\u0648\u0628", ff: "ina naamaa",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const ListProperty: React.FC = () => {
  const navigate = useNavigate();
  const lang     = useLang();
  const tr       = (k: string): string => STR[k]?.[lang] ?? STR[k]?.en ?? k;
  const { user } = useAuth();

  const [form,        setForm]        = useState<FormState>(EMPTY_FORM);
  const [imageFiles,  setImageFiles]  = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);

  // ── Field update helpers ────────────────────────────────────────────────
  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggle = (field: keyof FormState) => () =>
    setForm((f) => ({ ...f, [field]: !f[field] }));

  // ── Image handling ──────────────────────────────────────────────────────
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 8 - imageFiles.length);
    if (!files.length) return;

    const newFiles    = [...imageFiles, ...files].slice(0, 8);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(imagePreviews[i]);
    setImageFiles((f) => f.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) { setError(tr("formLoginRequired")); return; }
    if (!form.title.trim())   { setError(tr("formTitle")    + " " + tr("isRequired")); return; }
    if (!form.price.trim())   { setError(tr("formPrice")    + " " + tr("isRequired")); return; }
    if (!form.location.trim()){ setError(tr("formLocation") + " " + tr("isRequired")); return; }
    if (!form.contactPhone.trim()){ setError(tr("formPhone") + " " + tr("isRequired")); return; }

    setSubmitting(true);
    try {
      // 1. Upload images
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const url = await uploadImage(file, user.id);
        imageUrls.push(url);
      }

      // 2. Parse amenities
      const amenitiesArr = form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      // 3. Compute expiry (30 days from now)
      const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();

      // 4. Insert into the unified `listings` table (type = 'rental').
      //    Rides the SAME insert path as the other working posters, so the
      //    post is immediately visible in the Rentals list. Rental-only
      //    fields live in the `extra` jsonb column (listings has no
      //    bedrooms/area/etc. columns of its own).
      const { data: inserted, error: sbErr } = await supabase
        .from("listings")
        .insert({
          type:           "rental",
          title:          form.title.trim(),
          description:    form.description.trim() || null,
          price:          Number(form.price),
          category:       form.type,           // property type, for filtering
          location:       form.location,
          images:         imageUrls,
          status:         "active",
          phone:          form.contactPhone.trim(),
          contact_phone:  form.contactPhone.trim(),
          contact_name:   form.contactName.trim() || null,
          user_id:        user.id,
          stock_quantity: 1,                   // NOT NULL column
          view_count:     0,
          expires_at:     expiresAt,
          extra: {
            propertyType: form.type,
            bedrooms:     form.bedrooms,
            bathrooms:    form.bathrooms,
            area:         form.area ? Number(form.area) : null,
            isFurnished:  form.isFurnished,
            amenities:    amenitiesArr,
            quartier:     form.quartier.trim() || null,
            region:       form.region || null,
          },
        })
        .select("id")
        .single();

      if (sbErr) throw sbErr;

      setSuccess(true);
      // Navigate to the new listing after 1.5 s
      setTimeout(() => navigate(`/rentals/${inserted?.id ?? ""}`), 1_500);

    } catch (err: unknown) {
      console.error("[ListProperty] submit error:", err);
      setError(tr("formError"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-10 text-center max-w-sm w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("formSuccess")}</h2>
          <p className="text-sm text-gray-500">{tr("loadingDetail")}</p>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b px-4 py-3
                        flex items-center gap-3">
          <button
            onClick={() => navigate("/rentals")}
            className="p-1 text-gray-500 hover:text-gray-800"
            aria-label={tr("backToRentals")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-orange-500" />
              {tr("postTitle")}
            </h1>
            <p className="text-xs text-gray-500">{tr("postSubtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 pt-5 pb-28 space-y-5">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700
                            rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Section: Basic info ─────────────────────────────────── */}
          <section className="bg-white border rounded-2xl p-4 space-y-3">

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("formTitle")} *
              </label>
              <input
                required
                value={form.title}
                onChange={set("title")}
                placeholder={tr("formTitlePlaceholder")}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* Type + Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {tr("formType")} *
                </label>
                <select
                  value={form.type}
                  onChange={set("type")}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  {PROPERTY_TYPES.map((tp) => (
                    <option key={tp}>{tp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {tr("formPrice")} *
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={form.price}
                  onChange={set("price")}
                  placeholder={tr("formPricePlaceholder")}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* ── Section: Location ──────────────────────────────────── */}
          <section className="bg-white border rounded-2xl p-4 space-y-3">

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("formLocation")} *
              </label>
              <select
                required
                value={form.location}
                onChange={set("location")}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                <option value="">{tr("allCities")}</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Quartier + Region */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {tr("formQuartier")}
                </label>
                <input
                  value={form.quartier}
                  onChange={set("quartier")}
                  placeholder="e.g. Bastos"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {tr("formRegion")}
                </label>
                <select
                  value={form.region}
                  onChange={set("region")}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  <option value="">{"\u2014"}</option>
                  {REGIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ── Section: Property details ──────────────────────────── */}
          <section className="bg-white border rounded-2xl p-4 space-y-3">

            {/* Bedrooms + Bathrooms + Area */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {tr("formBedrooms")}
                </label>
                <select
                  value={form.bedrooms}
                  onChange={set("bedrooms")}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  {BEDROOM_OPTIONS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {tr("formBathrooms")}
                </label>
                <select
                  value={form.bathrooms}
                  onChange={set("bathrooms")}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  {BATH_OPTIONS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {tr("formArea")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.area}
                  onChange={set("area")}
                  placeholder={tr("formAreaPlaceholder")}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Furnished toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={toggle("isFurnished")}
                className={`w-11 h-6 rounded-full transition-colors relative
                  ${form.isFurnished ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                  transition-transform ${form.isFurnished ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{tr("formFurnished")}</span>
            </label>
          </section>

          {/* ── Section: Description & amenities ──────────────────── */}
          <section className="bg-white border rounded-2xl p-4 space-y-3">

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("formDescription")}
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={set("description")}
                placeholder={tr("formDescPlaceholder")}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("formAmenities")}
              </label>
              <input
                value={form.amenities}
                onChange={set("amenities")}
                placeholder={tr("formAmenitiesPlaceholder")}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </section>

          {/* ── Section: Photos ─────────────────────────────────────── */}
          <section className="bg-white border rounded-2xl p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-0.5">{tr("formPhotos")}</p>
              <p className="text-xs text-gray-400 mb-2">{tr("formPhotosHint")}</p>

              {/* Thumbnail grid */}
              <div className="flex flex-wrap gap-2 mb-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5
                                 hover:bg-black/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white
                                       text-[9px] font-bold text-center py-0.5">
                        COVER
                      </span>
                    )}
                  </div>
                ))}

                {imageFiles.length < 8 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl
                               flex flex-col items-center justify-center text-gray-400
                               hover:border-orange-400 hover:text-orange-500 transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] mt-0.5">Add</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImagePick}
              />

              {imageFiles.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed
                             border-gray-300 rounded-xl py-4 text-sm text-gray-500
                             hover:border-orange-400 hover:text-orange-500 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  {tr("formPhotos")}
                </button>
              )}
            </div>
          </section>

          {/* ── Section: Contact ─────────────────────────────────────── */}
          <section className="bg-white border rounded-2xl p-4 space-y-3">

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("formPhone")} *
              </label>
              <input
                required
                type="tel"
                value={form.contactPhone}
                onChange={set("contactPhone")}
                placeholder={tr("formPhonePlaceholder")}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("formName")}
              </label>
              <input
                value={form.contactName}
                onChange={set("contactName")}
                placeholder={tr("formNamePlaceholder")}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </section>

          {/* ── Submit button ─────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white
                       py-4 rounded-2xl font-bold text-base hover:bg-orange-600
                       active:scale-95 transition-all disabled:opacity-60 mb-6"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {tr("formSubmitting")}</>
            ) : (
              <><Home className="w-5 h-5" /> {tr("formSubmit")}</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ListProperty;



