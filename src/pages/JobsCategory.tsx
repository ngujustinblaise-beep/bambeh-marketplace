/**
 * src/pages/JobsCategory.tsx
 * Bambeh Marketplace â€” Jobs Category Page
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXED:
 *  âœ… fmtSalary no longer calls useLang() inside a plain function (hook-rules violation)
 *  âœ… Company logo displayed if present
 *  âœ… Full i18n via useLang()
 *  âœ… Pagination "Load More"
 *  âœ… Share + deadline banners
 *  âœ… Searches listings table (correct Bambeh schema)
 */

import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Loader2, BriefcaseIcon, Share2 } from "lucide-react";
import { getJobs } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";
import { useLang } from "@/hooks/useAppLang";

// â”€â”€â”€ Category Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CATEGORY_MAP: Record<string, { label: string; dbValue: string; emoji: string }> = {
  technology:  { label: "Technology",  dbValue: "Technology",  emoji: "ðŸ’»" },
  marketing:   { label: "Marketing",   dbValue: "Marketing",   emoji: "ðŸ“£" },
  finance:     { label: "Finance",     dbValue: "Finance",     emoji: "ðŸ’°" },
  engineering: { label: "Engineering", dbValue: "Engineering", emoji: "âš™ï¸" },
  education:   { label: "Education",   dbValue: "Education",   emoji: "ðŸŽ“" },
  agriculture: { label: "Agriculture", dbValue: "Agriculture", emoji: "ðŸŒ¾" },
  healthcare:  { label: "Healthcare",  dbValue: "Healthcare",  emoji: "ðŸ¥" },
  logistics:   { label: "Logistics",   dbValue: "Logistics",   emoji: "ðŸšš" },
  sales:       { label: "Sales",       dbValue: "Sales",       emoji: "ðŸ¤" },
  legal:       { label: "Legal",       dbValue: "Legal",       emoji: "âš–ï¸" },
  other:       { label: "Other",       dbValue: "Other",       emoji: "ðŸ“‹" },
};

// â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STR: Record<string, Record<string, string>> = {
  jobs:         { en:"Jobs", fr:"Emplois", ha:"Ayyuka", ar:"ÙˆØ¸Ø§Ø¦Ù", pcm:"Work", ful:"Golle" },
  opportunity:  { en:"opportunity", fr:"opportunitÃ©", ha:"dama", ar:"ÙØ±ØµØ©", pcm:"opportunity", ful:"sago" },
  opportunities:{ en:"opportunities", fr:"opportunitÃ©s", ha:"damar aiki", ar:"ÙØ±Øµ", pcm:"opportunities", ful:"sagoji" },
  loading:      { en:"Loading", fr:"Chargement", ha:"Ana lodi", ar:"Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„", pcm:"Dey load", ful:"Nannginii" },
  jobs_lc:      { en:"jobsâ€¦", fr:"offresâ€¦", ha:"ayyukaâ€¦", ar:"ÙˆØ¸Ø§Ø¦Ùâ€¦", pcm:"workâ€¦", ful:"golleâ€¦" },
  error:        { en:"Could not load jobs.", fr:"Impossible de charger les offres.", ha:"Ba a iya lodi", ar:"ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„", pcm:"E no fit load", ful:"Golle naataani" },
  tryAgain:     { en:"Try Again", fr:"RÃ©essayer", ha:"Sake gwadawa", ar:"Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰", pcm:"Try again", ful:"EÉ—É—oo yeeso" },
  noJobs:       { en:"No jobs posted yet", fr:"Aucune offre publiÃ©e", ha:"Babu ayyuka", ar:"Ù„Ø§ ØªÙˆØ¬Ø¯ ÙˆØ¸Ø§Ø¦Ù Ø¨Ø¹Ø¯", pcm:"No work yet", ful:"Alaa golle" },
  checkBack:    { en:"Check back soon or post one yourself!", fr:"Revenez bientÃ´t ou publiez une offre!", ha:"Dawo cikin wuri ko wallafa aiki!", ar:"Ø¹Ø¯ Ù‚Ø±ÙŠØ¨Ù‹Ø§ Ø£Ùˆ Ø§Ù†Ø´Ø± ÙˆØ¸ÙŠÙØ©!", pcm:"Come back later or post work!", ful:"Ardi tuma É“ee ko fewtu!" },
  allJobs:      { en:"All Jobs", fr:"Tous les emplois", ha:"Duk Ayyuka", ar:"Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙˆØ¸Ø§Ø¦Ù", pcm:"All Work", ful:"Golle fof" },
  postJob:      { en:"Post a Job", fr:"Publier une offre", ha:"Wallafa Aiki", ar:"Ù†Ø´Ø± ÙˆØ¸ÙŠÙØ©", pcm:"Post Work", ful:"Fewtu Golle" },
  viewApply:    { en:"View & Apply â†’", fr:"Voir & Postuler â†’", ha:"Duba & Nema â†’", ar:"Ø¹Ø±Ø¶ ÙˆØªÙ‚Ø¯ÙŠÙ… â†’", pcm:"See & Apply â†’", ful:"Yii & DaÃ± â†’" },
  loadMore:     { en:"Load More Jobs", fr:"Charger plus d'offres", ha:"Æ˜ara ayyuka", ar:"ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ø²ÙŠØ¯", pcm:"Load more work", ful:"Nanngin Golleli" },
  loading2:     { en:"Loadingâ€¦", fr:"Chargementâ€¦", ha:"Ana lodiâ€¦", ar:"Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„â€¦", pcm:"Dey loadâ€¦", ful:"Nannginiiâ€¦" },
  remote:       { en:"Remote", fr:"TÃ©lÃ©travail", ha:"Nesa", ar:"Ø¹Ù† Ø¨ÙØ¹Ø¯", pcm:"Online", ful:"E Æanndu" },
  negotiable:   { en:"Negotiable", fr:"NÃ©gociable", ha:"Ana tattaunawa", ar:"Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªÙØ§ÙˆØ¶", pcm:"E fit negotiate", ful:"Naggi" },
  salaryNotSpec:{ en:"Salary not specified", fr:"Salaire non prÃ©cisÃ©", ha:"Ba a ambaci albashi", ar:"Ø§Ù„Ø±Ø§ØªØ¨ ØºÙŠØ± Ù…Ø­Ø¯Ø¯", pcm:"No salary talk", ful:"Njobdi alaa" },
  closed:       { en:"â›” Closed â€” Deadline passed", fr:"â›” FermÃ© â€” DÃ©lai dÃ©passÃ©", ha:"â›” An rufe â€” lokaci ya Æ™are", ar:"â›” Ù…ØºÙ„Ù‚ â€” Ø§Ù†ØªÙ‡Ù‰ Ø§Ù„Ù…ÙˆØ¹Ø¯", pcm:"â›” E don close", ful:"â›” Uddii" },
  closingSoon:  { en:"â° Closing soon", fr:"â° Ferme bientÃ´t", ha:"â° Zai Æ™are", ar:"â° ÙŠÙ†ØªÙ‡ÙŠ Ù‚Ø±ÙŠØ¨Ù‹Ø§", pcm:"â° E go close", ful:"â° Æennoo seeÉ—a" },
  today:        { en:"Today!", fr:"Aujourd'hui!", ha:"Yau!", ar:"Ø§Ù„ÙŠÙˆÙ…!", pcm:"Today!", ful:"Hannde!" },
  dLeft:        { en:"d left", fr:"j restants", ha:"kwanaki", ar:"Ø£ÙŠØ§Ù…", pcm:"days left", ful:"balÉ—e" },
};

function s(key: string, lang: string): string {
  return STR[key]?.[lang] ?? STR[key]?.["en"] ?? key;
}

// â”€â”€â”€ Helpers (NO hook calls inside plain functions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function fmtSalary(min: number | undefined, max: number | undefined, lang: string, notSpecLabel: string): string {
  if (!min && !max) return notSpecLabel;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000     ? `${Math.round(n / 1_000)}k` : `${n}`;
  if (min && max) return `${fmt(min)} â€“ ${fmt(max)} XAF`;
  if (min) return lang === "fr" ? `Ã€ partir de ${fmt(min)} XAF` : `From ${fmt(min)} XAF`;
  return lang === "fr" ? `Jusqu'Ã  ${fmt(max!)} XAF` : `Up to ${fmt(max!)} XAF`;
}

function daysUntilDeadline(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}

function timeAgo(dateStr: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return lang === "fr" ? "Aujourd'hui" : lang === "ar" ? "Ø§Ù„ÙŠÙˆÙ…" : "Today";
  if (diff === 1) return lang === "fr" ? "Il y a 1j" : lang === "ar" ? "Ù…Ù†Ø° ÙŠÙˆÙ…" : "1d ago";
  return lang === "fr" ? `Il y a ${diff}j` : lang === "ar" ? `Ù…Ù†Ø° ${diff} Ø£ÙŠØ§Ù…` : `${diff}d ago`;
}

const JOB_TYPE_LABELS: Record<string, Record<string, string>> = {
  full_time:  { en:"Full-time",  fr:"Temps plein",   ar:"Ø¯ÙˆØ§Ù… ÙƒØ§Ù…Ù„",  ha:"Cikakken lokaci", pcm:"Full time",  ful:"Waktu fof" },
  part_time:  { en:"Part-time",  fr:"Temps partiel", ar:"Ø¯ÙˆØ§Ù… Ø¬Ø²Ø¦ÙŠ",  ha:"Rabin lokaci",    pcm:"Half time",  ful:"Waktu didi" },
  contract:   { en:"Contract",   fr:"Contrat",       ar:"Ø¹Ù‚Ø¯",         ha:"Kwantiragi",      pcm:"Contract",   ful:"Kontoraaji" },
  internship: { en:"Internship", fr:"Stage",         ar:"ØªØ¯Ø±ÙŠØ¨",       ha:"Horarwa",         pcm:"Training",   ful:"Jannginagol" },
  freelance:  { en:"Freelance",  fr:"Freelance",     ar:"Ø­Ø±",          ha:"Yanci",           pcm:"Freelance",  ful:"Freelance" },
  temporary:  { en:"Temporary",  fr:"Temporaire",    ar:"Ù…Ø¤Ù‚Øª",        ha:"Wucin gadi",      pcm:"Small time", ful:"SeeÉ—a" },
};

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const JobsCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate     = useNavigate();
  const lang         = useLang();  // â† hook called correctly at component top-level
  const dir          = lang === "ar" ? "rtl" : "ltr";

  const slug       = category ? decodeURIComponent(category).toLowerCase() : "";
  const meta       = CATEGORY_MAP[slug];
  const label      = meta?.label  ?? (category ? decodeURIComponent(category).replace(/-/g, " ") : "All");
  const emoji      = meta?.emoji  ?? "ðŸ’¼";
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
          <span>â€º</span>
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
            <p className="text-4xl mb-3">âš ï¸</p>
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
          // pass lang to fmtSalary â€” no hook call inside plain fn
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
                    : `${s("closingSoon", lang)} â€” ${deadlineDays === 0 ? s("today", lang) : `${deadlineDays} ${s("dLeft", lang)}`}`}
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
                  ) : "ðŸ’¼"}
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
                    {job.location.region ? ` Â· ${job.location.region}` : ""}
                    {job.isRemote && ` Â· ðŸŒ ${s("remote", lang)}`}
                    {" Â· "}
                    <span className="text-teal-600 dark:text-teal-400 font-medium">{displayType}</span>
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">
                      ðŸ’° {salaryText}
                      {job.isSalaryNegotiable && (
                        <span className="text-gray-400 text-xs font-normal"> Â· {s("negotiable", lang)}</span>
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
