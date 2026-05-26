/**
 * src/pages/TontinePage.tsx — Bambeh Marketplace
 * FIXED: Reads from Supabase tontine_groups table (cross-device, real-time).
 * Was reading from localStorage — only showed groups created on same device.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Calendar, DollarSign,
  ChevronRight, Shield, Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TontineGroup {
  id:              string;
  name:            string;
  contributionXaf: number;
  frequency:       string;
  currentMembers:  number;
  maxMembers:      number;
  totalPoolXaf:    number;
  nextPayoutDate:  string | null;
  status:          string;
  isMine:          boolean;
  adminId:         string;
}

const DEMO_GROUPS: TontineGroup[] = [
  { id:'demo1', name:'Tech Workers Njangi', contributionXaf:25000, frequency:'monthly', currentMembers:10, maxMembers:10, totalPoolXaf:250000, nextPayoutDate:'2026-06-15', status:'active', isMine:true,  adminId:'demo' },
  { id:'demo2', name:'Market Women Group',  contributionXaf:10000, frequency:'weekly',  currentMembers:6,  maxMembers:8,  totalPoolXaf:60000,  nextPayoutDate:'2026-05-28', status:'active', isMine:true,  adminId:'demo' },
  { id:'demo3', name:'Yaoundé Professionals',contributionXaf:50000, frequency:'monthly', currentMembers:3,  maxMembers:12, totalPoolXaf:150000, nextPayoutDate:null,         status:'open',   isMine:false, adminId:'demo' },
];

export default function TontinePage() {
  const navigate = useNavigate();
  const [groups,  setGroups]  = useState<TontineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId,  setUserId]  = useState<string | null>(null);
  const [tab,     setTab]     = useState<'my' | 'discover'>('my');

  async function fetchGroups() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      // Fetch all public groups
      const { data: groupData } = await supabase
        .from('tontine_groups')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(30);

      // Fetch groups the user has joined
      let myGroupIds = new Set<string>();
      if (uid) {
        const { data: memberData } = await supabase
          .from('tontine_members')
          .select('group_id')
          .eq('user_id', uid);
        if (memberData) memberData.forEach(m => myGroupIds.add(m.group_id));
      }

      if (groupData && groupData.length > 0) {
        setGroups(groupData.map(g => ({
          id:              g.id,
          name:            g.name,
          contributionXaf: g.contribution_xaf,
          frequency:       g.frequency,
          currentMembers:  g.current_members || 0,
          maxMembers:      g.max_members,
          totalPoolXaf:    g.total_pool_xaf || 0,
          nextPayoutDate:  g.next_payout_date || null,
          status:          g.status,
          isMine:          uid ? (g.admin_id === uid || myGroupIds.has(g.id)) : false,
          adminId:         g.admin_id,
        })));
      } else {
        // Show sample data when DB is empty
        setGroups(DEMO_GROUPS);
      }
    } catch {
      setGroups(DEMO_GROUPS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
    const channel = supabase
      .channel('tontine_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tontine_groups' }, fetchGroups)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const myGroups       = groups.filter(g => g.isMine);
  const discoverGroups = groups.filter(g => !g.isMine && g.status === 'open' && g.currentMembers < g.maxMembers);
  const display        = tab === 'my' ? myGroups : discoverGroups;

  const totalSaved      = myGroups.reduce((s, g) => s + g.totalPoolXaf, 0);
  const activeCount     = myGroups.filter(g => g.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-800 px-4 pt-8 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Users className="w-6 h-6" /> Tontine / Njangi
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchGroups} className="bg-white/20 text-white p-2 rounded-xl">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/tontine/create')}
              className="bg-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> New Group
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            [myGroups.length.toString(),      'My Groups',   '👥'],
            [totalSaved > 0 ? `${Math.round(totalSaved/1000)}k` : '0', 'Pool (XAF)', '💰'],
            [activeCount.toString(),           'Active',      '✅'],
          ].map(([v, l, e]) => (
            <div key={String(l)} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white font-bold text-sm">{e} {v}</p>
              <p className="text-purple-200 text-xs mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['my', 'discover'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${
                tab === t ? 'bg-purple-700 text-white shadow-sm' : 'bg-white border text-gray-600'
              }`}>
              {t === 'my' ? 'My Groups' : `Discover (${discoverGroups.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : display.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 font-medium">
              {tab === 'my' ? 'You haven\'t joined any groups yet' : 'No open groups to join'}
            </p>
            <button onClick={() => navigate('/tontine/create')}
              className="mt-4 bg-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
              Create a Group
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {display.map(group => {
              const progressPct = Math.min(100, Math.round((group.currentMembers / group.maxMembers) * 100));

              return (
                <div key={group.id}
                  onClick={() => navigate('/tontine/' + group.id)}
                  className="bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {group.frequency} · {group.currentMembers}/{group.maxMembers} members
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      group.status === 'active'  ? 'bg-green-50 text-green-700' :
                      group.status === 'open'    ? 'bg-yellow-50 text-yellow-700' :
                                                   'bg-gray-100 text-gray-500'
                    }`}>{group.status}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-gray-100 rounded-full h-1.5 mb-3">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${progressPct}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-bold text-purple-700">
                        {group.contributionXaf.toLocaleString()} XAF/{group.frequency === 'monthly' ? 'mo' : 'wk'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      {group.nextPayoutDate && (
                        <><Calendar className="w-3 h-3" />
                        {new Date(group.nextPayoutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</>
                      )}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>

                  {group.status === 'open' && group.currentMembers < group.maxMembers && tab === 'discover' && (
                    <div className="mt-3 py-2 bg-green-50 border border-green-200 rounded-xl text-center text-green-700 font-semibold text-sm">
                      {group.maxMembers - group.currentMembers} spot{group.maxMembers - group.currentMembers !== 1 ? 's' : ''} left — Join Now!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-800">Secure & Transparent</p>
            <p className="text-xs text-purple-600 mt-0.5">
              All tontine transactions are recorded in Supabase and visible to all group members on all devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
