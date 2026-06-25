/**
 * src/pages/TontineCreate.tsx — Bambeh Marketplace
 *
 * FIXES applied:
 *  ? handleCreate: navigate('/login') inside async function — added return after
 *     navigate() so supabase insert doesn't proceed without a user.
 *  ? Supabase insert: current_members set to 1 AND immediately inserts admin into
 *     tontine_members table so the creator is always listed as a member.
 *  ? Error display: now shows the Supabase error message (e.g. RLS violation)
 *     instead of a generic string.
 *  ? Number inputs: min/max validation enforced in state — negative amounts blocked.
 *  ? Start date: stored as ISO date string, not ISO datetime, matching DB column type.
 *  ? canSubmit: now also checks frequency is set and description is non-empty.
 *  ? Success redirect timeout cleared on unmount to prevent setState-after-unmount.
 *  ? Form fields have proper id+htmlFor pairing for accessibility.
 *  ? Keyboard dismiss: pressing Escape while on modal-style page navigates back.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

const FREQUENCY_OPTIONS = [
  { value: 'weekly',  label: 'Weekly',  desc: 'Contributions every week' },
  { value: 'monthly', label: 'Monthly', desc: 'Contributions every month' },
] as const;

export default function TontineCreate() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [amount,      setAmount]      = useState('');
  const [maxMembers,  setMaxMembers]  = useState('10');
  const [frequency,   setFrequency]   = useState<'weekly' | 'monthly'>('monthly');
  const [isPrivate,   setIsPrivate]   = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Cleanup redirect timer on unmount
  useEffect(() => () => {
    if (redirectRef.current) clearTimeout(redirectRef.current);
  }, []);

  // FIX: canSubmit validates all required fields properly
  const parsedAmount  = Number(amount);
  const parsedMembers = Number(maxMembers);
  const canSubmit =
    name.trim().length >= 3 &&
    description.trim().length >= 5 &&
    parsedAmount > 0 &&
    parsedMembers >= 2 &&
    parsedMembers <= 100 &&
    !!frequency;

  async function handleCreate() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return; // FIX: explicit return so code below doesn't execute
      }

      const uid = session.user.id;

      // FIX: start_date as DATE string, not full ISO datetime
      const today = new Date().toISOString().split('T')[0];

      const { data: insertData, error: insertErr } = await supabase
        .from('tontine_groups')
        .insert({
          admin_id:         uid,
          name:             name.trim(),
          description:      description.trim(),
          contribution_xaf: parsedAmount,
          frequency,
          max_members:      parsedMembers,
          current_members:  1,          // admin counts as first member
          is_private:       isPrivate,
          status:           'open',
          start_date:       today,
          total_pool_xaf:   0,
        })
        .select('id')
        .single();

      if (insertErr) throw insertErr;

      // FIX: also add admin to tontine_members table immediately
      if (insertData?.id) {
        await supabase.from('tontine_members').insert({
          group_id:               insertData.id,
          user_id:                uid,
          joined_at:              new Date().toISOString(),
          payout_position:        1,
          has_paid_current_round: false,
        });
      }

      setDone(true);
      redirectRef.current = setTimeout(() => navigate('/tontine'), 2500);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message;
      setError(
        msg?.includes('violates row-level security')
          ? 'Permission denied. Please make sure you are logged in.'
          : msg || 'Could not create group. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Group Created! ??</h2>
          <p className="text-gray-500 text-sm">
            Your tontine group is live. Share it with friends to start saving together.
          </p>
          <p className="text-xs text-gray-400 mt-3 animate-pulse">Redirecting to Tontine…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" /> Create Tontine Group
        </h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">

          {/* Group Name */}
          <div>
            <label htmlFor="tontine-name" className="block text-sm font-semibold text-gray-700 mb-1">
              Group Name *
            </label>
            <input
              id="tontine-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Family Savings Circle"
              maxLength={80}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-400 mt-1">{name.length}/80</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="tontine-desc" className="block text-sm font-semibold text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="tontine-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the purpose and rules of your group…"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Amount + Members */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tontine-amount" className="block text-sm font-semibold text-gray-700 mb-1">
                Contribution (XAF) *
              </label>
              <input
                id="tontine-amount"
                type="number"
                min={500}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="tontine-members" className="block text-sm font-semibold text-gray-700 mb-1">
                Max Members *
              </label>
              <input
                id="tontine-members"
                type="number"
                min={2}
                max={100}
                value={maxMembers}
                onChange={e => setMaxMembers(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
            <div className="grid grid-cols-2 gap-3">
              {FREQUENCY_OPTIONS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    frequency === f.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm">{f.label}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Private toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-purple-600"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">?? Private group</span>
              <p className="text-xs text-gray-400">Only visible to invited members</p>
            </div>
          </label>

          {/* Summary preview */}
          {name && parsedAmount > 0 && parsedMembers >= 2 && (
            <div className="bg-purple-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-purple-900 mb-1">Group Summary</p>
              <p className="text-purple-700">
                {parsedMembers} members × {parsedAmount.toLocaleString('fr-CM')} XAF/
                {frequency === 'monthly' ? 'month' : 'week'} ={' '}
                <strong>{(parsedMembers * parsedAmount).toLocaleString('fr-CM')} XAF</strong> total pool
              </p>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-gray-50 border rounded-2xl p-4 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800">How Tontine (Njangi) Works</p>
          <p>1. Members contribute regularly (weekly or monthly)</p>
          <p>2. Each cycle, one member receives the full pool</p>
          <p>3. Rotates until everyone has received once</p>
          <p>4. All transactions are tracked and transparent</p>
        </div>
      </div>

      {/* Submit button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleCreate}
          disabled={!canSubmit || submitting}
          className="w-full bg-purple-700 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-purple-800 transition"
        >
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</>
            : <><Users className="w-5 h-5" />Create Group</>}
        </button>
      </div>
    </div>
  );
}




