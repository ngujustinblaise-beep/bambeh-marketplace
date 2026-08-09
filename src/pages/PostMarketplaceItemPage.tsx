/**
 * src/pages/PostMarketplaceItemPage.tsx — Bambeh Marketplace
 *
 * FIXES — June 2026
 *  ✅ FIX 1: loadDraft() was calling useLang() inside a plain function —
 *            illegal React hook call → crash on every visit to the sell page.
 *            loadDraft() is now a pure function (no hooks).
 *  ✅ FIX 2: Full i18n — English / French / Hausa / Arabic / Pidgin / Fulfulde
 *  ✅ FIX 3: Language switches INSTANTLY — useLangState() hook + "langChange" event
 *  ✅ FIX 4: Real Supabase Storage upload (bucket: "listings")
 *  ✅ FIX 5: Insert uses seller_id (correct column); expires_at set to +30 days
 *  ✅ FIX 6: Draft save / restore / clear (pure functions, no hooks)
 *  ✅ FIX 7: Voice-control landmark aria-labels added
 *  ✅ FIX 8: "Save as Draft" option on Step 3
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { prepImage } from "@/utils/bambehImagePrep";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Upload, X, Check,
  Loader2, Camera, AlertCircle, FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import FlashDealToggle, {
  emptyFlashDeal,
  createFlashDealForListing,
  type FlashDealConfig,
} from '@/components/deals/FlashDealToggle';

// ─── i18n ─────────────────────────────────────────────────────────────────────
type Lang = "en" | "fr" | "ha" | "ar" | "pcm" | "ff";

const TR: Record<string, Record<Lang, string>> = {
  sell_item:      { en: "Sell an Item",             fr: "Vendre un article",          ha: "Sayar da kaya",          ar: "بيع منتج",                   pcm: "Sell Item",              ff: "Yoɓ Kala" },
  step_of:        { en: "Step",                     fr: "Étape",                      ha: "Matakai",                ar: "خطوة",                         pcm: "Step",                   ff: "Lahal" },
  of:             { en: "of",                       fr: "sur",                        ha: "na",                     ar: "من",                           pcm: "of",                     ff: "e" },
  item_details:   { en: "Item Details",             fr: "Détails de l'article",       ha: "Bayanan kaya",           ar: "تÙاصيل المنتج",                pcm: "Item Details",           ff: "Pijirɗe Kala" },
  title:          { en: "Title *",                  fr: "Titre *",                    ha: "Take *",                 ar: "العنوان *",                    pcm: "Name *",                 ff: "Tiitoonde *" },
  title_ph:       { en: "e.g. iPhone 15 Pro 256GB", fr: "ex. iPhone 15 Pro 256 Go",   ha: "misali: iPhone 15 Pro",  ar: "مثال: آيÙون 15 برو",           pcm: "e.g. iPhone 15 Pro",     ff: "ex. iPhone 15 Pro" },
  description:    { en: "Description *",            fr: "Description *",              ha: "Bayani *",               ar: "الوصÙ *",                      pcm: "Description *",          ff: "Pijirde *" },
  desc_ph:        { en: "Describe your item: condition, why you're selling, extras included…", fr: "Décrivez votre article : état, raison de vente, accessoires inclus…", ha: "Bayyana kaya: yanayi, dalilin siyarwa…", ar: "صÙ منتجك: الحالة، سبب البيع…", pcm: "Tell people about the item: condition, reason…", ff: "Pijir kala: ko waɗi, ko holliɗo…" },
  category:       { en: "Category *",              fr: "Catégorie *",                ha: "Rukuni *",               ar: "الÙئة *",                      pcm: "Category *",             ff: "Jikkuure *" },
  condition:      { en: "Condition *",              fr: "État *",                     ha: "Yanayi *",               ar: "الحالة *",                     pcm: "Condition *",            ff: "Damal *" },
  price:          { en: "Price (XAF) *",            fr: "Prix (XAF) *",               ha: "Farashi (XAF) *",        ar: "السعر (Ùرنك أÙريقي) *",        pcm: "Price (XAF) *",          ff: "Njaru (XAF) *" },
  price_ph:       { en: "e.g. 50,000",              fr: "ex. 50 000",                 ha: "misali: 50,000",         ar: "مثال: 50,000",                 pcm: "e.g. 50,000",            ff: "ex. 50,000" },
  location:       { en: "Location *",              fr: "Lieu *",                     ha: "Wuri *",                 ar: "الموقع *",                     pcm: "Location *",             ff: "Dow *" },
  location_ph:    { en: "e.g. Bastos, Yaoundé",    fr: "ex. Bastos, Yaoundé",        ha: "misali: Bamenda",        ar: "مثال: باستوس، ياوندي",         pcm: "e.g. Bastos, Yaoundé",   ff: "ex. Bastos, Yaoundé" },
  phone:          { en: "WhatsApp / Phone",         fr: "WhatsApp / Téléphone",       ha: "WhatsApp / Waya",        ar: "واتساب / هاتÙ",                pcm: "WhatsApp / Phone",       ff: "WhatsApp / Weyol" },
  phone_ph:       { en: "+237 6XX XXX XXX",         fr: "+237 6XX XXX XXX",           ha: "+237 6XX XXX XXX",       ar: "+237 6XX XXX XXX",             pcm: "+237 6XX XXX XXX",       ff: "+237 6XX XXX XXX" },
  negotiable:     { en: "Price is negotiable",      fr: "Prix négociable",            ha: "Ana tattaunawa",         ar: "السعر قابل للتÙاوض",           pcm: "Price nego",             ff: "Njaru hewtii" },
  next_photos:    { en: "Next — Add Photos",        fr: "Suivant — Ajouter des photos", ha: "Gaba — Ƙara hotuna",  ar: "التالي — أضÙ صوراً",           pcm: "Next — Add Photos",      ff: "Yeeso — Ɓeydu Foto" },
  add_photos:     { en: "Add Photos",               fr: "Ajouter des photos",         ha: "Ƙara hotuna",           ar: "أضÙ صوراً",                    pcm: "Add Photos",             ff: "Ɓeydu Foto" },
  photos_hint:    { en: "Up to 6 photos. First photo is the cover.", fr: "Jusqu'à 6 photos. La première est la couverture.", ha: "Har hoto 6. Na farko shine cover.", ar: "حتى 6 صور. الأولى هي الغلاÙ.", pcm: "Max 6 pictures. First one na cover.", ff: "Haa 6 foto. Araniwol na cover." },
  cover:          { en: "COVER",                    fr: "COUVERTURE",                 ha: "COVER",                  ar: "غلاÙ",                         pcm: "COVER",                  ff: "COVER" },
  tap_upload:     { en: "Tap to upload photos",     fr: "Appuyez pour ajouter des photos", ha: "Danna don ɗora hotuna", ar: "اضغط لرÙع الصور",           pcm: "Tap to add pictures",    ff: "Jokku ngam ɓeydu foto" },
  photo_formats:  { en: "JPG, PNG, WebP — max 6",  fr: "JPG, PNG, WebP — max 6",     ha: "JPG, PNG, WebP — max 6", ar: "JPG, PNG, WebP — الحد 6",      pcm: "JPG, PNG — max 6",       ff: "JPG, PNG — max 6" },
  photos_optional:{ en: "Photos are optional but greatly increase your chances of selling!", fr: "Les photos sont facultatives mais augmentent vos chances!", ha: "Hotuna ba tilas ba amma suna taimakawa!", ar: "الصور اختيارية لكنها تزيد Ùرص البيع!", pcm: "Picture no must but e help plenty!", ff: "Foto alaa tilas kono e waɗtu!" },
  next_review:    { en: "Next — Review",            fr: "Suivant — Vérifier",         ha: "Gaba — Duba",            ar: "التالي — مراجعة",              pcm: "Next — Check",           ff: "Yeeso — Yiy" },
  review_post:    { en: "Review & Post",            fr: "Vérifier & Publier",         ha: "Duba & Buga",            ar: "مراجعة ونشر",                  pcm: "Check & Post",           ff: "Yiy & Yeeso" },
  posting:        { en: "Posting…",                 fr: "Publication…",               ha: "Ana buga…",              ar: "جار النشر…",                   pcm: "Dey post…",              ff: "Naatirde…" },
  post_listing:   { en: "Post Listing",             fr: "Publier l'annonce",          ha: "Buga jeri",              ar: "نشر الإعلان",                  pcm: "Post Listing",           ff: "Yeeso Nde" },
  save_draft:     { en: "Save as Draft",            fr: "Sauvegarder comme brouillon", ha: "Adana a matsayin daftar", ar: "حÙظ كمسودة",                  pcm: "Save as Draft",          ff: "Danndu haa Draft" },
  visible_to_all: { en: "Your listing will be visible to all Bambeh users immediately.", fr: "Votre annonce sera visible par tous les utilisateurs de Bambeh immédiatement.", ha: "Jerin ku zai iya ganin duk masu amfani da Bambeh nan take.", ar: "ستكون قائمتك مرئية لجميع مستخدمي Bambeh Ùوراً.", pcm: "Your listing go show for all Bambeh users right now.", ff: "Nde maa yiyete e Bambeh ɗimmo hannde." },
  login_required: { en: "You must be logged in to post a listing.", fr: "Vous devez être connecté pour publier une annonce.", ha: "Dole ne ku shiga don buga jeri.", ar: "يجب تسجيل الدخول لنشر إعلان.", pcm: "You must login before you post.", ff: "Tiggee naatude ngam yeesude." },
  unexpected:     { en: "Unexpected error. Please try again.", fr: "Erreur inattendue. Réessayez.", ha: "Kuskure da ba a tsammani. Sake.", ar: "خطأ غير متوقع. حاول مجدداً.", pcm: "Unexpected error. Try again.", ff: "Juumre anndaande. Artu jeer." },
  draft_saved:    { en: "Draft saved!", fr: "Brouillon sauvegardé!", ha: "Daftar ya adana!", ar: "تم حÙظ المسودة!", pcm: "Draft saved!", ff: "Draft nanngi!" },
};

// ─── Language helpers — ALL PURE (no hooks) ────────────────────────────────────
// FIX302: read the key the APP actually writes, and translate its
// language codes into the ones this page's dictionary uses.
// App.tsx line 79:  const LANG_KEY = "Bambeh_language"
// This page used to read "bambeh_lang", which nothing ever writes.
const LANG_ALIASES: Record<string, Lang> = {
  en: "en", eng: "en", english: "en",
  fr: "fr", fra: "fr", french: "fr", francais: "fr",
  ar: "ar", ara: "ar", arabic: "ar",
  ff: "ff", ful: "ff", fulfulde: "ff",
  // the app stores "pidgin"; this page's dictionary is keyed "pcm"
  pcm: "pcm", pidgin: "pcm", pid: "pcm",
  ha: "ha", hausa: "ha",
};

function getLang(): Lang {
  try {
    const raw = String(
      localStorage.getItem("Bambeh_language") ||
      localStorage.getItem("bambeh_lang") ||   // the old key, still honoured
      ""
    ).trim().toLowerCase();
    const mapped = LANG_ALIASES[raw];
    if (mapped) return mapped;
  } catch { /* storage blocked */ }
  // Fall back to ENGLISH, not to navigator.language. Reading the
  // computer's language is exactly what froze this page in English.
  return "en";
}


function tx(key: string, lang: Lang): string {
  return TR[key]?.[lang] ?? TR[key]?.["en"] ?? key;
}

// ─── Hook: reactive language (fires when user switches language) ───────────────
function useLangState(): Lang {
  const [lang, setLang] = useState<Lang>(getLang);
  useEffect(() => {
    const onLangChange = () => setLang(getLang());
    // FIX302: this is the one the app really fires (App.tsx line 143).
    window.addEventListener("bambeh:langchange", onLangChange);
    // The old names are kept so nothing that used to work stops.
    window.addEventListener("langChange", onLangChange);
    window.addEventListener("storage",   onLangChange);
    return () => {
      window.removeEventListener("bambeh:langchange", onLangChange);
      window.removeEventListener("langChange", onLangChange);
      window.removeEventListener("storage",   onLangChange);
    };
  }, []);
  return lang;
}


// ─── Types ────────────────────────────────────────────────────────────────────
interface DraftData {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  location: string;
  phone: string;
  negotiable: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DRAFT_KEY = "bambeh_marketplace_draft";

const CATEGORIES = [
  "Electronics", "Fashion", "Appliances",
  "Books", "Furniture", "Vehicles", "Rentals", "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

const EMPTY: DraftData = {
  title: "", description: "", price: "",
  category: "Electronics", condition: "Good",
  location: "", phone: "", negotiable: false,
};

// ─── Draft helpers — PURE FUNCTIONS, NO HOOKS ──────────────────────────────────
// ⚠ï¸  loadDraft() MUST NOT call useLang() or any React hook.
//     It is used as the useState initialiser — React calls it before any hooks run.
function loadDraft(): DraftData {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}") };
  } catch { return EMPTY; }
}

function saveDraftToStorage(d: DraftData) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PostMarketplaceItemPage() {
  const navigate     = useNavigate();
  const fileRef      = useRef<HTMLInputElement>(null);
  const lang         = useLangState();           // ✅ hook called at top level
  const t            = (key: string) => tx(key, lang);

  const [step,       setStep]       = useState(1);
  const [form,       setForm]       = useState<DraftData>(loadDraft);  // ✅ pure fn
  const [photos,     setPhotos]     = useState<File[]>([]);
  const [previews,   setPreviews]   = useState<string[]>([]);
  const [posting,    setPosting]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  // FIX187 — optional Flash Deal for this listing
  const [deal,       setDeal]       = useState<FlashDealConfig>(emptyFlashDeal);

  const isRtl = lang === "ar";

  // ── Form helpers ──────────────────────────────────────────────────────────
  function set(field: keyof DraftData, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      saveDraftToStorage(next);
      return next;
    });
  }

  function formatPriceDisplay(raw: string): string {
    const num = parseInt(raw.replace(/\D/g, ""), 10);
    return isNaN(num) ? "" : num.toLocaleString("fr-CM");
  }

  // ── Photo handling ────────────────────────────────────────────────────────
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - photos.length);
    setPhotos((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Step validation ───────────────────────────────────────────────────────
  function step1Valid(): boolean {
    return (
      form.title.trim().length >= 3 &&
      form.description.trim().length >= 10 &&
      parseInt(form.price.replace(/\D/g, ""), 10) > 0 &&
      form.location.trim().length >= 2
    );
  }

  // ── Upload photos to Supabase Storage ────────────────────────────────────
  async function uploadPhotos(sellerId: string): Promise<string[]> {
    if (photos.length === 0) return [];
    const urls: string[] = [];
    for (const rawFile of photos) {
      const file = await prepImage(rawFile);   // FIX296
      const ext  = file.name.split(".").pop() ?? "jpg";
      const path = `marketplace/${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("listings")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) { throw new Error("Photo upload failed: " + upErr.message); }
      const { data: urlData } = supabase.storage.from("listings").getPublicUrl(path);
      if (urlData?.publicUrl) urls.push(urlData.publicUrl);
    }
    return urls;
  }

  // ── Save draft to Supabase ────────────────────────────────────────────────
  const handleSaveDraft = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) { setError(t("login_required")); return; }

      const imageUrls = await uploadPhotos(user.id);
      const price = parseInt(form.price.replace(/\D/g, ""), 10) || 0;
      const images = imageUrls;

      const { error: insertErr } = await supabase.from("listings").insert({
        seller_id:    user.id,
        user_id:      user.id,
        type:         "marketplace",
        title:        form.title.trim() || "(Draft)",
        description:  form.description.trim(),
        price,
        category:     form.category,
        condition:    form.condition,
        location:     form.location.trim(),
        phone:        form.phone.trim() || null,
        negotiable:   form.negotiable,
        images,
        extra:        { image_url: imageUrls[0] ?? null },
        status:       "draft",
        view_count:   0,
        is_featured:  false,
        is_sponsored: false,
        expires_at:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (insertErr) { setError(insertErr.message); return; }
      clearDraft();
      setSuccessMsg(t("draft_saved"));
      setTimeout(() => navigate("/marketplace/drafts"), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("unexpected"));
    } finally {
      setSaving(false);
    }
  }, [form, photos, lang]);

  // ── Submit (publish) ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setPosting(true);
    setError(null);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) { setError(t("login_required")); return; }

      const imageUrls = await uploadPhotos(user.id);
      const price = parseInt(form.price.replace(/\D/g, ""), 10);
      const images = imageUrls;

      const { data: inserted, error: insertErr } = await supabase.from("listings").insert({
        seller_id:    user.id,
        user_id:      user.id,
        type:         "marketplace",
        title:        form.title.trim(),
        description:  form.description.trim(),
        price,
        category:     form.category,
        condition:    form.condition,
        location:     form.location.trim(),
        phone:        form.phone.trim() || null,
        negotiable:   form.negotiable,
        images,
        extra:        { image_url: imageUrls[0] ?? null },
        status:       "active",
        view_count:   0,
        is_featured:  false,
        is_sponsored: false,
        expires_at:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).select("id").single();

      if (insertErr) { setError(insertErr.message); return; }

      // FIX187 — publish the Flash Deal for this listing, if requested.
      if (deal.enabled && inserted?.id) {
        try {
          await createFlashDealForListing({
            listingId:     inserted.id,
            title:         form.title.trim(),
            description:   form.description.trim(),
            category:      form.category,
            imageUrl:      imageUrls[0] ?? null,
            originalPrice: price,
            config:        deal,
            user,
            sellerPhone:   form.phone.trim() || null,
          });
        } catch (e) {
          setError("Listing posted, but the Flash Deal failed: " +
            (e instanceof Error ? e.message : "unknown error"));
          return;
        }
      }

      clearDraft();
      navigate("/marketplace", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("unexpected"));
    } finally {
      setPosting(false);
    }
  }, [form, photos, navigate, lang]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gray-50 pb-20"
      dir={isRtl ? "rtl" : "ltr"}
      aria-label={t("sell_item")}
    >
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
          aria-label="Go back"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">{t("sell_item")}</p>
          <p className="text-xs text-gray-400">{t("step_of")} {step} {t("of")} 3</p>
        </div>
        {/* Step dots */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${s <= step ? "bg-teal-600" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="mx-4 mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-teal-600" />
          <p className="text-sm text-teal-700 font-medium">{successMsg}</p>
        </div>
      )}

      <div className="max-w-lg mx-auto p-4">
        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">{t("item_details")}</h2>

            <Field label={t("title")}>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={t("title_ph")}
                maxLength={100}
                className={inputCls}
                aria-label={t("title")}
              />
            </Field>

            <Field label={t("description")}>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t("desc_ph")}
                rows={4}
                maxLength={1000}
                className={`${inputCls} resize-none`}
                aria-label={t("description")}
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {form.description.length}/1000
              </p>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("category")}>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={inputCls}
                  aria-label={t("category")}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={t("condition")}>
                <select
                  value={form.condition}
                  onChange={(e) => set("condition", e.target.value)}
                  className={inputCls}
                  aria-label={t("condition")}
                >
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <Field label={t("price")}>
              <div className="relative">
                <input
                  value={formatPriceDisplay(form.price)}
                  onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder={t("price_ph")}
                  className={`${inputCls} pr-14`}
                  aria-label={t("price")}
                />
                <span className="absolute right-3 top-2.5 text-sm text-gray-500 font-semibold">XAF</span>
              </div>
            </Field>

            <Field label={t("location")}>
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder={t("location_ph")}
                className={inputCls}
                aria-label={t("location")}
              />
            </Field>

            <Field label={t("phone")}>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder={t("phone_ph")}
                inputMode="tel"
                className={inputCls}
                aria-label={t("phone")}
              />
            </Field>

            {/* Negotiable toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                role="switch"
                aria-checked={form.negotiable}
                onClick={() => set("negotiable", !form.negotiable)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${form.negotiable ? "bg-teal-600" : "bg-gray-200"} relative`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.negotiable ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm text-gray-700 font-medium">{t("negotiable")}</span>
            </label>

            <button
              onClick={() => step1Valid() && setStep(2)}
              disabled={!step1Valid()}
              className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-teal-700 active:scale-95 transition"
              aria-label={t("next_photos")}
            >
              {t("next_photos")} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Photos ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{t("add_photos")}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t("photos_hint")}</p>
            </div>

            {/* Photo grid */}
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden relative bg-gray-100">
                  <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5 font-bold">
                      {t("cover")}
                    </div>
                  )}
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                    aria-label={`Remove photo ${idx + 1}`}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              {photos.length < 6 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-teal-400 transition-colors"
                  aria-label="Add photo"
                >
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Add</span>
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {photos.length === 0 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-10 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center gap-2 hover:border-teal-400 transition-colors"
                aria-label={t("tap_upload")}
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">{t("tap_upload")}</p>
                <p className="text-xs text-gray-400">{t("photo_formats")}</p>
              </button>
            )}

            <p className="text-xs text-gray-400 text-center">{t("photos_optional")}</p>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 active:scale-95 transition"
              aria-label={t("next_review")}
            >
              {t("next_review")} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 3: Review & Post ── */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">{t("review_post")}</h2>

            {/* Preview card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-48 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                {previews[0] ? (
                  <img src={previews[0]} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-teal-200" />
                )}
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs text-gray-400">{form.category} · {form.condition}</p>
                <h3 className="font-bold text-gray-900">{form.title}</h3>
                <p className="text-teal-600 font-bold text-lg">
                  {(parseInt(form.price || "0", 10)).toLocaleString("fr-CM")} XAF
                  {form.negotiable && (
                    <span className="ml-2 text-xs text-green-600 font-normal">(Negotiable)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{form.location}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">{form.description}</p>
                <p className="text-xs text-gray-400 mt-1">{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* FIX187 — optional Flash Deal */}
            <FlashDealToggle
              originalPrice={parseInt(form.price.replace(/\D/g, ""), 10) || 0}
              value={deal}
              onChange={setDeal}
              lang={lang}
            />

            {/* Publish */}
            <button
              onClick={handleSubmit}
              disabled={posting || saving}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 active:scale-95 transition disabled:opacity-60"
              aria-label={t("post_listing")}
            >
              {posting ? (
                <><Loader2 className="w-5 h-5 animate-spin" />{t("posting")}</>
              ) : (
                <><Check className="w-5 h-5" />{t("post_listing")}</>
              )}
            </button>

            {/* Save as draft */}
            <button
              onClick={handleSaveDraft}
              disabled={posting || saving}
              className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition disabled:opacity-60"
              aria-label={t("save_draft")}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{t("posting")}</>
              ) : (
                <><FileText className="w-4 h-4" />{t("save_draft")}</>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">{t("visible_to_all")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tiny helper components ───────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white transition";



