import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Fingerprint } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);
  const passwordValid = password.length >= 8;
  const match = password === confirm;
  const canSubmit = fullName.trim() && emailValid && phone.trim() && passwordValid && match && accepted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      navigate("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Bambeh" className="mx-auto h-20 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">Join Bambeh and start buying, selling, and browsing with confidence.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="fullName">Full name</label>
              <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="regEmail">Email address</label>
              <input id="regEmail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="phone">Phone number</label>
              <input id="phone" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="regPass">Password</label>
                <input id="regPass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="confirm">Confirm password</label>
                <input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input id="accepted" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              <label htmlFor="accepted" className="text-sm text-gray-600">
                I agree to the Terms of Service and Privacy Policy.
              </label>
            </div>

            <button disabled={!canSubmit || loading} className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white py-3 font-semibold transition-colors">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4 flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5" />
            <p className="text-sm text-teal-800">
              After signup, we can prompt the user to register a passkey for biometric sign-in.
            </p>
          </div>

          <button className="mt-4 w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 py-3 font-semibold text-gray-800 flex items-center justify-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Register passkey later
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-teal-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}