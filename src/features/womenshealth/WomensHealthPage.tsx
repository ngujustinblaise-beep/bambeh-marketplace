// BAMBEH_DEPLOY_TOKEN__WOMENS_HEALTH_PAGE_FIX745_CLEAN
/**
 * src/features/womenshealth/WomensHealthPage.tsx - FIX745 (replaces FIX731)
 *   routes: /womens-health            WHERE TO GO - maternities, antenatal care, screening, family planning
 *           /womens-health/screening  FREE SCREENING DAYS - dated campaigns (Octobre Rose...), "remind me"
 *
 * FIX745 (Big, 14 Oct 2026): the CALM TOOLS card (/calm, FIX742) beside the pregnancy guide and the quiz
 *   cards - shown once an admin opened the Calm tools page (FIX737: "When to get help" and at least one
 *   tool published after the psychologist's check). Staff see a preview card before that. Without data,
 *   the card shows if the Calm tools were saved on this phone the last time.
 *
 * FIX731 (Big, 12 Oct 2026): "first time users will read but will be prompted to create accounts".
 *   - A first-time phone reads the places and the screening days for a day as a guest, with the
 *     "create your free account" banner on top (FreeServiceGate, FIX730; the database lets a
 *     signed-out phone read the lists again, FIX729). Reminders, reports, adding a place and the
 *     quizzes still need the account. After the guest day: the account card.
 *   - The red SAFETY BUTTON card under the emergency line (FIX733), for everyone, no account.
 *
 * FIX720 (Big, 11 Oct 2026 evening): Women's health is in the FREE section ("Free help, any time"),
 * and the free section needs a Bambeh account - never a subscription.
 *   - No account: the page still opens. The emergency line, the pregnancy guide card (once a health
 *     worker checked it) and the health quiz card show to everyone; where the lists would be, the
 *     free account card says it is free, offers "Create a free account" / "Sign in", and gives the
 *     emergency numbers. The database refuses the lists to a signed-out phone too (FIX715).
 *   - With an account: everything below.
 *   - QUICK EXIT at the bottom left of the page (whUi, FIX719).
 *   - NO CONNECTION: the last list for the same filters is shown from the phone, with the date it
 *     was saved; never "remind me" or anything about the woman.
 *   - The health quiz card (FIX723) shows once an admin switched the quizzes on after a health
 *     worker checked them (staff see a preview card before that).
 * Kept from FIX708:
 *   - Region and town (remembered on the phone), service chips with how many places offer each,
 *     "Open day and night", "Cheque sante", "Women doctors", and a search box.
 *   - The official number of a facility shows (tap to call) only after Bambeh staff have called it.
 *   - Screening days disappear by themselves when they end; "Remind me" sends a notification the
 *     day before.
 * No medicines are sold, nothing is paid for, and no clinic can pay to be listed first.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Baby, Bell, BellOff, CalendarDays, ChevronRight, Clock, GraduationCap, Heart, Leaf, Loader2, MapPin, Phone, Plus, RefreshCw, Search, ShieldCheck,
} from 'lucide-react';
import { FreeAccountCard, FreeAccountChecking, GuestBanner, SafetyLinkCard, useFreeAccount } from '@/components/security/FreeServiceGate';
import {
  TOWNS, WH_REGIONS, WH_SERVICES, WH_TOPICS, dayRange, dayWhen, doualaNow, fmtPhone, fmtSavedAt, isWhRegion, isWhService, kindLabel,
  opensLaterToday, placeOpenState, regionLabel, serviceLabel, telHref, topicLabel, useWhText, whReason,
} from './whText';
import type { WhLang, WhRegion, WhService, WhT, WhTopic } from './whText';
import { getGuide, listDays, listPlaces, remind } from './whApi';
import type { WhDay, WhGuide, WhPlace, WhTownCount } from './whApi';
import { OfflineNote, QuickExit, loadList, loadSwitches, saveList, saveSwitches } from './whUi';
import { calmState, hasSavedCalm } from './calmApi';
import { ct } from './calmText';

const WHERE_KEY = 'bambeh_wh_where';
const PAGE = 30;

interface Where { region: WhRegion | ''; town: string }

function loadWhere(): Where {
  try {
    const raw = window.localStorage.getItem(WHERE_KEY);
    const v = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const region = isWhRegion(v.region) ? v.region : '';
    const town = typeof v.town === 'string' && v.town.trim().length >= 2 && v.town.length <= 60 ? v.town.trim() : '';
    return { region, town };
  } catch {
    return { region: '', town: '' }; // private window or blocked storage: start fresh
  }
}

function saveWhere(w: Where): void {
  try { window.localStorage.setItem(WHERE_KEY, JSON.stringify(w)); } catch { /* not kept - fine */ }
}

function chipCls(on: boolean): string {
  return 'inline-flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold transition ' +
    (on ? 'bg-rose-600 text-white shadow' : 'border border-gray-200 bg-white text-gray-700 hover:border-rose-300');
}

function OpenLine({ p, t }: { p: WhPlace; t: WhT }) {
  const st = placeOpenState(p);
  if (st === 'unknown') return null;
  if (st === 'open24') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-800"><Clock className="h-3 w-3" />{t('open24')}</span>;
  }
  if (st === 'open') {
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700"><Clock className="h-3.5 w-3.5" />{t('openNow')}</span>;
  }
  const later = opensLaterToday(p);
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500"><Clock className="h-3.5 w-3.5" />{later ? t('opensAt', { t: later }) : t('closedNow')}</span>;
}

export function PlaceCard({ p, lang, t, onOpen }: { p: WhPlace; lang: WhLang; t: WhT; onOpen: () => void }) {
  const shown = p.services.slice(0, 4);
  return (
    <article data-place={p.id} className="space-y-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-start">
          <h3 className="font-extrabold leading-tight text-gray-900">{p.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {kindLabel(lang, p.kind)} {'\u00b7'} {p.town}{p.area ? ', ' + p.area : ''}
          </p>
        </button>
        {p.phone ? (
          <a href={telHref(p.phone)} data-call={p.phone}
             className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white shadow hover:bg-rose-700">
            <Phone className="h-4 w-4" />{t('call')}
          </a>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1">
        {shown.map((s) => (
          <span key={s} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-800">{serviceLabel(lang, s)}</span>
        ))}
        {p.services.length > shown.length && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">+{p.services.length - shown.length}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <OpenLine p={p} t={t} />
        {p.accepts_csu && <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800"><ShieldCheck className="h-3 w-3" />{t('csuBadge')}</span>}
        {p.women_doctors && <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-800">{t('womenBadge')}</span>}
      </div>
      {p.landmark && <p className="flex items-start gap-1 text-xs text-gray-600"><MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />{p.landmark}</p>}
      {!p.phone && p.phone_checking && <p className="text-[11px] font-semibold text-gray-500">{t('phoneChecking')}</p>}
      <button type="button" onClick={onOpen} className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline">
        {t('details')}<ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
      </button>
    </article>
  );
}

function WhenBadge({ d, today, t }: { d: WhDay; today: string; t: WhT }) {
  const w = dayWhen(d.starts_on, d.ends_on, today);
  if (w === 'today') return <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{t('today')}</span>;
  if (w === 'tomorrow') return <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-amber-950">{t('tomorrow')}</span>;
  if (w === 'on') return <span className="rounded-full bg-green-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{t('onNow')}</span>;
  return null;
}

export function DayCard({ d, lang, t, today, busy, onOpen, onRemind }: {
  d: WhDay; lang: WhLang; t: WhT; today: string; busy: boolean; onOpen: () => void; onRemind: (() => void) | null;
}) {
  return (
    <article data-day={d.id} className="space-y-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <WhenBadge d={d} today={today} t={t} />
        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700">
          <CalendarDays className="h-3.5 w-3.5 text-rose-600" />{dayRange(lang, d.starts_on, d.ends_on)}
          {d.opens_at && d.closes_at ? ' \u00b7 ' + d.opens_at + ' - ' + d.closes_at : ''}
        </span>
      </div>
      <button type="button" onClick={onOpen} className="block w-full text-start">
        <h3 className="font-extrabold leading-tight text-gray-900">{d.title}</h3>
        <p className="mt-0.5 flex items-start gap-1 text-xs text-gray-600"><MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />{d.venue}, {d.town}</p>
      </button>
      <div className="flex flex-wrap gap-1">
        {d.topics.map((x) => <span key={x} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-800">{topicLabel(lang, x)}</span>)}
      </div>
      {d.free_what && <p className="text-sm font-semibold text-green-800">{t('freeWhat', { x: d.free_what })}</p>}
      {d.paid_after && <p className="text-xs text-gray-600">{t('paidAfter', { x: d.paid_after })}</p>}
      {d.organiser && <p className="text-xs text-gray-500">{t('byOrg', { o: d.organiser })}</p>}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {onRemind && (
          <button type="button" onClick={onRemind} disabled={busy} aria-pressed={!!d.reminded}
                  className={'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition disabled:opacity-60 ' +
                    (d.reminded ? 'bg-green-100 text-green-800' : 'bg-rose-600 text-white hover:bg-rose-700')}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : d.reminded ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {d.reminded ? t('reminded') : t('remind')}
          </button>
        )}
        {d.phone && (
          <a href={telHref(d.phone)} data-call={d.phone} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700">
            <Phone className="h-4 w-4" />{fmtPhone(d.phone)}
          </a>
        )}
        <button type="button" onClick={onOpen} className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline">
          {t('details')}<ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </button>
      </div>
    </article>
  );
}

/** The guide, quiz and Calm tools cards - open to everyone once switched on (staff see a preview). */
function ShortcutCards({ guide, calm, lang, t, onGuide, onQuiz, onCalm }: {
  guide: WhGuide | null; calm: { on: boolean; staff: boolean } | null; lang: WhLang; t: WhT;
  onGuide: () => void; onQuiz: () => void; onCalm: () => void;
}) {
  const showGuide = !!guide && (guide.on || guide.is_staff);
  const showQuiz = !!guide && (guide.quiz_on || guide.is_staff);
  const showCalm = !!calm && (calm.on || calm.staff);
  if (!showGuide && !showQuiz && !showCalm) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {showGuide && guide && (
        <button type="button" onClick={onGuide} data-guide-card={guide.on ? 'on' : 'preview'}
                className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-start hover:bg-rose-100">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white"><Baby className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold text-gray-900">{t('guideTitle')}</span>
            <span className="block text-xs text-gray-600">{guide.on ? t('guideCard') : t('staffPreview')}</span>
          </span>
          <ChevronRight className="h-5 w-5 text-rose-600 rtl:rotate-180" />
        </button>
      )}
      {showQuiz && guide && (
        <button type="button" onClick={onQuiz} data-quiz-card={guide.quiz_on ? 'on' : 'preview'}
                className="flex w-full items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50 p-4 text-start hover:bg-purple-100">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white"><GraduationCap className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold text-gray-900">{t('quizTitle')}</span>
            <span className="block text-xs text-gray-600">{guide.quiz_on ? t('quizCard') : t('qzPreview')}</span>
          </span>
          <ChevronRight className="h-5 w-5 text-purple-600 rtl:rotate-180" />
        </button>
      )}
      {showCalm && calm && (
        <button type="button" onClick={onCalm} data-calm-card-wh={calm.on ? 'on' : 'preview'}
                className="flex w-full items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-start hover:bg-teal-100">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white"><Leaf className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold text-gray-900">{ct(lang, 'cardTitle')}</span>
            <span className="block text-xs text-gray-600">{calm.on ? ct(lang, 'cardSub') : ct(lang, 'cardPreview')}</span>
          </span>
          <ChevronRight className="h-5 w-5 text-teal-600 rtl:rotate-180" />
        </button>
      )}
    </div>
  );
}

export default function WomensHealthPage() {
  const { lang, dir, t } = useWhText();
  const location = useLocation();
  const navigate = useNavigate();
  const account = useFreeAccount();
  const tab: 'places' | 'days' = location.pathname.indexOf('/screening') >= 0 ? 'days' : 'places';
  const params = new URLSearchParams(location.search);
  const svcParam = params.get('service');

  const [where, setWhere] = useState<Where>(loadWhere);
  const [service, setService] = useState<WhService | ''>(isWhService(svcParam) ? svcParam : '');
  const [topic, setTopic] = useState<WhTopic | ''>('');
  const [open24, setOpen24] = useState(false);
  const [csu, setCsu] = useState(false);
  const [womenDocs, setWomenDocs] = useState(false);
  const [typed, setTyped] = useState('');
  const [query, setQuery] = useState('');

  const [places, setPlaces] = useState<WhPlace[]>([]);
  const [days, setDays] = useState<WhDay[]>([]);
  const [total, setTotal] = useState(0);
  const [towns, setTowns] = useState<WhTownCount[]>([]);
  const [svcCounts, setSvcCounts] = useState<Partial<Record<WhService, number>>>({});
  const [today, setToday] = useState(doualaNow().ymd);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needAccount, setNeedAccount] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [offlineEmpty, setOfflineEmpty] = useState(false);
  const [guide, setGuide] = useState<WhGuide | null>(null);
  const [calm, setCalm] = useState<{ on: boolean; staff: boolean } | null>(null);
  const [busyDay, setBusyDay] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; signIn?: boolean } | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (isWhService(svcParam)) setService(svcParam);
  }, [svcParam]);

  // the guide and quiz switches: open to everyone; kept on the phone for days without data
  useEffect(() => {
    let live = true;
    void getGuide().then((r) => {
      if (!live) return;
      if (r.ok) {
        setGuide(r);
        saveSwitches(r);
      } else if (r.reason === 'network') {
        const s = loadSwitches();
        if (s) {
          setGuide({ ...s.v, langs: s.v.langs as WhGuide['langs'], quiz_langs: s.v.quiz_langs as WhGuide['quiz_langs'], signed_in: false, is_staff: false });
        }
      }
    });
    return () => { live = false; };
  }, [account]);

  // FIX745: the Calm tools card - is the page open (or is this staff)? Without data: saved on this phone last time
  useEffect(() => {
    let live = true;
    void calmState().then((r) => {
      if (!live) return;
      if (r.ok) setCalm({ on: r.on, staff: r.is_staff });
      else if (r.reason === 'network' && hasSavedCalm()) setCalm({ on: true, staff: false });
    });
    return () => { live = false; };
  }, [account]);

  const listKey = tab === 'places'
    ? ['places', where.region, where.town, service, csu ? 1 : 0, open24 ? 1 : 0, womenDocs ? 1 : 0, query].join('|')
    : ['days', where.region, where.town, topic].join('|');

  const load = useCallback(async (offset: number) => {
    const my = ++seq.current;
    if (offset === 0) { setLoading(true); setError(null); setNeedAccount(false); setSavedAt(null); setOfflineEmpty(false); } else setMore(true);
    const offline = (reason: string): boolean => {
      if (reason !== 'network' || offset !== 0) return false;
      const saved = loadList(listKey);
      if (saved) {
        if (tab === 'places') setPlaces(saved.v.places || []); else setDays(saved.v.days || []);
        setTotal(saved.v.total);
        setTowns((saved.v.towns || []) as WhTownCount[]);
        setSavedAt(saved.at);
      } else {
        setPlaces([]); setDays([]); setTotal(0);
        setOfflineEmpty(true);
      }
      return true;
    };
    if (tab === 'places') {
      const r = await listPlaces({ region: where.region || null, town: where.town || null, service: service || null, csu, open24,
                                   womenDoctors: womenDocs, query, limit: PAGE, offset });
      if (my !== seq.current) return;
      if (r.ok) {
        setPlaces((old) => (offset === 0 ? r.rows : old.concat(r.rows)));
        setTotal(r.total); setTowns(r.towns || []); setSvcCounts(r.services || {});
        if (offset === 0) saveList(listKey, { total: r.total, places: r.rows, towns: r.towns || [] });
      } else if (r.reason === 'not_signed_in') setNeedAccount(true);
      else if (!offline(r.reason)) setError(whReason(lang, r.reason));
    } else {
      const r = await listDays({ region: where.region || null, town: where.town || null, topic: topic || null, limit: PAGE, offset });
      if (my !== seq.current) return;
      if (r.ok) {
        setDays((old) => (offset === 0 ? r.rows : old.concat(r.rows)));
        setTotal(r.total); setTowns(r.towns || []);
        if (r.today) setToday(r.today);
        if (offset === 0) saveList(listKey, { total: r.total, days: r.rows, towns: r.towns || [] });
      } else if (r.reason === 'not_signed_in') setNeedAccount(true);
      else if (!offline(r.reason)) setError(whReason(lang, r.reason));
    }
    setLoading(false); setMore(false);
  }, [tab, where, service, csu, open24, womenDocs, query, topic, lang, listKey]);

  // FIX731: a first-time phone reads the lists during its guest day
  const canRead = account === 'in' || account === 'guest';
  useEffect(() => {
    if (canRead) void load(0);
  }, [load, canRead]);

  const pickWhere = (w: Where) => { setWhere(w); saveWhere(w); };

  const toggleRemind = async (d: WhDay) => {
    if (account !== 'in') { setToast({ text: t('remindSignIn'), signIn: true }); return; }
    setBusyDay(d.id);
    const r = await remind(d.id, !d.reminded);
    setBusyDay(null);
    if (r.ok) {
      setDays((old) => old.map((x) => (x.id === d.id ? { ...x, reminded: r.reminded } : x)));
      setToast({ text: r.reminded ? t('remindOk') : t('remindOffOk') });
    } else if (r.reason === 'not_signed_in') setToast({ text: t('remindSignIn'), signIn: true });
    else setToast({ text: whReason(lang, r.reason) });
  };

  // the towns to offer: those with places (or days) in the chosen region, then the region's main towns, then the saved one
  const townOptions: string[] = [];
  const seen: Record<string, boolean> = {};
  const addTown = (x: string) => { const k = x.toLowerCase(); if (x && !seen[k]) { seen[k] = true; townOptions.push(x); } };
  towns.forEach((x) => addTown(x.town));
  if (where.region) TOWNS[where.region].forEach(addTown);
  if (where.town) addTown(where.town);

  const shown = tab === 'places' ? places.length : days.length;
  const countText = tab === 'places'
    ? (total === 1 ? t('countPlace1') : t('countPlaces', { n: total }))
    : (total === 1 ? t('countDay1') : t('countDays', { n: total }));
  const signedIn = account === 'in' && !needAccount;
  const reading = canRead && !needAccount;

  return (
    <div dir={dir} data-fix="FIX745" data-account-state={account} className="mx-auto max-w-3xl space-y-4 px-4 py-4 pb-28">
      <header className="rounded-3xl bg-gradient-to-br from-rose-600 to-pink-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20"><Heart className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight">{t('title')}</h1>
            <p className="text-sm text-rose-50">{t('subtitle')}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-rose-50">{t('freeLine')}</p>
      </header>

      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800" data-emergency="1">{t('emergency')}</p>
      <SafetyLinkCard />

      {account === 'guest' && reading && <GuestBanner />}

      {reading && (
        <nav className="grid grid-cols-2 gap-2" aria-label={t('title')}>
          <button type="button" onClick={() => navigate('/womens-health')} aria-pressed={tab === 'places'}
                  className={'rounded-2xl px-3 py-3 text-sm font-extrabold transition ' + (tab === 'places' ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-800')}>
            {t('tabPlaces')}
          </button>
          <button type="button" onClick={() => navigate('/womens-health/screening')} aria-pressed={tab === 'days'}
                  className={'rounded-2xl px-3 py-3 text-sm font-extrabold transition ' + (tab === 'days' ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-800')}>
            {t('tabDays')}
          </button>
        </nav>
      )}

      <ShortcutCards guide={guide} calm={calm} lang={lang} t={t} onGuide={() => navigate('/womens-health/pregnancy')}
                     onQuiz={() => navigate('/womens-health/quiz')} onCalm={() => navigate('/calm')} />

      {account === 'checking' ? (
        <FreeAccountChecking />
      ) : !reading ? (
        <FreeAccountCard body={t('acctBody')} note={t('acctOpen')} />
      ) : (
        <>
          <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-bold text-gray-600">
                {t('region')}
                <select value={where.region} onChange={(e) => pickWhere({ region: isWhRegion(e.target.value) ? e.target.value : '', town: '' })}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm font-semibold text-gray-900" data-filter="region">
                  <option value="">{t('allRegions')}</option>
                  {WH_REGIONS.map((r) => <option key={r} value={r}>{regionLabel(lang, r)}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold text-gray-600">
                {t('town')}
                <select value={where.town} onChange={(e) => pickWhere({ region: where.region, town: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm font-semibold text-gray-900" data-filter="town">
                  <option value="">{t('allTowns')}</option>
                  {townOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
            </div>

            {tab === 'places' ? (
              <>
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setQuery(typed.trim()); }}>
                  <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={t('searchPh')} maxLength={60} data-filter="query"
                         className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                  <button type="submit" onClick={() => setQuery(typed.trim())} className="inline-flex items-center gap-1 rounded-xl bg-gray-900 px-3 py-2 text-sm font-bold text-white">
                    <Search className="h-4 w-4" />{t('searchBtn')}
                  </button>
                </form>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" data-chips="services">
                  <button type="button" onClick={() => setService('')} aria-pressed={service === ''} className={chipCls(service === '')}>{t('svcAll')}</button>
                  {WH_SERVICES.map((s) => (
                    <button key={s} type="button" onClick={() => setService(service === s ? '' : s)} aria-pressed={service === s} data-service={s} className={chipCls(service === s)}>
                      {serviceLabel(lang, s)}
                      {typeof svcCounts[s] === 'number' && <span className={'text-[11px] ' + (service === s ? 'text-rose-100' : 'text-gray-400')}>{svcCounts[s]}</span>}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setOpen24(!open24)} aria-pressed={open24} className={chipCls(open24)}><Clock className="h-4 w-4" />{t('f24h')}</button>
                  <button type="button" onClick={() => setCsu(!csu)} aria-pressed={csu} className={chipCls(csu)}><ShieldCheck className="h-4 w-4" />{t('fCsuFilter')}</button>
                  <button type="button" onClick={() => setWomenDocs(!womenDocs)} aria-pressed={womenDocs} className={chipCls(womenDocs)}>{t('fWomenFilter')}</button>
                </div>
              </>
            ) : (
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" data-chips="topics">
                <button type="button" onClick={() => setTopic('')} aria-pressed={topic === ''} className={chipCls(topic === '')}>{t('topicAll')}</button>
                {WH_TOPICS.map((x) => (
                  <button key={x} type="button" onClick={() => setTopic(topic === x ? '' : x)} aria-pressed={topic === x} data-topic={x} className={chipCls(topic === x)}>
                    {topicLabel(lang, x)}
                  </button>
                ))}
              </div>
            )}
          </section>

          {toast && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-sm text-white" role="status" data-toast="1">
              <span>{toast.text}</span>
              <span className="flex flex-shrink-0 items-center gap-2">
                {toast.signIn && <button type="button" onClick={() => navigate('/login')} className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-gray-900">{t('signIn')}</button>}
                <button type="button" onClick={() => setToast(null)} className="text-xs font-bold text-gray-300" aria-label={t('cancel')}>{'\u2715'}</button>
              </span>
            </div>
          )}

          {savedAt && <OfflineNote text={t('offlineList', { date: fmtSavedAt(savedAt, lang) })} />}
          {offlineEmpty && <OfflineNote text={t('offlineNone')} />}

          {loading ? (
            <div className="flex justify-center py-10 text-gray-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : error ? (
            <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
              <p>{error}</p>
              <button type="button" onClick={() => void load(0)} className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 font-bold text-red-700">
                <RefreshCw className="h-4 w-4" />{t('retry')}
              </button>
            </div>
          ) : offlineEmpty ? (
            <button type="button" onClick={() => void load(0)} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800">
              <RefreshCw className="h-4 w-4" />{t('retry')}
            </button>
          ) : (
            <section className="space-y-3">
              <p className="text-sm font-bold text-gray-600" data-count={total}>{countText}</p>
              {shown === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
                  <p className="font-bold text-gray-800">{tab === 'places' ? t('noPlaces') : t('noDays')}</p>
                  <p className="mt-1 text-sm text-gray-500">{tab === 'places' ? t('noPlacesHint') : t('noDaysHint')}</p>
                </div>
              )}
              {tab === 'places'
                ? places.map((p) => <PlaceCard key={p.id} p={p} lang={lang} t={t} onOpen={() => navigate('/womens-health/place/' + p.id)} />)
                : days.map((d) => (
                    <DayCard key={d.id} d={d} lang={lang} t={t} today={today} busy={busyDay === d.id}
                             onOpen={() => navigate('/womens-health/day/' + d.id)} onRemind={savedAt ? null : () => void toggleRemind(d)} />
                  ))}
              {shown < total && !savedAt && (
                <button type="button" onClick={() => void load(shown)} disabled={more}
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-800 disabled:opacity-60">
                  {more ? t('loading') : t('loadMore')}
                </button>
              )}
              {savedAt && (
                <button type="button" onClick={() => void load(0)} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800">
                  <RefreshCw className="h-4 w-4" />{t('retry')}
                </button>
              )}
            </section>
          )}

          <section className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => navigate('/womens-health/new-place')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-rose-600 px-3 py-3 text-sm font-extrabold text-white shadow hover:bg-rose-700">
              <Plus className="h-4 w-4" />{t('addPlace')}
            </button>
            <button type="button" onClick={() => navigate('/womens-health/new-day')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-white px-3 py-3 text-sm font-extrabold text-rose-700">
              <CalendarDays className="h-4 w-4" />{t('addDay')}
            </button>
            {signedIn && (
              <button type="button" onClick={() => navigate('/womens-health/mine')}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-extrabold text-gray-800">
                {t('mine')}
              </button>
            )}
          </section>
        </>
      )}

      <QuickExit t={t} />
    </div>
  );
}
// BAMBEH_END_TOKEN__WOMENS_HEALTH_PAGE_FIX745__COMPLETE
