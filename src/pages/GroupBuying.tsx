// BAMBEH_DEPLOY_TOKEN__GROUPBUYING_FIX403_CLEAN
/**
 * src/pages/GroupBuying.tsx - Bambeh Marketplace
 *
 * FIX403: same bug as FlashDeals. The table held English and French only and
 * the resolver was `language === 'fr' ? 'fr' : 'en'`, so Pidgin, Arabic and
 * Fulfulde fell back to English without any warning. All five languages are
 * present now and the resolver reads the real code.
 *  - RTL applied for Arabic
 *  - translate="no" guards against Chrome auto-translate crashing React
 *  - every string is a \u escape, so no encoding step can break the accents
 *
 * The data layer is UNCHANGED from FIX102: real rows from `group_deals`,
 * live current_buyers / max_buyers, tap through to /group-buying/:id.
 * (c) 2025-2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Loader2, AlertCircle, ArrowLeft, ShoppingBag, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/App';

interface GroupDeal {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  regular_price: number | null;
  tiers: { price?: number }[] | null;
  max_buyers: number | null;
  current_buyers: number | null;
  ends_at: string | null;
  is_active: boolean | null;
}

const T = {
  en: {
    title: "Group Buying",
    subtitle: "Team up with other buyers to unlock a lower price",
    endsIn: "Ends in",
    ended: "Ended",
    buyers: "buyers",
    groupPrice: "Group price",
    regular: "Normal price",
    view: "View deal",
    empty: "No group deals right now. Check back soon",
    loadError: "Could not load group deals. Check your connection",
    retry: "Try again",
    back: "Back",
  },
  fr: {
    title: "Achat Group\u00e9",
    subtitle: "Achetez ensemble pour d\u00e9bloquer un meilleur prix",
    endsIn: "Se termine dans",
    ended: "Termin\u00e9",
    buyers: "acheteurs",
    groupPrice: "Prix group\u00e9",
    regular: "Prix normal",
    view: "Voir l'offre",
    empty: "Aucun achat group\u00e9 en cours. Revenez bient\u00f4t",
    loadError: "Impossible de charger les offres. V\u00e9rifiez votre connexion",
    retry: "R\u00e9essayer",
    back: "Retour",
  },
  pidgin: {
    title: "Group Buying",
    subtitle: "Join hand with other buyers make price come down",
    endsIn: "E go end for",
    ended: "E don end",
    buyers: "buyers",
    groupPrice: "Group price",
    regular: "Normal price",
    view: "See the deal",
    empty: "No group deal dey now. Come check back soon",
    loadError: "We no fit load the deals. Check your network",
    retry: "Try again",
    back: "Go back",
  },
  ar: {
    title: "\u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u062c\u0645\u0627\u0639\u064a",
    subtitle: "\u0627\u0634\u062a\u0631 \u0645\u0639 \u0645\u0634\u062a\u0631\u064a\u0646 \u0622\u062e\u0631\u064a\u0646 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0633\u0639\u0631 \u0623\u0642\u0644",
    endsIn: "\u064a\u0646\u062a\u0647\u064a \u062e\u0644\u0627\u0644",
    ended: "\u0627\u0646\u062a\u0647\u0649",
    buyers: "\u0645\u0634\u062a\u0631\u064a\u0646",
    groupPrice: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062c\u0645\u0627\u0639\u064a",
    regular: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0639\u0627\u062f\u064a",
    view: "\u0639\u0631\u0636 \u0627\u0644\u0635\u0641\u0642\u0629",
    empty: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0641\u0642\u0627\u062a \u062c\u0645\u0627\u0639\u064a\u0629 \u062d\u0627\u0644\u064a\u0627. \u0639\u062f \u0642\u0631\u064a\u0628\u0627",
    loadError: "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0635\u0641\u0642\u0627\u062a. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643",
    retry: "\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649",
    back: "\u0631\u062c\u0648\u0639",
  },
  ff: {
    title: "Coodgol Dental",
    subtitle: "Soodee e go\u0257\u0253e ngam ustude coggu",
    endsIn: "Ina gasa e",
    ended: "Gasii",
    buyers: "coodoo\u0253e",
    groupPrice: "Coggu dental",
    regular: "Coggu jaajngu",
    view: "Ndaar coggu",
    empty: "Coodgol dental alaa jooni. Rutto law",
    loadError: "Min mbaawaa loowde coggu. \u01b3eewto seede maa",
    retry: "Eto kadi",
    back: "Rutto",
  },
};

type TL = typeof T.en;

const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? '-' : new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

function Countdown({ endsAt, endedLabel, prefix }: { endsAt: string | null; endedLabel: string; prefix: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return <span className="text-xs font-semibold text-gray-400">{endedLabel}</span>;
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return (
    <span className="text-xs font-semibold text-purple-600 flex items-center gap-1">
      <Clock className="w-3.5 h-3.5" /> {prefix} {d > 0 ? `${d}d ` : ''}{pad(h)}h {pad(m)}m
    </span>
  );
}

export default function GroupBuying() {
  const navigate = useNavigate();
  const { language } = useLanguage() as { language?: string };
  const langKey = language === 'fulfulde' || language === 'ful' ? 'ff'
                : language === 'pcm' ? 'pidgin'
                : (language ?? 'en');
  const t: TL = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl = langKey === 'ar';

  const [deals, setDeals] = useState<GroupDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from('group_deals')
        .select('id, name, description, category, image_url, regular_price, tiers, max_buyers, current_buyers, ends_at, is_active')
        .eq('is_active', true)
        .order('ends_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      setDeals(((data ?? []) as unknown as GroupDeal[]).filter(
        (d) => !d.ends_at || new Date(d.ends_at).getTime() > Date.now(),
      ));
    } catch (e) {
      console.error('[GroupBuying] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const groupPrice = (d: GroupDeal) =>
    (Array.isArray(d.tiers) && d.tiers[0]?.price != null ? d.tiers[0].price : d.regular_price) ?? null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 notranslate" translate="no" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-purple-100 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t.back}
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> {t.title}</h1>
        <p className="text-purple-100 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {loading && <div className="flex justify-center py-16 text-purple-600"><Loader2 className="w-8 h-8 animate-spin" /></div>}

        {!loading && loadError && (
          <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{t.loadError}</p>
            <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold">{t.retry}</button>
          </div>
        )}

        {!loading && !loadError && deals.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t.empty}</p>
          </div>
        )}

        {!loading && !loadError && deals.map((d) => {
          const max = d.max_buyers ?? 0;
          const cur = d.current_buyers ?? 0;
          const pct = max > 0 ? Math.min(Math.round((cur / max) * 100), 100) : 0;
          const gp = groupPrice(d);
          return (
            <button
              key={d.id}
              onClick={() => navigate(`/group-buying/${d.id}`)}
              className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex gap-3 p-3">
                <div className="w-24 h-24 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {d.image_url ? <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" loading="lazy" />
                              : <ShoppingBag className="w-8 h-8 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{d.name}</h3>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                  </div>
                  {d.category ? <p className="text-[11px] text-gray-400 mt-0.5">{d.category}</p> : null}
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-purple-700 font-bold text-sm">{fmtXAF(gp)}</span>
                    {d.regular_price != null && gp != null && gp < d.regular_price ? (
                      <span className="text-[11px] text-gray-400 line-through">{fmtXAF(d.regular_price)}</span>
                    ) : null}
                  </div>
                  <div className="mt-1.5"><Countdown endsAt={d.ends_at} endedLabel={t.ended} prefix={t.endsIn} /></div>
                </div>
              </div>
              <div className="px-3 pb-3">
                {max > 0 ? (
                  <>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{cur}/{max} {t.buyers}</p>
                  </>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__GROUPBUYING_FIX403__COMPLETE
