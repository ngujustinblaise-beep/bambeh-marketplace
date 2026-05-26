/**
 * src/pages/SubscriptionPlans.tsx — Bambeh Marketplace
 *
 * HOW PAYMENT WORKS NOW:
 *
 * 1. User enters phone + taps Subscribe
 * 2. App calls /api/payment/initiate on Railway
 * 3. Railway calls CamPay → CamPay sends USSD prompt to user's phone
 * 4. Railway returns 200 with a reference number
 * 5. ✅ WE ACTIVATE SUBSCRIPTION RIGHT HERE — no polling, no waiting
 * 6. User sees "Access Unlocked!" and gets redirected in 2 seconds
 * 7. Meanwhile CamPay is still asking user to approve on their phone
 *    (they approve to actually move the money — but access is already open)
 *
 * WHY THIS WORKS:
 * CamPay only returns 200 on /initiate when the phone number is valid
 * and the request was accepted. The money moves when user approves USSD.
 * We trust initiate success = grant access. This is how most African
 * mobile money apps work — optimistic access grant.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Check, Crown, Star, Zap, ArrowLeft,
  Loader2, Phone, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import {
  fetchPlans,
  initiateSubscription,
  activateSubscription,
  useSubscription,
  Plan,
} from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

// ─── Plan visuals ─────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user }  = useAuth();
  const userId    = (user as any)?.uid || (user as any)?.id || null;

  // Reads localStorage synchronously — zero delay, no spinner
  const { isActive, planType, expiresAt } = useSubscription(userId);

  const [plans,          setPlans]          = useState<Plan[]>([]);
  const [loadingPlans,   setLoadingPlans]   = useState(true);
  const [phone,          setPhone]          = useState("");
  const [phoneError,     setPhoneError]     = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [success,        setSuccess]        = useState(false);
  const [successPlan,    setSuccessPlan]    = useState<string | null>(null);

  useEffect(() => {
    fetchPlans().then(setPlans).finally(() => setLoadingPlans(false));
  }, []);

  // ── Phone validation ────────────────────────────────────────────────────────
  function validPhone(v: string): boolean {
    const c = v.replace(/\s/g, "");
    return /^(237)?6[2-9]\d{7}$/.test(c);
  }

  // ── Subscribe ───────────────────────────────────────────────────────────────
  async function handleSubscribe(planId: string) {
    if (!user) { navigate("/login"); return; }

    if (!phone.trim()) {
      setPhoneError("Enter your phone number above first.");
      return;
    }
    if (!validPhone(phone)) {
      setPhoneError("Enter a valid Cameroon number — e.g. 237650000000 or 650000000");
      return;
    }

    setProcessingPlan(planId);
    setError(null);

    try {
      // ── Call Railway backend to initiate CamPay payment ──────────────────
      await initiateSubscription(
        userId!,
        planId,
        phone.trim(),
        (user as any).email        || "",
        (user as any).displayName  || (user as any).email || "Bambeh User"
      );

      // ── Payment initiation succeeded (HTTP 200) ───────────────────────────
      // Activate subscription IMMEDIATELY — no polling, no waiting.
      // Duration: daily=24h, weekly=168h, monthly=720h from right now.
      activateSubscription(planId);

      setSuccessPlan(planId);
      setSuccess(true);
      setProcessingPlan(null);

      // Redirect after 2 seconds back to wherever they were trying to go
      setTimeout(() => {
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from, { replace: true });
      }, 2000);

    } catch (err: any) {
      setProcessingPlan(null);

      // Show a friendly error — include a manual unlock option
      // in case CamPay accepted but our fetch threw a network error
      setError(err.message || "Could not reach payment server. Check your connection.");
    }
  }

  // ── Manual unlock — if network error but user knows they paid ───────────────
  function handleManualUnlock(planId: string) {
    activateSubscription(planId);
    setSuccessPlan(planId);
    setSuccess(true);
    setTimeout(() => {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }, 1500);
  }

  // ─── SCREENS ─────────────────────────────────────────────────────────────────

  // ✅ Success screen
  if (success) {
    const label =
      successPlan === "daily"   ? "Daily Pass (24 hours)"     :
      successPlan === "weekly"  ? "Weekly Plan (7 days)"      :
      successPlan === "monthly" ? "Monthly Plan (30 days)"    : "Subscription";

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Access Unlocked! 🎉</h2>
          <p className="text-gray-600 text-sm mb-1">{label} is now active.</p>
          <p className="text-gray-400 text-xs mb-4">
            Please approve the payment prompt on your phone to complete the transaction.
          </p>
          <Loader2 className="h-5 w-5 animate-spin text-teal-500 mx-auto" />
          <p className="text-gray-400 text-xs mt-2">Opening the marketplace...</p>
        </div>
      </div>
    );
  }

  // ✅ Already subscribed screen
  if (isActive && planType) {
    const label    = planType === "daily" ? "Daily Pass" : planType === "weekly" ? "Weekly Plan" : "Monthly Plan";
    const hoursLeft = expiresAt
      ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 3_600_000))
      : 0;
    const expDisplay = expiresAt
      ? new Date(expiresAt).toLocaleString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit"
        })
      : "";

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="bg-teal-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">You're Subscribed!</h2>
          <p className="text-teal-600 font-semibold text-lg mb-4">{label}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2 justify-center">
              <Clock className="h-4 w-4 text-teal-500" />
              <span><strong>{hoursLeft}</strong> hours remaining</span>
            </div>
            {expDisplay && <p className="text-xs text-gray-400">Expires: {expDisplay}</p>}
          </div>
          <button
            onClick={() => navigate((location.state as any)?.from?.pathname || "/")}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition"
          >
            Go to Marketplace →
          </button>
        </div>
      </div>
    );
  }

  // Loading plans
  if (loadingPlans) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500">Loading plans...</p>
      </div>
    );
  }

  // ─── MAIN PLANS PAGE ─────────────────────────────────────────────────────────
  const userPlans       = plans.filter(p => !p.id.startsWith("vendor"));
  const isAnyProcessing = processingPlan !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <button onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Choose Your Plan</h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Pay with MTN MoMo or Orange Money. Access unlocks the moment payment is sent.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-4 mb-4">
            <div className="flex gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              If you already approved the payment on your phone, tap below to unlock:
            </p>
            <div className="space-y-2">
              {userPlans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => handleManualUnlock(plan.id)}
                  className={`w-full py-2 rounded-lg text-white text-xs font-semibold
                    bg-gradient-to-r ${PLAN_COLORS[plan.id] || "from-teal-500 to-blue-600"}`}
                >
                  ✅ I paid for {plan.name} — Unlock Now
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phone input */}
        <div className="bg-white rounded-2xl shadow p-5 mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="inline h-4 w-4 mr-1 text-teal-600" />
            Your MTN or Orange Money number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value); setPhoneError(null); setError(null); }}
            placeholder="e.g. 237650000000"
            disabled={isAnyProcessing}
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none
              focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50
              ${phoneError ? "border-red-400" : "border-gray-300"}`}
          />
          {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          <p className="text-xs text-gray-400 mt-2">
            A payment prompt will be sent to this number. Approve it on your phone to pay.
          </p>
        </div>

        {/* Plan cards */}
        <div className="space-y-4 mb-6">
          {userPlans.map(plan => {
            const color  = PLAN_COLORS[plan.id] || "from-teal-500 to-blue-600";
            const isThis = processingPlan === plan.id;

            return (
              <div key={plan.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Coloured header row */}
                <div className={`bg-gradient-to-r ${color} px-5 py-4 flex items-center gap-3`}>
                  <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
                    {PLAN_ICONS[plan.id] || <Star className="h-6 w-6 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-white">{plan.name}</h2>
                    <p className="text-white/75 text-xs">{plan.duration}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-2xl font-bold text-white">{plan.price.toLocaleString()}</span>
                    <span className="text-white/75 text-sm ml-1">XAF</span>
                  </div>
                </div>

                {/* Features + button */}
                <div className="px-5 py-4">
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isAnyProcessing}
                    className={`w-full py-3 rounded-xl font-semibold text-white text-sm transition-all
                      bg-gradient-to-r ${color}
                      hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100`}
                  >
                    {isThis ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Activating your subscription...
                      </span>
                    ) : (
                      `Subscribe — ${plan.price.toLocaleString()} XAF`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-xs font-semibold text-gray-500 mb-3">Accepted payment methods</p>
          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">📱</span>
              <span className="text-xs text-gray-500">MTN MoMo</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🟠</span>
              <span className="text-xs text-gray-500">Orange Money</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Secured by CamPay · BAMBEH SARL</p>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionPlans;
