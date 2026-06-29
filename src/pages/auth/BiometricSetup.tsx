import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, ShieldCheck, ShieldAlert } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { useLanguage } from "@/context/LanguageContext";
import { registerPasskey } from "@/services/passkeys";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

const STRINGS: Record<
  LangCode,
  {
    title: string;
    subtitle: string;
    enable: string;
    skip: string;
    note: string;
    loading: string;
    unsupported: string;
    error: string;
  }
> = {
  en: {
    title: "Enable biometrics",
    subtitle: "Use fingerprint, face unlock, or device unlock for quicker sign in.",
    enable: "Enable biometrics",
    skip: "Skip for now",
    note: "You can change this later in settings.",
    loading: "Setting up biometrics...",
    unsupported: "This device cannot use biometrics right now.",
    error: "Could not enable biometrics. Please try again.",
  },
  fr: {
    title: "Activer la biométrie",
    subtitle: "Utilisez l’empreinte, le visage ou le déverrouillage de l’appareil pour vous connecter plus vite.",
    enable: "Activer la biométrie",
    skip: "Passer pour le moment",
    note: "Vous pourrez modifier ce choix plus tard dans les paramètres.",
    loading: "Configuration de la biométrie...",
    unsupported: "La biométrie n’est pas disponible sur cet appareil pour le moment.",
    error: "Impossible d’activer la biométrie. Veuillez réessayer.",
  },
  pcm: {
    title: "Enable biometrics",
    subtitle: "Use fingerprint, face unlock, or phone unlock for quicker sign in.",
    enable: "Enable biometrics",
    skip: "Skip for now",
    note: "You fit change am later for settings.",
    loading: "We dey set biometric...",
    unsupported: "This phone no fit use biometrics now.",
    error: "No fit enable biometrics. Try again.",
  },
  ar: {
    title: "????? ??????",
    subtitle: "?????? ?????? ?? ????? ?? ??? ?????? ?????? ???? ????.",
    enable: "????? ??????",
    skip: "???? ????",
    note: "????? ????? ??? ?????? ?? ?????????.",
    loading: "???? ????? ??????...",
    unsupported: "?????? ??? ????? ??? ??? ?????? ????.",
    error: "???? ????? ??????. ???? ??? ????.",
  },
  ful: {
    title: "Huutu biometrics",
    subtitle: "Huuto fingerprint, face unlock, walla loowdi telefon ngam se?orde gulii.",
    enable: "Huutu biometrics",
    skip: "Yii go??um",
    note: "A waawi waylude ?um kadi e settings.",
    loading: "Ngam doole biometrics...",
    unsupported: "Biometrics woodaani e ndee telefon hajji.",
    error: "Huutude biometrics naa waawi. Rew?e kadi.",
  },
  ha: {
    title: "Kunna biometrics",
    subtitle: "Yi amfani da yatsa, fuska, ko bu?e na'ura don saurin shiga.",
    enable: "Kunna biometrics",
    skip: "Tsallake yanzu",
    note: "Za ka iya canza wannan daga baya a settings.",
    loading: "Ana saita biometrics...",
    unsupported: "Biometrics ba su samuwa a wannan na'urar yanzu.",
    error: "An kasa kunna biometrics. Gwada kuma.",
  },
};

export default function BiometricSetup() {
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

  const enable = async () => {
    setError(null);
    setUnsupported(false);

    if (!canUseBiometrics) {
      setUnsupported(true);
      return;
    }

    try {
      setIsLoading(true);
      await registerPasskey();
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
      <div className="space-y-4">
        <p className="text-sm leading-6 text-gray-600">{t.note}</p>

        {unsupported && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t.unsupported}</span>
          </div>
        )}

        {error && (
          <div role="alert" aria-live="polite" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={enable}
          disabled={isLoading}
          aria-label={t.enable}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Fingerprint className="h-4 w-4" />
          {isLoading ? t.loading : t.enable}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          disabled={isLoading}
          aria-label={t.skip}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <ShieldCheck className="h-4 w-4" />
          {t.skip}
        </button>
      </div>
    </AuthShell>
  );
}
