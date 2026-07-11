// BAMBEH_DEPLOY_TOKEN__JOBAPPLYMODAL_FIX84_CLEAN
// FILE LOCATION: src/components/jobs/JobApplyModal.tsx
//
// Self-contained "Apply for this job" modal. Writes a real row into the
// job_applications table fix81 created (columns: job_id, employer_id,
// applicant_id, full_name, email, phone, cover_letter, method, status),
// blocks double-applying, and notifies the employer. No stubs.
//
// Wire-in (JobDetails):
//   import JobApplyModal from '@/components/jobs/JobApplyModal';
//   const [showApply, setShowApply] = useState(false);
//   <button onClick={() => setShowApply(true)}>Apply</button>
//   <JobApplyModal isOpen={showApply} onClose={() => setShowApply(false)}
//     jobId={job.id} employerId={job.employer_id /* or job.user_id */}
//     jobTitle={job.title} />

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, User, Mail, Phone, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  employerId: string;
  jobTitle?: string;
  onSuccess?: () => void | Promise<void>;
};

const input =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';

export default function JobApplyModal({ isOpen, onClose, jobId, employerId, jobTitle, onSuccess }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cover, setCover] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const firstRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    setTimeout(() => firstRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // On open: resolve the signed-in user and check for an existing application.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setChecking(true);
    setError('');
    setDone(false);
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id ?? null;
      if (cancelled) return;
      setUserId(uid);
      if (uid && jobId) {
        const { data: existing } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('applicant_id', uid)
          .limit(1);
        if (!cancelled) setAlreadyApplied(!!(existing && existing.length));
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [isOpen, jobId]);

  const canSubmit = useMemo(
    () => !!fullName.trim() && !!email.trim() && !!phone.trim() && !!userId && !loading,
    [fullName, email, phone, userId, loading]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!userId) { setError('Please sign in to apply.'); return; }
    if (userId === employerId) { setError('You cannot apply to your own job.'); return; }
    setLoading(true);
    setError('');
    try {
      const { error: insErr } = await supabase.from('job_applications').insert({
        job_id: jobId,
        employer_id: employerId,
        applicant_id: userId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cover_letter: cover.trim() || null,
        method: 'in_app',
        status: 'pending',
      });
      if (insErr) {
        // Unique-violation etc. → treat as already applied rather than a hard error.
        if (String(insErr.code) === '23505') { setAlreadyApplied(true); return; }
        throw new Error(insErr.message);
      }

      // Notify the employer (best-effort).
      try {
        await supabase.from('notifications').insert({
          user_id: employerId,
          title: 'New job application',
          body: `${fullName.trim()} applied${jobTitle ? ` for ${jobTitle}` : ''}`,
          type: 'job_application',
          data: { job_id: jobId, applicant_id: userId },
          action_url: '/jobs',
          is_read: false,
        });
      } catch { /* notification is best-effort */ }

      setDone(true);
      await onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your application.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <div className="relative w-full overflow-hidden rounded-t-3xl bg-gray-50 shadow-2xl ring-1 ring-black/5 sm:max-w-lg sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-4 text-white">
          <div className="pr-4">
            <h2 className="text-xl font-bold leading-tight">Apply for this job</h2>
            {jobTitle && <p className="mt-1 text-sm text-teal-50">{jobTitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition hover:bg-white/15" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {checking ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          </div>
        ) : !userId ? (
          <div className="px-6 py-10 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <p className="text-sm text-gray-700">Please sign in to apply for this job.</p>
            <button onClick={onClose} className="mt-5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Close</button>
          </div>
        ) : alreadyApplied ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
            <h3 className="text-lg font-bold text-gray-900">You've already applied</h3>
            <p className="mt-1 text-sm text-gray-600">The employer has your application for this job.</p>
            <button onClick={onClose} className="mt-5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Done</button>
          </div>
        ) : done ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
            <h3 className="text-lg font-bold text-gray-900">Application sent!</h3>
            <p className="mt-1 text-sm text-gray-600">The employer has been notified. Good luck!</p>
            <button onClick={onClose} className="mt-5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Full name</span>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input ref={firstRef} type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className={`${input} pl-11`} />
              </div>
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className={`${input} pl-11`} />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">Phone</span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237 6XX XXX XXX" className={`${input} pl-11`} />
                </div>
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Cover message <span className="text-gray-400">(optional)</span></span>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                <textarea value={cover} onChange={e => setCover(e.target.value)} rows={4} placeholder="Why you're a good fit…" className={`${input} min-h-28 pl-11 pt-3`} />
              </div>
            </label>

            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">Cancel</button>
              <button type="submit" disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : 'hidden'}`} />
                {loading ? 'Sending…' : 'Submit application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__JOBAPPLYMODAL_FIX84__COMPLETE
