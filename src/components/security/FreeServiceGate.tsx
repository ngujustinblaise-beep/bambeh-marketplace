// BAMBEH_DEPLOY_TOKEN__FREE_SERVICE_GATE_FIX718_CLEAN
/**
 * src/components/security/FreeServiceGate.tsx - FIX718
 *
 * THE FREE SECTION NEEDS A BAMBEH ACCOUNT - NEVER A SUBSCRIPTION.
 * Big, 11 Oct 2026: "at least the least they can do is to create an account". Pharmacies on
 * call, hospitals on duty, water & lights, fuel at night, safety alerts and women's health stay
 * free for ever; opening them needs a free Bambeh account, so free help also grows the number
 * of members. In App.tsx (FIX727) it replaces <SectionGate section="free_services">:
 *   <MainLayout><FreeServiceGate><PharmaciesOnCall /></FreeServiceGate></MainLayout>
 *
 * WHO PASSES: anyone signed in (useAuth, or a Supabase session on this phone - and, with no
 * connection at all, a session saved on this phone, so the pages can show what they saved).
 * Nobody else is turned away empty-handed: the card says it is free, offers "Create a free
 * account" and "Sign in", and shows the EMERGENCY NUMBERS, which never need an account
 * (Big: "guide, emergency numbers readable without an account").
 *
 * The women's health pages use the same pieces inside the page (useFreeAccount and
 * FreeAccountCard), because the pregnancy guide and the emergency lines stay open there.
 *
 * "No answer yet" means WAIT, never NO (the rule AuthGate learned in FIX320): a spinner while
 * the phone looks for its session, at most 4 seconds.
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
import { Loader2, LogIn, Phone, ShieldAlert, UserPlus } from 'lucide-react';
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
  | 'gendarmerie' | 'women' | 'children' | 'samuNote';

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

export type FreeAccountState = 'checking' | 'in' | 'out';

/** Is there a Bambeh account on this phone? 'checking' while the phone looks (never longer than 4 s). */
export function useFreeAccount(): FreeAccountState {
  const { user } = useAuth();
  const [session, setSession] = useState<'unknown' | 'yes' | 'no'>('unknown');
  const [late, setLate] = useState(false);

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

  if (user && user.id) return 'in';
  if (session === 'yes') return 'in';
  if (offlineWithSavedSession()) return 'in';
  if (session === 'unknown' && !late) return 'checking';
  return 'out';
}

export function FreeAccountChecking() {
  const lang = normLang(useLang());
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} role="status" aria-busy="true" data-fix="FIX718" data-account="checking"
         className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-sm text-gray-500">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" aria-hidden="true" />
      <span>{TEXT[lang].checking}</span>
    </div>
  );
}

/** The emergency short codes, tap to call - shown without an account. */
export function EmergencyLines({ compact = false }: { compact?: boolean }) {
  const lang = normLang(useLang());
  const t = TEXT[lang];
  return (
    <section data-fix="FIX718" data-emergency-lines="1" aria-label={t.sosTitle}
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
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} data-fix="FIX718" data-account="out" className="mx-auto w-full max-w-md space-y-4">
      <div className="rounded-3xl border border-teal-100 bg-white p-6 text-center shadow-lg" role="region" aria-label={title || t.title}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
          <UserPlus className="h-7 w-7 text-teal-700" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title || t.title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{body || t.body}</p>
        <button type="button" data-go="register" onClick={() => navigate('/register', { state: from })}
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

/** Wraps a free page in App.tsx: signed in -> the page; no account -> the free account card. */
export default function FreeServiceGate({ children }: { children: ReactNode }) {
  const state = useFreeAccount();
  if (state === 'in') return <>{children}</>;
  if (state === 'checking') return <FreeAccountChecking />;
  return (
    <div className="px-4 py-8">
      <FreeAccountCard showBack />
    </div>
  );
}
// BAMBEH_END_TOKEN__FREE_SERVICE_GATE_FIX718__COMPLETE
