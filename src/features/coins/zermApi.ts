// BAMBEH_DEPLOY_TOKEN__ZERMAPI_FIX847_CLEAN
// FILE LOCATION: src/features/coins/zermApi.ts
//
// FIX847 - the app's door to the Zerm coin functions of FIX845. Every call goes through a database function; the
// phone never writes a coin itself (FIX845 refuses it). If FIX845 has not been run yet, the answers say 'not_ready'
// and the pages fall back to "earned, never bought" - never to a broken screen.
// (c) 2026 BAMBEH SARL. All rights reserved.

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface ZermPackage { coins: number; price: number }
export interface ZermState {
  earning: boolean; buying: boolean; sending: boolean; packages: ZermPackage[];
  send_min: number; send_daily_max: number; sent_today: number; signed_in: boolean;
}
export type ZermFail = { ok: false; reason: string; [k: string]: unknown };
export type ZermRes<T> = ({ ok: true } & T) | ZermFail;

/** The switches as they are when nothing can be read: earned only. */
export const ZERM_OFF: ZermState = {
  earning: true, buying: false, sending: false, packages: [], send_min: 0.01, send_daily_max: 5, sent_today: 0, signed_in: false,
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

export async function getZermState(): Promise<{ state: ZermState; ready: boolean }> {
  try {
    const { data, error } = await supabase.rpc('bambeh_zerm_state');
    if (error || !data || typeof data !== 'object') return { state: ZERM_OFF, ready: false };
    const d = data as Partial<ZermState>;
    return {
      ready: true,
      state: {
        earning: d.earning !== false,
        buying: d.buying === true,
        sending: d.sending === true,
        packages: Array.isArray(d.packages)
          ? d.packages.map((p) => ({ coins: Number((p as ZermPackage).coins) || 0, price: Number((p as ZermPackage).price) || 0 }))
              .filter((p) => p.coins > 0 && p.price > 0)
          : [],
        send_min: Number(d.send_min) || 0.01,
        send_daily_max: Number(d.send_daily_max) || 5,
        sent_today: Number(d.sent_today) || 0,
        signed_in: d.signed_in === true,
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

// ------------------------------------------------------------------ Command Center (staff)
export interface ZermOverview {
  can_change: boolean; buying: boolean; sending: boolean; packages: ZermPackage[];
  send_min: number; send_daily_max: number; updated_by_name: string | null; updated_at: string | null;
  wallets: number; coins_total: number; earned_7d: number; used_7d: number;
  orders_paid: number; orders_paid_xaf: number; orders_waiting: number; orders_problem: number;
  sent_7d: number; sent_7d_coins: number;
  log: Array<{ what: string; detail: string | null; by: string | null; at: string }>;
}

export function adminOverview() { return call<ZermOverview>('bambeh_admin_zerm_overview'); }

export function adminSwitch(what: 'buying' | 'sending', on: boolean, confirm: string, note: string) {
  return call<object>('bambeh_admin_zerm_switch', { p_what: what, p_on: on, p_confirm: confirm || null, p_note: note || null });
}

export function adminRules(packages: ZermPackage[], sendMin: number, sendDailyMax: number) {
  return call<{ packages: ZermPackage[] }>('bambeh_admin_zerm_rules', { p_packages: packages, p_send_min: sendMin, p_send_daily_max: sendDailyMax });
}
// BAMBEH_END_TOKEN__ZERMAPI_FIX847__COMPLETE
