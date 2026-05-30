/**
 * src/pages/ListProperty.tsx — Bambeh Marketplace
 * FIXED: Saves rental listings to Supabase rentals table.
 * Was saving to localStorage — now visible on all devices.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Office', 'Land'];
const STEPS = ['Details', 'Amenities', 'Review'];

export default function ListProperty() {
  const navigate = useNavigate();
  const [step,       setStep]       = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const [form, setForm] = useState({
    title:       '',
    type:        'Apartment',
    price:       '',
    location:    '',
    bedrooms:    '1',
    bathrooms:   '1',
    description: '',
    phone:       '',
    is_furnished:false,
  });

  const canNext0 = form.title.trim() && form.price && form.location.trim();

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      // Save to Supabase rentals table — visible to all users on all devices
      const { error: err } = await supabase.from('rentals').insert({
        seller_id:    session.user.id,   // UUID — not text
        title:        form.title.trim(),
        type:         form.type,
        price:        Number(form.price),
        location:     form.location.trim(),
        bedrooms:     form.bedrooms,
        bathrooms:    form.bathrooms,
        description:  form.description.trim(),
        phone:        form.phone.trim(),
        is_furnished: form.is_furnished,
        status:       'active',
      });

      if (err) throw err;

      // Also save to listings table for the general listing feed
      await supabase.from('listings').insert({
        seller_id:   session.user.id,
        type:        'rental',
        title:       form.title.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        location:    form.location.trim(),
        phone:       form.phone.trim(),
        status:      'active',
        extra: {
          property_type: form.type,
          bedrooms:      form.bedrooms,
          bathrooms:     form.bathrooms,
          is_furnished:  form.is_furnished,
        },
      });

      setDone(true);
      setTimeout(() => navigate('/rentals'), 2000);
    } catch (e: any) {
      setError(e.message || 'Could not post listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center bg-white rounded-2xl p-8 shadow max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Property Listed! 🏠</h2>
          <p className="text-gray-500 text-sm">Your property is now visible to renters across .</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-teal-600" /> List a Property
        </h1>
        <div className="ml-auto flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-teal-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Step 0 — Property details */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Property Details</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. Modern 2-bedroom apartment in Bastos"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Rent (XAF) *</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  placeholder="150000"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                placeholder="e.g. Bastos, Yaoundé"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bedrooms</label>
                <select value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  {['Studio','1','2','3','4','5+'].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bathrooms</label>
                <select value={form.bathrooms} onChange={e => setForm({...form, bathrooms: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  {['1','2','3','4+'].map(n => <option key={n}>{n}</option>)}
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
        )}

        {/* Step 1 — Extra details */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Additional Details</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_furnished}
                onChange={e => setForm({...form, is_furnished: e.target.checked})}
                className="w-4 h-4 accent-teal-600" />
              <span className="text-sm font-medium text-gray-700">🛋️ Property is furnished</span>
            </label>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                rows={5} placeholder="Describe your property — amenities, location advantages, security, parking..."
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
            <h2 className="font-bold text-gray-900 mb-3">Review Your Listing</h2>
            {[
              ['Title',     form.title],
              ['Type',      form.type],
              ['Rent',      `${Number(form.price).toLocaleString()} XAF/month`],
              ['Location',  form.location],
              ['Bedrooms',  form.bedrooms],
              ['Bathrooms', form.bathrooms],
              ['Furnished', form.is_furnished ? 'Yes' : 'No'],
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

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !canNext0}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Posting...</> : 'Post Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

