/**
 * src/pages/SecurityRecovery.tsx
 * Bambeh Marketplace - functional account recovery flow.
 *
 * Two states, auto-detected:
 *  1) "request" - user enters their email; we send a Supabase recovery link.
 *  2) "reset"   - user arrived from that link (recovery session); they set a
 *                 new password via supabase.auth.updateUser().
 *
 * Self-contained: uses the existing @/lib/supabase client. English copy for now
 * (can be wired to translations once the key system is consolidated).
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Mail, KeyRound, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Mode = "request" | "reset";
type Msg = { type: "ok" | "err"; text: string } | null;

export default function SecurityRecovery() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  // Detect arrival from a recovery email (Supabase puts type=recovery in the URL hash).
  useEffect(() => {
    const hash = window.location.hash || "";
    if (hash.includes("type=recovery") || hash.includes("access_token")) setMode("reset");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const sendResetLink = async () => {
    if (!email.trim()) {
      setMsg({ type: "err", text: "Please enter your email address." });
      return;
    }
    setBusy(true);
    setMsg(null);
    const redirectTo = `${window.location.origin}/#/security-recovery`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setBusy(false);
    setMsg(
      error
        ? { type: "err", text: error.message }
        : { type: "ok", text: "If an account exists for that email, a recovery link is on its way. Check your inbox (and spam)." }
    );
  };

  const updatePassword = async () => {
    if (password.length < 8) {
      setMsg({ type: "err", text: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setMsg({ type: "err", text: "The two passwords do not match." });
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMsg({ type: "err", text: error.message });
      return;
    }
    setMsg({ type: "ok", text: "Password updated successfully. Redirecting to sign in..." });
    setTimeout(() => navigate("/login"), 1600);
  };

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none " +
    "focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/login")}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600"
        >
          <ArrowLeft size={16} /> Back to sign in
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-7">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center">
              <ShieldCheck className="text-white" size={28} />
            </div>
          </div>

          <h1 className="text-center text-xl font-bold text-gray-800">
            {mode === "request" ? "Account Recovery" : "Set a New Password"}
          </h1>
          <p className="text-center text-sm text-gray-500 mt-1 mb-6">
            {mode === "request"
              ? "Enter your email and we'll send you a secure link to recover your account."
              : "Choose a strong new password for your Bambeh account."}
          </p>

          {msg && (
            <div
              className={`mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {msg.type === "ok" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          {mode === "request" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls + " pl-10"}
                    onKeyDown={(e) => e.key === "Enter" && sendResetLink()}
                  />
                </div>
              </div>
              <button
                onClick={sendResetLink}
                disabled={busy}
                className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                {busy ? "Sending..." : "Send recovery link"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={inputCls + " pl-10"}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    className={inputCls + " pl-10"}
                    onKeyDown={(e) => e.key === "Enter" && updatePassword()}
                  />
                </div>
              </div>
              <button
                onClick={updatePassword}
                disabled={busy}
                className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                {busy ? "Updating..." : "Update password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




