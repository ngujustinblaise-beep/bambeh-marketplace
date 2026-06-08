/**
 * src/pages/Jobs.tsx — Bambeh Marketplace
 *
 * FIXES APPLIED:
 *  ✅ Removed ALL hardcoded DEMO_JOBS — reads real data from Supabase
 *  ✅ Uses jobs.service.ts (getJobs) which queries the "job_listings" table
 *  ✅ Realtime subscription — new jobs posted appear instantly on all phones
 *  ✅ Proper loading, error, and empty states
 *  ✅ Saved jobs persist to localStorage (same pattern as Marketplace favorites)
 *  ✅ All filters (search, category, type, region, location) still work
 *  ✅ LocationFilter component preserved exactly as before
 *  ✅ JobCard UI preserved exactly — zero visual changes
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, BriefcaseIcon, Eye } from "lucide-react";
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from "@/components/filters/LocationFilter";
import { getJobs } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";
import { supabase } from "@/lib/supabase";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip"; // ✅ FEATURED ADS
import { useLang, t } from "@/hooks/useAppLang";

// ─── Constants ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All", "Technology", "Marketing", "Finance",
  "Engineering", "Education", "Agriculture",
  "Healthcare", "Logistics", "Sales", "Legal", "Other",
];

const JOB_TYPES = [
  "All Types", "Full-time", "Part-time", "Contract",
  "Internship", "Remote", "Freelance", "Temporary",
];

// Map the DB job_type values to the display labels used in filters
const JOB_TYPE_MAP: Record<string, string> = {
  full_time:  "Full-time",
  part_time:  "Part-time",
  contract:   "Contract",
  internship: "Internship",
  freelance:  "Freelance",
};

const REGIONS = [
  "All Regions", "Centre", "Littoral", "West", "South West",
  "North West", "Adamawa", "South", "East", "North", "Far North",
];

const SAVED_KEY = "bambeh_saved_jobs";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const lang = useLang();
  const isRtl = lang === "ar";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

function fmtSalary(min?: number, max?: number): string {
  if (!min && !max) return "Salary not specified";
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000     ? `${Math.round(n / 1_000)}k` : `${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} XAF`;
  if (min) return `From ${fmt(min)} XAF`;
  return `Up to ${fmt(max!)} XAF`;
}

function readSaved(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") as string[]);
  } catch {
    return new Set();
  }
}

function persistSaved(saved: Set<string>) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
  } catch { /* non-critical */ }
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
// Kept exactly the same visual design as before
function JobCard({
  job,
  saved,
  onSave,
  onShare,
}: {
  job: JobListing;
  saved: boolean;
  onSave: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}) {
  const displayType = JOB_TYPE_MAP[job.jobType] ?? job.jobType;

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100
                 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow active:scale-[0.99]"
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Company logo / initial */}
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center
                          justify-center text-2xl flex-shrink-0 font-bold text-teal-600">
            {job.company ? job.company.charAt(0).toUpperCase() : "💼"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1 flex-wrap">
              <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300
                               text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {displayType}
              </span>
              {job.isRemote && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  🌐 Remote
                </span>
              )}
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
                             justify-center text-gray-400 text-sm active:scale-90"
                >
                  📤
                </button>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">
              {job.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{job.company}</p>
          </div>
        </div>

        {/* Location + experience */}
        <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-gray-500 dark:text-gray-400">
          <span>📍 {job.location.city}{job.location.region ? ` · ${job.location.region}` : ""}</span>
          {job.experienceLevel && (
            <span>🎓 {job.experienceLevel.replace("_", " ")}</span>
          )}
          <span className="ml-auto">{timeAgo(job.createdAt)}</span>
        </div>

        {/* Salary */}
        <div className="mt-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
          💰 {fmtSalary(job.salaryMinXAF, job.salaryMaxXAF)}
          {job.isSalaryNegotiable && (
            <span className="text-gray-400 font-normal"> · Negotiable</span>
          )}
        </div>

        {/* Deadline */}
        {job.applicationDeadline && (
          <div className="mt-1 text-[11px] text-orange-500 dark:text-orange-400">
            ⏰ Deadline: {new Date(job.applicationDeadline).toLocaleDateString("en-CM")}
          </div>
        )}

        {/* Skills / tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                           text-[10px] px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Apply button */}
        <div className="mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold
                        py-2 rounded-xl text-center transition-colors">
          🚀 Apply Now
        </div>

        {/* ✅ View count */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
          <Eye className="w-3 h-3" />
          {(job as any).view_count ?? 0} views
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Jobs() {
  const navigate = useNavigate();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [jobs,    setJobs]    = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Filter state (preserved exactly from before) ─────────────────────────
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("All");
  const [jobType,     setJobType]     = useState("All Types");
  const [region,      setRegion]      = useState("All Regions");
  const [mostRecent,  setMostRecent]  = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [saved,       setSaved]       = useState<Set<string>>(readSaved);
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  // ── Fetch from Supabase via jobs.service ──────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getJobs({ pageSize: 80 });
      if (result.error) {
        setError("Could not load jobs. Please check your connection.");
        setJobs([]);
      } else {
        setJobs(result.data);
      }
    } catch {
      setError("Unexpected error loading jobs.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── On mount: fetch + Realtime subscription ──────────────────────────────
  useEffect(() => {
    void fetchJobs();

    // New job posted on any phone → appears here instantly
    const channel = supabase
      .channel("jobs_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "job_listings" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row.status !== "active") return;
          // Map the raw DB row to a JobListing shape
          const newJob: JobListing = {
            id:                 row.id as string,
            employerId:         row.employer_id as string,
            title:              row.title as string,
            company:            row.company as string | undefined,
            description:        row.description as string,
            category:           row.category as string,
            jobType:            row.job_type as JobListing["jobType"],
            experienceLevel:    row.experience_level as JobListing["experienceLevel"],
            salaryMinXAF:       row.salary_min_xaf as number | undefined,
            salaryMaxXAF:       row.salary_max_xaf as number | undefined,
            isSalaryNegotiable: Boolean(row.is_salary_negotiable),
            location: {
              city:    row.city as string,
              region:  row.region as string,
              country: (row.country as string) ?? "",
            },
            isRemote:            Boolean(row.is_remote),
            applicationDeadline: row.application_deadline as string | undefined,
            status:              row.status as JobListing["status"],
            viewCount:           0,
            applicationCount:    0,
            tags:                (row.tags as string[]) ?? [],
            createdAt:           row.created_at as string,
            updatedAt:           row.created_at as string,
          };
          setJobs((prev) => [newJob, ...prev]);
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [fetchJobs]);

  // ── Persist saved jobs ───────────────────────────────────────────────────
  useEffect(() => {
    persistSaved(saved);
  }, [saved]);

  // ── Client-side filtering (same logic as before) ─────────────────────────
  const filtered = useMemo(() => {
    let list = jobs.filter((j) => {
      const displayType = JOB_TYPE_MAP[j.jobType] ?? j.jobType;
      const loc = `${j.location.city} ${j.location.region ?? ""}`.toLowerCase();

      if (search &&
          !j.title.toLowerCase().includes(search.toLowerCase()) &&
          !( j.company?.toLowerCase().includes(search.toLowerCase()) ?? false)
      ) return false;

      if (category !== "All" && j.category !== category) return false;
      if (jobType !== "All Types" && displayType !== jobType) return false;
      if (region !== "All Regions" && !loc.includes(region.toLowerCase())) return false;

      // Location filter (fine-grained)
      if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
      if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
      if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
      if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;

      return true;
    });

    if (mostRecent) {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [jobs, search, category, jobType, region, mostRecent, locationFilters]);

  const activeFilterCount = [
    category !== "All",
    jobType  !== "All Types",
    region   !== "All Regions",
  ].filter(Boolean).length;

  // ── Actions ──────────────────────────────────────────────────────────────
  function handleSave(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleShare(job: JobListing, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/#/jobs/${job.id}`;
    if (navigator.share) {
      navigator.share({ title: job.title, text: `${job.title} at ${job.company ?? ""}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">

      {/* ── Hero ── */}
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
        <p className="text-teal-100 text-sm mb-4">
          {loading ? "Loading opportunities…" : `${jobs.length} opportunit${jobs.length !== 1 ? "ies" : "y"} across Cameroon`}
        </p>
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

      {/* ── Expanded filters ── */}
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
              onClick={() => { setCategory("All"); setJobType("All Types"); setRegion("All Regions"); }}
              className="mt-3 text-xs text-red-500 font-semibold"
            >
              ✕ Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Location filter (preserved from original) ── */}
      <div className="px-4 pt-4">
        <LocationFilter onFilterChange={setLocationFilters} />
      </div>

      {/* ✅ FEATURED ADS STRIP — jobs category only */}
      <div className="px-4 pb-2">
        <FeaturedAdsStrip category="jobs" showHeader={false} maxVisible={20} />
      </div>

      {/* ── Results count ── */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> jobs found
          {mostRecent && <span className="text-teal-600"> · newest first</span>}
        </p>
        {!loading && (
          <button
            onClick={() => void fetchJobs()}
            className="text-xs text-teal-600 font-semibold"
          >
            ↻ Refresh
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-4 space-y-3">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading jobs from Bambeh…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => void fetchJobs()}
              className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No jobs at all in DB */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20">
            <BriefcaseIcon className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">No jobs posted yet</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to post a job opportunity!</p>
            <Link
              to="/jobs/post"
              className="inline-block mt-5 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              Post a Job
            </Link>
          </div>
        )}

        {/* No results for current filters */}
        {!loading && !error && jobs.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">
              No jobs match your filters
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setJobType("All Types");
                setRegion("All Regions");
                setLocationFilters(EMPTY_LOCATION);
              }}
              className="mt-3 text-sm text-teal-600 font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Job cards */}
        {!loading && !error && filtered.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            saved={saved.has(job.id)}
            onSave={(e) => handleSave(job.id, e)}
            onShare={(e) => handleShare(job, e)}
          />
        ))}
      </div>
    </div>
  );
}
