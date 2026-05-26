/**
 * src/pages/EditJobListing.tsx — Bambeh Marketplace
 * FIXED: Real job edit form reading from and saving to Supabase.
 * Was a stub (just showed a pencil emoji).
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const JOB_TYPES  = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
const CATEGORIES = ['Technology', 'Sales', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Transport', 'Other'];

export default function EditJobListing() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [notFound,  setNotFound]  = useState(false);

  const [form, setForm] = useState({
    title:       '',
    company:     '',
    description: '',
    location:    '',
    job_type:    'Full-time',
    salary:      '',
    category:    '',
    phone:       '',
  });

  useEffect(() => {
    if (!id) return;
    loadJob(id);
  }, [id]);

  async function loadJob(jobId: string) {
    try {
      // Try jobs table first
      const { data: jobData } = await supabase
        .from('jobs')
        .select('title, company, description, location, job_type, salary, category, phone')
        .eq('id', jobId)
        .single();

      if (jobData) {
        setForm({
          title:       jobData.title       || '',
          company:     jobData.company     || '',
          description: jobData.description || '',
          location:    jobData.location    || '',
          job_type:    jobData.job_type    || 'Full-time',
          salary:      jobData.salary      || '',
          category:    jobData.category    || '',
          phone:       jobData.phone       || '',
        });
        setLoading(false);
        return;
      }

      // Fallback: try listings table with type='job'
      const { data: listing } = await supabase
        .from('listings')
        .select('title, description, location, category, phone, extra')
        .eq('id', jobId)
        .single();

      if (listing) {
        const extra = listing.extra || {};
        setForm({
          title:       listing.title       || '',
          company:     extra.company       || '',
          description: listing.description || '',
          location:    listing.location    || '',
          job_type:    extra.job_type      || 'Full-time',
          salary:      extra.salary        || '',
          category:    listing.category    || '',
          phone:       listing.phone       || '',
        });
        setLoading(false);
        return;
      }

      setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Job title is required.'); return; }
    setSaving(true);
    setError(null);

    try {
      // Try updating jobs table
      const { error: jobErr } = await supabase
        .from('jobs')
        .update({
          title:       form.title.trim(),
          company:     form.company.trim(),
          description: form.description.trim(),
          location:    form.location.trim(),
          job_type:    form.job_type,
          salary:      form.salary.trim(),
          category:    form.category,
          phone:       form.phone.trim(),
          updated_at:  new Date().toISOString(),
        })
        .eq('id', id);

      if (jobErr) {
        // Fallback: update listings table
        await supabase.from('listings').update({
          title:       form.title.trim(),
          description: form.description.trim(),
          location:    form.location.trim(),
          category:    form.category,
          phone:       form.phone.trim(),
          extra: {
            company:  form.company.trim(),
            job_type: form.job_type,
            salary:   form.salary.trim(),
          },
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      }

      setDone(true);
      setTimeout(() => navigate('/jobs'), 1500);
    } catch (e: any) {
      setError(e.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-bold text-gray-800 mb-1">Job listing not found</p>
        <button onClick={() => navigate('/jobs')} className="mt-4 text-teal-600 underline text-sm">Browse Jobs</button>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-3" />
        <p className="font-bold text-lg text-gray-800">Job Updated!</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-teal-600" /> Edit Job Listing
        </h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
            <input value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              placeholder="Company name"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={4} className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Job Type</label>
              <select value={form.job_type} onChange={e => setForm({...form, job_type: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Salary</label>
              <input value={form.salary} onChange={e => setForm({...form, salary: e.target.value})}
                placeholder="e.g. 200,000 XAF/mo"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="237 6XX XXX XXX"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
