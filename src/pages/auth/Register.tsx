import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Fingerprint,
  HelpCircle,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { useLanguage } from "@/context/LanguageContext";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

const STRINGS: Record<
  LangCode,
  {
    title: string;
    subtitle: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
    biometric: string;
    continue: string;
    invalid: string;
  }
> = {
  en: {
    title: "Create account",
    subtitle: "Join Bambeh in a few simple steps.",
    username: "Username",
    email: "Email address",
    phone: "Phone number",
    password: "Password",
    securityQuestion: "Security question",
    securityAnswer: "Answer",
    biometric: "Register biometrics",
    continue: "Continue",
    invalid: "Please complete all fields correctly.",
  },
  fr: {
    title: "Créer un compte",
    subtitle: "Rejoignez Bambeh en quelques étapes.",
    username: "Nom d'utilisateur",
    email: "Adresse e-mail",
    phone: "Numéro de téléphone",
    password: "Mot de passe",
    securityQuestion: "Question de sécurité",
    securityAnswer: "Réponse",
    biometric: "Enregistrer la biométrie",
    continue: "Continuer",
    invalid: "Veuillez remplir correctement tous les champs.",
  },
  pcm: {
    title: "Create account",
    subtitle: "Join Bambeh in a few simple steps.",
    username: "Username",
    email: "Email address",
    phone: "Phone number",
    password: "Password",
    securityQuestion: "Security question",
    securityAnswer: "Answer",
    biometric: "Register biometrics",
    continue: "Continue",
    invalid: "Please complete all fields correctly.",
  },
  ar: {
    title: "إنشاء حساب",
    subtitle: "انضم إلى Bambeh في بضع خطوات.",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    securityQuestion: "سؤال الأمان",
    securityAnswer: "الإجابة",
    biometric: "تسجيل البصمة",
    continue: "متابعة",
    invalid: "يرجى إكمال جميع الحقول بشكل صحيح.",
  },
  ful: {
    title: "Sos njiya",
    subtitle: "Naatno to Bambeh e fewi ɗam.",
    username: "Innde mum",
    email: "Njiital email",
    phone: "Lijnel telefonu",
    password: "Mooɗere mooɗi",
    securityQuestion: "Suɓo aawtere",
    securityAnswer: "Tawaande",
    biometric: "Enrol biometrics",
    continue: "Jokku",
    invalid: "Tiiɗno waɗtu gooto e fillere ɗi.",
  },
  ha: {
    title: "Yi rajista",
    subtitle: "Shiga Bambeh cikin matakai kaɗan.",
    username: "Sunan mai amfani",
    email: "Adireshin imel",
    phone: "Lambar waya",
    password: "Kalmar sirri",
    securityQuestion: "Tambayar tsaro",
    securityAnswer: "Amsa",
    biometric: "Rijistar biometrics",
    continue: "Ci gaba",
    invalid: "Don Allah kammala dukkan filayen daidai.",
  },
};

export default function Register() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = ((language as LangCode) in STRINGS ? (language as LangCode) : "en") as LangCode;
  const t = STRINGS[lang];
  const isRtl = lang === "ar";

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
  });
  const [error, setError] = useState("");

  const valid = useMemo(() => {
    return (
      form.username.trim().length >= 2 &&
      /^\S+@\S+\.\S+$/.test(form.email) &&
      form.phone.trim().length >= 7 &&
      form.password.length >= 8 &&
      form.securityQuestion &&
      form.securityAnswer.trim().length >= 2
    );
  }, [form]);

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setError(t.invalid);
      return;
    }
    setError("");
    navigate("/biometric-setup");
  };

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? "rtl" : "ltr"}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="relative">
          <User className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input value={form.username} onChange={onChange("username")} placeholder={t.username} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white" />
        </div>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input value={form.email} onChange={onChange("email")} type="email" placeholder={t.email} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white" />
        </div>

        <div className="relative">
          <Phone className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input value={form.phone} onChange={onChange("phone")} type="tel" placeholder={t.phone} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white" />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input value={form.password} onChange={onChange("password")} type="password" placeholder={t.password} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white" />
        </div>

        <div className="relative">
          <HelpCircle className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <select value={form.securityQuestion} onChange={onChange("securityQuestion")} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white">
            <option value="">{t.securityQuestion}</option>
            <option value="mother">What is your mother&apos;s maiden name?</option>
            <option value="pet">What was the name of your first pet?</option>
            <option value="city">In what city were you born?</option>
          </select>
        </div>

        <div className="relative">
          <ShieldCheck className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input value={form.securityAnswer} onChange={onChange("securityAnswer")} placeholder={t.securityAnswer} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white" />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700">
          {t.continue}
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/biometric-setup")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-2.5 text-xs font-semibold text-teal-800 hover:bg-teal-100"
        >
          <Fingerprint className="h-3.5 w-3.5" />
          {t.biometric}
        </button>
      </form>
    </AuthShell>
  );
}
