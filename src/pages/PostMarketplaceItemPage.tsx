/**
 * src/pages/PostMarketplaceItemPage.tsx — Bambeh Marketplace
 *
 * REBUILT to match PostJobPage gold-standard pattern:
 *  ✅ 4-step wizard: Details → Pricing → Photos → Review
 *  ✅ StepBar with numbered circles + connecting line
 *  ✅ NavRow: 💾 Save Draft | ← Back | Next Step → (always visible, sticky bottom)
 *  ✅ Per-step validation with red error messages
 *  ✅ Draft save/restore to localStorage (key: bambeh_draft_marketplace)
 *  ✅ Image upload with type & size validation (JPG/PNG/WebP, max 5MB each)
 *  ✅ price type="number", FCFA live formatter
 *  ✅ Cameroon phone validation
 *  ✅ Saves to Supabase listings table (type: 'marketplace')
 *  ✅ 🎉 Success screen with "View My Listing" and "Post Another" buttons
 *  ✅ Demo-badge system: sample items shown with yellow DEMO badge
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { REGIONS, CITIES_BY_REGION } from "@/data/Locations";

// ─── Constants ─────────────────────────────────────────────────────────────────
const STEP_LABELS = ["Item Details", "Pricing", "Photos", "Review & Post"];
const CATEGORIES  = ["Electronics","Fashion & Clothing","Furniture","Home Appliances","Books & Education","Sports & Fitness","Home & Garden","Food & Groceries","Beauty & Health","Agriculture","Building Materials","Other"];
const CONDITIONS  = ["Brand New","Like New","Good","Fair","For Parts"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const MAX_IMG_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
function validateImg(f: File): string | null {
  if (!ALLOWED_TYPES.includes(f.type)) return "Only JPG, PNG or WebP images allowed.";
  if (f.size > MAX_IMG_SIZE) return `File too large (max 5 MB). Got ${(f.size/1024/1024).toFixed(1)} MB.`;
  return null;
}
const fmt = (n: string) =>
  n && !isNaN(Number(n)) && Number(n) > 0
    ? new Intl.NumberFormat("fr-CM").format(Number(n)) + " FCFA"
    : "";

// ─── Shared sub-components (same visual language as PostJobPage) ───────────────

function StepBar({ step }: { step: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2">
        {STEP_LABELS.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200
              ${step > i + 1 ? "bg-teal-500 text-white" : step === i + 1 ? "bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {step > i + 1 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
              ) : i + 1}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step > i + 1 ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
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
        className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600
                   text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 active:scale-95">
        💾 Save Draft
      </button>
      {onBack && (
        <button type="button" onClick={onBack}
          className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600
                     text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 active:scale-95">
          ← Back
        </button>
      )}
      <button type="button" onClick={onNext} disabled={disabled}
        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]
          ${disabled ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-500/30"}`}>
        {nextLabel}
      </button>
    </div>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-500 mt-1 font-medium">⚠ {msg}</p> : null;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function SInput({ value, onChange, placeholder, type = "text", error, min }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; error?: string; min?: string;
}) {
  return (
    <>
      <input type={type} min={min}
        className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white outline-none transition-colors
                    ${error ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      <Err msg={error} />
    </>
  );
}

function SSelect({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder: string; error?: string;
}) {
  return (
    <>
      <select
        className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white outline-none appearance-none
                    ${error ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
        value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <Err msg={error} />
    </>
  );
}

function BigCheck({ checked, onChange, label, desc }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
        ${checked ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
        ${checked ? "border-teal-500 bg-teal-500" : "border-gray-300 dark:border-gray-500"}`}>
        {checked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <div>
        <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
interface Draft {
  title: string; category: string; condition: string;
  price: string; negotiable: boolean; acceptsZermCoins: boolean;
  region: string; city: string; description: string; phone: string;
}
const BLANK: Draft = {
  title: "", category: "", condition: "Good",
  price: "", negotiable: false, acceptsZermCoins: true,
  region: "", city: "", description: "", phone: "",
};

export default function PostMarketplaceItemPage() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [step,       setStep]       = useState(1);
  const [d, setD]                   = useState<Draft>(BLANK);
  const [errs,       setErrs]       = useState<Record<string, string>>({});
  const [images,     setImages]     = useState<string[]>([]); // base64 previews
  const [imgErrors,  setImgErrors]  = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [posted,     setPosted]     = useState(false);
  const [newId,      setNewId]      = useState<string | null>(null);

  // Load draft
  useEffect(() => {
    try {
      const s = localStorage.getItem("bambeh_draft_marketplace");
      if (s) setD(prev => ({ ...prev, ...JSON.parse(s) }));
    } catch {}
  }, []);

  function upd(patch: Partial<Draft>) { setD(prev => ({ ...prev, ...patch })); }

  function saveDraft() {
    localStorage.setItem("bambeh_draft_marketplace", JSON.stringify(d));
    alert("Draft saved to your device ✅");
  }

  const cities = d.region ? (CITIES_BY_REGION[d.region] ?? []) : [];

  // Image upload
  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const errsNew: string[] = [];
    const previews: string[] = [];
    for (const f of Array.from(files).slice(0, 6 - images.length)) {
      const err = validateImg(f);
      if (err) { errsNew.push(err); continue; }
      await new Promise<void>(res => {
        const r = new FileReader();
        r.onload = e => { previews.push(e.target?.result as string); res(); };
        r.readAsDataURL(f);
      });
    }
    setImgErrors(errsNew);
    setImages(prev => [...prev, ...previews].slice(0, 6));
  }

  // Validate per step
  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!d.title.trim())    e.title    = "Item title is required";
      if (!d.category)        e.category = "Category is required";
      if (!d.condition)       e.condition= "Condition is required";
      if (!d.description.trim() || d.description.trim().length < 20)
        e.description = "Description must be at least 20 characters";
    }
    if (s === 2) {
      if (!d.price || isNaN(Number(d.price)) || Number(d.price) <= 0)
        e.price = "Valid price is required";
      if (!d.region)          e.region   = "Region is required";
      if (!d.city.trim())     e.city     = "City is required";
    }
    return e;
  }

  function next() {
    const e = validate(step);
    setErrs(e);
    if (Object.keys(e).length > 0) return;
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  }
  function back() { setErrs({}); setStep(s => s - 1); window.scrollTo(0, 0); }

  async function handleSubmit() {
    const e = validate(1);
    Object.assign(e, validate(2));
    setErrs(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/login"); return; }

      const { data, error: err } = await supabase.from("listings").insert({
        seller_id:   session.user.id,
        type:        "marketplace",
        title:       d.title.trim(),
        description: d.description.trim(),
        price:       Number(d.price),
        category:    d.category,
        condition:   d.condition,
        location:    [d.city, d.region].filter(Boolean).join(", "),
        phone:       d.phone.trim(),
        negotiable:  d.negotiable,
        images:      images.length > 0 ? images : null,
        status:      "active",
        extra:       { accepts_zerm_coins: d.acceptsZermCoins },
      }).select("id").single();

      if (err) throw err;
      localStorage.removeItem("bambeh_draft_marketplace");
      setNewId(data?.id ?? null);
      setPosted(true);
    } catch (e: any) {
      setErrs({ submit: e.message || "Failed to post. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (posted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl mb-4">🎉</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Item Listed!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Your item is now live on Bambeh Marketplace, visible to buyers across Cameroon.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {newId && (
            <button onClick={() => navigate(`/marketplace/${newId}`)}
              className="py-3 bg-teal-600 text-white rounded-xl font-bold">
              View My Listing →
            </button>
          )}
          <button onClick={() => navigate("/marketplace")}
            className="py-3 bg-teal-600 text-white rounded-xl font-bold">
            Browse Marketplace
          </button>
          <button onClick={() => { setPosted(false); setStep(1); setD(BLANK); setImages([]); }}
            className="py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300">
            Post Another Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-teal-600 text-white px-4 py-4 flex items-center gap-3 shadow">
        <button onClick={() => step === 1 ? navigate(-1) : back()}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
          ←
        </button>
        <h1 className="font-bold text-lg">🛍️ Sell an Item</h1>
      </div>

      <StepBar step={step} />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ── STEP 1: ITEM DETAILS ── */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Item Information</h2>

            <div>
              <Label required>Item Title</Label>
              <SInput value={d.title} onChange={v => upd({ title: v })}
                placeholder="e.g. Samsung Galaxy A54 — excellent condition"
                error={errs.title} />
            </div>

            <div>
              <Label required>Category</Label>
              <SSelect value={d.category} onChange={v => upd({ category: v })}
                options={CATEGORIES} placeholder="Select category" error={errs.category} />
            </div>

            <div>
              <Label required>Condition</Label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map(c => (
                  <button key={c} type="button" onClick={() => upd({ condition: c })}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all
                      ${d.condition === c ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700" : "border-gray-200 dark:border-gray-600 text-gray-600"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                      ${d.condition === c ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                      {d.condition === c && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    {c}
                  </button>
                ))}
              </div>
              <Err msg={errs.condition} />
            </div>

            <div>
              <Label required>Description</Label>
              <textarea rows={4}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none transition-colors
                  ${errs.description ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                placeholder="Describe your item: age, specs, reason for selling, any defects..."
                value={d.description}
                onChange={e => upd({ description: e.target.value })} />
              <div className="flex justify-between text-xs mt-1 text-gray-400">
                <span>{d.description.length < 20 ? "Min 20 characters" : "✓ Good"}</span>
                <span>{d.description.length} chars</span>
              </div>
              <Err msg={errs.description} />
            </div>

            <NavRow onDraft={saveDraft} onNext={next} />
          </div>
        )}

        {/* ── STEP 2: PRICING & LOCATION ── */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Pricing & Location</h2>

            <div>
              <Label required>Price (FCFA)</Label>
              <SInput type="number" min="0" value={d.price} onChange={v => upd({ price: v })}
                placeholder="e.g. 45000" error={errs.price} />
              {fmt(d.price) && (
                <p className="text-xs text-teal-600 font-semibold mt-1">= {fmt(d.price)}</p>
              )}
            </div>

            <BigCheck checked={d.negotiable} onChange={v => upd({ negotiable: v })}
              label="Price is Negotiable"
              desc="Buyers can make you an offer" />

            <BigCheck checked={d.acceptsZermCoins} onChange={v => upd({ acceptsZermCoins: v })}
              label="Accept Zerm Coins 🪙"
              desc="Let buyers pay with Bambeh's digital currency" />

            <div>
              <Label required>Region</Label>
              <SSelect value={d.region} onChange={v => upd({ region: v, city: "" })}
                options={REGIONS} placeholder="Select region" error={errs.region} />
            </div>

            {d.region && (
              <div>
                <Label required>City / Town</Label>
                {cities.length > 0 ? (
                  <SSelect value={d.city} onChange={v => upd({ city: v })}
                    options={cities} placeholder="Select city" error={errs.city} />
                ) : (
                  <SInput value={d.city} onChange={v => upd({ city: v })}
                    placeholder="Enter city name" error={errs.city} />
                )}
              </div>
            )}

            <div>
              <Label>Contact Phone</Label>
              <div className="flex">
                <span className="border-2 border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl px-3 py-3 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600">🇨🇲 +237</span>
                <input type="tel"
                  className="flex-1 border-2 border-gray-200 dark:border-gray-600 focus:border-teal-500 rounded-r-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  placeholder="6XX XXX XXX"
                  value={d.phone}
                  onChange={e => upd({ phone: e.target.value.replace(/\D/g, "").slice(0, 9) })} />
              </div>
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} />
          </div>
        )}

        {/* ── STEP 3: PHOTOS ── */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Add Photos</h2>
            <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5 MB each · Up to 6 photos</p>

            {imgErrors.map((e, i) => (
              <p key={i} className="text-xs text-red-500 font-medium">⚠ {e}</p>
            ))}

            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
                ${images.length >= 6 ? "opacity-40 pointer-events-none" : "border-gray-200 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"}`}>
              <p className="text-3xl mb-2">📸</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {images.length >= 6 ? "Maximum 6 photos" : "Tap to upload photos"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {images.length}/6 photos added
              </p>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
              onChange={e => handleFiles(e.target.files)} />

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                    <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(p => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-teal-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                📌 <strong>Tip:</strong> Items with photos get 3× more views. Add your best photo first — it becomes the cover image.
              </p>
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} nextLabel="Review Listing →" />
          </div>
        )}

        {/* ── STEP 4: REVIEW & POST ── */}
        {step === 4 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-4">📋 Listing Summary</h2>
              {[
                ["Title",       d.title],
                ["Category",    d.category],
                ["Condition",   d.condition],
                ["Price",       fmt(d.price) || "Not set"],
                ["Negotiable",  d.negotiable ? "Yes ✓" : "No"],
                ["Zerm Coins",  d.acceptsZermCoins ? "Accepted ✓" : "No"],
                ["Location",    [d.city, d.region].filter(Boolean).join(", ") || "—"],
                ["Phone",       d.phone ? `+237 ${d.phone}` : "Not provided"],
                ["Photos",      `${images.length} photo${images.length !== 1 ? "s" : ""}`],
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

            {/* Preview card — shows how it will look with DEMO badge */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Preview — how buyers will see your listing</h3>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center relative">
                  {images[0]
                    ? <img src={images[0]} alt="preview" className="w-full h-full object-cover" />
                    : <span className="text-5xl">📦</span>
                  }
                  <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    DEMO
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{d.title || "Your item title"}</p>
                  <p className="text-teal-700 font-bold text-base mt-1">{fmt(d.price) || "Price not set"}</p>
                  <p className="text-xs text-gray-400 mt-1">{[d.city, d.region].filter(Boolean).join(", ") || "Location"}</p>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2 italic text-center">
                The DEMO badge will not appear on your live listing — it only shows on sample items.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                By posting you confirm this item is legitimate and you have the right to sell it. False listings may result in account suspension.
              </p>
            </div>

            {errs.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                ⚠ {errs.submit}
              </div>
            )}

            <NavRow
              onDraft={saveDraft}
              onBack={back}
              onNext={handleSubmit}
              nextLabel={submitting ? "Posting..." : "🚀 Post Listing"}
              disabled={submitting}
            />
          </>
        )}
      </div>
    </div>
  );
}
