// BAMBEH_DEPLOY_TOKEN__LOGIN_FIX629_CLEAN
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, AlertTriangle, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/App";

import { authIdentity } from "@/utils/phoneAuth";

/*
 * FIX629 - a wrong password is no longer a dead end.
 *  - The raw server message ("Invalid login credentials", English only) is turned
 *    into a sentence in the user's language.
 *  - After a failed sign-in - or a number typed with no password - a card offers
 *    "Get a new password". It opens the password-help page with the number (or
 *    email) already filled in, where Bambeh staff approve a request and the owner
 *    chooses a new password WITHOUT the old one (FIX626 / FIX627).
 *  - "Forgot password?" carries the typed number along too.
 */
const HELP: Record<string, Record<string, string>> = {
  en: {
    helpTitle: "Forgot your password?",
    helpBody: "You do not need it. Bambeh can let you choose a new one after checking it is really you.",
    helpBtn: "Get a new password",
    wrongDetails: "That phone number or email and this password do not match.",
    netErr: "We could not reach Bambeh. Check your connection and try again.",
    paused: "This account is paused. Contact Bambeh to have it checked.",
    invalid2: "Enter your phone number (or email) and your password (at least 8 characters).",
  },
  fr: {
    helpTitle: "Mot de passe oubli\u00e9 ?",
    helpBody: "Vous n'en avez pas besoin. Bambeh peut vous laisser en choisir un nouveau apr\u00e8s avoir v\u00e9rifi\u00e9 que c'est bien vous.",
    helpBtn: "Obtenir un nouveau mot de passe",
    wrongDetails: "Ce num\u00e9ro ou cet e-mail ne correspond pas \u00e0 ce mot de passe.",
    netErr: "Impossible de joindre Bambeh. V\u00e9rifiez votre connexion et r\u00e9essayez.",
    paused: "Ce compte est suspendu. Contactez Bambeh pour le faire v\u00e9rifier.",
    invalid2: "Saisissez votre num\u00e9ro (ou e-mail) et votre mot de passe (au moins 8 caract\u00e8res).",
  },
  pidgin: {
    helpTitle: "You don forget your password?",
    helpBody: "You no need am. Bambeh fit make you choose new one after dem check say na really you.",
    helpBtn: "Get new password",
    wrongDetails: "That number or email no match this password.",
    netErr: "We no fit reach Bambeh. Check your connection and try again.",
    paused: "This account don pause. Contact Bambeh make dem check am.",
    invalid2: "Put your phone number (or email) and your password (8 character or more).",
  },
  ar: {
    helpTitle: "\u0647\u0644 \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061f",
    helpBody: "\u0644\u0633\u062a \u0628\u062d\u0627\u062c\u0629 \u0625\u0644\u064a\u0647\u0627. \u064a\u0645\u0643\u0646 \u0644\u0628\u0627\u0645\u0628\u064a\u0647 \u0623\u0646 \u064a\u062a\u064a\u062d \u0644\u0643 \u0627\u062e\u062a\u064a\u0627\u0631 \u0643\u0644\u0645\u0629 \u062c\u062f\u064a\u062f\u0629 \u0628\u0639\u062f \u0627\u0644\u062a\u0623\u0643\u062f \u0645\u0646 \u0647\u0648\u064a\u062a\u0643.",
    helpBtn: "\u0627\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629",
    wrongDetails: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0623\u0648 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0644\u0627 \u064a\u0637\u0627\u0628\u0642 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0647\u0630\u0647.",
    netErr: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647. \u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    paused: "\u0647\u0630\u0627 \u0627\u0644\u062d\u0633\u0627\u0628 \u0645\u0648\u0642\u0648\u0641 \u0645\u0624\u0642\u062a\u064b\u0627. \u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0644\u062a\u062d\u0642\u0642 \u0645\u0646\u0647.",
    invalid2: "\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643 (\u0623\u0648 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a) \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 (8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644).",
  },
  ff: {
    helpTitle: "A yejjitii finnde maa?",
    helpBody: "A haajaaki nde. Bambeh ina waawi accude ma su\u0253aade keso caggal nde \u0253e \u01b4eewti ko an tigi.",
    helpBtn: "He\u0253u finnde keso",
    wrongDetails: "Limngal walla email oo nanndaani e finnde nde.",
    netErr: "Min mbaawaa yettaade Bambeh. \u01b3eewu ce\u014bogol maa, etto kadi.",
    paused: "Konte nde darnaama. Jokkondir e Bambeh ngam \u01b4eewtaade nde.",
    invalid2: "Naatnu limngal tilifon maa (walla email) e finnde maa (alkule 8 walla \u0253uri).",
  },
};

const STRINGS = {
  en: {
    title: "Welcome back",
    subtitle: "Sign in to continue.",
    email: "Phone number or email",
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
    email: "Num\u00e9ro de t\u00e9l\u00e9phone ou e-mail",
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
    email: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0623\u0648 \u0627\u0644\u0628\u0631\u064a\u062f",
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
    email: "Phone number or email",
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
    email: "Limngal noddirgal walla email",
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
  const langKey = language === "pcm" ? "pidgin" : language === "ful" ? "ff" : String(language);
  const t = STRINGS[langKey as keyof typeof STRINGS] ?? STRINGS.en;
  const h = HELP[langKey] || HELP.en;
  const isRtl = langKey === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  // FIX629 - where "Get a new password" and "Forgot password?" go: the number or
  // email typed here travels along, so nobody types it twice.
  const typed = email.trim();
  const typedDigits = typed.includes("@") ? "" : typed.replace(/\D/g, "");
  const helpHref = (): string => {
    if (typed.includes("@")) return "/forgot-password?mode=email&email=" + encodeURIComponent(typed);
    if (typedDigits.length >= 8 && typedDigits.length <= 15) return "/forgot-password?phone=" + typedDigits;
    return "/forgot-password";
  };
  const friendly = (raw: unknown): { msg: string; help: boolean } => {
    const s =
      typeof raw === "string"
        ? raw
        : String((raw as { message?: string } | null)?.message || raw || "");
    if (/banned|suspend|paused|disabled/i.test(s)) return { msg: h.paused, help: false };
    if (/fetch|network|timeout|timed out|connection|offline/i.test(s)) return { msg: h.netErr, help: false };
    if (/invalid|credential|password|grant|not found|no user/i.test(s)) return { msg: h.wrongDetails, help: true };
    return { msg: t.failed, help: true };
  };

  const emailValid = useMemo(() => authIdentity(email) !== null, [email]); // FIX283: a phone number is just as valid as an email here
  const passwordValid = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !passwordValid) {
      setError(h.invalid2);
      // a number with no password usually means "I don't remember it"
      setHelpOpen(emailValid && !passwordValid);
      return;
    }

    setLoading(true);
    setError("");
    setHelpOpen(false);
    try {
      const result = await login(authIdentity(email) || email, password); // FIX283
      if (result?.error) {
        const f = friendly(result.error); // FIX629
        setError(f.msg);
        setHelpOpen(f.help);
        return;
      }
      navigate("/", { replace: true });
    } catch (err) {
      const f = friendly(err); // FIX629
      setError(f.msg);
      setHelpOpen(f.help);
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
                type="text"
                autoComplete="username"
                inputMode="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                placeholder="6XX XXX XXX / name@example.com"
                dir="ltr"
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
                  placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
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

            {helpOpen && (
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4" data-fix="FIX629" role="status">
                <p className="flex items-center gap-2 text-sm font-semibold text-teal-900">
                  <KeyRound className="h-4 w-4 shrink-0" /> {h.helpTitle}
                </p>
                <p className="mt-1 text-xs text-teal-800">{h.helpBody}</p>
                <button
                  type="button"
                  onClick={() => navigate(helpHref())}
                  className="mt-3 w-full rounded-xl border border-teal-300 bg-white py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-100"
                >
                  {h.helpBtn}
                </button>
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
            <Link to={helpHref()} className="text-teal-700 hover:underline">
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
// BAMBEH_END_TOKEN__LOGIN_FIX629__COMPLETE
