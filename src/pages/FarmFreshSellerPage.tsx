/**
 * src/pages/FarmFreshSellerPage.tsx — Bambeh Marketplace
 *
 * REBUILT — matches PostJobPage / PostMarketplaceItemPage gold standard:
 *  ✅ Uses shared @/lib/supabase (CRITICAL FIX — old createClient() caused crash)
 *  ✅ 3-step wizard: Produce Details → Location & Description → Photos & Review
 *  ✅ StepBar (numbered circles + connecting line)
 *  ✅ NavRow: 💾 Save Draft | ← Back | Next Step → (always visible)
 *  ✅ Photo upload — JPG/PNG/WebP, max 5MB each, up to 6 photos
 *  ✅ Per-step validation with red inline errors
 *  ✅ Draft save/restore (key: bambeh_draft_farm_produce)
 *  ✅ price type="number" + FCFA live formatter
 *  ✅ Saves to Supabase farm_products table when logged in
 *  ✅ 🎉 Success screen — "Produce Listed! Visible across Cameroon"
 *  ✅ "across Cameroon" text fixed (was blank "across .")
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // ✅ FIXED: shared client

const STEP_LABELS = ["Produce Details", "Location & Description", "Photos & Review"];
const CATEGORIES  = ["Vegetables", "Fruits", "Tubers", "Grains", "Legumes", "Herbs", "Dairy", "Other"];
const UNITS       = ["kg", "g", "bunch", "cob", "litre", "bag", "crate", "piece"];

// ── Image validation ──────────────────────────────────────────────────────────
const MAX_IMG  = 5 * 1024 * 1024;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
function validateImg(f: File): string | null {
  if (!IMG_TYPES.includes(f.type)) return "Only JPG, PNG or WebP images allowed.";
  if (f.size > MAX_IMG) return `File too large (max 5 MB). Got ${(f.size/1024/1024).toFixed(1)} MB.`;
  return null;
}

// ── FCFA formatter ────────────────────────────────────────────────────────────
const fmtXAF = (n: string) =>
  n && !isNaN(Number(n)) && Number(n) > 0
    ? new Intl.NumberFormat("fr-CM").format(Number(n)) + " FCFA"
    : "";

// ── Shared sub-components (same pattern as PostJobPage) ───────────────────────

function StepBar({ step }: { step: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2">
        {STEP_LABELS.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200
              ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-900" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {step > i + 1 ? (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>) : i + 1}
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
          ${disabled ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
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
        {checked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <div>
        <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

// ── Draft type ────────────────────────────────────────────────────────────────
interface Draft {
  name: string; category: string; unit: string;
  price: string; quantity: string; is_organic: boolean;
  location: string; description: string;
}
const BLANK: Draft = {
  name: "", category: "Vegetables", unit: "kg",
  price: "", quantity: "", is_organic: false,
  location: "", description: "",
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function FarmFreshSellerPage() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [step,       setStep]       = useState(1);
  const [d, setD]                   = useState<Draft>(BLANK);
  const [errs,       setErrs]       = useState<Record<string, string>>({});
  const [images,     setImages]     = useState<string[]>([]); // base64 previews
  const [imgErrors,  setImgErrors]  = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [posted,     setPosted]     = useState(false);

  // Load draft
  useEffect(() => {
    try {
      const s = localStorage.getItem("bambeh_draft_farm_produce");
      if (s) setD(prev => ({ ...prev, ...JSON.parse(s) }));
    } catch {}
  }, []);

  function upd(patch: Partial<Draft>) { setD(prev => ({ ...prev, ...patch })); }

  function saveDraft() {
    localStorage.setItem("bambeh_draft_farm_produce", JSON.stringify(d));
    alert("Draft saved to your device ✅");
  }

  // Image upload
  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const errors: string[] = [];
    const previews: string[] = [];
    for (const f of Array.from(files).slice(0, 6 - images.length)) {
      const err = validateImg(f);
      if (err) { errors.push(err); continue; }
      await new Promise<void>(res => {
        const r = new FileReader();
        r.onload = e => { previews.push(e.target?.result as string); res(); };
        r.readAsDataURL(f);
      });
    }
    setImgErrors(errors);
    setImages(prev => [...prev, ...previews].slice(0, 6));
  }

  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!d.name.trim())   e.name     = "Produce name is required";
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

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { error: err } = await supabase.from("farm_products").insert({
          farmer_id:    session.user.id,
          name:         d.name.trim(),
          description:  d.description.trim(),
          price:        Number(d.price),
          unit:         d.unit,
          category:     d.category,
          location:     d.location.trim(),
          stock_quantity: d.quantity ? Number(d.quantity) : null,
          is_organic:   d.is_organic,
          is_available: true,
          images:       images.length > 0 ? images : null,
        });
        if (err) throw err;
      } else {
        // Guest fallback
        const items = JSON.parse(localStorage.getItem("bambeh_farm_products") ?? "[]");
        items.unshift({
          ...d, id: Date.now().toString(),
          created_at: new Date().toISOString(),
          is_available: true,
          images: images.length > 0 ? images : null,
        });
        localStorage.setItem("bambeh_farm_products", JSON.stringify(items));
      }

      localStorage.removeItem("bambeh_draft_farm_produce");
      setPosted(true);
    } catch (e: any) {
      setErrs({ submit: e.message || "Failed to post. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (posted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl mb-4">🌿</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Produce Listed!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Your produce is now visible to buyers across Cameroon on all devices.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate("/farm-fresh")}
            className="py-3 bg-green-600 text-white rounded-xl font-bold">
            View Farm Fresh
          </button>
          <button onClick={() => { setPosted(false); setStep(1); setD(BLANK); setImages([]); }}
            className="py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300">
            List Another Produce
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
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
                value={d.name}
                onChange={e => upd({ name: e.target.value })}
                placeholder="e.g. Fresh Tomatoes, Plantains, Cocoyams"
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                  ${errs.name ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <Err msg={errs.name} />
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

        {/* ── STEP 2: LOCATION & DESCRIPTION ── */}
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

            <div>
              <Lbl required>Description</Lbl>
              <textarea
                rows={5}
                value={d.description}
                onChange={e => upd({ description: e.target.value })}
                placeholder="Describe your produce: freshness, harvest date, how it was grown, how to use it, delivery availability..."
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
            {/* Photo upload */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-gray-900 dark:text-white">Add Photos</h2>
              <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5 MB each · Up to 6 photos</p>

              {imgErrors.map((e, i) => (
                <p key={i} className="text-xs text-red-500 font-medium">⚠ {e}</p>
              ))}

              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
                  ${images.length >= 6 ? "opacity-40 pointer-events-none" : "border-gray-200 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"}`}>
                <p className="text-3xl mb-2">📸</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {images.length >= 6 ? "Maximum 6 photos" : "Tap to upload photos of your produce"}
                </p>
                <p className="text-xs text-gray-400 mt-1">{images.length}/6 photos</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={e => handleFiles(e.target.files)} />

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                      <img src={src} alt={`Photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(p => p.filter((_, idx) => idx !== i))}
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

              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-xs text-green-700">
                  📌 <strong>Tip:</strong> Listings with photos get 3× more buyers. Show your freshest produce clearly lit.
                </p>
              </div>
            </div>

            {/* Review summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">📋 Listing Summary</h3>
              {[
                ["Produce",   d.name],
                ["Category",  d.category],
                ["Price",     fmtXAF(d.price) ? `${fmtXAF(d.price)} / ${d.unit}` : "—"],
                ["Stock",     d.quantity ? `${d.quantity} ${d.unit}` : "Not specified"],
                ["Organic",   d.is_organic ? "Yes 🌿" : "No"],
                ["Location",  d.location || "—"],
                ["Photos",    `${images.length} photo${images.length !== 1 ? "s" : ""}`],
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

            {errs.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                ⚠ {errs.submit}
              </div>
            )}

            <NavRow
              onDraft={saveDraft}
              onBack={back}
              onNext={handleSubmit}
              nextLabel={submitting ? "Posting..." : "🚀 List Produce"}
              disabled={submitting}
            />
          </>
        )}
      </div>
    </div>
  );
}
