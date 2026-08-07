// BAMBEH_DEPLOY_TOKEN__REGISTER_FIX70_CLEAN
// DEPLOY TO THE ROUTED PATH: src/pages/auth/Register.tsx  (App.tsx imports @/pages/auth/Register)
// Fixes signup: this actually calls register() from useAuth (the old routed copy
// skipped it and jumped to biometric setup, so no account was ever created).
// Also: no always-on "account created" box; surfaces real errors; language hook
// from @/App (the provider that actually wraps the app). Auto-logs-in on success.
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/App";

import { authIdentity, normalisePhone } from "@/utils/phoneAuth";
import { supabase } from "@/lib/supabase";
const STRINGS = {
  en: {
    title: "Create your account", subtitle: "Join Bambeh and get started.",
    fullName: "Full name", email: "Email address", phone: "Phone number",
    password: "Password", confirmPassword: "Confirm password",
    createAccount: "Create account", creatingAccount: "Creating account...",
    haveAccount: "Already have an account?", signIn: "Sign in",
    invalid: "Please fill all fields correctly.", passwordsNoMatch: "Passwords do not match.",
    terms: "I agree to the Terms of Service and Privacy Policy.", logoAlt: "Bambeh logo",
    failed: "Account creation failed. Please try again.",
  },
  fr: {
    title: "Créer votre compte", subtitle: "Rejoignez Bambeh et commencez.",
    fullName: "Nom complet", email: "Adresse e-mail", phone: "Numéro de téléphone",
    password: "Mot de passe", confirmPassword: "Confirmer le mot de passe",
    createAccount: "Créer un compte", creatingAccount: "Création du compte...",
    haveAccount: "Vous avez déjà un compte ?", signIn: "Se connecter",
    invalid: "Veuillez remplir correctement tous les champs.", passwordsNoMatch: "Les mots de passe ne correspondent pas.",
    terms: "J'accepte les conditions d'utilisation et la politique de confidentialité.", logoAlt: "Logo Bambeh",
    failed: "La création du compte a échoué. Veuillez réessayer.",
  },
  ar: {
    title: "إنشاء حسابك", subtitle: "انضم إلى Bambeh وابدأ الآن.",
    fullName: "الاسم الكامل", email: "البريد الإلكتروني", phone: "رقم الهاتف",
    password: "كلمة المرور", confirmPassword: "تأكيد كلمة المرور",
    createAccount: "إنشاء حساب", creatingAccount: "جارٍ إنشاء الحساب...",
    haveAccount: "هل لديك حساب بالفعل؟", signIn: "تسجيل الدخول",
    invalid: "يرجى تعبئة جميع الحقول بشكل صحيح.", passwordsNoMatch: "كلمتا المرور غير متطابقتين.",
    terms: "أوافق على شروط الخدمة وسياسة الخصوصية.", logoAlt: "شعار Bambeh",
    failed: "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
  },
  pidgin: {
    title: "Create your account", subtitle: "Join Bambeh make you start.",
    fullName: "Full name", email: "Email address", phone: "Phone number",
    password: "Password", confirmPassword: "Confirm password",
    createAccount: "Create account", creatingAccount: "Dey create account...",
    haveAccount: "You get account already?", signIn: "Sign in",
    invalid: "Please fill the form well well.", passwordsNoMatch: "Passwords no match.",
    terms: "I agree to the Terms and Privacy Policy.", logoAlt: "Bambeh logo",
    failed: "Account creation no work. Try again.",
  },
  ff: {
    title: "Sos njiya maa", subtitle: "Ɓeŋngo e Bambeh e fuɗɗo.",
    fullName: "Innde e jam", email: "Njiital email", phone: "Noddi telefona",
    password: "Moƴƴere", confirmPassword: "Hollu moƴƴere",
    createAccount: "Sos njiya", creatingAccount: "Ko sosii njiya...",
    haveAccount: "A geɗaa njiya ndee?", signIn: "Seŋo",
    invalid: "Tiiɗno fuɗɗo keɓe ɗee e no ɓeydii.", passwordsNoMatch: "Moƴƴe ɗi ɗooɗaani.",
    terms: "Mi noddi e sarɗiiji golle e siyaasata kaɓɓaare.", logoAlt: "Bambeh logo",
    failed: "Sosgol njiya waawaani. Etto kadi.",
  },
} as const;

export default function Register() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = STRINGS[language as keyof typeof STRINGS] ?? STRINGS.en;
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailValid = useMemo(() => email.trim() === "" || /^\S+@\S+\.\S+$/.test(email), [email]); // FIX283: email is optional now
  const phoneValid = useMemo(() => phone.trim().length >= 7, [phone]);
  const passwordValid = useMemo(() => password.length >= 8, [password]);
  const passwordsMatch = password === confirmPassword;

  const canSubmit =
    fullName.trim().length > 1 && emailValid && phoneValid && passwordValid && passwordsMatch && accepted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !emailValid || !phoneValid || !passwordValid || !passwordsMatch || !accepted) {
      setError(!passwordsMatch ? t.passwordsNoMatch : t.invalid);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (typeof register !== "function") {
        setError(t.failed);
        return;
      }
      const identity = authIdentity(phone);
      if (!identity) { setError(t.invalid); return; }
      // FIX283: the phone IS the account. Supabase only ever sees a
      // generated address; the person types their number and nothing else.
      const result = await register(identity, password, fullName);
      if (result && typeof result === "object" && "error" in result && (result as { error?: unknown }).error) {
        const err = (result as { error?: unknown }).error;
        setError(typeof err === "string" ? err : (err as Error)?.message || t.failed);
        return;
      }
      // FIX283: keep the phone. It was being collected and thrown away,
      // and notifications need somewhere to go.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({
            phone: normalisePhone(phone),
            contact_email: email.trim() ? email.trim().toLowerCase() : null,
          }).eq("id", user.id);
        }
      } catch { /* never block a signup because a profile write failed */ }

      // register() auto-signs-in when email confirmation is off.
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt={t.logoAlt} className="mx-auto h-20 w-auto object-contain mb-4"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{t.subtitle}</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{t.fullName}</label>
              <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.email}</label>
                <input id="email" type="email" autoComplete="email" inputMode="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t.phone}</label>
                <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.password}</label>
                <input id="password" type="password" autoComplete="new-password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{t.confirmPassword}</label>
                <input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input id="accepted" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              <label htmlFor="accepted" className="text-sm text-gray-600">{t.terms}</label>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={!canSubmit || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white transition-colors hover:bg-teal-700 disabled:bg-gray-300">
              {loading ? t.creatingAccount : t.createAccount}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t.haveAccount}{" "}
            <Link to="/login" className="font-semibold text-teal-700 hover:underline">{t.signIn}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
// BAMBEH_END_TOKEN__REGISTER__COMPLETE
