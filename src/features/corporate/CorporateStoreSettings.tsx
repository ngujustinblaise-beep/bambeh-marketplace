// BAMBEH_DEPLOY_TOKEN__CORPORATESTORESETTINGS_FIX147_CLEAN
/**
 * CorporateStoreSettings.tsx — Bambeh Corporate (FIX147)
 * FILE LOCATION: src/features/corporate/CorporateStoreSettings.tsx
 * ROUTE (add in App.tsx later): /corporate/settings
 *
 * Production store-settings page for a corporate store OWNER.
 * Real reads/writes against the confirmed corporate_stores schema (fix142 recon):
 *   trading_name, registered_name, about, city, address, rep_name, rep_email,
 *   rep_phone, moq_text, min_order_value_xaf, price_mode, logo_url, banner_url.
 *
 *  • Loads the signed-in owner's store (owner_id = auth uid) via fetchMyStores.
 *  • Logo + banner upload to the `shop-assets` bucket (compressed client-side
 *    for slow connections), saved to corporate_stores.logo_url / banner_url.
 *  • Inline validation, save state, unsaved-changes guard, 5 languages + RTL.
 *  • No stubs — every field maps to a real column; verified/rating/order_count
 *    are shown read-only (system-managed).
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Store, Camera, Loader2, Check, ShieldCheck, Star,
  AlertCircle, ImageIcon, Save,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { corpStrings, fmtXAF, fetchMyStores, type CorporateStore } from './lib';
import CorporateLogo from './CorporateLogo';

// ---- local i18n (extends corpStrings with settings-only keys) ----------------
const L = {
  en: {
    title: 'Store Settings', back: 'Back', save: 'Save changes', saving: 'Saving…',
    saved: 'Saved!', noStore: 'You have no corporate store yet.',
    register: 'Register a store', loadErr: 'Could not load your store.',
    logo: 'Store Logo', banner: 'Store Banner', change: 'Change', uploading: 'Uploading…',
    imgType: 'Please choose an image file.', imgSize: 'Image must be under 5MB.',
    uploadErr: 'Upload failed — check your connection and try again.',
    secProfile: 'Store Profile', secContact: 'Contact', secWholesale: 'Wholesale terms',
    tradingName: 'Trading name', registeredName: 'Registered name',
    about: 'About your store', city: 'City', address: 'Address',
    repName: 'Contact person', repEmail: 'Contact email', repPhone: 'Contact phone',
    moqText: 'Minimum order (text)', minOrderValue: 'Minimum order value (XAF)',
    priceMode: 'Price display', priceRetail: 'Retail', priceBulk: 'Bulk', priceBoth: 'Both',
    status: 'Status', verified: 'Verified', notVerified: 'Not verified',
    rating: 'Rating', orders: 'Orders', systemManaged: 'System-managed',
    required: 'This field is required.', unsaved: 'You have unsaved changes.',
  },
  fr: {
    title: 'Paramètres de la boutique', back: 'Retour', save: 'Enregistrer', saving: 'Enregistrement…',
    saved: 'Enregistré !', noStore: 'Vous n’avez pas encore de boutique.',
    register: 'Créer une boutique', loadErr: 'Impossible de charger votre boutique.',
    logo: 'Logo', banner: 'Bannière', change: 'Changer', uploading: 'Téléversement…',
    imgType: 'Veuillez choisir une image.', imgSize: 'L’image doit faire moins de 5 Mo.',
    uploadErr: 'Échec du téléversement — vérifiez votre connexion.',
    secProfile: 'Profil de la boutique', secContact: 'Contact', secWholesale: 'Conditions de gros',
    tradingName: 'Nom commercial', registeredName: 'Raison sociale',
    about: 'À propos', city: 'Ville', address: 'Adresse',
    repName: 'Personne à contacter', repEmail: 'Email de contact', repPhone: 'Téléphone',
    moqText: 'Commande minimum (texte)', minOrderValue: 'Valeur mini de commande (XAF)',
    priceMode: 'Affichage des prix', priceRetail: 'Détail', priceBulk: 'Gros', priceBoth: 'Les deux',
    status: 'Statut', verified: 'Vérifié', notVerified: 'Non vérifié',
    rating: 'Note', orders: 'Commandes', systemManaged: 'Géré par le système',
    required: 'Ce champ est requis.', unsaved: 'Modifications non enregistrées.',
  },
  pidgin: {
    title: 'Store Settings', back: 'Back', save: 'Save am', saving: 'E dey save…',
    saved: 'E don save!', noStore: 'You never get corporate store.',
    register: 'Register store', loadErr: 'Store no gree load.',
    logo: 'Store Logo', banner: 'Store Banner', change: 'Change', uploading: 'E dey upload…',
    imgType: 'Abeg pick image file.', imgSize: 'Image must be under 5MB.',
    uploadErr: 'Upload fail — check your network try again.',
    secProfile: 'Store Profile', secContact: 'Contact', secWholesale: 'Wholesale terms',
    tradingName: 'Trading name', registeredName: 'Registered name',
    about: 'About your store', city: 'Town', address: 'Address',
    repName: 'Person to contact', repEmail: 'Contact email', repPhone: 'Contact phone',
    moqText: 'Minimum order (text)', minOrderValue: 'Minimum order value (XAF)',
    priceMode: 'Price display', priceRetail: 'Retail', priceBulk: 'Bulk', priceBoth: 'Both',
    status: 'Status', verified: 'Verified', notVerified: 'Never verify',
    rating: 'Rating', orders: 'Orders', systemManaged: 'System dey manage am',
    required: 'You must fill this one.', unsaved: 'You get change wey never save.',
  },
  ar: {
    title: 'إعدادات المتجر', back: 'رجوع', save: 'حفظ', saving: 'جارٍ الحفظ…',
    saved: 'تم الحفظ!', noStore: 'ليس لديك متجر بعد.',
    register: 'إنشاء متجر', loadErr: 'تعذر تحميل متجرك.',
    logo: 'شعار المتجر', banner: 'لافتة المتجر', change: 'تغيير', uploading: 'جارٍ الرفع…',
    imgType: 'الرجاء اختيار ملف صورة.', imgSize: 'يجب أن تكون الصورة أقل من 5 ميغابايت.',
    uploadErr: 'فشل الرفع — تحقق من اتصالك.',
    secProfile: 'ملف المتجر', secContact: 'جهة الاتصال', secWholesale: 'شروط الجملة',
    tradingName: 'الاسم التجاري', registeredName: 'الاسم المسجل',
    about: 'حول متجرك', city: 'المدينة', address: 'العنوان',
    repName: 'شخص الاتصال', repEmail: 'بريد الاتصال', repPhone: 'هاتف الاتصال',
    moqText: 'الحد الأدنى للطلب (نص)', minOrderValue: 'قيمة الحد الأدنى للطلب (XAF)',
    priceMode: 'عرض السعر', priceRetail: 'تجزئة', priceBulk: 'جملة', priceBoth: 'كلاهما',
    status: 'الحالة', verified: 'موثّق', notVerified: 'غير موثّق',
    rating: 'التقييم', orders: 'الطلبات', systemManaged: 'يُدار بواسطة النظام',
    required: 'هذا الحقل مطلوب.', unsaved: 'لديك تغييرات غير محفوظة.',
  },
  ff: {
    title: 'Teelte Butik', back: 'Rutto', save: 'Danndu', saving: 'Ina danndoo…',
    saved: 'Danndaama!', noStore: 'A alaa butik korporeel tawo.',
    register: 'Winndito butik', loadErr: 'Butik maa loowaaki.',
    logo: 'Logo Butik', banner: 'Banniyeer Butik', change: 'Waylu', uploading: 'Ina loowa…',
    imgType: 'Subo nate.', imgSize: 'Nate foti wonde les 5MB.',
    uploadErr: 'Loowgol hawrii — ƴeew ceɗeele.',
    secProfile: 'Profil Butik', secContact: 'Jokkondiral', secWholesale: 'Sarɗiiji jullbe',
    tradingName: 'Innde njulaagu', registeredName: 'Innde winndaande',
    about: 'Baɗte butik', city: 'Saare', address: 'Adres',
    repName: 'Neɗɗo jokkondiral', repEmail: 'Email jokkondiral', repPhone: 'Telefol jokkondiral',
    moqText: 'Yamiroore famɗunde (binndi)', minOrderValue: 'Coggu yamiroore famɗunde (XAF)',
    priceMode: 'Hollirde coggu', priceRetail: 'Detay', priceBulk: 'Julle', priceBoth: 'Ɗiɗi fof',
    status: 'Ngonka', verified: 'Teeŋtinaama', notVerified: 'Teeŋtinaaka',
    rating: 'Biwto', orders: 'Yamirooje', systemManaged: 'Sistem ardii ɗum',
    required: 'Ngal fannu ina waɗɗii.', unsaved: 'A jogii bayle ɗe ndanndaaka.',
  },
} as const;
type LS = (typeof L)['en'];
function useL(): { l: LS; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw;
  return { l: (L as Record<string, LS>)[key] ?? L.en, isRtl: key === 'ar' };
}

// ---- client-side image compression (slow-connection safe) --------------------
async function compress(file: File, max = 1024): Promise<Blob> {
  try {
    const dataUrl: string = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = () => rej(new Error('read'));
      r.readAsDataURL(file);
    });
    const img: HTMLImageElement = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('decode'));
      i.src = dataUrl;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.width * scale));
    c.height = Math.max(1, Math.round(img.height * scale));
    const ctx = c.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch { return file; }
}

type FormState = {
  trading_name: string; registered_name: string; about: string;
  city: string; address: string; rep_name: string; rep_email: string; rep_phone: string;
  moq_text: string; min_order_value_xaf: string; price_mode: string;
};

export default function CorporateStoreSettings() {
  const navigate = useNavigate();
  const { l, isRtl } = useL();
  const { s } = corpStrings(useLang() as string);

  const [store, setStore] = useState<CorporateStore | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [imgErr, setImgErr] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id;
      if (!uid) { navigate('/login'); return; }
      const mine = await fetchMyStores(uid);
      const st = (mine && mine[0]) || null;
      if (!st) { setStore(null); return; }
      setStore(st);
      setForm({
        trading_name: st.trading_name ?? '',
        registered_name: st.registered_name ?? '',
        about: st.about ?? '',
        city: st.city ?? '',
        address: st.address ?? '',
        rep_name: st.rep_name ?? '',
        rep_email: st.rep_email ?? '',
        rep_phone: st.rep_phone ?? '',
        moq_text: st.moq_text ?? '',
        min_order_value_xaf: st.min_order_value_xaf != null ? String(st.min_order_value_xaf) : '',
        price_mode: st.price_mode ?? 'both',
      });
    } catch {
      setError(l.loadErr);
    } finally {
      setLoading(false);
    }
  }, [navigate, l.loadErr]);

  useEffect(() => { void load(); }, [load]);

  const set = (k: keyof FormState, v: string) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setDirty(true);
    setSavedTick(false);
  };

  async function uploadImage(kind: 'logo' | 'banner', file: File) {
    if (!store) return;
    if (!file.type.startsWith('image/')) { setImgErr(l.imgType); return; }
    if (file.size > 5 * 1024 * 1024) { setImgErr(l.imgSize); return; }
    setImgErr(null);
    kind === 'logo' ? setLogoUploading(true) : setBannerUploading(true);
    try {
      const blob = await compress(file, kind === 'logo' ? 512 : 1280);
      const path = `${store.id}/${kind}_${Date.now()}.jpg`;
      let upErr: Error | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { error } = await supabase.storage
          .from('shop-assets')
          .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
        if (!error) { upErr = null; break; }
        upErr = new Error(error.message);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1200 * attempt));
      }
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('shop-assets').getPublicUrl(path);
      const col = kind === 'logo' ? 'logo_url' : 'banner_url';
      const { error: dbErr } = await supabase
        .from('corporate_stores')
        .update({ [col]: pub.publicUrl })
        .eq('id', store.id);
      if (dbErr) throw new Error(dbErr.message);
      setStore((st) => (st ? ({ ...st, [col]: pub.publicUrl } as CorporateStore) : st));
    } catch {
      setImgErr(l.uploadErr);
    } finally {
      kind === 'logo' ? setLogoUploading(false) : setBannerUploading(false);
      if (logoRef.current) logoRef.current.value = '';
      if (bannerRef.current) bannerRef.current.value = '';
    }
  }

  async function save() {
    if (!store || !form) return;
    if (!form.trading_name.trim() && !form.registered_name.trim()) {
      setError(l.required); return;
    }
    setSaving(true); setError(null); setSavedTick(false);
    try {
      const minVal = form.min_order_value_xaf.trim() === ''
        ? null : Math.max(0, Number(form.min_order_value_xaf) || 0);
      const { error: dbErr } = await supabase
        .from('corporate_stores')
        .update({
          trading_name: form.trading_name.trim() || null,
          registered_name: form.registered_name.trim() || null,
          about: form.about.trim() || null,
          city: form.city.trim() || null,
          address: form.address.trim() || null,
          rep_name: form.rep_name.trim() || null,
          rep_email: form.rep_email.trim() || null,
          rep_phone: form.rep_phone.trim() || null,
          moq_text: form.moq_text.trim() || null,
          min_order_value_xaf: minVal,
          price_mode: form.price_mode || 'both',
          updated_at: new Date().toISOString(),
        })
        .eq('id', store.id);
      if (dbErr) throw new Error(dbErr.message);
      setDirty(false);
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2500);
    } catch {
      setError(l.uploadErr);
    } finally {
      setSaving(false);
    }
  }

  // ---- render ----------------------------------------------------------------
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!store || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <Store className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-600 mb-4">{error || l.noStore}</p>
        <button onClick={() => navigate('/corporate/register')} className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold active:scale-95 transition-transform">
          {l.register}
        </button>
      </div>
    );
  }

  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-300';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';

  return (
    <div className="min-h-screen bg-gray-50 pb-28" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-5 pb-6">
        <div className="mb-3"><CorporateLogo /></div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-300 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {l.back}
        </button>
        <h1 className="text-xl font-bold truncate">{l.title}</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-3 space-y-4">
        {/* Logo + banner */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border bg-gray-50 overflow-hidden flex items-center justify-center">
                {store.logo_url
                  ? <img src={store.logo_url} alt="logo" className="w-full h-full object-cover" />
                  : <Store className="w-8 h-8 text-gray-300" />}
              </div>
              <button
                onClick={() => logoRef.current?.click()}
                disabled={logoUploading}
                className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1.5 rounded-lg shadow active:scale-95"
                aria-label={l.change}
              >
                {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage('logo', f); }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{l.logo}</p>
              <button onClick={() => bannerRef.current?.click()} disabled={bannerUploading}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-teal-700 font-medium">
                {bannerUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                {l.banner} — {l.change}
              </button>
              <input ref={bannerRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage('banner', f); }} />
            </div>
          </div>
          {store.banner_url && (
            <div className="mt-3 h-20 rounded-xl overflow-hidden border">
              <img src={store.banner_url} alt="banner" className="w-full h-full object-cover" />
            </div>
          )}
          {imgErr && <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {imgErr}</p>}
        </div>

        {/* Read-only system status */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4 text-sm">
          <span className={`inline-flex items-center gap-1 font-medium ${store.verified ? 'text-emerald-600' : 'text-gray-400'}`}>
            <ShieldCheck className="w-4 h-4" /> {store.verified ? l.verified : l.notVerified}
          </span>
          <span className="inline-flex items-center gap-1 text-gray-600"><Star className="w-4 h-4 text-amber-400" /> {store.rating ?? 0}</span>
          <span className="text-gray-600">{l.orders}: {store.order_count ?? 0}</span>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">{l.secProfile}</h3>
          <div><label className={labelCls}>{l.tradingName}</label>
            <input className={inputCls} value={form.trading_name} onChange={(e) => set('trading_name', e.target.value)} /></div>
          <div><label className={labelCls}>{l.registeredName}</label>
            <input className={inputCls} value={form.registered_name} onChange={(e) => set('registered_name', e.target.value)} /></div>
          <div><label className={labelCls}>{l.about}</label>
            <textarea rows={3} className={inputCls} value={form.about} onChange={(e) => set('about', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>{l.city}</label>
              <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
            <div><label className={labelCls}>{l.address}</label>
              <input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">{l.secContact}</h3>
          <div><label className={labelCls}>{l.repName}</label>
            <input className={inputCls} value={form.rep_name} onChange={(e) => set('rep_name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>{l.repEmail}</label>
              <input type="email" className={inputCls} value={form.rep_email} onChange={(e) => set('rep_email', e.target.value)} /></div>
            <div><label className={labelCls}>{l.repPhone}</label>
              <input className={inputCls} value={form.rep_phone} onChange={(e) => set('rep_phone', e.target.value)} /></div>
          </div>
        </div>

        {/* Wholesale terms */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">{l.secWholesale}</h3>
          <div><label className={labelCls}>{l.moqText}</label>
            <input className={inputCls} value={form.moq_text} onChange={(e) => set('moq_text', e.target.value)} placeholder="e.g. 10 cartons min" /></div>
          <div><label className={labelCls}>{l.minOrderValue}</label>
            <input inputMode="numeric" className={inputCls} value={form.min_order_value_xaf}
              onChange={(e) => set('min_order_value_xaf', e.target.value.replace(/[^\d]/g, ''))} />
            {form.min_order_value_xaf && <p className="text-xs text-gray-400 mt-1">{fmtXAF(Number(form.min_order_value_xaf))}</p>}
          </div>
          <div><label className={labelCls}>{l.priceMode}</label>
            <div className="flex gap-2">
              {(['retail', 'bulk', 'both'] as const).map((m) => (
                <button key={m} onClick={() => set('price_mode', m)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border ${form.price_mode === m ? 'bg-teal-600 text-white border-teal-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {m === 'retail' ? l.priceRetail : m === 'bulk' ? l.priceBulk : l.priceBoth}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {error}</p>}
        {dirty && !error && <p className="text-xs text-amber-600 font-medium">{l.unsaved}</p>}
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-3" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-lg mx-auto">
          <button onClick={() => void save()} disabled={saving}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> {l.saving}</>
              : savedTick ? <><Check className="w-4 h-4" /> {l.saved}</>
              : <><Save className="w-4 h-4" /> {l.save}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATESTORESETTINGS_FIX147__COMPLETE
