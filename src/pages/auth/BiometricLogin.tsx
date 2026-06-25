import React from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { useLanguage } from "@/context/LanguageContext";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

const STRINGS: Record<LangCode, { title: string; subtitle: string; biometric: string; fallback: string }> = {
  en: {
    title: "Biometric login",
    subtitle: "Use your fingerprint or face to continue.",
    biometric: "Continue with biometrics",
    fallback: "Use password instead",
  },
  fr: {
    title: "Connexion biométrique",
    subtitle: "Utilisez votre empreinte ou votre visage.",
    biometric: "Continuer avec la biométrie",
    fallback: "Utiliser le mot de passe",
  },
  pcm: {
    title: "Biometric login",
    subtitle: "Use your fingerprint or face to continue.",
    biometric: "Continue with biometrics",
    fallback: "Use password instead",
  },
  ar: {
    title: "تسجيل بالبصمة",
    subtitle: "استخدم البصمة أو الوجه للمتابعة.",
    biometric: "المتابعة بالبصمة",
    fallback: "استخدام كلمة المرور",
  },
  ful: {
    title: "Seŋo e biometrics",
    subtitle: "Huuto fingerprint walla face.",
    biometric: "Jokkondir e biometrics",
    fallback: "Huuto password",
  },
  ha: {
    title: "Shiga da biometrics",
    subtitle: "Yi amfani da yatsa ko fuska.",
    biometric: "Ci gaba da biometrics",
    fallback: "Yi amfani da kalmar sirri",
  },
};

export default function BiometricLogin() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = ((language as LangCode) in STRINGS ? (language as LangCode) : "en") as LangCode;
  const t = STRINGS[lang];
  const isRtl = lang === "ar";

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? "rtl" : "ltr"}>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <Fingerprint className="h-4 w-4" />
          {t.biometric}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
        >
          {t.fallback}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AuthShell>
  );
}
