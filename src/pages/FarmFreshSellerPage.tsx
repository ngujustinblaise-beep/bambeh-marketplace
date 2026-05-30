/**
 * src/pages/FarmFreshSellerPage.tsx — Bambeh Marketplace
 * FIXED: Saves produce listings to Supabase farm_products table.
 * Was a stub. Now a full form for farmers to list their produce.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  (import.meta as any).env?.VITE_SUPABASE_URL || '',
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
);

const CATEGORIES = ['Vegetables', 'Fruits', 'Tubers', 'Grains', 'Legumes', 'Herbs', 'Dairy', 'Other'];
const UNITS       = ['kg', 'g', 'bunch', 'cob', 'litre', 'bag', 'crate', 'piece'];

export default function FarmFreshSellerPage() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState(1);
  const [submitting,  setSubmitting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const [form, setForm] = useState({
    name:        '',
    description: '',
    price:       '',
    unit:        'kg',
    category:    'Vegetables',
    location:    '',
    quantity:    '',
    is_organic:  false,
  });

  function update(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const canNext1 = form.name.trim() && form.category && form.price && form.unit;
  const canNext2 = form.location.trim();

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { error: err } = await supabase.from('farm_products').insert({
          farmer_id:    session.user.id,
          name:         form.name.trim(),
          description:  form.description.trim(),
          price:        Number(form.price),
          unit:         form.unit,
          category:     form.category,
          location:     form.location.trim(),
          quantity:     form.quantity ? Number(form.quantity) : null,
          is_organic:   form.is_organic,
          is_available: true,
        });
        if (err) throw err;
      } else {
        // Guest fallback to localStorage
        const items = JSON.parse(localStorage.getItem('bambeh_farm_products') || '[]');
        items.unshift({ ...form, id: Date.now().toString(), created_at: new Date().toISOString(), is_available: true });
        localStorage.setItem('bambeh_farm_products', JSON.stringify(items));
      }
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-green-50">
        <div className="text-center bg-white rounded-2xl p-8 shadow max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Produce Listed! 🌿</h2>
          <p className="text-gray-500 text-sm mb-6">Your produce is now visible to buyers across .</p>
          <button onClick={() => navigate('/farm-fresh')}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold">
            View Farm Fresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-4 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" /> List Your Produce
          </h1>
          <p className="text-xs text-gray-400">Step {step} of 3</p>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full ${s <= step ? 'bg-green-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Produce Details</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Produce Name *</label>
              <input value={form.name} onChange={e => update('name', e.target.value)}
                placeholder="e.g. Fresh Tomatoes, Plantains, Cocoyams"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={e => update('category', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Unit *</label>
                <select value={form.unit} onChange={e => update('unit', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price (XAF) *</label>
                <input type="number" value={form.price} onChange={e => update('price', e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Qty</label>
                <input type="number" value={form.quantity} onChange={e => update('quantity', e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_organic} onChange={e => update('is_organic', e.target.checked)}
                className="w-4 h-4 accent-green-600" />
              <span className="text-sm font-medium text-gray-700">🌿 This is organically grown</span>
            </label>
          </div>
        )}

        {/* Step 2 — Location + description */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Location & Description</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Location *</label>
              <input value={form.location} onChange={e => update('location', e.target.value)}
                placeholder="e.g. Bafoussam, Marché A"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                rows={4} placeholder="Describe your produce — freshness, harvest date, how to use it..."
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-900 mb-2">Review Your Listing</h2>
            {[
              ['Produce', form.name],
              ['Category', form.category],
              ['Price', `${Number(form.price).toLocaleString()} XAF / ${form.unit}`],
              ['Stock', form.quantity ? `${form.quantity} ${form.unit}` : 'Not specified'],
              ['Location', form.location],
              ['Organic', form.is_organic ? 'Yes 🌿' : 'No'],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-900">{v}</span>
              </div>
            ))}
            {form.description && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700">{form.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm">
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? !canNext1 : !canNext2}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Posting...</> : 'Post Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

