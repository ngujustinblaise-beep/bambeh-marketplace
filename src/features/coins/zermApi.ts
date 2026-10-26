// BAMBEH_DEPLOY_TOKEN__ZERMAPI_FIX870_CLEAN
// FILE LOCATION: src/features/coins/zermApi.ts
//
// FIX870 (replaces FIX847, which stays as it was below the new parts) - the app's door to the Zerm coin functions of
// FIX845 and FIX859. Every call goes through a database function; the phone never writes a coin itself (FIX845
// refuses it). If a file has not been run yet, the answers say 'not_ready' and the pages fall back to "earned, never
// bought" - never to a broken screen.
// FIX870 adds "Turn coins into money" (FIX859, OFF until an admin or the super admin switches it on, typing COBAC):
//   - a member asks (cashoutStart: the coins are set aside at once), sees their requests, cancels one still waiting;
//   - staff list the requests; admins refuse one (with a reason - the coins go back) or PAY it. Paying goes through
//     the payments server (POST /zerm-cashout, FIX862): it sends the money with CamPay and marks the request paid,
//     or failed with the coins back. A request stuck at "being sent" is settled by hand after 15 minutes.
// (c) 2026 BAMBEH SARL. All rights reserved.

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface ZermPackage { coins: number; price: number }
export interface ZermState {
  earning: boolean; buying: boolean; sending: boolean; packages: ZermPackage[];
  send_min: number; send_daily_max: number; sent_today: number; signed_in: boolean;
  cashout: boolean; cashout_rate: number; cashout_min: number; cashout_day_max: number; cashout_today: number; cashout_open: boolean;
}
export type ZermFail = { ok: false; reason: string; [k: string]: unknown };
export type ZermRes<T> = ({ ok: true } & T) | ZermFail;

/** The switches as they are when nothing can be read: earned only. */
export const ZERM_OFF: ZermState = {
  earning: true, buying: false, sending: false, packages: [], send_min: 0.01, send_daily_max: 5, sent_today: 0, signed_in: false,
  cashout: false, cashout_rate: 250, cashout_min: 1, cashout_day_max: 4, cashout_today: 0, cashout_open: false,
};

function notReady(msg: string): boolean {
  return /does not exist|could not find the function|schema cache|PGRST202/i.test(msg || '');
}

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<ZermRes<T>> {
  try {
    const { data, error } = await supabase.rpc(fn, args || {});
    if (error) {
      const m = String((error as { message?: string }).message || '');
      return { ok: false, reason: notReady(m) ? 'not_ready' : 'network', detail: m };
    }
    if (data && typeof data === 'object' && 'ok' in (data as Record<string, unknown>)) return data as ZermRes<T>;
    return { ok: false, reason: 'network' };
  } catch (e) {
    return { ok: false, reason: 'network', detail: e instanceof Error ? e.message : String(e) };
  }
}

function n(v: unknown, dflt: number): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : dflt;
}

export async function getZermState(): Promise<{ state: ZermState; ready: boolean }> {
  try {
    const { data, error } = await supabase.rpc('bambeh_zerm_state');
    if (error || !data || typeof data !== 'object') return { state: ZERM_OFF, ready: false };
    const d = data as Partial<Record<keyof ZermState, unknown>>;
    return {
      ready: true,
      state: {
        earning: d.earning !== false,
        buying: d.buying === true,
        sending: d.sending === true,
        packages: Array.isArray(d.packages)
          ? (d.packages as ZermPackage[]).map((p) => ({ coins: Number(p.coins) || 0, price: Number(p.price) || 0 }))
              .filter((p) => p.coins > 0 && p.price > 0)
          : [],
        send_min: Number(d.send_min) || 0.01,
        send_daily_max: Number(d.send_daily_max) || 5,
        sent_today: Number(d.sent_today) || 0,
        signed_in: d.signed_in === true,
        cashout: d.cashout === true,
        cashout_rate: n(d.cashout_rate, 250),
        cashout_min: n(d.cashout_min, 1),
        cashout_day_max: n(d.cashout_day_max, 4),
        cashout_today: n(d.cashout_today, 0),
        cashout_open: d.cashout_open === true,
      },
    };
  } catch {
    return { state: ZERM_OFF, ready: false };
  }
}

/** Reads the switches once; refresh() reads them again. */
export function useZermState() {
  const [state, setState] = useState<ZermState>(ZERM_OFF);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await getZermState();
    setState(r.state);
    setReady(r.ready);
    setLoading(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return { state, loading, ready, refresh };
}

export function buyStart(coins: number) {
  return call<{ order_id: string; external_ref: string; coins: number; amount: number; description: string }>(
    'bambeh_zerm_buy_start', { p_coins: coins });
}

export function orderStatus(orderId: string) {
  return call<{ status: 'pending' | 'paid' | 'failed' | 'underpaid'; coins: number; amount: number; paid_at: string | null; balance: number | null }>(
    'bambeh_zerm_order_status', { p_order: orderId });
}

export function findMember(to: string) {
  return call<{ name: string }>('bambeh_zerm_find', { p_to: to });
}

export function sendCoins(to: string, amount: number, note: string) {
  return call<{ name: string; amount: number; balance: number }>('bambeh_zerm_send', { p_to: to, p_amount: amount, p_note: note || null });
}

/** The member's own balance (row security: a member reads their own wallet). */
export async function myBalance(): Promise<number | null> {
  try {
    const { data: s } = await supabase.auth.getSession();
    const uid = s?.session?.user?.id;
    if (!uid) return null;
    const { data } = await supabase.from('zerm_coins').select('balance').eq('user_id', uid).maybeSingle();
    return data ? Number((data as { balance?: unknown }).balance) || 0 : 0;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ coins to money: the member (FIX859)
export type CashoutStatus = 'waiting' | 'paying' | 'paid' | 'failed' | 'refused' | 'cancelled';
export interface CashoutRequest {
  id: string; coins: number; amount_xaf: number; status: CashoutStatus; created_at: string;
  decided_at: string | null; paid_at: string | null; note: string | null; phone: string | null;
}
export interface CashoutMine {
  signed_in: boolean; cashout: boolean; rate: number; min: number; day_max: number; today: number; balance: number;
  /** the member's own 9-digit number to fill in (their last request's, else their payout number) */
  phone: string | null; open: boolean; requests: CashoutRequest[];
}

export async function cashoutMine(): Promise<ZermRes<CashoutMine>> {
  const r = await call<Record<string, unknown>>('bambeh_zerm_cashout_my');
  if (!r.ok) return r;
  const d = r as unknown as Record<string, unknown>;
  const list = Array.isArray(d.requests) ? (d.requests as Record<string, unknown>[]) : [];
  return {
    ok: true,
    signed_in: d.signed_in === true,
    cashout: d.cashout === true,
    rate: n(d.rate, 250), min: n(d.min, 1), day_max: n(d.day_max, 4), today: n(d.today, 0), balance: n(d.balance, 0),
    phone: typeof d.phone === 'string' && d.phone ? d.phone : null,
    open: d.open === true,
    requests: list.map((x) => ({
      id: String(x.id ?? ''), coins: n(x.coins, 0), amount_xaf: n(x.amount_xaf, 0), status: String(x.status ?? 'waiting') as CashoutStatus,
      created_at: String(x.created_at ?? ''), decided_at: (x.decided_at as string) || null, paid_at: (x.paid_at as string) || null,
      note: (x.note as string) || null, phone: (x.phone as string) || null,
    })),
  };
}

export function cashoutStart(coins: number, phone: string) {
  return call<{ id: string; coins: number; amount_xaf: number; balance: number }>('bambeh_zerm_cashout_start', { p_coins: coins, p_phone: phone });
}

export function cashoutCancel(id: string) {
  return call<{ balance: number }>('bambeh_zerm_cashout_cancel', { p_id: id });
}

/** What a request of `coins` brings at `rate`: whole francs, rounded down (as the database does). */
export function cashoutAmount(coins: number, rate: number): number {
  const c = Math.round(Number(coins) * 10000) / 10000;
  const r = Number(rate);
  if (!(c > 0) || !(r > 0)) return 0;
  return Math.floor(Math.round(c * r * 10000) / 10000);
}

// ------------------------------------------------------------------ Command Center (staff)
export interface ZermOverview {
  can_change: boolean; buying: boolean; sending: boolean; packages: ZermPackage[];
  send_min: number; send_daily_max: number; updated_by_name: string | null; updated_at: string | null;
  wallets: number; coins_total: number; earned_7d: number; used_7d: number;
  orders_paid: number; orders_paid_xaf: number; orders_waiting: number; orders_problem: number;
  sent_7d: number; sent_7d_coins: number;
  cashout: boolean; cashout_rate: number; cashout_min: number; cashout_day_max: number;
  cashout_waiting: number; cashout_paying: number; cashout_paid_7d: number; cashout_paid_7d_xaf: number; cashout_paid_xaf: number;
  log: Array<{ what: string; detail: string | null; by: string | null; at: string }>;
}

export function adminOverview() { return call<ZermOverview>('bambeh_admin_zerm_overview'); }

export function adminSwitch(what: 'buying' | 'sending' | 'cashout', on: boolean, confirm: string, note: string) {
  return call<object>('bambeh_admin_zerm_switch', { p_what: what, p_on: on, p_confirm: confirm || null, p_note: note || null });
}

export function adminRules(packages: ZermPackage[], sendMin: number, sendDailyMax: number) {
  return call<{ packages: ZermPackage[] }>('bambeh_admin_zerm_rules', { p_packages: packages, p_send_min: sendMin, p_send_daily_max: sendDailyMax });
}

export function adminCashoutRules(rate: number, min: number, dayMax: number) {
  return call<object>('bambeh_admin_zerm_cashout_rules', { p_rate: rate, p_min: min, p_day_max: dayMax });
}

export interface CashoutRow {
  id: string; member: string; mine: boolean; coins: number; rate: number; amount_xaf: number; gross_xaf: number;
  phone: string | null; status: CashoutStatus; created_at: string; decided_by_name: string | null; decided_at: string | null;
  paying_since: string | null; paid_at: string | null; note: string | null; failure: string | null; campay_ref: string | null;
  balance: number | null; earned_30d: number; paid_before: number;
}
export type CashoutView = 'waiting' | 'paying' | 'paid' | 'failed' | 'refused' | 'cancelled' | 'all';

export function adminCashouts(view: CashoutView) {
  return call<{ can_decide: boolean; rows: CashoutRow[]; counts: Partial<Record<CashoutStatus, number>> }>(
    'bambeh_admin_zerm_cashouts', { p_state: view });
}

export function adminCashoutRefuse(id: string, note: string) {
  return call<object>('bambeh_admin_zerm_cashout_refuse', { p_id: id, p_note: note || null });
}

/** A request stuck at "being sent" (15 minutes or more): staff say whether the money arrived (checked in CamPay). */
export function adminCashoutSettle(id: string, paid: boolean, note: string) {
  return call<object>('bambeh_admin_zerm_cashout_settle', { p_id: id, p_paid: paid, p_note: note || null });
}

const PROJECT_FALLBACK = 'https://rbjbdxefwzvgmioearie.supabase.co';

/** The payments server (same project as the app); never an arbitrary address. */
function paymentsBase(): string {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  for (const c of [env.VITE_SUPABASE_URL, PROJECT_FALLBACK]) {
    if (!c) continue;
    const clean = c.replace(/\/+$/, '');
    if (/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(clean)) return clean + '/functions/v1/payments';
  }
  return PROJECT_FALLBACK + '/functions/v1/payments';
}

export interface PayAnswer { ok: boolean; status: string; message: string }

/** PAY: the payments server sends the money with CamPay (admins and the super admin only). Never throws. */
export async function adminCashoutPay(id: string): Promise<PayAnswer> {
  try {
    const { data: s } = await supabase.auth.getSession();
    const token = s?.session?.access_token;
    if (!token) return { ok: false, status: '', message: 'Your session expired. Sign in again.' };
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
    const res = await fetch(paymentsBase() + '/zerm-cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: String(env.VITE_SUPABASE_ANON_KEY || '') },
      body: JSON.stringify({ id }),
    });
    const raw = await res.text();
    let j: { success?: boolean; error?: string; data?: { status?: string; message?: string } } = {};
    try { j = raw ? JSON.parse(raw) : {}; } catch { /* not JSON */ }
    if (!res.ok || j.success === false) {
      return { ok: false, status: '', message: j.error || raw.slice(0, 200) || 'HTTP ' + res.status };
    }
    const st = String((j.data && j.data.status) || '');
    return { ok: st === 'paid', status: st, message: String((j.data && j.data.message) || 'Done.') };
  } catch (e) {
    return { ok: false, status: '', message: 'Could not reach Bambeh: ' + (e instanceof Error ? e.message : String(e)) };
  }
}
// BAMBEH_END_TOKEN__ZERMAPI_FIX870__COMPLETE
