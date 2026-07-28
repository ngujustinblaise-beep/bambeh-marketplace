// BAMBEH_DEPLOY_TOKEN__JOBAPPLYMODAL_FIX219_START
/**
 * JobApplyModal.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/Jobs/JobApplyModal.tsx   <-- THE WIRED ONE
 *   (JobDetails.tsx imports '@/components/Jobs/JobApplyModal'. Confirm the
 *    folder casing on disk before saving so you OVERWRITE, not duplicate.)
 *
 * FIX195 — FULL EMPLOYER-TOGGLED APPLICATION FORM
 *
 * Requires FIX194_job_application_schema.sql to have been run.
 *
 * WHAT IT DOES
 *  1. Loads public.job_application_requirements for this job.
 *     NO ROW  ->  everything optional except name / email / phone / 1 language.
 *                 (So every job posted before FIX194 keeps working.)
 *  2. Shows ONLY the sections the job giver switched on.
 *  3. Multi-step, validated, with a review step before submit.
 *  4. Writes job_applications, then job_application_languages, then uploads
 *     files to Storage bucket 'job-documents' (private) and writes
 *     job_application_documents.
 *  5. Fixes the empty-string-uuid notification bug: if employerId is not a
 *     real uuid the notify is skipped instead of throwing a 400.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, User, Mail, Phone, FileText, Loader2, CheckCircle2, AlertCircle,
  Globe, ShieldCheck, Car, Upload, CalendarCheck, Languages as LangIcon,
  ChevronLeft, ChevronRight, Trash2, Plus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ── types ────────────────────────────────────────────────────────────── */

type Props = {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  employerId: string;
  jobTitle?: string;
  onSuccess?: () => void | Promise<void>;
};

type OtherDoc = { key: string; label: string; required?: boolean };

type Requirements = {
  job_country: string | null;
  require_nationality: boolean;
  require_work_authorization: boolean;
  require_id_document: boolean;
  allowed_id_document_types: string[];
  require_driving_ability: boolean;
  require_driving_licence_doc: boolean;
  require_cv: boolean;
  require_portfolio: boolean;
  require_cover_letter: boolean;
  required_language_count: number;
  required_languages: string[];
  minimum_language_level: string;
  require_interview_availability: boolean;
  require_language_test_availability: boolean;
  other_documents: OtherDoc[];
  special_request: string | null;
};

/**
 * FIX217 - THE DEFAULTS ARE NOW ON.
 *
 * Every section of this form is gated behind a flag read from
 * job_application_requirements. That table did not exist, so the query
 * returned nothing, every flag fell back to false, and the wizard collapsed
 * to personal -> languages -> review. The CV upload and the right-to-work
 * section were built all along; they were simply switched off.
 *
 * These are now the DEFAULTS for any job whose employer has not chosen
 * otherwise: identity, right to work and a CV are always asked for.
 * An employer row still overrides any of them.
 */
const NO_REQUIREMENTS: Requirements = {
  job_country: 'CM',
  require_nationality: true,
  require_work_authorization: true,
  require_id_document: true,
  allowed_id_document_types: ['national_id', 'resident_permit', 'passport', 'other'],
  require_driving_ability: false,
  require_driving_licence_doc: false,
  require_cv: true,
  require_portfolio: false,
  require_cover_letter: false,
  required_language_count: 1,
  required_languages: [],
  minimum_language_level: 'beginner',
  require_interview_availability: true,
  require_language_test_availability: false,
  other_documents: [],
  special_request: null,
};

type LangRow = {
  language_code: string;
  speaking: string;
  writing: string;
  listening: string;
  comprehension: string;
};

const LEVELS = ['beginner', 'elementary', 'intermediate', 'advanced', 'fluent', 'native'] as const;

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner', elementary: 'Elementary', intermediate: 'Intermediate',
  advanced: 'Advanced', fluent: 'Fluent', native: 'Native',
};

const WORK_AUTH = [
  { v: 'citizen',            l: 'Citizen of this country' },
  { v: 'permanent_resident', l: 'Permanent resident' },
  { v: 'work_permit',        l: 'I hold a work permit' },
  { v: 'student_permit',     l: 'Student permit' },
  { v: 'needs_sponsorship',  l: 'I would need sponsorship' },
  { v: 'other',              l: 'Other' },
];

const ID_DOC_LABEL: Record<string, string> = {
  national_id: 'National ID card',
  resident_permit: 'Resident permit',
  passport: 'Passport',
  driving_licence: 'Driving licence',
  other: 'Other document',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ── styles ───────────────────────────────────────────────────────────── */

const input =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
const select = input + ' appearance-none';
const label = 'mb-2 block text-sm font-medium text-gray-700';
const sectionTitle = 'flex items-center gap-2 text-base font-bold text-gray-900';

/* ── component ────────────────────────────────────────────────────────── */

export default function JobApplyModal({
  isOpen, onClose, jobId, employerId, jobTitle, onSuccess,
}: Props) {
  const [userId, setUserId]   = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [step, setStep]       = useState(0);

  const [req, setReq] = useState<Requirements>(NO_REQUIREMENTS);
  const [languageList, setLanguageList] =
    useState<{ code: string; name_en: string }[]>([]);

  // personal
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [cover, setCover]       = useState('');

  // eligibility
  const [nationality, setNationality]   = useState('');
  const [residence, setResidence]       = useState('');
  const [isCitizen, setIsCitizen]       = useState<boolean | null>(null);
  const [workAuth, setWorkAuth]         = useState('');
  const [idType, setIdType]             = useState('');
  const [idOtherLabel, setIdOtherLabel] = useState('');
  const [idNumber, setIdNumber]         = useState('');

  // driving
  const [canDrive, setCanDrive]         = useState<boolean | null>(null);
  const [licenceClass, setLicenceClass] = useState('');

  // languages
  const [langs, setLangs] = useState<LangRow[]>([
    { language_code: 'en', speaking: 'intermediate', writing: 'intermediate', listening: 'intermediate', comprehension: 'intermediate' },
  ]);

  // documents  { docType -> File }
  const [files, setFiles] = useState<Record<string, File | null>>({});

  // availability
  const [forInterview, setForInterview] = useState<boolean | null>(null);
  const [interviewFrom, setInterviewFrom] = useState('');
  const [forLangTest, setForLangTest]   = useState<boolean | null>(null);
  const [availNotes, setAvailNotes]     = useState('');
  const [specialAnswer, setSpecialAnswer] = useState('');

  const firstRef = useRef<HTMLInputElement | null>(null);

  /* ── escape key ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    setTimeout(() => firstRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  /* ── on open: user, duplicate check, requirements, language list ─────── */
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setChecking(true); setError(''); setDone(false); setStep(0);

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id ?? null;
      if (cancelled) return;
      setUserId(uid);

      if (uid) {
        const em = auth?.user?.email ?? '';
        if (em) setEmail(prev => prev || em);
      }

      if (uid && jobId) {
        const { data: existing } = await supabase
          .from('job_applications').select('id')
          .eq('job_id', jobId).eq('applicant_id', uid).limit(1);
        if (!cancelled) setAlreadyApplied(!!(existing && existing.length));
      }

      // Requirements — absent row is normal, not an error.
      const { data: r, error: rErr } = await supabase
        .from('job_application_requirements')
        .select('*').eq('job_id', jobId).maybeSingle();
      if (rErr) {
        // FIX217: never silent again. A missing table used to look identical
        // to "this employer asked for nothing", which hid the bug for weeks.
        console.warn('[JobApply] requirements lookup failed, using defaults:', rErr.message);
      }
      if (!cancelled && r) {
        setReq({
          ...NO_REQUIREMENTS,
          ...r,
          allowed_id_document_types:
            (r.allowed_id_document_types as string[] | null) ?? NO_REQUIREMENTS.allowed_id_document_types,
          required_languages: (r.required_languages as string[] | null) ?? [],
          other_documents: Array.isArray(r.other_documents) ? (r.other_documents as OtherDoc[]) : [],
        });
      }

      const { data: ls } = await supabase
        .from('languages').select('code, name_en')
        .eq('is_active', true).order('sort_order');
      if (!cancelled && ls?.length) setLanguageList(ls);

      if (!cancelled) setChecking(false);
    })();

    return () => { cancelled = true; };
  }, [isOpen, jobId]);

  /* ── which steps exist for this job ─────────────────────────────────── */
  const steps = useMemo(() => {
    const s: { key: string; title: string }[] = [{ key: 'personal', title: 'Your details' }];
    if (req.require_nationality || req.require_work_authorization || req.require_id_document)
      s.push({ key: 'eligibility', title: 'Eligibility to work' });
    if (req.require_driving_ability) s.push({ key: 'driving', title: 'Driving' });
    s.push({ key: 'languages', title: 'Languages' });
    if (req.require_cv || req.require_portfolio || req.require_cover_letter ||
        req.require_id_document || req.require_driving_licence_doc ||
        req.other_documents.length > 0)
      s.push({ key: 'documents', title: 'Documents' });
    if (req.require_interview_availability || req.require_language_test_availability)
      s.push({ key: 'availability', title: 'Availability' });
    if (req.special_request) s.push({ key: 'special', title: 'Employer request' });
    s.push({ key: 'review', title: 'Review & submit' });
    return s;
  }, [req]);

  const current = steps[Math.min(step, steps.length - 1)]?.key ?? 'personal';

  /* ── validation ─────────────────────────────────────────────────────── */
  const stepError = useMemo((): string => {
    if (current === 'personal') {
      if (!fullName.trim()) return 'Please enter your full name.';
      if (!email.trim())    return 'Please enter your email.';
      if (!phone.trim())    return 'Please enter your phone number.';
    }
    if (current === 'eligibility') {
      if (req.require_nationality && !nationality.trim()) return 'Please enter your nationality.';
      if (req.require_work_authorization && isCitizen === null)
        return 'Please say whether you are a citizen of the job country.';
      if (req.require_work_authorization && !workAuth)
        return 'Please select your work authorization.';
      if (req.require_id_document && !idType) return 'Please select your legal document type.';
      if (req.require_id_document && idType === 'other' && !idOtherLabel.trim())
        return 'Please type the kind of document you have.';
    }
    if (current === 'driving' && req.require_driving_ability && canDrive === null)
      return 'Please say whether you can drive.';
    if (current === 'languages') {
      if (langs.length < 1) return 'Please add at least one language.';
      const need = Math.max(1, req.required_language_count ?? 1);
      if (langs.length < need) return `This employer requires at least ${need} language(s).`;
      const codes = langs.map(l => l.language_code);
      if (new Set(codes).size !== codes.length) return 'Please remove the duplicate language.';
      for (const rc of req.required_languages ?? []) {
        if (!codes.includes(rc)) {
          const nm = languageList.find(l => l.code === rc)?.name_en ?? rc;
          return `${nm} is required for this job.`;
        }
      }
    }
    if (current === 'documents') {
      if (req.require_cv && !files['cv']) return 'This employer requires a CV upload.';
      if (req.require_portfolio && !files['portfolio']) return 'A portfolio is required.';
      if (req.require_cover_letter && !files['cover_letter'] && !cover.trim())
        return 'A cover letter is required — upload one or write your message.';
      if (req.require_id_document && !files['id_document'])
        return 'This employer requires your legal document upload.';
      if (req.require_driving_licence_doc && !files['driving_licence'])
        return 'A driving licence upload is required.';
      for (const d of req.other_documents) {
        if (d.required && !files[`other:${d.key}`]) return `${d.label} is required.`;
      }
    }
    if (current === 'availability') {
      if (req.require_interview_availability && forInterview === null)
        return 'Please confirm your interview availability.';
      if (req.require_language_test_availability && forLangTest === null)
        return 'Please confirm whether you can sit a language test.';
    }
    return '';
  }, [current, fullName, email, phone, cover, nationality, isCitizen, workAuth, idType,
      idOtherLabel, canDrive, langs, files, forInterview, forLangTest, req, languageList]);

  /* ── submit ─────────────────────────────────────────────────────────── */
  async function handleSubmit() {
    if (!userId) { setError('Please sign in to apply.'); return; }
    if (userId === employerId) { setError('You cannot apply to your own job.'); return; }
    setLoading(true); setError('');

    try {
      const { data: created, error: insErr } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          employer_id: UUID_RE.test(employerId) ? employerId : null,
          applicant_id: userId,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          cover_letter: cover.trim() || null,
          method: 'in_app',
          status: 'pending',
          nationality: nationality.trim() || null,
          country_of_residence: residence.trim() || null,
          is_citizen_of_job_country: isCitizen,
          work_authorization: workAuth || null,
          id_document_type: idType || null,
          id_document_other_label: idType === 'other' ? (idOtherLabel.trim() || null) : null,
          id_document_number: idNumber.trim() || null,
          can_drive: canDrive,
          driving_licence_class: licenceClass.trim() || null,
          available_for_interview: forInterview,
          interview_available_from: interviewFrom || null,
          available_for_language_test: forLangTest,
          availability_notes: availNotes.trim() || null,
          special_request_answer: specialAnswer.trim() || null,
          submitted_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insErr) {
        if (String(insErr.code) === '23505') { setAlreadyApplied(true); return; }
        throw new Error(insErr.message);
      }

      const applicationId = created?.id as string;

      // Languages
      if (langs.length) {
        const { error: lErr } = await supabase
          .from('job_application_languages')
          .insert(langs.map(l => ({ ...l, application_id: applicationId })));
        if (lErr) throw new Error(`Application saved, but languages failed: ${lErr.message}`);
      }

      // Documents
      const entries = Object.entries(files).filter(([, f]) => !!f) as [string, File][];
      for (const [key, file] of entries) {
        const isOther  = key.startsWith('other:');
        const docType  = isOther ? 'other' : key === 'id_document' ? (idType || 'other') : key;
        const otherLbl = isOther
          ? (req.other_documents.find(d => `other:${d.key}` === key)?.label ?? key.slice(6))
          : null;

        const safe = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
        const path = `${userId}/${applicationId}/${key.replace(':', '_')}-${Date.now()}-${safe}`;

        const { error: upErr } = await supabase.storage
          .from('job-documents')
          .upload(path, file, { upsert: false, contentType: file.type || undefined });
        if (upErr) throw new Error(`Application saved, but "${file.name}" failed to upload: ${upErr.message}`);

        const { error: dErr } = await supabase.from('job_application_documents').insert({
          application_id: applicationId,
          document_type: docType,
          other_label: otherLbl,
          storage_bucket: 'job-documents',
          storage_path: path,
          original_filename: file.name,
          mime_type: file.type || null,
          file_size_bytes: file.size,
          status: 'uploaded',
        });
        if (dErr) throw new Error(`Application saved, but a document record failed: ${dErr.message}`);
      }

      // Notify employer — FIX: skip when employerId isn't a real uuid ("" used to 400).
      if (UUID_RE.test(employerId)) {
        try {
          const base = {
            user_id: employerId,
            title: 'New job application',
            body: `${fullName.trim()} applied${jobTitle ? ` for ${jobTitle}` : ''}`,
            data: { job_id: jobId, applicant_id: userId, application_id: applicationId },
            // FIX219: deep-link straight to the new applicants page.
            action_url: `/jobs/${jobId}/applicants`,
            is_read: false,
          };
          // FIX219: notifications.type is guarded by notifications_type_check.
          // If 'job_application' is not in that list the insert used to fail
          // silently and the employer was never told. Fall back to a type we
          // know the constraint accepts rather than lose the signal.
          const { error: n1 } = await supabase
            .from('notifications').insert({ ...base, type: 'job_application' });
          if (n1) {
            console.warn('[JobApply] notification type rejected, retrying:', n1.message);
            const { error: n2 } = await supabase
              .from('notifications').insert({ ...base, type: 'message' });
            if (n2) console.warn('[JobApply] employer notification failed:', n2.message);
          }
        } catch { /* best-effort */ }
      }

      // FIX219 - THE ZERO-APPLICANT BUG.
      // JobDetails renders listings.extra.application_count. That counter was
      // only ever incremented inside jobs.service.applyForJob(), which this
      // modal replaced and nothing calls any more. So real applications saved
      // correctly and the job still advertised "0 applicants". Bump it here.
      try {
        const { data: lrow } = await supabase
          .from('listings').select('extra').eq('id', jobId).maybeSingle();
        if (lrow) {
          const extra = ((lrow as { extra?: Record<string, unknown> }).extra ?? {}) as Record<string, unknown>;
          const next = Number(extra.application_count ?? 0) + 1;
          await supabase.from('listings')
            .update({ extra: { ...extra, application_count: next } })
            .eq('id', jobId);
        }
      } catch (e) {
        console.warn('[JobApply] applicant counter not bumped:', e);
      }

      setDone(true);
      await onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your application.');
    } finally {
      setLoading(false);
    }
  }

  /* ── small helpers ──────────────────────────────────────────────────── */
  const YesNo = ({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) => (
    <div className="flex gap-3">
      {[true, false].map(v => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
            value === v ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  );

  const FileField = ({ k, text, required }: { k: string; text: string; required?: boolean }) => (
    <label className="block">
      <span className={label}>
        {text} {required ? <span className="text-red-500">*</span>
                         : <span className="text-gray-400">(optional)</span>}
      </span>
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3">
        <Upload className="h-4 w-4 shrink-0 text-gray-400" />
        <input type="file" className="w-full text-xs"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={e => setFiles(p => ({ ...p, [k]: e.target.files?.[0] ?? null }))} />
      </div>
      {files[k] && <p className="mt-1 text-xs text-emerald-600">{files[k]!.name}</p>}
    </label>
  );

  if (!isOpen) return null;

  /* ── shell ──────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button aria-label="Close" onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-gray-50 shadow-2xl ring-1 ring-black/5 sm:max-w-2xl sm:rounded-3xl">

        <div className="flex items-start justify-between bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-4 text-white">
          <div className="pr-4">
            <h2 className="text-xl font-bold leading-tight">Apply for this job</h2>
            {jobTitle && <p className="mt-1 text-sm text-teal-50">{jobTitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition hover:bg-white/15">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!checking && userId && !alreadyApplied && !done && (
          <div className="border-b border-gray-200 bg-white px-5 py-3">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
              <span>Step {step + 1} of {steps.length} — {steps[step]?.title}</span>
              <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-teal-600 transition-all"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {checking ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            </div>
          ) : !userId ? (
            <div className="px-6 py-12 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
              <p className="text-sm text-gray-700">Please sign in to apply for this job.</p>
              <button onClick={onClose} className="mt-5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Close</button>
            </div>
          ) : alreadyApplied ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
              <h3 className="text-lg font-bold text-gray-900">You've already applied</h3>
              <p className="mt-1 text-sm text-gray-600">The employer has your application for this job.</p>
              <button onClick={onClose} className="mt-5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Done</button>
            </div>
          ) : done ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
              <h3 className="text-lg font-bold text-gray-900">Application sent!</h3>
              <p className="mt-1 text-sm text-gray-600">The employer has been notified. Good luck!</p>
              <button onClick={onClose} className="mt-5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Done</button>
            </div>
          ) : (
            <div className="space-y-5 px-5 py-5 sm:px-6">

              {current === 'personal' && (
                <>
                  <h3 className={sectionTitle}><User className="h-4 w-4 text-teal-600" />Your details</h3>
                  <label className="block">
                    <span className={label}>Full name <span className="text-red-500">*</span></span>
                    <input ref={firstRef} type="text" value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name" className={input} />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={label}>Email <span className="text-red-500">*</span></span>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="you@email.com" className={`${input} pl-11`} />
                      </div>
                    </label>
                    <label className="block">
                      <span className={label}>Phone <span className="text-red-500">*</span></span>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="+237 6XX XXX XXX" className={`${input} pl-11`} />
                      </div>
                    </label>
                  </div>
                  <label className="block">
                    <span className={label}>
                      Cover message {req.require_cover_letter
                        ? <span className="text-red-500">*</span>
                        : <span className="text-gray-400">(optional)</span>}
                    </span>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                      <textarea value={cover} onChange={e => setCover(e.target.value)} rows={4}
                        placeholder="Why you're a good fit…" className={`${input} min-h-28 pl-11 pt-3`} />
                    </div>
                  </label>
                </>
              )}

              {current === 'eligibility' && (
                <>
                  <h3 className={sectionTitle}><ShieldCheck className="h-4 w-4 text-teal-600" />Eligibility to work</h3>
                  {req.job_country && (
                    <p className="rounded-xl bg-teal-50 px-3 py-2 text-xs text-teal-800">
                      This role is based in <strong>{req.job_country}</strong>.
                    </p>
                  )}
                  {req.require_nationality && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className={label}>Nationality <span className="text-red-500">*</span></span>
                        <div className="relative">
                          <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={nationality} onChange={e => setNationality(e.target.value)}
                            placeholder="e.g. Cameroonian" className={`${input} pl-11`} />
                        </div>
                      </label>
                      <label className="block">
                        <span className={label}>Country of residence</span>
                        <input type="text" value={residence} onChange={e => setResidence(e.target.value)}
                          placeholder="e.g. Cameroon" className={input} />
                      </label>
                    </div>
                  )}
                  {req.require_work_authorization && (
                    <>
                      <div>
                        <span className={label}>
                          Are you a citizen of {req.job_country || 'the job country'}? <span className="text-red-500">*</span>
                        </span>
                        <YesNo value={isCitizen} onChange={setIsCitizen} />
                      </div>
                      <label className="block">
                        <span className={label}>Legal right to work <span className="text-red-500">*</span></span>
                        <select value={workAuth} onChange={e => setWorkAuth(e.target.value)} className={select}>
                          <option value="">Select…</option>
                          {WORK_AUTH.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </label>
                    </>
                  )}
                  {req.require_id_document && (
                    <>
                      <label className="block">
                        <span className={label}>Legal document you hold <span className="text-red-500">*</span></span>
                        <select value={idType} onChange={e => setIdType(e.target.value)} className={select}>
                          <option value="">Select…</option>
                          {req.allowed_id_document_types.map(t =>
                            <option key={t} value={t}>{ID_DOC_LABEL[t] ?? t}</option>)}
                        </select>
                      </label>
                      {idType === 'other' && (
                        <label className="block">
                          <span className={label}>Which document? <span className="text-red-500">*</span></span>
                          <input type="text" value={idOtherLabel} onChange={e => setIdOtherLabel(e.target.value)}
                            placeholder="Type the kind of document" className={input} />
                        </label>
                      )}
                      <label className="block">
                        <span className={label}>Document number <span className="text-gray-400">(optional)</span></span>
                        <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} className={input} />
                      </label>
                    </>
                  )}
                </>
              )}

              {current === 'driving' && (
                <>
                  <h3 className={sectionTitle}><Car className="h-4 w-4 text-teal-600" />Driving</h3>
                  <div>
                    <span className={label}>Can you drive? <span className="text-red-500">*</span></span>
                    <YesNo value={canDrive} onChange={setCanDrive} />
                  </div>
                  {canDrive && (
                    <label className="block">
                      <span className={label}>Licence class <span className="text-gray-400">(optional)</span></span>
                      <input type="text" value={licenceClass} onChange={e => setLicenceClass(e.target.value)}
                        placeholder="e.g. Category B" className={input} />
                    </label>
                  )}
                </>
              )}

              {current === 'languages' && (
                <>
                  <h3 className={sectionTitle}><LangIcon className="h-4 w-4 text-teal-600" />Languages</h3>
                  <p className="text-xs text-gray-500">
                    You must declare at least {Math.max(1, req.required_language_count)} language
                    {req.minimum_language_level !== 'beginner' &&
                      ` at ${LEVEL_LABEL[req.minimum_language_level]} level or above`}.
                  </p>
                  {langs.map((l, i) => (
                    <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <select value={l.language_code} className={select}
                          onChange={e => setLangs(p => p.map((x, j) =>
                            j === i ? { ...x, language_code: e.target.value } : x))}>
                          {(languageList.length
                            ? languageList
                            : [{ code: 'en', name_en: 'English' }, { code: 'fr', name_en: 'French' }]
                          ).map(o => <option key={o.code} value={o.code}>{o.name_en}</option>)}
                        </select>
                        {langs.length > 1 && (
                          <button type="button" onClick={() => setLangs(p => p.filter((_, j) => j !== i))}
                            className="rounded-xl border border-gray-200 p-2.5 text-gray-500 hover:bg-gray-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {(['speaking', 'writing', 'listening', 'comprehension'] as const).map(skill => (
                          <label key={skill} className="block">
                            <span className="mb-1 block text-xs font-medium capitalize text-gray-600">{skill}</span>
                            <select value={l[skill]} className={select + ' py-2 text-xs'}
                              onChange={e => setLangs(p => p.map((x, j) =>
                                j === i ? { ...x, [skill]: e.target.value } : x))}>
                              {LEVELS.map(v => <option key={v} value={v}>{LEVEL_LABEL[v]}</option>)}
                            </select>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  {langs.length < 4 && (
                    <button type="button"
                      onClick={() => setLangs(p => [...p, {
                        language_code: '', speaking: 'beginner', writing: 'beginner',
                        listening: 'beginner', comprehension: 'beginner',
                      }])}
                      className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-100">
                      <Plus className="h-4 w-4" />Add another language
                    </button>
                  )}
                </>
              )}

              {current === 'documents' && (
                <>
                  <h3 className={sectionTitle}><Upload className="h-4 w-4 text-teal-600" />Documents</h3>
                  <FileField k="cv"              text="CV / Resume"        required={req.require_cv} />
                  <FileField k="portfolio"       text="Portfolio"          required={req.require_portfolio} />
                  {req.require_cover_letter &&
                    <FileField k="cover_letter"  text="Cover letter"        required />}
                  {req.require_id_document &&
                    <FileField k="id_document"   text={idType ? (ID_DOC_LABEL[idType] ?? 'Legal document') : 'Legal document'} required />}
                  {req.require_driving_licence_doc &&
                    <FileField k="driving_licence" text="Driving licence" required />}
                  {req.other_documents.map(d => (
                    <FileField key={d.key} k={`other:${d.key}`} text={d.label} required={!!d.required} />
                  ))}
                </>
              )}

              {current === 'availability' && (
                <>
                  <h3 className={sectionTitle}><CalendarCheck className="h-4 w-4 text-teal-600" />Availability</h3>
                  {req.require_interview_availability && (
                    <>
                      <div>
                        <span className={label}>Available to attend an interview? <span className="text-red-500">*</span></span>
                        <YesNo value={forInterview} onChange={setForInterview} />
                      </div>
                      {forInterview && (
                        <label className="block">
                          <span className={label}>Available from</span>
                          <input type="date" value={interviewFrom}
                            onChange={e => setInterviewFrom(e.target.value)} className={input} />
                        </label>
                      )}
                    </>
                  )}
                  {req.require_language_test_availability && (
                    <div>
                      <span className={label}>Willing to sit a language test? <span className="text-red-500">*</span></span>
                      <YesNo value={forLangTest} onChange={setForLangTest} />
                    </div>
                  )}
                  <label className="block">
                    <span className={label}>Notes <span className="text-gray-400">(optional)</span></span>
                    <textarea value={availNotes} onChange={e => setAvailNotes(e.target.value)} rows={3}
                      placeholder="Anything the employer should know about your availability"
                      className={`${input} min-h-20`} />
                  </label>
                </>
              )}

              {current === 'special' && (
                <>
                  <h3 className={sectionTitle}><FileText className="h-4 w-4 text-teal-600" />From the employer</h3>
                  <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{req.special_request}</p>
                  <label className="block">
                    <span className={label}>Your response</span>
                    <textarea value={specialAnswer} onChange={e => setSpecialAnswer(e.target.value)} rows={5}
                      className={`${input} min-h-28`} />
                  </label>
                </>
              )}

              {current === 'review' && (
                <>
                  <h3 className={sectionTitle}><CheckCircle2 className="h-4 w-4 text-teal-600" />Review & submit</h3>
                  <dl className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white text-sm">
                    {[
                      ['Name', fullName], ['Email', email], ['Phone', phone],
                      ...(nationality ? [['Nationality', nationality]] : []),
                      ...(workAuth ? [['Right to work', WORK_AUTH.find(w => w.v === workAuth)?.l ?? workAuth]] : []),
                      ...(idType ? [['Legal document', idType === 'other' ? idOtherLabel : (ID_DOC_LABEL[idType] ?? idType)]] : []),
                      ...(canDrive !== null ? [['Can drive', canDrive ? 'Yes' : 'No']] : []),
                      ['Languages', langs.map(l =>
                        languageList.find(x => x.code === l.language_code)?.name_en ?? l.language_code).join(', ')],
                      ['Files', Object.entries(files).filter(([, f]) => f).length
                        ? Object.entries(files).filter(([, f]) => f).map(([, f]) => f!.name).join(', ')
                        : 'None'],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="flex gap-4 px-4 py-2.5">
                        <dt className="w-36 shrink-0 text-gray-500">{k}</dt>
                        <dd className="min-w-0 flex-1 break-words font-medium text-gray-900">{v || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}

              {(stepError || error) && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error || stepError}</p>
              )}
            </div>
          )}
        </div>

        {!checking && userId && !alreadyApplied && !done && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4">
            <button type="button" onClick={() => (step === 0 ? onClose() : setStep(s => s - 1))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4" />{step === 0 ? 'Cancel' : 'Back'}
            </button>
            {current === 'review' ? (
              <button type="button" disabled={loading || !!stepError} onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Sending…' : 'Submit application'}
              </button>
            ) : (
              <button type="button" disabled={!!stepError}
                onClick={() => { setError(''); setStep(s => s + 1); }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                Continue<ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__JOBAPPLYMODAL_FIX219__COMPLETE
