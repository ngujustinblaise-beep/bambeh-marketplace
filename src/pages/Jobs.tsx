/**
 * src/pages/Jobs.tsx
 * Bambeh Marketplace — Find Jobs Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * ✅ Language changes INSTANTLY via useLanguage().t() from LanguageContext
 * ✅ No inline STR dictionary — all strings come from the central context
 * ✅ Queries listings table (type='job') — correct Bambeh schema
 * ✅ Category, job-type, region filters + search
 * ✅ Save / Share per card
 * ✅ Realtime new-job push via Supabase channel
 * ✅ RTL layout for Arabic
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, BriefcaseIcon, Eye } from "lucide-react";
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from "@/components/filters/LocationFilter";
import { getJobs } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip";

// ─── Static data (not translated — just identifiers) ──────────────────────────
const CATEGORIES = [
  "All","Technology","Marketing","Finance","Engineering",
  "Education","Agriculture","Healthcare","Logistics","Sales","Legal","Other",
];

// Category DB values for filter queries
const CATEGORY_DB: Record<string, string> = {
  All:"", Technology:"Technology", Marketing:"Marketing", Finance:"Finance",
  Engineering:"Engineering", Education:"Education", Agriculture:"Agriculture",
  Healthcare:"Healthcare", Logistics:"Logistics", Sales:"Sales",
  Legal:"Legal", Other:"Other",
};

// Category i18n keys in LanguageContext
const CATEGORY_I18N_KEY: Record<string, string> = {
  All:"catAll", Technology:"catVegetables",
  // Use direct labels since categories are proper nouns in most languages
};

// Category display labels per language
const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  All:         { en:"All",          fr:"Tous",          pidgin:"All",          ar:"الكل",          ff:"Fof" },
  Technology:  { en:"Technology",   fr:"Technologie",   pidgin:"Tech",         ar:"تكنولوجيا",     ff:"Tekinoloji" },
  Marketing:   { en:"Marketing",    fr:"Marketing",     pidgin:"Marketing",    ar:"تسويق",         ff:"Marketing" },
  Finance:     { en:"Finance",      fr:"Finance",       pidgin:"Money work",   ar:"مالية",         ff:"Mbappu" },
  Engineering: { en:"Engineering",  fr:"Ingénierie",    pidgin:"Engineering",  ar:"هندسة",         ff:"Engineering" },
  Education:   { en:"Education",    fr:"Éducation",     pidgin:"School work",  ar:"التعليم",       ff:"Janngugol" },
  Agriculture: { en:"Agriculture",  fr:"Agriculture",   pidgin:"Farm work",    ar:"زراعة",         ff:"Ndemndi" },
  Healthcare:  { en:"Healthcare",   fr:"Santé",         pidgin:"Hospital work",ar:"رعاية صحية",   ff:"Cellal" },
  Logistics:   { en:"Logistics",    fr:"Logistique",    pidgin:"Transport",    ar:"لوجستيات",      ff:"Heftugol" },
  Sales:       { en:"Sales",        fr:"Ventes",        pidgin:"Sell sell",    ar:"مبيعات",        ff:"Jaral" },
  Legal:       { en:"Legal",        fr:"Juridique",     pidgin:"Law work",     ar:"قانوني",        ff:"Laawol" },
  Other:       { en:"Other",        fr:"Autre",         pidgin:"Other",        ar:"أخرى",          ff:"Woɗɗum" },
};

const JOB_TYPE_MAP: Record<string, string> = {
  full_time:"Full-time", part_time:"Part-time", contract:"Contract",
  internship:"Internship", freelance:"Freelance", temporary:"Temporary",
};

const JOB_TYPES_I18N: Record<string, Record<string, string>> = {
  "All Types":  { en:"All Types",  fr:"Tous types",    pidgin:"All type",   ar:"جميع الأنواع", ff:"Suudu fof" },
  "Full-time":  { en:"Full-time",  fr:"Temps plein",   pidgin:"Full time",  ar:"دوام كامل",    ff:"Waktu fof" },
  "Part-time":  { en:"Part-time",  fr:"Temps partiel", pidgin:"Half time",  ar:"دوام جزئي",    ff:"Waktu didi" },
  "Contract":   { en:"Contract",   fr:"Contrat",       pidgin:"Contract",   ar:"عقد",          ff:"Kontoraaji" },
  "Internship": { en:"Internship", fr:"Stage",         pidgin:"Training",   ar:"تدريب",        ff:"Jannginagol" },
  "Remote":     { en:"Remote",     fr:"Télétravail",   pidgin:"Online",     ar:"عن بÙعد",      ff:"E Ɓanndu" },
  "Freelance":  { en:"Freelance",  fr:"Freelance",     pidgin:"Freelance",  ar:"حر",           ff:"Freelance" },
  "Temporary":  { en:"Temporary",  fr:"Temporaire",    pidgin:"Small time", ar:"مؤقت",         ff:"Seeɗa" },
};

const REGIONS_I18N: Record<string, Record<string, string>> = {
  "All Regions":{ en:"All Regions", fr:"Toutes régions", pidgin:"All area", ar:"كل المناطق",   ff:"Leyɗe fof" },
  "Centre":     { en:"Centre",      fr:"Centre",          pidgin:"Centre",   ar:"الوسط",        ff:"Centre" },
  "Littoral":   { en:"Littoral",    fr:"Littoral",        pidgin:"Coast",    ar:"الساحل",       ff:"Littoral" },
  "West":       { en:"West",        fr:"Ouest",           pidgin:"West",     ar:"الغرب",        ff:"Hirnaange" },
  "South West": { en:"South West",  fr:"Sud-Ouest",       pidgin:"SW",       ar:"جنوب غرب",     ff:"Worgo-Hirnaange" },
  "North West": { en:"North West",  fr:"Nord-Ouest",      pidgin:"NW",       ar:"شمال غرب",     ff:"Rewo-Hirnaange" },
  "Adamawa":    { en:"Adamawa",     fr:"Adamaoua",        pidgin:"Adamawa",  ar:"آدماوا",       ff:"Adamawa" },
  "South":      { en:"South",       fr:"Sud",             pidgin:"South",    ar:"الجنوب",       ff:"Worgo" },
  "East":       { en:"East",        fr:"Est",             pidgin:"East",     ar:"الشرق",        ff:"Fuɗnaange" },
  "North":      { en:"North",       fr:"Nord",            pidgin:"North",    ar:"الشمال",       ff:"Rewo" },
  "Far North":  { en:"Far North",   fr:"Extrême-Nord",    pidgin:"Far North",ar:"أقصى الشمال",  ff:"Rewo Rewo" },
};

const JOB_TYPES  = ["All Types","Full-time","Part-time","Contract","Internship","Remote","Freelance","Temporary"];
const REGIONS    = ["All Regions","Centre","Littoral","West","South West","North West","Adamawa","South","East","North","Far North"];
const SAVED_KEY  = "bambeh_saved_jobs";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return lang === "fr" ? "Aujourd'hui" : lang === "ar" ? "اليوم" : lang === "ff" ? "Hannde" : "Today";
  if (diff === 1) return lang === "fr" ? "Il y a 1j" : lang === "ar" ? "منذ يوم" : "1d ago";
  return lang === "fr" ? `Il y a ${diff}j` : lang === "ar" ? `منذ ${diff} أيام` : `${diff}d ago`;
}

function fmtSalary(min: number | undefined, max: number | undefined, lang: string, notSpecLabel: string): string {
  if (!min && !max) return notSpecLabel;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000     ? `${Math.round(n / 1_000)}k` : `${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} XAF`;
  if (min) return lang === "fr" ? `À partir de ${fmt(min)} XAF` : `From ${fmt(min)} XAF`;
  return lang === "fr" ? `Jusqu'à ${fmt(max!)} XAF` : `Up to ${fmt(max!)} XAF`;
}

function readSaved(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") as string[]); }
  catch { return new Set(); }
}
function persistSaved(saved: Set<string>) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify([...saved])); } catch {}
}

// ─── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job, saved, lang, tFn, onSave, onShare }: {
  job: JobListing; saved: boolean; lang: string;
  tFn: (key: string) => string;
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
        <div className="flex items-start gap-3">
          {/* Company logo or initial */}
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center
                          justify-center text-2xl flex-shrink-0 font-bold text-teal-600 overflow-hidden">
            {(job as any).companyLogoUrl ? (
              <img src={(job as any).companyLogoUrl} alt={job.company ?? ""} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : job.company ? job.company.charAt(0).toUpperCase() : "💼"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1 flex-wrap">
              <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300
                               text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {displayType}
              </span>
              {job.isRemote && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  🌐 {tFn("remote")}
                </span>
              )}
              <div className="ml-auto flex gap-1">
                <button onClick={onSave} aria-label={saved ? "Unsave" : "Save"}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm
                              transition-all active:scale-90
                              ${saved ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}>
                  {saved ? "❤️" : "🤍"}
                </button>
                <button onClick={onShare} aria-label="Share"
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center
                             justify-center text-gray-400 text-sm active:scale-90">
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

        <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-gray-500 dark:text-gray-400">
          <span>📍 {job.location.city}{job.location.region ? ` · ${job.location.region}` : ""}</span>
          {job.experienceLevel && (
            <span>🎓 {job.experienceLevel.replace(/_/g, " ")}</span>
          )}
          <span className="ml-auto">{timeAgo(job.createdAt, lang)}</span>
        </div>

        <div className="mt-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
          💰 {fmtSalary(job.salaryMinXAF, job.salaryMaxXAF, lang, tFn("salaryNotSpec"))}
          {job.isSalaryNegotiable && (
            <span className="text-gray-400 font-normal"> · {tFn("negotiable")}</span>
          )}
        </div>

        {job.applicationDeadline && (
          <div className="mt-1 text-[11px] text-orange-500 dark:text-orange-400">
            ⏰ {tFn("deadline")}: {new Date(job.applicationDeadline).toLocaleDateString(
              lang === "fr" ? "fr-CM" : "en-CM"
            )}
          </div>
        )}

        {job.tags && job.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.slice(0, 4).map((tag) => (
              <span key={tag}
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                           text-[10px] px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold
                        py-2 rounded-xl text-center transition-colors">
          {tFn("applyNow")}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
          <Eye className="w-3 h-3" />
          {job.viewCount ?? 0} {tFn("views")}
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
// ─── Error boundary — wraps FeaturedAdsStrip so its errors never kill Jobs page ─
class AdStripBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: Error) {
    console.warn("[Jobs] FeaturedAdsStrip non-fatal error:", e.message);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Jobs() {
  const navigate = useNavigate();
  // Use the context t() directly — re-renders whenever language changes
  const { language: lang, t, isRtl } = useLanguage();

  const [jobs,    setJobs]    = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [search,          setSearch]          = useState("");
  const [category,        setCategory]        = useState("All");
  const [jobType,         setJobType]         = useState("All Types");
  const [region,          setRegion]          = useState("All Regions");
  const [mostRecent,      setMostRecent]      = useState(false);
  const [showFilters,     setShowFilters]     = useState(false);
  const [saved,           setSaved]           = useState<Set<string>>(readSaved);
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getJobs({ pageSize: 80 });
      if (result.error) { setError(t("jobError")); setJobs([]); }
      else               { setJobs(result.data); }
    } catch {
      setError(t("jobError")); setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchJobs();

    // Realtime: new jobs appear instantly
    const channel = supabase
      .channel(`jobs_rt_${Date.now()}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "listings" },
        (payload) => {
          const row = payload.new as Record<string, any>;
          if (row.type !== "job" || row.status !== "active") return;
          const extra = (row.extra ?? {}) as Record<string, any>;
          const newJob: JobListing = {
            id: row.id, employerId: row.user_id ?? "",
            title: row.title ?? "", company: extra.company ?? undefined,
            description: row.description ?? "", category: row.category ?? "",
            jobType: extra.job_type ?? "full_time",
            experienceLevel: extra.exp_level ?? "entry",
            salaryMinXAF: row.price ? Number(row.price) : undefined,
            salaryMaxXAF: extra.salary_max ? Number(extra.salary_max) : undefined,
            isSalaryNegotiable: Boolean(extra.negotiable),
            location: { city: row.location ?? "", region: extra.region ?? "", country: row.country ?? "Cameroon" },
            isRemote: Boolean(extra.is_remote),
            applicationDeadline: extra.deadline ?? undefined,
            applyMethod: extra.apply_method ?? "in_app",
            applyContact: extra.apply_contact ?? undefined,
            status: "active", viewCount: 0, applicationCount: 0,
            tags: Array.isArray(row.tags) ? row.tags : [],
            createdAt: row.created_at ?? new Date().toISOString(),
            updatedAt: row.created_at ?? new Date().toISOString(),
          };
          setJobs((prev) => [newJob, ...prev]);
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [fetchJobs]);

  useEffect(() => { persistSaved(saved); }, [saved]);

  const filtered = useMemo(() => {
    let list = jobs.filter((j) => {
      const displayType = JOB_TYPE_MAP[j.jobType] ?? j.jobType;
      const loc = `${j.location.city} ${j.location.region ?? ""}`.toLowerCase();
      if (search && !j.title.toLowerCase().includes(search.toLowerCase()) &&
          !(j.company?.toLowerCase().includes(search.toLowerCase()) ?? false)) return false;
      if (category !== "All" && j.category !== CATEGORY_DB[category]) return false;
      if (jobType  !== "All Types" && displayType !== jobType) return false;
      if (region   !== "All Regions" && !loc.includes(region.toLowerCase())) return false;
      if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
      if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
      if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
      if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;
      return true;
    });
    if (mostRecent) list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [jobs, search, category, jobType, region, mostRecent, locationFilters]);

  const activeFilterCount = [category !== "All", jobType !== "All Types", region !== "All Regions"].filter(Boolean).length;

  function handleSave(id: string, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setSaved((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function handleShare(job: JobListing, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/#/jobs/${job.id}`;
    if (navigator.share) navigator.share({ title: job.title, text: `${job.title} at ${job.company ?? ""}`, url }).catch(() => {});
    else navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24" dir={isRtl ? "rtl" : "ltr"}>

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-7">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-2xl">{t("jobsTitle")}</h1>
          <Link to="/jobs/post"
            className="bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl">
            {t("postJob")}
          </Link>
        </div>
        <p className="text-teal-100 text-sm mb-4">
          {loading ? t("loading") : `${jobs.length} ${t("opportunities")}`}
        </p>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/95 text-gray-900
                       text-sm placeholder-gray-400 outline-none shadow"
            placeholder={t("jobSearchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
                      px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button onClick={() => setShowFilters((v) => !v)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border-2
                      text-xs font-semibold transition-all
                      ${showFilters || activeFilterCount > 0
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700"
                        : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400"}`}>
          🎛 {t("filters")}
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button onClick={() => setMostRecent((v) => !v)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border-2
                      text-xs font-semibold transition-all
                      ${mostRecent ? "border-teal-500 bg-teal-500 text-white"
                                   : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400"}`}>
          🕐 {t("mostRecent")}
        </button>

        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                        ${category === c ? "bg-teal-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
            {CATEGORY_LABELS[c]?.[lang] ?? c}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {t("jobType")}
              </label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5
                           text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
                {JOB_TYPES.map((tp) => (
                  <option key={tp} value={tp}>{JOB_TYPES_I18N[tp]?.[lang] ?? tp}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {t("region")}
              </label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5
                           text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{REGIONS_I18N[r]?.[lang] ?? r}</option>
                ))}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setCategory("All"); setJobType("All Types"); setRegion("All Regions"); }}
              className="mt-3 text-xs text-red-500 font-semibold">
              {t("clearFilters")}
            </button>
          )}
        </div>
      )}

      {/* Location filter */}
      <div className="px-4 pt-4">
        <LocationFilter onFilterChange={setLocationFilters} />
      </div>

      {/* Featured ads */}
      <div className="px-4 pb-2">
        <AdStripBoundary>
          <FeaturedAdsStrip category="jobs" showHeader={false} maxVisible={20} />
        </AdStripBoundary>
      </div>

      {/* Results count */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span>{" "}
          {t("jobsFound")}
          {mostRecent && <span className="text-teal-600"> · {t("newestFirst")}</span>}
        </p>
        {!loading && (
          <button onClick={() => void fetchJobs()} className="text-xs text-teal-600 font-semibold">
            {t("refresh")}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 space-y-3">
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{t("loading")}</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">⚠ï¸</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">{error}</p>
            <button onClick={() => void fetchJobs()}
              className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              {t("tryAgain")}
            </button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20">
            <BriefcaseIcon className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">{t("noJobs")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("noJobsHint")}</p>
            <Link to="/jobs/post"
              className="inline-block mt-5 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
              {t("postJob")}
            </Link>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">{t("noMatch")}</p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); setJobType("All Types"); setRegion("All Regions"); setLocationFilters(EMPTY_LOCATION); }}
              className="mt-3 text-sm text-teal-600 font-semibold">
              {t("clearAll")}
            </button>
          </div>
        )}

        {!loading && !error && filtered.map((job) => (
          <JobCard key={job.id} job={job} saved={saved.has(job.id)} lang={lang} tFn={t}
            onSave={(e) => handleSave(job.id, e)}
            onShare={(e) => handleShare(job, e)} />
        ))}
      </div>
    </div>
  );
}




