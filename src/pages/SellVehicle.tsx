/**
 * src/pages/SellVehicle.tsx — Bambeh Marketplace
 * FIXED: Saves vehicle listings to Supabase listings table (type='vehicle').
 * Was saving to localStorage — now visible on all devices.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Check, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const STEPS  = ['Vehicle Info', 'Details', 'Review'];
const MAKES  = ['Toyota','Honda','Mercedes','BMW','Nissan','Hyundai','Ford','Peugeot','Renault','Kia','Other'];
const TYPES  = ['Sedan','SUV','Pickup','Van','Minibus','Motorcycle','Truck','Other'];

export default function SellVehicle() {
  const navigate = useNavigate();
  const [step,       setStep]       = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const [form, setForm] = useState({
    make:         'Toyota',
    model:        '',
    year:         '2020',
    type:         'Sedan',
    price:        '',
    mileage:      '',
    fuel:         'Petrol',
    transmission: 'Manual',
    condition:    'Good',
    location:     'Yaoundé',
    description:  '',
    color:        '',
    phone:        '',
  });

  function next() {
    if (step === 0 && !form.model.trim()) { setError('Please enter the vehicle model.'); return; }
    if (step === 1 && !form.price)        { setError('Please enter the price.'); return; }
    setError(null);
    if (step < STEPS.length - 1) setStep(s => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const { error: err } = await supabase.from('listings').insert({
        seller_id:   session.user.id,    // UUID — not text
        type:        'vehicle',
        title:       `${form.make} ${form.model} ${form.year}`,
        description: form.description || `${form.type}, ${form.fuel}, ${form.transmission}${form.mileage ? ', ' + form.mileage + 'km' : ''}`,
        price:       Number(form.price),
        category:    form.type,
        condition:   form.condition,
        location:    form.location,
        phone:       form.phone,
        status:      'active',
        extra: {
          make:         form.make,
          model:        form.model,
          year:         form.year,
          vehicle_type: form.type,
          fuel:         form.fuel,
          transmission: form.transmission,
          mileage:      form.mileage,
          color:        form.color,
        },
      });

      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate('/vehicles'), 2000);
    } catch (e: any) {
      setError(e.message || 'Could not post listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl p-8 text-center shadow max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vehicle Listed! 🚗</h2>
          <p className="text-gray-500 text-sm">Your vehicle is now visible to buyers across  on all devices.</p>
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
          <Car className="w-5 h-5 text-teal-600" /> Sell Vehicle
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

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">{STEPS[step]}</h2>

          {/* Step 0 — Vehicle Info */}
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Make</label>
                <select value={form.make} onChange={e => setForm({...form, make: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  {MAKES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Model *</label>
                <input value={form.model} onChange={e => setForm({...form, model: e.target.value})}
                  placeholder="e.g. Corolla, Hilux"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                  <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})}
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price (XAF) *</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  placeholder="e.g. 3500000"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mileage (km)</label>
                  <input type="number" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})}
                    placeholder="45000"
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
                  <input value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                    placeholder="White, Black..."
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fuel</label>
                  <select value={form.fuel} onChange={e => setForm({...form, fuel: e.target.value})}
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    {['Petrol','Diesel','Electric','Hybrid'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gearbox</label>
                  <select value={form.transmission} onChange={e => setForm({...form, transmission: e.target.value})}
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    {['Manual','Automatic'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="237 6XX XXX XXX"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={3} placeholder="Condition, history, service records..."
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
            </>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div className="space-y-2">
              {[
                ['Make / Model', `${form.make} ${form.model}`],
                ['Year',         form.year],
                ['Type',         form.type],
                ['Price',        form.price ? `${Number(form.price).toLocaleString()} XAF` : '—'],
                ['Mileage',      form.mileage ? `${form.mileage} km` : 'Not specified'],
                ['Fuel',         form.fuel],
                ['Gearbox',      form.transmission],
                ['Location',     form.location],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between py-2 border-b last:border-0 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={next}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Posting...</> : 'Submit Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

