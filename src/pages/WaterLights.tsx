// BAMBEH_DEPLOY_TOKEN__WATERLIGHTS_FIX502_CLEAN
/**
 * src/pages/WaterLights.tsx - Bambeh free services
 * FILE LOCATION: src/pages/WaterLights.tsx
 *
 * FIX500 - WATER AND LIGHTS, BY QUARTER.
 * ------------------------------------------------------------------
 * Two different things share this page, and the difference matters more than
 * the layout does:
 *
 *   SCHEDULED CUTS are announcements. A claim that ENEO is cutting Bastos
 *   tomorrow can send a whole quarter charging their phones for nothing, so
 *   nothing scheduled appears until staff verify it.
 *
 *   LIVE REPORTS come from users and appear at once. Holding them for a
 *   moderator would make the feature useless at 2am, which is the only hour
 *   it matters. They are never shown as fact: every card says how many people
 *   reported it and how long ago, and the reader judges for themselves.
 *
 * ONE CUT IS ONE ENTRY. The twentieth person reporting Mvan does not create a
 * twentieth card - they raise the count on the first one. A wall of identical
 * reports would look like twenty separate outages.
 *
 * REPORTS AGE OUT AFTER 8 HOURS unless someone confirms again. A stale outage
 * report is worse than none - the same rule the pharmacy rota lives by.
 *
 * NO LOGIN TO READ. Someone sitting in the dark should not meet a sign-in
 * wall. Reporting needs an account, because that is what the rate limit and
 * the "it is back" permission hang on.
 *
 * FIVE LANGUAGES, and every non-ASCII character is written as a \uXXXX escape.
 * This file is pure ASCII on disk, so no encoding pass can ever mangle it -
 * the same armour LocationFilter and AfricanPhoneInput carry after FIX379/491.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Droplet, Zap, Loader2, AlertCircle, RefreshCw,
  MapPin, Clock, Plus, Check, Users, CalendarClock, Info, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

interface Outage {
  id: string; utility: 'water' | 'electricity'; kind: 'reported' | 'scheduled';
  region: string; town: string; quarter: string | null;
  starts_at: string; ends_at: string | null;
  note: string | null; source: string | null;
  confirm_count: number; last_activity_at: string; mine: boolean;
}
interface TownRow { town: string; region: string }

const REGIONS = [
  'Adamaoua', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'North-West', 'South', 'South-West', 'West',
];

const STR: Record<string, Record<string, string>> = {
  en: {
    title: 'Water & Lights', back: 'Back',
    sub: 'Cuts reported by people around you. Free, no sign-in to read.',
    all: 'All', water: 'Water', power: 'Lights', allTowns: 'Everywhere',
    pickTown: 'Choose your town',
    report: 'Report a cut', reportTitle: 'Report a cut',
    reportSub: 'Only report what you can see yourself right now.',
    region: 'Region', town: 'Town', quarter: 'Quarter', quarterPh: 'Bastos, Mvan...',
    note: 'Anything useful?', notePh: 'Since about 6pm, whole street',
    send: 'Send report', sending: 'Sending...', cancel: 'Cancel',
    live: 'Reported now', liveHint: 'From users, not from the company. Judge for yourself.',
    scheduled: 'Announced cuts', scheduledHint: 'Checked by Bambeh before it appears here.',
    people: 'people reported this', onePerson: '1 person reported this',
    sameHere: 'Same here', itsBack: 'It is back',
    none: 'Nothing reported right now.',
    noneHint: 'That is good news - or nobody has reported it yet. You can be the first.',
    failed: 'Could not load reports', failedBody: 'Check your connection and try again.',
    retry: 'Try again', signIn: 'Sign in to report',
    thanks: 'Thank you. Others can see it now.', restored: 'Marked as back. Thank you.',
    tooMany: 'That is a lot of reports in one hour. Try again later.',
    areaRequired: 'Region and town are needed.',
    failedSend: 'Could not send that. Try again.',
    justNow: 'just now', minsAgo: 'min ago', hoursAgo: 'h ago',
    from: 'From', until: 'until',
    disclaimer: 'Bambeh does not run the water or the power. These are reports from users and announcements we have checked - always keep a torch and water at home.',
  },
  fr: {
    title: 'Eau & Courant', back: 'Retour',
    sub: 'Coupures signal\u00e9es par les gens autour de vous. Gratuit, sans compte pour lire.',
    all: 'Tout', water: 'Eau', power: 'Courant', allTowns: 'Partout',
    pickTown: 'Choisissez votre ville',
    report: 'Signaler une coupure', reportTitle: 'Signaler une coupure',
    reportSub: 'Ne signalez que ce que vous constatez vous-m\u00eame maintenant.',
    region: 'R\u00e9gion', town: 'Ville', quarter: 'Quartier', quarterPh: 'Bastos, Mvan...',
    note: 'Quelque chose d\u2019utile ?', notePh: 'Depuis 18h environ, toute la rue',
    send: 'Envoyer', sending: 'Envoi...', cancel: 'Annuler',
    live: 'Signal\u00e9 maintenant', liveHint: 'Par des utilisateurs, pas par la soci\u00e9t\u00e9. Jugez vous-m\u00eame.',
    scheduled: 'Coupures annonc\u00e9es', scheduledHint: 'V\u00e9rifi\u00e9es par Bambeh avant d\u2019appara\u00eetre ici.',
    people: 'personnes l\u2019ont signal\u00e9', onePerson: '1 personne l\u2019a signal\u00e9',
    sameHere: 'Pareil ici', itsBack: 'C\u2019est revenu',
    none: 'Rien de signal\u00e9 pour le moment.',
    noneHint: 'Bonne nouvelle - ou personne n\u2019a encore signal\u00e9. Soyez le premier.',
    failed: 'Chargement impossible', failedBody: 'V\u00e9rifiez votre connexion et r\u00e9essayez.',
    retry: 'R\u00e9essayer', signIn: 'Connectez-vous pour signaler',
    thanks: 'Merci. Les autres le voient maintenant.', restored: 'Marqu\u00e9 comme revenu. Merci.',
    tooMany: 'Beaucoup de signalements en une heure. R\u00e9essayez plus tard.',
    areaRequired: 'La r\u00e9gion et la ville sont obligatoires.',
    failedSend: 'Envoi impossible. R\u00e9essayez.',
    justNow: '\u00e0 l\u2019instant', minsAgo: 'min', hoursAgo: 'h',
    from: 'De', until: 'jusqu\u2019\u00e0',
    disclaimer: 'Bambeh ne g\u00e8re ni l\u2019eau ni le courant. Ce sont des signalements d\u2019utilisateurs et des annonces v\u00e9rifi\u00e9es - gardez toujours une torche et de l\u2019eau chez vous.',
  },
  pidgin: {
    title: 'Water & Light', back: 'Go back',
    sub: 'Wetin people for your side don talk say e cut. Free, you no need account for read.',
    all: 'All', water: 'Water', power: 'Light', allTowns: 'Everywhere',
    pickTown: 'Choose your town',
    report: 'Talk say e cut', reportTitle: 'Talk say e cut',
    reportSub: 'Only talk wetin you dey see yourself now now.',
    region: 'Region', town: 'Town', quarter: 'Quarter', quarterPh: 'Bastos, Mvan...',
    note: 'Any oda tin?', notePh: 'Since like 6 for evening, di whole street',
    send: 'Send am', sending: 'Dey send...', cancel: 'Leave am',
    live: 'People talk am now', liveHint: 'Na people talk am, no be di company. You judge yourself.',
    scheduled: 'Dem announce am', scheduledHint: 'Bambeh check am before e show here.',
    people: 'people don talk am', onePerson: '1 person don talk am',
    sameHere: 'Na so for my side', itsBack: 'E don come back',
    none: 'Nobody talk anytin now.',
    noneHint: 'Na good news - or nobody never talk. You fit be di first.',
    failed: 'E no fit load', failedBody: 'Check your network make you try again.',
    retry: 'Try again', signIn: 'Enter account make you talk',
    thanks: 'Thank you. Oda people dey see am now.', restored: 'We don mark say e don come back. Thank you.',
    tooMany: 'Na plenty report for one hour. Try later.',
    areaRequired: 'We need region and town.',
    failedSend: 'E no send. Try again.',
    justNow: 'just now', minsAgo: 'min ago', hoursAgo: 'h ago',
    from: 'From', until: 'reach',
    disclaimer: 'Bambeh no be di one wey dey give water or light. Na people talk am and na announcement wey we check - always keep torch and water for house.',
  },
  ar: {
    title: '\u0627\u0644\u0645\u0627\u0621 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621', back: '\u0631\u062c\u0648\u0639',
    sub: '\u0627\u0646\u0642\u0637\u0627\u0639\u0627\u062a \u064a\u0628\u0644\u063a \u0639\u0646\u0647\u0627 \u0627\u0644\u0646\u0627\u0633 \u062d\u0648\u0644\u0643. \u0645\u062c\u0627\u0646\u064a\u060c \u062f\u0648\u0646 \u062a\u0633\u062c\u064a\u0644 \u062f\u062e\u0648\u0644.',
    all: '\u0627\u0644\u0643\u0644', water: '\u0645\u0627\u0621', power: '\u0643\u0647\u0631\u0628\u0627\u0621', allTowns: '\u0643\u0644 \u0627\u0644\u0645\u062f\u0646',
    pickTown: '\u0627\u062e\u062a\u0631 \u0645\u062f\u064a\u0646\u062a\u0643',
    report: '\u0623\u0628\u0644\u063a \u0639\u0646 \u0627\u0646\u0642\u0637\u0627\u0639', reportTitle: '\u0623\u0628\u0644\u063a \u0639\u0646 \u0627\u0646\u0642\u0637\u0627\u0639',
    reportSub: '\u0623\u0628\u0644\u063a \u0641\u0642\u0637 \u0639\u0645\u0627 \u062a\u0631\u0627\u0647 \u0628\u0646\u0641\u0633\u0643 \u0627\u0644\u0622\u0646.',
    region: '\u0627\u0644\u062c\u0647\u0629', town: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629', quarter: '\u0627\u0644\u062d\u064a', quarterPh: '\u0628\u0627\u0633\u062a\u0648\u0633\u060c \u0645\u0641\u0627\u0646...',
    note: '\u0645\u0639\u0644\u0648\u0645\u0629 \u0645\u0641\u064a\u062f\u0629\u061f', notePh: '\u0645\u0646\u0630 \u0627\u0644\u0633\u0627\u062f\u0633\u0629 \u0645\u0633\u0627\u0621\u060c \u0627\u0644\u0634\u0627\u0631\u0639 \u0643\u0644\u0647',
    send: '\u0625\u0631\u0633\u0627\u0644', sending: '\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...', cancel: '\u0625\u0644\u063a\u0627\u0621',
    live: '\u0628\u0644\u0627\u063a\u0627\u062a \u0627\u0644\u0622\u0646', liveHint: '\u0645\u0646 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646\u060c \u0644\u064a\u0633 \u0645\u0646 \u0627\u0644\u0634\u0631\u0643\u0629. \u0627\u062d\u0643\u0645 \u0628\u0646\u0641\u0633\u0643.',
    scheduled: '\u0627\u0646\u0642\u0637\u0627\u0639\u0627\u062a \u0645\u0639\u0644\u0646\u0629', scheduledHint: '\u062a\u062d\u0642\u0642\u062a \u0645\u0646\u0647\u0627 \u0628\u0645\u0628\u0647 \u0642\u0628\u0644 \u0639\u0631\u0636\u0647\u0627.',
    people: '\u0623\u0634\u062e\u0627\u0635 \u0623\u0628\u0644\u063a\u0648\u0627', onePerson: '\u0634\u062e\u0635 \u0648\u0627\u062d\u062f \u0623\u0628\u0644\u063a',
    sameHere: '\u0646\u0641\u0633 \u0627\u0644\u0634\u064a\u0621 \u0647\u0646\u0627', itsBack: '\u0639\u0627\u062f\u062a',
    none: '\u0644\u0627 \u0634\u064a\u0621 \u0645\u0628\u0644\u063a \u0639\u0646\u0647 \u0627\u0644\u0622\u0646.',
    noneHint: '\u0647\u0630\u0627 \u062e\u0628\u0631 \u062c\u064a\u062f - \u0623\u0648 \u0644\u0645 \u064a\u0628\u0644\u063a \u0623\u062d\u062f \u0628\u0639\u062f. \u0643\u0646 \u0623\u0648\u0644 \u0645\u0646 \u064a\u0628\u0644\u063a.',
    failed: '\u062a\u0639\u0630\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644', failedBody: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u062b\u0645 \u0623\u0639\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629.',
    retry: '\u0623\u0639\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629', signIn: '\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u0625\u0628\u0644\u0627\u063a',
    thanks: '\u0634\u0643\u0631\u0627. \u0627\u0644\u0622\u062e\u0631\u0648\u0646 \u064a\u0631\u0648\u0646\u0647 \u0627\u0644\u0622\u0646.', restored: '\u062a\u0645 \u0627\u0644\u062a\u0633\u062c\u064a\u0644. \u0634\u0643\u0631\u0627.',
    tooMany: '\u0628\u0644\u0627\u063a\u0627\u062a \u0643\u062b\u064a\u0631\u0629 \u0641\u064a \u0633\u0627\u0639\u0629. \u062d\u0627\u0648\u0644 \u0644\u0627\u062d\u0642\u0627.',
    areaRequired: '\u0627\u0644\u062c\u0647\u0629 \u0648\u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0645\u0637\u0644\u0648\u0628\u062a\u0627\u0646.',
    failedSend: '\u062a\u0639\u0630\u0631 \u0627\u0644\u0625\u0631\u0633\u0627\u0644. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627.',
    justNow: '\u0627\u0644\u0622\u0646', minsAgo: '\u062f\u0642\u064a\u0642\u0629', hoursAgo: '\u0633\u0627\u0639\u0629',
    from: '\u0645\u0646', until: '\u062d\u062a\u0649',
    disclaimer: '\u0628\u0645\u0628\u0647 \u0644\u0627 \u062a\u062f\u064a\u0631 \u0627\u0644\u0645\u0627\u0621 \u0648\u0644\u0627 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621. \u0647\u0630\u0647 \u0628\u0644\u0627\u063a\u0627\u062a \u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u0648\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u062a\u062d\u0642\u0642\u0646\u0627 \u0645\u0646\u0647\u0627 - \u0627\u062d\u062a\u0641\u0638 \u062f\u0627\u0626\u0645\u0627 \u0628\u0645\u0635\u0628\u0627\u062d \u0648\u0645\u0627\u0621 \u0641\u064a \u0627\u0644\u0645\u0646\u0632\u0644.',
  },
  ff: {
    title: 'Ndiyam e Yiite', back: 'Rutto',
    sub: 'Ta\u01b4re nde yim\u0253e \u0253e \u0253adii ma kaali. Meere, a alaa haaje se\u014baade ngam janngude.',
    all: 'Fof', water: 'Ndiyam', power: 'Yiite', allTowns: 'Nokkuuje fof',
    pickTown: 'Su\u0253o saare maa',
    report: 'Habru ta\u01b4re', reportTitle: 'Habru ta\u01b4re',
    reportSub: 'Habru tan ko yi\u0257\u0257aa e hoore maa jooni.',
    region: 'Diiwaan', town: 'Saare', quarter: 'Leydi', quarterPh: 'Bastos, Mvan...',
    note: 'Hino woodi ko nafata?', notePh: 'Gila 6 kikii\u0257e, laawol fof',
    send: 'Neldu', sending: 'Ina nelda...', cancel: 'Haaytu',
    live: 'Ko habraa jooni', liveHint: 'Ko yim\u0253e habri, wanaa kompaa\u00f1i. \u00d1aawu e hoore maa.',
    scheduled: 'Ta\u01b4re nde anndinaa', scheduledHint: 'Bambeh yuurnii nde ado nde fee\u00f1a.',
    people: 'yim\u0253e habri \u0257um', onePerson: 'ne\u0257\u0257o gooto habri \u0257um',
    sameHere: 'Noon kadi \u0257oo', itsBack: 'Ngal artii',
    none: 'Hay huunde habraaka jooni.',
    noneHint: 'Ko kabaaru mo\u01b4\u01b4o - maa hay gooto habraani tawo. Aan woni gadano.',
    failed: 'Ro\u014bkii loowde', failedBody: '\u01b3eewto ce\u014bgal maa ndaarndo-\u0257aa kadi.',
    retry: 'Ndaarndo kadi', signIn: 'Se\u014bo ngam habrude',
    thanks: 'A jaaraama. Wo\u0253\u0253e ina njiya jooni.', restored: 'Winndaama ko artii. A jaaraama.',
    tooMany: 'Habrooje \u0257uu\u0257\u0257e e waktu gooto. Ndaarndo caggal.',
    areaRequired: 'Diiwaan e saare ina naamnaa.',
    failedSend: 'Ro\u014bkii neldude. Ndaarndo kadi.',
    justNow: 'jooni jooni', minsAgo: 'hoj.', hoursAgo: 'wakt.',
    from: 'Gila', until: 'haa',
    disclaimer: 'Bambeh wanaa mo totta ndiyam maa yiite. Ko habrooje yim\u0253e e anndinooje \u0257e min njuurnii - reendo lampa e ndiyam galle.',
  },
};
const tr = (l: string, k: string) => (STR[l] && STR[l][k]) || STR.en[k] || k;

const TOWN_KEY = 'bambeh:utility:town';
// FIX502 - stamped only after a SUCCESSFUL load. A failed load must not
// clear the Home badge, or a network dip would hide a real announcement.
const SEEN_KEY = 'bambeh:utility:seen';

function ago(iso: string, lang: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 2) return tr(lang, 'justNow');
  if (mins < 60) return mins + ' ' + tr(lang, 'minsAgo');
  return Math.round(mins / 60) + ' ' + tr(lang, 'hoursAgo');
}

function when(iso: string | null, lang: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(
      lang === 'fr' ? 'fr-CM' : lang === 'ar' ? 'ar' : 'en-GB',
      { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
    );
  } catch { return iso; }
}

export default function WaterLights() {
  const navigate = useNavigate();
  const raw: unknown = useLang();
  const lang = typeof raw === 'string' ? raw : 'en';
  const isRtl = lang === 'ar';
  const t = (k: string) => tr(lang, k);

  const [towns, setTowns] = useState<TownRow[]>([]);
  const [town, setTown] = useState<string>(() => {
    try { return window.localStorage.getItem(TOWN_KEY) ?? ''; } catch { return ''; }
  });
  const [filter, setFilter] = useState<'' | 'water' | 'electricity'>('');
  const [rows, setRows] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);
  // A failure must NEVER render as "no cuts reported".
  const [failed, setFailed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState<{
    utility: 'water' | 'electricity'; region: string; town: string; quarter: string; note: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 3500); };

  // getSession reads the token locally - no network, so it cannot time out.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSignedIn(Boolean(data?.session));
      } catch { setSignedIn(false); }
    })();
  }, []);

  const loadTowns = useCallback(async () => {
    const { data, error } = await supabase.rpc('utility_towns');
    if (!error) setTowns((data ?? []) as TownRow[]);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('utility_outages_active', {
        p_utility: filter || null,
        p_town: town || null,
      });
      if (error) throw error;
      setRows((data ?? []) as Outage[]);
      setFailed(false);
      try { window.localStorage.setItem(SEEN_KEY, new Date().toISOString()); } catch { /* private mode */ }
    } catch {
      setFailed(true);
    } finally { setLoading(false); }
  }, [filter, town]);

  useEffect(() => { loadTowns(); }, [loadTowns]);
  useEffect(() => { load(); }, [load]);

  const chooseTown = (v: string) => {
    setTown(v);
    try { v ? window.localStorage.setItem(TOWN_KEY, v) : window.localStorage.removeItem(TOWN_KEY); } catch { /* private mode */ }
  };

  const errText = (e: unknown): string => {
    const m = String((e as { message?: string })?.message ?? '');
    if (m.includes('BAMBEH_TOO_MANY_REPORTS')) return t('tooMany');
    if (m.includes('BAMBEH_AREA_REQUIRED')) return t('areaRequired');
    if (m.includes('BAMBEH_SIGN_IN_REQUIRED')) return t('signIn');
    return t('failedSend');
  };

  const confirm = async (o: Outage) => {
    if (!signedIn) { navigate('/login'); return; }
    setBusy(o.id);
    try {
      const { error } = await supabase.rpc('report_utility_outage', {
        p_utility: o.utility, p_region: o.region, p_town: o.town,
        p_quarter: o.quarter, p_note: null,
      });
      if (error) throw error;
      flash(t('thanks'));
      await load();
    } catch (e) { flash(errText(e)); } finally { setBusy(null); }
  };

  const restore = async (o: Outage) => {
    setBusy(o.id);
    try {
      const { error } = await supabase.rpc('resolve_utility_outage', { p_id: o.id });
      if (error) throw error;
      flash(t('restored'));
      await load();
    } catch (e) { flash(errText(e)); } finally { setBusy(null); }
  };

  const submit = async () => {
    if (!form) return;
    if (!form.region.trim() || !form.town.trim()) { flash(t('areaRequired')); return; }
    setSending(true);
    try {
      const { error } = await supabase.rpc('report_utility_outage', {
        p_utility: form.utility, p_region: form.region.trim(), p_town: form.town.trim(),
        p_quarter: form.quarter.trim() || null, p_note: form.note.trim() || null,
      });
      if (error) throw error;
      setForm(null);
      flash(t('thanks'));
      chooseTown(form.town.trim());
      await loadTowns();
      await load();
    } catch (e) { flash(errText(e)); } finally { setSending(false); }
  };

  const live = rows.filter((r) => r.kind === 'reported');
  const planned = rows.filter((r) => r.kind === 'scheduled');
  const INPUT = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
  const TAB = 'flex-1 rounded-xl py-2 text-sm font-semibold border transition-colors flex items-center justify-center gap-1.5';

  return (
    <div className="min-h-screen bg-gray-50 pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-sky-600 to-cyan-600 text-white px-4 pt-4 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white mb-3">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t('back')}
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Droplet className="w-6 h-6" /> {t('title')}
        </h1>
        <p className="text-sm text-white/85 mt-1">{t('sub')}</p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-3">
          <select value={town} onChange={(e) => chooseTown(e.target.value)} className={INPUT}>
            <option value="">{t('allTowns')}</option>
            {towns.map((x) => <option key={x.town} value={x.town}>{x.town}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => setFilter('')}
              className={`${TAB} ${filter === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>
              {t('all')}
            </button>
            <button onClick={() => setFilter('water')}
              className={`${TAB} ${filter === 'water' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'}`}>
              <Droplet className="w-4 h-4" /> {t('water')}
            </button>
            <button onClick={() => setFilter('electricity')}
              className={`${TAB} ${filter === 'electricity' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'}`}>
              <Zap className="w-4 h-4" /> {t('power')}
            </button>
          </div>
          <button
            onClick={() => {
              if (!signedIn) { navigate('/login'); return; }
              setForm({ utility: 'electricity', region: '', town: town, quarter: '', note: '' });
            }}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold py-3 rounded-xl">
            <Plus className="w-4 h-4" /> {signedIn ? t('report') : t('signIn')}
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10 text-sky-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : failed ? (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{t('failed')}</p>
              <p className="text-xs mt-0.5">{t('failedBody')}</p>
            </div>
            <button onClick={load} className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> {t('retry')}
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12">
            <Droplet className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">{t('none')}</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">{t('noneHint')}</p>
          </div>
        ) : (
          <>
            {live.length > 0 ? (
              <section>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" /> {t('live')}
                </h2>
                <p className="text-[11px] text-gray-400 mb-2">{t('liveHint')}</p>
                <div className="space-y-2">
                  {live.map((o) => (
                    <article key={o.id} className="bg-white rounded-xl border border-amber-200 p-3">
                      <div className="flex items-start gap-2">
                        <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                          o.utility === 'water' ? 'bg-sky-50' : 'bg-amber-50'}`}>
                          {o.utility === 'water'
                            ? <Droplet className="w-4 h-4 text-sky-600" />
                            : <Zap className="w-4 h-4 text-amber-600" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {[o.quarter, o.town].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-xs text-amber-800 font-medium">
                            {o.confirm_count === 1
                              ? t('onePerson')
                              : `${o.confirm_count} ${t('people')}`}
                          </p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {ago(o.last_activity_at, lang)}
                          </p>
                          {o.note ? <p className="text-xs text-gray-600 mt-1">{o.note}</p> : null}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => confirm(o)} disabled={busy === o.id}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 py-2 rounded-xl disabled:opacity-50">
                          <Users className="w-3.5 h-3.5" /> {t('sameHere')}
                        </button>
                        {o.mine ? (
                          <button onClick={() => restore(o)} disabled={busy === o.id}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-xl disabled:opacity-50">
                            <Check className="w-3.5 h-3.5" /> {t('itsBack')}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {planned.length > 0 ? (
              <section>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-sky-600" /> {t('scheduled')}
                </h2>
                <p className="text-[11px] text-gray-400 mb-2">{t('scheduledHint')}</p>
                <div className="space-y-2">
                  {planned.map((o) => (
                    <article key={o.id} className="bg-white rounded-xl border border-sky-200 p-3 flex items-start gap-2">
                      <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                        o.utility === 'water' ? 'bg-sky-50' : 'bg-amber-50'}`}>
                        {o.utility === 'water'
                          ? <Droplet className="w-4 h-4 text-sky-600" />
                          : <Zap className="w-4 h-4 text-amber-600" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {[o.quarter, o.town].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-xs text-sky-800">
                          {t('from')} {when(o.starts_at, lang)}
                          {o.ends_at ? ` ${t('until')} ${when(o.ends_at, lang)}` : ''}
                        </p>
                        {o.note ? <p className="text-xs text-gray-600 mt-1">{o.note}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}

        <p className="text-[11px] text-gray-400 flex items-start gap-1.5 pt-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {t('disclaimer')}
        </p>

        <Link to="/list-my-service" className="block text-center text-xs font-semibold text-sky-700 hover:underline pt-1">
          {tr(lang, 'report')}
        </Link>
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => !sending && setForm(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{t('reportTitle')}</h3>
              <button onClick={() => !sending && setForm(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">{t('reportSub')}</p>

            <div className="flex gap-2">
              <button onClick={() => setForm({ ...form, utility: 'electricity' })}
                className={`${TAB} ${form.utility === 'electricity' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                <Zap className="w-4 h-4" /> {t('power')}
              </button>
              <button onClick={() => setForm({ ...form, utility: 'water' })}
                className={`${TAB} ${form.utility === 'water' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                <Droplet className="w-4 h-4" /> {t('water')}
              </button>
            </div>

            <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={INPUT}>
              <option value="">{t('region')}</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })}
              placeholder={t('town')} className={INPUT} />
            <input value={form.quarter} onChange={(e) => setForm({ ...form, quarter: e.target.value })}
              placeholder={t('quarterPh')} className={INPUT} />
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder={t('notePh')} rows={2} className={INPUT} />

            <div className="flex gap-2 pt-1">
              <button onClick={() => setForm(null)} disabled={sending}
                className="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl disabled:opacity-50">
                {t('cancel')}
              </button>
              <button onClick={submit} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 py-2.5 rounded-xl disabled:opacity-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {sending ? t('sending') : t('send')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__WATERLIGHTS_FIX502__COMPLETE
