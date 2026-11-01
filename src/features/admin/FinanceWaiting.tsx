// BAMBEH_DEPLOY_TOKEN__FINANCE_WAITING_FIX944_CLEAN
/**
 * src/features/admin/FinanceWaiting.tsx - FIX944 (new) - Command Center > Finances, at the top
 *
 * WHAT THE NUMBER BESIDE FINANCES COUNTS, AND HOW TO CLEAR IT. Big, 1 Nov 2026: "finances has a 14 signal for months
 * now and even when you open that page you still don't see anything but the 14 does not go away".
 *
 * The 14 were payments that never got a final answer from Mobile Money (the buyer did not approve the prompt, or the
 * answer was lost on the way). Nothing on the page could close one, so the number stayed for ever.
 *
 *  - The number beside Finances (FIX945) now counts exactly this list: payments waiting more than an hour, and
 *    payouts Bambeh still owes (bambeh_finance_waiting, FIX942).
 *  - "Ask CamPay" asks the payments server for CamPay's own answer, one payment at a time (or all of them).
 *  - "Close as not paid" (bambeh_finance_close_payment, FIX942): allowed when CamPay says FAILED, or after 24 hours
 *    with no final answer (a Mobile Money prompt dies within minutes). Your name, date and time are recorded; nothing
 *    is deleted; the order it was for is marked failed by Bambeh's own watchers, as CamPay's FAILED answer would.
 *  - A payment CamPay recorded as PAID is NEVER closed here: the money reached Bambeh's CamPay account and the order
 *    was never finished. The page says so and asks for the reference to be sent to Claude.
 *  - Payouts are listed (who, how much, why it waits); they leave the list when the payout is recorded as paid.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a member. Owner only (the super admin).
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Search, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { refreshAdminBadges } from './useBadgeCounts';

type Answer = 'SUCCESSFUL' | 'FAILED' | 'PENDING' | 'NOT_FOUND' | 'NO_ANSWER';

interface WaitPayment {
  id: string;
  reference: string | null;
  external_ref: string | null;
  amount: number | string | null;
  total_charged: number | string | null;
  payment_type: string | null;
  plan_name: string | null;
  operator: string | null;
  status: string | null;
  payment_status: string | null;
  reason: string | null;
  created_at: string;
  member: string | null;
  phone_end: string | null;
  paid_at_campay: boolean;
  hours: number | string | null;
}
interface WaitPayout {
  source: string;
  id: string;
  amount: number | string | null;
  status: string | null;
  reason: string | null;
  created_at: string | null;
  member: string | null;
}
interface Waiting {
  ok?: boolean; reason?: string;
  payments?: WaitPayment[]; payouts?: WaitPayout[];
  payments_total?: number; payouts_total?: number; closes_as?: string | null;
}

const PROJECT_FALLBACK = 'https://rbjbdxefwzvgmioearie.supabase.co';
function paymentsUrl(): string {
  const raw = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const base = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(raw) ? raw : PROJECT_FALLBACK;
  return base + '/functions/v1/payments';
}

function xaf(v: number | string | null | undefined): string {
  const n = Number(v);
  if (v === null || v === undefined || v === '' || !Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
}
function hoursOf(p: WaitPayment): number {
  const h = Number(p.hours);
  if (Number.isFinite(h)) return h;
  const t = Date.parse(p.created_at);
  return Number.isFinite(t) ? (Date.now() - t) / 3600000 : 0;
}
function ago(h: number): string {
  if (h < 48) return Math.max(1, Math.round(h)) + ' h ago';
  return Math.round(h / 24) + ' days ago';
}
/** What the server will accept - checked again there, this only decides which buttons to draw. */
function closable(p: WaitPayment, a: Answer | undefined): boolean {
  if (p.paid_at_campay || !a || a === 'SUCCESSFUL') return false;
  if (a === 'FAILED') return hoursOf(p) >= 1;
  return hoursOf(p) >= 24;
}

/** Asks the payments server what CamPay says about one reference. Never throws. */
async function askCamPay(ref: string): Promise<Answer> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;
    const anon = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
    const headers: Record<string, string> = {};
    if (anon) headers.apikey = anon;
    if (token || anon) headers.Authorization = 'Bearer ' + (token || anon);
    const res = await fetch(paymentsUrl() + '/status/' + encodeURIComponent(ref), { headers });
    if (res.status === 404) return 'NOT_FOUND';
    if (!res.ok) return 'NO_ANSWER';
    const body = await res.json().catch(() => null) as { status?: unknown; data?: { status?: unknown } } | null;
    const s = String((body && body.data && body.data.status) || (body && body.status) || '').toUpperCase();
    if (s === 'SUCCESSFUL' || s === 'SUCCESS' || s === 'COMPLETED' || s === 'PAID') return 'SUCCESSFUL';
    if (s === 'FAILED' || s === 'FAILURE' || s === 'EXPIRED' || s === 'CANCELLED' || s === 'CANCELED') return 'FAILED';
    if (s === 'PENDING' || s === 'PROCESSING') return 'PENDING';
    return 'NO_ANSWER';
  } catch {
    return 'NO_ANSWER';
  }
}

const ANSWER_TEXT: Record<Answer, string> = {
  SUCCESSFUL: 'CamPay says PAID',
  FAILED: 'CamPay says FAILED',
  PENDING: 'CamPay still says PENDING',
  NOT_FOUND: 'CamPay does not know this reference',
  NO_ANSWER: 'No answer from CamPay',
};
const ANSWER_TONE: Record<Answer, string> = {
  SUCCESSFUL: 'bg-red-100 text-red-800',
  FAILED: 'bg-emerald-100 text-emerald-800',
  PENDING: 'bg-amber-100 text-amber-800',
  NOT_FOUND: 'bg-gray-100 text-gray-700',
  NO_ANSWER: 'bg-gray-100 text-gray-700',
};
const REASON_TEXT: Record<string, string> = {
  not_owner: 'Only the super admin closes payments.',
  paid_at_campay: 'CamPay recorded this payment as PAID - it is never closed as not paid.',
  too_new: 'Less than an hour old - wait a little.',
  wait_24h: 'Without a FAILED answer from CamPay, a payment closes only after 24 hours.',
  not_waiting: 'Already finished - it leaves the list.',
  no_failed_word: 'The database has no word for "not paid" - send Claude the FIX942 result.',
  refused: 'The database refused to change it',
  bad_answer: 'Ask CamPay first.',
  not_found: 'This payment no longer exists.',
};

export default function FinanceWaiting() {
  const [data, setData] = useState<Waiting | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [asking, setAsking] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [bulk, setBulk] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const stop = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await supabase.rpc('bambeh_finance_waiting', { p_limit: 200 });
      if (r.error) {
        const m = String(r.error.message || '');
        setFailed(/bambeh_finance_waiting|does not exist|PGRST202|schema cache/i.test(m)
          ? 'Run FIX942 in Supabase (SQL Editor) - this list comes from it.'
          : 'Could not read what is waiting: ' + m);
      } else {
        const d = r.data as Waiting | null;
        if (!d || !d.ok) setFailed(d && d.reason === 'not_owner' ? 'Owner only.' : 'Could not read what is waiting.');
        else { setData(d); setFailed(null); }
      }
    } catch (e) {
      setFailed('Could not read what is waiting: ' + (e instanceof Error ? e.message : 'network'));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); return () => { stop.current = true; }; }, [load]);

  const ask = useCallback(async (p: WaitPayment) => {
    setAsking((s) => ({ ...s, [p.id]: true }));
    setMsg((s) => ({ ...s, [p.id]: '' }));
    let a: Answer = 'NO_ANSWER';
    const refs = [p.reference, p.external_ref].filter((x, i, all): x is string => !!x && all.indexOf(x) === i);
    for (const ref of refs) {
      a = await askCamPay(ref);
      if (a !== 'NOT_FOUND' && a !== 'NO_ANSWER') break;
    }
    setAnswers((s) => ({ ...s, [p.id]: a }));
    setAsking((s) => ({ ...s, [p.id]: false }));
    return a;
  }, []);

  const close = useCallback(async (p: WaitPayment, a: Answer): Promise<boolean> => {
    try {
      const r = await supabase.rpc('bambeh_finance_close_payment', { p_id: p.id, p_answer: a, p_note: null });
      const d = r && !r.error ? (r.data as { ok?: boolean; reason?: string; detail?: string } | null) : null;
      if (d && (d.ok || d.reason === 'not_waiting')) return true;
      const why = d && d.reason ? (REASON_TEXT[d.reason] || d.reason) + (d.detail ? ': ' + d.detail : '') : (r && r.error ? r.error.message : 'Not closed.');
      setMsg((s) => ({ ...s, [p.id]: why }));
      return false;
    } catch (e) {
      setMsg((s) => ({ ...s, [p.id]: e instanceof Error ? e.message : 'Not closed - check the connection.' }));
      return false;
    }
  }, []);

  const payments = (data && data.payments) || [];
  const payouts = (data && data.payouts) || [];

  const askAll = async () => {
    if (bulk) return;
    stop.current = false;
    let i = 0;
    for (const p of payments) {
      if (stop.current) break;
      i++;
      setBulk('Asking CamPay ' + i + ' of ' + payments.length + '...');
      if (!p.paid_at_campay) await ask(p);
    }
    setBulk(null);
  };

  const ready = payments.filter((p) => closable(p, answers[p.id]));
  const closeAll = async () => {
    if (bulk) return;
    setConfirm(false);
    let i = 0;
    let done = 0;
    for (const p of ready) {
      i++;
      setBulk('Closing ' + i + ' of ' + ready.length + '...');
      const a = answers[p.id];
      if (a && await close(p, a)) done++;
    }
    setBulk(null);
    await load();
    refreshAdminBadges();
    setMsg((s) => ({ ...s, _all: done + ' closed as not paid.' }));
  };

  const closeOne = async (p: WaitPayment) => {
    const a = answers[p.id];
    if (!a || bulk) return;
    setBulk('Closing...');
    const okDone = await close(p, a);
    setBulk(null);
    if (okDone) { await load(); refreshAdminBadges(); }
  };

  const total = payments.length + payouts.length;

  return (
    <section data-fin-waiting="1" className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 mt-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" /> Needs your attention
            {total > 0 ? <span data-fin-total={total} className="rounded-full bg-red-500 px-2 text-xs font-black text-white">{total}</span> : null}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            This is what the number beside Finances counts. When an item is handled, it leaves the list and the number goes down.
          </p>
        </div>
        <button type="button" onClick={() => void load()} title="Refresh" data-fin-refresh="1"
          className="shrink-0 p-2 rounded-xl text-gray-500 hover:bg-gray-100">
          <RefreshCw className={'w-4 h-4' + (loading ? ' animate-spin' : '')} />
        </button>
      </div>

      {failed ? (
        <p data-fin-failed="1" className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">{failed}</p>
      ) : loading && !data ? (
        <div className="flex justify-center py-6 text-teal-600"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : total === 0 ? (
        <p data-fin-empty="1" className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4" /> Nothing is waiting. The number beside Finances is gone.
        </p>
      ) : (
        <>
          {payments.length > 0 ? (
            <div className="mt-4" data-fin-payments={payments.length}>
              <p className="text-sm font-bold text-gray-900">
                {payments.length === 1 ? '1 payment' : payments.length + ' payments'} waited more than an hour for Mobile Money&apos;s answer
              </p>
              <p className="text-xs text-gray-600 mt-1">
                A Mobile Money prompt dies within minutes, so these were never finished. Ask CamPay first. If CamPay says FAILED - or
                after 24 hours with no final answer - close it as not paid. Nothing is deleted; your name, the date and the time are
                recorded. A payment CamPay says was PAID is never closed here.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => void askAll()} disabled={!!bulk} data-fin-ask-all="1"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
                  <Search className="w-4 h-4" /> Ask CamPay about {payments.length === 1 ? 'it' : 'all ' + payments.length}
                </button>
                {ready.length > 0 && !confirm ? (
                  <button type="button" onClick={() => setConfirm(true)} disabled={!!bulk} data-fin-close-all="1"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-sm font-bold text-white hover:bg-black disabled:opacity-50">
                    <XCircle className="w-4 h-4" /> Close {ready.length === 1 ? 'the 1' : 'the ' + ready.length} that can be closed
                  </button>
                ) : null}
                {confirm ? (
                  <span className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm" data-fin-confirm="1">
                    Close {ready.length} payment{ready.length === 1 ? '' : 's'} as not paid?
                    <button type="button" onClick={() => void closeAll()} data-fin-confirm-yes="1"
                      className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white hover:bg-red-700">Yes, close {ready.length}</button>
                    <button type="button" onClick={() => setConfirm(false)} className="rounded-lg px-2.5 py-1 font-semibold text-gray-700 hover:bg-gray-200">Cancel</button>
                  </span>
                ) : null}
              </div>
              {bulk ? <p className="mt-2 text-xs font-semibold text-teal-700" data-fin-busy="1">{bulk}</p> : null}
              {msg._all ? <p className="mt-2 text-xs font-semibold text-emerald-700" data-fin-done="1">{msg._all}</p> : null}

              <div className="mt-3 space-y-2">
                {payments.map((p) => {
                  const a = answers[p.id];
                  const can = closable(p, a);
                  const paid = p.paid_at_campay || a === 'SUCCESSFUL';
                  return (
                    <div key={p.id} data-fin-row={p.id} className={'rounded-xl border p-3 ' + (paid ? 'border-red-300 bg-red-50' : 'border-gray-100')}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-bold text-gray-900">
                          {p.member || 'a member'}{p.phone_end ? <span className="font-normal text-gray-500"> (number ending {p.phone_end})</span> : null}
                        </span>
                        <span className="font-black text-gray-900">{xaf(p.total_charged ?? p.amount)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {[p.payment_type, p.plan_name, p.operator].filter(Boolean).join(' \u00b7 ') || 'payment'}
                        {' \u00b7 '}{(p.created_at || '').slice(0, 16).replace('T', ' ')} ({ago(hoursOf(p))})
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 break-all">
                        {p.reference ? 'CamPay ref ' + p.reference : 'no CamPay reference'}
                        {p.external_ref ? ' \u00b7 Bambeh ref ' + p.external_ref : ''}
                        {' \u00b7 status '}{p.status || '-'}{p.payment_status ? ' / ' + p.payment_status : ''}
                      </p>
                      {p.reason ? <p className="text-xs text-red-700 mt-1">{p.reason}</p> : null}
                      {paid ? (
                        <p className="text-xs font-semibold text-red-800 mt-2" data-fin-paid="1">
                          CamPay recorded this payment as PAID: the money reached Bambeh&apos;s CamPay account, but the order was never
                          finished. Do not close it - send Claude the reference above.
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {a ? <span data-fin-answer={a} className={'rounded-full px-2 py-0.5 text-[11px] font-bold ' + ANSWER_TONE[a]}>{ANSWER_TEXT[a]}</span> : null}
                        {!p.paid_at_campay ? (
                          <button type="button" onClick={() => void ask(p)} disabled={!!asking[p.id] || !!bulk} data-fin-ask={p.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-teal-600 px-2 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50 disabled:opacity-50">
                            {asking[p.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} Ask CamPay
                          </button>
                        ) : null}
                        {can ? (
                          <button type="button" onClick={() => void closeOne(p)} disabled={!!bulk} data-fin-close={p.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-2 py-1 text-xs font-bold text-white hover:bg-black disabled:opacity-50">
                            <XCircle className="w-3 h-3" /> Close as not paid
                          </button>
                        ) : a && !paid && hoursOf(p) < 24 && a !== 'FAILED' ? (
                          <span className="text-[11px] text-gray-500">Closes after 24 hours without a FAILED answer.</span>
                        ) : null}
                      </div>
                      {msg[p.id] ? <p className="text-xs text-red-700 mt-1" data-fin-msg="1">{msg[p.id]}</p> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {payouts.length > 0 ? (
            <div className="mt-5" data-fin-payouts={payouts.length}>
              <p className="text-sm font-bold text-gray-900">
                {payouts.length === 1 ? '1 payout' : payouts.length + ' payouts'} Bambeh still owes
              </p>
              <p className="text-xs text-gray-600 mt-1">They leave this list when the payout is recorded as paid.</p>
              <div className="mt-2 space-y-2">
                {payouts.map((o) => (
                  <div key={o.source + o.id} data-fin-payout={o.id} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-bold text-gray-900">
                        {o.source === 'event_payouts' ? 'Event payout' : 'Seller payout'} - {o.member || 'a member'}
                      </span>
                      <span className="font-black text-gray-900">{xaf(o.amount)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      status {o.status || '-'}{o.created_at ? ' \u00b7 ' + o.created_at.slice(0, 16).replace('T', ' ') : ''}
                    </p>
                    {o.reason ? <p className="text-xs text-amber-800 mt-1">{o.reason}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
// BAMBEH_END_TOKEN__FINANCE_WAITING_FIX944__COMPLETE
