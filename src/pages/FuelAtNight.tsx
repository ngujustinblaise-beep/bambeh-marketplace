// BAMBEH_DEPLOY_TOKEN__FUELATNIGHT_FIX506_CLEAN
/**
 * src/pages/FuelAtNight.tsx - Bambeh free services
 * FILE LOCATION: src/pages/FuelAtNight.tsx
 *
 * FIX506 - FUEL AT NIGHT, the page people actually open.
 * ------------------------------------------------------------------
 * TWO QUESTIONS, ANSWERED SEPARATELY.
 *   IS IT OPEN? The database works that out from the clock against the hours
 *   staff entered. Open stations sort to the top. Nobody at 1am should have to
 *   read opening hours and do the arithmetic themselves.
 *
 *   DOES IT HAVE FUEL? Only other drivers know. Their reports show with a
 *   count and an age, and they die after six hours - because a six-hour-old
 *   "yes they have petrol" is how you send somebody across town for nothing.
 *
 * WE NEVER SAY "HAS FUEL" IN OUR OWN VOICE. The card says how many people
 * said so and how long ago. Bambeh does not own a filling station and must
 * never sound like it knows the pump.
 *
 * NO LOGIN TO READ. Someone on an empty tank at midnight does not sign up
 * first. Reporting needs an account, because that is what the rate limit and
 * the one-vote-per-person rule hang on.
 *
 * FIVE LANGUAGES, every non-ASCII character written as a \uXXXX escape, so the
 * file is pure ASCII on disk and no encoding pass can mangle it.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Fuel, Droplet, Flame, Loader2, AlertCircle, RefreshCw,
  MapPin, Clock, Phone, Users, Info, X, Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type FuelKind = 'petrol' | 'diesel' | 'gas';

interface Station {
  id: string; name: string; brand: string | null;
  region: string; town: string; quarter: string | null;
  address: string | null; phone: string | null;
  is_24h: boolean; opens_at: string | null; closes_at: string | null;
  has_petrol: boolean; has_diesel: boolean; has_gas: boolean;
  notes: string | null; open_now: boolean;
  last_status: string | null; report_count: number; last_report_at: string | null;
}
interface TownRow { town: string; region: string }

const STR: Record<string, Record<string, string>> = {
  en: {
    title: 'Fuel at night', back: 'Back',
    sub: 'Stations open now, and what other drivers are saying. Free, no sign-in to read.',
    allTowns: 'Everywhere', all: 'All', petrol: 'Petrol', diesel: 'Diesel', gas: 'Gas',
    openNow: 'Open now', closed: 'Closed now', h24: 'Open 24 hours',
    call: 'Call', report: 'Report fuel',
    reportTitle: 'What did you see?', reportSub: 'Only report what you saw yourself, just now.',
    whichFuel: 'Which fuel?', available: 'They have it', out: 'They are dry', queue: 'Long queue',
    send: 'Send', sending: 'Sending...', cancel: 'Cancel',
    saidAvailable: 'said they have it', saidOut: 'said they are dry', saidQueue: 'said there is a queue',
    onePerson: '1 person', people: 'people', noReports: 'Nobody has reported here yet',
    justNow: 'just now', minsAgo: 'min ago', hoursAgo: 'h ago',
    none: 'No stations listed yet.',
    noneHint: 'We are still adding them. Check back, or tell us one that opens late.',
    failed: 'Could not load stations', failedBody: 'Check your connection and try again.',
    retry: 'Try again', signIn: 'Sign in to report',
    thanks: 'Thank you. Other drivers can see it now.',
    tooMany: 'That is a lot of reports in one hour. Try again later.',
    failedSend: 'Could not send that. Try again.',
    disclaimer: 'Bambeh does not run any filling station. Opening hours come from the stations; whether there is fuel comes from other drivers and can change within the hour.',
  },
  fr: {
    title: 'Carburant la nuit', back: 'Retour',
    sub: 'Stations ouvertes maintenant, et ce que disent les autres conducteurs. Gratuit, sans compte.',
    allTowns: 'Partout', all: 'Tout', petrol: 'Essence', diesel: 'Gasoil', gas: 'Gaz',
    openNow: 'Ouvert', closed: 'Ferm\u00e9', h24: 'Ouvert 24h/24',
    call: 'Appeler', report: 'Signaler',
    reportTitle: 'Qu\u2019avez-vous vu ?', reportSub: 'Ne signalez que ce que vous avez vu vous-m\u00eame, \u00e0 l\u2019instant.',
    whichFuel: 'Quel carburant ?', available: 'Il y en a', out: 'Ils sont \u00e0 sec', queue: 'Longue file',
    send: 'Envoyer', sending: 'Envoi...', cancel: 'Annuler',
    saidAvailable: 'disent qu\u2019il y en a', saidOut: 'disent qu\u2019ils sont \u00e0 sec', saidQueue: 'signalent une file',
    onePerson: '1 personne', people: 'personnes', noReports: 'Personne n\u2019a encore signal\u00e9 ici',
    justNow: '\u00e0 l\u2019instant', minsAgo: 'min', hoursAgo: 'h',
    none: 'Aucune station list\u00e9e pour le moment.',
    noneHint: 'Nous les ajoutons encore. Revenez, ou dites-nous une station qui ouvre tard.',
    failed: 'Chargement impossible', failedBody: 'V\u00e9rifiez votre connexion et r\u00e9essayez.',
    retry: 'R\u00e9essayer', signIn: 'Connectez-vous pour signaler',
    thanks: 'Merci. Les autres conducteurs le voient maintenant.',
    tooMany: 'Beaucoup de signalements en une heure. R\u00e9essayez plus tard.',
    failedSend: 'Envoi impossible. R\u00e9essayez.',
    disclaimer: 'Bambeh ne g\u00e8re aucune station-service. Les horaires viennent des stations ; la disponibilit\u00e9 vient des autres conducteurs et peut changer en une heure.',
  },
  pidgin: {
    title: 'Fuel for night', back: 'Go back',
    sub: 'Station wey dey open now, and wetin oda driver dem talk. Free, you no need account.',
    allTowns: 'Everywhere', all: 'All', petrol: 'Petrol', diesel: 'Gasoil', gas: 'Gas',
    openNow: 'E dey open', closed: 'E don close', h24: 'E dey open 24 hours',
    call: 'Call dem', report: 'Talk wetin you see',
    reportTitle: 'Wetin you see?', reportSub: 'Only talk wetin you see yourself, now now.',
    whichFuel: 'Which one?', available: 'Dem get am', out: 'Dem don finish', queue: 'Queue long',
    send: 'Send am', sending: 'Dey send...', cancel: 'Leave am',
    saidAvailable: 'talk say dem get am', saidOut: 'talk say dem don finish', saidQueue: 'talk say queue dey',
    onePerson: '1 person', people: 'people', noReports: 'Nobody never talk anytin here',
    justNow: 'just now', minsAgo: 'min ago', hoursAgo: 'h ago',
    none: 'No station dey list yet.',
    noneHint: 'We still dey add dem. Come back, or tell us one wey dey open late.',
    failed: 'E no fit load', failedBody: 'Check your network make you try again.',
    retry: 'Try again', signIn: 'Enter account make you talk',
    thanks: 'Thank you. Oda driver dem dey see am now.',
    tooMany: 'Na plenty report for one hour. Try later.',
    failedSend: 'E no send. Try again.',
    disclaimer: 'Bambeh no get any filling station. Na di station dem give di time; na oda driver dem talk whether fuel dey, and e fit change for one hour.',
  },
  ar: {
    title: '\u0627\u0644\u0648\u0642\u0648\u062f \u0644\u064a\u0644\u0627\u064b', back: '\u0631\u062c\u0648\u0639',
    sub: '\u0645\u062d\u0637\u0627\u062a \u0645\u0641\u062a\u0648\u062d\u0629 \u0627\u0644\u0622\u0646\u060c \u0648\u0645\u0627 \u064a\u0642\u0648\u0644\u0647 \u0627\u0644\u0633\u0627\u0626\u0642\u0648\u0646. \u0645\u062c\u0627\u0646\u064a\u060c \u062f\u0648\u0646 \u062a\u0633\u062c\u064a\u0644.',
    allTowns: '\u0643\u0644 \u0627\u0644\u0645\u062f\u0646', all: '\u0627\u0644\u0643\u0644', petrol: '\u0628\u0646\u0632\u064a\u0646', diesel: '\u062f\u064a\u0632\u0644', gas: '\u063a\u0627\u0632',
    openNow: '\u0645\u0641\u062a\u0648\u062d \u0627\u0644\u0622\u0646', closed: '\u0645\u063a\u0644\u0642', h24: '\u0645\u0641\u062a\u0648\u062d 24 \u0633\u0627\u0639\u0629',
    call: '\u0627\u062a\u0635\u0644', report: '\u0623\u0628\u0644\u063a',
    reportTitle: '\u0645\u0627\u0630\u0627 \u0631\u0623\u064a\u062a\u061f', reportSub: '\u0623\u0628\u0644\u063a \u0641\u0642\u0637 \u0639\u0645\u0627 \u0631\u0623\u064a\u062a\u0647 \u0628\u0646\u0641\u0633\u0643 \u0627\u0644\u0622\u0646.',
    whichFuel: '\u0623\u064a \u0648\u0642\u0648\u062f\u061f', available: '\u0645\u062a\u0648\u0641\u0631', out: '\u0646\u0641\u062f', queue: '\u0637\u0627\u0628\u0648\u0631 \u0637\u0648\u064a\u0644',
    send: '\u0625\u0631\u0633\u0627\u0644', sending: '\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...', cancel: '\u0625\u0644\u063a\u0627\u0621',
    saidAvailable: '\u0642\u0627\u0644\u0648\u0627 \u0625\u0646\u0647 \u0645\u062a\u0648\u0641\u0631', saidOut: '\u0642\u0627\u0644\u0648\u0627 \u0625\u0646\u0647 \u0646\u0641\u062f', saidQueue: '\u0623\u0628\u0644\u063a\u0648\u0627 \u0639\u0646 \u0637\u0627\u0628\u0648\u0631',
    onePerson: '\u0634\u062e\u0635 \u0648\u0627\u062d\u062f', people: '\u0623\u0634\u062e\u0627\u0635', noReports: '\u0644\u0645 \u064a\u0628\u0644\u063a \u0623\u062d\u062f \u0647\u0646\u0627 \u0628\u0639\u062f',
    justNow: '\u0627\u0644\u0622\u0646', minsAgo: '\u062f\u0642\u064a\u0642\u0629', hoursAgo: '\u0633\u0627\u0639\u0629',
    none: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062d\u0637\u0627\u062a \u0628\u0639\u062f.',
    noneHint: '\u0645\u0627 \u0632\u0644\u0646\u0627 \u0646\u0636\u064a\u0641\u0647\u0627. \u0639\u062f \u0644\u0627\u062d\u0642\u0627\u060c \u0623\u0648 \u0623\u062e\u0628\u0631\u0646\u0627 \u0628\u0645\u062d\u0637\u0629 \u062a\u0641\u062a\u062d \u0645\u062a\u0623\u062e\u0631\u0627.',
    failed: '\u062a\u0639\u0630\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644', failedBody: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u062b\u0645 \u0623\u0639\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629.',
    retry: '\u0623\u0639\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629', signIn: '\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u0625\u0628\u0644\u0627\u063a',
    thanks: '\u0634\u0643\u0631\u0627. \u0627\u0644\u0633\u0627\u0626\u0642\u0648\u0646 \u064a\u0631\u0648\u0646\u0647 \u0627\u0644\u0622\u0646.',
    tooMany: '\u0628\u0644\u0627\u063a\u0627\u062a \u0643\u062b\u064a\u0631\u0629 \u0641\u064a \u0633\u0627\u0639\u0629. \u062d\u0627\u0648\u0644 \u0644\u0627\u062d\u0642\u0627.',
    failedSend: '\u062a\u0639\u0630\u0631 \u0627\u0644\u0625\u0631\u0633\u0627\u0644. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627.',
    disclaimer: '\u0628\u0645\u0628\u0647 \u0644\u0627 \u062a\u062f\u064a\u0631 \u0623\u064a \u0645\u062d\u0637\u0629 \u0648\u0642\u0648\u062f. \u0627\u0644\u0645\u0648\u0627\u0639\u064a\u062f \u0645\u0646 \u0627\u0644\u0645\u062d\u0637\u0627\u062a\u060c \u0648\u062a\u0648\u0641\u0631 \u0627\u0644\u0648\u0642\u0648\u062f \u0645\u0646 \u0627\u0644\u0633\u0627\u0626\u0642\u064a\u0646 \u0648\u0642\u062f \u064a\u062a\u063a\u064a\u0631 \u062e\u0644\u0627\u0644 \u0633\u0627\u0639\u0629.',
  },
  ff: {
    title: 'Esaas jemma', back: 'Rutto',
    sub: 'Sitaso\u014baaji uddi\u0257i jooni, e ko wo\u0253\u0253e soofoor\u0253e kaali. Meere, a alaa haaje se\u014baade.',
    allTowns: 'Nokkuuje fof', all: 'Fof', petrol: 'Esaas', diesel: 'Gasuwaal', gas: 'Gaas',
    openNow: 'Ina uddita jooni', closed: 'Uddaama', h24: 'Ina uddita waktuuji 24',
    call: 'Noddu', report: 'Habru',
    reportTitle: 'Ko yi\u0257\u0257aa?', reportSub: 'Habru tan ko yi\u0257\u0257aa e hoore maa jooni.',
    whichFuel: 'Hol esaas?', available: 'Ina woodi', out: 'Ina laa\u0253i', queue: 'Ndilla juut\u0257o',
    send: 'Neldu', sending: 'Ina nelda...', cancel: 'Haaytu',
    saidAvailable: 'mbi\u0257i ina woodi', saidOut: 'mbi\u0257i ina laa\u0253i', saidQueue: 'kaali ndilla',
    onePerson: 'ne\u0257\u0257o gooto', people: 'yim\u0253e', noReports: 'Hay gooto habraani \u0257oo tawo',
    justNow: 'jooni jooni', minsAgo: 'hoj.', hoursAgo: 'wakt.',
    none: 'Sitaso\u014b woodaani tawo.',
    noneHint: 'Min ngoni e \u0253eydude \u0257e. Rutto, maa habru min sitaso\u014b uddittoo\u0257o caggal.',
    failed: 'Ro\u014bkii loowde', failedBody: '\u01b4eewto ce\u014bgal maa ndaarndo-\u0257aa kadi.',
    retry: 'Ndaarndo kadi', signIn: 'Se\u014bo ngam habrude',
    thanks: 'A jaaraama. So\u014bfoor\u0253e wo\u0253\u0253e ina njiya jooni.',
    tooMany: 'Habrooje \u0257uu\u0257\u0257e e waktu gooto. Ndaarndo caggal.',
    failedSend: 'Ro\u014bkii neldude. Ndaarndo kadi.',
    disclaimer: 'Bambeh jeyaa hay sitaso\u014b esaas. Waktuuji ina ummoo e sitaso\u014baaji; woodde esaas ina ummoo e so\u014bfoor\u0253e, ina waawi waylaade e waktu gooto.',
  },
};
const tr = (l: string, k: string) => (STR[l] && STR[l][k]) || STR.en[k] || k;

const TOWN_KEY = 'bambeh:fuel:town';
const SEEN_KEY = 'bambeh:fuel:seen';

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '');

function ago(iso: string | null, lang: string): string {
  if (!iso) return '';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 2) return tr(lang, 'justNow');
  if (m < 60) return m + ' ' + tr(lang, 'minsAgo');
  return Math.round(m / 60) + ' ' + tr(lang, 'hoursAgo');
}

export default function FuelAtNight() {
  const navigate = useNavigate();
  const raw: unknown = useLang();
  const lang = typeof raw === 'string' ? raw : 'en';
  const isRtl = lang === 'ar';
  const t = (k: string) => tr(lang, k);

  const [towns, setTowns] = useState<TownRow[]>([]);
  const [town, setTown] = useState<string>(() => {
    try { return window.localStorage.getItem(TOWN_KEY) ?? ''; } catch { return ''; }
  });
  const [fuel, setFuel] = useState<'' | FuelKind>('');
  const [rows, setRows] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [toast, setToast] = useState('');
  const [sheet, setSheet] = useState<{ station: Station; fuel: FuelKind } | null>(null);
  const [sending, setSending] = useState(false);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSignedIn(Boolean(data?.session));
      } catch { setSignedIn(false); }
    })();
  }, []);

  const loadTowns = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('fuel_towns');
      if (!error) setTowns((data ?? []) as TownRow[]);
    } catch { /* the picker is a convenience, never a requirement */ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fuel_open_now', {
        p_town: town || null, p_fuel: fuel || null,
      });
      if (error) throw error;
      setRows((data ?? []) as Station[]);
      setFailed(false);
      try { window.localStorage.setItem(SEEN_KEY, new Date().toISOString()); } catch { /* private mode */ }
    } catch {
      // A failure must NEVER render as "no stations".
      setFailed(true);
    } finally { setLoading(false); }
  }, [town, fuel]);

  useEffect(() => { loadTowns(); }, [loadTowns]);
  useEffect(() => { load(); }, [load]);

  const chooseTown = (v: string) => {
    setTown(v);
    try { v ? window.localStorage.setItem(TOWN_KEY, v) : window.localStorage.removeItem(TOWN_KEY); }
    catch { /* private mode */ }
  };

  const errText = (e: unknown): string => {
    const m = String((e as { message?: string })?.message ?? '');
    if (m.includes('BAMBEH_TOO_MANY_REPORTS')) return t('tooMany');
    if (m.includes('BAMBEH_SIGN_IN_REQUIRED')) return t('signIn');
    return t('failedSend');
  };

  const send = async (status: 'available' | 'out' | 'queue') => {
    if (!sheet) return;
    setSending(true);
    try {
      const { error } = await supabase.rpc('report_fuel', {
        p_station_id: sheet.station.id, p_fuel: sheet.fuel, p_status: status,
      });
      if (error) throw error;
      setSheet(null);
      flash(t('thanks'));
      await load();
    } catch (e) { flash(errText(e)); } finally { setSending(false); }
  };

  const openSheet = (s: Station) => {
    if (!signedIn) { navigate('/login'); return; }
    const first: FuelKind = fuel || (s.has_petrol ? 'petrol' : s.has_diesel ? 'diesel' : 'gas');
    setSheet({ station: s, fuel: first });
  };

  const saidWhat = (s: Station) => {
    if (!s.last_status || !s.report_count) return null;
    const key = s.last_status === 'available' ? 'saidAvailable'
      : s.last_status === 'out' ? 'saidOut' : 'saidQueue';
    const who = Number(s.report_count) === 1
      ? t('onePerson')
      : `${s.report_count} ${t('people')}`;
    return { text: `${who} ${t(key)}`, tone: s.last_status };
  };

  const INPUT = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500';
  const TAB = 'flex-1 rounded-xl py-2 text-sm font-semibold border transition-colors flex items-center justify-center gap-1.5';

  return (
    <div className="min-h-screen bg-gray-50 pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-4 pt-4 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white mb-3">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t('back')}
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Fuel className="w-6 h-6" /> {t('title')}
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
            <button onClick={() => setFuel('')}
              className={`${TAB} ${fuel === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>
              {t('all')}
            </button>
            <button onClick={() => setFuel('petrol')}
              className={`${TAB} ${fuel === 'petrol' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'}`}>
              <Fuel className="w-4 h-4" /> {t('petrol')}
            </button>
            <button onClick={() => setFuel('diesel')}
              className={`${TAB} ${fuel === 'diesel' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>
              <Droplet className="w-4 h-4" /> {t('diesel')}
            </button>
            <button onClick={() => setFuel('gas')}
              className={`${TAB} ${fuel === 'gas' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-200'}`}>
              <Flame className="w-4 h-4" /> {t('gas')}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10 text-amber-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
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
            <Fuel className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">{t('none')}</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">{t('noneHint')}</p>
          </div>
        ) : rows.map((s) => {
          const said = saidWhat(s);
          return (
            <article key={s.id}
              className={`bg-white rounded-xl border p-3 ${s.open_now ? 'border-emerald-200' : 'border-gray-100 opacity-75'}`}>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-amber-600" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {s.name}
                    {s.brand ? <span className="text-gray-400 font-normal"> \u00b7 {s.brand}</span> : null}
                  </p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {[s.quarter, s.town].filter(Boolean).join(', ')}
                    {s.address ? ` \u00b7 ${s.address}` : ''}
                  </p>
                  <p className="text-xs mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0 text-gray-400" />
                    <span className={s.open_now ? 'text-emerald-700 font-bold' : 'text-gray-500 font-semibold'}>
                      {s.open_now ? t('openNow') : t('closed')}
                    </span>
                    <span className="text-gray-400">
                      \u00b7 {s.is_24h ? t('h24') : `${hhmm(s.opens_at)} - ${hhmm(s.closes_at)}`}
                    </span>
                  </p>
                  {s.notes ? <p className="text-xs text-gray-500 mt-1">{s.notes}</p> : null}
                </div>
              </div>

              {/* What OTHER DRIVERS said. Never Bambeh's own claim. */}
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                {said ? (
                  <span className={
                    said.tone === 'available' ? 'text-emerald-700 font-semibold'
                    : said.tone === 'out' ? 'text-red-700 font-semibold'
                    : 'text-amber-700 font-semibold'}>
                    {said.text}
                    <span className="text-gray-400 font-normal"> \u00b7 {ago(s.last_report_at, lang)}</span>
                  </span>
                ) : (
                  <span className="text-gray-400">{t('noReports')}</span>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                {s.phone ? (
                  <a href={`tel:${s.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 py-2 rounded-xl">
                    <Phone className="w-3.5 h-3.5" /> {t('call')}
                  </a>
                ) : null}
                <button onClick={() => openSheet(s)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 py-2 rounded-xl">
                  <Users className="w-3.5 h-3.5" /> {signedIn ? t('report') : t('signIn')}
                </button>
              </div>
            </article>
          );
        })}

        <p className="text-[11px] text-gray-400 flex items-start gap-1.5 pt-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {t('disclaimer')}
        </p>
      </div>

      {sheet ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => !sending && setSheet(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{t('reportTitle')}</h3>
              <button onClick={() => !sending && setSheet(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">{sheet.station.name} \u2014 {t('reportSub')}</p>

            <p className="text-xs font-semibold text-gray-600">{t('whichFuel')}</p>
            <div className="flex gap-2">
              {sheet.station.has_petrol ? (
                <button onClick={() => setSheet({ ...sheet, fuel: 'petrol' })}
                  className={`${TAB} ${sheet.fuel === 'petrol' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                  <Fuel className="w-4 h-4" /> {t('petrol')}
                </button>
              ) : null}
              {sheet.station.has_diesel ? (
                <button onClick={() => setSheet({ ...sheet, fuel: 'diesel' })}
                  className={`${TAB} ${sheet.fuel === 'diesel' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>
                  <Droplet className="w-4 h-4" /> {t('diesel')}
                </button>
              ) : null}
              {sheet.station.has_gas ? (
                <button onClick={() => setSheet({ ...sheet, fuel: 'gas' })}
                  className={`${TAB} ${sheet.fuel === 'gas' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                  <Flame className="w-4 h-4" /> {t('gas')}
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button onClick={() => send('available')} disabled={sending}
                className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-xl disabled:opacity-50">
                <Check className="w-4 h-4" /> {t('available')}
              </button>
              <button onClick={() => send('queue')} disabled={sending}
                className="flex items-center justify-center gap-2 text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 py-2.5 rounded-xl disabled:opacity-50">
                <Users className="w-4 h-4" /> {t('queue')}
              </button>
              <button onClick={() => send('out')} disabled={sending}
                className="flex items-center justify-center gap-2 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl disabled:opacity-50">
                <X className="w-4 h-4" /> {t('out')}
              </button>
            </div>

            <button onClick={() => setSheet(null)} disabled={sending}
              className="w-full text-sm font-bold text-gray-500 py-2 disabled:opacity-50">
              {sending ? t('sending') : t('cancel')}
            </button>
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
// BAMBEH_END_TOKEN__FUELATNIGHT_FIX506__COMPLETE
