// BAMBEH_DEPLOY_TOKEN__AGENT_REPORTS_PANEL_FIX936_CLEAN
/**
 * src/features/admin/AgentReportsPanel.tsx - FIX936 (new) - Command Center > Marketing agents > Daily reports
 *
 * Big, 29 Oct 2026: "Build field agent marketing agent daily feedback form ... and they can reply directly from
 * their platform to the admin." The agents write on their page (AgentReport, FIX934); admins read here and answer.
 *   - Waiting first: a report (or an agent's answer) that nobody at Bambeh has answered or marked as read.
 *   - An answer is shown to the agent on their page, signed "Bambeh", and in their bell (FIX931).
 *   - "Mark as read" takes a report off the waiting list without an answer.
 *   - The two "when" questions are counted across the agents (last 7 days): when work is easiest and hardest.
 * Admins only (the database checks: bambeh_staff_agent_reports / _reply / _read, FIX931). English only, by decision.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, MessageSquare, RefreshCw, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Met = 'yes' | 'partly' | 'no';
type Slot = 'morning' | 'midday' | 'afternoon' | 'evening';
type Filter = 'waiting' | 'today' | 'week' | 'all';

interface Note { id: number; from_staff: boolean; body: string; created_at: string; author: string | null }
export interface StaffReport {
  id: string; day: string; target: number | null; signups: number; live_signups: number; target_met: Met;
  best_part: string; main_block: string; easiest_time: Slot | null; easiest_note: string;
  hardest_time: Slot | null; hardest_note: string; feedback: string;
  created_at: string; updated_at: string; last_agent_at: string; last_staff_at: string | null;
  waiting: boolean; notes: Note[];
  agent_id: string; agent_name: string | null; code: string | null; town: string | null; region: string | null;
}
export interface AgentTimes { easiest: Record<Slot, number>; hardest: Record<Slot, number> }

const SLOTS: Slot[] = ['morning', 'midday', 'afternoon', 'evening'];
const SLOT_LABEL: Record<Slot, string> = { morning: 'Morning', midday: 'Midday', afternoon: 'Afternoon', evening: 'Evening' };
const MET_LABEL: Record<Met, string> = { yes: 'Target met', partly: 'Partly', no: 'Not met' };
const MET_TONE: Record<Met, string> = { yes: 'bg-emerald-100 text-emerald-800', partly: 'bg-amber-100 text-amber-900', no: 'bg-gray-200 text-gray-800' };
const PAGE = 30;

function when(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Douala' });
  } catch {
    return String(iso).slice(0, 16).replace('T', ' ');
  }
}
function dayLabel(day: string): string {
  try {
    return new Date(day + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Douala' });
  } catch {
    return day;
  }
}

/** Morning ... evening as small bars: how often agents named each time, last 7 days. */
function TimesBox({ times }: { times: AgentTimes | null }) {
  if (!times) return null;
  const total = SLOTS.reduce((a, s) => a + (times.easiest[s] || 0) + (times.hardest[s] || 0), 0);
  if (total === 0) return null;
  const row = (label: string, v: Record<Slot, number>, tone: string) => {
    const max = Math.max(1, ...SLOTS.map((s) => v[s] || 0));
    return (
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
        <div className="grid grid-cols-4 gap-2">
          {SLOTS.map((s) => (
            <div key={s} className="text-center" data-time={label.toLowerCase().split(' ')[0] + '-' + s}>
              <div className="flex h-12 items-end justify-center rounded-lg bg-gray-50">
                <div className={'w-6 rounded-t ' + tone} style={{ height: Math.round(((v[s] || 0) / max) * 100) + '%' }} />
              </div>
              <p className="mt-0.5 text-[11px] text-gray-600">{SLOT_LABEL[s]}</p>
              <p className="text-xs font-bold text-gray-900">{v[s] || 0}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="mb-3 grid gap-3 rounded-2xl border border-gray-100 bg-white p-3 sm:grid-cols-2" data-times="1">
      {row('Easiest time to work (7 days)', times.easiest, 'bg-emerald-500')}
      {row('Hardest time to work (7 days)', times.hardest, 'bg-red-400')}
    </div>
  );
}

export default function AgentReportsPanel({ agents, times, flash, onWaiting }: {
  agents: Array<{ id: string; full_name: string; code: string }>;
  times: AgentTimes | null;
  flash: (m: string) => void;
  onWaiting?: (n: number) => void;
}) {
  const [filter, setFilter] = useState<Filter>('waiting');
  const [agent, setAgent] = useState('');
  const [rows, setRows] = useState<StaffReport[]>([]);
  const [total, setTotal] = useState(0);
  const [waiting, setWaiting] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');

  const load = useCallback(async (offset: number) => {
    if (offset === 0) setLoading(true);
    try {
      const r = await supabase.rpc('bambeh_staff_agent_reports', { p_filter: filter, p_agent: agent || null, p_limit: PAGE, p_offset: offset });
      const d = r && !r.error ? (r.data as { ok?: boolean; rows?: StaffReport[]; total?: number; waiting?: number } | null) : null;
      if (!d || !d.ok) { setFailed(true); if (offset === 0) setRows([]); return; }
      setFailed(false);
      setRows((prev) => (offset === 0 ? d.rows || [] : prev.concat(d.rows || [])));
      setTotal(d.total || 0);
      setWaiting(d.waiting || 0);
      if (onWaiting) onWaiting(d.waiting || 0);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [filter, agent, onWaiting]);
  useEffect(() => { void load(0); }, [load]);

  const replace = (rep: StaffReport) => setRows((prev) => prev.map((x) => (x.id === rep.id ? { ...x, ...rep } : x)));

  const reply = async (r: StaffReport) => {
    const body = (drafts[r.id] || '').trim();
    if (!body) { flash('Write the answer first.'); return; }
    setBusy(r.id);
    try {
      const x = await supabase.rpc('bambeh_staff_agent_report_reply', { p_report: r.id, p_body: body });
      const d = x && !x.error ? (x.data as { ok?: boolean; reason?: string; report?: StaffReport } | null) : null;
      if (!d || !d.ok) { flash(d && d.reason === 'too_long' ? 'Too long: 1000 characters at most.' : 'Could not send that answer.'); return; }
      if (d.report) replace({ ...r, ...d.report, waiting: false });
      setDrafts((prev) => ({ ...prev, [r.id]: '' }));
      const next = r.waiting ? Math.max(0, waiting - 1) : waiting;
      setWaiting(next);
      if (onWaiting) onWaiting(next);
      flash('Answer sent. The agent sees it on their page and in their bell.');
    } finally {
      setBusy('');
    }
  };

  const markRead = async (r: StaffReport) => {
    setBusy(r.id);
    try {
      const x = await supabase.rpc('bambeh_staff_agent_report_read', { p_report: r.id });
      const d = x && !x.error ? (x.data as { ok?: boolean } | null) : null;
      if (!d || !d.ok) { flash('Could not mark that as read.'); return; }
      replace({ ...r, waiting: false });
      const next = r.waiting ? Math.max(0, waiting - 1) : waiting;
      setWaiting(next);
      if (onWaiting) onWaiting(next);
    } finally {
      setBusy('');
    }
  };

  const chip = (f: Filter, label: string) => (
    <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f} data-filter={f}
      className={'rounded-full px-3 py-1.5 text-xs font-bold ' + (filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200')}>
      {label}
    </button>
  );

  return (
    <div data-fix="FIX936">
      <TimesBox times={times} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {chip('waiting', 'Waiting (' + waiting + ')')}
        {chip('today', 'Today')}
        {chip('week', 'Last 7 days')}
        {chip('all', 'All')}
        <select value={agent} onChange={(e) => setAgent(e.target.value)} data-filter="agent"
          className="rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700">
          <option value="">Every agent</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name} ({a.code})</option>)}
        </select>
        <button type="button" onClick={() => void load(0)} title="Refresh" className="ml-auto rounded-xl p-2 text-gray-500 hover:bg-gray-100">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {failed ? (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Could not read the daily reports</p>
            <p className="mt-0.5 text-xs">This is a failure, not an absence of reports. Has FIX931 been run in Supabase?</p>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10 text-indigo-600"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : rows.length === 0 && !failed ? (
        <p className="py-10 text-center text-sm text-gray-400">
          {filter === 'waiting' ? 'Nothing waiting. Every report has been answered or read.' : 'No report here yet.'}
        </p>
      ) : (
        <ul className="space-y-3" data-reports="1">
          {rows.map((r) => (
            <li key={r.id} className={'rounded-2xl border bg-white p-3 ' + (r.waiting ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-100')} data-staff-report={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    {r.agent_name || 'Agent'} <span className="font-mono text-xs font-bold text-indigo-600">{r.code || ''}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {dayLabel(r.day)}{[r.town, r.region].filter(Boolean).length ? ' \u00b7 ' + [r.town, r.region].filter(Boolean).join(', ') : ''}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {r.waiting && <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white">Waiting</span>}
                  <span className={'rounded-full px-2 py-0.5 text-[11px] font-bold ' + MET_TONE[r.target_met]}>{MET_LABEL[r.target_met]}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700" data-count="1">
                    {r.live_signups}{r.target ? ' / ' + r.target : ''} new
                  </span>
                </div>
              </div>
              <dl className="mt-2 grid gap-1.5 text-sm">
                {r.best_part ? <div><dt className="inline font-semibold text-gray-500">Best part: </dt><dd className="inline text-gray-900">{r.best_part}</dd></div> : null}
                {r.main_block ? <div><dt className="inline font-semibold text-gray-500">Main block: </dt><dd className="inline text-gray-900">{r.main_block}</dd></div> : null}
                {r.easiest_time || r.easiest_note ? (
                  <div><dt className="inline font-semibold text-gray-500">Easiest: </dt>
                    <dd className="inline text-gray-900">{[r.easiest_time ? SLOT_LABEL[r.easiest_time] : '', r.easiest_note].filter(Boolean).join(' - ')}</dd></div>
                ) : null}
                {r.hardest_time || r.hardest_note ? (
                  <div><dt className="inline font-semibold text-gray-500">Hardest: </dt>
                    <dd className="inline text-gray-900">{[r.hardest_time ? SLOT_LABEL[r.hardest_time] : '', r.hardest_note].filter(Boolean).join(' - ')}</dd></div>
                ) : null}
                {r.feedback ? <div><dt className="inline font-semibold text-gray-500">Feedback: </dt><dd className="inline whitespace-pre-wrap text-gray-900">{r.feedback}</dd></div> : null}
              </dl>
              {r.notes.length > 0 && (
                <ul className="mt-2 space-y-1.5" data-notes="1">
                  {r.notes.map((n) => (
                    <li key={n.id} className={'rounded-xl px-3 py-2 text-sm ' + (n.from_staff ? 'bg-indigo-50 text-indigo-950' : 'bg-gray-50 text-gray-800')}>
                      <span className="block text-[11px] font-bold">{n.from_staff ? (n.author || 'Bambeh') : (r.agent_name || 'Agent')} {'\u00b7'} {when(n.created_at)}</span>
                      <span className="whitespace-pre-wrap">{n.body}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <textarea value={drafts[r.id] || ''} maxLength={1000} rows={2} placeholder="Answer the agent (they see it signed Bambeh)"
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))} data-draft={r.id}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <button type="button" disabled={busy === r.id} onClick={() => void reply(r)} data-reply={r.id}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                    {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send answer
                  </button>
                  {r.waiting && (
                    <button type="button" disabled={busy === r.id} onClick={() => void markRead(r)} data-read={r.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50">
                      <Check className="h-3.5 w-3.5" /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && rows.length < total && (
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={() => void load(rows.length)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700">
            <MessageSquare className="h-4 w-4" /> More reports
          </button>
        </div>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__AGENT_REPORTS_PANEL_FIX936__COMPLETE
