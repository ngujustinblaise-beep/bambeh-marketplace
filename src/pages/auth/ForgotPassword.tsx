// BAMBEH_DEPLOY_TOKEN__FORGOTPASSWORD_FIX615_CLEAN
/**
 * src/pages/auth/ForgotPassword.tsx - Bambeh Marketplace
 *
 * FIX478 - THE PAGE THAT PRETENDED.
 * ---------------------------------
 * The version this replaces imported nothing, called nothing, and did this:
 *
 *     await new Promise((r) => setTimeout(r, 900));
 *     setSent(true);            //  "a reset link has been sent."
 *
 * It waited nine hundred milliseconds and lied. No email was ever sent, no
 * link was ever made. This is the screen a locked-out user reaches, so of
 * every dishonest surface in the app this was the most expensive one.
 *
 * WHAT IT DOES NOW
 *
 * PHONE (the default, because most Bambeh accounts are phone accounts)
 *   Bambeh has no SMS credit, so a link cannot travel to a phone by itself.
 *   Rather than pretend, the page says so and opens WhatsApp to the Bambeh
 *   support number with the request already typed. Staff then generate the
 *   real recovery link in the Command Center (FIX474/FIX475) and send it
 *   back on the same WhatsApp thread. The user taps it and sets a new
 *   password. Free, and every step is true.
 *
 * EMAIL (for the minority who registered with a real address)
 *   Calls supabase.auth.resetPasswordForEmail for real, pointed at
 *   /#/security-recovery - the screen FIX378 already built. Because custom
 *   SMTP is not configured, delivery is not guaranteed, so the page SAYS that
 *   and keeps the WhatsApp route one tap away instead of leaving someone
 *   staring at an inbox.
 *
 * WHY IT NEVER SAYS WHETHER THE ACCOUNT EXISTS
 *   "No account with that number" would let anyone check which Cameroonian
 *   phone numbers are on Bambeh, one guess at a time. The wording is the same
 *   either way. That is deliberate, not vagueness.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import AfricanPhoneInput from '@/components/AfricanPhoneInput';

/** Bambeh support. Reset requests arrive here. */
const SUPPORT_WHATSAPP = '237652953607';
const RECOVERY_URL = 'https://app.bambeh.com/#/security-recovery';
/** FIX615 - Big's five security questions (same keys as the database). */
const QUESTION_KEYS = ['mother_middle_name', 'primary_school', 'best_friend', 'first_car_colour', 'birth_town'] as const;

const STR: Record<string, Record<string, string>> = {
  en: {
    title: "Forgot your password?",
    sub: "Use the phone number or email you signed up with.",
    tabPhone: "Phone number",
    tabEmail: "Email",
    phoneLabel: "Your phone number",
    phonePh: "6 XX XX XX XX",
    emailLabel: "Your email address",
    emailPh: "you@example.com",
    phoneHelp: "This is the number you used to create your Bambeh account.",
    askBtn: "Ask for a temporary password on WhatsApp",
    phoneNote: "Bambeh cannot send text messages yet. Tap the button and our team will send you a temporary password on WhatsApp, usually within a few minutes. As soon as you sign in with it, Bambeh asks you to choose your own new password.",
    sendBtn: "Send reset link to my email",
    sending: "Sending\u2026",
    emailSent: "If that address is registered, a reset link is on its way. It can take a few minutes, and it sometimes lands in spam.",
    emailFallback: "Nothing arrived? Ask us on WhatsApp instead.",
    waFallbackBtn: "Ask on WhatsApp",
    badPhone: "Please enter your phone number.",
    badEmail: "Please enter a valid email address.",
    failed: "That did not work. Please use WhatsApp below.",
    haveCode: "I already have a code",
    vTitle: "Prove this is your account",
    vIntro: "Answer the security questions you chose for your account. Two correct answers are enough. We never tell anyone whether a number is registered.",
    checkBtn: "Check my answers",
    checking: "Checking\u2026",
    gotN: "matched so far",
    needTwo: "You need two.",
    tooMany: "Too many attempts. Please wait an hour and try again.",
    verifiedOk: "Verified. You can send your request now.",
    triesLeft: "tries left",
    lockedHint: "Answer the questions above first.",
    back: "Back to sign in",
    waMsg: "Hello Bambeh. I forgot my password and I answered my security questions. My number is",
    noQuestions: "Never set security questions, or cannot remember them? Ask us on WhatsApp anyway. Staff will make sure it is really you before they help.",
    waUnverifiedBtn: "Ask on WhatsApp without the questions",
    waMsgUnverified: "Hello Bambeh. I forgot my password and I cannot answer my security questions. My number is",
    needTwoAnswers: "Answer at least two questions.",
    q_mother_middle_name: "What is your mother's middle name?",
    q_primary_school: "What is the name of your primary school?",
    q_best_friend: "What is the name of your best friend?",
    q_first_car_colour: "What was the colour of your first car?",
    q_birth_town: "In which town were you born?",
    carSkip: "Never had a car? Skip this one.",
  },
  fr: {
    title: "Mot de passe oubli\u00e9 ?",
    sub: "Utilisez le num\u00e9ro de t\u00e9l\u00e9phone ou l\u2019e-mail de votre inscription.",
    tabPhone: "T\u00e9l\u00e9phone",
    tabEmail: "E-mail",
    phoneLabel: "Votre num\u00e9ro de t\u00e9l\u00e9phone",
    phonePh: "6 XX XX XX XX",
    emailLabel: "Votre adresse e-mail",
    emailPh: "vous@exemple.com",
    phoneHelp: "Le num\u00e9ro utilis\u00e9 pour cr\u00e9er votre compte Bambeh.",
    askBtn: "Demander un mot de passe temporaire sur WhatsApp",
    phoneNote: "Bambeh ne peut pas encore envoyer de SMS. Appuyez sur le bouton et notre \u00e9quipe vous enverra un mot de passe temporaire sur WhatsApp, g\u00e9n\u00e9ralement en quelques minutes. D\u00e8s que vous vous connectez avec, Bambeh vous demande de choisir votre propre nouveau mot de passe.",
    sendBtn: "Envoyer le lien \u00e0 mon e-mail",
    sending: "Envoi\u2026",
    emailSent: "Si cette adresse est enregistr\u00e9e, un lien est en route. Cela peut prendre quelques minutes, et il arrive parfois dans les spams.",
    emailFallback: "Rien re\u00e7u ? \u00c9crivez-nous plut\u00f4t sur WhatsApp.",
    waFallbackBtn: "\u00c9crire sur WhatsApp",
    badPhone: "Veuillez saisir votre num\u00e9ro de t\u00e9l\u00e9phone.",
    badEmail: "Veuillez saisir une adresse e-mail valide.",
    failed: "Cela n\u2019a pas fonctionn\u00e9. Utilisez WhatsApp ci-dessous.",
    haveCode: "J\u2019ai d\u00e9j\u00e0 un code",
    vTitle: "Prouvez que ce compte est le v\u00f4tre",
    vIntro: "R\u00e9pondez aux questions de s\u00e9curit\u00e9 que vous avez choisies pour votre compte. Deux bonnes r\u00e9ponses suffisent. Nous ne disons jamais si un num\u00e9ro est enregistr\u00e9.",
    checkBtn: "V\u00e9rifier mes r\u00e9ponses",
    checking: "V\u00e9rification\u2026",
    gotN: "bonnes r\u00e9ponses",
    needTwo: "Il en faut deux.",
    tooMany: "Trop de tentatives. Attendez une heure et r\u00e9essayez.",
    verifiedOk: "V\u00e9rifi\u00e9. Vous pouvez envoyer votre demande.",
    triesLeft: "essais restants",
    lockedHint: "R\u00e9pondez d\u2019abord aux questions ci-dessus.",
    back: "Retour \u00e0 la connexion",
    waMsg: "Bonjour Bambeh. J'ai oubli\u00e9 mon mot de passe et j'ai r\u00e9pondu \u00e0 mes questions de s\u00e9curit\u00e9. Mon num\u00e9ro est",
    noQuestions: "Jamais d\u00e9fini de questions de s\u00e9curit\u00e9, ou impossible de vous en souvenir ? \u00c9crivez-nous quand m\u00eame sur WhatsApp. L'\u00e9quipe v\u00e9rifiera que c'est bien vous avant de vous aider.",
    waUnverifiedBtn: "Demander sur WhatsApp sans les questions",
    waMsgUnverified: "Bonjour Bambeh. J'ai oubli\u00e9 mon mot de passe et je ne peux pas r\u00e9pondre \u00e0 mes questions de s\u00e9curit\u00e9. Mon num\u00e9ro est",
    needTwoAnswers: "R\u00e9pondez \u00e0 au moins deux questions.",
    q_mother_middle_name: "Quel est le deuxi\u00e8me pr\u00e9nom de votre m\u00e8re ?",
    q_primary_school: "Quel est le nom de votre \u00e9cole primaire ?",
    q_best_friend: "Comment s'appelle votre meilleur(e) ami(e) ?",
    q_first_car_colour: "De quelle couleur \u00e9tait votre premi\u00e8re voiture ?",
    q_birth_town: "Dans quelle ville \u00eates-vous n\u00e9(e) ?",
    carSkip: "Jamais eu de voiture ? Passez cette question.",
  },
  pidgin: {
    title: "You don forget your password?",
    sub: "Use di phone number or email wey you take open di account.",
    tabPhone: "Phone number",
    tabEmail: "Email",
    phoneLabel: "Your phone number",
    phonePh: "6 XX XX XX XX",
    emailLabel: "Your email",
    emailPh: "you@example.com",
    phoneHelp: "Na di number wey you take open your Bambeh account.",
    askBtn: "Ask for temporary password for WhatsApp",
    phoneNote: "Bambeh no fit send SMS yet. Press the button and our team go send you temporary password for WhatsApp, e no dey take long. As you sign in with am, Bambeh go ask you make you choose your own new password.",
    sendBtn: "Send di reset link go my email",
    sending: "E dey go\u2026",
    emailSent: "If dat email dey registered, di link don comot. E fit take small time, and sometimes e dey enter spam.",
    emailFallback: "Nothing enter? Ask us for WhatsApp.",
    waFallbackBtn: "Ask for WhatsApp",
    badPhone: "Abeg put your phone number.",
    badEmail: "Abeg put correct email.",
    failed: "E no work. Abeg use WhatsApp for down.",
    haveCode: "I get code already",
    vTitle: "Show say na your account",
    vIntro: "Answer the security question dem wey you choose for your account. Two correct answer don do. We no dey tell anybody whether number dey registered.",
    checkBtn: "Check my answer",
    checking: "E dey check\u2026",
    gotN: "correct so far",
    needTwo: "You need two.",
    tooMany: "You don try too much. Wait one hour.",
    verifiedOk: "E correct. You fit send your request now.",
    triesLeft: "try remain",
    lockedHint: "Answer di question dem first.",
    back: "Go back to sign in",
    waMsg: "Hello Bambeh. I don forget my password and I don answer my security question dem. My number na",
    noQuestions: "You never set security question, or you no remember am? Still ask us for WhatsApp. Staff go make sure say na really you before dem help you.",
    waUnverifiedBtn: "Ask for WhatsApp without the question dem",
    waMsgUnverified: "Hello Bambeh. I don forget my password and I no fit answer my security question dem. My number na",
    needTwoAnswers: "Answer at least two question.",
    q_mother_middle_name: "Wetin be your mami middle name?",
    q_primary_school: "Wetin be the name of your primary school?",
    q_best_friend: "Wetin be the name of your best friend?",
    q_first_car_colour: "Wetin be the colour of your first motor?",
    q_birth_town: "Which town dem born you?",
    carSkip: "You never get motor? Leave this one.",
  },
  ar: {
    title: "\u0647\u0644 \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061f",
    sub: "\u0627\u0633\u062a\u062e\u062f\u0645 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0623\u0648 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0627\u0644\u0630\u064a \u0633\u062c\u0651\u0644\u062a \u0628\u0647.",
    tabPhone: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641",
    tabEmail: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    phoneLabel: "\u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643",
    phonePh: "6 XX XX XX XX",
    emailLabel: "\u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    emailPh: "you@example.com",
    phoneHelp: "\u0647\u0630\u0627 \u0647\u0648 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0630\u064a \u0623\u0646\u0634\u0623\u062a \u0628\u0647 \u062d\u0633\u0627\u0628\u0643 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647.",
    askBtn: "\u0627\u0637\u0644\u0628 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0645\u0624\u0642\u062a\u0629 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628",
    phoneNote: "\u0644\u0627 \u064a\u0633\u062a\u0637\u064a\u0639 \u0628\u0627\u0645\u0628\u064a\u0647 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0626\u0644 \u0646\u0635\u064a\u0629 \u0628\u0639\u062f. \u0627\u0636\u063a\u0637 \u0639\u0644\u0649 \u0627\u0644\u0632\u0631 \u0648\u0633\u064a\u0631\u0633\u0644 \u0644\u0643 \u0641\u0631\u064a\u0642\u0646\u0627 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0645\u0624\u0642\u062a\u0629 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628\u060c \u0639\u0627\u062f\u0629\u064b \u062e\u0644\u0627\u0644 \u062f\u0642\u0627\u0626\u0642. \u0628\u0645\u062c\u0631\u062f \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0647\u0627\u060c \u064a\u0637\u0644\u0628 \u0645\u0646\u0643 \u0628\u0627\u0645\u0628\u064a\u0647 \u0627\u062e\u062a\u064a\u0627\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629 \u062e\u0627\u0635\u0629 \u0628\u0643.",
    sendBtn: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0631\u0627\u0628\u0637 \u0625\u0644\u0649 \u0628\u0631\u064a\u062f\u064a",
    sending: "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u2026",
    emailSent: "\u0625\u0630\u0627 \u0643\u0627\u0646 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0645\u0633\u062c\u0651\u0644\u0627\u064b \u0641\u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064a \u0627\u0644\u0637\u0631\u064a\u0642. \u0642\u062f \u064a\u0633\u062a\u063a\u0631\u0642 \u062f\u0642\u0627\u0626\u0642\u060c \u0648\u0623\u062d\u064a\u0627\u0646\u0627\u064b \u064a\u0635\u0644 \u0625\u0644\u0649 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0645\u0632\u0639\u062c.",
    emailFallback: "\u0644\u0645 \u064a\u0635\u0644 \u0634\u064a\u0621\u061f \u0631\u0627\u0633\u0644\u0646\u0627 \u0639\u0644\u0649 \u0648\u0627\u062a\u0633\u0627\u0628.",
    waFallbackBtn: "\u0645\u0631\u0627\u0633\u0644\u0629 \u0648\u0627\u062a\u0633\u0627\u0628",
    badPhone: "\u0645\u0646 \u0641\u0636\u0644\u0643 \u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643.",
    badEmail: "\u0645\u0646 \u0641\u0636\u0644\u0643 \u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u0627\u064b \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0627\u064b \u0635\u062d\u064a\u062d\u0627\u064b.",
    failed: "\u0644\u0645 \u064a\u0646\u062c\u062d \u0630\u0644\u0643. \u0627\u0633\u062a\u062e\u062f\u0645 \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u0627\u0644\u0623\u0633\u0641\u0644.",
    haveCode: "\u0644\u062f\u064a\u0651 \u0631\u0645\u0632 \u0628\u0627\u0644\u0641\u0639\u0644",
    vTitle: "\u0623\u062b\u0628\u062a \u0623\u0646 \u0647\u0630\u0627 \u062d\u0633\u0627\u0628\u0643",
    vIntro: "\u0623\u062c\u0628 \u0639\u0646 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0623\u0645\u0627\u0646 \u0627\u0644\u062a\u064a \u0627\u062e\u062a\u0631\u062a\u0647\u0627 \u0644\u062d\u0633\u0627\u0628\u0643. \u062a\u0643\u0641\u064a \u0625\u062c\u0627\u0628\u062a\u0627\u0646 \u0635\u062d\u064a\u062d\u062a\u0627\u0646. \u0644\u0627 \u0646\u062e\u0628\u0631 \u0623\u062d\u062f\u064b\u0627 \u0623\u0628\u062f\u064b\u0627 \u0645\u0627 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0631\u0642\u0645 \u0645\u0633\u062c\u0644\u064b\u0627.",
    checkBtn: "\u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0625\u062c\u0627\u0628\u0627\u062a\u064a",
    checking: "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642\u2026",
    gotN: "\u0625\u062c\u0627\u0628\u0627\u062a \u0635\u062d\u064a\u062d\u0629",
    needTwo: "\u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0627\u062b\u0646\u062a\u064a\u0646.",
    tooMany: "\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629. \u0627\u0646\u062a\u0638\u0631 \u0633\u0627\u0639\u0629 \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.",
    verifiedOk: "\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642. \u064a\u0645\u0643\u0646\u0643 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628\u0643 \u0627\u0644\u0622\u0646.",
    triesLeft: "\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0645\u062a\u0628\u0642\u064a\u0629",
    lockedHint: "\u0623\u062c\u0628 \u0639\u0646 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0623\u0639\u0644\u0627\u0647 \u0623\u0648\u0644\u0627\u064b.",
    back: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    waMsg: "\u0645\u0631\u062d\u0628\u064b\u0627 \u0628\u0627\u0645\u0628\u064a\u0647. \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0648\u0623\u062c\u0628\u062a \u0639\u0646 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0623\u0645\u0627\u0646. \u0631\u0642\u0645\u064a \u0647\u0648",
    noQuestions: "\u0644\u0645 \u062a\u0636\u0628\u0637 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0623\u0645\u0627\u0646 \u0642\u0637\u060c \u0623\u0648 \u0644\u0627 \u062a\u062a\u0630\u0643\u0631\u0647\u0627\u061f \u0631\u0627\u0633\u0644\u0646\u0627 \u0639\u0644\u0649 \u0648\u0627\u062a\u0633\u0627\u0628 \u0639\u0644\u0649 \u0623\u064a \u062d\u0627\u0644. \u0633\u064a\u062a\u0623\u0643\u062f \u0627\u0644\u0641\u0631\u064a\u0642 \u0645\u0646 \u0623\u0646\u0643 \u0635\u0627\u062d\u0628 \u0627\u0644\u062d\u0633\u0627\u0628 \u0642\u0628\u0644 \u0645\u0633\u0627\u0639\u062f\u062a\u0643.",
    waUnverifiedBtn: "\u0627\u0637\u0644\u0628 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628 \u062f\u0648\u0646 \u0627\u0644\u0623\u0633\u0626\u0644\u0629",
    waMsgUnverified: "\u0645\u0631\u062d\u0628\u064b\u0627 \u0628\u0627\u0645\u0628\u064a\u0647. \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0648\u0644\u0627 \u0623\u0633\u062a\u0637\u064a\u0639 \u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0639\u0646 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0623\u0645\u0627\u0646. \u0631\u0642\u0645\u064a \u0647\u0648",
    needTwoAnswers: "\u0623\u062c\u0628 \u0639\u0646 \u0633\u0624\u0627\u0644\u064a\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
    q_mother_middle_name: "\u0645\u0627 \u0647\u0648 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0633\u0637 \u0644\u0648\u0627\u0644\u062f\u062a\u0643\u061f",
    q_primary_school: "\u0645\u0627 \u0627\u0633\u0645 \u0645\u062f\u0631\u0633\u062a\u0643 \u0627\u0644\u0627\u0628\u062a\u062f\u0627\u0626\u064a\u0629\u061f",
    q_best_friend: "\u0645\u0627 \u0627\u0633\u0645 \u0623\u0639\u0632 \u0623\u0635\u062f\u0642\u0627\u0626\u0643\u061f",
    q_first_car_colour: "\u0645\u0627 \u0644\u0648\u0646 \u0633\u064a\u0627\u0631\u062a\u0643 \u0627\u0644\u0623\u0648\u0644\u0649\u061f",
    q_birth_town: "\u0641\u064a \u0623\u064a \u0645\u062f\u064a\u0646\u0629 \u0648\u064f\u0644\u062f\u062a\u061f",
    carSkip: "\u0644\u0645 \u062a\u0645\u062a\u0644\u0643 \u0633\u064a\u0627\u0631\u0629 \u0642\u0637\u061f \u062a\u062e\u0637\u064e\u0651 \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644.",
  },
  ff: {
    title: "A yejjitii finnde maa?",
    sub: "Huutoro limngal noddirgal walla iimeel ngal winndi\u0257aa.",
    tabPhone: "Limngal noddirgal",
    tabEmail: "Iimeel",
    phoneLabel: "Limngal noddirgal maa",
    phonePh: "6 XX XX XX XX",
    emailLabel: "Iimeel maa",
    emailPh: "you@example.com",
    phoneHelp: "Ko ngal limngal huutor\u0257aa udditde konte maa Bambeh.",
    askBtn: "\u01b3am finnde laawol gootol e WhatsApp",
    phoneNote: "Bambeh waawaa neldude SMS tawo. \u00d1o\u01b4\u01b4u buton oo, gollo\u0253e amen neldete finnde laawol gootol e WhatsApp, ko \u0253uri heewde e nder hojomaaji see\u0257a. So a naatii e mayre, Bambeh naamnete su\u0253aa finnde maa keso.",
    sendBtn: "Neldu ce\u014bngal e iimeel am",
    sending: "Ina nelda\u2026",
    emailSent: "So tawii iimeel ngal ina winndaa, ce\u014bngal ngal ina ara. Ina waawi \u01b4ettude hojomaaji see\u0257a, kadi ina waawi naatde e spam.",
    emailFallback: "Hay huunde araani? \u01b3eewndo men e WhatsApp.",
    waFallbackBtn: "\u01b3eewndo e WhatsApp",
    badPhone: "Tii\u0257no naatnu limngal noddirgal maa.",
    badEmail: "Tii\u0257no naatnu iimeel goong\u0257inaango.",
    failed: "\u018aum gollaaki. Tii\u0257no huutoro WhatsApp les \u0257oo.",
    haveCode: "Mi jogii koodu",
    vTitle: "Hollu ko konte maa",
    vIntro: "Jaabo naamne reentaare \u0257e cu\u0253\u0257aa wonande konte maa. Jaabawuuji goonga \u0257i\u0257i ina njonii. Min mbiyataa hay gooto si limngal ina winndaa.",
    checkBtn: "\u01b3eewto jaabawuuji am",
    checking: "Ina \u01b4eewee\u2026",
    gotN: "goong\u0257i haa jooni",
    needTwo: "A\u0257a soklli \u0257i\u0257i.",
    tooMany: "Ndaarndo-\u0257aa ko heewi. Fadu waktu gooto.",
    verifiedOk: "\u01b3eewtaama. A\u0257a waawi neldude \u0257a\u0253\u0253aandu maa jooni.",
    triesLeft: "ndaarndogol heddii",
    lockedHint: "Jaabo naamnde dow \u0257oo tawo.",
    back: "Rutto e naatgol",
    waMsg: "Jam Bambeh. Mi yejjitii finnde am, mi jaabii naamne reentaare am. Limngal am ko",
    noQuestions: "A su\u0253aani naamne reentaare, walla a yejjitii \u0257e? \u0181a\u0257\u0257o men e WhatsApp tan. Gollo\u0253e \u01b4eewto ko an tigi hade mballaa ma.",
    waUnverifiedBtn: "\u01b3am e WhatsApp tawa naamne alaa",
    waMsgUnverified: "Jam Bambeh. Mi yejjitii finnde am, mi waawaa jaabaade naamne reentaare am. Limngal am ko",
    needTwoAnswers: "Jaabo naamne \u0257i\u0257i, ko fam\u0257i fof.",
    q_mother_middle_name: "Hol innde cakkiinde yumma maa?",
    q_primary_school: "Hol innde lekkol maa aranol?",
    q_best_friend: "Hol innde soobaajo maa bur\u0257o?",
    q_first_car_colour: "Hol noone oto maa aranoowo?",
    q_birth_town: "Hol wuro ndo njibinaa?",
    carSkip: "A jogaaki oto abada? Acc ndee.",
  },
};

function tr(lang: string, k: string): string {
  return (STR[lang] && STR[lang][k]) || STR.en[k] || k;
}

/* FIX478b - the hand-rolled phone normaliser that used to sit here is gone.
   AfricanPhoneInput already picks the country (Cameroon by default), strips
   every non-digit, caps the length per country and validates against that
   country's pattern. Writing a second, weaker version of that here is exactly
   how two rules end up disagreeing. It hands back the full international
   number and whether it is valid; this page just uses both. */

export default function ForgotPassword() {
  const langRaw: unknown = useLang();
  const lang: string = typeof langRaw === 'string' ? langRaw : 'en';
  const isRtl = lang === 'ar';
  const t = (k: string) => tr(lang, k);

  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');      // full international, from AfricanPhoneInput
  const [phoneOk, setPhoneOk] = useState(false);

  /* FIX488 - the four questions. Nothing here decides anything: the answers go
     to bambeh_recovery_check() (FIX615) and the DATABASE says pass or fail. If this
     comparison lived in the browser, anyone could open DevTools and flip the
     verdict. */
  /* FIX615 - Big's five questions, chosen by the owner after sign-up.
     Every field is optional here: the owner answers the ones they set. */
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [score, setScore] = useState<{ matched: number; left: number } | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, '');

  const answeredCount = QUESTION_KEYS.filter((k) => (answers[k] || '').trim().length >= 2).length;

  const whatsappUrl = (withNumber: string, wasVerified = true) =>
    `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
      `${t(wasVerified ? 'waMsg' : 'waMsgUnverified')} +${withNumber}`,
    )}`;

  const checkAnswers = async () => {
    if (!phoneOk || digits.length < 8) { setError(t('badPhone')); return; }
    setChecking(true);
    setError(null);
    try {
      if (answeredCount < 2) { setError(t('needTwoAnswers')); return; }
      const payload: Record<string, string> = {};
      for (const k of QUESTION_KEYS) { const v = (answers[k] || '').trim(); if (v) payload[k] = v; }
      const { data, error: err } = await supabase.rpc('bambeh_recovery_check', {
        p_phone: digits,
        p_answers: payload,
      });
      if (err) throw err;
      const r = (data || {}) as { ok?: boolean; reason?: string; matched?: number; attempts_left?: number; passed?: boolean };
      if (r.ok === false) { setError(t('badPhone')); return; }
      setScore({ matched: Number(r?.matched ?? 0), left: Number(r?.attempts_left ?? 0) });
      // The server decides. The browser only renders what it was told.
      setVerified(Boolean(r?.passed));
    } catch {
      setError(t('failed'));
    } finally {
      setChecking(false);
    }
  };

  const askWithoutQuestions = () => {
    if (!phoneOk || digits.length < 8) { setError(t('badPhone')); return; }
    setError(null);
    window.open(whatsappUrl(digits, false), '_blank', 'noopener,noreferrer');
  };

  const askOnWhatsApp = () => {
    // AfricanPhoneInput has already validated against the chosen country's
    // pattern, so this trusts its verdict instead of re-guessing the length.
    if (!phoneOk || digits.length < 8) { setError(t('badPhone')); return; }
    setError(null);
    window.open(whatsappUrl(digits), '_blank', 'noopener,noreferrer');
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim();
    if (!addr || !addr.includes('@')) { setError(t('badEmail')); return; }
    setError(null);
    setLoading(true);
    try {
      // Real. Not a timer. Lands on the recovery screen FIX378 already built.
      const { error: err } = await supabase.auth.resetPasswordForEmail(addr, {
        redirectTo: RECOVERY_URL,
      });
      // Deliberately do NOT surface "user not found": that would let anyone
      // test which addresses are registered. Any real failure still shows.
      if (err && !/user not found/i.test(err.message)) throw err;
      setEmailSent(true);
    } catch {
      setError(t('failed'));
    } finally {
      setLoading(false);
    }
  };

  const TAB = 'flex-1 rounded-xl py-3 text-sm font-semibold border transition-colors';
  const INPUT =
    'mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500';

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center"
      dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Bambeh" className="mx-auto h-20 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-600">{t('sub')}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button type="button" onClick={() => { setMode('phone'); setError(null); }}
              className={`${TAB} ${mode === 'phone'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-200'}`}>
              {t('tabPhone')}
            </button>
            <button type="button" onClick={() => { setMode('email'); setError(null); }}
              className={`${TAB} ${mode === 'email'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-200'}`}>
              {t('tabEmail')}
            </button>
          </div>

          {/* -- PHONE --------------------------------------------------- */}
          {mode === 'phone' ? (
            <div className="space-y-4">
              <div dir="ltr">
                {/* FIX478b - the app's own phone input: country picker defaulting
                    to Cameroon, per-country length caps and pattern validation.
                    dir is forced ltr because a phone number reads left-to-right
                    even on the Arabic layout. */}
                <AfricanPhoneInput
                  value={phone}
                  label={t('phoneLabel')}
                  required
                  onChange={(full, valid) => {
                    setPhone(full);
                    setPhoneOk(valid);
                    if (valid) setError(null);
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">{t('phoneHelp')}</p>
              </div>

              {/* -- FIX488: prove it is your account --------------------- */}
              <div className="rounded-2xl border border-gray-200 p-3 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t('vTitle')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('vIntro')}</p>
                </div>

                {QUESTION_KEYS.map((k) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-gray-700">{t('q_' + k)}</label>
                    <input value={answers[k] || ''} maxLength={120} autoComplete="off"
                      onChange={(e) => { const v = e.target.value; setAnswers((prev) => ({ ...prev, [k]: v })); }}
                      className={INPUT} />
                    {k === 'first_car_colour' ? (
                      <p className="mt-1 text-[11px] text-gray-500">{t('carSkip')}</p>
                    ) : null}
                  </div>
                ))}

                <button type="button" onClick={checkAnswers} disabled={checking || verified || answeredCount < 2}
                  className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-sm font-semibold disabled:bg-gray-300">
                  {checking ? t('checking') : t('checkBtn')}
                </button>

                {/* The count only. NEVER which answers matched - that would let
                    somebody probe one field at a time and the attempt cap would
                    mean nothing. */}
                {score && !verified ? (
                  <p className="text-xs text-amber-800 text-center">
                    {score.left === 0
                      ? t('tooMany')
                      : `${score.matched} ${t('gotN')} \u2014 ${t('needTwo')} (${score.left} ${t('triesLeft')})`}
                  </p>
                ) : null}
                {verified ? (
                  <p className="text-xs text-emerald-700 font-semibold text-center">{t('verifiedOk')}</p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-900">
                {t('phoneNote')}
              </div>

              <button type="button" onClick={askOnWhatsApp} disabled={!verified}
                title={!verified ? t('lockedHint') : undefined}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed">
                {t('askBtn')}
              </button>
              {!verified ? (
                <p className="text-[11px] text-gray-500 text-center -mt-2">{t('lockedHint')}</p>
              ) : null}
              {!verified ? (
                <div className="rounded-2xl border border-gray-200 p-3 text-xs text-gray-600 space-y-2">
                  <p>{t('noQuestions')}</p>
                  <button type="button" onClick={askWithoutQuestions}
                    className="w-full rounded-xl border border-emerald-200 text-emerald-700 py-2.5 text-sm font-semibold hover:bg-emerald-50">
                    {t('waUnverifiedBtn')}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            /* -- EMAIL ------------------------------------------------ */
            <div className="space-y-4">
              {!emailSent ? (
                <form className="space-y-4" onSubmit={sendEmail}>
                  <div>
                    <label htmlFor="fpEmail" className="block text-sm font-medium text-gray-700">
                      {t('emailLabel')}
                    </label>
                    <input id="fpEmail" type="email" autoComplete="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPh')} className={INPUT} dir="ltr" />
                  </div>
                  <button type="submit" disabled={loading || !email.trim()}
                    className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-3 font-semibold disabled:bg-gray-300">
                    {loading ? t('sending') : t('sendBtn')}
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-sm text-teal-800">
                  {t('emailSent')}
                </div>
              )}

              {/* Email delivery is not guaranteed while SMTP is unconfigured,
                  so the route that always works stays one tap away. */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">{t('emailFallback')}</p>
                <a href={whatsappUrl(digits || '')} target="_blank" rel="noopener noreferrer"
                  className="block text-center w-full rounded-xl border border-emerald-200 text-emerald-700 py-2.5 text-sm font-semibold hover:bg-emerald-50">
                  {t('waFallbackBtn')}
                </a>
              </div>
            </div>
          )}

          {error ? (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          ) : null}

          {/* FIX485 - SecurityRecovery still ACCEPTS a code and sets the new
              password. It is no longer the front door, but it must stay one tap
              away or anyone already holding a code has nowhere to type it. */}
          <p className="mt-5 text-center">
            <Link to="/security-recovery" className="text-sm text-gray-500 hover:text-teal-700 underline">
              {t('haveCode')}
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-gray-600">
            <Link to="/login" className="text-teal-700 font-semibold hover:underline">
              {t('back')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
// BAMBEH_END_TOKEN__FORGOTPASSWORD_FIX615__COMPLETE
