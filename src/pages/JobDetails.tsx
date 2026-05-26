/**
 * src/pages/JobDetails.tsx — Bambeh Marketplace
 * FIXED: Reads from Supabase 'listings' table (type='job').
 * Falls back to localStorage for offline/old posts.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, Heart, Share2, Send, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements?: string[];
  postedAt: string;
  phone?: string;
  sellerId?: string;
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job,     setJob]     = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [isFav,   setIsFav]   = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadJob(id);
  }, [id]);

  async function loadJob(jobId: string) {
    setLoading(true);
    setError(null);

    // ── Step 1: Try Supabase first ──────────────────────────────────────────
    try {
      const { data, error: err } = await supabase
        .from('listings')
        .select(`
          id, title, description, price, location,
          phone, status, created_at, seller_id,
          extra,
          profiles(full_name)
        `)
        .eq('id', jobId)
        .eq('type', 'job')
        .single();

      if (!err && data) {
        const extra = (data as any).extra || {};
        setJob({
          id:           data.id,
          title:        data.title,
          company:      extra.company || (data as any).profiles?.full_name || 'Company',
          location:     data.location || 'Cameroon',
          type:         extra.job_type || 'Full-time',
          salary:       extra.salary || (data.price ? `${Number(data.price).toLocaleString()} XAF/month` : 'Negotiable'),
          description:  data.description || '',
          requirements: extra.requirements || [],
          postedAt:     data.created_at,
          phone:        data.phone || undefined,
          sellerId:     data.seller_id,
        });
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error('[JobDetails] Supabase error:', e);
    }

    // ── Step 2: Fallback to localStorage ───────────────────────────────────
    try {
      const stored = localStorage.getItem('bambeh_posted_jobs');
      if (stored) {
        const jobs: any[] = JSON.parse(stored);
        const found = jobs.find(j => j.id === jobId);
        if (found) {
          setJob({
            id:           found.id,
            title:        found.title || 'Job Position',
            company:      found.company || 'Company Name',
            location:     found.location || 'Cameroon',
            type:         found.type || 'Full-time',
            salary:       found.salary,
            description:  found.description || '',
            requirements: found.requirements || [],
            postedAt:     found.postedAt || new Date().toISOString(),
            phone:        found.phone,
          });
          setLoading(false);
          return;
        }
      }
    } catch {}

    // ── Step 3: Not found anywhere ─────────────────────────────────────────
    setError('This job listing was not found or may have been removed.');
    setLoading(false);
  }

  // Favorites
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('bambeh_favorites') || '[]');
      setIsFav(favs.some((f: any) => f.id === id));
    } catch {}
  }, [id]);

  function toggleFav() {
    try {
      const favs = JSON.parse(localStorage.getItem('bambeh_favorites') || '[]');
      if (isFav) {
        localStorage.setItem('bambeh_favorites', JSON.stringify(favs.filter((f: any) => f.id !== id)));
      } else {
        favs.push({ id, title: job?.title, category: 'Jobs', savedAt: new Date().toISOString() });
        localStorage.setItem('bambeh_favorites', JSON.stringify(favs));
      }
      setIsFav(prev => !prev);
    } catch {}
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7)  return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500">Loading job details...</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 mb-1">Job not found</p>
          <p className="text-sm text-gray-500 mb-5">{error || 'This listing may have been removed.'}</p>
          <button onClick={() => navigate('/jobs')}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold">
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-900 flex-1 truncate">Job Details</h2>
        <button onClick={toggleFav} className="p-2 hover:bg-gray-100 rounded-xl">
          <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
        <button
          onClick={() => navigator.share?.({ title: job.title, url: window.location.href })}
          className="p-2 hover:bg-gray-100 rounded-xl">
          <Share2 className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Job card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h1>
              <p className="text-teal-600 font-semibold">{job.company}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{job.type}</span>
            </div>
            {job.salary && (
              <div className="col-span-2 text-teal-600 font-semibold text-sm">
                💰 {job.salary}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400 col-span-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Posted {timeAgo(job.postedAt)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-700">
            ⚠️ Never pay to apply for a job. Legitimate employers do not charge application fees.
          </p>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-6">
        {applied ? (
          <div className="text-center py-2 text-teal-600 font-semibold flex items-center justify-center gap-2">
            ✅ Application Sent! The employer will contact you.
          </div>
        ) : (
          <div className="flex gap-3">
            {job.phone && (
              <a href={`tel:${job.phone}`}
                className="flex-1 border-2 border-teal-600 text-teal-600 py-3 rounded-2xl font-semibold text-sm text-center">
                📞 Call
              </a>
            )}
            <button
              onClick={() => setApplied(true)}
              className="flex-1 bg-teal-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2">
              <Send className="w-5 h-5" /> Apply Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
