// BAMBEH_DEPLOY_TOKEN__AGENTPAGE_FIX572_CLEAN
/**
 * src/routes/groups/delivery/AgentPage.tsx - Bambeh Marketplace
 *
 * FIX572 - THE MARKETING AGENT'S OWN PAGE.
 *
 * Your agents existed in the Command Center since FIX508 and nowhere else.
 * An agent in Bamenda could not see their own code or their own numbers
 * without phoning you. This is that page.
 *
 * Talks to the functions FIX569 installed:
 *   bambeh_my_agent()            my code, my counts, whether I am active
 *   bambeh_my_agent_daily(days)  my own day-by-day
 *   bambeh_agent_apply(...)      apply, or correct my details
 *
 * IT SHOWS A DASH, NOT A ZERO, WHEN COUNTS ARE UNAVAILABLE
 *   FIX569 returns counts_available. If agent_stats() is admin-gated on your
 *   database, the numbers come back null and this page prints a dash. An
 *   agent seeing "0 signups" when they brought fourteen people would stop
 *   working for Bambeh that afternoon, and they would be right to.
 *
 * NO CODE UNTIL YOU AGREE
 *   An application creates a row with no code and is_active false. The code
 *   appears when an admin activates them in AgentsSection. Until then this
 *   page says plainly that the application is being reviewed.
 *
 * IT NEVER SHOWS WHO SIGNED UP
 *   Counts and dates only. An agent is paid for bringing people, not for
 *   holding a list of strangers' phone numbers.
 *
 * FIVE LANGUAGES, ASCII-ESCAPED. Own error boundary. Icons limited to ones
 * already shipped elsewhere in Bambeh.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, CheckCircle, Clock, Shield, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Dict = {
  title: string; lead: string; whatNext: string; noList: string;
  name: string; phone: string; region: string; town: string; note: string;
  submit: string; saving: string; update: string;
  pending: string; pendingBody: string;
  active: string; yourCode: string; copied: string; copy: string;
  signups: string; activated: string; today: string; week: string;
  unavailable: string; daily: string; noDays: string;
  back: string; signIn: string; refresh: string;
  needName: string; needPhone: string; needRegion: string; needTown: string;
  failed: string;
};

const STR: Record<string, Dict> = {
  en: {
    title: 'Bambeh marketing agent',
    lead: 'Bring people onto Bambeh and get credited for everyone who stays.',
    whatNext: 'After you send this, Bambeh will review your application. Your agent code is given once you are approved - it is not issued automatically.',
    noList: 'You see how many people signed up under your code and on which days. You never see their names or numbers.',
    name: 'Your full name', phone: 'Phone number', region: 'Region', town: 'Town',
    note: 'Where do you work? Markets, schools, motor parks',
    submit: 'Send my application', saving: 'Sending\u2026', update: 'Update my details',
    pending: 'Application under review',
    pendingBody: 'Bambeh has your application. Your code appears here once it is approved.',
    active: 'You are an active Bambeh agent',
    yourCode: 'Your agent code', copied: 'Copied', copy: 'Copy',
    signups: 'signed up', activated: 'came back', today: 'today', week: 'this week',
    unavailable: 'Counts are unavailable right now. Your code still works.',
    daily: 'Day by day', noDays: 'Nothing recorded yet.',
    back: 'Back', signIn: 'Sign in first, then come back to this page.',
    refresh: 'Refresh',
    needName: 'Your full name is required.', needPhone: 'A phone number is required.',
    needRegion: 'Choose your region.', needTown: 'Your town is required.',
    failed: 'That did not go through. Please try again.',
  },
  fr: {
    title: 'Agent marketing Bambeh',
    lead: 'Amenez des personnes sur Bambeh et soyez cr\u00e9dit\u00e9 pour celles qui restent.',
    whatNext: 'Apr\u00e8s l\u2019envoi, Bambeh examinera votre candidature. Votre code d\u2019agent est remis apr\u00e8s approbation - il n\u2019est pas d\u00e9livr\u00e9 automatiquement.',
    noList: 'Vous voyez combien de personnes se sont inscrites avec votre code et quels jours. Jamais leurs noms ni leurs num\u00e9ros.',
    name: 'Votre nom complet', phone: 'Num\u00e9ro de t\u00e9l\u00e9phone', region: 'R\u00e9gion', town: 'Ville',
    note: 'O\u00f9 travaillez-vous\u00a0? March\u00e9s, \u00e9coles, gares routi\u00e8res',
    submit: 'Envoyer ma candidature', saving: 'Envoi\u2026', update: 'Mettre \u00e0 jour',
    pending: 'Candidature en cours d\u2019examen',
    pendingBody: 'Bambeh a votre candidature. Votre code appara\u00eetra ici apr\u00e8s approbation.',
    active: 'Vous \u00eates un agent Bambeh actif',
    yourCode: 'Votre code d\u2019agent', copied: 'Copi\u00e9', copy: 'Copier',
    signups: 'inscrits', activated: 'revenus', today: 'aujourd\u2019hui', week: 'cette semaine',
    unavailable: 'Les compteurs sont indisponibles. Votre code fonctionne toujours.',
    daily: 'Jour par jour', noDays: 'Rien enregistr\u00e9 pour le moment.',
    back: 'Retour', signIn: 'Connectez-vous d\u2019abord, puis revenez.',
    refresh: 'Actualiser',
    needName: 'Votre nom complet est requis.', needPhone: 'Un num\u00e9ro est requis.',
    needRegion: 'Choisissez votre r\u00e9gion.', needTown: 'Votre ville est requise.',
    failed: 'Cela n\u2019a pas abouti. R\u00e9essayez.',
  },
  pcm: {
    title: 'Bambeh marketing agent',
    lead: 'Bring people come Bambeh, and you go get credit for everybody who stay.',
    whatNext: 'After you send this, Bambeh go check your application. Your agent code dey come after dem approve you - e no dey come by itself.',
    noList: 'You go see how many people register with your code and which day. You no go see their name or number.',
    name: 'Your full name', phone: 'Phone number', region: 'Region', town: 'Town',
    note: 'Where you dey work? Market, school, motor park',
    submit: 'Send my application', saving: 'We dey send\u2026', update: 'Change my details',
    pending: 'Dem dey check your application',
    pendingBody: 'Bambeh get your application. Your code go show here after dem approve am.',
    active: 'You be active Bambeh agent',
    yourCode: 'Your agent code', copied: 'Copied', copy: 'Copy am',
    signups: 'don register', activated: 'come back', today: 'today', week: 'this week',
    unavailable: 'The count no dey show now. Your code still dey work.',
    daily: 'Day by day', noDays: 'Nothing dey yet.',
    back: 'Go back', signIn: 'Sign in first, then come back.',
    refresh: 'Check again',
    needName: 'We need your full name.', needPhone: 'We need phone number.',
    needRegion: 'Choose your region.', needTown: 'We need your town.',
    failed: 'E no work. Abeg try again.',
  },
  ar: {
    title: '\u0648\u0643\u064a\u0644 \u062a\u0633\u0648\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647',
    lead: '\u0627\u062c\u0644\u0628 \u0627\u0644\u0646\u0627\u0633 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0648\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0627\u0644\u0631\u0635\u064a\u062f.',
    whatNext: '\u0628\u0639\u062f \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u060c \u0633\u062a\u0631\u0627\u062c\u0639 \u0628\u0627\u0645\u0628\u064a\u0647 \u0637\u0644\u0628\u0643. \u064a\u064f\u0645\u0646\u062d \u0627\u0644\u0631\u0645\u0632 \u0628\u0639\u062f \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629.',
    noList: '\u062a\u0631\u0649 \u0639\u062f\u062f \u0627\u0644\u0645\u0633\u062c\u0644\u064a\u0646 \u0628\u0631\u0645\u0632\u0643 \u0648\u0627\u0644\u062a\u0648\u0627\u0631\u064a\u062e \u0641\u0642\u0637\u060c \u0644\u0627 \u0627\u0644\u0623\u0633\u0645\u0627\u0621.',
    name: '\u0627\u0633\u0645\u0643 \u0627\u0644\u0643\u0627\u0645\u0644', phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
    region: '\u0627\u0644\u062c\u0647\u0629', town: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629',
    note: '\u0623\u064a\u0646 \u062a\u0639\u0645\u0644\u061f',
    submit: '\u0623\u0631\u0633\u0644 \u0637\u0644\u0628\u064a', saving: '\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u2026',
    update: '\u062a\u062d\u062f\u064a\u062b \u0628\u064a\u0627\u0646\u0627\u062a\u064a',
    pending: '\u0627\u0644\u0637\u0644\u0628 \u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629',
    pendingBody: '\u0644\u062f\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0637\u0644\u0628\u0643. \u0633\u064a\u0638\u0647\u0631 \u0627\u0644\u0631\u0645\u0632 \u0628\u0639\u062f \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629.',
    active: '\u0623\u0646\u062a \u0648\u0643\u064a\u0644 \u0646\u0634\u0637 \u0644\u062f\u0649 \u0628\u0627\u0645\u0628\u064a\u0647',
    yourCode: '\u0631\u0645\u0632 \u0627\u0644\u0648\u0643\u064a\u0644 \u0627\u0644\u062e\u0627\u0635 \u0628\u0643',
    copied: '\u062a\u0645 \u0627\u0644\u0646\u0633\u062e', copy: '\u0646\u0633\u062e',
    signups: '\u0645\u0633\u062c\u0644', activated: '\u0639\u0627\u062f\u0648\u0627',
    today: '\u0627\u0644\u064a\u0648\u0645', week: '\u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639',
    unavailable: '\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u0627\u0644\u0622\u0646. \u0631\u0645\u0632\u0643 \u064a\u0639\u0645\u0644.',
    daily: '\u064a\u0648\u0645\u0627\u064b \u0628\u064a\u0648\u0645', noDays: '\u0644\u0627 \u0634\u064a\u0621 \u0628\u0639\u062f.',
    back: '\u0631\u062c\u0648\u0639', signIn: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b.',
    refresh: '\u062a\u062d\u062f\u064a\u062b',
    needName: '\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628.', needPhone: '\u0627\u0644\u0647\u0627\u062a\u0641 \u0645\u0637\u0644\u0648\u0628.',
    needRegion: '\u0627\u062e\u062a\u0631 \u0627\u0644\u062c\u0647\u0629.', needTown: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0645\u0637\u0644\u0648\u0628\u0629.',
    failed: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0623\u0645\u0631. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.',
  },
  ff: {
    title: 'Agent jeeyngu Bambeh',
    lead: 'Addu yim\u0253e e Bambeh, a he\u0253a njo\u0253di e kala mo\u0253\u0253o wonii.',
    whatNext: 'Caggal nde neldu\u0257aa, Bambeh ma ndaara \u01b4amirgol maa. Kode maa ara caggal jaabagol tan.',
    noList: 'A yi\u0257ay no foti yim\u0253e winnditii e kode maa e \u01b4alde. A yi\u0257ataa inde walla limngal maa\u0253\u0253e.',
    name: 'Innde maa timmunde', phone: 'Limngal noddirgal', region: 'Diiwaan', town: 'Saare',
    note: 'Hol to nga\u0257ataa golle? Luumo, jannde, garewol',
    submit: 'Neldu \u01b4amirgol am', saving: 'Ko neldo\u2026', update: 'Waylu kabaruuji am',
    pending: '\u01b4amirgol ko e ndaaretee',
    pendingBody: 'Bambeh jogii \u01b4amirgol maa. Kode maa ma feen\u01b4o \u0257oo caggal jaabagol.',
    active: 'A wonii agent Bambeh gollo\u0257o',
    yourCode: 'Kode agent maa', copied: 'Natta\u0257o', copy: 'Nattu',
    signups: 'winnditii\u0253e', activated: 'artu\u0253e', today: 'hannde', week: 'yontere nde',
    unavailable: 'Limooje ngalaa jooni. Kode maa ina golla.',
    daily: '\u01b4alde e \u01b4alde', noDays: 'Hay huunde winnditaaka tawo.',
    back: 'Rutto', signIn: 'Naatu tawo, refti artu.',
    refresh: 'Hesnu',
    needName: 'Innde ko so\u01b4aa.', needPhone: 'Limngal ko so\u01b4aa.',
    needRegion: 'Su\u0253o diiwaan.', needTown: 'Saare ko so\u01b4aa.',
    failed: '\u0181um waawaa. E\u0257\u0257itto.',
  },
};

function pick(code: unknown): Dict {
  const c = String(code || 'en').toLowerCase();
  if (STR[c]) return STR[c];
  if (c === 'pidgin') return STR.pcm;
  if (c === 'ful' || c === 'fula' || c === 'fulfulde') return STR.ff;
  if (c.startsWith('fr')) return STR.fr;
  if (c.startsWith('ar')) return STR.ar;
  return STR.en;
}

interface Mine {
  signed_in: boolean; is_agent?: boolean; applied?: boolean; active?: boolean;
  code?: string | null; full_name?: string; phone?: string;
  region?: string; town?: string; note?: string | null;
  counts_available?: boolean;
  signups?: number | null; activated?: number | null;
  today?: number | null; this_week?: number | null;
}
interface Day { day: string; signups: number; activated: number }
interface Region { region_key: string; label: string }

class Boundary extends React.Component<
  { children: React.ReactNode; msg: string }, { dead: boolean }
> {
  constructor(p: { children: React.ReactNode; msg: string }) { super(p); this.state = { dead: false }; }
  static getDerivedStateFromError() { return { dead: true }; }
  componentDidCatch(e: unknown) { console.error('[AgentPage] suppressed:', e); }
  render() {
    if (this.state.dead) {
      return (
        <div className="mx-auto max-w-lg p-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {this.props.msg}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AgentPage() {
  const t = pick(useLang() as string);
  return <Boundary msg={t.failed}><Inner /></Boundary>;
}

function Inner() {
  const navigate = useNavigate();
  const lang = useLang() as string;
  const t = pick(lang);
  const rtl = String(lang || '').toLowerCase().startsWith('ar');

  const [loading, setLoad] = useState(true);
  const [busy, setBusy]    = useState(false);
  const [error, setError]  = useState<string | null>(null);
  const [mine, setMine]    = useState<Mine | null>(null);
  const [days, setDays]    = useState<Day[]>([]);
  const [regions, setReg]  = useState<Region[]>([]);
  const [copied, setCopied] = useState(false);

  const [name, setName]     = useState('');
  const [phone, setPhone]   = useState('');
  const [region, setRegion] = useState('');
  const [town, setTown]     = useState('');
  const [note, setNote]     = useState('');

  const load = useCallback(async () => {
    setLoad(true);
    setError(null);
    try {
      const [m, r] = await Promise.all([
        supabase.rpc('bambeh_my_agent'),
        supabase.rpc('bambeh_known_regions'),
      ]);
      if (!r.error) setReg((r.data || []) as Region[]);
      if (m.error) throw m.error;
      const d = m.data as Mine;
      setMine(d);
      if (d?.applied) {
        setName(d.full_name || '');
        setPhone(d.phone || '');
        setRegion(d.region || '');
        setTown(d.town || '');
        setNote(d.note || '');
      }
      if (d?.is_agent && d?.active) {
        const dd = await supabase.rpc('bambeh_my_agent_daily', { p_days: 14 });
        if (!dd.error) setDays((dd.data || []) as Day[]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.failed);
    } finally {
      setLoad(false);
    }
  }, [t.failed]);

  useEffect(() => { void load(); }, [load]);

  const apply = async () => {
    if (!name.trim())   { setError(t.needName);   return; }
    if (!phone.trim())  { setError(t.needPhone);  return; }
    if (!region.trim()) { setError(t.needRegion); return; }
    if (!town.trim())   { setError(t.needTown);   return; }
    setBusy(true);
    setError(null);
    try {
      const { data, error: e } = await supabase.rpc('bambeh_agent_apply', {
        p_full_name: name.trim(), p_phone: phone.trim(),
        p_region: region.trim(), p_town: town.trim(),
        p_note: note.trim() || null,
      });
      if (e) throw e;
      const res = data as { ok?: boolean };
      if (!res?.ok) { setError(t.failed); return; }
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.failed);
    } finally { setBusy(false); }
  };

  const copyCode = async () => {
    if (!mine?.code) return;
    try {
      await navigator.clipboard.writeText(mine.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(t.failed);
    }
  };

  // a dash, never a zero, when the server could not answer
  const num = (v: number | null | undefined) =>
    mine?.counts_available && v !== null && v !== undefined ? String(v) : '\u2014';

  if (loading) {
    return <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" /></div>;
  }

  if (mine && !mine.signed_in) {
    return (
      <div className="mx-auto max-w-lg p-6" dir={rtl ? 'rtl' : 'ltr'}>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">{t.signIn}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5" dir={rtl ? 'rtl' : 'ltr'}>
      <button type="button" onClick={() => navigate(-1)}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </button>

      <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
      <p className="mt-1 text-sm text-gray-600">{t.lead}</p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------- active agent */}
      {mine?.is_agent && mine?.active && (
        <>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="font-bold text-emerald-900">{t.active}</p>
            </div>
            <p className="mt-2 text-xs font-semibold text-emerald-800">{t.yourCode}</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="rounded-lg bg-white px-3 py-2 text-lg font-black tracking-wider text-gray-900 ring-1 ring-emerald-200">
                {mine.code}
              </code>
              <button type="button" onClick={() => void copyCode()}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                {copied ? t.copied : t.copy}
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[[num(mine.signups), t.signups], [num(mine.activated), t.activated],
              [num(mine.today), t.today], [num(mine.this_week), t.week]].map((c, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
                <p className="text-xl font-black text-gray-900">{c[0]}</p>
                <p className="text-[11px] text-gray-600">{c[1]}</p>
              </div>
            ))}
          </div>

          {!mine.counts_available && (
            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">{t.unavailable}</p>
          )}

          <p className="mt-3 px-1 text-xs text-gray-500">{t.noList}</p>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">{t.daily}</h2>
              <button type="button" onClick={() => void load()}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900">
                <RefreshCw className="h-3.5 w-3.5" /> {t.refresh}
              </button>
            </div>
            {days.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">{t.noDays}</p>
            ) : (
              <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {days.map((d: Day) => (
                  <div key={d.day} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-gray-700">{String(d.day).slice(0, 10)}</span>
                    <span className="font-semibold text-gray-900">
                      {d.signups} / {d.activated}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ------------------------------------------- applied, awaiting approval */}
      {mine?.applied && !mine?.active && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold text-amber-900">{t.pending}</p>
              <p className="mt-0.5 text-sm text-amber-800">{t.pendingBody}</p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------- the form */}
      {!mine?.active && (
        <>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <Shield className="mt-0.5 h-4 w-4 shrink-0" /><span>{t.whatNext}</span>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.name}</span>
              <input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.phone}</span>
              <input value={phone} inputMode="tel" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.region}</span>
              <select value={region} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegion(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500">
                <option value="">--</option>
                {regions.map((r: Region) => <option key={r.region_key} value={r.label}>{r.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.town}</span>
              <input value={town} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTown(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.note}</span>
              <input value={note} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
            </label>
            <button type="button" disabled={busy} onClick={() => void apply()}
              className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-teal-700 disabled:bg-gray-300">
              {busy ? t.saving : (mine?.applied ? t.update : t.submit)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__AGENTPAGE_FIX572__COMPLETE
