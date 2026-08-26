// BAMBEH_DEPLOY_TOKEN__FLASHDEALS_FIX402_CLEAN
/**
 * src/routes/groups/community/FlashDeals.tsx - Bambeh Marketplace
 *
 * FIX402: the page only ever had English and French, and the resolver said
 * `language === 'fr' ? 'fr' : 'en'`, so Pidgin, Arabic and Fulfulde all
 * silently fell back to English. All five languages are now present and the
 * resolver reads the real language code.
 *  - RTL applied for Arabic
 *  - translate="no" guards against Chrome auto-translate crashing React
 *  - every string is a \u escape, so no encoding step can break the accents
 *
 * The data layer is UNCHANGED from FIX174: it selects the columns that really
 * exist on flash_deals (image_url, original_price, deal_price, stock_total,
 * stock_remaining, max_quantity, sold_count, is_active, vendor_name) with NO
 * join, so no relationship problem can blank this page.
 * (c) 2025-2026 BAMBEH SARL. All rights reserved.
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
  image_url: string | null;
  discount_percent: number | null;
  original_price: number | null;
  deal_price: number | null;
  stock_total: number | null;
  stock_remaining: number | null;
  max_quantity: number | null;
  sold_count: number | null;
  ends_at: string | null;
  is_active: boolean | null;
  currency: string | null;
  vendor_id: string | null;
  seller_id: string | null;
  vendor_name: string | null;
}

const T = {
  en: {
    title: "Flash Deals",
    subtitle: "Limited-time offers. Claim before they run out",
    endsIn: "Ends in",
    slots: "left",
    claim: "Claim deal",
    claimed: "Claimed",
    soldOut: "Sold out",
    ended: "Ended",
    off: "OFF",
    empty: "No live deals right now. Check back soon",
    loadError: "Could not load deals. Check your connection",
    retry: "Try again",
    needLogin: "Sign in to claim deals",
    claimFail: "Could not claim. Please try again",
    back: "Back",
    by: "by",
  },
  fr: {
    title: "Ventes Flash",
    subtitle: "Offres \u00e0 dur\u00e9e limit\u00e9e. R\u00e9clamez avant la rupture",
    endsIn: "Se termine dans",
    slots: "restantes",
    claim: "R\u00e9clamer l'offre",
    claimed: "R\u00e9clam\u00e9",
    soldOut: "\u00c9puis\u00e9",
    ended: "Termin\u00e9",
    off: "DE R\u00c9DUCTION",
    empty: "Aucune offre en cours. Revenez bient\u00f4t",
    loadError: "Impossible de charger les offres. V\u00e9rifiez votre connexion",
    retry: "R\u00e9essayer",
    needLogin: "Connectez-vous pour r\u00e9clamer",
    claimFail: "\u00c9chec de la r\u00e9clamation. R\u00e9essayez",
    back: "Retour",
    by: "par",
  },
  pidgin: {
    title: "Flash Deals",
    subtitle: "Offer weh e get time. Claim am before e finish",
    endsIn: "E go end for",
    slots: "remain",
    claim: "Claim the deal",
    claimed: "You don claim",
    soldOut: "E don finish",
    ended: "E don end",
    off: "DISCOUNT",
    empty: "No deal dey now. Come check back soon",
    loadError: "We no fit load the deals. Check your network",
    retry: "Try again",
    needLogin: "Login first before you claim",
    claimFail: "We no fit claim am. Try again",
    back: "Go back",
    by: "from",
  },
  ar: {
    title: "\u0639\u0631\u0648\u0636 \u0633\u0631\u064a\u0639\u0629",
    subtitle: "\u0639\u0631\u0648\u0636 \u0644\u0648\u0642\u062a \u0645\u062d\u062f\u0648\u062f. \u0627\u062d\u062c\u0632 \u0642\u0628\u0644 \u0646\u0641\u0627\u062f\u0647\u0627",
    endsIn: "\u062a\u0646\u062a\u0647\u064a \u062e\u0644\u0627\u0644",
    slots: "\u0645\u062a\u0628\u0642\u064a\u0629",
    claim: "\u0627\u062d\u062c\u0632 \u0627\u0644\u0639\u0631\u0636",
    claimed: "\u062a\u0645 \u0627\u0644\u062d\u062c\u0632",
    soldOut: "\u0646\u0641\u062f\u062a \u0627\u0644\u0643\u0645\u064a\u0629",
    ended: "\u0627\u0646\u062a\u0647\u0649",
    off: "\u062e\u0635\u0645",
    empty: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0639\u0631\u0648\u0636 \u062d\u0627\u0644\u064a\u0627. \u0639\u062f \u0642\u0631\u064a\u0628\u0627",
    loadError: "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0639\u0631\u0648\u0636. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643",
    retry: "\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649",
    needLogin: "\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u062d\u062c\u0632 \u0627\u0644\u0639\u0631\u0648\u0636",
    claimFail: "\u062a\u0639\u0630\u0631 \u0627\u0644\u062d\u062c\u0632. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649",
    back: "\u0631\u062c\u0648\u0639",
    by: "\u0645\u0646",
  },
  ff: {
    title: "Coggu Yaawngu",
    subtitle: "Coggu jogingu sahaa. Jogo ado ngu gasde",
    endsIn: "Ina gasa e",
    slots: "heddii\u0257i",
    claim: "Jogo coggu",
    claimed: "A jogii",
    soldOut: "Gasii",
    ended: "Gasii",
    off: "USTAAKE",
    empty: "Coggu alaa jooni. Rutto law",
    loadError: "Min mbaawaa loowde coggu. \u01b3eewto seede maa",
    retry: "Eto kadi",
    needLogin: "Naatnu ado maa jogaade coggu",
    claimFail: "Min mbaawaa jogaade. Eto kadi",
    back: "Rutto",
    by: "e",
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
  const langKey = language === 'fulfulde' || language === 'ful' ? 'ff'
                : language === 'pcm' ? 'pidgin'
                : (language ?? 'en');
  const t: TL = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl = langKey === 'ar';

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
        .select('id, title, description, image_url, discount_percent, original_price, deal_price, stock_total, stock_remaining, max_quantity, sold_count, ends_at, is_active, currency, vendor_id, seller_id, vendor_name')
        .gt('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      // FIX174: is_active=false means cancelled/paused; null counts as live.
      const rows = ((data ?? []) as unknown as Deal[]).filter((d) => d.is_active !== false);
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
          setDeals((ds) => ds.map((x) => x.id === d.id ? { ...x, sold_count: (x.sold_count ?? 0) + 1 } : x));
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
    <div className="min-h-screen bg-gray-50 pb-24 notranslate" translate="no" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-orange-100 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t.back}
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
          const total = d.stock_total ?? d.max_quantity ?? 0;
          const claimed = d.sold_count ?? (d.stock_total != null && d.stock_remaining != null ? d.stock_total - d.stock_remaining : 0);
          const left = Math.max(total - claimed, 0);
          const pct = total > 0 ? Math.min(Math.round((claimed / total) * 100), 100) : 0;
          const mine = myClaims.has(d.id);
          const soldOut = total > 0 && left === 0 && !mine;
          const img = d.image_url || null;
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
                  {d.vendor_name ? (
                    <p className="text-[11px] text-gray-400 mt-0.5">{t.by} {d.vendor_name}</p>
                  ) : null}
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-red-600 font-bold text-sm">{fmtXAF(d.deal_price)}</span>
                    {d.original_price ? <span className="text-[11px] text-gray-400 line-through">{fmtXAF(d.original_price)}</span> : null}
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
// BAMBEH_END_TOKEN__FLASHDEALS_FIX402__COMPLETE
