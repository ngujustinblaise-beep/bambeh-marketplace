import { Link } from "react-router-dom";
import { ShieldCheck, Fingerprint, LockKeyhole, Sparkles } from "lucide-react";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <section className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-teal-100 p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg overflow-hidden">
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
              <h1 className="text-3xl font-extrabold text-gray-900">Bambeh</h1>
              <p className="text-sm text-gray-500">Marketplace authentication</p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Sign in faster, safer, and with biometric convenience.
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Access your account with password, passkey, or device biometrics.
            Bambeh is built for modern security, smooth recovery, and a premium
            user experience.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {[
              { icon: ShieldCheck, title: "Strong protection", text: "Lockout, recovery, and secure session handling." },
              { icon: Fingerprint, title: "Biometric ready", text: "Passkeys for supported devices and browsers." },
              { icon: LockKeyhole, title: "Recovery flow", text: "Forgot password and credential recovery paths." },
              { icon: Sparkles, title: "Clean UX", text: "Simple, fast, and polished sign-in and sign-up screens." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <Icon className="h-5 w-5 text-teal-600" />
                <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-900 text-white rounded-3xl shadow-2xl p-8 sm:p-10">
          <h2 className="text-2xl font-bold">Choose your path</h2>
          <p className="mt-3 text-gray-300">
            Start by signing in or creating your account. You can recover access
            anytime using the support flows.
          </p>

          <div className="mt-8 space-y-4">
            <Link
              to="/auth/login"
              className="block text-center rounded-xl bg-teal-500 hover:bg-teal-600 px-5 py-4 font-semibold transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/auth/register"
              className="block text-center rounded-xl bg-white/10 hover:bg-white/15 px-5 py-4 font-semibold transition-colors border border-white/10"
            >
              Create account
            </Link>
            <Link
              to="/auth/forgot-password"
              className="block text-center rounded-xl bg-white/5 hover:bg-white/10 px-5 py-4 font-semibold transition-colors border border-white/10"
            >
              Forgot password
            </Link>
            <Link
              to="/auth/forgot-credentials"
              className="block text-center rounded-xl bg-white/5 hover:bg-white/10 px-5 py-4 font-semibold transition-colors border border-white/10"
            >
              Forgot credentials
            </Link>
          </div>

          <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-gray-300">
            Passkeys and biometric login require backend WebAuthn support.
          </div>
        </section>
      </div>
    </main>
  );
}
