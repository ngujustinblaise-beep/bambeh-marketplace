// BAMBEH_DEPLOY_TOKEN__JOBREQUIREMENTSPANEL_FIX196_START
/**
 * JobRequirementsPanel.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/Jobs/JobRequirementsPanel.tsx
 *
 * FIX196 — THE JOB GIVER'S SIDE OF THE APPLICATION FORM
 *
 * This is the panel Big asked for: the employer decides what applicants must
 * submit. It reads/writes public.job_application_requirements (FIX194).
 *
 * The applicant form (JobApplyModal FIX195) reads that row and shows exactly
 * what is switched on here. No row = nothing required.
 *
 * ── WIRE-IN (two options) ─────────────────────────────────────────────────
 *
 * A) Inside PostJobPage.tsx, AFTER the job row is created and you have its id:
 *      import JobRequirementsPanel from '@/components/Jobs/JobRequirementsPanel';
 *      ...
 *      {newJobId && (
 *        <JobRequirementsPanel jobId={newJobId} onSaved={() => navigate('/jobs')} />
 *      )}
 *
 * B) Inside EditJobListing.tsx, anywhere in the form:
 *      <JobRequirementsPanel jobId={id!} />
 *
 * Requires: FIX194_job_application_schema.sql already run.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck, Car, Upload, CalendarCheck, Languages as LangIcon,
  FileText, Loader2, CheckCircle2, Plus, Trash2, Globe,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  jobId: string;
  onSaved?: () => void;
};

type OtherDoc = { key: string; label: string; required: boolean };

const LEVELS = ['beginner', 'elementary', 'intermediate', 'advanced', 'fluent', 'native'] as const;
const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner', elementary: 'Elementary', intermediate: 'Intermediate',
  advanced: 'Advanced', fluent: 'Fluent', native: 'Native',
};

const ID_TYPES = [
  { v: 'national_id',     l: 'National ID card' },
  { v: 'resident_permit', l: 'Resident permit' },
  { v: 'passport',        l: 'Passport' },
  { v: 'other',           l: 'Other (applicant types it)' },
];

const card   = 'rounded-2xl border border-gray-200 bg-white p-4';
const label  = 'mb-2 block text-sm font-medium text-gray-700';
const input  = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
const heading = 'flex items-center gap-2 text-sm font-bold text-gray-900';

/* Reusable switch row: label + description + toggle */
function Toggle({
  on, onChange, title, hint,
}: { on: boolean; onChange: (v: boolean) => void; title: string; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className="flex w-full items-start justify-between gap-4 rounded-xl px-1 py-2.5 text-left transition hover:bg-gray-50">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900">{title}</span>
        {hint && <span className="mt-0.5 block text-xs text-gray-500">{hint}</span>}
      </span>
      <span className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-teal-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

export default function JobRequirementsPanel({ jobId, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');
  const [languageList, setLanguageList] = useState<{ code: string; name_en: string }[]>([]);

  const [jobCountry, setJobCountry]           = useState('Cameroon');
  const [reqNationality, setReqNationality]   = useState(false);
  const [reqWorkAuth, setReqWorkAuth]         = useState(false);
  const [reqIdDoc, setReqIdDoc]               = useState(false);
  const [allowedIdTypes, setAllowedIdTypes]   = useState<string[]>(['national_id', 'resident_permit', 'passport', 'other']);
  const [reqDriving, setReqDriving]           = useState(false);
  const [reqLicenceDoc, setReqLicenceDoc]     = useState(false);
  const [reqCv, setReqCv]                     = useState(false);
  const [reqPortfolio, setReqPortfolio]       = useState(false);
  const [reqCoverLetter, setReqCoverLetter]   = useState(false);
  const [langCount, setLangCount]             = useState(1);
  const [reqLangs, setReqLangs]               = useState<string[]>([]);
  const [minLevel, setMinLevel]               = useState('beginner');
  const [reqInterview, setReqInterview]       = useState(false);
  const [reqLangTest, setReqLangTest]         = useState(false);
  const [otherDocs, setOtherDocs]             = useState<OtherDoc[]>([]);
  const [specialRequest, setSpecialRequest]   = useState('');

  const [newDocLabel, setNewDocLabel] = useState('');

  /* ── load existing row + language list ─────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: ls } = await supabase
        .from('languages').select('code, name_en').eq('is_active', true).order('sort_order');
      if (!cancelled && ls?.length) setLanguageList(ls);

      const { data: r } = await supabase
        .from('job_application_requirements').select('*').eq('job_id', jobId).maybeSingle();

      if (!cancelled && r) {
        setJobCountry(r.job_country ?? 'Cameroon');
        setReqNationality(!!r.require_nationality);
        setReqWorkAuth(!!r.require_work_authorization);
        setReqIdDoc(!!r.require_id_document);
        setAllowedIdTypes((r.allowed_id_document_types as string[] | null) ?? allowedIdTypes);
        setReqDriving(!!r.require_driving_ability);
        setReqLicenceDoc(!!r.require_driving_licence_doc);
        setReqCv(!!r.require_cv);
        setReqPortfolio(!!r.require_portfolio);
        setReqCoverLetter(!!r.require_cover_letter);
        setLangCount(r.required_language_count ?? 1);
        setReqLangs((r.required_languages as string[] | null) ?? []);
        setMinLevel(r.minimum_language_level ?? 'beginner');
        setReqInterview(!!r.require_interview_availability);
        setReqLangTest(!!r.require_language_test_availability);
        setOtherDocs(Array.isArray(r.other_documents) ? (r.other_documents as OtherDoc[]) : []);
        setSpecialRequest(r.special_request ?? '');
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const langOptions = useMemo(
    () => (languageList.length ? languageList
      : [{ code: 'en', name_en: 'English' }, { code: 'fr', name_en: 'French' }]),
    [languageList],
  );

  /* ── save ──────────────────────────────────────────────────────────────── */
  async function handleSave() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const { data: auth } = await supabase.auth.getUser();

      const { error: upErr } = await supabase
        .from('job_application_requirements')
        .upsert({
          job_id: jobId,
          employer_id: auth?.user?.id ?? null,
          job_country: jobCountry.trim() || null,
          require_nationality: reqNationality,
          require_work_authorization: reqWorkAuth,
          require_id_document: reqIdDoc,
          allowed_id_document_types: allowedIdTypes.length ? allowedIdTypes : ['national_id'],
          require_driving_ability: reqDriving,
          require_driving_licence_doc: reqDriving ? reqLicenceDoc : false,
          require_cv: reqCv,
          require_portfolio: reqPortfolio,
          require_cover_letter: reqCoverLetter,
          required_language_count: Math.min(4, Math.max(1, langCount)),
          required_languages: reqLangs,
          minimum_language_level: minLevel,
          require_interview_availability: reqInterview,
          require_language_test_availability: reqLangTest,
          other_documents: otherDocs,
          special_request: specialRequest.trim() || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'job_id' });

      if (upErr) throw new Error(upErr.message);
      setSaved(true);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the requirements.');
    } finally {
      setSaving(false);
    }
  }

  function toggleIdType(v: string) {
    setAllowedIdTypes(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  }
  function toggleReqLang(code: string) {
    setReqLangs(p => p.includes(code) ? p.filter(x => x !== code) : [...p, code].slice(0, 4));
  }
  function addOtherDoc() {
    const l = newDocLabel.trim();
    if (!l) return;
    const key = l.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
    if (otherDocs.some(d => d.key === key)) { setNewDocLabel(''); return; }
    setOtherDocs(p => [...p, { key, label: l, required: true }]);
    setNewDocLabel('');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-4 text-white">
        <h3 className="text-lg font-bold">What must applicants submit?</h3>
        <p className="mt-1 text-sm text-teal-50">
          Switch on anything that is compulsory for this job. Anything left off stays
          optional for the applicant.
        </p>
      </div>

      {/* Eligibility */}
      <div className={card}>
        <h4 className={heading}><ShieldCheck className="h-4 w-4 text-teal-600" />Eligibility to work</h4>
        <label className="mt-3 block">
          <span className={label}>Country this job is based in</span>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" value={jobCountry} onChange={e => setJobCountry(e.target.value)}
              placeholder="e.g. Cameroon" className={`${input} pl-11`} />
          </div>
        </label>
        <div className="mt-2 divide-y divide-gray-100">
          <Toggle on={reqNationality} onChange={setReqNationality}
            title="Require nationality" hint="Applicant must state nationality and country of residence" />
          <Toggle on={reqWorkAuth} onChange={setReqWorkAuth}
            title="Require legal right to work"
            hint="Asks if they are a citizen of the job country and what permit they hold" />
          <Toggle on={reqIdDoc} onChange={setReqIdDoc}
            title="Require a legal identity document"
            hint="Applicant selects a document type and uploads it" />
        </div>
        {reqIdDoc && (
          <div className="mt-3 rounded-xl bg-gray-50 p-3">
            <span className="mb-2 block text-xs font-semibold text-gray-600">
              Which documents do you accept?
            </span>
            <div className="flex flex-wrap gap-2">
              {ID_TYPES.map(t => (
                <button key={t.v} type="button" onClick={() => toggleIdType(t.v)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    allowedIdTypes.includes(t.v)
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-gray-200 bg-white text-gray-600'}`}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Driving */}
      <div className={card}>
        <h4 className={heading}><Car className="h-4 w-4 text-teal-600" />Driving</h4>
        <div className="mt-2 divide-y divide-gray-100">
          <Toggle on={reqDriving} onChange={setReqDriving}
            title="Driving ability is required for this job"
            hint="Applicant is asked whether they can drive, and their licence class" />
          {reqDriving && (
            <Toggle on={reqLicenceDoc} onChange={setReqLicenceDoc}
              title="Also require a licence upload" hint="Applicant must attach the licence document" />
          )}
        </div>
      </div>

      {/* Languages */}
      <div className={card}>
        <h4 className={heading}><LangIcon className="h-4 w-4 text-teal-600" />Languages</h4>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>How many languages must they declare?</span>
            <select value={langCount} onChange={e => setLangCount(Number(e.target.value))} className={input}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={label}>Minimum level</span>
            <select value={minLevel} onChange={e => setMinLevel(e.target.value)} className={input}>
              {LEVELS.map(v => <option key={v} value={v}>{LEVEL_LABEL[v]}</option>)}
            </select>
          </label>
        </div>
        <span className="mt-3 mb-2 block text-xs font-semibold text-gray-600">
          Specific languages this job needs (optional — pick up to 4)
        </span>
        <div className="flex flex-wrap gap-2">
          {langOptions.map(l => (
            <button key={l.code} type="button" onClick={() => toggleReqLang(l.code)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                reqLangs.includes(l.code)
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              {l.name_en}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Applicants always rate speaking, writing, listening and comprehension separately.
        </p>
      </div>

      {/* Documents */}
      <div className={card}>
        <h4 className={heading}><Upload className="h-4 w-4 text-teal-600" />Documents</h4>
        <div className="mt-2 divide-y divide-gray-100">
          <Toggle on={reqCv} onChange={setReqCv}
            title="CV / Resume is compulsory" hint="Off = applicant may still attach one" />
          <Toggle on={reqPortfolio} onChange={setReqPortfolio}
            title="Portfolio is compulsory" hint="Useful for creative and technical roles" />
          <Toggle on={reqCoverLetter} onChange={setReqCoverLetter}
            title="Cover letter / motivation is compulsory" />
        </div>

        <span className="mt-4 mb-2 block text-xs font-semibold text-gray-600">
          Other documents you want (transcript, diploma, licence…)
        </span>
        {otherDocs.length > 0 && (
          <ul className="mb-3 space-y-2">
            {otherDocs.map((d, i) => (
              <li key={d.key} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm text-gray-800">{d.label}</span>
                <button type="button"
                  onClick={() => setOtherDocs(p => p.map((x, j) => j === i ? { ...x, required: !x.required } : x))}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    d.required ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {d.required ? 'Required' : 'Optional'}
                </button>
                <button type="button" onClick={() => setOtherDocs(p => p.filter((_, j) => j !== i))}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input type="text" value={newDocLabel} onChange={e => setNewDocLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOtherDoc(); } }}
            placeholder="e.g. University transcript" className={input} />
          <button type="button" onClick={addOtherDoc}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 text-sm font-semibold text-teal-700 hover:bg-teal-100">
            <Plus className="h-4 w-4" />Add
          </button>
        </div>
      </div>

      {/* Availability */}
      <div className={card}>
        <h4 className={heading}><CalendarCheck className="h-4 w-4 text-teal-600" />Availability</h4>
        <div className="mt-2 divide-y divide-gray-100">
          <Toggle on={reqInterview} onChange={setReqInterview}
            title="Ask about interview availability" hint="Applicant confirms and gives a start date" />
          <Toggle on={reqLangTest} onChange={setReqLangTest}
            title="Ask if they can sit a language test" />
        </div>
      </div>

      {/* Special request */}
      <div className={card}>
        <h4 className={heading}><FileText className="h-4 w-4 text-teal-600" />Special request or screening question</h4>
        <textarea value={specialRequest} onChange={e => setSpecialRequest(e.target.value)} rows={4}
          placeholder="Anything else you want every applicant to answer…"
          className={`${input} mt-3 min-h-24`} />
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {saved && !error && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />Saved. Applicants will now see exactly these sections.
        </p>
      )}

      <button type="button" onClick={handleSave} disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'Saving…' : 'Save application requirements'}
      </button>
    </div>
  );
}
// BAMBEH_END_TOKEN__JOBREQUIREMENTSPANEL_FIX196__COMPLETE
