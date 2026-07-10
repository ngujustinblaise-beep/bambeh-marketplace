// BAMBEH_DEPLOY_TOKEN__POSTJOBPAGE_FIX73_CLEAN
/**
 * src/pages/PostJobPage.tsx
 * Bambeh Marketplace — Post a Job
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * ✅ Full i18n — EN / FR / HA / AR / PCM / FUL
 * ✅ Auth-gated — redirects to /login if not signed in
 * ✅ Apply method: In-app Bambeh chat ONLY (platform contact policy)
 * ✅ Writes to listings table (type='job') via jobs.service
 * ✅ After posting, redirects to the new job's detail page
 * ✅ Zero external dependencies beyond what Bambeh already uses
 */

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Loader2, CheckCircle } from "lucide-react";
import { createJob } from "@/services/jobs.service";
import { useLang } from "@/hooks/useAppLang";

// ─── i18n ─────────────────────────────────────────────────────────────────────
const STR: Record<string, Record<string, string>> = {
  pageTitle:       { en:"Post a Job", fr:"Publier une offre", ha:"Wallafa Aiki", ar:"نشر وظيÙة", pcm:"Post Work", ful:"Fewtu Golle" },
  back:            { en:"Back", fr:"Retour", ha:"Koma", ar:"رجوع", pcm:"Go back", ful:"Yahru" },
  subtitle:        { en:"Find the right talent across Cameroon", fr:"Trouvez les meilleurs talents au Cameroun", ha:"Samu gwanin ma'aikata a Kamaru", ar:"اعثر على المواهب Ùي الكاميرون", pcm:"Find correct person for Cameroon", ful:"Yiydaa ɗoo e Kameruun" },
  jobTitle:        { en:"Job Title *", fr:"Intitulé du poste *", ha:"Sunan Aiki *", ar:"المسمى الوظيÙي *", pcm:"Work Name *", ful:"Innde Golle *" },
  jobTitlePh:      { en:"e.g. Senior Software Engineer", fr:"ex. Ingénieur logiciel senior", ha:"mis. Babban Injiniya", ar:"مثل: مهندس برمجيات أول", pcm:"e.g. Big software engineer", ful:"taa. Injiniir ɓaleejo" },
  company:         { en:"Company / Organisation", fr:"Entreprise / Organisation", ha:"Kamfani / Ƙungiya", ar:"الشركة / المؤسسة", pcm:"Company / Organisation", ful:"Liggey / Ƙulle" },
  companyPh:       { en:"Name of your company", fr:"Nom de votre entreprise", ha:"Sunan kamfaninka", ar:"اسم شركتك", pcm:"Your company name", ful:"Innde liggey maa" },
  category:        { en:"Job Category *", fr:"Catégorie *", ha:"Nau'in Aiki *", ar:"الÙئة *", pcm:"Work type *", ful:"Suudu Golle *" },
  jobType:         { en:"Employment Type *", fr:"Type de contrat *", ha:"Nau'in kwantiragi *", ar:"نوع التوظيÙ *", pcm:"Work arrangement *", ful:"Suudu Kontoraaji *" },
  experienceLevel: { en:"Experience Level *", fr:"Niveau d'expérience *", ha:"Matakin ƙwarewa *", ar:"مستوى الخبرة *", pcm:"Experience level *", ful:"Karallaagal *" },
  location:        { en:"City / Location *", fr:"Ville / Lieu *", ha:"Gari / Wuri *", ar:"المدينة / الموقع *", pcm:"Town / Place *", ful:"Wuro / Ɓoggol *" },
  locationPh:      { en:"e.g. Douala, Yaoundé…", fr:"ex. Douala, Yaoundé…", ha:"mis. Douala, Yaoundé…", ar:"مثل: دوالا، ياوندي…", pcm:"e.g. Douala, Yaoundé…", ful:"taa. Douala, Yaoundé…" },
  region:          { en:"Region", fr:"Région", ha:"Yanki", ar:"المنطقة", pcm:"Region", ful:"Leydi" },
  isRemote:        { en:"Remote work available", fr:"Télétravail possible", ha:"Ana iya aiki daga nesa", ar:"يتوÙر عمل عن بÙعد", pcm:"Online work dey", ful:"E Ɓanndu ɗon" },
  salaryMin:       { en:"Min Salary (FCFA/month)", fr:"Salaire min (FCFA/mois)", ha:"Ƙaramin albashi (FCFA/wata)", ar:"الحد الأدنى للراتب (Ùرنك/شهر)", pcm:"Small salary (FCFA/month)", ful:"Njobdi bilahi (FCFA/koorka)" },
  salaryMax:       { en:"Max Salary (FCFA/month)", fr:"Salaire max (FCFA/mois)", ha:"Babban albashi (FCFA/wata)", ar:"الحد الأقصى للراتب", pcm:"Big salary (FCFA/month)", ful:"Njobdi heeli (FCFA/koorka)" },
  salaryPh:        { en:"e.g. 150000", fr:"ex. 150000", ha:"mis. 150000", ar:"مثل: 150000", pcm:"e.g. 150000", ful:"taa. 150000" },
  negotiable:      { en:"Salary is negotiable", fr:"Salaire négociable", ha:"Albashin ana tattaunawa", ar:"الراتب قابل للتÙاوض", pcm:"Salary e fit talk", ful:"Njobdi naggi" },
  deadline:        { en:"Application Deadline", fr:"Date limite de candidature", ha:"Ƙarshen lokacin nema", ar:"آخر موعد للتقديم", pcm:"Last date to apply", ful:"Balɗe ɓennoo" },
  description:     { en:"Job Description *", fr:"Description du poste *", ha:"Bayanin aiki *", ar:"وصÙ الوظيÙة *", pcm:"Work description *", ful:"Jaŋtugol Golle *" },
  descPh:          { en:"Describe the role, responsibilities, and what a typical day looks like…", fr:"Décrivez le poste, les responsabilités, et le quotidien du rôle…", ha:"Bayyana aikin, ayyuka, da abin da rana ta yau da kullun take kama da…", ar:"اوصÙ الدور والمسؤوليات ويوم العمل المعتاد…", pcm:"Tell us wetin the work be, wetin dem go do everyday…", ful:"Jaŋtu golle ndee, ko waɗɗataake, ko haaletee kala ndarɗo…" },
  requirements:    { en:"Requirements & Skills", fr:"Exigences & Compétences", ha:"Buƙatun & Ƙwarewa", ar:"المتطلبات والمهارات", pcm:"Wetin dem need", ful:"Ko heɓetee" },
  requirePh:       { en:"List qualifications, skills, and experience required…", fr:"Listez les qualifications, compétences et expériences requises…", ha:"Jera cancanta, ƙwarewa, da kwarewa da ake buƙata…", ar:"اذكر المؤهلات والمهارات والخبرة المطلوبة…", pcm:"List all the things dem need…", ful:"Jaŋtu ko heɓetee, ɗemɗe, karallaagal…" },
  benefits:        { en:"Benefits & Perks", fr:"Avantages et avantages", ha:"Fa'idoji", ar:"المزايا والمكاÙآت", pcm:"Bonus things", ful:"Nafaaji" },
  benefitsPh:      { en:"Health insurance, transport allowance, bonuses…", fr:"Assurance maladie, indemnité de transport, primes…", ha:"Inshorar lafiya, taimako na sufuri, bonus…", ar:"تأمين صحي، بدل نقل، مكاÙآت…", pcm:"Health, transport, bonus things…", ful:"Laamu cellal, njuɓɓudi, nafaaji…" },
  tags:            { en:"Skills / Tags (comma separated)", fr:"Compétences / Tags (séparés par virgules)", ha:"Ƙwarewa / Alamomi", ar:"المهارات / الوسوم", pcm:"Skills (separate with comma)", ful:"Ɗemɗe (tippuɗe e tiindol)" },
  tagsPh:          { en:"React, Node.js, Marketing, Excel…", fr:"React, Node.js, Marketing, Excel…", ha:"React, Node.js, Marketing, Excel…", ar:"React, Node.js, تسويق…", pcm:"React, Node.js, Marketing…", ful:"React, Node.js…" },
  applyMethod:     { en:"How should candidates apply?", fr:"Comment les candidats doivent-ils postuler ?", ha:"Ta yaya masu nema za su yi nema?", ar:"كيÙ يتقدم المرشحون؟", pcm:"How dem go apply?", ful:"No jokkorɗe poti jokkude?" },
  inApp:           { en:"📱 Through Bambeh Platform", fr:"📱 Via la plateforme Bambeh", ha:"📱 Ta hanyar Bambeh", ar:"📱 عبر منصة بامبيه", pcm:"📱 Through Bambeh", ful:"📱 E Bambeh" },
  posting:         { en:"Publishing your job…", fr:"Publication en cours…", ha:"Ana wallafa aikin…", ar:"جارÙ النشر…", pcm:"Dey post your work…", ful:"Fewtinaama…" },
  posted:          { en:"Job posted successfully!", fr:"Offre publiée avec succès!", ha:"An wallafa aiki cikin nasara!", ar:"تم نشر الوظيÙة بنجاح!", pcm:"Your work don post!", ful:"Golle fewtiima!" },
  postBtn:         { en:"Publish Job", fr:"Publier l'offre", ha:"Wallafa Aiki", ar:"نشر الوظيÙة", pcm:"Post the work", ful:"Fewtu Golle" },
  requiredFields:  { en:"Please fill all required fields (*)", fr:"Veuillez remplir tous les champs obligatoires (*)", ha:"Da fatan a cika duk filayen da ake buƙata (*)", ar:"يرجى ملء جميع الحقول المطلوبة (*)", pcm:"Fill all * fields abeg", ful:"Heɓtu goɗɗe fof peewnaaɗe (*)" },
  loginRequired:   { en:"You must be logged in to post a job", fr:"Vous devez être connecté pour publier une offre", ha:"Dole ne ku shiga don wallafa aiki", ar:"يجب تسجيل الدخول لنشر وظيÙة", pcm:"You need login first", ful:"Naatir ngam fewtoyde golle" },
};

function s(key: string, lang: string): string {
  return STR[key]?.[lang] ?? STR[key]?.["en"] ?? key;
}

// ─── Category / type / region data ────────────────────────────────────────────
const CATEGORIES = [
  { value:"Technology",  label:{ en:"Technology",  fr:"Technologie", ha:"Fasaha", ar:"تكنولوجيا", pcm:"Tech", ful:"Tekinoloji" }},
  { value:"Marketing",   label:{ en:"Marketing",   fr:"Marketing", ha:"Tallatawa", ar:"تسويق", pcm:"Marketing", ful:"Marketing" }},
  { value:"Finance",     label:{ en:"Finance",     fr:"Finance", ha:"Kudi", ar:"مالية", pcm:"Money work", ful:"Mbappu" }},
  { value:"Engineering", label:{ en:"Engineering", fr:"Ingénierie", ha:"Injiniya", ar:"هندسة", pcm:"Engineering", ful:"Engineering" }},
  { value:"Education",   label:{ en:"Education",   fr:"Éducation", ha:"Ilimi", ar:"التعليم", pcm:"School work", ful:"Janngugol" }},
  { value:"Agriculture", label:{ en:"Agriculture", fr:"Agriculture", ha:"Noma", ar:"زراعة", pcm:"Farm work", ful:"Ndemndi" }},
  { value:"Healthcare",  label:{ en:"Healthcare",  fr:"Santé", ha:"Kiwon lafiya", ar:"صحة", pcm:"Hospital work", ful:"Cellal" }},
  { value:"Logistics",   label:{ en:"Logistics",   fr:"Logistique", ha:"Sufuri", ar:"لوجستيات", pcm:"Transport work", ful:"Heftugol" }},
  { value:"Sales",       label:{ en:"Sales",       fr:"Ventes", ha:"Sayarwa", ar:"مبيعات", pcm:"Sell sell", ful:"Jaral" }},
  { value:"Legal",       label:{ en:"Legal",       fr:"Juridique", ha:"Shari'a", ar:"قانوني", pcm:"Law work", ful:"Laawol" }},
  { value:"Other",       label:{ en:"Other",       fr:"Autre", ha:"Wani", ar:"أخرى", pcm:"Other", ful:"Woɗɗum" }},
];

const JOB_TYPES = [
  { value:"full_time",  label:{ en:"Full-time",  fr:"Temps plein", ha:"Cikakken lokaci", ar:"دوام كامل", pcm:"Full time", ful:"Waktu fof" }},
  { value:"part_time",  label:{ en:"Part-time",  fr:"Temps partiel", ha:"Rabin lokaci", ar:"دوام جزئي", pcm:"Half time", ful:"Waktu didi" }},
  { value:"contract",   label:{ en:"Contract",   fr:"Contrat", ha:"Kwantiragi", ar:"عقد", pcm:"Contract", ful:"Kontoraaji" }},
  { value:"internship", label:{ en:"Internship", fr:"Stage", ha:"Horarwa", ar:"تدريب", pcm:"Training", ful:"Jannginagol" }},
  { value:"freelance",  label:{ en:"Freelance",  fr:"Freelance", ha:"Yanci", ar:"حر", pcm:"Freelance", ful:"Freelance" }},
  { value:"temporary",  label:{ en:"Temporary",  fr:"Temporaire", ha:"Wucin gadi", ar:"مؤقت", pcm:"Small time", ful:"Seeɗa" }},
];

const EXP_LEVELS = [
  { value:"no_experience", label:{ en:"No experience", fr:"Sans expérience", ha:"Ba tare da kwarewa ba", ar:"بدون خبرة", pcm:"No experience", ful:"Alaa karallaagal" }},
  { value:"entry",         label:{ en:"Entry level (0–2 yrs)", fr:"Débutant (0–2 ans)", ha:"Farawa (0–2)", ar:"مبتدئ (0–2)", pcm:"Starter (0-2yrs)", ful:"Sappoowo (0-2)" }},
  { value:"mid",           label:{ en:"Mid level (2–5 yrs)", fr:"Intermédiaire (2–5)", ha:"Matsakaici (2–5)", ar:"متوسط (2–5)", pcm:"Middle (2-5yrs)", ful:"Seeɗum (2-5)" }},
  { value:"senior",        label:{ en:"Senior (5+ yrs)", fr:"Senior (5+ ans)", ha:"Babba (5+)", ar:"خبير (5+)", pcm:"Big man (5+yrs)", ful:"Mawɗo (5+)" }},
  { value:"executive",     label:{ en:"Executive", fr:"Cadre dirigeant", ha:"Manajan", ar:"مسؤول تنÙيذي", pcm:"Big boss", ful:"Jom Laamu" }},
];

const REGIONS = [
  "Centre","Littoral","West","South West","North West",
  "Adamawa","South","East","North","Far North",
];

// ─── Form state ───────────────────────────────────────────────────────────────
interface FormState {
  title: string;
  company: string;
  category: string;
  jobType: string;
  experienceLevel: string;
  city: string;
  region: string;
  isRemote: boolean;
  salaryMin: string;
  salaryMax: string;
  isSalaryNegotiable: boolean;
  deadline: string;
  description: string;
  requirements: string;
  benefits: string;
  tags: string;
  applyMethod: string;
  applyContact: string;
}

const INIT: FormState = {
  title: "", company: "", category: "Technology", jobType: "full_time",
  experienceLevel: "entry", city: "", region: "Littoral",
  isRemote: false, salaryMin: "", salaryMax: "", isSalaryNegotiable: false,
  deadline: "", description: "", requirements: "", benefits: "",
  tags: "", applyMethod: "in_app", applyContact: "",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PostJobPage() {
  const navigate = useNavigate();
  const lang     = useLang();
  const dir      = lang === "ar" ? "rtl" : "ltr";

  const [form,     setForm]     = useState<FormState>(INIT);
  const [posting,  setPosting]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggle = (field: keyof FormState) =>
    setForm((prev) => ({ ...prev, [field]: !prev[field as keyof FormState] }));

  const handleSubmit = useCallback(async () => {
    setErrorMsg(null);

    // Validation
    if (!form.title.trim() || !form.city.trim() || !form.description.trim()) {
      setErrorMsg(s("requiredFields", lang));
      return;
    }

    // Auth check
    const { supabase } = await import("@/lib/supabase");
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate("/login");
      return;
    }

    setPosting(true);

    const result = await createJob(session.session.user.id, {
      title:               form.title.trim(),
      company:             form.company.trim() || undefined,
      category:            form.category,
      jobType:             form.jobType as any,
      experienceLevel:     form.experienceLevel as any,
      location: {
        city:    form.city.trim(),
        region:  form.region,
        country: "Cameroon",
      },
      isRemote:            form.isRemote,
      salaryMinXAF:        form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMaxXAF:        form.salaryMax ? Number(form.salaryMax) : undefined,
      isSalaryNegotiable:  form.isSalaryNegotiable,
      applicationDeadline: form.deadline || undefined,
      description:         form.description.trim(),
      requirements:        form.requirements.trim() || undefined,
      benefits:            form.benefits.trim() || undefined,
      tags:                form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status:              "active",
      applyMethod:         form.applyMethod as any,
      applyContact:        form.applyContact.trim() || undefined,
    } as any);

    setPosting(false);

    if (result.success && result.id) {
      setSuccess(true);
      setTimeout(() => navigate(`/jobs/${result.id}`), 1500);
    } else {
      setErrorMsg(result.error ?? "Failed to post job");
    }
  }, [form, lang, navigate]);

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" dir={dir}>
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
          {s("posted", lang)}
        </h2>
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32" dir={dir}>

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-8">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-teal-200 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> {s("back", lang)}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
            💼
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">{s("pageTitle", lang)}</h1>
            <p className="text-teal-200 text-xs">{s("subtitle", lang)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Job Title */}
        <Field label={s("jobTitle", lang)}>
          <input value={form.title} onChange={set("title")}
            placeholder={s("jobTitlePh", lang)}
            className={inputCls} />
        </Field>

        {/* Company */}
        <Field label={s("company", lang)}>
          <input value={form.company} onChange={set("company")}
            placeholder={s("companyPh", lang)}
            className={inputCls} />
        </Field>

        {/* Category */}
        <Field label={s("category", lang)}>
          <select value={form.category} onChange={set("category")} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label[lang as keyof typeof c.label] ?? c.label.en}
              </option>
            ))}
          </select>
        </Field>

        {/* Job Type + Experience Level (side by side) */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={s("jobType", lang)}>
            <select value={form.jobType} onChange={set("jobType")} className={inputCls}>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label[lang as keyof typeof t.label] ?? t.label.en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={s("experienceLevel", lang)}>
            <select value={form.experienceLevel} onChange={set("experienceLevel")} className={inputCls}>
              {EXP_LEVELS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label[lang as keyof typeof e.label] ?? e.label.en}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={s("location", lang)}>
            <input value={form.city} onChange={set("city")}
              placeholder={s("locationPh", lang)}
              className={inputCls} />
          </Field>
          <Field label={s("region", lang)}>
            <select value={form.region} onChange={set("region")} className={inputCls}>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Remote toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => toggle("isRemote")}
            className={`w-11 h-6 rounded-full transition-colors ${form.isRemote ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${form.isRemote ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{s("isRemote", lang)}</span>
        </label>

        {/* Salary */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={s("salaryMin", lang)}>
            <input type="number" value={form.salaryMin} onChange={set("salaryMin")}
              placeholder={s("salaryPh", lang)} min="0"
              className={inputCls} />
          </Field>
          <Field label={s("salaryMax", lang)}>
            <input type="number" value={form.salaryMax} onChange={set("salaryMax")}
              placeholder={s("salaryPh", lang)} min="0"
              className={inputCls} />
          </Field>
        </div>

        {/* Negotiable toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => toggle("isSalaryNegotiable")}
            className={`w-11 h-6 rounded-full transition-colors ${form.isSalaryNegotiable ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${form.isSalaryNegotiable ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{s("negotiable", lang)}</span>
        </label>

        {/* Deadline */}
        <Field label={s("deadline", lang)}>
          <input type="date" value={form.deadline} onChange={set("deadline")}
            min={new Date().toISOString().split("T")[0]}
            className={inputCls} />
        </Field>

        {/* Description */}
        <Field label={s("description", lang)}>
          <textarea value={form.description} onChange={set("description")}
            placeholder={s("descPh", lang)}
            rows={5} className={`${inputCls} resize-none`} />
        </Field>

        {/* Requirements */}
        <Field label={s("requirements", lang)}>
          <textarea value={form.requirements} onChange={set("requirements")}
            placeholder={s("requirePh", lang)}
            rows={4} className={`${inputCls} resize-none`} />
        </Field>

        {/* Benefits */}
        <Field label={s("benefits", lang)}>
          <textarea value={form.benefits} onChange={set("benefits")}
            placeholder={s("benefitsPh", lang)}
            rows={3} className={`${inputCls} resize-none`} />
        </Field>

        {/* Tags */}
        <Field label={s("tags", lang)}>
          <input value={form.tags} onChange={set("tags")}
            placeholder={s("tagsPh", lang)}
            className={inputCls} />
        </Field>

        {/* Apply method */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {s("applyMethod", lang)}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value:"in_app",   label: s("inApp", lang) },
            ].map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => setForm((p) => ({ ...p, applyMethod: opt.value }))}
                className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all text-left
                  ${form.applyMethod === opt.value
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"}`}>
                {opt.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={posting}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-70
                     text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors max-w-lg mx-auto"
        >
          {posting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {s("posting", lang)}</>
          ) : (
            <><Briefcase className="w-4 h-4" /> {s("postBtn", lang)}</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputCls = `w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5
                  text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none
                  focus:border-teal-500 transition-colors`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
// BAMBEH_END_TOKEN__POSTJOBPAGE__COMPLETE
