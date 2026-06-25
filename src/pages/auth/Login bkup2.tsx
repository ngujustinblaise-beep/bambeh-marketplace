import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Fingerprint, ArrowRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, any> = {
  en: {
    title: "Welcome back",
    subtitle: "Sign in to continue to Bambeh.",
    email: "Email address",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    forgotPassword: "Forgot password?",
    forgotCredentials: "Forgot credentials?",
    noAccount: "Don't have an account?",
    createOne: "Create account",
    show: "Show password",
    hide: "Hide password",
    useBiometric: "Use passkey / biometric",
    invalid: "Please enter valid credentials.",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const lang = "en" as Lang;
  const t = S[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passwordValid = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !passwordValid) {
      setError(t.invalid);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const { error } = await login(email, password);
      if (error) {
        setError(error);
        return;
      }
      navigate("/app", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasskey = async () => {
    setError("Passkey login is not wired yet.");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Bambeh"
            className="mx-auto h-20 w-auto object-contain mb-4"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
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
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex gap-2 items-start">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white py-3 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? t.signingIn : t.signIn}
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handlePasskey}
              disabled={submitting}
              className="w-full rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 py-3 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Fingerprint className="h-4 w-4" />
              {t.useBiometric}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/auth/forgot-password" className="text-teal-700 hover:underline">
              {t.forgotPassword}
            </Link>
            <Link to="/auth/forgot-credentials" className="text-teal-700 hover:underline">
              {t.forgotCredentials}
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            {t.noAccount}{" "}
            <Link to="/auth/register" className="text-teal-700 font-semibold hover:underline">
              {t.createOne}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}