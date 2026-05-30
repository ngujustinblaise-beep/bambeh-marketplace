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

const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user }  = useAuth();
  const userId    = (user as any)?.id || (user as any)?.uid || (user as any)?.sub || (user as any)?.user_id || null;

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

  function validPhone(v: string): boolean {
    const c = v.replace(/\s/g, "");
    return /^(237)?6[2-9]\d{7}$/.test(c);
  }

  async function handleSubscribe(planId: string) {
    if (!user) { navigate("/login"); return; }
    if (!phone.trim()) {
      setPhoneError("Enter your phone number above first.");
      return;
    }
    if (!validPhone(phone)) {
      setPhoneError("Enter a valid  number e.g. 237650000000 or 650000000");
      return;
    }

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
      activateSubscription(planId);
      setSuccess(true);
      setSuccessPlan(planId);
      setTimeout(() => navigate("/marketplace"), 2000);
    } catch (err: any) {
      const msg = err?.message || "Payment failed. Please try again.";
      if (msg.toLowerCase().includes("insufficient")) {
        setError("Insufficient funds. Please top up your mobile money account and try again.");
      } else {
        setError(msg);
      }
    } finally {
      setProcessingPlan(null);
    }
  }

  async function handleManualUnlock(planId: string) {
    if (!userId) return;
    try {
      activateSubscription(planId);
      setSuccess(true);
      setSuccessPlan(planId);
      setTimeout(() => navigate("/marketplace"), 2000);
    } catch {
      setError("Could not unlock. Please contact support.");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">Access Unlocked!</h2>
          <p className="text-gray-600">Redirecting you to the marketplace...</p>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Already Subscribed</h2>
          <p className="text-gray-600 mb-4">Your {planType} plan is active.</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700"
          >
            Go to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 opacity-80 hover:opacity-100">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <h1 className="text-2xl font-bold">Choose Your Plan</h1>
        <p className="text-sm opacity-80 mt-1">Pay with MTN MoMo or Orange Money. Access unlocks the moment payment is sent.</p>
      </div>

      <div className="p-4 max-w-lg mx-auto">
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
          <p className="text-xs text-gray-400 mt-1">A payment prompt will be sent to this number. Approve it on your phone to pay.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-700 text-sm font-medium">Payment Failed</p>
                <p className="text-red-600 text-sm">{error}</p>
                <p className="text-gray-500 text-xs mt-2">If you already approved the payment on your phone, tap below to unlock:</p>
                <div className="flex flex-col gap-2 mt-2">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => handleManualUnlock(plan.id)}
                      className="text-left text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
                    >
                      I paid for {plan.name} - Unlock Now
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {loadingPlans ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
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
                        <Check className="h-4 w-4 text-green-500" /> {f}
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
                      `Subscribe - ${plan.price.toLocaleString()} XAF`
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">Secured by CamPay - BAMBEH SARL</p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

