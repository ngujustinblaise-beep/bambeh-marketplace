// BAMBEH_DEPLOY_TOKEN__SECURITYRECOVERY_FIX382_CLEAN
/**
 * src/pages/SecurityRecovery.tsx - FIX382. A real, working account recovery.
 *
 * WHY THIS WAS REBUILT
 *   The live URL proved the diagnosis:
 *       app.bambeh.com/?code=a942a842-...#/security-recovery
 *   Supabase uses the PKCE flow, so the recovery token arrives as ?code= in the
 *   QUERY STRING and must be TRADED for a session via exchangeCodeForSession().
 *   The old page only understood #access_token, so it ignored the code and
 *   showed the "enter your email" form again. Nothing was broken - the trade
 *   was simply never attempted.
 *
 * WHY THERE IS ALSO A 6-DIGIT CODE
 *   PKCE keeps a secret "code verifier" in the browser that MADE the request.
 *   Open the email in a different browser - Gmail's in-app viewer, Firefox,
 *   a different phone - and the verifier is not there, so the link can never
 *   work no matter how correct our code is. For Bambeh's users that is the
 *   normal case, not the edge case. A 6-digit code carries no secret, so it
 *   works on any browser, any device, any time within the hour.
 *
 *   THE CODE PATH NEEDS THE EMAIL TEMPLATE TO CONTAIN  {{ .Token }}
 *   Supabase Dashboard - Authentication - Emails - Reset Password.
 *   Until that is added the link still works; the code box just will not have
 *   a code to type. See the message that ships with this fix.
 *
 * THE THREE WAYS IN, all handled here:
 *   1. ?code=...            -> exchangeCodeForSession()   (same browser)
 *   2. #access_token=...    -> setSession()               (older links)
 *   3. 6-digit code typed   -> verifyOtp()                (any browser)
 *   All three end in the same place: a session, then updateUser({ password }),
 *   which writes the new password into Supabase auth and signs the user in.
 *
 * NETWORK
 *   Bambeh currently sees ERR_CONNECTION_CLOSED against Supabase on this
 *   machine and on users' phones. Every call here retries three times with a
 *   growing pause, and a failure says so honestly instead of showing a green
 *   success box over a request that never left the device.
 *
 * ENCODING
 *   Pure ASCII. Every accent is a \uXXXX escape, so no editor, git setting or
 *   PowerShell redirect can ever corrupt this file. Same armour as FIX379.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck, Mail, KeyRound, ArrowLeft, Loader2,
  CheckCircle2, AlertCircle, Hash, RefreshCw,
} from "lucide-react";

const STASH = "bambeh_recovery_tokens";

type Mode = "checking" | "request" | "otp" | "reset";
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
  back: string;
  checking: string;
  titleRequest: string; subRequest: string;
  titleOtp: string; subOtp: string;
  titleReset: string; subReset: string;
  emailLabel: string; emailPh: string;
  sendBtn: string; sending: string;
  codeLabel: string; codePh: string;
  verifyBtn: string; verifying: string;
  newPass: string; newPassPh: string;
  confirmPass: string; confirmPassPh: string;
  updateBtn: string; updating: string;
  haveCode: string; noCodeYet: string; resend: string;
  sentOk: string;
  errNoEmail: string; errNoCode: string;
  errShort: string; errMatch: string;
  errNetwork: string; errBrowser: string; errExpired: string; errCode: string;
  okUpdated: string;
}

const T: Record<LangCode, Copy> = {
  en: {
    back: "Back to sign in",
    checking: "Checking your recovery link...",
    titleRequest: "Account Recovery",
    subRequest: "Enter your email. We'll send you a secure link and a 6-digit code.",
    titleOtp: "Enter your code",
    subOtp: "Type the 6-digit code from the email we just sent. It works in any browser.",
    titleReset: "Set a New Password",
    subReset: "Choose a strong new password for your Bambeh account.",
    emailLabel: "Email address", emailPh: "you@example.com",
    sendBtn: "Send recovery link", sending: "Sending...",
    codeLabel: "6-digit code", codePh: "123456",
    verifyBtn: "Verify code", verifying: "Verifying...",
    newPass: "New password", newPassPh: "At least 8 characters",
    confirmPass: "Confirm new password", confirmPassPh: "Re-enter your password",
    updateBtn: "Update password", updating: "Updating...",
    haveCode: "I already have a code",
    noCodeYet: "Send me a new code",
    resend: "Send again",
    sentOk: "If an account exists for that email, a link and a code are on their way. Check your inbox and your spam folder.",
    errNoEmail: "Please enter your email address.",
    errNoCode: "Please enter the 6-digit code from the email.",
    errShort: "Password must be at least 8 characters.",
    errMatch: "The two passwords do not match.",
    errNetwork: "Could not reach Bambeh. Check your connection and try again.",
    errBrowser: "This link was opened in a different browser from the one that requested it, so it cannot work. Enter the 6-digit code from the same email instead - that works anywhere.",
    errExpired: "This recovery link has expired. Request a new one below.",
    errCode: "That code is not right, or it has expired. Check the email again or send a new one.",
    okUpdated: "Password updated. Taking you to sign in...",
  },
  fr: {
    back: "Retour a la connexion",
    checking: "Verification de votre lien...",
    titleRequest: "Recuperation de compte",
    subRequest: "Entrez votre email. Nous vous enverrons un lien securise et un code a 6 chiffres.",
    titleOtp: "Entrez votre code",
    subOtp: "Saisissez le code a 6 chiffres recu par email. Il fonctionne dans n'importe quel navigateur.",
    titleReset: "Nouveau mot de passe",
    subReset: "Choisissez un mot de passe solide pour votre compte Bambeh.",
    emailLabel: "Adresse email", emailPh: "vous@exemple.com",
    sendBtn: "Envoyer le lien", sending: "Envoi...",
    codeLabel: "Code a 6 chiffres", codePh: "123456",
    verifyBtn: "Verifier le code", verifying: "Verification...",
    newPass: "Nouveau mot de passe", newPassPh: "Au moins 8 caracteres",
    confirmPass: "Confirmez le mot de passe", confirmPassPh: "Saisissez-le a nouveau",
    updateBtn: "Mettre a jour", updating: "Mise a jour...",
    haveCode: "J'ai deja un code",
    noCodeYet: "Envoyez-moi un nouveau code",
    resend: "Renvoyer",
    sentOk: "Si un compte existe pour cet email, un lien et un code sont en route. Verifiez votre boite de reception et vos spams.",
    errNoEmail: "Veuillez saisir votre adresse email.",
    errNoCode: "Veuillez saisir le code a 6 chiffres.",
    errShort: "Le mot de passe doit contenir au moins 8 caracteres.",
    errMatch: "Les deux mots de passe ne correspondent pas.",
    errNetwork: "Impossible de joindre Bambeh. Verifiez votre connexion et reessayez.",
    errBrowser: "Ce lien a ete ouvert dans un navigateur different de celui qui l'a demande, il ne peut donc pas fonctionner. Saisissez plutot le code a 6 chiffres du meme email.",
    errExpired: "Ce lien a expire. Demandez-en un nouveau ci-dessous.",
    errCode: "Ce code est incorrect ou expire. Verifiez l'email ou demandez-en un nouveau.",
    okUpdated: "Mot de passe mis a jour. Redirection vers la connexion...",
  },
  pcm: {
    back: "Go back to sign in",
    checking: "We dey check your link...",
    titleRequest: "Get Your Account Back",
    subRequest: "Put your email. We go send you link and 6-number code.",
    titleOtp: "Put your code",
    subOtp: "Type the 6-number code wey dey inside the email. E dey work for any browser.",
    titleReset: "Put New Password",
    subReset: "Choose strong new password for your Bambeh account.",
    emailLabel: "Email address", emailPh: "you@example.com",
    sendBtn: "Send the link", sending: "E dey send...",
    codeLabel: "6-number code", codePh: "123456",
    verifyBtn: "Check the code", verifying: "E dey check...",
    newPass: "New password", newPassPh: "8 letters or more",
    confirmPass: "Put the password again", confirmPassPh: "Type am one more time",
    updateBtn: "Change password", updating: "E dey change...",
    haveCode: "I get code already",
    noCodeYet: "Send me new code",
    resend: "Send am again",
    sentOk: "If account dey for that email, link and code don dey come. Check your inbox and your spam.",
    errNoEmail: "Abeg put your email address.",
    errNoCode: "Abeg put the 6-number code.",
    errShort: "Password must reach 8 letters.",
    errMatch: "The two password no be the same.",
    errNetwork: "We no fit reach Bambeh. Check your network and try again.",
    errBrowser: "You open this link for different browser from the one wey ask for am, so e no fit work. Better put the 6-number code from the same email - that one dey work anywhere.",
    errExpired: "This link don expire. Ask for new one for down.",
    errCode: "That code no correct, or e don expire. Check the email again or ask for new one.",
    okUpdated: "Password don change. We dey take you go sign in...",
  },
  ar: {
    back: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644",
    checking: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0627\u0628\u0637...",
    titleRequest: "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u062D\u0633\u0627\u0628",
    subRequest: "\u0623\u062F\u062E\u0644 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A. \u0633\u0646\u0631\u0633\u0644 \u0644\u0643 \u0631\u0627\u0628\u0637\u0627\u064B \u0622\u0645\u0646\u0627\u064B \u0648\u0631\u0645\u0632\u0627\u064B \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645.",
    titleOtp: "\u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0645\u0632",
    subOtp: "\u0627\u0643\u062A\u0628 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0628\u0631\u064A\u062F. \u064A\u0639\u0645\u0644 \u0641\u064A \u0623\u064A \u0645\u062A\u0635\u0641\u062D.",
    titleReset: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u062F\u064A\u062F\u0629",
    subReset: "\u0627\u062E\u062A\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0642\u0648\u064A\u0629 \u0644\u062D\u0633\u0627\u0628\u0643 \u0641\u064A \u0628\u0627\u0645\u0628\u064A\u0647.",
    emailLabel: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", emailPh: "you@example.com",
    sendBtn: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0627\u0628\u0637", sending: "\u062C\u0627\u0631\u064D \u0627\u0644\u0625\u0631\u0633\u0627\u0644...",
    codeLabel: "\u0631\u0645\u0632 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645", codePh: "123456",
    verifyBtn: "\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0645\u0632", verifying: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0642\u0642...",
    newPass: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629", newPassPh: "8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    confirmPass: "\u062A\u0623\u0643\u064A\u062F \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", confirmPassPh: "\u0623\u0639\u062F \u0625\u062F\u062E\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    updateBtn: "\u062A\u062D\u062F\u064A\u062B \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", updating: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u062F\u064A\u062B...",
    haveCode: "\u0644\u062F\u064A \u0631\u0645\u0632 \u0628\u0627\u0644\u0641\u0639\u0644",
    noCodeYet: "\u0623\u0631\u0633\u0644 \u0644\u064A \u0631\u0645\u0632\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B",
    resend: "\u0625\u0631\u0633\u0627\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649",
    sentOk: "\u0625\u0630\u0627 \u0643\u0627\u0646 \u0647\u0646\u0627\u0643 \u062D\u0633\u0627\u0628 \u0628\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F\u060C \u0641\u0642\u062F \u0623\u064F\u0631\u0633\u0644 \u0631\u0627\u0628\u0637 \u0648\u0631\u0645\u0632. \u062A\u062D\u0642\u0642 \u0645\u0646 \u0628\u0631\u064A\u062F\u0643 \u0648\u0645\u0646 \u0645\u062C\u0644\u062F \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u063A\u064A\u0631 \u0627\u0644\u0645\u0631\u063A\u0648\u0628\u0629.",
    errNoEmail: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A.",
    errNoCode: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645.",
    errShort: "\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
    errMatch: "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u064A\u0646.",
    errNetwork: "\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064A\u0647. \u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u062A\u0635\u0627\u0644\u0643 \u0648\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.",
    errBrowser: "\u0641\u064F\u062A\u062D \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064A \u0645\u062A\u0635\u0641\u062D \u0645\u062E\u062A\u0644\u0641 \u0639\u0646 \u0627\u0644\u0645\u062A\u0635\u0641\u062D \u0627\u0644\u0630\u064A \u0637\u0644\u0628\u0647\u060C \u0644\u0630\u0627 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u064A\u0639\u0645\u0644. \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645 \u0645\u0646 \u0627\u0644\u0628\u0631\u064A\u062F \u0646\u0641\u0633\u0647 - \u0641\u0647\u0648 \u064A\u0639\u0645\u0644 \u0641\u064A \u0623\u064A \u0645\u0643\u0627\u0646.",
    errExpired: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637. \u0627\u0637\u0644\u0628 \u0631\u0627\u0628\u0637\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B \u0623\u062F\u0646\u0627\u0647.",
    errCode: "\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0623\u0648 \u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u062A\u0647. \u0631\u0627\u062C\u0639 \u0627\u0644\u0628\u0631\u064A\u062F \u0623\u0648 \u0627\u0637\u0644\u0628 \u0631\u0645\u0632\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B.",
    okUpdated: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u062C\u0627\u0631\u064D \u0646\u0642\u0644\u0643 \u0625\u0644\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644...",
  },
  ff: {
    back: "Rutto e naatirde",
    checking: "Eno yiyloo jokkorde maa...",
    titleRequest: "He\u0253tingol konte",
    subRequest: "Naatnu email maa. Min neldete jokkorde hisnde e kod jowi-e-go'o.",
    titleOtp: "Naatnu kod maa",
    subOtp: "Winndu kod jowi-e-go'o mo woni e email on. Ina golloo e kala nokku.",
    titleReset: "Finnde keso",
    subReset: "Su\u0253o finnde tii\u0257nde wonande konte maa Bambeh.",
    emailLabel: "Email", emailPh: "an@misal.com",
    sendBtn: "Neldu jokkorde", sending: "Eno nelda...",
    codeLabel: "Kod jowi-e-go'o", codePh: "123456",
    verifyBtn: "\u01B3eewndo kod", verifying: "Eno \u01B4eewndoo...",
    newPass: "Finnde keso", newPassPh: "Ko fam\u0257i fof alkule 8",
    confirmPass: "Tee\u014Btinu finnde", confirmPassPh: "Winndu \u0257um kadi",
    updateBtn: "Waylu finnde", updating: "Eno wayla...",
    haveCode: "Mi jogii kod",
    noCodeYet: "Neldam kod keso",
    resend: "Neldu kadi",
    sentOk: "Si konte woodi e ndee email, jokkorde e kod ina ngara. \u01B3eewu boite maa e spam maa.",
    errNoEmail: "Tii\u0257no naatnu email maa.",
    errNoCode: "Tii\u0257no naatnu kod jowi-e-go'o.",
    errShort: "Finnde ina foti heewde alkule 8.",
    errMatch: "Finndeeji \u0257i\u0257i \u0257in nanndaani.",
    errNetwork: "Min mbaawaani he\u0253de Bambeh. \u01B3eewu jokkondiral maa nda\u0257\u0257a kadi.",
    errBrowser: "Ndee jokkorde udditaama e nokku go\u0257\u0257o, ko \u0257um wa\u0257i nde waawaa gollaade. Naatnu kod jowi-e-go'o mo woni e email on - \u0257um ina golloo kala nokku.",
    errExpired: "Ndee jokkorde timmii. Naamno go\u0257\u0257o les.",
    errCode: "Kod on selli, walla o timmii. \u01B3eewu email on kadi walla naamno kod keso.",
    okUpdated: "Finnde waylaama. Eno na\u0253e e naatirde...",
  },
};

/* ---------------- network helper ---------------------------------------- */

/** Runs fn up to three times. The Supabase host on this network drops
 *  connections often enough that one attempt is not a fair test. */
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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

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

      /* ---- 1. PKCE: trade the code for a session ---- */
      if (stash.code) {
        try {
          const { error } = await withRetry(() =>
            supabase.auth.exchangeCodeForSession(stash.code)
          );
          if (cancelled) return;

          if (!error) {
            setMode("reset");
            return;
          }

          // supabase-js may already have traded it while we were mounting.
          const { data } = await supabase.auth.getSession();
          if (cancelled) return;
          if (data.session) {
            setMode("reset");
            return;
          }

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

      /* ---- 2. Older implicit links: #access_token ---- */
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
    if (!email.trim()) {
      setMsg({ type: "err", text: t.errNoEmail });
      return;
    }
    setBusy(true);
    setMsg(null);
    const redirectTo = window.location.origin + "/#/security-recovery";
    try {
      const { error } = await withRetry(() =>
        supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
      );
      setBusy(false);
      if (error) {
        setMsg({ type: "err", text: error.message });
        return;
      }
      setMsg({ type: "ok", text: t.sentOk });
      setMode("otp");
    } catch {
      setBusy(false);
      setMsg({ type: "err", text: t.errNetwork });
    }
  };

  /* -- verify the 6-digit code -------------------------------------------- */
  const verifyCode = async () => {
    if (!email.trim()) {
      setMsg({ type: "err", text: t.errNoEmail });
      return;
    }
    const clean = code.replace(/\D/g, "");
    if (clean.length < 6) {
      setMsg({ type: "err", text: t.errNoCode });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await withRetry(() =>
        supabase.auth.verifyOtp({
          email: email.trim(),
          token: clean,
          type: "recovery",
        })
      );
      setBusy(false);
      if (error) {
        setMsg({ type: "err", text: t.errCode });
        return;
      }
      setMsg(null);
      setMode("reset");
    } catch {
      setBusy(false);
      setMsg({ type: "err", text: t.errNetwork });
    }
  };

  /* -- write the new password --------------------------------------------- */
  const updatePassword = async () => {
    if (password.length < 8) {
      setMsg({ type: "err", text: t.errShort });
      return;
    }
    if (password !== confirm) {
      setMsg({ type: "err", text: t.errMatch });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await withRetry(() =>
        supabase.auth.updateUser({ password })
      );
      setBusy(false);
      if (error) {
        setMsg({ type: "err", text: error.message });
        return;
      }
      setMsg({ type: "ok", text: t.okUpdated });
      setTimeout(() => navigate("/login"), 1800);
    } catch {
      setBusy(false);
      setMsg({ type: "err", text: t.errNetwork });
    }
  };

  /* -- presentation -------------------------------------------------------- */

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none " +
    "focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition";

  const btnCls =
    "w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 " +
    "disabled:opacity-60 flex items-center justify-center gap-2";

  const heading =
    mode === "reset" ? t.titleReset : mode === "otp" ? t.titleOtp : t.titleRequest;
  const sub =
    mode === "reset" ? t.subReset : mode === "otp" ? t.subOtp : t.subRequest;

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-10"
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
            <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center">
              <ShieldCheck className="text-white" size={28} />
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
                    (msg.type === "ok"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700")
                  }
                >
                  {msg.type === "ok" ? (
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  )}
                  <span>{msg.text}</span>
                </div>
              )}

              {mode === "request" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.emailLabel}
                    </label>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.emailLabel}
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.codeLabel}
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.newPass}
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.newPassPh}
                        className={inputCls + " pl-10"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.confirmPass}
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder={t.confirmPassPh}
                        className={inputCls + " pl-10"}
                        onKeyDown={(e) => e.key === "Enter" && updatePassword()}
                      />
                    </div>
                  </div>
                  <button onClick={updatePassword} disabled={busy} className={btnCls}>
                    {busy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {busy ? t.updating : t.updateBtn}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__SECURITYRECOVERY_FIX382__COMPLETE
