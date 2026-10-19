// BAMBEH_DEPLOY_TOKEN__COINSBUYPAGE_FIX849_CLEAN
/**
 * CoinsBuyPage.tsx - Bambeh Marketplace
 * FILE LOCATION: src/routes/groups/payments/CoinsBuyPage.tsx  (routed at /coins/buy, /coins/purchase, /zerm/purchase)
 *
 * FIX849 (replaces FIX110) - BUYING ZERM COINS ONLY WHEN AN ADMIN HAS SWITCHED IT ON.
 *   The FIX110 page sold 10 coins for 1,000 XAF and then wrote the coins from the phone. Now:
 *   - buying switched OFF (the default, Command Center > Zerm coins): the explanation page (FIX848);
 *   - buying switched ON (when Bambeh holds its COBAC licence): the packages and prices the admins set; the member
 *     picks one, bambeh_zerm_buy_start() makes the order, the payment box (FIX853) asks mobile money for exactly
 *     that price under the order's reference, and the DATABASE credits the coins when the payment record says
 *     SUCCESSFUL for at least the price (FIX845). This page only watches the order; it never writes a coin.
 *   - A retry always starts a fresh order: a reference is never sent to mobile money twice.
 * Five languages (FIX846), right-to-left for Arabic.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Zap, AlertTriangle, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import CamPayWidget from '@/components/payment/CamPayWidget';
import ZermEarnOnly from '@/features/coins/ZermEarnOnly';
import { ZERM_STR, zermLang, zermFill, fmtCoins, coinsLabel } from '@/features/coins/zermText';
import type { ZermKey } from '@/features/coins/zermText';
import { buyStart, orderStatus, useZermState } from '@/features/coins/zermApi';
import type { ZermPackage } from '@/features/coins/zermApi';

type Order = { order_id: string; external_ref: string; coins: number; amount: number; description: string };
type Phase = 'choose' | 'pay' | 'crediting' | 'credited' | 'underpaid' | 'failed' | 'slow';

const fmtXaf = (n: number) => (Number(n) || 0).toLocaleString('fr-CM');

export default function CoinsBuyPage() {
  const navigate = useNavigate();
  const lang = zermLang(useLang());
  const t = ZERM_STR[lang];
  const rtl = lang === 'ar';
  const { state, loading } = useZermState();

  const [userId, setUserId] = useState<string | null>(null);
  const [pick, setPick] = useState<ZermPackage | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [phase, setPhase] = useState<Phase>('choose');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setUserId(data?.session?.user?.id ?? null));
    return () => { if (timer.current !== null) window.clearTimeout(timer.current); };
  }, []);

  const reasonText = useCallback((reason: string) => {
    const k = ('r_' + reason) as ZermKey;
    return t[k] || t.r_network;
  }, [t]);

  /** Starts a fresh order for the chosen package (also used for every retry). */
  const startOrder = useCallback(async (p: ZermPackage) => {
    setErr('');
    setBusy(true);
    const r = await buyStart(p.coins);
    setBusy(false);
    if (!r.ok) { setErr(reasonText(r.reason)); setOrder(null); setPhase('choose'); return; }
    setOrder({ order_id: r.order_id, external_ref: r.external_ref, coins: Number(r.coins), amount: Number(r.amount), description: r.description });
    setPhase('pay');
  }, [reasonText]);

  /** The payment went through on the phone: wait for the database to credit the coins. */
  const watch = useCallback((orderId: string, started: number) => {
    timer.current = window.setTimeout(async () => {
      const r = await orderStatus(orderId);
      if (r.ok && r.status === 'paid') { setBalance(r.balance === null ? null : Number(r.balance)); setPhase('credited'); return; }
      if (r.ok && r.status === 'underpaid') { setPhase('underpaid'); return; }
      if (r.ok && r.status === 'failed') { setPhase('failed'); return; }
      if (Date.now() - started > 2 * 60 * 1000) { setPhase('slow'); return; }
      watch(orderId, started);
    }, 3000);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-gray-500" dir={rtl ? 'rtl' : 'ltr'}>
        <Loader2 className="h-5 w-5 animate-spin text-teal-600" /> {t.loading}
      </div>
    );
  }
  if (!state.buying) return <ZermEarnOnly mode="buy" />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX849" data-phase={phase}>
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-4 pb-8 pt-6 text-white">
        <button onClick={() => navigate('/coins')} className="mb-4 flex items-center gap-1 text-sm text-white/85 hover:text-white">
          <ArrowLeft className={`h-4 w-4 ${rtl ? 'rotate-180' : ''}`} /> {t.back}
        </button>
        <h1 className="flex items-center gap-2 text-xl font-bold"><Zap className="h-6 w-6 text-yellow-300" /> {t.buyHead}</h1>
        <p className="mt-2 text-sm text-teal-50">{t.buyLead}</p>
        <p className="mt-1 text-xs text-teal-100">{t.perWeek}</p>
      </div>

      <div className="mx-auto -mt-4 max-w-lg space-y-4 px-4">
        {err && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" data-error="1">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {err}
          </div>
        )}

        {phase === 'choose' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {state.packages.map((p) => {
                const on = pick !== null && pick.coins === p.coins;
                return (
                  <button key={p.coins} type="button" onClick={() => setPick(p)} aria-pressed={on} data-package={p.coins}
                          className={`rounded-2xl border-2 bg-white p-4 text-start shadow-sm ${on ? 'border-teal-600 ring-2 ring-teal-100' : 'border-gray-100'}`}>
                    <span className="flex items-center gap-1 text-lg font-extrabold text-gray-900"><Zap className="h-4 w-4 text-yellow-500" />{coinsLabel(t, p.coins)}</span>
                    <span className="mt-1 block text-sm font-bold text-teal-700" dir="ltr">{fmtXaf(p.price)} XAF</span>
                  </button>
                );
              })}
            </div>
            <button type="button" disabled={!pick || busy || !userId} onClick={() => { if (pick) void startOrder(pick); }} data-continue="1"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-sm font-bold text-white disabled:bg-teal-300">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {pick ? zermFill(t.payFor, { price: fmtXaf(pick.price), coins: coinsLabel(t, pick.coins) }) : t.continue}
            </button>
            {!userId && <p className="text-center text-xs text-gray-500">{t.r_not_signed_in}</p>}
          </>
        )}

        {phase === 'pay' && order && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-gray-900">{zermFill(t.payFor, { price: fmtXaf(order.amount), coins: coinsLabel(t, order.coins) })}</p>
              <button type="button" onClick={() => { setOrder(null); setPhase('choose'); }} className="text-xs font-semibold text-teal-700 underline">{t.change}</button>
            </div>
            <CamPayWidget
              key={order.order_id}
              amount={order.amount}
              description={order.description}
              externalRef={order.external_ref}
              metadata={{ user_id: userId, zerm_order: order.order_id }}
              onSuccess={() => { setPhase('crediting'); watch(order.order_id, Date.now()); }}
              onRetry={() => { if (pick) void startOrder(pick); }}
              successNode={<div className="py-6 text-center text-sm text-gray-600">{t.waitCredit}</div>}
            />
          </div>
        )}

        {phase === 'crediting' && (
          <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-white p-5 text-sm text-gray-700 shadow-sm" data-crediting="1">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-teal-600" /> {t.waitCredit}
          </div>
        )}

        {phase === 'credited' && order && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center" data-credited="1">
            <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-600" />
            <p className="font-semibold text-emerald-900">
              {zermFill(t.credited, { coins: coinsLabel(t, order.coins), balance: fmtCoins(balance ?? order.coins) })}
            </p>
            <button type="button" onClick={() => navigate('/coins')} className="mt-4 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white">{t.wallet}</button>
          </div>
        )}

        {(phase === 'underpaid' || phase === 'failed' || phase === 'slow') && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5" data-problem={phase}>
            <p className="text-sm text-amber-900">{phase === 'underpaid' ? t.underpaid : phase === 'failed' ? t.failed : t.slow}</p>
            {order && <p className="mt-1 font-mono text-xs text-amber-800" dir="ltr">{order.external_ref}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {phase === 'failed' && pick && (
                <button type="button" onClick={() => void startOrder(pick)} className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white">{t.again}</button>
              )}
              <button type="button" onClick={() => navigate('/help/chat')} className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-teal-700 ring-1 ring-teal-200">
                <MessageCircle className="h-3.5 w-3.5" /> {t.chat}
              </button>
              <button type="button" onClick={() => navigate('/coins')} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-gray-700 ring-1 ring-gray-200">{t.wallet}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__COINSBUYPAGE_FIX849__COMPLETE
