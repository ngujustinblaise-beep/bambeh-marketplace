/**
 * SubscriptionPlans.tsx  —  Bambeh Marketplace
 * FILE LOCATION: src/pages/SubscriptionPlans.tsx
 *
 * FIXED (this version):
 *  ✅ Uses unified useCamPay hook (no more Render payment server)
 *  ✅ Payment goes directly: Frontend → Supabase Edge Function → CamPay
 *  ✅ No cold-start problem (Supabase Edge Functions are always warm)
 *  ✅ Subscription activation only happens after CamPay confirms SUCCESSFUL
 *  ✅ Removed handleManualUnlock bypass loophole
 *  ✅ Proper error messages with retry
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, Crown, Star, Zap, ArrowLeft, Loader2, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import CamPayWidget from '@/components/payment/CamPayWidget';
import { useLang, t } from "@/hooks/useAppLang";

// ── Plan definitions ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'daily',
    name: 'Daily Pass',
    price: 100,
    duration: '24 hours',
    durationMs: 24 * 60 * 60 * 1000,
    icon: <Star className="h-7 w-7 text-white" />,
    gradient: 'from-amber-500 to-amber-700',
    features: [
      'Full marketplace access',
      'Contact any seller',
      'Browse all listings',
      'Basic support',
    ],
  },
  {
    id: 'weekly',
    name: 'Weekly Plan',
    price: 500,
    duration: '7 days',
    durationMs: 7 * 24 * 60 * 60 * 1000,
    icon: <Zap className="h-7 w-7 text-white" />,
    gradient: 'from-teal-500 to-blue-600',
    popular: true,
    features: [
      'All Daily features',
      'Unlimited seller contacts',
      'Advanced search filters',
      'Priority support',
      '10% discount on services',
    ],
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 1500,
    duration: '30 days',
    durationMs: 30 * 24 * 60 * 60 * 1000,
    icon: <Crown className="h-7 w-7 text-white" />,
    gradient: 'from-purple-600 to-indigo-700',
    features: [
      'All Weekly features',
      'VIP support (24/7)',
      'Featured listings',
      'AI-powered matching',
      '20% discount on all services',
      'Ad-free experience',
      'Early access to new features',
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId   = (user as any)?.id ?? null;

  const { isActive, planType } = useSubscription(userId);

  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Activate subscription in Supabase after CamPay confirms ──────────────
  async function handlePaymentSuccess(reference: string) {
    if (!selectedPlan || !userId) return;

    const expiresAt = new Date(Date.now() + selectedPlan.durationMs).toISOString();

    // Upsert subscription record
    await supabase.from('subscriptions').upsert({
      user_id:    userId,
      plan_type:  selectedPlan.id,
      status:     'active',
      expires_at: expiresAt,
      reference,
      activated_at: new Date().toISOString(),
    });

    // Log transaction
    await supabase.from('subscription_payments').insert({
      user_id:    userId,
      plan_id:    selectedPlan.id,
      amount_xaf: selectedPlan.price,
      reference,
      status:     'paid',
    });

    // Also store in localStorage so useSubscription hook picks it up immediately
    localStorage.setItem('Bambeh_subscription', JSON.stringify({
      tier:       selectedPlan.id,
      startDate:  new Date().toISOString(),
      expiresAt,
      status:     'active',
    }));

    setSuccess(true);
    setTimeout(() => navigate('/marketplace'), 2500);
  }

  // ── Already subscribed ─────────────────────────────────────────────────────
  if (isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Already Subscribed</h2>
          <p className="text-gray-600 mb-4">Your {planType} plan is active.</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700"
          >
            Go to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">Access Unlocked! 🎉</h2>
          <p className="text-gray-600">Your {selectedPlan?.name} is active. Redirecting…</p>
        </div>
      </div>
    );
  }

  // ── Checkout: one plan selected ────────────────────────────────────────────
  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`bg-gradient-to-r ${selectedPlan.gradient} text-white p-6`}>
          <button
            onClick={() => setSelectedPlan(null)}
            className="flex items-center gap-2 mb-4 opacity-80 hover:opacity-100 text-sm"
          >
            <ArrowLeft className="h-5 w-5" /> Back to plans
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">{selectedPlan.icon}</div>
            <div>
              <h1 className="text-xl font-bold">{selectedPlan.name}</h1>
              <p className="text-sm opacity-80">{selectedPlan.duration} · {selectedPlan.price.toLocaleString()} XAF</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-lg mx-auto">
          {/* What you get */}
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">What you get:</h3>
            <ul className="space-y-2">
              {selectedPlan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Pay with Mobile Money</h3>
            <CamPayWidget
              amount={selectedPlan.price}
              description={`Bambeh ${selectedPlan.name} — ${selectedPlan.duration}`}
              externalRef={`sub_${selectedPlan.id}_${userId}_${Date.now()}`}
              metadata={{ user_id: userId, plan_id: selectedPlan.id }}
              onSuccess={handlePaymentSuccess}
              buttonLabel={`Subscribe — ${selectedPlan.price.toLocaleString()} XAF`}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Plan picker ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 opacity-80 hover:opacity-100 text-sm">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <h1 className="text-2xl font-bold">Subscribe to Bambeh</h1>
        <p className="text-sm opacity-80 mt-1">
          Pay with MTN MoMo or Orange Money. Access unlocks immediately after payment.
        </p>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4 pb-10">
        {PLANS.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow overflow-hidden">
            {plan.popular && (
              <div className="bg-teal-600 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                ✦ MOST POPULAR
              </div>
            )}
            <div className={`bg-gradient-to-r ${plan.gradient} p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {plan.icon}
                <div>
                  <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                  <p className="text-white/75 text-sm">{plan.duration}</p>
                </div>
              </div>
              <div className="text-white text-right">
                <span className="text-2xl font-bold">{plan.price.toLocaleString()}</span>
                <span className="text-sm ml-1">XAF</span>
              </div>
            </div>
            <div className="p-4">
              <ul className="space-y-1.5 mb-4">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  setSelectedPlan(plan);
                }}
                className={`w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-opacity`}
              >
                Select — {plan.price.toLocaleString()} XAF
              </button>
            </div>
          </div>
        ))}

        <p className="text-xs text-gray-400 text-center">
          Secured by CamPay · BAMBEH SARL · support@bambeh.com
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
