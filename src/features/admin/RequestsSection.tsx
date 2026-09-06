// BAMBEH_DEPLOY_TOKEN__REQUESTSSECTION_FIX489_CLEAN
/**
 * src/features/admin/RequestsSection.tsx — Bambeh Admin Command Center
 *
 * FIX489 — THE TWO THINGS WAITING ON A HUMAN.
 * ───────────────────────────────────────────
 * Two queues, one screen, because both are the same job: somebody outside
 * Bambeh is waiting for a person inside Bambeh to decide.
 *
 *   PASSWORD RESETS — a locked-out user who has answered the identity
 *   questions. FIX487 graded those answers in the database and the score
 *   travels with the request, so a moderator opens this and can already see
 *   what was proven. What is NOT proven is what they ask about on the call.
 *
 *   VERIFY LISTINGS — a pharmacy or hospital that submitted its own details.
 *   Nothing submitted is visible to users until someone here approves it. For
 *   a hospital that is not a nicety: a wrong number at 2am is real harm.
 *
 * WHY THE RESET CARD SHOWS THE ACCOUNT'S HISTORY
 *   Registered date, items posted, last sign-in. A moderator needs something
 *   only the real owner could know. The identity questions are the first
 *   filter; this is what makes the second one possible.
 *
 * REJECTING ALWAYS NEEDS A REASON
 *   Refusing someone their own account, or refusing a business a listing,
 *   should never be silent. The database enforces it too — this is not the
 *   only guard, just the friendlier one.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a user.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Loader2, AlertCircle, RefreshCw, KeyRound, ShieldCheck, Check, X,
  MessageCircle, Phone, Clock, Inbox, Building2, Cross, Stethoscope,
} from 'lucide-react';
import {
  fetchResetRequests, resolveResetRequest,
  fetchProviderSubmissions, verifyProvider, resetWhatsappUrl,
  type ResetRequest, type ProviderSubmission,
  type AdminRole, type Capabilities,
} from './lib';

type Tab = 'resets' | 'providers';

const QUESTION_LABEL: Record<string, string> = {
  last_sign_in: 'last sign-in',
  created_at: 'when they joined',
  posted: 'what they posted',
  full_name: 'name on account',
};

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export default function RequestsSection({
  userId, role, cap, flash,
}: { userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void }) {

  const [tab, setTab] = useState<Tab>('resets');

  const [resets, setResets] = useState<ResetRequest[]>([]);
  const [resetErr, setResetErr] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderSubmission[]>([]);
  const [provErr, setProvErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [r, p] = await Promise.all([fetchResetRequests(), fetchProviderSubmissions()]);
    setResets(r.rows);
    setProviders(p.rows);
    // A failed load must never render as "nothing is waiting".
    setResetErr(r.ok ? null : (r.error || 'Could not load reset requests.'));
    setProvErr(p.ok ? null : (p.error || 'Could not load submissions.'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const closeReset = async (r: ResetRequest, status: 'sent' | 'rejected' | 'done') => {
    let note: string | null = null;
    if (status === 'rejected') {
      note = window.prompt('Why are you refusing this request? The reason is recorded.');
      if (!note || !note.trim()) { flash('A reason is required to reject.'); return; }
    }
    setBusy(r.id);
    try {
      await resolveResetRequest(userId, role, r.id, status,
        status === 'rejected' ? null : 'whatsapp', note);
      flash(status === 'rejected' ? 'Request refused.' : 'Request closed.');
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not update that request.');
    } finally { setBusy(null); }
  };

  const decide = async (p: ProviderSubmission, approve: boolean) => {
    let reason: string | null = null;
    if (!approve) {
      reason = window.prompt(`Why are you rejecting ${p.name}? The reason is recorded.`);
      if (!reason || !reason.trim()) { flash('A reason is required to reject.'); return; }
    }
    setBusy(p.id);
    try {
      await verifyProvider(userId, role, p.kind, p.id, approve, reason);
      flash(approve ? `${p.name} is now visible to users.` : `${p.name} rejected.`);
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not record that decision.');
    } finally { setBusy(null); }
  };

  const TAB = 'flex-1 rounded-xl py-2.5 text-sm font-semibold border transition-colors flex items-center justify-center gap-2';

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Requests</h1>
      <p className="text-xs text-gray-500 mb-4">
        People waiting on a decision from you. Nothing here reaches users until someone acts.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button onClick={() => setTab('resets')}
          className={`${TAB} ${tab === 'resets' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}>
          <KeyRound className="w-4 h-4" /> Password resets
          {resets.length > 0 ? (
            <span className={`text-[10px] rounded-full px-1.5 ${tab === 'resets' ? 'bg-white/25' : 'bg-blue-50 text-blue-700'}`}>
              {resets.length}
            </span>
          ) : null}
        </button>
        <button onClick={() => setTab('providers')}
          className={`${TAB} ${tab === 'providers' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-200'}`}>
          <ShieldCheck className="w-4 h-4" /> Verify listings
          {providers.length > 0 ? (
            <span className={`text-[10px] rounded-full px-1.5 ${tab === 'providers' ? 'bg-white/25' : 'bg-teal-50 text-teal-700'}`}>
              {providers.length}
            </span>
          ) : null}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : tab === 'resets' ? (
        <Queue
          error={resetErr} onRetry={load}
          empty="No password reset requests waiting."
          emptyHint="When someone answers the identity questions correctly, they appear here."
          rows={resets.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {r.account_name || 'Unknown account'}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {r.phone ? `+${r.phone}` : (r.email || '—')}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5 ${
                  r.matched_user_id ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                }`}>
                  {r.matched_user_id ? `${r.verify_score ?? 0} of 4 proven` : 'no account found'}
                </span>
              </div>

              {/* What the SERVER already proved, so nobody re-asks it. */}
              {r.verify_detail ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(r.verify_detail).map(([k, ok]) => (
                    <span key={k} className={`text-[10px] rounded-full px-2 py-0.5 ${
                      ok ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {ok ? '✓' : '✕'} {QUESTION_LABEL[k] ?? k}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* What to ask about on the call. */}
              {r.matched_user_id ? (
                <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-gray-500">
                  <span>Joined {when(r.registered_at)}</span>
                  <span>{r.listings_count ?? 0} items posted</span>
                  <span>Seen {when(r.last_sign_in)}</span>
                </div>
              ) : (
                <p className="text-[11px] text-amber-800 mt-2">
                  No Bambeh account matches this number. Take extra care before releasing anything.
                </p>
              )}

              <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> asked {when(r.created_at)}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <a href={r.phone ? resetWhatsappUrl(r.phone, '<paste the link here>') : undefined}
                  target="_blank" rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl ${
                    r.phone ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-gray-100 text-gray-400 pointer-events-none'}`}>
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <button onClick={() => closeReset(r, 'done')} disabled={busy === r.id}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 py-2 rounded-xl disabled:opacity-50">
                  <Check className="w-3.5 h-3.5" /> Done
                </button>
                <button onClick={() => closeReset(r, 'rejected')} disabled={busy === r.id}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 py-2 rounded-xl disabled:opacity-50">
                  <X className="w-3.5 h-3.5" /> Refuse
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">
                Generate the link from the Users list, then send it here.
              </p>
            </div>
          ))}
        />
      ) : (
        <Queue
          error={provErr} onRetry={load}
          empty="Nothing waiting to be checked."
          emptyHint="Pharmacies and hospitals that submit their own details appear here first."
          rows={providers.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                p.kind === 'pharmacy' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                {p.kind === 'pharmacy'
                  ? <Cross className="w-4 h-4 text-emerald-600" />
                  : <Stethoscope className="w-4 h-4 text-rose-600" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {[p.quarter, p.town].filter(Boolean).join(' · ')}
                  {p.phone ? ` · ${p.phone}` : ' · no number'}
                </p>
                <p className="text-[11px] text-gray-400">submitted {when(p.created_at)}</p>
              </div>
              <button onClick={() => decide(p, true)} disabled={busy === p.id}
                title="Approve — it becomes visible to users"
                className="shrink-0 p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => decide(p, false)} disabled={busy === p.id}
                title="Reject — a reason is required"
                className="shrink-0 p-2 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        />
      )}
    </>
  );
}

function Queue({ error, onRetry, empty, emptyHint, rows }: {
  error: string | null; onRetry: () => void;
  empty: string; emptyHint: string; rows: React.ReactNode[];
}) {
  if (error) {
    return (
      <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold">Could not load</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
        <button onClick={onRetry} className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="text-center py-10">
        <Inbox className="w-8 h-8 text-gray-200 mx-auto mb-2" />
        <p className="text-sm text-gray-400">{empty}</p>
        <p className="text-xs text-gray-400 mt-1">{emptyHint}</p>
      </div>
    );
  }
  return <div className="space-y-2">{rows}</div>;
}
// BAMBEH_END_TOKEN__REQUESTSSECTION_FIX489__COMPLETE
