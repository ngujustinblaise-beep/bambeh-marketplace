import React from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, ShieldCheck } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { useLanguage } from "@/context/LanguageContext";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

const STRINGS: Record<
  LangCode,
  {
    title: string;
    subtitle: string;
    enable: string;
    skip: string;
    note: string;
  }
> = {
  en: {
    title: "Enable biometrics",
    subtitle: "Use fingerprint or face unlock for quicker sign in.",
    enable: "Enable biometrics",
    skip: "Skip for now",
    note: "You can change this later in settings.",
  },
  fr: {
    title: "Activer la biométrie",
    subtitle: "Utilisez l’empreinte ou le visage pour aller plus vite.",
    enable: "Activer la biométrie",
    skip: "Passer pour le moment",
    note: "Vous pourrez modifier ce choix plus tard.",
  },
  pcm: {
    title: "Enable biometrics",
    subtitle: "Use fingerprint or face unlock for quicker sign in.",
    enable: "Enable biometrics",
    skip: "Skip for now",
    note: "You can change this later in settings.",
  },
  ar: {
    title: "تفعيل البصمة",
    subtitle: "استخدم البصمة أو الوجه لتسجيل أسرع.",
    enable: "تفعيل البصمة",
    skip: "تخطي الآن",
    note: "يمكنك تغيير هذا لاحقًا من الإعدادات.",
  },
  ful: {
    title: "Huutu biometrics",
    subtitle: "Huuto fingerprint walla face unlock.",
    enable: "Huutu biometrics",
    skip: "Yii goɗɗum",
    note: "A waawi waɗde ɗum kadi e settings.",
  },
  ha: {
    title: "Kunna biometrics",
    subtitle: "Yi amfani da yatsa ko fuska don saurin shiga.",
    enable: "Kunna biometrics",
    skip: "Tsallake yanzu",
    note: "Za ka iya canza wannan daga baya a settings.",
  },
};

export default function BiometricSetup() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = ((language as LangCode) in STRINGS ? (language as LangCode) : "en") as LangCode;
  const t = STRINGS[lang];
  const isRtl = lang === "ar";

  const enable = () => {
    localStorage.setItem("bambeh_biometric_enabled", "true");
    navigate("/", { replace: true });
  };

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? "rtl" : "ltr"}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-gray-600">{t.note}</p>

        <button
          type="button"
          onClick={enable}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <Fingerprint className="h-4 w-4" />
          {t.enable}
        </button>

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
        >
          <ShieldCheck className="h-4 w-4" />
          {t.skip}
        </button>
      </div>
    </AuthShell>
  );
}


