/**
 * AuthPage.tsx — Combined User Auth (Sign In + Sign Up)
 * © 2026 BAMBEH SARL. All rights reserved.
 *
 * Features:
 * ✅ Tabbed Sign In | Sign Up in one page
 * ✅ Sign Up includes phone (AfricanPhoneInput)
 * ✅ Full 5-language translation (EN/FR/Pidgin/AR/FF)
 * ✅ RTL support for Arabic
 * ✅ Remember me checkbox (UI ready, backend in Phase 4)
 * ✅ Reacts to bambeh:langchange
 * ✅ Real error messages from Supabase via AuthContext
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AfricanPhoneInput from "@/components/AfricanPhoneInput";
import { LogIn, Eye, EyeOff, User, Lock, Mail, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";
type Mode = "signin" | "signup";

const AUTH_STRINGS: Record<LangCode, Record<string, string>> = {
  en: {
    welcome: "Welcome to Bambeh",
    signInToYourAccount: "Sign in to your account",
    email: "Email address",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signInButton: "Sign In",
    dontHaveAccount: "Don't have an account?",
    signUpTab: "Sign Up",
    signInTab: "Sign In",
    fullName: "Full Name",
    phoneNumber: "Phone Number (optional)",
    alreadyHaveAccount: "Already have an account?",
    createAccountButton: "Create Account",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    emailRequired: "Please enter your email",
    passwordRequired: "Please enter your password",
    passwordMinLength: "Password must be at least 6 characters",
    nameRequired: "Please enter your full name",
    invalidEmail: "Please enter a valid email",
    signInError: "Sign in failed.",
    registerError: "Registration failed.",
    loginSuccess: "Welcome! Redirecting...",
    registerSuccess: "Account created! Redirecting...",
    sessionPersists: "You stay logged in until you sign out",
    biometricComingSoon: "Biometric login coming soon",
  },
  fr: {
    welcome: "Bienvenue sur Bambeh",
    signInToYourAccount: "Connectez-vous à votre compte",
    email: "Adresse e-mail",
    password: "Mot de passe",
    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublié ?",
    signInButton: "Se connecter",
    dontHaveAccount: "Vous n'avez pas de compte ?",
    signUpTab: "S'inscrire",
    signInTab: "Se connecter",
    fullName: "Nom complet",
    phoneNumber: "Numéro de téléphone (optionnel)",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    createAccountButton: "Créer un compte",
    signingIn: "Connexion en cours...",
    creatingAccount: "Création du compte...",
    emailRequired: "Veuillez entrer votre e-mail",
    passwordRequired: "Veuillez entrer votre mot de passe",
    passwordMinLength: "Le mot de passe doit comporter au moins 6 caractères",
    nameRequired: "Veuillez entrer votre nom complet",
    invalidEmail: "Veuillez entrer une adresse e-mail valide",
    signInError: "Échec de la connexion.",
    registerError: "Échec de l'inscription.",
    loginSuccess: "Bienvenue ! Redirection...",
    registerSuccess: "Compte créé ! Redirection...",
    sessionPersists: "Vous restez connecté jusqu'à ce que vous vous déconnecter",
    biometricComingSoon: "Connexion biométrique à venir",
  },
  pidgin: {
    welcome: "Welcome to Bambeh",
    signInToYourAccount: "Enter your account",
    email: "Email address",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forget password?",
    signInButton: "Enter",
    dontHaveAccount: "You get account?",
    signUpTab: "Create Account",
    signInTab: "Enter",
    fullName: "Your Full Name",
    phoneNumber: "Your Phone (no wahala if you no put)",
    alreadyHaveAccount: "You don get account before?",
    createAccountButton: "Create My Account",
    signingIn: "Entering...",
    creatingAccount: "Making your account...",
    emailRequired: "Put your email abeg",
    passwordRequired: "Put password abeg",
    passwordMinLength: "Password must get at least 6 letters",
    nameRequired: "Put your full name abeg",
    invalidEmail: "That email no correct",
    signInError: "Enter fail.",
    registerError: "Create account fail.",
    loginSuccess: "Welcome! We coming...",
    registerSuccess: "Account done! We coming...",
    sessionPersists: "You stay enter until you close",
    biometricComingSoon: "Finger login coming soon",
  },
  ar: {
    welcome: "أهلا بك في بامبيه",
    signInToYourAccount: "سجل دخولك إلى حسابك",
    email: "عنوان بريد إلكتروني",
    password: "كلمة السر",
    rememberMe: "تذكرني",
    forgotPassword: "هل نسيت كلمتك؟",
    signInButton: "دخول",
    dontHaveAccount: "ليس لديك حساب؟",
    signUpTab: "تسجيل",
    signInTab: "دخول",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف (اختياري)",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    createAccountButton: "إنشاء حساب",
    signingIn: "جاري الدخول...",
    creatingAccount: "جاري إنشاء الحساب...",
    emailRequired: "يرجى إدخال بريدك الإلكتروني",
    passwordRequired: "يرجى إدخال كلمة المرور",
    passwordMinLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
    nameRequired: "يرجى إدخال اسمك الكامل",
    invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
    signInError: "فشل الدخول.",
    registerError: "فشل التسجيل.",
    loginSuccess: "مرحبا! إعادة التوجيه...",
    registerSuccess: "تم إنشاء الحساب! إعادة التوجيه...",
    sessionPersists: "تبقى مسجلا حتى تسجل الخروج",
    biometricComingSoon: "بصمة قادمة قريبا",
  },
  ff: {
    welcome: "Jam lokal Bambeh",
    signInToYourAccount: "Seŋ yoɓɓi kontuure maa",
    email: "Adr email",
    password: "Seŋ suruguɗe",
    rememberMe: "Aji ma",
    forgotPassword: "Rikine suruguɗe?",
    signInButton: "Seŋ",
    dontHaveAccount: "Kontuure alaa?",
    signUpTab: "Loowi",
    signInTab: "Seŋ",
    fullName: "Innde Buuwal",
    phoneNumber: "Numer telefon (sahaa)",
    alreadyHaveAccount: "Kontuure ko loowii?",
    createAccountButton: "Loow kontuure",
    signingIn: "Seŋge...",
    creatingAccount: "Loowde kontuure...",
    emailRequired: "Sab email maa",
    passwordRequired: "Sab seŋ suruguɗe maa",
    passwordMinLength: "Seŋ suruguɗe haa'i 6 hade to",
    nameRequired: "Sab innde maa",
    invalidEmail: "Email maa ngeɗa dow",
    signInError: "Seŋ lolaaɗa.",
    registerError: "Loowde lolaaɗa.",
    loginSuccess: "Aadi! Wardere...",
    registerSuccess: "Kontuure loowde! Wardere...",
    sessionPersists: "Wallata seŋ se kadi wa'e",
    biometricComingSoon: "Seŋ fingerprint mawɗaa",
  },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loading: authLoading } = useAuth();
  const [lang, setLang] = useState<LangCode>("en");
  const isRtl = lang === "ar";
  const t = (key: string): string => AUTH_STRINGS[lang]?.[key] || key;

  useEffect(() => {
    const stored = localStorage.getItem("Bambeh_language");
    if (stored) setLang((stored as any) || "en");
    const handleLangChange = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail?.language) setLang(ce.detail.language);
    };
    window.addEventListener("bambeh:langchange", handleLangChange);
    return () => window.removeEventListener("bambeh:langchange", handleLangChange);
  }, []);

  const [mode, setMode] = useState<Mode>("signin");
  const [formData, setFormData] = useState({ email: "", password: "", name: "", phone: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
    setFormData({ email: "", password: "", name: "", phone: "", rememberMe: false });
    setShowPassword(false);
  };

  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.email.trim()) { setError(t("emailRequired")); return; }
    if (!isValidEmail(formData.email)) { setError(t("invalidEmail")); return; }
    if (!formData.password) { setError(t("passwordRequired")); return; }
    setLoading(true);
    try {
      const { error: loginError } = await login(formData.email.trim(), formData.password);
      if (!loginError) {
        setSuccess(t("loginSuccess"));
        if (formData.rememberMe) localStorage.setItem("Bambeh_rememberMe", "true");
        setTimeout(() => navigate("/", { replace: true }), 1500);
      } else {
        setError(`${t("signInError")} ${loginError}`);
      }
    } catch (err) {
      setError(`${t("signInError")} ${err instanceof Error ? err.message : ""}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.email.trim()) { setError(t("emailRequired")); return; }
    if (!isValidEmail(formData.email)) { setError(t("invalidEmail")); return; }
    if (!formData.password) { setError(t("passwordRequired")); return; }
    if (formData.password.length < 6) { setError(t("passwordMinLength")); return; }
    if (!formData.name.trim()) { setError(t("nameRequired")); return; }
    setLoading(true);
    try {
      const { error: registerError } = await register(formData.email.trim(), formData.password, formData.name.trim());
      if (!registerError) {
        setSuccess(t("registerSuccess"));
        setTimeout(() => navigate("/", { replace: true }), 1500);
      } else {
        setError(`${t("registerError")} ${registerError}`);
      }
    } catch (err) {
      setError(`${t("registerError")} ${err instanceof Error ? err.message : ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 px-4 py-6 ${isRtl ? "rtl" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("welcome")}</h1>
          <p className="text-gray-600">{mode === "signin" ? t("signInToYourAccount") : t("createAccountButton")}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex gap-1 bg-gray-100 p-1 m-4 rounded-xl">
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => switchMode(m)} className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${mode === m ? "bg-white text-teal-600 shadow-sm" : "text-gray-600"}`}>
                {m === "signin" ? t("signInTab") : t("signUpTab")}
              </button>
            ))}
          </div>

          <div className="px-8 py-6">
            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(""); }} placeholder="you@example.com" disabled={loading || authLoading} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(""); }} placeholder="••••••••" disabled={loading || authLoading} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading || authLoading} className="absolute right-3 top-3 text-gray-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.rememberMe} onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })} disabled={loading || authLoading} className="w-4 h-4 accent-teal-600 rounded" />
                    <span className="text-sm text-gray-700">{t("rememberMe")}</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700">{t("forgotPassword")}</Link>
                </div>
                {error && <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4"><AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div>}
                {success && <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-green-700">{success}</p></div>}
                <button type="submit" disabled={loading || authLoading} className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {loading || authLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />{t("signingIn")}</>) : (<><LogIn className="w-5 h-5" />{t("signInButton")}</>)}
                </button>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("fullName")} *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setError(""); }} placeholder="John Doe" disabled={loading || authLoading} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("email")} *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(""); }} placeholder="you@example.com" disabled={loading || authLoading} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("phoneNumber")}</label>
                  <AfricanPhoneInput value={formData.phone} onChange={(fullNumber) => setFormData({ ...formData, phone: fullNumber })} label="" />
                  <p className="mt-1 text-xs text-gray-500">Format: +237 6XX XXX XXX (Cameroon default)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("password")} *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(""); }} placeholder="At least 6 characters" disabled={loading || authLoading} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading || authLoading} className="absolute right-3 top-3 text-gray-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {error && <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4"><AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div>}
                {success && <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-green-700">{success}</p></div>}
                <button type="submit" disabled={loading || authLoading} className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {loading || authLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />{t("creatingAccount")}</>) : (<><ArrowRight className="w-5 h-5" />{t("createAccountButton")}</>)}
                </button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              {mode === "signin" ? (<>{t("dontHaveAccount")} <button onClick={() => switchMode("signup")} className="font-semibold text-teal-600 hover:text-teal-700">{t("signUpTab")}</button></>) : (<>{t("alreadyHaveAccount")} <button onClick={() => switchMode("signin")} className="font-semibold text-teal-600 hover:text-teal-700">{t("signInTab")}</button></>)}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4 text-center text-sm text-teal-700">
          <p>{t("sessionPersists")}</p>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">{t("biometricComingSoon")}</div>
      </div>
    </div>
  );
}
