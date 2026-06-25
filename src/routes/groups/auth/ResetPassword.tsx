import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, KeyRound, Lock } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { useLanguage } from "@/context/LanguageContext";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

const STRINGS: Record<
  LangCode,
  {
    title: string;
    subtitle: string;
    token: string;
    next: string;
    confirm: string;
    save: string;
    cancel: string;
    invalid: string;
    mismatch: string;
  }
> = {
  en: {
    title: "Reset password",
    subtitle: "Use the reset token sent to your email or phone.",
    token: "Reset token",
    next: "New password",
    confirm: "Confirm new password",
    save: "Update password",
    cancel: "Back to login",
    invalid: "Enter the reset token and a valid new password.",
    mismatch: "Passwords must match and be at least 8 characters.",
  },
  fr: {
    title: "R�initialiser le mot de passe",
    subtitle: "Utilisez le jeton envoy� � votre e-mail ou t�l�phone.",
    token: "Jeton de r�initialisation",
    next: "Nouveau mot de passe",
    confirm: "Confirmer le nouveau mot de passe",
    save: "Mettre � jour le mot de passe",
    cancel: "Retour � la connexion",
    invalid: "Saisissez le jeton et un nouveau mot de passe valide.",
    mismatch: "Les mots de passe doivent correspondre et contenir au moins 8 caract�res.",
  },
  pcm: {
    title: "Reset password",
    subtitle: "Use the reset token wey dem send your email or phone.",
    token: "Reset token",
    next: "New password",
    confirm: "Confirm new password",
    save: "Update password",
    cancel: "Back to login",
    invalid: "Enter the reset token and a valid new password.",
    mismatch: "Passwords must match and be at least 8 characters.",
  },
  ar: {
    title: "????? ????? ???? ??????",
    subtitle: "?????? ??? ????? ??????? ?????? ??? ????? ?? ?????.",
    token: "??? ????? ???????",
    next: "???? ?????? ???????",
    confirm: "????? ???? ?????? ???????",
    save: "????? ???? ??????",
    cancel: "?????? ??? ????? ??????",
    invalid: "???? ??? ????? ??????? ????? ???? ????? ?????.",
    mismatch: "??? ?? ?????? ????? ?????? ??? ???? 8 ???? ??? ?????.",
  },
  ful: {
    title: "?eydude moo?ere",
    subtitle: "Huuto kodol ?eydude neldii to email walla telefoni.",
    token: "Kodol ?eydude",
    next: "Moo?ere hesere",
    confirm: "?eydu moo?ere hesere",
    save: "Hokka moo?ere",
    cancel: "Yillo to login",
    invalid: "Naatnu kodol ?eydude e moo?ere hesere mo??ere.",
    mismatch: "Moo?ere ?i ?oo?i e ina 8 chars so mo??i.",
  },
  ha: {
    title: "Sake saita kalmar sirri",
    subtitle: "Yi amfani da lambar sake saiti da aka aika maka.",
    token: "Lambar sake saiti",
    next: "Sabuwar kalmar sirri",
    confirm: "Tabbatar da sabuwar kalmar sirri",
    save: "Sabunta kalmar sirri",
    cancel: "Komawa login",
    invalid: "Shigar da lambar sake saiti da sabuwar kalmar sirri mai inganci.",
    mismatch: "Kalmomin sirri dole su dace kuma su kasance a?alla haruffa 8.",
  },
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = ((language as LangCode) in STRINGS ? (language as LangCode) : "en") as LangCode;
  const t = STRINGS[lang];
  const isRtl = lang === "ar";

  const [form, setForm] = useState({
    token: "",
    next: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  const valid = useMemo(() => {
    return form.token.trim().length >= 6 && form.next.length >= 8 && form.next === form.confirm;
  }, [form]);

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.token.trim() || form.next.length < 8) {
      setError(t.invalid);
      return;
    }
    if (!valid) {
      setError(t.mismatch);
      return;
    }

    setError("");
    navigate("/login", { replace: true });
  };

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? "rtl" : "ltr"}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input
            value={form.token}
            onChange={onChange("token")}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t.token}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white"
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input
            value={form.next}
            onChange={onChange("next")}
            type="password"
            autoComplete="new-password"
            placeholder={t.next}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white"
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input
            value={form.confirm}
            onChange={onChange("confirm")}
            type="password"
            autoComplete="new-password"
            placeholder={t.confirm}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          {t.save}
          <CheckCircle2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
        >
          {t.cancel}
        </button>
      </form>
    </AuthShell>
  );
}


