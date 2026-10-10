// BAMBEH_DEPLOY_TOKEN__ADMIN_FOOD_GAS_FIX693_CLEAN
/**
 * AdminFoodGas.tsx - FIX693 - Command Center > Gas & food
 *
 * Every gas seller, restaurant, grill & soya spot and roasted-fish seller is checked by
 * Bambeh staff before buyers can see it (FIX687):
 *   Waiting                - new businesses: Approve, or Reject with a reason
 *   Changed after approval - the owner changed the name, photos or words: Looks fine, or Hide
 *   Live                   - Hide with a reason (a complaint, a closed shop)
 *   Rejected / hidden      - Approve to put it back
 *   Featured payments      - every 50 / 300 / 1,000 XAF payment, the agent credited for it,
 *                            this month's totals; admins can switch on a paid feature by
 *                            hand when mobile money was late (with a note)
 * Moderators, admins and the super admin approve; every decision keeps the staff
 * member's name and the time, and the owner (and the agent) get a notification.
 * English, like the rest of the Command Center.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { Check, EyeOff, Loader2, RefreshCw, ShieldCheck, Star, X } from 'lucide-react';
import { foodRpc } from '@/features/foodgas/foodGasApi';
import type { FoodItem, FoodPreviewItem, PlaceStatus } from '@/features/foodgas/foodGasApi';
import { cityLabel, daysText, fmtXaf, kindLabel } from '@/features/foodgas/foodGasText';
import type { FoodKind } from '@/features/foodgas/foodGasText';

type View = 'pending' | 'changed' | 'live' | 'closed' | 'payments';

interface AdminPlace {
  id: string;
  name: string;
  kinds: FoodKind[];
  city: string;
  area_label: string;
  photos: string[];
  description: string;
  landmark: string;
  key_price_xaf: number | null;
  key_price_label: string;
  open_days: number[];
  opens_at: string | null;
  closes_at: string | null;
  takes_bookings: boolean;
  delivers: boolean;
  status: PlaceStatus;
  hidden_by: 'owner' | 'staff' | null;
  needs_review: boolean;
  review_note: string | null;
  reviewed_at: string | null;
  reviewed_by_name: string | null;
  approved_at: string | null;
  featured_until: string | null;
  owner_name: string | null;
  added_by_name: string | null;
  agent_name: string | null;
  created_at: string;
  updated_at: string;
  items: FoodItem[];
  preview: FoodPreviewItem[];
  history: Array<{ action: string; note: string | null; at: string; by: string | null }>;
}

interface QueueRes {
  rank: number;
  can_grant: boolean;
  view: string;
  counts: { pending: number; changed: number; live: number; closed: number };
  rows: AdminPlace[];
}

interface FeatureRow {
  id: string;
  place_name: string;
  area_label: string;
  city: string;
  plan: 'day' | 'week' | 'month';
  days: number;
  amount_xaf: number;
  paid_xaf: number | null;
  status: string;
  external_ref: string;
  created_at: string;
  paid_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  buyer_name: string | null;
  agent_name: string | null;
  granted_by_name: string | null;
  grant_note: string | null;
}

interface FeaturesRes {
  rank: number;
  can_grant: boolean;
  rows: FeatureRow[];
  agents_this_month: Array<{ agent_name: string | null; paid: number; xaf: number }>;
  this_month: { paid: number; granted: number; xaf: number };
}

const ACTION_WORD: Record<string, string> = { approve: 'Approved', reject: 'Rejected', hide: 'Hidden', checked: 'Checked the changes' };

function when(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleString('en-GB', { timeZone: 'Africa/Douala', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function why(reason: string, detail?: string): string {
  if (reason === 'not_installed') return 'Gas & food is not installed in the database yet: run FIX687 in Supabase (SQL Editor).';
  if (reason === 'not_staff') return 'Only Bambeh staff can open this screen.';
  if (reason === 'admins_only') return 'Only admins and the super admin can switch a feature on by hand.';
  if (reason === 'reason_required') return 'Write a reason (at least 3 letters) - the owner sees it.';
  if (reason === 'already_on') return 'This feature is already switched on.';
  if (reason === 'network') return 'No connection - check the internet and press Refresh.';
  return 'Could not do it (' + reason + (detail ? ': ' + detail : '') + ').';
}

function PlaceCard({ p, view, onDone }: { p: AdminPlace; view: View; onDone: (msg: string) => void }) {
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const act = async (action: 'approve' | 'reject' | 'hide' | 'checked') => {
    let note: string | null = null;
    if (action === 'reject' || action === 'hide') {
      note = window.prompt(action === 'reject'
        ? 'Why is "' + p.name + '" not approved? The owner sees this reason.'
        : 'Why hide "' + p.name + '"? The owner sees this reason.', '');
      if (note === null) return;
    } else if (action === 'approve' && !window.confirm('Approve "' + p.name + '"? Buyers see it at once. Your name and the time are recorded.')) {
      return;
    }
    setBusy(action);
    setErr('');
    const r = await foodRpc<{ status: string; reviewed_by_name: string }>('bambeh_admin_food_review', { p_place: p.id, p_action: action, p_note: note });
    setBusy('');
    if (!r.ok) { setErr(why(r.reason, r.detail)); return; }
    onDone((ACTION_WORD[action] || action) + ': ' + p.name + ' - by ' + r.reviewed_by_name + '.');
  };
  const items = p.items || [];
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4" data-admin-place={p.id}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-extrabold text-slate-900">{p.name}</p>
          <p className="text-sm text-slate-600">
            {p.kinds.map((k) => kindLabel('en', k)).join(', ')} {'\u00b7'} {p.area_label}, {cityLabel(p.city, 'en')}
          </p>
          <p className="text-xs text-slate-500">
            Owner: <b>{p.owner_name || '-'}</b>
            {p.agent_name ? <> {'\u00b7'} Agent: <b>{p.agent_name}</b></> : null}
            {p.added_by_name && p.added_by_name !== p.owner_name ? <> {'\u00b7'} Typed by: {p.added_by_name}</> : null}
            {' \u00b7 '}Added {when(p.created_at)}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
          {p.status}{p.status === 'live' && p.needs_review ? ' - changed' : ''}{p.status === 'hidden' && p.hidden_by ? ' by ' + p.hidden_by : ''}
        </span>
      </div>

      {p.photos && p.photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {p.photos.map((u) => (
            <a key={u} href={u} target="_blank" rel="noreferrer" className="flex-shrink-0">
              <img src={u} alt={p.name} className="h-24 w-24 rounded-xl object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-3 grid gap-1 text-sm text-slate-700">
        {p.description && <p className="whitespace-pre-line">{p.description}</p>}
        {p.landmark && <p><b>How to find it:</b> {p.landmark}</p>}
        <p>
          <b>Hours:</b> {p.opens_at && p.closes_at ? daysText('en', p.open_days) + ' ' + p.opens_at + '-' + p.closes_at : 'not given'}
          {' \u00b7 '}<b>Bookings:</b> {p.takes_bookings ? 'yes' : 'no'}{' \u00b7 '}<b>Delivers:</b> {p.delivers ? 'yes' : 'no'}
        </p>
        {p.key_price_xaf !== null && <p><b>Main price:</b> {fmtXaf(p.key_price_xaf, 'en')} XAF {p.key_price_label ? '(' + p.key_price_label + ')' : ''}</p>}
        {items.length > 0 && (
          <p><b>Menu ({items.length}):</b> {items.slice(0, 8).map((i) => i.name + (i.price_xaf !== null ? ' ' + fmtXaf(i.price_xaf, 'en') : '')).join(' \u00b7 ')}{items.length > 8 ? ' ...' : ''}</p>
        )}
        {p.featured_until && new Date(p.featured_until).getTime() > Date.now() && <p className="font-semibold text-amber-700">Featured until {when(p.featured_until)}</p>}
      </div>

      {p.reviewed_at && (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Last decision: <b>{p.reviewed_by_name || '-'}</b>, {when(p.reviewed_at)}{p.review_note ? ' - "' + p.review_note + '"' : ''}
        </p>
      )}
      {p.history && p.history.length > 1 && (
        <details className="mt-1 text-xs text-slate-500">
          <summary className="cursor-pointer">History ({p.history.length})</summary>
          <ul className="mt-1 space-y-0.5">
            {p.history.map((h, i) => <li key={i}>{when(h.at)} - {ACTION_WORD[h.action] || h.action} by {h.by || '-'}{h.note ? ': ' + h.note : ''}</li>)}
          </ul>
        </details>
      )}

      {err && <p className="mt-2 text-sm font-semibold text-red-600">{err}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {(view === 'pending' || view === 'closed') && (
          <button type="button" disabled={!!busy} onClick={() => void act('approve')}
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60">
            {busy === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Approve
          </button>
        )}
        {view === 'pending' && (
          <button type="button" disabled={!!busy} onClick={() => void act('reject')}
            className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-60">
            <X className="h-4 w-4" />Reject
          </button>
        )}
        {view === 'changed' && (
          <button type="button" disabled={!!busy} onClick={() => void act('checked')}
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60">
            <ShieldCheck className="h-4 w-4" />Looks fine
          </button>
        )}
        {(view === 'changed' || view === 'live') && (
          <button type="button" disabled={!!busy} onClick={() => void act('hide')}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-60">
            <EyeOff className="h-4 w-4" />Hide
          </button>
        )}
      </div>
    </li>
  );
}

function Payments({ onMsg }: { onMsg: (m: string) => void }) {
  const [data, setData] = useState<FeaturesRes | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState('');
  const load = useCallback(async () => {
    const r = await foodRpc<FeaturesRes>('bambeh_admin_food_features', { p_limit: 150 });
    if (r.ok) { setData(r); setErr(''); } else setErr(why(r.reason, r.detail));
  }, []);
  useEffect(() => { void load(); }, [load]);
  const grant = async (o: FeatureRow) => {
    const note = window.prompt('Switch on "' + o.place_name + '" (' + o.days + ' days, ' + o.amount_xaf + ' XAF) by hand?\n'
      + 'Only when the money really arrived (CamPay dashboard reference, or cash to the agent with a receipt). Write how you checked:', '');
    if (note === null) return;
    setBusy(o.id);
    const r = await foodRpc<{ granted_by_name: string; ends_at: string }>('bambeh_admin_food_feature_grant', { p_order: o.id, p_note: note });
    setBusy('');
    if (!r.ok) { setErr(why(r.reason, r.detail)); return; }
    onMsg('Switched on: ' + o.place_name + ' until ' + when(r.ends_at) + ' - by ' + r.granted_by_name + '.');
    void load();
  };
  if (err) return <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{err}</p>;
  if (!data) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-bold uppercase text-amber-800">Paid this month</p><p className="text-2xl font-extrabold text-amber-900">{data.this_month.paid}</p></div>
        <div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-bold uppercase text-amber-800">Mobile money this month</p><p className="text-2xl font-extrabold text-amber-900">{fmtXaf(data.this_month.xaf, 'en')} XAF</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-600">Switched on by hand</p><p className="text-2xl font-extrabold text-slate-800">{data.this_month.granted}</p></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-2 font-extrabold text-slate-900">Agents credited this month</p>
        {data.agents_this_month.length === 0 ? <p className="text-sm text-slate-500">None yet.</p> : (
          <ul className="space-y-1 text-sm">
            {data.agents_this_month.map((a, i) => <li key={i}><b>{a.agent_name || '-'}</b>: {a.paid} featured, {fmtXaf(a.xaf, 'en')} XAF</li>)}
          </ul>
        )}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="p-2">Business</th><th className="p-2">Plan</th><th className="p-2">XAF</th><th className="p-2">Status</th><th className="p-2">Paid by / agent</th><th className="p-2">When</th><th className="p-2" /></tr>
          </thead>
          <tbody>
            {data.rows.map((o) => (
              <tr key={o.id} className="border-t border-slate-100" data-feature={o.id}>
                <td className="p-2"><b>{o.place_name}</b><br /><span className="text-xs text-slate-500">{o.area_label}</span></td>
                <td className="p-2">{o.plan} ({o.days} d)</td>
                <td className="p-2">{fmtXaf(o.amount_xaf, 'en')}{o.paid_xaf !== null && Number(o.paid_xaf) !== o.amount_xaf ? ' (got ' + o.paid_xaf + ')' : ''}</td>
                <td className="p-2">
                  <span className="font-bold">{o.status}</span>
                  {o.ends_at ? <><br /><span className="text-xs text-slate-500">to {when(o.ends_at)}</span></> : null}
                  {o.granted_by_name && o.status === 'granted' ? <><br /><span className="text-xs text-slate-500">by {o.granted_by_name}: {o.grant_note}</span></> : null}
                </td>
                <td className="p-2">{o.buyer_name || '-'}{o.agent_name ? <><br /><span className="text-xs text-slate-500">agent {o.agent_name}</span></> : null}</td>
                <td className="p-2 text-xs">{when(o.created_at)}<br /><span className="text-slate-400">{o.external_ref}</span></td>
                <td className="p-2">
                  {data.can_grant && ['pending', 'underpaid', 'failed', 'expired'].indexOf(o.status) >= 0 && (
                    <button type="button" disabled={busy === o.id} onClick={() => void grant(o)}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-amber-950 disabled:opacity-60">
                      <Star className="h-3.5 w-3.5" />Switch on
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminFoodGas({ embedded = false }: { embedded?: boolean }) {
  const [view, setView] = useState<View>('pending');
  const [data, setData] = useState<QueueRes | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    if (view === 'payments') return;
    setLoading(true);
    const r = await foodRpc<QueueRes>('bambeh_admin_food_queue', { p_view: view, p_limit: 150 });
    setLoading(false);
    if (r.ok) { setData(r); setErr(''); } else { setData(null); setErr(why(r.reason, r.detail)); }
  }, [view]);
  useEffect(() => { void load(); }, [load, tick]);

  const counts = data ? data.counts : null;
  const tabs: Array<{ key: View; label: string }> = [
    { key: 'pending', label: 'Waiting' + (counts ? ' (' + counts.pending + ')' : '') },
    { key: 'changed', label: 'Changed after approval' + (counts ? ' (' + counts.changed + ')' : '') },
    { key: 'live', label: 'Live' + (counts ? ' (' + counts.live + ')' : '') },
    { key: 'closed', label: 'Rejected / hidden' + (counts ? ' (' + counts.closed + ')' : '') },
    { key: 'payments', label: 'Featured payments' },
  ];

  return (
    <div data-fix="FIX693" className={embedded ? 'space-y-4' : 'mx-auto max-w-5xl space-y-4 p-4'}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Gas &amp; food</h2>
          <p className="text-sm text-slate-600">
            Cooking gas, restaurants, grill &amp; soya and roasted fish. Nothing is visible to buyers until staff approve it.
            Moderators, admins and the super admin can decide; your name and the time are recorded and the owner is told.
          </p>
        </div>
        <button type="button" onClick={() => setTick(tick + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Refresh
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tb) => (
          <button key={tb.key} type="button" onClick={() => { setView(tb.key); setMsg(''); }}
            className={'rounded-full px-3 py-1.5 text-sm font-bold ' + (view === tb.key ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-700')}>
            {tb.label}
          </button>
        ))}
      </div>
      {msg && <p className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{msg}</p>}
      {view === 'payments' ? (
        <Payments onMsg={setMsg} />
      ) : err ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{err}</p>
      ) : !data ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : data.rows.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Nothing here.</p>
      ) : (
        <ul className="space-y-3">
          {data.rows.map((p) => <PlaceCard key={p.id} p={p} view={view} onDone={(m) => { setMsg(m); setTick((n) => n + 1); }} />)}
        </ul>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_FOOD_GAS_FIX693__COMPLETE
