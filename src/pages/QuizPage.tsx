// BAMBEH_DEPLOY_TOKEN__QUIZPAGE_FIX165B_SUBONLY_CLEAN
/**
 * QuizPage.tsx \u2014 Bambeh Quiz Gamification (FIX165)
 * DEPLOY: src/pages/QuizPage.tsx   (route /quiz added by App FIX166)
 *
 * Users answer live trick questions and win Zerm coins. All awarding happens
 * atomically in the answer_quiz() RPC (fix164) \u2014 this page never decides who
 * wins; it just shows the honest result, including "correct but the winner
 * limit for your area was reached".
 * \u00a9 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trophy, Clock, Loader2, AlertCircle, CheckCircle2,
  XCircle, Coins, MapPin, HelpCircle, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const REGIONS = ['Adamawa','Centre','East','Far North','Littoral','North','Northwest','South','Southwest','West'];

const T: Record<Lang, {
  title: string; subtitle: string; back: string; refresh: string;
  live: string; ended: string; endsIn: string; reward: string;
  yourAnswer: string; submit: string; submitting: string;
  needLogin: string; goLogin: string;
  regionTitle: string; regionHelp: string; region: string; subdivision: string;
  subdivisionPh: string; saveArea: string;
  winTitle: string; winBody: string;
  correctNoWin: string; capTotal: string; capRegion: string; capSubdivision: string;
  wrong: string; already: string; endedMsg: string; subdivisionRequired: string;
  empty: string; loadFail: string; retry: string; myResults: string;
  needSub: string; goSub: string;
  won: string; correctLabel: string; wrongLabel: string;
}> = {
  en: {
    title: 'Bambeh Quiz', subtitle: 'Answer fast, answer right \u2014 win Zerm coins. Strict winner limits!',
    back: 'Back', refresh: 'Refresh',
    live: 'LIVE', ended: 'Ended', endsIn: 'Ends in', reward: 'per winner',
    yourAnswer: 'Your answer', submit: 'Submit answer', submitting: 'Checking\u2026',
    needLogin: 'Please log in to play the quiz.', goLogin: 'Go to Login',
    regionTitle: 'Where are you playing from?',
    regionHelp: 'Winner limits are shared fairly across all 10 regions of Cameroon. Set once \u2014 it stays on your profile.',
    region: 'Region', subdivision: 'Subdivision', subdivisionPh: 'e.g. Yaounde I, Buea, Kousseri\u2026',
    saveArea: 'Save & continue',
    winTitle: 'YOU WON!', winBody: 'Zerm coins added to your wallet. Congratulations!',
    correctNoWin: 'Correct answer \u2014 but the winner limit was already reached:',
    capTotal: 'total winner limit reached.', capRegion: 'your region\u2019s winner quota is full.',
    capSubdivision: 'your subdivision\u2019s winner quota is full.',
    wrong: 'Not the right answer this time. Watch for the next quiz!',
    already: 'You already answered this question.', endedMsg: 'This quiz has ended.',
    subdivisionRequired: 'This quiz needs your subdivision \u2014 set it above.',
    empty: 'No live quiz right now. Watch your notifications!',
    loadFail: 'Could not load the quiz. Check your connection.', retry: 'Retry',
    myResults: 'My results', won: 'Won', correctLabel: 'Correct', wrongLabel: 'Wrong',
    needSub: 'The quiz is for subscribed members only. Subscribe to play and win Zerm!', goSub: 'See subscription plans',
  },
  fr: {
    title: 'Quiz Bambeh', subtitle: 'R\u00e9pondez vite et juste \u2014 gagnez des Zerm. Limites strictes de gagnants !',
    back: 'Retour', refresh: 'Actualiser',
    live: 'EN DIRECT', ended: 'Termin\u00e9', endsIn: 'Se termine dans', reward: 'par gagnant',
    yourAnswer: 'Votre r\u00e9ponse', submit: 'Envoyer', submitting: 'V\u00e9rification\u2026',
    needLogin: 'Connectez-vous pour jouer au quiz.', goLogin: 'Aller \u00e0 la connexion',
    regionTitle: 'D\u2019o\u00f9 jouez-vous ?',
    regionHelp: 'Les gagnants sont r\u00e9partis \u00e9quitablement entre les 10 r\u00e9gions du Cameroun. \u00c0 d\u00e9finir une seule fois.',
    region: 'R\u00e9gion', subdivision: 'Arrondissement', subdivisionPh: 'ex. Yaound\u00e9 I, Bu\u00e9a, Kousseri\u2026',
    saveArea: 'Enregistrer et continuer',
    winTitle: 'GAGN\u00c9 !', winBody: 'Zerm ajout\u00e9s \u00e0 votre portefeuille. F\u00e9licitations !',
    correctNoWin: 'Bonne r\u00e9ponse \u2014 mais la limite de gagnants \u00e9tait atteinte :',
    capTotal: 'limite totale atteinte.', capRegion: 'quota de votre r\u00e9gion complet.',
    capSubdivision: 'quota de votre arrondissement complet.',
    wrong: 'Mauvaise r\u00e9ponse cette fois. Guettez le prochain quiz !',
    already: 'Vous avez d\u00e9j\u00e0 r\u00e9pondu \u00e0 cette question.', endedMsg: 'Ce quiz est termin\u00e9.',
    subdivisionRequired: 'Ce quiz demande votre arrondissement \u2014 d\u00e9finissez-le ci-dessus.',
    empty: 'Aucun quiz en cours. Surveillez vos notifications !',
    loadFail: 'Impossible de charger le quiz. V\u00e9rifiez votre connexion.', retry: 'R\u00e9essayer',
    myResults: 'Mes r\u00e9sultats', won: 'Gagn\u00e9', correctLabel: 'Correct', wrongLabel: 'Faux',
    needSub: 'Le quiz est r\u00e9serv\u00e9 aux abonn\u00e9s. Abonnez-vous pour jouer et gagner des Zerm !', goSub: 'Voir les abonnements',
  },
  pidgin: {
    title: 'Bambeh Quiz', subtitle: 'Answer quick, answer correct \u2014 win Zerm coins. Winner limit dey strict!',
    back: 'Go back', refresh: 'Refresh',
    live: 'LIVE', ended: 'Don end', endsIn: 'E go end for', reward: 'per winner',
    yourAnswer: 'Your answer', submit: 'Send answer', submitting: 'We dey check\u2026',
    needLogin: 'Login first make you play the quiz.', goLogin: 'Go Login',
    regionTitle: 'Which side you dey play from?',
    regionHelp: 'Winner dem share fair-fair for all the 10 regions for Cameroon. Set am one time \u2014 e go stay for your profile.',
    region: 'Region', subdivision: 'Subdivision', subdivisionPh: 'e.g. Yaounde I, Buea, Kousseri\u2026',
    saveArea: 'Save make we continue',
    winTitle: 'YOU DON WIN!', winBody: 'Zerm coins don enter your wallet. Congrats!',
    correctNoWin: 'Your answer correct \u2014 but winner limit don already full:',
    capTotal: 'total winner limit don full.', capRegion: 'your region quota don full.',
    capSubdivision: 'your subdivision quota don full.',
    wrong: 'The answer no correct this time. Watch for next quiz!',
    already: 'You don already answer this question.', endedMsg: 'This quiz don end.',
    subdivisionRequired: 'This quiz need your subdivision \u2014 set am for up.',
    empty: 'No quiz dey live now. Watch your notification!',
    loadFail: 'Quiz no gree load. Check your connection.', retry: 'Try again',
    myResults: 'My results', won: 'Win', correctLabel: 'Correct', wrongLabel: 'Wrong',
    needSub: 'Na subscribed members fit play the quiz. Subscribe make you play and win Zerm!', goSub: 'See subscription plans',
  },
  ar: {
    title: '\u0645\u0633\u0627\u0628\u0642\u0629 \u0628\u0627\u0645\u0628\u064a\u0647', subtitle: '\u0623\u062c\u0628 \u0628\u0633\u0631\u0639\u0629 \u0648\u0628\u0634\u0643\u0644 \u0635\u062d\u064a\u062d \u2014 \u0627\u0631\u0628\u062d \u0639\u0645\u0644\u0627\u062a \u0632\u064a\u0631\u0645. \u062d\u062f\u0648\u062f \u0635\u0627\u0631\u0645\u0629 \u0644\u0644\u0641\u0627\u0626\u0632\u064a\u0646!',
    back: '\u0631\u062c\u0648\u0639', refresh: '\u062a\u062d\u062f\u064a\u062b',
    live: '\u0645\u0628\u0627\u0634\u0631', ended: '\u0627\u0646\u062a\u0647\u0649', endsIn: '\u064a\u0646\u062a\u0647\u064a \u062e\u0644\u0627\u0644', reward: '\u0644\u0643\u0644 \u0641\u0627\u0626\u0632',
    yourAnswer: '\u0625\u062c\u0627\u0628\u062a\u0643', submit: '\u0625\u0631\u0633\u0627\u0644', submitting: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642\u2026',
    needLogin: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u0639\u0628.', goLogin: '\u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u062f\u062e\u0648\u0644',
    regionTitle: '\u0645\u0646 \u0623\u064a \u0645\u0646\u0637\u0642\u0629 \u062a\u0644\u0639\u0628\u061f',
    regionHelp: '\u062a\u0648\u0632\u0651\u0639 \u062d\u0635\u0635 \u0627\u0644\u0641\u0627\u0626\u0632\u064a\u0646 \u0628\u0625\u0646\u0635\u0627\u0641 \u0639\u0644\u0649 \u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0648\u0646 \u0627\u0644\u0639\u0634\u0631. \u062a\u064f\u062d\u062f\u062f \u0645\u0631\u0629 \u0648\u0627\u062d\u062f\u0629.',
    region: '\u0627\u0644\u0645\u0646\u0637\u0642\u0629', subdivision: '\u0627\u0644\u0645\u0642\u0627\u0637\u0639\u0629', subdivisionPh: '\u0645\u062b\u0627\u0644: \u064a\u0627\u0648\u0646\u062f\u064a 1\u060c \u0628\u0648\u064a\u0627\u060c \u0643\u0648\u0633\u064a\u0631\u064a\u2026',
    saveArea: '\u062d\u0641\u0638 \u0648\u0645\u062a\u0627\u0628\u0639\u0629',
    winTitle: '\u0644\u0642\u062f \u0641\u0632\u062a!', winBody: '\u0623\u064f\u0636\u064a\u0641\u062a \u0639\u0645\u0644\u0627\u062a \u0632\u064a\u0631\u0645 \u0625\u0644\u0649 \u0645\u062d\u0641\u0638\u062a\u0643. \u0645\u0628\u0631\u0648\u0643!',
    correctNoWin: '\u0625\u062c\u0627\u0628\u0629 \u0635\u062d\u064a\u062d\u0629 \u2014 \u0644\u0643\u0646 \u062d\u062f \u0627\u0644\u0641\u0627\u0626\u0632\u064a\u0646 \u0627\u0643\u062a\u0645\u0644:',
    capTotal: '\u0627\u0643\u062a\u0645\u0644 \u0627\u0644\u062d\u062f \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a.', capRegion: '\u0627\u0643\u062a\u0645\u0644\u062a \u062d\u0635\u0629 \u0645\u0646\u0637\u0642\u062a\u0643.',
    capSubdivision: '\u0627\u0643\u062a\u0645\u0644\u062a \u062d\u0635\u0629 \u0645\u0642\u0627\u0637\u0639\u062a\u0643.',
    wrong: '\u0625\u062c\u0627\u0628\u0629 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629 \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u0629. \u062a\u0631\u0642\u0651\u0628 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629!',
    already: '\u0644\u0642\u062f \u0623\u062c\u0628\u062a \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644.', endedMsg: '\u0627\u0646\u062a\u0647\u062a \u0647\u0630\u0647 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629.',
    subdivisionRequired: '\u0647\u0630\u0647 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629 \u062a\u062d\u062a\u0627\u062c \u0645\u0642\u0627\u0637\u0639\u062a\u0643 \u2014 \u062d\u062f\u062f\u0647\u0627 \u0623\u0639\u0644\u0627\u0647.',
    empty: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0633\u0627\u0628\u0642\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0627\u0644\u0622\u0646. \u0631\u0627\u0642\u0628 \u0625\u0634\u0639\u0627\u0631\u0627\u062a\u0643!',
    loadFail: '\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643.', retry: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629',
    myResults: '\u0646\u062a\u0627\u0626\u062c\u064a', won: '\u0641\u0632\u062a', correctLabel: '\u0635\u062d\u064a\u062d', wrongLabel: '\u062e\u0637\u0623',
    needSub: '\u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629 \u0644\u0644\u0645\u0634\u062a\u0631\u0643\u064a\u0646 \u0641\u0642\u0637. \u0627\u0634\u062a\u0631\u0643 \u0644\u062a\u0644\u0639\u0628 \u0648\u062a\u0631\u0628\u062d \u0632\u064a\u0631\u0645!', goSub: '\u0639\u0631\u0636 \u062e\u0637\u0637 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643',
  },
  ff: {
    title: 'Quiz Bambeh', subtitle: 'Jaabo law, jaabo goonga \u2014 he\u0253 Zerm. Keerol jaal\u0253e ina tii\u0257i!',
    back: 'Rutto', refresh: 'Hes\u0257itin',
    live: 'JOONI', ended: 'Gasii', endsIn: 'Gasata e', reward: 'jaal\u0257o kala',
    yourAnswer: 'Jaabawol maa', submit: 'Neldu jaabawol', submitting: 'Min \u0257a\u0253\u0253ita\u2026',
    needLogin: 'Naatu tawon ngam fijude quiz.', goLogin: 'Yah to Naatugol',
    regionTitle: 'Hoto njeya\u0257aa?',
    regionHelp: 'Jaal\u0253e ina peccee no mo\u01b4\u01b4iri e diiwanuuji 10 Kameruun. Su\u0253o laawol gootol.',
    region: 'Diiwaan', subdivision: 'Falnde', subdivisionPh: 'yeru: Yaounde I, Buea, Kousseri\u2026',
    saveArea: 'Danndu njokken',
    winTitle: 'A JAALII!', winBody: 'Zerm naatii e resorde maa. Jam e jaalagol!',
    correctNoWin: 'Jaabawol goonga \u2014 kono keerol jaal\u0253e timmiino:',
    capTotal: 'keerol fof timmii.', capRegion: 'ge\u0257al diiwaan maa timmii.',
    capSubdivision: 'ge\u0257al falnde maa timmii.',
    wrong: 'Jaabawol ngol feewaani laawol ngol. Reen quiz aroore!',
    already: 'A jaabiima naamnal ngal.', endedMsg: 'Quiz oo gasii.',
    subdivisionRequired: 'Quiz oo ina naamnii falnde maa \u2014 su\u0253o nde dow.',
    empty: 'Alaa quiz jooni. Reen tintine maa!',
    loadFail: 'Quiz loowaaki. \u01b3eewto internet maa.', retry: 'E\u0257\u0257itto',
    myResults: 'Nje\u00f1tudi am', won: 'Jaalii', correctLabel: 'Goonga', wrongLabel: 'Juumre',
    needSub: 'Quiz oo ko wonande sii\u0253otoo\u0253e tan. Sii\u0253o ngam fijude he\u0253aa Zerm!', goSub: 'Yiy peeje sii\u0253agol',
  },
};

interface Quiz {
  id: string; question: string; options: string[] | null;
  reward_zerm: number; tier: number; max_winners: number;
  ends_at: string | null; status: string;
}
interface MyAnswer { question_id: string; is_correct: boolean; is_winner: boolean; reward_zerm: number; }

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

function Countdown({ endsAt, prefix, endedLabel }: { endsAt: string | null; prefix: string; endedLabel: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return <span className="text-xs font-semibold text-gray-400">{endedLabel}</span>;
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return (
    <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
      <Clock className="w-3.5 h-3.5" /> {prefix} {h > 0 ? h + 'h ' : ''}{pad(m)}:{pad(s)}
    </span>
  );
}

export default function QuizPage() {
  const navigate = useNavigate();
  const langRaw = useLang() as unknown;
  const langKey = typeof langRaw === 'string' ? langRaw : (langRaw as { lang?: string })?.lang || 'en';
  const lang: Lang = (langKey in T ? langKey : 'en') as Lang;
  const s = T[lang];
  const isRtl = lang === 'ar';

  const [userId, setUserId] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [mine, setMine] = useState<Record<string, MyAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [profRegion, setProfRegion] = useState<string>('');
  const [profSub, setProfSub] = useState<string>('');
  const [regionSet, setRegionSet] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { kind: string; reward?: number }>>({});

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id ?? null;
      setUserId(uid);

      const { data: qs, error } = await supabase
        .from('quiz_questions')
        .select('id, question, options, reward_zerm, tier, max_winners, ends_at, status')
        .in('status', ['live'])
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setQuizzes((qs ?? []) as Quiz[]);

      if (uid) {
        const { data: prof } = await supabase
          .from('profiles').select('region, subdivision').eq('id', uid).maybeSingle();
        if (prof?.region) { setProfRegion(prof.region); setRegionSet(true); }
        if (prof?.subdivision) setProfSub(prof.subdivision);

        const { data: ans } = await supabase
          .from('quiz_answers')
          .select('question_id, is_correct, is_winner, reward_zerm')
          .eq('user_id', uid)
          .order('answered_at', { ascending: false })
          .limit(30);
        const map: Record<string, MyAnswer> = {};
        (ans ?? []).forEach((a: MyAnswer) => { map[a.question_id] = a; });
        setMine(map);
      }
    } catch (e) {
      console.error('[QuizPage] load failed:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (q: Quiz) => {
    const answer = (answers[q.id] || '').trim();
    if (!answer || busyId) return;
    setBusyId(q.id);
    try {
      const { data, error } = await supabase.rpc('answer_quiz', {
        p_question: q.id,
        p_answer: answer,
        p_region: profRegion || null,
        p_subdivision: profSub || null,
      });
      if (error) throw error;
      const r = (data ?? {}) as { error?: string; correct?: boolean; winner?: boolean; reward?: number; reason?: string };
      let kind = 'wrong';
      if (r.error) kind = r.error;                       // already_answered | ended | region_required | subdivision_required | not_live
      else if (r.winner) kind = 'winner';
      else if (r.correct) kind = 'cap_' + (r.reason?.replace('cap_', '') || 'total');
      setResults(prev => ({ ...prev, [q.id]: { kind, reward: r.reward } }));
      if (kind === 'region_required') setRegionSet(false);
      if (kind === 'winner' || kind === 'wrong' || kind.startsWith('cap_')) load();
    } catch (e) {
      console.error('[QuizPage] answer failed:', e);
      setResults(prev => ({ ...prev, [q.id]: { kind: 'load_fail' } }));
    } finally {
      setBusyId(null);
    }
  };

  const resultBanner = (q: Quiz) => {
    const r = results[q.id];
    const a = mine[q.id];
    const done = r || a;
    if (!done) return null;
    const kind = r?.kind || (a?.is_winner ? 'winner' : a?.is_correct ? 'cap_total' : 'wrong');
    if (kind === 'winner') {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <Trophy className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="font-bold text-emerald-800">{s.winTitle}</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            +{(r?.reward ?? a?.reward_zerm ?? 0).toLocaleString('en-US', { maximumFractionDigits: 6 })} Zerm \u2014 {s.winBody}
          </p>
        </div>
      );
    }
    if (kind.startsWith('cap_')) {
      const why = kind === 'cap_region' ? s.capRegion : kind === 'cap_subdivision' ? s.capSubdivision : s.capTotal;
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{s.correctNoWin} {why}</span>
        </div>
      );
    }
    if (kind === 'subscription_required') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 space-y-2">
          <p>{s.needSub}</p>
          <button onClick={() => navigate('/subscription-plans')}
            className="w-full py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold">
            {s.goSub}
          </button>
        </div>
      );
    }
    const msg =
      kind === 'already_answered' ? s.already :
      kind === 'ended' || kind === 'not_live' ? s.endedMsg :
      kind === 'subdivision_required' ? s.subdivisionRequired :
      kind === 'load_fail' ? s.loadFail : s.wrong;
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 flex items-start gap-2">
        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" /> <span>{msg}</span>
      </div>
    );
  };

  const myHistory: Array<[string, MyAnswer]> = Object.entries(mine);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 pt-5 pb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-amber-100 text-sm">
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {s.back}
          </button>
          <button onClick={load} aria-label={s.refresh} className="bg-white/20 p-2 rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2 mt-1"><Trophy className="w-6 h-6" /> {s.title}</h1>
        <p className="text-amber-100 text-sm mt-1">{s.subtitle}</p>
      </div>

      <div className="px-4 mt-4 space-y-4 max-w-lg mx-auto">
        {/* Not signed in */}
        {!loading && !userId && (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <HelpCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">{s.needLogin}</p>
            <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold">
              {s.goLogin}
            </button>
          </div>
        )}

        {/* Region / subdivision capture (once) */}
        {userId && !regionSet && (
          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
            <p className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-amber-600" /> {s.regionTitle}
            </p>
            <p className="text-xs text-gray-500 mb-3">{s.regionHelp}</p>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{s.region}</label>
            <select
              value={profRegion}
              onChange={e => setProfRegion(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm mb-3 bg-white outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">\u2014</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{s.subdivision}</label>
            <input
              value={profSub}
              onChange={e => setProfSub(e.target.value)}
              placeholder={s.subdivisionPh}
              className="w-full border rounded-xl px-3 py-2.5 text-sm mb-3 outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={() => { if (profRegion) setRegionSet(true); }}
              disabled={!profRegion}
              className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {s.saveArea}
            </button>
          </div>
        )}

        {/* Loading / error / empty */}
        {loading && <div className="flex justify-center py-16 text-amber-600"><Loader2 className="w-8 h-8 animate-spin" /></div>}
        {!loading && loadError && (
          <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{s.loadFail}</p>
            <button onClick={load} className="mt-3 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold">{s.retry}</button>
          </div>
        )}
        {!loading && !loadError && userId && quizzes.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{s.empty}</p>
          </div>
        )}

        {/* Live quizzes */}
        {!loading && !loadError && userId && quizzes.map(q => {
          const answered = !!mine[q.id] || !!results[q.id];
          return (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-red-100 text-red-700 text-[10px] font-bold rounded-full px-2 py-0.5">{s.live}</span>
                <Countdown endsAt={q.ends_at} prefix={s.endsIn} endedLabel={s.ended} />
              </div>
              <p className="font-semibold text-gray-900">{q.question}</p>
              <p className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                {Number(q.reward_zerm).toLocaleString('en-US', { maximumFractionDigits: 6 })} Zerm {s.reward}
              </p>

              {!answered && (
                Array.isArray(q.options) && q.options.length > 0 ? (
                  <div className="grid gap-2">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm transition ${
                          answers[q.id] === opt ? 'border-amber-500 bg-amber-50 font-semibold' : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={s.yourAnswer}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                )
              )}

              {!answered && (
                <button
                  onClick={() => submit(q)}
                  disabled={busyId === q.id || !(answers[q.id] || '').trim() || (!regionSet && !profRegion)}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busyId === q.id ? (<><Loader2 className="w-4 h-4 animate-spin" /> {s.submitting}</>) : s.submit}
                </button>
              )}

              {resultBanner(q)}
            </div>
          );
        })}

        {/* My results */}
        {userId && myHistory.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="font-semibold text-gray-900 text-sm mb-2">{s.myResults}</p>
            <div className="space-y-1.5">
              {myHistory.slice(0, 10).map(([qid, a]) => (
                <div key={qid} className="flex items-center justify-between text-xs">
                  <span className={a.is_winner ? 'text-emerald-700 font-semibold' : a.is_correct ? 'text-amber-700' : 'text-gray-400'}>
                    {a.is_winner ? s.won : a.is_correct ? s.correctLabel : s.wrongLabel}
                  </span>
                  {a.is_winner && (
                    <span className="text-emerald-700 font-semibold">
                      +{Number(a.reward_zerm).toLocaleString('en-US', { maximumFractionDigits: 6 })} Zerm
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__QUIZPAGE_FIX165B__COMPLETE
