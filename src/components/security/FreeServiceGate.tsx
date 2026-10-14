// BAMBEH_DEPLOY_TOKEN__FREE_SERVICE_GATE_FIX759_CLEAN
/**
 * src/components/security/FreeServiceGate.tsx - FIX759 (was FIX730, replaces FIX718)
 *
 * THE FREE SECTION NEEDS A BAMBEH ACCOUNT - NEVER A SUBSCRIPTION.
 * Big, 11 Oct 2026: "at least the least they can do is to create an account". Pharmacies on
 * call, hospitals on duty, water & lights, fuel at night, safety alerts and women's health stay
 * free for ever; using them needs a free Bambeh account, so free help also grows the number
 * of members. In App.tsx (FIX727) it wraps the five free pages:
 *   <MainLayout><FreeServiceGate><PharmaciesOnCall /></FreeServiceGate></MainLayout>
 *
 * FIX730 - A GUEST DAY FOR FIRST-TIME PHONES (Big, 12 Oct 2026: "first time users will read but
 * will be prompted to create accounts"). The first time a phone without an account opens a free
 * page, it may read the free pages for 24 hours, with a banner: "You are reading as a guest
 * today - create your free account to keep using it after today". After that day the account
 * card shows instead. The day is counted on the phone (it is a nudge, not a lock): somebody who
 * needs a pharmacy at 2 a.m. the first time is never turned away. Actions - reminders, reports,
 * adding a place, the health quizzes - always need the account.
 *
 * WHO PASSES: anyone signed in (useAuth, or a Supabase session on this phone - and, with no
 * connection at all, a session saved on this phone, so the pages can show what they saved),
 * and a first-time phone during its guest day. Nobody else is turned away empty-handed: the
 * card says it is free, offers "Create a free account" and "Sign in", shows the EMERGENCY
 * NUMBERS and the SAFETY BUTTON (FIX733), which never need an account.
 *
 * The women's health pages use the same pieces inside the page (useFreeAccount, GuestBanner,
 * FreeAccountCard, SafetyLinkCard), because the pregnancy guide and the emergency lines stay
 * open there.
 *
 * "No answer yet" means WAIT, never NO (the rule AuthGate learned in FIX320): a spinner while
 * the phone looks for its session, at most 4 seconds.
 *
 * FIX759 (14 Oct 2026) - "Create a free account" opens the 30-second account (/join?for=free,
 * FIX756: name, number, password, one box) instead of the long form, and comes back to the same
 * free page afterwards (returnTo, FIX755). "Sign in" comes back to it too (FIX758).
 *
 * Numbers (MTN's list of Cameroon emergency numbers; Cameroon Tribune, 5 Jun 2026): police 117,
 * fire brigade 118, ambulance (SAMU) 119, gendarmerie 113, 1511 for gender-based violence
 * (someone to listen), 116 for violence against a child (MINPROFF). The SAMU line is not always
 * answered, so the card says to go straight to the nearest hospital.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, LogIn, Phone, ShieldAlert, Siren, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
function normLang(v: unknown): Lang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

type Key = 'title' | 'body' | 'create' | 'signin' | 'back' | 'checking' | 'sosTitle' | 'police' | 'fire' | 'samu'
  | 'gendarmerie' | 'women' | 'children' | 'samuNote' | 'guestTitle' | 'guestBody' | 'guestOver' | 'safetyLink' | 'safetyLinkSub';

const TEXT: Record<Lang, Record<Key, string>> = {
  en: {
    title: 'Free - you only need a Bambeh account',
    body: "Pharmacies on call, hospitals on duty, water and lights, fuel at night, safety alerts and women's health are free on Bambeh. Create your free account or sign in to use them - it takes a minute and costs nothing.",
    create: 'Create a free account',
    signin: 'I have an account - sign in',
    back: 'Go back',
    checking: 'Checking your account...',
    sosTitle: 'Emergency? Call now - no account needed',
    police: 'Police',
    fire: 'Fire brigade',
    samu: 'Ambulance (SAMU)',
    gendarmerie: 'Gendarmerie',
    women: 'Violence - someone to listen',
    children: 'Violence against a child',
    samuNote: 'If nobody answers, go straight to the nearest hospital.',
    guestTitle: 'You are reading as a guest today',
    guestBody: 'Free help stays free. Create your free Bambeh account to keep using it after today - it takes a minute.',
    guestOver: 'Your free guest day is over.',
    safetyLink: 'Safety button',
    safetyLinkSub: 'In danger? Alert the people you trust in one tap',
  },
  fr: {
    title: 'Gratuit - il suffit d\u2019un compte Bambeh',
    body: 'Pharmacies de garde, h\u00f4pitaux de garde, eau et \u00e9lectricit\u00e9, carburant la nuit, alertes s\u00e9curit\u00e9 et sant\u00e9 des femmes sont gratuits sur Bambeh. Cr\u00e9ez votre compte gratuit ou connectez-vous pour les utiliser : cela prend une minute et ne co\u00fbte rien.',
    create: 'Cr\u00e9er un compte gratuit',
    signin: 'J\u2019ai un compte - me connecter',
    back: 'Retour',
    checking: 'V\u00e9rification de votre compte...',
    sosTitle: 'Urgence ? Appelez maintenant - sans compte',
    police: 'Police',
    fire: 'Sapeurs-pompiers',
    samu: 'Ambulance (SAMU)',
    gendarmerie: 'Gendarmerie',
    women: 'Violences - une \u00e9coute',
    children: 'Violences sur un enfant',
    samuNote: 'Si personne ne r\u00e9pond, allez directement \u00e0 l\u2019h\u00f4pital le plus proche.',
    guestTitle: 'Vous lisez en invit\u00e9 aujourd\u2019hui',
    guestBody: 'L\u2019aide gratuite reste gratuite. Cr\u00e9ez votre compte Bambeh gratuit pour continuer apr\u00e8s aujourd\u2019hui : cela prend une minute.',
    guestOver: 'Votre journ\u00e9e d\u2019invit\u00e9 gratuite est termin\u00e9e.',
    safetyLink: 'Bouton de s\u00e9curit\u00e9',
    safetyLinkSub: 'En danger ? Alertez vos proches de confiance en un geste',
  },
  pidgin: {
    title: 'Na free - you only need Bambeh account',
    body: 'Pharmacy weh dey open, hospital weh dey on duty, water and light, fuel for night, safety alert and woman health na free for Bambeh. Make your free account or sign in for use dem - e take one minute and e no cost anything.',
    create: 'Make free account',
    signin: 'I get account - sign in',
    back: 'Go back',
    checking: 'We di check your account...',
    sosTitle: 'Emergency? Call now - you no need account',
    police: 'Police',
    fire: 'Fire service',
    samu: 'Ambulance (SAMU)',
    gendarmerie: 'Gendarmerie',
    women: 'Violence - person weh go listen you',
    children: 'Violence against pikin',
    samuNote: 'If nobody answer, go straight for the hospital weh near you.',
    guestTitle: 'You di read as guest today',
    guestBody: 'Free help go stay free. Make your free Bambeh account so you fit continue after today - e take one minute.',
    guestOver: 'Your free guest day don finish.',
    safetyLink: 'Safety button',
    safetyLinkSub: 'Danger dey? Alert people weh you trust with one touch',
  },
  ar: {
    title: '\u0645\u062c\u0627\u0646\u064a - \u064a\u0643\u0641\u064a \u062d\u0633\u0627\u0628 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647',
    body: '\u0627\u0644\u0635\u064a\u062f\u0644\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629 \u0648\u0627\u0644\u0645\u0633\u062a\u0634\u0641\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629 \u0648\u0627\u0644\u0645\u0627\u0621 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0627\u0644\u0648\u0642\u0648\u062f \u0644\u064a\u0644\u0627\u064b \u0648\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u0635\u062d\u0629 \u0627\u0644\u0645\u0631\u0623\u0629 \u0645\u062c\u0627\u0646\u064a\u0629 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647. \u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0623\u0648 \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647\u0627 - \u064a\u0633\u062a\u063a\u0631\u0642 \u0630\u0644\u0643 \u062f\u0642\u064a\u0642\u0629 \u0648\u0644\u0627 \u064a\u0643\u0644\u0651\u0641 \u0634\u064a\u0626\u064b\u0627.',
    create: '\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628 \u0645\u062c\u0627\u0646\u064a',
    signin: '\u0644\u062f\u064a\u0651 \u062d\u0633\u0627\u0628 - \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
    back: '\u0631\u062c\u0648\u0639',
    checking: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u062d\u0633\u0627\u0628\u0643...',
    sosTitle: '\u062d\u0627\u0644\u0629 \u0637\u0627\u0631\u0626\u0629\u061f \u0627\u062a\u0635\u0644 \u0627\u0644\u0622\u0646 - \u062f\u0648\u0646 \u062d\u0633\u0627\u0628',
    police: '\u0627\u0644\u0634\u0631\u0637\u0629',
    fire: '\u0627\u0644\u0625\u0637\u0641\u0627\u0621',
    samu: '\u0627\u0644\u0625\u0633\u0639\u0627\u0641 (SAMU)',
    gendarmerie: '\u0627\u0644\u062f\u0631\u0643',
    women: '\u0627\u0644\u0639\u0646\u0641 - \u0645\u0646 \u064a\u0633\u062a\u0645\u0639 \u0625\u0644\u064a\u0643',
    children: '\u0627\u0644\u0639\u0646\u0641 \u0636\u062f \u0637\u0641\u0644',
    samuNote: '\u0625\u0630\u0627 \u0644\u0645 \u064a\u064f\u062c\u0628 \u0623\u062d\u062f\u060c \u0627\u0630\u0647\u0628 \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u0623\u0642\u0631\u0628 \u0645\u0633\u062a\u0634\u0641\u0649.',
    guestTitle: '\u0623\u0646\u062a \u062a\u062a\u0635\u0641\u062d \u0643\u0636\u064a\u0641 \u0627\u0644\u064a\u0648\u0645',
    guestBody: '\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629 \u062a\u0628\u0642\u0649 \u0645\u062c\u0627\u0646\u064a\u0629. \u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647\u0627 \u0628\u0639\u062f \u0627\u0644\u064a\u0648\u0645 - \u064a\u0633\u062a\u063a\u0631\u0642 \u0630\u0644\u0643 \u062f\u0642\u064a\u0642\u0629.',
    guestOver: '\u0627\u0646\u062a\u0647\u0649 \u064a\u0648\u0645\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0643\u0636\u064a\u0641.',
    safetyLink: '\u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646',
    safetyLinkSub: '\u0641\u064a \u062e\u0637\u0631\u061f \u0646\u0628\u0651\u0647 \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645 \u0628\u0644\u0645\u0633\u0629 \u0648\u0627\u062d\u062f\u0629',
  },
  ff: {
    title: 'Meere - konte Bambeh tan sokli',
    body: 'Pharmacies de garde, lopitaaluuji de garde, ndiyam e courant, essence jemma, jeertine kisal e cellal rew\u0253e ko meere e Bambeh. Wa\u0257 konte maa meere, walla naatu, ngam huutoraade \u0257um. \u018aum ina \u01b4ara minit gootol, alaa ko njo\u0253ataa.',
    create: 'Wa\u0257 konte meere',
    signin: 'Mi woodi konte - naatu',
    back: 'Rutto',
    checking: 'Ina \u01b4eewa konte maa...',
    sosTitle: 'Ca\u0257eele? Noddu jooni - konte sokliraaki',
    police: 'Polis',
    fire: 'Pompiers',
    samu: 'Ambulance (SAMU)',
    gendarmerie: 'Jandarmeri',
    women: 'Torra - ne\u0257\u0257o he\u0257oowo ma',
    children: 'Torra \u0253i\u0257\u0257o',
    samuNote: 'So hay gooto jaabaani, yah lopitaal \u0253ur\u0257o \u0253adaade ma jooni.',
    guestTitle: 'A ina janngude no ko\u0257o hannde',
    guestBody: 'Ballal meere ina heddoo meere. Wa\u0257 konte Bambeh maa meere ngam jokkude huutoraade \u0257um caggal hannde - \u0257um ina \u01b4ara minit gootol.',
    guestOver: '\u00d1alnde maa ko\u0257o meere timmii.',
    safetyLink: 'Buto\u014b kisal',
    safetyLinkSub: 'Ca\u0257eele? Anndin yim\u0253e \u0253e hooloto\u0257aa e mee\u0257ol gootol',
  },
};

/** The short codes on the card - the same national numbers as the Safety alerts page. */
export const EMERGENCY_LINES: ReadonlyArray<{ code: string; key: Key }> = [
  { code: '117', key: 'police' },
  { code: '118', key: 'fire' },
  { code: '119', key: 'samu' },
  { code: '113', key: 'gendarmerie' },
  { code: '1511', key: 'women' },
  { code: '116', key: 'children' },
];

/** The longest wait for the phone's answer before we believe there is no account. */
const GRACE_MS = 4000;

/** No connection at all, and a Bambeh session is saved on this phone: the pages may show what they saved. */
function offlineWithSavedSession(): boolean {
  try {
    if (typeof navigator === 'undefined' || navigator.onLine !== false) return false;
    const ls = window.localStorage;
    if (!ls || typeof ls.length !== 'number' || typeof ls.key !== 'function') return false;
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (k && /^sb-[a-z0-9]+-auth-token$/i.test(k) && ls.getItem(k)) return true;
    }
  } catch {
    // storage blocked: treat as no saved session
  }
  return false;
}

export type FreeAccountState = 'checking' | 'in' | 'guest' | 'out';

/** FIX730 - when this phone first opened a free page without an account (kept on the phone). */
export const GUEST_KEY = 'bambeh_free_guest_since';
/** FIX730 - how long a first-time phone may read the free pages without an account. */
export const GUEST_HOURS = 24;

/** 'guest' during the first day, 'over' after it. Starts the day the first time it is asked. */
export function guestDay(now: number = Date.now()): 'guest' | 'over' {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    const since = raw ? Date.parse(raw) : NaN;
    if (!raw || isNaN(since) || since > now + 60000) {
      window.localStorage.setItem(GUEST_KEY, new Date(now).toISOString());
      return 'guest';
    }
    return now - since < GUEST_HOURS * 3600 * 1000 ? 'guest' : 'over';
  } catch {
    return 'guest'; // storage blocked: let her read
  }
}

/** Without touching anything: has this phone used up its guest day? */
function guestDayOver(): boolean {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    const since = raw ? Date.parse(raw) : NaN;
    return !!raw && !isNaN(since) && Date.now() - since >= GUEST_HOURS * 3600 * 1000;
  } catch {
    return false;
  }
}

/**
 * Is there a Bambeh account on this phone? 'checking' while the phone looks (never longer than
 * 4 s); 'guest' for a first-time phone during its guest day (FIX730); 'out' after it.
 */
export function useFreeAccount(): FreeAccountState {
  const { user } = useAuth();
  const [session, setSession] = useState<'unknown' | 'yes' | 'no'>('unknown');
  const [late, setLate] = useState(false);
  const [guest, setGuest] = useState<'unknown' | 'guest' | 'over'>('unknown');

  useEffect(() => {
    let live = true;
    const answer = (yes: boolean) => { if (live) setSession(yes ? 'yes' : 'no'); };
    try {
      void supabase.auth.getSession()
        .then((r: { data?: { session?: unknown } } | null) => answer(!!(r && r.data && r.data.session)))
        .catch(() => answer(false));
    } catch {
      answer(false);
    }
    let stop: (() => void) | null = null;
    try {
      const auth = supabase.auth as unknown as {
        onAuthStateChange?: (cb: (event: string, s: unknown) => void) => { data?: { subscription?: { unsubscribe?: () => void } } };
      };
      if (typeof auth.onAuthStateChange === 'function') {
        const sub = auth.onAuthStateChange((_event, s) => answer(!!s));
        stop = () => {
          try { sub?.data?.subscription?.unsubscribe?.(); } catch { /* already gone */ }
        };
      }
    } catch {
      // an older client without the listener: the first answer is enough
    }
    const timer = window.setTimeout(() => { if (live) setLate(true); }, GRACE_MS);
    return () => {
      live = false;
      window.clearTimeout(timer);
      if (stop) stop();
    };
  }, []);

  const signedIn = !!(user && user.id) || session === 'yes' || offlineWithSavedSession();
  const settledOut = !signedIn && (session === 'no' || late);

  useEffect(() => {
    if (settledOut && guest === 'unknown') setGuest(guestDay());
  }, [settledOut, guest]);

  if (signedIn) return 'in';
  if (!settledOut || guest === 'unknown') return 'checking';
  return guest === 'guest' ? 'guest' : 'out';
}

export function FreeAccountChecking() {
  const lang = normLang(useLang());
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} role="status" aria-busy="true" data-fix="FIX730" data-account="checking"
         className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-sm text-gray-500">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" aria-hidden="true" />
      <span>{TEXT[lang].checking}</span>
    </div>
  );
}

/** FIX730 - the banner on top of a free page during a first-time phone's guest day. */
export function GuestBanner() {
  const lang = normLang(useLang());
  const t = TEXT[lang];
  const navigate = useNavigate();
  const location = useLocation();
  const from = { from: location };
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} data-fix="FIX730" data-guest-banner="1" role="note"
         className="mx-auto mb-4 w-full max-w-3xl rounded-2xl border border-teal-200 bg-teal-50 p-4 text-start shadow-sm">
      <p className="font-bold text-teal-900">{t.guestTitle}</p>
      <p className="mt-1 text-sm leading-6 text-teal-900">{t.guestBody}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" data-go="register" onClick={() => navigate('/join?for=free', { state: from })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          <UserPlus className="h-4 w-4" aria-hidden="true" />{t.create}
        </button>
        <button type="button" data-go="login" onClick={() => navigate('/login', { state: from })}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600 bg-white px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50">
          <LogIn className="h-4 w-4" aria-hidden="true" />{t.signin}
        </button>
      </div>
    </div>
  );
}

/** FIX730 - the red card that opens the Safety button (/safety-button, FIX733). No account needed. */
export function SafetyLinkCard() {
  const lang = normLang(useLang());
  const t = TEXT[lang];
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/safety-button')} data-safety-link="1" dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="flex w-full items-center gap-3 rounded-2xl bg-red-600 px-4 py-3 text-start text-white shadow hover:bg-red-700">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20"><Siren className="h-5 w-5" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-tight">{t.safetyLink}</span>
        <span className="block text-xs leading-tight text-red-50">{t.safetyLinkSub}</span>
      </span>
      <ChevronRight className="h-5 w-5 flex-shrink-0 rtl:rotate-180" aria-hidden="true" />
    </button>
  );
}

/** The emergency short codes, tap to call - shown without an account. */
export function EmergencyLines({ compact = false }: { compact?: boolean }) {
  const lang = normLang(useLang());
  const t = TEXT[lang];
  return (
    <section data-fix="FIX730" data-emergency-lines="1" aria-label={t.sosTitle}
             className={'space-y-2 rounded-2xl border border-red-200 bg-red-50 text-start ' + (compact ? 'p-3' : 'p-4')}>
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-red-800">
        <ShieldAlert className="h-4 w-4 flex-shrink-0" aria-hidden="true" />{t.sosTitle}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {EMERGENCY_LINES.map((l) => (
          <a key={l.code} href={'tel:' + l.code} data-sos={l.code}
             className="flex min-w-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-red-800 shadow-sm ring-1 ring-red-100 hover:bg-red-100">
            <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-base font-extrabold leading-tight" dir="ltr">{l.code}</span>
              <span className="block truncate text-[11px] font-semibold leading-tight text-red-700">{t[l.key]}</span>
            </span>
          </a>
        ))}
      </div>
      <p className="text-xs font-semibold text-red-700">{t.samuNote}</p>
      <SafetyLinkCard />
    </section>
  );
}

/**
 * "Free - you only need an account": create one, or sign in, and the emergency numbers.
 * title / body / note replace the general words (the women's health pages pass their own).
 */
export function FreeAccountCard({ title, body, note, showBack = false }: {
  title?: string; body?: string; note?: string; showBack?: boolean;
}) {
  const lang = normLang(useLang());
  const t = TEXT[lang];
  const navigate = useNavigate();
  const location = useLocation();
  const from = { from: location };
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} data-fix="FIX730" data-account="out" className="mx-auto w-full max-w-md space-y-4">
      <div className="rounded-3xl border border-teal-100 bg-white p-6 text-center shadow-lg" role="region" aria-label={title || t.title}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
          <UserPlus className="h-7 w-7 text-teal-700" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title || t.title}</h2>
        {guestDayOver() ? <p className="mt-2 text-sm font-semibold text-teal-800" data-guest-over="1">{t.guestOver}</p> : null}
        <p className="mt-2 text-sm leading-6 text-gray-600">{body || t.body}</p>
        <button type="button" data-go="register" onClick={() => navigate('/join?for=free', { state: from })}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700">
          <UserPlus className="h-5 w-5" aria-hidden="true" />{t.create}
        </button>
        <button type="button" data-go="login" onClick={() => navigate('/login', { state: from })}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-600 py-2.5 font-semibold text-teal-700 hover:bg-teal-50">
          <LogIn className="h-5 w-5" aria-hidden="true" />{t.signin}
        </button>
        {note ? <p className="mt-3 text-xs leading-5 text-gray-500" data-account-note="1">{note}</p> : null}
        {showBack ? (
          <button type="button" onClick={goBack}
                  className="mt-3 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            {t.back}
          </button>
        ) : null}
      </div>
      <EmergencyLines />
    </div>
  );
}

/**
 * Wraps a free page in App.tsx: signed in -> the page; a first-time phone during its guest day ->
 * the page with the guest banner on top (FIX730); otherwise -> the free account card.
 */
export default function FreeServiceGate({ children }: { children: ReactNode }) {
  const state = useFreeAccount();
  if (state === 'in') return <>{children}</>;
  if (state === 'checking') return <FreeAccountChecking />;
  if (state === 'guest') {
    return (
      <>
        <div className="px-4 pt-4"><GuestBanner /></div>
        {children}
      </>
    );
  }
  return (
    <div className="px-4 py-8">
      <FreeAccountCard showBack />
    </div>
  );
}
// BAMBEH_END_TOKEN__FREE_SERVICE_GATE_FIX759__COMPLETE
