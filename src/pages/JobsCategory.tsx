/**
 * src/pages/JobsCategory.tsx
 * Bambeh Marketplace — Jobs Category Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXED:
 *  ✅ fmtSalary no longer calls useLang() inside a plain function (hook-rules violation)
 *  ✅ Company logo displayed if present
 *  ✅ Full i18n via useLang()
 *  ✅ Pagination "Load More"
 *  ✅ Share + deadline banners
 *  ✅ Searches listings table (correct Bambeh schema)
 */

import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Loader2, BriefcaseIcon, Share2 } from "lucide-react";
import { getJobs } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";
import { useLang } from "@/hooks/useAppLang";

// ─── Category Map ──────────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, { label: string; dbValue: string; emoji: string }> = {
  technology:  { label: "Technology",  dbValue: "Technology",  emoji: "💻" },
  marketing:   { label: "Marketing",   dbValue: "Marketing",   emoji: "📣" },
  finance:     { label: "Finance",     dbValue: "Finance",     emoji: "💰" },
  engineering: { label: "Engineering", dbValue: "Engineering", emoji: "⚙ï¸" },
  education:   { label: "Education",   dbValue: "Education",   emoji: "🎓" },
  agriculture: { label: "Agriculture", dbValue: "Agriculture", emoji: "🌾" },
  healthcare:  { label: "Healthcare",  dbValue: "Healthcare",  emoji: "ðŸ¥" },
  logistics:   { label: "Logistics",   dbValue: "Logistics",   emoji: "🚚" },
  sales:       { label: "Sales",       dbValue: "Sales",       emoji: "ðŸ¤" },
  legal:       { label: "Legal",       dbValue: "Legal",       emoji: "⚖ï¸" },
  other:       { label: "Other",       dbValue: "Other",       emoji: "📋" },
};

// ─── i18n ──────────────────────────────────────────────────────────────────────
const STR: Record<string, Record<string, string>> = {
  jobs:         { en:"Jobs", fr:"Emplois", ha:"Ayyuka", ar:"وظائÙ", pcm:"Work", ful:"Golle" },
  opportunity:  { en:"opportunity", fr:"opportunité", ha:"dama", ar:"Ùرصة", pcm:"opportunity", ful:"sago" },
  opportunities:{ en:"opportunities", fr:"opportunités", ha:"damar aiki", ar:"Ùرص", pcm:"opportunities", ful:"sagoji" },
  loading:      { en:"Loading", fr:"Chargement", ha:"Ana lodi", ar:"جارÙ التحميل", pcm:"Dey load", ful:"Nannginii" },
  jobs_lc:      { en:"jobs…", fr:"offres…", ha:"ayyuka…", ar:"وظائÙ…", pcm:"work…", ful:"golle…" },
  error:        { en:"Could not load jobs.", fr:"Impossible de charger les offres.", ha:"Ba a iya lodi", ar:"تعذر تحميل", pcm:"E no fit load", ful:"Golle naataani" },
  tryAgain:     { en:"Try Again", fr:"Réessayer", ha:"Sake gwadawa", ar:"حاول مرة أخرى", pcm:"Try again", ful:"Eɗɗoo yeeso" },
  noJobs:       { en:"No jobs posted yet", fr:"Aucune offre publiée", ha:"Babu ayyuka", ar:"لا توجد وظائÙ بعد", pcm:"No work yet", ful:"Alaa golle" },
  checkBack:    { en:"Check back soon or post one yourself!", fr:"Revenez bientôt ou publiez une offre!", ha:"Dawo cikin wuri ko wallafa aiki!", ar:"عد قريبًا أو انشر وظيÙة!", pcm:"Come back later or post work!", ful:"Ardi tuma ɓee ko fewtu!" },
  allJobs:      { en:"All Jobs", fr:"Tous les emplois", ha:"Duk Ayyuka", ar:"جميع الوظائÙ", pcm:"All Work", ful:"Golle fof" },
  postJob:      { en:"Post a Job", fr:"Publier une offre", ha:"Wallafa Aiki", ar:"نشر وظيÙة", pcm:"Post Work", ful:"Fewtu Golle" },
  viewApply:    { en:"View & Apply →", fr:"Voir & Postuler →", ha:"Duba & Nema →", ar:"عرض وتقديم →", pcm:"See & Apply →", ful:"Yii & Dañ →" },
  loadMore:     { en:"Load More Jobs", fr:"Charger plus d'offres", ha:"Ƙara ayyuka", ar:"تحميل المزيد", pcm:"Load more work", ful:"Nanngin Golleli" },
  loading2:     { en:"Loading…", fr:"Chargement…", ha:"Ana lodi…", ar:"جارÙ التحميل…", pcm:"Dey load…", ful:"Nannginii…" },
  remote:       { en:"Remote", fr:"Télétravail", ha:"Nesa", ar:"عن بÙعد", pcm:"Online", ful:"E Æanndu" },
  negotiable:   { en:"Negotiable", fr:"Négociable", ha:"Ana tattaunawa", ar:"قابل للتÙاوض", pcm:"E fit negotiate", ful:"Naggi" },
  salaryNotSpec:{ en:"Salary not specified", fr:"Salaire non précisé", ha:"Ba a ambaci albashi", ar:"الراتب غير محدد", pcm:"No salary talk", ful:"Njobdi alaa" },
  closed:       { en:"⛔ Closed — Deadline passed", fr:"⛔ Fermé — Délai dépassé", ha:"⛔ An rufe — lokaci ya ƙare", ar:"⛔ مغلق — انتهى الموعد", pcm:"⛔ E don close", ful:"⛔ Uddii" },
  closingSoon:  { en:"â° Closing soon", fr:"â° Ferme bientôt", ha:"â° Zai ƙare", ar:"â° ينتهي قريبًا", pcm:"â° E go close", ful:"â° Æennoo seeɗa" },
  today:        { en:"Today!", fr:"Aujourd'hui!", ha:"Yau!", ar:"اليوم!", pcm:"Today!", ful:"Hannde!" },
  dLeft:        { en:"d left", fr:"j restants", ha:"kwanaki", ar:"أيام", pcm:"days left", ful:"balɗe" },
};

function s(key: string, lang: string): string {
  return STR[key]?.[lang] ?? STR[key]?.["en"] ?? key;
}

// ─── Helpers (NO hook calls inside plain functions) ─────────────────────────────
function fmtSalary(min: number | undefined, max: number | undefined, lang: string, notSpecLabel: string): string {
  if (!min && !max) return notSpecLabel;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000     ? `${Math.round(n / 1_000)}k` : `${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} XAF`;
  if (min) return lang === "fr" ? `À partir de ${fmt(min)} XAF` : `From ${fmt(min)} XAF`;
  return lang === "fr" ? `Jusqu'à ${fmt(max!)} XAF` : `Up to ${fmt(max!)} XAF`;
}

function daysUntilDeadline(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}

function timeAgo(dateStr: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return lang === "fr" ? "Aujourd'hui" : lang === "ar" ? "اليوم" : "Today";
  if (diff === 1) return lang === "fr" ? "Il y a 1j" : lang === "ar" ? "منذ يوم" : "1d ago";
  return lang === "fr" ? `Il y a ${diff}j` : lang === "ar" ? `منذ ${diff} أيام` : `${diff}d ago`;
}

const JOB_TYPE_LABELS: Record<string, Record<string, string>> = {
  full_time:  { en:"Full-time",  fr:"Temps plein",   ar:"دوام كامل",  ha:"Cikakken lokaci", pcm:"Full time",  ful:"Waktu fof" },
  part_time:  { en:"Part-time",  fr:"Temps partiel", ar:"دوام جزئي",  ha:"Rabin lokaci",    pcm:"Half time",  ful:"Waktu didi" },
  contract:   { en:"Contract",   fr:"Contrat",       ar:"عقد",         ha:"Kwantiragi",      pcm:"Contract",   ful:"Kontoraaji" },
  internship: { en:"Internship", fr:"Stage",         ar:"تدريب",       ha:"Horarwa",         pcm:"Training",   ful:"Jannginagol" },
  freelance:  { en:"Freelance",  fr:"Freelance",     ar:"حر",          ha:"Yanci",           pcm:"Freelance",  ful:"Freelance" },
  temporary:  { en:"Temporary",  fr:"Temporaire",    ar:"مؤقت",        ha:"Wucin gadi",      pcm:"Small time", ful:"Seeɗa" },
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const JobsCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate     = useNavigate();
  const lang         = useLang();  // â† hook called correctly at component top-level
  const dir          = lang === "ar" ? "rtl" : "ltr";

  const slug       = category ? decodeURIComponent(category).toLowerCase() : "";
  const meta       = CATEGORY_MAP[slug];
  const label      = meta?.label  ?? (category ? decodeURIComponent(category).replace(/-/g, " ") : "All");
  const emoji      = meta?.emoji  ?? "💼";
  const dbCategory = meta?.dbValue ?? label;

  const [jobs,        setJobs]        = useState<JobListing[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
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
    if (navigator.share) navigator.share({ title: job.title, url }).catch(() => {});
    else navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 pb-24" dir={dir}>

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-8">
        <div className="flex items-center gap-2 mb-4 text-sm text-teal-200">
          <Link to="/jobs" className="hover:text-white transition-colors">{s("jobs", lang)}</Link>
          <span>›</span>
          <span className="text-white font-medium capitalize">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            {emoji}
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl capitalize">{label} {s("jobs", lang)}</h1>
            {!loading && (
              <p className="text-teal-200 text-sm">
                {jobs.length}{hasMore ? "+" : ""}{" "}
                {jobs.length === 1 ? s("opportunity", lang) : s("opportunities", lang)}
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
            <p className="text-sm text-gray-500">{s("loading", lang)} {label} {s("jobs_lc", lang)}</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">⚠ï¸</p>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button onClick={() => void load(1)}
              className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              {s("tryAgain", lang)}
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20">
            <BriefcaseIcon className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {s("noJobs", lang)}
            </p>
            <p className="text-sm text-gray-500 mt-1">{s("checkBack", lang)}</p>
            <div className="flex gap-3 justify-center mt-5">
              <Link to="/jobs"
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl text-sm font-semibold">
                {s("allJobs", lang)}
              </Link>
              <Link to="/jobs/post"
                className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                {s("postJob", lang)}
              </Link>
            </div>
          </div>
        )}

        {/* Job cards */}
        {!loading && !error && jobs.map((job) => {
          const deadlineDays  = job.applicationDeadline ? daysUntilDeadline(job.applicationDeadline) : null;
          const expiringSoon  = deadlineDays !== null && deadlineDays <= 3 && deadlineDays >= 0;
          const expired       = deadlineDays !== null && deadlineDays < 0;
          const displayType   = JOB_TYPE_LABELS[job.jobType]?.[lang] ?? JOB_TYPE_LABELS[job.jobType]?.en ?? job.jobType;
          // pass lang to fmtSalary — no hook call inside plain fn
          const salaryText    = fmtSalary(job.salaryMinXAF, job.salaryMaxXAF, lang, s("salaryNotSpec", lang));

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
                    ? s("closed", lang)
                    : `${s("closingSoon", lang)} — ${deadlineDays === 0 ? s("today", lang) : `${deadlineDays} ${s("dLeft", lang)}`}`}
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Company logo or initial */}
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center
                                justify-center text-xl font-bold text-teal-600 flex-shrink-0 overflow-hidden">
                  {(job as any).companyLogoUrl ? (
                    <img
                      src={(job as any).companyLogoUrl}
                      alt={job.company ?? ""}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : job.company ? (
                    job.company.charAt(0).toUpperCase()
                  ) : "💼"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-800 dark:text-white line-clamp-1 text-sm">
                      {job.title}
                    </p>
                    <button onClick={(e) => handleShare(job, e)} aria-label="Share"
                      className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700
                                 flex items-center justify-center text-gray-400 active:scale-90">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {job.company && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    ðŸ“ {job.location.city}
                    {job.location.region ? ` · ${job.location.region}` : ""}
                    {job.isRemote && ` · ðŸŒ ${s("remote", lang)}`}
                    {" · "}
                    <span className="text-teal-600 dark:text-teal-400 font-medium">{displayType}</span>
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">
                      💰 {salaryText}
                      {job.isSalaryNegotiable && (
                        <span className="text-gray-400 text-xs font-normal"> · {s("negotiable", lang)}</span>
                      )}
                    </p>
                    <span className="text-xs text-gray-400">{timeAgo(job.createdAt, lang)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-teal-600 text-white text-xs font-bold py-2 rounded-xl text-center">
                {s("viewApply", lang)}
              </div>
            </button>
          );
        })}

        {/* Load More */}
        {!loading && !error && hasMore && (
          <button onClick={handleLoadMore} disabled={loadingMore}
            className="w-full py-3 rounded-2xl border-2 border-teal-200 dark:border-teal-800
                       text-teal-600 dark:text-teal-400 text-sm font-semibold
                       flex items-center justify-center gap-2 disabled:opacity-50">
            {loadingMore
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {s("loading2", lang)}</>
              : s("loadMore", lang)}
          </button>
        )}

      </div>
    </div>
  );
};

export default JobsCategory;


