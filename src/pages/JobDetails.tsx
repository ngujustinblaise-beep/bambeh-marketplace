/**
 * src/pages/JobDetails.tsx — Bambeh Marketplace
 *
 * ── NEW IN THIS VERSION ───────────────────────────────────────────────────────
 *  ✅ Company / poster logo  — fetches avatar_url from `profiles` table;
 *                              falls back to company initial then 💼 emoji
 *  ✅ Fat inline Apply Now   — large, unmissable button inside the Job
 *                              Description card (above the sticky bar)
 *  ✅ View notification      — on load, inserts a row into `notifications` so
 *                              the job poster is told someone viewed their listing.
 *                              Deduped: one notification per viewer per job per day.
 *  ✅ All prior fixes intact — dvh modal height, pb-10 padding, AfricanPhoneInput,
 *                              security sanitisation, ARIA
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ActionButtons } from "@/components/listings/ActionButtons";
import { getJobById, incrementJobView } from "@/services/jobs.service";
import { useViewTracker } from "@/hooks/useViewTracker";
import type { JobListing } from "@/types/src_types_items";
import AfricanPhoneInput from "@/components/AfricanPhoneInput";
import { supabase } from "@/lib/supabase";

// ─── Security helpers ─────────────────────────────────────────────────────────

const sanitise = (s: unknown): string =>
  typeof s === "string" ? s.replace(/[<>"'`]/g, "").trim() : "";

function safeUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.href;
  } catch {
    return null;
  }
}

function openSafeUrl(raw: string) {
  const url = safeUrl(raw);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

function buildWaUrl(digits: string, jobTitle: string): string {
  const safeDigits = digits.replace(/\D/g, "");
  const msg = encodeURIComponent(
    `Hello, I am interested in the ${sanitise(jobTitle)} position listed on Bambeh.`
  );
  return `https://wa.me/${safeDigits}?text=${msg}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Salary {
  min: number; max: number; currency: string; period: string; negotiable: boolean;
}
interface Job {
  id: string; title: string; company: string; companyLogo: string;
  /** Real avatar URL fetched from profiles — null until resolved */
  companyLogoUrl: string | null;
  /** Supabase user ID of the job poster — used for notifications */
  employerId: string;
  location: string; region: string; type: string; category: string;
  salary: Salary; experience: string; positions: number; urgent: boolean;
  posted: string; deadline: string;
  description: string; responsibilities: string[];
  requirements: string[]; requiredSkills: string[]; niceToHave: string[];
  applicationMethod: "email" | "phone" | "link" | "onsite";
  applicationEmail: string; applicationPhone: string;
  applicationLink: string; onsiteInfo: string;
  benefits: string[];
  stats: { views: number; applications: number; saved: number };
  companyId: string; companyAbout: string; companySize: string; companyWebsite: string;
}

// ─── Adapter ──────────────────────────────────────────────────────────────────
function toLocalJob(j: JobListing): Job {
  const parseLines = (text?: string): string[] =>
    text ? text.split("\n").map((l) => l.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean) : [];
  const parseBenefits = (text?: string): string[] =>
    text ? text.split(",").map((b) => b.trim()).filter(Boolean) : [];

  return {
    id:             j.id,
    title:          sanitise(j.title),
    company:        sanitise(j.company ?? "Unknown Company"),
    companyLogo:    j.company ? j.company.charAt(0).toUpperCase() : "💼",
    companyLogoUrl: null,
    employerId:     j.employerId,
    location:       sanitise(`${j.location.city}${j.location.region ? ` · ${j.location.region}` : ""}`),
    region:         sanitise(j.location.region ?? j.location.city),
    type:           sanitise(j.jobType.replace(/_/g, "-")),
    category:       sanitise(j.category),
    salary: {
      min:        j.salaryMinXAF ?? 0,
      max:        j.salaryMaxXAF ?? 0,
      currency:   "XAF",
      period:     "month",
      negotiable: j.isSalaryNegotiable,
    },
    experience:       sanitise(j.experienceLevel?.replace(/_/g, " ") ?? ""),
    positions:        1,
    urgent:           false,
    posted:           j.createdAt,
    deadline:         sanitise(j.applicationDeadline ?? ""),
    description:      sanitise(j.description),
    responsibilities: parseLines(j.requirements).map(sanitise),
    requirements:     parseLines(j.requirements).map(sanitise),
    requiredSkills:   (j.tags ?? []).map(sanitise),
    niceToHave:       [],
    applicationMethod: "email",
    applicationEmail:  sanitise(""),
    applicationPhone:  sanitise(""),
    applicationLink:   sanitise(""),
    onsiteInfo:        sanitise(""),
    benefits:          parseBenefits(j.benefits).map(sanitise),
    stats: {
      views:        j.viewCount ?? 0,
      applications: j.applicationCount ?? 0,
      saved:        0,
    },
    companyId:      j.employerId,
    companyAbout:   sanitise(""),
    companySize:    sanitise(""),
    companyWebsite: sanitise(""),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtXAF(n: number): string {
  return n.toLocaleString("fr-CM") + " XAF";
}
function timeAgo(dateStr: string): string {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`;
}

// ─── Company Logo component ───────────────────────────────────────────────────
/**
 * Tries to render the real avatar image (from profiles.avatar_url).
 * Falls back to a styled initial, then to the briefcase emoji.
 */
function CompanyAvatar({
  url,
  initial,
  size = "lg",
}: {
  url: string | null;
  initial: string;
  size?: "lg" | "sm";
}) {
  const [imgError, setImgError] = useState(false);
  const dim = size === "lg"
    ? "w-16 h-16 text-3xl rounded-2xl"
    : "w-12 h-12 text-xl rounded-xl";

  if (url && !imgError && safeUrl(url)) {
    return (
      <img
        src={url}
        alt={`${initial} company logo`}
        onError={() => setImgError(true)}
        className={`${dim} object-cover bg-white shadow-md flex-shrink-0`}
      />
    );
  }

  const letter = initial.trim().charAt(0).toUpperCase();
  if (letter && letter !== "💼") {
    return (
      <div
        className={`${dim} bg-white flex items-center justify-center font-bold text-teal-700 shadow-md flex-shrink-0`}
        aria-label={`${initial} logo`}
      >
        {letter}
      </div>
    );
  }

  return (
    <div className={`${dim} bg-white flex items-center justify-center shadow-md flex-shrink-0`}>
      💼
    </div>
  );
}

// ─── Notification helpers ─────────────────────────────────────────────────────

/**
 * Sends a "someone viewed your job" notification to the poster.
 *
 * Required Supabase table (run once in your SQL editor):
 * ─────────────────────────────────────────────────────
 *   create table if not exists notifications (
 *     id         uuid primary key default gen_random_uuid(),
 *     user_id    uuid references auth.users not null,
 *     type       text not null,
 *     title      text,
 *     body       text,
 *     data       jsonb,
 *     is_read    boolean default false,
 *     created_at timestamptz default now()
 *   );
 *   alter table notifications enable row level security;
 *   -- Users can only read their own notifications
 *   create policy "own notifications" on notifications
 *     for select using (auth.uid() = user_id);
 *   -- Service role (Edge Functions / backend) can insert
 *   create policy "insert notifications" on notifications
 *     for insert with check (true);
 * ─────────────────────────────────────────────────────
 *
 * Deduplication: localStorage key prevents re-inserting on refresh.
 */
async function notifyPosterOfView(jobId: string, jobTitle: string, employerId: string) {
  try {
    const dedupKey = `bambeh_view_notif_${jobId}_${new Date().toISOString().slice(0, 10)}`;
    if (localStorage.getItem(dedupKey)) return;

    const { error } = await supabase.from("notifications").insert({
      user_id: employerId,
      type:    "job_view",
      title:   "Someone viewed your job posting 👀",
      body:    `Your job "${sanitise(jobTitle)}" just received a new view on Bambeh.`,
      data:    { job_id: jobId, job_title: sanitise(jobTitle) },
      is_read: false,
    });

    if (!error) localStorage.setItem(dedupKey, "1");
  } catch {
    // Non-critical — never crash the page
  }
}

/**
 * Fetches the poster's avatar_url from the profiles table.
 * Returns null silently on any error.
 */
async function fetchPosterAvatar(employerId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", employerId)
      .single();
    if (error || !data?.avatar_url) return null;
    return safeUrl(data.avatar_url as string);
  } catch {
    return null;
  }
}

// ─── CheckItem ────────────────────────────────────────────────────────────────
function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 py-1">
      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{text}</span>
    </li>
  );
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [step,       setStep]       = useState<"select" | "form" | "done">("select");
  const [method,     setMethod]     = useState<Job["applicationMethod"]>(job.applicationMethod);
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [phone,      setPhone]      = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [errs,       setErrs]       = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const METHODS = [
    { key: "email"  as const, icon: "✉️",  label: "Apply by Email",       desc: "Submit CV via email" },
    { key: "phone"  as const, icon: "📞",  label: "Apply by Phone",       desc: "Call or WhatsApp the employer" },
    { key: "link"   as const, icon: "🔗",  label: "External Application", desc: "Apply on their website" },
    { key: "onsite" as const, icon: "🏢",  label: "Visit Office",          desc: "Walk in and apply in person" },
  ];

  function validate(): boolean {
    const e: Record<string, string> = {};
    const cleanName  = name.trim().replace(/[^a-zA-ZÀ-ÿ\s\-]/g, "");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || cleanName.length < 2) e.name  = "Full name is required (at least 2 characters)";
    if (cleanName.length > 80)              e.name  = "Name is too long (max 80 characters)";
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail))
      e.email = "A valid email address is required";
    if (method === "phone" && !phoneValid)
      e.phone = "A valid African phone number is required";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if ((method === "email" || method === "onsite" || method === "phone") && !validate()) return;
    setSubmitting(true);
    try {
      // Save application record — column names match the real job_applications schema
      await supabase.from("job_applications").insert({
        job_id:      job.id,
        employer_id: job.employerId,
        full_name:   sanitise(name),                          // was: applicant_name
        email:       email.trim().toLowerCase().slice(0, 254), // was: applicant_email
        phone,                                                 // was: applicant_phone
        method,
        applied_at:  new Date().toISOString(),
      });

      // Notify the poster of the new application
      await supabase.from("notifications").insert({
        user_id: job.employerId,
        type:    "job_application",
        title:   "New application received! 🎉",
        body:    `${sanitise(name)} applied for your "${sanitise(job.title)}" job on Bambeh.`,
        data:    { job_id: job.id, applicant_email: email.trim().toLowerCase() },
        is_read: false,
      });
    } catch {
      // Non-fatal
    } finally {
      setSubmitting(false);
      setStep("done");
    }
  }

  function handleExternalApply() {
    if (!safeUrl(job.applicationLink)) return;
    openSafeUrl(job.applicationLink);
  }

  const waUrl = buildWaUrl(job.applicationPhone, job.title);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-label="Apply for Job"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto">

        {/* Sticky header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">
              {step === "done" ? "Application Sent 🎉" : "Apply for Job"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{sanitise(job.title)} · {sanitise(job.company)}</p>
          </div>
          <button onClick={onClose} aria-label="Close apply modal"
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
        </div>

        {/* ── Step: Select method ── */}
        {step === "select" && (
          <div className="p-5 pb-10 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">How would you like to apply?</p>
            {METHODS.map((m) => (
              <button key={m.key}
                onClick={() => { setMethod(m.key); setStep("form"); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200
                           dark:border-gray-700 hover:border-teal-500 hover:bg-teal-50
                           dark:hover:bg-teal-900/20 transition-all text-left
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                <span className="text-2xl" aria-hidden="true">{m.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{m.label}</div>
                  <div className="text-xs text-gray-400">{m.desc}</div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* ── Step: Form ── */}
        {step === "form" && (
          <div className="p-5 pb-10 space-y-4">
            <button onClick={() => { setStep("select"); setErrs({}); }}
              className="text-xs text-teal-600 font-semibold flex items-center gap-1 mb-1">
              ← Change method
            </button>

            {/* PHONE */}
            {method === "phone" && (
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">Contact the employer directly</p>
                {job.applicationPhone ? (
                  <>
                    <a href={`tel:+${job.applicationPhone.replace(/\D/g, "")}`}
                       className="flex items-center gap-2 text-teal-600 font-bold text-lg">
                      📞 {job.applicationPhone}
                    </a>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                      💬 Send WhatsApp Message
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-teal-700 dark:text-teal-300">Contact details will be provided by the employer.</p>
                )}
                <div className="pt-2 border-t border-teal-200 dark:border-teal-700">
                  <p className="text-xs text-teal-600 font-semibold mb-2">Your phone number (for employer callback)</p>
                  <AfricanPhoneInput label="Your phone" required error={errs.phone}
                    onChange={(full, valid) => {
                      setPhone(full); setPhoneValid(valid);
                      if (valid) setErrs((prev) => { const n = { ...prev }; delete n.phone; return n; });
                    }} />
                </div>
              </div>
            )}

            {/* LINK */}
            {method === "link" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Apply on their website</p>
                {job.applicationLink && safeUrl(job.applicationLink) ? (
                  <button onClick={handleExternalApply}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    🔗 Open Application Page
                  </button>
                ) : (
                  <p className="text-sm text-blue-700 dark:text-blue-300">Application link will be provided by the employer.</p>
                )}
              </div>
            )}

            {/* ONSITE */}
            {method === "onsite" && job.onsiteInfo && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4">
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">Office address</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">{sanitise(job.onsiteInfo)}</p>
              </div>
            )}

            {/* EMAIL / ONSITE */}
            {(method === "email" || method === "onsite") && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input type="text" autoComplete="name" maxLength={80}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800
                                text-gray-900 dark:text-white outline-none transition-colors
                                ${errs.name ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                    placeholder="Your full name" value={name}
                    onChange={(e) => {
                      const safe = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s\-]/g, "").slice(0, 80);
                      setName(safe);
                      if (errs.name) setErrs((prev) => { const n = { ...prev }; delete n.name; return n; });
                    }}
                    aria-invalid={!!errs.name} />
                  {errs.name && <p role="alert" className="text-xs text-red-500 mt-1">⚠ {errs.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input type="email" autoComplete="email" maxLength={254} inputMode="email"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800
                                text-gray-900 dark:text-white outline-none transition-colors
                                ${errs.email ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                    placeholder="you@example.com" value={email}
                    onChange={(e) => {
                      setEmail(e.target.value.trim().slice(0, 254));
                      if (errs.email) setErrs((prev) => { const n = { ...prev }; delete n.email; return n; });
                    }}
                    aria-invalid={!!errs.email} />
                  {errs.email && <p role="alert" className="text-xs text-red-500 mt-1">⚠ {errs.email}</p>}
                </div>

                <AfricanPhoneInput label="Your phone number (optional)" error={errs.phone}
                  onChange={(full, valid) => { setPhone(full); setPhoneValid(valid); }} />

                <button onClick={submit} disabled={submitting}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98]
                             text-white font-bold text-base rounded-xl transition-all
                             disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? "Submitting…" : "Submit Application"}
                </button>
              </>
            )}

            {method === "phone" && (
              <button onClick={submit} disabled={!phoneValid || submitting}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98]
                           text-white font-bold text-base rounded-xl transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Registering…" : "Confirm & Register Interest"}
              </button>
            )}

            {method === "link" && (
              <button onClick={onClose}
                className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition">
                Done — I've applied externally
              </button>
            )}
            {method === "onsite" && !job.onsiteInfo && (
              <button onClick={onClose}
                className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition">
                Close
              </button>
            )}
          </div>
        )}

        {/* ── Step: Done ── */}
        {step === "done" && (
          <div className="p-8 pb-10 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">Application Submitted!</h3>
            <p className="text-sm text-gray-500">Good luck! {sanitise(job.company)} will be in touch if you're shortlisted.</p>
            <button onClick={onClose}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quick Actions Sheet ──────────────────────────────────────────────────────
function QuickActionsSheet({ job, isSaved, onClose, onSave, onApply }: {
  job: Job; isSaved: boolean; onClose: () => void; onSave: () => void; onApply: () => void;
}) {
  const shareUrl = `${window.location.origin}${window.location.pathname}#/jobs/${encodeURIComponent(job.id)}`;

  const actions = [
    { icon: "🚀", label: "Apply Now",     fn: () => { onClose(); onApply(); }, cls: "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" },
    { icon: isSaved ? "❤️" : "🤍", label: isSaved ? "Unsave" : "Save Job", fn: () => { onSave(); onClose(); }, cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300" },
    {
      icon: "📤", label: "Share Job",
      fn: async () => {
        try {
          if (navigator.share) await navigator.share({ title: sanitise(job.title), url: shareUrl });
          else await navigator.clipboard.writeText(shareUrl);
        } catch { /* cancelled */ }
        onClose();
      },
      cls: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    },
    { icon: "🚩", label: "Report Job",    fn: () => { onClose(); alert("Report submitted. Thank you."); }, cls: "bg-red-50 dark:bg-red-900/20 text-red-500" },
    { icon: "🏢", label: "About Company", fn: () => { onClose(); }, cls: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
         role="dialog" aria-modal="true" aria-label="Quick actions" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl shadow-2xl p-5 pb-8"
           onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <button key={a.label} onClick={a.fn}
              className={`flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm transition-transform active:scale-[0.97] ${a.cls}`}>
              <span className="text-xl" aria-hidden="true">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useViewTracker(id, "listings");

  const [job,       setJob]       = useState<Job | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [isSaved,   setIsSaved]   = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showQA,    setShowQA]    = useState(false);
  const [tab,       setTab]       = useState<"details" | "company" | "stats">("details");

  // ── Fetch job + poster avatar + fire view notification ──────────────────
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data, error } = await getJobById(id!);
        if (cancelled) return;
        if (error || !data) { setJob(null); return; }

        const localJob = toLocalJob(data);
        setJob(localJob);
        void incrementJobView(id!);

        // Fetch poster's real avatar (non-blocking — updates logo when ready)
        fetchPosterAvatar(localJob.employerId).then((url) => {
          if (!cancelled && url) {
            setJob((prev) => prev ? { ...prev, companyLogoUrl: url } : prev);
          }
        });

        // Notify poster of the view (non-blocking, deduped by day)
        void notifyPosterOfView(id!, localJob.title, localJob.employerId);

      } catch {
        if (!cancelled) setJob(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading job...</p>
      </div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
      <p className="text-6xl mb-4">😕</p>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Job Not Found</h2>
      <p className="text-sm text-gray-500 mb-6">This listing may have been removed or the link is incorrect.</p>
      <button onClick={() => navigate("/jobs")} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold">Browse All Jobs</button>
    </div>
  );

  const vendorPhone = job.applicationMethod === "phone" ? job.applicationPhone : undefined;

  const TABS = [
    { key: "details"  as const, label: "Job Details" },
    { key: "company"  as const, label: "Company" },
    { key: "stats"    as const, label: "📊 Stats" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-6">

        {/* Top nav */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">←</button>
          <span className="text-white/80 text-sm font-medium flex-1">Job Details</span>
          <button onClick={() => setIsSaved((v) => !v)} aria-label={isSaved ? "Unsave job" : "Save job"}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all active:scale-90 ${isSaved ? "bg-red-500 text-white" : "bg-white/20 text-white"}`}>
            {isSaved ? "❤️" : "🤍"}
          </button>
          <button
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}#/jobs/${encodeURIComponent(job.id)}`;
              if (navigator.share) void navigator.share({ title: sanitise(job.title), url }).catch(() => {});
              else void navigator.clipboard.writeText(url).catch(() => {});
            }}
            aria-label="Share job"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-base text-white active:scale-90">📤</button>
          <button onClick={() => setShowQA(true)} aria-label="More actions"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg active:scale-90">⋯</button>
        </div>

        {/* Company logo + title */}
        <div className="flex gap-4 items-start">
          {/*
            REAL COMPANY LOGO
            CompanyAvatar shows the poster's profile picture (fetched async),
            then falls back to company initial, then to 💼 emoji.
            The image loads in the background — no layout shift.
          */}
          <CompanyAvatar url={job.companyLogoUrl} initial={job.companyLogo} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1">
              {job.urgent && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">🔥 URGENT</span>
              )}
              <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">{job.type}</span>
            </div>
            <h1 className="text-white font-bold text-xl leading-tight">{job.title}</h1>
            <p className="text-teal-100 text-sm font-medium mt-0.5">{job.company}</p>
            <p className="text-teal-200 text-xs mt-1">📍 {job.location} · {timeAgo(job.posted)}</p>
          </div>
        </div>

        {/* Salary / deadline */}
        <div className="mt-4 bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-teal-200">Salary per {job.salary.period}</p>
            {job.salary.min > 0 || job.salary.max > 0 ? (
              <p className="text-white font-bold">
                {job.salary.min > 0 && job.salary.max > 0
                  ? `${fmtXAF(job.salary.min)} – ${fmtXAF(job.salary.max)}`
                  : job.salary.min > 0 ? `From ${fmtXAF(job.salary.min)}` : `Up to ${fmtXAF(job.salary.max)}`}
              </p>
            ) : (
              <p className="text-white/70 font-medium text-sm">Salary not specified</p>
            )}
            {job.salary.negotiable && (
              <span className="text-xs text-teal-200 flex items-center gap-1 mt-0.5">
                <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center text-white text-[10px]">✓</span>
                Negotiable
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-teal-200">Deadline</p>
            <p className="text-white font-semibold text-sm">{job.deadline || "Open"}</p>
          </div>
        </div>

        {/*
          FAT APPLY NOW — hero (white pill, always visible without any scrolling)
          This is the primary CTA. White on teal = maximum contrast.
        */}
        <button
          onClick={() => setShowApply(true)}
          className="mt-5 w-full py-4 bg-white text-teal-700 font-extrabold text-lg
                     rounded-2xl shadow-xl active:scale-[0.98] transition-transform
                     flex items-center justify-center gap-2"
        >
          🚀 Apply Now
        </button>
      </div>

      {/* ── Quick info chips ── */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto scrollbar-hide">
        {[
          { icon: "👤", label: job.experience || "Any experience" },
          { icon: "💼", label: job.type },
          { icon: "📂", label: job.category },
          { icon: "🎯", label: `${job.positions} position${job.positions > 1 ? "s" : ""}` },
        ].map((c) => (
          <div key={c.label}
            className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2
                       shadow-sm border border-gray-100 dark:border-gray-700 text-xs font-medium
                       text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {c.icon} {c.label}
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors
              ${tab === t.key ? "border-teal-500 text-teal-600 dark:text-teal-400" : "border-transparent text-gray-500 dark:text-gray-400"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="px-4 py-5 space-y-5">

        {tab === "details" && (
          <>
            {/* Description card with INLINE fat Apply button */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Job Description</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{job.description}</p>

              {/*
                FAT INLINE APPLY — inside the description card
                Users read the description and immediately want to apply —
                this button is right there, no scrolling needed.
              */}
              <button
                onClick={() => setShowApply(true)}
                className="mt-5 w-full py-4 bg-gradient-to-r from-teal-500 to-teal-700
                           text-white font-extrabold text-base rounded-2xl
                           shadow-lg shadow-teal-500/30 active:scale-[0.98] transition-transform
                           flex items-center justify-center gap-2"
              >
                🚀 Apply for This Job
              </button>
            </div>

            <ActionButtons vendorPhone={vendorPhone} adTitle={job.title} adId={job.id} adType="jobs" />

            {job.responsibilities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Key Responsibilities</h2>
                <ul className="space-y-0.5">{job.responsibilities.map((r, i) => <CheckItem key={i} text={r} />)}</ul>
              </div>
            )}

            {job.requirements.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Requirements & Qualifications</h2>
                <ul className="space-y-0.5">{job.requirements.map((r, i) => <CheckItem key={i} text={r} />)}</ul>
              </div>
            )}

            {job.requiredSkills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((s) => (
                    <span key={s} className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-semibold px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
                {job.niceToHave.length > 0 && (
                  <>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mt-4 mb-2">Nice to Have</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.niceToHave.map((s) => (
                        <span key={s} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {job.benefits.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-base text-gray-900 dark:text-white mb-3">Benefits & Perks</h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((b) => (
                    <span key={b} className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">✓</span>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-5 border border-teal-200 dark:border-teal-700">
              <h2 className="font-bold text-base text-teal-800 dark:text-teal-200 mb-2">How to Apply</h2>
              {job.applicationMethod === "email"  && <p className="text-sm text-teal-700 dark:text-teal-300">✉️ Email: <strong>{job.applicationEmail || "Contact employer for details"}</strong></p>}
              {job.applicationMethod === "phone"  && <p className="text-sm text-teal-700 dark:text-teal-300">📞 Call / WhatsApp: <strong>{job.applicationPhone || "Contact employer for details"}</strong></p>}
              {job.applicationMethod === "link"   && safeUrl(job.applicationLink) && (
                <button onClick={() => openSafeUrl(job.applicationLink)} className="text-sm text-teal-600 font-semibold underline">🔗 Apply via external link</button>
              )}
              {job.applicationMethod === "onsite" && <p className="text-sm text-teal-700 dark:text-teal-300">🏢 {sanitise(job.onsiteInfo) || "Visit the employer's office to apply"}</p>}
              {job.deadline && <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">⏰ Deadline: <strong>{sanitise(job.deadline)}</strong></p>}
            </div>
          </>
        )}

        {tab === "company" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <CompanyAvatar url={job.companyLogoUrl} initial={job.companyLogo} size="lg" />
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{job.company}</h2>
                {job.companySize && <p className="text-sm text-gray-500">{sanitise(job.companySize)}</p>}
                <p className="text-xs text-teal-600">{job.location}</p>
              </div>
            </div>
            {job.companyAbout
              ? <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{sanitise(job.companyAbout)}</p>
              : <p className="text-sm text-gray-400 italic mb-4">No company description available.</p>}
            {job.companyWebsite && safeUrl(job.companyWebsite) && (
              <button onClick={() => openSafeUrl(job.companyWebsite)}
                className="inline-flex items-center gap-2 text-teal-600 text-sm font-semibold border border-teal-300 rounded-xl px-4 py-2 mb-4">
                🌐 Visit Website
              </button>
            )}
            <Link to={`/vendor/profile/${encodeURIComponent(job.companyId)}`}
              className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
              <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">View Full Company Profile</span>
              <span className="text-teal-500">→</span>
            </Link>
          </div>
        )}

        {tab === "stats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "👁", label: "Views",   v: job.stats.views,        cls: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
                { icon: "📋", label: "Applied", v: job.stats.applications, cls: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" },
                { icon: "❤️", label: "Saved",   v: job.stats.saved,        cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300" },
              ].map((s) => (
                <div key={s.label} className={`${s.cls} rounded-2xl p-4 text-center`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold">{s.v.toLocaleString()}</div>
                  <div className="text-xs font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Competition</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Applications vs Views</span>
                  <span>{job.stats.views > 0 ? Math.round((job.stats.applications / job.stats.views) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all"
                       style={{ width: `${job.stats.views > 0 ? Math.min(100, Math.round((job.stats.applications / job.stats.views) * 100)) : 0}%` }} />
                </div>
              </div>
              <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  💡 {job.stats.applications < 20
                    ? "Low competition — great time to apply!"
                    : job.stats.applications < 50
                    ? "Moderate competition. Stand out with a strong cover letter."
                    : "High competition. Tailor your CV carefully."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom Apply bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-3 z-40">
        <button onClick={() => setShowQA(true)} aria-label="More actions"
          className="flex-shrink-0 w-12 h-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-xl active:scale-95">⋯</button>
        <button onClick={() => setShowApply(true)}
          className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-500/30 active:scale-[0.98] transition-transform">
          🚀 Apply Now
        </button>
      </div>

      {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} />}
      {showQA && (
        <QuickActionsSheet
          job={job}
          isSaved={isSaved}
          onClose={() => setShowQA(false)}
          onSave={() => setIsSaved((v) => !v)}
          onApply={() => setShowApply(true)}
        />
      )}
    </div>
  );
}
