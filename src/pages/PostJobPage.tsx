/**
 * src/pages/PostJobPage.tsx
 * Bambeh Marketplace — 5-step Job Posting flow
 *
 * ① Basic Info  ② Location  ③ Compensation  ④ Job Details  ⑤ Application
 * • Every required field validated before next step
 * • Large visible ✓ ticks on all checkboxes and radio buttons
 * • Save Draft locally at each step
 * • Region → City cascade → Quartier cascade dropdowns
 * • Word count enforced on Description (100–500)
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { REGIONS, CITIES_BY_REGION, QUARTIERS_BY_CITY } from "@/data/cameroonLocations";

// ─── Constants ─────────────────────────────────────────────────────────────
const JOB_TYPES     = ["Full-time","Part-time","Contract","Internship","Temporary","Remote","Freelance"];
const CATEGORIES    = ["Technology","Marketing","Finance","Sales","Engineering","Healthcare","Education","Agriculture","Construction","Hospitality","Legal","Logistics","Other"];
const EXP_LEVELS    = ["No experience","Less than 1 year","1–2 years","2–4 years","3–5 years","5–10 years","10+ years"];
const SALARY_TYPES  = ["Hourly","Daily","Monthly","Annually"];
const CURRENCIES    = ["XAF","USD","EUR","GBP"];
const BENEFITS_LIST = ["Health Insurance","Performance Bonus","Transport Allowance","Phone Allowance","Meal Allowance","Annual Leave","Remote Work Option","Training Budget","Company Car","Housing Allowance","Internet Allowance","Paid Sick Leave"];
const STEP_LABELS   = ["Basic Info","Location","Compensation","Job Details","Application"];

// ─── Types ─────────────────────────────────────────────────────────────────
interface Draft {
  // Step 1
  logoFile: File | null; logoPreview: string;
  jobTitle: string; companyName: string; jobType: string; category: string;
  experience: string; positions: number; isUrgent: boolean;
  // Step 2
  region: string; city: string; quartier: string; specificAddress: string;
  // Step 3
  salaryType: string; currency: string; salaryMin: string; salaryMax: string;
  isNegotiable: boolean; benefits: string[];
  // Step 4
  description: string; responsibilities: string; requirements: string;
  requiredSkills: string; preferredSkills: string;
  // Step 5
  appMethod: "email"|"phone"|"link"|"onsite";
  appEmail: string; appPhone: string; appLink: string; onsiteInfo: string;
  appDeadline: string; isFeatured: boolean;
}

const BLANK: Draft = {
  logoFile: null, logoPreview: "",
  jobTitle: "", companyName: "", jobType: "", category: "",
  experience: "", positions: 1, isUrgent: false,
  region: "", city: "", quartier: "", specificAddress: "",
  salaryType: "Monthly", currency: "XAF", salaryMin: "", salaryMax: "",
  isNegotiable: false, benefits: [],
  description: "", responsibilities: "", requirements: "",
  requiredSkills: "", preferredSkills: "",
  appMethod: "email", appEmail: "", appPhone: "", appLink: "",
  onsiteInfo: "", appDeadline: "", isFeatured: false,
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function wordCount(t: string): number {
  return t.trim() === "" ? 0 : t.trim().split(/\s+/).length;
}

// ─── Sub-components ────────────────────────────────────────────────────────

/** Step progress bar */
function StepBar({ step }: { step: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2">
        {STEP_LABELS.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                             flex-shrink-0 transition-all duration-200
                             ${step > i + 1
                               ? "bg-teal-500 text-white"
                               : step === i + 1
                               ? "bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900"
                               : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {step > i + 1 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : i + 1}
            </div>
            {i < 4 && (
              <div className={`flex-1 h-1 rounded-full transition-colors duration-300
                               ${step > i + 1 ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
        Step {step} of 5: {STEP_LABELS[step - 1]}
      </p>
    </div>
  );
}

/** Large clearly-visible checkbox */
function BigCheck({ checked, onChange, label, desc }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
                  ${checked
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"}`}>
      {/* The big visible tick box */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center
                       transition-all ${checked
                         ? "border-teal-500 bg-teal-500"
                         : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"}`}>
        {checked && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={3.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div>
        <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

/** Large clearly-visible radio / selection card */
function RadioCard({ selected, onClick, icon, label, desc }: {
  selected: boolean; onClick: () => void; icon: string; label: string; desc?: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.99]
                  ${selected
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"}`}>
      {/* Big radio circle with thick visible tick */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center
                       transition-all ${selected
                         ? "border-teal-500 bg-teal-500"
                         : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"}`}>
        {selected && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={3.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

/** Styled text input */
function SInput({ value, onChange, placeholder, type = "text", error, min }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; error?: string; min?: string;
}) {
  return (
    <>
      <input type={type} min={min}
        className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white outline-none transition-colors
                    ${error ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                      "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
        placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} />
      {error && <p className="text-xs text-red-500 mt-1 font-medium">⚠ {error}</p>}
    </>
  );
}

/** Styled select */
function SSelect({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder: string; error?: string;
}) {
  return (
    <>
      <select
        className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white outline-none appearance-none
                    ${error ? "border-red-400 bg-red-50" :
                      "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
        value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 mt-1 font-medium">⚠ {error}</p>}
    </>
  );
}

/** Urgent / toggle knob */
function UrgentKnob({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all
                  ${on ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                    "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"}`}>
      {/* Knob */}
      <div className={`relative w-12 h-6 rounded-full transition-colors ${on ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`} />
      </div>
      <span className={`font-semibold text-sm ${on ? "text-red-600 dark:text-red-400" : "text-gray-500"}`}>
        {on ? `🔥 ${label}` : label}
      </span>
    </button>
  );
}

/** Nav row: Save Draft | ← Back | Next → */
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
                    ${disabled ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed" :
                      "bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-500/30"}`}>
        {nextLabel}
      </button>
    </div>
  );
}

// ─── Word count textarea ────────────────────────────────────────────────────
function WCTextarea({ value, onChange, placeholder, minW, maxW, rows = 6, error }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  minW: number; maxW: number; rows?: number; error?: string;
}) {
  const wc  = wordCount(value);
  const ok  = wc >= minW && wc <= maxW;
  const over = wc > maxW;
  return (
    <div>
      <textarea rows={rows} placeholder={placeholder}
        className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white outline-none resize-none transition-colors
                    ${over ? "border-red-400" : error ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                      "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
        value={value} onChange={(e) => onChange(e.target.value)} />
      <div className={`flex justify-between text-xs mt-1 font-medium
                       ${ok ? "text-green-600" : over ? "text-red-500" : "text-gray-400"}`}>
        <span>{ok ? "✓ Good length" : `${minW}–${maxW} words required`}</span>
        <span>{wc}/{maxW}</span>
      </div>
      {error && <p className="text-xs text-red-500 mt-1 font-medium">⚠ {error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function PostJobPage() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [d, setD]               = useState<Draft>(BLANK);
  const [errs, setErrs]         = useState<Record<string, string>>({});
  const [submitting, setSubmit] = useState(false);
  const [posted, setPosted]     = useState(false);
  const logoRef                 = useRef<HTMLInputElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bambeh_job_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        setD((prev) => ({ ...prev, ...parsed, logoFile: null }));
      }
    } catch {}
  }, []);

  function upd(patch: Partial<Draft>) {
    setD((prev) => ({ ...prev, ...patch }));
  }

  function saveDraft() {
    const { logoFile, logoPreview, ...rest } = d;
    localStorage.setItem("bambeh_job_draft", JSON.stringify(rest));
    alert("Draft saved to your device ✅");
  }

  // ── Validation per step ──
  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!d.jobTitle.trim())   e.jobTitle    = "Job title is required";
      if (!d.companyName.trim())e.companyName = "Company name is required";
      if (!d.jobType)           e.jobType     = "Job type is required";
      if (!d.category)          e.category    = "Category is required";
      if (!d.experience)        e.experience  = "Experience level is required";
      if (d.positions < 1)      e.positions   = "At least 1 position";
    }
    if (s === 2) {
      if (!d.region)            e.region = "Region is required";
      if (!d.city.trim())       e.city   = "City is required";
    }
    if (s === 3) {
      if (!d.salaryMin)         e.salaryMin = "Minimum salary is required";
    }
    if (s === 4) {
      const wc = wordCount(d.description);
      if (wc < 100) e.description = "Description needs at least 100 words";
      if (wc > 500) e.description = "Description must not exceed 500 words";
      if (!d.responsibilities.trim()) e.responsibilities = "Key responsibilities are required";
      if (!d.requirements.trim())     e.requirements     = "Requirements are required";
    }
    if (s === 5) {
      if (d.appMethod === "email" && !d.appEmail.trim())
        e.appEmail = "Application email is required";
      if (d.appMethod === "phone" && !d.appPhone.trim())
        e.appPhone = "Phone number is required";
      if (d.appMethod === "link" && !d.appLink.trim())
        e.appLink = "Application link is required";
    }
    return e;
  }

  function next() {
    const e = validate(step);
    setErrs(e);
    if (Object.keys(e).length > 0) return;
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  }
  function back() {
    setErrs({});
    setStep((s) => s - 1);
    window.scrollTo(0, 0);
  }

  async function postJob() {
    const e = validate(5);
    setErrs(e);
    if (Object.keys(e).length > 0) return;
    setSubmit(true);
    try {
      // TODO: upload logo, then insert into supabase
      // const { error } = await supabase.from("jobs").insert([{ ...payload }]);
      await new Promise((r) => setTimeout(r, 1200)); // simulate network
      localStorage.removeItem("bambeh_job_draft");
      setPosted(true);
    } catch {
      alert("Failed to post. Please try again.");
    } finally {
      setSubmit(false);
    }
  }

  // ── Success ──
  if (posted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl mb-4">🎉</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job Posted!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Your listing is now live across Bambeh and visible to thousands of candidates.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate("/jobs")}
            className="py-3 bg-teal-600 text-white rounded-xl font-bold">
            Browse All Jobs
          </button>
          <button onClick={() => { setPosted(false); setStep(1); setD(BLANK); }}
            className="py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold
                       text-gray-700 dark:text-gray-300">
            Post Another Job
          </button>
        </div>
      </div>
    );
  }

  const cities    = d.region ? (CITIES_BY_REGION[d.region]   ?? []) : [];
  const quartiers = d.city   ? (QUARTIERS_BY_CITY[d.city]   ?? []) : [];

  // ─── Summary helper ──────────────────────────────────────────────────────
  function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
      <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{value || "—"}</span>
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
        <h1 className="font-bold text-lg">Post a Job</h1>
      </div>

      <StepBar step={step} />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ════════ STEP 1: BASIC INFO ════════ */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Basic Information</h2>

            {/* Logo upload */}
            <div className="flex items-center gap-4">
              <div onClick={() => logoRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600
                           flex items-center justify-center cursor-pointer hover:border-teal-500
                           bg-gray-50 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {d.logoPreview
                  ? <img src={d.logoPreview} alt="logo" className="w-full h-full object-cover rounded-2xl" />
                  : <div className="text-center text-xs text-gray-400 leading-tight px-1">
                      <div className="text-3xl mb-1">🏢</div>Logo
                    </div>
                }
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upd({ logoFile: f, logoPreview: URL.createObjectURL(f) });
                }} />
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Company Logo</p>
                <p className="text-xs text-gray-400 mt-0.5">Optional · PNG or JPG · max 2MB</p>
                <button onClick={() => logoRef.current?.click()}
                  className="mt-2 text-xs text-teal-600 font-semibold border border-teal-300 rounded-lg px-3 py-1">
                  Upload
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <SInput value={d.jobTitle} onChange={(v) => upd({ jobTitle: v })}
                placeholder="e.g. Software Engineer" error={errs.jobTitle} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <SInput value={d.companyName} onChange={(v) => upd({ companyName: v })}
                placeholder="e.g. TechCorp Cameroon" error={errs.companyName} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Job Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {JOB_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => upd({ jobType: t })}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold text-left
                                transition-all ${d.jobType === t
                                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                                  : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                                    ${d.jobType === t ? "border-teal-500 bg-teal-500" : "border-gray-300 dark:border-gray-500"}`}>
                      {d.jobType === t && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                    {t}
                  </button>
                ))}
              </div>
              {errs.jobType && <p className="text-xs text-red-500 mt-1">⚠ {errs.jobType}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <SSelect value={d.category} onChange={(v) => upd({ category: v })}
                options={CATEGORIES} placeholder="Select a category" error={errs.category} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <SSelect value={d.experience} onChange={(v) => upd({ experience: v })}
                options={EXP_LEVELS} placeholder="Select experience" error={errs.experience} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Number of Positions <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => upd({ positions: Math.max(1, d.positions - 1) })}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600
                             flex items-center justify-center font-bold text-xl text-gray-600">−</button>
                <span className="text-xl font-bold text-gray-900 dark:text-white w-8 text-center">
                  {d.positions}
                </span>
                <button type="button" onClick={() => upd({ positions: d.positions + 1 })}
                  className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-xl text-white">
                  +
                </button>
                <span className="text-sm text-gray-500 ml-1">
                  {d.positions === 1 ? "position" : "positions"}
                </span>
              </div>
              {errs.positions && <p className="text-xs text-red-500 mt-1">⚠ {errs.positions}</p>}
            </div>

            {/* Urgent knob */}
            <UrgentKnob on={d.isUrgent} onChange={(v) => upd({ isUrgent: v })} label="Urgent Hiring" />

            <NavRow onDraft={saveDraft} onNext={next} />
          </div>
        )}

        {/* ════════ STEP 2: LOCATION ════════ */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Job Location</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Region <span className="text-red-500">*</span>
              </label>
              <SSelect value={d.region} onChange={(v) => upd({ region: v, city: "", quartier: "" })}
                options={REGIONS} placeholder="Select region" error={errs.region} />
            </div>

            {d.region && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  City / Town <span className="text-red-500">*</span>
                </label>
                {cities.length > 0 ? (
                  <SSelect value={d.city} onChange={(v) => upd({ city: v, quartier: "" })}
                    options={cities} placeholder="Select city" error={errs.city} />
                ) : (
                  <SInput value={d.city} onChange={(v) => upd({ city: v })}
                    placeholder="Enter city name" error={errs.city} />
                )}
              </div>
            )}

            {d.city && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Quarter / Quartier / Fencata
                </label>
                {quartiers.length > 0 ? (
                  <SSelect value={d.quartier} onChange={(v) => upd({ quartier: v })}
                    options={quartiers} placeholder="Select quarter (optional)" />
                ) : (
                  <SInput value={d.quartier} onChange={(v) => upd({ quartier: v })}
                    placeholder="e.g. Mvan, Biyem-Assi (optional)" />
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Specific Address
              </label>
              <SInput value={d.specificAddress} onChange={(v) => upd({ specificAddress: v })}
                placeholder="Street, building name, or landmark (optional)" />
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} />
          </div>
        )}

        {/* ════════ STEP 3: COMPENSATION ════════ */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Salary & Benefits</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Salary Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SALARY_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => upd({ salaryType: t })}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                                ${d.salaryType === t
                                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                                  : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Currency
              </label>
              <div className="flex gap-2">
                {CURRENCIES.map((c) => (
                  <button key={c} type="button" onClick={() => upd({ currency: c })}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all
                                ${d.currency === c
                                  ? "border-teal-500 bg-teal-500 text-white"
                                  : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Min Salary <span className="text-red-500">*</span>
                </label>
                <SInput type="number" value={d.salaryMin} onChange={(v) => upd({ salaryMin: v })}
                  placeholder="e.g. 80000" error={errs.salaryMin} min="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Max Salary
                </label>
                <SInput type="number" value={d.salaryMax} onChange={(v) => upd({ salaryMax: v })}
                  placeholder="e.g. 200000" min="0" />
              </div>
            </div>

            {/* Negotiable — big visible tick */}
            <BigCheck checked={d.isNegotiable} onChange={(v) => upd({ isNegotiable: v })}
              label="Salary is Negotiable"
              desc="Let candidates know the amount can be discussed" />

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Benefits & Perks
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BENEFITS_LIST.map((b) => {
                  const sel = d.benefits.includes(b);
                  return (
                    <button key={b} type="button"
                      onClick={() => upd({
                        benefits: sel ? d.benefits.filter((x) => x !== b) : [...d.benefits, b],
                      })}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-semibold
                                  text-left transition-all
                                  ${sel
                                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}>
                      {/* Visible tick */}
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                                       ${sel ? "border-teal-500 bg-teal-500" : "border-gray-300 dark:border-gray-500"}`}>
                        {sel && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
                               stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} />
          </div>
        )}

        {/* ════════ STEP 4: JOB DETAILS ════════ */}
        {step === 4 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-5">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Job Details</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Job Description <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">(100–500 words)</span>
              </label>
              <WCTextarea value={d.description} onChange={(v) => upd({ description: v })}
                placeholder="Describe the role, responsibilities, team environment, and why candidates should apply..."
                minW={100} maxW={500} rows={7} error={errs.description} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Key Responsibilities <span className="text-red-500">*</span>
              </label>
              <textarea rows={5}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800
                            text-gray-900 dark:text-white outline-none resize-none transition-colors
                            ${errs.responsibilities ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                              "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                placeholder={"• Design and build features\n• Collaborate with the team\n• (One per line)"}
                value={d.responsibilities}
                onChange={(e) => upd({ responsibilities: e.target.value })} />
              {errs.responsibilities && <p className="text-xs text-red-500 mt-1">⚠ {errs.responsibilities}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Requirements & Qualifications <span className="text-red-500">*</span>
              </label>
              <textarea rows={5}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800
                            text-gray-900 dark:text-white outline-none resize-none transition-colors
                            ${errs.requirements ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                              "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                placeholder={"• BSc in Computer Science\n• 2+ years experience in React\n• Must have..."}
                value={d.requirements}
                onChange={(e) => upd({ requirements: e.target.value })} />
              {errs.requirements && <p className="text-xs text-red-500 mt-1">⚠ {errs.requirements}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Required Skills
              </label>
              <SInput value={d.requiredSkills} onChange={(v) => upd({ requiredSkills: v })}
                placeholder="React, TypeScript, Node.js (comma-separated)" />
              <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Preferred Skills <span className="text-gray-400 font-normal">(Nice to have)</span>
              </label>
              <SInput value={d.preferredSkills} onChange={(v) => upd({ preferredSkills: v })}
                placeholder="Docker, AWS, GraphQL (comma-separated)" />
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next} />
          </div>
        )}

        {/* ════════ STEP 5: APPLICATION ════════ */}
        {step === 5 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-gray-900 dark:text-white">How Candidates Will Apply</h2>

              {/* Application method — big visible radio cards */}
              {([
                { key: "email",  icon: "✉️", label: "Application Email",  desc: "Candidates email their application" },
                { key: "phone",  icon: "📞", label: "By Phone",           desc: "Candidates call or WhatsApp you" },
                { key: "link",   icon: "🔗", label: "External Link",       desc: "Redirect to your own form" },
                { key: "onsite", icon: "🏢", label: "Onsite / Walk-in",    desc: "Candidates visit your office" },
              ] as const).map((m) => (
                <RadioCard key={m.key} selected={d.appMethod === m.key}
                  onClick={() => upd({ appMethod: m.key })}
                  icon={m.icon} label={m.label} desc={m.desc} />
              ))}

              {/* Conditional fields */}
              {d.appMethod === "email" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Application Email
                  </label>
                  <SInput type="email" value={d.appEmail} onChange={(v) => upd({ appEmail: v })}
                    placeholder="jobs@yourcompany.com" error={errs.appEmail} />
                </div>
              )}
              {d.appMethod === "phone" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="border-2 border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl
                                    px-3 py-3 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600">🇨🇲 +237</span>
                    <input type="tel"
                      className={`flex-1 border-2 rounded-r-xl px-4 py-3 text-sm bg-white dark:bg-gray-800
                                  text-gray-900 dark:text-white outline-none
                                  ${errs.appPhone ? "border-red-400" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                      placeholder="6XX XXX XXX"
                      value={d.appPhone}
                      onChange={(e) => upd({ appPhone: e.target.value.replace(/\D/g, "").slice(0, 9) })} />
                  </div>
                  {errs.appPhone && <p className="text-xs text-red-500 mt-1">⚠ {errs.appPhone}</p>}
                </div>
              )}
              {d.appMethod === "link" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Application Link <span className="text-red-500">*</span>
                  </label>
                  <SInput type="url" value={d.appLink} onChange={(v) => upd({ appLink: v })}
                    placeholder="https://yourcompany.com/apply" error={errs.appLink} />
                </div>
              )}
              {d.appMethod === "onsite" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Office / Location Description
                  </label>
                  <textarea rows={3}
                    className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3
                               text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:border-teal-500 outline-none resize-none"
                    placeholder="e.g. Carrefour Warda, 3rd floor Immeuble ABC, Yaoundé — Mon to Fri 8am–4pm"
                    value={d.onsiteInfo}
                    onChange={(e) => upd({ onsiteInfo: e.target.value })} />
                </div>
              )}

              {/* Deadline — optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Application Deadline <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <SInput type="date" value={d.appDeadline} onChange={(v) => upd({ appDeadline: v })} />
              </div>

              {/* Featured listing — big visible tick */}
              <BigCheck checked={d.isFeatured} onChange={(v) => upd({ isFeatured: v })}
                label="Featured Job Listing ⭐"
                desc="Appear at the top of search results — greater visibility" />
            </div>

            {/* Posting Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">📋 Posting Summary</h3>
              {[
                ["Job Title",   d.jobTitle],
                ["Company",     d.companyName],
                ["Type",        d.jobType],
                ["Category",    d.category],
                ["Location",    [d.quartier, d.city, d.region].filter(Boolean).join(", ")],
                ["Experience",  d.experience],
                ["Positions",   `${d.positions}`],
                ["Salary",      d.salaryMin ? `${d.currency} ${Number(d.salaryMin).toLocaleString()}${d.salaryMax ? ` – ${Number(d.salaryMax).toLocaleString()}` : ""} / ${d.salaryType}` : "Not specified"],
                ["Negotiable",  d.isNegotiable ? "Yes ✓" : "No"],
                ["Urgent",      d.isUrgent ? "Yes 🔥" : "No"],
                ["Featured",    d.isFeatured ? "Yes ⭐" : "No"],
                ["Apply via",   d.appMethod === "email" ? `Email: ${d.appEmail}` : d.appMethod === "phone" ? `Phone: +237${d.appPhone}` : d.appMethod === "link" ? "External Link" : "Onsite / Walk-in"],
              ].map(([label, value]) => (
                <SummaryRow key={label} label={label} value={value} />
              ))}
            </div>

            <NavRow onDraft={saveDraft} onBack={back}
              onNext={postJob}
              nextLabel={submitting ? "Posting..." : "🚀 Post Job →"}
              disabled={submitting} />
          </>
        )}
      </div>
    </div>
  );
}
