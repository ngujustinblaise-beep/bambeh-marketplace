import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    failed: "Sign-in failed. Check your details and try again.",
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
    createOne: "Cr\u00e9er un compte",
    forgotPassword: "Mot de passe oubli\u00e9 ?",
    invalid: "Veuillez saisir une adresse e-mail et un mot de passe valides.",
    failed: "\u00c9chec de la connexion. V\u00e9rifiez vos identifiants et r\u00e9essayez.",
    show: "Afficher le mot de passe",
    hide: "Masquer le mot de passe",
    logoAlt: "Logo Bambeh",
  },
  ar: {
    title: "\u0645\u0631\u062d\u0628\u064b\u0627 \u0628\u0639\u0648\u062f\u062a\u0643",
    subtitle: "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u0645\u062a\u0627\u0628\u0639\u0629.",
    email: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    signIn: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    signingIn: "\u062c\u0627\u0631\u064d \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644...",
    noAccount: "\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628\u061f",
    createOne: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628",
    forgotPassword: "\u0647\u0644 \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061f",
    invalid: "\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0648\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0635\u062d\u064a\u062d\u064a\u0646.",
    failed: "\u0641\u0634\u0644 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.",
    show: "\u0625\u0638\u0647\u0627\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    hide: "\u0625\u062e\u0641\u0627\u0621 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    logoAlt: "\u0634\u0639\u0627\u0631 Bambeh",
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
    failed: "Sign in no work. Check your details and try again.",
    show: "Show password",
    hide: "Hide password",
    logoAlt: "Bambeh logo",
  },
  ff: {
    title: "Jam weeti",
    subtitle: "Se\u014bo ngam jokkude.",
    email: "Email ma",
    password: "Mo\u01b4\u01b4ere",
    signIn: "Se\u014bo",
    signingIn: "Ko se\u014boto...",
    noAccount: "A alaa konte?",
    createOne: "Sos konte",
    forgotPassword: "A yejjitii mo\u01b4\u01b4ere?",
    invalid: "Naatnu email e mo\u01b4\u01b4ere mo\u01b4\u01b4ii.",
    failed: "Se\u014baade waawaani. Ndaartu ke\u0253e ma, etto kadi.",
    show: "Hollu mo\u01b4\u01b4ere",
    hide: "Suu\u0257u mo\u01b4\u01b4ere",
    logoAlt: "Bambeh logo",
  },
} as const;

export default function Login() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { login } = useAuth();
  const t = STRINGS[language as keyof typeof STRINGS] ?? STRINGS.en;
  const isRtl = language === "ar";

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
      navigate("/", { replace: true });
    } catch {
      setError(t.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 py-10">
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
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
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
