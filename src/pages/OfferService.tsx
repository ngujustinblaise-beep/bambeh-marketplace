/**
 * src/pages/OfferService.tsx — Bambeh Marketplace
 * FIXED: Saves service listings to Supabase services table.
 * Was saving to localStorage — now visible on all devices.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Check, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CATS = ['Cleaning','Plumbing','Electrical','Carpentry','Painting','Catering','IT Support','Tutoring','Photography','Transport','Security','Gardening','Beauty','Other'];
const STEPS = ['Service Info', 'Pricing', 'Review'];

export default function OfferService() {
  const navigate = useNavigate();
  const [step,       setStep]       = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const [form, setForm] = useState({
    title:      '',
    category:   'Cleaning',
    location:   'Yaoundé',
    price:      '',
    priceType:  'per_hour',
    description:'',
    phone:      '',
    experience: '',
  });

  const canNext0 = form.title.trim() && form.location.trim();
  const canNext1 = form.price && form.description.trim();

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      // Save to Supabase services table — visible to all users on all devices
      const { error: svcErr } = await supabase.from('services').insert({
        seller_id:  session.user.id,   // UUID — not text
        title:      form.title.trim(),
        category:   form.category,
        location:   form.location.trim(),
        price:      Number(form.price),
        price_type: form.priceType,
        description:form.description.trim(),
        phone:      form.phone.trim(),
        status:     'active',
      });

      if (svcErr) throw svcErr;

      // Also add to listings table for the main listing feed
      await supabase.from('listings').insert({
        seller_id:   session.user.id,
        type:        'service',
        title:       form.title.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        category:    form.category,
        location:    form.location.trim(),
        phone:       form.phone.trim(),
        status:      'active',
        extra: {
          price_type: form.priceType,
          experience: form.experience,
        },
      });

      setDone(true);
      setTimeout(() => navigate('/services'), 2000);
    } catch (e: any) {
      setError(e.message || 'Could not post service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center bg-white rounded-2xl p-8 shadow max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Service Listed! 🛠️</h2>
          <p className="text-gray-500 text-sm">Your service is now visible to clients across .</p>
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
          <Briefcase className="w-5 h-5 text-teal-600" /> Offer a Service
        </h1>
        <div className="ml-auto flex gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-teal-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Step 0 — Service info */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Service Information</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Service Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. Professional House Cleaning"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  placeholder="City or Area"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="237 6XX XXX XXX"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Years of Experience</label>
              <input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})}
                placeholder="e.g. 5 years"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        )}

        {/* Step 1 — Pricing */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Pricing & Description</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price (XAF) *</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  placeholder="15000"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price Type</label>
                <select value={form.priceType} onChange={e => setForm({...form, priceType: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option value="per_hour">Per Hour</option>
                  <option value="per_day">Per Day</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                rows={5} placeholder="Describe your service, what's included, your qualifications..."
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
            <h2 className="font-bold text-gray-900 mb-3">Review Your Listing</h2>
            {[
              ['Title',      form.title],
              ['Category',   form.category],
              ['Location',   form.location],
              ['Price',      `${Number(form.price).toLocaleString()} XAF / ${form.priceType.replace('_',' ')}`],
              ['Experience', form.experience || 'Not specified'],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-900">{v}</span>
              </div>
            ))}
            {form.description && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 line-clamp-3">{form.description}</p>
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
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 ? !canNext0 : !canNext1}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Posting...</> : 'Post Service'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

