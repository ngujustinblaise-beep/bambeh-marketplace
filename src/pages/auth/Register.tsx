import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/App";

const STRINGS = {
  en: {
    title: "Welcome back",
    subtitle: "Sign in to continue.",
    email: "Email address",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    noAccount: "Don't have an account?",
    createOne: "Create account",
    forgotPassword: "Forgot password?",
    invalid: "Please enter a valid email and password.",
    show: "Show password",
    hide: "Hide password",
    logoAlt: "Bambeh logo",
  },
  fr: {
    title: "Bon retour",
    subtitle: "Connectez-vous pour continuer.",
    email: "Adresse e-mail",
    password: "Mot de passe",
    signIn: "Se connecter",
    signingIn: "Connexion...",
    noAccount: "Pas encore de compte ?",
    createOne: "CrÃ©er un compte",
    forgotPassword: "Mot de passe oubliÃ© ?",
    invalid: "Veuillez saisir une adresse e-mail et un mot de passe valides.",
    show: "Afficher le mot de passe",
    hide: "Masquer le mot de passe",
    logoAlt: "Logo Bambeh",
  },
  ar: {
    title: "Ù…Ø±Ø­Ø¨Ù‹Ø§ Ø¨Ø¹ÙˆØ¯ØªÙƒ",
    subtitle: "Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù„Ù…ØªØ§Ø¨Ø¹Ø©.",
    email: "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ",
    password: "ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±",
    signIn: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„",
    signingIn: "Ø¬Ø§Ø±Ù ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„...",
    noAccount: "Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ØŸ",
    createOne: "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨",
    forgotPassword: "Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŸ",
    invalid: "ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± ØµØ§Ù„Ø­ÙŠÙ†.",
    show: "Ø¥Ø¸Ù‡Ø§Ø± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±",
    hide: "Ø¥Ø®ÙØ§Ø¡ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±",
    logoAlt: "Ø´Ø¹Ø§Ø± Bambeh",
  },
  pidgin: {
    title: "Welcome back",
    subtitle: "Sign in make you continue.",
    email: "Email address",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Dey sign in...",
    noAccount: "You no get account?",
    createOne: "Create account",
    forgotPassword: "Forget password?",
    invalid: "Please enter correct email and password.",
    show: "Show password",
    hide: "Hide password",
    logoAlt: "Bambeh logo",
  },
  ff: {
    title: "Jam tan",
    subtitle: "Seŋo e barne.",
    email: "Njiital email",
    password: "MoÆ´Æ´ere moÆ´Æ´i",
    signIn: "SeÅ‹o",
    signingIn: "Ko seÅ‹oto...",
    noAccount: "A adi a waawi fotaade?",
    createOne: "Sos njiya",
    forgotPassword: "Nodii moÆ´Æ´ere?",
    invalid: "TiiÉ—no naatnude email e moÆ´Æ´ere moÆ´Æ´i.",
    show: "WaÉ—tude moÆ´Æ´ere",
    hide: "Æ¯ittude moÆ´Æ´ere",
    logoAlt: "Bambeh logo",
  },
} as const;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = STRINGS[language as keyof typeof STRINGS] ?? STRINGS.en;
  const { login } = useAuth();

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
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt={t.logoAlt}
            className="mx-auto h-20 w-auto object-contain mb-4"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{t.subtitle}</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.email}
              </label>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.password}
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white transition-colors hover:bg-teal-700 disabled:bg-gray-300"
            >
              {loading ? t.signingIn : t.signIn}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-teal-700 hover:underline">
              {t.forgotPassword}
            </Link>
            <Link to="/register" className="text-teal-700 hover:underline">
              {t.createOne}
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t.noAccount}{" "}
            <Link to="/register" className="font-semibold text-teal-700 hover:underline">
              {t.createOne}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
