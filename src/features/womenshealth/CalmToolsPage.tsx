// BAMBEH_DEPLOY_TOKEN__CALM_TOOLS_PAGE_FIX742_CLEAN
/**
 * src/features/womenshealth/CalmToolsPage.tsx - FIX742 (new) - route /calm
 *
 * CALM TOOLS - short self-help exercises (slow breathing, 5-4-3-2-1, a heavy thought, worry, one
 * small step, better sleep) and WHEN TO GET HELP, in the five app languages.
 * Big, 12 Oct 2026: "we don't treat. will get a psychologist to check and point people to health
 * units for follow up". Big, 14 Oct 2026: staff add, edit and delete the tools from the Command
 * Center (FIX743); this page shows what they published (FIX737).
 *
 *   - Every text shown was checked by a psychologist, language by language, and the page says who
 *     and when. A tool not yet checked in the reader's language is shown in the closest checked one
 *     (Fulfulde and Arabic: French, then English; Pidgin: English, then French), with a line saying so.
 *   - "When to get help" is always first and always open - no account, no guest day - and always
 *     ends with "Find a listening centre", "Hospitals on duty", the emergency numbers and the Safety
 *     button. Bambeh does not treat.
 *   - The other tools: a first-time phone uses them during its guest day (FIX730); after that, the
 *     free account card (free, never a subscription).
 *   - SLOW BREATHING: a circle grows while she breathes in and shrinks while she breathes out (4 s and
 *     6 s unless staff changed it), for 1, 2 or 3 minutes. STEP BY STEP: one step at a time, or all of
 *     them. TIPS: a list.
 *   - Nothing typed or done here leaves the phone. Only "a tool was opened" is counted, per day and
 *     language, for signed-in phones - never who.
 *   - No connection: the last published tools saved on this phone, with the date.
 *   - Staff: the page while it is switched off, and "See the drafts" (?preview=1) to read the drafts
 *     exactly as the public would see them, before an admin publishes them.
 *   - QUICK EXIT at the bottom left (whUi, FIX719).
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Eye, Footprints, Headphones, Leaf, LifeBuoy, ListChecks, Loader2, Play, RefreshCw, RotateCcw, Square,
  Stethoscope, Wind,
} from 'lucide-react';
import { EmergencyLines, FreeAccountCard, FreeAccountChecking, GuestBanner, useFreeAccount } from '@/components/security/FreeServiceGate';
import { LANG_NAMES, fmtLongDay, fmtSavedAt, guideLangFor, useWhText, whDir, whReason } from './whText';
import type { WhLang } from './whText';
import { OfflineNote, QuickExit } from './whUi';
import { calmOpened, calmPage, loadCalm, saveCalm } from './calmApi';
import type { CalmPage, CalmText, CalmTool } from './calmApi';
import { clock, useCalmText } from './calmText';
import type { CalmKey, CalmKind, CalmT } from './calmText';

/** The language to show a tool in, from the languages it was published in. */
export function pickCalmLang(lang: WhLang, tool: CalmTool): { shown: WhLang; text: CalmText; fallback: boolean } | null {
  const have = Object.keys(tool.texts);
  const p = guideLangFor(lang, have);
  if (!p.show) return null;
  const text = tool.texts[p.show];
  return text ? { shown: p.show, text, fallback: p.fallback } : null;
}

function KindIcon({ kind, className }: { kind: CalmKind; className: string }) {
  if (kind === 'help') return <LifeBuoy className={className} aria-hidden="true" />;
  if (kind === 'breathe') return <Wind className={className} aria-hidden="true" />;
  if (kind === 'steps') return <Footprints className={className} aria-hidden="true" />;
  return <ListChecks className={className} aria-hidden="true" />;
}

function prefersLessMotion(): boolean {
  try {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** SLOW BREATHING: the circle grows on the in-breath and shrinks on the out-breath; ends on a full out-breath. */
export function Breather({ inS, outS, t }: { inS: number; outS: number; t: CalmT }) {
  const [still] = useState(prefersLessMotion);
  const [mins, setMins] = useState(2);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const cycle = inS + outS;
  const total = Math.ceil((mins * 60) / cycle) * cycle;

  useEffect(() => {
    if (elapsed === null) return undefined;
    if (elapsed >= total) {
      setElapsed(null);
      setDone(true);
      return undefined;
    }
    const id = window.setTimeout(() => setElapsed((e) => (e === null ? null : e + 1)), 1000);
    return () => window.clearTimeout(id);
  }, [elapsed, total]);

  const running = elapsed !== null;
  const pos = running ? elapsed % cycle : 0;
  const phase: 'in' | 'out' = pos < inS ? 'in' : 'out';
  const phaseLeft = phase === 'in' ? inS - pos : cycle - pos;
  const big = running && phase === 'in';
  const style = {
    transform: 'scale(' + (still ? 0.85 : big ? 1 : 0.6) + ')',
    transitionProperty: 'transform',
    transitionTimingFunction: 'ease-in-out',
    transitionDuration: (still || !running ? 0.4 : phase === 'in' ? inS : outS) + 's',
  };

  return (
    <section className="space-y-4 rounded-3xl border border-teal-100 bg-white p-5 text-center shadow-sm" data-breather={running ? phase : 'stopped'}>
      <div className="mx-auto flex h-56 w-56 items-center justify-center" aria-live="polite">
        <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-lg" style={style}>
          <div className="space-y-1">
            <p className="text-xl font-extrabold" data-phase={running ? phase : ''}>{running ? (phase === 'in' ? t('breatheIn') : t('breatheOut')) : t('k_breathe')}</p>
            {running && <p className="text-3xl font-extrabold" dir="ltr">{phaseLeft}</p>}
          </div>
        </div>
      </div>
      {running ? (
        <p className="text-sm font-semibold text-gray-600" data-left={total - (elapsed || 0)}>{t('timeLeft', { t: clock(total - (elapsed || 0)) })}</p>
      ) : (
        <div className="flex justify-center gap-2" role="group" aria-label={t('k_breathe')}>
          {[1, 2, 3].map((m) => (
            <button key={m} type="button" onClick={() => setMins(m)} aria-pressed={mins === m} data-mins={m}
                    className={'rounded-full px-3 py-1.5 text-sm font-bold ' + (mins === m ? 'bg-teal-600 text-white' : 'border border-gray-200 bg-white text-gray-700')}>
              {t('minutes', { n: m })}
            </button>
          ))}
        </div>
      )}
      {done && !running && <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900" data-breathe-done="1">{t('breatheDone')}</p>}
      {running ? (
        <button type="button" onClick={() => setElapsed(null)} data-breathe-stop="1"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-5 py-3 text-base font-extrabold text-gray-800">
          <Square className="h-4 w-4" aria-hidden="true" />{t('stop')}
        </button>
      ) : (
        <button type="button" onClick={() => { setDone(false); setElapsed(0); }} data-breathe-start="1"
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 text-base font-extrabold text-white shadow hover:bg-teal-700">
          <Play className="h-5 w-5" aria-hidden="true" />{done ? t('again') : t('start')}
        </button>
      )}
    </section>
  );
}

/** STEP BY STEP: one step at a time (or all of them). */
export function StepByStep({ steps, t, dir }: { steps: string[]; t: CalmT; dir: 'rtl' | 'ltr' }) {
  const [i, setI] = useState(0);
  const [all, setAll] = useState(false);
  const [finished, setFinished] = useState(false);
  const n = steps.length;
  if (all) {
    return (
      <section className="space-y-3" data-steps="all">
        <ol dir={dir} className="space-y-2">
          {steps.map((s, k) => (
            <li key={k} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-extrabold text-white" dir="ltr">{k + 1}</span>
              <span className="text-base leading-7 text-gray-900">{s}</span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => { setAll(false); setI(0); setFinished(false); }} className="text-sm font-bold text-teal-700 hover:underline">
          {t('oneByOne')}
        </button>
      </section>
    );
  }
  if (finished) {
    return (
      <section className="space-y-3 rounded-3xl border border-teal-100 bg-teal-50 p-5 text-center" data-steps="finished">
        <p className="text-base font-bold text-teal-900">{t('finished')}</p>
        <button type="button" onClick={() => { setI(0); setFinished(false); }}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-teal-800 shadow-sm">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />{t('again')}
        </button>
      </section>
    );
  }
  return (
    <section className="space-y-3" data-steps={String(i + 1)}>
      <div className="min-h-[9rem] space-y-3 rounded-3xl border border-teal-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{t('stepOf', { n: i + 1, total: n })}</p>
        <p dir={dir} className="text-lg font-semibold leading-8 text-gray-900" data-step-text="1">{steps[i]}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-extrabold text-gray-800 disabled:opacity-40">
          {t('back')}
        </button>
        {i < n - 1 ? (
          <button type="button" onClick={() => setI(i + 1)} className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-extrabold text-white shadow hover:bg-teal-700">
            {t('next')}
          </button>
        ) : (
          <button type="button" onClick={() => setFinished(true)} className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-extrabold text-white shadow hover:bg-teal-700">
            {t('done')}
          </button>
        )}
      </div>
      <button type="button" onClick={() => setAll(true)} className="text-sm font-bold text-teal-700 hover:underline">{t('showAll')}</button>
    </section>
  );
}

function ToolCard({ tool, lang, t, onOpen }: { tool: CalmTool; lang: WhLang; t: CalmT; onOpen: () => void }) {
  const p = pickCalmLang(lang, tool);
  if (!p) return null;
  const help = tool.kind === 'help';
  return (
    <button type="button" onClick={onOpen} data-calm-card={tool.slug}
            className={'flex w-full items-center gap-3 rounded-2xl p-4 text-start shadow-sm transition ' +
              (help ? 'border border-amber-200 bg-amber-50 hover:bg-amber-100' : 'border border-gray-100 bg-white hover:border-teal-200')}>
      <span className={'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white ' + (help ? 'bg-amber-600' : 'bg-teal-600')}>
        <KindIcon kind={tool.kind} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1" dir={whDir(p.shown)}>
        <span className="block font-extrabold leading-tight text-gray-900">{p.text.title}</span>
        {p.text.summary && <span className="mt-0.5 block text-xs leading-5 text-gray-600">{p.text.summary}</span>}
        <span className="mt-1 flex flex-wrap gap-1">
          {p.text.draft && <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">{t('draftTag')}{p.text.live ? '' : ' \u00b7 ' + t('notLiveTag')}</span>}
          {tool.hidden && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-extrabold text-gray-700">{t('hiddenTag')}</span>}
          {p.fallback && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">{LANG_NAMES[p.shown]}</span>}
        </span>
      </span>
      <ChevronRight className={'h-5 w-5 flex-shrink-0 rtl:rotate-180 ' + (help ? 'text-amber-700' : 'text-teal-600')} aria-hidden="true" />
    </button>
  );
}

function ToolView({ tool, lang, t, onBack, onHelp, onCount }: {
  tool: CalmTool; lang: WhLang; t: CalmT; onBack: () => void; onHelp: (() => void) | null; onCount: (shown: WhLang) => void;
}) {
  const navigate = useNavigate();
  const p = pickCalmLang(lang, tool);
  const shown = p ? p.shown : null;
  useEffect(() => {
    if (shown) onCount(shown);
  }, [shown, onCount]);
  if (!p) return null;
  const text = p.text;
  const tdir = whDir(p.shown);
  const help = tool.kind === 'help';
  return (
    <article className="space-y-4" data-tool={tool.slug} data-kind={tool.kind} data-shown-lang={p.shown}>
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:underline" data-back="1">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />{t('allTools')}
      </button>
      <header dir={tdir} className={'space-y-1 rounded-3xl p-5 ' + (help ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-teal-50 ring-1 ring-teal-100')}>
        <p className={'flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide ' + (help ? 'text-amber-800' : 'text-teal-800')}>
          <KindIcon kind={tool.kind} className="h-4 w-4" />{t(('k_' + tool.kind) as CalmKey)}
        </p>
        <h2 className="text-2xl font-extrabold leading-tight text-gray-900">{text.title}</h2>
        {text.summary && <p className="text-sm leading-6 text-gray-700">{text.summary}</p>}
      </header>
      {(text.draft || tool.hidden) && (
        <p className="rounded-2xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900" data-draft-note="1">
          {text.draft ? t('draftTag') + (text.live ? '' : ' \u00b7 ' + t('notLiveTag')) : ''}{tool.hidden ? (text.draft ? ' \u00b7 ' : '') + t('hiddenTag') : ''}
        </p>
      )}
      {p.fallback && <p className="rounded-2xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700" data-other-lang={p.shown}>{t('otherLang', { lang: LANG_NAMES[p.shown] })}</p>}

      {tool.kind === 'breathe' && (
        <>
          <Breather inS={tool.breathe_in} outS={tool.breathe_out} t={t} />
          <ol dir={tdir} className="space-y-2">
            {text.steps.map((s, k) => (
              <li key={k} className="flex gap-3 text-sm leading-6 text-gray-800">
                <span className="font-extrabold text-teal-700" dir="ltr">{k + 1}.</span><span>{s}</span>
              </li>
            ))}
          </ol>
        </>
      )}
      {tool.kind === 'steps' && <StepByStep key={tool.slug + ':' + p.shown} steps={text.steps} t={t} dir={tdir} />}
      {(tool.kind === 'list' || help) && (
        <ul dir={tdir} className="space-y-2" data-list={tool.kind}>
          {text.steps.map((s, k) => (
            <li key={k} className={'rounded-2xl p-4 text-base leading-7 shadow-sm ' + (help ? 'border border-amber-200 bg-white text-gray-900' : 'border border-gray-100 bg-white text-gray-900')}>
              {s}
            </li>
          ))}
        </ul>
      )}
      {text.note && <p dir={tdir} className="whitespace-pre-line rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700" data-note="1">{text.note}</p>}

      {help && (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => navigate('/womens-health?service=listening')} data-go-listening="1"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-extrabold text-white shadow hover:bg-teal-700">
              <Headphones className="h-4 w-4" aria-hidden="true" />{t('findListening')}
            </button>
            <button type="button" onClick={() => navigate('/hospitals')} data-go-hospitals="1"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-600 bg-white px-4 py-3 text-sm font-extrabold text-teal-800">
              <Stethoscope className="h-4 w-4" aria-hidden="true" />{t('findHospital')}
            </button>
          </div>
          <EmergencyLines />
        </div>
      )}

      {text.reviewer_name && (
        <p className="text-xs text-gray-500" data-checked-by="1">
          {t('checkedBy', { name: text.reviewer_name, role: text.reviewer_role || '', date: fmtLongDay(text.reviewed_on || '', lang) })}
        </p>
      )}
      {onHelp && (
        <button type="button" onClick={onHelp} data-go-help="1"
                className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-start hover:bg-amber-100">
          <LifeBuoy className="h-5 w-5 flex-shrink-0 text-amber-700" aria-hidden="true" />
          <span className="flex-1 font-extrabold text-gray-900">{t('getHelp')}</span>
          <ChevronRight className="h-5 w-5 text-amber-700 rtl:rotate-180" aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

export default function CalmToolsPage() {
  const { lang, dir, t } = useCalmText();
  const wh = useWhText();
  const account = useFreeAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const slug = params.get('tool');
  const preview = params.get('preview') === '1';

  const [page, setPage] = useState<CalmPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [offlineNone, setOfflineNone] = useState(false);
  const counted = useRef<Record<string, boolean>>({});
  const seq = useRef(0);

  const settled = account !== 'checking';
  const signedIn = account === 'in';

  const load = useCallback(async () => {
    const my = ++seq.current;
    setLoading(true); setReason(null); setSavedAt(null); setOfflineNone(false);
    const r = await calmPage(preview);
    if (my !== seq.current) return;
    if (r.ok) {
      setPage(r);
      saveCalm(r);
    } else if (r.reason === 'network') {
      const s = loadCalm();
      if (s) {
        setPage({ on: true, is_staff: false, signed_in: false, preview: false, tools: s.tools });
        setSavedAt(s.at);
      } else {
        setPage(null);
        setOfflineNone(true);
      }
    } else {
      setPage(null);
      setReason(r.reason);
    }
    setLoading(false);
  }, [preview]);

  useEffect(() => {
    if (settled) void load();
  }, [settled, signedIn, load]);

  const go = (tool: string | null, pv: boolean) => {
    const q: string[] = [];
    if (tool) q.push('tool=' + encodeURIComponent(tool));
    if (pv) q.push('preview=1');
    navigate('/calm' + (q.length ? '?' + q.join('&') : ''));
  };

  const countable = !!page && page.on && !page.preview && !savedAt && signedIn;
  const onCount = useCallback((shownLang: WhLang) => {
    if (!countable || !slug) return;
    const key = slug + ':' + shownLang;
    if (counted.current[key]) return;
    counted.current[key] = true;
    void calmOpened(slug, shownLang);
  }, [countable, slug]);

  const tools = page ? page.tools : [];
  const help = tools.find((x) => x.kind === 'help') || null;
  const others = tools.filter((x) => x.kind !== 'help');
  const staff = !!page && page.is_staff && !savedAt;
  const reading = account === 'in' || account === 'guest' || staff;
  const open = !!page && (page.on || staff);
  const current = slug ? tools.find((x) => x.slug === slug) || null : null;

  let body: ReactElement;
  if (!settled || (loading && !page)) {
    body = account === 'checking' ? <FreeAccountChecking /> : (
      <div className="flex justify-center py-10 text-gray-400"><Loader2 className="h-6 w-6 animate-spin" aria-label={wh.t('loading')} /></div>
    );
  } else if (offlineNone) {
    body = (
      <div className="space-y-3">
        <OfflineNote text={t('offlineNone')} />
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />{wh.t('retry')}
        </button>
        <EmergencyLines />
      </div>
    );
  } else if (reason) {
    body = (
      <div className="space-y-3">
        <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800" data-error={reason}>
          <p>{whReason(lang, reason)}</p>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 font-bold text-red-700">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />{wh.t('retry')}
          </button>
        </div>
        <EmergencyLines />
      </div>
    );
  } else if (!open) {
    body = (
      <div className="space-y-3" data-calm-closed="1">
        <p className="rounded-2xl border border-teal-100 bg-white p-4 text-sm font-semibold leading-6 text-gray-800">{t('notOpen')}</p>
        <button type="button" onClick={() => navigate('/womens-health?service=listening')} data-go-listening="1"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-extrabold text-white shadow hover:bg-teal-700">
          <Headphones className="h-4 w-4" aria-hidden="true" />{t('findListening')}
        </button>
        <EmergencyLines />
      </div>
    );
  } else if (current && (current.kind === 'help' || reading)) {
    body = (
      <ToolView tool={current} lang={lang} t={t} onBack={() => go(null, preview)}
                onHelp={current.kind !== 'help' && help ? () => go(help.slug, preview) : null} onCount={onCount} />
    );
  } else if (current) {
    body = (
      <div className="space-y-3">
        <button type="button" onClick={() => go(null, preview)} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:underline">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />{t('allTools')}
        </button>
        <FreeAccountCard body={t('acctBody')} />
      </div>
    );
  } else {
    body = (
      <div className="space-y-3">
        {help && <ToolCard tool={help} lang={lang} t={t} onOpen={() => go(help.slug, preview)} />}
        {reading ? (
          <>
            {others.length === 0 && <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">{t('noTools')}</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              {others.map((x) => <ToolCard key={x.slug} tool={x} lang={lang} t={t} onOpen={() => go(x.slug, preview)} />)}
            </div>
            <EmergencyLines compact />
          </>
        ) : (
          <FreeAccountCard body={t('acctBody')} />
        )}
      </div>
    );
  }

  return (
    <div dir={dir} data-fix="FIX742" data-account-state={account} data-calm={page ? (page.preview ? 'preview' : page.on ? 'on' : 'off') : 'none'}
         className="mx-auto max-w-3xl space-y-4 px-4 py-4 pb-28">
      <header className="rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20"><Leaf className="h-6 w-6" aria-hidden="true" /></span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight">{t('title')}</h1>
            <p className="text-sm text-teal-50">{t('subtitle')}</p>
          </div>
        </div>
      </header>

      {staff && page && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm text-white" data-staff-bar={page.preview ? 'preview' : page.on ? 'on' : 'off'}>
          <span className="font-semibold">{page.preview ? t('staffPreview') : page.on ? '' : t('staffOff')}</span>
          <button type="button" onClick={() => go(slug, !page.preview)} data-toggle-preview="1"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-900">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />{page.preview ? t('publicBtn') : t('previewBtn')}
          </button>
        </div>
      )}

      {account === 'guest' && open && !staff && <GuestBanner />}
      {savedAt && <OfflineNote text={t('offlineSaved', { date: fmtSavedAt(savedAt, lang) })} />}

      {body}

      <p className="text-center text-xs leading-5 text-gray-500" data-privacy="1">{t('privacy')}</p>
      <QuickExit t={wh.t} />
    </div>
  );
}
// BAMBEH_END_TOKEN__CALM_TOOLS_PAGE_FIX742__COMPLETE
