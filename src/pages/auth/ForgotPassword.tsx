import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Bambeh" className="mx-auto h-20 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Forgot password</h1>
          <p className="mt-2 text-sm text-gray-600">We’ll send a secure reset link or OTP to your registered email.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {!sent ? (
            <form className="space-y-5" onSubmit={submit}>
              <div>
                <label htmlFor="fpEmail" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  id="fpEmail"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
                />
              </div>
              <button className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-3 font-semibold disabled:bg-gray-300" disabled={!email || loading}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-sm text-teal-800">
              If this email exists, a reset link has been sent.
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Back to{" "}
            <Link to="/auth/login" className="text-teal-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
