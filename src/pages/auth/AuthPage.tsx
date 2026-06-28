import { Link } from "react-router-dom";
import { ShieldCheck, Fingerprint, LifeBuoy } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const translations = {
  en: {
    heading: "Sign in faster, safer, and with biometric convenience.",
    features: {
      strong: "Strong protection",
      biometric: "Biometric ready",
      recovery: "Recovery",
    },
    buttons: {
      signIn: "Sign in",
      create: "Create account",
      forgotPassword: "Forgot password",
      forgotCredentials: "Forgot credentials",
    },
    tooltips: {
      strong: "Lockouts, recovery, secure sessions.",
      biometric: "Passkeys on supported devices.",
      recovery: "Forgot password and credential help.",
    },
    copyright: "© Bambeh Marketplace",
  },
  fr: {
    heading: "Connectez-vous plus vite, plus sûr et avec la biométrie.",
    features: {
      strong: "Protection renforcée",
      biometric: "Prêt pour la biométrie",
      recovery: "Récupération",
    },
    buttons: {
      signIn: "Se connecter",
      create: "Créer un compte",
      forgotPassword: "Mot de passe oublié",
      forgotCredentials: "Identifiants oubliés",
    },
    tooltips: {
      strong: "Verrouillage, récupération, sessions sécurisées.",
      biometric: "Clés d’accès sur appareils compatibles.",
      recovery: "Aide pour mot de passe et identifiants.",
    },
    copyright: "© Bambeh Marketplace",
  },
  ar: {
    heading: "سجّل الدخول بسرعة وأمان وبراحة البصمة.",
    features: {
      strong: "حماية قوية",
      biometric: "جاهز للقياسات الحيوية",
      recovery: "الاستعادة",
    },
    buttons: {
      signIn: "تسجيل الدخول",
      create: "إنشاء حساب",
      forgotPassword: "نسيت كلمة المرور",
      forgotCredentials: "نسيت بيانات الدخول",
    },
    tooltips: {
      strong: "قفل، استعادة، وجلسات آمنة.",
      biometric: "مفاتيح مرور على الأجهزة المدعومة.",
      recovery: "مساعدة كلمة المرور وبيانات الدخول.",
    },
    copyright: "© Bambeh Marketplace",
  },
  ff: {
    heading: "Seŋto hakkunde jaŋde, e mettii, e suɓaare biometrik.",
    features: {
      strong: "Kawrugol forto",
      biometric: "Haɓɓii biometrik",
      recovery: "Teddinde",
    },
    buttons: {
      signIn: "Seŋto",
      create: "Sos hakat",
      forgotPassword: "Mi jokkii leñol",
      forgotCredentials: "Mi jokkii ɗum",
    },
    tooltips: {
      strong: "Rewɓe, teddinde, e seŋtorde ɗere.",
      biometric: "Passkeys e njiyteeɗi cuɓoraaɗi.",
      recovery: "Ndaarol leñol e heɓugol ɗum.",
    },
    copyright: "© Bambeh Marketplace",
  },
  pidgin: {
    heading: "Sign in fast, safe, and with biometric ease.",
    features: {
      strong: "Strong protection",
      biometric: "Biometric ready",
      recovery: "Recovery",
    },
    buttons: {
      signIn: "Sign in",
      create: "Create account",
      forgotPassword: "Forget password",
      forgotCredentials: "Forget details",
    },
    tooltips: {
      strong: "Lock, recovery, secure sessions.",
      biometric: "Passkeys for supported devices.",
      recovery: "Help for password and account details.",
    },
    copyright: "© Bambeh Marketplace",
  },
};

export default function AuthPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  return (
    <main dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-teal-100 p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src="/logo.png"
                alt="Bambeh logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Bambeh</h1>
              <p className="text-sm text-gray-500">Marketplace authentication</p>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {t.heading}
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              title={t.tooltips.strong}
              aria-label={t.features.strong}
              className="group inline-flex items-center justify-center h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 text-teal-600 hover:bg-gray-100 transition-colors"
            >
              <ShieldCheck className="h-5 w-5" />
            </button>

            <button
              type="button"
              title={t.tooltips.biometric}
              aria-label={t.features.biometric}
              className="group inline-flex items-center justify-center h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 text-teal-600 hover:bg-gray-100 transition-colors"
            >
              <Fingerprint className="h-5 w-5" />
            </button>

            <button
              type="button"
              title={t.tooltips.recovery}
              aria-label={t.features.recovery}
              className="group inline-flex items-center justify-center h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 text-teal-600 hover:bg-gray-100 transition-colors"
            >
              <LifeBuoy className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              to="/auth/login"
              className="block text-center rounded-xl bg-teal-500 hover:bg-teal-600 px-5 py-3 font-semibold transition-colors text-white"
            >
              {t.buttons.signIn}
            </Link>

            <Link
              to="/auth/register"
              className="block text-center rounded-xl bg-white/10 hover:bg-white/15 px-5 py-3 font-semibold transition-colors border border-white/10 text-gray-900"
            >
              {t.buttons.create}
            </Link>

            <div className="flex gap-3">
              <Link
                to="/auth/forgot-password"
                className="flex-1 text-center rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2 font-semibold transition-colors border border-white/10 text-gray-900"
              >
                {t.buttons.forgotPassword}
              </Link>
              <Link
                to="/auth/forgot-credentials"
                className="flex-1 text-center rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2 font-semibold transition-colors border border-white/10 text-gray-900"
              >
                {t.buttons.forgotCredentials}
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-6 text-center text-sm text-gray-500">
          {t.copyright}
        </footer>
      </div>
    </main>
  );
}