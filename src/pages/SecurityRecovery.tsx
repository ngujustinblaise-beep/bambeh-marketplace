// BAMBEH_DEPLOY_TOKEN__SECURITYRECOVERY_FIX383_CLEAN
/**
 * src/pages/SecurityRecovery.tsx - FIX383 (supersedes FIX382)
 *
 * WHAT FIX383 ADDS ON TOP OF FIX382
 *
 * 1. THE CRASH IS FIXED. translate="no" + class "notranslate" on the root.
 *    Chrome's Google Translate was rewriting the text nodes on this page while
 *    React was still holding references to them. The moment React tried to swap
 *    the form for the success message it could not find the node it expected,
 *    threw, and the error boundary caught it - which is why the password screen
 *    died right after "Update". Proof it was Translate: the crash screen's own
 *    reload button read "Recharge", a mistranslation of the French "Recharger".
 *    We lose nothing by turning it off here: this page already speaks five
 *    languages of its own.
 *
 * 2. SHOW / HIDE PASSWORD on both fields, with an eye button.
 *
 * 3. LIVE MATCH TICK. A green check the moment the two passwords agree, a
 *    plain red line while they do not, and a length check that updates as you
 *    type. The Update button stays disabled until both are satisfied, so it is
 *    impossible to submit a mismatch.
 *
 * 4. A REAL SUCCESS SCREEN instead of swapping a message into the live form.
 *    Fewer moving parts at the exact moment things used to break.
 *
 * 5. HONEST GUIDANCE ON THE CODE SCREEN. In Supabase the emailed link and the
 *    6-digit code are the SAME single-use token: clicking the link spends the
 *    code, and asking for a new email kills the old one. Users could not
 *    possibly know that, so the page now says it.
 *
 * THE THREE WAYS IN, unchanged from FIX382:
 *   1. ?code=...          -> exchangeCodeForSession()   (same browser)
 *   2. #access_token=...  -> setSession()               (older links)
 *   3. 6-digit code typed -> verifyOtp()                (any browser)
 *   All three end at updateUser({ password }), which writes the new password
 *   into Supabase auth.
 *
 * Pure ASCII. Every accent is a \uXXXX escape, so this file cannot rot.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck, Mail, KeyRound, ArrowLeft, Loader2, CheckCircle2,
  AlertCircle, Hash, RefreshCw, Eye, EyeOff, Check, X, Info,
} from "lucide-react";

const STASH = "bambeh_recovery_tokens";

type Mode = "checking" | "request" | "otp" | "reset" | "done";
type Msg = { type: "ok" | "err"; text: string } | null;

/* ---------------- language (display only, never security) --------------- */

type LangCode = "en" | "fr" | "pcm" | "ar" | "ff";

function currentLang(): LangCode {
  let raw = "";
  try {
    raw = String(localStorage.getItem("Bambeh_language") || "").toLowerCase();
  } catch {
    raw = "";
  }
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("ar")) return "ar";
  if (raw.startsWith("ff") || raw.startsWith("ful")) return "ff";
  if (raw.startsWith("pcm") || raw.startsWith("pid")) return "pcm";
  return "en";
}

interface Copy {
  back: string; checking: string;
  titleRequest: string; subRequest: string;
  titleOtp: string; subOtp: string;
  titleReset: string; subReset: string;
  titleDone: string; subDone: string; goSignIn: string;
  emailLabel: string; emailPh: string;
  sendBtn: string; sending: string;
  codeLabel: string; codePh: string;
  verifyBtn: string; verifying: string;
  newPass: string; newPassPh: string;
  confirmPass: string; confirmPassPh: string;
  updateBtn: string; updating: string;
  showPass: string; hidePass: string;
  ruleLength: string; ruleMatch: string; ruleNoMatch: string;
  haveCode: string; noCodeYet: string;
  sentOk: string; tipOneUse: string;
  errNoEmail: string; errNoCode: string;
  errShort: string; errMatch: string;
  errNetwork: string; errBrowser: string; errExpired: string; errCode: string;
}

const T: Record<LangCode, Copy> = {
  en: {
    back: "Back to sign in", checking: "Checking your recovery link...",
    titleRequest: "Account Recovery",
    subRequest: "Enter your email. We'll send you a secure link and a 6-digit code.",
    titleOtp: "Enter your code",
    subOtp: "Type the 6-digit code from the email we just sent. It works in any browser.",
    titleReset: "Set a New Password",
    subReset: "Choose a strong new password for your Bambeh account.",
    titleDone: "Password changed",
    subDone: "Your new password is saved. Sign in with it now.",
    goSignIn: "Go to sign in",
    emailLabel: "Email address", emailPh: "you@example.com",
    sendBtn: "Send recovery link", sending: "Sending...",
    codeLabel: "6-digit code", codePh: "123456",
    verifyBtn: "Verify code", verifying: "Verifying...",
    newPass: "New password", newPassPh: "At least 8 characters",
    confirmPass: "Confirm new password", confirmPassPh: "Re-enter your password",
    updateBtn: "Update password", updating: "Updating...",
    showPass: "Show password", hidePass: "Hide password",
    ruleLength: "At least 8 characters",
    ruleMatch: "Both passwords match",
    ruleNoMatch: "The two passwords do not match yet",
    haveCode: "I already have a code",
    noCodeYet: "Send me a new code",
    sentOk: "If an account exists for that email, a link and a code are on their way. Check your inbox and your spam folder.",
    tipOneUse: "Use the code from the NEWEST email, and do not click the link first - the link and the code are the same single-use token, so clicking the link uses up the code.",
    errNoEmail: "Please enter your email address.",
    errNoCode: "Please enter the 6-digit code from the email.",
    errShort: "Password must be at least 8 characters.",
    errMatch: "The two passwords do not match.",
    errNetwork: "Could not reach Bambeh. Check your connection and try again.",
    errBrowser: "This link was opened in a different browser from the one that requested it, so it cannot work. Enter the 6-digit code from the same email instead - that works anywhere.",
    errExpired: "This recovery link has expired or has already been used. Request a new one below.",
    errCode: "That code is not right, has expired, or has already been used. Ask for a new email and use the code from it without clicking the link.",
  },
  fr: {
    back: "Retour a la connexion", checking: "Verification de votre lien...",
    titleRequest: "Recuperation de compte",
    subRequest: "Entrez votre email. Nous vous enverrons un lien securise et un code a 6 chiffres.",
    titleOtp: "Entrez votre code",
    subOtp: "Saisissez le code a 6 chiffres recu par email. Il fonctionne dans n'importe quel navigateur.",
    titleReset: "Nouveau mot de passe",
    subReset: "Choisissez un mot de passe solide pour votre compte Bambeh.",
    titleDone: "Mot de passe modifie",
    subDone: "Votre nouveau mot de passe est enregistre. Connectez-vous avec.",
    goSignIn: "Aller a la connexion",
    emailLabel: "Adresse email", emailPh: "vous@exemple.com",
    sendBtn: "Envoyer le lien", sending: "Envoi...",
    codeLabel: "Code a 6 chiffres", codePh: "123456",
    verifyBtn: "Verifier le code", verifying: "Verification...",
    newPass: "Nouveau mot de passe", newPassPh: "Au moins 8 caracteres",
    confirmPass: "Confirmez le mot de passe", confirmPassPh: "Saisissez-le a nouveau",
    updateBtn: "Mettre a jour", updating: "Mise a jour...",
    showPass: "Afficher le mot de passe", hidePass: "Masquer le mot de passe",
    ruleLength: "Au moins 8 caracteres",
    ruleMatch: "Les deux mots de passe correspondent",
    ruleNoMatch: "Les deux mots de passe ne correspondent pas encore",
    haveCode: "J'ai deja un code",
    noCodeYet: "Envoyez-moi un nouveau code",
    sentOk: "Si un compte existe pour cet email, un lien et un code sont en route. Verifiez votre boite de reception et vos spams.",
    tipOneUse: "Utilisez le code du DERNIER email recu, et ne cliquez pas d'abord sur le lien - le lien et le code sont le meme jeton a usage unique, donc cliquer sur le lien consomme le code.",
    errNoEmail: "Veuillez saisir votre adresse email.",
    errNoCode: "Veuillez saisir le code a 6 chiffres.",
    errShort: "Le mot de passe doit contenir au moins 8 caracteres.",
    errMatch: "Les deux mots de passe ne correspondent pas.",
    errNetwork: "Impossible de joindre Bambeh. Verifiez votre connexion et reessayez.",
    errBrowser: "Ce lien a ete ouvert dans un navigateur different de celui qui l'a demande, il ne peut donc pas fonctionner. Saisissez plutot le code a 6 chiffres du meme email.",
    errExpired: "Ce lien a expire ou a deja ete utilise. Demandez-en un nouveau ci-dessous.",
    errCode: "Ce code est incorrect, expire, ou deja utilise. Demandez un nouvel email et utilisez son code sans cliquer sur le lien.",
  },
  pcm: {
    back: "Go back to sign in", checking: "We dey check your link...",
    titleRequest: "Get Your Account Back",
    subRequest: "Put your email. We go send you link and 6-number code.",
    titleOtp: "Put your code",
    subOtp: "Type the 6-number code wey dey inside the email. E dey work for any browser.",
    titleReset: "Put New Password",
    subReset: "Choose strong new password for your Bambeh account.",
    titleDone: "Password don change",
    subDone: "Your new password don save. Sign in with am now.",
    goSignIn: "Go sign in",
    emailLabel: "Email address", emailPh: "you@example.com",
    sendBtn: "Send the link", sending: "E dey send...",
    codeLabel: "6-number code", codePh: "123456",
    verifyBtn: "Check the code", verifying: "E dey check...",
    newPass: "New password", newPassPh: "8 letters or more",
    confirmPass: "Put the password again", confirmPassPh: "Type am one more time",
    updateBtn: "Change password", updating: "E dey change...",
    showPass: "Show the password", hidePass: "Hide the password",
    ruleLength: "8 letters or more",
    ruleMatch: "The two password na the same",
    ruleNoMatch: "The two password never be the same",
    haveCode: "I get code already",
    noCodeYet: "Send me new code",
    sentOk: "If account dey for that email, link and code don dey come. Check your inbox and your spam.",
    tipOneUse: "Use the code from the LAST email wey come, and no click the link first - the link and the code na the same one-time token, so if you click the link the code don finish.",
    errNoEmail: "Abeg put your email address.",
    errNoCode: "Abeg put the 6-number code.",
    errShort: "Password must reach 8 letters.",
    errMatch: "The two password no be the same.",
    errNetwork: "We no fit reach Bambeh. Check your network and try again.",
    errBrowser: "You open this link for different browser from the one wey ask for am, so e no fit work. Better put the 6-number code from the same email - that one dey work anywhere.",
    errExpired: "This link don expire or dem don use am. Ask for new one for down.",
    errCode: "That code no correct, e don expire, or dem don use am. Ask for new email and use im code without clicking the link.",
  },
  ar: {
    back: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644", checking: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0627\u0628\u0637...",
    titleRequest: "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u062D\u0633\u0627\u0628",
    subRequest: "\u0623\u062F\u062E\u0644 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A. \u0633\u0646\u0631\u0633\u0644 \u0644\u0643 \u0631\u0627\u0628\u0637\u0627\u064B \u0622\u0645\u0646\u0627\u064B \u0648\u0631\u0645\u0632\u0627\u064B \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645.",
    titleOtp: "\u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0645\u0632",
    subOtp: "\u0627\u0643\u062A\u0628 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0628\u0631\u064A\u062F. \u064A\u0639\u0645\u0644 \u0641\u064A \u0623\u064A \u0645\u062A\u0635\u0641\u062D.",
    titleReset: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u062F\u064A\u062F\u0629",
    subReset: "\u0627\u062E\u062A\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0642\u0648\u064A\u0629 \u0644\u062D\u0633\u0627\u0628\u0643 \u0641\u064A \u0628\u0627\u0645\u0628\u064A\u0647.",
    titleDone: "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    subDone: "\u062A\u0645 \u062D\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629. \u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0647\u0627 \u0627\u0644\u0622\u0646.",
    goSignIn: "\u0627\u0644\u0630\u0647\u0627\u0628 \u0625\u0644\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644",
    emailLabel: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", emailPh: "you@example.com",
    sendBtn: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0627\u0628\u0637", sending: "\u062C\u0627\u0631\u064D \u0627\u0644\u0625\u0631\u0633\u0627\u0644...",
    codeLabel: "\u0631\u0645\u0632 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645", codePh: "123456",
    verifyBtn: "\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0645\u0632", verifying: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0642\u0642...",
    newPass: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629", newPassPh: "8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    confirmPass: "\u062A\u0623\u0643\u064A\u062F \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", confirmPassPh: "\u0623\u0639\u062F \u0625\u062F\u062E\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    updateBtn: "\u062A\u062D\u062F\u064A\u062B \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", updating: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u062F\u064A\u062B...",
    showPass: "\u0625\u0638\u0647\u0627\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", hidePass: "\u0625\u062E\u0641\u0627\u0621 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    ruleLength: "8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    ruleMatch: "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u0627\u0646",
    ruleNoMatch: "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u064A\u0646 \u0628\u0639\u062F",
    haveCode: "\u0644\u062F\u064A \u0631\u0645\u0632 \u0628\u0627\u0644\u0641\u0639\u0644",
    noCodeYet: "\u0623\u0631\u0633\u0644 \u0644\u064A \u0631\u0645\u0632\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B",
    sentOk: "\u0625\u0630\u0627 \u0643\u0627\u0646 \u0647\u0646\u0627\u0643 \u062D\u0633\u0627\u0628 \u0628\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F\u060C \u0641\u0642\u062F \u0623\u064F\u0631\u0633\u0644 \u0631\u0627\u0628\u0637 \u0648\u0631\u0645\u0632. \u062A\u062D\u0642\u0642 \u0645\u0646 \u0628\u0631\u064A\u062F\u0643 \u0648\u0645\u0646 \u0645\u062C\u0644\u062F \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u063A\u064A\u0631 \u0627\u0644\u0645\u0631\u063A\u0648\u0628\u0629.",
    tipOneUse: "\u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0631\u0645\u0632 \u0645\u0646 \u0623\u062D\u062F\u062B \u0631\u0633\u0627\u0644\u0629\u060C \u0648\u0644\u0627 \u062A\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0631\u0627\u0628\u0637 \u0623\u0648\u0644\u0627\u064B - \u0641\u0627\u0644\u0631\u0627\u0628\u0637 \u0648\u0627\u0644\u0631\u0645\u0632 \u0631\u0645\u0632 \u0648\u0627\u062D\u062F \u064A\u064F\u0633\u062A\u062E\u062F\u0645 \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629\u060C \u0648\u0627\u0644\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0631\u0627\u0628\u0637 \u064A\u0633\u062A\u0647\u0644\u0643 \u0627\u0644\u0631\u0645\u0632.",
    errNoEmail: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A.",
    errNoCode: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645.",
    errShort: "\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
    errMatch: "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u064A\u0646.",
    errNetwork: "\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064A\u0647. \u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u062A\u0635\u0627\u0644\u0643 \u0648\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.",
    errBrowser: "\u0641\u064F\u062A\u062D \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064A \u0645\u062A\u0635\u0641\u062D \u0645\u062E\u062A\u0644\u0641 \u0639\u0646 \u0627\u0644\u0645\u062A\u0635\u0641\u062D \u0627\u0644\u0630\u064A \u0637\u0644\u0628\u0647\u060C \u0644\u0630\u0627 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u064A\u0639\u0645\u0644. \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645 \u0645\u0646 \u0627\u0644\u0628\u0631\u064A\u062F \u0646\u0641\u0633\u0647.",
    errExpired: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0623\u0648 \u0627\u0633\u062A\u064F\u062E\u062F\u0645 \u0645\u0646 \u0642\u0628\u0644. \u0627\u0637\u0644\u0628 \u0631\u0627\u0628\u0637\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B \u0623\u062F\u0646\u0627\u0647.",
    errCode: "\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0623\u0648 \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0646 \u0642\u0628\u0644. \u0627\u0637\u0644\u0628 \u0631\u0633\u0627\u0644\u0629 \u062C\u062F\u064A\u062F\u0629 \u0648\u0627\u0633\u062A\u062E\u062F\u0645 \u0631\u0645\u0632\u0647\u0627 \u062F\u0648\u0646 \u0627\u0644\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0631\u0627\u0628\u0637.",
  },
  ff: {
    back: "Rutto e naatirde", checking: "Eno yiyloo jokkorde maa...",
    titleRequest: "He\u0253tingol konte",
    subRequest: "Naatnu email maa. Min neldete jokkorde hisnde e kod jowi-e-go'o.",
    titleOtp: "Naatnu kod maa",
    subOtp: "Winndu kod jowi-e-go'o mo woni e email on. Ina golloo e kala nokku.",
    titleReset: "Finnde keso",
    subReset: "Su\u0253o finnde tii\u0257nde wonande konte maa Bambeh.",
    titleDone: "Finnde waylaama",
    subDone: "Finnde maa keso danndaama. Naatir jooni.",
    goSignIn: "Yah e naatirde",
    emailLabel: "Email", emailPh: "an@misal.com",
    sendBtn: "Neldu jokkorde", sending: "Eno nelda...",
    codeLabel: "Kod jowi-e-go'o", codePh: "123456",
    verifyBtn: "\u01B3eewndo kod", verifying: "Eno \u01B4eewndoo...",
    newPass: "Finnde keso", newPassPh: "Ko fam\u0257i fof alkule 8",
    confirmPass: "Tee\u014Btinu finnde", confirmPassPh: "Winndu \u0257um kadi",
    updateBtn: "Waylu finnde", updating: "Eno wayla...",
    showPass: "Hollu finnde", hidePass: "Suu\u0257u finnde",
    ruleLength: "Ko fam\u0257i fof alkule 8",
    ruleMatch: "Finndeeji \u0257i\u0257i \u0257in nanndi",
    ruleNoMatch: "Finndeeji \u0257i\u0257i \u0257in nanndaani tawo",
    haveCode: "Mi jogii kod",
    noCodeYet: "Neldam kod keso",
    sentOk: "Si konte woodi e ndee email, jokkorde e kod ina ngara. \u01B3eewu boite maa e spam maa.",
    tipOneUse: "Huutoro kod mo woni e email cakkitii\u0257o on, hoto \u00F1ippu jokkorde nden aranun - jokkorde e kod ko kod gooto tan mo huutortee laawol gootol.",
    errNoEmail: "Tii\u0257no naatnu email maa.",
    errNoCode: "Tii\u0257no naatnu kod jowi-e-go'o.",
    errShort: "Finnde ina foti heewde alkule 8.",
    errMatch: "Finndeeji \u0257i\u0257i \u0257in nanndaani.",
    errNetwork: "Min mbaawaani he\u0253de Bambeh. \u01B3eewu jokkondiral maa nda\u0257\u0257a kadi.",
    errBrowser: "Ndee jokkorde udditaama e nokku go\u0257\u0257o, ko \u0257um wa\u0257i nde waawaa gollaade. Naatnu kod jowi-e-go'o mo woni e email on.",
    errExpired: "Ndee jokkorde timmii walla huutoraama. Naamno go\u0257\u0257o les.",
    errCode: "Kod on selli, walla o timmii, walla o huutoraama. Naamno email keso nda\u0257\u0257aa kod mum hoto \u00F1ippu jokkorde nden.",
  },
};

/* ---------------- helpers ------------------------------------------------ */

/** Runs fn up to three times. The Supabase host drops connections often enough
 *  on this network that a single attempt is not a fair test. */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

function readStash(): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem(STASH);
    if (!raw) return null;
    sessionStorage.removeItem(STASH);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ---------------- component --------------------------------------------- */

export default function SecurityRecovery() {
  const navigate = useNavigate();
  const lang = currentLang();
  const t = T[lang];
  const rtl = lang === "ar";

  const [mode, setMode] = useState<Mode>("checking");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const longEnough = password.length >= 8;
  const matches = password.length > 0 && password === confirm;
  const canSubmit = longEnough && matches && !busy;

  /* -- on arrival: work out which of the three ways in we have ------------ */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stash = readStash();

      if (!stash) {
        if (!cancelled) setMode("request");
        return;
      }

      if (stash.error_code) {
        if (!cancelled) {
          setMode("request");
          setMsg({ type: "err", text: stash.error_description || t.errExpired });
        }
        return;
      }

      if (stash.code) {
        try {
          const { error } = await withRetry(() =>
            supabase.auth.exchangeCodeForSession(stash.code)
          );
          if (cancelled) return;
          if (!error) { setMode("reset"); return; }

          const { data } = await supabase.auth.getSession();
          if (cancelled) return;
          if (data.session) { setMode("reset"); return; }

          const m = String(error.message || "").toLowerCase();
          if (m.indexOf("verifier") !== -1 || m.indexOf("challenge") !== -1) {
            setMode("otp");
            setMsg({ type: "err", text: t.errBrowser });
            return;
          }
          setMode("request");
          setMsg({ type: "err", text: t.errExpired });
          return;
        } catch {
          if (cancelled) return;
          setMode("request");
          setMsg({ type: "err", text: t.errNetwork });
          return;
        }
      }

      if (stash.access_token) {
        try {
          const { error } = await withRetry(() =>
            supabase.auth.setSession({
              access_token: stash.access_token,
              refresh_token: stash.refresh_token || "",
            })
          );
          if (cancelled) return;
          if (error) {
            setMode("request");
            setMsg({ type: "err", text: t.errExpired });
            return;
          }
          setMode("reset");
          return;
        } catch {
          if (cancelled) return;
          setMode("request");
          setMsg({ type: "err", text: t.errNetwork });
          return;
        }
      }

      if (!cancelled) setMode("request");
    })();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -- send the email ----------------------------------------------------- */
  const sendResetLink = async () => {
    if (!email.trim()) { setMsg({ type: "err", text: t.errNoEmail }); return; }
    setBusy(true);
    setMsg(null);
    const redirectTo = window.location.origin + "/#/security-recovery";
    try {
      const { error } = await withRetry(() =>
        supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
      );
      setBusy(false);
      if (error) { setMsg({ type: "err", text: error.message }); return; }
      setMsg({ type: "ok", text: t.sentOk });
      setMode("otp");
    } catch {
      setBusy(false);
      setMsg({ type: "err", text: t.errNetwork });
    }
  };

  /* -- verify the 6-digit code -------------------------------------------- */
  const verifyCode = async () => {
    if (!email.trim()) { setMsg({ type: "err", text: t.errNoEmail }); return; }
    const clean = code.replace(/\D/g, "");
    if (clean.length < 6) { setMsg({ type: "err", text: t.errNoCode }); return; }
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await withRetry(() =>
        supabase.auth.verifyOtp({ email: email.trim(), token: clean, type: "recovery" })
      );
      setBusy(false);
      if (error) { setMsg({ type: "err", text: t.errCode }); return; }
      setMsg(null);
      setMode("reset");
    } catch {
      setBusy(false);
      setMsg({ type: "err", text: t.errNetwork });
    }
  };

  /* -- write the new password --------------------------------------------- */
  const updatePassword = async () => {
    if (!longEnough) { setMsg({ type: "err", text: t.errShort }); return; }
    if (!matches) { setMsg({ type: "err", text: t.errMatch }); return; }
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await withRetry(() =>
        supabase.auth.updateUser({ password })
      );
      setBusy(false);
      if (error) { setMsg({ type: "err", text: error.message }); return; }
      setMsg(null);
      setMode("done");
    } catch {
      setBusy(false);
      setMsg({ type: "err", text: t.errNetwork });
    }
  };

  const goSignIn = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* the network may be down - sign in will still work */
    }
    navigate("/login");
  };

  /* -- presentation -------------------------------------------------------- */

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none " +
    "focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition";

  const btnCls =
    "w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 " +
    "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const eyeCls =
    "absolute right-3 top-3 text-gray-400 hover:text-teal-600 transition-colors";

  const heading =
    mode === "done" ? t.titleDone
      : mode === "reset" ? t.titleReset
      : mode === "otp" ? t.titleOtp
      : t.titleRequest;

  const sub =
    mode === "done" ? t.subDone
      : mode === "reset" ? t.subReset
      : mode === "otp" ? t.subOtp
      : t.subRequest;

  const Rule = ({ ok, text }: { ok: boolean; text: string }) => (
    <p className={"mt-1.5 flex items-center gap-1.5 text-xs " + (ok ? "text-green-600" : "text-gray-400")}>
      {ok ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
      <span>{text}</span>
    </p>
  );

  return (
    <div
      translate="no"
      dir={rtl ? "rtl" : "ltr"}
      className="notranslate min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/login")}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600"
        >
          <ArrowLeft size={16} /> {t.back}
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-7">
          <div className="flex justify-center mb-4">
            <div className={
              "w-14 h-14 rounded-full flex items-center justify-center " +
              (mode === "done" ? "bg-green-600" : "bg-teal-600")
            }>
              {mode === "done"
                ? <CheckCircle2 className="text-white" size={30} />
                : <ShieldCheck className="text-white" size={28} />}
            </div>
          </div>

          {mode === "checking" ? (
            <div className="py-6 text-center">
              <Loader2 className="animate-spin mx-auto text-teal-600" size={28} />
              <p className="mt-3 text-sm text-gray-500">{t.checking}</p>
            </div>
          ) : (
            <>
              <h1 className="text-center text-xl font-bold text-gray-800">{heading}</h1>
              <p className="text-center text-sm text-gray-500 mt-1 mb-6">{sub}</p>

              {msg && (
                <div
                  className={
                    "mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm " +
                    (msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")
                  }
                >
                  {msg.type === "ok"
                    ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                  <span>{msg.text}</span>
                </div>
              )}

              {mode === "request" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPh}
                        className={inputCls + " pl-10"}
                        onKeyDown={(e) => e.key === "Enter" && sendResetLink()}
                      />
                    </div>
                  </div>
                  <button onClick={sendResetLink} disabled={busy} className={btnCls}>
                    {busy ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                    {busy ? t.sending : t.sendBtn}
                  </button>
                  <button
                    onClick={() => { setMsg(null); setMode("otp"); }}
                    className="w-full text-center text-sm text-teal-700 hover:text-teal-900 underline underline-offset-2"
                  >
                    {t.haveCode}
                  </button>
                </div>
              )}

              {mode === "otp" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <span>{t.tipOneUse}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPh}
                        className={inputCls + " pl-10"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.codeLabel}</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder={t.codePh}
                        className={inputCls + " pl-10 tracking-[0.4em] text-center font-semibold"}
                        onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                      />
                    </div>
                  </div>
                  <button onClick={verifyCode} disabled={busy} className={btnCls}>
                    {busy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {busy ? t.verifying : t.verifyBtn}
                  </button>
                  <button
                    onClick={() => { setMsg(null); setCode(""); setMode("request"); }}
                    className="w-full text-center text-sm text-teal-700 hover:text-teal-900 inline-flex items-center justify-center gap-1"
                  >
                    <RefreshCw size={13} /> {t.noCodeYet}
                  </button>
                </div>
              )}

              {mode === "reset" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.newPass}</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.newPassPh}
                        className={inputCls + " pl-10 pr-11"}
                      />
                      <button
                        type="button"
                        aria-label={showPass ? t.hidePass : t.showPass}
                        onClick={() => setShowPass(!showPass)}
                        className={eyeCls}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <Rule ok={longEnough} text={t.ruleLength} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPass}</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder={t.confirmPassPh}
                        className={
                          inputCls + " pl-10 pr-11 " +
                          (confirm.length > 0
                            ? (matches ? "border-green-400 focus:border-green-500" : "border-red-300")
                            : "")
                        }
                        onKeyDown={(e) => e.key === "Enter" && canSubmit && updatePassword()}
                      />
                      <button
                        type="button"
                        aria-label={showConfirm ? t.hidePass : t.showPass}
                        onClick={() => setShowConfirm(!showConfirm)}
                        className={eyeCls}
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <Rule ok={matches} text={matches ? t.ruleMatch : t.ruleNoMatch} />
                  </div>

                  <button onClick={updatePassword} disabled={!canSubmit} className={btnCls}>
                    {busy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {busy ? t.updating : t.updateBtn}
                  </button>
                </div>
              )}

              {mode === "done" && (
                <button onClick={goSignIn} className={btnCls}>
                  <ArrowLeft size={18} /> {t.goSignIn}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__SECURITYRECOVERY_FIX383__COMPLETE
