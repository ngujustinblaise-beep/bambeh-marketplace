// BAMBEH_DEPLOY_TOKEN__FORGOTPASSWORD_FIX627_CLEAN
/**
 * src/pages/auth/ForgotPassword.tsx - Bambeh Marketplace
 *
 * FIX627 - "Type your number, Bambeh approves, choose a new password." The phone
 *          tab now sends a PASSWORD HELP REQUEST (FIX626): this phone gets a
 *          4-digit number and a secret key, staff approve that request after
 *          checking it is really the owner, and this screen then asks for a new
 *          password and signs straight in. No old password, no code to type.
 *          The approval only works on the phone that asked.
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

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    sendBtn: "Send reset link to my email",
    sending: "Sending\u2026",
    emailSent: "If that address is registered, a reset link is on its way. It can take a few minutes, and it sometimes lands in spam.",
    emailFallback: "Nothing arrived? Ask us on WhatsApp instead.",
    waFallbackBtn: "Ask on WhatsApp",
    badPhone: "Please enter your phone number.",
    badEmail: "Please enter a valid email address.",
    failed: "That did not work. Please use WhatsApp below.",
    haveCode: "I already have a code",
    checkBtn: "Check my answers",
    checking: "Checking\u2026",
    gotN: "matched so far",
    needTwo: "You need two.",
    tooMany: "Too many attempts. Please wait an hour and try again.",
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
    tabCode: "Bambeh code",
    codeHint: "Bambeh staff sent you a reset code? Use the \"Bambeh code\" tab.",
    codeTitle: "Use the code Bambeh staff sent you",
    codeIntro: "You do not need your old password. Enter your phone number, the 8-digit code from WhatsApp, and choose a new password. The code works once and expires after 24 hours.",
    codeLabel: "Code from Bambeh (8 digits)",
    codeSubmit: "Save my new password",
    codeSaving: "Saving...",
    codeDone: "Your new password is saved. Signing you in...",
    codeDoneManual: "Your new password is saved. Sign in with your phone number and your new password.",
    errCodeShort: "Enter all 8 digits of the code.",
    errCodeInvalid: "That code is not right, has already been used, or has expired. Check the WhatsApp message, or ask Bambeh for a new code.",
    errPwShort: "Your new password must be at least 8 characters.",
    errPwMatch: "The two passwords do not match.",
    errCodeNetwork: "We could not reach Bambeh. Check your connection and try again.",
    askBtn: "Ask for a reset code on WhatsApp",
    newPass: "New password",
    newPassPh: "At least 8 characters",
    confirmPass: "Confirm password",
    confirmPassPh: "Type it again",
    show: "Show",
    hide: "Hide",
    ruleLength: "At least 8 characters",
    ruleMatch: "The two passwords match",
    ruleNoMatch: "The two passwords do not match yet",
    reqCardTitle: "Get a new password without the old one",
    reqCardBody: "Bambeh staff check it is really you, usually by calling or messaging the number on your account. Then you choose a new password right here. You do not need your old password.",
    reqUsing: "Number:",
    reqBtn: "Ask Bambeh to let me choose a new password",
    reqBusy: "Sending your request...",
    reqNoTitle: "Your request number",
    reqNoBody: "Bambeh staff will ask you for this number when they call or message you. Keep this screen open: it changes by itself when they approve.",
    reqWa: "Tell Bambeh on WhatsApp",
    reqWaMsg: "Hello Bambeh, I forgot my password. My request number is {no}. The number on my account is {phone}.",
    reqWaiting: "Waiting for Bambeh to approve...",
    reqOpenUntil: "This request stays open until {time}.",
    reqCheck: "Check now",
    reqCancel: "Cancel this request",
    reqApproved: "Bambeh approved your request. Choose your new password now.",
    reqSave: "Save my new password and sign in",
    reqSaveBefore: "Save it before {time}.",
    reqRefused: "Bambeh could not confirm it was you, so this request was closed. You can make a new request, or write to us on WhatsApp.",
    reqExpired: "This request has expired. You can make a new one.",
    reqClosed: "This request is closed. If you made a newer request, use that one.",
    reqNew: "Make a new request",
    vTitle: "Optional: answer your security questions",
    vIntro: "Two correct answers help Bambeh staff confirm it is you faster. Staff never see your answers, only whether they matched.",
    verifiedOk: "Verified. Now ask Bambeh to approve your request above.",
    phoneNote: "Bambeh cannot send text messages yet, so our team confirms it is you by calling or messaging the number on your account, or by seeing your ID card.",
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
    sendBtn: "Envoyer le lien \u00e0 mon e-mail",
    sending: "Envoi\u2026",
    emailSent: "Si cette adresse est enregistr\u00e9e, un lien est en route. Cela peut prendre quelques minutes, et il arrive parfois dans les spams.",
    emailFallback: "Rien re\u00e7u ? \u00c9crivez-nous plut\u00f4t sur WhatsApp.",
    waFallbackBtn: "\u00c9crire sur WhatsApp",
    badPhone: "Veuillez saisir votre num\u00e9ro de t\u00e9l\u00e9phone.",
    badEmail: "Veuillez saisir une adresse e-mail valide.",
    failed: "Cela n\u2019a pas fonctionn\u00e9. Utilisez WhatsApp ci-dessous.",
    haveCode: "J\u2019ai d\u00e9j\u00e0 un code",
    checkBtn: "V\u00e9rifier mes r\u00e9ponses",
    checking: "V\u00e9rification\u2026",
    gotN: "bonnes r\u00e9ponses",
    needTwo: "Il en faut deux.",
    tooMany: "Trop de tentatives. Attendez une heure et r\u00e9essayez.",
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
    tabCode: "Code Bambeh",
    codeHint: "L'\u00e9quipe Bambeh vous a envoy\u00e9 un code ? Utilisez l'onglet \u00ab Code Bambeh \u00bb.",
    codeTitle: "Utilisez le code envoy\u00e9 par l'\u00e9quipe Bambeh",
    codeIntro: "Vous n'avez pas besoin de votre ancien mot de passe. Saisissez votre num\u00e9ro, le code \u00e0 8 chiffres re\u00e7u sur WhatsApp, et choisissez un nouveau mot de passe. Le code ne sert qu'une fois et expire apr\u00e8s 24 heures.",
    codeLabel: "Code Bambeh (8 chiffres)",
    codeSubmit: "Enregistrer mon nouveau mot de passe",
    codeSaving: "Enregistrement...",
    codeDone: "Votre nouveau mot de passe est enregistr\u00e9. Connexion en cours...",
    codeDoneManual: "Votre nouveau mot de passe est enregistr\u00e9. Connectez-vous avec votre num\u00e9ro et votre nouveau mot de passe.",
    errCodeShort: "Saisissez les 8 chiffres du code.",
    errCodeInvalid: "Ce code est incorrect, d\u00e9j\u00e0 utilis\u00e9 ou expir\u00e9. V\u00e9rifiez le message WhatsApp ou demandez un nouveau code \u00e0 Bambeh.",
    errPwShort: "Le nouveau mot de passe doit contenir au moins 8 caract\u00e8res.",
    errPwMatch: "Les deux mots de passe ne correspondent pas.",
    errCodeNetwork: "Impossible de joindre Bambeh. V\u00e9rifiez votre connexion et r\u00e9essayez.",
    askBtn: "Demander un code de r\u00e9initialisation sur WhatsApp",
    newPass: "Nouveau mot de passe",
    newPassPh: "Au moins 8 caract\u00e8res",
    confirmPass: "Confirmez le mot de passe",
    confirmPassPh: "Saisissez-le \u00e0 nouveau",
    show: "Afficher",
    hide: "Masquer",
    ruleLength: "Au moins 8 caract\u00e8res",
    ruleMatch: "Les deux mots de passe correspondent",
    ruleNoMatch: "Les deux mots de passe ne correspondent pas encore",
    reqCardTitle: "Un nouveau mot de passe sans l'ancien",
    reqCardBody: "L'\u00e9quipe Bambeh v\u00e9rifie que c'est bien vous, en g\u00e9n\u00e9ral en appelant ou en \u00e9crivant au num\u00e9ro de votre compte. Ensuite vous choisissez un nouveau mot de passe ici m\u00eame. Vous n'avez pas besoin de l'ancien.",
    reqUsing: "Num\u00e9ro :",
    reqBtn: "Demander \u00e0 Bambeh de choisir un nouveau mot de passe",
    reqBusy: "Envoi de votre demande...",
    reqNoTitle: "Votre num\u00e9ro de demande",
    reqNoBody: "L'\u00e9quipe Bambeh vous demandera ce num\u00e9ro quand elle vous appellera ou vous \u00e9crira. Gardez cet \u00e9cran ouvert : il change tout seul d\u00e8s qu'elle approuve.",
    reqWa: "Pr\u00e9venir Bambeh sur WhatsApp",
    reqWaMsg: "Bonjour Bambeh, j'ai oubli\u00e9 mon mot de passe. Mon num\u00e9ro de demande est {no}. Le num\u00e9ro de mon compte est {phone}.",
    reqWaiting: "En attente de l'approbation de Bambeh...",
    reqOpenUntil: "Cette demande reste ouverte jusqu'\u00e0 {time}.",
    reqCheck: "V\u00e9rifier maintenant",
    reqCancel: "Annuler cette demande",
    reqApproved: "Bambeh a approuv\u00e9 votre demande. Choisissez maintenant votre nouveau mot de passe.",
    reqSave: "Enregistrer et me connecter",
    reqSaveBefore: "Enregistrez-le avant {time}.",
    reqRefused: "Bambeh n'a pas pu confirmer qu'il s'agissait de vous, cette demande a donc \u00e9t\u00e9 ferm\u00e9e. Vous pouvez faire une nouvelle demande ou nous \u00e9crire sur WhatsApp.",
    reqExpired: "Cette demande a expir\u00e9. Vous pouvez en faire une nouvelle.",
    reqClosed: "Cette demande est ferm\u00e9e. Si vous en avez fait une plus r\u00e9cente, utilisez celle-l\u00e0.",
    reqNew: "Faire une nouvelle demande",
    vTitle: "Facultatif : r\u00e9pondez \u00e0 vos questions de s\u00e9curit\u00e9",
    vIntro: "Deux bonnes r\u00e9ponses aident l'\u00e9quipe Bambeh \u00e0 confirmer plus vite que c'est vous. L'\u00e9quipe ne voit jamais vos r\u00e9ponses, seulement si elles correspondent.",
    verifiedOk: "V\u00e9rifi\u00e9. Demandez maintenant \u00e0 Bambeh d'approuver votre demande ci-dessus.",
    phoneNote: "Bambeh ne peut pas encore envoyer de SMS : notre \u00e9quipe confirme que c'est vous en appelant ou en \u00e9crivant au num\u00e9ro de votre compte, ou en voyant votre carte d'identit\u00e9.",
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
    sendBtn: "Send di reset link go my email",
    sending: "E dey go\u2026",
    emailSent: "If dat email dey registered, di link don comot. E fit take small time, and sometimes e dey enter spam.",
    emailFallback: "Nothing enter? Ask us for WhatsApp.",
    waFallbackBtn: "Ask for WhatsApp",
    badPhone: "Abeg put your phone number.",
    badEmail: "Abeg put correct email.",
    failed: "E no work. Abeg use WhatsApp for down.",
    haveCode: "I get code already",
    checkBtn: "Check my answer",
    checking: "E dey check\u2026",
    gotN: "correct so far",
    needTwo: "You need two.",
    tooMany: "You don try too much. Wait one hour.",
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
    tabCode: "Bambeh code",
    codeHint: "Bambeh staff don send you reset code? Use the \"Bambeh code\" tab.",
    codeTitle: "Use the code wey Bambeh staff send you",
    codeIntro: "You no need your old password. Put your phone number, the 8-number code from WhatsApp, and choose new password. The code work only one time and e go expire after 24 hours.",
    codeLabel: "Code from Bambeh (8 number)",
    codeSubmit: "Save my new password",
    codeSaving: "E dey save...",
    codeDone: "Your new password don save. We dey sign you in...",
    codeDoneManual: "Your new password don save. Sign in with your phone number and your new password.",
    errCodeShort: "Put all the 8 number for the code.",
    errCodeInvalid: "That code no correct, or dem don use am, or e don expire. Check the WhatsApp message, or ask Bambeh for new code.",
    errPwShort: "Your new password must reach 8 character.",
    errPwMatch: "The two password no match.",
    errCodeNetwork: "We no fit reach Bambeh. Check your connection and try again.",
    askBtn: "Ask for reset code for WhatsApp",
    newPass: "New password",
    newPassPh: "At least 8 character",
    confirmPass: "Confirm password",
    confirmPassPh: "Type am again",
    show: "Show",
    hide: "Hide",
    ruleLength: "At least 8 character",
    ruleMatch: "The two password dem match",
    ruleNoMatch: "The two password never match",
    reqCardTitle: "Get new password without the old one",
    reqCardBody: "Bambeh staff go check say na really you, normally dem go call or message the number for your account. After that, you go choose new password right here. You no need your old password.",
    reqUsing: "Number:",
    reqBtn: "Ask Bambeh make I choose new password",
    reqBusy: "We dey send your request...",
    reqNoTitle: "Your request number",
    reqNoBody: "Bambeh staff go ask you this number when dem call or message you. Leave this screen open: e go change by himself when dem approve.",
    reqWa: "Tell Bambeh for WhatsApp",
    reqWaMsg: "Hello Bambeh, I don forget my password. My request number na {no}. The number for my account na {phone}.",
    reqWaiting: "We dey wait for Bambeh to approve...",
    reqOpenUntil: "This request go stay open reach {time}.",
    reqCheck: "Check now",
    reqCancel: "Cancel this request",
    reqApproved: "Bambeh don approve your request. Choose your new password now.",
    reqSave: "Save my new password and sign in",
    reqSaveBefore: "Save am before {time}.",
    reqRefused: "Bambeh no fit confirm say na you, so dem close this request. You fit make new request, or write us for WhatsApp.",
    reqExpired: "This request don expire. You fit make new one.",
    reqClosed: "This request don close. If you make another one after am, use that one.",
    reqNew: "Make new request",
    vTitle: "If you want: answer your security question dem",
    vIntro: "Two correct answer go help Bambeh staff confirm say na you quick quick. Staff no dey see your answer, only whether e match.",
    verifiedOk: "E correct. Now ask Bambeh make dem approve your request for up.",
    phoneNote: "Bambeh no fit send SMS yet, so our team go confirm say na you by calling or messaging the number for your account, or by seeing your ID card.",
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
    sendBtn: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0631\u0627\u0628\u0637 \u0625\u0644\u0649 \u0628\u0631\u064a\u062f\u064a",
    sending: "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u2026",
    emailSent: "\u0625\u0630\u0627 \u0643\u0627\u0646 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0645\u0633\u062c\u0651\u0644\u0627\u064b \u0641\u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064a \u0627\u0644\u0637\u0631\u064a\u0642. \u0642\u062f \u064a\u0633\u062a\u063a\u0631\u0642 \u062f\u0642\u0627\u0626\u0642\u060c \u0648\u0623\u062d\u064a\u0627\u0646\u0627\u064b \u064a\u0635\u0644 \u0625\u0644\u0649 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0645\u0632\u0639\u062c.",
    emailFallback: "\u0644\u0645 \u064a\u0635\u0644 \u0634\u064a\u0621\u061f \u0631\u0627\u0633\u0644\u0646\u0627 \u0639\u0644\u0649 \u0648\u0627\u062a\u0633\u0627\u0628.",
    waFallbackBtn: "\u0645\u0631\u0627\u0633\u0644\u0629 \u0648\u0627\u062a\u0633\u0627\u0628",
    badPhone: "\u0645\u0646 \u0641\u0636\u0644\u0643 \u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643.",
    badEmail: "\u0645\u0646 \u0641\u0636\u0644\u0643 \u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u0627\u064b \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0627\u064b \u0635\u062d\u064a\u062d\u0627\u064b.",
    failed: "\u0644\u0645 \u064a\u0646\u062c\u062d \u0630\u0644\u0643. \u0627\u0633\u062a\u062e\u062f\u0645 \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u0627\u0644\u0623\u0633\u0641\u0644.",
    haveCode: "\u0644\u062f\u064a\u0651 \u0631\u0645\u0632 \u0628\u0627\u0644\u0641\u0639\u0644",
    checkBtn: "\u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0625\u062c\u0627\u0628\u0627\u062a\u064a",
    checking: "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642\u2026",
    gotN: "\u0625\u062c\u0627\u0628\u0627\u062a \u0635\u062d\u064a\u062d\u0629",
    needTwo: "\u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0627\u062b\u0646\u062a\u064a\u0646.",
    tooMany: "\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629. \u0627\u0646\u062a\u0638\u0631 \u0633\u0627\u0639\u0629 \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.",
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
    tabCode: "\u0631\u0645\u0632 \u0628\u0627\u0645\u0628\u064a\u0647",
    codeHint: "\u0647\u0644 \u0623\u0631\u0633\u0644 \u0644\u0643 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0631\u0645\u0632\u064b\u0627\u061f \u0627\u0633\u062a\u062e\u062f\u0645 \u062a\u0628\u0648\u064a\u0628 \u00ab\u0631\u0645\u0632 \u0628\u0627\u0645\u0628\u064a\u0647\u00bb.",
    codeTitle: "\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0630\u064a \u0623\u0631\u0633\u0644\u0647 \u0644\u0643 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647",
    codeIntro: "\u0644\u0627 \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0642\u062f\u064a\u0645\u0629. \u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643 \u0648\u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 8 \u0623\u0631\u0642\u0627\u0645 \u0645\u0646 \u0648\u0627\u062a\u0633\u0627\u0628\u060c \u0648\u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629. \u064a\u0639\u0645\u0644 \u0627\u0644\u0631\u0645\u0632 \u0645\u0631\u0629 \u0648\u0627\u062d\u062f\u0629 \u0648\u062a\u0646\u062a\u0647\u064a \u0635\u0644\u0627\u062d\u064a\u062a\u0647 \u0628\u0639\u062f 24 \u0633\u0627\u0639\u0629.",
    codeLabel: "\u0631\u0645\u0632 \u0628\u0627\u0645\u0628\u064a\u0647 (8 \u0623\u0631\u0642\u0627\u0645)",
    codeSubmit: "\u062d\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
    codeSaving: "\u062c\u0627\u0631\u064d \u0627\u0644\u062d\u0641\u0638...",
    codeDone: "\u062a\u0645 \u062d\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629. \u062c\u0627\u0631\u064d \u062a\u0633\u062c\u064a\u0644 \u062f\u062e\u0648\u0644\u0643...",
    codeDoneManual: "\u062a\u0645 \u062d\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629. \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629.",
    errCodeShort: "\u0623\u062f\u062e\u0644 \u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u062b\u0645\u0627\u0646\u064a\u0629 \u0643\u0644\u0647\u0627.",
    errCodeInvalid: "\u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d \u0623\u0648 \u0627\u0633\u062a\u064f\u062e\u062f\u0645 \u0645\u0646 \u0642\u0628\u0644 \u0623\u0648 \u0627\u0646\u062a\u0647\u062a \u0635\u0644\u0627\u062d\u064a\u062a\u0647. \u0631\u0627\u062c\u0639 \u0631\u0633\u0627\u0644\u0629 \u0648\u0627\u062a\u0633\u0627\u0628 \u0623\u0648 \u0627\u0637\u0644\u0628 \u0631\u0645\u0632\u064b\u0627 \u062c\u062f\u064a\u062f\u064b\u0627 \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647.",
    errPwShort: "\u064a\u062c\u0628 \u0623\u0646 \u062a\u062a\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0645\u0646 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
    errPwMatch: "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646.",
    errCodeNetwork: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    askBtn: "\u0627\u0637\u0644\u0628 \u0631\u0645\u0632 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0639\u064a\u064a\u0646 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628",
    newPass: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
    newPassPh: "8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    confirmPass: "\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    confirmPassPh: "\u0623\u0639\u062f \u0625\u062f\u062e\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    show: "\u0625\u0638\u0647\u0627\u0631",
    hide: "\u0625\u062e\u0641\u0627\u0621",
    ruleLength: "8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    ruleMatch: "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u0627\u0646",
    ruleNoMatch: "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646 \u0628\u0639\u062f",
    reqCardTitle: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629 \u062f\u0648\u0646 \u0627\u0644\u0642\u062f\u064a\u0645\u0629",
    reqCardBody: "\u064a\u062a\u062d\u0642\u0642 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0645\u0646 \u0647\u0648\u064a\u062a\u0643\u060c \u0639\u0627\u062f\u0629\u064b \u0628\u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u0633\u062c\u0644 \u0641\u064a \u062d\u0633\u0627\u0628\u0643 \u0623\u0648 \u0645\u0631\u0627\u0633\u0644\u062a\u0647. \u0628\u0639\u062f \u0630\u0644\u0643 \u062a\u062e\u062a\u0627\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629 \u0647\u0646\u0627 \u0645\u0628\u0627\u0634\u0631\u0629. \u0644\u0627 \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0642\u062f\u064a\u0645\u0629.",
    reqUsing: "\u0627\u0644\u0631\u0642\u0645:",
    reqBtn: "\u0627\u0637\u0644\u0628 \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647 \u0623\u0646 \u0623\u062e\u062a\u0627\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629",
    reqBusy: "\u062c\u0627\u0631\u064d \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628\u0643...",
    reqNoTitle: "\u0631\u0642\u0645 \u0637\u0644\u0628\u0643",
    reqNoBody: "\u0633\u064a\u0637\u0644\u0628 \u0645\u0646\u0643 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u0639\u0646\u062f\u0645\u0627 \u064a\u062a\u0635\u0644 \u0628\u0643 \u0623\u0648 \u064a\u0631\u0627\u0633\u0644\u0643. \u0623\u0628\u0642\u0650 \u0647\u0630\u0647 \u0627\u0644\u0634\u0627\u0634\u0629 \u0645\u0641\u062a\u0648\u062d\u0629: \u0633\u062a\u062a\u063a\u064a\u0631 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627 \u0639\u0646\u062f \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629.",
    reqWa: "\u0623\u0628\u0644\u063a \u0628\u0627\u0645\u0628\u064a\u0647 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628",
    reqWaMsg: "\u0645\u0631\u062d\u0628\u064b\u0627 \u0628\u0627\u0645\u0628\u064a\u0647\u060c \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u0631\u0642\u0645 \u0637\u0644\u0628\u064a \u0647\u0648 {no}. \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u0633\u062c\u0644 \u0641\u064a \u062d\u0633\u0627\u0628\u064a \u0647\u0648 {phone}.",
    reqWaiting: "\u0641\u064a \u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0648\u0627\u0641\u0642\u0629 \u0628\u0627\u0645\u0628\u064a\u0647...",
    reqOpenUntil: "\u064a\u0628\u0642\u0649 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628 \u0645\u0641\u062a\u0648\u062d\u064b\u0627 \u062d\u062a\u0649 {time}.",
    reqCheck: "\u062a\u062d\u0642\u0642 \u0627\u0644\u0622\u0646",
    reqCancel: "\u0625\u0644\u063a\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628",
    reqApproved: "\u0648\u0627\u0641\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0639\u0644\u0649 \u0637\u0644\u0628\u0643. \u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0627\u0644\u0622\u0646.",
    reqSave: "\u062d\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0648\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    reqSaveBefore: "\u0627\u062d\u0641\u0638\u0647\u0627 \u0642\u0628\u0644 {time}.",
    reqRefused: "\u0644\u0645 \u064a\u062a\u0645\u0643\u0646 \u0628\u0627\u0645\u0628\u064a\u0647 \u0645\u0646 \u0627\u0644\u062a\u0623\u0643\u062f \u0645\u0646 \u0647\u0648\u064a\u062a\u0643\u060c \u0644\u0630\u0644\u0643 \u0623\u064f\u063a\u0644\u0642 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628. \u064a\u0645\u0643\u0646\u0643 \u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628 \u062c\u062f\u064a\u062f \u0623\u0648 \u0645\u0631\u0627\u0633\u0644\u062a\u0646\u0627 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628.",
    reqExpired: "\u0627\u0646\u062a\u0647\u062a \u0635\u0644\u0627\u062d\u064a\u0629 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628. \u064a\u0645\u0643\u0646\u0643 \u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628 \u062c\u062f\u064a\u062f.",
    reqClosed: "\u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628 \u0645\u063a\u0644\u0642. \u0625\u0630\u0627 \u0642\u062f\u0645\u062a \u0637\u0644\u0628\u064b\u0627 \u0623\u062d\u062f\u062b\u060c \u0641\u0627\u0633\u062a\u062e\u062f\u0645\u0647.",
    reqNew: "\u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628 \u062c\u062f\u064a\u062f",
    vTitle: "\u0627\u062e\u062a\u064a\u0627\u0631\u064a: \u0623\u062c\u0628 \u0639\u0646 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0623\u0645\u0627\u0646",
    vIntro: "\u0625\u062c\u0627\u0628\u062a\u0627\u0646 \u0635\u062d\u064a\u062d\u062a\u0627\u0646 \u062a\u0633\u0627\u0639\u062f\u0627\u0646 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0639\u0644\u0649 \u0627\u0644\u062a\u0623\u0643\u062f \u0645\u0646 \u0647\u0648\u064a\u062a\u0643 \u0628\u0633\u0631\u0639\u0629 \u0623\u0643\u0628\u0631. \u0644\u0627 \u064a\u0631\u0649 \u0627\u0644\u0641\u0631\u064a\u0642 \u0625\u062c\u0627\u0628\u0627\u062a\u0643 \u0623\u0628\u062f\u064b\u0627\u060c \u0628\u0644 \u064a\u0631\u0649 \u0641\u0642\u0637 \u0625\u0646 \u0643\u0627\u0646\u062a \u0645\u062a\u0637\u0627\u0628\u0642\u0629.",
    verifiedOk: "\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642. \u0627\u0637\u0644\u0628 \u0627\u0644\u0622\u0646 \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628\u0643 \u0623\u0639\u0644\u0627\u0647.",
    phoneNote: "\u0644\u0627 \u064a\u0633\u062a\u0637\u064a\u0639 \u0628\u0627\u0645\u0628\u064a\u0647 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0626\u0644 \u0646\u0635\u064a\u0629 \u0628\u0639\u062f\u060c \u0644\u0630\u0644\u0643 \u064a\u062a\u0623\u0643\u062f \u0641\u0631\u064a\u0642\u0646\u0627 \u0645\u0646 \u0647\u0648\u064a\u062a\u0643 \u0628\u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u0633\u062c\u0644 \u0641\u064a \u062d\u0633\u0627\u0628\u0643 \u0623\u0648 \u0645\u0631\u0627\u0633\u0644\u062a\u0647\u060c \u0623\u0648 \u0628\u0631\u0624\u064a\u0629 \u0628\u0637\u0627\u0642\u0629 \u0647\u0648\u064a\u062a\u0643.",
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
    sendBtn: "Neldu ce\u014bngal e iimeel am",
    sending: "Ina nelda\u2026",
    emailSent: "So tawii iimeel ngal ina winndaa, ce\u014bngal ngal ina ara. Ina waawi \u01b4ettude hojomaaji see\u0257a, kadi ina waawi naatde e spam.",
    emailFallback: "Hay huunde araani? \u01b3eewndo men e WhatsApp.",
    waFallbackBtn: "\u01b3eewndo e WhatsApp",
    badPhone: "Tii\u0257no naatnu limngal noddirgal maa.",
    badEmail: "Tii\u0257no naatnu iimeel goong\u0257inaango.",
    failed: "\u018aum gollaaki. Tii\u0257no huutoro WhatsApp les \u0257oo.",
    haveCode: "Mi jogii koodu",
    checkBtn: "\u01b3eewto jaabawuuji am",
    checking: "Ina \u01b4eewee\u2026",
    gotN: "goong\u0257i haa jooni",
    needTwo: "A\u0257a soklli \u0257i\u0257i.",
    tooMany: "Ndaarndo-\u0257aa ko heewi. Fadu waktu gooto.",
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
    tabCode: "Kod Bambeh",
    codeHint: "Gollo\u0253e Bambeh neldii ma kod? Huutoro hello \"Kod Bambeh\".",
    codeTitle: "Huutoro kod mo gollo\u0253e Bambeh neldi ma",
    codeIntro: "A haajaaki finnde maa hii\u0257nde. Naatnu limngal tilifon maa, kod limngal 8 immorde e WhatsApp, su\u0253o finnde keso. Kod oo ina golla laawol gootol tan, ina timma caggal waktuuji 24.",
    codeLabel: "Kod Bambeh (limngal 8)",
    codeSubmit: "Danndu finnde am keso",
    codeSaving: "Eno dannda...",
    codeDone: "Finnde maa keso danndaama. Eno naatnde ma...",
    codeDoneManual: "Finnde maa keso danndaama. Naatir e limngal tilifon maa e finnde maa keso.",
    errCodeShort: "Naatnu limngal kod oo fof 8.",
    errCodeInvalid: "Kod oo selli, walla huutoraama, walla timmii. \u01b3eewu mesaas WhatsApp oo, walla \u01b4am kod keso e Bambeh.",
    errPwShort: "Finnde keso ina foti heewde alkule 8.",
    errPwMatch: "Finndeeji \u0257i\u0257i \u0257in nanndaani.",
    errCodeNetwork: "Min mbaawaani he\u0253de Bambeh. \u01b3eewu jokkondiral maa nda\u0257\u0257a kadi.",
    askBtn: "\u01b3am kod kes\u0257itingol e WhatsApp",
    newPass: "Finnde keso",
    newPassPh: "Ko fam\u0257i fof alkule 8",
    confirmPass: "Tee\u014btinu finnde",
    confirmPassPh: "Winndu \u0257um kadi",
    show: "Hollu",
    hide: "Suu\u0257u",
    ruleLength: "Ko fam\u0257i fof alkule 8",
    ruleMatch: "Finndeeji \u0257i\u0257i \u0257in nanndi",
    ruleNoMatch: "Finndeeji \u0257i\u0257i \u0257in nanndaani tawo",
    reqCardTitle: "He\u0253u finnde keso tawa a haajaaki hii\u0257nde nde",
    reqCardBody: "Gollo\u0253e Bambeh \u01b4eewtat ko an tigi, ko \u0253uri heewde \u0253e noddan walla \u0253e winndan limngal konte maa. Caggal \u0257uum, a su\u0253oto finnde keso \u0257oo. A haajaaki finnde hii\u0257nde.",
    reqUsing: "Limngal:",
    reqBtn: "\u01b3am Bambeh yo mi su\u0253o finnde keso",
    reqBusy: "Eno neldude \u0257a\u0253\u0253aande maa...",
    reqNoTitle: "Limngal \u0257a\u0253\u0253aande maa",
    reqNoBody: "Gollo\u0253e Bambeh \u01b4amete limngal ngal so \u0253e noddii ma walla \u0253e winndii ma. Accu yaynirde nde uddita: ina waylitoo hoore mum so \u0253e ja\u0253ii.",
    reqWa: "Habru Bambeh e WhatsApp",
    reqWaMsg: "Jam Bambeh, mi yejjitii finnde am. Limngal \u0257a\u0253\u0253aande am ko {no}. Limngal konte am ko {phone}.",
    reqWaiting: "Eno habba ja\u0253\u0253ugol Bambeh...",
    reqOpenUntil: "\u018aa\u0253\u0253aande nde ina uddita haa {time}.",
    reqCheck: "\u01b3eewu jooni",
    reqCancel: "Haaytin \u0257a\u0253\u0253aande nde",
    reqApproved: "Bambeh ja\u0253ii \u0257a\u0253\u0253aande maa. Su\u0253o finnde maa keso jooni.",
    reqSave: "Danndu finnde am keso, naatnu mi",
    reqSaveBefore: "Danndu \u0257um hade {time}.",
    reqRefused: "Bambeh waawaa tabitinde ko an, \u0257a\u0253\u0253aande nde uddaama. A waawii wa\u0257de \u0257a\u0253\u0253aande keso, walla winndane men e WhatsApp.",
    reqExpired: "\u018aa\u0253\u0253aande nde timmii. A waawii wa\u0257de keso.",
    reqClosed: "\u018aa\u0253\u0253aande nde uddaama. So a wa\u0257ii keso caggal mayre, huutoro nde.",
    reqNew: "Wa\u0257 \u0257a\u0253\u0253aande keso",
    vTitle: "So a yi\u0257ii: jaabo naamne reentaare maa",
    vIntro: "Jaabawuuji goonga \u0257i\u0257i ina mballa gollo\u0253e Bambeh tabitinde ko an no yaawi. Gollo\u0253e njiyataa jaabawuuji maa, \u0253e njiyata tan so \u0257i nanndii.",
    verifiedOk: "\u01b3eewtaama. Jooni \u01b4am Bambeh yo \u0253e ja\u0253 \u0257a\u0253\u0253aande maa dow.",
    phoneNote: "Bambeh waawaa neldude SMS tawo, ndelle gollo\u0253e amen tabitinta ko an so \u0253e noddii walla \u0253e winndii limngal konte maa, walla so \u0253e njiyii karte ndaardi maa.",
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

  /* FIX627 - the sign-in page hands over what was typed there (?phone=,
     ?email=, ?mode=) so nobody types their number twice. */
  const location = useLocation();
  const urlQuery = (() => {
    try { return new URLSearchParams(location.search || ''); } catch { return new URLSearchParams(''); }
  })();
  const urlPhone = (() => {
    const d = String(urlQuery.get('phone') || '').replace(/\D/g, '');
    return d.length >= 8 && d.length <= 15 ? d : '';
  })();
  const urlEmail = String(urlQuery.get('email') || '').trim();
  const urlMode = String(urlQuery.get('mode') || '');

  const [mode, setMode] = useState<'phone' | 'email' | 'code'>(
    urlMode === 'email' || urlMode === 'code' ? (urlMode as 'email' | 'code') : 'phone',
  );
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
  const [email, setEmail] = useState(urlEmail.includes('@') ? urlEmail : '');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* FIX625 - a reset code from Bambeh staff. The owner does NOT need the old
     password: the database checks the code (bambeh_redeem_reset_code, FIX623),
     sets the new password, signs out every other device, and the page then
     signs straight in. Works once, expires after 24 hours, 5 tries. */
  const navigate = useNavigate();
  const [cPhone, setCPhone] = useState('');
  const [cPhoneOk, setCPhoneOk] = useState(false);
  const [cCode, setCCode] = useState('');
  const [cPw1, setCPw1] = useState('');
  const [cPw2, setCPw2] = useState('');
  const [cShow, setCShow] = useState(false);
  const [cBusy, setCBusy] = useState(false);
  const [cDone, setCDone] = useState<'' | 'signed_in' | 'manual'>('');
  const cDigits = cPhone.replace(/\D/g, '');
  const cCodeDigits = cCode.replace(/\D/g, '');
  const cLong = cPw1.length >= 8;
  const cMatch = cPw1.length > 0 && cPw1 === cPw2;
  const cReady = cPhoneOk && cCodeDigits.length === 8 && cLong && cMatch && !cBusy;

  const redeemResetCode = async () => {
    if (!cPhoneOk || cDigits.length < 8) { setError(t('badPhone')); return; }
    if (cCodeDigits.length !== 8) { setError(t('errCodeShort')); return; }
    if (!cLong) { setError(t('errPwShort')); return; }
    if (!cMatch) { setError(t('errPwMatch')); return; }
    setCBusy(true);
    setError(null);
    try {
      let res: { data: unknown; error: { message?: string } | null } | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        res = (await supabase.rpc('bambeh_redeem_reset_code', {
          p_phone: cDigits,
          p_code: cCodeDigits,
          p_new_password: cPw1,
        })) as unknown as { data: unknown; error: { message?: string } | null };
        if (res && res.error && attempt === 0 && /fetch|network|timeout/i.test(String(res.error.message || ''))) {
          await new Promise((r) => setTimeout(r, 900));
          continue;
        }
        break;
      }
      if (!res || res.error) { setError(t('errCodeNetwork')); return; }
      const d = (res.data || {}) as { ok?: boolean; reason?: string; login?: string };
      if (d.ok !== true) {
        setError(
          d.reason === 'too_many' ? t('tooMany')
            : d.reason === 'weak_password' ? t('errPwShort')
              : d.reason === 'code_format' ? t('errCodeShort')
                : d.reason === 'bad_phone' ? t('badPhone')
                  : t('errCodeInvalid'),
        );
        return;
      }
      // The new password is in place. Sign straight in with it.
      let signedIn = false;
      if (d.login) {
        try {
          const s = await supabase.auth.signInWithPassword({ email: String(d.login), password: cPw1 });
          signedIn = !s.error;
        } catch { signedIn = false; }
      }
      setCPw1(''); setCPw2(''); setCCode('');
      if (signedIn) {
        setCDone('signed_in');
        window.setTimeout(() => navigate('/', { replace: true }), 1200);
      } else {
        setCDone('manual');
      }
    } catch {
      setError(t('errCodeNetwork'));
    } finally {
      setCBusy(false);
    }
  };

  const digits = phone.replace(/\D/g, '');

  const answeredCount = QUESTION_KEYS.filter((k) => (answers[k] || '').trim().length >= 2).length;

  /* -- FIX627: PASSWORD HELP REQUEST ------------------------------------------
     The owner types their number and asks. The database (FIX626) answers with
     a 4-digit request number and a secret key for THIS phone; staff approve
     that exact request after checking it is the owner; this screen then asks
     for a new password. The key is kept in sessionStorage so a reload or a
     quick switch to WhatsApp does not lose the request. */
  type HelpReq = { id: string; token: string; no: string; phone: string; until: string };
  const REQ_KEY = 'bambeh_help_request';
  const loadReq = (): HelpReq | null => {
    try {
      const raw = window.sessionStorage.getItem(REQ_KEY);
      if (!raw) return null;
      const r = JSON.parse(raw) as HelpReq;
      return r && r.id && r.token && r.no ? r : null;
    } catch {
      return null;
    }
  };
  const saveReq = (r: HelpReq | null) => {
    try {
      if (r) window.sessionStorage.setItem(REQ_KEY, JSON.stringify(r));
      else window.sessionStorage.removeItem(REQ_KEY);
    } catch {
      /* private mode: the request still works while this page stays open */
    }
  };
  const [req, setReq] = useState<HelpReq | null>(() => loadReq());
  const [reqStatus, setReqStatus] = useState<string>(() => (loadReq() ? 'pending' : ''));
  const [reqBusy, setReqBusy] = useState(false);
  const [reqUntil, setReqUntil] = useState('');
  const [rPw1, setRPw1] = useState('');
  const [rPw2, setRPw2] = useState('');
  const [rShow, setRShow] = useState(false);
  const [rSaving, setRSaving] = useState(false);
  const [rDone, setRDone] = useState<'' | 'signed_in' | 'manual'>('');
  const rLong = rPw1.length >= 8;
  const rMatch = rPw1.length > 0 && rPw1 === rPw2;

  // the number to ask with: what was typed here, or what the sign-in page sent
  const typedDigits = phone.replace(/\D/g, '');
  const reqDigits = typedDigits.length > 4 ? (phoneOk ? typedDigits : '') : urlPhone;
  const intl = (d: string) => (d.length === 9 && d.charAt(0) === '6' ? '237' + d : d);
  const prettyIntl = (d: string) => {
    const x = intl(d);
    return x.length === 12 && x.indexOf('237') === 0
      ? '+237 ' + x.slice(3, 6) + ' ' + x.slice(6, 9) + ' ' + x.slice(9)
      : '+' + x;
  };
  const clock = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  type RpcOut = { data: unknown; error: { message?: string } | null };
  const callRpc = async (fn: string, args: Record<string, unknown>): Promise<RpcOut> => {
    let res: RpcOut = { data: null, error: { message: 'network' } };
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        res = (await supabase.rpc(fn, args)) as unknown as RpcOut;
      } catch (e) {
        res = { data: null, error: { message: String((e as { message?: string })?.message || 'network') } };
      }
      if (res.error && attempt === 0 && /fetch|network|timeout/i.test(String(res.error.message || ''))) {
        await new Promise((r) => setTimeout(r, 900));
        continue;
      }
      break;
    }
    return res;
  };

  const pollReq = async (r: HelpReq) => {
    const res = await callRpc('bambeh_reset_request_status', { p_request_id: r.id, p_token: r.token });
    if (res.error) return; // a weak connection is not a "no": keep waiting
    const d = (res.data || {}) as { status?: string; approved_until?: string };
    setReqStatus(String(d.status || 'unknown'));
    if (d.approved_until) setReqUntil(String(d.approved_until));
  };

  useEffect(() => {
    if (!req || rDone || reqStatus !== 'pending') return;
    void pollReq(req);
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void pollReq(req);
    }, 5000);
    return () => window.clearInterval(id);
    // pollReq is recreated every render; the request itself is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req, reqStatus, rDone]);

  const askBambeh = async () => {
    const d = reqDigits;
    if (!d || d.length < 8) { setError(t('badPhone')); return; }
    setReqBusy(true);
    setError(null);
    try {
      const res = await callRpc('bambeh_reset_request_create', { p_phone: d });
      if (res.error) { setError(t('errCodeNetwork')); return; }
      const x = (res.data || {}) as { ok?: boolean; reason?: string; request_id?: string; token?: string; request_no?: string; expires_at?: string };
      if (x.ok !== true || !x.request_id || !x.token || !x.request_no) {
        setError(x.reason === 'too_many' ? t('tooMany') : x.reason === 'bad_phone' ? t('badPhone') : t('errCodeNetwork'));
        return;
      }
      const r: HelpReq = { id: String(x.request_id), token: String(x.token), no: String(x.request_no), phone: intl(d), until: String(x.expires_at || '') };
      saveReq(r);
      setReq(r);
      setReqUntil('');
      setReqStatus('pending');
    } finally {
      setReqBusy(false);
    }
  };

  const finishReq = async () => {
    if (!req) return;
    if (!rLong) { setError(t('errPwShort')); return; }
    if (!rMatch) { setError(t('errPwMatch')); return; }
    setRSaving(true);
    setError(null);
    try {
      const res = await callRpc('bambeh_reset_request_complete', { p_request_id: req.id, p_token: req.token, p_new_password: rPw1 });
      if (res.error) { setError(t('errCodeNetwork')); return; }
      const d = (res.data || {}) as { ok?: boolean; reason?: string; login?: string };
      if (d.ok !== true) {
        if (d.reason === 'weak_password') setError(t('errPwShort'));
        else setReqStatus(d.reason === 'expired' ? 'expired' : 'closed');
        return;
      }
      // The new password is in place. Sign straight in with it.
      let signedIn = false;
      if (d.login) {
        try {
          const s = await supabase.auth.signInWithPassword({ email: String(d.login), password: rPw1 });
          signedIn = !s.error;
        } catch {
          signedIn = false;
        }
      }
      setRPw1('');
      setRPw2('');
      saveReq(null);
      if (signedIn) {
        setRDone('signed_in');
        window.setTimeout(() => navigate('/', { replace: true }), 1200);
      } else {
        setRDone('manual');
      }
    } finally {
      setRSaving(false);
    }
  };

  const newRequest = () => {
    saveReq(null);
    setReq(null);
    setReqStatus('');
    setReqUntil('');
    setRDone('');
    setError(null);
  };

  const waReqUrl = req
    ? `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
        t('reqWaMsg').split('{no}').join(req.no).split('{phone}').join(prettyIntl(req.phone)),
      )}`
    : '';

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
          <div className="grid grid-cols-3 gap-2 mb-5">
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
            <button type="button" onClick={() => { setMode('code'); setError(null); }}
              className={`${TAB} ${mode === 'code'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-200'}`}>
              {t('tabCode')}
            </button>
          </div>

          {/* -- PHONE --------------------------------------------------- */}
          {mode === 'code' ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-teal-50 border border-teal-100 p-3">
                <p className="text-sm font-semibold text-teal-900">{t('codeTitle')}</p>
                <p className="text-xs text-teal-800 mt-1">{t('codeIntro')}</p>
              </div>
              {cDone ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 font-semibold text-center">
                  {cDone === 'signed_in' ? t('codeDone') : t('codeDoneManual')}
                  {cDone === 'manual' ? (
                    <div className="mt-3">
                      <Link to="/login" className="underline">{t('back')}</Link>
                    </div>
                  ) : null}
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void redeemResetCode(); }}>
                  <div dir="ltr">
                    <AfricanPhoneInput
                      value={cPhone}
                      label={t('phoneLabel')}
                      required
                      onChange={(full, valid) => {
                        setCPhone(full);
                        setCPhoneOk(valid);
                        if (valid) setError(null);
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="fpCode" className="block text-sm font-medium text-gray-700">{t('codeLabel')}</label>
                    <input id="fpCode" inputMode="numeric" autoComplete="one-time-code" maxLength={11}
                      value={cCode} onChange={(e) => setCCode(e.target.value)} placeholder="1234 5678"
                      className={INPUT + ' tracking-widest text-center text-lg'} dir="ltr" />
                  </div>
                  <div>
                    <label htmlFor="fpNew1" className="block text-sm font-medium text-gray-700">{t('newPass')}</label>
                    <input id="fpNew1" type={cShow ? 'text' : 'password'} autoComplete="new-password"
                      value={cPw1} onChange={(e) => setCPw1(e.target.value)} placeholder={t('newPassPh')} className={INPUT} />
                  </div>
                  <div>
                    <label htmlFor="fpNew2" className="block text-sm font-medium text-gray-700">{t('confirmPass')}</label>
                    <input id="fpNew2" type={cShow ? 'text' : 'password'} autoComplete="new-password"
                      value={cPw2} onChange={(e) => setCPw2(e.target.value)} placeholder={t('confirmPassPh')} className={INPUT} />
                  </div>
                  <button type="button" onClick={() => setCShow((v) => !v)} className="text-xs font-semibold text-teal-700 underline">
                    {cShow ? t('hide') : t('show')}
                  </button>
                  <div className="text-xs space-y-1">
                    <p className={cLong ? 'text-emerald-700' : 'text-gray-500'}>{cLong ? '\u2713' : '\u2022'} {t('ruleLength')}</p>
                    <p className={cMatch ? 'text-emerald-700' : 'text-gray-500'}>{cMatch ? '\u2713' : '\u2022'} {cMatch ? t('ruleMatch') : t('ruleNoMatch')}</p>
                  </div>
                  <button type="submit" disabled={!cReady}
                    className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-3 font-semibold disabled:bg-gray-300">
                    {cBusy ? t('codeSaving') : t('codeSubmit')}
                  </button>
                </form>
              )}
            </div>
          ) : mode === 'phone' && req ? (
            /* -- FIX627: the request, from "waiting" to "choose a password" -- */
            <div className="space-y-4" data-fix="FIX627">
              {rDone ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 font-semibold text-center">
                  {rDone === 'signed_in' ? t('codeDone') : t('codeDoneManual')}
                  {rDone === 'manual' ? (
                    <div className="mt-3">
                      <Link to="/login" className="underline">{t('back')}</Link>
                    </div>
                  ) : null}
                </div>
              ) : reqStatus === 'approved' ? (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void finishReq(); }}>
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-800">
                    {t('reqApproved')}
                  </div>
                  <div>
                    <label htmlFor="fpReq1" className="block text-sm font-medium text-gray-700">{t('newPass')}</label>
                    <input id="fpReq1" type={rShow ? 'text' : 'password'} autoComplete="new-password"
                      value={rPw1} onChange={(e) => setRPw1(e.target.value)} placeholder={t('newPassPh')} className={INPUT} />
                  </div>
                  <div>
                    <label htmlFor="fpReq2" className="block text-sm font-medium text-gray-700">{t('confirmPass')}</label>
                    <input id="fpReq2" type={rShow ? 'text' : 'password'} autoComplete="new-password"
                      value={rPw2} onChange={(e) => setRPw2(e.target.value)} placeholder={t('confirmPassPh')} className={INPUT} />
                  </div>
                  <button type="button" onClick={() => setRShow((v) => !v)} className="text-xs font-semibold text-teal-700 underline">
                    {rShow ? t('hide') : t('show')}
                  </button>
                  <div className="text-xs space-y-1">
                    <p className={rLong ? 'text-emerald-700' : 'text-gray-500'}>{rLong ? '\u2713' : '\u2022'} {t('ruleLength')}</p>
                    <p className={rMatch ? 'text-emerald-700' : 'text-gray-500'}>{rMatch ? '\u2713' : '\u2022'} {rMatch ? t('ruleMatch') : t('ruleNoMatch')}</p>
                  </div>
                  <button type="submit" disabled={rSaving || !rLong || !rMatch}
                    className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-3 font-semibold disabled:bg-gray-300">
                    {rSaving ? t('codeSaving') : t('reqSave')}
                  </button>
                  {reqUntil ? (
                    <p className="text-[11px] text-gray-500 text-center">{t('reqSaveBefore').split('{time}').join(clock(reqUntil))}</p>
                  ) : null}
                </form>
              ) : reqStatus === 'pending' ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">{t('reqNoTitle')}</p>
                    <p className="my-2 text-4xl font-extrabold tracking-widest text-teal-900" dir="ltr">{req.no}</p>
                    <p className="text-xs text-teal-800">{t('reqNoBody')}</p>
                  </div>
                  <a href={waReqUrl} target="_blank" rel="noopener noreferrer"
                    className="block w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-center font-semibold">
                    {t('reqWa')}
                  </a>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-700" role="status">
                    <span className="inline-block h-3 w-3 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                    {t('reqWaiting')}
                  </div>
                  {req.until ? (
                    <p className="text-xs text-gray-500 text-center">{t('reqOpenUntil').split('{time}').join(clock(req.until))}</p>
                  ) : null}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void pollReq(req)}
                      className="flex-1 rounded-xl border border-teal-200 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                      {t('reqCheck')}
                    </button>
                    <button type="button" onClick={newRequest}
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      {t('reqCancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                    {reqStatus === 'refused' ? t('reqRefused') : reqStatus === 'expired' ? t('reqExpired') : t('reqClosed')}
                  </div>
                  <button type="button" onClick={newRequest}
                    className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-3 font-semibold">
                    {t('reqNew')}
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'phone' ? (
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
                <button type="button" onClick={() => { setMode('code'); setError(null); }}
                  className="mt-2 text-xs font-semibold text-teal-700 underline text-start">
                  {t('codeHint')}
                </button>
              </div>

              {/* -- FIX627: the request - the main way back in ------------- */}
              <div className="rounded-2xl border-2 border-teal-200 bg-white p-3 space-y-2" data-fix="FIX627">
                <p className="text-sm font-semibold text-gray-800">{t('reqCardTitle')}</p>
                <p className="text-xs text-gray-600">{t('reqCardBody')}</p>
                {reqDigits ? (
                  <p className="text-xs text-gray-500" dir="ltr">{t('reqUsing')} {prettyIntl(reqDigits)}</p>
                ) : null}
                <button type="button" onClick={() => void askBambeh()} disabled={reqBusy || !reqDigits}
                  className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-3 font-semibold disabled:bg-gray-300">
                  {reqBusy ? t('reqBusy') : t('reqBtn')}
                </button>
              </div>

              {/* -- FIX488: prove it is your account (optional since FIX627) */}
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
// BAMBEH_END_TOKEN__FORGOTPASSWORD_FIX627__COMPLETE
