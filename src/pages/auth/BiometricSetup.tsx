// BAMBEH_DEPLOY_TOKEN__BIOMETRICSETUP_FIX157_CLEAN
/**
 * BiometricSetup.tsx — Bambeh (FIX157)
 * REAL biometric enrollment (WebAuthn platform authenticator). No stubs.
 * Deploy: C:\Dev\bambe-android\src\pages\auth\BiometricSetup.tsx
 * Route already exists: /biometric-setup
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, ArrowLeft, ShieldCheck, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import {
  isBiometricAvailable,
  hasLocalBiometric,
  enrollBiometric,
  disableBiometric,
} from "@/services/biometric";

type Dict = { [k: string]: string };
const STR: { [lang: string]: Dict } = {
  en: {
    title: "Biometric Setup",
    subtitle: "Enable fingerprint or face unlock for this device",
    enable: "Enable biometric login",
    enrolling: "Follow your device prompt\u2026",
    enabledTitle: "Biometric login is ON",
    enabledBody: "Next time, unlock Bambeh from the Biometric Login page.",
    disable: "Turn off on this device",
    checking: "Checking your device\u2026",
    notAvailable: "Biometrics are not available on this device or browser. You can keep using your password \u2014 nothing is lost.",
    notSignedIn: "Please sign in first, then come back to enable biometric login.",
    goLogin: "Go to Login",
    cancelled: "Enrollment was cancelled. Try again.",
    failed: "Enrollment failed. Try again.",
    back: "Back",
    secure: "Your fingerprint or face never leaves your device. Bambeh stores no passwords or biometric data.",
    tryIt: "Try Biometric Login",
  },
  fr: {
    title: "Configuration biom\u00e9trique",
    subtitle: "Activez le d\u00e9verrouillage par empreinte ou visage sur cet appareil",
    enable: "Activer la connexion biom\u00e9trique",
    enrolling: "Suivez l'invite de votre appareil\u2026",
    enabledTitle: "Connexion biom\u00e9trique ACTIV\u00c9E",
    enabledBody: "La prochaine fois, d\u00e9verrouillez Bambeh depuis la page Connexion biom\u00e9trique.",
    disable: "D\u00e9sactiver sur cet appareil",
    checking: "V\u00e9rification de votre appareil\u2026",
    notAvailable: "La biom\u00e9trie n'est pas disponible sur cet appareil ou navigateur. Continuez avec votre mot de passe \u2014 rien n'est perdu.",
    notSignedIn: "Veuillez d'abord vous connecter, puis revenez activer la biom\u00e9trie.",
    goLogin: "Aller \u00e0 la connexion",
    cancelled: "Inscription annul\u00e9e. R\u00e9essayez.",
    failed: "\u00c9chec de l'inscription. R\u00e9essayez.",
    back: "Retour",
    secure: "Votre empreinte ou votre visage ne quitte jamais votre appareil. Bambeh ne stocke aucun mot de passe ni donn\u00e9e biom\u00e9trique.",
    tryIt: "Essayer la connexion biom\u00e9trique",
  },
  pcm: {
    title: "Biometric Setup",
    subtitle: "Turn on finger or face unlock for this device",
    enable: "Turn on biometric login",
    enrolling: "Follow wetin your device talk\u2026",
    enabledTitle: "Biometric login don ON",
    enabledBody: "Next time, open Bambeh from Biometric Login page.",
    disable: "Turn am off for this device",
    checking: "We dey check your device\u2026",
    notAvailable: "Biometrics no dey for this device or browser. You fit still use your password \u2014 nothing spoil.",
    notSignedIn: "Abeg sign in first, then come back turn on biometric.",
    goLogin: "Go Login",
    cancelled: "You cancel am. Try again.",
    failed: "E no work. Try again.",
    back: "Go back",
    secure: "Your finger or face no dey comot from your device. Bambeh no dey keep password or biometric data.",
    tryIt: "Try Biometric Login",
  },
  ar: {
    title: "\u0625\u0639\u062f\u0627\u062f \u0627\u0644\u0628\u0635\u0645\u0629",
    subtitle: "\u0641\u0639\u0651\u0644 \u0641\u062a\u062d \u0627\u0644\u0642\u0641\u0644 \u0628\u0627\u0644\u0628\u0635\u0645\u0629 \u0623\u0648 \u0627\u0644\u0648\u062c\u0647 \u0644\u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632",
    enable: "\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0644\u0628\u0635\u0645\u0629",
    enrolling: "\u0627\u062a\u0628\u0639 \u062a\u0639\u0644\u064a\u0645\u0627\u062a \u062c\u0647\u0627\u0632\u0643\u2026",
    enabledTitle: "\u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0644\u0628\u0635\u0645\u0629 \u0645\u064f\u0641\u0639\u0651\u0644",
    enabledBody: "\u0641\u064a \u0627\u0644\u0645\u0631\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629\u060c \u0627\u0641\u062a\u062d \u0628\u0627\u0645\u0628\u064a\u0647 \u0645\u0646 \u0635\u0641\u062d\u0629 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0644\u0628\u0635\u0645\u0629.",
    disable: "\u0625\u064a\u0642\u0627\u0641 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632",
    checking: "\u062c\u0627\u0631\u064d \u0641\u062d\u0635 \u062c\u0647\u0627\u0632\u0643\u2026",
    notAvailable: "\u0627\u0644\u0628\u0635\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632 \u0623\u0648 \u0627\u0644\u0645\u062a\u0635\u0641\u062d. \u064a\u0645\u0643\u0646\u0643 \u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.",
    notSignedIn: "\u0627\u0644\u0631\u062c\u0627\u0621 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b \u062b\u0645 \u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0628\u0635\u0645\u0629.",
    goLogin: "\u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u062f\u062e\u0648\u0644",
    cancelled: "\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062a\u0633\u062c\u064a\u0644. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.",
    failed: "\u0641\u0634\u0644 \u0627\u0644\u062a\u0633\u062c\u064a\u0644. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.",
    back: "\u0631\u062c\u0648\u0639",
    secure: "\u0628\u0635\u0645\u062a\u0643 \u0623\u0648 \u0648\u062c\u0647\u0643 \u0644\u0627 \u064a\u063a\u0627\u062f\u0631 \u062c\u0647\u0627\u0632\u0643 \u0623\u0628\u062f\u0627\u064b. \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0627 \u062a\u062e\u0632\u0651\u0646 \u0643\u0644\u0645\u0627\u062a \u0645\u0631\u0648\u0631 \u0623\u0648 \u0628\u064a\u0627\u0646\u0627\u062a \u0628\u0635\u0645\u0629.",
    tryIt: "\u062c\u0631\u0651\u0628 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0644\u0628\u0635\u0645\u0629",
  },
  ful: {
    title: "Siincugol Biometric",
    subtitle: "Huu\u0253in udditirde feddeere walla yeeso e masin oo",
    enable: "Huu\u0253in naatugol biometric",
    enrolling: "Jokku ko masin maa wi'i\u2026",
    enabledTitle: "Naatugol biometric HUU\u0181INAAMA",
    enabledBody: "Laawol aroore, udditir Bambeh e hello Biometric Login.",
    disable: "Nyifu e masin oo",
    checking: "Min ndaara masin maa\u2026",
    notAvailable: "Biometric alaa e masin walla wanngorde oo. A waawi jokkude e finnde maa.",
    notSignedIn: "Naatu tawon, refti artu huu\u0253in biometric.",
    goLogin: "Yah to Naatugol",
    cancelled: "A haaytii. E\u0257\u0257itto.",
    failed: "E ronkii. E\u0257\u0257itto.",
    back: "Rutto",
    secure: "Feddeere maa walla yeeso maa yaltataa masin maa. Bambeh mooftataa finnde walla keɓe biometric.",
    tryIt: "E\u0257\u0257o Naatugol Biometric",
  },
};

function pickLang(code: string | undefined): Dict {
  const c = (code || "en").toLowerCase();
  if (STR[c]) return STR[c];
  if (c === "pidgin") return STR.pcm;
  if (c === "ff" || c === "fula" || c === "fulfulde") return STR.ful;
  return STR.en;
}

export default function BiometricSetup() {
  const navigate = useNavigate();
  const langCtx: any = useLanguage() || {};
  const L = pickLang(langCtx.language);
  const isRTL = (langCtx.language || "") === "ar";

  const [phase, setPhase] = useState<
    "checking" | "ready" | "enrolling" | "enabled" | "unavailable" | "notSignedIn"
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
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      if (!data?.user) {
        setPhase("notSignedIn");
        return;
      }
      setPhase(hasLocalBiometric() ? "enabled" : "ready");
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onEnable = async () => {
    setMessage("");
    setPhase("enrolling");
    const res = await enrollBiometric();
    if (res.ok) {
      setPhase("enabled");
      return;
    }
    if (res.error === "not_signed_in") {
      setPhase("notSignedIn");
      return;
    }
    setPhase("ready");
    setMessage(res.error === "cancelled" ? L.cancelled : L.failed);
  };

  const onDisable = async () => {
    await disableBiometric();
    setMessage("");
    setPhase("ready");
  };

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
          {phase === "enabled" ? (
            <ShieldCheck size={40} className="text-emerald-600" />
          ) : (
            <Fingerprint size={40} className="text-teal-600" />
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900">{L.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{L.subtitle}</p>

        <div className="mt-6 space-y-3">
          {phase === "checking" && <p className="text-sm text-gray-500">{L.checking}</p>}

          {phase === "unavailable" && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {L.notAvailable}
            </p>
          )}

          {phase === "notSignedIn" && (
            <>
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                {L.notSignedIn}
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold shadow hover:opacity-95"
              >
                {L.goLogin}
              </button>
            </>
          )}

          {(phase === "ready" || phase === "enrolling") && (
            <button
              type="button"
              onClick={onEnable}
              disabled={phase === "enrolling"}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Fingerprint size={20} />
              {phase === "enrolling" ? L.enrolling : L.enable}
            </button>
          )}

          {phase === "enabled" && (
            <>
              <p className="text-sm font-semibold text-emerald-700">{L.enabledTitle}</p>
              <p className="text-xs text-gray-500">{L.enabledBody}</p>
              <button
                type="button"
                onClick={() => navigate("/biometric-login")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold shadow hover:opacity-95"
              >
                {L.tryIt}
              </button>
              <button
                type="button"
                onClick={onDisable}
                className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                {L.disable}
              </button>
            </>
          )}

          {message ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {message}
            </p>
          ) : null}

          <p className="text-[11px] text-gray-400 leading-snug pt-2">{L.secure}</p>
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__BIOMETRICSETUP__COMPLETE
