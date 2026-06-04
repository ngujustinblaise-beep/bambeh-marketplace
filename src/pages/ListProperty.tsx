/**
 * src/pages/ListProperty.tsx — Bambeh Marketplace
 *
 * REBUILT to match PostJobPage gold-standard pattern:
 *  ✅ 4-step wizard: Property Info → Details & Amenities → Pricing & Location → Review
 *  ✅ StepBar + NavRow (Save Draft | ← Back | Next Step →)
 *  ✅ Per-step validation with red inline errors
 *  ✅ Draft save/restore (key: bambeh_draft_rental)
 *  ✅ Saves to Supabase listings table (type: 'rental')
 *  ✅ 🎉 Success screen
 *  ✅ Preview card with DEMO badge
 *  ✅ All routes: /rentals/list, /rentals/post → /rentals/list, /list-property → /rentals/list
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { REGIONS, CITIES_BY_REGION } from "@/data/Locations";
import AfricanPhoneInput from "@/components/AfricanPhoneInput";

const STEP_LABELS   = ["Property Info", "Details & Amenities", "Photos", "Pricing & Location", "Review & Post"];
const PROP_TYPES    = ["Apartment", "House", "Villa", "Studio", "Room", "Duplex", "Townhouse", "Penthouse", "Office", "Shop", "Land", "Other"];
const AMENITIES     = ["Air Conditioning", "Wi-Fi", "Generator", "Water 24/7", "Security Guard", "CCTV", "Parking", "Swimming Pool", "Gym", "Elevator", "Balcony/Terrace", "Garden", "Furnished"];
const RENT_PERIODS  = ["Monthly", "Yearly", "Weekly", "Daily"];

// Image validation
const MAX_IMG   = 5 * 1024 * 1024;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
function validateImg(f: File): string | null {
  if (!IMG_TYPES.includes(f.type)) return "Only JPG, PNG or WebP images allowed.";
  if (f.size > MAX_IMG) return `Too large (max 5 MB). Got ${(f.size/1024/1024).toFixed(1)} MB.`;
  return null;
}

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2">
        {STEP_LABELS.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200
              ${step > i + 1 ? "bg-teal-500 text-white" : step === i + 1 ? "bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {step > i + 1 ? (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>) : i + 1}
            </div>
            {i < total - 1 && <div className={`flex-1 h-1 rounded-full transition-colors ${step > i + 1 ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
        Step {step} of {total}: {STEP_LABELS[step - 1]}
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

function Lbl({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-500 mt-1 font-medium">⚠ {msg}</p> : null;
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

const fmt = (n: string) => n && !isNaN(Number(n)) && Number(n) > 0
  ? new Intl.NumberFormat("fr-CM").format(Number(n)) + " FCFA"
  : "";

interface Draft {
  title: string; propertyType: string; bedrooms: string; bathrooms: string;
  furnished: boolean; description: string; amenities: string[];
  price: string; rentPeriod: string; region: string; city: string;
  address: string; phone: string; availableFrom: string;
}
const BLANK: Draft = {
  title: "", propertyType: "", bedrooms: "1", bathrooms: "1",
  furnished: false, description: "", amenities: [],
  price: "", rentPeriod: "Monthly", region: "", city: "",
  address: "", phone: "", availableFrom: "",
};

export default function ListProperty() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);
  const [step,       setStep]       = useState(1);
  const [d, setD]                   = useState<Draft>(BLANK);
  const [errs,       setErrs]       = useState<Record<string, string>>({});
  // imageFiles  — actual File objects, sent to Supabase Storage on submit
  // imagePreviews — local blob URLs for display (revoked on unmount to avoid memory leaks)
  const [imageFiles,    setImageFiles]    = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imgErrors,     setImgErrors]     = useState<string[]>([]);
  const [uploading,     setUploading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [posted,     setPosted]     = useState(false);
  const [newId,      setNewId]      = useState<string | null>(null);
  const [phoneValid, setPhoneValid] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("bambeh_draft_rental");
      if (s) setD(prev => ({ ...prev, ...JSON.parse(s) }));
    } catch {}
  }, []);

  // Revoke blob preview URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => { imagePreviews.forEach(url => URL.revokeObjectURL(url)); };
  }, [imagePreviews]);

  function upd(patch: Partial<Draft>) { setD(prev => ({ ...prev, ...patch })); }
  function saveDraft() {
    localStorage.setItem("bambeh_draft_rental", JSON.stringify(d));
    alert("Draft saved ✅");
  }

  const cities = d.region ? (CITIES_BY_REGION[d.region] ?? []) : [];

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const errors: string[] = [];
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const slots = 3 - imageFiles.length;   // max 3 photos
    for (const f of Array.from(files).slice(0, slots)) {
      const err = validateImg(f);
      if (err) { errors.push(err); continue; }
      newFiles.push(f);
      newPreviews.push(URL.createObjectURL(f));  // instant local preview, no base64
    }
    setImgErrors(errors);
    setImageFiles(prev => [...prev, ...newFiles].slice(0, 3));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 3));
  }

  function removeImage(i: number) {
    URL.revokeObjectURL(imagePreviews[i]);   // clean up blob URL
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  function toggleAmenity(a: string) {
    upd({ amenities: d.amenities.includes(a) ? d.amenities.filter(x => x !== a) : [...d.amenities, a] });
  }

  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!d.title.trim())        e.title        = "Property title is required";
      if (!d.propertyType)        e.propertyType = "Property type is required";
    }
    if (s === 2) {
      if (!d.description.trim() || d.description.trim().length < 20)
        e.description = "Description must be at least 20 characters";
    }
    // Step 3 is photos — no required validation
    if (s === 4) {
      if (!d.price || isNaN(Number(d.price)) || Number(d.price) <= 0)
        e.price = "Valid price is required";
      if (!d.region)     e.region = "Region is required";
      if (!d.city.trim())e.city   = "City is required";
    }
    return e;
  }

  function next() {
    const e = validate(step); setErrs(e);
    if (Object.keys(e).length > 0) return;
    setStep(s => s + 1); window.scrollTo(0, 0);
  }
  function back() { setErrs({}); setStep(s => s - 1); window.scrollTo(0, 0); }

  // Upload all chosen photos to Supabase Storage and return their public URLs
  async function uploadImages(userId: string): Promise<string[]> {
    const urls: string[] = [];
    setUploading(true);
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const ext  = file.name.split(".").pop() ?? "jpg";
      // Path: userId/timestamp_index.ext  — one folder per user, no collisions
      const path = `${userId}/${Date.now()}_${i}.${ext}`;
      const { error } = await supabase.storage
        .from("rental-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw new Error(`Photo ${i + 1} upload failed: ${error.message}`);
      const { data } = supabase.storage.from("rental-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setUploading(false);
    return urls;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/login"); return; }

      // 1. Upload photos first — get back public URLs
      const imageUrls = imageFiles.length > 0
        ? await uploadImages(session.user.id)
        : [];

      // 2. Insert listing row with URL strings (not base64)
      const { data, error: err } = await supabase.from("listings").insert({
        seller_id:   session.user.id,
        type:        "rental",
        title:       d.title.trim(),
        description: d.description.trim(),
        price:       Number(d.price),
        category:    d.propertyType,
        location:    [d.address, d.city, d.region].filter(Boolean).join(", "),
        phone:       d.phone.trim(),
        status:      "active",
        images:      imageUrls.length > 0 ? imageUrls : null,
        extra: {
          property_type:  d.propertyType,
          bedrooms:       Number(d.bedrooms),
          bathrooms:      Number(d.bathrooms),
          furnished:      d.furnished,
          rent_period:    d.rentPeriod,
          amenities:      d.amenities,
          available_from: d.availableFrom,
        },
      }).select("id").single();

      if (err) throw err;
      localStorage.removeItem("bambeh_draft_rental");
      setNewId(data?.id ?? null);
      setPosted(true);
    } catch (e: any) {
      setUploading(false);
      setErrs({ submit: e.message || "Failed to post. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (posted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl mb-4">🏠</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Property Listed!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Your property is now live on Bambeh Rentals, visible to renters across Cameroon.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {newId && (
            <button onClick={() => navigate(`/rentals/${newId}`)}
              className="py-3 bg-teal-600 text-white rounded-xl font-bold">View My Listing →</button>
          )}
          <button onClick={() => navigate("/rentals")}
            className="py-3 bg-teal-600 text-white rounded-xl font-bold">Browse Rentals</button>
          <button onClick={() => { setPosted(false); setStep(1); setD(BLANK); }}
            className="py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300">
            List Another Property
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-teal-600 text-white px-4 py-4 flex items-center gap-3 shadow">
        <button onClick={() => step === 1 ? navigate(-1) : back()}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">←</button>
        <h1 className="font-bold text-lg">🏠 List a Property</h1>
      </div>

      <StepBar step={step} total={STEP_LABELS.length} />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Property Information</h2>

            <div><Lbl required>Listing Title</Lbl>
              <SInput value={d.title} onChange={v => upd({ title: v })}
                placeholder="e.g. Modern 2-Bedroom Apartment in Bastos, Yaoundé" error={errs.title} />
            </div>

            <div><Lbl required>Property Type</Lbl>
              <div className="grid grid-cols-2 gap-2">
                {PROP_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => upd({ propertyType: t })}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all
                      ${d.propertyType === t ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700" : "border-gray-200 dark:border-gray-600 text-gray-600"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                      ${d.propertyType === t ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                      {d.propertyType === t && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    {t}
                  </button>
                ))}
              </div>
              <Err msg={errs.propertyType} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Lbl>Bedrooms</Lbl>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => upd({ bedrooms: String(Math.max(0, Number(d.bedrooms) - 1)) })}
                    className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600">−</button>
                  <span className="text-xl font-bold text-gray-900 dark:text-white w-8 text-center">{d.bedrooms}</span>
                  <button type="button" onClick={() => upd({ bedrooms: String(Number(d.bedrooms) + 1) })}
                    className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white">+</button>
                </div>
              </div>
              <div><Lbl>Bathrooms</Lbl>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => upd({ bathrooms: String(Math.max(0, Number(d.bathrooms) - 1)) })}
                    className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600">−</button>
                  <span className="text-xl font-bold text-gray-900 dark:text-white w-8 text-center">{d.bathrooms}</span>
                  <button type="button" onClick={() => upd({ bathrooms: String(Number(d.bathrooms) + 1) })}
                    className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white">+</button>
                </div>
              </div>
            </div>

            <BigCheck checked={d.furnished} onChange={v => upd({ furnished: v })}
              label="Property is Furnished"
              desc="Includes beds, sofas, appliances and other furniture" />

            <NavRow onDraft={saveDraft} onNext={next} />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Details & Amenities</h2>

            <div><Lbl required>Description</Lbl>
              <textarea rows={5}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none transition-colors
                  ${errs.description ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                placeholder="Describe the property: layout, condition, nearby landmarks, what makes it special..."
                value={d.description}
                onChange={e => upd({ description: e.target.value })} />
              <Err msg={errs.description} />
            </div>

            <div><Lbl>Amenities & Features</Lbl>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.map(a => {
                  const sel = d.amenities.includes(a);
                  return (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all
                        ${sel ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700" : "border-gray-200 dark:border-gray-600 text-gray-600"}`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                        ${sel ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                        {sel && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} />
          </div>
        )}

        {/* STEP 3 — PHOTOS */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Add Photos</h2>
            <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5 MB each · Up to 3 photos</p>

            {imgErrors.map((e, i) => (
              <p key={i} className="text-xs text-red-500 font-medium">⚠ {e}</p>
            ))}

            <div
              onClick={() => imageFiles.length < 3 && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
                ${imageFiles.length >= 3 ? "opacity-40 pointer-events-none" : "border-gray-200 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"}`}>
              <p className="text-3xl mb-2">🏠</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {imageFiles.length >= 3 ? "Maximum 3 photos reached" : "Tap to upload property photos"}
              </p>
              <p className="text-xs text-gray-400 mt-1">{imageFiles.length}/3 photos added</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={e => { handleFiles(e.target.files); e.target.value = ""; }} />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                    <img src={src} alt={`Photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">×</button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-teal-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">Main</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                📌 <strong>Tip:</strong> Properties with photos get 5× more inquiries. Upload up to 3 clear shots — bedroom, living room, and exterior work best.
              </p>
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} nextLabel="Pricing & Location →" />
          </div>
        )}

        {/* STEP 4 — PRICING & LOCATION (was step 3) */}
        {step === 4 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Pricing & Location</h2>

            <div><Lbl required>Rent Price (FCFA)</Lbl>
              <SInput type="number" min="0" value={d.price} onChange={v => upd({ price: v })}
                placeholder="e.g. 75000" error={errs.price} />
              {fmt(d.price) && <p className="text-xs text-teal-600 font-semibold mt-1">= {fmt(d.price)}</p>}
            </div>

            <div><Lbl>Rent Period</Lbl>
              <div className="flex gap-2">
                {RENT_PERIODS.map(p => (
                  <button key={p} type="button" onClick={() => upd({ rentPeriod: p })}
                    className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all
                      ${d.rentPeriod === p ? "border-teal-500 bg-teal-500 text-white" : "border-gray-200 dark:border-gray-600 text-gray-600"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div><Lbl required>Region</Lbl>
              <SSelect value={d.region} onChange={v => upd({ region: v, city: "" })}
                options={REGIONS} placeholder="Select region" error={errs.region} />
            </div>

            {d.region && (
              <div><Lbl required>City / Town</Lbl>
                {cities.length > 0
                  ? <SSelect value={d.city} onChange={v => upd({ city: v })}
                      options={cities} placeholder="Select city" error={errs.city} />
                  : <SInput value={d.city} onChange={v => upd({ city: v })}
                      placeholder="Enter city name" error={errs.city} />}
              </div>
            )}

            <div><Lbl>Street / Neighbourhood</Lbl>
              <SInput value={d.address} onChange={v => upd({ address: v })}
                placeholder="e.g. Carrefour Elig-Essono, Quartier Omnisport" />
            </div>

            <div><Lbl>Available From</Lbl>
              <SInput type="date" value={d.availableFrom} onChange={v => upd({ availableFrom: v })}
                min={new Date().toISOString().split("T")[0]} />
            </div>

            {/* ── AfricanPhoneInput: Cameroon default, all Central + West Africa ── */}
            <div>
              <AfricanPhoneInput
                label="Contact Phone"
                value={d.phone}
                onChange={(full, valid) => {
                  upd({ phone: full });
                  setPhoneValid(valid);
                }}
              />
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} nextLabel="Review Listing →" />
          </div>
        )}

        {/* STEP 5 — REVIEW (was step 4) */}
        {step === 5 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-4">📋 Listing Summary</h2>
              {[
                ["Title",        d.title],
                ["Type",         d.propertyType],
                ["Bedrooms",     d.bedrooms],
                ["Bathrooms",    d.bathrooms],
                ["Furnished",    d.furnished ? "Yes ✓" : "No"],
                ["Rent",         fmt(d.price) ? `${fmt(d.price)} / ${d.rentPeriod}` : "—"],
                ["Location",     [d.address, d.city, d.region].filter(Boolean).join(", ") || "—"],
                ["Phone",        d.phone ? `+237 ${d.phone}` : "Not provided"],
                ["Amenities",    d.amenities.length > 0 ? d.amenities.join(", ") : "None selected"],
                ["Available",    d.availableFrom || "Immediately"],
                ["Photos",       `${imageFiles.length} photo${imageFiles.length !== 1 ? "s" : ""} selected`],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>

            {/* Preview card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Preview — how renters will see your listing</h3>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center relative">
                  <span className="text-5xl">🏠</span>
                  <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">DEMO</span>
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{d.title || "Your property title"}</p>
                  <p className="text-teal-700 font-bold text-base mt-1">
                    {fmt(d.price) ? `${fmt(d.price)} / ${d.rentPeriod}` : "Price not set"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{[d.city, d.region].filter(Boolean).join(", ") || "Location"} · {d.bedrooms} bed · {d.bathrooms} bath</p>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2 italic text-center">
                The DEMO badge only shows on sample items — not on your live listing.
              </p>
            </div>

            {errs.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">⚠ {errs.submit}</div>
            )}

            <NavRow onDraft={saveDraft} onBack={back} onNext={handleSubmit}
              nextLabel={uploading ? "⬆ Uploading photos…" : submitting ? "Posting…" : "🚀 List Property"}
              disabled={submitting || uploading} />
          </>
        )}
      </div>
    </div>
  );
}
