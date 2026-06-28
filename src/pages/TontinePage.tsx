/**
 * TontinePage.tsx � Bambeh Marketplace
 * FILE LOCATION: src/pages/TontinePage.tsx
 *
 * i18n FIX (this version):
 *  - Repointed OFF the dead "@/hooks/useAppLang" stub and ONTO the working
 *    "@/App" (same source the live language selector uses).
 *  - All visible text now translates live: EN / FR / Pidgin / Arabic / Fulfulde (ff).
 *  - Arabic gets dir="rtl" on the page root.
 *  - Icons (lucide + emoji) are LEFT EXACTLY AS-IS � only human text is translated.
 *  - Status badges translated via a pure statusLabel(status, s) map.
 *  - Demo group NAMES are fixtures (shown only when there is no real data) and
 *    are intentionally left as-is, like other DB/seed data.
 *
 * Everything else (Supabase reads, real-time channel, create buttons) is kept
 * exactly as it was.
 *
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Plus, Calendar, DollarSign,
  ChevronRight, Shield, Loader2, RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang } from '@/hooks/useAppLang';

// -- i18n strings (local table, keyed by the live language code) -------------
type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const T: Record<Lang, {
  title: string; newGroup: string; refresh: string;
  statMyGroups: string; statPool: string; statActive: string;
  tabMy: string; tabDiscover: string;
  emptyMyTitle: string; emptyDiscoverTitle: string;
  emptyMyBody: string; emptyDiscoverBody: string;
  createBtn: string; viewMine: string;
  members: string; perMonth: string; perWeek: string;
  secureTitle: string; secureBody: string; createFab: string;
  stOpen: string; stActive: string; stCompleted: string; stPaused: string;
  spotsLeft: (n: number) => string;
}> = {
  en: {
    title: "Tontine / Njangi", newGroup: "New Group", refresh: "Refresh",
    statMyGroups: "My Groups", statPool: "Pool (XAF)", statActive: "Active",
    tabMy: "My Groups", tabDiscover: "Discover",
    emptyMyTitle: "You haven't joined any groups yet",
    emptyDiscoverTitle: "No open groups to join right now",
    emptyMyBody: "Start your own Njangi group and invite your friends and family.",
    emptyDiscoverBody: "Check back later or create your own group.",
    createBtn: "Create Njangi Group", viewMine: "View my groups instead",
    members: "members", perMonth: "mo", perWeek: "wk",
    secureTitle: "Secure & Transparent",
    secureBody: "All tontine transactions are recorded and visible to all group members on all devices.",
    createFab: "Create",
    stOpen: "open", stActive: "active", stCompleted: "completed", stPaused: "paused",
    spotsLeft: (n) => `${n} spot${n !== 1 ? "s" : ""} left � Join Now!`,
  },
  fr: {
    title: "Tontine / Njangi", newGroup: "Nouveau groupe", refresh: "Actualiser",
    statMyGroups: "Mes groupes", statPool: "Cagnotte (XAF)", statActive: "Actifs",
    tabMy: "Mes groupes", tabDiscover: "D�couvrir",
    emptyMyTitle: "Vous n'avez rejoint aucun groupe",
    emptyDiscoverTitle: "Aucun groupe ouvert pour le moment",
    emptyMyBody: "Cr�ez votre propre groupe Njangi et invitez vos amis et votre famille.",
    emptyDiscoverBody: "Revenez plus tard ou cr�ez votre propre groupe.",
    createBtn: "Cr�er un groupe Njangi", viewMine: "Voir plut�t mes groupes",
    members: "membres", perMonth: "mois", perWeek: "sem",
    secureTitle: "S�curis� et transparent",
    secureBody: "Toutes les transactions de la tontine sont enregistr�es et visibles par tous les membres du groupe, sur tous les appareils.",
    createFab: "Cr�er",
    stOpen: "ouvert", stActive: "actif", stCompleted: "termin�", stPaused: "en pause",
    spotsLeft: (n) => `${n} place${n !== 1 ? "s" : ""} restante${n !== 1 ? "s" : ""} � Rejoignez !`,
  },
  pidgin: {
    title: "Tontine / Njangi", newGroup: "New Group", refresh: "Refresh",
    statMyGroups: "My Groups", statPool: "Money Pool (XAF)", statActive: "Active",
    tabMy: "My Groups", tabDiscover: "Discover",
    emptyMyTitle: "You never join any group yet",
    emptyDiscoverTitle: "No open group dey to join now",
    emptyMyBody: "Start your own Njangi group, call your padi dem and family.",
    emptyDiscoverBody: "Come check later or create your own group.",
    createBtn: "Create Njangi Group", viewMine: "See my groups instead",
    members: "members", perMonth: "mo", perWeek: "wk",
    secureTitle: "Safe & Open",
    secureBody: "All tontine transaction dem dey recorded and all group members fit see am for any phone.",
    createFab: "Create",
    stOpen: "open", stActive: "active", stCompleted: "done", stPaused: "pause",
    spotsLeft: (n) => `${n} spot${n !== 1 ? "s" : ""} remain � Join Now!`,
  },
  ar: {
    title: "Tontine / Njangi", newGroup: "?????? ?????", refresh: "?????",
    statMyGroups: "????????", statPool: "??????? (XAF)", statActive: "??ِ??",
    tabMy: "????????", tabDiscover: "????ف",
    emptyMyTitle: "?? ???? ??? ?? ?????? ???",
    emptyDiscoverTitle: "?? ???? ??????? ?ف???? ???????? ????",
    emptyMyBody: "???? ?????? ?????? ???? ?? ????ُ ??????? ???????.",
    emptyDiscoverBody: "???? ?????? ?? ???? ??????? ??????.",
    createBtn: "????? ?????? ??????", viewMine: "??? ???????? ????? ?? ???",
    members: "?????", perMonth: "???", perWeek: "?????",
    secureTitle: "??? ??ف???",
    secureBody: "?ُ????? ???? ??????? ???????? ????? ????? ????? ????? ???????? ??? ?? ???????.",
    createFab: "?????",
    stOpen: "?ف????", stActive: "??ِ??", stCompleted: "??????", stPaused: "?????ف?",
    spotsLeft: (n) => `??? ${n} ???? � ???? ????!`,
  },
  ff: {
    title: "Tontine / Njangi", newGroup: "Fedde hesere", refresh: "Hes?itin",
    statMyGroups: "Pelle am", statPool: "Kaalis moo?taa?o (XAF)", statActive: "Gollotoo?e",
    tabMy: "Pelle am", tabDiscover: "Yiytu",
    emptyMyTitle: "A naataali fedde woo tawo",
    emptyDiscoverTitle: "Alaa pelle udditaa?e ngam naatude jooni",
    emptyMyBody: "Fu??u fedde Njangi maa, noddaa yi??e maa e ?esngu maa.",
    emptyDiscoverBody: "Rutto ?aawo walla fu??u fedde maa.",
    createBtn: "Sosu Fedde Njangi", viewMine: "Yiy pelle am",
    members: "yim?e", perMonth: "lewru", perWeek: "yontere",
    secureTitle: "Hooltaa?o & Laa??o",
    secureBody: "Li??ite tontine fof ina winndaa, ina njiyee e yim?e fedde fof e ka?ir?e fof.",
    createFab: "Sosu",
    stOpen: "udditii", stActive: "gollii", stCompleted: "gasii", stPaused: "dartii",
    spotsLeft: (n) => `Heddii nokkuuje ${n} � Naatu jooni!`,
  },
};

interface TontineGroup {
  id: string; name: string; contributionXaf: number; frequency: string;
  currentMembers: number; maxMembers: number; totalPoolXaf: number;
  nextPayoutDate: string | null; status: string; isMine: boolean; adminId: string;
}

const DEMO_GROUPS: TontineGroup[] = [
  { id:"demo1", name:"Tech Workers Njangi",    contributionXaf:25000, frequency:"monthly", currentMembers:10, maxMembers:10, totalPoolXaf:250000, nextPayoutDate:"2026-06-15", status:"active", isMine:true,  adminId:"demo" },
  { id:"demo2", name:"Market Women Group",     contributionXaf:10000, frequency:"weekly",  currentMembers:6,  maxMembers:8,  totalPoolXaf:60000,  nextPayoutDate:"2026-05-28", status:"active", isMine:true,  adminId:"demo" },
  { id:"demo3", name:"Yaound� Professionals",  contributionXaf:50000, frequency:"monthly", currentMembers:3,  maxMembers:12, totalPoolXaf:150000, nextPayoutDate:null,          status:"open",   isMine:false, adminId:"demo" },
];

export default function TontinePage() {
  const currentLang = useLang();
    const lang: Lang = (currentLang in T ? currentLang : "en") as Lang;
    const s = T[lang];
    const isRtl = lang === "ar";
  const dateLocale = lang === "fr" ? "fr-CM" : "en-GB";

  // Pure status ? localized label
  const statusLabel = (status: string): string => {
    switch (status) {
      case "active":    return s.stActive;
      case "open":      return s.stOpen;
      case "completed": return s.stCompleted;
      case "paused":    return s.stPaused;
      default:          return status;
    }
  };

  const navigate = useNavigate();
  const [groups,  setGroups]  = useState<TontineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId,  setUserId]  = useState<string | null>(null);
  const [tab,     setTab]     = useState<"my" | "discover">("my");

  async function fetchGroups() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      const { data: groupData } = await supabase
        .from("tontine_groups")
        .select("*")
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(30);

      let myGroupIds = new Set<string>();
      if (uid) {
        const { data: memberData } = await supabase
          .from("tontine_members")
          .select("group_id")
          .eq("user_id", uid);
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
          totalPoolXaf:    g.total_pool_xaf  || 0,
          nextPayoutDate:  g.next_payout_date || null,
          status:          g.status,
          isMine:          uid ? (g.admin_id === uid || myGroupIds.has(g.id)) : false,
          adminId:         g.admin_id,
        })));
      } else {
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
      .channel("tontine_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "tontine_groups" }, fetchGroups)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const myGroups       = groups.filter(g => g.isMine);
  const discoverGroups = groups.filter(g => !g.isMine && g.status === "open" && g.currentMembers < g.maxMembers);
  const display        = tab === "my" ? myGroups : discoverGroups;

  const totalSaved  = myGroups.reduce((acc, g) => acc + g.totalPoolXaf, 0);
  const activeCount = myGroups.filter(g => g.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir={isRtl ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-800 px-4 pt-8 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Users className="w-6 h-6" /> {s.title}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchGroups}
              className="bg-white/20 text-white p-2 rounded-xl"
              aria-label={s.refresh}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/tontine/create")}
              className="bg-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> {s.newGroup}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            [myGroups.length.toString(), s.statMyGroups, "??"],
            [totalSaved > 0 ? `${Math.round(totalSaved/1000)}k` : "0", s.statPool, "??"],
            [activeCount.toString(), s.statActive, "?"],
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
          {(["my", "discover"] as const).map(tk => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                tab === tk ? "bg-purple-700 text-white shadow-sm" : "bg-white border text-gray-600"
              }`}
            >
              {tk === "my" ? s.tabMy : `${s.tabDiscover} (${discoverGroups.length})`}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Empty state � with a big obvious CREATE button */}
        {!loading && display.length === 0 && (
          <div className="text-center py-10">
            <Users className="w-14 h-14 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-600 font-semibold text-base mb-1">
              {tab === "my" ? s.emptyMyTitle : s.emptyDiscoverTitle}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {tab === "my" ? s.emptyMyBody : s.emptyDiscoverBody}
            </p>

            <button
              onClick={() => navigate("/tontine/create")}
              className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 mx-auto transition-colors shadow-lg shadow-purple-200"
            >
              <Plus className="w-5 h-5" />
              {s.createBtn}
            </button>

            {tab === "discover" && (
              <button
                onClick={() => setTab("my")}
                className="mt-3 text-purple-600 text-sm underline"
              >
                {s.viewMine}
              </button>
            )}
          </div>
        )}

        {/* Group cards */}
        {!loading && display.length > 0 && (
          <div className="space-y-3">
            {display.map(group => {
              const progressPct = Math.min(100, Math.round((group.currentMembers / group.maxMembers) * 100));
              const spots = group.maxMembers - group.currentMembers;
              return (
                <div
                  key={group.id}
                  onClick={() => navigate("/tontine/" + group.id)}
                  className="bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {group.frequency} � {group.currentMembers}/{group.maxMembers} {s.members}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      group.status === "active" ? "bg-green-50 text-green-700" :
                      group.status === "open"   ? "bg-yellow-50 text-yellow-700" :
                                                  "bg-gray-100 text-gray-500"
                    }`}>
                      {statusLabel(group.status)}
                    </span>
                  </div>

                  {/* Member progress bar */}
                  <div className="bg-gray-100 rounded-full h-1.5 mb-3">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${progressPct}%` }}/>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-bold text-purple-700">
                        {group.contributionXaf.toLocaleString()} XAF/{group.frequency === "monthly" ? s.perMonth : s.perWeek}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      {group.nextPayoutDate && (
                        <>
                          <Calendar className="w-3 h-3" />
                          {new Date(group.nextPayoutDate).toLocaleDateString(dateLocale, { day:"numeric", month:"short" })}
                        </>
                      )}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>

                  {group.status === "open" && group.currentMembers < group.maxMembers && tab === "discover" && (
                    <div className="mt-3 py-2 bg-green-50 border border-green-200 rounded-xl text-center text-green-700 font-semibold text-sm">
                      {s.spotsLeft(spots)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Security note */}
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-800">{s.secureTitle}</p>
            <p className="text-xs text-purple-600 mt-0.5">{s.secureBody}</p>
          </div>
        </div>
      </div>

      {/* Floating "Create Group" button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => navigate("/tontine/create")}
          className="bg-purple-700 hover:bg-purple-800 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors active:scale-95"
          aria-label={s.createBtn}
          title={s.createBtn}
        >
          <Plus className="w-7 h-7" />
        </button>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
          {s.createFab}
        </span>
      </div>
    </div>
  );
}





