/**
 * src/pages/EditMarketplaceListing.tsx — Bambeh Marketplace
 * FIXED: Was a stub. Now loads the listing from Supabase and saves edits back.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

const CATEGORIES  = ['Electronics','Fashion','Furniture','Appliances','Books','Sports','Food','Beauty','Vehicles','Other'];
const CONDITIONS  = ['New','Like New','Good','Fair','Poor'];

export default function EditMarketplaceListing() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [notFound,   setNotFound]   = useState(false);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    price:       '',
    category:    '',
    condition:   '',
    location:    '',
    phone:       '',
    negotiable:  false,
  });

  useEffect(() => {
    if (!id) return;
    loadListing(id);
  }, [id]);

  async function loadListing(listingId: string) {
    try {
      const { data, error: err } = await supabase
        .from('farm-images')
        .select('title, description, price, category, condition, location, phone, negotiable')
        .eq('id', listingId)
        .single();

      if (err || !data) { setNotFound(true); setLoading(false); return; }

      setForm({
        title:       data.title       || '',
        description: data.description || '',
        price:       String(data.price || ''),
        category:    data.category    || '',
        condition:   data.condition   || '',
        location:    data.location    || '',
        phone:       data.phone       || '',
        negotiable:  data.negotiable  || false,
      });
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.price) {
      setError('Title and price are required.'); return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('farm-images')
        .update({
          title:       form.title.trim(),
          description: form.description.trim(),
          price:       Number(form.price),
          category:    form.category,
          condition:   form.condition,
          location:    form.location.trim(),
          phone:       form.phone.trim(),
          negotiable:  form.negotiable,
          updated_at:  new Date().toISOString(),
        })
        .eq('id', id);

      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate('/marketplace'), 1500);
    } catch (e: any) {
      setError(e.message || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 mb-1">Listing not found</p>
          <button onClick={() => navigate('/marketplace')} className="mt-4 text-teal-600 underline text-sm">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-3" />
          <p className="font-bold text-gray-800 text-lg">Listing Updated!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900">Edit Listing</h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={3} className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (XAF) *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Condition</label>
              <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select...</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="237 6XX XXX XXX"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.negotiable} onChange={e => setForm({...form, negotiable: e.target.checked})}
              className="w-4 h-4 accent-teal-600" />
            <span className="text-sm font-medium text-gray-700">Price is negotiable</span>
          </label>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}






