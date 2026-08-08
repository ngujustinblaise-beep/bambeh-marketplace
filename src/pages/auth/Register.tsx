// BAMBEH_DEPLOY_TOKEN__REGISTER_FIX70_CLEAN
// DEPLOY TO THE ROUTED PATH: src/pages/auth/Register.tsx  (App.tsx imports @/pages/auth/Register)
// Fixes signup: this actually calls register() from useAuth (the old routed copy
// skipped it and jumped to biometric setup, so no account was ever created).
// Also: no always-on "account created" box; surfaces real errors; language hook
// from @/App (the provider that actually wraps the app). Auto-logs-in on success.
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X as XIcon, ArrowRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/App";

import { authIdentity, normalisePhone } from "@/utils/phoneAuth";
import { supabase } from "@/lib/supabase";

/* FIX284: password visibility and strength. A person who cannot see what
   they typed cannot fix it, and a person who is told only "invalid" learns
   nothing. Both problems end here. */
function bambehPwLang(): string {
  try {
    const r = String(localStorage.getItem("Bambeh_language") || "").toLowerCase();
    if (r.startsWith("fr")) return "fr";
    if (r.startsWith("ar")) return "ar";
    if (r.startsWith("ff") || r.startsWith("ful")) return "ff";
    if (r.startsWith("pcm") || r.startsWith("pid")) return "pcm";
  } catch { /* storage blocked */ }
  return "en";
}

const PW_TEXT: Record<string, Record<string, string>> = {
  lv0: { en: "Very weak", fr: "Tr\u00E8s faible", pcm: "Weak well well", ar: "\u0636\u0639\u064A\u0641\u0629 \u062C\u062F\u0627\u064B", ff: "Lo\u0253\u0257i sanne" },
  lv1: { en: "Weak", fr: "Faible", pcm: "Weak", ar: "\u0636\u0639\u064A\u0641\u0629", ff: "Lo\u0253\u0257i" },
  lv2: { en: "Fair", fr: "Moyen", pcm: "Fair", ar: "\u0645\u062A\u0648\u0633\u0637\u0629", ff: "Hakkunde" },
  lv3: { en: "Strong", fr: "Fort", pcm: "Strong", ar: "\u0642\u0648\u064A\u0629", ff: "Sembi\u0257i" },
  lv4: { en: "Very strong", fr: "Tr\u00E8s fort", pcm: "Strong well well", ar: "\u0642\u0648\u064A\u0629 \u062C\u062F\u0627\u064B", ff: "Sembi\u0257i sanne" },
  add8: { en: "Use at least 8 characters", fr: "Utilisez au moins 8 caract\u00E8res", pcm: "Make e reach 8 characters", ar: "\u0627\u0633\u062A\u062E\u062F\u0645 8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644", ff: "Wa\u0257 alkulal 8 walla \u0253urde" },
  addNum: { en: "Add a number", fr: "Ajoutez un chiffre", pcm: "Put number inside", ar: "\u0623\u0636\u0641 \u0631\u0642\u0645\u0627\u064B", ff: "\u0181eydu limngal" },
  addCap: { en: "Add a capital letter", fr: "Ajoutez une majuscule", pcm: "Put capital letter", ar: "\u0623\u0636\u0641 \u062D\u0631\u0641\u0627\u064B \u0643\u0628\u064A\u0631\u0627\u064B", ff: "\u0181eydu alkulal mawngal" },
  addSym: { en: "Add a symbol like ! or #", fr: "Ajoutez un symbole comme ! ou #", pcm: "Put symbol like ! or #", ar: "\u0623\u0636\u0641 \u0631\u0645\u0632\u0627\u064B \u0645\u062B\u0644 ! \u0623\u0648 #", ff: "\u0181eydu maande wano ! walla #" },
  match: { en: "Passwords match", fr: "Les mots de passe correspondent", pcm: "The passwords match", ar: "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u0627\u0646", ff: "Mo\u0263\u0263e \u0257ee ina ndoo\u0257i" },
  noMatch: { en: "Passwords do not match", fr: "Les mots de passe ne correspondent pas", pcm: "The passwords no match", ar: "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u064A\u0646", ff: "Mo\u0263\u0263e \u0257ee ndoo\u0257aani" },
};

function pwT(key: string): string {
  const row = PW_TEXT[key];
  return row ? (row[bambehPwLang()] || row.en) : "";
}

function pwScore(pw: string): number {
  if (!pw) return -1;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length < 8) s = Math.min(s, 1);   // short is never strong
  return Math.min(s, 4);
}

function pwAdvice(pw: string): string {
  if (!pw) return "";
  if (pw.length < 8) return pwT("add8");
  if (!/[0-9]/.test(pw)) return pwT("addNum");
  if (!(/[a-z]/.test(pw) && /[A-Z]/.test(pw))) return pwT("addCap");
  if (!/[^A-Za-z0-9]/.test(pw)) return pwT("addSym");
  return "";
}

const PW_BAR = ["bg-red-500","bg-orange-500","bg-amber-400","bg-green-500","bg-blue-600"];
const PW_TXT = ["text-red-600","text-orange-600","text-amber-600","text-green-600","text-blue-700"];
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

/* FIX281 - name the EXACT problem, in the user's own language.
 * The old code only ever said "fill all fields correctly", and only
 * after a submit that a disabled button would never allow. */
const SIGNUP_PROBLEM: Record<string, Record<string, string>> = {
  name: {
    en: "Please enter your full name.",
    fr: "Veuillez saisir votre nom complet.",
    pidgin: "Abeg put your full name.",
    ar: "\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0627\u0633\u0645\u0643 \u0627\u0644\u0643\u0627\u0645\u0644.",
    ff: "Tii\u0257no winndu innde maa timmunde.",
  },
  email: {
    en: "That email address does not look right. You can also leave it empty.",
    fr: "Cette adresse e-mail semble incorrecte. Vous pouvez aussi la laisser vide.",
    pidgin: "This email no correct. You fit leave am empty too.",
    ar: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u063a\u064a\u0631 \u0635\u062d\u064a\u062d. \u064a\u0645\u0643\u0646\u0643 \u062a\u0631\u0643\u0647 \u0641\u0627\u0631\u063a\u0627\u064b.",
    ff: "Ndee adres e-mail wonaa feewnde. A waawi accitde \u0257um meere.",
  },
  phone: {
    en: "Please enter your phone number.",
    fr: "Veuillez saisir votre num\u00e9ro de t\u00e9l\u00e9phone.",
    pidgin: "Abeg put your phone number.",
    ar: "\u0627\u0644\u0631\u062c\u0627\u0621 \u0625\u062f\u062e\u0627\u0644 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643.",
    ff: "Tii\u0257no winndu limpol maa.",
  },
  password: {
    en: "Your password must be at least 8 characters.",
    fr: "Votre mot de passe doit contenir au moins 8 caracteres.",
    pidgin: "Your password must reach 8 letters.",
    ar: "\u064a\u062c\u0628 \u0623\u0646 \u062a\u062a\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0646 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
    ff: "Mo\u01b4\u01b4e maa foti heewde alkulal 8.",
  },
  match: {
    en: "The two passwords are not the same.",
    fr: "Les deux mots de passe ne sont pas identiques.",
    pidgin: "The two passwords no be the same.",
    ar: "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646.",
    ff: "Mo\u01b4\u01b4e \u0257i\u0257i \u0257ee ndoowaani.",
  },
  terms: {
    en: "Please accept the terms before continuing.",
    fr: "Veuillez accepter les conditions avant de continuer.",
    pidgin: "Abeg accept the terms before you continue.",
    ar: "\u0627\u0644\u0631\u062c\u0627\u0621 \u0642\u0628\u0648\u0644 \u0627\u0644\u0634\u0631\u0648\u0637 \u0642\u0628\u0644 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629.",
    ff: "Tii\u0257no ja\u0253 sar\u0257iiji \u0257ii ado jokkude.",
  },
};

function signupProblem(key: string, lang: string): string {
  const row = SIGNUP_PROBLEM[key];
  if (!row) return "";
  return row[lang] || row.en;
}

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
  const [showPw, setShowPw] = useState(false);      // FIX284
  const [showPw2, setShowPw2] = useState(false);    // FIX284

  const emailValid = useMemo(() => email.trim() === "" || /^\S+@\S+\.\S+$/.test(email), [email]); // FIX283: email is optional now
  const phoneValid = useMemo(() => phone.trim().length >= 7, [phone]);
  const passwordValid = useMemo(() => password.length >= 8, [password]);
  const passwordsMatch = password === confirmPassword;

  const canSubmit =
    fullName.trim().length > 1 && emailValid && phoneValid && passwordValid && passwordsMatch && accepted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // FIX301: check in the order a person fills the form, and stop at the
    // FIRST thing that is wrong. One clear sentence beats a generic one.
    const lang = String(language || "en");
    let problem = "";
    if (fullName.trim().length < 2)   problem = signupProblem("name", lang);
    else if (!emailValid)             problem = signupProblem("email", lang);
    else if (!phoneValid)             problem = signupProblem("phone", lang);
    else if (!passwordValid)          problem = signupProblem("password", lang);
    else if (!passwordsMatch)         problem = signupProblem("match", lang);
    else if (!accepted)               problem = signupProblem("terms", lang);

    if (problem) {
      setError(problem);
      // On a phone the error box sits above the fold. Take them to it.
      window.setTimeout(() => {
        document.getElementById("signup-error")?.scrollIntoView({
          behavior: "smooth", block: "center",
        });
      }, 50);
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
                <div className="relative">
                  <input id="password" type={showPw ? "text" : "password"} autoComplete="new-password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-0 top-1 flex h-12 w-12 items-center justify-center text-gray-400 hover:text-gray-700">
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[0,1,2,3,4].map((i) => (
                        <div key={i} className={"h-1.5 flex-1 rounded-full transition-colors " + (i <= pwScore(password) ? PW_BAR[pwScore(password)] : "bg-gray-200")} />
                      ))}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className={"text-xs font-semibold " + PW_TXT[pwScore(password)]}>{pwT("lv" + pwScore(password))}</span>
                      {pwAdvice(password) && <span className="text-xs text-gray-500">{pwAdvice(password)}</span>}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{t.confirmPassword}</label>
                <div className="relative">
                  <input id="confirmPassword" type={showPw2 ? "text" : "password"} autoComplete="new-password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200" />
                  <button type="button" onClick={() => setShowPw2(v => !v)}
                    aria-label={showPw2 ? "Hide password" : "Show password"}
                    className="absolute right-0 top-1 flex h-12 w-12 items-center justify-center text-gray-400 hover:text-gray-700">
                    {showPw2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p className={"mt-1.5 flex items-center gap-1 text-xs font-medium " + (password === confirmPassword ? "text-green-600" : "text-red-600")}>
                    {password === confirmPassword ? <Check className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                    {password === confirmPassword ? pwT("match") : pwT("noMatch")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input id="accepted" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              <label htmlFor="accepted" className="text-sm text-gray-600">{t.terms}</label>
            </div>

            {error && (
              <div id="signup-error" role="alert" aria-live="assertive"
                className="flex items-start gap-2 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* FIX301: only greys while SENDING. canSubmit now dims it as a
                hint instead of blocking it, so pressing always explains. */}
            <button type="submit" disabled={loading}
              className={
                "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-colors disabled:bg-gray-300 " +
                (canSubmit ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-600/70 hover:bg-teal-600")
              }>
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
