// BAMBEH_DEPLOY_TOKEN__FLASHDEALS_FIX102_CLEAN
/**
 * FlashDeals — FIX102 (REAL data)
 * ───────────────────────────────
 * Replaces the mock list (hardcoded deals + WhatsApp buttons).
 *  • Deals load from Supabase `flash_deals` (vendor name joined from
 *    vendor_profiles) — only live deals: ends_at in the future
 *  • Claim writes `flash_deal_claims` (duplicate claim 23505 = already yours,
 *    same behavior as the working FlashDealDetail page)
 *  • Live countdown, slots progress, EN/FR, loading/empty/error states
 *  • Chat-only: no external share buttons
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, Loader2, AlertCircle, ArrowLeft, CheckCircle2, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/App';

interface Deal {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  discount_percent: number | null;
  original_price_xaf: number | null;
  discounted_price_xaf: number | null;
  total_slots: number | null;
  claimed_slots: number | null;
  ends_at: string | null;
  status: string | null;
  vendor_profiles: { store_name: string | null } | null;
}

const T = {
  en: {
    title: 'Flash Deals', subtitle: 'Limited-time offers — claim before they run out',
    endsIn: 'Ends in', slots: 'slots left', claim: 'Claim deal', claimed: 'Claimed ✓',
    soldOut: 'Sold out', ended: 'Ended', off: 'OFF',
    empty: 'No live deals right now. Check back soon!',
    loadError: 'Could not load deals. Check your connection.', retry: 'Retry',
    needLogin: 'Please log in to claim deals.', claimFail: 'Could not claim. Please try again.',
    back: 'Back', by: 'by',
  },
  fr: {
    title: 'Ventes Flash', subtitle: 'Offres à durée limitée — réclamez avant la rupture',
    endsIn: 'Se termine dans', slots: 'places restantes', claim: "Réclamer l'offre", claimed: 'Réclamé ✓',
    soldOut: 'Épuisé', ended: 'Terminé', off: 'DE RÉDUC',
    empty: 'Aucune offre en cours. Revenez bientôt !',
    loadError: 'Impossible de charger les offres. Vérifiez votre connexion.', retry: 'Réessayer',
    needLogin: 'Connectez-vous pour réclamer.', claimFail: 'Échec de la réclamation. Réessayez.',
    back: 'Retour', by: 'par',
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
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return (
    <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
      <Clock className="w-3.5 h-3.5" /> {prefix} {h > 0 ? `${h}h ` : ''}{pad(m)}:{pad(s)}
    </span>
  );
}

export default function FlashDeals() {
  const navigate = useNavigate();
  const { language } = useLanguage() as { language?: string };
  const t = T[language === 'fr' ? 'fr' : 'en'];

  const [deals, setDeals] = useState<Deal[]>([]);
  const [myClaims, setMyClaims] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id ?? null;
      setUserId(uid);

      const { data, error } = await supabase
        .from('flash_deals')
        .select('id, title, description, images, discount_percent, original_price_xaf, discounted_price_xaf, total_slots, claimed_slots, ends_at, status, vendor_profiles:vendor_id(store_name)')
        .gt('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      const rows = ((data ?? []) as unknown as Deal[]).filter((d) => (d.status ?? 'active') !== 'cancelled');
      setDeals(rows);

      if (uid && rows.length > 0) {
        const { data: claims } = await supabase
          .from('flash_deal_claims')
          .select('deal_id')
          .eq('user_id', uid)
          .in('deal_id', rows.map((d) => d.id));
        setMyClaims(new Set((claims ?? []).map((c: { deal_id: string }) => c.deal_id)));
      } else {
        setMyClaims(new Set());
      }
    } catch (e) {
      console.error('[FlashDeals] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const claim = async (d: Deal) => {
    if (!userId) { flash(t.needLogin); return; }
    setBusyId(d.id);
    try {
      const { error } = await supabase
        .from('flash_deal_claims')
        .insert({ deal_id: d.id, user_id: userId, claimed_at: new Date().toISOString() });
      if (!error || (error as { code?: string }).code === '23505') {
        setMyClaims((s) => new Set(s).add(d.id));
        if (!error) {
          setDeals((ds) => ds.map((x) => x.id === d.id ? { ...x, claimed_slots: (x.claimed_slots ?? 0) + 1 } : x));
        }
      } else {
        throw error;
      }
    } catch (e) {
      console.error('[FlashDeals] claim failed:', e);
      flash(t.claimFail);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-orange-100 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6" /> {t.title}</h1>
        <p className="text-orange-100 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {loading && <div className="flex justify-center py-16 text-red-600"><Loader2 className="w-8 h-8 animate-spin" /></div>}

        {!loading && loadError && (
          <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{t.loadError}</p>
            <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold">{t.retry}</button>
          </div>
        )}

        {!loading && !loadError && deals.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Zap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t.empty}</p>
          </div>
        )}

        {!loading && !loadError && deals.map((d) => {
          const total = d.total_slots ?? 0;
          const claimed = d.claimed_slots ?? 0;
          const left = Math.max(total - claimed, 0);
          const pct = total > 0 ? Math.min(Math.round((claimed / total) * 100), 100) : 0;
          const mine = myClaims.has(d.id);
          const soldOut = total > 0 && left === 0 && !mine;
          const img = Array.isArray(d.images) && d.images[0] ? d.images[0] : null;
          return (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex gap-3 p-3">
                <div className="w-24 h-24 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {img ? <img src={img} alt={d.title} className="w-full h-full object-cover" loading="lazy" />
                       : <Tag className="w-8 h-8 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{d.title}</h3>
                    {d.discount_percent ? (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0">
                        -{d.discount_percent}% {t.off}
                      </span>
                    ) : null}
                  </div>
                  {d.vendor_profiles?.store_name ? (
                    <p className="text-[11px] text-gray-400 mt-0.5">{t.by} {d.vendor_profiles.store_name}</p>
                  ) : null}
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-red-600 font-bold text-sm">{fmtXAF(d.discounted_price_xaf)}</span>
                    {d.original_price_xaf ? <span className="text-[11px] text-gray-400 line-through">{fmtXAF(d.original_price_xaf)}</span> : null}
                  </div>
                  <div className="mt-1.5"><Countdown endsAt={d.ends_at} endedLabel={t.ended} prefix={t.endsIn} /></div>
                </div>
              </div>
              <div className="px-3 pb-3">
                {total > 0 ? (
                  <>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{left} {t.slots}</p>
                  </>
                ) : null}
                <button
                  onClick={() => claim(d)}
                  disabled={busyId === d.id || mine || soldOut}
                  className={`mt-2 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${
                    mine ? 'bg-emerald-50 text-emerald-700' : soldOut ? 'bg-gray-100 text-gray-400' : 'bg-red-600 text-white'
                  } disabled:opacity-70`}
                >
                  {busyId === d.id ? <Loader2 className="w-4 h-4 animate-spin" />
                    : mine ? (<><CheckCircle2 className="w-4 h-4" /> {t.claimed}</>)
                    : soldOut ? t.soldOut : t.claim}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">{toast}</div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__FLASHDEALS__COMPLETE
