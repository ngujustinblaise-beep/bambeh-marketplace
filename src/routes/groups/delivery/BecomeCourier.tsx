// BAMBEH_DEPLOY_TOKEN__BECOMECOURIER_FIX565_CLEAN
/**
 * src/routes/groups/delivery/BecomeCourier.tsx - Bambeh Marketplace
 *
 * FIX565 - DELIVERY STAGE 2: how a rider gets into the registry.
 *
 * Without this page the admin section FIX563 built has nothing to show.
 * A rider fills this in, an admin meets them, checks the card and the
 * vehicle, and ticks two boxes. That is the whole onboarding.
 *
 * Talks to the functions FIX556 installed:
 *   bambeh_vehicle_types()          the nine vehicle kinds
 *   bambeh_known_regions()          the ten Cameroonian regions
 *   bambeh_my_courier()             my own application, if any
 *   bambeh_courier_apply(...)       apply, or correct my details
 *   bambeh_courier_set_available()  go on or off duty, verified only
 *
 * IT TELLS THE TRUTH ABOUT WHAT HAPPENS NEXT
 *   Not "application submitted, we'll be in touch". It says plainly that
 *   somebody from Bambeh will meet them in person to see the ID card and
 *   the vehicle, because that is what has to happen and a rider who expects
 *   an instant badge will give up when it does not arrive.
 *
 * IT SAYS BAMBEH DOES NOT KEEP THE ID NUMBER
 *   A stranger asking a Cameroonian for their national ID has to explain
 *   themselves. FIX556 stores no ID number at all, so the page can say that
 *   honestly, and it should.
 *
 * FIVE LANGUAGES, ASCII-ESCAPED
 *   User-facing, so English, French, Pidgin, Arabic and Fulfulde. Every
 *   non-ASCII character is a \\u escape so no encoding change can turn this
 *   into question marks the way it did to Logo.tsx.
 *
 * ITS OWN ERROR BOUNDARY
 *   A new page must never be able to take the app down. If anything inside
 *   throws, the boundary shows a plain message instead of the white screen.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, CheckCircle, Clock, Shield, ArrowLeft, Power,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Dict = {
  title: string; lead: string; whatNext: string; noIdKept: string;
  name: string; phone: string; vehicle: string; plate: string; plateHint: string;
  region: string; town: string; quarters: string; quartersHint: string;
  submit: string; saving: string; update: string;
  pending: string; pendingBody: string;
  verified: string; verifiedBody: string;
  rejected: string; suspended: string; support: string;
  onDuty: string; offDuty: string; goOn: string; goOff: string;
  deliveries: string; back: string; signIn: string;
  needName: string; needPhone: string; needRegion: string; needTown: string;
  failed: string;
};

const STR: Record<string, Dict> = {
  en: {
    title: 'Deliver for Bambeh',
    lead: 'Carry orders for buyers and sellers in your town. Motorbike, tricycle, car, van or on foot.',
    whatNext: 'After you send this, somebody from Bambeh will arrange to meet you in person to see your national ID card and your vehicle. The badge only goes on after that meeting.',
    noIdKept: 'Bambeh does not store your ID number. We look at the card with you present, then tick a box. The number is never typed in anywhere.',
    name: 'Your full name, as written on your ID',
    phone: 'Phone number', vehicle: 'What do you carry with?',
    plate: 'Plate number', plateHint: 'Leave empty if you carry on foot or by bicycle',
    region: 'Region', town: 'Town',
    quarters: 'Quarters you cover', quartersHint: 'For example: Bastos, Nlongkak, Mvan',
    submit: 'Send my application', saving: 'Sending\u2026', update: 'Update my details',
    pending: 'Waiting to be verified',
    pendingBody: 'Your application is with Bambeh. Somebody will contact you on the number above to arrange the meeting.',
    verified: 'You are a verified Bambeh courier',
    verifiedBody: 'Go on duty when you are free to carry orders. Go off duty when you are not.',
    rejected: 'Your application was not accepted',
    suspended: 'Your courier account is suspended',
    support: 'Speak to Bambeh support for the reason and what to do next.',
    onDuty: 'On duty', offDuty: 'Off duty',
    goOn: 'Go on duty', goOff: 'Go off duty',
    deliveries: 'deliveries done', back: 'Back',
    signIn: 'Sign in first, then come back to this page.',
    needName: 'Your full name is required.', needPhone: 'A phone number is required.',
    needRegion: 'Choose your region.', needTown: 'Your town is required.',
    failed: 'That did not go through. Please try again.',
  },
  fr: {
    title: 'Livrer pour Bambeh',
    lead: 'Transportez les commandes des acheteurs et vendeurs de votre ville. Moto, tricycle, voiture, camionnette ou \u00e0 pied.',
    whatNext: 'Apr\u00e8s l\u2019envoi, quelqu\u2019un de Bambeh prendra rendez-vous pour vous rencontrer en personne et voir votre carte nationale d\u2019identit\u00e9 et votre v\u00e9hicule. Le badge n\u2019est accord\u00e9 qu\u2019apr\u00e8s cette rencontre.',
    noIdKept: 'Bambeh n\u2019enregistre pas votre num\u00e9ro de CNI. Nous regardons la carte en votre pr\u00e9sence, puis nous cochons une case. Le num\u00e9ro n\u2019est saisi nulle part.',
    name: 'Votre nom complet, tel qu\u2019\u00e9crit sur la CNI',
    phone: 'Num\u00e9ro de t\u00e9l\u00e9phone', vehicle: 'Avec quoi transportez-vous\u00a0?',
    plate: 'Num\u00e9ro de plaque', plateHint: 'Laissez vide si vous allez \u00e0 pied ou \u00e0 v\u00e9lo',
    region: 'R\u00e9gion', town: 'Ville',
    quarters: 'Quartiers que vous couvrez', quartersHint: 'Par exemple\u00a0: Bastos, Nlongkak, Mvan',
    submit: 'Envoyer ma candidature', saving: 'Envoi\u2026', update: 'Mettre \u00e0 jour mes informations',
    pending: 'En attente de v\u00e9rification',
    pendingBody: 'Votre candidature est chez Bambeh. Quelqu\u2019un vous appellera au num\u00e9ro ci-dessus pour fixer le rendez-vous.',
    verified: 'Vous \u00eates un livreur Bambeh v\u00e9rifi\u00e9',
    verifiedBody: 'Passez en service quand vous \u00eates libre de transporter. Sortez du service sinon.',
    rejected: 'Votre candidature n\u2019a pas \u00e9t\u00e9 accept\u00e9e',
    suspended: 'Votre compte livreur est suspendu',
    support: 'Contactez le support Bambeh pour conna\u00eetre la raison et la suite.',
    onDuty: 'En service', offDuty: 'Hors service',
    goOn: 'Passer en service', goOff: 'Sortir du service',
    deliveries: 'livraisons effectu\u00e9es', back: 'Retour',
    signIn: 'Connectez-vous d\u2019abord, puis revenez sur cette page.',
    needName: 'Votre nom complet est requis.', needPhone: 'Un num\u00e9ro de t\u00e9l\u00e9phone est requis.',
    needRegion: 'Choisissez votre r\u00e9gion.', needTown: 'Votre ville est requise.',
    failed: 'Cela n\u2019a pas abouti. Veuillez r\u00e9essayer.',
  },
  pcm: {
    title: 'Carry load for Bambeh',
    lead: 'Carry order for buyer and seller inside your town. Moto, tricycle, car, van or leg.',
    whatNext: 'After you send this, somebody from Bambeh go arrange to meet you face to face, to see your national ID card and your moto. The badge dey come only after that meeting.',
    noIdKept: 'Bambeh no dey keep your ID number. We look the card while you dey there, then we tick one box. Nobody dey type the number anywhere.',
    name: 'Your full name, as e write on your ID',
    phone: 'Phone number', vehicle: 'Wetin you dey carry with?',
    plate: 'Plate number', plateHint: 'Leave am empty if you dey waka or use bicycle',
    region: 'Region', town: 'Town',
    quarters: 'Quarters you dey cover', quartersHint: 'Like: Bastos, Nlongkak, Mvan',
    submit: 'Send my application', saving: 'We dey send\u2026', update: 'Change my details',
    pending: 'We dey wait to verify you',
    pendingBody: 'Your application don reach Bambeh. Somebody go call the number for up to arrange the meeting.',
    verified: 'You be verified Bambeh courier',
    verifiedBody: 'Go on duty when you free to carry. Go off duty when you no free.',
    rejected: 'Dem no accept your application',
    suspended: 'Your courier account don suspend',
    support: 'Talk to Bambeh support make you sabi the reason and wetin to do.',
    onDuty: 'On duty', offDuty: 'Off duty',
    goOn: 'Go on duty', goOff: 'Go off duty',
    deliveries: 'delivery you don do', back: 'Go back',
    signIn: 'Sign in first, then come back this page.',
    needName: 'We need your full name.', needPhone: 'We need phone number.',
    needRegion: 'Choose your region.', needTown: 'We need your town.',
    failed: 'E no work. Abeg try again.',
  },
  ar: {
    title: '\u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0645\u0639 \u0628\u0627\u0645\u0628\u064a\u0647',
    lead: '\u0627\u0646\u0642\u0644 \u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0644\u0644\u0645\u0634\u062a\u0631\u064a\u0646 \u0648\u0627\u0644\u0628\u0627\u0639\u0629 \u0641\u064a \u0645\u062f\u064a\u0646\u062a\u0643.',
    whatNext: '\u0628\u0639\u062f \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u060c \u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0623\u062d\u062f \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0644\u0642\u0627\u0626\u0643 \u0634\u062e\u0635\u064a\u0627\u064b \u0648\u0631\u0624\u064a\u0629 \u0628\u0637\u0627\u0642\u062a\u0643 \u0648\u0645\u0631\u0643\u0628\u062a\u0643.',
    noIdKept: '\u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0627 \u062a\u062d\u062a\u0641\u0638 \u0628\u0631\u0642\u0645 \u0628\u0637\u0627\u0642\u062a\u0643. \u0646\u0646\u0637\u0631 \u0625\u0644\u0649 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0628\u0648\u062c\u0648\u062f\u0643 \u0641\u0642\u0637.',
    name: '\u0627\u0633\u0645\u0643 \u0627\u0644\u0643\u0627\u0645\u0644 \u0643\u0645\u0627 \u0641\u064a \u0627\u0644\u0628\u0637\u0627\u0642\u0629',
    phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641', vehicle: '\u0628\u0645\u0627\u0630\u0627 \u062a\u0646\u0642\u0644\u061f',
    plate: '\u0631\u0642\u0645 \u0627\u0644\u0644\u0648\u062d\u0629', plateHint: '\u0627\u062a\u0631\u0643\u0647 \u0641\u0627\u0631\u063a\u0627\u064b \u0625\u0646 \u0643\u0646\u062a \u0633\u064a\u0631\u0627\u064b \u0623\u0648 \u0628\u062f\u0631\u0627\u062c\u0629',
    region: '\u0627\u0644\u062c\u0647\u0629', town: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629',
    quarters: '\u0627\u0644\u0623\u062d\u064a\u0627\u0621 \u0627\u0644\u062a\u064a \u062a\u063a\u0637\u064a\u0647\u0627', quartersHint: '\u0645\u062b\u0644\u0627\u064b: \u0628\u0627\u0633\u062a\u0648\u0633\u060c \u0645\u0641\u0627\u0646',
    submit: '\u0623\u0631\u0633\u0644 \u0637\u0644\u0628\u064a', saving: '\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u2026',
    update: '\u062a\u062d\u062f\u064a\u062b \u0628\u064a\u0627\u0646\u0627\u062a\u064a',
    pending: '\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u062a\u062d\u0642\u0642',
    pendingBody: '\u0637\u0644\u0628\u0643 \u0644\u062f\u0649 \u0628\u0627\u0645\u0628\u064a\u0647. \u0633\u064a\u062a\u0645 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0643 \u0639\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0623\u0639\u0644\u0627\u0647.',
    verified: '\u0623\u0646\u062a \u0645\u0648\u0635\u0651\u0644 \u0645\u0648\u062b\u0651\u0642 \u0644\u062f\u0649 \u0628\u0627\u0645\u0628\u064a\u0647',
    verifiedBody: '\u0627\u0628\u062f\u0623 \u0627\u0644\u0639\u0645\u0644 \u0639\u0646\u062f\u0645\u0627 \u062a\u0643\u0648\u0646 \u0645\u062a\u0627\u062d\u0627\u064b.',
    rejected: '\u0644\u0645 \u064a\u064f\u0642\u0628\u0644 \u0637\u0644\u0628\u0643',
    suspended: '\u062d\u0633\u0627\u0628\u0643 \u0645\u0648\u0642\u0648\u0641',
    support: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u062f\u0639\u0645 \u0628\u0627\u0645\u0628\u064a\u0647.',
    onDuty: '\u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629', offDuty: '\u062e\u0627\u0631\u062c \u0627\u0644\u062e\u062f\u0645\u0629',
    goOn: '\u0627\u0628\u062f\u0623 \u0627\u0644\u0639\u0645\u0644', goOff: '\u0623\u0648\u0642\u0641 \u0627\u0644\u0639\u0645\u0644',
    deliveries: '\u0639\u0645\u0644\u064a\u0627\u062a \u062a\u0648\u0635\u064a\u0644', back: '\u0631\u062c\u0648\u0639',
    signIn: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b.',
    needName: '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0637\u0644\u0648\u0628.',
    needPhone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0645\u0637\u0644\u0648\u0628.',
    needRegion: '\u0627\u062e\u062a\u0631 \u0627\u0644\u062c\u0647\u0629.', needTown: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0645\u0637\u0644\u0648\u0628\u0629.',
    failed: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0623\u0645\u0631. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.',
  },
  ff: {
    title: 'Rond\u0257u e Bambeh',
    lead: 'Rondu kaake soodoo\u0253e e soodooji e saare maa. Moto, tricycle, oto walla koy\u0257e.',
    whatNext: 'Caggal nde neldu\u0257aa \u0257um, goddo Bambeh ma yi\u0257a hawrude e maa\u0257a ngam yi\u0257de kaarda maa e otoolo maa. Alaama ara caggal \u0257um tan.',
    noIdKept: 'Bambeh reenataa limngal kaarda maa. Min ndaara kaarda nde a wonde \u0257oo, refti min mbi\u0257a box. Limngal winnditaaka nokku woo.',
    name: 'Innde maa timmunde, hono no winndaa e kaarda',
    phone: 'Limngal noddirgal', vehicle: 'E ko\u0257um mba\u0257ataa?',
    plate: 'Limngal plaake', plateHint: 'Accu meere so a yaha e koy\u0257e walla welo',
    region: 'Diiwaan', town: 'Saare',
    quarters: 'Nokkuuje nde ngarataa', quartersHint: 'Misal: Bastos, Nlongkak, Mvan',
    submit: 'Neldu \u01b4amirgol am', saving: 'Ko neldo\u2026', update: 'Waylu kabaruuji am',
    pending: 'Ko e habbaade goongi\u0257ingol',
    pendingBody: '\u01b4amirgol maa yottiima Bambeh. Goddo ma noddu e limngal dow \u0257oo.',
    verified: 'A wonii rondoowo Bambeh goongi\u0257in\u0257o',
    verifiedBody: 'Naatu e golle so a woodi sahaa. Yaltu so a alaa.',
    rejected: '\u01b4amirgol maa jaaba\u0257aaka',
    suspended: 'Konte maa rondoowo dartinaama',
    support: 'Haalu e ballal Bambeh ngam anndude sabaabu.',
    onDuty: 'E golle', offDuty: 'Alaa e golle',
    goOn: 'Naatu e golle', goOff: 'Yaltu e golle',
    deliveries: 'ronde\u0257e ga\u0257e', back: 'Rutto',
    signIn: 'Naatu tawo, refti artu \u0257oo.',
    needName: 'Innde timmunde ko so\u01b4aa.', needPhone: 'Limngal noddirgal ko so\u01b4aa.',
    needRegion: 'Su\u0253o diiwaan maa.', needTown: 'Saare maa ko so\u01b4aa.',
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

interface Vehicle { key: string; label: string; capacity: string }
interface Region { region_key: string; label: string }
interface Mine {
  signed_in: boolean; applied?: boolean; status?: string;
  full_name?: string; phone?: string; vehicle_type?: string;
  plate_number?: string | null; region?: string; town?: string;
  quarters?: string | null; is_available?: boolean;
  deliveries_done?: number; admin_notes?: string | null;
}

/** A new page must never white-screen the app. */
class Boundary extends React.Component<
  { children: React.ReactNode; msg: string },
  { dead: boolean }
> {
  constructor(p: { children: React.ReactNode; msg: string }) { super(p); this.state = { dead: false }; }
  static getDerivedStateFromError() { return { dead: true }; }
  componentDidCatch(e: unknown) { console.error('[BecomeCourier] suppressed:', e); }
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

export default function BecomeCourier() {
  const lang = useLang() as string;
  const t = pick(lang);
  return (
    <Boundary msg={t.failed}>
      <Inner />
    </Boundary>
  );
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
  const [vTypes, setV]     = useState<Vehicle[]>([]);
  const [regions, setReg]  = useState<Region[]>([]);

  const [name, setName]     = useState('');
  const [phone, setPhone]   = useState('');
  const [vehicle, setVeh]   = useState('moto');
  const [plate, setPlate]   = useState('');
  const [region, setRegion] = useState('');
  const [town, setTown]     = useState('');
  const [quarters, setQ]    = useState('');

  const load = useCallback(async () => {
    setLoad(true);
    setError(null);
    try {
      const [m, v, r] = await Promise.all([
        supabase.rpc('bambeh_my_courier'),
        supabase.rpc('bambeh_vehicle_types'),
        supabase.rpc('bambeh_known_regions'),
      ]);
      if (!v.error) setV((v.data || []) as Vehicle[]);
      if (!r.error) setReg((r.data || []) as Region[]);
      if (m.error) throw m.error;

      const d = m.data as Mine;
      setMine(d);
      if (d?.applied) {
        setName(d.full_name || '');
        setPhone(d.phone || '');
        setVeh(d.vehicle_type || 'moto');
        setPlate(d.plate_number || '');
        setRegion(d.region || '');
        setTown(d.town || '');
        setQ(d.quarters || '');
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
      const { data, error: e } = await supabase.rpc('bambeh_courier_apply', {
        p_full_name: name.trim(),
        p_phone: phone.trim(),
        p_vehicle_type: vehicle,
        p_region: region.trim(),
        p_town: town.trim(),
        p_quarters: quarters.trim() || null,
        p_plate_number: plate.trim() || null,
      });
      if (e) throw e;
      const res = data as { ok?: boolean; message?: string };
      if (!res?.ok) { setError(res?.message || t.failed); return; }
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.failed);
    } finally {
      setBusy(false);
    }
  };

  const setDuty = async (on: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const { error: e } = await supabase.rpc('bambeh_courier_set_available', { p_available: on });
      if (e) throw e;
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.failed);
    } finally {
      setBusy(false);
    }
  };

  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (mine && !mine.signed_in) {
    return (
      <div className="mx-auto max-w-lg p-6" dir={rtl ? 'rtl' : 'ltr'}>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          {t.signIn}
        </div>
      </div>
    );
  }

  const st = mine?.status;

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
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ---------------------------------------------- already decided */}
      {st === 'VERIFIED' && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="font-bold text-emerald-900">{t.verified}</p>
              <p className="mt-0.5 text-sm text-emerald-800">{t.verifiedBody}</p>
              <p className="mt-1 text-xs text-emerald-700">
                {mine?.deliveries_done ?? 0} {t.deliveries}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={'rounded-full px-2.5 py-1 text-xs font-bold ' +
              (mine?.is_available ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700')}>
              {mine?.is_available ? t.onDuty : t.offDuty}
            </span>
            <button type="button" disabled={busy} onClick={() => void setDuty(!mine?.is_available)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-sm font-bold text-white hover:bg-black disabled:bg-gray-300">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
              {mine?.is_available ? t.goOff : t.goOn}
            </button>
          </div>
        </div>
      )}

      {st === 'PENDING' && (
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

      {(st === 'REJECTED' || st === 'SUSPENDED') && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-bold text-red-900">{st === 'REJECTED' ? t.rejected : t.suspended}</p>
          <p className="mt-0.5 text-sm text-red-800">{t.support}</p>
          {mine?.admin_notes && <p className="mt-1 text-xs italic text-red-700">{mine.admin_notes}</p>}
        </div>
      )}

      {/* ---------------------------------------------- the honest bit */}
      {(st !== 'REJECTED' && st !== 'SUSPENDED') && (
        <>
          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <Shield className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t.whatNext}</span>
            </div>
            <p className="px-1 text-xs text-gray-500">{t.noIdKept}</p>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.name}</span>
              <input value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.phone}</span>
              <input value={phone} inputMode="tel"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.vehicle}</span>
              <select value={vehicle}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVeh(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500">
                {vTypes.map((v: Vehicle) => (
                  <option key={v.key} value={v.key}>{v.label} \u2014 {v.capacity}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.plate}</span>
              <input value={plate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
              <span className="mt-0.5 block text-[11px] text-gray-500">{t.plateHint}</span>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.region}</span>
              <select value={region}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegion(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500">
                <option value="">--</option>
                {regions.map((r: Region) => (
                  <option key={r.region_key} value={r.label}>{r.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.town}</span>
              <input value={town}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTown(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-gray-600">{t.quarters}</span>
              <input value={quarters}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
              <span className="mt-0.5 block text-[11px] text-gray-500">{t.quartersHint}</span>
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
// BAMBEH_END_TOKEN__BECOMECOURIER_FIX565__COMPLETE
