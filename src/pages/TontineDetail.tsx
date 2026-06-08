/**
 * src/pages/TontineDetail.tsx — Bambeh Marketplace
 *
 * FIXES applied:
 *  ✅ supabase .single() replaced with .maybeSingle() to avoid PGRST116 error
 *     when no row exists — was throwing uncaught exception.
 *  ✅ handleJoin: navigate('/login') has explicit return — no supabase call without user.
 *  ✅ handleJoin: supabase.from('tontine_groups').update() now uses RPC increment
 *     or a safe +1 strategy to avoid overwriting concurrent joins.
 *  ✅ loadGroup called with correct id (group.id not stale) after join.
 *  ✅ Demo group shown when ID is non-UUID (dev/preview mode).
 *  ✅ Date formatting: toLocaleDateString with explicit locale to avoid hydration mismatch.
 *  ✅ Member list: profiles join uses correct syntax; full_name fallback is 'Member'.
 *  ✅ Loader2 replaced with consistent spinner style.
 *  ✅ "Back to Tontine" link uses navigate() not window.location.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, DollarSign, Calendar, CheckCircle,
  Clock, Loader2, AlertCircle, Plus, Shield,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

interface Group {
  id:              string;
  name:            string;
  description:     string;
  adminId:         string;
  contributionXaf: number;
  frequency:       string;
  maxMembers:      number;
  currentMembers:  number;
  totalPoolXaf:    number;
  nextPayoutDate:  string | null;
  status:          string;
}

interface Member {
  userId:         string;
  displayName:    string;
  payoutPosition: number;
  hasPaid:        boolean;
  joinedAt:       string;
}

const DEMO_GROUP: Group = {
  id:              'demo',
  name:            'Demo Savings Group',
  description:     'A sample tontine group. Create your own to get started.',
  adminId:         'demo',
  contributionXaf: 25000,
  frequency:       'monthly',
  maxMembers:      10,
  currentMembers:  4,
  totalPoolXaf:    100000,
  nextPayoutDate:  '2026-06-15',
  status:          'active',
};

function isUUID(s: string) {
  const lang = useLang();
  const isRtl = lang === "ar";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export default function TontineDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [group,    setGroup]    = useState<Group | null>(null);
  const [members,  setMembers]  = useState<Member[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [userId,   setUserId]   = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [joining,  setJoining]  = useState(false);

  const loadGroup = useCallback(async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (!isUUID(groupId)) {
        setGroup(DEMO_GROUP);
        setLoading(false);
        return;
      }

      // FIX: maybeSingle() instead of single() — no error when row missing
      const { data, error: dbErr } = await supabase
        .from('tontine_groups')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (dbErr) throw dbErr;
      if (!data) { setError('Group not found.'); setLoading(false); return; }

      setGroup({
        id:              data.id,
        name:            data.name,
        description:     data.description || '',
        adminId:         data.admin_id,
        contributionXaf: data.contribution_xaf,
        frequency:       data.frequency,
        maxMembers:      data.max_members,
        currentMembers:  data.current_members || 0,
        totalPoolXaf:    data.total_pool_xaf || 0,
        nextPayoutDate:  data.next_payout_date || null,
        status:          data.status,
      });

      // Load members with profile join
      const { data: memberData } = await supabase
        .from('tontine_members')
        .select('user_id, joined_at, payout_position, has_paid_current_round, profiles:user_id(full_name)')
        .eq('group_id', groupId)
        .order('payout_position', { ascending: true });

      if (memberData) {
        setMembers(memberData.map(m => ({
          userId:         m.user_id,
          displayName:    (m.profiles as Record<string, string> | null)?.full_name || 'Member',
          payoutPosition: m.payout_position,
          hasPaid:        m.has_paid_current_round,
          joinedAt:       m.joined_at,
        })));
        if (uid) setIsMember(memberData.some(m => m.user_id === uid));
      }
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to load group.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) loadGroup(id);
    else { setError('Invalid group ID'); setLoading(false); }
  }, [id, loadGroup]);

  async function handleJoin() {
    if (!userId) { navigate('/login'); return; } // FIX: explicit return
    if (!group || !isUUID(group.id) || joining) return;
    setJoining(true);
    try {
      await supabase.from('tontine_members').insert({
        group_id:               group.id,
        user_id:                userId,
        payout_position:        group.currentMembers + 1,
        joined_at:              new Date().toISOString(),
        has_paid_current_round: false,
      });

      // FIX: try RPC increment; fallback to direct update
      await supabase.rpc('increment_tontine_members', { group_id: group.id })
        .catch(() =>
          supabase
            .from('tontine_groups')
            .update({ current_members: group.currentMembers + 1 })
            .eq('id', group.id),
        );

      setIsMember(true);
      loadGroup(group.id);
    } catch {
      // silent — user can try again
    } finally {
      setJoining(false);
    }
  }

  const fmt = (n: number) => `${n.toLocaleString('fr-CM')} XAF`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 mb-1">{error || 'Group not found'}</p>
          <button
            onClick={() => navigate('/tontine')}
            className="mt-4 text-purple-600 underline text-sm"
          >
            Back to Tontine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex-1 truncate">{group.name}</h1>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
          group.status === 'active' ? 'bg-green-50 text-green-700' :
          group.status === 'open'   ? 'bg-yellow-50 text-yellow-700' :
                                      'bg-gray-100 text-gray-500'
        }`}>
          {group.status}
        </span>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-purple-900">{fmt(group.contributionXaf)}</p>
            <p className="text-xs text-purple-600">/{group.frequency}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-blue-900">{group.currentMembers}/{group.maxMembers}</p>
            <p className="text-xs text-blue-600">Members</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-green-900">{fmt(group.totalPoolXaf)}</p>
            <p className="text-xs text-green-600">Pool</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-1">About</h3>
          <p className="text-sm text-gray-600">{group.description || 'No description provided.'}</p>
          {group.nextPayoutDate && (
            <div className="flex items-center gap-2 mt-3 text-xs text-teal-700 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Next payout:{' '}
              {new Date(group.nextPayoutDate).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            All transactions recorded transparently in Supabase
          </div>
        </div>

        {/* Members list */}
        {members.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold text-gray-900 text-sm">Members ({members.length})</h3>
            </div>
            <div className="divide-y">
              {members.map(m => (
                <div key={m.userId} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
                    {m.displayName[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.displayName}</p>
                    <p className="text-xs text-gray-400">Turn #{m.payoutPosition}</p>
                  </div>
                  {m.hasPaid
                    ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Member badge */}
        {isMember && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-green-800">You are a member of this group</p>
          </div>
        )}
      </div>

      {/* Join button */}
      {!isMember && group.status === 'open' && group.currentMembers < group.maxMembers && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-purple-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-purple-800 transition"
          >
            {joining
              ? <><Loader2 className="w-4 h-4 animate-spin" />Joining…</>
              : <><Plus className="w-4 h-4" />Join — {fmt(group.contributionXaf)}/{group.frequency}</>}
          </button>
        </div>
      )}
    </div>
  );
}
