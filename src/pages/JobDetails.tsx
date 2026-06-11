/**
 * src/pages/JobDetails.tsx
 * Bambeh Marketplace — Job Listing Detail Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * ✅ Queries listings table (type='job') via jobs.service
 * ✅ Full i18n — EN / FR / HA / AR / PCM / FUL
 * ✅ Apply methods: WhatsApp, Phone call, Email, In-app
 * ✅ Duplicate-application detection (already_applied)
 * ✅ Save / Share
 * ✅ Deadline / expiry display
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Briefcase, DollarSign, Calendar,
  Clock, Users, Globe, Bookmark, Share2, RefreshCw,
  AlertCircle, CheckCircle, Building2, Phone, Mail,
} from "lucide-react";
import { getJobById, incrementJobView, applyForJob } from "@/services/jobs.service";
import type { JobListing } from "@/types/src_types_items";
import { useLang } from "@/hooks/useAppLang";

// ─── i18n ─────────────────────────────────────────────────────────────────────
const STR: Record<string, Record<string, string>> = {
  back:           { en:"Back", fr:"Retour", ha:"Koma", ar:"رجوع", pcm:"Go back", ful:"Yahru" },
  loading:        { en:"Loading…", fr:"Chargement…", ha:"Ana lodi…", ar:"جارٍ التحميل…", pcm:"Dey load…", ful:"Nannginii…" },
  notFound:       { en:"Job not found", fr:"Offre introuvable", ha:"Ba a sami aiki ba", ar:"لم يتم العثور على وظيفة", pcm:"No find work", ful:"Golle yiylaaka" },
  tryAgain:       { en:"Try Again", fr:"Réessayer", ha:"Sake gwadawa", ar:"حاول مجددًا", pcm:"Try again", ful:"Eɗɗoo" },
  save:           { en:"Save", fr:"Sauvegarder", ha:"Ajiye", ar:"حفظ", pcm:"Save am", ful:"Sose" },
  saved:          { en:"Saved", fr:"Sauvegardé", ha:"An ajiye", ar:"تم الحفظ", pcm:"Saved", ful:"Sosaaɗo" },
  share:          { en:"Share", fr:"Partager", ha:"Raba", ar:"مشاركة", pcm:"Share am", ful:"Jokkondiral" },
  remote:         { en:"Remote OK", fr:"Télétravail", ha:"Nesa OK", ar:"عن بُعد", pcm:"Online work", ful:"E Ɓanndu" },
  monthly:        { en:"Monthly salary", fr:"Salaire mensuel", ha:"Albashin wata", ar:"الراتب الشهري", pcm:"Monthly pay", ful:"Njobdi koorka" },
  negotiable:     { en:"Salary negotiable", fr:"Salaire négociable", ha:"Ana tattaunawa", ar:"قابل للتفاوض", pcm:"E fit negotiate", ful:"Naggi" },
  deadline:       { en:"Application deadline", fr:"Date limite de candidature", ha:"Ƙarshen lokacin nema", ar:"آخر موعد للتقديم", pcm:"Last date to apply", ful:"Balɗe ɓennoo" },
  expired:        { en:"This offer has expired", fr:"Cette offre a expiré", ha:"Wannan tayin ya ƙare", ar:"انتهت صلاحية هذا العرض", pcm:"Dis work don expire", ful:"Golle ngon ɓenni" },
  description:    { en:"Job Description", fr:"Description du poste", ha:"Bayanin aiki", ar:"وصف الوظيفة", pcm:"Work description", ful:"Jaŋtugol Golle" },
  requirements:   { en:"Requirements & Skills", fr:"Exigences & Compétences", ha:"Buƙatun & Ƙwarewa", ar:"المتطلبات والمهارات", pcm:"Wetin dem need", ful:"Ko heɓetee" },
  benefits:       { en:"Benefits & Perks", fr:"Avantages", ha:"Fa'idojin", ar:"المزايا", pcm:"Bonus things", ful:"Nafaaji" },
  posted:         { en:"Posted", fr:"Publié le", ha:"An buga a", ar:"نُشر في", pcm:"Dem post am", ful:"Fewtiima" },
  candidates:     { en:"applicants", fr:"candidats", ha:"masu nema", ar:"متقدم", pcm:"people apply", ful:"jokkorɗe" },
  applyBtn:       { en:"Apply Now", fr:"Postuler maintenant", ha:"Nema yanzu", ar:"تقدم الآن", pcm:"Apply Now", ful:"Dañ Golle" },
  applying:       { en:"Sending application…", fr:"Envoi de la candidature…", ha:"Ana aika buƙata…", ar:"جارٍ الإرسال…", pcm:"Dey send…", ful:"Nannginii…" },
  applied:        { en:"Application sent!", fr:"Candidature envoyée!", ha:"An aika buƙatar!", ar:"تم إرسال الطلب!", pcm:"You don apply!", ful:"Jokku nannginaama!" },
  alreadyApplied: { en:"You already applied for this job", fr:"Vous avez déjà postulé", ha:"Kun riga kun nema wannan aiki", ar:"لقد تقدمت بالفعل", pcm:"You don already apply", ful:"Jokku ɗon nannginaama" },
  expiredBtn:     { en:"Offer Expired", fr:"Offre expirée", ha:"Tayi ya ƙare", ar:"انتهت صلاحيته", pcm:"Dis work don close", ful:"Ɓennii" },
  whatsapp:       { en:"Apply via WhatsApp", fr:"Postuler via WhatsApp", ha:"Nema ta WhatsApp", ar:"تقدم عبر واتساب", pcm:"Apply for WhatsApp", ful:"Jokku e WhatsApp" },
  callApply:      { en:"Call to Apply", fr:"Appeler pour postuler", ha:"Kira don nema", ar:"اتصل للتقديم", pcm:"Call to apply", ful:"Noddu ngam jokkude" },
  emailApply:     { en:"Apply via Email", fr:"Postuler par email", ha:"Nema ta email", ar:"تقدم عبر البريد", pcm:"Apply by email", ful:"Jokku e imeel" },
  loginRequired:  { en:"Please log in to apply", fr:"Connectez-vous pour postuler", ha:"Shiga don nema", ar:"سجل الدخول للتقديم", pcm:"You need login first", ful:"Naatir ngam jokkude" },
  salaryNotSpec:  { en:"Salary not specified", fr:"Salaire non précisé", ha:"Ba a ambaci albashi", ar:"الراتب غير محدد", pcm:"No salary talk", ful:"Njobdi alaa" },
  fullTime:       { en:"Full-time", fr:"Temps plein", ha:"Cikakken lokaci", ar:"دوام كامل", pcm:"Full time", ful:"Waktu fof" },
  partTime:       { en:"Part-time", fr:"Temps partiel", ha:"Rabin lokaci", ar:"دوام جزئي", pcm:"Half time", ful:"Waktu didi" },
  contract:       { en:"Contract", fr:"Contrat", ha:"Kwantiragi", ar:"عقد", pcm:"Contract", ful:"Kontoraaji" },
  internship:     { en:"Internship", fr:"Stage", ha:"Horarwa", ar:"تدريب", pcm:"Training", ful:"Jannginagol" },
  freelance:      { en:"Freelance", fr:"Freelance", ha:"Yanci", ar:"حر", pcm:"Freelance", ful:"Freelance" },
  temporary:      { en:"Temporary", fr:"Temporaire", ha:"Wucin gadi", ar:"مؤقت", pcm:"Small time", ful:"Seeɗa" },
};

function s(key: string, lang: string): string {
  return STR[key]?.[lang] ?? STR[key]?.["en"] ?? key;
}

const JOB_TYPE_KEY: Record<string, string> = {
  full_time: "fullTime", part_time: "partTime",
  contract: "contract", internship: "internship",
  freelance: "freelance", temporary: "temporary",
};

const EXP_LABELS: Record<string, Record<string, string>> = {
  no_experience: { en:"No experience needed", fr:"Sans expérience", ha:"Ba tare da kwarewa ba", ar:"بدون خبرة", pcm:"No experience needed", ful:"Alaa karallaagal" },
  entry:         { en:"Entry level (0–2 yrs)", fr:"Débutant (0–2 ans)", ha:"Farawa (0–2 shekara)", ar:"مبتدئ (0–2 سنة)", pcm:"Starter (0-2 yrs)", ful:"Sappoowo (0-2)" },
  mid:           { en:"Mid level (2–5 yrs)", fr:"Intermédiaire (2–5 ans)", ha:"Matsakaici (2–5)", ar:"متوسط (2–5 سنة)", pcm:"Middle level (2-5)", ful:"Seeɗum (2-5)" },
  senior:        { en:"Senior (5+ yrs)", fr:"Senior (5+ ans)", ha:"Babba (5+)", ar:"خبير (5+ سنة)", pcm:"Big man level (5+)", ful:"Mawɗo (5+)" },
  executive:     { en:"Executive level", fr:"Cadre dirigeant", ha:"Manajan", ar:"مسؤول تنفيذي", pcm:"Big boss level", ful:"Jom Laamu" },
};

function fmtSalary(min: number | undefined, max: number | undefined, lang: string): string {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;
  const locale = lang === "fr" ? "fr-CM" : "en-CM";
  if (min && max) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(min)} – ${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(max)} FCFA`;
  }
  if (min) return `${lang === "fr" ? "À partir de" : "From"} ${fmt(min)} FCFA`;
  if (max) return `${lang === "fr" ? "Jusqu'à" : "Up to"} ${fmt(max!)} FCFA`;
  return s("salaryNotSpec", lang);
}

// ─── Component ────────────────────────────────────────────────────────────────
const JobDetails: React.FC = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const lang       = useLang();
  const dir        = lang === "ar" ? "rtl" : "ltr";

  const [job,      setJob]      = useState<JobListing | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [saved,    setSaved]    = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied,  setApplied]  = useState(false);
  const [applyMsg, setApplyMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiErr } = await getJobById(id);
      if (apiErr || !data) {
        setError(apiErr ?? s("notFound", lang));
        return;
      }
      setJob(data);
      void incrementJobView(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : s("notFound", lang));
    } finally {
      setLoading(false);
    }
  }, [id, lang]);

  useEffect(() => { void load(); }, [load]);

  // ── Apply handler ────────────────────────────────────────────────────────────
  const handleApply = useCallback(async () => {
    if (!job) return;
    const applyMethod = (job as any).applyMethod ?? "in_app";
    const applyContact = (job as any).applyContact ?? "";

    if (applyMethod === "whatsapp" && applyContact) {
      const msg = encodeURIComponent(`Hello, I am interested in the "${job.title}" position at ${job.company ?? "your company"}.`);
      const phone = applyContact.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      return;
    }
    if (applyMethod === "call" && applyContact) {
      window.location.href = `tel:${applyContact}`;
      return;
    }
    if (applyMethod === "email" && applyContact) {
      const subject = encodeURIComponent(`Application for ${job.title}`);
      const body = encodeURIComponent(`Hello,\n\nI am interested in applying for the ${job.title} position.\n\nPlease find my details attached.\n\nThank you.`);
      window.location.href = `mailto:${applyContact}?subject=${subject}&body=${body}`;
      return;
    }

    // In-app apply — requires auth
    const { supabase } = await import("@/lib/supabase");
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate("/login");
      return;
    }

    setApplying(true);
    setApplyMsg(null);

    const result = await applyForJob(job.id, session.session.user.id);

    if (result.error === "already_applied") {
      setApplyMsg(s("alreadyApplied", lang));
      setApplied(true);
    } else if (result.success) {
      setApplied(true);
      setApplyMsg(s("applied", lang));
    } else {
      setApplyMsg(result.error ?? "Error");
    }
    setApplying(false);
  }, [job, navigate, lang]);

  const handleShare = useCallback(async () => {
    if (!job) return;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: job.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [job]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">{s("loading", lang)}</span>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !job) {
    return (
      <div className="p-4 space-y-3" dir={dir}>
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600">
          <ArrowLeft className="w-4 h-4" /> {s("back", lang)}
        </button>
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error ?? s("notFound", lang)}</p>
        </div>
        <button onClick={() => void load()}
          className="mt-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
          {s("tryAgain", lang)}
        </button>
      </div>
    );
  }

  const isExpired = job.applicationDeadline
    ? new Date(job.applicationDeadline) < new Date()
    : false;

  const jobTypeLabel = s(JOB_TYPE_KEY[job.jobType] ?? job.jobType, lang);
  const expLabel     = EXP_LABELS[job.experienceLevel]?.[lang] ?? job.experienceLevel;
  const applyMethod  = (job as any).applyMethod ?? "in_app";
  const applyContact = (job as any).applyContact ?? "";

  // ── Apply button label ──────────────────────────────────────────────────────
  let applyBtnLabel = s("applyBtn", lang);
  let ApplyIcon: React.FC<{ className?: string }> = ({ className }) => <Briefcase className={className} />;
  if (applyMethod === "whatsapp") {
    applyBtnLabel = s("whatsapp", lang);
    ApplyIcon = ({ className }) => <span className={className}>💬</span>;
  } else if (applyMethod === "call") {
    applyBtnLabel = s("callApply", lang);
    ApplyIcon = ({ className }) => <Phone className={className} />;
  } else if (applyMethod === "email") {
    applyBtnLabel = s("emailApply", lang);
    ApplyIcon = ({ className }) => <Mail className={className} />;
  }

  return (
    <div className="max-w-lg mx-auto pb-28" dir={dir}>

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={s("back", lang)}>
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="flex-1 text-base font-semibold text-gray-900 dark:text-white truncate">
          {job.title}
        </h1>
        <button type="button" onClick={() => setSaved((v) => !v)}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={saved ? s("saved", lang) : s("save", lang)}>
          <Bookmark className={`w-5 h-5 transition-colors ${saved ? "text-teal-600 fill-teal-600" : "text-gray-400"}`} />
        </button>
        <button type="button" onClick={handleShare}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={s("share", lang)}>
          <Share2 className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-4 space-y-5">

        {/* Company + title */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center
                          justify-center border border-teal-200 dark:border-teal-700 flex-shrink-0">
            <Building2 className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h2>
            {job.company && (
              <p className="text-sm text-teal-600 font-medium">{job.company}</p>
            )}
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{job.location.city}</span>
              {job.location.region && (
                <span className="text-xs text-gray-400">· {job.location.region}</span>
              )}
              {job.isRemote && (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-500 ml-1" />
                  <span className="text-xs text-blue-600 font-medium">{s("remote", lang)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-full text-xs font-medium text-teal-700 dark:text-teal-300">
            <Briefcase className="w-3.5 h-3.5" />
            {jobTypeLabel}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
            <Users className="w-3.5 h-3.5" />
            {expLabel}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {job.applicationCount} {s("candidates", lang)}
          </span>
        </div>

        {/* Salary */}
        {(job.salaryMinXAF || job.salaryMaxXAF) && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">{s("monthly", lang)}</p>
                <p className="text-lg font-bold text-green-800 dark:text-green-300">
                  {fmtSalary(job.salaryMinXAF, job.salaryMaxXAF, lang)}
                </p>
                {job.isSalaryNegotiable && (
                  <p className="text-xs text-green-600 mt-0.5">{s("negotiable", lang)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deadline */}
        {job.applicationDeadline && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border ${isExpired ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"}`}>
            <Calendar className={`w-4 h-4 flex-shrink-0 ${isExpired ? "text-red-500" : "text-yellow-600"}`} />
            <p className={`text-sm font-medium ${isExpired ? "text-red-600 dark:text-red-400" : "text-yellow-700 dark:text-yellow-400"}`}>
              {isExpired ? s("expired", lang) : s("deadline", lang)} :{" "}
              {new Date(job.applicationDeadline).toLocaleDateString(
                lang === "fr" ? "fr-CM" : "en-CM",
                { day: "numeric", month: "long", year: "numeric" }
              )}
            </p>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{s("description", lang)}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{s("requirements", lang)}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && (
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{s("benefits", lang)}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {job.benefits}
            </p>
          </div>
        )}

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Posted date */}
        <p className="text-xs text-gray-400">
          {s("posted", lang)} {new Date(job.createdAt).toLocaleDateString(
            lang === "fr" ? "fr-CM" : "en-CM",
            { day: "numeric", month: "long", year: "numeric" }
          )}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 space-y-2">
        {applyMsg && (
          <p className={`text-center text-xs font-medium ${applied ? "text-green-600" : "text-red-500"}`}>
            {applyMsg}
          </p>
        )}

        {applied && applyMethod === "in_app" ? (
          <div className="flex items-center justify-center gap-2 py-3.5 bg-green-100 dark:bg-green-900/30
                          border border-green-300 dark:border-green-700 rounded-xl text-green-700 dark:text-green-400 font-semibold">
            <CheckCircle className="w-5 h-5" />
            {s("applied", lang)}
          </div>
        ) : isExpired && applyMethod === "in_app" ? (
          <div className="py-3.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-center text-gray-500 dark:text-gray-400 font-medium">
            {s("expiredBtn", lang)}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-70
                       text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {applying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ApplyIcon className="w-4 h-4" />
            )}
            {applying ? s("applying", lang) : applyBtnLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
