/**
 * src/pages/JobsCategory.tsx — FIXED
 * Bambeh Marketplace
 *
 * FIX: Replaced hardcoded "Sample Job" placeholders with real Supabase data.
 * Now calls getJobs({ category }) and renders actual job listings.
 */

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Loader2, BriefcaseIcon } from "lucide-react";
import { getJobs } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";

// Map URL slug → display label → DB category value
const CATEGORY_MAP: Record<string, { label: string; dbValue: string }> = {
  "technology":  { label: "Technology",  dbValue: "Technology" },
  "marketing":   { label: "Marketing",   dbValue: "Marketing" },
  "finance":     { label: "Finance",     dbValue: "Finance" },
  "engineering": { label: "Engineering", dbValue: "Engineering" },
  "education":   { label: "Education",   dbValue: "Education" },
  "agriculture": { label: "Agriculture", dbValue: "Agriculture" },
  "healthcare":  { label: "Healthcare",  dbValue: "Healthcare" },
  "logistics":   { label: "Logistics",   dbValue: "Logistics" },
  "sales":       { label: "Sales",       dbValue: "Sales" },
  "legal":       { label: "Legal",       dbValue: "Legal" },
  "other":       { label: "Other",       dbValue: "Other" },
};

function fmtSalary(min?: number, max?: number): string {
  if (!min && !max) return "Salary not specified";
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} XAF`;
  if (min) return `From ${fmt(min)} XAF`;
  return `Up to ${fmt(max!)} XAF`;
}

const JobsCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const slug = category ? decodeURIComponent(category).toLowerCase() : "";
  const meta = CATEGORY_MAP[slug];
  const label = meta?.label ?? (category ? decodeURIComponent(category).replace(/-/g, " ") : "All");
  const dbCategory = meta?.dbValue ?? label;

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await getJobs({ category: dbCategory, pageSize: 50 });
      if (cancelled) return;
      if (result.error) {
        setError("Could not load jobs. Check your connection.");
      } else {
        setJobs(result.data);
      }
      setLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [dbCategory]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link to="/jobs" className="hover:text-teal-600 transition-colors">
          Jobs
        </Link>
        <span>›</span>
        <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">{label}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
          {label} Jobs
        </h1>
        {!loading && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          </span>
        )}
      </div>

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
          <Link
            to="/jobs/post"
            className="inline-block mt-5 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            Post a Job
          </Link>
        </div>
      )}

      {/* Job cards */}
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100
                         dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-shadow
                         text-left active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                {/* Company initial / logo */}
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center
                                justify-center text-xl font-bold text-teal-600 shrink-0">
                  {job.company ? job.company.charAt(0).toUpperCase() : "💼"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white line-clamp-1">
                    {job.title}
                  </p>
                  {job.company && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    📍 {job.location.city}
                    {job.location.region ? ` · ${job.location.region}` : ""}
                    {job.isRemote && " · 🌐 Remote"}
                    {" · "}
                    {job.jobType.replace("_", "-")}
                  </p>
                  <p className="text-sm text-teal-600 dark:text-teal-400 font-medium mt-2">
                    💰 {fmtSalary(job.salaryMinXAF, job.salaryMaxXAF)}
                    {job.isSalaryNegotiable && (
                      <span className="text-gray-400 text-xs font-normal"> · Negotiable</span>
                    )}
                  </p>
                </div>
                <span className="text-teal-600 text-xs font-bold mt-1 shrink-0">Apply →</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsCategory;
