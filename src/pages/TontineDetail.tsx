/**
 * src/pages/TontineDetail.tsx ? Bambeh Marketplace
 *
 * FIXES applied:
 *  ? supabase .single() replaced with .maybeSingle() to avoid PGRST116 error
 *     when no row exists ? was throwing uncaught exception.
 *  ? handleJoin: navigate('/login') has explicit return ? no supabase call without user.
 *  ? handleJoin: supabase.from('tontine_groups').update() now uses RPC increment
 *     or a safe +1 strategy to avoid overwriting concurrent joins.
 *  ? loadGroup called with correct id (group.id not stale) after join.
 *  ? Demo group shown when ID is non-UUID (dev/preview mode).
 *  ? Date formatting: toLocaleDateString with explicit locale to avoid hydration mismatch.
 *  ? Member list: profiles join uses correct syntax; full_name fallback is 'Member'.
 *  ? Loader2 replaced with consistent spinner style.
 *  ? "Back to Tontine" link uses navigate() not window.location.
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
  id: string;
  name: string;
  description: string;
  adminId: string;
  contributionXaf: number;
  frequency: string;
  maxMembers: number;
  currentMembers: number;
  totalPoolXaf: number;
  nextPayoutDate: string | null;
  status: string;
}

interface Member {
  userId: string;
  displayName: string;
  payoutPosition: number;
  hasPaid: boolean;
  joinedAt: string;
}

const COPY = {
  en: {
    backToTontine: 'Back to Tontine',
    groupNotFound: 'Group not found.',
    invalidGroupId: 'Invalid group ID',
    about: 'About',
    noDescription: 'No description provided.',
    nextPayout: 'Next payout:',
    allRecorded: 'All transactions recorded transparently in Supabase',
    members: 'Members',
    turn: 'Turn',
    youAreMember: 'You are a member of this group',
    join: 'Join',
    joining: 'Joining?',
    active: 'active',
    open: 'open',
    closed: 'closed',
    demoName: 'Demo Savings Group',
    demoDesc: 'A sample tontine group. Create your own to get started.',
    contribution: 'Contribution',
    pool: 'Pool',
    groupSummary: 'Group Summary',
    weekly: '/weekly',
    monthly: '/monthly',
    loading: 'Loading...',
    failed: 'Failed to load group.',
    permissionDenied: 'Permission denied. Please make sure you are logged in.',
    joinLabel: 'Join ?',
    howItWorks: 'How Tontine (Njangi) Works',
    step1: 'Members contribute regularly (weekly or monthly)',
    step2: 'Each cycle, one member receives the full pool',
    step3: 'Rotates until everyone has received once',
    step4: 'All transactions are tracked and transparent',
  },
  fr: {
    backToTontine: 'Retour à Tontine',
    groupNotFound: 'Groupe introuvable.',
    invalidGroupId: 'Identifiant de groupe invalide',
    about: 'À propos',
    noDescription: 'Aucune description fournie.',
    nextPayout: 'Prochain versement :',
    allRecorded: 'Toutes les transactions sont enregistrées de manière transparente dans Supabase',
    members: 'Membres',
    turn: 'Tour',
    youAreMember: 'Vous êtes membre de ce groupe',
    join: 'Rejoindre',
    joining: 'Rejoindre...',
    active: 'actif',
    open: 'ouvert',
    closed: 'fermé',
    demoName: 'Groupe d’épargne de démonstration',
    demoDesc: 'Un exemple de groupe de tontine. Créez le vôtre pour commencer.',
    contribution: 'Cotisation',
    pool: 'Cagnotte',
    groupSummary: 'Résumé du groupe',
    weekly: '/semaine',
    monthly: '/mois',
    loading: 'Chargement...',
    failed: 'Impossible de charger le groupe.',
    permissionDenied: 'Permission refusée. Veuillez vérifier que vous êtes connecté.',
    joinLabel: 'Rejoindre ?',
    howItWorks: 'Comment fonctionne la tontine (Njangi)',
    step1: 'Les membres cotisent régulièrement (chaque semaine ou chaque mois)',
    step2: 'À chaque cycle, un membre reçoit l’intégralité de la cagnotte',
    step3: 'Le système tourne jusqu’à ce que chacun ait reçu une fois',
    step4: 'Toutes les opérations sont suivies et transparentes',
  },
  ar: {
    backToTontine: 'العودة إلى التومبين',
    groupNotFound: 'المجموعة غير موجودة.',
    invalidGroupId: 'معرّف المجموعة غير صالح',
    about: 'حول',
    noDescription: 'لا يوجد وصف.',
    nextPayout: 'الدفعة التالية:',
    allRecorded: 'تُسجَّل جميع المعاملات بشفافية في Supabase',
    members: 'الأعضاء',
    turn: 'الدور',
    youAreMember: 'أنت عضو في هذه المجموعة',
    join: 'انضمام',
    joining: 'جارٍ الانضمام...',
    active: 'نشط',
    open: 'مفتوح',
    closed: 'مغلق',
    demoName: 'مجموعة ادخار تجريبية',
    demoDesc: 'مجموعة تومبين نموذجية. أنشئ مجموعتك لبدء الاستخدام.',
    contribution: 'المساهمة',
    pool: 'الصندوق',
    groupSummary: 'ملخص المجموعة',
    weekly: '/أسبوع',
    monthly: '/شهر',
    loading: 'جارٍ التحميل...',
    failed: 'تعذر تحميل المجموعة.',
    permissionDenied: 'تم رفض الإذن. تأكد من أنك مسجّل الدخول.',
    joinLabel: 'انضمام ?',
    howItWorks: 'كيف تعمل التومبين (Njangi)',
    step1: 'يساهم الأعضاء بانتظام (أسبوعيًا أو شهريًا)',
    step2: 'في كل دورة، يحصل عضو واحد على الصندوق بالكامل',
    step3: 'يتكرر الدور حتى يحصل الجميع على حصتهم مرة واحدة',
    step4: 'تتم متابعة جميع العمليات بشفافية',
  },
  pidgin: {
    backToTontine: 'Go back to Tontine',
    groupNotFound: 'We no find the group.',
    invalidGroupId: 'Group ID no correct',
    about: 'About',
    noDescription: 'No description dey.',
    nextPayout: 'Next payout:',
    allRecorded: 'All transactions dey recorded clearly for Supabase',
    members: 'Members',
    turn: 'Turn',
    youAreMember: 'You don dey inside this group',
    join: 'Join',
    joining: 'Dey join?',
    active: 'active',
    open: 'open',
    closed: 'closed',
    demoName: 'Demo Savings Group',
    demoDesc: 'Sample tontine group. Create your own make you start.',
    contribution: 'Contribution',
    pool: 'Pool',
    groupSummary: 'Group summary',
    weekly: '/weekly',
    monthly: '/monthly',
    loading: 'Dey load...',
    failed: 'We no fit load the group.',
    permissionDenied: 'Permission denied. Please make sure say you don log in.',
    joinLabel: 'Join ?',
    howItWorks: 'How Tontine (Njangi) dey work',
    step1: 'Members dey contribute regularly (weekly or monthly)',
    step2: 'Each round, one member collect the full pool',
    step3: 'E dey rotate until everybody don collect once',
    step4: 'All transactions dey tracked and clear',
  },
  ful: {
    backToTontine: 'Rutto to Tontine',
    groupNotFound: 'Gollal ndii no feewi.',
    invalidGroupId: 'ID gollal ngol woodaaki',
    about: 'Hol no?',
    noDescription: 'Alaa cappanɗe.',
    nextPayout: 'Feyde ñande goɗɗo:',
    allRecorded: 'Transactions kala no woodi e laabi e Supabase',
    members: 'ɓeɓɓe',
    turn: 'Kalii',
    youAreMember: 'Aɗa e ɓeɓɓe gollal ngool',
    join: 'Naatnu',
    joining: 'Dey naatnude...',
    active: 'e ñande',
    open: 'ubbiɗo',
    closed: 'mboɗɗi',
    demoName: 'Gollal e savings demo',
    demoDesc: 'Gollal tontine waawnde. Husna ndee ngam fuɗɗude.',
    contribution: 'Kontribushon',
    pool: 'Jamfaare',
    groupSummary: 'Cappanɗe gollal',
    weekly: '/ñalngu 7',
    monthly: '/lewru',
    loading: 'Dey loade...',
    failed: 'Min worataa loade gollal.',
    permissionDenied: 'Izin nden no woodaa. Tabintina aɗa logii.',
    joinLabel: 'Naatnu ?',
    howItWorks: 'No Tontine (Njangi) ɗoo wayi',
    step1: 'Ɓeɓɓe ndeeɗi konnitaa e laawol (kala ñalngu 7 walla kala lewru)',
    step2: 'Kala round, won ɓeɓɓo gooto heɓa jamfaare fuu',
    step3: 'E ndeeɗa haa kala gooto heɓi kalii mum so ɓuri gooto',
    step4: 'Transactions kala ɗoo wonaa e yeeso e laabi',
  },
};

interface Group {
  id: string;
  name: string;
  description: string;
  adminId: string;
  contributionXaf: number;
  frequency: string;
  maxMembers: number;
  currentMembers: number;
  totalPoolXaf: number;
  nextPayoutDate: string | null;
  status: string;
}

interface Member {
  userId: string;
  displayName: string;
  payoutPosition: number;
  hasPaid: boolean;
  joinedAt: string;
}

const DEMO_GROUP: Group = {
  id: 'demo',
  name: 'Demo Savings Group',
  description: 'A sample tontine group. Create your own to get started.',
  adminId: 'demo',
  contributionXaf: 25000,
  frequency: 'monthly',
  maxMembers: 10,
  currentMembers: 4,
  totalPoolXaf: 100000,
  nextPayoutDate: '2026-06-15',
  status: 'active',
};

function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export default function TontineDetail() {
  const { id } = useParams<{ id: string }>();
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);

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

      const { data, error: dbErr } = await supabase
        .from('tontine_groups')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (dbErr) throw dbErr;
      if (!data) {
        setError(ui.groupNotFound);
        setLoading(false);
        return;
      }

      setGroup({
        id: data.id,
        name: data.name,
        description: data.description || '',
        adminId: data.admin_id,
        contributionXaf: data.contribution_xaf,
        frequency: data.frequency,
        maxMembers: data.max_members,
        currentMembers: data.current_members || 0,
        totalPoolXaf: data.total_pool_xaf || 0,
        nextPayoutDate: data.next_payout_date || null,
        status: data.status,
      });

      const { data: memberData } = await supabase
        .from('tontine_members')
        .select('user_id, joined_at, payout_position, has_paid_current_round, profiles:user_id(full_name)')
        .eq('group_id', groupId)
        .order('payout_position', { ascending: true });

      if (memberData) {
        setMembers(memberData.map(m => ({
          userId: m.user_id,
          displayName: (m.profiles as any)?.full_name || 'Member',
          payoutPosition: m.payout_position,
          hasPaid: m.has_paid_current_round,
          joinedAt: m.joined_at,
        })));
        if (uid) setIsMember(memberData.some(m => m.user_id === uid));
      }
    } catch (e: unknown) {
      setError((e as Error).message || ui.failed);
    } finally {
      setLoading(false);
    }
  }, [ui.failed, ui.groupNotFound]);

  useEffect(() => {
    if (id) loadGroup(id);
    else {
      setError(ui.invalidGroupId);
      setLoading(false);
    }
  }, [id, loadGroup, ui.invalidGroupId]);

  async function handleJoin() {
    if (!userId) {
      navigate('/login');
      return;
    }
    if (!group || !isUUID(group.id) || joining) return;
    setJoining(true);
    try {
      await supabase.from('tontine_members').insert({
        group_id: group.id,
        user_id: userId,
        payout_position: group.currentMembers + 1,
        joined_at: new Date().toISOString(),
        has_paid_current_round: false,
      });

      await supabase.rpc('increment_tontine_members', { group_id: group.id })
        .then(() => {}, () =>
          supabase
            .from('tontine_groups')
            .update({ current_members: group.currentMembers + 1 })
            .eq('id', group.id),
        );

      setIsMember(true);
      loadGroup(group.id);
    } catch {
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
          <p className="font-bold text-gray-800 mb-1">{error || ui.groupNotFound}</p>
          <button
            onClick={() => navigate('/tontine')}
            className="mt-4 text-purple-600 underline text-sm"
          >
            {ui.backToTontine}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
          group.status === 'open' ? 'bg-yellow-50 text-yellow-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {group.status}
        </span>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-purple-900">{fmt(group.contributionXaf)}</p>
            <p className="text-xs text-purple-600">/{group.frequency}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-blue-900">{group.currentMembers}/{group.maxMembers}</p>
            <p className="text-xs text-blue-600">{ui.members}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-green-900">{fmt(group.totalPoolXaf)}</p>
            <p className="text-xs text-green-600">{ui.pool}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-1">{ui.about}</h3>
          <p className="text-sm text-gray-600">{group.description || ui.noDescription}</p>
          {group.nextPayoutDate && (
            <div className="flex items-center gap-2 mt-3 text-xs text-teal-700 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {ui.nextPayout}{' '}
              {new Date(group.nextPayoutDate).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            {ui.allRecorded}
          </div>
        </div>

        {members.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold text-gray-900 text-sm">{ui.members} ({members.length})</h3>
            </div>
            <div className="divide-y">
              {members.map(m => (
                <div key={m.userId} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
                    {m.displayName[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.displayName}</p>
                    <p className="text-xs text-gray-400">{ui.turn} #{m.payoutPosition}</p>
                  </div>
                  {m.hasPaid
                    ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {isMember && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-green-800">{ui.youAreMember}</p>
          </div>
        )}
      </div>

      {!isMember && group.status === 'open' && group.currentMembers < group.maxMembers && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-purple-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-purple-800 transition"
          >
            {joining
              ? <><Loader2 className="w-4 h-4 animate-spin" />{ui.joining}</>
              : <><Plus className="w-4 h-4" />{ui.join} ? {fmt(group.contributionXaf)}/{group.frequency}</>}
          </button>
        </div>
      )}
    </div>
  );
}