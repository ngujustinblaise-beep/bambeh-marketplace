import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, ArrowRight, ShieldAlert } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { useLanguage } from "@/context/LanguageContext";
import { authenticateWithPasskey } from "@/services/passkeys";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

const STRINGS: Record<
  LangCode,
  {
    title: string;
    subtitle: string;
    biometric: string;
    fallback: string;
    loading: string;
    unsupported: string;
    error: string;
  }
> = {
  en: {
    title: "Biometric login",
    subtitle: "Use your fingerprint, face, or device unlock to continue.",
    biometric: "Continue with biometrics",
    fallback: "Use password instead",
    loading: "Checking your device...",
    unsupported: "Biometrics are not available on this device.",
    error: "Biometric sign-in failed. Try again or use password.",
  },
  fr: {
    title: "Connexion biom�trique",
    subtitle: "Utilisez votre empreinte, votre visage ou le d�verrouillage de l�appareil pour continuer.",
    biometric: "Continuer avec la biom�trie",
    fallback: "Utiliser le mot de passe",
    loading: "V�rification de l�appareil...",
    unsupported: "La biom�trie n�est pas disponible sur cet appareil.",
    error: "La connexion biom�trique a �chou�. R�essayez ou utilisez le mot de passe.",
  },
  pcm: {
    title: "Biometric login",
    subtitle: "Use your fingerprint, face, or device unlock to continue.",
    biometric: "Continue with biometrics",
    fallback: "Use password instead",
    loading: "We dey check your phone...",
    unsupported: "Biometrics no dey this phone.",
    error: "Biometric login no work. Try again or use password.",
  },
  ar: {
    title: "????? ?????? ???????",
    subtitle: "?????? ?????? ?? ????? ?? ??? ?????? ????????.",
    biometric: "???????? ???????",
    fallback: "??????? ???? ??????",
    loading: "???? ?????? ?? ??????...",
    unsupported: "?????? ??? ????? ??? ??? ??????.",
    error: "??? ????? ?????? ???????. ???? ??? ???? ?? ?????? ???? ??????.",
  },
  ful: {
    title: "Se?o e biometrics",
    subtitle: "Huuto fingerprint, face, walla loowdi ?ii ngol e ndee.",
    biometric: "Jokkondir e biometrics",
    fallback: "Huuto password",
    loading: "Ngam nji?de telefon maa...",
    unsupported: "Biometrics woodaani e ndee telefon.",
    error: "Biometric login mo??aani. Rew?e woni ndee walla huutoro password.",
  },
  ha: {
    title: "Shiga da biometrics",
    subtitle: "Yi amfani da yatsa, fuska, ko bu?e na'ura don ci gaba.",
    biometric: "Ci gaba da biometrics",
    fallback: "Yi amfani da kalmar sirri",
    loading: "Ana bincika na'urar ka...",
    unsupported: "Biometrics ba su samuwa a wannan na'urar.",
    error: "Shiga da biometrics ya kasa. Gwada kuma ko yi amfani da kalmar sirri.",
  },
};

export default function BiometricLogin() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = ((language as LangCode) in STRINGS ? (language as LangCode) : "en") as LangCode;
  const t = STRINGS[lang];
  const isRtl = lang === "ar";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  const canUseBiometrics = useMemo(() => {
    return typeof window !== "undefined" && "credentials" in navigator;
  }, []);

  const handleBiometricLogin = async () => {
    setError(null);
    setUnsupported(false);

    if (!canUseBiometrics) {
      setUnsupported(true);
      return;
    }

    try {
      setIsLoading(true);
      await authenticateWithPasskey();
      navigate("/", { replace: true });
    } catch (e: any) {
      if (e?.name === "NotAllowedError") return;
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? "rtl" : "ltr"}>
      <div className="space-y-3">
        {unsupported && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t.unsupported}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleBiometricLogin}
          disabled={isLoading}
          aria-label={t.biometric}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Fingerprint className="h-4 w-4" />
          {isLoading ? t.loading : t.biometric}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          disabled={isLoading}
          aria-label={t.fallback}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {t.fallback}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AuthShell>
  );
}