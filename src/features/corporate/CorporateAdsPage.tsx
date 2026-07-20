// BAMBEH_DEPLOY_TOKEN__CORPORATEADSPAGE_FIX144_LOGO_CLEAN
/**
 * CorporateAdsPage.tsx — Bambeh (FIX123)
 * FILE LOCATION: src/features/corporate/CorporateAdsPage.tsx
 * ROUTE: /corporate/ads  (public)
 *
 * The complete directory of corporate adverts — every product from verified,
 * active corporate stores. Real data (corporate_products + corporate_stores),
 * search, and a "browse the businesses" link. Cards navigate to the store's
 * public storefront. No stubs.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Search, Loader2, Store } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import CorporateAdsStrip, { fetchCorporateAds, type CorporateAd } from './CorporateAdsStrip';
import CorporateLogo from './CorporateLogo'; // FIX144

const STR: Record<string, { title: string; subtitle: string; search: string; back: string; browse: string; empty: string; count: (n: number) => string }> = {
  en: {
    title: 'Corporate Adverts', subtitle: 'Products and offers from verified businesses on Bambeh',
    search: 'Search corporate products…', back: 'Back', browse: 'Browse businesses',
    empty: 'No corporate adverts match your search.', count: (n) => `${n} advert${n === 1 ? '' : 's'}`,
  },
  fr: {
    title: 'Annonces Entreprises', subtitle: 'Produits et offres des entreprises vérifiées sur Bambeh',
    search: 'Rechercher des produits…', back: 'Retour', browse: 'Voir les entreprises',
    empty: 'Aucune annonce ne correspond.', count: (n) => `${n} annonce${n === 1 ? '' : 's'}`,
  },
  pidgin: {
    title: 'Corporate Adverts', subtitle: 'Products and offers from verified businesses for Bambeh',
    search: 'Find corporate products…', back: 'Go back', browse: 'See businesses',
    empty: 'No corporate advert match wetin you find.', count: (n) => `${n} advert${n === 1 ? '' : 's'}`,
  },
  ar: {
    title: 'إعلانات الشركات', subtitle: 'منتجات وعروض من شركات موثّقة على Bambeh',
    search: 'ابحث عن منتجات الشركات…', back: 'رجوع', browse: 'تصفّح الشركات',
    empty: 'لا توجد إعلانات تطابق بحثك.', count: (n) => `${n} إعلان`,
  },
  ff: {
    title: 'Jeeyanɗe Corporate', subtitle: 'Kaake e jeeyanɗe iwde e biisnes tabitinaaɗe e Bambeh',
    search: 'Yiylo kaake corporate…', back: 'Rutto', browse: 'Ndaaru biisnes',
    empty: 'Alaa jeeyannde fotnde e yiylo maa.', count: (n) => `${n} jeeyannde`,
  },
};

export default function CorporateAdsPage() {
  const navigate = useNavigate();
  const lang = useLang() as string;
  const key = lang === 'fulfulde' ? 'ff' : lang;
  const s = STR[key] ?? STR.en;
  const isRtl = key === 'ar';

  const [ads, setAds] = useState<CorporateAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setAds(await fetchCorporateAds(200)); } catch { setAds([]); } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return ads;
    return ads.filter((a) => a.title.toLowerCase().includes(t) || (a.store_name ?? '').toLowerCase().includes(t));
  }, [ads, q]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 pt-6 pb-8">
        {/* FIX144: clickable logo -> corporate home */}
        <div className="mb-3"><CorporateLogo /></div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-teal-100 text-sm mb-3">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {s.back}
        </button>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Building2 className="w-7 h-7" /> {s.title}</h1>
        <p className="text-teal-100 mt-1">{s.subtitle}</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.search}
              className="flex-1 py-2.5 text-sm text-gray-800 outline-none" />
          </div>
          <button onClick={() => navigate('/corporate')}
            className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Store className="w-4 h-4" /> {s.browse}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-5">
        {loading ? (
          <div className="flex justify-center py-16 text-teal-600"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{s.empty}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">{s.count(filtered.length)}</p>
            {/* reuse the strip's card grid, but show ALL (no rotation) by paging through preloaded */}
            <CorporateAdsStrip preloaded={filtered} maxVisible={filtered.length} showChevrons={false} />
          </>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATEADSPAGE_FIX144__COMPLETE
