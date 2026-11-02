// BAMBEH_DEPLOY_TOKEN__USERPROTECTION_FIX971_CLEAN
/**
 * src/features/admin/UserProtectionSection.tsx - Bambeh Command Center > User Protection
 *
 * FIX971 - Package 17, Big 1 Nov 2026: "an escrow release happens only when an admin or the super admin approves it -
 * a moderator cannot release one alone". Replaces the old "Escrow Controls" box (type an id, Freeze / Release), which
 * never worked: it wrote states the database refuses.
 *
 * What staff see: every paid order whose money Bambeh holds (User Protection) until the buyer confirms receipt -
 * oldest first, with the item, the price, buyer and seller by name (never a number), any open claim, any pause and
 * any request to release.
 *   - Pause (every staff member, a reason is required): the seller is not paid - not even when the buyer confirms -
 *     until an admin or the super admin unpauses. The payments server checks it (FIX973).
 *   - Ask an admin to release (moderators): admins and the super admin are told in the app.
 *   - Approve and pay the seller (admins and the super admin): the payments server pays the seller
 *     (POST /release-escrow as staff); then the request is closed as approved with the name, date and time.
 *   - Refuse (admins and the super admin, a reason is required): the money stays held; the moderator is told.
 * An order with an open claim is decided in Refund claims, not here. Every step is kept (bambeh_staff_protection
 * "recent", 30 days) and in the staff record. The database decides who may do what (FIX970); these buttons only
 * follow it. Staff-facing: English only.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Lock, PauseCircle, PlayCircle, RefreshCw, Send, ShieldCheck, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { isMissingFunction } from '@/lib/memberCards';
import type { AdminRole } from './lib';
import { refreshAdminBadges } from './useBadgeCounts';

type Who = { by: string | null; at: string | null };
type Pause = Who & { reason: string | null };
type Ask = Who & { note: string | null; mine?: boolean };
type Row = {
  order_id: string;
  order_number: string | null;
  title: string | null;
  item_count: number | null;
  item_price_xaf: number | null;
  total_xaf: number | null;
  paid_at: string | null;
  days: number | null;
  delivery_status: string | null;
  buyer: string | null;
  seller: string | null;
  claim: string | null;
  pause: Pause | null;
  ask: Ask | null;
};
type Recent = { what: string; order_id: string; order_number: string | null; by: string | null; at: string | null; note: string | null; asked_by?: string | null };
type Data = {
  ok: boolean;
  reason?: string;
  rank?: number;
  can_pause?: boolean;
  can_unpause?: boolean;
  can_ask?: boolean;
  can_release?: boolean;
  can_refuse?: boolean;
  counts?: { held: number; paused: number; asks: number };
  rows?: Row[];
  recent?: Recent[];
};
type Act = '' | 'pause' | 'unpause' | 'ask' | 'release' | 'refuse';
type Filter = 'all' | 'paused' | 'asks' | 'claims';

const PROJECT_FALLBACK = 'https://rbjbdxefwzvgmioearie.supabase.co';

const REASONS: Record<string, string> = {
  staff_only: 'Only Bambeh staff can do this.',
  admins_only: 'Only an admin or the super admin can do this.',
  admins_unpause: 'Only an admin or the super admin can unpause an order.',
  need_reason: 'Write a short reason first (3 letters or more).',
  not_held: 'Bambeh no longer holds the money of this order (paid out, refunded or not paid). Press Refresh.',
  not_found: 'This order was not found. Press Refresh.',
  already_asked: 'An admin has already been asked about this order.',
  no_ask: 'There is no request waiting on this order. Press Refresh.',
  still_held: 'The seller has not been paid yet, so the request stays open.',
  bad_request: 'Something was missing. Press Refresh and try again.',
};

function paymentsUrl(): string {
  const raw = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const base = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(raw) ? raw : PROJECT_FALLBACK;
  return base + '/functions/v1/payments';
}

/** The payments server pays the seller, as the signed-in admin. Never throws. */
async function releaseNow(orderId: string, note: string): Promise<{ ok: boolean; message: string }> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;
    if (!token) return { ok: false, message: 'Your session ended. Sign in again.' };
    const res = await fetch(paymentsUrl() + '/release-escrow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        apikey: String(import.meta.env.VITE_SUPABASE_ANON_KEY || ''),
      },
      body: JSON.stringify({ orderId, note: note || undefined }),
    });
    const raw = await res.text();
    let j: { success?: boolean; error?: string; data?: { message?: string } } = {};
    try { j = raw ? JSON.parse(raw) : {}; } catch { /* not JSON */ }
    if (!res.ok || j.success === false) return { ok: false, message: j.error || raw.slice(0, 200) || 'HTTP ' + res.status };
    return { ok: true, message: j.data?.message || 'The seller is being paid.' };
  } catch (e) {
    return { ok: false, message: 'Could not reach Bambeh: ' + (e instanceof Error ? e.message : String(e)) };
  }
}

function xaf(n: number | null | undefined): string {
  return Math.round(Number(n || 0)).toLocaleString('en-US') + ' XAF';
}
function when(v: string | null | undefined): string {
  const d = new Date(String(v || ''));
  return isNaN(d.getTime()) ? '-' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function ago(days: number | null | undefined): string {
  const n = Number(days || 0);
  return n <= 0 ? 'today' : n === 1 ? '1 day ago' : n + ' days ago';
}
function reasonText(r: { reason?: string } | null | undefined, fallback: string): string {
  const k = String(r?.reason || '');
  return REASONS[k] || (k ? 'Not done: ' + k : fallback);
}

export default function UserProtectionSection({ role, flash }: { role: AdminRole; flash: (m: string) => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<{ id: string; act: Act }>({ id: '', act: '' });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ good: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await supabase.rpc('bambeh_staff_protection', { p_limit: 150 });
      if (r.error) {
        setErr(isMissingFunction(r.error)
          ? 'User Protection is not installed in the database yet: run FIX970 in Supabase (SQL Editor), then press Refresh.'
          : 'Could not load User Protection: ' + String(r.error.message || ''));
      } else {
        const d = (r.data || { ok: false }) as Data;
        if (!d.ok) setErr(reasonText(d, 'Could not load User Protection.'));
        else { setData(d); setErr(null); }
      }
    } catch {
      setErr('Could not load User Protection - check the connection and press Refresh.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const start = (id: string, act: Act) => { setOpen({ id, act }); setNote(''); setMsg(null); };
  const done = async (good: boolean, text: string) => {
    setMsg({ good, text });
    flash(text);
    setOpen({ id: '', act: '' });
    setNote('');
    refreshAdminBadges();
    await load();
  };

  const rpc = async (fn: string, args: Record<string, unknown>): Promise<{ ok: boolean; reason?: string; changed?: boolean } | null> => {
    const r = await supabase.rpc(fn, args);
    if (r.error) return { ok: false, reason: isMissingFunction(r.error) ? 'not installed - run FIX970' : String(r.error.message || 'error') };
    return (r.data || null) as { ok: boolean; reason?: string; changed?: boolean } | null;
  };

  const run = async (row: Row, act: Act) => {
    const label = row.order_number || row.order_id.slice(0, 8);
    const text = note.trim();
    setBusy(row.order_id);
    try {
      if (act === 'pause') {
        const r = await rpc('bambeh_staff_order_pause', { p_order: row.order_id, p_on: true, p_note: text });
        if (r && r.ok) await done(true, 'Order ' + label + ' paused. The seller is not paid until an admin unpauses it.');
        else setMsg({ good: false, text: reasonText(r, 'Not paused.') });
      } else if (act === 'unpause') {
        const r = await rpc('bambeh_staff_order_pause', { p_order: row.order_id, p_on: false, p_note: text || null });
        if (r && r.ok) await done(true, 'Order ' + label + ' unpaused.');
        else setMsg({ good: false, text: reasonText(r, 'Not unpaused.') });
      } else if (act === 'ask') {
        const r = await rpc('bambeh_staff_release_ask', { p_order: row.order_id, p_note: text });
        if (r && r.ok) await done(true, 'Asked. The admins and the super admin are told in the app.');
        else setMsg({ good: false, text: reasonText(r, 'Not asked.') });
      } else if (act === 'refuse') {
        const r = await rpc('bambeh_staff_release_refuse', { p_order: row.order_id, p_note: text });
        if (r && r.ok) await done(true, 'Refused. The money stays held; the moderator is told.');
        else setMsg({ good: false, text: reasonText(r, 'Not refused.') });
      } else if (act === 'release') {
        if (row.pause) {
          const u = await rpc('bambeh_staff_order_pause', { p_order: row.order_id, p_on: false, p_note: text || 'Unpaused to pay the seller' });
          if (!u || !u.ok) { setMsg({ good: false, text: reasonText(u, 'Could not unpause first, so nothing was paid.') }); return; }
        }
        const pay = await releaseNow(row.order_id, text);
        if (!pay.ok) { setMsg({ good: false, text: 'Not paid: ' + pay.message }); await load(); return; }
        const r = await rpc('bambeh_staff_release_done', { p_order: row.order_id, p_note: text || null });
        await done(true, 'Order ' + label + ': ' + pay.message + (r && r.ok ? '' : ' (The request could not be closed: ' + reasonText(r, '?') + ')'));
      }
    } finally {
      setBusy('');
    }
  };

  const rows = (data?.rows || []).filter((r) =>
    filter === 'all' ? true : filter === 'paused' ? !!r.pause : filter === 'asks' ? !!r.ask : r.claim === 'requested');
  const counts = data?.counts || { held: 0, paused: 0, asks: 0 };
  const claims = (data?.rows || []).filter((r) => r.claim === 'requested').length;
  const admin = !!data?.can_release;

  const chip = (k: Filter, label: string) => (
    <button key={k} type="button" onClick={() => setFilter(k)} data-filter={k}
      className={'px-3 py-1.5 rounded-full text-xs font-semibold ' + (filter === k ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600')}>
      {label}
    </button>
  );

  return (
    <div data-fix="FIX971" data-role={role}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-teal-600" /> User Protection</h1>
          <p className="text-sm text-gray-500 mt-0.5">Paid orders whose money Bambeh holds until the buyer confirms the item arrived. Oldest first.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading}
          className="shrink-0 text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 disabled:opacity-50">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Refresh
        </button>
      </div>

      <div className="mt-3 mb-4 bg-teal-50 border border-teal-200 rounded-2xl p-3 text-sm text-teal-900 leading-relaxed" data-role-note={admin ? 'admin' : 'moderator'}>
        {admin
          ? 'Pause an order when something looks wrong: the seller is not paid, even if the buyer confirms, until it is unpaused. Moderators ask you to release (pay the seller): approve or refuse. Every step keeps the name, date and time.'
          : 'Pause an order when something looks wrong: the seller is not paid, even if the buyer confirms. To pay a seller, ask an admin: only an admin or the super admin unpauses and releases. Every step keeps your name, date and time.'}
      </div>

      {err ? (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-4" role="alert">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{err}</span>
        </div>
      ) : null}
      {msg ? (
        <div className={'flex items-start gap-2 text-sm rounded-xl p-3 mb-4 border ' + (msg.good ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-amber-900 bg-amber-50 border-amber-200')} role="status" data-msg={msg.good ? 'ok' : 'no'}>
          {msg.good ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}<span>{msg.text}</span>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3"><p className="text-2xl font-black text-gray-900" data-count="held">{counts.held}</p><p className="text-xs text-gray-500">money held</p></div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3"><p className="text-2xl font-black text-amber-700" data-count="paused">{counts.paused}</p><p className="text-xs text-gray-500">paused</p></div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3"><p className="text-2xl font-black text-teal-700" data-count="asks">{counts.asks}</p><p className="text-xs text-gray-500">asks to release</p></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {chip('all', 'All ' + counts.held)}{chip('paused', 'Paused ' + counts.paused)}{chip('asks', 'Asks ' + counts.asks)}{chip('claims', 'Claims open ' + claims)}
          </div>

          {rows.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8" data-empty="1">{counts.held === 0 ? 'No money is held right now.' : 'Nothing here with this filter.'}</p>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => {
                const label = r.order_number || r.order_id.slice(0, 8);
                const mine = open.id === r.order_id ? open.act : '';
                const claimOpen = r.claim === 'requested';
                const working = busy === r.order_id;
                const needNote = mine === 'pause' || mine === 'ask' || mine === 'refuse';
                return (
                  <div key={r.order_id} className={'bg-white rounded-xl border p-3 ' + (r.pause ? 'border-amber-300' : 'border-gray-100')} data-order={label}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {label} - {r.title || '(item)'}{r.item_count && r.item_count > 1 ? ' +' + (r.item_count - 1) + ' more' : ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(r.buyer || 'a member') + ' bought from ' + (r.seller || 'a member')} - paid {ago(r.days)} ({when(r.paid_at)})
                          {r.delivery_status ? ' - delivery: ' + r.delivery_status : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-gray-900">{xaf(r.item_price_xaf)}</p>
                        <p className="text-[11px] text-gray-400">to the seller</p>
                      </div>
                    </div>

                    {r.pause ? (
                      <p className="mt-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5" data-paused="1">
                        <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span><b>Paused</b> by {r.pause.by || 'staff'} ({when(r.pause.at)}): {r.pause.reason}. The seller is not paid until an admin unpauses.</span>
                      </p>
                    ) : null}
                    {claimOpen ? (
                      <p className="mt-2 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5" data-claim="1">
                        <b>Claim open</b>: the buyer reported a problem. It is decided in Refund claims (refund the buyer, or close the claim and pay the seller).
                      </p>
                    ) : null}
                    {r.ask ? (
                      <p className="mt-2 text-xs text-teal-900 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1.5" data-ask="1">
                        <b>{r.ask.mine ? 'You asked' : (r.ask.by || 'A moderator') + ' asks'}</b> to pay the seller ({when(r.ask.at)}): {r.ask.note}
                        {r.ask.mine && !admin ? ' - waiting for an admin.' : ''}
                      </p>
                    ) : null}

                    {mine ? (
                      <div className="mt-2 border-t border-gray-100 pt-2" data-open={mine}>
                        {mine === 'release' ? (
                          <p className="text-xs text-gray-700 mb-2">
                            <b>{r.seller || 'The seller'}</b> receives {xaf(r.item_price_xaf)} now by Mobile Money (CamPay). This cannot be undone.
                            {r.pause ? ' The pause is lifted first.' : ''}
                          </p>
                        ) : null}
                        <input value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} maxLength={300}
                          placeholder={mine === 'pause' ? 'Why pause it? (kept with your name)' : mine === 'ask' ? 'Why should the seller be paid now?' : mine === 'refuse' ? 'Why not? (the moderator sees this)' : 'A note (optional)'}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-400 mb-2" data-note="1" />
                        <div className="flex flex-wrap gap-2">
                          <button type="button" disabled={working || (needNote && note.trim().length < 3)} onClick={() => void run(r, mine)} data-confirm={mine}
                            className={'px-3 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 disabled:opacity-50 ' + (mine === 'refuse' ? 'bg-red-600' : mine === 'pause' ? 'bg-amber-600' : 'bg-teal-600')}>
                            {working ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {mine === 'pause' ? 'Pause this order' : mine === 'unpause' ? 'Unpause' : mine === 'ask' ? 'Ask an admin' : mine === 'refuse' ? 'Refuse' : (r.pause ? 'Unpause and pay the seller' : 'Pay the seller')}
                          </button>
                          <button type="button" disabled={working} onClick={() => start('', '')} className="px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {!r.pause && data.can_pause ? (
                          <button type="button" onClick={() => start(r.order_id, 'pause')} data-act="pause"
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"><PauseCircle className="w-3.5 h-3.5" /> Pause</button>
                        ) : null}
                        {r.pause && data.can_unpause ? (
                          <button type="button" onClick={() => start(r.order_id, 'unpause')} data-act="unpause"
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> Unpause</button>
                        ) : null}
                        {!admin && data.can_ask && !r.ask && !claimOpen ? (
                          <button type="button" onClick={() => start(r.order_id, 'ask')} data-act="ask"
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Ask an admin to release</button>
                        ) : null}
                        {admin && !claimOpen ? (
                          <button type="button" onClick={() => start(r.order_id, 'release')} data-act="release"
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-600 text-white flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {r.ask ? 'Approve and pay the seller' : 'Pay the seller'}</button>
                        ) : null}
                        {admin && data.can_refuse && r.ask ? (
                          <button type="button" onClick={() => start(r.order_id, 'refuse')} data-act="refuse"
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Refuse</button>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6">
            <h2 className="font-bold text-gray-900 mb-2 text-sm">Done in the last 30 days</h2>
            {(data.recent || []).length === 0 ? (
              <p className="text-xs text-gray-400" data-recent-empty="1">Nothing yet.</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
                {(data.recent || []).map((x, i) => (
                  <p key={i} className="text-xs text-gray-700 px-3 py-2" data-recent={x.what}>
                    <b>{when(x.at)}</b> - {x.order_number || x.order_id.slice(0, 8)}: {x.what === 'approved' ? 'paid out, approved by' : x.what === 'refused' ? 'release refused by' : x.what === 'paused' ? 'paused by' : 'unpaused by'} {x.by || 'staff'}
                    {x.asked_by ? ' (asked by ' + x.asked_by + ')' : ''}{x.note ? ' - ' + x.note : ''}
                  </p>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__USERPROTECTION_FIX971__COMPLETE
