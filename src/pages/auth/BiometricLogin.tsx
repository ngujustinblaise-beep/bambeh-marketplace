// BAMBEH_DEPLOY_TOKEN__BIOMETRICLOGIN_FIX157_CLEAN
/**
 * BiometricLogin.tsx — Bambeh (FIX157)
 * REAL biometric unlock (WebAuthn platform authenticator). No stubs.
 * Deploy: C:\Dev\bambe-android\src\pages\auth\BiometricLogin.tsx
 * Route already exists: /biometric-login
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  isBiometricAvailable,
  hasLocalBiometric,
  localUserHint,
  authenticateBiometric,
} from "@/services/biometric";

type Dict = { [k: string]: string };
const STR: { [lang: string]: Dict } = {
  en: {
    title: "Biometric Login",
    subtitle: "Unlock Bambeh with your fingerprint or face",
    unlock: "Unlock with biometrics",
    checking: "Checking your device\u2026",
    verifying: "Verifying\u2026",
    success: "Welcome back!",
    usePassword: "Use password instead",
    notAvailable: "Biometrics are not available on this device. Please sign in with your password.",
    notEnrolled: "Biometric login is not set up on this device yet. Sign in with your password, then enable it in Biometric Setup.",
    sessionExpired: "Your session has expired. Please sign in with your password once, then biometrics will work again.",
    cancelled: "Verification was cancelled. Try again.",
    failed: "Verification failed. Try again or use your password.",
    back: "Back",
    hint: "Signed-in account",
  },
  fr: {
    title: "Connexion biom\u00e9trique",
    subtitle: "D\u00e9verrouillez Bambeh avec votre empreinte ou votre visage",
    unlock: "D\u00e9verrouiller par biom\u00e9trie",
    checking: "V\u00e9rification de votre appareil\u2026",
    verifying: "V\u00e9rification\u2026",
    success: "Bon retour !",
    usePassword: "Utiliser le mot de passe",
    notAvailable: "La biom\u00e9trie n'est pas disponible sur cet appareil. Connectez-vous avec votre mot de passe.",
    notEnrolled: "La connexion biom\u00e9trique n'est pas encore configur\u00e9e sur cet appareil. Connectez-vous avec votre mot de passe, puis activez-la dans Configuration biom\u00e9trique.",
    sessionExpired: "Votre session a expir\u00e9. Connectez-vous une fois avec votre mot de passe, puis la biom\u00e9trie fonctionnera \u00e0 nouveau.",
    cancelled: "V\u00e9rification annul\u00e9e. R\u00e9essayez.",
    failed: "\u00c9chec de la v\u00e9rification. R\u00e9essayez ou utilisez votre mot de passe.",
    back: "Retour",
    hint: "Compte connect\u00e9",
  },
  pcm: {
    title: "Biometric Login",
    subtitle: "Open Bambeh with your finger or face",
    unlock: "Open with biometrics",
    checking: "We dey check your device\u2026",
    verifying: "We dey verify\u2026",
    success: "Welcome back!",
    usePassword: "Use password",
    notAvailable: "Biometrics no dey for this device. Abeg sign in with your password.",
    notEnrolled: "You never set up biometric login for this device. Sign in with password first, then turn am on for Biometric Setup.",
    sessionExpired: "Your session don expire. Sign in with password one time, then biometrics go work again.",
    cancelled: "You cancel am. Try again.",
    failed: "E no work. Try again or use your password.",
    back: "Go back",
    hint: "Account wey sign in",
  },
  ar: {
    title: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0644\u0628\u0635\u0645\u0629",
    subtitle: "\u0627\u0641\u062a\u062d \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0628\u0635\u0645\u062a\u0643 \u0623\u0648 \u0648\u062c\u0647\u0643",
    unlock: "\u0641\u062a\u062d \u0628\u0627\u0644\u0628\u0635\u0645\u0629",
    checking: "\u062c\u0627\u0631\u064d \u0641\u062d\u0635 \u062c\u0647\u0627\u0632\u0643\u2026",
    verifying: "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642\u2026",
    success: "\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0639\u0648\u062f\u062a\u0643!",
    usePassword: "\u0627\u0633\u062a\u062e\u062f\u0645 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    notAvailable: "\u0627\u0644\u0628\u0635\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632. \u0627\u0644\u0631\u062c\u0627\u0621 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.",
    notEnrolled: "\u0644\u0645 \u064a\u062a\u0645 \u0625\u0639\u062f\u0627\u062f \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0644\u0628\u0635\u0645\u0629 \u0628\u0639\u062f. \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u062b\u0645 \u0641\u0639\u0651\u0644\u0647\u0627 \u0645\u0646 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a.",
    sessionExpired: "\u0627\u0646\u062a\u0647\u062a \u062c\u0644\u0633\u062a\u0643. \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0631\u0629 \u0648\u0627\u062d\u062f\u0629 \u062b\u0645 \u0633\u062a\u0639\u0645\u0644 \u0627\u0644\u0628\u0635\u0645\u0629 \u0645\u062c\u062f\u062f\u0627\u064b.",
    cancelled: "\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062a\u062d\u0642\u0642. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.",
    failed: "\u0641\u0634\u0644 \u0627\u0644\u062a\u062d\u0642\u0642. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b \u0623\u0648 \u0627\u0633\u062a\u062e\u062f\u0645 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.",
    back: "\u0631\u062c\u0648\u0639",
    hint: "\u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u062c\u0651\u0644",
  },
  ful: {
    title: "Naatugol e Biometric",
    subtitle: "Udditir Bambeh e feddeere maa walla yeeso maa",
    unlock: "Udditir e biometric",
    checking: "Min ndaara masin maa\u2026",
    verifying: "Min \u0257a\u0253\u0253ita\u2026",
    success: "A warti, jam!",
    usePassword: "Huutoro finnde",
    notAvailable: "Biometric alaa e masin oo. Naatir finnde maa.",
    notEnrolled: "Biometric siincaaka tawon e masin oo. Naatir finnde, refti udditan mo e Biometric Setup.",
    sessionExpired: "Yontere maa timmii. Naatir finnde laawol gootol, refti biometric golloto kadi.",
    cancelled: "A haaytii. E\u0257\u0257itto.",
    failed: "\u0189a\u0253\u0253itagol ronkii. E\u0257\u0257itto walla huutoro finnde.",
    back: "Rutto",
    hint: "Konte naatnde",
  },
};

function pickLang(code: string | undefined): Dict {
  const c = (code || "en").toLowerCase();
  if (STR[c]) return STR[c];
  if (c === "pidgin") return STR.pcm;
  if (c === "ff" || c === "fula" || c === "fulfulde") return STR.ful;
  return STR.en;
}

export default function BiometricLogin() {
  const navigate = useNavigate();
  const langCtx: any = useLanguage() || {};
  const L = pickLang(langCtx.language);
  const isRTL = (langCtx.language || "") === "ar";

  const [phase, setPhase] = useState<
    "checking" | "ready" | "verifying" | "success" | "unavailable" | "notEnrolled"
  >("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const avail = await isBiometricAvailable();
      if (!alive) return;
      if (!avail) {
        setPhase("unavailable");
        return;
      }
      if (!hasLocalBiometric()) {
        setPhase("notEnrolled");
        return;
      }
      setPhase("ready");
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onUnlock = async () => {
    setMessage("");
    setPhase("verifying");
    const res = await authenticateBiometric();
    if (res.ok) {
      setPhase("success");
      setTimeout(() => navigate("/"), 600);
      return;
    }
    setPhase("ready");
    if (res.error === "session_expired") setMessage(L.sessionExpired);
    else if (res.error === "cancelled") setMessage(L.cancelled);
    else if (res.error === "not_enrolled") setPhase("notEnrolled");
    else setMessage(L.failed);
  };

  const hint = localUserHint();

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col items-center justify-center px-6 py-10"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-teal-100 p-6 text-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-teal-700 mb-4"
        >
          <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
          {L.back}
        </button>

        <div className="mx-auto w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mb-4">
          {phase === "success" ? (
            <ShieldCheck size={40} className="text-emerald-600" />
          ) : (
            <Fingerprint size={40} className="text-teal-600" />
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900">{L.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{L.subtitle}</p>

        {hint ? (
          <p className="mt-3 text-xs text-gray-400">
            {L.hint}: <span className="font-medium text-gray-600">{hint}</span>
          </p>
        ) : null}

        <div className="mt-6 space-y-3">
          {phase === "checking" && <p className="text-sm text-gray-500">{L.checking}</p>}

          {phase === "unavailable" && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {L.notAvailable}
            </p>
          )}

          {phase === "notEnrolled" && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {L.notEnrolled}
            </p>
          )}

          {(phase === "ready" || phase === "verifying") && (
            <button
              type="button"
              onClick={onUnlock}
              disabled={phase === "verifying"}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Fingerprint size={20} />
              {phase === "verifying" ? L.verifying : L.unlock}
            </button>
          )}

          {phase === "success" && (
            <p className="text-sm font-semibold text-emerald-700">{L.success}</p>
          )}

          {message ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {message}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl border border-teal-200 text-teal-700 font-medium hover:bg-teal-50 flex items-center justify-center gap-2"
          >
            <KeyRound size={18} />
            {L.usePassword}
          </button>
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__BIOMETRICLOGIN__COMPLETE
