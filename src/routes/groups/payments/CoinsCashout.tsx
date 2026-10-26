// BAMBEH_DEPLOY_TOKEN__COINSCASHOUT_FIX871_CLEAN
/**
 * src/routes/groups/payments/CoinsCashout.tsx - Bambeh Marketplace (route /coins/cashout, signed-in members)
 *
 * FIX871 - TURN ZERM COINS INTO MONEY (Big, 19 Oct 2026: "let the coins to money be an option in the admin and super
 * admin section for decision").
 *   - Open only while an admin or the super admin has "Coins to money" switched on (Command Center > Zerm coins,
 *     FIX859 - OFF by default). Switched off, the page says so plainly; a member can still see and cancel a request.
 *   - The member chooses how many coins (from the minimum, up to the day's limit and their balance), sees what they
 *     receive in F CFA at the rate the admins set, and gives their own MTN or Orange Money number (filled in from their
 *     last request or their payout number; only they and Bambeh see it).
 *   - Asking sets the coins aside at once (bambeh_zerm_cashout_start). A Bambeh admin checks every request, then pays
 *     it through CamPay - or refuses it with a reason, and the coins come back. One request at a time; a request still
 *     waiting can be cancelled (coins back at once). The member is told by notification at each step.
 *   - Zerm coins stay earned only: they cannot be bought, sold or sent to another member.
 * Five languages (FIX869), right-to-left for Arabic. (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import { ZERM_STR, fmtCoins, zermFill, zermLang } from '@/features/coins/zermText';
import type { ZermKey } from '@/features/coins/zermText';
import { cashoutAmount, cashoutCancel, cashoutMine, cashoutStart } from '@/features/coins/zermApi';
import type { CashoutMine, CashoutStatus } from '@/features/coins/zermApi';

/** 1250 -> "1 250" (the way amounts are written in Cameroon). */
function money(n: unknown): string {
  return Math.round(Number(n) || 0).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
}

/** The member's MTN or Orange number as 9 digits (6XX XXX XXX), or null. Same rule as the database (FIX859). */
export function momo9(raw: string): string | null {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.length === 12 && d.indexOf('237') === 0) d = d.slice(3);
  return /^6[5789][0-9]{7}$/.test(d) ? d : null;
}

/** "2,5" or "2.5" -> 2.5 (four decimals at most, as the coins are counted). */
function parseCoins(raw: string): number {
  const v = Number(String(raw || '').replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(v) ? Math.floor(v * 10000) / 10000 : 0;
}

const STATUS_STYLE: Record<CashoutStatus, string> = {
  waiting: 'bg-amber-50 text-amber-800',
  paying: 'bg-amber-50 text-amber-800',
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-gray-100 text-gray-700',
  refused: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function CoinsCashout() {
  const navigate = useNavigate();
  const lang = zermLang(useLang());
  const t = ZERM_STR[lang];
  const w = (k: ZermKey) => t[k];
  const rtl = lang === 'ar';

  const [data, setData] = useState<CashoutMine | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [coinsTyped, setCoinsTyped] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setFailed(null);
    const r = await cashoutMine();
    if (!r.ok) { setFailed(r.reason === 'not_ready' ? w('r_not_ready') : w('r_network')); return; }
    setData(r);
    setPhone((prev) => (prev || !r.phone ? prev : r.phone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => { void load(); }, [load]);

  const coins = parseCoins(coinsTyped);
  const leftToday = data ? Math.max(0, Math.floor((data.day_max - data.today) * 10000) / 10000) : 0;
  const allowed = data ? Math.max(0, Math.min(data.balance, leftToday)) : 0;
  const amount = data ? cashoutAmount(coins, data.rate) : 0;
  const phone9 = momo9(phone);

  // what stands in the way, said before asking (the database checks the same and has the last word)
  const problem = useMemo(() => {
    if (!data || !coinsTyped) return null;
    if (coins <= 0 || coins < data.min || amount < 100) return zermFill(w('rc_too_small'), { min: fmtCoins(data.min) });
    if (coins > data.balance) return zermFill(w('rc_not_enough'), { balance: fmtCoins(data.balance) });
    if (coins > leftToday) return zermFill(w('rc_day_limit'), { left: fmtCoins(leftToday) });
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, coinsTyped, coins, amount, leftToday, lang]);

  const reasonText = (r: { reason: string; [k: string]: unknown }): string => {
    switch (r.reason) {
      case 'cashout_off': return w('rc_cashout_off');
      case 'bad_phone': return w('rc_bad_phone');
      case 'too_small': return zermFill(w('rc_too_small'), { min: fmtCoins(r.min) });
      case 'day_limit': return zermFill(w('rc_day_limit'), { left: fmtCoins(r.left) });
      case 'open_request': return w('rc_open_request');
      case 'not_waiting': return w('rc_not_waiting');
      case 'not_enough': return zermFill(w('rc_not_enough'), { balance: fmtCoins(r.balance) });
      case 'not_signed_in': return w('r_not_signed_in');
      case 'not_ready': return w('r_not_ready');
      default: return w('r_network');
    }
  };

  const ask = async () => {
    if (!data || busy || problem || !phone9 || coins <= 0) return;
    setBusy(true);
    setMsg(null);
    const r = await cashoutStart(coins, phone9);
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: reasonText(r) }); void load(); return; }
    setMsg({ kind: 'ok', text: zermFill(w('cashAsked'), { coins: fmtCoins(r.coins) }) });
    setCoinsTyped('');
    void load();
  };

  const cancel = async (id: string) => {
    setCancelling(id);
    setMsg(null);
    const r = await cashoutCancel(id);
    setCancelling(null);
    setMsg(r.ok ? { kind: 'ok', text: w('cashCancelled') } : { kind: 'err', text: reasonText(r) });
    void load();
  };

  const statusText = (s: CashoutStatus, ph: string | null) => zermFill(w(('cs_' + s) as ZermKey), { phone: ph || '' });
  const when = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(lang === 'fr' || lang === 'ff' ? 'fr-FR' : lang === 'ar' ? 'ar' : 'en-GB',
      { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const header = (
    <div className="px-4 pb-2 pt-5">
      <button type="button" onClick={() => navigate('/coins')} className="mb-4 flex items-center gap-1 text-sm text-gray-500" data-go="coins">
        <ArrowLeft className={'h-4 w-4 ' + (rtl ? 'rotate-180' : '')} aria-hidden="true" /> {w('back')}
      </button>
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-gray-900" data-title="1">
        <Banknote className="h-6 w-6 shrink-0 text-teal-800" aria-hidden="true" /> {w('cashTitle')}
      </h1>
    </div>
  );

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX871">
        {header}
        <div className="px-4 pt-4">
          {failed ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700" role="alert" data-load-error="1">
              <span>{failed}</span>
              <button type="button" onClick={() => { void load(); }} className="flex shrink-0 items-center gap-1 font-bold">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> {w('again')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500" aria-busy="true" data-loading="1">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {w('loading')}
            </div>
          )}
        </div>
      </div>
    );
  }

  const waiting = data.requests.find((r) => r.status === 'waiting' || r.status === 'paying') || null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX871" data-open={data.cashout ? '1' : '0'}>
      {header}

      <div className="mx-auto max-w-lg space-y-5 px-4 pt-2">
        {!data.cashout ? (
          <section className="rounded-3xl border border-gray-100 bg-white p-5" data-off="1">
            <p className="text-base font-bold">{w('cashOffTitle')}</p>
            <p className="mt-1 text-sm text-gray-600">{w('cashOffBody')}</p>
            <button type="button" onClick={() => navigate('/coins')}
                    className="mt-4 rounded-full border border-teal-800 px-4 py-2 text-sm font-bold text-teal-800">
              {w('wallet')}
            </button>
          </section>
        ) : (
          <>
            <p className="text-sm text-gray-600">{w('cashLead')}</p>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-900" dir="ltr" data-rate={data.rate}>
                {zermFill(w('cashRate'), { rate: money(data.rate) })}
              </span>
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 font-semibold text-gray-700" data-balance={data.balance}>
                {zermFill(w('cashBalance'), { balance: fmtCoins(data.balance) })}
              </span>
            </div>
            <p className="text-xs text-gray-500" data-limits="1">
              {zermFill(w('cashLimits'), { min: fmtCoins(data.min), max: fmtCoins(data.day_max), today: fmtCoins(data.today) })}
            </p>

            {waiting ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900" data-has-open="1">{w('rc_open_request')}</p>
            ) : (
              <section className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5" data-form="1">
                <label className="block">
                  <span className="text-sm font-semibold">{w('cashCoins')}</span>
                  <div className="mt-1.5 flex gap-2">
                    <input value={coinsTyped} onChange={(e) => { setCoinsTyped(e.target.value.slice(0, 12)); setMsg(null); }}
                           inputMode="decimal" placeholder={fmtCoins(data.min)} dir="ltr" data-coins="1"
                           className="min-w-0 flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-lg font-bold outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/15" />
                    <button type="button" onClick={() => { setCoinsTyped(String(allowed)); setMsg(null); }} disabled={allowed <= 0} data-all="1"
                            className="shrink-0 rounded-2xl border border-gray-200 px-3 text-xs font-bold text-teal-800 disabled:opacity-40">
                      {w('cashAll')}
                    </button>
                  </div>
                  {problem ? <span className="mt-1.5 block text-xs text-red-700" data-problem="1">{problem}</span> : null}
                </label>

                {amount > 0 ? (
                  <p className="text-base font-bold text-teal-900" data-amount={amount} dir={rtl ? 'rtl' : 'ltr'}>
                    {zermFill(w('cashYouGet'), { amount: money(amount) })}
                  </p>
                ) : null}

                <label className="block">
                  <span className="text-sm font-semibold">{w('cashPhone')}</span>
                  <input value={phone} onChange={(e) => { setPhone(e.target.value.slice(0, 16)); setMsg(null); }} onBlur={() => setPhoneTouched(true)}
                         inputMode="tel" placeholder="6XX XXX XXX" dir="ltr" autoComplete="tel" data-phone="1"
                         className="mt-1.5 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/15" />
                  <span className={'mt-1.5 block text-xs ' + (phone && !phone9 && phoneTouched ? 'text-red-700' : 'text-gray-500')}>
                    {phone && !phone9 && phoneTouched ? w('rc_bad_phone') : w('cashPhoneHint')}
                  </span>
                </label>

                <button type="button" onClick={() => { void ask(); }} disabled={busy || !!problem || !phone9 || coins <= 0} data-ask="1"
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-800 py-3.5 text-sm font-extrabold text-white disabled:opacity-40">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {amount > 0 ? zermFill(w('cashAsk'), { amount: money(amount) }) : w('cashBtn')}
                </button>
              </section>
            )}
          </>
        )}

        {msg ? (
          <p className={'rounded-2xl px-4 py-3 text-sm ' + (msg.kind === 'ok' ? 'bg-green-50 text-green-800' : 'border border-red-200 bg-white text-red-700')}
             role={msg.kind === 'err' ? 'alert' : 'status'} data-msg={msg.kind}>
            {msg.text}
          </p>
        ) : null}

        <section data-mine="1">
          <h2 className="text-base font-extrabold">{w('cashMine')}</h2>
          {data.requests.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">{w('cashNone')}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {data.requests.map((r) => (
                <li key={r.id} className="rounded-2xl border border-gray-100 bg-white p-4" data-request={r.id} data-status={r.status}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold" dir="ltr">{money(r.amount_xaf)} F</p>
                      <p className="text-xs text-gray-500">{fmtCoins(r.coins)} Zerm - {when(r.created_at)}</p>
                    </div>
                    <span className={'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ' + STATUS_STYLE[r.status]}>
                      {r.status === 'paid' ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        : r.status === 'waiting' || r.status === 'paying' ? <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        : <XCircle className="h-3.5 w-3.5" aria-hidden="true" />}
                      {statusText(r.status, r.phone)}
                    </span>
                  </div>
                  {r.note ? <p className="mt-2 text-xs text-gray-600" data-note="1">{zermFill(w('cashNote'), { note: r.note })}</p> : null}
                  {r.status === 'waiting' ? (
                    <button type="button" onClick={() => { void cancel(r.id); }} disabled={cancelling === r.id} data-cancel={r.id}
                            className="mt-3 rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-50">
                      {w('cashCancel')}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__COINSCASHOUT_FIX871__COMPLETE
