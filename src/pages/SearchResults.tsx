// BAMBEH_DEPLOY_TOKEN__SEARCHRESULTS_FIX126_CLEAN
/**
 * SearchResults.tsx — Bambeh universal search (FIX126, REAL)
 * FILE LOCATION: run  Select-String C:\Dev\bambe-android\src\App.tsx -Pattern "SearchResults"
 *   and copy this file to the folder that import shows (the routed copy was a
 *   0.49 kB stub — this replaces it wholesale).
 * ROUTE: /search?q=...  — used by BOTH the Header search bar and the Header
 *   voice-control fallback (unrecognized voice commands land here too).
 *
 * WHAT IT DOES (no stubs):
 *  • Reads ?q= and searches REAL data:
 *      - `listings` (all six types: marketplace/rental/service/vehicle/job/farm)
 *        across title + description + location + category (ilike, active only)
 *      - `exchange_items` (title + description + location + category, active)
 *      - `corporate_products` best-effort (verified stores' ads surface too)
 *  • Type filter chips (All / Marketplace / Jobs / Services / Rentals /
 *    Vehicles / Farm / Exchange) — re-filters instantly, no refetch.
 *  • In-page search box (pre-filled from ?q=) to refine and search again.
 *  • Each result card routes to its REAL detail page.
 *  • 5 languages (EN/FR/Pidgin/AR-RTL/FF), loading/empty/error states.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Loader2, AlertCircle, MapPin, Eye, Tag, ArrowLeft,
  ShoppingBag, Briefcase, Wrench, Home as HomeIcon, Car, Leaf,
  ArrowLeftRight, Building2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type ResultKind =
  | 'marketplace' | 'job' | 'service' | 'rental' | 'vehicle' | 'farm'
  | 'exchange' | 'corporate';

interface SearchHit {
  id: string;
  kind: ResultKind;
  title: string;
  description: string | null;
  price: number | null;
  location: string | null;
  image: string | null;
  views: number | null;
  created_at: string;
  href: string;
}

const KIND_META: Record<ResultKind, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  marketplace: { icon: ShoppingBag,    cls: 'bg-teal-100 text-teal-700' },
  job:         { icon: Briefcase,      cls: 'bg-blue-100 text-blue-700' },
  service:     { icon: Wrench,         cls: 'bg-purple-100 text-purple-700' },
  rental:      { icon: HomeIcon,       cls: 'bg-amber-100 text-amber-700' },
  vehicle:     { icon: Car,            cls: 'bg-red-100 text-red-700' },
  farm:        { icon: Leaf,           cls: 'bg-green-100 text-green-700' },
  exchange:    { icon: ArrowLeftRight, cls: 'bg-cyan-100 text-cyan-700' },
  corporate:   { icon: Building2,      cls: 'bg-emerald-100 text-emerald-700' },
};

const detailHref = (kind: ResultKind, id: string, extra?: string | null): string => {
  switch (kind) {
    case 'job':       return `/jobs/${id}`;
    case 'service':   return `/services/${id}`;
    case 'rental':    return `/rentals/${id}`;
    case 'vehicle':   return `/vehicles/${id}`;
    case 'farm':      return `/farm-fresh/${id}`;
    case 'exchange':  return `/exchange/${id}`;
    case 'corporate': return `/corporate/store/${extra ?? id}`;
    default:          return `/marketplace/${id}`;
  }
};

const T = {
  en: {
    title: 'Search Bambeh', ph: 'Search everything on Bambeh…', go: 'Search',
    resultsFor: (q: string, n: number) => `${n} result${n === 1 ? '' : 's'} for “${q}”`,
    empty: 'Nothing found. Try different words or fewer filters.',
    error: 'Search failed. Check your connection.', retry: 'Retry', back: 'Back',
    all: 'All', marketplace: 'Marketplace', job: 'Jobs', service: 'Services',
    rental: 'Rentals', vehicle: 'Vehicles', farm: 'Farm Fresh',
    exchange: 'Exchange', corporate: 'Corporate', views: 'views',
    startTyping: 'Type something to search all of Bambeh — items, jobs, services, rentals, vehicles, farm produce, swaps, and businesses.',
  },
  fr: {
    title: 'Recherche Bambeh', ph: 'Rechercher sur tout Bambeh…', go: 'Rechercher',
    resultsFor: (q: string, n: number) => `${n} résultat${n === 1 ? '' : 's'} pour « ${q} »`,
    empty: 'Aucun résultat. Essayez d’autres mots ou moins de filtres.',
    error: 'La recherche a échoué. Vérifiez votre connexion.', retry: 'Réessayer', back: 'Retour',
    all: 'Tout', marketplace: 'Marché', job: 'Emplois', service: 'Services',
    rental: 'Locations', vehicle: 'Véhicules', farm: 'Produits frais',
    exchange: 'Échange', corporate: 'Entreprises', views: 'vues',
    startTyping: 'Tapez quelque chose pour chercher partout sur Bambeh — articles, emplois, services, locations, véhicules, produits, trocs et entreprises.',
  },
  pidgin: {
    title: 'Search Bambeh', ph: 'Search anything for Bambeh…', go: 'Search',
    resultsFor: (q: string, n: number) => `${n} result${n === 1 ? '' : 's'} for “${q}”`,
    empty: 'We no see anything. Try different words or comot some filter.',
    error: 'Search no work. Check your network.', retry: 'Try again', back: 'Go back',
    all: 'All', marketplace: 'Marketplace', job: 'Jobs', service: 'Services',
    rental: 'Rentals', vehicle: 'Vehicles', farm: 'Farm Fresh',
    exchange: 'Exchange', corporate: 'Corporate', views: 'views',
    startTyping: 'Type something make you search all Bambeh — items, jobs, services, rentals, vehicles, farm produce, swap and business dem.',
  },
  ar: {
    title: 'بحث Bambeh', ph: 'ابحث في كل Bambeh…', go: 'بحث',
    resultsFor: (q: string, n: number) => `${n} نتيجة عن «${q}»`,
    empty: 'لا توجد نتائج. جرّب كلمات مختلفة أو فلاتر أقل.',
    error: 'فشل البحث. تحقق من اتصالك.', retry: 'إعادة المحاولة', back: 'رجوع',
    all: 'الكل', marketplace: 'السوق', job: 'وظائف', service: 'خدمات',
    rental: 'إيجارات', vehicle: 'مركبات', farm: 'منتجات المزرعة',
    exchange: 'مقايضة', corporate: 'الشركات', views: 'مشاهدة',
    startTyping: 'اكتب شيئًا للبحث في كل Bambeh — سلع، وظائف، خدمات، إيجارات، مركبات، منتجات، مقايضات وشركات.',
  },
  ff: {
    title: 'Yiylo Bambeh', ph: 'Yiylo fof e Bambeh…', go: 'Yiylo',
    resultsFor: (q: string, n: number) => `Njeñtudi ${n} fii “${q}”`,
    empty: 'Alaa ko yiyaa. Taƴ konngi goɗɗi walla ustu filtaruuji.',
    error: 'Yiylo tinaaki. Ƴeew internet maa.', retry: 'Taƴ kadi', back: 'Rutto',
    all: 'Fof', marketplace: 'Luumo', job: 'Golle', service: 'Sarwisaaji',
    rental: 'Luwe', vehicle: 'Otooji', farm: 'Ñamdu Ndema',
    exchange: 'Waylugol', corporate: 'Sosiyeteeji', views: 'ndaarɗe',
    startTyping: 'Winndu huunde ngam yiylaade fof e Bambeh — kaake, golle, sarwisaaji, luwe, otooji, ñamdu, waylugol e sosiyeteeji.',
  },
};

type TL = typeof T.en;

const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? null
    : new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

export default function SearchResults() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const raw = useLang() as string;
  const langKey = raw === 'fulfulde' ? 'ff' : raw;
  const t: TL = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl = langKey === 'ar';

  const urlQ = (params.get('q') ?? '').trim();
  const [input, setInput] = useState(urlQ);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [kind, setKind] = useState<'all' | ResultKind>('all');

  const runSearch = useCallback(async (q: string) => {
    if (!q) { setHits([]); return; }
    setLoading(true);
    setFailed(false);
    try {
      const like = `%${q}%`;
      const collected: SearchHit[] = [];

      // 1) unified listings — all six types
      const { data: listRows, error: le } = await supabase
        .from('listings')
        .select('id, type, title, description, price, location, category, images, status, view_count, created_at')
        .eq('status', 'active')
        .or(`title.ilike.${like},description.ilike.${like},location.ilike.${like},category.ilike.${like}`)
        .order('created_at', { ascending: false })
        .limit(60);
      if (le) throw le;
      for (const r of ((listRows ?? []) as Array<{
        id: string; type: string | null; title: string; description: string | null;
        price: number | null; location: string | null; images: string[] | null;
        view_count: number | null; created_at: string;
      }>)) {
        const k = ((r.type ?? 'marketplace') as ResultKind);
        collected.push({
          id: r.id, kind: KIND_META[k] ? k : 'marketplace',
          title: r.title, description: r.description, price: r.price,
          location: r.location,
          image: Array.isArray(r.images) && r.images[0] ? r.images[0] : null,
          views: r.view_count, created_at: r.created_at,
          href: detailHref(KIND_META[k] ? k : 'marketplace', r.id),
        });
      }

      // 2) exchange_items
      const { data: exRows, error: ee } = await supabase
        .from('exchange_items')
        .select('id, title, description, category, location, estimated_value_xaf, images, status, view_count, created_at')
        .eq('status', 'active')
        .or(`title.ilike.${like},description.ilike.${like},location.ilike.${like},category.ilike.${like}`)
        .order('created_at', { ascending: false })
        .limit(30);
      if (ee) throw ee;
      for (const r of ((exRows ?? []) as Array<{
        id: string; title: string; description: string | null; location: string | null;
        estimated_value_xaf: number | null; images: string[] | null;
        view_count: number | null; created_at: string;
      }>)) {
        collected.push({
          id: r.id, kind: 'exchange', title: r.title, description: r.description,
          price: r.estimated_value_xaf, location: r.location,
          image: Array.isArray(r.images) && r.images[0] ? r.images[0] : null,
          views: r.view_count, created_at: r.created_at,
          href: detailHref('exchange', r.id),
        });
      }

      // 3) corporate products — best-effort (verified+active stores only);
      //    defensive select * so schema drift can never 400 the whole search.
      try {
        const { data: corpRows } = await supabase
          .from('corporate_products')
          .select('*, corporate_stores!inner(id, slug, store_name, verified, status)')
          .eq('corporate_stores.verified', true)
          .eq('corporate_stores.status', 'active')
          .limit(40);
        const ql = q.toLowerCase();
        for (const r of ((corpRows ?? []) as Array<Record<string, unknown>>)) {
          const title = String(r.title ?? r.name ?? '');
          const desc = r.description != null ? String(r.description) : null;
          if (!title) continue;
          if (!title.toLowerCase().includes(ql) && !(desc ?? '').toLowerCase().includes(ql)) continue;
          const store = r.corporate_stores as { id?: string; slug?: string } | null;
          const imgs = r.images as string[] | null;
          collected.push({
            id: String(r.id), kind: 'corporate', title,
            description: desc,
            price: typeof r.retail_price_xaf === 'number' ? (r.retail_price_xaf as number)
              : typeof r.price_xaf === 'number' ? (r.price_xaf as number) : null,
            location: null,
            image: Array.isArray(imgs) && imgs[0] ? imgs[0] : null,
            views: null,
            created_at: String(r.created_at ?? new Date().toISOString()),
            href: detailHref('corporate', String(r.id), (store?.slug || store?.id) ?? null),
          });
        }
      } catch { /* corporate search is additive; never breaks core results */ }

      collected.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setHits(collected);
    } catch (e) {
      console.error('[SearchResults] search failed:', e);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setInput(urlQ); runSearch(urlQ); }, [urlQ, runSearch]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (q) setParams({ q });
  };

  const filtered = useMemo(
    () => (kind === 'all' ? hits : hits.filter((h) => h.kind === kind)),
    [hits, kind],
  );

  const chips: Array<{ key: 'all' | ResultKind; label: string }> = [
    { key: 'all', label: t.all },
    { key: 'marketplace', label: t.marketplace },
    { key: 'job', label: t.job },
    { key: 'service', label: t.service },
    { key: 'rental', label: t.rental },
    { key: 'vehicle', label: t.vehicle },
    { key: 'farm', label: t.farm },
    { key: 'exchange', label: t.exchange },
    { key: 'corporate', label: t.corporate },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 pt-5 pb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-teal-100 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t.back}
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2"><Search className="w-5 h-5" /> {t.title}</h1>
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.ph}
              className={`w-full rounded-xl bg-white text-gray-900 text-sm py-3 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} outline-none`}
            />
          </div>
          <button type="submit" className="px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold">{t.go}</button>
        </form>
      </div>

      {/* type chips */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto pb-1">
        {chips.map((c) => (
          <button key={c.key} onClick={() => setKind(c.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
              kind === c.key ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-3 space-y-3">
        {!urlQ && !loading && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t.startTyping}</p>
          </div>
        )}

        {loading && <div className="flex justify-center py-16 text-teal-600"><Loader2 className="w-8 h-8 animate-spin" /></div>}

        {!loading && failed && (
          <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{t.error}</p>
            <button onClick={() => runSearch(urlQ)} className="mt-3 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold">{t.retry}</button>
          </div>
        )}

        {!loading && !failed && urlQ && (
          <p className="text-xs text-gray-500">{t.resultsFor(urlQ, filtered.length)}</p>
        )}

        {!loading && !failed && urlQ && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t.empty}</p>
          </div>
        )}

        {!loading && !failed && filtered.map((h) => {
          const meta = KIND_META[h.kind];
          const Icon = meta.icon;
          const price = fmtXAF(h.price);
          return (
            <Link key={`${h.kind}-${h.id}`} to={h.href}
              className="flex gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                {h.image
                  ? <img src={h.image} alt={h.title} className="w-full h-full object-cover" loading="lazy" />
                  : <Icon className="w-7 h-7 text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 ${meta.cls}`}>
                  <Icon className="w-3 h-3" /> {(t as Record<string, unknown>)[h.kind] as string}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mt-1">{h.title}</h3>
                {h.description ? <p className="text-xs text-gray-400 line-clamp-1">{h.description}</p> : null}
                <div className="flex items-center justify-between mt-1">
                  {price ? <p className="text-sm font-bold text-teal-700">{price}</p> : <span />}
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    {h.location ? <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{h.location}</span> : null}
                    {h.views != null ? <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{h.views} {t.views}</span> : null}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__SEARCHRESULTS__COMPLETE
