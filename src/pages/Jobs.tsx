/**
 * src/pages/Jobs.tsx
 * Bambeh Marketplace — Find Jobs Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * ✅ Queries listings table (type='job') — correct Bambeh schema
 * ✅ Full i18n via useLang() hook — EN / FR / HA / AR / PCM / FUL
 * ✅ Search by title + company (client-side, instant)
 * ✅ Category, job-type, region filters
 * ✅ Save / Share per card
 * ✅ Realtime new-job push via Supabase channel on "listings" table
 * ✅ Zero hook-in-plain-function violations
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, BriefcaseIcon, Eye } from "lucide-react";
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from "@/components/filters/LocationFilter";
import { getJobs } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useAppLang";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip";

// ─── i18n strings ─────────────────────────────────────────────────────────────
const STRINGS: Record<string, Record<string, string>> = {
  title:            { en: "Find Jobs 💼", fr: "Trouver un emploi 💼", ha: "Neman Aiki 💼", ar: "البحث عن عمل 💼", pcm: "Find Work 💼", ful: "Yiyde Golle 💼" },
  postJob:          { en: "+ Post Job", fr: "+ Publier une offre", ha: "+ Ƙara Aiki", ar: "+ نشر وظيفة", pcm: "+ Post Work", ful: "+ Yottinde Golle" },
  searchPlaceholder:{ en: "Search jobs or companies...", fr: "Rechercher emplois ou entreprises...", ha: "Neman aiki ko kamfani...", ar: "البحث عن وظائف أو شركات...", pcm: "Search work or company...", ful: "Yiylo golle walla liggey..." },
  loading:          { en: "Loading jobs from Bambeh…", fr: "Chargement des offres…", ha: "Ana lodi ayyukan…", ar: "جارٍ تحميل الوظائف…", pcm: "Dem dey load work…", ful: "Nannginii golle…" },
  opportunities:    { en: "opportunities across Cameroon", fr: "opportunités au Cameroun", ha: "damar aiki a Kamaru", ar: "فرصة عمل في الكاميرون", pcm: "opportunities for Cameroon", ful: "golle e Kameruun" },
  filters:          { en: "Filters", fr: "Filtres", ha: "Tace", ar: "تصفية", pcm: "Filter", ful: "Tippitorɗe" },
  mostRecent:       { en: "Most Recent", fr: "Plus récent", ha: "Sabuwar", ar: "الأحدث", pcm: "New new", ful: "Ɓuuɓɗum" },
  clearFilters:     { en: "✕ Clear all filters", fr: "✕ Effacer tous les filtres", ha: "✕ Share duk tacewa", ar: "✕ مسح جميع التصفيات", pcm: "✕ Clear all filter", ful: "✕ Huccit tippitorɗe fof" },
  jobType:          { en: "Job Type", fr: "Type d'emploi", ha: "Nau'in Aiki", ar: "نوع الوظيفة", pcm: "Work Type", ful: "Suudu Golle" },
  region:           { en: "Region", fr: "Région", ha: "Yanki", ar: "المنطقة", pcm: "Region", ful: "Leydi" },
  jobsFound:        { en: "jobs found", fr: "offres trouvées", ha: "ayyukan da aka samu", ar: "وظيفة موجودة", pcm: "work dey", ful: "golle heɓtaama" },
  newestFirst:      { en: "newest first", fr: "plus récent d'abord", ha: "sabon farko", ar: "الأحدث أولاً", pcm: "new ones first", ful: "ɓuuɓɗum ɓoo" },
  refresh:          { en: "↻ Refresh", fr: "↻ Actualiser", ha: "↻ Sabunta", ar: "↻ تحديث", pcm: "↻ Refresh", ful: "↻ Heɓtu" },
  noJobs:           { en: "No jobs posted yet", fr: "Aucune offre publiée", ha: "Babu ayyuka da aka ƙara", ar: "لا توجد وظائف بعد", pcm: "No work yet", ful: "Alaa golle fewti" },
  noJobsHint:       { en: "Be the first to post a job opportunity!", fr: "Soyez le premier à publier une offre!", ha: "Zama na farko da ya wallafa aiki!", ar: "كن أول من ينشر فرصة عمل!", pcm: "You be the first to post work!", ful: "Ardi fewtu golle!" },
  noMatch:          { en: "No jobs match your filters", fr: "Aucune offre ne correspond", ha: "Babu ayyukan da suka dace", ar: "لا توجد وظائف مطابقة", pcm: "No work match your filter", ful: "Alaa golle faayi" },
  clearAll:         { en: "Clear all filters", fr: "Effacer les filtres", ha: "Share duk tacewa", ar: "مسح الكل", pcm: "Clear filter", ful: "Huccit tippitorɗe" },
  applyNow:         { en: "🚀 Apply Now", fr: "🚀 Postuler maintenant", ha: "🚀 Nema yanzu", ar: "🚀 تقدم الآن", pcm: "🚀 Apply Now", ful: "🚀 Dañ Golle" },
  views:            { en: "views", fr: "vues", ha: "ra'ayoyi", ar: "مشاهدة", pcm: "people see am", ful: "yiylaama" },
  negotiable:       { en: "Negotiable", fr: "Négociable", ha: "Ana tattaunawa", ar: "قابل للتفاوض", pcm: "E fit negotiate", ful: "Naggi" },
  salaryNotSpec:    { en: "Salary not specified", fr: "Salaire non précisé", ha: "Ba a ambaci albashi", ar: "الراتب غير محدد", pcm: "No salary talk", ful: "Njobdi alaa" },
  deadline:         { en: "Deadline", fr: "Date limite", ha: "Ƙarshen lokaci", ar: "آخر موعد", pcm: "Last date", ful: "Balɗe ɓennoo" },
  remote:           { en: "Remote", fr: "Télétravail", ha: "Nesa", ar: "عن بُعد", pcm: "Online work", ful: "E Ɓanndu" },
  error:            { en: "Could not load jobs. Check your connection.", fr: "Impossible de charger les offres. Vérifiez votre connexion.", ha: "Ba za a iya lodi ayyukan ba.", ar: "تعذر تحميل الوظائف.", pcm: "We no fit load work.", ful: "Golle naataani." },
  tryAgain:         { en: "Try Again", fr: "Réessayer", ha: "Sake gwadawa", ar: "حاول مرة أخرى", pcm: "Try again", ful: "Eɗɗoo yeeso" },
};

function s(key: string, lang: string): string {
  return STRINGS[key]?.[lang] ?? STRINGS[key]?.["en"] ?? key;
}

// ─── Category labels ───────────────────────────────────────────────────────────
const CATEGORIES = [
  "All","Technology","Marketing","Finance","Engineering",
  "Education","Agriculture","Healthcare","Logistics","Sales","Legal","Other",
];

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  All:         { en:"All", fr:"Tous", ha:"Duka", ar:"الكل", pcm:"All", ful:"Fof" },
  Technology:  { en:"Technology", fr:"Technologie", ha:"Fasaha", ar:"تكنولوجيا", pcm:"Tech", ful:"Tekinoloji" },
  Marketing:   { en:"Marketing", fr:"Marketing", ha:"Tallatawa", ar:"تسويق", pcm:"Marketing", ful:"Marketing" },
  Finance:     { en:"Finance", fr:"Finance", ha:"Kudi", ar:"مالية", pcm:"Money work", ful:"Liggey mbappu" },
  Engineering: { en:"Engineering", fr:"Ingénierie", ha:"Injiniya", ar:"هندسة", pcm:"Engineering", ful:"Engineering" },
  Education:   { en:"Education", fr:"Éducation", ha:"Ilimi", ar:"التعليم", pcm:"School work", ful:"Janngugol" },
  Agriculture: { en:"Agriculture", fr:"Agriculture", ha:"Noma", ar:"زراعة", pcm:"Farm work", ful:"Ndemndi" },
  Healthcare:  { en:"Healthcare", fr:"Santé", ha:"Kiwon lafiya", ar:"رعاية صحية", pcm:"Hospital work", ful:"Cellal" },
  Logistics:   { en:"Logistics", fr:"Logistique", ha:"Sufuri", ar:"لوجستيات", pcm:"Transport work", ful:"Heftugol" },
  Sales:       { en:"Sales", fr:"Ventes", ha:"Sayarwa", ar:"مبيعات", pcm:"Sell sell", ful:"Jaral" },
  Legal:       { en:"Legal", fr:"Juridique", ha:"Shari'a", ar:"قانوني", pcm:"Law work", ful:"Laawol" },
  Other:       { en:"Other", fr:"Autre", ha:"Wani", ar:"أخرى", pcm:"Other", ful:"Woɗɗum" },
};

const JOB_TYPE_MAP: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time",
  contract: "Contract", internship: "Internship",
  freelance: "Freelance", temporary: "Temporary",
};

const JOB_TYPE_LABELS_I18N: Record<string, Record<string, string>> = {
  "All Types":  { en:"All Types", fr:"Tous types", ha:"Duk nau'i", ar:"جميع الأنواع", pcm:"All type", ful:"Suudu fof" },
  "Full-time":  { en:"Full-time", fr:"Temps plein", ha:"Cikakken lokaci", ar:"دوام كامل", pcm:"Full time", ful:"Waktu fof" },
  "Part-time":  { en:"Part-time", fr:"Temps partiel", ha:"Rabin lokaci", ar:"دوام جزئي", pcm:"Half time", ful:"Waktu didi" },
  "Contract":   { en:"Contract", fr:"Contrat", ha:"Kwantiragi", ar:"عقد", pcm:"Contract", ful:"Kontoraaji" },
  "Internship": { en:"Internship", fr:"Stage", ha:"Horarwa", ar:"تدريب", pcm:"Training", ful:"Jannginagol" },
  "Freelance":  { en:"Freelance", fr:"Freelance", ha:"Yanci", ar:"حر", pcm:"Freelance", ful:"Freelance" },
  "Temporary":  { en:"Temporary", fr:"Temporaire", ha:"Wucin gadi", ar:"مؤقت", pcm:"Small time", ful:"Seeɗa" },
  "Remote":     { en:"Remote", fr:"Télétravail", ha:"Nesa", ar:"عن بُعد", pcm:"Online work", ful:"E Ɓanndu" },
};

const REGIONS_I18N: Record<string, Record<string, string>> = {
  "All Regions": { en:"All Regions", fr:"Toutes régions", ha:"Duk yankuna", ar:"كل المناطق", pcm:"All area", ful:"Leyɗe fof" },
  "Centre":     { en:"Centre", fr:"Centre", ha:"Tsakiya", ar:"الوسط", pcm:"Centre", ful:"Centre" },
  "Littoral":   { en:"Littoral", fr:"Littoral", ha:"Bakin Teku", ar:"الساحل", pcm:"Coast", ful:"Littoral" },
  "West":       { en:"West", fr:"Ouest", ha:"Yamma", ar:"الغرب", pcm:"West", ful:"Hirnaange" },
  "South West": { en:"South West", fr:"Sud-Ouest", ha:"Kudu Yamma", ar:"جنوب غرب", pcm:"South West", ful:"Worgo-Hirnaange" },
  "North West": { en:"North West", fr:"Nord-Ouest", ha:"Arewa Yamma", ar:"شمال غرب", pcm:"North West", ful:"Rewo-Hirnaange" },
  "Adamawa":    { en:"Adamawa", fr:"Adamaoua", ha:"Adamawa", ar:"آدماوا", pcm:"Adamawa", ful:"Adamawa" },
  "South":      { en:"South", fr:"Sud", ha:"Kudu", ar:"الجنوب", pcm:"South", ful:"Worgo" },
  "East":       { en:"East", fr:"Est", ha:"Gabas", ar:"الشرق", pcm:"East", ful:"Fuɗnaange" },
  "North":      { en:"North", fr:"Nord", ha:"Arewa", ar:"الشمال", pcm:"North", ful:"Rewo" },
  "Far North":  { en:"Far North", fr:"Extrême-Nord", ha:"Arewacin Arewa", ar:"أقصى الشمال", pcm:"Far North", ful:"Rewo Rewo" },
};

const JOB_TYPES  = ["All Types","Full-time","Part-time","Contract","Internship","Remote","Freelance","Temporary"];
const REGIONS    = ["All Regions","Centre","Littoral","West","South West","North West","Adamawa","South","East","North","Far North"];
const SAVED_KEY  = "bambeh_saved_jobs";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return lang === "fr" ? "Aujourd'hui" : lang === "ar" ? "اليوم" : "Today";
  if (diff === 1) return lang === "fr" ? "Il y a 1j" : lang === "ar" ? "منذ يوم" : "1d ago";
  return lang === "fr" ? `Il y a ${diff}j` : lang === "ar" ? `منذ ${diff} أيام` : `${diff}d ago`;
}

function fmtSalary(min: number | undefined, max: number | undefined, lang: string, salaryNotSpec: string): string {
  if (!min && !max) return salaryNotSpec;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;
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

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({
  job, saved, lang, onSave, onShare,
}: {
  job: JobListing; saved: boolean; lang: string;
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
                  🌐 {s("remote", lang)}
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
          💰 {fmtSalary(job.salaryMinXAF, job.salaryMaxXAF, lang, s("salaryNotSpec", lang))}
          {job.isSalaryNegotiable && (
            <span className="text-gray-400 font-normal"> · {s("negotiable", lang)}</span>
          )}
        </div>

        {job.applicationDeadline && (
          <div className="mt-1 text-[11px] text-orange-500 dark:text-orange-400">
            ⏰ {s("deadline", lang)}: {new Date(job.applicationDeadline).toLocaleDateString(
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
          {s("applyNow", lang)}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
          <Eye className="w-3 h-3" />
          {job.viewCount ?? 0} {s("views", lang)}
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Jobs() {
  const navigate  = useNavigate();
  const lang      = useLang();

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
      if (result.error) {
        setError(s("error", lang));
        setJobs([]);
      } else {
        setJobs(result.data);
      }
    } catch {
      setError(s("error", lang));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    void fetchJobs();

    // Realtime: listen for new jobs on the "listings" table
    const channel = supabase
      .channel("jobs_realtime_v2")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "listings" },
        (payload) => {
          const row = payload.new as Record<string, any>;
          if (row.type !== "job" || row.status !== "active") return;
          const extra = (row.extra ?? {}) as Record<string, any>;
          const newJob: JobListing = {
            id:                  row.id,
            employerId:          row.user_id ?? "",
            title:               row.title ?? "",
            company:             extra.company ?? undefined,
            description:         row.description ?? "",
            category:            row.category ?? "",
            jobType:             extra.job_type ?? "full_time",
            experienceLevel:     extra.exp_level ?? "entry",
            salaryMinXAF:        row.price ? Number(row.price) : undefined,
            salaryMaxXAF:        extra.salary_max ? Number(extra.salary_max) : undefined,
            isSalaryNegotiable:  Boolean(extra.negotiable),
            location:            { city: row.location ?? "", region: extra.region ?? "", country: row.country ?? "Cameroon" },
            isRemote:            Boolean(extra.is_remote),
            applicationDeadline: extra.deadline ?? undefined,
            applyMethod:         extra.apply_method ?? "in_app",
            applyContact:        extra.apply_contact ?? undefined,
            status:              "active",
            viewCount:           0,
            applicationCount:    0,
            tags:                Array.isArray(row.tags) ? row.tags : [],
            createdAt:           row.created_at ?? new Date().toISOString(),
            updatedAt:           row.created_at ?? new Date().toISOString(),
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

      if (search &&
          !j.title.toLowerCase().includes(search.toLowerCase()) &&
          !(j.company?.toLowerCase().includes(search.toLowerCase()) ?? false)
      ) return false;

      if (category !== "All" && j.category !== category) return false;
      if (jobType  !== "All Types" && displayType !== jobType) return false;
      if (region   !== "All Regions" && !loc.includes(region.toLowerCase())) return false;

      if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
      if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
      if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
      if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;

      return true;
    });

    if (mostRecent) {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
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

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24" dir={dir}>

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-7">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-2xl">{s("title", lang)}</h1>
          <Link to="/jobs/post"
            className="bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl">
            {s("postJob", lang)}
          </Link>
        </div>
        <p className="text-teal-100 text-sm mb-4">
          {loading
            ? s("loading", lang)
            : `${jobs.length} ${s("opportunities", lang)}`}
        </p>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/95 text-gray-900
                       text-sm placeholder-gray-400 outline-none shadow"
            placeholder={s("searchPlaceholder", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter bar */}
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
          🎛 {s("filters", lang)}
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
          🕐 {s("mostRecent", lang)}
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
                {s("jobType", lang)}
              </label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5
                           text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>{JOB_TYPE_LABELS_I18N[t]?.[lang] ?? t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {s("region", lang)}
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
            <button
              onClick={() => { setCategory("All"); setJobType("All Types"); setRegion("All Regions"); }}
              className="mt-3 text-xs text-red-500 font-semibold"
            >
              {s("clearFilters", lang)}
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
        <FeaturedAdsStrip category="jobs" showHeader={false} maxVisible={20} />
      </div>

      {/* Results count */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span>{" "}
          {s("jobsFound", lang)}
          {mostRecent && <span className="text-teal-600"> · {s("newestFirst", lang)}</span>}
        </p>
        {!loading && (
          <button onClick={() => void fetchJobs()} className="text-xs text-teal-600 font-semibold">
            {s("refresh", lang)}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 space-y-3">

        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{s("loading", lang)}</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">{error}</p>
            <button onClick={() => void fetchJobs()}
              className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              {s("tryAgain", lang)}
            </button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20">
            <BriefcaseIcon className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">{s("noJobs", lang)}</p>
            <p className="text-sm text-gray-500 mt-1">{s("noJobsHint", lang)}</p>
            <Link to="/jobs/post"
              className="inline-block mt-5 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
              {s("postJob", lang)}
            </Link>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">{s("noMatch", lang)}</p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); setJobType("All Types"); setRegion("All Regions"); setLocationFilters(EMPTY_LOCATION); }}
              className="mt-3 text-sm text-teal-600 font-semibold">
              {s("clearAll", lang)}
            </button>
          </div>
        )}

        {!loading && !error && filtered.map((job) => (
          <JobCard key={job.id} job={job} saved={saved.has(job.id)} lang={lang}
            onSave={(e) => handleSave(job.id, e)}
            onShare={(e) => handleShare(job, e)} />
        ))}
      </div>
    </div>
  );
}
