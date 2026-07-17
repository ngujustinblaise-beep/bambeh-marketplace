// BAMBEH_DEPLOY_TOKEN__GROUPBUYING_FIX102_CLEAN
/**
 * GroupBuying — FIX102 (REAL data)
 * ────────────────────────────────
 * Replaces the mock list (0 Supabase calls + WhatsApp share buttons).
 *  • Deals load from Supabase `group_deals` (same table the working
 *    GroupBuyingDetail page uses): is_active, live current_buyers/max_buyers
 *  • Tap a deal → /group-buying/:id (the real, routed detail page) where
 *    joining happens
 *  • Live countdown, buyer progress, EN/FR, loading/empty/error states
 *  • Chat-only: no external share buttons
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
    title: 'Group Buying', subtitle: 'Team up with other buyers to unlock lower prices',
    endsIn: 'Ends in', ended: 'Ended', buyers: 'buyers', groupPrice: 'Group price',
    regular: 'Regular', view: 'View deal',
    empty: 'No group deals right now. Check back soon!',
    loadError: 'Could not load group deals. Check your connection.', retry: 'Retry', back: 'Back',
  },
  fr: {
    title: 'Achat Groupé', subtitle: "Achetez ensemble pour débloquer de meilleurs prix",
    endsIn: 'Se termine dans', ended: 'Terminé', buyers: 'acheteurs', groupPrice: 'Prix groupé',
    regular: 'Normal', view: "Voir l'offre",
    empty: "Aucun achat groupé en cours. Revenez bientôt !",
    loadError: 'Impossible de charger les offres. Vérifiez votre connexion.', retry: 'Réessayer', back: 'Retour',
  },
};

const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? '—' : new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

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
  const t = T[language === 'fr' ? 'fr' : 'en'];

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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-purple-100 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> {t.back}
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
// BAMBEH_END_TOKEN__GROUPBUYING__COMPLETE
