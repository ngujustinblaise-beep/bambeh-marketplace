/**
 * src/pages/TontineGroupDetail.tsx
 * Bambeh Marketplace ? Tontine/Njangi Group Detail
 * ? 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, DollarSign, Calendar, CheckCircle,
  Clock, RefreshCw, AlertCircle, Plus, Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AvatarImage } from "@/components/ui/BambehImage";
import { useLang, t } from "@/hooks/useAppLang";

interface TontineGroup {
  id: string;
  name: string;
  description: string;
  adminId: string;
  adminName: string;
  contributionXAF: number;
  frequency: "weekly" | "monthly";
  maxMembers: number;
  currentMembers: number;
  startDate: string;
  nextPayoutDate?: string;
  totalPoolXAF: number;
  status: "open" | "active" | "completed" | "paused";
  isPrivate: boolean;
}

interface TontineMember {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: string;
  hasPaidCurrentRound: boolean;
  payoutPosition: number;
}

const COPY = {
  en: {
    groupNotFound: 'Group not found',
    invalidGroupId: 'Invalid group ID',
    back: 'Back',
    members: 'Members',
    pool: 'Pool',
    about: 'About',
    nextPayout: 'Next payout:',
    from: 'Since',
    admin: 'Admin:',
    noDescription: 'No description provided.',
    turn: 'Turn',
    groupMembers: 'Members',
    join: 'Join',
    joining: 'Joining...',
    joined: 'You are a member of this group',
    active: 'active',
    open: 'open',
    completed: 'completed',
    paused: 'paused',
    loading: 'Loading...',
    failed: 'Failed',
    joinLabel: 'Join',
    contribution: 'Contribution',
    monthly: '/monthly',
    weekly: '/weekly',
    demoName: 'Demo Savings Group',
    demoDesc: 'A sample tontine group. Create your own to get started.',
    howItWorks: 'How Tontine (Njangi) Works',
    step1: 'Members contribute regularly (weekly or monthly)',
    step2: 'Each cycle, one member receives the full pool',
    step3: 'Rotates until everyone has received once',
    step4: 'All transactions are tracked and transparent',
    fromLabel: 'Since',
    statusOpen: 'open',
    statusActive: 'active',
    statusCompleted: 'completed',
    statusPaused: 'paused',
  },
  fr: {
    groupNotFound: 'Groupe introuvable',
    invalidGroupId: 'Identifiant de groupe invalide',
    back: 'Retour',
    members: 'Membres',
    pool: 'Cagnotte',
    about: 'À propos',
    nextPayout: 'Prochain versement :',
    from: 'Depuis',
    admin: 'Administrateur :',
    noDescription: 'Aucune description fournie.',
    turn: 'Tour',
    groupMembers: 'Membres',
    join: 'Rejoindre',
    joining: 'Rejoindre...',
    joined: 'Vous êtes membre de ce groupe',
    active: 'actif',
    open: 'ouvert',
    completed: 'terminé',
    paused: 'en pause',
    loading: 'Chargement...',
    failed: 'Échec',
    joinLabel: 'Rejoindre',
    contribution: 'Cotisation',
    monthly: '/mois',
    weekly: '/semaine',
    demoName: 'Groupe d’épargne de démonstration',
    demoDesc: 'Un exemple de groupe de tontine. Créez le vôtre pour commencer.',
    howItWorks: 'Comment fonctionne la tontine (Njangi)',
    step1: 'Les membres cotisent régulièrement (chaque semaine ou chaque mois)',
    step2: 'À chaque cycle, un membre reçoit l’intégralité de la cagnotte',
    step3: 'Le système tourne jusqu’à ce que chacun ait reçu une fois',
    step4: 'Toutes les opérations sont suivies et transparentes',
    fromLabel: 'Depuis',
    statusOpen: 'ouvert',
    statusActive: 'actif',
    statusCompleted: 'terminé',
    statusPaused: 'en pause',
  },
  ar: {
    groupNotFound: 'المجموعة غير موجودة',
    invalidGroupId: 'معرّف المجموعة غير صالح',
    back: 'رجوع',
    members: 'الأعضاء',
    pool: 'الصندوق',
    about: 'حول',
    nextPayout: 'الدفعة التالية:',
    from: 'منذ',
    admin: 'المشرف:',
    noDescription: 'لا يوجد وصف.',
    turn: 'الدور',
    groupMembers: 'الأعضاء',
    join: 'انضمام',
    joining: 'جارٍ الانضمام...',
    joined: 'أنت عضو في هذه المجموعة',
    active: 'نشط',
    open: 'مفتوح',
    completed: 'مكتمل',
    paused: 'متوقف',
    loading: 'جارٍ التحميل...',
    failed: 'فشل',
    joinLabel: 'انضمام',
    contribution: 'المساهمة',
    monthly: '/شهر',
    weekly: '/أسبوع',
    demoName: 'مجموعة ادخار تجريبية',
    demoDesc: 'مجموعة تومبين نموذجية. أنشئ مجموعتك لبدء الاستخدام.',
    howItWorks: 'كيف تعمل التومبين (Njangi)',
    step1: 'يساهم الأعضاء بانتظام (أسبوعيًا أو شهريًا)',
    step2: 'في كل دورة، يحصل عضو واحد على الصندوق بالكامل',
    step3: 'يتكرر الدور حتى يحصل الجميع على حصتهم مرة واحدة',
    step4: 'تتم متابعة جميع العمليات بشفافية',
    fromLabel: 'منذ',
    statusOpen: 'مفتوح',
    statusActive: 'نشط',
    statusCompleted: 'مكتمل',
    statusPaused: 'متوقف',
  },
  pidgin: {
    groupNotFound: 'We no find the group',
    invalidGroupId: 'Group ID no correct',
    back: 'Back',
    members: 'Members',
    pool: 'Pool',
    about: 'About',
    nextPayout: 'Next payout:',
    from: 'Since',
    admin: 'Admin:',
    noDescription: 'No description dey.',
    turn: 'Turn',
    groupMembers: 'Members',
    join: 'Join',
    joining: 'Dey join...',
    joined: 'You don dey inside this group',
    active: 'active',
    open: 'open',
    completed: 'completed',
    paused: 'paused',
    loading: 'Dey load...',
    failed: 'Failed',
    joinLabel: 'Join',
    contribution: 'Contribution',
    monthly: '/monthly',
    weekly: '/weekly',
    demoName: 'Demo Savings Group',
    demoDesc: 'Sample tontine group. Create your own make you start.',
    howItWorks: 'How Tontine (Njangi) dey work',
    step1: 'Members dey contribute regularly (weekly or monthly)',
    step2: 'Each round, one member collect the full pool',
    step3: 'E dey rotate until everybody don collect once',
    step4: 'All transactions dey tracked and clear',
    fromLabel: 'Since',
    statusOpen: 'open',
    statusActive: 'active',
    statusCompleted: 'completed',
    statusPaused: 'paused',
  },
  ful: {
    groupNotFound: 'Gollal ngool no feewi',
    invalidGroupId: 'ID gollal ngol woodaaki',
    back: 'Rutto',
    members: 'ɓeɓɓe',
    pool: 'Jamfaare',
    about: 'Hol no?',
    nextPayout: 'Feyde ñande goɗɗo:',
    from: 'Depi',
    admin: 'Admin:',
    noDescription: 'Alaa cappanɗe.',
    turn: 'Kalii',
    groupMembers: 'ɓeɓɓe',
    join: 'Naatnu',
    joining: 'Dey naatnude...',
    joined: 'Aɗa e ɓeɓɓe gollal ngool',
    active: 'e ñande',
    open: 'ubbiɗo',
    completed: 'tabitii',
    paused: 'e woppude',
    loading: 'Dey loade...',
    failed: 'No feewi',
    joinLabel: 'Naatnu',
    contribution: 'Kontribushon',
    monthly: '/lewru',
    weekly: '/ñalngu 7',
    demoName: 'Gollal e savings demo',
    demoDesc: 'Gollal tontine waawnde. Husna ndee ngam fuɗɗude.',
    howItWorks: 'No Tontine (Njangi) ɗoo wayi',
    step1: 'Ɓeɓɓe ndeeɗi konnitaa e laawol (kala ñalngu 7 walla kala lewru)',
    step2: 'Kala round, won ɓeɓɓo gooto heɓa jamfaare fuu',
    step3: 'E ndeeɗa haa kala gooto heɓi kalii mum so ɓuri gooto',
    step4: 'Transactions kala ɗoo wonaa e yeeso e laabi',
    fromLabel: 'Depi',
    statusOpen: 'ubbiɗo',
    statusActive: 'e ñande',
    statusCompleted: 'tabitii',
    statusPaused: 'e woppude',
  },
};

const TontineGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;

  const [group, setGroup] = useState<TontineGroup | null>(null);
  const [members, setMembers] = useState<TontineMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;

      const { data, error: dbErr } = await supabase
        .from("tontine_groups")
        .select("*, profiles:admin_id(display_name)")
        .eq("id", id)
        .single();

      if (dbErr || !data) {
        setError(ui.groupNotFound);
        return;
      }

      const admin = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

      setGroup({
        id: data.id as string,
        name: data.name as string,
        description: data.description as string,
        adminId: data.admin_id as string,
        adminName: (admin?.display_name as string) ?? "?",
        contributionXAF: data.contribution_xaf as number,
        frequency: data.frequency as TontineGroup["frequency"],
        maxMembers: data.max_members as number,
        currentMembers: data.current_members as number,
        startDate: data.start_date as string,
        nextPayoutDate: data.next_payout_date as string | undefined,
        totalPoolXAF: data.total_pool_xaf as number,
        status: data.status as TontineGroup["status"],
        isPrivate: Boolean(data.is_private),
      });

      const { data: memberData } = await supabase
        .from("tontine_members")
        .select("user_id, joined_at, has_paid_current_round, payout_position, profiles:user_id(display_name, avatar_url)")
        .eq("group_id", id)
        .order("payout_position", { ascending: true });

      if (memberData) {
        setMembers(memberData.map((row) => {
          const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          return {
            userId: row.user_id as string,
            displayName: (profile?.display_name as string) ?? "?",
            avatarUrl: profile?.avatar_url as string | undefined,
            joinedAt: row.joined_at as string,
            hasPaidCurrentRound: Boolean(row.has_paid_current_round),
            payoutPosition: row.payout_position as number,
          };
        }));
        if (userId) setIsMember(memberData.some((m) => m.user_id === userId));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const handleJoin = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate("/login");
      return;
    }
    setJoining(true);
    try {
      await supabase.from("tontine_members").insert({
        group_id: id,
        user_id: session.session.user.id,
        joined_at: new Date().toISOString(),
        payout_position: (group?.currentMembers ?? 0) + 1,
        has_paid_current_round: false,
      });
      setIsMember(true);
      void load();
    } catch {
    } finally {
      setJoining(false);
    }
  }, [id, group, navigate, load]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(n) + " FCFA";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  );

  if (error || !group) return (
    <div className="p-4 space-y-3">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600">
        <ArrowLeft className="w-4 h-4" /> {ui.back}
      </button>
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-sm text-red-600">{error ?? ui.groupNotFound}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4 pb-24 space-y-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{group.name}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
          group.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
          group.status === "open" ? "bg-blue-50 text-blue-700 border-blue-200" :
          "bg-gray-100 text-gray-500 border-gray-200"
        }`}>
          {group.status === "active" ? ui.statusActive :
           group.status === "open" ? ui.statusOpen :
           group.status === "completed" ? ui.statusCompleted : ui.statusPaused}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
          <DollarSign className="w-5 h-5 text-teal-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-teal-800">{formatXAF(group.contributionXAF)}</p>
          <p className="text-xs text-teal-600">{group.frequency === "monthly" ? ui.monthly : ui.weekly}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-blue-800">{group.currentMembers}/{group.maxMembers}</p>
          <p className="text-xs text-blue-600">{ui.groupMembers}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-green-800">{formatXAF(group.totalPoolXAF)}</p>
          <p className="text-xs text-green-600">{ui.pool}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{ui.about}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{group.description || ui.noDescription}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <Shield className="w-3.5 h-3.5" />
          <span>{ui.admin} {group.adminName}</span>
          <Calendar className="w-3.5 h-3.5 ml-2" />
          <span>{ui.from} {new Date(group.startDate).toLocaleDateString("fr-CM")}</span>
        </div>
        {group.nextPayoutDate && (
          <div className="flex items-center gap-2 mt-2 text-xs text-teal-700 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {ui.nextPayout} {new Date(group.nextPayoutDate).toLocaleDateString("fr-CM")}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">{ui.members} ({members.length})</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {m.avatarUrl
                  ? <AvatarImage src={m.avatarUrl} alt={m.displayName} size={32} />
                  : <span className="text-teal-600 font-bold text-xs">{m.displayName.charAt(0)}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{m.displayName}</p>
                <p className="text-xs text-gray-400">{ui.turn} #{m.payoutPosition}</p>
              </div>
              {m.hasPaidCurrentRound
                ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                : <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
              }
            </div>
          ))}
        </div>
      </div>

      {!isMember && group.status === "open" && group.currentMembers < group.maxMembers && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
          <button type="button" onClick={handleJoin} disabled={joining}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {joining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {joining ? ui.joining : `${ui.joinLabel} ? ${formatXAF(group.contributionXAF)}`}
          </button>
        </div>
      )}
      {isMember && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700 font-medium">{ui.joined}</p>
        </div>
      )}
    </div>
  );
};

export default TontineGroupDetail;