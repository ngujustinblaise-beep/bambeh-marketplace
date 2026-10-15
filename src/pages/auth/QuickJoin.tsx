// BAMBEH_DEPLOY_TOKEN__QUICK_JOIN_FIX777_CLEAN
/**
 * src/pages/auth/QuickJoin.tsx - FIX777 (replaces FIX762) - route /join (and /register, FIX763)
 *
 * FIX777, Big 15 Oct 2026: "let the name showing as a sample name ... (e.g. Grace Mbah) be changed to e.g. Zerm
 * Ngu" and "we are using the ecowas and cemac phone number system, with Cameroon ... most especially cameroon".
 *   - The sample name is "e.g. Zerm Ngu", in the five languages.
 *   - A COUNTRY BUTTON before the number: the countries switched on in Command Center > Countries (FIX779,
 *     FIX774). With Cameroon alone - the start - it is a plain "+237" label and Cameroon numbers work exactly as
 *     before (9 digits, 6 or 2 first). Another country's number signs in as <country code><number>@phone.bambeh.com.
 *     A number from a country that is not open yet is told so, with the email sign-up as the way in.
 *   - EACH STEP IS NOTED for Command Center > App usage > Sign-ups & sign-ins (FIX775, database FIX773): page
 *     opened, Create pressed, account created - or why not (no name, wrong number, already an account, no
 *     network...). Never the name, the number or the password.
 *
 * FIX762 (replaces FIX756):
 * THE 30-SECOND FREE ACCOUNT - now the only sign-up. Big, 15 Oct 2026: "One box covers both the Terms and
 * the data consent ... make it clear and written that the one box covers both". He also sent Register.tsx,
 * so every "Sign up" in the app opens this screen now (FIX763).
 *
 * What changed from FIX756:
 *   - THE ONE BOX SAYS WHAT IT COVERS: "By ticking this one box, I agree to both: 1. the Terms of Service,
 *     and 2. the use of my personal data as the Privacy Policy explains (Law No. 2024/017)." Under it, in
 *     small letters: "One box, two agreements." It is never ticked for her.
 *   - AND IT IS WRITTEN DOWN with the account: the exact words she ticked, in her language (consent_words),
 *     what they cover (consent_covers), the screen that showed them (consent_version) and when
 *     (terms_accepted_at = privacy_consent_at). FIX766 copies this into a record that nobody can edit.
 *   - AN EMAIL ADDRESS instead of a number, on the same screen ("No Cameroon number? Sign up with an email
 *     address"). The old long form at /register is gone (FIX763).
 *   - THE AGENT CODE of the old form (FIX587): a small "Helped by a Bambeh agent?" link, open by
 *     itself when the link carries ?agent=. A code never blocks the account.
 *   - It sits inside the sign-in frame (AuthLayout) with no second page around it. On a 360 px phone the
 *     FIX756 boxes were squeezed to 246 px between two frames, under a full empty screen; now they are
 *     286 px wide and the page is as long as the form.
 *   - The language is the phone's (FIX764) or hers - the five buttons stay on top.
 * Unchanged: three fields and one box; a password of 8 or more (the sign-in page's rule); the number is the
 * login and other users never see it; back to what she was doing (returnTo, FIX755); the security questions
 * wait until the second day (FIX757); what she typed (never the password) survives a look at the Terms.
 * Not here, on purpose: town, photo, security questions - each is asked later, when it is needed.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/hooks/useAppLang';
import { CountryPicker } from '@/components/AfricanPhoneInput';
import {
  HOME, countryName, digitsOfIdentity, lengthsText, parsePhone, phoneIdentity, phonePlaceholder, rememberPhoneCountry,
  rememberedPhoneCountry,
} from '@/lib/africa/countries';
import { useOpenCountries } from '@/lib/africa/useOpenCountries';
import { track } from '@/components/analytics/track';
import { forgetLink } from '@/components/auth/LinkReturn';
import { returnTarget } from '@/components/auth/returnTo';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
export function normLang(v: unknown): Lang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

const EN = {
  titleDefault: 'Join Bambeh free',
  subDefault: '30 seconds: your name, your phone number and a password. Nothing else for now.',
  subEmail: '30 seconds: your name, your email address and a password. Nothing else for now.',
  titleContact: 'Contact the seller safely',
  subContact: 'Create your free account in 30 seconds. Your phone number is never shown to other users.',
  titlePost: 'Sell on Bambeh',
  subPost: 'Create your free account in 30 seconds, then post your advert. Buyers write to you inside Bambeh - your number stays private.',
  titleFree: 'Free help needs a free account',
  subFree: 'Pharmacies on call, hospitals, women\'s health and more. 30 seconds: your name, your number and a password.',
  back: 'You come straight back to where you were.',
  name: 'Your name',
  namePh: 'e.g. Zerm Ngu',
  phone: 'Phone number',
  phonePh: '6XX XXX XXX',
  phoneHelp: 'Your number is your login. Other users never see it.',
  email: 'Email address',
  emailPh: 'name@example.com',
  emailHelp: 'Your email address is your login. Other users never see it.',
  password: 'Choose a password',
  passwordPh: 'At least 8 characters',
  show: 'Show password',
  hide: 'Hide password',
  consentLead: 'By ticking this one box, I agree to both:',
  consentItem1: 'the {terms}, and',
  consentItem2: 'the use of my personal data as the {privacy} explains (Law No. 2024/017).',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  consentNote: 'One box, two agreements. Bambeh keeps these words and the date with your account.',
  agentAsk: 'Helped by a Bambeh agent? Add their code',
  agentLabel: 'Agent code (if someone from Bambeh helped you)',
  agentPh: 'AG12345',
  agentHelp: 'Leave it empty if nobody helped you.',
  create: 'Create my free account',
  creating: 'Creating your account...',
  have: 'Already on Bambeh?',
  signIn: 'Sign in',
  useEmail: 'No Cameroon number? Sign up with an email address',
  usePhone: 'Use my Cameroon phone number instead',
  free: 'Free. No card. Nothing to pay to create your account.',
  errName: 'Write your name (at least 2 letters).',
  errPhone: 'Write a Cameroon number: 9 digits, starting with 6 or 2.',
  errEmailHere: 'This form takes a phone number. To use an email address, tap the link at the bottom.',
  errEmail: 'Write your email address, like name@example.com.',
  errPhoneHere: 'That is a phone number. Tap "Use my Cameroon phone number instead" at the bottom.',
  errPhoneIn: 'Not a valid number for {country}: {n} digits, e.g. {example}.',
  errClosed: 'Bambeh is not open in {country} yet. Sign up with an email address instead (link at the bottom).',
  useEmailAny: 'Prefer email? Sign up with an email address',
  usePhoneAny: 'Use my phone number instead',
  errPhoneHereAny: 'That is a phone number. Tap "Use my phone number instead" at the bottom.',
  country: 'Country',
  errPass: 'Your password needs at least 8 characters.',
  errConsent: 'Tick the box: it accepts both the Terms of Service and the use of your data.',
  errExists: 'This number already has a Bambeh account.',
  errExistsEmail: 'This email address already has a Bambeh account.',
  signInInstead: 'Sign in with this number',
  signInInsteadEmail: 'Sign in with this email address',
  errWeak: 'Choose a stronger password: mix letters and numbers.',
  errRate: 'Too many tries. Wait a minute, then try again.',
  errNet: 'We could not reach Bambeh. Check your connection and try again.',
  errGeneric: 'Your account could not be created. Try again in a moment.',
  confirmTitle: 'Your account is created',
  confirmSub: 'Sign in with your phone number and your password.',
  confirmSubEmail: 'Sign in with your email address and your password.',
  language: 'Language',
};
export type Key = keyof typeof EN;

const FR: Record<Key, string> = {
  titleDefault: 'Rejoignez Bambeh gratuitement',
  subDefault: '30 secondes : votre nom, votre num\u00e9ro de t\u00e9l\u00e9phone et un mot de passe. Rien d\u2019autre pour le moment.',
  subEmail: '30 secondes : votre nom, votre adresse e-mail et un mot de passe. Rien d\u2019autre pour le moment.',
  titleContact: 'Contactez le vendeur en toute s\u00e9curit\u00e9',
  subContact: 'Cr\u00e9ez votre compte gratuit en 30 secondes. Votre num\u00e9ro n\u2019est jamais montr\u00e9 aux autres utilisateurs.',
  titlePost: 'Vendez sur Bambeh',
  subPost: 'Cr\u00e9ez votre compte gratuit en 30 secondes, puis publiez votre annonce. Les acheteurs vous \u00e9crivent dans Bambeh : votre num\u00e9ro reste priv\u00e9.',
  titleFree: 'L\u2019aide gratuite demande un compte gratuit',
  subFree: 'Pharmacies de garde, h\u00f4pitaux, sant\u00e9 des femmes et plus. 30 secondes : votre nom, votre num\u00e9ro et un mot de passe.',
  back: 'Vous revenez directement l\u00e0 o\u00f9 vous \u00e9tiez.',
  name: 'Votre nom',
  namePh: 'ex. Zerm Ngu',
  phone: 'Num\u00e9ro de t\u00e9l\u00e9phone',
  phonePh: '6XX XXX XXX',
  phoneHelp: 'Votre num\u00e9ro sert \u00e0 vous connecter. Les autres utilisateurs ne le voient jamais.',
  email: 'Adresse e-mail',
  emailPh: 'nom@exemple.com',
  emailHelp: 'Votre adresse e-mail sert \u00e0 vous connecter. Les autres utilisateurs ne la voient jamais.',
  password: 'Choisissez un mot de passe',
  passwordPh: 'Au moins 8 caract\u00e8res',
  show: 'Afficher le mot de passe',
  hide: 'Masquer le mot de passe',
  consentLead: 'En cochant cette seule case, j\u2019accepte les deux :',
  consentItem1: 'les {terms}, et',
  consentItem2: 'l\u2019utilisation de mes donn\u00e9es personnelles comme l\u2019explique la {privacy} (loi n\u00b0 2024/017).',
  terms: 'Conditions d\u2019utilisation',
  privacy: 'Politique de confidentialit\u00e9',
  consentNote: 'Une case, deux accords. Bambeh garde ces mots et la date avec votre compte.',
  agentAsk: 'Aid\u00e9 par un agent Bambeh ? Son code ici',
  agentLabel: 'Code d\u2019agent (si quelqu\u2019un de Bambeh vous a aid\u00e9)',
  agentPh: 'AG12345',
  agentHelp: 'Laissez vide si personne ne vous a aid\u00e9.',
  create: 'Cr\u00e9er mon compte gratuit',
  creating: 'Cr\u00e9ation du compte...',
  have: 'D\u00e9j\u00e0 sur Bambeh ?',
  signIn: 'Se connecter',
  useEmail: 'Pas de num\u00e9ro camerounais ? Inscrivez-vous avec une adresse e-mail',
  usePhone: 'Utiliser plut\u00f4t mon num\u00e9ro camerounais',
  free: 'Gratuit. Sans carte. Rien \u00e0 payer pour cr\u00e9er votre compte.',
  errName: '\u00c9crivez votre nom (au moins 2 lettres).',
  errPhone: '\u00c9crivez un num\u00e9ro camerounais : 9 chiffres, commen\u00e7ant par 6 ou 2.',
  errEmailHere: 'Ce formulaire demande un num\u00e9ro de t\u00e9l\u00e9phone. Pour une adresse e-mail, touchez le lien en bas.',
  errEmail: '\u00c9crivez votre adresse e-mail, par exemple nom@exemple.com.',
  errPhoneHere: 'C\u2019est un num\u00e9ro de t\u00e9l\u00e9phone. Touchez \u00ab Utiliser plut\u00f4t mon num\u00e9ro camerounais \u00bb en bas.',
  errPhoneIn: 'Num\u00e9ro non valable pour ce pays ({country}) : {n} chiffres, par exemple {example}.',
  errClosed: 'Bambeh n\u2019est pas encore ouvert dans ce pays ({country}). Inscrivez-vous plut\u00f4t avec une adresse e-mail (lien en bas).',
  useEmailAny: 'Vous pr\u00e9f\u00e9rez l\u2019e-mail ? Inscrivez-vous avec une adresse e-mail',
  usePhoneAny: 'Utiliser plut\u00f4t mon num\u00e9ro de t\u00e9l\u00e9phone',
  errPhoneHereAny: 'C\u2019est un num\u00e9ro de t\u00e9l\u00e9phone. Touchez \u00ab Utiliser plut\u00f4t mon num\u00e9ro de t\u00e9l\u00e9phone \u00bb en bas.',
  country: 'Pays',
  errPass: 'Votre mot de passe doit avoir au moins 8 caract\u00e8res.',
  errConsent: 'Cochez la case : elle accepte \u00e0 la fois les Conditions d\u2019utilisation et l\u2019utilisation de vos donn\u00e9es.',
  errExists: 'Ce num\u00e9ro a d\u00e9j\u00e0 un compte Bambeh.',
  errExistsEmail: 'Cette adresse e-mail a d\u00e9j\u00e0 un compte Bambeh.',
  signInInstead: 'Se connecter avec ce num\u00e9ro',
  signInInsteadEmail: 'Se connecter avec cette adresse e-mail',
  errWeak: 'Choisissez un mot de passe plus solide : m\u00e9langez lettres et chiffres.',
  errRate: 'Trop d\u2019essais. Attendez une minute, puis r\u00e9essayez.',
  errNet: 'Impossible de joindre Bambeh. V\u00e9rifiez votre connexion et r\u00e9essayez.',
  errGeneric: 'Votre compte n\u2019a pas pu \u00eatre cr\u00e9\u00e9. R\u00e9essayez dans un instant.',
  confirmTitle: 'Votre compte est cr\u00e9\u00e9',
  confirmSub: 'Connectez-vous avec votre num\u00e9ro et votre mot de passe.',
  confirmSubEmail: 'Connectez-vous avec votre adresse e-mail et votre mot de passe.',
  language: 'Langue',
};

const PIDGIN: Record<Key, string> = {
  titleDefault: 'Join Bambeh free',
  subDefault: '30 seconds: your name, your phone number and password. Nothing more for now.',
  subEmail: '30 seconds: your name, your email and password. Nothing more for now.',
  titleContact: 'Contact the seller safe',
  subContact: 'Make your free account for 30 seconds. Other people no di ever see your number.',
  titlePost: 'Sell for Bambeh',
  subPost: 'Make your free account for 30 seconds, then post your advert. Buyers go write you inside Bambeh - your number go stay private.',
  titleFree: 'Free help need free account',
  subFree: 'Pharmacy weh e open, hospital, woman health and more. 30 seconds: your name, your number and password.',
  back: 'You go come back straight for where you been dey.',
  name: 'Your name',
  namePh: 'e.g. Zerm Ngu',
  phone: 'Phone number',
  phonePh: '6XX XXX XXX',
  phoneHelp: 'Your number na your login. Other people no di ever see am.',
  email: 'Email address',
  emailPh: 'name@example.com',
  emailHelp: 'Your email na your login. Other people no di ever see am.',
  password: 'Choose password',
  passwordPh: '8 character or more',
  show: 'Show password',
  hide: 'Hide password',
  consentLead: 'When I tick this one box, I agree to the two:',
  consentItem1: 'the {terms}, and',
  consentItem2: 'say Bambeh fit use my personal data as the {privacy} explain am (Law No. 2024/017).',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  consentNote: 'One box, two agreement. Bambeh go keep these words and the date with your account.',
  agentAsk: 'Bambeh agent help you? Put their code',
  agentLabel: 'Agent code (if somebody from Bambeh help you)',
  agentPh: 'AG12345',
  agentHelp: 'If nobody help you, leave am empty.',
  create: 'Make my free account',
  creating: 'We di make your account...',
  have: 'You don already dey Bambeh?',
  signIn: 'Sign in',
  useEmail: 'You no get Cameroon number? Sign up with email',
  usePhone: 'Use my Cameroon number instead',
  free: 'Free. No card. You no pay anything to make your account.',
  errName: 'Write your name (2 letters or more).',
  errPhone: 'Write Cameroon number: 9 numbers, start with 6 or 2.',
  errEmailHere: 'This form want phone number. For email, touch the link for down.',
  errEmail: 'Write your email, like name@example.com.',
  errPhoneHere: 'That one na phone number. Touch "Use my Cameroon number instead" for down.',
  errPhoneIn: 'This number no correct for {country}: {n} numbers, like {example}.',
  errClosed: 'Bambeh never open for {country} yet. Use email address instead (the link for down).',
  useEmailAny: 'You want use email? Sign up with email address',
  usePhoneAny: 'Use my phone number instead',
  errPhoneHereAny: 'That one na phone number. Touch "Use my phone number instead" for down.',
  country: 'Country',
  errPass: 'Your password need 8 character or more.',
  errConsent: 'Tick the box: e accept the two - the Terms of Service and how Bambeh go use your data.',
  errExists: 'This number don already get Bambeh account.',
  errExistsEmail: 'This email don already get Bambeh account.',
  signInInstead: 'Sign in with this number',
  signInInsteadEmail: 'Sign in with this email',
  errWeak: 'Choose strong password: mix letters and numbers.',
  errRate: 'You don try too many times. Wait one minute, then try again.',
  errNet: 'We no fit reach Bambeh. Check your connection and try again.',
  errGeneric: 'We no fit make your account. Try again small time.',
  confirmTitle: 'Your account don ready',
  confirmSub: 'Sign in with your phone number and your password.',
  confirmSubEmail: 'Sign in with your email and your password.',
  language: 'Language',
};

const AR: Record<Key, string> = {
  titleDefault: '\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0645\u062c\u0627\u0646\u064b\u0627',
  subDefault: '30 \u062b\u0627\u0646\u064a\u0629: \u0627\u0633\u0645\u0643 \u0648\u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643 \u0648\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631. \u0644\u0627 \u0634\u064a\u0621 \u0622\u062e\u0631 \u0627\u0644\u0622\u0646.',
  subEmail: '30 \u062b\u0627\u0646\u064a\u0629: \u0627\u0633\u0645\u0643 \u0648\u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0648\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631. \u0644\u0627 \u0634\u064a\u0621 \u0622\u062e\u0631 \u0627\u0644\u0622\u0646.',
  titleContact: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0628\u0627\u0626\u0639 \u0628\u0623\u0645\u0627\u0646',
  subContact: '\u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0641\u064a 30 \u062b\u0627\u0646\u064a\u0629. \u0644\u0627 \u064a\u064f\u0639\u0631\u0636 \u0631\u0642\u0645\u0643 \u0623\u0628\u062f\u064b\u0627 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u0627\u0644\u0622\u062e\u0631\u064a\u0646.',
  titlePost: '\u0628\u0650\u0639 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647',
  subPost: '\u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0641\u064a 30 \u062b\u0627\u0646\u064a\u0629\u060c \u062b\u0645 \u0627\u0646\u0634\u0631 \u0625\u0639\u0644\u0627\u0646\u0643. \u064a\u0631\u0627\u0633\u0644\u0643 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u062f\u0627\u062e\u0644 \u0628\u0627\u0645\u0628\u064a\u0647\u060c \u0648\u064a\u0628\u0642\u0649 \u0631\u0642\u0645\u0643 \u062e\u0627\u0635\u064b\u0627.',
  titleFree: '\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629 \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u062d\u0633\u0627\u0628 \u0645\u062c\u0627\u0646\u064a',
  subFree: '\u0627\u0644\u0635\u064a\u062f\u0644\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629 \u0648\u0627\u0644\u0645\u0633\u062a\u0634\u0641\u064a\u0627\u062a \u0648\u0635\u062d\u0629 \u0627\u0644\u0645\u0631\u0623\u0629 \u0648\u063a\u064a\u0631\u0647\u0627. 30 \u062b\u0627\u0646\u064a\u0629: \u0627\u0633\u0645\u0643 \u0648\u0631\u0642\u0645\u0643 \u0648\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631.',
  back: '\u062a\u0639\u0648\u062f \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u062d\u064a\u062b \u0643\u0646\u062a.',
  name: '\u0627\u0633\u0645\u0643',
  namePh: '\u0645\u062b\u0627\u0644: \u0632\u064a\u0631\u0645 \u0646\u063a\u0648',
  phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
  phonePh: '6XX XXX XXX',
  phoneHelp: '\u0631\u0642\u0645\u0643 \u0647\u0648 \u0627\u0633\u0645 \u0627\u0644\u062f\u062e\u0648\u0644. \u0644\u0627 \u064a\u0631\u0627\u0647 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646 \u0627\u0644\u0622\u062e\u0631\u0648\u0646 \u0623\u0628\u062f\u064b\u0627.',
  email: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
  emailPh: 'name@example.com',
  emailHelp: '\u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0647\u0648 \u0627\u0633\u0645 \u0627\u0644\u062f\u062e\u0648\u0644. \u0644\u0627 \u064a\u0631\u0627\u0647 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646 \u0627\u0644\u0622\u062e\u0631\u0648\u0646 \u0623\u0628\u062f\u064b\u0627.',
  password: '\u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631',
  passwordPh: '8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
  show: '\u0625\u0638\u0647\u0627\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  hide: '\u0625\u062e\u0641\u0627\u0621 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  consentLead: '\u0628\u0648\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0645\u0631\u0628\u0639 \u0627\u0644\u0648\u0627\u062d\u062f\u060c \u0623\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0627\u0644\u0623\u0645\u0631\u064a\u0646 \u0645\u0639\u064b\u0627:',
  consentItem1: '{terms}\u060c \u0648',
  consentItem2: '\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0628\u064a\u0627\u0646\u0627\u062a\u064a \u0627\u0644\u0634\u062e\u0635\u064a\u0629 \u0643\u0645\u0627 \u062a\u0648\u0636\u0651\u062d {privacy} (\u0627\u0644\u0642\u0627\u0646\u0648\u0646 \u0631\u0642\u0645 2024/017).',
  terms: '\u0634\u0631\u0648\u0637 \u0627\u0644\u062e\u062f\u0645\u0629',
  privacy: '\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629',
  consentNote: '\u0645\u0631\u0628\u0639 \u0648\u0627\u062d\u062f \u0644\u0645\u0648\u0627\u0641\u0642\u062a\u064a\u0646. \u064a\u062d\u062a\u0641\u0638 \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0647\u0630\u0647 \u0627\u0644\u0643\u0644\u0645\u0627\u062a \u0648\u0628\u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0645\u0639 \u062d\u0633\u0627\u0628\u0643.',
  agentAsk: '\u0633\u0627\u0639\u062f\u0643 \u0648\u0643\u064a\u0644 \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647\u061f \u0623\u0636\u0641 \u0631\u0645\u0632\u0647',
  agentLabel: '\u0631\u0645\u0632 \u0627\u0644\u0648\u0643\u064a\u0644 (\u0625\u0646 \u0633\u0627\u0639\u062f\u0643 \u0623\u062d\u062f \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647)',
  agentPh: 'AG12345',
  agentHelp: '\u0627\u062a\u0631\u0643\u0647 \u0641\u0627\u0631\u063a\u064b\u0627 \u0625\u0646 \u0644\u0645 \u064a\u0633\u0627\u0639\u062f\u0643 \u0623\u062d\u062f.',
  create: '\u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u064a \u0627\u0644\u0645\u062c\u0627\u0646\u064a',
  creating: '\u062c\u0627\u0631\u064d \u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643...',
  have: '\u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647\u061f',
  signIn: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
  useEmail: '\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u0631\u0642\u0645 \u0643\u0627\u0645\u064a\u0631\u0648\u0646\u064a\u061f \u0633\u062c\u0651\u0644 \u0628\u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
  usePhone: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0631\u0642\u0645\u064a \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0648\u0646\u064a \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643',
  free: '\u0645\u062c\u0627\u0646\u064a. \u0628\u0644\u0627 \u0628\u0637\u0627\u0642\u0629. \u0644\u0627 \u062a\u062f\u0641\u0639 \u0634\u064a\u0626\u064b\u0627 \u0644\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643.',
  errName: '\u0627\u0643\u062a\u0628 \u0627\u0633\u0645\u0643 (\u062d\u0631\u0641\u0627\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644).',
  errPhone: '\u0627\u0643\u062a\u0628 \u0631\u0642\u0645\u064b\u0627 \u0643\u0627\u0645\u064a\u0631\u0648\u0646\u064a\u064b\u0627: 9 \u0623\u0631\u0642\u0627\u0645 \u062a\u0628\u062f\u0623 \u0628\u0640 6 \u0623\u0648 2.',
  errEmailHere: '\u0647\u0630\u0627 \u0627\u0644\u0646\u0645\u0648\u0630\u062c \u064a\u0637\u0644\u0628 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641. \u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u060c \u0627\u0636\u063a\u0637 \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064a \u0627\u0644\u0623\u0633\u0641\u0644.',
  errEmail: '\u0627\u0643\u062a\u0628 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u060c \u0645\u062b\u0644 name@example.com.',
  errPhoneHere: '\u0647\u0630\u0627 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641. \u0627\u0636\u063a\u0637 \u00ab\u0627\u0633\u062a\u062e\u062f\u0645 \u0631\u0642\u0645\u064a \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0648\u0646\u064a \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643\u00bb \u0641\u064a \u0627\u0644\u0623\u0633\u0641\u0644.',
  errPhoneIn: '\u0631\u0642\u0645 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d \u0641\u064a {country}: {n} \u0623\u0631\u0642\u0627\u0645\u060c \u0645\u062b\u0644 {example}.',
  errClosed: '\u0628\u0627\u0645\u0628\u064a\u0647 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u0628\u0639\u062f \u0641\u064a {country}. \u0633\u062c\u0651\u0644 \u0628\u0639\u0646\u0648\u0627\u0646 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643 (\u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064a \u0627\u0644\u0623\u0633\u0641\u0644).',
  useEmailAny: '\u062a\u0641\u0636\u0651\u0644 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u061f \u0633\u062c\u0651\u0644 \u0628\u0639\u0646\u0648\u0627\u0646 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
  usePhoneAny: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u064a \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643',
  errPhoneHereAny: '\u0647\u0630\u0627 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641. \u0627\u0636\u063a\u0637 \u00ab\u0627\u0633\u062a\u062e\u062f\u0645 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u064a \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643\u00bb \u0641\u064a \u0627\u0644\u0623\u0633\u0641\u0644.',
  country: '\u0627\u0644\u0628\u0644\u062f',
  errPass: '\u064a\u062c\u0628 \u0623\u0646 \u062a\u062a\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0646 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.',
  errConsent: '\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u0641\u064a \u0627\u0644\u0645\u0631\u0628\u0639: \u0641\u0647\u0648 \u064a\u0642\u0628\u0644 \u0634\u0631\u0648\u0637 \u0627\u0644\u062e\u062f\u0645\u0629 \u0648\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0645\u0639\u064b\u0627.',
  errExists: '\u0644\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u062d\u0633\u0627\u0628 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0627\u0644\u0641\u0639\u0644.',
  errExistsEmail: '\u0644\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u062d\u0633\u0627\u0628 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0627\u0644\u0641\u0639\u0644.',
  signInInstead: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645',
  signInInsteadEmail: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
  errWeak: '\u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0623\u0642\u0648\u0649: \u0627\u0645\u0632\u062c \u0627\u0644\u062d\u0631\u0648\u0641 \u0648\u0627\u0644\u0623\u0631\u0642\u0627\u0645.',
  errRate: '\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629 \u062c\u062f\u064b\u0627. \u0627\u0646\u062a\u0638\u0631 \u062f\u0642\u064a\u0642\u0629 \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
  errNet: '\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647. \u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
  errGeneric: '\u062a\u0639\u0630\u0651\u0631 \u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0628\u0639\u062f \u0642\u0644\u064a\u0644.',
  confirmTitle: '\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643',
  confirmSub: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.',
  confirmSubEmail: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.',
  language: '\u0627\u0644\u0644\u063a\u0629',
};

const FF: Record<Key, string> = {
  titleDefault: 'Naat Bambeh meere',
  subDefault: 'Sekond 30: innde maa, limoore telefon maa e finnde. Hay huunde goo jooni.',
  subEmail: 'Sekond 30: innde maa, iimeel maa e finnde. Hay huunde goo jooni.',
  titleContact: 'Haal e jeeyoowo oo e kisal',
  subContact: 'Wa\u0257 konte maa meere nder sekond 30. Yim\u0253e goo njiyataa limoore maa fey.',
  titlePost: 'Jeeyu e Bambeh',
  subPost: 'Wa\u0257 konte maa meere nder sekond 30, caggal \u0257um bayyin anonse maa. Soodoo\u0253e ina mbinndana ma nder Bambeh - limoore maa ina heddoo suu\u0257aande.',
  titleFree: 'Ballal meere ina sokli konte meere',
  subFree: 'Farmasiije, opitaluuji, cellal rew\u0253e e go\u0257\u0257e. Sekond 30: innde maa, limoore maa e finnde.',
  back: 'A rutto tigi ka ngonno\u0257aa.',
  name: 'Innde maa',
  namePh: 'mbaydi: Zerm Ngu',
  phone: 'Limoore telefon',
  phonePh: '6XX XXX XXX',
  phoneHelp: 'Limoore maa woni ko naatirtaa. Yim\u0253e goo njiyataa nde fey.',
  email: 'Iimeel',
  emailPh: 'name@example.com',
  emailHelp: 'Iimeel maa woni ko naatirtaa. Yim\u0253e goo njiyataa \u0257um fey.',
  password: 'Su\u0253o finnde',
  passwordPh: 'Alkule 8 walla \u0253uri',
  show: 'Hollu finnde',
  hide: 'Suu\u0257 finnde',
  consentLead: 'So mi maantinii kesu oo tan, mi ja\u0253ii \u0257i\u0257i \u0257ii fof:',
  consentItem1: '{terms}, e',
  consentItem2: 'Bambeh huutoroo ke\u0253e am no {privacy} holliri (Laawol 2024/017).',
  terms: 'Sar\u0257iiji huutoragol',
  privacy: 'Laawol suturo',
  consentNote: 'Kesu gooto, ja\u0253\u0253u\u0257i \u0257i\u0257i. Bambeh ina jogitoo \u0257ii konngi e \u00f1alnde nde e konte maa.',
  agentAsk: 'Ajan Bambeh walli ma? Winndu kod makko',
  agentLabel: 'Kod ajan (so go\u0257\u0257o Bambeh walli ma)',
  agentPh: 'AG12345',
  agentHelp: 'So hay gooto walliraa ma, accu \u0257um meere.',
  create: 'Wa\u0257 konte am meere',
  creating: 'Ina wa\u0257a konte maa...',
  have: 'A woodi konte Bambeh?',
  signIn: 'Naatu',
  useEmail: 'A alaa limoore Kameruun? Winndito e iimeel',
  usePhone: 'Huutoro limoore Kameruun am',
  free: 'Meere. Karte alaa. A yobataa hay huunde ngam wa\u0257de konte maa.',
  errName: 'Winndu innde maa (alkule 2 walla \u0253uri).',
  errPhone: 'Winndu limoore Kameruun: limooje 9, fu\u0257\u0257oowe e 6 walla 2.',
  errEmailHere: 'Ndee fiche ina naamnita limoore telefon. Ngam iimeel, \u00f1o\u01b4\u01b4u jokkol les ngol.',
  errEmail: 'Winndu iimeel maa, wano name@example.com.',
  errPhoneHere: '\u018aum ko limoore telefon. \u00d1o\u01b4\u01b4u "Huutoro limoore Kameruun am" les.',
  errPhoneIn: 'Limoore nde mo\u01b4\u01b4aani e {country}: limooje {n}, wano {example}.',
  errClosed: 'Bambeh udditaaki tawo e {country}. Winndito e iimeel (jokkol les).',
  useEmailAny: 'A yi\u0257i iimeel? Winndito e iimeel',
  usePhoneAny: 'Huutoro limoore telefon am',
  errPhoneHereAny: '\u018aum ko limoore telefon. \u00d1o\u01b4\u01b4u "Huutoro limoore telefon am" les.',
  country: 'Leydi',
  errPass: 'Finnde maa ina sokli alkule 8 walla \u0253uri.',
  errConsent: 'Maantin kesu oo: ina ja\u0253a Sar\u0257iiji huutoragol e huutoragol ke\u0253e maa fof.',
  errExists: 'Ndee limoore ina jogii konte Bambeh tawo.',
  errExistsEmail: 'Ndee iimeel ina jogii konte Bambeh tawo.',
  signInInstead: 'Naatu e ndee limoore',
  signInInsteadEmail: 'Naatu e ndee iimeel',
  errWeak: 'Su\u0253o finnde \u0253urnde doole: jillin alkule e limooje.',
  errRate: 'A etiima no feewi. Habbo hojom gooto, eto kadi.',
  errNet: 'Men mbaawaa yottaade Bambeh. \u01b3eewto jokkondiral maa, eto kadi.',
  errGeneric: 'Konte maa wa\u0257aaka. Eto kadi see\u0257a caggal.',
  confirmTitle: 'Konte maa wa\u0257aama',
  confirmSub: 'Naatu e limoore telefon maa e finnde maa.',
  confirmSubEmail: 'Naatu e iimeel maa e finnde maa.',
  language: '\u018aemngal',
};

export const JOIN_TEXT: Record<Lang, Record<Key, string>> = { en: EN, fr: FR, pidgin: PIDGIN, ar: AR, ff: FF };

/** The five buttons: the app's own language codes (App.tsx LanguageProvider). */
export const JOIN_LANGS: ReadonlyArray<{ code: Lang; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Fran\u00e7ais' },
  { code: 'pidgin', label: 'Pidgin' },
  { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
  { code: 'ff', label: 'Fulfulde' },
];

/** The screen that showed the box (kept with the account, so the exact words can always be found again). */
export const CONSENT_VERSION = 'FIX762';
/** What the one box covers - both, always together. */
export const CONSENT_COVERS = 'terms_of_service+privacy_policy';

/** The words of the one box as plain text, in her language - what the account keeps. */
export function consentWords(lang: Lang): string {
  const t = JOIN_TEXT[lang];
  return t.consentLead + ' 1. ' + t.consentItem1.replace('{terms}', t.terms) + ' 2. ' + t.consentItem2.replace('{privacy}', t.privacy);
}

/** "the {terms}, and" with the link where the word goes - the word order of each language is kept. */
function withLink(text: string, token: string, link: ReactNode): ReactNode {
  const i = text.indexOf(token);
  if (i < 0) return <>{text} {link}</>;
  return <>{text.slice(0, i)}{link}{text.slice(i + token.length)}</>;
}

type JoinFor = 'contact' | 'post' | 'free' | 'direct';
function param(search: string, name: string): string {
  try { return new URLSearchParams(search || '').get(name) || ''; } catch { return ''; }
}
export function joinFor(search: string): JoinFor {
  const v = param(search, 'for');
  return v === 'contact' || v === 'post' || v === 'free' ? v : 'direct';
}

/** "grace4821": the name in plain letters (at most 12) and 4 digits - a username nobody has to think about. */
export function makeUsername(name: string): string {
  let base = '';
  try { base = name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch { base = name; }
  base = base.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12);
  if (base.length < 2) base = 'member';
  return base + String(1000 + Math.floor(Math.random() * 9000));
}

/** "237677123456@phone.bambeh.com" -> "237677123456" (any African number since FIX777); an email -> null. */
export function phoneDigits(identity: string | null): string | null {
  return digitsOfIdentity(identity);
}

/** "Not a valid number for {country}" with the words put in. */
function withVars(s: string, v: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (v[k] !== undefined ? String(v[k]) : m));
}

/** A real email address to sign in with, in small letters - never the phone's own sign-in address. */
export function cleanEmail(raw: string): string | null {
  const s = String(raw || '').trim().toLowerCase();
  if (s.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return null;
  if (/@phone\.bambeh\.com$/.test(s)) return null;
  return s;
}

/** " ag 12345 " -> "AG12345"; anything that cannot be a code -> "" (a code never blocks the account). */
export function cleanAgentCode(raw: unknown): string {
  const s = String(raw == null ? '' : raw).toUpperCase().replace(/\s+/g, '');
  return /^[A-Z0-9-]{3,16}$/.test(s) ? s : '';
}

/** The key the ?agent= link uses: AgentCapture (FIX508) claims it once she is signed in (as FIX587 did). */
export const AGENT_KEY = 'bambeh:agent:code';
/** FirstVisit (FIX764): the language was taken from the phone, not chosen. Choosing one here ends that. */
const LANG_AUTO_KEY = 'Bambeh_language_auto';

const DRAFT_KEY = 'bambeh_join_draft';
interface Draft { name: string; phone: string; email: string }
function readDraft(): Draft {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) || '{}') as { name?: unknown; phone?: unknown; email?: unknown };
    const s = (x: unknown, n: number) => (typeof x === 'string' ? x.slice(0, n) : '');
    return { name: s(v.name, 60), phone: s(v.phone, 20), email: s(v.email, 254) };
  } catch {
    return { name: '', phone: '', email: '' };
  }
}
function writeDraft(d: Draft): void {
  try { window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* not kept: she types again */ }
}
function clearDraft(): void {
  try { window.sessionStorage.removeItem(DRAFT_KEY); } catch { /* nothing kept */ }
}

/** The app's language for every page (App.tsx listens to this event and keeps the choice). */
function setAppLanguage(code: Lang): void {
  try {
    window.localStorage.setItem('Bambeh_language', code);
    window.localStorage.removeItem(LANG_AUTO_KEY);
  } catch { /* the page still changes */ }
  try { window.dispatchEvent(new CustomEvent('bambeh:langchange', { detail: code })); } catch { /* older browser */ }
}

/**
 * She ticked the box on this page: the Terms are accepted, so the old first screens (language, terms,
 * welcome) are done for this phone. The same keys TermsAcceptance and the welcome screen write.
 */
export function finishFirstScreens(lang: Lang, now: Date = new Date()): void {
  try {
    const ls = window.localStorage;
    const iso = now.toISOString();
    if (!ls.getItem('Bambeh_language')) ls.setItem('Bambeh_language', lang);
    ls.removeItem(LANG_AUTO_KEY);
    ls.setItem('Bambeh_terms_accepted', 'true');
    ls.setItem('Bambeh_terms_accepted_date', iso);
    ls.setItem('Bambeh_ohada_consent_date', iso);
    ls.setItem('Bambeh_welcome_shown', 'true');
    ls.setItem('Bambeh_welcome_completed', 'true');
  } catch {
    // storage blocked: nothing worse than before
  }
}

type Problem = 'exists' | 'weak' | 'rate' | 'net' | 'db' | 'other';
export function problemOf(e: unknown): Problem {
  const o = (e && typeof e === 'object' ? e : {}) as { message?: unknown; status?: unknown; code?: unknown };
  const msg = String(o.message || e || '');
  const code = String(o.code || '');
  const status = Number(o.status || 0);
  if (code === 'user_already_exists' || code === 'email_exists' || /already registered|already exists|already been registered/i.test(msg)) return 'exists';
  if (code === 'weak_password' || /weak|password should|password is too|password must/i.test(msg)) return 'weak';
  if (status === 429 || /rate limit|too many|only request this after/i.test(msg)) return 'rate';
  if (/failed to fetch|network|timeout|load failed|offline|fetcherror/i.test(msg)) return 'net';
  if (status >= 500 || /database error/i.test(msg)) return 'db';
  return 'other';
}

interface SignUpAnswer {
  data: { user?: { identities?: unknown[] | null } | null; session?: unknown } | null;
  error: unknown;
}

async function signUpOnce(email: string, password: string, meta: Record<string, string>): Promise<SignUpAnswer> {
  try {
    const r = (await supabase.auth.signUp({ email, password, options: { data: meta } })) as SignUpAnswer;
    return r || { data: null, error: new Error('no answer') };
  } catch (e) {
    return { data: null, error: e };
  }
}

type Mode = 'phone' | 'email';

export default function QuickJoin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const appLang = normLang(useLang());
  const [pick, setPick] = useState<Lang | null>(null);
  const lang = pick || appLang;
  const t = JOIN_TEXT[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const why = joinFor(location.search);
  // where she goes once she is in - worked out once, so it cannot change under her
  const [target] = useState(() => returnTarget(location.state, location.search));
  const [mode, setMode] = useState<Mode>(() => (param(location.search, 'with') === 'email' ? 'email' : 'phone'));

  const [name, setName] = useState(() => readDraft().name);
  const [phone, setPhone] = useState(() => readDraft().phone);
  const [email, setEmail] = useState(() => readDraft().email);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [consent, setConsent] = useState(false);
  const [agent, setAgent] = useState(() => cleanAgentCode(param(location.search, 'agent')));
  const [agentOpen, setAgentOpen] = useState(() => cleanAgentCode(param(location.search, 'agent')) !== '');
  // FIX777 - the countries open for sign-up (asked fresh: a country switched on a minute ago is offered at once)
  const open = useOpenCountries(true);
  const [country, setCountry] = useState<string>(() => rememberedPhoneCountry());
  const cc = open.signup.indexOf(country) >= 0 ? country : HOME;
  const manyCountries = open.signup.length > 1;
  const [existsDigits, setExistsDigits] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [joined, setJoined] = useState(false);
  const submitting = useRef(false);

  useEffect(() => { writeDraft({ name, phone, email }); }, [name, phone, email]);

  // FIX777 - "opened the sign-up page", once per visit, for Command Center > App usage (nothing personal)
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current || (user && user.id)) return;
    opened.current = true;
    track('join_open', { door: why, lang, mode });
  }, [user, why, lang, mode]);

  // already signed in when she opens this page: straight on
  useEffect(() => {
    if (user && user.id && !submitting.current && !joined) navigate(target, { replace: true });
  }, [user, navigate, target, joined]);

  // the account is made and the phone holds its session: go on as soon as the app knows her. If the app
  // has not noticed within 2 seconds, open the page fresh - the session is saved, so she arrives signed in.
  useEffect(() => {
    if (!joined) return undefined;
    if (user && user.id) { navigate(target, { replace: true }); return undefined; }
    const id = window.setTimeout(() => {
      try {
        window.location.hash = '#' + target;
        if (typeof window.location.reload === 'function') window.location.reload();
      } catch {
        navigate(target, { replace: true });
      }
    }, 2000);
    return () => window.clearTimeout(id);
  }, [joined, user, navigate, target]);

  const byEmail = mode === 'email';
  const title = why === 'contact' ? t.titleContact : why === 'post' ? t.titlePost : why === 'free' ? t.titleFree : t.titleDefault;
  const sub = byEmail ? t.subEmail : why === 'contact' ? t.subContact : why === 'post' ? t.subPost : why === 'free' ? t.subFree : t.subDefault;
  const pass = { pathname: '/login', search: location.search };

  const chooseLang = (code: Lang) => {
    setPick(code);
    setAppLanguage(code);
  };
  const switchMode = () => {
    setMode(byEmail ? 'phone' : 'email');
    setErr(null);
    setExists(false);
  };
  // she changes something: an old message no longer applies
  const fresh = () => {
    if (err) setErr(null);
    if (exists) setExists(false);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    const how: 'phone' | 'email' = byEmail ? 'email' : 'phone';
    // FIX777 - every stop is noted with its reason (a word, never what she typed)
    const stop = (msg: string, reason: string, where: string | null = byEmail ? null : cc) => {
      setErr(msg);
      track('join_failed', { door: why, lang, mode: how, country: where, reason });
    };
    track('join_submit', { door: why, lang, mode: how, country: byEmail ? null : cc });
    const cleanName = name.trim().replace(/\s+/g, ' ');
    setExists(false);
    if (cleanName.length < 2) { stop(t.errName, 'name'); return; }
    let identity = '';
    let digits: string | null = null;
    let numberCountry: string | null = null;
    if (byEmail) {
      const address = cleanEmail(email);
      const isPhone = !!parsePhone(email.trim(), cc) || !!digitsOfIdentity(email.trim());
      if (!address) { stop(isPhone ? (manyCountries ? t.errPhoneHereAny : t.errPhoneHere) : t.errEmail, 'email'); return; }
      identity = address;
    } else {
      const pp = parsePhone(phone.trim(), cc, open.signup);
      if (!pp) {
        if (phone.indexOf('@') >= 0) { stop(t.errEmailHere, 'phone'); return; }
        const elsewhere = parsePhone(phone.trim(), cc);
        if (elsewhere && open.signup.indexOf(elsewhere.code) < 0) {
          stop(withVars(t.errClosed, { country: countryName(elsewhere.code, lang) }), 'closed', elsewhere.code);
          return;
        }
        stop(cc === HOME ? t.errPhone : withVars(t.errPhoneIn, { country: countryName(cc, lang), n: lengthsText(cc), example: phonePlaceholder(cc) }), 'phone');
        return;
      }
      identity = phoneIdentity(pp);
      digits = pp.digits;
      numberCountry = pp.code;
      if (pp.code !== cc) setCountry(pp.code);
    }
    if (password.length < 8) { stop(t.errPass, 'password'); return; }
    if (!consent) { stop(t.errConsent, 'consent'); return; }
    setErr(null);
    setBusy(true);
    submitting.current = true;
    const now = new Date();
    // she ticked the box: the Terms are accepted on this phone whatever happens next
    finishFirstScreens(lang, now);
    // an agent's code goes where the ?agent= link puts it (FIX587): AgentCapture claims it once she is in
    const code = cleanAgentCode(agent);
    if (code) {
      try { window.localStorage.setItem(AGENT_KEY, code); } catch { /* a lost code costs a number on a dashboard, never the account */ }
    }
    const meta: Record<string, string> = {
      full_name: cleanName.slice(0, 60),
      username: makeUsername(cleanName),
      signup_via: 'quick',
      join_for: why,
      signup_lang: lang,
      terms_accepted_at: now.toISOString(),
      privacy_consent_at: now.toISOString(),
      consent_covers: CONSENT_COVERS,
      consent_words: consentWords(lang),
      consent_version: CONSENT_VERSION,
    };
    if (digits) meta.phone = digits;
    if (numberCountry) meta.phone_country = numberCountry; // FIX777
    let res = await signUpOnce(identity, password, meta);
    // a username already taken (or a busy database): one more try with new digits
    if (res.error && problemOf(res.error) === 'db') res = await signUpOnce(identity, password, { ...meta, username: makeUsername(cleanName) });
    const ids = res.data && res.data.user ? res.data.user.identities : null;
    if (res.error || (Array.isArray(ids) && ids.length === 0)) {
      const p = res.error ? problemOf(res.error) : 'exists';
      setErr(p === 'exists' ? (byEmail ? t.errExistsEmail : t.errExists) : p === 'weak' ? t.errWeak : p === 'rate' ? t.errRate : p === 'net' ? t.errNet : t.errGeneric);
      setExists(p === 'exists');
      // the sign-in page gets the number as it reads it: 9 digits for Cameroon, with the country code elsewhere
      if (p === 'exists' && digits) setExistsDigits(numberCountry === HOME ? digits.slice(3) : digits);
      track('join_failed', { door: why, lang, mode: how, country: numberCountry, reason: p });
      setBusy(false);
      submitting.current = false;
      return;
    }
    clearDraft();
    forgetLink();
    if (numberCountry) rememberPhoneCountry(numberCountry); // FIX777 - the sign-in page reads her number the same way
    track('join_created', { door: why, lang, mode: how, country: numberCountry });
    if (!res.data || !res.data.session) {
      // a project that asks to confirm the address first: she signs in herself
      setBusy(false);
      submitting.current = false;
      setConfirm(true);
      return;
    }
    setJoined(true);
  };

  const field = 'mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200';
  const fieldRow = 'min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200';
  const existsTo = byEmail
    ? pass
    : { pathname: '/login', search: '?phone=' + encodeURIComponent(existsDigits || phone.replace(/\D/g, '').slice(-9)) + (location.search ? '&' + location.search.slice(1) : '') };

  return (
    <section dir={dir} data-fix="FIX777" className="w-full">
      <div className="mb-3 flex flex-wrap justify-center gap-1" role="group" aria-label={t.language}>
        {JOIN_LANGS.map((l) => (
          <button key={l.code} type="button" onClick={() => chooseLang(l.code)} aria-pressed={lang === l.code} data-lang-btn={l.code}
                  className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + (lang === l.code ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200')}>
            {l.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-xl sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold leading-tight text-gray-900">{title}</h1>
          <p className="mt-1.5 text-sm text-gray-600">{sub}</p>
          {target !== '/' && <p className="mt-1 text-xs font-semibold text-teal-700" data-back="1">{t.back}</p>}
        </div>

        {confirm ? (
          <div className="mt-6 space-y-3 text-center" data-confirm="1" role="status">
            <ShieldCheck className="mx-auto h-10 w-10 text-teal-600" aria-hidden="true" />
            <p className="text-lg font-bold text-gray-900">{t.confirmTitle}</p>
            <p className="text-sm text-gray-600">{byEmail ? t.confirmSubEmail : t.confirmSub}</p>
            <Link to={pass} state={location.state} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white">
              {t.signIn}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="mt-5 space-y-3.5" noValidate>
            <label className="block text-sm font-medium text-gray-700">
              {t.name}
              <input value={name} onChange={(e) => { setName(e.target.value.slice(0, 60)); fresh(); }} placeholder={t.namePh} autoComplete="name"
                     maxLength={60} data-f="name" className={field} />
            </label>
            {byEmail ? (
              <label className="block text-sm font-medium text-gray-700">
                {t.email}
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value.slice(0, 254)); fresh(); }} placeholder={t.emailPh} inputMode="email"
                       autoComplete="email" autoCapitalize="none" spellCheck={false} dir="ltr" data-f="email" className={field} />
                <span className="mt-1 block text-xs font-normal text-gray-500">{t.emailHelp}</span>
              </label>
            ) : (
              <div className="block text-sm font-medium text-gray-700" data-phone-row="1">
                <label htmlFor="join-phone">{t.phone}</label>
                <div className="mt-1 flex items-stretch gap-2" dir="ltr">
                  <CountryPicker value={cc} codes={open.signup} onChange={(k) => { setCountry(k); fresh(); }} lang={lang} className="text-base" />
                  <input id="join-phone" value={phone} onChange={(e) => { setPhone(e.target.value.slice(0, 20)); fresh(); }}
                         placeholder={cc === HOME ? t.phonePh : phonePlaceholder(cc)} inputMode="tel" aria-label={t.phone + ' (' + countryName(cc, lang) + ')'}
                         autoComplete="tel-national" dir="ltr" data-f="phone" className={fieldRow} />
                </div>
                <span className="mt-1 block text-xs font-normal text-gray-500">{t.phoneHelp}</span>
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700">
              {t.password}
              <span className="relative mt-1 block">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); fresh(); }}
                       dir={lang === 'ar' && !password ? 'rtl' : 'ltr'}
                       placeholder={t.passwordPh} autoComplete="new-password" data-f="password" className={field + ' mt-0 pr-12'} />
                <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? t.hide : t.show} data-show-pw="1"
                        className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {agentOpen ? (
              <label className="block text-sm font-medium text-gray-700">
                {t.agentLabel}
                <input value={agent} onChange={(e) => { setAgent(e.target.value.toUpperCase().slice(0, 20)); fresh(); }} placeholder={t.agentPh}
                       autoComplete="off" autoCapitalize="characters" spellCheck={false} dir="ltr" data-f="agent" className={field + ' uppercase tracking-wider'} />
                <span className="mt-1 block text-xs font-normal text-gray-500">{t.agentHelp}</span>
              </label>
            ) : (
              <button type="button" onClick={() => setAgentOpen(true)} data-agent-open="1" className="block text-xs font-medium text-teal-700 underline">
                {t.agentAsk}
              </button>
            )}

            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3" data-consent-box="1">
              <label className="flex items-start gap-2.5 text-sm text-gray-800">
                <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); fresh(); }} data-f="consent"
                       className="mt-0.5 h-5 w-5 flex-shrink-0 accent-teal-600" />
                <span>
                  <span className="block font-semibold">{t.consentLead}</span>
                  <span className="mt-1 flex gap-1.5" data-consent-item="1">
                    <span>1.</span>
                    <span>{withLink(t.consentItem1, '{terms}', <Link to="/terms-of-service" className="font-semibold text-teal-700 underline">{t.terms}</Link>)}</span>
                  </span>
                  <span className="mt-0.5 flex gap-1.5" data-consent-item="2">
                    <span>2.</span>
                    <span>{withLink(t.consentItem2, '{privacy}', <Link to="/privacy-policy" className="font-semibold text-teal-700 underline">{t.privacy}</Link>)}</span>
                  </span>
                </span>
              </label>
              <p className="mt-2 text-xs text-gray-500" data-consent-note="1">{t.consentNote}</p>
            </div>

            {err && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert" data-err="1">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{err}</span>
              </div>
            )}
            {exists && (
              <Link to={existsTo} state={location.state} data-exists-signin="1"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-600 py-2.5 text-sm font-semibold text-teal-700">
                {byEmail ? t.signInInsteadEmail : t.signInInstead}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            )}

            <button type="submit" disabled={busy} data-join="1"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-base font-bold text-white shadow hover:bg-teal-700 disabled:bg-gray-300">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
              {busy ? t.creating : t.create}
            </button>
            <p className="text-center text-xs text-gray-500">{t.free}</p>
          </form>
        )}

        {!confirm && (
          <div className="mt-5 space-y-2 text-center text-sm">
            <p className="text-gray-600">
              {t.have}{' '}
              <Link to={pass} state={location.state} data-signin-link="1" className="font-semibold text-teal-700 hover:underline">{t.signIn}</Link>
            </p>
            <button type="button" onClick={switchMode} data-email-link="1" className="mx-auto block text-xs text-gray-500 underline">
              {byEmail ? (manyCountries ? t.usePhoneAny : t.usePhone) : (manyCountries ? t.useEmailAny : t.useEmail)}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
// BAMBEH_END_TOKEN__QUICK_JOIN_FIX777__COMPLETE
