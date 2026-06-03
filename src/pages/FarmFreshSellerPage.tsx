/**
 * src/pages/FarmFreshSellerPage.tsx — Bambeh Marketplace
 *
 * UPGRADED VERSION — all bugs fixed:
 *  ✅ FIXED: Images uploaded to Supabase Storage ('farm-images' bucket) — NOT base64
 *  ✅ FIXED: DB column names: seller_id (not farmer_id), title (not name), price_per_unit_xaf (not price)
 *  ✅ FIXED: available_for_delivery toggle added and saved
 *  ✅ FIXED: Guest fallback shows clear warning — you must log in for worldwide visibility
 *  ✅ 3-step wizard: Produce Details → Location, Delivery & Description → Photos & Review
 *  ✅ Real listings are visible worldwide to anyone with Bambeh app
 *  ✅ Draft save/restore
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

const STEP_LABELS = ["Produce Details", "Location & Description", "Photos & Review"];
const CATEGORIES  = ["Vegetables", "Fruits", "Tubers", "Grains", "Legumes", "Herbs", "Dairy", "Other"];
const UNITS       = ["kg", "g", "bunch", "cob", "litre", "bag", "crate", "piece"];

const MAX_IMG   = 5 * 1024 * 1024;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

function StepBar({ step }: { step: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2">
        {STEP_LABELS.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200
              ${step > i + 1 ? "bg-green-500 text-white"
                : step === i + 1 ? "bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-900"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {step > i + 1
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                : i + 1}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-1 rounded-full transition-colors ${step > i + 1 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs font-semibold text-green-600 dark:text-green-400">
        Step {step} of {STEP_LABELS.length}: {STEP_LABELS[step - 1]}
      </p>
    </div>
  );
}

function NavRow({ onDraft, onBack, onNext, nextLabel = "Next Step →", disabled = false }: {
  onDraft: () => void; onBack?: () => void;
  onNext: () => void; nextLabel?: string; disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 pt-4 pb-6">
      <button type="button" onClick={onDraft}
        className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 active:scale-95">
        💾 Save Draft
      </button>
      {onBack && (
        <button type="button" onClick={onBack}
          className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 active:scale-95">
          ← Back
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface Draft {
  title: string; category: string; unit: string;
  price: string; quantity: string; is_organic: boolean;
  location: string; description: string; available_for_delivery: boolean;
}

const BLANK: Draft = {
  title: "", category: "Vegetables", unit: "kg",
  price: "", quantity: "", is_organic: false,
  location: "", description: "", available_for_delivery: false,
};

const DRAFT_KEY = "bambeh_draft_farm_produce";

// ── Upload image to Supabase Storage ─────────────────────────────────────────

async function uploadImageToStorage(dataUrl: string, fileName: string): Promise<string> {
  // Convert base64 dataUrl to Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
  const path = `farm-fresh/${Date.now()}-${fileName.replace(/\s/g, "-")}.${ext}`;

  const { error } = await supabase.storage
    .from("farm-images")
    .upload(path, blob, { contentType: blob.type, upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from("farm-images").getPublicUrl(path);
  return urlData.publicUrl;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FarmFreshSellerPage() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [step,        setStep]        = useState(1);
  const [d,           setD]           = useState<Draft>(BLANK);
  const [errs,        setErrs]        = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // base64 for preview only
  const [imageFiles,  setImageFiles]  = useState<File[]>([]);       // actual files for upload
  const [imgErrors,   setImgErrors]   = useState<string[]>([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [posted,      setPosted]      = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [loginRequired, setLoginRequired]   = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(DRAFT_KEY);
      if (s) setD(prev => ({ ...prev, ...JSON.parse(s) }));
    } catch {}
  }, []);

  function upd(patch: Partial<Draft>) { setD(prev => ({ ...prev, ...patch })); }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    alert("Draft saved to your device ✅");
  }

  // ── Image handling (preview locally, upload on submit) ──────────────────

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const errors: string[] = [];
    const previews: string[] = [];
    const validFiles: File[] = [];

    const remaining = 6 - imagePreviews.length;

    for (const f of Array.from(files).slice(0, remaining)) {
      const err = validateImg(f);
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

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!d.title.trim()) e.title = "Produce name is required";
      if (!d.price || isNaN(Number(d.price)) || Number(d.price) <= 0)
        e.price = "Valid price is required";
    }
    if (s === 2) {
      if (!d.location.trim()) e.location = "Location is required";
      if (!d.description.trim() || d.description.trim().length < 20)
        e.description = "Description must be at least 20 characters";
    }
    return e;
  }

  function next() {
    const e = validate(step); setErrs(e);
    if (Object.keys(e).length > 0) return;
    setStep(s => s + 1); window.scrollTo(0, 0);
  }
  function back() { setErrs({}); setStep(s => s - 1); window.scrollTo(0, 0); }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true);
    setErrs({});

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        // Not logged in — warn them loudly
        setLoginRequired(true);
        setSubmitting(false);
        return;
      }

      // 1. Upload images to Supabase Storage (NOT base64)
      const uploadedUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of ${imageFiles.length}…`);
        const url = await uploadImageToStorage(imagePreviews[i], imageFiles[i].name);
        uploadedUrls.push(url);
      }
      setUploadProgress("Saving listing…");

      // 2. Insert with CORRECT column names
      // FIXED: seller_id (not farmer_id), title (not name), price_per_unit_xaf (not price)
      const { error: dbErr } = await supabase.from("farm_products").insert({
        seller_id:            session.user.id,
        title:                d.title.trim(),
        description:          d.description.trim(),
        price_per_unit_xaf:   Number(d.price),
        unit:                 d.unit,
        category:             d.category,
        location:             d.location.trim(),
        stock_quantity:       d.quantity ? Number(d.quantity) : null,
        is_organic:           d.is_organic,
        available_for_delivery: d.available_for_delivery,
        is_available:         true,
        images:               uploadedUrls.length > 0 ? uploadedUrls : null,
        image_url:            uploadedUrls[0] ?? null,
      });

      if (dbErr) throw dbErr;

      localStorage.removeItem(DRAFT_KEY);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Produce Listed!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Your produce is now <strong>live and visible worldwide</strong> to all Bambeh users on any device.
        </p>
        <p className="text-xs text-gray-400 mb-8">Buyers can contact you via WhatsApp, call, or place an order directly.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate("/farm-fresh")}
            className="py-3 bg-green-600 text-white rounded-xl font-bold">
            View Farm Fresh
          </button>
          <button onClick={() => { setPosted(false); setStep(1); setD(BLANK); setImagePreviews([]); setImageFiles([]); }}
            className="py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300">
            List Another Produce
          </button>
        </div>
      </div>
    );
  }

  // ── Login required screen ────────────────────────────────────────────────

  if (loginRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="w-14 h-14 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
        <p className="text-sm text-gray-500 mb-2">
          To post a listing that is <strong>visible to buyers worldwide</strong>, you need to be logged in.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Guest posts only save on your phone and no one else can see them.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate("/login")}
            className="py-3 bg-green-600 text-white rounded-xl font-bold">
            Log In / Sign Up
          </button>
          <button onClick={() => setLoginRequired(false)}
            className="py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600">
            Go Back
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
        <h1 className="font-bold text-lg">🌿 List Your Produce</h1>
      </div>

      <StepBar step={step} />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ── STEP 1: PRODUCE DETAILS ── */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Produce Details</h2>

            <div>
              <Lbl required>Produce Name</Lbl>
              <input
                value={d.title}
                onChange={e => upd({ title: e.target.value })}
                placeholder="e.g. Fresh Tomatoes, Plantains, Cocoyams"
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                  ${errs.title ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <Err msg={errs.title} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Category</Lbl>
                <select value={d.category} onChange={e => upd({ category: e.target.value })}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none appearance-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Lbl>Unit</Lbl>
                <select value={d.unit} onChange={e => upd({ unit: e.target.value })}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none appearance-none">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl required>Price (FCFA)</Lbl>
                <input
                  type="number" min="0"
                  value={d.price}
                  onChange={e => upd({ price: e.target.value })}
                  placeholder="e.g. 500"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                    ${errs.price ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
                {fmtXAF(d.price) && <p className="text-xs text-green-600 font-semibold mt-1">= {fmtXAF(d.price)}</p>}
                <Err msg={errs.price} />
              </div>
              <div>
                <Lbl>Stock Quantity</Lbl>
                <input
                  type="number" min="0"
                  value={d.quantity}
                  onChange={e => upd({ quantity: e.target.value })}
                  placeholder="e.g. 50"
                  className="w-full border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
              </div>
            </div>

            <BigCheck
              checked={d.is_organic}
              onChange={v => upd({ is_organic: v })}
              label="🌿 Organically Grown"
              desc="No chemical pesticides or fertilisers used" />

            <NavRow onDraft={saveDraft} onNext={next} />
          </div>
        )}

        {/* ── STEP 2: LOCATION, DELIVERY & DESCRIPTION ── */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Location & Description</h2>

            <div>
              <Lbl required>Your Location</Lbl>
              <input
                value={d.location}
                onChange={e => upd({ location: e.target.value })}
                placeholder="e.g. Bafoussam — Marché A, or Ngaoundéré — Centre-ville"
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                  ${errs.location ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <Err msg={errs.location} />
            </div>

            {/* FIXED: delivery toggle now saved to DB */}
            <BigCheck
              checked={d.available_for_delivery}
              onChange={v => upd({ available_for_delivery: v })}
              label="🚚 Delivery Available"
              desc="You can deliver to buyers in your area" />

            <div>
              <Lbl required>Description</Lbl>
              <textarea
                rows={5}
                value={d.description}
                onChange={e => upd({ description: e.target.value })}
                placeholder="Describe your produce: freshness, harvest date, how it was grown, how to use it, delivery details..."
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none transition-colors
                  ${errs.description ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <div className="flex justify-between text-xs mt-1 text-gray-400">
                <span>{d.description.length < 20 ? "Min 20 characters" : "✓ Good"}</span>
                <span>{d.description.length} chars</span>
              </div>
              <Err msg={errs.description} />
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} nextLabel="Add Photos →" />
          </div>
        )}

        {/* ── STEP 3: PHOTOS & REVIEW ── */}
        {step === 3 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-gray-900 dark:text-white">Add Photos</h2>
              <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5 MB each · Up to 6 photos</p>
              <p className="text-xs text-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                📸 Photos are uploaded securely to Bambeh servers — not stored on your phone.
              </p>

              {imgErrors.map((e, i) => (
                <p key={i} className="text-xs text-red-500 font-medium">⚠ {e}</p>
              ))}

              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
                  ${imagePreviews.length >= 6 ? "opacity-40 pointer-events-none" : "border-gray-200 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"}`}>
                <p className="text-3xl mb-2">📸</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {imagePreviews.length >= 6 ? "Maximum 6 photos" : "Tap to upload photos of your produce"}
                </p>
                <p className="text-xs text-gray-400 mt-1">{imagePreviews.length}/6 photos</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={e => handleFiles(e.target.files)} />

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                      <img src={src} alt={`Photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreviews(p => p.filter((_, idx) => idx !== i));
                          setImageFiles(p => p.filter((_, idx) => idx !== i));
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                        ×
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">Main</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                <p className="text-xs text-amber-800 font-semibold">📸 Photos = more buyers</p>
                <p className="text-xs text-amber-700">
                  Listings with at least one clear photo get <strong>3× more views</strong> than listings without. Buyers trust what they can see.
                </p>
                <p className="text-xs text-amber-600">
                  You can still post without a photo — your item will appear with a placeholder and a "No photo" badge until you add one.
                </p>
              </div>
            </div>

            {/* Review summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">📋 Listing Summary</h3>
              {[
                ["Produce",  d.title],
                ["Category", d.category],
                ["Price",    fmtXAF(d.price) ? `${fmtXAF(d.price)} / ${d.unit}` : "—"],
                ["Stock",    d.quantity ? `${d.quantity} ${d.unit}` : "Not specified"],
                ["Organic",  d.is_organic ? "Yes 🌿" : "No"],
                ["Delivery", d.available_for_delivery ? "Available 🚚" : "Pickup only"],
                ["Location", d.location || "—"],
                ["Photos",   imagePreviews.length === 0
                  ? "⚠ None — fewer views without a photo"
                  : `${imagePreviews.length} photo${imagePreviews.length !== 1 ? "s" : ""}`],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">{v}</span>
                </div>
              ))}
              {d.description && (
                <div className="pt-3">
                  <p className="text-xs text-gray-500 mb-1">Description preview</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{d.description}</p>
                </div>
              )}
            </div>

            {/* Upload progress */}
            {uploadProgress && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="animate-spin">⟳</span> {uploadProgress}
              </div>
            )}

            {errs.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                ⚠ {errs.submit}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                🌍 <strong>Your listing will be visible worldwide</strong> — any Bambeh user on any device can find and buy your produce.
              </p>
            </div>

            <NavRow
              onDraft={saveDraft}
              onBack={back}
              onNext={handleSubmit}
              nextLabel={submitting ? "Posting…" : "🚀 List Produce Worldwide"}
              disabled={submitting}
            />
          </>
        )}
      </div>
    </div>
  );
}
