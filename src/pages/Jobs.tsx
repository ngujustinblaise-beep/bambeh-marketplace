/**
 * src/pages/Jobs.tsx
 * Bambeh Marketplace — Jobs listing page
 *
 * Changes vs old version:
 *  • Filter bar: category tabs + expanded panel (type, region)
 *  • "Most Recent" sort toggle button
 *  • Each card: ❤️ save, 📤 share, "Apply Now" button
 *  • Clicking card OR Apply Now navigates to /jobs/:id (no 404)
 */

import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─── Demo data ─────────────────────────────────────────────────────────────
const DEMO_JOBS = [
  {
    id: "1",
    title: "Software Engineer",
    company: "TechCorp Cameroon",
    logo: "🏢",
    location: "Yaoundé · Centre",
    region: "Centre",
    type: "Full-time",
    category: "Technology",
    salaryMin: 150000,
    salaryMax: 300000,
    currency: "XAF",
    experience: "2–4 years",
    posted: "2026-05-20",
    deadline: "2026-06-30",
    urgent: true,
    applicants: 28,
    skills: ["React", "TypeScript", "Node.js"],
  },
  {
    id: "2",
    title: "Marketing Manager",
    company: "Boost Africa Ltd",
    logo: "📣",
    location: "Douala · Littoral",
    region: "Littoral",
    type: "Full-time",
    category: "Marketing",
    salaryMin: 120000,
    salaryMax: 200000,
    currency: "XAF",
    experience: "3–5 years",
    posted: "2026-05-18",
    deadline: "2026-06-15",
    urgent: false,
    applicants: 19,
    skills: ["Digital Marketing", "Social Media", "SEO"],
  },
  {
    id: "3",
    title: "Accountant",
    company: "FinGroup Cameroun",
    logo: "💼",
    location: "Bafoussam · West",
    region: "West",
    type: "Part-time",
    category: "Finance",
    salaryMin: 80000,
    salaryMax: 120000,
    currency: "XAF",
    experience: "1–3 years",
    posted: "2026-05-22",
    deadline: "2026-06-10",
    urgent: true,
    applicants: 12,
    skills: ["QuickBooks", "Excel", "Tax"],
  },
  {
    id: "4",
    title: "Civil Engineer",
    company: "BuildRight CM",
    logo: "🏗️",
    location: "Yaoundé · Centre",
    region: "Centre",
    type: "Contract",
    category: "Engineering",
    salaryMin: 200000,
    salaryMax: 400000,
    currency: "XAF",
    experience: "5–10 years",
    posted: "2026-05-15",
    deadline: "2026-07-01",
    urgent: false,
    applicants: 35,
    skills: ["AutoCAD", "Structural Analysis"],
  },
  {
    id: "5",
    title: "Secondary School Teacher",
    company: "Bilingual Grammar School",
    logo: "📚",
    location: "Bamenda · North West",
    region: "North West",
    type: "Full-time",
    category: "Education",
    salaryMin: 60000,
    salaryMax: 100000,
    currency: "XAF",
    experience: "1–2 years",
    posted: "2026-05-23",
    deadline: "2026-06-20",
    urgent: false,
    applicants: 8,
    skills: ["Teaching", "French", "English"],
  },
  {
    id: "6",
    title: "Agricultural Extension Officer",
    company: "AgroFarm Cameroon",
    logo: "🌾",
    location: "Buea · South West",
    region: "South West",
    type: "Full-time",
    category: "Agriculture",
    salaryMin: 90000,
    salaryMax: 150000,
    currency: "XAF",
    experience: "2–4 years",
    posted: "2026-05-21",
    deadline: "2026-06-25",
    urgent: false,
    applicants: 6,
    skills: ["Agronomy", "Field Research"],
  },
];

type Job = typeof DEMO_JOBS[number];

const CATEGORIES = [
  "All", "Technology", "Marketing", "Finance",
  "Engineering", "Education", "Agriculture",
  "Healthcare", "Logistics", "Sales", "Legal", "Other",
];

const JOB_TYPES = [
  "All Types", "Full-time", "Part-time", "Contract",
  "Internship", "Remote", "Freelance", "Temporary",
];

const REGIONS = [
  "All Regions", "Centre", "Littoral", "West", "South West",
  "North West", "Adamawa", "South", "East", "North", "Far North",
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

function fmtSalary(min: number, max: number, currency: string): string {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000     ? `${Math.round(n / 1_000)}k`      : `${n}`;
  return `${fmt(min)} – ${fmt(max)} ${currency}`;
}

// ─── Job Card ──────────────────────────────────────────────────────────────
function JobCard({
  job,
  saved,
  onSave,
  onShare,
}: {
  job: Job;
  saved: boolean;
  onSave: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100
                 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow active:scale-[0.99]"
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center
                          justify-center text-2xl flex-shrink-0">
            {job.logo}
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges + action icons row */}
            <div className="flex items-center gap-1 mb-1">
              {job.urgent && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  🔥 URGENT
                </span>
              )}
              <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300
                               text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {job.type}
              </span>
              {/* Save + Share pushed to far right */}
              <div className="ml-auto flex gap-1">
                <button
                  onClick={onSave}
                  aria-label={saved ? "Unsave job" : "Save job"}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm
                              transition-all active:scale-90
                              ${saved
                                ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                >
                  {saved ? "❤️" : "🤍"}
                </button>
                <button
                  onClick={onShare}
                  aria-label="Share job"
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center
                             justify-center text-sm text-gray-400 active:scale-90"
                >
                  📤
                </button>
              </div>
            </div>

            <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{job.company}</p>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span>📍 {job.location}</span>
              <span>👤 {job.experience}</span>
              <span>🕐 {timeAgo(job.posted)}</span>
            </div>

            {/* Salary */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">
                {fmtSalary(job.salaryMin, job.salaryMax, job.currency)}
                <span className="font-normal text-gray-400 text-[11px]"> /mo</span>
              </span>
              <span className="text-[11px] text-gray-400">{job.applicants} applied</span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {job.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                             text-[11px] px-2 py-0.5 rounded-lg"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Now button — full width at bottom */}
      <div className="px-4 pb-4">
        <div className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-teal-700 text-white
                        text-sm font-bold rounded-xl text-center">
          🚀 Apply Now
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function Jobs() {
  const navigate = useNavigate();

  // Filter state
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("All");
  const [jobType, setJobType]         = useState("All Types");
  const [region, setRegion]           = useState("All Regions");
  const [mostRecent, setMostRecent]   = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Saved set (persisted only for this session; wire to Supabase for real saves)
  const [saved, setSaved] = useState<Set<string>>(new Set());

  // Derived list
  const filtered = useMemo(() => {
    let list = DEMO_JOBS.filter((j) => {
      if (
        search &&
        !j.title.toLowerCase().includes(search.toLowerCase()) &&
        !j.company.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (category !== "All" && j.category !== category) return false;
      if (jobType !== "All Types" && j.type !== jobType) return false;
      if (region !== "All Regions" && !j.region.includes(region)) return false;
      return true;
    });
    if (mostRecent) {
      list = [...list].sort(
        (a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime()
      );
    }
    return list;
  }, [search, category, jobType, region, mostRecent]);

  const activeFilterCount = [
    category !== "All",
    jobType !== "All Types",
    region !== "All Regions",
  ].filter(Boolean).length;

  function handleSave(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleShare(job: Job, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#/jobs/${job.id}`;
    if (navigator.share) {
      navigator.share({ title: job.title, text: `${job.title} at ${job.company}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">

      {/* ── Hero / Search ── */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-7">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-2xl">Find Jobs 💼</h1>
          <Link
            to="/jobs/post"
            className="bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl"
          >
            + Post Job
          </Link>
        </div>
        <p className="text-teal-100 text-sm mb-4">{DEMO_JOBS.length} opportunities across Cameroon</p>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/95 text-gray-900
                       text-sm placeholder-gray-400 outline-none shadow"
            placeholder="Search jobs or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
                      px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border-2
                      text-xs font-semibold transition-all
                      ${showFilters || activeFilterCount > 0
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700"
                        : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400"}`}
        >
          🎛 Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Most Recent */}
        <button
          onClick={() => setMostRecent((v) => !v)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border-2
                      text-xs font-semibold transition-all
                      ${mostRecent
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400"}`}
        >
          🕐 Most Recent
        </button>

        {/* Category pills */}
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                        ${category === c
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Expanded filter panel ── */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5
                           text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5
                           text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setCategory("All"); setJobType("All Types"); setRegion("All Regions");
              }}
              className="mt-3 text-xs text-red-500 font-semibold"
            >
              ✕ Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Results bar ── */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> jobs found
          {mostRecent && <span className="text-teal-600"> · newest first</span>}
        </p>
      </div>

      {/* ── Job cards ── */}
      <div className="px-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">No jobs match your search</p>
            <button
              onClick={() => {
                setSearch(""); setCategory("All");
                setJobType("All Types"); setRegion("All Regions");
              }}
              className="mt-3 text-sm text-teal-600 font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={saved.has(job.id)}
              onSave={(e) => handleSave(job.id, e)}
              onShare={(e) => handleShare(job, e)}
            />
          ))
        )}
      </div>
    </div>
  );
}
