/**
 * src/pages/PostMarketplaceItemPage.tsx — Bambeh Marketplace
 * FIXED:
 * 1. Saves ONLY to Supabase — no localStorage fallback for listings
 * 2. Adds type: 'marketplace' field to listings insert
 * 3. Requires login before showing form
 * 4. Image previews still use local base64 for instant feedback on slow 3G
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Camera, X, Check,
  Loader2, AlertCircle, CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['Electronics','Fashion','Furniture','Appliances','Books','Sports','Home & Garden','Food','Beauty','Vehicles','Other'];
const CONDITIONS  = ['New','Like New','Good','Fair','Poor'];
const STEPS       = ['Details','Pricing','Photos','Review'];

interface FormData {
  title:       string;
  category:    string;
  condition:   string;
  price:       string;
  negotiable:  boolean;
  location:    string;
  description: string;
  phone:       string;
}

export default function PostMarketplaceItemPage() {
  const navigate  = useNavigate();
  const fileRef   = useRef<HTMLInputElement>(null);

  const [userId,     setUserId]     = useState<string | null>(null);
  const [step,       setStep]       = useState(0);
  const [images,     setImages]     = useState<string[]>([]); // base64 previews only
  const [done,       setDone]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    title:       '',
    category:    'Electronics',
    condition:   'Good',
    price:       '',
    negotiable:  false,
    location:    'Yaoundé',
    description: '',
    phone:       '',
  });

  // Get current user on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/login');
      } else {
        setUserId(session.user.id);
      }
    });
  }, []);

  // ── Image handling — local preview only, no upload needed for basic post ─────
  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 6 - images.length).filter(
      f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024
    );
    if (!newFiles.length) return;

    // Convert to base64 for instant local preview
    const previews = await Promise.all(newFiles.map(f => new Promise<string>(res => {
      const reader = new FileReader();
      reader.onload = e => res(e.target?.result as string);
      reader.readAsDataURL(f);
    })));
    setImages(prev => [...prev, ...previews].slice(0, 6));
  }

  const canNextStep: Record<number, boolean> = {
    0: !!form.title.trim() && !!form.category && !!form.condition,
    1: !!form.price,
    2: true,
  };

  // ── Submit → Supabase ONLY (no localStorage) ─────────────────────────────────
  async function handleSubmit() {
    if (!userId) { navigate('/login'); return; }
    if (!form.title.trim() || !form.price) {
      setError('Title and price are required.'); return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const { error: insertErr } = await supabase.from('listings').insert({
        seller_id:   userId,         // UUID — matches auth.users.id type
        type:        'marketplace',  // required field for feed filtering
        title:       form.title.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        category:    form.category,
        condition:   form.condition,
        location:    form.location.trim(),
        phone:       form.phone.trim(),
        negotiable:  form.negotiable,
        images:      images.length > 0 ? images : null,
        status:      'active',
      });

      if (insertErr) throw insertErr;

      setDone(true);
      setTimeout(() => navigate('/marketplace'), 2000);
    } catch (e: any) {
      setError(e.message || 'Failed to post listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center bg-white rounded-2xl p-8 shadow max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Item Listed! 🎉</h2>
          <p className="text-gray-500 text-sm">Your item is now visible to buyers across  on all devices.</p>
        </div>
      </div>
    );
  }

  // ── Step indicator ────────────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center gap-1 mb-6">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            i < step  ? 'bg-green-600 text-white' :
            i === step ? 'bg-teal-600 text-white' :
                        'bg-gray-200 text-gray-500'
          }`}>
            {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 ${i < step ? 'bg-green-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // ── Main form ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-teal-600" /> Sell an Item
        </h1>
        <div className="ml-auto flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 w-7 rounded-full ${i <= step ? 'bg-teal-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <StepBar />

        {/* Step 0 — Item details */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Item Details</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. iPhone 13 Pro Max 256GB"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Condition *</label>
                <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                rows={4} placeholder="Describe your item — condition, age, what's included..."
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
          </div>
        )}

        {/* Step 1 — Pricing */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Pricing & Location</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (XAF) *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                placeholder="e.g. 150000"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.negotiable}
                onChange={e => setForm({...form, negotiable: e.target.checked})}
                className="w-4 h-4 accent-teal-600" />
              <span className="text-sm font-medium text-gray-700">Price is negotiable</span>
            </label>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                placeholder="e.g. Bastos, Yaoundé"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="237 6XX XXX XXX"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        )}

        {/* Step 2 — Photos */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Photos <span className="text-gray-400 font-normal text-sm">(optional, up to 6)</span></h2>

            {images.length < 6 && (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-teal-300 rounded-xl p-8 text-center cursor-pointer hover:bg-teal-50 transition-colors">
                <Camera className="w-10 h-10 text-teal-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Tap to add photos</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG · Max 10MB each</p>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => handleFiles(e.target.files)} />
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" alt={`Preview ${i + 1}`} />
                    <button
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-teal-600 text-white px-1.5 py-0.5 rounded font-medium">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
            <h2 className="font-bold text-gray-900 mb-3">Review Before Posting</h2>
            {[
              ['Title',       form.title],
              ['Category',    form.category],
              ['Condition',   form.condition],
              ['Price',       `${Number(form.price).toLocaleString()} XAF${form.negotiable ? ' (Negotiable)' : ''}`],
              ['Location',    form.location],
              ['Phone',       form.phone || 'Not provided'],
              ['Photos',      `${images.length} photo${images.length !== 1 ? 's' : ''}`],
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
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
              <p className="text-xs text-amber-700">
                By posting, you confirm this item is legitimate and you own it. False listings result in account suspension.
              </p>
            </div>
          </div>
        )}
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
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNextStep[step]}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Posting...</>
                : '🚀 Post Listing'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

