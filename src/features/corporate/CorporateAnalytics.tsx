// BAMBEH_DEPLOY_TOKEN__CORPORATEANALYTICS_FIX153_CLEAN
/**
 * CorporateAnalytics.tsx — Bambeh Corporate (FIX153)
 * FILE LOCATION: src/features/corporate/CorporateAnalytics.tsx
 * ROUTE: /corporate/analytics
 *
 * REAL analytics for a corporate store OWNER — rebuilt on the confirmed
 * corporate schema (fix142 recon). NO vendor_profiles, NO archived imports,
 * NO stubs. Every number is a real aggregate query.
 *
 * Metrics:
 *   • Products: total, in-stock, wholesale, out-of-stock (corporate_products)
 *   • Quotes: total + by status pending/quoted/accepted/declined (corporate_quotes)
 *   • Quote conversion rate (accepted / total)
 *   • Orders: store.order_count ; store.rating ; verified badge
 *   • Catalogue value: sum of retail_price_xaf across in-stock products
 *   • Recent quotes list (latest 5, real rows)
 *
 * 5 languages + RTL. Back-to-top. Empty-safe (all 0 today, honestly shown).
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Package, FileText, TrendingUp, Star, ShieldCheck,
  Boxes, AlertCircle, Store, Wallet,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { fmtXAF, fetchMyStores, type CorporateStore } from './lib';
import CorporateLogo from './CorporateLogo';
import BackToTop from '@/components/ui/BackToTop';

const L = {
  en: {
    title: 'Analytics', back: 'Back', noStore: 'You have no corporate store yet.',
    register: 'Register a store', loadErr: 'Could not load analytics.', retry: 'Retry',
    products: 'Products', inStock: 'In stock', wholesale: 'Wholesale', outStock: 'Out of stock',
    quotes: 'Quotes', pending: 'Pending', quoted: 'Quoted', accepted: 'Accepted', declined: 'Declined',
    conversion: 'Quote conversion', orders: 'Orders', rating: 'Rating',
    catalogueValue: 'Catalogue value (retail)', verified: 'Verified store', notVerified: 'Not verified',
    recentQuotes: 'Recent quote requests', noQuotes: 'No quote requests yet.',
    qty: 'Qty', secStore: 'Store', secProducts: 'Products', secQuotes: 'Quote requests',
  },
  fr: {
    title: 'Statistiques', back: 'Retour', noStore: 'Vous n’avez pas encore de boutique.',
    register: 'Créer une boutique', loadErr: 'Impossible de charger les statistiques.', retry: 'Réessayer',
    products: 'Produits', inStock: 'En stock', wholesale: 'Gros', outStock: 'Rupture',
    quotes: 'Devis', pending: 'En attente', quoted: 'Chiffré', accepted: 'Accepté', declined: 'Refusé',
    conversion: 'Conversion des devis', orders: 'Commandes', rating: 'Note',
    catalogueValue: 'Valeur du catalogue (détail)', verified: 'Boutique vérifiée', notVerified: 'Non vérifiée',
    recentQuotes: 'Demandes de devis récentes', noQuotes: 'Aucune demande de devis.',
    qty: 'Qté', secStore: 'Boutique', secProducts: 'Produits', secQuotes: 'Demandes de devis',
  },
  pidgin: {
    title: 'Analytics', back: 'Back', noStore: 'You never get corporate store.',
    register: 'Register store', loadErr: 'Analytics no gree load.', retry: 'Try again',
    products: 'Products', inStock: 'Dey stock', wholesale: 'Wholesale', outStock: 'Stock finish',
    quotes: 'Quotes', pending: 'Dey wait', quoted: 'Price don set', accepted: 'Dem gree', declined: 'Dem refuse',
    conversion: 'Quote conversion', orders: 'Orders', rating: 'Rating',
    catalogueValue: 'Catalogue value (retail)', verified: 'Verified store', notVerified: 'Never verify',
    recentQuotes: 'New quote requests', noQuotes: 'No quote request yet.',
    qty: 'Qty', secStore: 'Store', secProducts: 'Products', secQuotes: 'Quote requests',
  },
  ar: {
    title: 'التحليلات', back: 'رجوع', noStore: 'ليس لديك متجر بعد.',
    register: 'إنشاء متجر', loadErr: 'تعذر تحميل التحليلات.', retry: 'إعادة',
    products: 'المنتجات', inStock: 'متوفر', wholesale: 'جملة', outStock: 'نفد',
    quotes: 'عروض الأسعار', pending: 'قيد الانتظار', quoted: 'مُسعّر', accepted: 'مقبول', declined: 'مرفوض',
    conversion: 'تحويل العروض', orders: 'الطلبات', rating: 'التقييم',
    catalogueValue: 'قيمة الكتالوج (تجزئة)', verified: 'متجر موثّق', notVerified: 'غير موثّق',
    recentQuotes: 'أحدث طلبات التسعير', noQuotes: 'لا توجد طلبات تسعير بعد.',
    qty: 'الكمية', secStore: 'المتجر', secProducts: 'المنتجات', secQuotes: 'طلبات التسعير',
  },
  ff: {
    title: 'Njuɓɓudi', back: 'Rutto', noStore: 'A alaa butik tawo.',
    register: 'Winndito butik', loadErr: 'Njuɓɓudi loowaaki.', retry: 'Eto kadi',
    products: 'Kuɗe', inStock: 'Ina stock', wholesale: 'Julle', outStock: 'Stock gasii',
    quotes: 'Coggu-ɗaɓɓe', pending: 'Ina fadaa', quoted: 'Coggu waɗaama', accepted: 'Jaɓaama', declined: 'Salaama',
    conversion: 'Waylitgol coggu', orders: 'Yamirooje', rating: 'Biwto',
    catalogueValue: 'Njeenaari katalog (detay)', verified: 'Butik teeŋtinaaɗo', notVerified: 'Teeŋtinaaka',
    recentQuotes: 'Ɗaɓɓitɗe coggu cakkitiiɗe', noQuotes: 'Alaa ɗaɓɓitɗe coggu tawo.',
    qty: 'Keewal', secStore: 'Butik', secProducts: 'Kuɗe', secQuotes: 'Ɗaɓɓitɗe coggu',
  },
} as const;
type LS = (typeof L)['en'];
function useL(): { l: LS; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw;
  return { l: (L as Record<string, LS>)[key] ?? L.en, isRtl: key === 'ar' };
}

interface Stats {
  total: number; inStock: number; wholesale: number; outStock: number; catalogueValue: number;
  qTotal: number; qPending: number; qQuoted: number; qAccepted: number; qDeclined: number;
}
interface QuoteRow { id: string; quantity: number | null; unit: string | null; status: string | null; created_at: string; }

export default function CorporateAnalytics() {
  const navigate = useNavigate();
  const { l, isRtl } = useL();

  const [store, setStore] = useState<CorporateStore | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { navigate('/login'); return; }
      const mine = await fetchMyStores(uid);
      const st = (mine && mine[0]) || null;
      if (!st) { setStore(null); return; }
      setStore(st);

      const [{ data: prods }, { data: quotes }] = await Promise.all([
        supabase.from('corporate_products')
          .select('retail_price_xaf, in_stock, is_wholesale, status')
          .eq('store_id', st.id),
        supabase.from('corporate_quotes')
          .select('id, quantity, unit, status, created_at')
          .eq('store_id', st.id)
          .order('created_at', { ascending: false }),
      ]);

      const p = (prods ?? []).filter((r) => (r.status ?? 'active') !== 'deleted');
      const inStock = p.filter((r) => r.in_stock).length;
      const wholesale = p.filter((r) => r.is_wholesale).length;
      const catalogueValue = p.filter((r) => r.in_stock)
        .reduce((sum, r) => sum + Number(r.retail_price_xaf || 0), 0);

      const q = quotes ?? [];
      const byStatus = (s: string) => q.filter((r) => (r.status ?? 'pending') === s).length;

      setStats({
        total: p.length, inStock, wholesale, outStock: p.length - inStock, catalogueValue,
        qTotal: q.length, qPending: byStatus('pending'), qQuoted: byStatus('quoted'),
        qAccepted: byStatus('accepted'), qDeclined: byStatus('declined'),
      });
      setRecent(q.slice(0, 5) as QuoteRow[]);
    } catch {
      setError(l.loadErr);
    } finally {
      setLoading(false);
    }
  }, [navigate, l.loadErr]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <Store className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-600 mb-4">{error || l.noStore}</p>
        <button onClick={() => navigate('/corporate/register')} className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold active:scale-95 transition-transform">{l.register}</button>
      </div>
    );
  }

  const conv = stats && stats.qTotal > 0 ? Math.round((stats.qAccepted / stats.qTotal) * 100) : 0;

  const Stat = ({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string | number; tint: string }) => (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${tint}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-5 pb-6">
        <div className="mb-3"><CorporateLogo /></div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-300 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {l.back}
        </button>
        <h1 className="text-xl font-bold truncate">{l.title}</h1>
        <p className="text-slate-300 text-xs mt-1 truncate">{store.trading_name || store.registered_name}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-3 space-y-4">
        {error && (
          <div className="bg-white rounded-2xl p-4 text-center border border-red-100">
            <AlertCircle className="w-7 h-7 text-red-500 mx-auto mb-1" />
            <p className="text-sm text-gray-600">{error}</p>
            <button onClick={() => void load()} className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold">{l.retry}</button>
          </div>
        )}

        {/* Store headline */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4 text-sm">
          <span className={`inline-flex items-center gap-1 font-medium ${store.verified ? 'text-emerald-600' : 'text-gray-400'}`}>
            <ShieldCheck className="w-4 h-4" /> {store.verified ? l.verified : l.notVerified}
          </span>
          <span className="inline-flex items-center gap-1 text-gray-600"><Star className="w-4 h-4 text-amber-400" /> {store.rating ?? 0} · {l.rating}</span>
          <span className="text-gray-600 ml-auto">{l.orders}: <b>{store.order_count ?? 0}</b></span>
        </div>

        {/* Products */}
        <h3 className="text-sm font-bold text-gray-500 px-1">{l.secProducts}</h3>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Package className="w-5 h-5 text-teal-600" />} tint="bg-teal-50" label={l.products} value={stats?.total ?? 0} />
          <Stat icon={<Boxes className="w-5 h-5 text-emerald-600" />} tint="bg-emerald-50" label={l.inStock} value={stats?.inStock ?? 0} />
          <Stat icon={<TrendingUp className="w-5 h-5 text-indigo-600" />} tint="bg-indigo-50" label={l.wholesale} value={stats?.wholesale ?? 0} />
          <Stat icon={<AlertCircle className="w-5 h-5 text-orange-500" />} tint="bg-orange-50" label={l.outStock} value={stats?.outStock ?? 0} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><Wallet className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-lg font-bold text-gray-900 leading-none">{fmtXAF(stats?.catalogueValue ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-1">{l.catalogueValue}</p></div>
        </div>

        {/* Quotes */}
        <h3 className="text-sm font-bold text-gray-500 px-1">{l.secQuotes}</h3>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<FileText className="w-5 h-5 text-slate-600" />} tint="bg-slate-100" label={l.quotes} value={stats?.qTotal ?? 0} />
          <Stat icon={<TrendingUp className="w-5 h-5 text-teal-600" />} tint="bg-teal-50" label={l.conversion} value={`${conv}%`} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-4 grid grid-cols-4 gap-2 text-center">
          {[[l.pending, stats?.qPending], [l.quoted, stats?.qQuoted], [l.accepted, stats?.qAccepted], [l.declined, stats?.qDeclined]].map(([lab, v], i) => (
            <div key={i}><p className="text-lg font-bold text-gray-900">{v ?? 0}</p><p className="text-[11px] text-gray-400">{lab}</p></div>
          ))}
        </div>

        {/* Recent quotes */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">{l.recentQuotes}</h3>
          {recent.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">{l.noQuotes}</p>
          ) : (
            <div className="space-y-2">
              {recent.map((q) => (
                <div key={q.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{l.qty}: {q.quantity ?? '—'} {q.unit ?? ''}</p>
                    <p className="text-xs text-gray-400">{new Date(q.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600 capitalize">{(q.status ?? 'pending')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BackToTop rtl={isRtl} />
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATEANALYTICS_FIX153__COMPLETE
