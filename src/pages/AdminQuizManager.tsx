// BAMBEH_DEPLOY_TOKEN__ADMINQUIZMANAGER_FIX165_CLEAN
/**
 * AdminQuizManager.tsx \u2014 Bambeh Quiz staff console (FIX165)
 * DEPLOY: src/pages/AdminQuizManager.tsx   (route /admin/quiz added by App FIX166)
 *
 * Big's rules, enforced twice (here for UX, and in fix164 SQL for security):
 *  \u2022 Moderators can compose Tier 1-2 only; Tier 3-5 need admin/super
 *  \u2022 Every question needs ADMIN/SUPER approval before going live
 *  \u2022 Admin sets the FINAL reward at approval (override box + total cost preview)
 *  \u2022 Rewards above 1 Zerm/winner require the SUPER admin (SQL enforces)
 * \u00a9 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trophy, ShieldAlert, Loader2, CheckCircle2, XCircle,
  Send, StopCircle, RefreshCw, Coins, Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Q {
  id: string; question: string; correct_answer: string; options: string[] | null;
  reward_zerm: number; tier: number; max_winners: number; per_region_cap: number;
  min_subdivisions: number; status: string; created_by: string; ends_at: string | null;
  created_at: string;
}

const TIERS = [
  { tier: 1, total: 100,       perRegion: 10,      minSub: 0,   roles: 'Moderator+' },
  { tier: 2, total: 1000,      perRegion: 100,     minSub: 0,   roles: 'Moderator+' },
  { tier: 3, total: 10000,     perRegion: 1000,    minSub: 5,   roles: 'Admin/Super only' },
  { tier: 4, total: 100000,    perRegion: 10000,   minSub: 50,  roles: 'Admin/Super only' },
  { tier: 5, total: 1000000,   perRegion: 100000,  minSub: 500, roles: 'Admin/Super only' },
];

const fmt = (n: number) => n.toLocaleString('en-US');
const fmtZ = (n: number) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 6 });

export default function AdminQuizManager() {
  const navigate = useNavigate();

  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isStaff = isAdmin || role === 'moderator';

  const [tab, setTab] = useState<'compose' | 'pending' | 'live'>('compose');
  const [items, setItems] = useState<Q[]>([]);
  const [stats, setStats] = useState<Record<string, { answers: number; winners: number }>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  // Compose state
  const [question, setQuestion] = useState('');
  const [correct, setCorrect] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [tier, setTier] = useState(1);
  const [reward, setReward] = useState('0.00025');
  const [hours, setHours] = useState('24');
  const [submitting, setSubmitting] = useState(false);

  // Approval overrides
  const [rewardEdit, setRewardEdit] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadRole = useCallback(async () => {
    setChecking(true);
    try {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth?.session?.user) { setRole(null); return; }
      const { data } = await supabase.from('profiles').select('admin_role').eq('id', auth.session.user.id).maybeSingle();
      setRole(data?.admin_role ?? null);
    } catch { setRole(null); }
    finally { setChecking(false); }
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(40);
      const rows = (data ?? []) as Q[];
      setItems(rows);
      const liveIds = rows.filter(r => r.status === 'live' || r.status === 'ended').map(r => r.id);
      if (liveIds.length > 0) {
        const { data: ans } = await supabase
          .from('quiz_answers')
          .select('question_id, is_winner')
          .in('question_id', liveIds);
        const agg: Record<string, { answers: number; winners: number }> = {};
        (ans ?? []).forEach((a: { question_id: string; is_winner: boolean }) => {
          agg[a.question_id] = agg[a.question_id] || { answers: 0, winners: 0 };
          agg[a.question_id].answers += 1;
          if (a.is_winner) agg[a.question_id].winners += 1;
        });
        setStats(agg);
      }
    } catch (e) { console.error('[AdminQuiz] load failed:', e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRole(); }, [loadRole]);
  useEffect(() => { if (isStaff) loadItems(); }, [isStaff, loadItems]);

  const compose = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const opts = optionsText.split('\n').map(o => o.trim()).filter(Boolean);
      const { error } = await supabase.rpc('create_quiz', {
        p_question: question.trim(),
        p_correct: correct.trim(),
        p_tier: tier,
        p_options: opts.length > 0 ? opts : null,
        p_reward: Number(reward) || 0.00025,
        p_ends_at: null,
      });
      if (error) throw error;
      setQuestion(''); setCorrect(''); setOptionsText('');
      flash('Question sent for admin approval \u2713');
      setTab('pending');
      loadItems();
    } catch (e: unknown) {
      flash((e as { message?: string })?.message || 'Could not create question');
    } finally { setSubmitting(false); }
  };

  const approve = async (q: Q) => {
    setBusyId(q.id);
    try {
      const override = rewardEdit[q.id];
      const endsAt = new Date(Date.now() + (Number(hours) || 24) * 3600000).toISOString();
      const { error } = await supabase.rpc('approve_quiz', {
        p_id: q.id,
        p_reward: override ? Number(override) : null,
        p_ends_at: endsAt,
      });
      if (error) throw error;
      flash('Quiz is LIVE \u2713');
      loadItems();
    } catch (e: unknown) {
      flash((e as { message?: string })?.message || 'Approve failed');
    } finally { setBusyId(null); }
  };

  const reject = async (q: Q) => {
    setBusyId(q.id);
    try {
      const { error } = await supabase.rpc('reject_quiz', { p_id: q.id });
      if (error) throw error;
      flash('Rejected');
      loadItems();
    } catch (e: unknown) { flash((e as { message?: string })?.message || 'Reject failed'); }
    finally { setBusyId(null); }
  };

  const endQuiz = async (q: Q) => {
    setBusyId(q.id);
    try {
      const { error } = await supabase.rpc('end_quiz', { p_id: q.id });
      if (error) throw error;
      flash('Quiz ended');
      loadItems();
    } catch (e: unknown) { flash((e as { message?: string })?.message || 'End failed'); }
    finally { setBusyId(null); }
  };

  const canPickTier = (t: number) => (t <= 2 ? isStaff : isAdmin);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>;
  }
  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="text-center max-w-sm">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-bold text-gray-800 mb-1">Staff access only</p>
          <p className="text-sm text-gray-500">This console is for Bambeh moderators, admins and the super admin.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-amber-700 underline text-sm">Back to Home</button>
        </div>
      </div>
    );
  }

  const pending = items.filter(i => i.status === 'pending_approval');
  const liveEnded = items.filter(i => i.status === 'live' || i.status === 'ended');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 pt-5 pb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-300 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={loadItems} aria-label="Refresh" className="bg-white/10 p-2 rounded-xl"><RefreshCw className="w-4 h-4" /></button>
        </div>
        <h1 className="text-xl font-bold flex items-center gap-2 mt-1"><Trophy className="w-5 h-5 text-amber-400" /> Quiz Manager</h1>
        <p className="text-gray-300 text-xs mt-1">Role: <span className="font-semibold text-amber-300">{role}</span> \u2014 moderators compose T1-T2; every quiz goes live only after admin approval.</p>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-3 max-w-lg mx-auto">
        <div className="flex gap-2 mb-4">
          {(['compose', 'pending', 'live'] as const).map(tk => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === tk ? 'bg-gray-900 text-white' : 'bg-white border text-gray-600'}`}
            >
              {tk === 'compose' ? 'Compose' : tk === 'pending' ? `Pending (${pending.length})` : `Live/Ended (${liveEnded.length})`}
            </button>
          ))}
        </div>

        {loading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>}

        {/* ============ COMPOSE ============ */}
        {tab === 'compose' && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Trick question *</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
                placeholder="e.g. Which Bambeh section lets you save money together with friends?"
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Correct answer * (matching ignores case/spaces)</label>
              <input value={correct} onChange={e => setCorrect(e.target.value)} placeholder="e.g. Tontine"
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Multiple-choice options (optional \u2014 one per line; leave empty for free text)</label>
              <textarea value={optionsText} onChange={e => setOptionsText(e.target.value)} rows={3}
                placeholder={'Tontine\nExchange\nFarm Fresh'}
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
            </div>

            {/* Tier picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Winner limit tier (STRICT \u2014 zero coins past the cap)</label>
              <div className="space-y-2">
                {TIERS.map(t => {
                  const allowed = canPickTier(t.tier);
                  return (
                    <button
                      key={t.tier}
                      type="button"
                      disabled={!allowed}
                      onClick={() => setTier(t.tier)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition ${
                        tier === t.tier ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                      } ${!allowed ? 'opacity-40 cursor-not-allowed' : 'hover:border-amber-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">T{t.tier} \u2014 first {fmt(t.total)}</span>
                        <span className="text-[10px] font-bold text-gray-400">{t.roles}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fmt(t.perRegion)} per region{t.minSub > 0 ? ` \u2022 spread across \u2265${t.minSub} subdivisions per region` : ''}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reward (Zerm / winner)</label>
                <input value={reward} onChange={e => setReward(e.target.value)} type="number" step="0.00025" min="0.00025"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                <p className="text-[10px] text-gray-400 mt-1">0.00025 Zerm = 0.025 FCFA. Admin sets the final prize at approval.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Duration (hours, set at approval)</label>
                <input value={hours} onChange={e => setHours(e.target.value)} type="number" min="1"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>

            {/* Cost preview */}
            <div className="bg-gray-50 border rounded-xl p-3 text-xs text-gray-600">
              Max cost if the cap fills: <strong>{fmtZ((Number(reward) || 0) * (TIERS.find(t => t.tier === tier)?.total || 0))} Zerm</strong>
              {' '}({fmt(Math.round((Number(reward) || 0) * (TIERS.find(t => t.tier === tier)?.total || 0) * 100))} FCFA at 1 Zerm = 100 FCFA)
            </div>

            <button
              onClick={compose}
              disabled={submitting || question.trim().length < 5 || !correct.trim()}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send for admin approval
            </button>
          </div>
        )}

        {/* ============ PENDING ============ */}
        {tab === 'pending' && !loading && (
          <div className="space-y-3">
            {pending.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-500 border border-gray-100">Nothing pending approval.</div>
            )}
            {pending.map(q => (
              <div key={q.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
                <p className="font-semibold text-gray-900 text-sm">{q.question}</p>
                <p className="text-xs text-gray-500">Answer: <strong>{q.correct_answer}</strong>{Array.isArray(q.options) && q.options.length > 0 ? ` \u2022 MCQ: ${q.options.join(' / ')}` : ' \u2022 free text'}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> T{q.tier}: first {fmt(q.max_winners)} \u2022 {fmt(q.per_region_cap)}/region
                  {q.min_subdivisions > 0 ? ` \u2022 \u2265${q.min_subdivisions} subdivisions/region` : ''}
                </p>
                {isAdmin ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <input
                        type="number" step="0.00025" min="0.00025"
                        value={rewardEdit[q.id] ?? String(q.reward_zerm)}
                        onChange={e => setRewardEdit(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-xs text-gray-400">Zerm/winner</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Max cost: {fmtZ(Number(rewardEdit[q.id] ?? q.reward_zerm) * q.max_winners)} Zerm.
                      Above 1 Zerm/winner needs the super admin.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => approve(q)} disabled={busyId === q.id}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                        {busyId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve & go LIVE
                      </button>
                      <button onClick={() => reject(q)} disabled={busyId === q.id}
                        className="py-2.5 px-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">Waiting for admin approval.</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ============ LIVE / ENDED ============ */}
        {tab === 'live' && !loading && (
          <div className="space-y-3">
            {liveEnded.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-500 border border-gray-100">No live or ended quizzes yet.</div>
            )}
            {liveEnded.map(q => {
              const st = stats[q.id] || { answers: 0, winners: 0 };
              return (
                <div key={q.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${q.status === 'live' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                      {q.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">T{q.tier} \u2022 {fmtZ(q.reward_zerm)} Zerm/winner</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{q.question}</p>
                  <p className="text-xs text-gray-600">
                    Answers: <strong>{fmt(st.answers)}</strong> \u2022 Winners: <strong>{fmt(st.winners)}</strong> / {fmt(q.max_winners)}
                    {' '}\u2022 Paid out: <strong>{fmtZ(st.winners * Number(q.reward_zerm))} Zerm</strong>
                  </p>
                  {q.status === 'live' && (
                    <button onClick={() => endQuiz(q)} disabled={busyId === q.id}
                      className="w-full py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                      <StopCircle className="w-3.5 h-3.5" /> End this quiz now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">{toast}</div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMINQUIZMANAGER_FIX165__COMPLETE
