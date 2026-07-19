// BAMBEH_DEPLOY_TOKEN__CORPORATEADSSTRIP_FIX123_CLEAN
/**
 * CorporateAdsStrip.tsx — Bambeh (FIX123)
 * FILE LOCATION: src/features/corporate/CorporateAdsStrip.tsx
 *
 * A rotating, clickable strip of REAL corporate adverts — products posted by
 * verified, active corporate stores (corporate_products joined to
 * corporate_stores). Mirrors the FeaturedAdsStrip behaviour: batches, auto-
 * rotate every 10s, chevrons + dots, cards navigate to the store's storefront.
 *
 * Used on the Home page (in the slot that was "Recently Posted") and reused by
 * the full CorporateAdsPage.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronLeft, ChevronRight, Loader2, ShieldCheck, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

export interface CorporateAd {
  id: string;
  store_id: string;
  title: string;
  images: string[] | null;
  retail_price_xaf: number | null;
  bulk_price_xaf: number | null;
  bulk_min_qty: number | null;
  created_at: string;
  store_slug: string | null;
  store_name: string | null;
  store_verified: boolean;
}

const STR: Record<string, { verified: string; from: string; bulk: string; empty: string }> = {
  en:     { verified: 'Verified', from: 'from', bulk: 'bulk from', empty: 'No corporate adverts yet.' },
  fr:     { verified: 'Vérifié', from: 'à partir de', bulk: 'gros dès', empty: 'Aucune annonce entreprise.' },
  pidgin: { verified: 'Verified', from: 'from', bulk: 'wholesale from', empty: 'No corporate advert dey yet.' },
  ar:     { verified: 'موثّق', from: 'من', bulk: 'بالجملة من', empty: 'لا توجد إعلانات شركات بعد.' },
  ff:     { verified: 'Tabitina', from: 'ummorde', bulk: 'dental ummorde', empty: 'Alaa jeeyannde corporate tawo.' },
};

const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? null
    : new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

export async function fetchCorporateAds(limit = 60): Promise<CorporateAd[]> {
  // products from verified + active stores only
  const { data, error } = await supabase
    .from('corporate_products')
    .select('id, store_id, title, images, retail_price_xaf, bulk_price_xaf, bulk_min_qty, status, created_at, corporate_stores:store_id(slug, trading_name, registered_name, verified, status)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = (data ?? []) as unknown as Array<{
    id: string; store_id: string; title: string; images: string[] | null;
    retail_price_xaf: number | null; bulk_price_xaf: number | null; bulk_min_qty: number | null;
    created_at: string;
    corporate_stores: { slug: string | null; trading_name: string | null; registered_name: string | null; verified: boolean; status: string } | null;
  }>;
  return rows
    .filter((r) => r.corporate_stores && r.corporate_stores.verified && r.corporate_stores.status === 'active')
    .map((r) => ({
      id: r.id, store_id: r.store_id, title: r.title, images: r.images,
      retail_price_xaf: r.retail_price_xaf, bulk_price_xaf: r.bulk_price_xaf, bulk_min_qty: r.bulk_min_qty,
      created_at: r.created_at,
      store_slug: r.corporate_stores!.slug,
      store_name: r.corporate_stores!.trading_name || r.corporate_stores!.registered_name,
      store_verified: r.corporate_stores!.verified,
    }));
}

interface Props {
  maxVisible?: number;
  showChevrons?: boolean;
  preloaded?: CorporateAd[];   // CorporateAdsPage passes the full list to avoid a 2nd fetch
  className?: string;
}

export const CorporateAdsStrip: React.FC<Props> = ({ maxVisible = 8, showChevrons = true, preloaded, className = '' }) => {
  const navigate = useNavigate();
  const lang = useLang() as string;
  const key = lang === 'fulfulde' ? 'ff' : lang;
  const s = STR[key] ?? STR.en;
  const isRtl = key === 'ar';

  const [ads, setAds] = useState<CorporateAd[]>(preloaded ?? []);
  const [loading, setLoading] = useState(!preloaded);
  const [batch, setBatch] = useState(0);

  const load = useCallback(async () => {
    if (preloaded) return;
    setLoading(true);
    try { setAds(await fetchCorporateAds()); } catch { setAds([]); } finally { setLoading(false); }
  }, [preloaded]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (preloaded) setAds(preloaded); }, [preloaded]);

  const size = Math.max(maxVisible, 1);
  const batches = Math.max(Math.ceil(ads.length / size), 1);
  const safe = Math.min(batch, batches - 1);
  const visible = useMemo(() => ads.slice(safe * size, safe * size + size), [ads, safe, size]);

  useEffect(() => {
    if (batches <= 1) return;
    const t = setInterval(() => setBatch((b) => (b + 1) % batches), 10000);
    return () => clearInterval(t);
  }, [batches]);

  const go = (ad: CorporateAd) => navigate(`/corporate/store/${ad.store_slug || ad.store_id}`);

  if (loading) {
    return <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }
  if (ads.length === 0) {
    return <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center"><p className="text-sm text-gray-400">{s.empty}</p></div>;
  }

  return (
    <div className={className} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visible.map((ad) => {
          const img = Array.isArray(ad.images) && ad.images[0] ? ad.images[0] : null;
          const retail = fmtXAF(ad.retail_price_xaf);
          const bulk = fmtXAF(ad.bulk_price_xaf);
          return (
            <button key={ad.id} onClick={() => go(ad)}
              className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
              <div className="relative h-36 bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center overflow-hidden">
                {img ? <img src={img} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                     : <Package className="w-12 h-12 text-teal-200" />}
                {ad.store_verified ? (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-teal-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                    <ShieldCheck className="w-3 h-3" /> {s.verified}
                  </span>
                ) : null}
              </div>
              <div className="p-3">
                {ad.store_name ? <p className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 truncate"><Building2 className="w-3 h-3" /> {ad.store_name}</p> : null}
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mt-0.5">{ad.title}</h3>
                {retail ? <p className="text-sm font-bold text-teal-600 mt-1">{s.from} {retail}</p> : null}
                {bulk && ad.bulk_min_qty ? <p className="text-[11px] text-emerald-600">{s.bulk} {bulk} ({ad.bulk_min_qty}+)</p> : null}
              </div>
            </button>
          );
        })}
      </div>

      {showChevrons && batches > 1 ? (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => setBatch((b) => (b - 1 + batches) % batches)} className="p-2 rounded-full bg-white border border-gray-200 text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex gap-1">
            {Array.from({ length: batches }).map((_, i) => (
              <button key={i} onClick={() => setBatch(i)} className={`h-1.5 rounded-full transition-all ${i === safe ? 'w-4 bg-teal-600' : 'w-1.5 bg-gray-300'}`} />
            ))}
          </div>
          <button onClick={() => setBatch((b) => (b + 1) % batches)} className="p-2 rounded-full bg-white border border-gray-200 text-gray-500"><ChevronRight className="w-4 h-4" /></button>
        </div>
      ) : null}
    </div>
  );
};

export default CorporateAdsStrip;
// BAMBEH_END_TOKEN__CORPORATEADSSTRIP__COMPLETE
