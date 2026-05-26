/**
 * src/pages/ExchangeItemPost.tsx — Bambeh Marketplace
 * FIXED: Posts to Supabase so item is visible to ALL users on all devices.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';

const supabase = createClient(
  (import.meta as any).env?.VITE_SUPABASE_URL  || '',
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
);

const CATEGORIES = ['Electronics','Furniture','Fashion','Appliances','Books','Vehicles','Sports','Other'];
const CONDITIONS  = ['Excellent','Good','Fair','Poor'];

export default function ExchangeItemPost() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('');
  const [condition,   setCondition]   = useState('');
  const [location,    setLocation]    = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleSubmit() {
    if (!user) { navigate('/login'); return; }
    if (!title.trim() || !category || !condition || !location.trim()) {
      setError('Please fill in all fields.'); return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const userId = (user as any).uid || (user as any).id;
      const { error: err } = await supabase
        .from('exchange_items')
        .insert({
          user_id:     userId,
          title:       title.trim(),
          description: description.trim(),
          category,
          condition,
          location:    location.trim(),
          status:      'active',
          // Optional: set expiry 30 days from now
          expires_at:  new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        });

      if (err) throw err;

      // Go back to exchange list — the real-time listener will show the new post
      navigate('/exchange');
    } catch (e: any) {
      setError(e.message || 'Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Post for Exchange</h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. iPhone 11 for Samsung Galaxy"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe your item and what you want in return..."
              rows={3}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Condition *</label>
              <select value={condition} onChange={e => setCondition(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select...</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Yaoundé, Bastos"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-teal-600 text-white rounded-xl font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-700 transition"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Posting...
            </span>
          ) : 'Post Exchange Item'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Your listing will be visible to all Bambeh users on all devices.
        </p>
      </div>
    </div>
  );
}
