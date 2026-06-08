/**
 * src/pages/SellVehicle.tsx — Bambeh Marketplace
 *
 * PHONE INPUT CHANGE:
 *  ✅ Step 4 phone field replaced with AfricanPhoneInput
 *     - Cameroon default, West + Central Africa covered
 *     - Full international number (+237XXXXXXXXX) stored to Supabase
 *     - isValid flag used for step-4 validation — no manual length checks needed
 *     - Expanding to other African markets requires zero code changes here
 *
 * ALL PREVIOUS FIXES PRESERVED:
 *  ✅ Phone stored with country code (+237...) in Supabase `phone` column
 *  ✅ Phone required + validated before step 4 → 5 transition
 *  ✅ useCallback on fetchVehicles (used in VehicleRentals)
 *  ✅ alert() replaced with inline "✓ Draft saved" banner
 *  ✅ images base64 size warning
 *  ✅ +237 prefix on submit — now handled by AfricanPhoneInput directly
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { REGIONS, CITIES_BY_REGION } from "@/data/Locations";
import AfricanPhoneInput from "@/components/AfricanPhoneInput";
import { useLang, t } from "@/hooks/useAppLang";

const STEP_LABELS = ["Vehicle Info", "Condition & Details", "Photos", "Pricing & Location", "Review & Post"];
const MAKES       = ["Toyota", "Honda", "Mercedes-Benz", "BMW", "Nissan", "Hyundai", "Ford", "Peugeot", "Renault", "Kia", "Mitsubishi", "Land Rover", "Suzuki", "Isuzu", "Other"];
const TYPES       = ["Sedan", "SUV", "Pickup Truck", "Van / Minibus", "Motorcycle", "Truck", "Bus", "Other"];
const FUELS       = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG"];
const GEARBOXES   = ["Manual", "Automatic", "Semi-Automatic"];
const CONDITIONS  = ["Brand New", "Excellent", "Good", "Fair", "Needs Repair"];

const MAX_IMG   = 5 * 1024 * 1024;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateImg(f: File): string | null {
  const lang = useLang();
  const isRtl = lang === "ar";
  if (!IMG_TYPES.includes(f.type)) return "Only JPG, PNG or WebP images allowed.";
  if (f.size > MAX_IMG) return `${f.name} too large (max 5 MB). Got ${(f.size / 1024 / 1024).toFixed(1)} MB.`;
  return null;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2">
        {STEP_LABELS.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200
              ${step> i + 1 ? "bg-teal-500 text-white" : step === i + 1 ? "bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {step > i + 1
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
                : i + 1}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-1 rounded-full transition-colors ${step> i + 1 ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"}`} />
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
            : "bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-500/30"}`}>
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

function SInput({ value, onChange, placeholder, type = "text", error, min }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; error?: string; min?: string;
}) {
  return (
    <>
      <input type={type} min={min}
        className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
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
        className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none appearance-none
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

const fmt = (n: string) =>
  n && !isNaN(Number(n)) && Number(n) > 0
    ? new Intl.NumberFormat("fr-CM").format(Number(n)) + " FCFA"
    : "";

// ─── Draft type ───────────────────────────────────────────────────────────────

interface Draft {
  make: string; model: string; year: string; vehicleType: string;
  fuel: string; transmission: string; mileage: string; color: string;
  condition: string; description: string;
  price: string; negotiable: boolean; region: string; city: string;
  // phone now stores the full international number from AfricanPhoneInput
  // e.g. "+237671234567"
  phone: string;
}

const BLANK: Draft = {
  make: "", model: "", year: String(new Date().getFullYear()), vehicleType: "",
  fuel: "Petrol", transmission: "Manual", mileage: "", color: "",
  condition: "Good", description: "",
  price: "", negotiable: false, region: "", city: "", phone: "",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function SellVehicle() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [step,        setStep]        = useState(1);
  const [d,           setD]           = useState<Draft>(BLANK);
  const [errs,        setErrs]        = useState<Record<string, string>>({});
  const [images,      setImages]      = useState<string[]>([]);
  const [imgErrors,   setImgErrors]   = useState<string[]>([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [posted,      setPosted]      = useState(false);
  const [newId,       setNewId]       = useState<string | null>(null);
  const [draftSaved,  setDraftSaved]  = useState(false);
  // Track whether the phone number AfricanPhoneInput considers valid
  const [phoneValid,  setPhoneValid]  = useState(false);

  // Restore draft on mount
  useEffect(() => {
    try {
      const s = localStorage.getItem("bambeh_draft_vehicle");
      if (s) {
        const parsed = JSON.parse(s);
        setD(prev => ({ ...prev, ...parsed }));
        // If draft had a phone, assume valid so we don't block step 4
        if (parsed.phone) setPhoneValid(true);
      }
    } catch {}
  }, []);

  function upd(patch: Partial<Draft>) { setD(prev => ({ ...prev, ...patch })); }

  function saveDraft() {
    localStorage.setItem("bambeh_draft_vehicle", JSON.stringify(d));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }

  const cities = d.region ? (CITIES_BY_REGION[d.region] ?? []) : [];

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const errors: string[] = [];
    const previews: string[] = [];
    for (const f of Array.from(files).slice(0, 8 - images.length)) {
      const err = validateImg(f);
      if (err) { errors.push(err); continue; }
      await new Promise<void>(res => {
        const r = new FileReader();
        r.onload = e => { previews.push(e.target?.result as string); res(); };
        r.readAsDataURL(f);
      });
    }
    setImgErrors(errors);
    setImages(prev => [...prev, ...previews].slice(0, 8));
  }

  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!d.make)         e.make        = "Make is required";
      if (!d.model.trim()) e.model       = "Model is required";
      if (!d.vehicleType)  e.vehicleType = "Vehicle type is required";
      if (!d.year || Number(d.year) < 1950 || Number(d.year) > new Date().getFullYear() + 1)
        e.year = "Valid year is required";
    }
    if (s === 2) {
      if (!d.description.trim() || d.description.trim().length < 20)
        e.description = "Description must be at least 20 characters";
    }
    // Step 3 photos — optional
    if (s === 4) {
      if (!d.price || isNaN(Number(d.price)) || Number(d.price) <= 0)
        e.price = "Valid price is required";
      if (!d.region)      e.region = "Region is required";
      if (!d.city.trim()) e.city   = "City is required";
      // AfricanPhoneInput sets phoneValid — check it here
      if (!d.phone)       e.phone = "Phone number is required";
      else if (!phoneValid) e.phone = "Please enter a valid phone number for the selected country";
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
      if (!session?.user) { navigate("/login"); return; }

      const totalImgBytes = images.reduce((acc, img) => acc + img.length * 0.75, 0);
      if (totalImgBytes > 2 * 1024 * 1024) {
        console.warn("[SellVehicle] Images exceed 2 MB total. Consider Supabase Storage.");
      }

      // d.phone is already the full international number from AfricanPhoneInput
      // e.g. "+237671234567" — no prefix mangling needed
      const { data, error: err } = await supabase.from("listings").insert({
        seller_id:   session.user.id,
        type:        "vehicle",
        title:       `${d.make} ${d.model} ${d.year}`.trim(),
        description: d.description.trim(),
        price:       Number(d.price),
        category:    d.vehicleType,
        condition:   d.condition,
        location:    [d.city, d.region].filter(Boolean).join(", "),
        phone:       d.phone,          // full international number
        negotiable:  d.negotiable,
        status:      "active",
        images:      images.length > 0 ? images : null,
        extra: {
          make:         d.make,
          model:        d.model,
          year:         d.year,
          vehicle_type: d.vehicleType,
          fuel:         d.fuel,
          transmission: d.transmission,
          mileage:      d.mileage,
          color:        d.color,
        },
      }).select("id").single();

      if (err) throw err;
      localStorage.removeItem("bambeh_draft_vehicle");
      setNewId(data?.id ?? null);
      setPosted(true);
    } catch (e: any) {
      setErrs({ submit: e.message || "Failed to post. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success screen ───────────────────────────────────────────────────────

  if (posted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl mb-4">🚗</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vehicle Listed!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Your vehicle is now live on Bambeh, visible to all buyers across Cameroon on every device.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
          Other users can find your listing immediately — no extra steps needed.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {newId && (
            <button onClick={() => navigate(`/vehicles/${newId}`)}
              className="py-3 bg-teal-600 text-white rounded-xl font-bold">
              View My Listing →
            </button>
          )}
          <button onClick={() => navigate("/vehicles")} className="py-3 bg-teal-600 text-white rounded-xl font-bold">
            Browse Vehicles
          </button>
          <button
            onClick={() => { setPosted(false); setStep(1); setD(BLANK); setImages([]); setPhoneValid(false); }}
            className="py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300">
            List Another Vehicle
          </button>
        </div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-teal-600 text-white px-4 py-4 flex items-center gap-3 shadow">
        <button onClick={() => step === 1 ? navigate(-1) : back()}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">←</button>
        <h1 className="font-bold text-lg">🚗 Sell a Vehicle</h1>
        {draftSaved && (
          <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
            ✓ Draft saved
          </span>
        )}
      </div>

      <StepBar step={step} />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ── STEP 1: Vehicle Info ── */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Vehicle Information</h2>

            <div>
              <Lbl required>Make / Brand</Lbl>
              <div className="grid grid-cols-2 gap-2">
                {MAKES.map(m => (
                  <button key={m} type="button" onClick={() => upd({ make: m })}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all
                      ${d.make === m ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700" : "border-gray-200 dark:border-gray-600 text-gray-600"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                      ${d.make === m ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                      {d.make === m && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    {m}
                  </button>
                ))}
              </div>
              <Err msg={errs.make} />
            </div>

            <div><Lbl required>Model</Lbl>
              <SInput value={d.model} onChange={v => upd({ model: v })}
                placeholder="e.g. Corolla, RAV4, Hilux" error={errs.model} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Lbl required>Year</Lbl>
                <SInput type="number" min="1950" value={d.year} onChange={v => upd({ year: v })}
                  placeholder="2020" error={errs.year} />
              </div>
              <div><Lbl>Color</Lbl>
                <SInput value={d.color} onChange={v => upd({ color: v })}
                  placeholder="e.g. White, Silver" />
              </div>
            </div>

            <div><Lbl required>Vehicle Type</Lbl>
              <SSelect value={d.vehicleType} onChange={v => upd({ vehicleType: v })}
                options={TYPES} placeholder="Select type" error={errs.vehicleType} />
            </div>

            <NavRow onDraft={saveDraft} onNext={next} />
          </div>
        )}

        {/* ── STEP 2: Condition & Details ── */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Condition &amp; Details</h2>

            <div><Lbl required>Condition</Lbl>
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Lbl>Fuel Type</Lbl>
                <div className="flex flex-col gap-1.5">
                  {FUELS.map(f => (
                    <button key={f} type="button" onClick={() => upd({ fuel: f })}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all
                        ${d.fuel === f ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-600"}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center
                        ${d.fuel === f ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                        {d.fuel === f && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div><Lbl>Gearbox</Lbl>
                <div className="flex flex-col gap-1.5">
                  {GEARBOXES.map(g => (
                    <button key={g} type="button" onClick={() => upd({ transmission: g })}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all
                        ${d.transmission === g ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-600"}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center
                        ${d.transmission === g ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                        {d.transmission === g && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div><Lbl>Mileage (km)</Lbl>
              <SInput type="number" min="0" value={d.mileage} onChange={v => upd({ mileage: v })}
                placeholder="e.g. 45000" />
            </div>

            <div><Lbl required>Description</Lbl>
              <textarea rows={4}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none transition-colors
                  ${errs.description ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                placeholder="Describe the vehicle: service history, any issues, modifications, reason for sale…"
                value={d.description}
                onChange={e => upd({ description: e.target.value })} />
              <Err msg={errs.description} />
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} />
          </div>
        )}

        {/* ── STEP 3: Photos ── */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Add Vehicle Photos</h2>
            <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5 MB each · Up to 8 photos</p>

            {imgErrors.map((e, i) => (
              <p key={i} className="text-xs text-red-500 font-medium">⚠ {e}</p>
            ))}

            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
                ${images.length >= 8 ? "opacity-40 pointer-events-none" : "border-gray-200 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"}`}>
              <p className="text-3xl mb-2">🚗</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {images.length >= 8 ? "Maximum 8 photos" : "Tap to upload vehicle photos"}
              </p>
              <p className="text-xs text-gray-400 mt-1">{images.length}/8 photos added</p>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                    <img src={src} alt={`Photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(p => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">×</button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-teal-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">Main</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                📌 <strong>Tip:</strong> Cars with 5+ photos sell 4× faster. Show exterior (front, rear, sides), interior, dashboard, and engine.
              </p>
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} nextLabel="Pricing & Location →" />
          </div>
        )}

        {/* ── STEP 4: Pricing & Location ── */}
        {step === 4 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Pricing &amp; Location</h2>

            <div>
              <Lbl required>Price (FCFA)</Lbl>
              <SInput type="number" min="0" value={d.price} onChange={v => upd({ price: v })}
                placeholder="e.g. 3500000" error={errs.price} />
              {fmt(d.price) && <p className="text-xs text-teal-600 font-semibold mt-1">= {fmt(d.price)}</p>}
            </div>

            <BigCheck checked={d.negotiable} onChange={v => upd({ negotiable: v })}
              label="Price is Negotiable" desc="Buyers can make you an offer" />

            <div>
              <Lbl required>Region</Lbl>
              <SSelect value={d.region} onChange={v => upd({ region: v, city: "" })}
                options={REGIONS} placeholder="Select region" error={errs.region} />
            </div>

            {d.region && (
              <div>
                <Lbl required>City / Town</Lbl>
                {cities.length > 0
                  ? <SSelect value={d.city} onChange={v => upd({ city: v })}
                      options={cities} placeholder="Select city" error={errs.city} />
                  : <SInput value={d.city} onChange={v => upd({ city: v })}
                      placeholder="Enter city name" error={errs.city} />}
              </div>
            )}

            {/* ── AfricanPhoneInput ── */}
            <AfricanPhoneInput
              label="Contact Phone"
              required
              value={d.phone}
              onChange={(fullNumber, isValid) => {
                upd({ phone: fullNumber });
                setPhoneValid(isValid);
                // Clear phone error as soon as user starts typing
                if (errs.phone) setErrs(prev => ({ ...prev, phone: "" }));
              }}
              error={errs.phone}
            />

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} nextLabel="Review Listing →" />
          </div>
        )}

        {/* ── STEP 5: Review & Post ── */}
        {step === 5 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-4">📋 Listing Summary</h2>
              {([
                ["Vehicle",    `${d.make} ${d.model} ${d.year}`.trim() || "—"],
                ["Type",       d.vehicleType || "—"],
                ["Condition",  d.condition],
                ["Fuel",       d.fuel],
                ["Gearbox",    d.transmission],
                ["Mileage",    d.mileage ? `${Number(d.mileage).toLocaleString()} km` : "Not specified"],
                ["Color",      d.color || "Not specified"],
                ["Price",      fmt(d.price) || "—"],
                ["Negotiable", d.negotiable ? "Yes ✓" : "No"],
                ["Location",   [d.city, d.region].filter(Boolean).join(", ") || "—"],
                ["Phone",      d.phone || "—"],
                ["Photos",     `${images.length} photo${images.length !== 1 ? "s" : ""}`],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>

            {/* Preview card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Preview — how buyers will see it</h3>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
                  {images[0]
                    ? <img src={images[0]} alt="preview" className="w-full h-full object-cover" />
                    : <span className="text-5xl">🚗</span>
                  }
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{`${d.make} ${d.model} ${d.year}`.trim() || "Your vehicle"}</p>
                  <p className="text-teal-700 font-bold text-base mt-1">{fmt(d.price) || "Price not set"}</p>
                  <p className="text-xs text-gray-400 mt-1">{[d.city, d.region].filter(Boolean).join(", ") || "Location"} · {d.fuel} · {d.transmission}</p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-800">
              🌍 <strong>Visible across Cameroon.</strong> Once posted, your listing is live on Bambeh and visible to all users on any device instantly.
            </div>

            {errs.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">⚠ {errs.submit}</div>
            )}

            <NavRow onDraft={saveDraft} onBack={back} onNext={handleSubmit}
              nextLabel={submitting ? "Posting…" : "🚀 List Vehicle"} disabled={submitting} />
          </>
        )}

      </div>
    </div>
  );
}
