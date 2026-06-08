/**
 * src/pages/ExchangeOfferPage.tsx — Bambeh Marketplace
 * FIXED:
 *  ✅ Prevents item owner from making an offer on their own item
 *  ✅ Detects duplicate offer (UNIQUE constraint gives clear message)
 *  ✅ Loads item title for context
 *  ✅ Auth gate — redirects to /login if not signed in
 *  ✅ Safe area padding
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CONDITIONS: { value: string; label: string }[] = [
  { value: 'new',      label: 'New'       },
  { value: 'like-new', label: 'Like New'  },
  { value: 'used',     label: 'Used'      },
  { value: 'for-parts',label: 'For Parts' },
];

export default function ExchangeOfferPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [itemTitle,    setItemTitle]    = useState<string>('');
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [condition,    setCondition]    = useState('used');
  const [estValue,     setEstValue]     = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [blocked,      setBlocked]      = useState<string | null>(null);

  // Load item title + check ownership
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const { data, error: err } = await supabase
        .from('exchange_items')
        .select('title, user_id')
        .eq('id', id)
        .single();

      if (err || !data) {
        setBlocked('This item no longer exists.');
        return;
      }
      if (data.user_id === session.user.id) {
        setBlocked('You cannot make an offer on your own listing.');
        return;
      }
      setItemTitle(data.title as string);

      // Check for existing offer from this user
      const { data: existing } = await supabase
        .from('exchange_offers')
        .select('id')
        .eq('exchange_item_id', id)
        .eq('offerer_id', session.user.id)
        .maybeSingle();

      if (existing) {
        setBlocked('You already made an offer on this item. Only one offer per item is allowed.');
      }
    })();
  }, [id, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim())               { setError('Please enter what you are offering.');    return; }
    if (!description.trim())         { setError('Please describe your item.');             return; }
    if (description.trim().length < 20) { setError('Description must be at least 20 characters.'); return; }
    if (!id)                         { setError('Invalid exchange item.');                 return; }

    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const { error: err } = await supabase
        .from('exchange_offers')
        .insert({
          exchange_item_id:  id,
          offerer_id:        session.user.id,
          offer_title:       title.trim(),
          offer_description: description.trim(),
          offer_condition:   condition,
          estimated_value:   estValue ? Number(estValue) : null,
          status:            'pending',
        });

      if (err) {
        // Unique constraint violation = duplicate offer
        if (err.code === '23505') {
          setError('You already made an offer on this item.');
        } else {
          throw err;
        }
        return;
      }
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Failed to send offer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Blocked (owner or duplicate) ───────────────────────────
  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <AlertCircle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Can't send offer</h2>
          <p className="text-gray-500 text-sm mb-6">{blocked}</p>
          <button onClick={() => navigate(-1)}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─── Success ────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Offer Sent! 🎉</h2>
          <p className="text-gray-500 text-sm mb-6">
            The item owner will review your offer and get back to you via chat.
          </p>
          <div className="space-y-2">
            <button onClick={() => navigate('/exchange')}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors">
              Browse More Items
            </button>
            <button onClick={() => navigate(-2)}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Back to Item
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-5">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-3 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-bold">Make an Exchange Offer</h1>
        {itemTitle && (
          <p className="text-pink-100 text-sm mt-0.5 truncate">
            For: <span className="font-medium">{itemTitle}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              What are you offering? *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Samsung Galaxy S21"
              maxLength={120}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description *{' '}
              <span className="text-gray-400 font-normal">(min 20 characters)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your item — condition, age, features, any defects..."
              rows={5}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {description.length} chars
              {description.length < 20 && (
                <span className="text-red-400"> — need {20 - description.length} more</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Condition *</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              >
                {CONDITIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Est. Value (FCFA)</label>
              <input
                type="number"
                value={estValue}
                onChange={e => setEstValue(e.target.value)}
                placeholder="e.g. 75000"
                min="0"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 text-sm mb-2">How Exchange Offers Work</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800">
                <li>Submit your offer with item details</li>
                <li>The item owner reviews and accepts or declines</li>
                <li>If accepted, finalise the swap via chat</li>
                <li>Meet in a safe, public place to exchange items</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 border-2 border-gray-300 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || description.length < 20}
            className="flex-1 bg-pink-600 text-white rounded-xl py-3 font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
              hover:bg-pink-700 transition-colors"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
              : <><Send className="w-4 h-4" />Send Offer</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
