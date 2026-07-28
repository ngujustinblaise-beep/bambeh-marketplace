// BAMBEH_DEPLOY_TOKEN__JOBAPPLICANTS_FIX219_START
/**
 * JobApplicants.tsx - Bambeh Marketplace
 * FILE LOCATION: src/pages/JobApplicants.tsx
 * ROUTE:         /jobs/:jobId/applicants
 *
 * FIX219 - THE EMPLOYER CAN FINALLY READ THE APPLICATIONS.
 * =======================================================
 * Until now nothing in this app read job_applications back. Candidates filled
 * in the form, the rows saved, and no screen anywhere displayed them. This is
 * that screen.
 *
 * IT IS NOT A STUB. Every field shown is read from the real tables:
 *   job_applications              - the 37-column submission itself
 *   job_application_languages     - one row per language
 *   job_application_education     - schools and qualifications
 *   job_application_experience    - previous employers
 *   job_application_documents     - CV, ID, licence, portfolio, extras
 *
 * DOCUMENTS. The job-documents bucket is PRIVATE, which is correct - a CV and
 * a national ID number must never sit on a public URL. Files are therefore
 * opened through a signed URL minted on demand and valid for ten minutes.
 *
 * OWNERSHIP. A job is a row in public.listings with type='job', and its owner
 * is listings.user_id. That is checked here in the browser AND enforced by the
 * RLS policies in FIX218, so a hand-typed URL shows nothing.
 *
 * STATUS. Employers can move a candidate through pending -> shortlisted ->
 * interviewing -> hired, or reject. If the database refuses a value the exact
 * server message is shown rather than a shrug - this project has lost too many
 * evenings to silent failures.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Mail, Phone, MessageCircle, FileText, Download,
  GraduationCap, Briefcase, Globe, ShieldCheck, Car, CalendarClock,
  ChevronDown, ChevronUp, Loader2, AlertTriangle, Search, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

/* ── languages ─────────────────────────────────────────────────────────── */
type LangKey = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const COPY: Record<LangKey, Record<string, string>> = {
  en: {
    back: 'Back', title: 'Applicants', loading: 'Loading applications...',
    none: 'No applications yet', noneBody: 'When someone applies for this job they will appear here.',
    notOwner: 'This is not your job posting', notOwnerBody: 'Only the employer who posted this job can see its applicants.',
    search: 'Search by name, email or phone',
    all: 'All', pending: 'Pending', shortlisted: 'Shortlisted', interviewing: 'Interviewing',
    hired: 'Hired', rejected: 'Rejected',
    applied: 'Applied', details: 'Full application', hide: 'Hide details',
    contact: 'Contact', callBtn: 'Call', emailBtn: 'Email', whatsapp: 'WhatsApp',
    personal: 'Personal details', rightToWork: 'Right to work', languages: 'Languages',
    education: 'Education', experience: 'Work experience', documents: 'Documents',
    availability: 'Availability', coverLetter: 'Cover letter', employerQuestion: 'Answer to your question',
    nationality: 'Nationality', residence: 'Country of residence', citizen: 'Citizen of this country',
    workAuth: 'Work authorisation', idDoc: 'Legal document', idNumber: 'Document number',
    canDrive: 'Can drive', licence: 'Licence class',
    forInterview: 'Available for interview', fromDate: 'Available from', forLangTest: 'Can sit a language test',
    notes: 'Notes', accommodations: 'Adjustments needed',
    speaking: 'Speaking', writing: 'Writing', listening: 'Listening', reading: 'Reading',
    motherTongue: 'Mother tongue', present: 'Present', open: 'Open', noFiles: 'No documents uploaded',
    yes: 'Yes', no: 'No', notGiven: 'Not provided',
    setStatus: 'Set status', saving: 'Saving...', refresh: 'Refresh',
    countLabel: 'application', countLabelPlural: 'applications',
    signIn: 'Please sign in', signInBody: 'You need to be signed in to view applicants.',
  },
  fr: {
    back: 'Retour', title: 'Candidats', loading: 'Chargement des candidatures...',
    none: 'Aucune candidature', noneBody: "Les candidatures apparaitront ici des qu'une personne postule.",
    notOwner: "Cette offre n'est pas la votre", notOwnerBody: "Seul l'employeur qui a publie cette offre peut voir ses candidats.",
    search: 'Rechercher par nom, email ou telephone',
    all: 'Toutes', pending: 'En attente', shortlisted: 'Presel.', interviewing: 'Entretien',
    hired: 'Recrute', rejected: 'Refuse',
    applied: 'Postule le', details: 'Candidature complete', hide: 'Masquer',
    contact: 'Contact', callBtn: 'Appeler', emailBtn: 'Email', whatsapp: 'WhatsApp',
    personal: 'Informations personnelles', rightToWork: 'Droit de travailler', languages: 'Langues',
    education: 'Formation', experience: 'Experience professionnelle', documents: 'Documents',
    availability: 'Disponibilite', coverLetter: 'Lettre de motivation', employerQuestion: 'Reponse a votre question',
    nationality: 'Nationalite', residence: 'Pays de residence', citizen: 'Citoyen de ce pays',
    workAuth: 'Autorisation de travail', idDoc: 'Document legal', idNumber: 'Numero du document',
    canDrive: 'Sait conduire', licence: 'Categorie de permis',
    forInterview: 'Disponible pour un entretien', fromDate: 'Disponible a partir du', forLangTest: 'Peut passer un test de langue',
    notes: 'Notes', accommodations: 'Amenagements necessaires',
    speaking: 'Oral', writing: 'Ecrit', listening: 'Comprehension orale', reading: 'Lecture',
    motherTongue: 'Langue maternelle', present: 'Present', open: 'Ouvrir', noFiles: 'Aucun document',
    yes: 'Oui', no: 'Non', notGiven: 'Non renseigne',
    setStatus: 'Changer le statut', saving: 'Enregistrement...', refresh: 'Actualiser',
    countLabel: 'candidature', countLabelPlural: 'candidatures',
    signIn: 'Veuillez vous connecter', signInBody: 'Vous devez etre connecte pour voir les candidats.',
  },
  pidgin: {
    back: 'Go back', title: 'People wey apply', loading: 'We dey load the applications...',
    none: 'Nobody don apply yet', noneBody: 'When person apply for this work, e go show here.',
    notOwner: 'This work no be your own', notOwnerBody: 'Na only the person wey post this work fit see who apply.',
    search: 'Find by name, email or number',
    all: 'All', pending: 'Dey wait', shortlisted: 'You like am', interviewing: 'Interview',
    hired: 'You don take am', rejected: 'You no take am',
    applied: 'Apply for', details: 'See everything', hide: 'Close am',
    contact: 'Reach am', callBtn: 'Call', emailBtn: 'Email', whatsapp: 'WhatsApp',
    personal: 'Him personal info', rightToWork: 'Right to work here', languages: 'Language wey e sabi',
    education: 'School wey e go', experience: 'Work wey e don do', documents: 'Him papers',
    availability: 'When e free', coverLetter: 'Wetin e write', employerQuestion: 'Answer to your question',
    nationality: 'Where e from', residence: 'Country wey e dey', citizen: 'Na citizen for this country',
    workAuth: 'Permission to work', idDoc: 'Him legal paper', idNumber: 'Paper number',
    canDrive: 'E fit drive', licence: 'Licence type',
    forInterview: 'E fit come interview', fromDate: 'E free from', forLangTest: 'E fit write language test',
    notes: 'Extra talk', accommodations: 'Wetin e need',
    speaking: 'Talk', writing: 'Write', listening: 'Hear', reading: 'Read',
    motherTongue: 'Him mother tongue', present: 'Till now', open: 'Open am', noFiles: 'No paper dey',
    yes: 'Yes', no: 'No', notGiven: 'E no put am',
    setStatus: 'Change status', saving: 'Dey save...', refresh: 'Load again',
    countLabel: 'person apply', countLabelPlural: 'people apply',
    signIn: 'Abeg log in', signInBody: 'You must log in before you fit see who apply.',
  },
  ar: {
    back: 'رجوع', title: 'المتقدمون', loading: 'جارٍ تحميل الطلبات...',
    none: 'لا توجد طلبات بعد', noneBody: 'ستظهر الطلبات هنا عندما يتقدم شخص ما لهذه الوظيفة.',
    notOwner: 'هذه ليست وظيفتك', notOwnerBody: 'يمكن لصاحب العمل الذي نشر الوظيفة فقط رؤية المتقدمين.',
    search: 'ابحث بالاسم أو البريد أو الهاتف',
    all: 'الكل', pending: 'قيد الانتظار', shortlisted: 'مرشح', interviewing: 'مقابلة',
    hired: 'تم التوظيف', rejected: 'مرفوض',
    applied: 'تقدم في', details: 'الطلب الكامل', hide: 'إخفاء',
    contact: 'التواصل', callBtn: 'اتصال', emailBtn: 'بريد', whatsapp: 'واتساب',
    personal: 'البيانات الشخصية', rightToWork: 'حق العمل', languages: 'اللغات',
    education: 'التعليم', experience: 'الخبرة العملية', documents: 'المستندات',
    availability: 'التوفر', coverLetter: 'خطاب التقديم', employerQuestion: 'الإجابة على سؤالك',
    nationality: 'الجنسية', residence: 'بلد الإقامة', citizen: 'مواطن في هذا البلد',
    workAuth: 'تصريح العمل', idDoc: 'المستند القانوني', idNumber: 'رقم المستند',
    canDrive: 'يستطيع القيادة', licence: 'فئة الرخصة',
    forInterview: 'متاح للمقابلة', fromDate: 'متاح من', forLangTest: 'يمكنه إجراء اختبار لغة',
    notes: 'ملاحظات', accommodations: 'التسهيلات المطلوبة',
    speaking: 'التحدث', writing: 'الكتابة', listening: 'الاستماع', reading: 'القراءة',
    motherTongue: 'اللغة الأم', present: 'حتى الآن', open: 'فتح', noFiles: 'لا توجد مستندات',
    yes: 'نعم', no: 'لا', notGiven: 'غير محدد',
    setStatus: 'تغيير الحالة', saving: 'جارٍ الحفظ...', refresh: 'تحديث',
    countLabel: 'طلب', countLabelPlural: 'طلبات',
    signIn: 'يرجى تسجيل الدخول', signInBody: 'يجب تسجيل الدخول لعرض المتقدمين.',
  },
  ff: {
    back: 'Rutto', title: 'Jokkooɓe', loading: 'Eɗen loowa jokkonɗe...',
    none: 'Jokkoowo alaa tawo', noneBody: 'So neɗɗo jokkii ndee golle, o feeñan ɗoo.',
    notOwner: 'Ndee golle wonaa maa', notOwnerBody: 'Ko jeyɗo golle ndee tan foti yiide jokkooɓe.',
    search: 'Yiylo e innde, imeel walla noomro',
    all: 'Fof', pending: 'Ina sabbii', shortlisted: 'Suɓaama', interviewing: 'Jeewte',
    hired: 'Golliima', rejected: 'Salaama',
    applied: 'Jokkii', details: 'Jokkondiral timmungal', hide: 'Suuɗ',
    contact: 'Jokkondiral', callBtn: 'Noddu', emailBtn: 'Imeel', whatsapp: 'WhatsApp',
    personal: 'Humpito makko', rightToWork: 'Jojjanɗe gollugol', languages: 'Ɗemɗe',
    education: 'Jaŋde', experience: 'Golle ɗe o waɗi', documents: 'Kaayitaaji',
    availability: 'Nde o woodi', coverLetter: 'Ɓataake', employerQuestion: 'Jaabawol naamnal maa',
    nationality: 'Leydi makko', residence: 'Leydi ko o hoɗi', citizen: 'Jeyaaɗo e ndee leydi',
    workAuth: 'Yamiroore gollugol', idDoc: 'Kaayit laawɗo', idNumber: 'Noomro kaayit',
    canDrive: 'Ina waawi dognude', licence: 'Sifaa permi',
    forInterview: 'Ina woodi ngam jeewte', fromDate: 'Ina woodi gila', forLangTest: 'Ina waawi waɗde ekkitaango ɗemngal',
    notes: 'Ciimtol', accommodations: 'Ko o soklata',
    speaking: 'Haala', writing: 'Winndugol', listening: 'Nanugol', reading: 'Tarugol',
    motherTongue: 'Ɗemngal neeniwal', present: 'Haa jooni', open: 'Uddit', noFiles: 'Kaayit alaa',
    yes: 'Eey', no: 'Alaa', notGiven: 'Waɗaani',
    setStatus: 'Waylu ngonka', saving: 'Ina danndee...', refresh: 'Loow kadi',
    countLabel: 'jokkondiral', countLabelPlural: 'jokkonɗe',
    signIn: 'Tiiɗno naatnu', signInBody: 'Ada foti naatde ngam yiide jokkooɓe.',
  },
};

function resolveLang(raw: unknown): LangKey {
  const v = String(raw ?? 'en').toLowerCase();
  if (v === 'pcm' || v === 'pidgin') return 'pidgin';
  if (v === 'fr' || v === 'fra') return 'fr';
  if (v === 'ar' || v === 'ara') return 'ar';
  if (v === 'ff' || v === 'ful' || v === 'fuv') return 'ff';
  return 'en';
}

/* ── types ─────────────────────────────────────────────────────────────── */
type App = Record<string, any>;
type Kid = Record<string, any>;

type KidSets = {
  languages: Kid[];
  education: Kid[];
  experience: Kid[];
  documents: Kid[];
};

const STATUSES = ['pending', 'shortlisted', 'interviewing', 'hired', 'rejected'] as const;

const STATUS_CLASS: Record<string, string> = {
  pending:      'bg-amber-50 text-amber-700 border-amber-200',
  shortlisted:  'bg-blue-50 text-blue-700 border-blue-200',
  interviewing: 'bg-violet-50 text-violet-700 border-violet-200',
  hired:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:     'bg-gray-100 text-gray-600 border-gray-200',
};

const BUCKET = 'job-documents';

const fmtDate = (v: unknown) => {
  if (!v) return '';
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

const fmtSize = (n: unknown) => {
  const b = Number(n);
  if (!Number.isFinite(b) || b <= 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

/* ── small presentational helpers ──────────────────────────────────────── */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 break-words">{value}</span>
    </div>
  );
}

function Section({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
        {icon}{title}
      </div>
      {children}
    </div>
  );
}

/* ======================================================================== */

export default function JobApplicants() {
  const lang  = resolveLang(useLang());
  const c     = COPY[lang];
  const isRtl = lang === 'ar';

  const navigate = useNavigate();
  const params   = useParams();
  const jobId    = (params.jobId ?? params.id ?? '') as string;

  const [userId,   setUserId]   = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [owner,    setOwner]    = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [apps,     setApps]     = useState<App[]>([]);
  const [error,    setError]    = useState('');

  const [openId,  setOpenId]  = useState<string | null>(null);
  const [kids,    setKids]    = useState<Record<string, KidSets>>({});
  const [kidBusy, setKidBusy] = useState(false);
  const [saving,  setSaving]  = useState<string | null>(null);
  const [filter,  setFilter]  = useState<string>('all');
  const [query,   setQuery]   = useState('');

  /* ── load the job + its applications ─────────────────────────────────── */
  const load = useCallback(async () => {
    setError('');
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id ?? null;
    setUserId(uid);

    if (!uid || !jobId) { setChecking(false); return; }

    // A job is a listings row with type='job'; its owner is listings.user_id.
    const { data: listing, error: lErr } = await supabase
      .from('listings')
      .select('id, user_id, title')
      .eq('id', jobId)
      .maybeSingle();

    if (lErr) { setError(lErr.message); setChecking(false); return; }

    const isOwner = !!listing && String((listing as any).user_id) === uid;
    setOwner(isOwner);
    setJobTitle(String((listing as any)?.title ?? ''));

    if (!isOwner) { setChecking(false); return; }

    const { data, error: aErr } = await supabase
      .from('job_applications')
      .select('*')
      .eq('job_id', jobId)
      .order('submitted_at', { ascending: false, nullsFirst: false });

    if (aErr) setError(aErr.message);
    setApps((data as App[]) ?? []);
    setChecking(false);
  }, [jobId]);

  useEffect(() => { void load(); }, [load]);

  /* ── expand one application: fetch its child rows once ───────────────── */
  const toggle = useCallback(async (id: string) => {
    if (openId === id) { setOpenId(null); return; }
    setOpenId(id);
    if (kids[id]) return;

    setKidBusy(true);
    try {
      const [l, e, x, d] = await Promise.all([
        supabase.from('job_application_languages').select('*').eq('application_id', id),
        supabase.from('job_application_education').select('*').eq('application_id', id),
        supabase.from('job_application_experience').select('*').eq('application_id', id),
        supabase.from('job_application_documents').select('*').eq('application_id', id),
      ]);
      setKids(prev => ({
        ...prev,
        [id]: {
          languages:  (l.data as Kid[]) ?? [],
          education:  (e.data as Kid[]) ?? [],
          experience: (x.data as Kid[]) ?? [],
          documents:  (d.data as Kid[]) ?? [],
        },
      }));
    } finally {
      setKidBusy(false);
    }
  }, [openId, kids]);

  /* ── private bucket: mint a short-lived signed URL on demand ─────────── */
  const openDoc = useCallback(async (doc: Kid) => {
    const bucket = String(doc.storage_bucket || BUCKET);
    const path   = String(doc.storage_path || '');
    if (!path) return;
    const { data, error: sErr } = await supabase.storage
      .from(bucket).createSignedUrl(path, 600);
    if (sErr || !data?.signedUrl) { setError(sErr?.message ?? 'Could not open the file.'); return; }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }, []);

  /* ── status change ───────────────────────────────────────────────────── */
  const setStatus = useCallback(async (id: string, status: string) => {
    setSaving(id); setError('');
    const { error: uErr } = await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (uErr) {
      // Verbatim. If a CHECK constraint refuses the value we need to see it.
      setError(uErr.message);
    } else {
      setApps(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
    }
    setSaving(null);
  }, []);

  /* ── filtering ───────────────────────────────────────────────────────── */
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter(a => {
      if (filter !== 'all' && String(a.status ?? 'pending') !== filter) return false;
      if (!q) return true;
      return [a.full_name, a.email, a.phone].some(v => String(v ?? '').toLowerCase().includes(q));
    });
  }, [apps, filter, query]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: apps.length };
    for (const s of STATUSES) m[s] = apps.filter(a => String(a.status ?? 'pending') === s).length;
    return m;
  }, [apps]);

  /* ── guards ──────────────────────────────────────────────────────────── */
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" /> {c.loading}
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h2 className="mb-1 text-lg font-bold text-gray-900">{c.signIn}</h2>
          <p className="text-sm text-gray-500">{c.signInBody}</p>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h2 className="mb-1 text-lg font-bold text-gray-900">{c.notOwner}</h2>
          <p className="mb-4 text-sm text-gray-500">{c.notOwnerBody}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {c.back}
          </button>
        </div>
      </div>
    );
  }

  /* ── page ────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 pb-16" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-3xl px-4 py-6">

        {/* header */}
        <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 flex items-center gap-1 text-sm font-medium text-teal-600"
          >
            <ArrowLeft className="h-4 w-4" /> {c.back}
          </button>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Users className="h-6 w-6 text-teal-600" /> {c.title}
              </h1>
              {jobTitle && <p className="mt-0.5 text-sm text-gray-500">{jobTitle}</p>}
              <p className="mt-1 text-sm font-semibold text-teal-700">
                {apps.length} {apps.length === 1 ? c.countLabel : c.countLabelPlural}
              </p>
            </div>
            <button
              onClick={() => { setChecking(true); void load(); }}
              className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> {c.refresh}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {apps.length > 0 && (
          <>
            {/* search */}
            <div className="relative mb-3">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={c.search}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 ps-10 pe-4 text-sm outline-none focus:border-teal-500"
              />
            </div>

            {/* status filter */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {(['all', ...STATUSES] as string[]).map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    filter === s
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c[s] ?? s} ({counts[s] ?? 0})
                </button>
              ))}
            </div>
          </>
        )}

        {/* empty */}
        {apps.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Users className="mx-auto mb-3 h-12 w-12 text-gray-200" />
            <h2 className="mb-1 text-lg font-bold text-gray-900">{c.none}</h2>
            <p className="text-sm text-gray-500">{c.noneBody}</p>
          </div>
        )}

        {/* list */}
        <div className="space-y-3">
          {shown.map(a => {
            const id     = String(a.id);
            const open   = openId === id;
            const status = String(a.status ?? 'pending');
            const set    = kids[id];
            const digits = String(a.phone ?? '').replace(/\D/g, '');
            const wa     = digits ? (digits.startsWith('237') ? digits : `237${digits}`) : '';

            return (
              <div key={id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                {/* summary row */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-gray-900">
                        {a.full_name || c.notGiven}
                      </p>
                      <p className="truncate text-xs text-gray-500">{a.email}</p>
                      {a.phone && <p className="truncate text-xs text-gray-500">{a.phone}</p>}
                      <p className="mt-1 text-[11px] text-gray-400">
                        {c.applied} {fmtDate(a.submitted_at || a.applied_at)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_CLASS[status] ?? STATUS_CLASS.pending}`}>
                      {c[status] ?? status}
                    </span>
                  </div>

                  {/* contact */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.phone && (
                      <a href={`tel:${a.phone}`}
                         className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200">
                        <Phone className="h-3.5 w-3.5" /> {c.callBtn}
                      </a>
                    )}
                    {wa && (
                      <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                        <MessageCircle className="h-3.5 w-3.5" /> {c.whatsapp}
                      </a>
                    )}
                    {a.email && (
                      <a href={`mailto:${a.email}`}
                         className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200">
                        <Mail className="h-3.5 w-3.5" /> {c.emailBtn}
                      </a>
                    )}
                    <button
                      onClick={() => void toggle(id)}
                      className="ms-auto flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700"
                    >
                      {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {open ? c.hide : c.details}
                    </button>
                  </div>

                  {/* status control */}
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-400">{c.setStatus}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          disabled={saving === id || status === s}
                          onClick={() => void setStatus(id, s)}
                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-50 ${
                            status === s ? STATUS_CLASS[s] : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {saving === id ? c.saving : (c[s] ?? s)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* full application */}
                {open && (
                  <div className="space-y-3 border-t border-gray-100 bg-white p-4">
                    {kidBusy && !set && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin text-teal-600" /> {c.loading}
                      </div>
                    )}

                    <Section icon={<Users className="h-4 w-4 text-teal-600" />} title={c.personal}>
                      <div className="grid gap-x-6 sm:grid-cols-2">
                        <Field label={c.education} value={a.education_level} />
                        <Field label="" value={a.education_field} />
                        <Field label={c.experience} value={a.current_job_title} />
                        <Field label="" value={a.years_experience ? `${a.years_experience}` : null} />
                        <Field label={c.notes} value={a.other_skills} />
                        <Field label={c.accommodations} value={a.accommodations_needed} />
                        <Field label="Portfolio" value={a.portfolio_url} />
                      </div>
                    </Section>

                    <Section icon={<ShieldCheck className="h-4 w-4 text-teal-600" />} title={c.rightToWork}>
                      <div className="grid gap-x-6 sm:grid-cols-2">
                        <Field label={c.nationality} value={a.nationality} />
                        <Field label={c.residence} value={a.country_of_residence} />
                        <Field label={c.citizen}
                               value={a.is_citizen_of_job_country === null || a.is_citizen_of_job_country === undefined
                                 ? null : (a.is_citizen_of_job_country ? c.yes : c.no)} />
                        <Field label={c.workAuth} value={a.work_authorization} />
                        <Field label={c.idDoc}
                               value={a.id_document_type === 'other'
                                 ? (a.id_document_other_label || 'other') : a.id_document_type} />
                        <Field label={c.idNumber} value={a.id_document_number} />
                        <Field label={c.canDrive}
                               value={a.can_drive === null || a.can_drive === undefined
                                 ? null : (a.can_drive ? c.yes : c.no)} />
                        <Field label={c.licence} value={a.driving_licence_class} />
                      </div>
                    </Section>

                    <Section icon={<CalendarClock className="h-4 w-4 text-teal-600" />} title={c.availability}>
                      <div className="grid gap-x-6 sm:grid-cols-2">
                        <Field label={c.forInterview}
                               value={a.available_for_interview === null || a.available_for_interview === undefined
                                 ? null : (a.available_for_interview ? c.yes : c.no)} />
                        <Field label={c.fromDate} value={fmtDate(a.interview_available_from)} />
                        <Field label={c.forLangTest}
                               value={a.available_for_language_test === null || a.available_for_language_test === undefined
                                 ? null : (a.available_for_language_test ? c.yes : c.no)} />
                        <Field label={c.notes} value={a.availability_notes} />
                      </div>
                    </Section>

                    {a.cover_letter && (
                      <Section icon={<FileText className="h-4 w-4 text-teal-600" />} title={c.coverLetter}>
                        <p className="whitespace-pre-wrap text-sm text-gray-700">{a.cover_letter}</p>
                      </Section>
                    )}

                    {a.special_request_answer && (
                      <Section icon={<FileText className="h-4 w-4 text-teal-600" />} title={c.employerQuestion}>
                        <p className="whitespace-pre-wrap text-sm text-gray-700">{a.special_request_answer}</p>
                      </Section>
                    )}

                    {/* languages */}
                    {set && set.languages.length > 0 && (
                      <Section icon={<Globe className="h-4 w-4 text-teal-600" />} title={c.languages}>
                        <div className="space-y-2">
                          {set.languages.map((l, i) => (
                            <div key={i} className="rounded-xl bg-white p-3">
                              <p className="text-sm font-semibold text-gray-900">
                                {l.language_name || l.language_code}
                                {l.is_mother_tongue && (
                                  <span className="ms-2 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                                    {c.motherTongue}
                                  </span>
                                )}
                              </p>
                              <div className="mt-1 grid grid-cols-2 gap-x-4 text-xs text-gray-600 sm:grid-cols-4">
                                <span>{c.speaking}: {l.speaking_level || l.speaking || '-'}</span>
                                <span>{c.writing}: {l.writing_level || l.writing || '-'}</span>
                                <span>{c.listening}: {l.listening || '-'}</span>
                                <span>{c.reading}: {l.reading_level || l.comprehension || '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {/* education */}
                    {set && set.education.length > 0 && (
                      <Section icon={<GraduationCap className="h-4 w-4 text-teal-600" />} title={c.education}>
                        <div className="space-y-2">
                          {set.education.map((e, i) => (
                            <div key={i} className="rounded-xl bg-white p-3">
                              <p className="text-sm font-semibold text-gray-900">{e.qualification}</p>
                              <p className="text-xs text-gray-600">{e.institution_name}{e.country ? `, ${e.country}` : ''}</p>
                              {e.field_of_study && <p className="text-xs text-gray-500">{e.field_of_study}</p>}
                              <p className="mt-0.5 text-[11px] text-gray-400">
                                {e.start_year || fmtDate(e.start_date)} - {e.is_completed ? (e.end_year || fmtDate(e.end_date)) : c.present}
                                {e.grade ? ` | ${e.grade}` : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {/* experience */}
                    {set && set.experience.length > 0 && (
                      <Section icon={<Briefcase className="h-4 w-4 text-teal-600" />} title={c.experience}>
                        <div className="space-y-2">
                          {set.experience.map((x, i) => (
                            <div key={i} className="rounded-xl bg-white p-3">
                              <p className="text-sm font-semibold text-gray-900">{x.job_title}</p>
                              <p className="text-xs text-gray-600">
                                {x.employer_name}{x.location ? `, ${x.location}` : ''}
                                {x.employment_type ? ` | ${x.employment_type}` : ''}
                              </p>
                              <p className="mt-0.5 text-[11px] text-gray-400">
                                {x.start_year || fmtDate(x.start_date)} - {x.is_current ? c.present : (x.end_year || fmtDate(x.end_date))}
                              </p>
                              {x.duties && <p className="mt-1 whitespace-pre-wrap text-xs text-gray-700">{x.duties}</p>}
                              {x.supervisor_name && (
                                <p className="mt-1 text-[11px] text-gray-500">
                                  {x.supervisor_name}
                                  {x.may_contact ? ` | ${x.supervisor_contact ?? ''}` : ''}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {/* documents */}
                    <Section icon={<FileText className="h-4 w-4 text-teal-600" />} title={c.documents}>
                      {set && set.documents.length > 0 ? (
                        <div className="space-y-2">
                          {set.documents.map((d, i) => (
                            <button
                              key={i}
                              onClick={() => void openDoc(d)}
                              className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-start transition hover:bg-teal-50"
                            >
                              <FileText className="h-5 w-5 shrink-0 text-teal-600" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-gray-900">
                                  {d.label || d.other_label || d.document_type}
                                </span>
                                <span className="block truncate text-xs text-gray-500">
                                  {d.original_filename} {fmtSize(d.file_size_bytes)}
                                </span>
                              </span>
                              <Download className="h-4 w-4 shrink-0 text-gray-400" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {a.resume_url ? (
                            <a href={a.resume_url} target="_blank" rel="noopener noreferrer"
                               className="text-teal-600 underline">{c.open}</a>
                          ) : c.noFiles}
                        </p>
                      )}
                    </Section>

                    {a.can_drive && (
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Car className="h-3.5 w-3.5" /> {c.canDrive}: {c.yes}
                        {a.driving_experience_years ? ` (${a.driving_experience_years})` : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__JOBAPPLICANTS_FIX219__COMPLETE
