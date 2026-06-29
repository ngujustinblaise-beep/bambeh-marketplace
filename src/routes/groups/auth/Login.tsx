import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Fingerprint, UserPlus, LogIn, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

type LangCode = "en" | "fr" | "pcm" | "ar" | "ful" | "ha";

const STRINGS: Record<LangCode, {
  title: string;
  subtitle: string;
  email: string;
  password: string;
  signIn: string;
  signingIn: string;
  register: string;
  biometricLogin: string;
  show: string;
  hide: string;
  invalid: string;
}> = {
  en: {
    title: "Welcome back",
    subtitle: "Sign in to continue.",
    email: "Email address",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    register: "Sign up",
    biometricLogin: "Biometric login",
    show: "Show password",
    hide: "Hide password",
    invalid: "Please enter a valid email and password.",
  },
  fr: {
    title: "Bon retour",
    subtitle: "Connectez-vous pour continuer.",
    email: "Adresse e-mail",
    password: "Mot de passe",
    signIn: "Se connecter",
    signingIn: "Connexion...",
    register: "Créer un compte",
    biometricLogin: "Connexion biométrique",
    show: "Afficher le mot de passe",
    hide: "Masquer le mot de passe",
    invalid: "Veuillez saisir une adresse e-mail et un mot de passe valides.",
  },
  pcm: {
    title: "Welcome back",
    subtitle: "Sign in make you continue.",
    email: "Email address",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Dey sign in...",
    register: "Sign up",
    biometricLogin: "Biometric login",
    show: "Show password",
    hide: "Hide password",
    invalid: "Please enter a valid email and password.",
  },
  ar: {
    title: "مرحبًا بعودتك",
    subtitle: "سجّل الدخول للمتابعة.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ تسجيل الدخول...",
    register: "إنشاء حساب",
    biometricLogin: "الدخول بالبصمة",
    show: "إظهار كلمة المرور",
    hide: "إخفاء كلمة المرور",
    invalid: "يرجى إدخال بريد إلكتروني وكلمة مرور صالحين.",
  },
  ful: {
    title: "Jam tan",
    subtitle: "Seŋo e barne.",
    email: "Njiital email",
    password: "Mooɗere mooɗi",
    signIn: "Seŋo",
    signingIn: "Ko seŋoto...",
    register: "Sos njiya",
    biometricLogin: "Seŋo e biometrics",
    show: "Waɗtude mooɗere",
    hide: "Hiddude mooɗere",
    invalid: "Naatnude email e mooɗere mooɗi.",
  },
  ha: {
    title: "Barka da zuwa",
    subtitle: "Shiga domin ci gaba.",
    email: "Adireshin imel",
    password: "Kalmar sirri",
    signIn: "Shiga",
    signingIn: "Ana shiga...",
    register: "Yi rajista",
    biometricLogin: "Shiga da biometrics",
    show: "Nuna kalmar sirri",
    hide: "Boye kalmar sirri",
    invalid: "Don Allah shigar da ingantaccen imel da kalmar sirri.",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { language } = useLanguage();

  const lang = ((language as LangCode) in STRINGS ? (language as LangCode) : "en");
  const t = STRINGS[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);
  const passwordValid = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !passwordValid) {
      setError(t.invalid);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error);
        return;
      }
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const isRtl = lang === "ar";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      <section className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-18 h-18 mx-auto mb-4 rounded-3xl bg-teal-600 flex items-center justify-center shadow-md">
            <Globe className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">{t.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{t.subtitle}</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-xl p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.email}</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.password}</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? t.hide : t.show}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition-colors hover:bg-teal-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {loading ? t.signingIn : t.signIn}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between gap-3 text-sm">
            <Link to="/register" className="inline-flex items-center gap-2 text-teal-700 hover:underline">
              <UserPlus className="h-4 w-4" />
              {t.register}
            </Link>
            <Link to="/biometric-login" className="inline-flex items-center gap-2 text-slate-700 hover:underline">
              <Fingerprint className="h-4 w-4" />
              {t.biometricLogin}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

