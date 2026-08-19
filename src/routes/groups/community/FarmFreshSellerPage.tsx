// BAMBEH_DEPLOY_TOKEN__FARMFRESHSELLER_FIX358_CLEAN
/**
 * src/pages/FarmFreshSellerPage.tsx — Bambeh Marketplace
 *
 * FIXES:
 *  ✅ BOM character removed from file start
 *  ✅ validateImg no longer calls useLang() (hooks can't be called outside components)
 *  ✅ farmer_id + seller_id BOTH inserted (DB has farmer_id NOT NULL)
 *  ✅ Storage RLS graceful fallback: if image upload fails RLS, listing
 *     is saved WITHOUT photos and user gets a clear warning (not a crash)
 *  ✅ Full i18n: English, French, Pidgin, Arabic, Fulfulde — live-reactive
 *  ✅ 3-step wizard: Produce Details → Location & Description → Photos & Review
 *  ✅ Draft save/restore
 */

import { prepImage } from "@/utils/bambehImagePrep";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";
// FIX358 - the same guard the other six post forms already use.
import { scanForContacts, scanFields, contactWarning } from "@/lib/contactGuard";

const CATEGORIES = ["Vegetables", "Fruits", "Tubers", "Grains", "Legumes", "Herbs", "Dairy", "Other"];
const UNITS      = ["kg", "g", "bunch", "cob", "litre", "bag", "crate", "piece"];

const MAX_IMG   = 5 * 1024 * 1024;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ✅ FIX: validateImg is a plain function — no hooks inside it
function validateImg(f: File): string | null {
  if (!IMG_TYPES.includes(f.type)) return "Only JPG, PNG or WebP images allowed.";
  if (f.size > MAX_IMG) return `File too large (max 5 MB). Got ${(f.size / 1024 / 1024).toFixed(1)} MB.`;
  return null;
}

const fmtXAF = (n: string) =>
  n && !isNaN(Number(n)) && Number(n) > 0
    ? new Intl.NumberFormat("fr-CM").format(Number(n)) + " FCFA"
    : "";

// ── Sub-components ────────────────────────────────────────────────────────────

function StepBar({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2">
        {labels.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200
              ${step > i + 1 ? "bg-green-500 text-white"
                : step === i + 1 ? "bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-900"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {step > i + 1
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                : i + 1}
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-1 rounded-full transition-colors ${step > i + 1 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs font-semibold text-green-600 dark:text-green-400">
        Step {step} of {labels.length}: {labels[step - 1]}
      </p>
    </div>
  );
}

function NavRow({ onDraft, onBack, onNext, nextLabel, saveDraftLabel, disabled = false }: {
  onDraft: () => void; onBack?: () => void;
  onNext: () => void; nextLabel: string; saveDraftLabel: string; disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 pt-4 pb-6">
      <button type="button" onClick={onDraft}
        className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 active:scale-95">
        {saveDraftLabel}
      </button>
      {onBack && (
        <button type="button" onClick={onBack}
          className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 active:scale-95">
          ←
        </button>
      )}
      <button type="button" onClick={onNext} disabled={disabled}
        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]
          ${disabled
            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg shadow-green-500/30"}`}>
        {nextLabel}
      </button>
    </div>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-500 mt-1 font-medium">⚠ {msg}</p> : null;
}

function Lbl({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function BigCheck({ checked, onChange, label, desc }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
        ${checked ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
        ${checked ? "border-green-500 bg-green-500" : "border-gray-300 dark:border-gray-500"}`}>
        {checked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12" /></svg>}
      </div>
      <div>
        <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

interface Draft {
  title: string; category: string; unit: string;
  price: string; quantity: string; is_organic: boolean;
  location: string; description: string; available_for_delivery: boolean;
  payoutPhone: string;
}

/* FIX322 - the payout number. Written as \u escapes on purpose, so no
   future edit can eat the Arabic or the Fulfulde. */
const PAYOUT_COPY: Record<string, Record<string, string>> = {
  en: { label: "Phone number for your payment", ph: "6XX XXX XXX", hint: "This is where your money is sent when somebody buys from you.", required: "Add the phone number where you want to be paid. Without it we cannot send you your money.", saveFailed: "We could not save your payment number. Please try again." },
  fr: { label: "Num\u00e9ro de t\u00e9l\u00e9phone pour votre paiement", ph: "6XX XXX XXX", hint: "C'est l\u00e0 que votre argent sera envoy\u00e9 quand quelqu'un ach\u00e8te chez vous.", required: "Ajoutez le num\u00e9ro o\u00f9 vous voulez \u00eatre pay\u00e9. Sans lui, nous ne pouvons pas vous envoyer votre argent.", saveFailed: "Nous n'avons pas pu enregistrer votre num\u00e9ro. R\u00e9essayez." },
  pidgin: { label: "Phone number wey we go pay you", ph: "6XX XXX XXX", hint: "Na here your money go enter when person buy from you.", required: "Put the phone number wey you want make we pay you. Without am, we no fit send your money.", saveFailed: "We no fit save your number. Abeg try again." },
  ar: { label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0623\u0645\u0648\u0627\u0644\u0643", ph: "6XX XXX XXX", hint: "\u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u062a\u064f\u0631\u0633\u0644 \u0623\u0645\u0648\u0627\u0644\u0643 \u0639\u0646\u062f \u0627\u0644\u0634\u0631\u0627\u0621 \u0645\u0646\u0643.", required: "\u0623\u0636\u0641 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0627\u0644\u0630\u064a \u062a\u0631\u064a\u062f \u0623\u0646 \u062a\u064f\u062f\u0641\u0639 \u0639\u0644\u064a\u0647. \u0628\u062f\u0648\u0646\u0647 \u0644\u0627 \u064a\u0645\u0643\u0646\u0646\u0627 \u0625\u0631\u0633\u0627\u0644 \u0623\u0645\u0648\u0627\u0644\u0643.", saveFailed: "\u062a\u0639\u0630\u0631 \u062d\u0641\u0638 \u0631\u0642\u0645\u0643. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b." },
  ff: { label: "Limce noone ngam yo\u0253eede", ph: "6XX XXX XXX", hint: "Ko \u0257oo kaalis maa neldetee si go\u0257\u0257o soodii to ma.", required: "\u0181eydu limce nokku \u0257o nji\u0257\u0257aa yo\u0253eede. Si alaa, min mbaawaa neldude ma kaalis maa.", saveFailed: "Min mbaawaa danndude limce maa. Artu jeer." },
};

const BLANK: Draft = {
  title: "", category: "Vegetables", unit: "kg",
  price: "", quantity: "", is_organic: false,
  location: "", description: "", available_for_delivery: false,
  payoutPhone: "",
};

const DRAFT_KEY = "bambeh_draft_farm_produce";

/**
 * Upload one image to Supabase Storage.
 * Returns the public URL on success, or null if the upload fails
 * (e.g. RLS policy not yet configured) — caller handles null gracefully.
 */
async function tryUploadImage(dataUrl: string, fileName: string): Promise<string | null> {
  try {
    const res  = await fetch(dataUrl);
    const blob = await prepImage(await res.blob());   // FIX296
    const ext  = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
    const path = `farm-fresh/${Date.now()}-${fileName.replace(/\s/g, "-")}.${ext}`;

    const { error } = await supabase.storage
      .from("farm-images")
      .upload(path, blob, { contentType: blob.type, upsert: false });

    if (error) {
      console.warn("Image upload error (listing will proceed without photo):", error.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from("farm-images").getPublicUrl(path);
    return urlData.publicUrl;
  } catch (e) {
    console.warn("Image upload exception:", e);
    return null;
  }
}

export default function FarmFreshSellerPage() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);
  const lang     = useLang();
  const pc       = PAYOUT_COPY[lang as string] ?? PAYOUT_COPY.en;

  const [step,           setStep]           = useState(1);
  const [d,              setD]              = useState<Draft>(BLANK);
  const [errs,           setErrs]           = useState<Record<string, string>>({});
  const [imagePreviews,  setImagePreviews]  = useState<string[]>([]);
  const [imageFiles,     setImageFiles]     = useState<File[]>([]);
  const [imgErrors,      setImgErrors]      = useState<string[]>([]);
  const [submitting,     setSubmitting]     = useState(false);
  const [posted,         setPosted]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [loginRequired,  setLoginRequired]  = useState(false);
  const [uploadWarning,  setUploadWarning]  = useState("");

  const stepLabels = [
    t("step1Label", lang) as string,
    t("step2Label", lang) as string,
    t("step3Label", lang) as string,
  ];

  useEffect(() => {
    try {
      const s = localStorage.getItem(DRAFT_KEY);
      if (s) setD(prev => ({ ...prev, ...JSON.parse(s) }));
    } catch {}
  }, []);

  function upd(patch: Partial<Draft>) { setD(prev => ({ ...prev, ...patch })); }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    alert(t("draftSaved", lang));
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const errors: string[] = [];
    const previews: string[] = [];
    const validFiles: File[] = [];
    const remaining = 6 - imagePreviews.length;

    for (const f of Array.from(files).slice(0, remaining)) {
      const err = validateImg(f); // ✅ plain function call — no hook
      if (err) { errors.push(err); continue; }
      validFiles.push(f);
      await new Promise<void>(res => {
        const r = new FileReader();
        r.onload = e => { previews.push(e.target?.result as string); res(); };
        r.readAsDataURL(f);
      });
    }

    setImgErrors(errors);
    setImagePreviews(prev => [...prev, ...previews].slice(0, 6));
    setImageFiles(prev => [...prev, ...validFiles].slice(0, 6));
  }

  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!d.title.trim()) e.title = t("errorProduceName", lang) as string || "Produce name is required";
      if (!d.price || isNaN(Number(d.price)) || Number(d.price) <= 0) e.price = t("errorPrice", lang) as string || "Valid price is required";
      // FIX358 - flag the offending field itself, not a generic banner.
      const titleScan = scanForContacts(d.title);
      if (!titleScan.clean) e.title = contactWarning(titleScan, lang);
    }
    if (s === 2) {
      if (!d.location.trim()) e.location = t("errorLocation", lang) as string || "Location is required";
      // FIX322 - a farmer with no payout number cannot be paid.
      if (d.payoutPhone.replace(/\D/g, "").length < 9) e.payoutPhone = pc.required;
      if (!d.description.trim() || d.description.trim().length < 20)
        e.description = t("errorDescription", lang) as string || "Description must be at least 20 characters";
      // FIX358
      const descScan = scanForContacts(d.description);
      if (!descScan.clean) e.description = contactWarning(descScan, lang);
    }
    return e;
  }

  function next() {
    const e = validate(step); setErrs(e);
    if (Object.keys(e).length > 0) return;
    setStep(s => s + 1); window.scrollTo(0, 0);
  }
  function back() { setErrs({}); setStep(s => s - 1); window.scrollTo(0, 0); }

  async function handleSubmit() {
    setSubmitting(true);
    setErrs({});
    setUploadWarning("");

    // FIX358 - the last gate. validate() only runs from next(), so a field
    // edited AFTER passing step 2 would otherwise reach the database
    // unchecked. This runs before any upload or insert.
    const contacts = scanFields(d.title, d.description);
    if (!contacts.clean) {
      setErrs({ description: contactWarning(contacts, lang) });
      setSubmitting(false);
      setStep(2);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoginRequired(true);
        setSubmitting(false);
        return;
      }

      // FIX322 - the FarmFresh trigger fills farm_products.seller_phone from
      // the PROFILE, not from this form. Writing the number to the profile is
      // what actually makes this farmer payable, so it happens FIRST - before
      // any photo upload, and before the listing exists.
      const payoutPhone = d.payoutPhone.trim();
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ payout_phone: payoutPhone })
        .eq("id", session.user.id);
      if (profErr) {
        setErrs({ payoutPhone: pc.saveFailed });
        setSubmitting(false);
        return;
      }

      // ── 1. Try uploading images (graceful — never blocks the listing) ──────
      const uploadedUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of ${imageFiles.length}…`);
        const url = await tryUploadImage(imagePreviews[i], imageFiles[i].name);
        if (url) uploadedUrls.push(url);
      }

      const photosFailed = imageFiles.length > 0 && uploadedUrls.length === 0;

      setUploadProgress("Saving listing…");

      // ── 2. Insert with BOTH farmer_id AND seller_id ───────────────────────
      const { error: dbErr } = await supabase.from("farm_products").insert({
        farmer_id:              session.user.id,
        seller_id:              session.user.id,
        title:                  d.title.trim(),
        description:            d.description.trim(),
        price_per_unit_xaf:     Number(d.price),
        unit:                   d.unit,
        category:               d.category,
        location:               d.location.trim(),
        seller_phone:           payoutPhone,
        stock_quantity:         d.quantity ? Number(d.quantity) : null,
        is_organic:             d.is_organic,
        available_for_delivery: d.available_for_delivery,
        is_available:           true,
        images:                 uploadedUrls.length > 0 ? uploadedUrls : null,
        image_url:              uploadedUrls[0] ?? null,
      });

      if (dbErr) throw dbErr;

      localStorage.removeItem(DRAFT_KEY);

      if (photosFailed) {
        setUploadWarning(t("imageUploadSkipped", lang) as string);
      }

      setPosted(true);
    } catch (e: any) {
      setErrs({ submit: e.message || "Failed to post. Please try again." });
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (posted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl mb-4">🌿</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("produceListed", lang)}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("produceListedSub", lang)}</p>
        <p className="text-xs text-gray-400 mb-4">{t("produceListedSub2", lang)}</p>
        {uploadWarning && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-xs">
            <p className="text-xs text-amber-700">{uploadWarning}</p>
          </div>
        )}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate("/farm-fresh")} className="py-3 bg-green-600 text-white rounded-xl font-bold">
            {t("viewFarmFresh", lang)}
          </button>
          <button
            onClick={() => { setPosted(false); setStep(1); setD(BLANK); setImagePreviews([]); setImageFiles([]); setUploadWarning(""); }}
            className="py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300">
            {t("listAnother", lang)}
          </button>
        </div>
      </div>
    );
  }

  // ── Login required screen ─────────────────────────────────────────────────
  if (loginRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="w-14 h-14 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("loginRequired", lang)}</h2>
        <p className="text-sm text-gray-500 mb-2">{t("loginRequiredSub", lang)}</p>
        <p className="text-xs text-gray-400 mb-8">{t("loginRequiredSub2", lang)}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate("/login")} className="py-3 bg-green-600 text-white rounded-xl font-bold">
            {t("logInSignUp", lang)}
          </button>
          <button onClick={() => setLoginRequired(false)} className="py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600">
            {t("goBack", lang)}
          </button>
        </div>
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-green-600 text-white px-4 py-4 flex items-center gap-3 shadow">
        <button onClick={() => step === 1 ? navigate(-1) : back()}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
          ←
        </button>
        <h1 className="font-bold text-lg">{t("listYourProducePage", lang)}</h1>
      </div>

      <StepBar step={step} labels={stepLabels} />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">{t("step1Label", lang)}</h2>

            <div>
              <Lbl required>{t("produceName", lang)}</Lbl>
              <input value={d.title} onChange={e => upd({ title: e.target.value })}
                placeholder={t("produceNamePlaceholder", lang) as string}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                  ${errs.title ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <Err msg={errs.title} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>{t("category", lang)}</Lbl>
                <select value={d.category} onChange={e => upd({ category: e.target.value })}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none appearance-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Lbl>{t("unit", lang)}</Lbl>
                <select value={d.unit} onChange={e => upd({ unit: e.target.value })}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none appearance-none">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl required>{t("priceLabel", lang)}</Lbl>
                <input type="number" min="0" value={d.price} onChange={e => upd({ price: e.target.value })}
                  placeholder="e.g. 500"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                    ${errs.price ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
                {fmtXAF(d.price) && <p className="text-xs text-green-600 font-semibold mt-1">= {fmtXAF(d.price)}</p>}
                <Err msg={errs.price} />
              </div>
              <div>
                <Lbl>{t("stockQty", lang)}</Lbl>
                <input type="number" min="0" value={d.quantity} onChange={e => upd({ quantity: e.target.value })}
                  placeholder="e.g. 50"
                  className="w-full border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
              </div>
            </div>

            <BigCheck checked={d.is_organic} onChange={v => upd({ is_organic: v })}
              label={t("organicLabel", lang) as string} desc={t("organicDesc", lang) as string} />

            <NavRow onDraft={saveDraft} onNext={next}
              nextLabel={t("nextStep", lang) as string} saveDraftLabel={t("saveDraft", lang) as string} />
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">{t("step2Label", lang)}</h2>

            <div>
              <Lbl required>{t("yourLocation", lang)}</Lbl>
              <input value={d.location} onChange={e => upd({ location: e.target.value })}
                placeholder={t("locationPlaceholder", lang) as string}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                  ${errs.location ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <Err msg={errs.location} />
            </div>

            <div>
              <Lbl required>{pc.label}</Lbl>
              <input value={d.payoutPhone} onChange={e => upd({ payoutPhone: e.target.value })}
                inputMode="tel" placeholder={pc.ph}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                  ${errs.payoutPhone ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pc.hint}</p>
              <Err msg={errs.payoutPhone} />
            </div>

            <BigCheck checked={d.available_for_delivery} onChange={v => upd({ available_for_delivery: v })}
              label={t("deliveryToggleLabel", lang) as string} desc={t("deliveryToggleDesc", lang) as string} />

            <div>
              <Lbl required>{t("description", lang)}</Lbl>
              <textarea rows={5} value={d.description} onChange={e => upd({ description: e.target.value })}
                placeholder={t("descPlaceholder", lang) as string}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none transition-colors
                  ${errs.description ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <div className="flex justify-between text-xs mt-1 text-gray-400">
                <span>{d.description.length < 20 ? t("minChars", lang) : "✓ Good"}</span>
                <span>{t("charCount")}</span>
              </div>
              <Err msg={errs.description} />
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next}
              nextLabel={t("addPhotos", lang) as string} saveDraftLabel={t("saveDraft", lang) as string} />
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-gray-900 dark:text-white">{t("photoHeader", lang)}</h2>
              <p className="text-xs text-gray-400">{t("photoSub", lang)}</p>
              <p className="text-xs text-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">{t("photoSecure", lang)}</p>

              {imgErrors.map((e, i) => <p key={i} className="text-xs text-red-500 font-medium">⚠ {e}</p>)}

              <div onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
                  ${imagePreviews.length >= 6 ? "opacity-40 pointer-events-none" : "border-gray-200 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"}`}>
                <p className="text-3xl mb-2">📸</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {imagePreviews.length >= 6 ? t("maxPhotos", lang) : t("tapUpload", lang)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{imagePreviews.length}/6 {t("photosKey", lang)}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                      <img src={src} alt={`Photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => { setImagePreviews(p => p.filter((_, idx) => idx !== i)); setImageFiles(p => p.filter((_, idx) => idx !== i)); }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">×</button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">Main</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                <p className="text-xs text-amber-800 font-semibold">{t("photosTip", lang)}</p>
                <p className="text-xs text-amber-700">{t("photosTipBody", lang)}</p>
                <p className="text-xs text-amber-600">{t("photosTipSub", lang)}</p>
              </div>
            </div>

            {/* Review summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">{t("listingSummary", lang)}</h3>
              {([
                [t("produceKey", lang), d.title],
                [t("category",   lang), d.category],
                [t("priceKey",   lang), fmtXAF(d.price) ? `${fmtXAF(d.price)} / ${d.unit}` : "—"],
                [t("stockKey",   lang), d.quantity ? `${d.quantity} ${d.unit}` : t("notSpecified", lang)],
                [t("organicKey", lang), d.is_organic ? t("yesOrganic", lang) : t("no", lang)],
                [t("deliveryKey",lang), d.available_for_delivery ? t("delivAvail", lang) : t("pickupOnly", lang)],
                [t("locationKey",lang), d.location || "—"],
                [t("photosKey",  lang), imagePreviews.length === 0 ? t("noPhotosWarn", lang) : `${imagePreviews.length} photo${imagePreviews.length !== 1 ? "s" : ""}`],
              ] as [string, string][]).map(([k, v]) => (
                <div key={String(k)} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">{v}</span>
                </div>
              ))}
              {d.description && (
                <div className="pt-3">
                  <p className="text-xs text-gray-500 mb-1">{t("descPreview", lang)}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{d.description}</p>
                </div>
              )}
            </div>

            {uploadProgress && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="animate-spin inline-block">⟳</span> {uploadProgress}
              </div>
            )}
            {errs.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">⚠ {errs.submit}</div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-700">{t("worldwideVis", lang)}</p>
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={handleSubmit}
              nextLabel={submitting ? t("posting", lang) as string : t("listWorldwide", lang) as string}
              saveDraftLabel={t("saveDraft", lang) as string}
              disabled={submitting} />
          </>
        )}
      </div>
    </div>
  );
}





// BAMBEH_END_TOKEN__FARMFRESHSELLER_FIX358__COMPLETE
