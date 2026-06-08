/**
 * src/pages/OfferService.tsx — Bambeh Marketplace
 *
 * REBUILT to match PostJobPage gold-standard pattern:
 *  ✅ 3-step wizard: Service Info → Pricing & Description → Review & Post
 *  ✅ StepBar + NavRow (💾 Save Draft | ← Back | Next Step →)
 *  ✅ Per-step validation with red inline errors
 *  ✅ Draft save/restore (key: bambeh_draft_service)
 *  ✅ price type="number", FCFA live formatter
 *  ✅ Saves to Supabase services + listings tables
 *  ✅ 🎉 Success screen with "View My Service" button
 *  ✅ Preview card with DEMO badge
 *  ✅ "Service Listed!" text now says "across Cameroon" (was blank)
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { REGIONS, CITIES_BY_REGION } from "@/data/Locations";
import { useLang, t } from "@/hooks/useAppLang";

const STEP_LABELS  = ["Service Info", "Pricing & Description", "Review & Post"];
const CATEGORIES   = ["Cleaning", "Plumbing", "Electrical", "Carpentry", "Painting", "Catering & Food", "IT Support", "Tutoring & Education", "Photography", "Transport & Delivery", "Security", "Gardening", "Beauty & Hair", "Health & Medical", "Legal", "Financial", "Construction", "Event Planning", "Other"];
const PRICE_TYPES  = ["Per Hour", "Per Day", "Fixed Price", "Negotiable", "Per Session"];

function StepBar({ step }: { step: number }) {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2">
        {STEP_LABELS.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200
              ${step> i + 1 ? "bg-teal-500 text-white" : step === i + 1 ? "bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {step > i + 1 ? (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>) : i + 1}
            </div>
            {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-1 rounded-full transition-colors ${step> i + 1 ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
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
  return <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{children}{required && <span className="text-red-500 ml-1">*</span>}</label>;
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

const fmt = (n: string) => n && !isNaN(Number(n)) && Number(n) > 0
  ? new Intl.NumberFormat("fr-CM").format(Number(n)) + " FCFA" : "";

interface Draft {
  title: string; category: string; region: string; city: string;
  experience: string; phone: string;
  price: string; priceType: string; description: string;
}
const BLANK: Draft = {
  title: "", category: "", region: "", city: "",
  experience: "", phone: "",
  price: "", priceType: "Per Hour", description: "",
};

export default function OfferService() {
  const navigate = useNavigate();
  const [step,       setStep]       = useState(1);
  const [d, setD]                   = useState<Draft>(BLANK);
  const [errs,       setErrs]       = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [posted,     setPosted]     = useState(false);
  const [newId,      setNewId]      = useState<string | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("bambeh_draft_service");
      if (s) setD(prev => ({ ...prev, ...JSON.parse(s) }));
    } catch {}
  }, []);

  function upd(patch: Partial<Draft>) { setD(prev => ({ ...prev, ...patch })); }
  function saveDraft() {
    localStorage.setItem("bambeh_draft_service", JSON.stringify(d));
    alert("Draft saved ✅");
  }

  const cities = d.region ? (CITIES_BY_REGION[d.region] ?? []) : [];

  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!d.title.trim())   e.title    = "Service title is required";
      if (!d.category)       e.category = "Category is required";
      if (!d.region)         e.region   = "Region is required";
      if (!d.city.trim())    e.city     = "City is required";
    }
    if (s === 2) {
      if (!d.price || isNaN(Number(d.price)) || Number(d.price) <= 0)
        e.price = "Valid price is required";
      if (!d.description.trim() || d.description.trim().length < 30)
        e.description = "Description must be at least 30 characters";
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

      // Save to services table
      const { error: svcErr } = await supabase.from("services").insert({
        seller_id:   session.user.id,
        title:       d.title.trim(),
        category:    d.category,
        location:    [d.city, d.region].filter(Boolean).join(", "),
        price:       Number(d.price),
        price_type:  d.priceType,
        description: d.description.trim(),
        phone:       d.phone.trim(),
        status:      "active",
      });
      if (svcErr) throw svcErr;

      // Also save to listings for the main feed
      const { data, error: lstErr } = await supabase.from("listings").insert({
        seller_id:   session.user.id,
        type:        "service",
        title:       d.title.trim(),
        description: d.description.trim(),
        price:       Number(d.price),
        category:    d.category,
        location:    [d.city, d.region].filter(Boolean).join(", "),
        phone:       d.phone.trim(),
        status:      "active",
        extra: { price_type: d.priceType, experience: d.experience },
      }).select("id").single();

      if (lstErr) throw lstErr;
      localStorage.removeItem("bambeh_draft_service");
      setNewId(data?.id ?? null);
      setPosted(true);
    } catch (e: any) {
      setErrs({ submit: e.message || "Failed to post. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (posted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl mb-4">🛠️</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Service Listed!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Your service is now visible to clients across Cameroon on all devices.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {newId && <button onClick={() => navigate(`/services/${newId}`)} className="py-3 bg-teal-600 text-white rounded-xl font-bold">View My Service →</button>}
          <button onClick={() => navigate("/services")} className="py-3 bg-teal-600 text-white rounded-xl font-bold">Browse Services</button>
          <button onClick={() => { setPosted(false); setStep(1); setD(BLANK); }}
            className="py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300">
            Offer Another Service
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
        <h1 className="font-bold text-lg">🛠️ Offer a Service</h1>
      </div>

      <StepBar step={step} />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Service Information</h2>

            <div><Lbl required>Service Title</Lbl>
              <SInput value={d.title} onChange={v => upd({ title: v })}
                placeholder="e.g. Professional House Cleaning, Expert Plumber" error={errs.title} />
            </div>

            <div><Lbl required>Category</Lbl>
              <SSelect value={d.category} onChange={v => upd({ category: v })}
                options={CATEGORIES} placeholder="Select category" error={errs.category} />
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

            <div><Lbl>Years of Experience</Lbl>
              <SInput value={d.experience} onChange={v => upd({ experience: v })}
                placeholder="e.g. 5 years" />
            </div>

            <div><Lbl>Contact Phone</Lbl>
              <div className="flex">
                <span className="border-2 border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl px-3 py-3 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600">🇨🇲 +237</span>
                <input type="tel"
                  className="flex-1 border-2 border-gray-200 dark:border-gray-600 focus:border-teal-500 rounded-r-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  placeholder="6XX XXX XXX"
                  value={d.phone}
                  onChange={e => upd({ phone: e.target.value.replace(/\D/g, "").slice(0, 9) })} />
              </div>
            </div>

            <NavRow onDraft={saveDraft} onNext={next} />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Pricing & Description</h2>

            <div><Lbl required>Price (FCFA)</Lbl>
              <SInput type="number" min="0" value={d.price} onChange={v => upd({ price: v })}
                placeholder="e.g. 15000" error={errs.price} />
              {fmt(d.price) && <p className="text-xs text-teal-600 font-semibold mt-1">= {fmt(d.price)}</p>}
            </div>

            <div><Lbl>Price Type</Lbl>
              <div className="grid grid-cols-2 gap-2">
                {PRICE_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => upd({ priceType: t })}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all
                      ${d.priceType === t ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700" : "border-gray-200 dark:border-gray-600 text-gray-600"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                      ${d.priceType === t ? "border-teal-500 bg-teal-500" : "border-gray-300"}`}>
                      {d.priceType === t && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div><Lbl required>Description</Lbl>
              <textarea rows={6}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none transition-colors
                  ${errs.description ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                placeholder="Describe your service in detail: what you do, how you work, your qualifications, what's included in the price, your availability..."
                value={d.description}
                onChange={e => upd({ description: e.target.value })} />
              <div className="flex justify-between text-xs mt-1 text-gray-400">
                <span>{d.description.length < 30 ? "Min 30 characters" : "✓ Good"}</span>
                <span>{d.description.length} chars</span>
              </div>
              <Err msg={errs.description} />
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} nextLabel="Review Listing →" />
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-4">📋 Listing Summary</h2>
              {[
                ["Title",      d.title],
                ["Category",   d.category],
                ["Location",   [d.city, d.region].filter(Boolean).join(", ") || "—"],
                ["Price",      fmt(d.price) ? `${fmt(d.price)} / ${d.priceType}` : "—"],
                ["Experience", d.experience || "Not specified"],
                ["Phone",      d.phone ? `+237 ${d.phone}` : "Not provided"],
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

            {/* Preview card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Preview — how clients will see your service</h3>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center relative">
                  <span className="text-5xl">🛠️</span>
                  <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">DEMO</span>
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{d.title || "Your service title"}</p>
                  <p className="text-teal-700 font-bold text-base mt-1">
                    {fmt(d.price) ? `${fmt(d.price)} / ${d.priceType}` : "Price not set"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{[d.city, d.region].filter(Boolean).join(", ") || "Location"} · {d.category || "Category"}</p>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2 italic text-center">
                DEMO badge only shows on sample items — not on your live listing.
              </p>
            </div>

            {errs.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">⚠ {errs.submit}</div>
            )}

            <NavRow onDraft={saveDraft} onBack={back} onNext={handleSubmit}
              nextLabel={submitting ? "Posting..." : "🚀 Post Service"}
              disabled={submitting} />
          </>
        )}
      </div>
    </div>
  );
}
