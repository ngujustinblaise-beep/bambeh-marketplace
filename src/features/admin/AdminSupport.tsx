// BAMBEH_DEPLOY_TOKEN__ADMIN_SUPPORT_FIX838_CLEAN
/**
 * AdminSupport.tsx - FIX838 (new) - Command Center > Support inbox
 *
 * Where Bambeh answers "Chat with Bambeh" (FIX837): the messages members write from Help > Chat with Bambeh, the
 * floating help button and Help > Contact, and the "Priority support" of businesses (first in the list).
 *   Waiting (the member wrote last) / Answered (Bambeh wrote last) / Solved / All, with the number in each.
 *   One conversation: who wrote (and in which language the app is set for them), the business if any, every message
 *   with who answered and when; Send, Send and mark solved, Mark solved. The member gets a notification in their own
 *   language that opens the conversation. Moderators, admins and the super admin all answer.
 * New messages appear by themselves (every 30 seconds in the list, 20 in a conversation).
 * Also used, full page, at /admin/inbox and /admin/live-chat (FIX843) where an inbox of made-up sample messages was.
 * English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, Inbox, LifeBuoy, Loader2, RefreshCw, Send, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type State = 'waiting' | 'answered' | 'solved' | 'all';
export interface SupportRow {
  id: string; subject: string; category: string; priority: string; status: string; state: Exclude<State, 'all'>;
  created_at: string; updated_at: string; member: string; business: string | null; preview: string; last_from: 'member' | 'bambeh';
  count: number;
}
interface ListAnswer { ok: boolean; reason?: string; rank: number; rows: SupportRow[]; counts: Partial<Record<State, number>> }
interface Thread {
  ok: boolean; reason?: string;
  ticket: { id: string; subject: string; category: string; priority: string; status: string; body: string; created_at: string;
            updated_at: string; member: string; member_lang: string; store_id: string | null; business: string | null };
  replies: Array<{ id: string; staff: boolean; body: string; at: string; who: string }>;
}

export const TABS: ReadonlyArray<readonly [State, string]> = [['waiting', 'Waiting'], ['answered', 'Answered'], ['solved', 'Solved'], ['all', 'All']];
export const CATEGORY: Record<string, string> = {
  general: 'Something else', billing: 'Payment or subscription', technical: 'Problem with the app',
  verification: 'Account or business check', payout: 'Money to receive',
};
const LANG: Record<string, string> = { en: 'English', fr: 'French', pidgin: 'Pidgin', ar: 'Arabic', ff: 'Fulfulde' };
const STATE_LABEL: Record<string, string> = { waiting: 'Waiting for Bambeh', answered: 'Answered', solved: 'Solved' };

export function fmtWhen(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function missingFn(error: unknown): boolean {
  const m = String((error as { message?: string } | null)?.message || '');
  return /could not find the function|does not exist|schema cache|PGRST202/i.test(m) || (error as { code?: string } | null)?.code === 'PGRST202';
}
function Chip({ state }: { state: string }) {
  const cls = state === 'solved' ? 'bg-emerald-50 text-emerald-700' : state === 'answered' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-800';
  return <span className={'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ' + cls} data-chip={state}>{STATE_LABEL[state] || state}</span>;
}

export default function AdminSupport({ embedded = false, onBack }: { embedded?: boolean; onBack?: () => void }) {
  const [tab, setTab] = useState<State>('waiting');
  const [list, setList] = useState<ListAnswer | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: 'red' | 'green' } | null>(null);
  const bottom = useRef<HTMLDivElement | null>(null);

  const say = (t: string, tone: 'red' | 'green' = 'green') => {
    setMsg({ text: t, tone });
    if (tone === 'green') {
      try { window.setTimeout(() => setMsg((m) => (m && m.text === t ? null : m)), 7000); } catch { /* no timer */ }
    }
  };

  const loadList = useCallback(async (quiet = false) => {
    if (!quiet) setBusy(true);
    try {
      const { data, error } = await supabase.rpc('bambeh_admin_support_list', { p_state: tab });
      if (error) { if (!quiet) { setErr(missingFn(error) ? 'missing' : String(error.message || error)); setList(null); } }
      else {
        const d = (data || {}) as ListAnswer;
        if (!d.ok) { setErr(d.reason === 'staff_only' ? 'Only Bambeh staff can read the support inbox.' : String(d.reason)); setList(null); }
        else { setErr(null); setList(d); }
      }
    } catch (e) {
      if (!quiet) setErr(String((e as Error)?.message || e));
    }
    if (!quiet) setBusy(false);
  }, [tab]);

  const loadThread = useCallback(async (id: string, quiet = false) => {
    try {
      const { data, error } = await supabase.rpc('bambeh_admin_support_get', { p_ticket: id });
      if (error) { if (!quiet) say(String(error.message || error), 'red'); return; }
      const d = (data || {}) as Thread;
      if (!d.ok) { if (!quiet) say(d.reason === 'not_found' ? 'This conversation was not found.' : String(d.reason), 'red'); return; }
      setThread(d);
    } catch (e) {
      if (!quiet) say(String((e as Error)?.message || e), 'red');
    }
  }, []);

  useEffect(() => { void loadList(); }, [loadList]);
  useEffect(() => { setThread(null); setText(''); if (openId) void loadThread(openId); }, [openId, loadThread]);
  useEffect(() => {
    const id = window.setInterval(() => {
      try { if (document.visibilityState && document.visibilityState !== 'visible') return; } catch { /* old browser */ }
      if (openId) void loadThread(openId, true); else void loadList(true);
    }, openId ? 20000 : 30000);
    return () => window.clearInterval(id);
  }, [openId, loadList, loadThread]);
  useEffect(() => {
    if (thread && bottom.current) { try { bottom.current.scrollIntoView({ block: 'end' }); } catch { /* old browser */ } }
  }, [thread ? thread.replies.length : 0]);   // eslint-disable-line react-hooks/exhaustive-deps

  const answer = async (solved: boolean) => {
    if (!thread) return;
    const body = text.trim();
    if (!body && !solved) return;
    if (body.length > 2000) { say('2000 characters at most.', 'red'); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.rpc('bambeh_admin_support_reply', { p_ticket: thread.ticket.id, p_body: body || null, p_solved: solved });
      const d = (data || {}) as { ok?: boolean; reason?: string; by?: string };
      if (error || !d.ok) { say(error ? String(error.message || error) : 'Not sent (' + String(d.reason) + ').', 'red'); return; }
      setText('');
      say(body ? (solved ? 'Answer sent - marked solved. ' : 'Answer sent. ') + thread.ticket.member + ' has been told.' : 'Marked solved.');
      await Promise.all([loadThread(thread.ticket.id, true), loadList(true)]);
    } catch (e) {
      say(String((e as Error)?.message || e), 'red');
    } finally {
      setSending(false);
    }
  };

  const counts = (list && list.counts) || {};
  const shell = (children: ReactNode) => (
    <div className={'space-y-4 ' + (embedded ? '' : 'mx-auto max-w-4xl p-4')} data-fix="FIX838" data-admin-support="1">
      <div className="flex items-start gap-3">
        {!embedded && onBack ? <button onClick={onBack} className="mt-0.5 rounded-lg p-1 text-gray-500 hover:bg-gray-100" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button> : null}
        <LifeBuoy className="mt-0.5 h-6 w-6 text-teal-700" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900">Support inbox</h2>
          <p className="text-sm text-gray-500">Messages to Bambeh from "Chat with Bambeh" and the businesses' Priority support. Answer here - the member is told in their own language. Businesses come first.</p>
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
    if (!thread) return shell(<div className="flex justify-center py-12 text-teal-600"><Loader2 className="h-6 w-6 animate-spin" /></div>);
    const tk = thread.ticket;
    const state = tk.status === 'resolved' || tk.status === 'closed' ? 'solved' : tk.status === 'in_progress' ? 'answered' : 'waiting';
    const msgs = [{ id: tk.id, staff: false, body: tk.body, at: tk.created_at, who: tk.member }, ...thread.replies];
    return shell(
      <div className="space-y-3" data-thread={tk.id}>
        <button onClick={() => { setOpenId(null); setMsg(null); void loadList(true); }} className="flex items-center gap-1 text-sm font-semibold text-slate-600" data-back="1">
          <ArrowLeft className="h-4 w-4" /> Back to the inbox
        </button>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 flex-1 font-bold text-gray-900">{tk.subject}</p>
            {tk.priority === 'high' || tk.priority === 'urgent' ? <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">Priority</span> : null}
            <Chip state={state} />
          </div>
          <p className="mt-1 text-xs text-gray-500" data-who="1">
            {tk.member}{tk.business ? ' - business: ' + tk.business : ''} - {CATEGORY[tk.category] || tk.category} - the app is in {LANG[tk.member_lang] || tk.member_lang} for them
          </p>
        </div>
        <div className="space-y-2" data-messages="1">
          {msgs.map((m) => (
            <div key={m.id} className={'flex ' + (m.staff ? 'justify-end' : 'justify-start')} data-from={m.staff ? 'bambeh' : 'member'}>
              <div className={'max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ' + (m.staff ? 'bg-teal-600 text-white' : 'border border-gray-100 bg-white text-gray-800')}>
                <p className={'mb-0.5 text-[11px] font-bold ' + (m.staff ? 'text-teal-50' : 'text-gray-500')}>{m.staff ? 'Bambeh - ' + m.who : m.who}</p>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={'mt-1 text-[10px] ' + (m.staff ? 'text-teal-100' : 'text-gray-400')}>{fmtWhen(m.at)}</p>
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-3">
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 2000))} rows={4} data-answer="1"
                    placeholder={'Your answer to ' + tk.member + ' (in ' + (LANG[tk.member_lang] || 'their language') + ' if you can). No phone number - the conversation stays here.'}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => { void answer(false); }} disabled={sending || !text.trim()} data-send="1"
                    className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
            </button>
            <button onClick={() => { void answer(true); }} disabled={sending || !text.trim()} data-send-solved="1"
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              <CheckCircle2 className="h-4 w-4" /> Send and mark solved
            </button>
            {state !== 'solved' ? (
              <button onClick={() => { void answer(true); }} disabled={sending || !!text.trim()} data-solved="1"
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">
                Mark solved (no answer)
              </button>
            ) : null}
          </div>
        </div>
      </div>,
    );
  }

  return shell(
    <>
      <div className="flex flex-wrap items-center gap-2" data-tabs="1">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} data-tab={k}
                  className={'rounded-full border px-3 py-1.5 text-sm font-semibold ' + (tab === k ? 'border-teal-700 bg-teal-700 text-white' : 'border-gray-200 bg-white text-gray-700')}>
            {label}{k !== 'all' && counts[k] ? ' (' + counts[k] + ')' : ''}
          </button>
        ))}
        <button onClick={() => { void loadList(); }} className="ms-auto rounded-xl border border-gray-200 bg-white p-2 text-gray-600" aria-label="Refresh" data-refresh="1">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </div>
      {err ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" data-error="1">{err}</div> : null}
      {!list ? (
        busy ? <div className="flex justify-center py-10 text-teal-600"><Loader2 className="h-6 w-6 animate-spin" /></div> : null
      ) : list.rows.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500" data-empty="1">
          <Inbox className="mx-auto mb-2 h-8 w-8 text-gray-300" />{tab === 'waiting' ? 'Nobody is waiting for an answer.' : 'Nothing here.'}
        </div>
      ) : (
        <div className="space-y-2" data-rows="1">
          {list.rows.map((x) => (
            <button key={x.id} onClick={() => setOpenId(x.id)} data-row={x.id}
                    className="w-full rounded-2xl border border-gray-100 bg-white p-3 text-start hover:border-teal-300">
              <div className="flex items-center gap-2">
                {x.business ? <Building2 className="h-4 w-4 shrink-0 text-amber-600" /> : null}
                <p className="min-w-0 flex-1 truncate font-semibold text-gray-900">{x.subject}</p>
                {x.priority === 'high' || x.priority === 'urgent' ? <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">Priority</span> : null}
                <Chip state={x.state} />
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-600">{(x.last_from === 'bambeh' ? 'Bambeh: ' : x.member + ': ') + x.preview}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">
                {x.member}{x.business ? ' - ' + x.business : ''} - {CATEGORY[x.category] || x.category} - {x.count} message{x.count === 1 ? '' : 's'} - {fmtWhen(x.updated_at)}
              </p>
            </button>
          ))}
        </div>
      )}
    </>,
  );
}
// BAMBEH_END_TOKEN__ADMIN_SUPPORT_FIX838__COMPLETE
