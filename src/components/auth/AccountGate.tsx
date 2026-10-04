// BAMBEH_DEPLOY_TOKEN__ACCOUNT_GATE_FIX613_CLEAN
/**
 * FIX613 - AccountGate (password change, paused account, security questions)
 *
 * Mounted ONCE, app-wide, beside <AgentCapture />. Invisible for almost everyone.
 *  - If Bambeh staff marked this account "must change password" (Account recovery,
 *    FIX612), it covers the screen until the owner chooses a new password.
 *  - If the account is paused or frozen, it says so plainly and offers sign-out.
 *  - If the account has fewer than 3 security answers, it asks for them (the five
 *    questions Big chose). Brand-new accounts must answer; older accounts may tap
 *    Later once a day. Answers go straight to bambeh_set_security_answers and are
 *    stored only as hashes - nobody at Bambeh can read them.
 *
 * The database decides, not this file: the flag can only be cleared once the
 * password hash has really changed (bambeh_password_change_done, FIX610).
 *
 * FAILS OPEN. No session, no network, or FIX610 not run yet = it renders nothing
 * and the app behaves exactly as before. It never touches routing, so it is safe
 * wherever it is mounted. Own error boundary: if it ever throws, it hides itself.
 * Every non-ASCII character is a \u escape so this file cannot be mojibaked.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useAppLang";

type LangKey = "en" | "fr" | "pidgin" | "ar" | "ff";
type Phase = "idle" | "must_change" | "paused" | "done" | "security" | "secdone";

const QUESTION_KEYS = ["mother_middle_name", "primary_school", "best_friend", "first_car_colour", "birth_town"] as const;
const SNOOZE_PREFIX = "bambeh:fix613:secq-later:";
const NEW_ACCOUNT_MS = 30 * 60 * 1000;

const S: Record<LangKey, Record<string, string>> = {
  en: {
    title: "Choose a new password",
    sub: "Bambeh staff reset your account. For your safety, choose a new password before you continue.",
    newPass: "New password",
    newPassPh: "At least 8 characters",
    confirmPass: "Confirm password",
    confirmPassPh: "Type it again",
    show: "Show",
    hide: "Hide",
    ruleLength: "At least 8 characters",
    ruleMatch: "The two passwords match",
    ruleNoMatch: "The two passwords do not match yet",
    save: "Save my new password",
    saving: "Saving...",
    doneTitle: "Password changed",
    doneSub: "Your new password is saved. You can continue.",
    errSame: "Choose a password that is different from the one Bambeh gave you.",
    errNetwork: "We could not reach Bambeh. Check your connection and try again.",
    errGeneric: "Your password could not be changed:",
    signOut: "Sign out",
    pausedTitle: "Your account is paused",
    pausedSub: "Bambeh staff have paused this account. If you think this is a mistake, write to support@bambeh.com and include your phone number.",
    checkAgain: "Check again",
    q_mother_middle_name: "What is your mother's middle name?",
    q_primary_school: "What is the name of your primary school?",
    q_best_friend: "What is the name of your best friend?",
    q_first_car_colour: "What was the colour of your first car?",
    q_birth_town: "In which town were you born?",
    carSkip: "Never had a car? Skip this one.",
    secTitle: "Protect your account",
    secSub: "Answer at least 3 of these questions. If you ever forget your password, Bambeh will ask you the same questions to prove the account is yours.",
    secTip: "Capital letters, accents, spaces and punctuation do not matter, but the words do. Bambeh staff can never see your answers.",
    secCount: "{n} of 3 answered",
    secSave: "Save my answers",
    later: "Later",
    secDone: "Your account is protected.",
    errNeedThree: "Answer at least 3 questions.",
    errAnswerShort: "Each answer needs at least 2 letters.",
    errAnswerLong: "One answer is too long. Keep each under 120 letters.",
  },
  fr: {
    title: "Choisissez un nouveau mot de passe",
    sub: "L'\u00e9quipe Bambeh a r\u00e9initialis\u00e9 votre compte. Pour votre s\u00e9curit\u00e9, choisissez un nouveau mot de passe avant de continuer.",
    newPass: "Nouveau mot de passe",
    newPassPh: "Au moins 8 caract\u00e8res",
    confirmPass: "Confirmez le mot de passe",
    confirmPassPh: "Saisissez-le \u00e0 nouveau",
    show: "Afficher",
    hide: "Masquer",
    ruleLength: "Au moins 8 caract\u00e8res",
    ruleMatch: "Les deux mots de passe correspondent",
    ruleNoMatch: "Les deux mots de passe ne correspondent pas encore",
    save: "Enregistrer mon nouveau mot de passe",
    saving: "Enregistrement...",
    doneTitle: "Mot de passe modifi\u00e9",
    doneSub: "Votre nouveau mot de passe est enregistr\u00e9. Vous pouvez continuer.",
    errSame: "Choisissez un mot de passe diff\u00e9rent de celui que Bambeh vous a donn\u00e9.",
    errNetwork: "Impossible de joindre Bambeh. V\u00e9rifiez votre connexion et r\u00e9essayez.",
    errGeneric: "Le mot de passe n'a pas pu \u00eatre modifi\u00e9 :",
    signOut: "Se d\u00e9connecter",
    pausedTitle: "Votre compte est en pause",
    pausedSub: "L'\u00e9quipe Bambeh a mis ce compte en pause. Si vous pensez qu'il s'agit d'une erreur, \u00e9crivez \u00e0 support@bambeh.com en indiquant votre num\u00e9ro de t\u00e9l\u00e9phone.",
    checkAgain: "V\u00e9rifier \u00e0 nouveau",
    q_mother_middle_name: "Quel est le deuxi\u00e8me pr\u00e9nom de votre m\u00e8re ?",
    q_primary_school: "Quel est le nom de votre \u00e9cole primaire ?",
    q_best_friend: "Comment s'appelle votre meilleur(e) ami(e) ?",
    q_first_car_colour: "De quelle couleur \u00e9tait votre premi\u00e8re voiture ?",
    q_birth_town: "Dans quelle ville \u00eates-vous n\u00e9(e) ?",
    carSkip: "Jamais eu de voiture ? Passez cette question.",
    secTitle: "Prot\u00e9gez votre compte",
    secSub: "R\u00e9pondez \u00e0 au moins 3 de ces questions. Si vous oubliez un jour votre mot de passe, Bambeh vous posera les m\u00eames questions pour v\u00e9rifier que le compte est bien le v\u00f4tre.",
    secTip: "Les majuscules, les accents, les espaces et la ponctuation ne comptent pas, mais les mots, si. L'\u00e9quipe Bambeh ne peut jamais voir vos r\u00e9ponses.",
    secCount: "{n} sur 3 r\u00e9pondues",
    secSave: "Enregistrer mes r\u00e9ponses",
    later: "Plus tard",
    secDone: "Votre compte est prot\u00e9g\u00e9.",
    errNeedThree: "R\u00e9pondez \u00e0 au moins 3 questions.",
    errAnswerShort: "Chaque r\u00e9ponse doit contenir au moins 2 lettres.",
    errAnswerLong: "Une r\u00e9ponse est trop longue. Gardez chacune sous 120 lettres.",
  },
  pidgin: {
    title: "Choose new password",
    sub: "Bambeh staff don reset your account. For your safety, choose new password before you continue.",
    newPass: "New password",
    newPassPh: "At least 8 character",
    confirmPass: "Confirm password",
    confirmPassPh: "Type am again",
    show: "Show",
    hide: "Hide",
    ruleLength: "At least 8 character",
    ruleMatch: "The two password dem match",
    ruleNoMatch: "The two password never match",
    save: "Save my new password",
    saving: "E dey save...",
    doneTitle: "Password don change",
    doneSub: "Your new password don save. You fit continue.",
    errSame: "Choose password wey different from the one wey Bambeh give you.",
    errNetwork: "We no fit reach Bambeh. Check your connection and try again.",
    errGeneric: "Password no fit change:",
    signOut: "Sign out",
    pausedTitle: "Your account dey pause",
    pausedSub: "Bambeh staff don pause this account. If you think say na mistake, write to support@bambeh.com and put your phone number.",
    checkAgain: "Check again",
    q_mother_middle_name: "Wetin be your mami middle name?",
    q_primary_school: "Wetin be the name of your primary school?",
    q_best_friend: "Wetin be the name of your best friend?",
    q_first_car_colour: "Wetin be the colour of your first motor?",
    q_birth_town: "Which town dem born you?",
    carSkip: "You never get motor? Leave this one.",
    secTitle: "Protect your account",
    secSub: "Answer at least 3 of these question dem. If you ever forget your password, Bambeh go ask you the same question dem to know say the account na your own.",
    secTip: "Capital letter, accent, space and full stop no matter, but the word dem matter. Bambeh staff no fit ever see your answer dem.",
    secCount: "{n} for 3 don answer",
    secSave: "Save my answer dem",
    later: "Later",
    secDone: "Your account don protect.",
    errNeedThree: "Answer at least 3 question.",
    errAnswerShort: "Every answer need at least 2 letter.",
    errAnswerLong: "One answer too long. Make each one no pass 120 letter.",
  },
  ar: {
    title: "\u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629",
    sub: "\u0623\u0639\u0627\u062f \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0636\u0628\u0637 \u062d\u0633\u0627\u0628\u0643. \u0645\u0646 \u0623\u062c\u0644 \u0633\u0644\u0627\u0645\u062a\u0643\u060c \u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629 \u0642\u0628\u0644 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629.",
    newPass: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
    newPassPh: "8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    confirmPass: "\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    confirmPassPh: "\u0623\u0639\u062f \u0625\u062f\u062e\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    show: "\u0625\u0638\u0647\u0627\u0631",
    hide: "\u0625\u062e\u0641\u0627\u0621",
    ruleLength: "8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    ruleMatch: "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u0627\u0646",
    ruleNoMatch: "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646 \u0628\u0639\u062f",
    save: "\u062d\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629",
    saving: "\u062c\u0627\u0631\u064d \u0627\u0644\u062d\u0641\u0638...",
    doneTitle: "\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    doneSub: "\u062a\u0645 \u062d\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629. \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629.",
    errSame: "\u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0645\u062e\u062a\u0644\u0641\u0629 \u0639\u0646 \u0627\u0644\u062a\u064a \u0623\u0639\u0637\u0627\u0643 \u0625\u064a\u0627\u0647\u0627 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647.",
    errNetwork: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    errGeneric: "\u062a\u0639\u0630\u0651\u0631 \u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631:",
    signOut: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c",
    pausedTitle: "\u062d\u0633\u0627\u0628\u0643 \u0645\u0648\u0642\u0648\u0641 \u0645\u0624\u0642\u062a\u064b\u0627",
    pausedSub: "\u0623\u0648\u0642\u0641 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0647\u0630\u0627 \u0627\u0644\u062d\u0633\u0627\u0628 \u0645\u0624\u0642\u062a\u064b\u0627. \u0625\u0630\u0627 \u0643\u0646\u062a \u062a\u0639\u062a\u0642\u062f \u0623\u0646 \u0630\u0644\u0643 \u062e\u0637\u0623\u060c \u0641\u0631\u0627\u0633\u0644 support@bambeh.com \u0648\u0627\u0630\u0643\u0631 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643.",
    checkAgain: "\u062a\u062d\u0642\u0642 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649",
    q_mother_middle_name: "\u0645\u0627 \u0647\u0648 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0633\u0637 \u0644\u0648\u0627\u0644\u062f\u062a\u0643\u061f",
    q_primary_school: "\u0645\u0627 \u0627\u0633\u0645 \u0645\u062f\u0631\u0633\u062a\u0643 \u0627\u0644\u0627\u0628\u062a\u062f\u0627\u0626\u064a\u0629\u061f",
    q_best_friend: "\u0645\u0627 \u0627\u0633\u0645 \u0623\u0639\u0632 \u0623\u0635\u062f\u0642\u0627\u0626\u0643\u061f",
    q_first_car_colour: "\u0645\u0627 \u0644\u0648\u0646 \u0633\u064a\u0627\u0631\u062a\u0643 \u0627\u0644\u0623\u0648\u0644\u0649\u061f",
    q_birth_town: "\u0641\u064a \u0623\u064a \u0645\u062f\u064a\u0646\u0629 \u0648\u064f\u0644\u062f\u062a\u061f",
    carSkip: "\u0644\u0645 \u062a\u0645\u062a\u0644\u0643 \u0633\u064a\u0627\u0631\u0629 \u0642\u0637\u061f \u062a\u062e\u0637\u064e\u0651 \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644.",
    secTitle: "\u0627\u062d\u0645\u0650 \u062d\u0633\u0627\u0628\u0643",
    secSub: "\u0623\u062c\u0628 \u0639\u0646 3 \u0645\u0646 \u0647\u0630\u0647 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644. \u0625\u0630\u0627 \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064a\u0648\u0645\u064b\u0627\u060c \u0633\u064a\u0637\u0631\u062d \u0639\u0644\u064a\u0643 \u0628\u0627\u0645\u0628\u064a\u0647 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0646\u0641\u0633\u0647\u0627 \u0644\u0644\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646 \u0627\u0644\u062d\u0633\u0627\u0628 \u0644\u0643.",
    secTip: "\u0644\u0627 \u062a\u0647\u0645 \u0627\u0644\u0623\u062d\u0631\u0641 \u0627\u0644\u0643\u0628\u064a\u0631\u0629 \u0648\u0644\u0627 \u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u0634\u0643\u064a\u0644 \u0648\u0644\u0627 \u0627\u0644\u0645\u0633\u0627\u0641\u0627\u062a \u0648\u0644\u0627 \u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u0631\u0642\u064a\u0645\u060c \u0644\u0643\u0646 \u0627\u0644\u0643\u0644\u0645\u0627\u062a \u062a\u0647\u0645. \u0644\u0627 \u064a\u0633\u062a\u0637\u064a\u0639 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0631\u0624\u064a\u0629 \u0625\u062c\u0627\u0628\u0627\u062a\u0643 \u0623\u0628\u062f\u064b\u0627.",
    secCount: "\u062a\u0645\u062a \u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0639\u0646 {n} \u0645\u0646 3",
    secSave: "\u062d\u0641\u0638 \u0625\u062c\u0627\u0628\u0627\u062a\u064a",
    later: "\u0644\u0627\u062d\u0642\u064b\u0627",
    secDone: "\u062d\u0633\u0627\u0628\u0643 \u0645\u062d\u0645\u064a \u0627\u0644\u0622\u0646.",
    errNeedThree: "\u0623\u062c\u0628 \u0639\u0646 3 \u0623\u0633\u0626\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
    errAnswerShort: "\u064a\u062c\u0628 \u0623\u0646 \u062a\u062d\u062a\u0648\u064a \u0643\u0644 \u0625\u062c\u0627\u0628\u0629 \u0639\u0644\u0649 \u062d\u0631\u0641\u064a\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
    errAnswerLong: "\u0625\u062d\u062f\u0649 \u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a \u0637\u0648\u064a\u0644\u0629 \u062c\u062f\u064b\u0627. \u0627\u062c\u0639\u0644 \u0643\u0644 \u0625\u062c\u0627\u0628\u0629 \u0623\u0642\u0644 \u0645\u0646 120 \u062d\u0631\u0641\u064b\u0627.",
  },
  ff: {
    title: "Su\u0253o finnde keso",
    sub: "Gollo\u0253e Bambeh kes\u0257itinii konte maa. Ngam hisnde maa, su\u0253o finnde keso hade maa jokkude.",
    newPass: "Finnde keso",
    newPassPh: "Ko fam\u0257i fof alkule 8",
    confirmPass: "Tee\u014btinu finnde",
    confirmPassPh: "Winndu \u0257um kadi",
    show: "Hollu",
    hide: "Suu\u0257u",
    ruleLength: "Ko fam\u0257i fof alkule 8",
    ruleMatch: "Finndeeji \u0257i\u0257i \u0257in nanndi",
    ruleNoMatch: "Finndeeji \u0257i\u0257i \u0257in nanndaani tawo",
    save: "Danndu finnde am keso",
    saving: "Eno dannda...",
    doneTitle: "Finnde waylaama",
    doneSub: "Finnde maa keso danndaama. A waawii jokkude.",
    errSame: "Su\u0253o finnde nde wonaa nde Bambeh hokki ma.",
    errNetwork: "Min mbaawaani he\u0253de Bambeh. \u01b3eewu jokkondiral maa nda\u0257\u0257a kadi.",
    errGeneric: "Finnde waylaaki:",
    signOut: "Yaltu",
    pausedTitle: "Konte maa darnaama",
    pausedSub: "Gollo\u0253e Bambeh darnii ndee konte. Si a sikkii ko juumre, windan support@bambeh.com, hollu limoore tilifon maa.",
    checkAgain: "\u01b3eewu kadi",
    q_mother_middle_name: "Hol innde cakkiinde yumma maa?",
    q_primary_school: "Hol innde lekkol maa aranol?",
    q_best_friend: "Hol innde soobaajo maa bur\u0257o?",
    q_first_car_colour: "Hol noone oto maa aranoowo?",
    q_birth_town: "Hol wuro ndo njibinaa?",
    carSkip: "A jogaaki oto abada? Acc ndee.",
    secTitle: "Reen konte maa",
    secSub: "Jaabo naamne 3 e \u0257ee\u0257oo, ko fam\u0257i fof. Si a yejjitii finnde maa, Bambeh naamnete naamne \u0257ee ngam anndude konte ndee ko maa.",
    secTip: "Alkule maw\u0257e, maandeeji e \u0253ol\u0257e ngalaa nafa, kono konngi \u0257in ina nafa. Gollo\u0253e Bambeh mbaawataa yiyde jaabawuuji maa abada.",
    secCount: "{n} e 3 jaabaama",
    secSave: "Danndu jaabawuuji am",
    later: "Caggal",
    secDone: "Konte maa reenaama.",
    errNeedThree: "Jaabo naamne 3, ko fam\u0257i fof.",
    errAnswerShort: "Kala jaabawol ina foti heewde alkule 2.",
    errAnswerLong: "Jaabawol gooto ina juuti no feewi. Wa\u0257 kala gooto les alkule 120.",
  },
};

const RECHECK_MS = 5 * 60 * 1000;
const PENDING_KEY = "bambeh:fix613:changed_at";

function pickLang(raw: unknown): LangKey {
  const v = String(raw || "").toLowerCase();
  if (v === "fr" || v.indexOf("fr-") === 0) return "fr";
  if (v === "pidgin" || v === "pcm") return "pidgin";
  if (v === "ar" || v.indexOf("ar-") === 0) return "ar";
  if (v === "ff" || v === "ful" || v === "fulfulde") return "ff";
  return "en";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isNetworkError(e: unknown): boolean {
  const anyE = e as { message?: string; name?: string } | null;
  const m = String((anyE && (anyE.message || anyE.name)) || e || "").toLowerCase();
  return (
    m.indexOf("failed to fetch") >= 0 ||
    m.indexOf("network") >= 0 ||
    m.indexOf("load failed") >= 0 ||
    m.indexOf("timeout") >= 0 ||
    m.indexOf("fetcherror") >= 0
  );
}

function snoozedRecently(uid: string): boolean {
  try {
    const v = Number(window.localStorage.getItem(SNOOZE_PREFIX + uid) || 0);
    return v > 0 && Date.now() - v < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function snooze(uid: string): void {
  try {
    window.localStorage.setItem(SNOOZE_PREFIX + uid, String(Date.now()));
  } catch {
    /* private mode: it will simply ask again next time */
  }
}

function readPending(): number {
  try {
    const v = window.sessionStorage.getItem(PENDING_KEY);
    return v ? Number(v) || 0 : 0;
  } catch {
    return 0;
  }
}

function writePending(on: boolean): void {
  try {
    if (on) window.sessionStorage.setItem(PENDING_KEY, String(Date.now()));
    else window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* private mode: nothing to remember */
  }
}

class GateBoundary extends React.Component<{ children: React.ReactNode }, { broken: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { broken: false };
  }
  static getDerivedStateFromError(): { broken: boolean } {
    return { broken: true };
  }
  componentDidCatch(err: unknown): void {
    console.error("[FIX613] ForcePasswordGate hid itself after an error:", err);
  }
  render(): React.ReactNode {
    return this.state.broken ? null : this.props.children;
  }
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2147483000,
  background: "rgba(15, 23, 42, 0.72)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  color: "#0f172a",
  width: "100%",
  maxWidth: 420,
  maxHeight: "92vh",
  overflowY: "auto",
  borderRadius: 16,
  padding: 22,
  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, margin: "14px 0 6px" };

const inputWrap: React.CSSProperties = { display: "flex", alignItems: "stretch", gap: 8 };

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "1.5px solid #cbd5e1",
  borderRadius: 10,
  padding: "12px 12px",
  fontSize: 16,
  color: "#0f172a",
  background: "#ffffff",
};

const smallBtn: React.CSSProperties = {
  border: "1.5px solid #cbd5e1",
  borderRadius: 10,
  background: "#f8fafc",
  color: "#0f172a",
  padding: "0 12px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

function primaryBtn(enabled: boolean): React.CSSProperties {
  return {
    width: "100%",
    marginTop: 18,
    border: "none",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 16,
    fontWeight: 700,
    color: "#ffffff",
    background: enabled ? "#0f766e" : "#94a3b8",
    cursor: enabled ? "pointer" : "not-allowed",
  };
}

const linkBtn: React.CSSProperties = {
  marginTop: 12,
  width: "100%",
  background: "transparent",
  border: "none",
  color: "#475569",
  fontSize: 14,
  textDecoration: "underline",
  cursor: "pointer",
};

function GateInner() {
  const rawLang: unknown = useLang();
  const lang = pickLang(
    typeof rawLang === "string" ? rawLang : rawLang && (rawLang as { lang?: string }).lang,
  );
  const t = S[lang];
  const rtl = lang === "ar";

  const [phase, setPhase] = useState<Phase>("idle");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [canLater, setCanLater] = useState(true);
  const uidRef = useRef("");
  const lastCheck = useRef(0);
  const inFlight = useRef(false);
  const submitting = useRef(false);
  const mounted = useRef(true);

  const check = useCallback(async (force: boolean) => {
    if (inFlight.current || submitting.current) return;
    const now = Date.now();
    if (!force && now - lastCheck.current < 3000) return;
    inFlight.current = true;
    lastCheck.current = now;
    try {
      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult && sessionResult.data ? sessionResult.data.session : null;
      if (!session) {
        if (mounted.current) setPhase((p) => (p === "done" ? p : "idle"));
        return;
      }
      const { data, error } = await supabase.rpc("bambeh_my_account_flags");
      if (error || !data || typeof data !== "object") return; // fail open
      let flags = data as {
        must_change_password?: boolean;
        is_active?: boolean;
        account_frozen?: boolean;
        security_answers?: number;
        account_created_at?: string | null;
      };
      uidRef.current = session.user ? session.user.id : "";

      // The password was changed but the "done" call never arrived (network): retry it quietly.
      if (flags.must_change_password === true && readPending() > 0 && Date.now() - readPending() < 30 * 60 * 1000) {
        const retry = await supabase.rpc("bambeh_password_change_done");
        const r = retry && !retry.error ? (retry.data as { ok?: boolean } | null) : null;
        if (r && r.ok === true) {
          writePending(false);
          flags = { ...flags, must_change_password: false };
        }
      }

      if (!mounted.current || submitting.current) return;
      if (flags.is_active === false || flags.account_frozen === true) setPhase("paused");
      else if (flags.must_change_password === true) setPhase("must_change");
      else if (typeof flags.security_answers === "number" && flags.security_answers < 3) {
        const created = flags.account_created_at ? new Date(flags.account_created_at).getTime() : 0;
        const isNew = created > 0 && Date.now() - created < NEW_ACCOUNT_MS;
        setCanLater(!isNew);
        if (!isNew && snoozedRecently(uidRef.current)) setPhase((p) => (p === "done" || p === "secdone" ? p : "idle"));
        else setPhase((p) => (p === "done" ? p : "security"));
      } else setPhase((p) => (p === "done" || p === "secdone" ? p : "idle"));
    } catch {
      /* fail open */
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void check(true);
    const sub = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_OUT") {
        setPhase("idle");
        setPw("");
        setPw2("");
        setErr(null);
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        void check(false);
      }
    });
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastCheck.current > RECHECK_MS) {
        void check(true);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      mounted.current = false;
      try {
        sub.data.subscription.unsubscribe();
      } catch {
        /* already gone */
      }
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check]);

  // Keep the page behind the card from scrolling while it is up.
  useEffect(() => {
    if (phase !== "must_change" && phase !== "paused" && phase !== "security") return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  const longEnough = pw.length >= 8;
  const matches = pw.length > 0 && pw === pw2;
  const canSubmit = longEnough && matches && !busy;

  async function submit(): Promise<void> {
    if (!canSubmit) return;
    setBusy(true);
    setErr(null);
    submitting.current = true;
    try {
      let res: { error: { message?: string; code?: string } | null } | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          res = (await supabase.auth.updateUser({ password: pw })) as unknown as {
            error: { message?: string; code?: string } | null;
          };
          if (res && res.error && attempt === 0 && isNetworkError(res.error)) {
            await sleep(800);
            continue;
          }
          break;
        } catch (e) {
          if (attempt === 0 && isNetworkError(e)) {
            await sleep(800);
            continue;
          }
          throw e;
        }
      }
      if (res && res.error) {
        const msg = String(res.error.message || "");
        const code = String(res.error.code || "");
        if (code === "same_password" || /different from the old/i.test(msg)) setErr(t.errSame);
        else if (isNetworkError(res.error)) setErr(t.errNetwork);
        else setErr(t.errGeneric + " " + msg);
        return;
      }

      // The password IS changed now. Remember that, then clear the flag.
      writePending(true);
      let done: { ok?: boolean; reason?: string } | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const r = await supabase.rpc("bambeh_password_change_done");
        if (!r.error) {
          done = r.data as { ok?: boolean; reason?: string } | null;
          break;
        }
        if (!isNetworkError(r.error) || attempt === 2) break;
        await sleep(800 * (attempt + 1));
      }
      if (done && done.ok === false && done.reason === "password_not_changed") {
        writePending(false);
        setErr(t.errSame);
        return;
      }
      if (done && done.ok === true) writePending(false);
      setPw("");
      setPw2("");
      setPhase("done");
      window.setTimeout(() => {
        if (mounted.current) setPhase((p) => (p === "done" ? "idle" : p));
      }, 2500);
    } catch (e) {
      setErr(isNetworkError(e) ? t.errNetwork : t.errGeneric + " " + String((e as { message?: string })?.message || e));
    } finally {
      setBusy(false);
      submitting.current = false;
      lastCheck.current = Date.now();
    }
  }

  const answeredCount = QUESTION_KEYS.filter((k) => (answers[k] || "").trim().length >= 2).length;

  async function saveAnswers(): Promise<void> {
    if (busy) return;
    if (answeredCount < 3) {
      setErr(t.errNeedThree);
      return;
    }
    setBusy(true);
    setErr(null);
    submitting.current = true;
    try {
      const payload: Record<string, string> = {};
      for (const k of QUESTION_KEYS) {
        const v = (answers[k] || "").trim();
        if (v) payload[k] = v;
      }
      let res: { data: unknown; error: { message?: string } | null } | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        res = (await supabase.rpc("bambeh_set_security_answers", { p_answers: payload })) as unknown as {
          data: unknown;
          error: { message?: string } | null;
        };
        if (res && res.error && attempt === 0 && isNetworkError(res.error)) {
          await sleep(800);
          continue;
        }
        break;
      }
      if (!res || res.error) {
        setErr(res && res.error && !isNetworkError(res.error) ? t.errGeneric + " " + String(res.error.message || "") : t.errNetwork);
        return;
      }
      const d = (res.data || {}) as { ok?: boolean; reason?: string };
      if (d.ok !== true) {
        setErr(d.reason === "too_short" ? t.errAnswerShort : d.reason === "too_long" ? t.errAnswerLong : t.errNeedThree);
        return;
      }
      setAnswers({});
      setPhase("secdone");
      window.setTimeout(() => {
        if (mounted.current) setPhase((p) => (p === "secdone" ? "idle" : p));
      }, 2200);
    } catch (e) {
      setErr(isNetworkError(e) ? t.errNetwork : t.errGeneric + " " + String((e as { message?: string })?.message || e));
    } finally {
      setBusy(false);
      submitting.current = false;
      lastCheck.current = Date.now();
    }
  }

  async function signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      /* the local session is cleared either way */
    }
    setPhase("idle");
  }

  if (phase === "idle") return null;

  const tick = (ok: boolean) => (
    <span style={{ color: ok ? "#15803d" : "#94a3b8", fontWeight: 700, marginInlineEnd: 6 }}>
      {ok ? "\u2713" : "\u2022"}
    </span>
  );

  return (
    <div data-fix="FIX613" translate="no" className="notranslate" role="dialog" aria-modal="true" style={overlayStyle}>
      <div dir={rtl ? "rtl" : "ltr"} lang={lang === "pidgin" ? "pcm" : lang} style={cardStyle}>
        {phase === "secdone" ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 44, color: "#15803d", lineHeight: 1 }}>{"\u2713"}</div>
            <h2 style={{ fontSize: 21, margin: "12px 0 0" }}>{t.secDone}</h2>
          </div>
        ) : phase === "security" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void saveAnswers();
            }}
          >
            <h2 style={{ fontSize: 21, margin: "0 0 8px" }}>{t.secTitle}</h2>
            <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.5, margin: 0 }}>{t.secSub}</p>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, margin: "8px 0 0" }}>{t.secTip}</p>
            {QUESTION_KEYS.map((k) => {
              const labels: Record<string, string> = { mother_middle_name: t.q_mother_middle_name, primary_school: t.q_primary_school, best_friend: t.q_best_friend, first_car_colour: t.q_first_car_colour, birth_town: t.q_birth_town };
              return (
                <div key={k}>
                  <label style={labelStyle} htmlFor={"fix613-q-" + k}>
                    {labels[k]}
                  </label>
                  <input
                    id={"fix613-q-" + k}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                    autoComplete="off"
                    maxLength={120}
                    value={answers[k] || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAnswers((prev) => ({ ...prev, [k]: v }));
                      setErr(null);
                    }}
                  />
                  {k === "first_car_colour" ? (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{t.carSkip}</div>
                  ) : null}
                </div>
              );
            })}
            <div style={{ marginTop: 12, fontSize: 14 }}>
              {tick(answeredCount >= 3)}
              {t.secCount.split("{n}").join(String(Math.min(answeredCount, 5)))}
            </div>
            {err ? (
              <div role="alert" style={{ marginTop: 12, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}>
                {err}
              </div>
            ) : null}
            <button type="submit" style={primaryBtn(answeredCount >= 3 && !busy)} disabled={answeredCount < 3 || busy}>
              {busy ? t.saving : t.secSave}
            </button>
            {canLater ? (
              <button
                type="button"
                style={linkBtn}
                onClick={() => {
                  snooze(uidRef.current);
                  setErr(null);
                  setPhase("idle");
                }}
              >
                {t.later}
              </button>
            ) : null}
          </form>
        ) : phase === "done" ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 44, color: "#15803d", lineHeight: 1 }}>{"\u2713"}</div>
            <h2 style={{ fontSize: 21, margin: "12px 0 6px" }}>{t.doneTitle}</h2>
            <p style={{ fontSize: 15, color: "#475569", margin: 0 }}>{t.doneSub}</p>
          </div>
        ) : phase === "paused" ? (
          <div>
            <h2 style={{ fontSize: 21, margin: "0 0 10px" }}>{t.pausedTitle}</h2>
            <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.5, margin: 0 }}>{t.pausedSub}</p>
            <button type="button" style={primaryBtn(true)} onClick={() => void check(true)}>
              {t.checkAgain}
            </button>
            <button type="button" style={linkBtn} onClick={() => void signOut()}>
              {t.signOut}
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <h2 style={{ fontSize: 21, margin: "0 0 8px" }}>{t.title}</h2>
            <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.5, margin: 0 }}>{t.sub}</p>

            <label style={labelStyle} htmlFor="fix613-pw1">
              {t.newPass}
            </label>
            <div style={inputWrap}>
              <input
                id="fix613-pw1"
                style={inputStyle}
                type={show1 ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t.newPassPh}
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setErr(null);
                }}
              />
              <button type="button" style={smallBtn} onClick={() => setShow1((v) => !v)}>
                {show1 ? t.hide : t.show}
              </button>
            </div>

            <label style={labelStyle} htmlFor="fix613-pw2">
              {t.confirmPass}
            </label>
            <div style={inputWrap}>
              <input
                id="fix613-pw2"
                style={inputStyle}
                type={show2 ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t.confirmPassPh}
                value={pw2}
                onChange={(e) => {
                  setPw2(e.target.value);
                  setErr(null);
                }}
              />
              <button type="button" style={smallBtn} onClick={() => setShow2((v) => !v)}>
                {show2 ? t.hide : t.show}
              </button>
            </div>

            <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7 }}>
              <div>
                {tick(longEnough)}
                {t.ruleLength}
              </div>
              <div>
                {tick(matches)}
                {matches ? t.ruleMatch : t.ruleNoMatch}
              </div>
            </div>

            {err ? (
              <div
                role="alert"
                style={{
                  marginTop: 12,
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 14,
                }}
              >
                {err}
              </div>
            ) : null}

            <button type="submit" style={primaryBtn(canSubmit)} disabled={!canSubmit}>
              {busy ? t.saving : t.save}
            </button>
            <button type="button" style={linkBtn} onClick={() => void signOut()}>
              {t.signOut}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AccountGate() {
  return (
    <GateBoundary>
      <GateInner />
    </GateBoundary>
  );
}

export { AccountGate };
// BAMBEH_END_TOKEN__ACCOUNT_GATE__COMPLETE
