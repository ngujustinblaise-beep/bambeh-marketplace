// BAMBEH_DEPLOY_TOKEN__COMMUNITYDETAIL_FIX112_CLEAN
/**
 * CommunityDetail — FIX101 (REAL data)
 * ────────────────────────────────────
 * Replaces the mock page (MOCK_POSTS / MOCK_POLL, nothing persisted).
 *  • Group loads from `community_groups`; membership from `community_members`
 *  • Posts feed: real `community_posts` (write for members, delete your own)
 *  • Likes: `community_post_likes` insert/delete (counters via DB triggers)
 *  • Polls: `community_polls` + one-vote-per-user `community_poll_votes`;
 *    the group creator can create a poll (2–4 options)
 *  • 5 languages (EN/FR/Pidgin/AR-RTL/FF — FIX112), loading/empty/error states, chat-only
 */
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Send, Heart, Trash2, Loader2, AlertCircle, MapPin,
  BarChart3, Plus, X, Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

interface Group {
  id: string; name: string; description: string | null; category: string | null;
  city: string | null; emoji: string | null; member_count: number | null;
  members_count: number | null; post_count: number | null; creator_id: string | null;
  is_private: boolean | null; created_at: string;
}
interface Post {
  id: string; group_id: string; author_id: string; author_name: string | null;
  content: string; likes_count: number; created_at: string;
}
interface Poll { id: string; question: string; options: string[]; created_by: string; created_at: string; }
interface VoteRow { poll_id: string; user_id: string; option_index: number; }

const T = {
  en: {
    members: 'members', posts: 'posts', join: 'Join group', joined: 'Member', leave: 'Leave',
    writePh: 'Share something with the group…', post: 'Post', joinToPost: 'Join the group to post.',
    needLogin: 'Please log in to do this.', empty: 'No posts yet. Start the conversation!',
    loadError: 'Could not load this group.', retry: 'Retry', back: 'Back',
    polls: 'Polls', newPoll: 'New poll', question: 'Question', option: 'Option',
    addOption: 'Add option', createPoll: 'Create poll', creating: 'Creating…',
    votes: 'votes', voted: 'You voted', cancel: 'Cancel', actionFail: 'Action failed. Please try again.',
    pollReq: 'A question and at least 2 options are required.', deleteFail: 'Could not delete.',
    private: 'Private group',
  },
  fr: {
    members: 'membres', posts: 'publications', join: 'Rejoindre', joined: 'Membre', leave: 'Quitter',
    writePh: 'Partagez quelque chose avec le groupe…', post: 'Publier', joinToPost: 'Rejoignez le groupe pour publier.',
    needLogin: 'Veuillez vous connecter pour continuer.', empty: 'Aucune publication. Lancez la discussion !',
    loadError: 'Impossible de charger ce groupe.', retry: 'Réessayer', back: 'Retour',
    polls: 'Sondages', newPoll: 'Nouveau sondage', question: 'Question', option: 'Option',
    addOption: 'Ajouter une option', createPoll: 'Créer le sondage', creating: 'Création…',
    votes: 'votes', voted: 'Vous avez voté', cancel: 'Annuler', actionFail: "L'action a échoué. Réessayez.",
    pollReq: 'Une question et au moins 2 options sont requises.', deleteFail: 'Suppression impossible.',
    private: 'Groupe privé',
  },
  pidgin: {
    members: 'members', posts: 'posts', join: 'Join group', joined: 'Member', leave: 'Comot',
    writePh: 'Talk something give the group…', post: 'Post', joinToPost: 'Join the group first before you post.',
    needLogin: 'Login first before you do this.', empty: 'No post yet. Start the talk!',
    loadError: 'This group no load.', retry: 'Try again', back: 'Go back',
    polls: 'Polls', newPoll: 'New poll', question: 'Question', option: 'Option',
    addOption: 'Add option', createPoll: 'Create poll', creating: 'E dey create…',
    votes: 'votes', voted: 'You don vote', cancel: 'Cancel', actionFail: 'E no work. Try again.',
    pollReq: 'You need question and at least 2 options.', deleteFail: 'E no fit delete.',
    private: 'Private group',
  },
  ar: {
    members: 'أعضاء', posts: 'منشورات', join: 'انضم للمجموعة', joined: 'عضو', leave: 'مغادرة',
    writePh: 'شارك شيئًا مع المجموعة…', post: 'نشر', joinToPost: 'انضم للمجموعة لتتمكن من النشر.',
    needLogin: 'سجّل الدخول للمتابعة.', empty: 'لا منشورات بعد. ابدأ النقاش!',
    loadError: 'تعذر تحميل هذه المجموعة.', retry: 'إعادة المحاولة', back: 'رجوع',
    polls: 'استطلاعات', newPoll: 'استطلاع جديد', question: 'السؤال', option: 'خيار',
    addOption: 'إضافة خيار', createPoll: 'إنشاء استطلاع', creating: 'جارٍ الإنشاء…',
    votes: 'أصوات', voted: 'لقد صوّتّ', cancel: 'إلغاء', actionFail: 'فشل الإجراء. حاول مرة أخرى.',
    pollReq: 'يلزم سؤال وخياران على الأقل.', deleteFail: 'تعذر الحذف.',
    private: 'مجموعة خاصة',
  },
  ff: {
    members: 'terɗe', posts: 'jaltine', join: 'Naat e goomu', joined: 'Terɗo', leave: 'Yaltu',
    writePh: 'Lollin huťnde e goomu…', post: 'Yaltin', joinToPost: 'Naat e goomu ado yaltinde.',
    needLogin: 'Naat ado waɗde ɗum.', empty: 'Alaa jaltine tawo. Fuɗɗu yeewtere!',
    loadError: 'Goomu oo loowaaki.', retry: 'Taƴ kadi', back: 'Rutto',
    polls: 'Woote', newPoll: 'Woote keso', question: 'Naamnal', option: 'Suɓaaɗo',
    addOption: 'Ɓeydu suɓaaɗo', createPoll: 'Sos woote', creating: 'Sosgol…',
    votes: 'daaɗe', voted: 'A wootii', cancel: 'Haaytu', actionFail: 'Tinaaki. Taƴ kadi.',
    pollReq: 'Naamnal e suɓaaɗi 2 famarooji ina naamnaa.', deleteFail: 'Momtaaki.',
    private: 'Goomu suuɗiiɗo',
  },
};

type TL = typeof T.en;

const timeAgo = (iso: string, fr: boolean) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return fr ? "à l'instant" : 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24); return fr ? `${d} j` : `${d} d`;
};

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const raw = useLang() as string;
  const langKey = raw === 'fulfulde' ? 'ff' : raw;
  const t: TL = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl = langKey === 'ar';
  const fr = langKey === 'fr';

  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [myName, setMyName] = useState<string>('');
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [toast, setToast] = useState('');

  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const [showPoll, setShowPoll] = useState(false);
  const [pQuestion, setPQuestion] = useState('');
  const [pOptions, setPOptions] = useState<string[]>(['', '']);
  const [pBusy, setPBusy] = useState(false);
  const [pErr, setPErr] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const memberCount = (g: Group) => Math.max(g.member_count ?? 0, g.members_count ?? 0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(false);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id ?? null;
      setUserId(uid);

      const { data: g, error: gErr } = await supabase
        .from('community_groups')
        .select('id, name, description, category, city, emoji, member_count, members_count, post_count, creator_id, is_private, created_at')
        .eq('id', id)
        .maybeSingle();
      if (gErr) throw gErr;
      if (!g) { setLoadError(true); setLoading(false); return; }
      setGroup(g as Group);

      const { data: ps, error: pErr2 } = await supabase
        .from('community_posts')
        .select('id, group_id, author_id, author_name, content, likes_count, created_at')
        .eq('group_id', id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (pErr2) throw pErr2;
      setPosts((ps ?? []) as Post[]);

      const { data: pl } = await supabase
        .from('community_polls')
        .select('id, question, options, created_by, created_at')
        .eq('group_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      const cleanPolls: Poll[] = (pl ?? []).map((p: { id: string; question: string; options: unknown; created_by: string; created_at: string }) => ({
        ...p,
        options: Array.isArray(p.options) ? (p.options as unknown[]).map(String) : [],
      }));
      setPolls(cleanPolls);

      if (cleanPolls.length > 0) {
        const { data: vs } = await supabase
          .from('community_poll_votes')
          .select('poll_id, user_id, option_index')
          .in('poll_id', cleanPolls.map((p) => p.id));
        setVotes((vs ?? []) as VoteRow[]);
      } else {
        setVotes([]);
      }

      if (uid) {
        const { data: mem } = await supabase
          .from('community_members')
          .select('user_id')
          .eq('group_id', id)
          .eq('user_id', uid)
          .maybeSingle();
        setIsMember(Boolean(mem));

        if ((ps ?? []).length > 0) {
          const { data: likes } = await supabase
            .from('community_post_likes')
            .select('post_id')
            .eq('user_id', uid)
            .in('post_id', (ps ?? []).map((p: { id: string }) => p.id));
          setMyLikes(new Set((likes ?? []).map((l: { post_id: string }) => l.post_id)));
        }

        try {
          const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', uid).maybeSingle();
          setMyName((prof?.full_name as string) || auth?.user?.email?.split('@')[0] || 'Bambeh user');
        } catch {
          setMyName(auth?.user?.email?.split('@')[0] || 'Bambeh user');
        }
      }
    } catch (e) {
      console.error('[CommunityDetail] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggleJoin = async () => {
    if (!userId || !group) { flash(t.needLogin); return; }
    setBusy('join');
    try {
      if (isMember) {
        const { error } = await supabase.from('community_members').delete().eq('group_id', group.id).eq('user_id', userId);
        if (error) throw error;
        setIsMember(false);
        setGroup((g) => g ? { ...g, member_count: Math.max(memberCount(g) - 1, 0) } : g);
      } else {
        const { error } = await supabase.from('community_members')
          .insert({ group_id: group.id, community_id: group.id, user_id: userId, role: 'member' });
        if (error) throw error;
        setIsMember(true);
        setGroup((g) => g ? { ...g, member_count: memberCount(g) + 1 } : g);
      }
    } catch (e) {
      console.error('[CommunityDetail] join/leave failed:', e);
      flash(t.actionFail);
    } finally { setBusy(null); }
  };

  const submitPost = async () => {
    if (!userId) { flash(t.needLogin); return; }
    if (!isMember) { flash(t.joinToPost); return; }
    const content = draft.trim();
    if (!content || !group) return;
    setPosting(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({ group_id: group.id, author_id: userId, author_name: myName, content })
        .select('id, group_id, author_id, author_name, content, likes_count, created_at')
        .single();
      if (error) throw error;
      setPosts((ps) => [data as Post, ...ps]);
      setDraft('');
    } catch (e) {
      console.error('[CommunityDetail] post failed:', e);
      flash(t.actionFail);
    } finally { setPosting(false); }
  };

  const toggleLike = async (p: Post) => {
    if (!userId) { flash(t.needLogin); return; }
    setBusy(p.id);
    try {
      if (myLikes.has(p.id)) {
        const { error } = await supabase.from('community_post_likes').delete().eq('post_id', p.id).eq('user_id', userId);
        if (error) throw error;
        setMyLikes((s) => { const n = new Set(s); n.delete(p.id); return n; });
        setPosts((ps) => ps.map((x) => x.id === p.id ? { ...x, likes_count: Math.max(x.likes_count - 1, 0) } : x));
      } else {
        const { error } = await supabase.from('community_post_likes').insert({ post_id: p.id, user_id: userId });
        if (error) throw error;
        setMyLikes((s) => new Set(s).add(p.id));
        setPosts((ps) => ps.map((x) => x.id === p.id ? { ...x, likes_count: x.likes_count + 1 } : x));
      }
    } catch (e) {
      console.error('[CommunityDetail] like failed:', e);
      flash(t.actionFail);
    } finally { setBusy(null); }
  };

  const deletePost = async (p: Post) => {
    if (!userId || p.author_id !== userId) return;
    setBusy(p.id);
    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', p.id).eq('author_id', userId);
      if (error) throw error;
      setPosts((ps) => ps.filter((x) => x.id !== p.id));
    } catch (e) {
      console.error('[CommunityDetail] delete failed:', e);
      flash(t.deleteFail);
    } finally { setBusy(null); }
  };

  const votePoll = async (poll: Poll, optionIndex: number) => {
    if (!userId) { flash(t.needLogin); return; }
    if (votes.some((v) => v.poll_id === poll.id && v.user_id === userId)) return;
    setBusy(poll.id);
    try {
      const { error } = await supabase.from('community_poll_votes')
        .insert({ poll_id: poll.id, user_id: userId, option_index: optionIndex });
      if (error) throw error;
      setVotes((vs) => [...vs, { poll_id: poll.id, user_id: userId, option_index: optionIndex }]);
    } catch (e) {
      console.error('[CommunityDetail] vote failed:', e);
      flash(t.actionFail);
    } finally { setBusy(null); }
  };

  const createPoll = async () => {
    if (!userId || !group) { setPErr(t.needLogin); return; }
    const opts = pOptions.map((o) => o.trim()).filter(Boolean);
    if (!pQuestion.trim() || opts.length < 2) { setPErr(t.pollReq); return; }
    setPBusy(true);
    setPErr('');
    try {
      const { data, error } = await supabase.from('community_polls')
        .insert({ group_id: group.id, question: pQuestion.trim(), options: opts, created_by: userId })
        .select('id, question, options, created_by, created_at')
        .single();
      if (error) throw error;
      setPolls((pl) => [{ ...(data as Poll), options: opts }, ...pl]);
      setShowPoll(false);
      setPQuestion('');
      setPOptions(['', '']);
    } catch (e) {
      console.error('[CommunityDetail] poll create failed:', e);
      setPErr(t.actionFail);
    } finally { setPBusy(false); }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-emerald-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (loadError || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <p className="text-sm text-gray-600">{t.loadError}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">{t.back}</button>
          <button onClick={load} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold">{t.retry}</button>
        </div>
      </div>
    );
  }

  const iAmCreator = userId != null && group.creator_id === userId;

  return (
    <div className="min-h-screen bg-gray-50 pb-28" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-emerald-100 text-sm mb-3">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t.back}
        </button>
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl">{group.emoji || '👥'}</div>
          <div className="flex-1">
            <h1 className="text-xl font-bold leading-tight">{group.name}</h1>
            {group.description ? <p className="text-emerald-100 text-xs mt-1">{group.description}</p> : null}
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-emerald-100">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {memberCount(group)} {t.members}</span>
              <span>{posts.length} {t.posts}</span>
              {group.city ? <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{group.city}</span> : null}
              {group.is_private ? <span className="flex items-center gap-0.5"><Lock className="w-3 h-3" />{t.private}</span> : null}
            </div>
          </div>
          <button
            onClick={toggleJoin}
            disabled={busy === 'join'}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${isMember ? 'bg-white/15 text-white' : 'bg-white text-emerald-700'} disabled:opacity-60`}
          >
            {busy === 'join' ? '…' : isMember ? t.leave : t.join}
          </button>
        </div>
      </div>

      {/* Polls */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-emerald-600" /> {t.polls}</h2>
          {iAmCreator ? (
            <button onClick={() => { setPErr(''); setShowPoll(true); }} className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> {t.newPoll}
            </button>
          ) : null}
        </div>
        {polls.map((poll) => {
          const pollVotes = votes.filter((v) => v.poll_id === poll.id);
          const mine = userId ? pollVotes.find((v) => v.user_id === userId) : undefined;
          const total = pollVotes.length;
          return (
            <div key={poll.id} className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
              <p className="text-sm font-semibold text-gray-900">{poll.question}</p>
              <div className="mt-2 space-y-1.5">
                {poll.options.map((opt, i) => {
                  const n = pollVotes.filter((v) => v.option_index === i).length;
                  const pct = total > 0 ? Math.round((n / total) * 100) : 0;
                  const chosen = mine?.option_index === i;
                  return (
                    <button
                      key={i}
                      onClick={() => votePoll(poll, i)}
                      disabled={Boolean(mine) || busy === poll.id}
                      className="w-full text-left relative overflow-hidden rounded-xl border border-gray-200"
                    >
                      <div className={`absolute inset-y-0 left-0 ${chosen ? 'bg-emerald-200' : 'bg-emerald-50'}`} style={{ width: `${mine ? pct : 0}%` }} />
                      <div className="relative flex justify-between px-3 py-2 text-xs">
                        <span className={chosen ? 'font-semibold text-emerald-800' : 'text-gray-700'}>{opt}</span>
                        {mine ? <span className="text-gray-500">{pct}%</span> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">{total} {t.votes}{mine ? ` · ${t.voted}` : ''}</p>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isMember ? t.writePh : t.joinToPost}
            disabled={!isMember}
            rows={2}
            maxLength={1000}
            className="flex-1 text-sm outline-none resize-none disabled:bg-transparent disabled:text-gray-400"
          />
          <button
            onClick={submitPost}
            disabled={posting || !draft.trim() || !isMember}
            className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center disabled:opacity-40"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="px-4 mt-3 space-y-3">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">{t.empty}</div>
        ) : posts.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                  {(p.author_name || 'B').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{p.author_name || 'Bambeh user'}</p>
                  <p className="text-[10px] text-gray-400">{timeAgo(p.created_at, fr)}</p>
                </div>
              </div>
              {userId === p.author_id ? (
                <button onClick={() => deletePost(p)} disabled={busy === p.id} className="text-gray-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : null}
            </div>
            <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{p.content}</p>
            <button
              onClick={() => toggleLike(p)}
              disabled={busy === p.id}
              className={`mt-2 flex items-center gap-1 text-xs ${myLikes.has(p.id) ? 'text-red-500 font-semibold' : 'text-gray-400'}`}
            >
              <Heart className={`w-4 h-4 ${myLikes.has(p.id) ? 'fill-red-500' : ''}`} /> {p.likes_count}
            </button>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">{toast}</div>
      ) : null}

      {/* Poll modal */}
      {showPoll ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => !pBusy && setShowPoll(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900">{t.newPoll}</h2>
              <button onClick={() => !pBusy && setShowPoll(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <label className="text-xs font-medium text-gray-600">{t.question} *</label>
            <input value={pQuestion} onChange={(e) => setPQuestion(e.target.value)} maxLength={200}
              className="mt-1 mb-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
            {pOptions.map((o, i) => (
              <input key={i} value={o} onChange={(e) => setPOptions((os) => os.map((x, j) => j === i ? e.target.value : x))}
                placeholder={`${t.option} ${i + 1}`} maxLength={80}
                className="mb-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
            ))}
            {pOptions.length < 4 ? (
              <button onClick={() => setPOptions((os) => [...os, ''])} className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mb-3">
                <Plus className="w-3.5 h-3.5" /> {t.addOption}
              </button>
            ) : null}
            {pErr ? <p className="text-xs text-red-600 mb-2">{pErr}</p> : null}
            <div className="flex gap-3">
              <button onClick={() => setShowPoll(false)} disabled={pBusy}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">{t.cancel}</button>
              <button onClick={createPoll} disabled={pBusy}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60">
                {pBusy ? t.creating : t.createPoll}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__COMMUNITYDETAIL__COMPLETE
