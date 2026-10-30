// BAMBEH_DEPLOY_TOKEN__AGENT_ASSIST_FIX933_CLEAN
/**
 * src/features/agents/AgentAssist.tsx - FIX933 (new) - on the agent page (/agent), for active agents only
 *
 * SIGN UP A CLIENT ON YOUR PHONE. Big, 29 Oct 2026: "How can we create an account for a client using vendors phone
 * and vendors code without stressing the user. The user can change his password once in the app ... a temporary
 * password ... the user lets them snap for users who don't want to share their phone with marketing agents".
 * Big's answer to the limits (29 Oct): "Yes, with those limits".
 *
 *   1. The agent types the client's name and number; the CLIENT reads the one box (Terms + data use, in the
 *      client's own language - five buttons) and ticks it themselves.
 *   2. The agent checks the number with the client. The account is made through a second, throwaway connection
 *      (assist.ts, FIX932): the agent's own session is never touched and nothing is kept on the phone.
 *   3. Bambeh makes a temporary password (bambeh_agent_assist_issue, FIX931). It is shown ONCE, here, with a QR
 *      code: the client scans it with their own phone (or photographs the screen) and chooses their own password
 *      at once. Unused, it stops working after 48 hours. The client must change it at the first sign-in anyway.
 *   4. Done hides it for good. Agents see counts only - never a list of names or numbers.
 * A cap per day per agent (30 to start; admins set it in Command Center > Marketing agents). Every account is
 * logged against the agent who made it, and credited to them like an ?agent= link.
 *
 * Renders nothing for anyone who is not an active agent, or before FIX931 runs.
 * Five languages; every non-ASCII character is a \u escape.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { qrSvg } from '@/lib/qrcode';
import { useLang } from '@/hooks/useAppLang';
import AfricanPhoneInput from '@/components/AfricanPhoneInput';
import { HOME, parsePhone, prettyPhone } from '@/lib/africa/countries';
import { useOpenCountries } from '@/lib/africa/useOpenCountries';
import { PUBLIC_APP_URL } from '@/config/storeMode';
import { CONSENT_COVERS, JOIN_LANGS, JOIN_TEXT, consentWords, makeUsername, normLang, problemOf } from '@/pages/auth/QuickJoin';
import { ASSIST_CONSENT_VERSION, assistSignUp, finishLink, makeSecret, maskedNumber } from './assist';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

/** What the agent reads (the app's language). */
interface AgentWords {
  title: string; lead: string; today: string; finished: string; start: string; clientLang: string;
  name: string; namePh: string; phone: string; tick: string; next: string; cancel: string;
  checkTitle: string; checkSub: string; yes: string; change: string; working: string;
  shownOnce: string; done: string; retry: string;
  errName: string; errPhone: string; errConsent: string; errExists: string; errCap: string; errOff: string;
  errRate: string; errNet: string; errHalf: string; errOld: string; errGeneric: string;
}
/** What the client reads (the language the client chose). */
interface ClientWords { ready: string; login: string; temp: string; exact: string; scan: string; later: string }

export const AGENT_WORDS: Record<Lang, AgentWords> = {
  en: {
    title: 'Sign up a client on your phone',
    lead: 'For a client who would rather not hand over their own phone: you make the account here, Bambeh makes a temporary password, and the client chooses their own password on their own phone.',
    today: 'Today: {used} of {cap}',
    finished: 'Finished by the client: {claimed} of {total}',
    start: 'Sign up a client',
    clientLang: "Client's language",
    name: "Client's name",
    namePh: 'e.g. Zerm Ngu',
    phone: "Client's phone number",
    tick: 'Let the client read this and tick the box themselves.',
    next: 'Next',
    cancel: 'Cancel',
    checkTitle: 'Check the number with the client',
    checkSub: 'This number becomes their login. Is it theirs?',
    yes: 'Yes, create the account',
    change: 'Change',
    working: 'Creating the account...',
    shownOnce: 'Bambeh never shows this password again. The client scans the code, or takes a photo of this screen.',
    done: 'Done - hide the password',
    retry: 'Try again',
    errName: "Write the client's name (at least 2 letters).",
    errPhone: "Write the client's phone number (a full, valid number).",
    errConsent: 'The client must tick the box.',
    errExists: 'This number already has a Bambeh account. The client can sign in, or use Forgot password.',
    errCap: 'You have made {cap} accounts today, the most for one day. Bambeh can raise it.',
    errOff: 'Signing clients up on your phone is switched off for you. Ask Bambeh.',
    errRate: 'Too many accounts from this phone in a few minutes. Wait 5 minutes, then try again.',
    errNet: 'No connection. Check the network and try again.',
    errHalf: 'The account is made, but its password is not ready. Tap Try again.',
    errOld: 'Too much time has passed. The client can get in with Forgot password.',
    errGeneric: 'That did not work. Try again.',
  },
  fr: {
    title: 'Inscrire un client sur votre t\u00e9l\u00e9phone',
    lead: 'Pour un client qui pr\u00e9f\u00e8re ne pas pr\u00eater son t\u00e9l\u00e9phone : vous cr\u00e9ez le compte ici, Bambeh cr\u00e9e un mot de passe temporaire, et le client choisit son propre mot de passe sur son t\u00e9l\u00e9phone.',
    today: 'Aujourd\u2019hui : {used} sur {cap}',
    finished: 'Termin\u00e9s par le client : {claimed} sur {total}',
    start: 'Inscrire un client',
    clientLang: 'Langue du client',
    name: 'Nom du client',
    namePh: 'ex. Zerm Ngu',
    phone: 'Num\u00e9ro de t\u00e9l\u00e9phone du client',
    tick: 'Laissez le client lire ceci et cocher la case lui-m\u00eame.',
    next: 'Suivant',
    cancel: 'Annuler',
    checkTitle: 'V\u00e9rifiez le num\u00e9ro avec le client',
    checkSub: 'Ce num\u00e9ro devient son identifiant. Est-ce bien le sien ?',
    yes: 'Oui, cr\u00e9er le compte',
    change: 'Modifier',
    working: 'Cr\u00e9ation du compte...',
    shownOnce: 'Bambeh ne montre plus jamais ce mot de passe. Le client scanne le code ou prend une photo de cet \u00e9cran.',
    done: 'Termin\u00e9 - masquer le mot de passe',
    retry: 'R\u00e9essayer',
    errName: '\u00c9crivez le nom du client (au moins 2 lettres).',
    errPhone: '\u00c9crivez le num\u00e9ro du client (un num\u00e9ro complet et valide).',
    errConsent: 'Le client doit cocher la case.',
    errExists: 'Ce num\u00e9ro a d\u00e9j\u00e0 un compte Bambeh. Le client peut se connecter, ou utiliser Mot de passe oubli\u00e9.',
    errCap: 'Vous avez cr\u00e9\u00e9 {cap} comptes aujourd\u2019hui, le maximum pour une journ\u00e9e. Bambeh peut l\u2019augmenter.',
    errOff: 'L\u2019inscription de clients sur votre t\u00e9l\u00e9phone est d\u00e9sactiv\u00e9e pour vous. Demandez \u00e0 Bambeh.',
    errRate: 'Trop de comptes depuis ce t\u00e9l\u00e9phone en quelques minutes. Attendez 5 minutes puis r\u00e9essayez.',
    errNet: 'Pas de connexion. V\u00e9rifiez le r\u00e9seau et r\u00e9essayez.',
    errHalf: 'Le compte est cr\u00e9\u00e9, mais son mot de passe n\u2019est pas pr\u00eat. Touchez R\u00e9essayer.',
    errOld: 'Trop de temps a pass\u00e9. Le client peut entrer avec Mot de passe oubli\u00e9.',
    errGeneric: 'Cela n\u2019a pas abouti. R\u00e9essayez.',
  },
  pidgin: {
    title: 'Register customer for your phone',
    lead: 'For customer wey no want give you their own phone: you open the account here, Bambeh go make temporary password, and the customer go choose their own password for their own phone.',
    today: 'Today: {used} from {cap}',
    finished: 'Customer don finish am: {claimed} from {total}',
    start: 'Register customer',
    clientLang: 'Customer language',
    name: 'Customer name',
    namePh: 'e.g. Zerm Ngu',
    phone: 'Customer phone number',
    tick: 'Make the customer read this and tick the box by themself.',
    next: 'Next',
    cancel: 'Cancel',
    checkTitle: 'Check the number with the customer',
    checkSub: 'This number go be their login. Na their own?',
    yes: 'Yes, open the account',
    change: 'Change am',
    working: 'We dey open the account...',
    shownOnce: 'Bambeh no go show this password again. The customer fit scan the code, or snap this screen.',
    done: 'Finish - hide the password',
    retry: 'Try again',
    errName: 'Write the customer name (at least 2 letters).',
    errPhone: 'Write the customer phone number (full, correct number).',
    errConsent: 'The customer must tick the box.',
    errExists: 'This number don already get Bambeh account. The customer fit sign in, or use Forgot password.',
    errCap: 'You don open {cap} account today, the maximum for one day. Bambeh fit increase am.',
    errOff: 'Register customer for your phone no dey on for you. Ask Bambeh.',
    errRate: 'Too many account from this phone for small time. Wait 5 minutes, then try again.',
    errNet: 'No network. Check the network and try again.',
    errHalf: 'The account don open, but the password never ready. Touch Try again.',
    errOld: 'Time don pass too much. The customer fit enter with Forgot password.',
    errGeneric: 'E no work. Try again.',
  },
  ar: {
    title: '\u062a\u0633\u062c\u064a\u0644 \u0639\u0645\u064a\u0644 \u0639\u0644\u0649 \u0647\u0627\u062a\u0641\u0643',
    lead: '\u0644\u0639\u0645\u064a\u0644 \u0644\u0627 \u064a\u0631\u064a\u062f \u062a\u0633\u0644\u064a\u0645 \u0647\u0627\u062a\u0641\u0647: \u062a\u064f\u0646\u0634\u0626 \u0627\u0644\u062d\u0633\u0627\u0628 \u0647\u0646\u0627\u060c \u0648\u062a\u064f\u0646\u0634\u0626 \u0628\u0627\u0645\u0628\u064a\u0647 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0645\u0624\u0642\u062a\u0629\u060c \u0648\u064a\u062e\u062a\u0627\u0631 \u0627\u0644\u0639\u0645\u064a\u0644 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631\u0647 \u0628\u0646\u0641\u0633\u0647 \u0639\u0644\u0649 \u0647\u0627\u062a\u0641\u0647.',
    today: '\u0627\u0644\u064a\u0648\u0645: {used} \u0645\u0646 {cap}',
    finished: '\u0623\u0643\u0645\u0644\u0647\u0627 \u0627\u0644\u0639\u0645\u064a\u0644: {claimed} \u0645\u0646 {total}',
    start: '\u062a\u0633\u062c\u064a\u0644 \u0639\u0645\u064a\u0644',
    clientLang: '\u0644\u063a\u0629 \u0627\u0644\u0639\u0645\u064a\u0644',
    name: '\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064a\u0644',
    namePh: '\u0645\u062b\u0627\u0644: Zerm Ngu',
    phone: '\u0631\u0642\u0645 \u0647\u0627\u062a\u0641 \u0627\u0644\u0639\u0645\u064a\u0644',
    tick: '\u062f\u0639 \u0627\u0644\u0639\u0645\u064a\u0644 \u064a\u0642\u0631\u0623 \u0647\u0630\u0627 \u0648\u064a\u0636\u0639 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0641\u064a \u0627\u0644\u0645\u0631\u0628\u0639 \u0628\u0646\u0641\u0633\u0647.',
    next: '\u0627\u0644\u062a\u0627\u0644\u064a',
    cancel: '\u0625\u0644\u063a\u0627\u0621',
    checkTitle: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0642\u0645 \u0645\u0639 \u0627\u0644\u0639\u0645\u064a\u0644',
    checkSub: '\u064a\u0635\u0628\u062d \u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u0627\u0633\u0645 \u0627\u0644\u062f\u062e\u0648\u0644. \u0647\u0644 \u0647\u0648 \u0631\u0642\u0645\u0647\u061f',
    yes: '\u0646\u0639\u0645\u060c \u0623\u0646\u0634\u0626 \u0627\u0644\u062d\u0633\u0627\u0628',
    change: '\u062a\u063a\u064a\u064a\u0631',
    working: '\u062c\u0627\u0631\u064d \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628...',
    shownOnce: '\u0644\u0646 \u062a\u0639\u0631\u0636 \u0628\u0627\u0645\u0628\u064a\u0647 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0647\u0630\u0647 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649. \u064a\u0645\u0633\u062d \u0627\u0644\u0639\u0645\u064a\u0644 \u0627\u0644\u0631\u0645\u0632 \u0623\u0648 \u064a\u0644\u062a\u0642\u0637 \u0635\u0648\u0631\u0629 \u0644\u0647\u0630\u0647 \u0627\u0644\u0634\u0627\u0634\u0629.',
    done: '\u062a\u0645 - \u0623\u062e\u0641\u0650 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    retry: '\u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627',
    errName: '\u0627\u0643\u062a\u0628 \u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064a\u0644 (\u062d\u0631\u0641\u0627\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644).',
    errPhone: '\u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641 \u0627\u0644\u0639\u0645\u064a\u0644 (\u0631\u0642\u0645 \u0643\u0627\u0645\u0644 \u0648\u0635\u062d\u064a\u062d).',
    errConsent: '\u064a\u062c\u0628 \u0623\u0646 \u064a\u0636\u0639 \u0627\u0644\u0639\u0645\u064a\u0644 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0641\u064a \u0627\u0644\u0645\u0631\u0628\u0639.',
    errExists: '\u0644\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u062d\u0633\u0627\u0628 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0627\u0644\u0641\u0639\u0644. \u064a\u0645\u0643\u0646 \u0644\u0644\u0639\u0645\u064a\u0644 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.',
    errCap: '\u0623\u0646\u0634\u0623\u062a {cap} \u062d\u0633\u0627\u0628\u064b\u0627 \u0627\u0644\u064a\u0648\u0645\u060c \u0648\u0647\u0648 \u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u064a\u0648\u0645 \u0648\u0627\u062d\u062f. \u064a\u0645\u0643\u0646 \u0644\u0628\u0627\u0645\u0628\u064a\u0647 \u0631\u0641\u0639\u0647.',
    errOff: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0639\u0644\u0649 \u0647\u0627\u062a\u0641\u0643 \u0645\u062a\u0648\u0642\u0641 \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0644\u0643. \u0627\u0633\u0623\u0644 \u0628\u0627\u0645\u0628\u064a\u0647.',
    errRate: '\u062d\u0633\u0627\u0628\u0627\u062a \u0643\u062b\u064a\u0631\u0629 \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641 \u062e\u0644\u0627\u0644 \u062f\u0642\u0627\u0626\u0642. \u0627\u0646\u062a\u0638\u0631 5 \u062f\u0642\u0627\u0626\u0642 \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.',
    errNet: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u062a\u0635\u0627\u0644. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0634\u0628\u0643\u0629 \u0648\u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.',
    errHalf: '\u0623\u064f\u0646\u0634\u0626 \u0627\u0644\u062d\u0633\u0627\u0628\u060c \u0644\u0643\u0646 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631\u0647 \u063a\u064a\u0631 \u062c\u0627\u0647\u0632\u0629. \u0627\u0636\u063a\u0637 \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.',
    errOld: '\u0645\u0631 \u0648\u0642\u062a \u0637\u0648\u064a\u0644. \u064a\u0645\u0643\u0646 \u0644\u0644\u0639\u0645\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0639\u0628\u0631 \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.',
    errGeneric: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0623\u0645\u0631. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.',
  },
  ff: {
    title: 'Winndit kiliyan e tilifon maa',
    lead: 'Ngam kiliyan mo yi\u0257aa hokkude tilifon mum: aan sosata konte \u0257oo, Bambeh wa\u0257a finnde sahaa, kiliyan su\u0253a finnde mum e tilifon mum.',
    today: 'Hannde: {used} e {cap}',
    finished: 'Kiliyan timminii: {claimed} e {total}',
    start: 'Winndit kiliyan',
    clientLang: '\u018aemngal kiliyan',
    name: 'Innde kiliyan',
    namePh: 'e.g. Zerm Ngu',
    phone: 'Limngal tilifon kiliyan',
    tick: 'Accu kiliyan janga \u0257um, maantina kesu oo hoore mum.',
    next: 'Yeeso',
    cancel: 'Haaytu',
    checkTitle: '\u01b3eewndo limngal e kiliyan',
    checkSub: 'Limngal ngal ina wonta naatirgal mum. Ko ngal mum?',
    yes: 'Eey, sos konte',
    change: 'Waylu',
    working: 'Konte ina sosee...',
    shownOnce: 'Bambeh hollataa finnde nde kadi. Kiliyan ya\u0253\u0253a kod oo, walla o wa\u0257a foto yaynirde ndee.',
    done: 'Gasii - suu\u0257u finnde nde',
    retry: 'E\u0257\u0257itto',
    errName: 'Winndu innde kiliyan (alkule 2 \u0253uri).',
    errPhone: 'Winndu limngal tilifon kiliyan (limngal timmungal, goonga).',
    errConsent: 'Kiliyan foti maantinde kesu oo.',
    errExists: 'Limngal ngal jogii konte Bambeh gila. Kiliyan ina waawi naatde, walla huutoroo Finnde yejjitaande.',
    errCap: 'A sosii konte {cap} hannde, \u0257um ko \u0253ur\u0257um \u00f1alnde wootere. Bambeh ina waawi \u0253eydude.',
    errOff: 'Winnditgol kiliyan\u0253e e tilifon maa uddaama e maa. \u01b3amo Bambeh.',
    errRate: 'Konte keew\u0257e e tilifon ngon e hojomaaji see\u0257a. Fadu hojomaaji 5, refti e\u0257\u0257itto.',
    errNet: 'Alaa ce\u014bgol. \u01b3eewndo reseau, e\u0257\u0257itto.',
    errHalf: 'Konte sosaama, kono finnde mum hebbinaaka. Meemu E\u0257\u0257itto.',
    errOld: 'Waqtu juuti no feewi. Kiliyan ina waawi naatde e Finnde yejjitaande.',
    errGeneric: '\u0181um waawaa. E\u0257\u0257itto.',
  },
};

export const CLIENT_WORDS: Record<Lang, ClientWords> = {
  en: {
    ready: '{name}, your Bambeh account is ready',
    login: 'Your login: your phone number',
    temp: 'Temporary password',
    exact: 'Type it exactly: capital letters and numbers.',
    scan: 'Scan this with your own phone to choose your own password now',
    later: 'Or sign in later with your number and this password: Bambeh will ask you to choose your own. Unused, it stops working in 48 hours.',
  },
  fr: {
    ready: '{name}, votre compte Bambeh est pr\u00eat',
    login: 'Votre identifiant : votre num\u00e9ro de t\u00e9l\u00e9phone',
    temp: 'Mot de passe temporaire',
    exact: 'Tapez-le exactement : majuscules et chiffres.',
    scan: 'Scannez ceci avec votre propre t\u00e9l\u00e9phone pour choisir votre mot de passe maintenant',
    later: 'Ou connectez-vous plus tard avec votre num\u00e9ro et ce mot de passe : Bambeh vous demandera de choisir le v\u00f4tre. Non utilis\u00e9, il ne fonctionne plus apr\u00e8s 48 heures.',
  },
  pidgin: {
    ready: '{name}, your Bambeh account don ready',
    login: 'Your login: your phone number',
    temp: 'Temporary password',
    exact: 'Type am exactly: capital letters and numbers.',
    scan: 'Scan this with your own phone to choose your own password now',
    later: 'Or sign in later with your number and this password: Bambeh go ask you to choose your own. If you no use am, e go stop to work after 48 hours.',
  },
  ar: {
    ready: '{name}\u060c \u062d\u0633\u0627\u0628\u0643 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647 \u062c\u0627\u0647\u0632',
    login: '\u0627\u0633\u0645 \u0627\u0644\u062f\u062e\u0648\u0644: \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643',
    temp: '\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0645\u0624\u0642\u062a\u0629',
    exact: '\u0627\u0643\u062a\u0628\u0647\u0627 \u0643\u0645\u0627 \u0647\u064a \u062a\u0645\u0627\u0645\u064b\u0627: \u0623\u062d\u0631\u0641 \u0643\u0628\u064a\u0631\u0629 \u0648\u0623\u0631\u0642\u0627\u0645.',
    scan: '\u0627\u0645\u0633\u062d \u0647\u0630\u0627 \u0628\u0647\u0627\u062a\u0641\u0643 \u0644\u062a\u062e\u062a\u0627\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631\u0643 \u0627\u0644\u0622\u0646',
    later: '\u0623\u0648 \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0627\u062d\u0642\u064b\u0627 \u0628\u0631\u0642\u0645\u0643 \u0648\u0647\u0630\u0647 \u0627\u0644\u0643\u0644\u0645\u0629: \u0633\u062a\u0637\u0644\u0628 \u0645\u0646\u0643 \u0628\u0627\u0645\u0628\u064a\u0647 \u0627\u062e\u062a\u064a\u0627\u0631 \u0643\u0644\u0645\u062a\u0643. \u0625\u0646 \u0644\u0645 \u062a\u064f\u0633\u062a\u062e\u062f\u0645\u060c \u062a\u062a\u0648\u0642\u0641 \u0639\u0646 \u0627\u0644\u0639\u0645\u0644 \u0628\u0639\u062f 48 \u0633\u0627\u0639\u0629.',
  },
  ff: {
    ready: '{name}, konte maa Bambeh hebbinaama',
    login: 'Naatirgal maa: limngal tilifon maa',
    temp: 'Finnde sahaa',
    exact: 'Winndu nde no nde wonri: alkule maw\u0257e e limorde.',
    scan: 'Ya\u0253\u0253u \u0257um e tilifon maa ngam su\u0253aade finnde maa jooni',
    later: 'Walla naatu caggal e limngal maa e finnde nde: Bambeh ma \u01b4am ma su\u0253aade nde maa. So huutoraaka, nde dartoto caggal waktuuji 48.',
  },
};

function fill(s: string, v: Record<string, string | number | undefined>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (v[k] !== undefined ? String(v[k]) : m));
}

const isNet = (e: unknown): boolean => /fetch|network|timeout|load failed|offline/i.test(String((e as { message?: unknown })?.message || e || ''));
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(() => r(), ms));

interface Status {
  ok: boolean; reason?: string; code?: string; cap?: number; used_today?: number; left_today?: number;
  week?: number; total?: number; claimed?: number; waiting?: number; expired?: number;
}
interface IssueAnswer { ok?: boolean; reason?: string; temp_password?: string; expires_at?: string; credited?: boolean; left_today?: number; cap?: number }
interface Pending { userId: string; secret: string; digits: string; name: string; lang: Lang; at: number }
interface Result { temp: string; digits: string; name: string; lang: Lang }
type Step = 'closed' | 'form' | 'check' | 'working' | 'half' | 'done';

/** The one box, in the client's language: the same words as the sign-up page (QuickJoin, FIX762). */
function ConsentBox({ lang, checked, onChange }: { lang: Lang; checked: boolean; onChange: (v: boolean) => void }) {
  const t = JOIN_TEXT[lang];
  const link = (path: string, label: string) => (
    <a href={PUBLIC_APP_URL + '/#' + path} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 underline">{label}</a>
  );
  const withLink = (text: string, token: string, node: ReactNode) => {
    const i = text.indexOf(token);
    if (i < 0) return <>{text} {node}</>;
    return <>{text.slice(0, i)}{node}{text.slice(i + token.length)}</>;
  };
  return (
    <label dir={lang === 'ar' ? 'rtl' : 'ltr'} data-assist-consent="1"
      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-3 text-sm text-gray-800">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-f="assist-consent"
        className="mt-1 h-5 w-5 shrink-0 accent-teal-600" />
      <span>
        <span className="block font-semibold">{t.consentLead}</span>
        <span className="mt-1 flex gap-1.5"><span>1.</span><span>{withLink(t.consentItem1, '{terms}', link('/terms-of-service', t.terms))}</span></span>
        <span className="mt-0.5 flex gap-1.5"><span>2.</span><span>{withLink(t.consentItem2, '{privacy}', link('/privacy-policy', t.privacy))}</span></span>
        <span className="mt-1 block text-xs text-gray-500">{t.consentNote}</span>
      </span>
    </label>
  );
}

export default function AgentAssist() {
  const lang = normLang(useLang()) as Lang;
  const t = AGENT_WORDS[lang];
  const rtl = lang === 'ar';
  const open = useOpenCountries(true);

  const [st, setSt] = useState<Status | null>(null);
  const [step, setStep] = useState<Step>('closed');
  const [cl, setCl] = useState<Lang>(lang);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneOk, setPhoneOk] = useState(false);
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [boxKey, setBoxKey] = useState(0);
  const busy = useRef(false);

  const loadStatus = useCallback(async (): Promise<Status | null> => {
    try {
      const r = await supabase.rpc('bambeh_agent_assist_status');
      const d = r && !r.error && r.data && typeof r.data === 'object' ? (r.data as Status) : null;
      setSt(d && d.ok ? d : { ok: false, reason: d ? d.reason : 'unavailable' });
      return d && d.ok ? d : null;
    } catch {
      setSt({ ok: false, reason: 'unavailable' });
      return null;
    }
  }, []);
  useEffect(() => { void loadStatus(); }, [loadStatus]);

  const parsed = useMemo(() => (phoneOk ? parsePhone(phone, HOME, open.signup) : null), [phoneOk, phone, open.signup]);
  const cleanName = name.trim().replace(/\s+/g, ' ');

  const reset = () => {
    setName('');
    setPhone('');
    setPhoneOk(false);
    setConsent(false);
    setErr(null);
    setPending(null);
    setResult(null);
    setBoxKey((k) => k + 1);
  };

  const toCheck = () => {
    if (cleanName.length < 2) { setErr(t.errName); return; }
    if (!parsed) { setErr(t.errPhone); return; }
    if (!consent) { setErr(t.errConsent); return; }
    setErr(null);
    setStep('check');
  };

  // the account exists: Bambeh replaces its random password with the temporary one (retried on a bad network;
  // an answer lost on the way is fetched again with a new temporary password - FIX931 allows it for 30 minutes)
  const issue = async (p: Pending) => {
    if (Date.now() - p.at > 25 * 60 * 1000) { setErr(t.errOld); setPending(null); setStep('check'); return; }
    setStep('working');
    let r: { data: unknown; error: unknown } | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        r = (await supabase.rpc('bambeh_agent_assist_issue', { p_user: p.userId, p_secret: p.secret, p_lang: p.lang })) as { data: unknown; error: unknown };
      } catch (e) {
        r = { data: null, error: e };
      }
      if (!r.error || !isNet(r.error)) break;
      await sleep(1200 * (attempt + 1));
    }
    if (!r || r.error) {
      setErr(r && r.error && !isNet(r.error) ? t.errHalf : t.errNet);
      setStep('half');
      return;
    }
    const d = (r.data || {}) as IssueAnswer;
    if (!d.ok || !d.temp_password) {
      const why = String(d.reason || '');
      if (why === 'too_old') { setErr(t.errOld); setPending(null); setStep('check'); return; }
      if (why === 'cap_reached') { setErr(fill(t.errCap, { cap: d.cap })); setPending(null); setStep('check'); return; }
      if (why === 'switched_off') { setErr(t.errOff); setPending(null); setStep('check'); return; }
      setErr(t.errHalf);
      setStep('half');
      return;
    }
    setResult({ temp: d.temp_password, digits: p.digits, name: p.name, lang: p.lang });
    setPending(null);
    setErr(null);
    setStep('done');
    setSt((prev) => (prev ? {
      ...prev,
      left_today: typeof d.left_today === 'number' ? d.left_today : prev.left_today,
      used_today: (prev.used_today || 0) + 1,
      total: (prev.total || 0) + 1,
      waiting: (prev.waiting || 0) + 1,
    } : prev));
  };

  const create = async () => {
    if (busy.current || !parsed || !st || !st.code) return;
    busy.current = true;
    setErr(null);
    setStep('working');
    try {
      const s = await loadStatus();
      if (s && (s.cap || 0) <= 0) { setErr(t.errOff); setStep('check'); return; }
      if (s && (s.left_today || 0) <= 0) { setErr(fill(t.errCap, { cap: s.cap })); setStep('check'); return; }
      const code = (s && s.code) || st.code;
      const secret = makeSecret();
      const now = new Date().toISOString();
      const meta: Record<string, string> = {
        full_name: cleanName.slice(0, 60),
        username: makeUsername(cleanName),
        signup_via: 'agent',
        agent_code: code,
        join_for: 'direct',
        signup_lang: cl,
        terms_accepted_at: now,
        privacy_consent_at: now,
        consent_covers: CONSENT_COVERS,
        consent_words: consentWords(cl),
        consent_version: ASSIST_CONSENT_VERSION,
        phone: parsed.digits,
        phone_country: parsed.code,
      };
      const identity = parsed.digits + '@phone.bambeh.com';
      let res = await assistSignUp(identity, secret, meta);
      // a username already taken (or a busy database): one more try with new digits - as the sign-up page does
      if (res.error && problemOf(res.error) === 'db') res = await assistSignUp(identity, secret, { ...meta, username: makeUsername(cleanName) });
      const user = res.data && res.data.user ? res.data.user : null;
      const ids = user ? user.identities : null;
      if (res.error || !user || !user.id || (Array.isArray(ids) && ids.length === 0)) {
        const p = res.error ? problemOf(res.error) : 'exists';
        setErr(p === 'exists' ? t.errExists : p === 'rate' ? t.errRate : p === 'net' ? t.errNet : t.errGeneric);
        setStep('check');
        return;
      }
      const p: Pending = { userId: String(user.id), secret, digits: parsed.digits, name: cleanName, lang: cl, at: Date.now() };
      setPending(p);
      await issue(p);
    } finally {
      busy.current = false;
    }
  };

  const retry = async () => {
    if (busy.current || !pending) return;
    busy.current = true;
    try { await issue(pending); } finally { busy.current = false; }
  };

  const finish = () => {
    reset();
    setStep('closed');
    void loadStatus();
  };

  if (!st || !st.ok) return null;

  const c = CLIENT_WORDS[result ? result.lang : cl];
  const qr = result ? qrSvg(finishLink(result.digits, result.temp), 220) : '';

  return (
    <section dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX933" data-assist-step={step}
      className="mt-4 rounded-2xl border border-teal-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <UserPlus className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900">{t.title}</h2>
          <p className="mt-0.5 text-xs text-gray-600">{t.lead}</p>
        </div>
      </div>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-gray-700" data-assist-counts="1">
        <span>{fill(t.today, { used: st.used_today || 0, cap: st.cap || 0 })}</span>
        <span>{fill(t.finished, { claimed: st.claimed || 0, total: st.total || 0 })}</span>
      </p>

      {err && (
        <div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" data-assist-error="1">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{err}</span>
        </div>
      )}

      {step === 'closed' && (
        <button type="button" onClick={() => { reset(); setCl(lang); setStep('form'); }} data-assist-start="1"
          disabled={(st.cap || 0) <= 0}
          className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:bg-gray-300">
          <UserPlus className="h-4 w-4" />{t.start}
        </button>
      )}
      {step === 'closed' && (st.cap || 0) <= 0 && <p className="mt-2 text-xs text-gray-600">{t.errOff}</p>}

      {step === 'form' && (
        <div className="mt-3 space-y-3" data-assist-form="1">
          <div>
            <p className="text-xs font-semibold text-gray-600">{t.clientLang}</p>
            <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label={t.clientLang}>
              {JOIN_LANGS.map((l) => (
                <button key={l.code} type="button" onClick={() => setCl(l.code as Lang)} aria-pressed={cl === l.code} data-assist-lang={l.code}
                  className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + (cl === l.code ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200')}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">{t.name}</span>
            <input value={name} onChange={(e) => { setName(e.target.value.slice(0, 60)); setErr(null); }} placeholder={t.namePh}
              autoComplete="off" data-f="assist-name"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
          </label>
          <AfricanPhoneInput key={boxKey} value={phone} scope="open" label={t.phone}
            onChange={(full, valid) => { setPhone(full); setPhoneOk(valid); if (valid) setErr(null); }} />
          <p className="flex items-start gap-1.5 text-xs font-semibold text-teal-800"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />{t.tick}</p>
          <ConsentBox lang={cl} checked={consent} onChange={(v) => { setConsent(v); if (v) setErr(null); }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => { reset(); setStep('closed'); }}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600">{t.cancel}</button>
            <button type="button" onClick={toCheck} data-assist-next="1"
              className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">{t.next}</button>
          </div>
        </div>
      )}

      {step === 'check' && parsed && (
        <div className="mt-3 space-y-3" data-assist-check="1">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-sm font-bold text-gray-900">{t.checkTitle}</p>
            <p className="mt-1 text-xs text-gray-600">{t.checkSub}</p>
            <p className="mt-2 font-mono text-xl font-black tracking-wide text-gray-900" dir="ltr" data-assist-number="1">{prettyPhone(parsed.digits)}</p>
            <p className="mt-1 text-sm font-semibold text-gray-700">{cleanName}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setErr(null); setStep('form'); }}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600">{t.change}</button>
            <button type="button" onClick={() => void create()} data-assist-create="1"
              className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">{t.yes}</button>
          </div>
        </div>
      )}

      {step === 'working' && (
        <p className="mt-4 flex items-center justify-center gap-2 py-4 text-sm font-semibold text-gray-700" data-assist-working="1">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />{t.working}
        </p>
      )}

      {step === 'half' && pending && (
        <button type="button" onClick={() => void retry()} data-assist-retry="1"
          className="mt-3 w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">{t.retry}</button>
      )}

      {step === 'done' && result && (
        <div className="mt-3 space-y-3" data-assist-done="1">
          <div dir={result.lang === 'ar' ? 'rtl' : 'ltr'} className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center">
            <CheckCircle className="mx-auto h-7 w-7 text-emerald-600" />
            <p className="mt-1 text-base font-extrabold text-emerald-900">{fill(c.ready, { name: result.name })}</p>
            <p className="mt-2 text-xs font-semibold text-gray-700">{c.login}</p>
            <p className="font-mono text-sm font-bold text-gray-900" dir="ltr" data-assist-login="1">{maskedNumber(result.digits)}</p>
            <p className="mt-3 text-xs font-semibold text-gray-700">{c.temp}</p>
            <p className="mt-1 select-all rounded-xl bg-white px-3 py-2 font-mono text-3xl font-black tracking-[0.25em] text-gray-900 ring-1 ring-emerald-200"
              dir="ltr" data-assist-temp="1">{result.temp}</p>
            <p className="mt-1 text-[11px] text-gray-600">{c.exact}</p>
            <p className="mt-3 text-sm font-bold text-gray-900">{c.scan}</p>
            <div className="mt-2 flex justify-center">
              <div className="rounded-xl bg-white p-3 ring-1 ring-emerald-200" data-assist-qr="1" dangerouslySetInnerHTML={{ __html: qr }} />
            </div>
            <p className="mt-2 text-xs text-gray-700">{c.later}</p>
          </div>
          <p className="text-xs font-semibold text-gray-700">{t.shownOnce}</p>
          <button type="button" onClick={finish} data-assist-finish="1"
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white">{t.done}</button>
        </div>
      )}
    </section>
  );
}
// BAMBEH_END_TOKEN__AGENT_ASSIST_FIX933__COMPLETE
