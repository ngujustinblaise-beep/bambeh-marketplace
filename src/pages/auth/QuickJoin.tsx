// BAMBEH_DEPLOY_TOKEN__QUICK_JOIN_FIX756_CLEAN
/**
 * src/pages/auth/QuickJoin.tsx - FIX756 (new) - route /join
 *
 * THE 30-SECOND FREE ACCOUNT (the "micro account"). Big, 14 Oct 2026: "have we fixed the micro signup
 * that collects the data gradually? with very least friction?"
 *
 * What FIX754 showed on 14 Oct: 76 new phones opened Bambeh in six days, only 13 of them ever used an
 * account, and 8 came back another day. 90 of 103 accounts have no security answers - the questions
 * covered the screen the minute an account was made (FIX757: now from the second day, with Later).
 *
 *   - THREE FIELDS: name, phone number, password (8 or more - the sign-in page's rule, FIX656), and ONE
 *     unticked box for the Terms of Use and the Privacy Policy (Law No. 2024/017), with links to read them.
 *   - The phone number is the login (237XXXXXXXXX@phone.bambeh.com, FIX283 - she never sees that address).
 *     It is never shown to other users.
 *   - Language: the app's own; five buttons on the page change it for the whole app.
 *   - This page covers the first screens: after it, no language, terms or welcome screen - she accepted
 *     the terms here. The security questions wait until the second day (FIX757).
 *   - Then straight back to what she was doing (returnTo, FIX755): the item, the advert form, the free page.
 *     ?for=contact | post | free sets the words at the top (all true - no promise Bambeh does not keep).
 *   - What she typed (never the password) survives a look at the Terms (this visit only, sessionStorage).
 *   - Saved with the account: name, phone, a username made from the name, when she accepted the Terms,
 *     and "signup_via": "quick" + "join_for", so Bambeh can count which doors bring people in.
 * Not here, on purpose: email, town, photo, security questions - each is asked later, when it is needed.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/hooks/useAppLang';
import { authIdentity } from '@/utils/phoneAuth';
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
  titleContact: 'Contact the seller safely',
  subContact: 'Create your free account in 30 seconds. Your phone number is never shown to other users.',
  titlePost: 'Sell on Bambeh',
  subPost: 'Create your free account in 30 seconds, then post your advert. Buyers write to you inside Bambeh - your number stays private.',
  titleFree: 'Free help needs a free account',
  subFree: 'Pharmacies on call, hospitals, women\'s health and more. 30 seconds: your name, your number and a password.',
  back: 'You come straight back to where you were.',
  name: 'Your name',
  namePh: 'e.g. Grace Mbah',
  phone: 'Phone number',
  phonePh: '6XX XXX XXX',
  phoneHelp: 'Your number is your login. Other users never see it.',
  password: 'Choose a password',
  passwordPh: 'At least 8 characters',
  show: 'Show password',
  hide: 'Hide password',
  consentA: 'I accept the ',
  terms: 'Terms of Use',
  consentB: ' and the ',
  privacy: 'Privacy Policy',
  consentC: ', and I agree that Bambeh uses my name and phone number to run my account (Law No. 2024/017).',
  create: 'Create my free account',
  creating: 'Creating your account...',
  have: 'Already on Bambeh?',
  signIn: 'Sign in',
  useEmail: 'No Cameroon number? Sign up with an email address',
  free: 'Free. No card. Nothing to pay to create your account.',
  errName: 'Write your name (at least 2 letters).',
  errPhone: 'Write a Cameroon number: 9 digits, starting with 6 or 2.',
  errEmailHere: 'This form takes a phone number. To use an email address, tap the link at the bottom.',
  errPass: 'Your password needs at least 8 characters.',
  errConsent: 'Tick the box to accept the Terms of Use and the Privacy Policy.',
  errExists: 'This number already has a Bambeh account.',
  signInInstead: 'Sign in with this number',
  errWeak: 'Choose a stronger password: mix letters and numbers.',
  errRate: 'Too many tries. Wait a minute, then try again.',
  errNet: 'We could not reach Bambeh. Check your connection and try again.',
  errGeneric: 'Your account could not be created. Try again in a moment.',
  confirmTitle: 'Your account is created',
  confirmSub: 'Sign in with your phone number and your password.',
  language: 'Language',
};
export type Key = keyof typeof EN;

const FR: Record<Key, string> = {
  titleDefault: 'Rejoignez Bambeh gratuitement',
  subDefault: '30 secondes : votre nom, votre num\u00e9ro de t\u00e9l\u00e9phone et un mot de passe. Rien d\u2019autre pour le moment.',
  titleContact: 'Contactez le vendeur en toute s\u00e9curit\u00e9',
  subContact: 'Cr\u00e9ez votre compte gratuit en 30 secondes. Votre num\u00e9ro n\u2019est jamais montr\u00e9 aux autres utilisateurs.',
  titlePost: 'Vendez sur Bambeh',
  subPost: 'Cr\u00e9ez votre compte gratuit en 30 secondes, puis publiez votre annonce. Les acheteurs vous \u00e9crivent dans Bambeh : votre num\u00e9ro reste priv\u00e9.',
  titleFree: 'L\u2019aide gratuite demande un compte gratuit',
  subFree: 'Pharmacies de garde, h\u00f4pitaux, sant\u00e9 des femmes et plus. 30 secondes : votre nom, votre num\u00e9ro et un mot de passe.',
  back: 'Vous revenez directement l\u00e0 o\u00f9 vous \u00e9tiez.',
  name: 'Votre nom',
  namePh: 'ex. Grace Mbah',
  phone: 'Num\u00e9ro de t\u00e9l\u00e9phone',
  phonePh: '6XX XXX XXX',
  phoneHelp: 'Votre num\u00e9ro sert \u00e0 vous connecter. Les autres utilisateurs ne le voient jamais.',
  password: 'Choisissez un mot de passe',
  passwordPh: 'Au moins 8 caract\u00e8res',
  show: 'Afficher le mot de passe',
  hide: 'Masquer le mot de passe',
  consentA: 'J\u2019accepte les ',
  terms: 'Conditions d\u2019utilisation',
  consentB: ' et la ',
  privacy: 'Politique de confidentialit\u00e9',
  consentC: ', et j\u2019accepte que Bambeh utilise mon nom et mon num\u00e9ro pour g\u00e9rer mon compte (loi n\u00b0 2024/017).',
  create: 'Cr\u00e9er mon compte gratuit',
  creating: 'Cr\u00e9ation du compte...',
  have: 'D\u00e9j\u00e0 sur Bambeh ?',
  signIn: 'Se connecter',
  useEmail: 'Pas de num\u00e9ro camerounais ? Inscrivez-vous avec une adresse e-mail',
  free: 'Gratuit. Sans carte. Rien \u00e0 payer pour cr\u00e9er votre compte.',
  errName: '\u00c9crivez votre nom (au moins 2 lettres).',
  errPhone: '\u00c9crivez un num\u00e9ro camerounais : 9 chiffres, commen\u00e7ant par 6 ou 2.',
  errEmailHere: 'Ce formulaire demande un num\u00e9ro de t\u00e9l\u00e9phone. Pour une adresse e-mail, touchez le lien en bas.',
  errPass: 'Votre mot de passe doit avoir au moins 8 caract\u00e8res.',
  errConsent: 'Cochez la case pour accepter les Conditions d\u2019utilisation et la Politique de confidentialit\u00e9.',
  errExists: 'Ce num\u00e9ro a d\u00e9j\u00e0 un compte Bambeh.',
  signInInstead: 'Se connecter avec ce num\u00e9ro',
  errWeak: 'Choisissez un mot de passe plus solide : m\u00e9langez lettres et chiffres.',
  errRate: 'Trop d\u2019essais. Attendez une minute, puis r\u00e9essayez.',
  errNet: 'Impossible de joindre Bambeh. V\u00e9rifiez votre connexion et r\u00e9essayez.',
  errGeneric: 'Votre compte n\u2019a pas pu \u00eatre cr\u00e9\u00e9. R\u00e9essayez dans un instant.',
  confirmTitle: 'Votre compte est cr\u00e9\u00e9',
  confirmSub: 'Connectez-vous avec votre num\u00e9ro et votre mot de passe.',
  language: 'Langue',
};

const PIDGIN: Record<Key, string> = {
  titleDefault: 'Join Bambeh free',
  subDefault: '30 seconds: your name, your phone number and password. Nothing more for now.',
  titleContact: 'Contact the seller safe',
  subContact: 'Make your free account for 30 seconds. Other people no di ever see your number.',
  titlePost: 'Sell for Bambeh',
  subPost: 'Make your free account for 30 seconds, then post your advert. Buyers go write you inside Bambeh - your number go stay private.',
  titleFree: 'Free help need free account',
  subFree: 'Pharmacy weh e open, hospital, woman health and more. 30 seconds: your name, your number and password.',
  back: 'You go come back straight for where you been dey.',
  name: 'Your name',
  namePh: 'e.g. Grace Mbah',
  phone: 'Phone number',
  phonePh: '6XX XXX XXX',
  phoneHelp: 'Your number na your login. Other people no di ever see am.',
  password: 'Choose password',
  passwordPh: '8 character or more',
  show: 'Show password',
  hide: 'Hide password',
  consentA: 'I accept the ',
  terms: 'Terms of Use',
  consentB: ' and the ',
  privacy: 'Privacy Policy',
  consentC: ', and I agree say Bambeh go use my name and phone number to run my account (Law No. 2024/017).',
  create: 'Make my free account',
  creating: 'We di make your account...',
  have: 'You don already dey Bambeh?',
  signIn: 'Sign in',
  useEmail: 'You no get Cameroon number? Sign up with email',
  free: 'Free. No card. You no pay anything to make your account.',
  errName: 'Write your name (2 letters or more).',
  errPhone: 'Write Cameroon number: 9 numbers, start with 6 or 2.',
  errEmailHere: 'This form want phone number. For email, touch the link for down.',
  errPass: 'Your password need 8 character or more.',
  errConsent: 'Tick the box to accept the Terms of Use and the Privacy Policy.',
  errExists: 'This number don already get Bambeh account.',
  signInInstead: 'Sign in with this number',
  errWeak: 'Choose strong password: mix letters and numbers.',
  errRate: 'You don try too many times. Wait one minute, then try again.',
  errNet: 'We no fit reach Bambeh. Check your connection and try again.',
  errGeneric: 'We no fit make your account. Try again small time.',
  confirmTitle: 'Your account don ready',
  confirmSub: 'Sign in with your phone number and your password.',
  language: 'Language',
};

const AR: Record<Key, string> = {
  titleDefault: '\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0645\u062c\u0627\u0646\u064b\u0627',
  subDefault: '30 \u062b\u0627\u0646\u064a\u0629: \u0627\u0633\u0645\u0643 \u0648\u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643 \u0648\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631. \u0644\u0627 \u0634\u064a\u0621 \u0622\u062e\u0631 \u0627\u0644\u0622\u0646.',
  titleContact: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0628\u0627\u0626\u0639 \u0628\u0623\u0645\u0627\u0646',
  subContact: '\u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0641\u064a 30 \u062b\u0627\u0646\u064a\u0629. \u0644\u0627 \u064a\u064f\u0639\u0631\u0636 \u0631\u0642\u0645\u0643 \u0623\u0628\u062f\u064b\u0627 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u0627\u0644\u0622\u062e\u0631\u064a\u0646.',
  titlePost: '\u0628\u0650\u0639 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647',
  subPost: '\u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0641\u064a 30 \u062b\u0627\u0646\u064a\u0629\u060c \u062b\u0645 \u0627\u0646\u0634\u0631 \u0625\u0639\u0644\u0627\u0646\u0643. \u064a\u0631\u0627\u0633\u0644\u0643 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u062f\u0627\u062e\u0644 \u0628\u0627\u0645\u0628\u064a\u0647\u060c \u0648\u064a\u0628\u0642\u0649 \u0631\u0642\u0645\u0643 \u062e\u0627\u0635\u064b\u0627.',
  titleFree: '\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629 \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u062d\u0633\u0627\u0628 \u0645\u062c\u0627\u0646\u064a',
  subFree: '\u0627\u0644\u0635\u064a\u062f\u0644\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629 \u0648\u0627\u0644\u0645\u0633\u062a\u0634\u0641\u064a\u0627\u062a \u0648\u0635\u062d\u0629 \u0627\u0644\u0645\u0631\u0623\u0629 \u0648\u063a\u064a\u0631\u0647\u0627. 30 \u062b\u0627\u0646\u064a\u0629: \u0627\u0633\u0645\u0643 \u0648\u0631\u0642\u0645\u0643 \u0648\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631.',
  back: '\u062a\u0639\u0648\u062f \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u062d\u064a\u062b \u0643\u0646\u062a.',
  name: '\u0627\u0633\u0645\u0643',
  namePh: '\u0645\u062b\u0627\u0644: \u063a\u0631\u064a\u0633 \u0645\u0628\u0627',
  phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
  phonePh: '6XX XXX XXX',
  phoneHelp: '\u0631\u0642\u0645\u0643 \u0647\u0648 \u0627\u0633\u0645 \u0627\u0644\u062f\u062e\u0648\u0644. \u0644\u0627 \u064a\u0631\u0627\u0647 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646 \u0627\u0644\u0622\u062e\u0631\u0648\u0646 \u0623\u0628\u062f\u064b\u0627.',
  password: '\u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631',
  passwordPh: '8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
  show: '\u0625\u0638\u0647\u0627\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  hide: '\u0625\u062e\u0641\u0627\u0621 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  consentA: '\u0623\u0642\u0628\u0644 ',
  terms: '\u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645',
  consentB: ' \u0648',
  privacy: '\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629',
  consentC: '\u060c \u0648\u0623\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0623\u0646 \u064a\u0633\u062a\u062e\u062f\u0645 \u0628\u0627\u0645\u0628\u064a\u0647 \u0627\u0633\u0645\u064a \u0648\u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u064a \u0644\u0625\u062f\u0627\u0631\u0629 \u062d\u0633\u0627\u0628\u064a (\u0627\u0644\u0642\u0627\u0646\u0648\u0646 \u0631\u0642\u0645 2024/017).',
  create: '\u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u064a \u0627\u0644\u0645\u062c\u0627\u0646\u064a',
  creating: '\u062c\u0627\u0631\u064d \u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643...',
  have: '\u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647\u061f',
  signIn: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
  useEmail: '\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u0631\u0642\u0645 \u0643\u0627\u0645\u064a\u0631\u0648\u0646\u064a\u061f \u0633\u062c\u0651\u0644 \u0628\u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
  free: '\u0645\u062c\u0627\u0646\u064a. \u0628\u0644\u0627 \u0628\u0637\u0627\u0642\u0629. \u0644\u0627 \u062a\u062f\u0641\u0639 \u0634\u064a\u0626\u064b\u0627 \u0644\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643.',
  errName: '\u0627\u0643\u062a\u0628 \u0627\u0633\u0645\u0643 (\u062d\u0631\u0641\u0627\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644).',
  errPhone: '\u0627\u0643\u062a\u0628 \u0631\u0642\u0645\u064b\u0627 \u0643\u0627\u0645\u064a\u0631\u0648\u0646\u064a\u064b\u0627: 9 \u0623\u0631\u0642\u0627\u0645 \u062a\u0628\u062f\u0623 \u0628\u0640 6 \u0623\u0648 2.',
  errEmailHere: '\u0647\u0630\u0627 \u0627\u0644\u0646\u0645\u0648\u0630\u062c \u064a\u0637\u0644\u0628 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641. \u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u060c \u0627\u0636\u063a\u0637 \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064a \u0627\u0644\u0623\u0633\u0641\u0644.',
  errPass: '\u064a\u062c\u0628 \u0623\u0646 \u062a\u062a\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0646 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.',
  errConsent: '\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u0641\u064a \u0627\u0644\u0645\u0631\u0628\u0639 \u0644\u0642\u0628\u0648\u0644 \u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0648\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629.',
  errExists: '\u0644\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u062d\u0633\u0627\u0628 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0627\u0644\u0641\u0639\u0644.',
  signInInstead: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645',
  errWeak: '\u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0623\u0642\u0648\u0649: \u0627\u0645\u0632\u062c \u0627\u0644\u062d\u0631\u0648\u0641 \u0648\u0627\u0644\u0623\u0631\u0642\u0627\u0645.',
  errRate: '\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629 \u062c\u062f\u064b\u0627. \u0627\u0646\u062a\u0638\u0631 \u062f\u0642\u064a\u0642\u0629 \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
  errNet: '\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647. \u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
  errGeneric: '\u062a\u0639\u0630\u0651\u0631 \u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0628\u0639\u062f \u0642\u0644\u064a\u0644.',
  confirmTitle: '\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643',
  confirmSub: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.',
  language: '\u0627\u0644\u0644\u063a\u0629',
};

const FF: Record<Key, string> = {
  titleDefault: 'Naat Bambeh meere',
  subDefault: 'Sekond 30: innde maa, limoore telefon maa e finnde. Hay huunde goo jooni.',
  titleContact: 'Haal e jeeyoowo oo e kisal',
  subContact: 'Wa\u0257 konte maa meere nder sekond 30. Yim\u0253e goo njiyataa limoore maa fey.',
  titlePost: 'Jeeyu e Bambeh',
  subPost: 'Wa\u0257 konte maa meere nder sekond 30, caggal \u0257um bayyin anonse maa. Soodoo\u0253e ina mbinndana ma nder Bambeh - limoore maa ina heddoo suu\u0257aande.',
  titleFree: 'Ballal meere ina sokli konte meere',
  subFree: 'Farmasiije, opitaluuji, cellal rew\u0253e e go\u0257\u0257e. Sekond 30: innde maa, limoore maa e finnde.',
  back: 'A rutto tigi ka ngonno\u0257aa.',
  name: 'Innde maa',
  namePh: 'mbaydi: Grace Mbah',
  phone: 'Limoore telefon',
  phonePh: '6XX XXX XXX',
  phoneHelp: 'Limoore maa woni ko naatirtaa. Yim\u0253e goo njiyataa nde fey.',
  password: 'Su\u0253o finnde',
  passwordPh: 'Alkule 8 walla \u0253uri',
  show: 'Hollu finnde',
  hide: 'Suu\u0257 finnde',
  consentA: 'Mi ja\u0253ii ',
  terms: 'Sar\u0257iiji huutoragol',
  consentB: ' e ',
  privacy: 'Laawol suturo',
  consentC: ', mi ja\u0253ii Bambeh huutoroo innde am e limoore telefon am ngam konte am (Laawol 2024/017).',
  create: 'Wa\u0257 konte am meere',
  creating: 'Ina wa\u0257a konte maa...',
  have: 'A woodi konte Bambeh?',
  signIn: 'Naatu',
  useEmail: 'A alaa limoore Kameruun? Winndito e iimeel',
  free: 'Meere. Karte alaa. A yobataa hay huunde ngam wa\u0257de konte maa.',
  errName: 'Winndu innde maa (alkule 2 walla \u0253uri).',
  errPhone: 'Winndu limoore Kameruun: limooje 9, fu\u0257\u0257oowe e 6 walla 2.',
  errEmailHere: 'Ndee fiche ina naamnita limoore telefon. Ngam iimeel, \u00f1o\u01b4\u01b4u jokkol les ngol.',
  errPass: 'Finnde maa ina sokli alkule 8 walla \u0253uri.',
  errConsent: 'Maantin kesu oo ngam ja\u0253de Sar\u0257iiji huutoragol e Laawol suturo.',
  errExists: 'Ndee limoore ina jogii konte Bambeh tawo.',
  signInInstead: 'Naatu e ndee limoore',
  errWeak: 'Su\u0253o finnde \u0253urnde doole: jillin alkule e limooje.',
  errRate: 'A etiima no feewi. Habbo hojom gooto, eto kadi.',
  errNet: 'Men mbaawaa yottaade Bambeh. \u01b3eewto jokkondiral maa, eto kadi.',
  errGeneric: 'Konte maa wa\u0257aaka. Eto kadi see\u0257a caggal.',
  confirmTitle: 'Konte maa wa\u0257aama',
  confirmSub: 'Naatu e limoore telefon maa e finnde maa.',
  language: '\u0181emngal',
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

type JoinFor = 'contact' | 'post' | 'free' | 'direct';
export function joinFor(search: string): JoinFor {
  let v = '';
  try { v = new URLSearchParams(search || '').get('for') || ''; } catch { v = ''; }
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

/** "237677123456@phone.bambeh.com" -> "237677123456"; anything else -> null (an email, a wrong number). */
export function phoneDigits(identity: string | null): string | null {
  const m = /^\+?(237[26]\d{8})@phone\.bambeh\.com$/i.exec(String(identity || ''));
  return m ? m[1] : null;
}

const DRAFT_KEY = 'bambeh_join_draft';
function readDraft(): { name: string; phone: string } {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) || '{}') as { name?: unknown; phone?: unknown };
    return { name: typeof v.name === 'string' ? v.name.slice(0, 60) : '', phone: typeof v.phone === 'string' ? v.phone.slice(0, 20) : '' };
  } catch {
    return { name: '', phone: '' };
  }
}
function writeDraft(name: string, phone: string): void {
  try { window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ name, phone })); } catch { /* not kept: she types again */ }
}
function clearDraft(): void {
  try { window.sessionStorage.removeItem(DRAFT_KEY); } catch { /* nothing kept */ }
}

/** The app's language for every page (App.tsx listens to this event and keeps the choice). */
function setAppLanguage(code: Lang): void {
  try { window.localStorage.setItem('Bambeh_language', code); } catch { /* the page still changes */ }
  try { window.dispatchEvent(new CustomEvent('bambeh:langchange', { detail: code })); } catch { /* older browser */ }
}

/**
 * She accepted the Terms on this page: the first screens (language, terms, welcome) are done for this phone.
 * The same keys TermsAcceptance and the welcome screen write.
 */
export function finishFirstScreens(lang: Lang, now: Date = new Date()): void {
  try {
    const ls = window.localStorage;
    const iso = now.toISOString();
    if (!ls.getItem('Bambeh_language')) ls.setItem('Bambeh_language', lang);
    ls.setItem('Bambeh_terms_accepted', 'true');
    ls.setItem('Bambeh_terms_accepted_date', iso);
    ls.setItem('Bambeh_ohada_consent_date', iso);
    ls.setItem('Bambeh_welcome_shown', 'true');
    ls.setItem('Bambeh_welcome_completed', 'true');
  } catch {
    // storage blocked: the first screens may show once more, nothing worse
  }
}

type Problem = 'exists' | 'weak' | 'rate' | 'net' | 'db' | 'other';
export function problemOf(e: unknown): Problem {
  const o = (e && typeof e === 'object' ? e : {}) as { message?: unknown; status?: unknown; code?: unknown };
  const msg = String(o.message || e || '');
  const code = String(o.code || '');
  const status = Number(o.status || 0);
  if (code === 'user_already_exists' || /already registered|already exists|already been registered/i.test(msg)) return 'exists';
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

  const [name, setName] = useState(() => readDraft().name);
  const [phone, setPhone] = useState(() => readDraft().phone);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [joined, setJoined] = useState(false);
  const submitting = useRef(false);

  useEffect(() => { writeDraft(name, phone); }, [name, phone]);

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

  const title = why === 'contact' ? t.titleContact : why === 'post' ? t.titlePost : why === 'free' ? t.titleFree : t.titleDefault;
  const sub = why === 'contact' ? t.subContact : why === 'post' ? t.subPost : why === 'free' ? t.subFree : t.subDefault;
  const pass = { pathname: '/login', search: location.search };

  const chooseLang = (code: Lang) => {
    setPick(code);
    setAppLanguage(code);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const identity = authIdentity(phone.trim());
    const digits = phoneDigits(identity);
    setExists(false);
    if (cleanName.length < 2) { setErr(t.errName); return; }
    if (!digits) { setErr(phone.indexOf('@') >= 0 ? t.errEmailHere : t.errPhone); return; }
    if (password.length < 8) { setErr(t.errPass); return; }
    if (!consent) { setErr(t.errConsent); return; }
    setErr(null);
    setBusy(true);
    submitting.current = true;
    const now = new Date();
    // she ticked the box: the first screens are done whatever happens next
    finishFirstScreens(lang, now);
    const meta: Record<string, string> = {
      full_name: cleanName.slice(0, 60),
      phone: digits,
      username: makeUsername(cleanName),
      signup_via: 'quick',
      join_for: why,
      signup_lang: lang,
      terms_accepted_at: now.toISOString(),
      privacy_consent_at: now.toISOString(),
    };
    let res = await signUpOnce(identity as string, password, meta);
    // a username already taken (or a busy database): one more try with new digits
    if (res.error && problemOf(res.error) === 'db') res = await signUpOnce(identity as string, password, { ...meta, username: makeUsername(cleanName) });
    const ids = res.data && res.data.user ? res.data.user.identities : null;
    if (res.error || (Array.isArray(ids) && ids.length === 0)) {
      const p = res.error ? problemOf(res.error) : 'exists';
      setErr(p === 'exists' ? t.errExists : p === 'weak' ? t.errWeak : p === 'rate' ? t.errRate : p === 'net' ? t.errNet : t.errGeneric);
      setExists(p === 'exists');
      setBusy(false);
      submitting.current = false;
      return;
    }
    clearDraft();
    forgetLink();
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

  return (
    <main dir={dir} data-fix="FIX756" className="flex min-h-screen items-start justify-center bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 py-6 sm:items-center sm:py-10">
      <div className="w-full max-w-md">
        <div className="mb-4 flex flex-wrap justify-center gap-1.5" role="group" aria-label={t.language}>
          {JOIN_LANGS.map((l) => (
            <button key={l.code} type="button" onClick={() => chooseLang(l.code)} aria-pressed={lang === l.code} data-lang-btn={l.code}
                    className={'rounded-full px-3 py-1 text-xs font-semibold ' + (lang === l.code ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200')}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
          <div className="text-center">
            <img src="/logo.png" alt="Bambeh" className="mx-auto mb-3 h-14 w-auto object-contain"
                 onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <h1 className="text-2xl font-extrabold leading-tight text-gray-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-600">{sub}</p>
            {target !== '/' && <p className="mt-1 text-xs font-semibold text-teal-700" data-back="1">{t.back}</p>}
          </div>

          {confirm ? (
            <div className="mt-6 space-y-3 text-center" data-confirm="1" role="status">
              <ShieldCheck className="mx-auto h-10 w-10 text-teal-600" aria-hidden="true" />
              <p className="text-lg font-bold text-gray-900">{t.confirmTitle}</p>
              <p className="text-sm text-gray-600">{t.confirmSub}</p>
              <Link to={pass} state={location.state} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white">
                {t.signIn}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4" noValidate>
              <label className="block text-sm font-medium text-gray-700">
                {t.name}
                <input value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder={t.namePh} autoComplete="name"
                       maxLength={60} data-f="name" className={field} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                {t.phone}
                <input value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 20))} placeholder={t.phonePh} inputMode="tel"
                       autoComplete="tel-national" dir="ltr" data-f="phone" className={field} />
                <span className="mt-1 block text-xs font-normal text-gray-500">{t.phoneHelp}</span>
              </label>
              <label className="block text-sm font-medium text-gray-700">
                {t.password}
                <span className="relative mt-1 block">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                         dir={lang === 'ar' && !password ? 'rtl' : 'ltr'}
                         placeholder={t.passwordPh} autoComplete="new-password" data-f="password" className={field + ' mt-0 pr-12'} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? t.hide : t.show} data-show-pw="1"
                          className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-gray-700">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} data-f="consent"
                       className="mt-0.5 h-5 w-5 flex-shrink-0 accent-teal-600" />
                <span>
                  {t.consentA}
                  <Link to="/terms-of-service" className="font-semibold text-teal-700 underline">{t.terms}</Link>
                  {t.consentB}
                  <Link to="/privacy-policy" className="font-semibold text-teal-700 underline">{t.privacy}</Link>
                  {t.consentC}
                </span>
              </label>

              {err && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert" data-err="1">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{err}</span>
                </div>
              )}
              {exists && (
                <Link to={{ pathname: '/login', search: '?phone=' + encodeURIComponent(phone.replace(/\D/g, '').slice(-9)) + (location.search ? '&' + location.search.slice(1) : '') }}
                      state={location.state} data-exists-signin="1"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-600 py-2.5 text-sm font-semibold text-teal-700">
                  {t.signInInstead}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
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
            <div className="mt-6 space-y-2 text-center text-sm">
              <p className="text-gray-600">
                {t.have}{' '}
                <Link to={pass} state={location.state} data-signin-link="1" className="font-semibold text-teal-700 hover:underline">{t.signIn}</Link>
              </p>
              <Link to="/register" state={location.state} data-email-link="1" className="block text-xs text-gray-500 underline">{t.useEmail}</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
// BAMBEH_END_TOKEN__QUICK_JOIN_FIX756__COMPLETE
