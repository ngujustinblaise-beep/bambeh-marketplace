// BAMBEH_DEPLOY_TOKEN__ADMIN_BUSINESSES_FIX836_CLEAN
/**
 * AdminBusinesses.tsx - FIX836 (new) - Command Center > Businesses
 *
 * Big, 18 Oct 2026: "let registered corporate bodies be sent to admin section for treatment and prompt upload".
 * Until now a business that registered stayed "pending" for ever - no screen read corporate_stores.
 *
 *   Waiting (Bambeh's turn) / Documents asked (the business's turn) / Approved / Not approved / Suspended / All,
 *   oldest first, with a search (name, city, RCCM number).
 *   One business: its legal record (RCCM, NIU, the representative - phone and email for Bambeh's check only, never
 *   public), its documents (opened through a private 10-minute link), its products and quote requests, what happened
 *   and who did it.
 *   Moderators: ask for documents (RCCM certificate, NIU card, licence, another - say which), write a note.
 *   Admins and the super admin, also: approve (the "Verified Corporate" badge, the Corporate directory, its products in
 *   the Corporate adverts), refuse (with the reason), suspend (hidden from the public, with the reason), reactivate,
 *   take back a document.
 *   Every decision keeps who and when; the business is told in its own language and sees it on its dashboard.
 * The database (FIX832) checks every action again. English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, Ban, Building2, CheckCircle2, Clock, ExternalLink, FileQuestion, FileText, Loader2, MessageSquare,
  RefreshCw, RotateCcw, Search, ShieldCheck, Trash2, X, XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { openBusinessDoc, removeBusinessDoc, type CorpDoc, type DocKind } from '@/features/corporate/corpReview';

type State = 'waiting' | 'documents' | 'approved' | 'refused' | 'suspended' | 'all';
type Action = 'approve' | 'ask_docs' | 'reject' | 'suspend' | 'reactivate' | 'note';

export interface BizRow {
  id: string; registered_name: string; trading_name: string | null; category: string | null; city: string | null; status: string;
  state: Exclude<State, 'all'>; verified: boolean; docs_requested: string[]; submitted_at: string | null; created_at: string;
  owner: string; docs: number; last: { at: string; action: string; who: string | null; bambeh: boolean } | null;
}
interface ListAnswer { ok: boolean; reason?: string; rank: number; rows: BizRow[]; counts: Partial<Record<State, number>> }
interface HistoryRow { at: string; action: string; who: string | null; bambeh: boolean; note: string | null; docs: string[] }
interface Detail {
  ok: boolean; reason?: string; rank: number;
  store: Record<string, unknown> & {
    id: string; registered_name: string; trading_name: string | null; slug: string | null; status: string; verified: boolean;
    state: Exclude<State, 'all'>; owner_name: string; docs_requested: string[]; note: string | null; reviewed_by_name: string | null;
    reviewed_at: string | null; submitted_at: string | null; created_at: string;
  };
  docs: Array<CorpDoc & { by?: string }>; history: HistoryRow[]; products: number; quotes: number;
  members: Array<{ name: string; role: string }>;
}

export const TABS: ReadonlyArray<readonly [State, string]> = [
  ['waiting', 'Waiting'], ['documents', 'Documents asked'], ['approved', 'Approved'], ['refused', 'Not approved'],
  ['suspended', 'Suspended'], ['all', 'All'],
];
export const STATE_LABEL: Record<string, string> = {
  waiting: 'Waiting for Bambeh', documents: 'Documents asked', approved: 'Approved - Verified Corporate', refused: 'Not approved',
  suspended: 'Suspended',
};
export const DOC_LABEL: Record<string, string> = {
  rccm: 'RCCM certificate', niu: 'Taxpayer card (NIU)', licence: 'Licence / permit', other: 'Another document',
};
export const ACTION_LABEL: Record<string, string> = {
  submitted: 'registered', docs_sent: 'sent a document', doc_removed: 'took a document back', resubmitted: 'sent it again',
  approve: 'approved', ask_docs: 'asked for documents', reject: 'refused', suspend: 'suspended', reactivate: 'reactivated',
  note: 'wrote a note',
};
const CATEGORY: Record<string, string> = { shopping: 'Corporate shopping', services: 'Professional services', infrastructure: 'Infrastructure & logistics' };
const AUDIENCE: Record<string, string> = { b2c: 'Consumers (B2C)', b2b: 'Businesses (B2B)', hybrid: 'Both (hybrid)' };

export const REASONS: Record<string, string> = {
  staff_only: 'Only Bambeh staff can do this.',
  admins_only: 'Only admins and the super admin can approve, refuse, suspend or reactivate a business.',
  need_note: 'Write the reason - the business reads it.',
  need_docs: 'Tick at least one document.',
  not_found: 'This business was not found - press Refresh.',
  already_approved: 'This business is already approved.',
  not_waiting: 'Only a business still waiting can be refused. An approved business is suspended instead.',
  not_active: 'Only an approved or waiting business can be suspended.',
  not_suspended: 'Only a suspended business can be reactivated.',
  too_long: 'The note is too long (600 characters at most).',
  bad_action: 'Unknown action.',
  checked_already: 'The business cannot take this document back any more.',
};
function reasonText(r: { reason?: string; detail?: string } | null | undefined): string {
  if (!r) return 'No answer - check the connection and try again.';
  return REASONS[r.reason || ''] || 'Something was not right (' + String(r.reason || r.detail || 'unknown') + ') - press Refresh and try again.';
}
export function fmtWhen(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function missingFn(error: unknown): boolean {
  const m = String((error as { message?: string } | null)?.message || '');
  return /could not find the function|does not exist|schema cache|PGRST202/i.test(m) || (error as { code?: string } | null)?.code === 'PGRST202';
}

function Chip({ state }: { state: string }) {
  const cls = state === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : state === 'documents' ? 'bg-orange-50 text-orange-700 border-orange-200'
      : state === 'refused' ? 'bg-red-50 text-red-700 border-red-200'
        : state === 'suspended' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-amber-50 text-amber-800 border-amber-200';
  return <span className={'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold ' + cls} data-chip={state}>{STATE_LABEL[state] || state}</span>;
}
function Line({ k, v }: { k: string; v: ReactNode }) {
  if (v === null || v === undefined || v === '') return null;
  return (
    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-gray-50 py-1.5 text-sm">
      <span className="text-gray-500">{k}</span><span className="break-words text-gray-900">{v}</span>
    </div>
  );
}

export default function AdminBusinesses({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<State>('waiting');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [list, setList] = useState<ListAnswer | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState('');
  const [docs, setDocs] = useState<DocKind[]>([]);
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: 'red' | 'green' } | null>(null);

  const say = (text: string, tone: 'red' | 'green' = 'green') => {
    setMsg({ text, tone });
    if (tone === 'green') {
      try { window.setTimeout(() => setMsg((m) => (m && m.text === text ? null : m)), 7000); } catch { /* no timer */ }
    }
  };

  const loadList = useCallback(async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('bambeh_admin_corp_list', { p_state: tab, p_q: query || null });
      if (error) { setErr(missingFn(error) ? 'missing' : String(error.message || error)); setList(null); }
      else {
        const d = (data || {}) as ListAnswer;
        if (!d.ok) { setErr(reasonText(d)); setList(null); } else { setErr(null); setList(d); }
      }
    } catch (e) {
      setErr(String((e as Error)?.message || e));
    }
    setBusy(false);
  }, [tab, query]);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('bambeh_admin_corp_get', { p_store: id });
      if (error) { say(String(error.message || error), 'red'); return; }
      const d = (data || {}) as Detail;
      if (!d.ok) { say(reasonText(d), 'red'); setDetail(null); return; }
      setDetail(d);
    } catch (e) {
      say(String((e as Error)?.message || e), 'red');
    }
  }, []);

  useEffect(() => { void loadList(); }, [loadList]);
  useEffect(() => { if (openId) void loadDetail(openId); else setDetail(null); }, [openId, loadDetail]);

  const startAction = (a: Action) => { setAction(action === a ? null : a); setNote(''); setDocs([]); setMsg(null); };

  const decide = async () => {
    if (!detail || !action) return;
    if ((action === 'reject' || action === 'suspend' || action === 'note') && !note.trim()) { say(REASONS.need_note, 'red'); return; }
    if (action === 'ask_docs' && docs.length === 0) { say(REASONS.need_docs, 'red'); return; }
    if (action === 'ask_docs' && docs.indexOf('other') >= 0 && !note.trim()) { say('Say which other document you need - the business reads it.', 'red'); return; }
    setWorking(true);
    try {
      const { data, error } = await supabase.rpc('bambeh_admin_corp_decide', {
        p_store: detail.store.id, p_action: action, p_note: note.trim() || null, p_docs: action === 'ask_docs' ? docs : null,
      });
      const d = (data || {}) as { ok?: boolean; reason?: string; by?: string };
      if (error || !d.ok) { say(error ? String(error.message || error) : reasonText(d), 'red'); return; }
      const name = detail.store.trading_name || detail.store.registered_name;
      say(name + ': ' + (ACTION_LABEL[action] || action) + ' by ' + (d.by || 'you') + '. The business has been told.');
      setAction(null); setNote(''); setDocs([]);
      await Promise.all([loadDetail(detail.store.id), loadList()]);
    } catch (e) {
      say(String((e as Error)?.message || e), 'red');
    } finally {
      setWorking(false);
    }
  };

  const open = async (d: CorpDoc) => {
    const res = await openBusinessDoc(d.path);
    if (!res.ok) { say('The document could not be opened (' + (res.detail || res.reason) + ').', 'red'); return; }
    try { window.open(res.url, '_blank', 'noopener'); } catch { window.location.href = res.url; }
  };
  const takeBack = async (d: CorpDoc) => {
    if (!detail) return;
    const res = await removeBusinessDoc(d);
    if (!res.ok) { say(reasonText(res), 'red'); return; }
    say('Document taken back.');
    await loadDetail(detail.store.id);
  };

  const rank = detail ? detail.rank : list ? list.rank : 0;
  const isAdmin = rank >= 2;
  const counts = (list && list.counts) || {};

  const shell = (children: ReactNode) => (
    <div className={'space-y-4 ' + (embedded ? '' : 'mx-auto max-w-5xl p-4')} data-fix="FIX836" data-admin-businesses="1">
      <div className="flex items-start gap-3">
        <Building2 className="mt-0.5 h-6 w-6 text-slate-700" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900">Businesses</h2>
          <p className="text-sm text-gray-500">Businesses that registered on Bambeh Corporate. Moderators ask for documents and write notes; admins and the super admin approve, refuse, suspend and reactivate. The business is told in its own language.</p>
        </div>
      </div>
      {msg ? (
        <div className={'flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ' + (msg.tone === 'red' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800')} data-msg={msg.tone}>
          {msg.tone === 'red' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="flex-1">{msg.text}</span>
          <button onClick={() => setMsg(null)} aria-label="Close"><X className="h-4 w-4 opacity-60" /></button>
        </div>
      ) : null}
      {children}
    </div>
  );

  if (err === 'missing') {
    return shell(
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" data-missing="1">
        FIX832 has not been run yet: open Supabase - SQL Editor, paste FIX832-corporate-and-support.sql and press Run. Then press Refresh here.
        <button onClick={() => { void loadList(); }} className="mt-3 flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>,
    );
  }

  if (openId) {
    if (!detail) return shell(<div className="flex justify-center py-12 text-slate-500"><Loader2 className="h-6 w-6 animate-spin" /></div>);
    const st = detail.store;
    const name = st.trading_name || st.registered_name;
    const str = (k: string) => (st[k] === null || st[k] === undefined ? '' : String(st[k]));
    const can = (a: Action) => {
      if (a === 'approve') return !(st.status === 'active' && st.verified);
      if (a === 'reject') return st.status === 'pending' || st.status === 'rejected';
      if (a === 'suspend') return st.status === 'active' || st.status === 'pending';
      if (a === 'reactivate') return st.status === 'suspended';
      return true;
    };
    const ACTIONS: Array<{ a: Action; label: string; admin: boolean; cls: string; icon: ReactNode }> = [
      { a: 'approve', label: 'Approve', admin: true, cls: 'bg-emerald-600 text-white', icon: <ShieldCheck className="h-4 w-4" /> },
      { a: 'ask_docs', label: 'Ask for documents', admin: false, cls: 'bg-orange-500 text-white', icon: <FileQuestion className="h-4 w-4" /> },
      { a: 'reject', label: 'Refuse', admin: true, cls: 'bg-red-600 text-white', icon: <XCircle className="h-4 w-4" /> },
      { a: 'suspend', label: 'Suspend', admin: true, cls: 'bg-gray-700 text-white', icon: <Ban className="h-4 w-4" /> },
      { a: 'reactivate', label: 'Reactivate', admin: true, cls: 'bg-teal-600 text-white', icon: <RotateCcw className="h-4 w-4" /> },
      { a: 'note', label: 'Write a note', admin: false, cls: 'bg-slate-700 text-white', icon: <MessageSquare className="h-4 w-4" /> },
    ];
    const HINT: Record<Action, string> = {
      approve: 'The business gets the "Verified Corporate" badge, shows in the Corporate directory, and its products can appear in the Corporate adverts. A note is optional.',
      ask_docs: 'Tick what is missing. The business is told and sees an Upload button for each. For "another document", say which in the note.',
      reject: 'Write the reason. The business can correct and send it again.',
      suspend: 'The business is hidden from the public until it is reactivated. Write the reason.',
      reactivate: 'The business shows again. A note is optional.',
      note: 'A message to the business, shown on its dashboard and sent as a notification.',
    };
    return shell(
      <div className="space-y-4" data-detail={st.id}>
        <button onClick={() => { setOpenId(null); setAction(null); setMsg(null); }} className="flex items-center gap-1 text-sm font-semibold text-slate-600" data-back="1">
          <ArrowLeft className="h-4 w-4" /> Back to the list
        </button>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 flex-1 text-lg font-bold text-gray-900">{name}</h3>
            {st.verified ? <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span> : null}
            <Chip state={st.state} />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Sent to Bambeh {fmtWhen(st.submitted_at)}
            {st.reviewed_at ? ' - last decision ' + fmtWhen(st.reviewed_at) + (st.reviewed_by_name ? ' by ' + st.reviewed_by_name : '') : ''}
          </p>
          {st.docs_requested && st.docs_requested.length ? (
            <p className="mt-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-800" data-asked="1">Asked for: {st.docs_requested.map((k) => DOC_LABEL[k] || k).join(', ')}</p>
          ) : null}
          {st.note ? <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700" data-note-shown="1"><b>Last note to the business:</b> {st.note}</p> : null}
          <button onClick={() => navigate('/corporate/store/' + (st.slug || st.id))} className="mt-3 flex items-center gap-1 text-sm font-semibold text-teal-700" data-storefront="1">
            <ExternalLink className="h-4 w-4" /> Open its storefront
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4" data-actions="1">
          <p className="mb-2 font-bold text-gray-900">Decide</p>
          {!isAdmin ? <p className="mb-2 text-xs text-gray-500">As a moderator you can ask for documents and write notes. Approving, refusing, suspending and reactivating are for admins and the super admin.</p> : null}
          <div className="flex flex-wrap gap-2">
            {ACTIONS.filter((x) => can(x.a)).map((x) => {
              const locked = x.admin && !isAdmin;
              return (
                <button key={x.a} onClick={() => !locked && startAction(x.a)} disabled={locked} data-action={x.a} title={locked ? 'Admins only' : ''}
                        className={'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ' + (locked ? 'cursor-not-allowed bg-gray-100 text-gray-400' : x.cls) + (action === x.a ? ' ring-2 ring-offset-2 ring-slate-400' : '')}>
                  {x.icon} {x.label}{locked ? ' (admins)' : ''}
                </button>
              );
            })}
          </div>
          {action ? (
            <div className="mt-3 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3" data-action-form={action}>
              <p className="text-xs text-gray-600">{HINT[action]}</p>
              {action === 'ask_docs' ? (
                <div className="grid gap-1 sm:grid-cols-2">
                  {(['rccm', 'niu', 'licence', 'other'] as DocKind[]).map((k) => (
                    <label key={k} className="flex items-center gap-2 text-sm text-gray-800">
                      <input type="checkbox" checked={docs.indexOf(k) >= 0} data-ask={k} className="h-4 w-4 accent-orange-500"
                             onChange={(e) => setDocs((xs) => (e.target.checked ? xs.concat([k]) : xs.filter((y) => y !== k)))} />
                      {DOC_LABEL[k]}
                    </label>
                  ))}
                </div>
              ) : null}
              <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 600))} rows={3} data-note="1"
                        placeholder={action === 'reject' || action === 'suspend' ? 'The reason (the business reads it)' : action === 'note' ? 'Your message to the business' : 'A note to the business (optional)'}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <button onClick={() => { void decide(); }} disabled={working} data-confirm="1"
                        className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Confirm: {ACTIONS.find((x) => x.a === action)?.label}
                </button>
                <button onClick={() => setAction(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600">Cancel</button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4" data-docs="1">
          <p className="mb-2 font-bold text-gray-900">Documents ({detail.docs.length})</p>
          {detail.docs.length === 0 ? <p className="text-sm text-gray-500">No document yet. Use "Ask for documents" to tell the business what to upload.</p> : null}
          <div className="space-y-2">
            {detail.docs.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 px-3 py-2" data-doc={d.kind}>
                <FileText className="h-4 w-4 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{DOC_LABEL[d.kind] || d.kind}</p>
                  <p className="truncate text-xs text-gray-500">{(d.name || 'file') + ' - ' + (d.mime === 'application/pdf' ? 'PDF' : 'photo') + ' - ' + fmtWhen(d.at) + (d.by ? ' - ' + d.by : '')}</p>
                </div>
                <button onClick={() => { void open(d); }} className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-slate-700" data-doc-open={d.id}>Open</button>
                {isAdmin ? <button onClick={() => { void takeBack(d); }} className="flex items-center gap-1 rounded-lg border border-red-100 px-2 py-1 text-xs text-red-600" data-doc-remove={d.id}><Trash2 className="h-3.5 w-3.5" /> Take back</button> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4" data-record="1">
          <p className="mb-2 font-bold text-gray-900">Legal record</p>
          <Line k="Registered name" v={st.registered_name} />
          <Line k="Trading name" v={st.trading_name} />
          <Line k="Category" v={CATEGORY[str('category')] || str('category')} />
          <Line k="RCCM number" v={str('rccm_number')} />
          <Line k="NIU (taxpayer)" v={str('niu_number')} />
          <Line k="City" v={str('city')} />
          <Line k="Address" v={str('address')} />
          <Line k="About" v={str('about')} />
          <Line k="Sells to" v={AUDIENCE[str('audience')] || str('audience')} />
          <Line k="Minimum order" v={str('moq_text')} />
          <Line k="Minimum order value" v={str('min_order_value_xaf') ? new Intl.NumberFormat('fr-CM').format(Number(str('min_order_value_xaf'))) + ' XAF' : ''} />
          <Line k="Prices shown" v={str('price_mode') === 'ht' ? 'HT (tax excluded)' : str('price_mode') ? 'TTC (tax included)' : ''} />
          <Line k="Representative" v={str('rep_name')} />
          <Line k="Representative phone" v={str('rep_phone') ? <span dir="ltr">{str('rep_phone')} <span className="text-xs text-gray-400">(for Bambeh&apos;s check only - never public)</span></span> : ''} />
          <Line k="Representative email" v={str('rep_email') ? <span>{str('rep_email')} <span className="text-xs text-gray-400">(for Bambeh&apos;s check only)</span></span> : ''} />
          <Line k="Account" v={st.owner_name} />
          <Line k="Members" v={detail.members.map((m) => m.name + ' (' + m.role + ')').join(', ')} />
          <Line k="Products" v={String(detail.products)} />
          <Line k="Quote requests" v={String(detail.quotes)} />
          <Line k="Registered on" v={fmtWhen(st.created_at)} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4" data-history="1">
          <p className="mb-2 font-bold text-gray-900">What happened</p>
          <ol className="space-y-2">
            {detail.history.map((h, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className={'mt-1.5 h-2 w-2 shrink-0 rounded-full ' + (h.bambeh ? 'bg-amber-500' : 'bg-slate-300')} />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-800"><b>{h.who || 'Someone'}</b> {ACTION_LABEL[h.action] || h.action}{h.docs && h.docs.length ? ': ' + h.docs.map((k) => DOC_LABEL[k] || k).join(', ') : ''}</p>
                  <p className="text-xs text-gray-500">{fmtWhen(h.at)}{h.bambeh ? ' - Bambeh staff' : ' - the business'}</p>
                  {h.note ? <p className="mt-0.5 text-xs text-gray-600">"{h.note}"</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>,
    );
  }

  return shell(
    <>
      <div className="flex flex-wrap gap-2" data-tabs="1">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} data-tab={k}
                  className={'rounded-full border px-3 py-1.5 text-sm font-semibold ' + (tab === k ? 'border-slate-800 bg-slate-800 text-white' : 'border-gray-200 bg-white text-gray-700')}>
            {label}{k !== 'all' && counts[k] ? ' (' + counts[k] + ')' : ''}
          </button>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()); }}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a name, a city or an RCCM number" data-search="1"
                 className="w-full rounded-xl border border-gray-200 py-2 pe-3 ps-9 text-sm" />
        </div>
        <button type="submit" className="rounded-xl bg-slate-800 px-4 text-sm font-semibold text-white">Search</button>
        <button type="button" onClick={() => { void loadList(); }} className="rounded-xl border border-gray-200 px-3 text-gray-600" aria-label="Refresh" data-refresh="1">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </form>
      {err ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" data-error="1">{err}</div> : null}
      {!list ? (
        busy ? <div className="flex justify-center py-10 text-slate-500"><Loader2 className="h-6 w-6 animate-spin" /></div> : null
      ) : list.rows.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500" data-empty="1">
          {tab === 'waiting' ? 'No business is waiting for Bambeh.' : 'Nothing here.'}
        </div>
      ) : (
        <div className="space-y-2" data-rows="1">
          {list.rows.map((b) => (
            <button key={b.id} onClick={() => setOpenId(b.id)} data-row={b.id}
                    className="w-full rounded-2xl border border-gray-100 bg-white p-3 text-start hover:border-slate-300">
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate font-semibold text-gray-900">{b.trading_name || b.registered_name}</p>
                {b.verified ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : null}
                <Chip state={b.state} />
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {[b.trading_name ? b.registered_name : '', CATEGORY[b.category || ''] || b.category, b.city, 'account: ' + b.owner].filter(Boolean).join(' - ')}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> sent {fmtWhen(b.submitted_at)}</span>
                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {b.docs} document{b.docs === 1 ? '' : 's'}</span>
                {b.last ? <span>last: {(b.last.who || 'someone') + ' ' + (ACTION_LABEL[b.last.action] || b.last.action) + ', ' + fmtWhen(b.last.at)}</span> : null}
              </p>
            </button>
          ))}
        </div>
      )}
    </>,
  );
}
// BAMBEH_END_TOKEN__ADMIN_BUSINESSES_FIX836__COMPLETE
