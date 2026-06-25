import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { useLanguage } from "@/context/LanguageContext";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

const STRINGS: Record<
  LangCode,
  {
    title: string;
    subtitle: string;
    heading: string;
    hint: string;
    confirm: string;
    resend: string;
    invalid: string;
  }
> = {
  en: {
    title: "Verify account",
    subtitle: "Enter the 6-digit code sent to you.",
    heading: "Verification code",
    hint: "We sent a code to your registered email or phone.",
    confirm: "Confirm code",
    resend: "Resend code",
    invalid: "Please enter the full 6-digit code.",
  },
  fr: {
    title: "Vérifier le compte",
    subtitle: "Saisissez le code à 6 chiffres reçu.",
    heading: "Code de vérification",
    hint: "Nous avons envoyé un code à votre e-mail ou téléphone.",
    confirm: "Confirmer le code",
    resend: "Renvoyer le code",
    invalid: "Veuillez saisir le code complet à 6 chiffres.",
  },
  pcm: {
    title: "Verify account",
    subtitle: "Enter the 6-digit code wey dem send give you.",
    heading: "Verification code",
    hint: "We send code go your email or phone.",
    confirm: "Confirm code",
    resend: "Resend code",
    invalid: "Please enter the full 6-digit code.",
  },
  ar: {
    title: "تأكيد الحساب",
    subtitle: "أدخل رمز التحقق المكوّن من 6 أرقام.",
    heading: "رمز التحقق",
    hint: "أرسلنا الرمز إلى البريد أو الهاتف المسجل.",
    confirm: "تأكيد الرمز",
    resend: "إعادة الإرسال",
    invalid: "يرجى إدخال الرمز الكامل المكوّن من 6 أرقام.",
  },
  ful: {
    title: "Ɗaɓɓude hole",
    subtitle: "Naatno kodde 6 ɗe winndii.",
    heading: "Koɗe ɗe ɓeydu",
    hint: "Ndiimii kodde to email walla telefondi maa.",
    confirm: "Ɗaɓɓit kodde",
    resend: "Neldu kode goɗɗe",
    invalid: "Tiiɗno naatnu kodde 6 ɗe faamii.",
  },
  ha: {
    title: "Tabbatar da asusu",
    subtitle: "Shigar da lambar 6-digit da aka aiko.",
    heading: "Lambar tabbatarwa",
    hint: "Mun aika lamba zuwa imel ko waya da aka yi rajista da ita.",
    confirm: "Tabbatar da lamba",
    resend: "Aika lambar kuma",
    invalid: "Don Allah shigar da cikakkiyar lambar 6-digit.",
  },
};

export default function Verify() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = ((language as LangCode) in STRINGS ? (language as LangCode) : "en") as LangCode;
  const t = STRINGS[lang];
  const isRtl = lang === "ar";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => otp.join(""), [otp]);
  const complete = code.length === 6 && /^\d{6}$/.test(code);

  const focusAt = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < 5) focusAt(index + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        focusAt(index - 1);
        const next = [...otp];
        next[index - 1] = "";
        setOtp(next);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) focusAt(index - 1);
    if (e.key === "ArrowRight" && index < 5) focusAt(index + 1);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill("");
    pasted.split("").forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    setError("");
    focusAt(Math.min(pasted.length, 5));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete) {
      setError(t.invalid);
      return;
    }
    navigate("/enable-biometrics", { replace: true });
  };

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? "rtl" : "ltr"}>
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">{t.heading}</h2>
          <p className="text-sm leading-6 text-gray-600">{t.hint}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div role="group" aria-label={t.heading} className="flex justify-between gap-2" dir="ltr">
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`OTP digit ${index + 1} of 6`}
                maxLength={1}
                className="h-14 w-11 rounded-2xl border border-gray-200 bg-gray-50 text-center text-lg font-semibold text-gray-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            ))}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {t.confirm}
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => window.alert("Code resent")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            <RotateCcw className="h-4 w-4" />
            {t.resend}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
