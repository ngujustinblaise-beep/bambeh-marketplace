/**
 * src/pages/JobsCategory.tsx
 * Bambeh Marketplace — Jobs Category Page (HARDENED)
 *
 * FIXES vs previous version:
 *  ✅ Uses hardened jobs.service (sanitized inputs, capped pageSize, friendlyError)
 *  ✅ Expiry warning shown on job cards that are closing soon
 *  ✅ Empty state includes link back to all jobs (not just post)
 *  ✅ Pagination: "Load More" button for categories with >50 jobs
 *  ✅ Share button on each card
 *  ✅ Salary formatting handles null/undefined safely
 */

import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Loader2, BriefcaseIcon, Share2 } from "lucide-react";
import { getJobs } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";

// ─── Category Map ─────────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, { label: string; dbValue: string; emoji: string }> = {
  technology:  { label: "Technology",  dbValue: "Technology",  emoji: "💻" },
  marketing:   { label: "Marketing",   dbValue: "Marketing",   emoji: "📣" },
  finance:     { label: "Finance",     dbValue: "Finance",     emoji: "💰" },
  engineering: { label: "Engineering", dbValue: "Engineering", emoji: "⚙️" },
  education:   { label: "Education",   dbValue: "Education",   emoji: "🎓" },
  agriculture: { label: "Agriculture", dbValue: "Agriculture", emoji: "🌾" },
  healthcare:  { label: "Healthcare",  dbValue: "Healthcare",  emoji: "🏥" },
  logistics:   { label: "Logistics",   dbValue: "Logistics",   emoji: "🚚" },
  sales:       { label: "Sales",       dbValue: "Sales",       emoji: "🤝" },
  legal:       { label: "Legal",       dbValue: "Legal",       emoji: "⚖️" },
  other:       { label: "Other",       dbValue: "Other",       emoji: "📋" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtSalary(min?: number, max?: number): string {
  if (!min && !max) return "Salary not specified";
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000     ? `${Math.round(n / 1_000)}k` : `${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} XAF`;
  if (min) return `From ${fmt(min)} XAF`;
  return `Up to ${fmt(max!)} XAF`;
}

function daysUntilDeadline(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time:  "Full-time",
  part_time:  "Part-time",
  contract:   "Contract",
  internship: "Internship",
  freelance:  "Freelance",
  temporary:  "Temporary",
};

// ─── Main Component ───────────────────────────────────────────────────────────
const JobsCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const slug       = category ? decodeURIComponent(category).toLowerCase() : "";
  const meta       = CATEGORY_MAP[slug];
  const label      = meta?.label  ?? (category ? decodeURIComponent(category).replace(/-/g, " ") : "All");
  const emoji      = meta?.emoji  ?? "💼";
  const dbCategory = meta?.dbValue ?? label;

  const [jobs,    setJobs]    = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 20;

  const load = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) { setLoading(true); setError(null); }
    else setLoadingMore(true);

    const result = await getJobs({ category: dbCategory, pageSize: PAGE_SIZE, page: pageNum });

    if (result.error) {
      setError(result.error);
    } else {
      setJobs((prev) => append ? [...prev, ...result.data] : result.data);
      setHasMore(result.hasNextPage);
    }

    if (pageNum === 1) setLoading(false);
    else setLoadingMore(false);
  }, [dbCategory]);

  useEffect(() => {
    setPage(1);
    void load(1);
  }, [load]);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    void load(next, true);
  }

  function handleShare(job: JobListing, e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/#/jobs/${job.id}`;
    if (navigator.share) {
      navigator.share({ title: job.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-sm text-teal-200">
          <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
          <span>›</span>
          <span className="text-white font-medium capitalize">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            {emoji}
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl capitalize">{label} Jobs</h1>
            {!loading && (
              <p className="text-teal-200 text-sm">
                {jobs.length}{hasMore ? "+" : ""} {jobs.length === 1 ? "opportunity" : "opportunities"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading {label} jobs…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => void load(1)}
              className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20">
            <BriefcaseIcon className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              No {label} jobs posted yet
            </p>
            <p className="text-sm text-gray-500 mt-1">Check back soon or post one yourself!</p>
            <div className="flex gap-3 justify-center mt-5">
              <Link
                to="/jobs"
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                All Jobs
              </Link>
              <Link
                to="/jobs/post"
                className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                Post a Job
              </Link>
            </div>
          </div>
        )}

        {/* Job cards */}
        {!loading && !error && jobs.map((job) => {
          const deadlineDays = job.applicationDeadline ? daysUntilDeadline(job.applicationDeadline) : null;
          const expiringSoon = deadlineDays !== null && deadlineDays <= 3 && deadlineDays >= 0;
          const expired      = deadlineDays !== null && deadlineDays < 0;
          const displayType  = JOB_TYPE_LABELS[job.jobType] ?? job.jobType;

          return (
            <button
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
                         dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-shadow
                         text-left active:scale-[0.99]"
            >
              {/* Expiry warning strip */}
              {(expiringSoon || expired) && (
                <div className={`-mx-4 -mt-4 mb-3 px-4 py-1.5 rounded-t-2xl text-xs font-semibold
                                 ${expired
                                   ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                   : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"}`}>
                  {expired
                    ? "⛔ Closed — Deadline passed"
                    : `⏰ Closing soon — ${deadlineDays === 0 ? "Today!" : `${deadlineDays}d left`}`}
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Company initial */}
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center
                                justify-center text-xl font-bold text-teal-600 flex-shrink-0">
                  {job.company ? job.company.charAt(0).toUpperCase() : "💼"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-800 dark:text-white line-clamp-1 text-sm">
                      {job.title}
                    </p>
                    <button
                      onClick={(e) => handleShare(job, e)}
                      aria-label="Share"
                      className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700
                                 flex items-center justify-center text-gray-400 active:scale-90"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {job.company && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    📍 {job.location.city}
                    {job.location.region ? ` · ${job.location.region}` : ""}
                    {job.isRemote && " · 🌐 Remote"}
                    {" · "}
                    <span className="text-teal-600 dark:text-teal-400 font-medium">{displayType}</span>
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">
                      💰 {fmtSalary(job.salaryMinXAF, job.salaryMaxXAF)}
                      {job.isSalaryNegotiable && (
                        <span className="text-gray-400 text-xs font-normal"> · Negotiable</span>
                      )}
                    </p>
                    <span className="text-xs text-gray-400">{timeAgo(job.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-teal-600 text-white text-xs font-bold py-2 rounded-xl text-center">
                View & Apply →
              </div>
            </button>
          );
        })}

        {/* Load More */}
        {!loading && !error && hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full py-3 rounded-2xl border-2 border-teal-200 dark:border-teal-800
                       text-teal-600 dark:text-teal-400 text-sm font-semibold
                       flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingMore
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
              : "Load More Jobs"}
          </button>
        )}

      </div>
    </div>
  );
};

export default JobsCategory;
