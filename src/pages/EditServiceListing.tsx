/**
 * src/pages/EditServiceListing.tsx — Bambeh Marketplace
 *
 * BUG FIX v2:
 * ✅ Previous version updated ONLY the services table, then fell back to listings
 *    on error — meaning if services update succeeded, listings table was never updated.
 *    Since OfferService inserts into BOTH tables, an edit must update BOTH tables.
 *    Fixed: now updates services AND listings independently (errors logged, not thrown).
 * ✅ price_type not a column in listings table — stored in extra JSONB. Preserved.
 * ✅ updated_at sent as ISO string — correct for both tables.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CATEGORIES  = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'IT & Tech', 'Tutoring', 'Photography', 'Catering', 'Transport', 'Beauty', 'Other'];
const PRICE_TYPES = ['fixed', 'hourly', 'daily', 'negotiable'];

export default function EditServiceListing() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    price:       '',
    price_type:  'fixed',
    location:    '',
    phone:       '',
  });

  useEffect(() => {
    if (!id) return;
    loadService(id);
  }, [id]);

  async function loadService(serviceId: string) {
    try {
      // Try services table first
      const { data: svc } = await supabase
        .from('services')
        .select('title, description, category, price, price_type, location, phone')
        .eq('id', serviceId)
        .maybeSingle();

      if (svc) {
        setForm({
          title:       svc.title       || '',
          description: svc.description || '',
          category:    svc.category    || '',
          price:       String(svc.price ?? ''),
          price_type:  svc.price_type  || 'fixed',
          location:    svc.location    || '',
          phone:       svc.phone       || '',
        });
        setLoading(false);
        return;
      }

      // Fallback: listings table with type='service'
      const { data: listing } = await supabase
        .from('listings')
        .select('title, description, category, price, location, phone, extra')
        .eq('id', serviceId)
        .maybeSingle();

      if (listing) {
        const extra = listing.extra || {};
        setForm({
          title:       listing.title       || '',
          description: listing.description || '',
          category:    listing.category    || '',
          price:       String(listing.price ?? ''),
          price_type:  extra.price_type    || 'fixed',
          location:    listing.location    || '',
          phone:       listing.phone       || '',
        });
        setLoading(false);
        return;
      }

      setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Service title is required.'); return; }
    setSaving(true);
    setError(null);

    try {
      const now        = new Date().toISOString();
      const priceValue = form.price ? Number(form.price) : null;

      const serviceUpdates = {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        price:       priceValue,
        price_type:  form.price_type,
        location:    form.location.trim(),
        phone:       form.phone.trim(),
        updated_at:  now,
      };

      const listingUpdates = {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        price:       priceValue,
        location:    form.location.trim(),
        phone:       form.phone.trim(),
        // ✅ price_type lives in extra JSONB for listings table
        extra:       { price_type: form.price_type },
        updated_at:  now,
      };

      // ✅ FIX: Update BOTH tables independently — not one OR the other.
      // OfferService inserts to both, so both must stay in sync on edit.
      const [svcResult, lstResult] = await Promise.allSettled([
        supabase.from('services').update(serviceUpdates).eq('id', id),
        supabase.from('listings').update(listingUpdates).eq('id', id),
      ]);

      // Log any errors (non-fatal — at least one table likely succeeded)
      if (svcResult.status === 'rejected') console.warn('services update failed:', svcResult.reason);
      if (lstResult.status === 'rejected') console.warn('listings update failed:', lstResult.reason);

      // If both failed, surface an error to the user
      const svcFailed = svcResult.status === 'rejected' || (svcResult.value as any)?.error;
      const lstFailed = lstResult.status === 'rejected' || (lstResult.value as any)?.error;
      if (svcFailed && lstFailed) {
        throw new Error('Could not save to either services or listings table.');
      }

      setDone(true);
      setTimeout(() => navigate('/services'), 1500);
    } catch (e: any) {
      setError(e.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-bold text-gray-800 mb-1">Service listing not found</p>
        <button onClick={() => navigate('/services')} className="mt-4 text-teal-600 underline text-sm">
          Browse Services
        </button>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-3" />
        <p className="font-bold text-lg text-gray-800">Service Updated!</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-teal-600" /> Edit Service
        </h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Title *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">Select...</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (XAF)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 15000"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price Type</label>
              <select
                value={form.price_type}
                onChange={e => setForm({ ...form, price_type: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {PRICE_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="237 6XX XXX XXX"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
