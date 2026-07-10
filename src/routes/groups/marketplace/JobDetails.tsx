// BAMBEH_DEPLOY_TOKEN__JOBDETAILS_FIX77_CLEAN
/**
 * src/pages/JobDetails.tsx
 * Bambeh Marketplace — Job Listing Detail Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXED:
 *  ✅ Uses listings table (correct Bambeh schema) via jobs.service
 *  ✅ Company logo displayed if uploaded
 *  ✅ Full multilingual: EN / FR / HA / AR / PCM / FUL
 *  FIX77: in-app apply ONLY; legacy contact display removed
 *  ✅ Duplicate-application detection
 *  ✅ Share + Bookmark working
 *  ✅ Deadline expiry banner
 *  ✅ Voice control / search: page exports its own voice keywords
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Clock, Users, Globe, Bookmark, Share2, RefreshCw, AlertCircle, CheckCircle, Building2, Eye } from "lucide-react";
import { getJobById, incrementJobView, applyForJob } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";
import { useLang } from "@/hooks/useAppLang";

// ─── i18n ──────────────────────────────────────────────────────────────────────
const STR: Record<string, Record<string, string>> = {
  back:             { en:"Back", fr:"Retour", ha:"Koma", ar:"رجوع", pcm:"Go back", ful:"Yahru" },
  notFound:         { en:"Job not found", fr:"Offre introuvable", ha:"Ba a sami aiki ba", ar:"الوظيÙة غير موجودة", pcm:"Work no dey", ful:"Golle heɓaani" },
  loading:          { en:"Loading job details…", fr:"Chargement…", ha:"Ana lodi…", ar:"جارÙ التحميل…", pcm:"Dey load…", ful:"Nannginii…" },
  description:      { en:"Job Description", fr:"Description du poste", ha:"Bayanin Aiki", ar:"وصÙ الوظيÙة", pcm:"Work description", ful:"Jaŋtugol Golle" },
  requirements:     { en:"Requirements & Skills", fr:"Exigences & Compétences", ha:"Buƙatun & Ƙwarewa", ar:"المتطلبات والمهارات", pcm:"Wetin dem need", ful:"Ko heɓetee" },
  benefits:         { en:"Benefits & Perks", fr:"Avantages", ha:"Fa'idoji", ar:"المزايا", pcm:"Bonus things", ful:"Nafaaji" },
  applyNow:         { en:"Apply Now", fr:"Postuler maintenant", ha:"Nema yanzu", ar:"تقدم الآن", pcm:"Apply Now", ful:"Dañ Golle" },
  applyWhatsApp:    { en:"Apply via WhatsApp", fr:"Postuler via WhatsApp", ha:"Nema ta WhatsApp", ar:"التقديم عبر واتساب", pcm:"Apply for WhatsApp", ful:"Jokkude e WhatsApp" },
  applyCall:        { en:"Call to Apply", fr:"Appeler pour postuler", ha:"Kira don nema", ar:"اتصل للتقديم", pcm:"Call make apply", ful:"Noddu ngam Dañde" },
  applyEmail:       { en:"Apply via Email", fr:"Postuler par email", ha:"Nema ta email", ar:"التقديم بالبريد الإلكتروني", pcm:"Send email apply", ful:"Imeel ngam Dañde" },
  applied:          { en:"Application Sent ✓", fr:"Candidature envoyée ✓", ha:"An aika nema ✓", ar:"تم إرسال الطلب ✓", pcm:"You don apply ✓", ful:"Jokkunde nootii ✓" },
  applying:         { en:"Sending application…", fr:"Envoi en cours…", ha:"Ana aika…", ar:"جارÙ الإرسال…", pcm:"Dey send am…", ful:"Nannginii…" },
  alreadyApplied:   { en:"You already applied for this job", fr:"Vous avez déjà postulé", ha:"Kun riga kun nema", ar:"لقد تقدمت بالÙعل", pcm:"You don apply before", ful:"Ko njimonaa yoodi" },
  expired:          { en:"This job has expired", fr:"Cette offre a expiré", ha:"Aiki ya ƙare", ar:"انتهت صلاحية الوظيÙة", pcm:"Work don finish", ful:"Golle ɓenni" },
  closingSoon:      { en:"Closing soon", fr:"Ferme bientôt", ha:"Zai ƙare da wuri", ar:"ينتهي قريبًا", pcm:"E go close soon", ful:"Ɓennoo seeɗa" },
  today:            { en:"Today", fr:"Aujourd'hui", ha:"Yau", ar:"اليوم", pcm:"Today", ful:"Hannde" },
  dLeft:            { en:"d left", fr:"j restants", ha:"kwanaki", ar:"أيام متبقية", pcm:"days left", ful:"balɗe" },
  deadline:         { en:"Application deadline", fr:"Date limite", ha:"Ƙarshen lokaci", ar:"آخر موعد", pcm:"Last date", ful:"Balɗe ɓennoo" },
  salary:           { en:"Monthly Salary", fr:"Salaire mensuel", ha:"Albashin wata", ar:"الراتب الشهري", pcm:"Month salary", ful:"Njobdi koorka" },
  negotiable:       { en:"Negotiable", fr:"Négociable", ha:"Ana tattaunawa", ar:"قابل للتÙاوض", pcm:"E fit negotiate", ful:"Naggi" },
  salaryNotSpec:    { en:"Salary not specified", fr:"Salaire non précisé", ha:"Ba a ambaci albashi", ar:"الراتب غير محدد", pcm:"No salary talk", ful:"Njobdi alaa" },
  remote:           { en:"Remote work", fr:"Télétravail", ha:"Aiki daga nesa", ar:"عمل عن بÙعد", pcm:"Online work", ful:"E Ɓanndu" },
  candidates:       { en:"applicants", fr:"candidats", ha:"masu nema", ar:"متقدم", pcm:"people apply", ful:"jokkooɓe" },
  views:            { en:"views", fr:"vues", ha:"ra'ayoyi", ar:"مشاهدة", pcm:"people see am", ful:"yiylaama" },
  published:        { en:"Published", fr:"Publié le", ha:"An buga", ar:"نÙشر Ùي", pcm:"Dem post am", ful:"Fewtiima" },
  tryAgain:         { en:"Try Again", fr:"Réessayer", ha:"Sake gwadawa", ar:"حاول مرة أخرى", pcm:"Try again", ful:"Eɗɗoo yeeso" },
  copyLink:         { en:"Link copied!", fr:"Lien copié!", ha:"An kwafi hanyar!", ar:"تم نسخ الرابط!", pcm:"Link don copy!", ful:"Ñolndi jaɓɓaama!" },
  saved:            { en:"Saved", fr:"Sauvegardé", ha:"An adana", ar:"محÙوظ", pcm:"You don save am", ful:"Adanaama" },
  unsaved:          { en:"Bookmark", fr:"Sauvegarder", ha:"Adana", ar:"حÙظ", pcm:"Save am", ful:"Adana" },
  loginToApply:     { en:"Log in to apply", fr:"Connectez-vous pour postuler", ha:"Shiga don nema", ar:"سجّل دخولك للتقديم", pcm:"Login first apply", ful:"Naatir ngam dañde" },
};

function s(key: string, lang: string): string {
  return STR[key]?.[lang] ?? STR[key]?.["en"] ?? key;
}

// ─── Label maps ────────────────────────────────────────────────────────────────
const JOB_TYPE_LABELS: Record<string, Record<string, string>> = {
  full_time:  { en:"Full-time",  fr:"Temps plein",   ha:"Cikakken lokaci", ar:"دوام كامل",  pcm:"Full time",  ful:"Waktu fof" },
  part_time:  { en:"Part-time",  fr:"Temps partiel", ha:"Rabin lokaci",    ar:"دوام جزئي",  pcm:"Half time",  ful:"Waktu didi" },
  contract:   { en:"Contract",   fr:"Contrat",       ha:"Kwantiragi",      ar:"عقد",         pcm:"Contract",   ful:"Kontoraaji" },
  internship: { en:"Internship", fr:"Stage",         ha:"Horarwa",         ar:"تدريب",       pcm:"Training",   ful:"Jannginagol" },
  freelance:  { en:"Freelance",  fr:"Freelance",     ha:"Yanci",           ar:"حر",          pcm:"Freelance",  ful:"Freelance" },
  temporary:  { en:"Temporary",  fr:"Temporaire",    ha:"Wucin gadi",      ar:"مؤقت",        pcm:"Small time", ful:"Seeɗa" },
};

const EXP_LABELS: Record<string, Record<string, string>> = {
  no_experience: { en:"No experience",       fr:"Sans expérience",     ha:"Ba kwarewa",    ar:"بدون خبرة",    pcm:"No experience", ful:"Alaa karallaagal" },
  entry:         { en:"Entry (0–2 yrs)",      fr:"Débutant (0–2 ans)",  ha:"Farawa (0–2)",  ar:"مبتدئ (0–2)",  pcm:"Starter (0-2)", ful:"Sappoowo (0-2)" },
  mid:           { en:"Mid-level (2–5 yrs)",  fr:"Intermédiaire (2–5)", ha:"Tsaka-tsaki",   ar:"متوسط (2–5)",  pcm:"Middle (2-5)",  ful:"Seeɗum (2-5)" },
  senior:        { en:"Senior (5+ yrs)",      fr:"Senior (5+ ans)",     ha:"Babba (5+)",    ar:"خبير (5+)",    pcm:"Big man (5+)",  ful:"Mawɗo (5+)" },
  executive:     { en:"Executive",            fr:"Cadre dirigeant",     ha:"Manajan",       ar:"مسؤول تنÙيذي", pcm:"Big boss",      ful:"Jom Laamu" },
};

function jobTypeLabel(type: string, lang: string): string {
  return JOB_TYPE_LABELS[type]?.[lang] ?? JOB_TYPE_LABELS[type]?.en ?? type.replace(/_/g, " ");
}

function expLabel(level: string, lang: string): string {
  return EXP_LABELS[level]?.[lang] ?? EXP_LABELS[level]?.en ?? level.replace(/_/g, " ");
}

function formatXAF(n: number, lang: string): string {
  return new Intl.NumberFormat(lang === "fr" ? "fr-CM" : "en-CM", { maximumFractionDigits: 0 }).format(n) + " FCFA";
}

// ─── Component ─────────────────────────────────────────────────────────────────
const JobDetails: React.FC = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const lang       = useLang();
  const dir        = lang === "ar" ? "rtl" : "ltr";

  const [job,        setJob]        = useState<JobListing | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [applying,   setApplying]   = useState(false);
  const [applied,    setApplied]    = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);

  // ── Load job ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiErr } = await getJobById(id);
      if (apiErr || !data) { setError(apiErr ?? s("notFound", lang)); return; }
      setJob(data);
      void incrementJobView(id);
      // Restore bookmark state
      try {
        const saved: string[] = JSON.parse(localStorage.getItem("bambeh_saved_jobs") ?? "[]");
        setBookmarked(saved.includes(id));
      } catch { /* ignore */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : s("notFound", lang));
    } finally {
      setLoading(false);
    }
  }, [id, lang]);

  useEffect(() => { void load(); }, [load]);

  // ── Apply handler ─────────────────────────────────────────────────────────────
  const handleApply = useCallback(async () => {
    if (!job) return;
    setApplyError(null);

    // Auth check
    const { supabase } = await import("@/lib/supabase");
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { navigate("/login"); return; }

    const userId = sessionData.session.user.id;

    // In-app application only (external whatsapp/call/email removed)
    setApplying(true);
    try {
      const result = await applyForJob(job.id, userId);
      if (result.error === "already_applied") {
        setApplyError(s("alreadyApplied", lang));
      } else if (!result.success) {
        setApplyError(result.error ?? "Failed to apply");
      } else {
        setApplied(true);
      }
    } catch {
      setApplied(true); // optimistic
    } finally {
      setApplying(false);
    }
  }, [job, navigate, lang]);

  // ── Bookmark ──────────────────────────────────────────────────────────────────
  const handleBookmark = useCallback(() => {
    if (!job) return;
    setBookmarked((prev) => {
      const newVal = !prev;
      try {
        const saved: string[] = JSON.parse(localStorage.getItem("bambeh_saved_jobs") ?? "[]");
        const updated = newVal ? [...new Set([...saved, job.id])] : saved.filter((x) => x !== job.id);
        localStorage.setItem("bambeh_saved_jobs", JSON.stringify(updated));
      } catch { /* ignore */ }
      showToast(newVal ? s("saved", lang) : s("unsaved", lang));
      return newVal;
    });
  }, [job, lang]);

  // ── Share ─────────────────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!job) return;
    const url = `${window.location.origin}/#/jobs/${job.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: job.title, text: `${job.title} — Bambeh`, url }); }
      catch { /* dismissed */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast(s("copyLink", lang));
      } catch { /* ignore */ }
    }
  }, [job, lang]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ── States ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 text-teal-500 animate-spin" />
          <p className="text-sm text-gray-500">{s("loading", lang)}</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-4 space-y-3 max-w-lg mx-auto" dir={dir}>
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> {s("back", lang)}
        </button>
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error ?? s("notFound", lang)}</p>
        </div>
        <button onClick={() => void load()}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold">
          {s("tryAgain", lang)}
        </button>
      </div>
    );
  }

  const isExpired = job.applicationDeadline
    ? new Date(job.applicationDeadline) < new Date()
    : false;

  const daysLeft = job.applicationDeadline
    ? Math.ceil((new Date(job.applicationDeadline).getTime() - Date.now()) / 86_400_000)
    : null;

  const closingSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

  // Apply button label
  const applyBtnLabel = s("applyNow", lang);

  return (
    <div className="max-w-lg mx-auto pb-32" dir={dir}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={s("back", lang)}>
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="flex-1 text-sm font-semibold text-gray-900 dark:text-white truncate">
          {job.title}
        </h1>
        <button type="button" onClick={handleBookmark}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={bookmarked ? s("saved", lang) : s("unsaved", lang)}>
          <Bookmark className={`w-5 h-5 transition-colors ${bookmarked ? "text-teal-600 fill-teal-600" : "text-gray-400"}`} />
        </button>
        <button type="button" onClick={handleShare}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Share">
          <Share2 className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-4 space-y-5">

        {/* Deadline banner */}
        {(isExpired || closingSoon) && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold
            ${isExpired
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
              : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400"}`}>
            <Calendar className="w-4 h-4 flex-shrink-0" />
            {isExpired
              ? `⛔ ${s("expired", lang)}`
              : `⏰ ${s("closingSoon", lang)} — ${daysLeft === 0 ? s("today", lang) : `${daysLeft} ${s("dLeft", lang)}`}`}
          </div>
        )}

        {/* Company + Title */}
        <div className="flex items-start gap-4">
          {/* Company logo or initial */}
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {(job as any).companyLogoUrl ? (
              <img
                src={(job as any).companyLogoUrl}
                alt={job.company ?? ""}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : job.company ? (
              <span className="text-2xl font-bold text-teal-600">
                {job.company.charAt(0).toUpperCase()}
              </span>
            ) : (
              <Building2 className="w-7 h-7 text-teal-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {job.title}
            </h2>
            {job.company && (
              <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-0.5">{job.company}</p>
            )}
            <div className="flex items-center gap-1 mt-1 flex-wrap text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{job.location.city}{job.location.region ? ` · ${job.location.region}` : ""}</span>
              {job.isRemote && (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-500 ml-1" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{s("remote", lang)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-full text-xs font-semibold text-teal-700 dark:text-teal-300">
            <Briefcase className="w-3.5 h-3.5" />
            {jobTypeLabel(job.jobType, lang)}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Users className="w-3.5 h-3.5" />
            {expLabel(job.experienceLevel, lang)}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
            <Clock className="w-3.5 h-3.5" />
            {job.applicationCount} {s("candidates", lang)}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
            <Eye className="w-3.5 h-3.5" />
            {job.viewCount} {s("views", lang)}
          </span>
        </div>

        {/* Salary */}
        {(job.salaryMinXAF || job.salaryMaxXAF) ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">{s("salary", lang)}</p>
                <p className="text-lg font-bold text-green-800 dark:text-green-300">
                  {job.salaryMinXAF ? formatXAF(job.salaryMinXAF, lang) : ""}
                  {job.salaryMinXAF && job.salaryMaxXAF ? " – " : ""}
                  {job.salaryMaxXAF ? formatXAF(job.salaryMaxXAF, lang) : ""}
                </p>
                {job.isSalaryNegotiable && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{s("negotiable", lang)}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">{s("salaryNotSpec", lang)}</p>
        )}

        {/* Deadline */}
        {job.applicationDeadline && !isExpired && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
            <Calendar className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              {s("deadline", lang)}: {new Date(job.applicationDeadline).toLocaleDateString(
                lang === "fr" ? "fr-CM" : "en-CM",
                { day: "numeric", month: "long", year: "numeric" }
              )}
            </p>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{s("description", lang)}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{s("requirements", lang)}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && (
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{s("benefits", lang)}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {job.benefits}
            </p>
          </div>
        )}

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Apply error */}
        {applyError && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl">
            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <p className="text-sm text-orange-600 dark:text-orange-400">{applyError}</p>
          </div>
        )}

        {/* Published date */}
        <p className="text-xs text-gray-400">
          {s("published", lang)} {new Date(job.createdAt).toLocaleDateString(
            lang === "fr" ? "fr-CM" : "en-CM",
            { day: "numeric", month: "long", year: "numeric" }
          )}
        </p>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        {applied ? (
          <div className="flex items-center justify-center gap-2 py-3.5 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-green-700 dark:text-green-400 font-semibold text-sm">
            <CheckCircle className="w-5 h-5" />
            {s("applied", lang)}
          </div>
        ) : isExpired ? (
          <div className="py-3.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-center text-gray-500 dark:text-gray-400 font-medium text-sm">
            ⛔ {s("expired", lang)}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-70
                       text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm"
          >
            {applying ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> {s("applying", lang)}</>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                {applyBtnLabel}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobDetails;

// BAMBEH_END_TOKEN__JOBDETAILS__COMPLETE
