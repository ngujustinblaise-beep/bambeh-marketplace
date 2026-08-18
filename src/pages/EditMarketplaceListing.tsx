// BAMBEH_DEPLOY_TOKEN__EDITMARKETPLACELISTING_FIX339_CLEAN
/**
 * src/pages/EditMarketplaceListing.tsx - Bambeh Marketplace
 *
 * FIX339 - this page has never worked, and it failed silently.
 *
 *   1. THE KILLER: both loadListing() and handleSave() queried
 *      supabase.from('farm-images'). "farm-images" is a STORAGE BUCKET name,
 *      not a table. So the page read nothing and wrote nowhere - every seller
 *      who pressed "Save Changes" was told nothing and lost their edit. It now
 *      reads and writes the `listings` table, scoped to type = 'marketplace'.
 *
 *   2. It imported useLang() and computed `lang` and `isRtl`, then never used
 *      either. Every label was hardcoded English. Now all five app languages,
 *      keyed the way useLang() actually emits them (en | fr | pidgin | ar | ff).
 *
 *   3. The category and condition dropdowns showed raw English values. Same
 *      trick as FIX337: the LABEL is translated, the stored VALUE stays the
 *      English string, because listings.category is what every filter matches
 *      on. Translate the value and you break browsing app-wide.
 *
 *   4. The category list here disagreed with the one on the Sell Item page, so
 *      a listing posted under a category this page did not offer would show a
 *      blank dropdown and get its category WIPED on save. The list is now the
 *      same canonical set, and if a listing's existing category or condition is
 *      not in that set it is added to the dropdown so it can never be lost.
 *
 * Ownership is still enforced by RLS on `listings`, not by this file - it does
 * not guess at an owner column, because `listings` carries three of them
 * (user_id, vendor_id, seller_id) and picking the wrong one would break saving.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const CATEGORIES = ['Electronics', 'Fashion', 'Appliances', 'Books', 'Furniture', 'Vehicles', 'Rentals', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const CATEGORY_TR: Record<string, Record<Lang, string>> = {
  'Electronics': { en: 'Electronics', fr: 'Électronique',   pidgin: 'Electronics',   ar: 'إلكترونيات',   ff: 'Elektoroniki' },
  'Fashion':     { en: 'Fashion',     fr: 'Mode',           pidgin: 'Fashion',       ar: 'أزياء',         ff: 'Comci' },
  'Appliances':  { en: 'Appliances',  fr: 'Électroménager', pidgin: 'House Machine', ar: 'أجهزة منزلية', ff: 'Kuutorɗe suudu' },
  'Books':       { en: 'Books',       fr: 'Livres',         pidgin: 'Books',         ar: 'كتب',           ff: 'Deftere' },
  'Furniture':   { en: 'Furniture',   fr: 'Meubles',        pidgin: 'Furniture',     ar: 'أثاث',          ff: 'Meebal' },
  'Vehicles':    { en: 'Vehicles',    fr: 'Véhicules',      pidgin: 'Motor',         ar: 'مركبات',        ff: 'Otooji' },
  'Rentals':     { en: 'Rentals',     fr: 'Locations',      pidgin: 'Rent',          ar: 'إيجارات',       ff: 'Luwaaji' },
  'Other':       { en: 'Other',       fr: 'Autre',          pidgin: 'Other',         ar: 'أخرى',          ff: 'Goɗɗum' },
};

const CONDITION_TR: Record<string, Record<Lang, string>> = {
  'New':      { en: 'New',       fr: 'Neuf',         pidgin: 'Brand New',   ar: 'جديد',     ff: 'Keso' },
  'Like New': { en: 'Like New',  fr: 'Comme neuf',   pidgin: 'Like New',    ar: 'شبه جديد', ff: "Wa'i no keso" },
  'Good':     { en: 'Good',      fr: 'Bon état',     pidgin: 'Good',        ar: 'جيد',      ff: 'Moƴƴi' },
  'Fair':     { en: 'Fair',      fr: 'État moyen',   pidgin: 'Manage',      ar: 'مقبول',    ff: 'Hakkunde' },
  'Poor':     { en: 'Poor',      fr: 'Mauvais état', pidgin: 'No too good', ar: 'سيئ',      ff: 'Bonɗum' },
};

function txOpt(map: Record<string, Record<Lang, string>>, value: string, lang: Lang): string {
  return map[value]?.[lang] ?? map[value]?.['en'] ?? value;
}

const COPY: Record<Lang, Record<string, string>> = {
  en: {
    heading: 'Edit Listing', title: 'Title', description: 'Description', price: 'Price (XAF)',
    location: 'Location', category: 'Category', condition: 'Condition', choose: 'Select...',
    phone: 'Contact Phone', negotiable: 'Price is negotiable', save: 'Save Changes', saving: 'Saving...',
    required: 'Title and price are required.', failed: 'Could not save changes. Please try again.',
    notFound: 'Listing not found', back: 'Back to Marketplace', updated: 'Listing updated!',
  },
  fr: {
    heading: "Modifier l'annonce", title: 'Titre', description: 'Description', price: 'Prix (XAF)',
    location: 'Localisation', category: 'Catégorie', condition: 'État', choose: 'Choisir...',
    phone: 'Téléphone de contact', negotiable: 'Prix négociable', save: 'Enregistrer', saving: 'Enregistrement...',
    required: 'Le titre et le prix sont obligatoires.', failed: "Impossible d'enregistrer. Réessayez.",
    notFound: 'Annonce introuvable', back: 'Retour au marché', updated: 'Annonce mise à jour !',
  },
  pidgin: {
    heading: 'Change Your Advert', title: 'Title', description: 'Wetin e be', price: 'Price (XAF)',
    location: 'Where e dey', category: 'Category', condition: 'How e be', choose: 'Pick one...',
    phone: 'Phone number', negotiable: 'Price fit change', save: 'Save Am', saving: 'Dey save...',
    required: 'Abeg put title and price.', failed: 'E no save. Abeg try again.',
    notFound: 'We no see this advert', back: 'Go back to Market', updated: 'Advert don change!',
  },
  ar: {
    heading: 'تعديل الإعلان', title: 'العنوان', description: 'الوصف', price: 'السعر (فرنك أفريقي)',
    location: 'الموقع', category: 'الفئة', condition: 'الحالة', choose: 'اختر...',
    phone: 'هاتف التواصل', negotiable: 'السعر قابل للتفاوض', save: 'حفظ التغييرات', saving: 'جارٍ الحفظ...',
    required: 'العنوان والسعر مطلوبان.', failed: 'تعذّر حفظ التغييرات. حاول مرة أخرى.',
    notFound: 'الإعلان غير موجود', back: 'العودة إلى السوق', updated: 'تم تحديث الإعلان!',
  },
  ff: {
    heading: 'Waylu jeeyngal', title: 'Tiitoonde', description: 'Sifaa', price: 'Njaru (XAF)',
    location: 'Nokku', category: 'Sifaa mum', condition: 'Ngonka', choose: 'Suɓo...',
    phone: 'Telefol', negotiable: 'Njaru hewtii', save: 'Danndu', saving: 'Ena danndee...',
    required: 'Tiitoonde e njaru ina naamnaa.', failed: 'Danndugol waawaani. Artu jeer.',
    notFound: 'Min tawaani jeeyngal ngal', back: 'Rutto to luumo', updated: 'Jeeyngal waylaama!',
  },
};

export default function EditMarketplaceListing() {
  const raw   = String(useLang() || 'en');
  const lang  = (COPY[raw as Lang] ? raw : 'en') as Lang;
  const c     = COPY[lang];
  const isRtl = lang === 'ar';

  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '',
    condition: '', location: '', phone: '', negotiable: false,
  });

  useEffect(() => {
    if (!id) return;
    loadListing(id);
  }, [id]);

  async function loadListing(listingId: string) {
    try {
      // FIX339 - was .from('farm-images'), a storage bucket. Now the real table.
      const { data, error: err } = await supabase
        .from('listings')
        .select('title, description, price, category, condition, location, phone, negotiable')
        .eq('id', listingId)
        .eq('type', 'marketplace')
        .single();

      if (err || !data) { setNotFound(true); setLoading(false); return; }

      setForm({
        title:       data.title       || '',
        description: data.description || '',
        price:       data.price == null ? '' : String(data.price),
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
    if (!form.title.trim() || !form.price) { setError(c.required); return; }
    setSaving(true);
    setError(null);
    try {
      // FIX339 - was .from('farm-images'). Ownership is enforced by RLS.
      const { error: err } = await supabase
        .from('listings')
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : c.failed);
    } finally {
      setSaving(false);
    }
  }

  // FIX339 - never drop a value the listing already holds, even if this page
  // would not otherwise offer it. Without this, saving wiped the category.
  const categoryOptions = form.category && !CATEGORIES.includes(form.category)
    ? [...CATEGORIES, form.category] : CATEGORIES;
  const conditionOptions = form.condition && !CONDITIONS.includes(form.condition)
    ? [...CONDITIONS, form.condition] : CONDITIONS;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 mb-1">{c.notFound}</p>
          <button onClick={() => navigate('/marketplace')} className="mt-4 text-teal-600 underline text-sm">
            {c.back}
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-3" />
          <p className="font-bold text-gray-800 text-lg">{c.updated}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 pb-28">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="font-bold text-gray-900">{c.heading}</h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{c.title} *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{c.description}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{c.price} *</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{c.location}</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{c.category}</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">{c.choose}</option>
                {categoryOptions.map(x => <option key={x} value={x}>{txOpt(CATEGORY_TR, x, lang)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{c.condition}</label>
              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">{c.choose}</option>
                {conditionOptions.map(x => <option key={x} value={x}>{txOpt(CONDITION_TR, x, lang)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{c.phone}</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="237 6XX XXX XXX" dir="ltr"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.negotiable} onChange={e => setForm({ ...form, negotiable: e.target.checked })}
              className="w-4 h-4 accent-teal-600" />
            <span className="text-sm font-medium text-gray-700">{c.negotiable}</span>
          </label>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{c.saving}</> : c.save}
        </button>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__EDITMARKETPLACELISTING_FIX339__COMPLETE
