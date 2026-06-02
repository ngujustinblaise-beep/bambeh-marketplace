/**
 * src/pages/SubscriptionPlans.tsx — Bambeh Marketplace
 *
 * SECURITY FIX:
 *  ✅ Removed handleManualUnlock — this was a bypass loophole allowing
 *     anyone to activate a subscription without paying
 *  ✅ Error block no longer shows "I paid - Unlock Now" buttons
 *  ✅ "failed to fetch" error now shows a proper user-friendly message
 *     with a retry button and support contact link instead of the bypass
 *  ✅ Payment server sleep on free tier handled: retry button + clear message
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, Crown, Star, Zap, ArrowLeft,
  Loader2, Phone, CheckCircle, AlertCircle, RefreshCw
} from "lucide-react";
import {
  fetchPlans,
  initiateSubscription,
  activateSubscription,
  useSubscription,
  Plan,
} from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  daily:   <Star  className="h-7 w-7 text-white" />,
  weekly:  <Zap   className="h-7 w-7 text-white" />,
  monthly: <Crown className="h-7 w-7 text-white" />,
};
const PLAN_COLORS: Record<string, string> = {
  daily:   "from-amber-500 to-amber-700",
  weekly:  "from-teal-500 to-blue-600",
  monthly: "from-purple-600 to-indigo-700",
};

// ── Friendly error messages ───────────────────────────────────────────────────
function friendlyError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("fetch")) {
    return "Our payment server is starting up (this can take 30–60 seconds on the first request). Please tap Retry in a moment.";
  }
  if (msg.includes("insufficient")) {
    return "Insufficient funds. Please top up your mobile money account and try again.";
  }
  if (msg.includes("timeout")) {
    return "The request timed out. Please check your internet connection and try again.";
  }
  return raw || "Payment could not be processed. Please try again.";
}

const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const userId    = (user as any)?.id || (user as any)?.uid || (user as any)?.sub || (user as any)?.user_id || null;

  const { isActive, planType } = useSubscription(userId);

  const [plans,          setPlans]          = useState<Plan[]>([]);
  const [loadingPlans,   setLoadingPlans]   = useState(true);
  const [phone,          setPhone]          = useState("");
  const [phoneError,     setPhoneError]     = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [success,        setSuccess]        = useState(false);
  const [retrying,       setRetrying]       = useState(false);

  function loadPlans() {
    setLoadingPlans(true);
    setError(null);
    fetchPlans()
      .then(setPlans)
      .catch(() => setError("Could not load plans. Check your internet and tap Retry."))
      .finally(() => setLoadingPlans(false));
  }

  useEffect(() => { loadPlans(); }, []);

  function validPhone(v: string): boolean {
    const c = v.replace(/\s/g, "");
    return /^(237)?6[2-9]\d{7}$/.test(c);
  }

  async function handleSubscribe(planId: string) {
    if (!user) { navigate("/login"); return; }
    if (!phone.trim()) { setPhoneError("Enter your phone number above first."); return; }
    if (!validPhone(phone)) { setPhoneError("Enter a valid Cameroonian number e.g. 237650000000 or 650000000"); return; }

    setProcessingPlan(planId);
    setError(null);

    try {
      await initiateSubscription(
        userId!,
        planId,
        phone.trim(),
        (user as any).email || "",
        (user as any).name  || "Bambeh User"
      );
      // Only activate AFTER the payment server confirms success
      activateSubscription(planId);
      setSuccess(true);
      setTimeout(() => navigate("/marketplace"), 2500);
    } catch (err: any) {
      setError(friendlyError(err?.message || ""));
    } finally {
      setProcessingPlan(null);
    }
  }

  async function handleRetry() {
    setRetrying(true);
    setError(null);
    // Give the server 3 seconds to wake up, then reload plans
    await new Promise(r => setTimeout(r, 3000));
    loadPlans();
    setRetrying(false);
  }

  // ── Already subscribed ──────────────────────────────────────────────────
  if (isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Already Subscribed</h2>
          <p className="text-gray-600 mb-4">Your {planType} plan is active.</p>
          <button onClick={() => navigate("/marketplace")}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700">
            Go to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">Access Unlocked! 🎉</h2>
          <p className="text-gray-600">Your subscription is active. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 opacity-80 hover:opacity-100">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <h1 className="text-2xl font-bold">Subscribe to Bambeh</h1>
        <p className="text-sm opacity-80 mt-1">
          Pay with MTN MoMo or Orange Money. Access unlocks immediately after payment is confirmed.
        </p>
      </div>

      <div className="p-4 max-w-lg mx-auto">

        {/* Phone input */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="inline h-4 w-4 mr-1" /> Your MTN or Orange Money number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value); setPhoneError(null); }}
            placeholder="e.g. 670000000 or 237670000000"
            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          <p className="text-xs text-gray-400 mt-1">
            A payment prompt will be sent to this number. Approve it on your phone to pay.
          </p>
        </div>

        {/* Error block — NO bypass buttons */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">Payment Error</p>
                <p className="text-red-600 text-sm mt-0.5">{error}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleRetry} disabled={retrying}
                    className="flex items-center gap-1.5 text-sm bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50">
                    {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {retrying ? "Waking up server…" : "Retry"}
                  </button>
                  <a href="mailto:support@bambeh.com"
                    className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
                    Contact Support
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  If payment was deducted from your account but access wasn't granted, email{" "}
                  <a href="mailto:support@bambeh.com" className="underline text-teal-600">support@bambeh.com</a>{" "}
                  with your reference number. We will verify and activate manually within 1 hour.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        {loadingPlans ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading plans…</p>
          </div>
        ) : plans.length === 0 && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No plans loaded. Please check your connection.</p>
            <button onClick={loadPlans} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold">
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className={`bg-gradient-to-r ${PLAN_COLORS[plan.id] || "from-gray-500 to-gray-700"} p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    {PLAN_ICONS[plan.id] || <Star className="h-7 w-7 text-white" />}
                    <div>
                      <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                      <p className="text-white opacity-75 text-sm">{plan.duration}</p>
                    </div>
                  </div>
                  <div className="text-white text-right">
                    <span className="text-2xl font-bold">{plan.price.toLocaleString()}</span>
                    <span className="text-sm ml-1">XAF</span>
                  </div>
                </div>
                <div className="p-4">
                  <ul className="space-y-1 mb-4">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!processingPlan}
                    className={`w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${PLAN_COLORS[plan.id] || "from-gray-500 to-gray-700"} hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    {processingPlan === plan.id ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      `Subscribe — ${plan.price.toLocaleString()} XAF`
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          Secured by CamPay · BAMBEH SARL · support@bambeh.com
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
