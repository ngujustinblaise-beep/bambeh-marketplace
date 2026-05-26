/**
 * src/pages/TontineCreate.tsx — Bambeh Marketplace
 * FIXED: Saves tontine groups to Supabase tontine_groups table.
 * Was navigating without saving anything. Now cross-device and real-time.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const FREQUENCY_OPTIONS = [
  { value: 'weekly',  label: 'Weekly',  desc: 'Contributions every week' },
  { value: 'monthly', label: 'Monthly', desc: 'Contributions every month' },
];

export default function TontineCreate() {
  const navigate = useNavigate();

  const [name,       setName]       = useState('');
  const [description,setDescription]= useState('');
  const [amount,     setAmount]     = useState('');
  const [maxMembers, setMaxMembers] = useState('10');
  const [frequency,  setFrequency]  = useState('monthly');
  const [isPrivate,  setIsPrivate]  = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const canSubmit = name.trim() && amount && Number(amount) > 0 && Number(maxMembers) >= 2;

  async function handleCreate() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const { error: insertErr } = await supabase.from('tontine_groups').insert({
        admin_id:         session.user.id,   // UUID — not text
        name:             name.trim(),
        description:      description.trim(),
        contribution_xaf: Number(amount),
        frequency,
        max_members:      Number(maxMembers),
        current_members:  1,               // admin is the first member
        is_private:       isPrivate,
        status:           'open',
        start_date:       new Date().toISOString(),
        total_pool_xaf:   0,
      });

      if (insertErr) throw insertErr;

      setDone(true);
      setTimeout(() => navigate('/tontine'), 2000);
    } catch (e: any) {
      setError(e.message || 'Could not create group. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Group Created! 💰</h2>
          <p className="text-gray-500 text-sm">
            Your tontine group is now live. Share it with friends to start saving together.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" /> Create Tontine Group
        </h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Group Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Family Savings Circle"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} placeholder="Describe the purpose and rules of your group..."
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contribution (XAF) *</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Members *</label>
              <input type="number" value={maxMembers} onChange={e => setMaxMembers(e.target.value)}
                min="2" max="50"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
            <div className="grid grid-cols-2 gap-3">
              {FREQUENCY_OPTIONS.map(f => (
                <button key={f.value} type="button" onClick={() => setFrequency(f.value)}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    frequency === f.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                  <p className="font-semibold text-gray-900 text-sm">{f.label}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-purple-600" />
            <div>
              <span className="text-sm font-medium text-gray-700">🔒 Private group</span>
              <p className="text-xs text-gray-400">Only visible to invited members</p>
            </div>
          </label>

          {/* Summary */}
          {name && amount && (
            <div className="bg-purple-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-purple-900 mb-1">Group Summary</p>
              <p className="text-purple-700">
                {Number(maxMembers)} members × {Number(amount).toLocaleString()} XAF/{frequency === 'monthly' ? 'month' : 'week'} 
                = <strong>{(Number(maxMembers) * Number(amount)).toLocaleString()} XAF</strong> total pool
              </p>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-gray-50 border rounded-2xl p-4 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800">How Tontine Works</p>
          <p>1. Members contribute regularly (weekly or monthly)</p>
          <p>2. Each cycle, one member receives the full pool</p>
          <p>3. Rotates until everyone has received once</p>
          <p>4. All transactions are tracked and transparent</p>
        </div>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button onClick={handleCreate} disabled={!canSubmit || submitting}
          className="w-full bg-purple-700 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
            : <><Users className="w-5 h-5" />Create Group</>
          }
        </button>
      </div>
    </div>
  );
}
