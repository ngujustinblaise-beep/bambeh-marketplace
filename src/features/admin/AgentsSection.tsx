// BAMBEH_DEPLOY_TOKEN__AGENTSSECTION_FIX508_CLEAN
/**
 * src/features/admin/AgentsSection.tsx - Bambeh Admin Command Center
 *
 * FIX508 - MARKETING AGENTS.
 * ------------------------------------------------------------------
 * TWO NUMBERS PER AGENT, AND ONLY ONE OF THEM MEANS ANYTHING.
 *   SIGNED UP is how many accounts carried this agent\u2019s code. ACTIVATED is
 *   how many of those people came back on a later day or actually posted
 *   something. The first number can be manufactured in an afternoon with a
 *   tray of SIM cards. The second one cannot. Pay on the second.
 *
 * WHY EVERY AGENT HAS THEIR OWN CODE.
 *   Big asked for shared accounts with the password rotated town by town.
 *   That would erase the only thing worth measuring - who brought whom.
 *   Rotating a code here changes ONE agent, and the old code dies instantly.
 *
 * NO ZERM COINS ARE AWARDED HERE, BY ANYONE.
 *   Free awards are 0.0025 - not the 1, 10 and 100 promised by the four
 *   different ReferralButton components in this codebase. Nothing on this
 *   screen hands out coins; any bonus is a separate decision at an amount you
 *   set deliberately.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a user.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Loader2, AlertCircle, RefreshCw, UserPlus, X, Check, Copy,
  RotateCcw, Ban, TrendingUp, Users, Crown, ChevronRight,
} from 'lucide-react';
import {
  fetchAgentStats, fetchAgentDaily, createAgent, setAgentActive,
  rotateAgentCode, grantAgentPremium, fetchAgents,
  CM_REGIONS_FALLBACK, fetchRegions,
  type AgentStat, type AgentDay, type Agent,
  type AdminRole, type Capabilities,
} from './lib';

const INPUT = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function AgentsSection({
  userId, role, flash,
}: { userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void }) {

  const [stats, setStats] = useState<AgentStat[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>(CM_REGIONS_FALLBACK);
  const [open, setOpen] = useState<string | null>(null);
  const [daily, setDaily] = useState<AgentDay[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ full_name: string; phone: string; region: string; town: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, a] = await Promise.all([fetchAgentStats(), fetchAgents()]);
    setStats(s.rows);
    setAgents(a.rows);
    setFailed(s.failed && a.failed);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { (async () => { setRegions(await fetchRegions()); })(); }, []);

  const openAgent = async (id: string) => {
    if (open === id) { setOpen(null); return; }
    setOpen(id);
    setDaily(await fetchAgentDaily(id, 14));
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.full_name.trim()) { flash('A name is required.'); return; }
    setSaving(true);
    try {
      const row = await createAgent(userId, role, draft.full_name.trim(),
        draft.phone.trim() || null, draft.region || null, draft.town.trim() || null);
      setDraft(null);
      flash(row?.code ? `Agent created. Code ${row.code}` : 'Agent created.');
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not create that agent.');
    } finally { setSaving(false); }
  };

  const rotate = async (a: AgentStat) => {
    setBusy(a.agent_id);
    try {
      const code = await rotateAgentCode(userId, role, a.agent_id);
      flash(`New code: ${code}. The old one no longer works.`);
      await load();
    } catch (e) { flash(e instanceof Error ? e.message : 'Could not rotate that code.'); }
    finally { setBusy(null); }
  };

  const toggle = async (a: AgentStat) => {
    setBusy(a.agent_id);
    try {
      await setAgentActive(userId, role, a.agent_id, !a.is_active);
      flash(a.is_active ? 'Agent disabled. Their code stops working.' : 'Agent enabled.');
      await load();
    } catch (e) { flash(e instanceof Error ? e.message : 'Could not change that.'); }
    finally { setBusy(null); }
  };

  const premium = async (a: AgentStat) => {
    const row = agents.find((x) => x.id === a.agent_id);
    if (!row?.user_id) {
      flash('This agent has no Bambeh account linked yet. They must register with their code first.');
      return;
    }
    setBusy(a.agent_id);
    try {
      const res = await grantAgentPremium(userId, role, row.user_id);
      flash(res.detail);
    } finally { setBusy(null); }
  };

  const copyLink = async (code: string) => {
    const url = `${window.location.origin}/#/register?agent=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(code);
      window.setTimeout(() => setCopied(null), 2500);
    } catch { flash(url); }
  };

  const totalSignups = stats.reduce((t, s) => t + Number(s.signups ?? 0), 0);
  const totalActive = stats.reduce((t, s) => t + Number(s.activated ?? 0), 0);
  const rate = totalSignups > 0 ? Math.round((totalActive / totalSignups) * 100) : 0;

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Marketing agents
          </h1>
          <p className="text-xs text-gray-500">
            Signed up is what they claim. Activated is what happened. Judge on the second.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={load} title="Refresh"
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setDraft({ full_name: '', phone: '', region: '', town: '' })}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-3 py-2 rounded-xl">
            <UserPlus className="w-4 h-4" /> New agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 my-4">
        <Stat label="Signed up" value={String(totalSignups)} tone="text-gray-900" />
        <Stat label="Activated" value={String(totalActive)} tone="text-emerald-700" />
        <Stat label="Stuck rate" value={`${100 - rate}%`} tone={rate < 40 ? 'text-red-700' : 'text-gray-900'} />
      </div>

      {failed ? (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Could not read agent figures</p>
            <p className="text-xs mt-0.5">This is a failure, not an absence of agents.</p>
          </div>
          <button onClick={load} className="shrink-0 text-xs font-bold text-red-700 hover:underline">Retry</button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10 text-indigo-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {stats.map((a) => {
            const pct = Number(a.signups) > 0
              ? Math.round((Number(a.activated) / Number(a.signups)) * 100) : 0;
            return (
              <div key={a.agent_id} className="bg-white rounded-xl border border-gray-100">
                <button onClick={() => openAgent(a.agent_id)}
                  className="w-full flex items-center gap-3 p-3 text-left">
                  <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                    a.is_active ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                    <Users className={`w-4 h-4 ${a.is_active ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {a.full_name}
                      {!a.is_active ? (
                        <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">DISABLED</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      <span className="font-mono font-bold text-indigo-600">{a.code}</span>
                      {[a.town, a.region].filter(Boolean).length
                        ? ` \u00b7 ${[a.town, a.region].filter(Boolean).join(', ')}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-gray-900">
                      {a.activated}<span className="text-gray-300 font-bold"> / {a.signups}</span>
                    </p>
                    <p className={`text-[11px] font-bold ${pct >= 40 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {pct}% stuck
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 text-gray-300 transition-transform ${
                    open === a.agent_id ? 'rotate-90' : ''}`} />
                </button>

                {open === a.agent_id ? (
                  <div className="border-t border-gray-100 p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="font-black text-gray-900 text-base">{a.today}</p>
                        <p className="text-gray-500">today</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="font-black text-gray-900 text-base">{a.this_week}</p>
                        <p className="text-gray-500">this week</p>
                      </div>
                    </div>

                    {daily.length ? (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 mb-1">Last 14 days</p>
                        <div className="space-y-1">
                          {daily.map((d) => (
                            <div key={d.day} className="flex items-center gap-2 text-[11px]">
                              <span className="w-16 shrink-0 text-gray-400">{d.day.slice(5)}</span>
                              <span className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <span className="block h-full bg-emerald-500"
                                  style={{ width: `${Math.min(100, Number(d.activated) * 12)}%` }} />
                              </span>
                              <span className="w-14 shrink-0 text-right text-gray-600">
                                {d.activated}/{d.signups}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Nothing in the last 14 days.</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => copyLink(a.code)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-2 rounded-xl">
                        {copied === a.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied === a.code ? 'Copied' : 'Copy their link'}
                      </button>
                      <button onClick={() => rotate(a)} disabled={busy === a.agent_id}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-2 rounded-xl disabled:opacity-50">
                        <RotateCcw className="w-3.5 h-3.5" /> New code
                      </button>
                      <button onClick={() => premium(a)} disabled={busy === a.agent_id}
                        className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-2 rounded-xl disabled:opacity-50">
                        <Crown className="w-3.5 h-3.5" /> Give premium
                      </button>
                      <button onClick={() => toggle(a)} disabled={busy === a.agent_id}
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-2 rounded-xl disabled:opacity-50 ${
                          a.is_active ? 'text-red-700 bg-red-50 hover:bg-red-100'
                                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}>
                        {a.is_active ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        {a.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          {stats.length === 0 && !failed ? (
            <div className="text-center py-10">
              <TrendingUp className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No agents yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Create one, hand them their link, and their signups appear here with a timestamp.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {draft ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => !saving && setDraft(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">New agent</h3>
              <button onClick={() => !saving && setDraft(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              The code is issued by the database and is unique. Give them the link, not the code alone.
            </p>

            <Field label="Full name" required>
              <input value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
                placeholder="Ngu Modest" className={INPUT} />
            </Field>
            <Field label="Phone" hint="How you reach them, not shown to users.">
              <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                placeholder="+237..." className={INPUT} dir="ltr" />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Region">
                <select value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                  className={INPUT}>
                  <option value="">Any</option>
                  {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Town">
                <input value={draft.town} onChange={(e) => setDraft({ ...draft, town: e.target.value })}
                  placeholder="Bafoussam" className={INPUT} />
              </Field>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setDraft(null)} disabled={saving}
                className="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl disabled:opacity-50">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
      <p className={`text-2xl font-black ${tone}`}>{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-gray-400 mt-1">{hint}</p> : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__AGENTSSECTION_FIX508__COMPLETE
