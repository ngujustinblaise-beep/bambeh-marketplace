/**
 * src/pages/PostMarketplaceItemPage.tsx â€” Bambeh Marketplace
 *
 * FIXES â€” June 2026
 *  âœ… FIX 1: loadDraft() was calling useLang() inside a plain function â€”
 *            illegal React hook call â†’ crash on every visit to the sell page.
 *            loadDraft() is now a pure function (no hooks).
 *  âœ… FIX 2: Full i18n â€” English / French / Hausa / Arabic / Pidgin / Fulfulde
 *  âœ… FIX 3: Language switches INSTANTLY â€” useLangState() hook + "langChange" event
 *  âœ… FIX 4: Real Supabase Storage upload (bucket: "listings")
 *  âœ… FIX 5: Insert uses seller_id (correct column); expires_at set to +30 days
 *  âœ… FIX 6: Draft save / restore / clear (pure functions, no hooks)
 *  âœ… FIX 7: Voice-control landmark aria-labels added
 *  âœ… FIX 8: "Save as Draft" option on Step 3
 *
 * Â© 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Upload, X, Check,
  Loader2, Camera, AlertCircle, FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Lang = "en" | "fr" | "ha" | "ar" | "pcm" | "ff";

const TR: Record<string, Record<Lang, string>> = {
  sell_item:      { en: "Sell an Item",             fr: "Vendre un article",          ha: "Sayar da kaya",          ar: "Ø¨ÙŠØ¹ Ù…Ù†ØªØ¬",                   pcm: "Sell Item",              ff: "YoÉ“ Kala" },
  step_of:        { en: "Step",                     fr: "Ã‰tape",                      ha: "Matakai",                ar: "Ø®Ø·ÙˆØ©",                         pcm: "Step",                   ff: "Lahal" },
  of:             { en: "of",                       fr: "sur",                        ha: "na",                     ar: "Ù…Ù†",                           pcm: "of",                     ff: "e" },
  item_details:   { en: "Item Details",             fr: "DÃ©tails de l'article",       ha: "Bayanan kaya",           ar: "ØªÃ™ÂØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬",                pcm: "Item Details",           ff: "PijirÉ—e Kala" },
  title:          { en: "Title *",                  fr: "Titre *",                    ha: "Take *",                 ar: "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† *",                    pcm: "Name *",                 ff: "Tiitoonde *" },
  title_ph:       { en: "e.g. iPhone 15 Pro 256GB", fr: "ex. iPhone 15 Pro 256 Go",   ha: "misali: iPhone 15 Pro",  ar: "Ù…Ø«Ø§Ù„: Ø¢ÙŠÃ™ÂÙˆÙ† 15 Ø¨Ø±Ùˆ",           pcm: "e.g. iPhone 15 Pro",     ff: "ex. iPhone 15 Pro" },
  description:    { en: "Description *",            fr: "Description *",              ha: "Bayani *",               ar: "Ø§Ù„ÙˆØµÃ™Â *",                      pcm: "Description *",          ff: "Pijirde *" },
  desc_ph:        { en: "Describe your item: condition, why you're selling, extras includedâ€¦", fr: "DÃ©crivez votre article : Ã©tat, raison de vente, accessoires inclusâ€¦", ha: "Bayyana kaya: yanayi, dalilin siyarwaâ€¦", ar: "ØµÃ™Â Ù…Ù†ØªØ¬Ùƒ: Ø§Ù„Ø­Ø§Ù„Ø©ØŒ Ø³Ø¨Ø¨ Ø§Ù„Ø¨ÙŠØ¹â€¦", pcm: "Tell people about the item: condition, reasonâ€¦", ff: "Pijir kala: ko waÉ—i, ko holliÉ—oâ€¦" },
  category:       { en: "Category *",              fr: "CatÃ©gorie *",                ha: "Rukuni *",               ar: "Ø§Ù„Ã™ÂØ¦Ø© *",                      pcm: "Category *",             ff: "Jikkuure *" },
  condition:      { en: "Condition *",              fr: "Ã‰tat *",                     ha: "Yanayi *",               ar: "Ø§Ù„Ø­Ø§Ù„Ø© *",                     pcm: "Condition *",            ff: "Damal *" },
  price:          { en: "Price (XAF) *",            fr: "Prix (XAF) *",               ha: "Farashi (XAF) *",        ar: "Ø§Ù„Ø³Ø¹Ø± (Ã™ÂØ±Ù†Ùƒ Ø£Ã™ÂØ±ÙŠÙ‚ÙŠ) *",        pcm: "Price (XAF) *",          ff: "Njaru (XAF) *" },
  price_ph:       { en: "e.g. 50,000",              fr: "ex. 50 000",                 ha: "misali: 50,000",         ar: "Ù…Ø«Ø§Ù„: 50,000",                 pcm: "e.g. 50,000",            ff: "ex. 50,000" },
  location:       { en: "Location *",              fr: "Lieu *",                     ha: "Wuri *",                 ar: "Ø§Ù„Ù…ÙˆÙ‚Ø¹ *",                     pcm: "Location *",             ff: "Dow *" },
  location_ph:    { en: "e.g. Bastos, YaoundÃ©",    fr: "ex. Bastos, YaoundÃ©",        ha: "misali: Bamenda",        ar: "Ù…Ø«Ø§Ù„: Ø¨Ø§Ø³ØªÙˆØ³ØŒ ÙŠØ§ÙˆÙ†Ø¯ÙŠ",         pcm: "e.g. Bastos, YaoundÃ©",   ff: "ex. Bastos, YaoundÃ©" },
  phone:          { en: "WhatsApp / Phone",         fr: "WhatsApp / TÃ©lÃ©phone",       ha: "WhatsApp / Waya",        ar: "ÙˆØ§ØªØ³Ø§Ø¨ / Ù‡Ø§ØªÃ™Â",                pcm: "WhatsApp / Phone",       ff: "WhatsApp / Weyol" },
  phone_ph:       { en: "+237 6XX XXX XXX",         fr: "+237 6XX XXX XXX",           ha: "+237 6XX XXX XXX",       ar: "+237 6XX XXX XXX",             pcm: "+237 6XX XXX XXX",       ff: "+237 6XX XXX XXX" },
  negotiable:     { en: "Price is negotiable",      fr: "Prix nÃ©gociable",            ha: "Ana tattaunawa",         ar: "Ø§Ù„Ø³Ø¹Ø± Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªÃ™ÂØ§ÙˆØ¶",           pcm: "Price nego",             ff: "Njaru hewtii" },
  next_photos:    { en: "Next â€” Add Photos",        fr: "Suivant â€” Ajouter des photos", ha: "Gaba â€” Æ˜ara hotuna",  ar: "Ø§Ù„ØªØ§Ù„ÙŠ â€” Ø£Ø¶Ã™Â ØµÙˆØ±Ø§Ù‹",           pcm: "Next â€” Add Photos",      ff: "Yeeso â€” Æeydu Foto" },
  add_photos:     { en: "Add Photos",               fr: "Ajouter des photos",         ha: "Æ˜ara hotuna",           ar: "Ø£Ø¶Ã™Â ØµÙˆØ±Ø§Ù‹",                    pcm: "Add Photos",             ff: "Æeydu Foto" },
  photos_hint:    { en: "Up to 6 photos. First photo is the cover.", fr: "Jusqu'Ã  6 photos. La premiÃ¨re est la couverture.", ha: "Har hoto 6. Na farko shine cover.", ar: "Ø­ØªÙ‰ 6 ØµÙˆØ±. Ø§Ù„Ø£ÙˆÙ„Ù‰ Ù‡ÙŠ Ø§Ù„ØºÙ„Ø§Ã™Â.", pcm: "Max 6 pictures. First one na cover.", ff: "Haa 6 foto. Araniwol na cover." },
  cover:          { en: "COVER",                    fr: "COUVERTURE",                 ha: "COVER",                  ar: "ØºÙ„Ø§Ã™Â",                         pcm: "COVER",                  ff: "COVER" },
  tap_upload:     { en: "Tap to upload photos",     fr: "Appuyez pour ajouter des photos", ha: "Danna don É—ora hotuna", ar: "Ø§Ø¶ØºØ· Ù„Ø±Ã™ÂØ¹ Ø§Ù„ØµÙˆØ±",           pcm: "Tap to add pictures",    ff: "Jokku ngam É“eydu foto" },
  photo_formats:  { en: "JPG, PNG, WebP â€” max 6",  fr: "JPG, PNG, WebP â€” max 6",     ha: "JPG, PNG, WebP â€” max 6", ar: "JPG, PNG, WebP â€” Ø§Ù„Ø­Ø¯ 6",      pcm: "JPG, PNG â€” max 6",       ff: "JPG, PNG â€” max 6" },
  photos_optional:{ en: "Photos are optional but greatly increase your chances of selling!", fr: "Les photos sont facultatives mais augmentent vos chances!", ha: "Hotuna ba tilas ba amma suna taimakawa!", ar: "Ø§Ù„ØµÙˆØ± Ø§Ø®ØªÙŠØ§Ø±ÙŠØ© Ù„ÙƒÙ†Ù‡Ø§ ØªØ²ÙŠØ¯ Ã™ÂØ±Øµ Ø§Ù„Ø¨ÙŠØ¹!", pcm: "Picture no must but e help plenty!", ff: "Foto alaa tilas kono e waÉ—tu!" },
  next_review:    { en: "Next â€” Review",            fr: "Suivant â€” VÃ©rifier",         ha: "Gaba â€” Duba",            ar: "Ø§Ù„ØªØ§Ù„ÙŠ â€” Ù…Ø±Ø§Ø¬Ø¹Ø©",              pcm: "Next â€” Check",           ff: "Yeeso â€” Yiy" },
  review_post:    { en: "Review & Post",            fr: "VÃ©rifier & Publier",         ha: "Duba & Buga",            ar: "Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆÙ†Ø´Ø±",                  pcm: "Check & Post",           ff: "Yiy & Yeeso" },
  posting:        { en: "Postingâ€¦",                 fr: "Publicationâ€¦",               ha: "Ana bugaâ€¦",              ar: "Ø¬Ø§Ø± Ø§Ù„Ù†Ø´Ø±â€¦",                   pcm: "Dey postâ€¦",              ff: "Naatirdeâ€¦" },
  post_listing:   { en: "Post Listing",             fr: "Publier l'annonce",          ha: "Buga jeri",              ar: "Ù†Ø´Ø± Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†",                  pcm: "Post Listing",           ff: "Yeeso Nde" },
  save_draft:     { en: "Save as Draft",            fr: "Sauvegarder comme brouillon", ha: "Adana a matsayin daftar", ar: "Ø­Ã™ÂØ¸ ÙƒÙ…Ø³ÙˆØ¯Ø©",                  pcm: "Save as Draft",          ff: "Danndu haa Draft" },
  visible_to_all: { en: "Your listing will be visible to all Bambeh users immediately.", fr: "Votre annonce sera visible par tous les utilisateurs de Bambeh immÃ©diatement.", ha: "Jerin ku zai iya ganin duk masu amfani da Bambeh nan take.", ar: "Ø³ØªÙƒÙˆÙ† Ù‚Ø§Ø¦Ù…ØªÙƒ Ù…Ø±Ø¦ÙŠØ© Ù„Ø¬Ù…ÙŠØ¹ Ù…Ø³ØªØ®Ø¯Ù…ÙŠ Bambeh Ã™ÂÙˆØ±Ø§Ù‹.", pcm: "Your listing go show for all Bambeh users right now.", ff: "Nde maa yiyete e Bambeh É—immo hannde." },
  login_required: { en: "You must be logged in to post a listing.", fr: "Vous devez Ãªtre connectÃ© pour publier une annonce.", ha: "Dole ne ku shiga don buga jeri.", ar: "ÙŠØ¬Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù†Ø´Ø± Ø¥Ø¹Ù„Ø§Ù†.", pcm: "You must login before you post.", ff: "Tiggee naatude ngam yeesude." },
  unexpected:     { en: "Unexpected error. Please try again.", fr: "Erreur inattendue. RÃ©essayez.", ha: "Kuskure da ba a tsammani. Sake.", ar: "Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹. Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹.", pcm: "Unexpected error. Try again.", ff: "Juumre anndaande. Artu jeer." },
  draft_saved:    { en: "Draft saved!", fr: "Brouillon sauvegardÃ©!", ha: "Daftar ya adana!", ar: "ØªÙ… Ø­Ã™ÂØ¸ Ø§Ù„Ù…Ø³ÙˆØ¯Ø©!", pcm: "Draft saved!", ff: "Draft nanngi!" },
};

// â”€â”€â”€ Language helpers â€” ALL PURE (no hooks) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getLang(): Lang {
  try {
    const s = localStorage.getItem("bambeh_lang") as Lang;
    if (s && ["en","fr","ha","ar","pcm","ff"].includes(s)) return s;
  } catch { /* ignore */ }
  const b = navigator.language.split("-")[0] as Lang;
  return ["en","fr","ha","ar","pcm","ff"].includes(b) ? b : "fr";
}

function tx(key: string, lang: Lang): string {
  return TR[key]?.[lang] ?? TR[key]?.["en"] ?? key;
}

// â”€â”€â”€ Hook: reactive language (fires when user switches language) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useLangState(): Lang {
  const [lang, setLang] = useState<Lang>(getLang);
  useEffect(() => {
    const onLangChange = () => setLang(getLang());
    window.addEventListener("langChange", onLangChange);
    window.addEventListener("storage",   onLangChange);
    return () => {
      window.removeEventListener("langChange", onLangChange);
      window.removeEventListener("storage",   onLangChange);
    };
  }, []);
  return lang;
}

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Draft helpers â€” PURE FUNCTIONS, NO HOOKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// âš Ã¯Â¸Â  loadDraft() MUST NOT call useLang() or any React hook.
//     It is used as the useState initialiser â€” React calls it before any hooks run.
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

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PostMarketplaceItemPage() {
  const navigate     = useNavigate();
  const fileRef      = useRef<HTMLInputElement>(null);
  const lang         = useLangState();           // âœ… hook called at top level
  const t            = (key: string) => tx(key, lang);

  const [step,       setStep]       = useState(1);
  const [form,       setForm]       = useState<DraftData>(loadDraft);  // âœ… pure fn
  const [photos,     setPhotos]     = useState<File[]>([]);
  const [previews,   setPreviews]   = useState<string[]>([]);
  const [posting,    setPosting]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isRtl = lang === "ar";

  // â”€â”€ Form helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Photo handling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Step validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function step1Valid(): boolean {
    return (
      form.title.trim().length >= 3 &&
      form.description.trim().length >= 10 &&
      parseInt(form.price.replace(/\D/g, ""), 10) > 0 &&
      form.location.trim().length >= 2
    );
  }

  // â”€â”€ Upload photos to Supabase Storage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function uploadPhotos(sellerId: string): Promise<string[]> {
    if (photos.length === 0) return [];
    const urls: string[] = [];
    for (const file of photos) {
      const ext  = file.name.split(".").pop() ?? "jpg";
      const path = `marketplace/${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("listings")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) { console.warn("Photo upload failed:", upErr.message); continue; }
      const { data: urlData } = supabase.storage.from("listings").getPublicUrl(path);
      if (urlData?.publicUrl) urls.push(urlData.publicUrl);
    }
    return urls;
  }

  // â”€â”€ Save draft to Supabase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSaveDraft = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) { setError(t("login_required")); return; }

      const imageUrls = await uploadPhotos(user.id);
      const price = parseInt(form.price.replace(/\D/g, ""), 10) || 0;
      const images = imageUrls.map((url, idx) => ({ id: `img-${Date.now()}-${idx}`, url, order: idx, is_main: idx === 0 }));

      const { error: insertErr } = await supabase.from("listings").insert({
        seller_id:    user.id,
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

  // â”€â”€ Submit (publish) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = useCallback(async () => {
    setPosting(true);
    setError(null);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) { setError(t("login_required")); return; }

      const imageUrls = await uploadPhotos(user.id);
      const price = parseInt(form.price.replace(/\D/g, ""), 10);
      const images = imageUrls.map((url, idx) => ({ id: `img-${Date.now()}-${idx}`, url, order: idx, is_main: idx === 0 }));

      const { error: insertErr } = await supabase.from("listings").insert({
        seller_id:    user.id,
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
      });

      if (insertErr) { setError(insertErr.message); return; }
      clearDraft();
      navigate("/marketplace", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("unexpected"));
    } finally {
      setPosting(false);
    }
  }, [form, photos, navigate, lang]);

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // RENDER
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        {/* â”€â”€ STEP 1: Details â”€â”€ */}
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

        {/* â”€â”€ STEP 2: Photos â”€â”€ */}
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

        {/* â”€â”€ STEP 3: Review & Post â”€â”€ */}
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
                <p className="text-xs text-gray-400">{form.category} Â· {form.condition}</p>
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

// â”€â”€â”€ Tiny helper components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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




