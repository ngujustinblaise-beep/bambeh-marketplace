// BAMBEH_DEPLOY_TOKEN__WOMENS_HEALTH_QUIZ_FIX723_CLEAN
/**
 * src/features/womenshealth/WomensHealthQuiz.tsx - FIX723
 *   route: /womens-health/quiz   (also reached from the Bambeh Quiz page, FIX725)
 *
 * HEALTH QUIZZES - contraception, preventing infections (STIs), consent. Big, 11 Oct 2026:
 * "quiz games around contraceptive options, STI prevention, and consent ... linked to our in-app
 * quiz section". Free, and - like every free service - it needs a Bambeh account.
 *
 *   - Six questions per topic. Tap an answer: right or not, the explanation shows at once, so
 *     every question teaches something. The options are shuffled each time.
 *   - The score and the best score stay ON THIS PHONE ("Forget my scores" wipes them). The
 *     database only counts that a quiz was finished today, in which topic and language, and
 *     whether every answer was right - never who, never the answers (bambeh_wh_quiz_done, FIX715),
 *     and at most once per topic per day from one phone.
 *   - SWITCHED OFF until a health worker has checked the questions, language by language, exactly
 *     like the pregnancy guide: an admin switches them on in the Command Center with the health
 *     worker's name. A woman whose language was not checked plays in a checked language, with a
 *     line saying so. Staff can play every language before that, under a "preview" banner - their
 *     games are not counted.
 *   - Every score screen points to real help: family planning, free screening days, and the help
 *     lines 1511 and 116. QUICK EXIT at the bottom left (whUi, FIX719).
 * No Zerm coins: health knowledge is not a contest (the Bambeh Quiz keeps its coins).
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, GraduationCap, Info, Loader2, Phone, RotateCcw, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import { FreeAccountCard, FreeAccountChecking, useFreeAccount } from '@/components/security/FreeServiceGate';
import { LANG_NAMES, QUIZ, QUIZ_TOPICS, WH_LANGS, doualaNow, fmtLongDay, guideLangFor, isQuizTopic, useWhText, whDir, whReason, wt } from './whText';
import type { QuizTopic, WhKey, WhLang } from './whText';
import { getGuide, quizDone } from './whApi';
import type { WhGuide } from './whApi';
import { QuickExit, loadSwitches, saveSwitches } from './whUi';

const BEST_KEY = 'bambeh_wh_quiz_best';
const SENT_KEY = 'bambeh_wh_quiz_sent';

type Best = Partial<Record<QuizTopic, { s: number; n: number }>>;

function loadBest(): Best {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const v = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const out: Best = {};
    for (const k of QUIZ_TOPICS) {
      const x = v[k] as { s?: unknown; n?: unknown } | undefined;
      if (x && typeof x.s === 'number' && typeof x.n === 'number' && x.n > 0 && x.s >= 0 && x.s <= x.n) out[k] = { s: x.s, n: x.n };
    }
    return out;
  } catch {
    return {};
  }
}

function saveBest(b: Best): void {
  try { window.localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch { /* not kept */ }
}

/** Count a finished quiz at most once per topic per day from this phone. */
function firstToday(topic: QuizTopic): boolean {
  const day = doualaNow().ymd;
  try {
    const raw = window.localStorage.getItem(SENT_KEY);
    const v = raw ? (JSON.parse(raw) as { day?: unknown; topics?: unknown }) : {};
    const topics = v.day === day && Array.isArray(v.topics) ? (v.topics as unknown[]).filter((x) => typeof x === 'string') as string[] : [];
    if (topics.indexOf(topic) >= 0) return false;
    window.localStorage.setItem(SENT_KEY, JSON.stringify({ day, topics: topics.concat([topic]) }));
    return true;
  } catch {
    return true;
  }
}

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = a[i]; a[i] = a[j]; a[j] = x;
  }
  return a;
}

interface Game { topic: QuizTopic; i: number; picked: number | null; right: number; order: number[][]; done: boolean }

export default function WomensHealthQuiz() {
  const { lang, dir, t } = useWhText();
  const navigate = useNavigate();
  const location = useLocation();
  const account = useFreeAccount();
  const [guide, setGuide] = useState<WhGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<WhLang>(lang);
  const [game, setGame] = useState<Game | null>(null);
  const [best, setBest] = useState<Best>(loadBest);
  const [forgotten, setForgotten] = useState(false);

  useEffect(() => { setPreviewLang(lang); }, [lang]);

  useEffect(() => {
    let live = true;
    void getGuide().then((r) => {
      if (!live) return;
      if (r.ok) {
        setGuide(r);
        saveSwitches(r);
        return;
      }
      const saved = r.reason === 'network' ? loadSwitches() : null;
      if (saved) {
        setGuide({ ...saved.v, langs: saved.v.langs as WhGuide['langs'], quiz_langs: saved.v.quiz_langs as WhGuide['quiz_langs'],
                   signed_in: false, is_staff: false });
      } else setError(whReason(lang, r.reason));
    });
    return () => { live = false; };
  }, [lang, account]);

  // a topic in the address (?topic=consent) opens straight on it
  const wanted = new URLSearchParams(location.search).get('topic');

  const pick = guide && guide.quiz_on ? guideLangFor(lang, guide.quiz_langs) : { show: null, fallback: false };
  const preview = !!guide && guide.is_staff && (!guide.quiz_on || pick.show === null || pick.fallback);
  const showLang: WhLang | null = preview ? previewLang : pick.show;
  const g = useMemo(() => (key: WhKey, vars?: Record<string, string | number>) => wt(showLang || lang, key, vars), [showLang, lang]);

  const start = (topic: QuizTopic) => {
    if (!showLang) return;
    const qs = QUIZ[showLang][topic];
    setForgotten(false);
    setGame({ topic, i: 0, picked: null, right: 0, order: qs.map((q) => shuffled(q.options.length)), done: false });
  };

  useEffect(() => {
    if (!game && showLang && isQuizTopic(wanted) && account === 'in') start(wanted);
  }, [showLang, wanted, account]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (k: number) => {
    if (!game || !showLang || game.picked !== null) return;
    const q = QUIZ[showLang][game.topic][game.i];
    setGame({ ...game, picked: k, right: game.right + (k === q.answer ? 1 : 0) });
  };

  const next = () => {
    if (!game || !showLang || game.picked === null) return;
    const n = QUIZ[showLang][game.topic].length;
    if (game.i + 1 < n) {
      setGame({ ...game, i: game.i + 1, picked: null });
      return;
    }
    const done = { ...game, done: true };
    setGame(done);
    const old = best[game.topic];
    if (!old || game.right / n > old.s / old.n) {
      const b = { ...best, [game.topic]: { s: game.right, n } };
      setBest(b);
      saveBest(b);
    }
    // only the day, the topic and the language are counted - never the person or the answers
    if (!preview && firstToday(game.topic)) void quizDone(game.topic, showLang, game.right, n);
  };

  const forget = () => {
    try {
      window.localStorage.removeItem(BEST_KEY);
      window.localStorage.removeItem(SENT_KEY);
    } catch { /* nothing kept */ }
    setBest({});
    setForgotten(true);
  };

  const back = (
    <button type="button" onClick={() => (game ? setGame(null) : navigate('/womens-health'))}
            className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100">
      <ChevronLeft className="h-4 w-4 rtl:rotate-180" />{game ? t('quizTitle') : t('title')}
    </button>
  );

  const helpLinks = (
    <div className="space-y-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" data-quiz-help="1">
      <button type="button" onClick={() => navigate('/womens-health?service=family_planning')}
              className="flex w-full items-center justify-between gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-start text-sm font-bold text-rose-800 hover:bg-rose-100">
        <span>{g('qzLearnFp')}</span><ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => navigate('/womens-health/screening')}
              className="flex w-full items-center justify-between gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-start text-sm font-bold text-rose-800 hover:bg-rose-100">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{g('qzLearnScreen')}</span><ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </button>
      <p className="flex items-start gap-2 text-sm font-semibold text-gray-700">
        <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
        <span>{g('qzLearnHelp')} <a href="tel:1511" className="font-extrabold text-rose-700 underline" data-sos="1511">1511</a>{' \u00b7 '}
          <a href="tel:116" className="font-extrabold text-rose-700 underline" data-sos="116">116</a></span>
      </p>
    </div>
  );

  // ---------------------------------------------------------------- no account / checking
  if (account !== 'in') {
    return (
      <div dir={dir} data-fix="FIX723" data-account-state={account} className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-28">
        {back}
        {account === 'checking' ? <FreeAccountChecking /> : <FreeAccountCard body={t('acctBody')} note={t('acctOpen')} />}
        <QuickExit t={t} />
      </div>
    );
  }

  if (!guide && !error) {
    return <div className="flex justify-center py-16 text-gray-400" dir={dir}><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  // ---------------------------------------------------------------- switched off for this woman
  if (error || !guide || showLang === null) {
    return (
      <div dir={dir} data-fix="FIX723" className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-28">
        {back}
        <div className="space-y-3 rounded-3xl border border-purple-100 bg-white p-6 text-center shadow-sm" data-quiz-off="1">
          <GraduationCap className="mx-auto h-10 w-10 text-purple-500" />
          <h1 className="text-xl font-extrabold text-gray-900">{t('quizTitle')}</h1>
          <p className="text-sm text-gray-700">{error || t('qzOff')}</p>
        </div>
        {helpLinks}
        <QuickExit t={t} />
      </div>
    );
  }

  const gDir = whDir(showLang);
  const qs = game ? QUIZ[showLang][game.topic] : [];
  const q = game && !game.done ? qs[game.i] : null;
  const n = qs.length;

  return (
    <div dir={gDir} lang={showLang === 'pidgin' ? 'pcm' : showLang} data-fix="FIX723" data-quiz-lang={showLang}
         className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-28">
      {back}
      {preview && (
        <div className="space-y-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" data-quiz-preview="1" dir={dir}>
          <p className="font-extrabold">{t('qzPreview')}</p>
          <div className="flex flex-wrap gap-1.5">
            {WH_LANGS.map((l) => (
              <button key={l} type="button" onClick={() => { setPreviewLang(l); setGame(null); }} aria-pressed={previewLang === l}
                      className={'rounded-full px-3 py-1 text-xs font-bold ' + (previewLang === l ? 'bg-amber-600 text-white' : 'border border-amber-300 bg-white text-amber-900')}>
                {LANG_NAMES[l]}{guide.quiz_on && guide.quiz_langs.indexOf(l) >= 0 ? ' \u2713' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <header className="rounded-3xl bg-gradient-to-br from-purple-600 to-rose-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20"><GraduationCap className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight">{game ? g(('qz_' + game.topic) as WhKey) : g('quizTitle')}</h1>
            <p className="text-sm text-purple-50">{game ? (game.done ? g('qzScore', { s: game.right, n }) : g('qzQuestion', { i: game.i + 1, n })) : g('quizIntro')}</p>
          </div>
        </div>
        {guide.quiz_on && guide.quiz_reviewer_name && !preview && (
          <p className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-purple-50" data-checked-by="1">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            {g('checkedBy', { name: guide.quiz_reviewer_name, role: guide.quiz_reviewer_role || '', date: fmtLongDay(guide.quiz_reviewed_on || '', showLang) })}
          </p>
        )}
      </header>

      {!preview && pick.fallback && (
        <p className="flex items-start gap-2 rounded-2xl bg-gray-100 p-3 text-sm text-gray-700" data-fallback="1" dir={dir}>
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />{t('notYourLang', { lang: LANG_NAMES[lang], other: LANG_NAMES[showLang] })}
        </p>
      )}

      {!game && (
        <>
          <div className="grid gap-3" data-quiz-topics="1">
            {QUIZ_TOPICS.map((tp) => {
              const b = best[tp];
              return (
                <button key={tp} type="button" onClick={() => start(tp)} data-quiz-topic={tp}
                        className="flex w-full items-center gap-3 rounded-2xl border border-purple-100 bg-white p-4 text-start shadow-sm hover:bg-purple-50">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white"><GraduationCap className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold text-gray-900">{g(('qz_' + tp) as WhKey)}</span>
                    <span className="block text-xs text-gray-600">
                      {g('qzCount', { n: QUIZ[showLang][tp].length })}
                      {b ? ' \u00b7 ' + g('qzBest', { s: b.s, n: b.n }) : ''}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 text-purple-600 rtl:rotate-180" />
                </button>
              );
            })}
          </div>
          {(Object.keys(best).length > 0 || forgotten) && (
            forgotten
              ? <p className="text-center text-xs font-semibold text-gray-500" data-forgotten="1">{g('qzForgotten')}</p>
              : (
                <button type="button" onClick={forget} data-forget="1"
                        className="mx-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100">
                  <Trash2 className="h-3.5 w-3.5" />{g('qzForget')}
                </button>
              )
          )}
          {helpLinks}
        </>
      )}

      {game && q && (
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" data-question={game.i + 1}>
          <h2 className="text-lg font-extrabold leading-snug text-gray-900">{q.q}</h2>
          <div className="grid gap-2">
            {game.order[game.i].map((k) => {
              const isPicked = game.picked === k;
              const isRight = k === q.answer;
              const shown = game.picked !== null;
              const cls = !shown ? 'border-gray-200 bg-white hover:border-purple-300'
                : isRight ? 'border-green-500 bg-green-50 text-green-900'
                : isPicked ? 'border-red-400 bg-red-50 text-red-900' : 'border-gray-100 bg-gray-50 text-gray-500';
              return (
                <button key={k} type="button" onClick={() => answer(k)} disabled={shown} aria-pressed={isPicked} data-option={k}
                        data-right={shown && isRight ? '1' : undefined}
                        className={'flex w-full items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-start text-sm font-semibold transition ' + cls}>
                  {shown && isRight ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    : shown && isPicked ? <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" /> : null}
                  <span>{q.options[k]}</span>
                </button>
              );
            })}
          </div>
          {game.picked !== null && (
            <div role="status" data-feedback={game.picked === q.answer ? 'right' : 'wrong'}
                 className={'space-y-1 rounded-xl p-3 text-sm ' + (game.picked === q.answer ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-900')}>
              <p className="font-extrabold">{game.picked === q.answer ? g('qzRight') : g('qzWrong')}</p>
              <p>{q.why}</p>
            </div>
          )}
          {game.picked !== null && (
            <button type="button" onClick={next} data-next="1"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-base font-extrabold text-white shadow hover:bg-purple-700">
              {game.i + 1 < n ? g('qzNext') : g('qzFinish')}<ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          )}
        </section>
      )}

      {game && game.done && (
        <>
          <section className="space-y-3 rounded-2xl border border-purple-100 bg-white p-5 text-center shadow-sm" data-score={game.right + '/' + n}>
            <p className="text-4xl font-extrabold text-purple-700">{g('qzScore', { s: game.right, n })}</p>
            <p className="font-bold text-gray-800">{game.right === n ? g('qzPerfect') : game.right * 2 >= n ? g('qzGood') : g('qzLow')}</p>
            {best[game.topic] && <p className="text-xs font-semibold text-gray-500">{g('qzBest', { s: best[game.topic]!.s, n: best[game.topic]!.n })}</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => start(game.topic)} data-again="1"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-sm font-extrabold text-white">
                <RotateCcw className="h-4 w-4" />{g('qzAgain')}
              </button>
              <button type="button" onClick={() => setGame(null)} data-other="1"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 py-2.5 text-sm font-extrabold text-purple-700">
                {g('qzOther')}
              </button>
            </div>
          </section>
          {helpLinks}
        </>
      )}

      <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">{g('qzFoot')} {g('freeLine')}</p>
      <QuickExit t={t} />
    </div>
  );
}
// BAMBEH_END_TOKEN__WOMENS_HEALTH_QUIZ_FIX723__COMPLETE
