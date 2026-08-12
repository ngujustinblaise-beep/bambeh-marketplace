// FIX331 - inner dictionary keys renamed pcm->pidgin and ful->ff so useLang() can find them
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
  reqTitle:        { en:"What must applicants provide?", fr:"Que doivent fournir les candidats ?", ha:"Me ya kamata masu nema su bayar?", ar:"ما الذي يجب أن يقدمه المتقدمون؟", pidgin:"Wetin the person wey apply must bring?", ff:"Hol ko jokkooɓe poti addude?" },
  reqHint:         { en:"Switch off anything this job does not need. A night watchman should not be asked for a CV.", fr:"Desactivez ce dont ce poste n a pas besoin. On ne demande pas de CV a un gardien de nuit.", ha:"Kashe abin da wannan aikin ba ya bukata. Ba a tambayar mai gadi da dare CV.", ar:"أوقف ما لا تحتاجه هذه الوظيفة. حارس الليل لا يطلب منه سيرة ذاتية.", pidgin:"Off anything wey this work no need. You no fit ask night watch for CV.", ff:"Ñif ko ndee golle sokla-aa. Deenoowo jamma naamnetaake CV." },
  reqCv:           { en:"CV / Resume", fr:"CV", ha:"CV", ar:"السيرة الذاتية", pidgin:"CV", ff:"CV" },
  reqIdDocument:   { en:"ID card or legal document", fr:"Piece d identite ou document legal", ha:"Katin shaida ko takardar doka", ar:"بطاقة الهوية أو مستند قانوني", pidgin:"ID card or legal paper", ff:"Kaayit anndinoowo walla kaayit laawɗo" },
  reqWorkAuth:     { en:"Proof of right to work", fr:"Preuve du droit de travailler", ha:"Shaidar izinin yin aiki", ar:"إثبات حق العمل", pidgin:"Paper wey show say e fit work", ff:"Seedamfaagu jojjande gollugol" },
  reqNationality:  { en:"Nationality and residence", fr:"Nationalite et residence", ha:"Kasa da wurin zama", ar:"الجنسية ومحل الإقامة", pidgin:"Where e from and where e dey stay", ff:"Leydi e ñiiɓirde" },
  reqCoverLetter:  { en:"Cover letter", fr:"Lettre de motivation", ha:"Wasikar neman aiki", ar:"خطاب التقديم", pidgin:"Letter wey e write", ff:"Ɓataake" },
  reqDriving:      { en:"Driving licence", fr:"Permis de conduire", ha:"Lasisin tuki", ar:"رخصة القيادة", pidgin:"Driving licence", ff:"Permi dognugol" },
  pageTitle:       { en:"Post a Job", fr:"Publier une offre", ha:"Wallafa Aiki", ar:"نشر وظيفة", pidgin:"Post Work", ff:"Fewtu Golle" },
  back:            { en:"Back", fr:"Retour", ha:"Koma", ar:"رجوع", pidgin:"Go back", ff:"Yahru" },
  subtitle:        { en:"Find the right talent across Cameroon", fr:"Trouvez les meilleurs talents au Cameroun", ha:"Samu gwanin ma'aikata a Kamaru", ar:"اعثر على المواهب في الكاميرون", pidgin:"Find correct person for Cameroon", ff:"Yiydaa ɗoo e Kameruun" },
  jobTitle:        { en:"Job Title *", fr:"Intitulé du poste *", ha:"Sunan Aiki *", ar:"المسمى الوظيفي *", pidgin:"Work Name *", ff:"Innde Golle *" },
  jobTitlePh:      { en:"e.g. Senior Software Engineer", fr:"ex. Ingénieur logiciel senior", ha:"mis. Babban Injiniya", ar:"مثل: مهندس برمجيات أول", pidgin:"e.g. Big software engineer", ff:"taa. Injiniir ɓaleejo" },
  company:         { en:"Company / Organisation", fr:"Entreprise / Organisation", ha:"Kamfani / Ƙungiya", ar:"الشركة / المؤسسة", pidgin:"Company / Organisation", ff:"Liggey / Ƙulle" },
  companyPh:       { en:"Name of your company", fr:"Nom de votre entreprise", ha:"Sunan kamfaninka", ar:"اسم شركتك", pidgin:"Your company name", ff:"Innde liggey maa" },
  category:        { en:"Job Category *", fr:"Catégorie *", ha:"Nau'in Aiki *", ar:"الفئة *", pidgin:"Work type *", ff:"Suudu Golle *" },
  jobType:         { en:"Employment Type *", fr:"Type de contrat *", ha:"Nau'in kwantiragi *", ar:"نوع التوظيف *", pidgin:"Work arrangement *", ff:"Suudu Kontoraaji *" },
  experienceLevel: { en:"Experience Level *", fr:"Niveau d'expérience *", ha:"Matakin ƙwarewa *", ar:"مستوى الخبرة *", pidgin:"Experience level *", ff:"Karallaagal *" },
  location:        { en:"City / Location *", fr:"Ville / Lieu *", ha:"Gari / Wuri *", ar:"المدينة / الموقع *", pidgin:"Town / Place *", ff:"Wuro / Ɓoggol *" },
  locationPh:      { en:"e.g. Douala, Yaoundé…", fr:"ex. Douala, Yaoundé…", ha:"mis. Douala, Yaoundé…", ar:"مثل: دوالا، ياوندي…", pidgin:"e.g. Douala, Yaoundé…", ff:"taa. Douala, Yaoundé…" },
  region:          { en:"Region", fr:"Région", ha:"Yanki", ar:"المنطقة", pidgin:"Region", ff:"Leydi" },
  isRemote:        { en:"Remote work available", fr:"Télétravail possible", ha:"Ana iya aiki daga nesa", ar:"يتوفر عمل عن بُعد", pidgin:"Online work dey", ff:"E Ɓanndu ɗon" },
  salaryMin:       { en:"Min Salary (FCFA/month)", fr:"Salaire min (FCFA/mois)", ha:"Ƙaramin albashi (FCFA/wata)", ar:"الحد الأدنى للراتب (فرنك/شهر)", pidgin:"Small salary (FCFA/month)", ff:"Njobdi bilahi (FCFA/koorka)" },
  salaryMax:       { en:"Max Salary (FCFA/month)", fr:"Salaire max (FCFA/mois)", ha:"Babban albashi (FCFA/wata)", ar:"الحد الأقصى للراتب", pidgin:"Big salary (FCFA/month)", ff:"Njobdi heeli (FCFA/koorka)" },
  salaryPh:        { en:"e.g. 150000", fr:"ex. 150000", ha:"mis. 150000", ar:"مثل: 150000", pidgin:"e.g. 150000", ff:"taa. 150000" },
  negotiable:      { en:"Salary is negotiable", fr:"Salaire négociable", ha:"Albashin ana tattaunawa", ar:"الراتب قابل للتفاوض", pidgin:"Salary e fit talk", ff:"Njobdi naggi" },
  deadline:        { en:"Application Deadline", fr:"Date limite de candidature", ha:"Ƙarshen lokacin nema", ar:"آخر موعد للتقديم", pidgin:"Last date to apply", ff:"Balɗe ɓennoo" },
  description:     { en:"Job Description *", fr:"Description du poste *", ha:"Bayanin aiki *", ar:"وصف الوظيفة *", pidgin:"Work description *", ff:"Jaŋtugol Golle *" },
  descPh:          { en:"Describe the role, responsibilities, and what a typical day looks like…", fr:"Décrivez le poste, les responsabilités, et le quotidien du rôle…", ha:"Bayyana aikin, ayyuka, da abin da rana ta yau da kullun take kama da…", ar:"اوصف الدور والمسؤوليات ويوم العمل المعتاد…", pidgin:"Tell us wetin the work be, wetin dem go do everyday…", ff:"Jaŋtu golle ndee, ko waɗɗataake, ko haaletee kala ndarɗo…" },
  requirements:    { en:"Requirements & Skills", fr:"Exigences & Compétences", ha:"Buƙatun & Ƙwarewa", ar:"المتطلبات والمهارات", pidgin:"Wetin dem need", ff:"Ko heɓetee" },
  requirePh:       { en:"List qualifications, skills, and experience required…", fr:"Listez les qualifications, compétences et expériences requises…", ha:"Jera cancanta, ƙwarewa, da kwarewa da ake buƙata…", ar:"اذكر المؤهلات والمهارات والخبرة المطلوبة…", pidgin:"List all the things dem need…", ff:"Jaŋtu ko heɓetee, ɗemɗe, karallaagal…" },
  benefits:        { en:"Benefits & Perks", fr:"Avantages et avantages", ha:"Fa'idoji", ar:"المزايا والمكافآت", pidgin:"Bonus things", ff:"Nafaaji" },
  benefitsPh:      { en:"Health insurance, transport allowance, bonuses…", fr:"Assurance maladie, indemnité de transport, primes…", ha:"Inshorar lafiya, taimako na sufuri, bonus…", ar:"تأمين صحي، بدل نقل، مكافآت…", pidgin:"Health, transport, bonus things…", ff:"Laamu cellal, njuɓɓudi, nafaaji…" },
  tags:            { en:"Skills / Tags (comma separated)", fr:"Compétences / Tags (séparés par virgules)", ha:"Ƙwarewa / Alamomi", ar:"المهارات / الوسوم", pidgin:"Skills (separate with comma)", ff:"Ɗemɗe (tippuɗe e tiindol)" },
  tagsPh:          { en:"React, Node.js, Marketing, Excel…", fr:"React, Node.js, Marketing, Excel…", ha:"React, Node.js, Marketing, Excel…", ar:"React, Node.js, تسويق…", pidgin:"React, Node.js, Marketing…", ff:"React, Node.js…" },
  applyMethod:     { en:"How should candidates apply?", fr:"Comment les candidats doivent-ils postuler ?", ha:"Ta yaya masu nema za su yi nema?", ar:"كيف يتقدم المرشحون؟", pidgin:"How dem go apply?", ff:"No jokkorɗe poti jokkude?" },
  inApp:           { en:"📱 Through Bambeh Platform", fr:"📱 Via la plateforme Bambeh", ha:"📱 Ta hanyar Bambeh", ar:"📱 عبر منصة بامبيه", pidgin:"📱 Through Bambeh", ff:"📱 E Bambeh" },
  posting:         { en:"Publishing your job…", fr:"Publication en cours…", ha:"Ana wallafa aikin…", ar:"جارٍ النشر…", pidgin:"Dey post your work…", ff:"Fewtinaama…" },
  posted:          { en:"Job posted successfully!", fr:"Offre publiée avec succès!", ha:"An wallafa aiki cikin nasara!", ar:"تم نشر الوظيفة بنجاح!", pidgin:"Your work don post!", ff:"Golle fewtiima!" },
  postBtn:         { en:"Publish Job", fr:"Publier l'offre", ha:"Wallafa Aiki", ar:"نشر الوظيفة", pidgin:"Post the work", ff:"Fewtu Golle" },
  requiredFields:  { en:"Please fill all required fields (*)", fr:"Veuillez remplir tous les champs obligatoires (*)", ha:"Da fatan a cika duk filayen da ake buƙata (*)", ar:"يرجى ملء جميع الحقول المطلوبة (*)", pidgin:"Fill all * fields abeg", ff:"Heɓtu goɗɗe fof peewnaaɗe (*)" },
  loginRequired:   { en:"You must be logged in to post a job", fr:"Vous devez être connecté pour publier une offre", ha:"Dole ne ku shiga don wallafa aiki", ar:"يجب تسجيل الدخول لنشر وظيفة", pidgin:"You need login first", ff:"Naatir ngam fewtoyde golle" },
};

function s(key: string, lang: string): string {
  return STR[key]?.[lang] ?? STR[key]?.["en"] ?? key;
}

// ─── Category / type / region data ────────────────────────────────────────────
const CATEGORIES = [
  { value:"Technology",  label:{ en:"Technology",  fr:"Technologie", ha:"Fasaha", ar:"تكنولوجيا", pidgin:"Tech", ff:"Tekinoloji" }},
  { value:"Marketing",   label:{ en:"Marketing",   fr:"Marketing", ha:"Tallatawa", ar:"تسويق", pidgin:"Marketing", ff:"Marketing" }},
  { value:"Finance",     label:{ en:"Finance",     fr:"Finance", ha:"Kudi", ar:"مالية", pidgin:"Money work", ff:"Mbappu" }},
  { value:"Engineering", label:{ en:"Engineering", fr:"Ingénierie", ha:"Injiniya", ar:"هندسة", pidgin:"Engineering", ff:"Engineering" }},
  { value:"Education",   label:{ en:"Education",   fr:"Éducation", ha:"Ilimi", ar:"التعليم", pidgin:"School work", ff:"Janngugol" }},
  { value:"Agriculture", label:{ en:"Agriculture", fr:"Agriculture", ha:"Noma", ar:"زراعة", pidgin:"Farm work", ff:"Ndemndi" }},
  { value:"Healthcare",  label:{ en:"Healthcare",  fr:"Santé", ha:"Kiwon lafiya", ar:"صحة", pidgin:"Hospital work", ff:"Cellal" }},
  { value:"Logistics",   label:{ en:"Logistics",   fr:"Logistique", ha:"Sufuri", ar:"لوجستيات", pidgin:"Transport work", ff:"Heftugol" }},
  { value:"Sales",       label:{ en:"Sales",       fr:"Ventes", ha:"Sayarwa", ar:"مبيعات", pidgin:"Sell sell", ff:"Jaral" }},
  { value:"Legal",       label:{ en:"Legal",       fr:"Juridique", ha:"Shari'a", ar:"قانوني", pidgin:"Law work", ff:"Laawol" }},
  { value:"Other",       label:{ en:"Other",       fr:"Autre", ha:"Wani", ar:"أخرى", pidgin:"Other", ff:"Woɗɗum" }},
];

const JOB_TYPES = [
  { value:"full_time",  label:{ en:"Full-time",  fr:"Temps plein", ha:"Cikakken lokaci", ar:"دوام كامل", pidgin:"Full time", ff:"Waktu fof" }},
  { value:"part_time",  label:{ en:"Part-time",  fr:"Temps partiel", ha:"Rabin lokaci", ar:"دوام جزئي", pidgin:"Half time", ff:"Waktu didi" }},
  { value:"contract",   label:{ en:"Contract",   fr:"Contrat", ha:"Kwantiragi", ar:"عقد", pidgin:"Contract", ff:"Kontoraaji" }},
  { value:"internship", label:{ en:"Internship", fr:"Stage", ha:"Horarwa", ar:"تدريب", pidgin:"Training", ff:"Jannginagol" }},
  { value:"freelance",  label:{ en:"Freelance",  fr:"Freelance", ha:"Yanci", ar:"حر", pidgin:"Freelance", ff:"Freelance" }},
  { value:"temporary",  label:{ en:"Temporary",  fr:"Temporaire", ha:"Wucin gadi", ar:"مؤقت", pidgin:"Small time", ff:"Seeɗa" }},
];

const EXP_LEVELS = [
  { value:"no_experience", label:{ en:"No experience", fr:"Sans expérience", ha:"Ba tare da kwarewa ba", ar:"بدون خبرة", pidgin:"No experience", ff:"Alaa karallaagal" }},
  { value:"entry",         label:{ en:"Entry level (0–2 yrs)", fr:"Débutant (0–2 ans)", ha:"Farawa (0–2)", ar:"مبتدئ (0–2)", pidgin:"Starter (0-2yrs)", ff:"Sappoowo (0-2)" }},
  { value:"mid",           label:{ en:"Mid level (2–5 yrs)", fr:"Intermédiaire (2–5)", ha:"Matsakaici (2–5)", ar:"متوسط (2–5)", pidgin:"Middle (2-5yrs)", ff:"Seeɗum (2-5)" }},
  { value:"senior",        label:{ en:"Senior (5+ yrs)", fr:"Senior (5+ ans)", ha:"Babba (5+)", ar:"خبير (5+)", pidgin:"Big man (5+yrs)", ff:"Mawɗo (5+)" }},
  { value:"executive",     label:{ en:"Executive", fr:"Cadre dirigeant", ha:"Manajan", ar:"مسؤول تنفيذي", pidgin:"Big boss", ff:"Jom Laamu" }},
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
  // FIX222 - what this employer demands of applicants. Saved to
  // job_application_requirements, which is what JobApplyModal reads.
  reqCv: boolean;
  reqIdDocument: boolean;
  reqWorkAuthorization: boolean;
  reqNationality: boolean;
  reqCoverLetter: boolean;
  reqDrivingLicence: boolean;
}

const INIT: FormState = {
  title: "", company: "", category: "Technology", jobType: "full_time",
  experienceLevel: "entry", city: "", region: "Littoral",
  isRemote: false, salaryMin: "", salaryMax: "", isSalaryNegotiable: false,
  deadline: "", description: "", requirements: "", benefits: "",
  tags: "", applyMethod: "in_app", applyContact: "",
  // Identity and right to work default ON, CV defaults ON. A night watchman
  // post simply switches the CV off - that was the whole point of this fix.
  reqCv: true, reqIdDocument: true, reqWorkAuthorization: true,
  reqNationality: true, reqCoverLetter: false, reqDrivingLicence: false,
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
      // FIX222 - save what this employer requires. Upsert on job_id so a later
      // edit overwrites instead of duplicating. Non-fatal on purpose: a failure
      // here must never lose a job the employer has just written out.
      try {
        await supabase.from("job_application_requirements").upsert({
          job_id:                         result.id,
          job_country:                    "CM",
          require_cv:                     form.reqCv,
          require_id_document:            form.reqIdDocument,
          require_work_authorization:     form.reqWorkAuthorization,
          require_nationality:            form.reqNationality,
          require_cover_letter:           form.reqCoverLetter,
          require_driving_licence_doc:    form.reqDrivingLicence,
          require_driving_ability:        form.reqDrivingLicence,
          require_interview_availability: true,
          updated_at:                     new Date().toISOString(),
        }, { onConflict: "job_id" });
      } catch (e) {
        console.warn("[PostJob] requirements not saved:", e);
      }

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

      {/* FIX222 - employer-controlled application requirements */}
      <div className="px-4 pb-40">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            {s("reqTitle", lang)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {s("reqHint", lang)}
          </p>
          <div className="space-y-1">
            {([
              ["reqCv",                "reqCv"],
              ["reqIdDocument",        "reqIdDocument"],
              ["reqWorkAuthorization", "reqWorkAuth"],
              ["reqNationality",       "reqNationality"],
              ["reqCoverLetter",       "reqCoverLetter"],
              ["reqDrivingLicence",    "reqDriving"],
            ] as [keyof FormState, string][]).map(([field, labelKey]) => (
              <button
                key={String(field)}
                type="button"
                onClick={() => toggle(field)}
                className="w-full flex items-center justify-between py-2.5 text-left">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {s(labelKey, lang)}
                </span>
                <span
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors
                    ${form[field] ? "bg-teal-600" : "bg-gray-300 dark:bg-gray-600"}`}>
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all
                      ${form[field] ? "left-[22px]" : "left-0.5"}`}
                  />
                </span>
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
