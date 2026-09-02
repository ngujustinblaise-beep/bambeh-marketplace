// BAMBEH_DEPLOY_TOKEN__COMMUNITYPAGE_FIX112_CLEAN
/**
 * CommunityPage — FIX101 (REAL data)
 * ──────────────────────────────────
 * Replaces the mock page (hardcoded INITIAL_GROUPS, state-only "groups").
 *  • Groups load from Supabase `community_groups` (live member counts)
 *  • Create Group saves a real row (creator auto-joins as admin via trigger)
 *  • Join / Leave writes `community_members` (counters kept by DB triggers)
 *  • Search + category filter, 5 languages (EN/FR/Pidgin/AR-RTL/FF — FIX112), loading/empty/error states
 *  • Chat-only: no external share buttons
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Search, MapPin, Loader2, AlertCircle, X, Lock, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

interface Group {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  city: string | null;
  emoji: string | null;
  member_count: number | null;
  members_count: number | null;
  post_count: number | null;
  creator_id: string | null;
  is_private: boolean | null;
  is_active: boolean | null;
  created_at: string;
}

const CATEGORIES = ['All', 'General', 'Buy & Sell', 'Jobs', 'Housing', 'Farming', 'Tech', 'Faith', 'Sports', 'Women', 'Youth'];

const CAT_LABELS: Record<string, Record<string, string>> = {
  en: { "All": "All", "General": "General", "Buy & Sell": "Buy & Sell", "Jobs": "Jobs", "Housing": "Housing", "Farming": "Farming", "Tech": "Tech", "Faith": "Faith", "Sports": "Sports", "Women": "Women", "Youth": "Youth" },
  fr: { "All": "Tout", "General": "G\u00e9n\u00e9ral", "Buy & Sell": "Achat & Vente", "Jobs": "Emplois", "Housing": "Logement", "Farming": "Agriculture", "Tech": "Tech", "Faith": "Foi", "Sports": "Sport", "Women": "Femmes", "Youth": "Jeunes" },
  pidgin: { "All": "All", "General": "General", "Buy & Sell": "Buy & Sell", "Jobs": "Work", "Housing": "House", "Farming": "Farm", "Tech": "Tech", "Faith": "Church", "Sports": "Sport", "Women": "Women", "Youth": "Youth" },
  ar: { "All": "\u0627\u0644\u0643\u0644", "General": "\u0639\u0627\u0645", "Buy & Sell": "\u0628\u064a\u0639 \u0648\u0634\u0631\u0627\u0621", "Jobs": "\u0648\u0638\u0627\u0626\u0641", "Housing": "\u0633\u0643\u0646", "Farming": "\u0632\u0631\u0627\u0639\u0629", "Tech": "\u062a\u0642\u0646\u064a\u0629", "Faith": "\u062f\u064a\u0646", "Sports": "\u0631\u064a\u0627\u0636\u0629", "Women": "\u0646\u0633\u0627\u0621", "Youth": "\u0634\u0628\u0627\u0628" },
  ff: { "All": "Fof", "General": "Jaajngo", "Buy & Sell": "Coodgol e Njeeygu", "Jobs": "Golle", "Housing": "Cuu\u0257i", "Farming": "Ndema", "Tech": "Tekno", "Faith": "Diina", "Sports": "Coy", "Women": "Rew\u0253e", "Youth": "Sukaa\u0253e" },
};

function catLabel(c: string, langKey: string): string {
  const table = CAT_LABELS[langKey] ?? CAT_LABELS.en;
  return table[c] ?? CAT_LABELS.en[c] ?? c;
}

const T = {
  en: {
    title: 'Community Groups',
    subtitle: 'Join groups, share, and trade with people near you',
    search: 'Search groups...',
    create: 'Create Group',
    members: 'members',
    posts: 'posts',
    join: 'Join',
    joined: 'Joined',
    leave: 'Leave',
    empty: 'No groups yet in this category. Be the first to create one!',
    loadError: 'Could not load groups. Pull to retry or check your connection.',
    retry: 'Retry',
    private: 'Private',
    // create modal
    newGroup: 'New Group',
    name: 'Group name',
    namePh: 'e.g. Yaoundé Traders',
    desc: 'Description',
    descPh: 'What is this group about?',
    category: 'Category',
    city: 'City / Town',
    cityPh: 'e.g. Yaoundé',
    emoji: 'Emoji (optional)',
    cancel: 'Cancel',
    creating: 'Creating…',
    createBtn: 'Create',
    needLogin: 'Please log in to do this.',
    createFail: 'Could not create the group. Please try again.',
    actionFail: 'Action failed. Please try again.',
    nameReq: 'Group name is required.',
  },
  fr: {
    title: 'Groupes Communautaires',
    subtitle: 'Rejoignez des groupes, partagez et échangez près de chez vous',
    search: 'Rechercher des groupes...',
    create: 'Créer un groupe',
    members: 'membres',
    posts: 'publications',
    join: 'Rejoindre',
    joined: 'Membre',
    leave: 'Quitter',
    empty: 'Aucun groupe dans cette catégorie. Soyez le premier à en créer un !',
    loadError: 'Impossible de charger les groupes. Vérifiez votre connexion.',
    retry: 'Réessayer',
    private: 'Privé',
    newGroup: 'Nouveau groupe',
    name: 'Nom du groupe',
    namePh: 'ex. Commerçants de Yaoundé',
    desc: 'Description',
    descPh: 'De quoi parle ce groupe ?',
    category: 'Catégorie',
    city: 'Ville',
    cityPh: 'ex. Yaoundé',
    emoji: 'Emoji (facultatif)',
    cancel: 'Annuler',
    creating: 'Création…',
    createBtn: 'Créer',
    needLogin: 'Veuillez vous connecter pour continuer.',
    createFail: 'Impossible de créer le groupe. Réessayez.',
    actionFail: "L'action a échoué. Réessayez.",
    nameReq: 'Le nom du groupe est requis.',
  },
  pidgin: {
    title: 'Community Groups',
    subtitle: 'Join groups, share, and trade with people near you',
    search: 'Find groups...',
    create: 'Create Group',
    members: 'members',
    posts: 'posts',
    join: 'Join',
    joined: 'You don join',
    leave: 'Comot',
    empty: 'No group dey this category yet. Be the first one to create am!',
    loadError: 'Groups no load. Check your network.',
    retry: 'Try again',
    private: 'Private',
    newGroup: 'New Group',
    name: 'Group name',
    namePh: 'e.g. Yaoundé Traders',
    desc: 'Description',
    descPh: 'Wetin this group dey about?',
    category: 'Category',
    city: 'City / Town',
    cityPh: 'e.g. Yaoundé',
    emoji: 'Emoji (if you want)',
    cancel: 'Cancel',
    creating: 'E dey create…',
    createBtn: 'Create',
    needLogin: 'Login first before you do this.',
    createFail: 'Group no create. Try again.',
    actionFail: 'E no work. Try again.',
    nameReq: 'Group name must dey.',
  },
  ar: {
    title: 'مجموعات المجتمع',
    subtitle: 'انضم إلى المجموعات، شارك وتاجر مع الناس من حولك',
    search: 'ابحث عن المجموعات...',
    create: 'إنشاء مجموعة',
    members: 'أعضاء',
    posts: 'منشورات',
    join: 'انضمام',
    joined: 'عضو',
    leave: 'مغادرة',
    empty: 'لا توجد مجموعات في هذه الفئة بعد. كن أول من ينشئ واحدة!',
    loadError: 'تعذر تحميل المجموعات. تحقق من اتصالك.',
    retry: 'إعادة المحاولة',
    private: 'خاصة',
    newGroup: 'مجموعة جديدة',
    name: 'اسم المجموعة',
    namePh: 'مثال: تجار ياوندي',
    desc: 'الوصف',
    descPh: 'ما موضوع هذه المجموعة؟',
    category: 'الفئة',
    city: 'المدينة',
    cityPh: 'مثال: ياوندي',
    emoji: 'إيموجي (اختياري)',
    cancel: 'إلغاء',
    creating: 'جارٍ الإنشاء…',
    createBtn: 'إنشاء',
    needLogin: 'سجّل الدخول للمتابعة.',
    createFail: 'تعذر إنشاء المجموعة. حاول مرة أخرى.',
    actionFail: 'فشل الإجراء. حاول مرة أخرى.',
    nameReq: 'اسم المجموعة مطلوب.',
  },
  ff: {
    title: 'Goomuuji Renndo',
    subtitle: 'Naat e goomuuji, lollin, njulaa e yimɓe takko maa',
    search: 'Yiylo goomuuji...',
    create: 'Sos Goomu',
    members: 'terɗe',
    posts: 'jaltine',
    join: 'Naat',
    joined: 'A naatii',
    leave: 'Yaltu',
    empty: 'Alaa goomu e fannu oo tawo. Won gadano sosoowo!',
    loadError: 'Goomuuji ɗi loowaaki. ƴeew internet maa.',
    retry: 'Taƴ kadi',
    private: 'Suuɗiiɗo',
    newGroup: 'Goomu Kesu',
    name: 'Innde goomu',
    namePh: 'wano: Njulaagu Yaoundé',
    desc: 'Sifa',
    descPh: 'Ko goomu oo haali?',
    category: 'Fannu',
    city: 'Saare',
    cityPh: 'wano: Yaoundé',
    emoji: 'Emoji (so waɗii)',
    cancel: 'Haaytu',
    creating: 'Sosgol…',
    createBtn: 'Sos',
    needLogin: 'Naat ado waɗde ɗum.',
    createFail: 'Goomu sosaaki. Taƴ kadi.',
    actionFail: 'Tinaaki. Taƴ kadi.',
    nameReq: 'Innde goomu ina naamnaa.',
  },
};

type TL = typeof T.en;

export default function CommunityPage() {
  const navigate = useNavigate();
  const raw = useLang() as string;
  const langKey = raw === 'fulfulde' ? 'ff' : raw;
  const t: TL = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl = langKey === 'ar';

  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cCat, setCCat] = useState('General');
  const [cCity, setCCity] = useState('');
  const [cEmoji, setCEmoji] = useState('👥');
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id ?? null;
      setUserId(uid);

      const { data, error } = await supabase
        .from('community_groups')
        .select('id, name, description, category, city, emoji, member_count, members_count, post_count, creator_id, is_private, is_active, created_at')
        .or('is_active.is.null,is_active.eq.true')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setGroups((data ?? []) as Group[]);

      if (uid) {
        const { data: mem } = await supabase
          .from('community_members')
          .select('group_id')
          .eq('user_id', uid);
        setMyGroupIds(new Set((mem ?? []).map((m: { group_id: string }) => m.group_id).filter(Boolean)));
      } else {
        setMyGroupIds(new Set());
      }
    } catch (e) {
      console.error('[Community] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((g) => {
      if (cat !== 'All' && (g.category ?? 'General') !== cat) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        (g.description ?? '').toLowerCase().includes(q) ||
        (g.city ?? '').toLowerCase().includes(q)
      );
    });
  }, [groups, query, cat]);

  const memberCount = (g: Group) => Math.max(g.member_count ?? 0, g.members_count ?? 0);

  const toggleJoin = async (g: Group) => {
    if (!userId) { flash(t.needLogin); return; }
    setBusyId(g.id);
    try {
      if (myGroupIds.has(g.id)) {
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('group_id', g.id)
          .eq('user_id', userId);
        if (error) throw error;
        setMyGroupIds((s) => { const n = new Set(s); n.delete(g.id); return n; });
        setGroups((gs) => gs.map((x) => x.id === g.id ? { ...x, member_count: Math.max(memberCount(x) - 1, 0) } : x));
      } else {
        const { error } = await supabase
          .from('community_members')
          .insert({ group_id: g.id, community_id: g.id, user_id: userId, role: 'member' });
        if (error) throw error;
        setMyGroupIds((s) => new Set(s).add(g.id));
        setGroups((gs) => gs.map((x) => x.id === g.id ? { ...x, member_count: memberCount(x) + 1 } : x));
      }
    } catch (e) {
      console.error('[Community] join/leave failed:', e);
      flash(t.actionFail);
    } finally {
      setBusyId(null);
    }
  };

  const createGroup = async () => {
    if (!userId) { setCreateErr(t.needLogin); return; }
    if (!cName.trim()) { setCreateErr(t.nameReq); return; }
    setCreating(true);
    setCreateErr('');
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .insert({
          name: cName.trim(),
          description: cDesc.trim() || null,
          category: cCat,
          city: cCity.trim() || null,
          emoji: cEmoji || '👥',
          creator_id: userId,
          created_by: userId,
          is_private: false,
          is_public: true,
          is_active: true,
          member_count: 0,
          members_count: 0,
        })
        .select('id')
        .single();
      if (error) throw error;
      setShowCreate(false);
      setCName(''); setCDesc(''); setCCity('');
      await load();
      if (data?.id) navigate(`/community/${data.id}`);
    } catch (e) {
      console.error('[Community] create failed:', e);
      setCreateErr(t.createFail);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 pt-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> {t.title}</h1>
            <p className="text-emerald-100 text-sm mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={() => { setCreateErr(''); setShowCreate(true); }}
            className="bg-white text-emerald-700 rounded-xl px-3 py-2 font-semibold text-sm flex items-center gap-1 shadow"
          >
            <Plus className="w-4 h-4" /> {t.create}
          </button>
        </div>
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-gray-800 text-sm outline-none"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
              cat === c ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {catLabel(c, langKey)}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="px-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-16 text-emerald-600"><Loader2 className="w-8 h-8 animate-spin" /></div>
        )}

        {!loading && loadError && (
          <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{t.loadError}</p>
            <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold">{t.retry}</button>
          </div>
        )}

        {!loading && !loadError && visible.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t.empty}</p>
          </div>
        )}

        {!loading && !loadError && visible.map((g) => {
          const joined = myGroupIds.has(g.id);
          return (
            <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0">
                  {g.emoji || '👥'}
                </div>
                <button className="flex-1 text-left" onClick={() => navigate(`/community/${g.id}`)}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 leading-tight">{g.name}</h3>
                    {g.is_private ? (
                      <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {t.private}
                      </span>
                    ) : null}
                  </div>
                  {g.description ? <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{g.description}</p> : null}
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                    <span>{memberCount(g)} {t.members}</span>
                    <span>{g.post_count ?? 0} {t.posts}</span>
                    {g.city ? <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{g.city}</span> : null}
                  </div>
                </button>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => toggleJoin(g)}
                    disabled={busyId === g.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      joined ? 'bg-gray-100 text-gray-600' : 'bg-emerald-600 text-white'
                    } disabled:opacity-50`}
                  >
                    {busyId === g.id ? '…' : joined ? t.leave : t.join}
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      ) : null}

      {/* Create modal */}
      {showCreate ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => !creating && setShowCreate(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900">{t.newGroup}</h2>
              <button onClick={() => !creating && setShowCreate(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{t.name} *</label>
                <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder={t.namePh}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500" maxLength={80} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{t.desc}</label>
                <textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} placeholder={t.descPh} rows={2}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500" maxLength={300} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{t.category}</label>
                  <select value={cCat} onChange={(e) => setCCat(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{catLabel(c, langKey)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">{t.city}</label>
                  <input value={cCity} onChange={(e) => setCCity(e.target.value)} placeholder={t.cityPh}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500" maxLength={60} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{t.emoji}</label>
                <div className="flex gap-2 mt-1">
                  {['👥', '🛍️', '💼', '🏠', '🌾', '💻', '🙏', '⚽', '👩', '🎓'].map((e) => (
                    <button key={e} onClick={() => setCEmoji(e)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border ${cEmoji === e ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              {createErr ? <p className="text-xs text-red-600">{createErr}</p> : null}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowCreate(false)} disabled={creating}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">{t.cancel}</button>
                <button onClick={createGroup} disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60">
                  {creating ? t.creating : t.createBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__COMMUNITYPAGE__COMPLETE
