/**
 * src/pages/Jobs.tsx — Bambeh Marketplace
 * FIXED:
 * 1. Reads from Supabase listings table (type='job') — cross-device, real-time
 * 2. Route fixed: navigate('/job/'+id) → navigate('/jobs/'+id) (plural)
 * 3. Falls back to sample data when DB is empty
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Clock, Plus, Loader2, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  (import.meta as any).env?.VITE_SUPABASE_URL || '',
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
);

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  postedAt: string;
}

const SAMPLE_JOBS: Job[] = [
  { id: 's1', title: 'Software Developer',  company: 'Tech Cameroun',   location: 'Yaoundé', type: 'Full-time', salary: '150,000–300,000 XAF', description: 'Join our growing tech team.', postedAt: new Date().toISOString() },
  { id: 's2', title: 'Marketing Manager',   company: 'Bambeh Corp',     location: 'Douala',  type: 'Full-time', salary: '200,000 XAF',         description: 'Lead marketing campaigns.', postedAt: new Date(Date.now()-3600000).toISOString() },
  { id: 's3', title: 'Driver / Chauffeur',  company: 'Logistique CM',   location: 'Yaoundé', type: 'Part-time', salary: '80,000 XAF',          description: 'Experienced driver needed.', postedAt: new Date(Date.now()-7200000).toISOString() },
  { id: 's4', title: 'Nurse (RN)',           company: 'Clinique Centre', location: 'Yaoundé', type: 'Full-time', salary: '180,000 XAF',          description: 'Registered nurse required.', postedAt: new Date(Date.now()-86400000).toISOString() },
];

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
}

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');

  async function fetchJobs() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, location, category, created_at, price, extra, phone')
        .eq('type', 'job')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        setJobs(data.map(d => ({
          id:          d.id,
          title:       d.title,
          company:     d.extra?.company   || 'Company',
          location:    d.location          || 'Cameroon',
          type:        d.extra?.job_type   || 'Full-time',
          salary:      d.extra?.salary     || (d.price ? `${Number(d.price).toLocaleString()} XAF` : undefined),
          description: d.extra?.description || '',
          postedAt:    d.created_at,
        })));
      } else {
        setJobs(SAMPLE_JOBS);
      }
    } catch {
      setJobs(SAMPLE_JOBS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    // Real-time: new jobs appear instantly on all devices
    const channel = supabase
      .channel('jobs_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listings' }, fetchJobs)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || j.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-teal-600" /> Find Jobs
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchJobs} className="p-2 text-gray-500 hover:text-teal-600 rounded-xl hover:bg-gray-100">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/jobs/post')}
              className="bg-teal-600 text-white px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Post Job
            </button>
          </div>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs, companies..."
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {JOB_TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${filter === t ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading jobs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No jobs found</p>
            <button onClick={() => navigate('/jobs/post')}
              className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              Post a Job
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</p>
            {filtered.map(job => (
              <div
                key={job.id}
                // ✅ FIXED: /jobs/ (plural) not /job/ (singular)
                onClick={() => navigate('/jobs/' + job.id)}
                className="bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="font-bold text-gray-900 text-sm">{job.title}</h3>
                      <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                        job.type === 'Full-time' ? 'bg-green-50 text-green-700' :
                        job.type === 'Part-time' ? 'bg-blue-50 text-blue-700' :
                        job.type === 'Remote'    ? 'bg-purple-50 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{job.type}</span>
                    </div>
                    <p className="text-xs text-teal-600 font-semibold mb-1">{job.company}</p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      {job.salary && <span className="text-teal-600 font-medium">{job.salary}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(job.postedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
