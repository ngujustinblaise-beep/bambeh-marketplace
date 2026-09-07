// BAMBEH_DEPLOY_TOKEN__SAFETYALERTS_FIX507_CLEAN
/**
 * src/pages/SafetyAlerts.tsx - Bambeh free services
 * FILE LOCATION: src/pages/SafetyAlerts.tsx
 *
 * FIX507 - SAFETY ALERTS.
 * ------------------------------------------------------------------
 * The point, in Big\u2019s words: so anyone planning to go to that spot knows the
 * danger. Everything here follows from that one sentence.
 *
 * NOTHING BLINKS FOREVER. Every incident carries an expiry set by its kind -
 * fire and accidents 3 hours, robbery 3, gunshots and thieves 6, floods 12.
 * Anyone confirming it is still happening pushes that forward. A red triangle
 * nobody can clear would make Bambeh the app that calls a quarter dangerous
 * when it is not, and that mistake is worse than showing nothing.
 *
 * ONE WORD, ONE COLOUR. Red and blinking means unsafe now; green means it is
 * over. The word beside it is one word - fire, flood - because somebody
 * reading this may be frightened, on a small screen, in a hurry.
 *
 * WE NEVER SAY IT IS TRUE. Every card carries how many people reported it and
 * how long ago. Bambeh was not there.
 *
 * THE EMERGENCY NUMBERS ARE AT THE TOP, NOT THE BOTTOM. A person opening this
 * page during a fire needs 118 before they need our list. The ambulance line
 * is marked honestly: 119 is not consistently reliable in Cameroon, so the
 * page also points at Hospitals on duty, which carries real numbers that a
 * human answers.
 *
 * NO LOGIN TO READ. Reporting needs an account - that is what the rate limit
 * and the one-vote-per-person rule hang on.
 *
 * FIVE LANGUAGES, every non-ASCII character written as a \uXXXX escape, so the
 * file is pure ASCII on disk and no encoding pass can mangle it.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShieldAlert, AlertTriangle, ShieldCheck, Loader2, AlertCircle,
  RefreshCw, MapPin, Clock, Phone, Users, Info, X, Check, Plus, Stethoscope,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Kind = 'fire' | 'flood' | 'gunshots' | 'thieves' | 'robbery' | 'accident' | 'other';
const KINDS: Kind[] = ['fire', 'flood', 'gunshots', 'thieves', 'robbery', 'accident', 'other'];
type Vehicle = 'car' | 'motorbike' | 'train' | 'plane' | 'ship' | 'other';
const VEHICLES: Vehicle[] = ['car', 'motorbike', 'train', 'plane', 'ship', 'other'];

interface Incident {
  id: string; kind: Kind; accident_type: Vehicle | null;
  region: string; town: string; quarter: string | null; landmark: string | null;
  note: string | null; is_unsafe: boolean;
  started_at: string; expires_at: string; is_ended: boolean; ended_at: string | null;
  confirm_count: number; last_activity_at: string; mine: boolean;
}
interface TownRow { town: string; region: string }

const REGIONS = [
  'Adamaoua', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'North-West', 'South', 'South-West', 'West',
];

/** National short codes. Verified against several sources, not guessed.
 *  Never edit one of these without checking it again - a wrong number on this
 *  page is the most dangerous bug the app could carry. */
const EMERGENCY = [
  { key: 'police', num: '117' },
  { key: 'fire', num: '118' },
  { key: 'gendarmerie', num: '113' },
  { key: 'ambulance', num: '119' },
  { key: 'civil', num: '114' },
  { key: 'gbv', num: '1511' },
  { key: 'general', num: '112' },
  { key: 'power', num: '8010' },
];

const STR: Record<string, Record<string, string>> = {
  en: {
    title: 'Safety alerts', back: 'Back',
    sub: 'What people around you are reporting right now. Free, no sign-in to read.',
    emergency: 'Emergency numbers', callNow: 'Call',
    police: 'Police', fire: 'Fire brigade', gendarmerie: 'Gendarmerie',
    ambulance: 'Ambulance (SAMU)', civil: 'Civil protection',
    gbv: 'Violence & counselling', general: 'General emergency', power: 'Electricity',
    ambulanceNote: 'The ambulance line is not always answered. A hospital directly is often faster.',
    hospitals: 'Hospitals on duty',
    allTowns: 'Everywhere', report: 'Report an incident',
    kFire: 'fire', kFlood: 'flood', kGunshots: 'gunshots', kThieves: 'thieves',
    kRobbery: 'robbery', kAccident: 'accident', kOther: 'incident',
    vcar: 'car', vmotorbike: 'motorbike', vtrain: 'train', vplane: 'plane',
    vship: 'ship', vother: 'other',
    unsafe: 'UNSAFE NOW', over: 'OVER',
    stillThere: 'Still happening', itsOver: 'It is over',
    onePerson: '1 person reported this', people: 'people reported this',
    started: 'Started', justNow: 'just now', minsAgo: 'min ago', hoursAgo: 'h ago',
    none: 'Nothing reported right now.',
    noneHint: 'That is good news. If you see something, you can be the first to say so.',
    failed: 'Could not load alerts', failedBody: 'Check your connection and try again.',
    retry: 'Try again', signIn: 'Sign in to report',
    reportTitle: 'Report an incident', reportSub: 'Only report what you can see yourself, right now.',
    whatHappened: 'What is happening?', whatKind: 'What kind of accident?',
    region: 'Region', town: 'Town', quarter: 'Quarter or village',
    landmark: 'Nearest landmark', landmarkPh: 'Beside the market',
    note: 'Anything else?', notePh: 'Two shops burning, nobody hurt so far',
    send: 'Send alert', sending: 'Sending...', cancel: 'Cancel',
    thanks: 'Sent. People nearby can see it now.', ended: 'Marked as over. Thank you.',
    confirmed: 'Thank you. The alert stays up.',
    tooMany: 'That is a lot of reports in one hour. Try again later.',
    areaRequired: 'Region and town are needed.',
    failedSend: 'Could not send that. Try again.',
    disclaimer: 'These are reports from users, not from the police or any authority. Bambeh was not there and cannot confirm them. In a real emergency, call the numbers above first.',
  },
  fr: {
    title: 'Alertes s\u00e9curit\u00e9', back: 'Retour',
    sub: 'Ce que les gens autour de vous signalent en ce moment. Gratuit, sans compte.',
    emergency: 'Num\u00e9ros d\u2019urgence', callNow: 'Appeler',
    police: 'Police', fire: 'Sapeurs-pompiers', gendarmerie: 'Gendarmerie',
    ambulance: 'Ambulance (SAMU)', civil: 'Protection civile',
    gbv: 'Violences & \u00e9coute', general: 'Urgence g\u00e9n\u00e9rale', power: '\u00c9lectricit\u00e9',
    ambulanceNote: 'La ligne ambulance ne r\u00e9pond pas toujours. Un h\u00f4pital directement est souvent plus rapide.',
    hospitals: 'H\u00f4pitaux de garde',
    allTowns: 'Partout', report: 'Signaler un incident',
    kFire: 'incendie', kFlood: 'inondation', kGunshots: 'coups de feu', kThieves: 'voleurs',
    kRobbery: 'braquage', kAccident: 'accident', kOther: 'incident',
    vcar: 'voiture', vmotorbike: 'moto', vtrain: 'train', vplane: 'avion',
    vship: 'bateau', vother: 'autre',
    unsafe: 'DANGER MAINTENANT', over: 'TERMIN\u00c9',
    stillThere: 'Toujours en cours', itsOver: 'C\u2019est termin\u00e9',
    onePerson: '1 personne l\u2019a signal\u00e9', people: 'personnes l\u2019ont signal\u00e9',
    started: 'D\u00e9but', justNow: '\u00e0 l\u2019instant', minsAgo: 'min', hoursAgo: 'h',
    none: 'Rien de signal\u00e9 pour le moment.',
    noneHint: 'Bonne nouvelle. Si vous voyez quelque chose, soyez le premier \u00e0 le dire.',
    failed: 'Chargement impossible', failedBody: 'V\u00e9rifiez votre connexion et r\u00e9essayez.',
    retry: 'R\u00e9essayer', signIn: 'Connectez-vous pour signaler',
    reportTitle: 'Signaler un incident', reportSub: 'Ne signalez que ce que vous voyez vous-m\u00eame, maintenant.',
    whatHappened: 'Que se passe-t-il ?', whatKind: 'Quel type d\u2019accident ?',
    region: 'R\u00e9gion', town: 'Ville', quarter: 'Quartier ou village',
    landmark: 'Rep\u00e8re le plus proche', landmarkPh: '\u00c0 c\u00f4t\u00e9 du march\u00e9',
    note: 'Autre chose ?', notePh: 'Deux boutiques br\u00fblent, aucun bless\u00e9 pour l\u2019instant',
    send: 'Envoyer', sending: 'Envoi...', cancel: 'Annuler',
    thanks: 'Envoy\u00e9. Les gens autour le voient maintenant.', ended: 'Marqu\u00e9 comme termin\u00e9. Merci.',
    confirmed: 'Merci. L\u2019alerte reste affich\u00e9e.',
    tooMany: 'Beaucoup de signalements en une heure. R\u00e9essayez plus tard.',
    areaRequired: 'La r\u00e9gion et la ville sont obligatoires.',
    failedSend: 'Envoi impossible. R\u00e9essayez.',
    disclaimer: 'Ce sont des signalements d\u2019utilisateurs, pas de la police ni d\u2019une autorit\u00e9. Bambeh n\u2019\u00e9tait pas sur place et ne peut rien confirmer. En cas d\u2019urgence r\u00e9elle, appelez d\u2019abord les num\u00e9ros ci-dessus.',
  },
  pidgin: {
    title: 'Safety alert', back: 'Go back',
    sub: 'Wetin people for your side dey report now now. Free, you no need account.',
    emergency: 'Emergency number dem', callNow: 'Call',
    police: 'Police', fire: 'Fire service', gendarmerie: 'Gendarme',
    ambulance: 'Ambulance (SAMU)', civil: 'Civil protection',
    gbv: 'Violence & help', general: 'General emergency', power: 'Light',
    ambulanceNote: 'Ambulance line no dey always answer. Call hospital direct, e dey faster.',
    hospitals: 'Hospital wey dey on duty',
    allTowns: 'Everywhere', report: 'Report one incident',
    kFire: 'fire', kFlood: 'flood', kGunshots: 'gun shot', kThieves: 'thief man',
    kRobbery: 'robbery', kAccident: 'accident', kOther: 'incident',
    vcar: 'motor', vmotorbike: 'okada', vtrain: 'train', vplane: 'plane',
    vship: 'ship', vother: 'oda one',
    unsafe: 'DANGER NOW', over: 'E DON FINISH',
    stillThere: 'E still dey happen', itsOver: 'E don finish',
    onePerson: '1 person don report am', people: 'people don report am',
    started: 'E start', justNow: 'just now', minsAgo: 'min ago', hoursAgo: 'h ago',
    none: 'Nobody report anytin now.',
    noneHint: 'Na good news. If you see somtin, you fit be di first to talk.',
    failed: 'E no fit load', failedBody: 'Check your network make you try again.',
    retry: 'Try again', signIn: 'Enter account make you report',
    reportTitle: 'Report one incident', reportSub: 'Only report wetin you dey see yourself, now now.',
    whatHappened: 'Wetin dey happen?', whatKind: 'Which kind accident?',
    region: 'Region', town: 'Town', quarter: 'Quarter or village',
    landmark: 'Which place near am', landmarkPh: 'Near di market',
    note: 'Any oda tin?', notePh: 'Two shop dey burn, nobody hurt yet',
    send: 'Send am', sending: 'Dey send...', cancel: 'Leave am',
    thanks: 'E don send. People near dey see am now.', ended: 'We don mark say e don finish. Thank you.',
    confirmed: 'Thank you. Di alert go stay.',
    tooMany: 'Na plenty report for one hour. Try later.',
    areaRequired: 'We need region and town.',
    failedSend: 'E no send. Try again.',
    disclaimer: 'Na people talk dis one, no be police or govment. Bambeh no dey der, we no fit confirm. If na real emergency, call di number dem for up first.',
  },
  ar: {
    title: '\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0633\u0644\u0627\u0645\u0629', back: '\u0631\u062c\u0648\u0639',
    sub: '\u0645\u0627 \u064a\u0628\u0644\u063a \u0639\u0646\u0647 \u0627\u0644\u0646\u0627\u0633 \u062d\u0648\u0644\u0643 \u0627\u0644\u0622\u0646. \u0645\u062c\u0627\u0646\u064a\u060c \u062f\u0648\u0646 \u062a\u0633\u062c\u064a\u0644.',
    emergency: '\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0637\u0648\u0627\u0631\u0626', callNow: '\u0627\u062a\u0635\u0644',
    police: '\u0627\u0644\u0634\u0631\u0637\u0629', fire: '\u0627\u0644\u0625\u0637\u0641\u0627\u0621', gendarmerie: '\u0627\u0644\u062f\u0631\u0643',
    ambulance: '\u0627\u0644\u0625\u0633\u0639\u0627\u0641', civil: '\u0627\u0644\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0645\u062f\u0646\u064a\u0629',
    gbv: '\u0627\u0644\u0639\u0646\u0641 \u0648\u0627\u0644\u062f\u0639\u0645', general: '\u0637\u0648\u0627\u0631\u0626 \u0639\u0627\u0645\u0629', power: '\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621',
    ambulanceNote: '\u062e\u0637 \u0627\u0644\u0625\u0633\u0639\u0627\u0641 \u0644\u0627 \u064a\u064f\u062c\u0627\u0628 \u062f\u0627\u0626\u0645\u0627. \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0645\u0633\u062a\u0634\u0641\u0649 \u0645\u0628\u0627\u0634\u0631\u0629 \u0623\u0633\u0631\u0639 \u063a\u0627\u0644\u0628\u0627.',
    hospitals: '\u0645\u0633\u062a\u0634\u0641\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629',
    allTowns: '\u0643\u0644 \u0627\u0644\u0645\u062f\u0646', report: '\u0623\u0628\u0644\u063a \u0639\u0646 \u062d\u0627\u062f\u062b',
    kFire: '\u062d\u0631\u064a\u0642', kFlood: '\u0641\u064a\u0636\u0627\u0646', kGunshots: '\u0625\u0637\u0644\u0627\u0642 \u0646\u0627\u0631', kThieves: '\u0644\u0635\u0648\u0635',
    kRobbery: '\u0633\u0637\u0648', kAccident: '\u062d\u0627\u062f\u062b', kOther: '\u062d\u0627\u062f\u062b\u0629',
    vcar: '\u0633\u064a\u0627\u0631\u0629', vmotorbike: '\u062f\u0631\u0627\u062c\u0629', vtrain: '\u0642\u0637\u0627\u0631', vplane: '\u0637\u0627\u0626\u0631\u0629',
    vship: '\u0633\u0641\u064a\u0646\u0629', vother: '\u0623\u062e\u0631\u0649',
    unsafe: '\u062e\u0637\u0631 \u0627\u0644\u0622\u0646', over: '\u0627\u0646\u062a\u0647\u0649',
    stillThere: '\u0645\u0627 \u0632\u0627\u0644 \u0645\u0633\u062a\u0645\u0631\u0627', itsOver: '\u0627\u0646\u062a\u0647\u0649',
    onePerson: '\u0634\u062e\u0635 \u0648\u0627\u062d\u062f \u0623\u0628\u0644\u063a', people: '\u0623\u0634\u062e\u0627\u0635 \u0623\u0628\u0644\u063a\u0648\u0627',
    started: '\u0628\u062f\u0623', justNow: '\u0627\u0644\u0622\u0646', minsAgo: '\u062f\u0642\u064a\u0642\u0629', hoursAgo: '\u0633\u0627\u0639\u0629',
    none: '\u0644\u0627 \u0634\u064a\u0621 \u0645\u0628\u0644\u063a \u0639\u0646\u0647 \u0627\u0644\u0622\u0646.',
    noneHint: '\u0647\u0630\u0627 \u062e\u0628\u0631 \u062c\u064a\u062f. \u0625\u0630\u0627 \u0631\u0623\u064a\u062a \u0634\u064a\u0626\u0627\u060c \u0643\u0646 \u0623\u0648\u0644 \u0645\u0646 \u064a\u0628\u0644\u063a.',
    failed: '\u062a\u0639\u0630\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644', failedBody: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u062b\u0645 \u0623\u0639\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629.',
    retry: '\u0623\u0639\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629', signIn: '\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u0625\u0628\u0644\u0627\u063a',
    reportTitle: '\u0623\u0628\u0644\u063a \u0639\u0646 \u062d\u0627\u062f\u062b', reportSub: '\u0623\u0628\u0644\u063a \u0641\u0642\u0637 \u0639\u0645\u0627 \u062a\u0631\u0627\u0647 \u0628\u0646\u0641\u0633\u0643 \u0627\u0644\u0622\u0646.',
    whatHappened: '\u0645\u0627\u0630\u0627 \u064a\u062d\u062f\u062b\u061f', whatKind: '\u0623\u064a \u0646\u0648\u0639 \u0645\u0646 \u0627\u0644\u062d\u0648\u0627\u062f\u062b\u061f',
    region: '\u0627\u0644\u062c\u0647\u0629', town: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629', quarter: '\u0627\u0644\u062d\u064a \u0623\u0648 \u0627\u0644\u0642\u0631\u064a\u0629',
    landmark: '\u0623\u0642\u0631\u0628 \u0639\u0644\u0627\u0645\u0629', landmarkPh: '\u0628\u062c\u0627\u0646\u0628 \u0627\u0644\u0633\u0648\u0642',
    note: '\u0634\u064a\u0621 \u0622\u062e\u0631\u061f', notePh: '\u0645\u062d\u0644\u0627\u0646 \u064a\u062d\u062a\u0631\u0642\u0627\u0646\u060c \u0644\u0627 \u0645\u0635\u0627\u0628\u064a\u0646 \u062d\u062a\u0649 \u0627\u0644\u0622\u0646',
    send: '\u0625\u0631\u0633\u0627\u0644', sending: '\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...', cancel: '\u0625\u0644\u063a\u0627\u0621',
    thanks: '\u062a\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644. \u0627\u0644\u0646\u0627\u0633 \u0642\u0631\u064a\u0628\u0627 \u064a\u0631\u0648\u0646\u0647 \u0627\u0644\u0622\u0646.', ended: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621. \u0634\u0643\u0631\u0627.',
    confirmed: '\u0634\u0643\u0631\u0627. \u064a\u0628\u0642\u0649 \u0627\u0644\u062a\u0646\u0628\u064a\u0647 \u0638\u0627\u0647\u0631\u0627.',
    tooMany: '\u0628\u0644\u0627\u063a\u0627\u062a \u0643\u062b\u064a\u0631\u0629 \u0641\u064a \u0633\u0627\u0639\u0629. \u062d\u0627\u0648\u0644 \u0644\u0627\u062d\u0642\u0627.',
    areaRequired: '\u0627\u0644\u062c\u0647\u0629 \u0648\u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0645\u0637\u0644\u0648\u0628\u062a\u0627\u0646.',
    failedSend: '\u062a\u0639\u0630\u0631 \u0627\u0644\u0625\u0631\u0633\u0627\u0644. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627.',
    disclaimer: '\u0647\u0630\u0647 \u0628\u0644\u0627\u063a\u0627\u062a \u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646\u060c \u0644\u064a\u0633\u062a \u0645\u0646 \u0627\u0644\u0634\u0631\u0637\u0629 \u0623\u0648 \u0623\u064a \u062c\u0647\u0629. \u0628\u0645\u0628\u0647 \u0644\u0645 \u062a\u0643\u0646 \u0647\u0646\u0627\u0643 \u0648\u0644\u0627 \u062a\u0633\u062a\u0637\u064a\u0639 \u062a\u0623\u0643\u064a\u062f\u0647\u0627. \u0641\u064a \u062d\u0627\u0644\u0629 \u0637\u0648\u0627\u0631\u0626 \u062d\u0642\u064a\u0642\u064a\u0629\u060c \u0627\u062a\u0635\u0644 \u0628\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0623\u0639\u0644\u0627\u0647 \u0623\u0648\u0644\u0627.',
  },
  ff: {
    title: 'Tintinooje kisal', back: 'Rutto',
    sub: 'Ko yim\u0253e \u0253e \u0253adii ma kaali jooni. Meere, a alaa haaje se\u014baade.',
    emergency: 'Limce he\u00f1oraa\u0257e', callNow: 'Noddu',
    police: 'Poliisi', fire: 'Yiite pompiyee', gendarmerie: 'Sa\u014bdarmeeri',
    ambulance: 'Ambilaas (SAMU)', civil: 'Ndeenka renndo',
    gbv: 'Bonannde e ballal', general: 'He\u00f1oraade kala', power: 'Yiite kuura',
    ambulanceNote: 'Laawol ambilaas jaabotaako sahaa kala. Noddude opitaal e hoore mum ina \u0253uri yaawde.',
    hospitals: 'Opitaaluuji e ndeenka',
    allTowns: 'Nokkuuje fof', report: 'Habru ko wa\u0257i',
    kFire: 'yiite', kFlood: 'ilam', kGunshots: 'fetel', kThieves: 'wuyo\u0253e',
    kRobbery: 'nguyka', kAccident: 'aksidaa', kOther: 'ko wa\u0257i',
    vcar: 'oto', vmotorbike: 'moto', vtrain: 'tere\u014b', vplane: 'awiyo\u014b',
    vship: 'laana', vother: 'go\u0257\u0257o',
    unsafe: 'BONE JOONI', over: 'GASII',
    stillThere: 'Ina jokki', itsOver: 'Gasii',
    onePerson: 'ne\u0257\u0257o gooto habri', people: 'yim\u0253e habri',
    started: 'Fu\u0257\u0257i', justNow: 'jooni jooni', minsAgo: 'hoj.', hoursAgo: 'wakt.',
    none: 'Hay huunde habraaka jooni.',
    noneHint: 'Ko kabaaru mo\u01b4\u01b4o. So a yi\u0257ii huunde, aan woni gadano habroowo.',
    failed: 'Ro\u014bkii loowde', failedBody: '\u01b4eewto ce\u014bgal maa ndaarndo-\u0257aa kadi.',
    retry: 'Ndaarndo kadi', signIn: 'Se\u014bo ngam habrude',
    reportTitle: 'Habru ko wa\u0257i', reportSub: 'Habru tan ko yi\u0257\u0257aa e hoore maa jooni.',
    whatHappened: 'Hol ko wa\u0257i?', whatKind: 'Hol sifaa aksidaa?',
    region: 'Diiwaan', town: 'Saare', quarter: 'Leydi maa wuro',
    landmark: 'Ko \u0253adii \u0257oon', landmarkPh: 'Takko luumo',
    note: 'Hino woodi ko heddii?', notePh: 'Butik \u0257i\u0257i ina sumee, hay gooto barmaaki tawo',
    send: 'Neldu', sending: 'Ina nelda...', cancel: 'Haaytu',
    thanks: 'Neldaama. Yim\u0253e \u0253adii\u0253e ina njiya jooni.', ended: 'Winndaama ko gasii. A jaaraama.',
    confirmed: 'A jaaraama. Tintinoore nde ina heddoo.',
    tooMany: 'Habrooje \u0257uu\u0257\u0257e e waktu gooto. Ndaarndo caggal.',
    areaRequired: 'Diiwaan e saare ina naamnaa.',
    failedSend: 'Ro\u014bkii neldude. Ndaarndo kadi.',
    disclaimer: '\u0189i\u0257oo ko habrooje yim\u0253e, wanaa poliisi maa laamu. Bambeh wonaano \u0257oon, ro\u014bkii tabitinde \u0257e. So ko he\u00f1oraade goonga, noddu limce dow \u0257oo tawo.',
  },
};
const tr = (l: string, k: string) => (STR[l] && STR[l][k]) || STR.en[k] || k;

const TOWN_KEY = 'bambeh:safety:town';
const SEEN_KEY = 'bambeh:safety:seen';

const KIND_KEY: Record<Kind, string> = {
  fire: 'kFire', flood: 'kFlood', gunshots: 'kGunshots', thieves: 'kThieves',
  robbery: 'kRobbery', accident: 'kAccident', other: 'kOther',
};

function ago(iso: string, lang: string): string {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 2) return tr(lang, 'justNow');
  if (m < 60) return m + ' ' + tr(lang, 'minsAgo');
  return Math.round(m / 60) + ' ' + tr(lang, 'hoursAgo');
}

export default function SafetyAlerts() {
  const navigate = useNavigate();
  const raw: unknown = useLang();
  const lang = typeof raw === 'string' ? raw : 'en';
  const isRtl = lang === 'ar';
  const t = (k: string) => tr(lang, k);

  const [towns, setTowns] = useState<TownRow[]>([]);
  const [town, setTown] = useState<string>(() => {
    try { return window.localStorage.getItem(TOWN_KEY) ?? ''; } catch { return ''; }
  });
  const [rows, setRows] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [quarters, setQuarters] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<{
    kind: Kind; accident_type: Vehicle; region: string; town: string;
    quarter: string; landmark: string; note: string;
  } | null>(null);

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
      const { data, error } = await supabase.rpc('safety_towns');
      if (!error) setTowns((data ?? []) as TownRow[]);
    } catch { /* the picker is a convenience */ }
  }, []);

  const loadQuarters = useCallback(async (forTown: string) => {
    try {
      const { data, error } = await supabase.rpc('area_quarters', { p_town: forTown || null });
      if (!error) setQuarters(((data ?? []) as Array<{ quarter: string }>).map((r) => r.quarter).filter(Boolean));
    } catch { /* suggestions only */ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('safety_active', { p_town: town || null });
      if (error) throw error;
      setRows((data ?? []) as Incident[]);
      setFailed(false);
      try { window.localStorage.setItem(SEEN_KEY, new Date().toISOString()); } catch { /* private mode */ }
    } catch {
      // A failure must NEVER render as "nothing is happening".
      setFailed(true);
    } finally { setLoading(false); }
  }, [town]);

  useEffect(() => { loadTowns(); }, [loadTowns]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadQuarters(town); }, [town, loadQuarters]);

  // An alert page that is minutes stale is a lie. Refresh quietly while open.
  useEffect(() => {
    const id = window.setInterval(() => { void load(); }, 90000);
    return () => window.clearInterval(id);
  }, [load]);

  const chooseTown = (v: string) => {
    setTown(v);
    try { v ? window.localStorage.setItem(TOWN_KEY, v) : window.localStorage.removeItem(TOWN_KEY); }
    catch { /* private mode */ }
  };

  const errText = (e: unknown): string => {
    const m = String((e as { message?: string })?.message ?? '');
    if (m.includes('BAMBEH_TOO_MANY_REPORTS')) return t('tooMany');
    if (m.includes('BAMBEH_AREA_REQUIRED')) return t('areaRequired');
    if (m.includes('BAMBEH_SIGN_IN_REQUIRED')) return t('signIn');
    return t('failedSend');
  };

  const confirmStill = async (o: Incident) => {
    if (!signedIn) { navigate('/login'); return; }
    setBusy(o.id);
    try {
      const { error } = await supabase.rpc('confirm_safety_incident', { p_id: o.id });
      if (error) throw error;
      flash(t('confirmed'));
      await load();
    } catch (e) { flash(errText(e)); } finally { setBusy(null); }
  };

  const endIt = async (o: Incident) => {
    setBusy(o.id);
    try {
      const { error } = await supabase.rpc('end_safety_incident', { p_id: o.id, p_reason: null });
      if (error) throw error;
      flash(t('ended'));
      await load();
    } catch (e) { flash(errText(e)); } finally { setBusy(null); }
  };

  const submit = async () => {
    if (!form) return;
    if (!form.region.trim() || !form.town.trim()) { flash(t('areaRequired')); return; }
    setSending(true);
    try {
      const { error } = await supabase.rpc('report_safety_incident', {
        p_kind: form.kind,
        p_accident_type: form.kind === 'accident' ? form.accident_type : null,
        p_region: form.region.trim(), p_town: form.town.trim(),
        p_quarter: form.quarter.trim() || null,
        p_landmark: form.landmark.trim() || null,
        p_note: form.note.trim() || null,
      });
      if (error) throw error;
      setForm(null);
      flash(t('thanks'));
      chooseTown(form.town.trim());
      await loadTowns();
      await load();
    } catch (e) { flash(errText(e)); } finally { setSending(false); }
  };

  const INPUT = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
  const CHIP = 'rounded-xl py-2 px-3 text-sm font-semibold border transition-colors';

  return (
    <div className="min-h-screen bg-gray-50 pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white px-4 pt-4 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white mb-3">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t('back')}
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-6 h-6" /> {t('title')}
        </h1>
        <p className="text-sm text-white/85 mt-1">{t('sub')}</p>
      </div>

      {/* The numbers come FIRST. Somebody opening this during a fire needs 118
          before they need our list. */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <p className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-red-600" /> {t('emergency')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EMERGENCY.map((e) => (
              <a key={e.key} href={`tel:${e.num}`} dir="ltr"
                className="flex items-center justify-between gap-2 border border-gray-200 hover:bg-red-50 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-gray-700 truncate">{t(e.key)}</span>
                <span className="text-base font-black text-red-600">{e.num}</span>
              </a>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">{t('ambulanceNote')}</p>
          <Link to="/hospitals"
            className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl">
            <Stethoscope className="w-3.5 h-3.5" /> {t('hospitals')}
          </Link>
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-3">
          <select value={town} onChange={(e) => chooseTown(e.target.value)} className={INPUT}>
            <option value="">{t('allTowns')}</option>
            {towns.map((x) => <option key={x.town} value={x.town}>{x.town}</option>)}
          </select>
          <button
            onClick={() => {
              if (!signedIn) { navigate('/login'); return; }
              const known = towns.find((x) => x.town.toLowerCase() === town.toLowerCase());
              setForm({
                kind: 'fire', accident_type: 'car', region: known?.region ?? '',
                town, quarter: '', landmark: '', note: '',
              });
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 rounded-xl">
            <Plus className="w-4 h-4" /> {signedIn ? t('report') : t('signIn')}
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10 text-red-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
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
            <ShieldCheck className="w-10 h-10 text-emerald-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">{t('none')}</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">{t('noneHint')}</p>
          </div>
        ) : rows.map((o) => (
          <article key={o.id}
            className={`bg-white rounded-xl border p-3 ${o.is_unsafe ? 'border-red-300' : 'border-emerald-200'}`}>
            <div className="flex items-start gap-3">
              <span className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                o.is_unsafe ? 'bg-red-50' : 'bg-emerald-50'}`}>
                {o.is_unsafe
                  ? <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                  : <ShieldCheck className="w-6 h-6 text-emerald-600" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black uppercase tracking-wide truncate">
                  <span className={o.is_unsafe ? 'text-red-700' : 'text-emerald-700'}>
                    {t(KIND_KEY[o.kind])}
                  </span>
                  {o.kind === 'accident' && o.accident_type ? (
                    <span className="text-gray-400 font-bold normal-case"> \u00b7 {t('v' + o.accident_type)}</span>
                  ) : null}
                </p>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {[o.landmark, o.quarter, o.town].filter(Boolean).join(', ')}
                </p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" /> {t('started')} {ago(o.started_at, lang)}
                </p>
                <p className={`text-xs font-bold mt-0.5 ${o.is_unsafe ? 'text-red-700' : 'text-emerald-700'}`}>
                  {o.is_unsafe ? t('unsafe') : t('over')}
                </p>
                {o.note ? <p className="text-xs text-gray-600 mt-1">{o.note}</p> : null}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
              <Users className="w-3.5 h-3.5 shrink-0 text-gray-300" />
              {Number(o.confirm_count) === 1 ? t('onePerson') : `${o.confirm_count} ${t('people')}`}
              <span className="text-gray-400">\u00b7 {ago(o.last_activity_at, lang)}</span>
            </div>

            {o.is_unsafe ? (
              <div className="flex gap-2 mt-3">
                <button onClick={() => confirmStill(o)} disabled={busy === o.id}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-red-800 bg-red-50 hover:bg-red-100 py-2 rounded-xl disabled:opacity-50">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t('stillThere')}
                </button>
                {o.mine ? (
                  <button onClick={() => endIt(o)} disabled={busy === o.id}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-xl disabled:opacity-50">
                    <Check className="w-3.5 h-3.5" /> {t('itsOver')}
                  </button>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}

        <p className="text-[11px] text-gray-400 flex items-start gap-1.5 pt-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {t('disclaimer')}
        </p>
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => !sending && setForm(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{t('reportTitle')}</h3>
              <button onClick={() => !sending && setForm(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">{t('reportSub')}</p>

            <p className="text-xs font-semibold text-gray-600">{t('whatHappened')}</p>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button key={k} onClick={() => setForm({ ...form, kind: k })}
                  className={`${CHIP} uppercase ${form.kind === k
                    ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {t(KIND_KEY[k])}
                </button>
              ))}
            </div>

            {form.kind === 'accident' ? (
              <>
                <p className="text-xs font-semibold text-gray-600">{t('whatKind')}</p>
                <div className="flex flex-wrap gap-2">
                  {VEHICLES.map((v) => (
                    <button key={v} onClick={() => setForm({ ...form, accident_type: v })}
                      className={`${CHIP} ${form.accident_type === v
                        ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {t('v' + v)}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={INPUT}>
              <option value="">{t('region')}</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input value={form.town}
              onChange={(e) => { setForm({ ...form, town: e.target.value }); loadQuarters(e.target.value); }}
              placeholder={t('town')} className={INPUT} />
            <input value={form.quarter} onChange={(e) => setForm({ ...form, quarter: e.target.value })}
              list="bambeh-safety-quarters" placeholder={t('quarter')} className={INPUT} />
            <datalist id="bambeh-safety-quarters">
              {quarters.map((q) => <option key={q} value={q} />)}
            </datalist>
            <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              placeholder={t('landmarkPh')} className={INPUT} />
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2} placeholder={t('notePh')} className={INPUT} />

            <div className="flex gap-2 pt-1">
              <button onClick={() => setForm(null)} disabled={sending}
                className="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl disabled:opacity-50">
                {t('cancel')}
              </button>
              <button onClick={submit} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 py-2.5 rounded-xl disabled:opacity-50">
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
// BAMBEH_END_TOKEN__SAFETYALERTS_FIX507__COMPLETE
