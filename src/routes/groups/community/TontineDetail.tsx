// BAMBEH_DEPLOY_TOKEN__TONTINEDETAIL_FIX161_CLEAN
/**
 * TontineDetail.tsx \u2014 Bambeh Marketplace (FIX161)
 * DEPLOY TO BOTH: src/routes/groups/community/TontineDetail.tsx (ROUTED /tontine/:id)
 *            AND: src/pages/TontineDetail.tsx (mirror copy if present)
 *
 * FIX161:
 *  \u2022 DEMO_GROUP fallback REMOVED \u2014 a non-existent id now shows the honest
 *    "Group not found" state instead of a fake sample group.
 *  \u2022 Full 5-language dictionary (EN/FR/Pidgin/AR-RTL/FF) for every visible
 *    label that was hardcoded English.
 *  \u2022 Join flow, member list, Message Organizer (in-app chat only) \u2014 unchanged.
 * \u00a9 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, DollarSign, Calendar, CheckCircle,
  Clock, Loader2, AlertCircle, Plus, Shield, MessageCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const T: Record<Lang, {
  msgOrganizer: string; about: string; noDesc: string; nextPayout: string;
  transparency: string; membersTitle: string; turn: string; youMember: string;
  join: string; joining: string; notFound: string; loadFail: string;
  backToTontine: string; invalidId: string; goBack: string;
  stOpen: string; stActive: string; stCompleted: string; stPaused: string;
  members: string; pool: string;
}> = {
  en: {
    msgOrganizer: 'Message Organizer', about: 'About', noDesc: 'No description provided.',
    nextPayout: 'Next payout', transparency: 'All transactions recorded transparently',
    membersTitle: 'Members', turn: 'Turn', youMember: 'You are a member of this group',
    join: 'Join', joining: 'Joining...', notFound: 'Group not found.',
    loadFail: 'Failed to load group.', backToTontine: 'Back to Tontine',
    invalidId: 'Invalid group ID', goBack: 'Go back',
    stOpen: 'open', stActive: 'active', stCompleted: 'completed', stPaused: 'paused',
    members: 'Members', pool: 'Pool',
  },
  fr: {
    msgOrganizer: "Contacter l'organisateur", about: '\u00c0 propos', noDesc: 'Aucune description fournie.',
    nextPayout: 'Prochain versement', transparency: 'Toutes les transactions sont enregistr\u00e9es de fa\u00e7on transparente',
    membersTitle: 'Membres', turn: 'Tour', youMember: 'Vous \u00eates membre de ce groupe',
    join: 'Rejoindre', joining: 'Adh\u00e9sion...', notFound: 'Groupe introuvable.',
    loadFail: 'Impossible de charger le groupe.', backToTontine: 'Retour \u00e0 la tontine',
    invalidId: 'ID de groupe invalide', goBack: 'Retour',
    stOpen: 'ouvert', stActive: 'actif', stCompleted: 'termin\u00e9', stPaused: 'en pause',
    members: 'Membres', pool: 'Cagnotte',
  },
  pidgin: {
    msgOrganizer: 'Message di Organizer', about: 'About am', noDesc: 'No description dey.',
    nextPayout: 'Next payout', transparency: 'All transaction dem dey recorded open-open',
    membersTitle: 'Members', turn: 'Turn', youMember: 'You be member for this group',
    join: 'Join', joining: 'We dey join you...', notFound: 'Group no dey.',
    loadFail: 'Group no gree load.', backToTontine: 'Go back Tontine',
    invalidId: 'Group ID no correct', goBack: 'Go back',
    stOpen: 'open', stActive: 'active', stCompleted: 'done', stPaused: 'pause',
    members: 'Members', pool: 'Pool',
  },
  ar: {
    msgOrganizer: '\u0645\u0631\u0627\u0633\u0644\u0629 \u0627\u0644\u0645\u0646\u0638\u0645', about: '\u062d\u0648\u0644', noDesc: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0648\u0635\u0641.',
    nextPayout: '\u0627\u0644\u062f\u0641\u0639\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629', transparency: '\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0645\u0633\u062c\u0644\u0629 \u0628\u0634\u0641\u0627\u0641\u064a\u0629',
    membersTitle: '\u0627\u0644\u0623\u0639\u0636\u0627\u0621', turn: '\u0627\u0644\u062f\u0648\u0631', youMember: '\u0623\u0646\u062a \u0639\u0636\u0648 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629',
    join: '\u0627\u0646\u0636\u0645', joining: '\u062c\u0627\u0631\u064d \u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645...', notFound: '\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629.',
    loadFail: '\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629.', backToTontine: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u062a\u0648\u0646\u062a\u064a\u0646',
    invalidId: '\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d', goBack: '\u0631\u062c\u0648\u0639',
    stOpen: '\u0645\u0641\u062a\u0648\u062d\u0629', stActive: '\u0646\u0634\u0637\u0629', stCompleted: '\u0645\u0643\u062a\u0645\u0644\u0629', stPaused: '\u0645\u062a\u0648\u0642\u0641\u0629',
    members: '\u0627\u0644\u0623\u0639\u0636\u0627\u0621', pool: '\u0627\u0644\u0635\u0646\u062f\u0648\u0642',
  },
  ff: {
    msgOrganizer: 'Neldu jofngetee\u0257o', about: 'Ba\u0257te', noDesc: 'Alaa sifaa.',
    nextPayout: 'Yo\u0253di aroore', transparency: 'Golle fof ina winndaa e laa\u0253al',
    membersTitle: 'Yim\u0253e', turn: 'Laawol', youMember: 'A ko tergal fedde ndee',
    join: 'Naatu', joining: 'Naatugol...', notFound: 'Fedde alaa.',
    loadFail: 'Fedde loowaaki.', backToTontine: 'Rutto to Tontine',
    invalidId: 'ID fedde mo\u01b4\u01b4aani', goBack: 'Rutto',
    stOpen: 'udditii', stActive: 'gollii', stCompleted: 'gasii', stPaused: 'dartii',
    members: 'Yim\u0253e', pool: 'Kaalis',
  },
};

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

// Plain helper \u2014 must NOT call hooks.
function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export default function TontineDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const langRaw = useLang() as unknown;
  const langKey = typeof langRaw === 'string' ? langRaw : (langRaw as { lang?: string })?.lang || 'en';
  const lang: Lang = (langKey in T ? langKey : 'en') as Lang;
  const s = T[lang];
  const isRtl = lang === 'ar';
  const dateLocale = lang === 'fr' ? 'fr-CM' : 'en-GB';

  const [group,    setGroup]    = useState<Group | null>(null);
  const [members,  setMembers]  = useState<Member[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [userId,   setUserId]   = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [joining,  setJoining]  = useState(false);

  const statusLabel = (status: string): string => {
    switch (status) {
      case 'active':    return s.stActive;
      case 'open':      return s.stOpen;
      case 'completed': return s.stCompleted;
      case 'paused':    return s.stPaused;
      default:          return status;
    }
  };

  const loadGroup = useCallback(async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      // FIX161: no demo fallback \u2014 a non-UUID id is simply not a real group.
      if (!isUUID(groupId)) {
        setError(s.notFound);
        setLoading(false);
        return;
      }

      const { data, error: dbErr } = await supabase
        .from('tontine_groups')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (dbErr) throw dbErr;
      if (!data) { setError(s.notFound); setLoading(false); return; }

      setGroup({
        id:              data.id,
        name:            data.name,
        description:     data.description || '',
        adminId:         data.admin_id,
        contributionXaf: data.contribution_amount,
        frequency:       data.frequency,
        maxMembers:      data.max_members,
        currentMembers:  data.member_count || 0,
        // FIX182: total_pool_xaf / next_payout_date do not exist on tontine_groups.
        totalPoolXaf:    Number(data.contribution_amount || 0) * Number(data.member_count || 0),
        nextPayoutDate:  null,
        status:          data.status,
      });

      const { data: memberData } = await supabase
        .from('tontine_members')
        .select('user_id, joined_at, payout_position, has_paid_current_round, profiles:user_id(full_name)')
        .eq('group_id', groupId)
        .order('payout_position', { ascending: true });

      if (memberData) {
        setMembers(memberData.map(m => ({
          userId:         m.user_id,
          displayName:    (m.profiles as any)?.full_name || 'Member',
          payoutPosition: m.payout_position,
          hasPaid:        m.has_paid_current_round,
          joinedAt:       m.joined_at,
        })));
        if (uid) setIsMember(memberData.some(m => m.user_id === uid));
      }
    } catch (e: unknown) {
      setError((e as Error).message || s.loadFail);
    } finally {
      setLoading(false);
    }
  }, [s.notFound, s.loadFail]);

  useEffect(() => {
    if (id) loadGroup(id);
    else { setError(s.invalidId); setLoading(false); }
  }, [id, loadGroup]);

  async function handleJoin() {
    if (!userId) { navigate('/login'); return; }
    if (!group || joining) return;
    setJoining(true);
    try {
      await supabase.from('tontine_members').insert({
        group_id:               group.id,
        user_id:                userId,
        payout_position:        group.currentMembers + 1,
        joined_at:              new Date().toISOString(),
        has_paid_current_round: false,
      });

      await supabase.rpc('increment_tontine_members', { group_id: group.id })
        .then(() => {}, () =>
          supabase
            .from('tontine_groups')
            .update({ member_count: group.currentMembers + 1 })
            .eq('id', group.id),
        );

      setIsMember(true);
      loadGroup(group.id);
    } catch {
      // silent - user can try again
    } finally {
      setJoining(false);
    }
  }

  function messageOrganizer() {
    if (!group) return;
    navigate(`/chat?userId=${group.adminId}&listingTitle=${encodeURIComponent(group.name)}`);
  }

  const fmt = (n: number) => `${n.toLocaleString('fr-CM')} XAF`;

  const canMessageOrganizer = !!group && !!group.adminId && userId !== group.adminId;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 mb-1">{error || s.notFound}</p>
          <button
            onClick={() => navigate('/tontine')}
            className="mt-4 text-purple-600 underline text-sm"
          >
            {s.backToTontine}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl"
          aria-label={s.goBack}
        >
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="font-bold text-gray-900 flex-1 truncate">{group.name}</h1>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
          group.status === 'active' ? 'bg-green-50 text-green-700' :
          group.status === 'open'   ? 'bg-yellow-50 text-yellow-700' :
                                      'bg-gray-100 text-gray-500'
        }`}>
          {statusLabel(group.status)}
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
            <p className="text-xs text-blue-600">{s.members}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-green-900">{fmt(group.totalPoolXaf)}</p>
            <p className="text-xs text-green-600">{s.pool}</p>
          </div>
        </div>

        {/* Message Organizer (in-app chat only) */}
        {canMessageOrganizer && (
          <button
            onClick={messageOrganizer}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-2xl transition"
          >
            <MessageCircle className="w-5 h-5" />
            {s.msgOrganizer}
          </button>
        )}

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-1">{s.about}</h3>
          <p className="text-sm text-gray-600">{group.description || s.noDesc}</p>
          {group.nextPayoutDate && (
            <div className="flex items-center gap-2 mt-3 text-xs text-teal-700 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {s.nextPayout}:{' '}
              {new Date(group.nextPayoutDate).toLocaleDateString(dateLocale, {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            {s.transparency}
          </div>
        </div>

        {/* Members list */}
        {members.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold text-gray-900 text-sm">{s.membersTitle} ({members.length})</h3>
            </div>
            <div className="divide-y">
              {members.map(m => (
                <div key={m.userId} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
                    {m.displayName[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.displayName}</p>
                    <p className="text-xs text-gray-400">{s.turn} #{m.payoutPosition}</p>
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
            <p className="text-sm font-semibold text-green-800">{s.youMember}</p>
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
              ? <><Loader2 className="w-4 h-4 animate-spin" />{s.joining}</>
              : <><Plus className="w-4 h-4" />{s.join} - {fmt(group.contributionXaf)}/{group.frequency}</>}
          </button>
        </div>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__TONTINEDETAIL_FIX161__COMPLETE
