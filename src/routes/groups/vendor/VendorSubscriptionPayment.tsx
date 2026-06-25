/**
 * ---------------------------------------------------------------------------
 * VENDOR SUBSCRIPTION PAYMENT PAGE
 * � 2025 Bambeh. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, Smartphone, Coins, CheckCircle, Shield,
  Lock, Star, Zap, Crown, AlertCircle, Loader2, Receipt,
  Download, Copy, Check, Clock, BadgeCheck, Sparkles, TrendingUp
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  zermPrice: number;
  period: string;
  color: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: string[];
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 5000,
    zermPrice: 50,
    period: 'month',
    color: 'from-blue-500 to-cyan-500',
    icon: <Star className="w-8 h-8" />,
    features: ['Up to 10 active listings', 'Basic analytics', 'Email support', 'Standard visibility']
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 15000,
    zermPrice: 150,
    period: 'month',
    color: 'from-teal-500 to-emerald-500',
    icon: <Zap className="w-8 h-8" />,
    popular: true,
    features: ['Up to 50 active listings', 'Advanced analytics', 'Priority support', 'Featured listings (3/month)', 'Bulk upload tool', 'Auto-messaging']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 45000,
    zermPrice: 450,
    period: 'month',
    color: 'from-purple-500 to-pink-500',
    icon: <Crown className="w-8 h-8" />,
    features: ['Unlimited listings', 'Premium analytics pro', '24/7 priority support', 'Unlimited featured listings', 'Bulk upload + API access', 'Auto-messaging pro', 'Verified seller badge', 'Custom storefront']
  }
];

type PaymentMethod = 'mtn' | 'orange' | 'zerm';

const VendorSubscriptionPayment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'professional';

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [zermBalance, setZermBalance] = useState(0);

  useEffect(() => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    setSelectedPlan(plan || SUBSCRIPTION_PLANS[1]);

    const savedBalance = localStorage.getItem('Bambeh_zerm_balance');
    if (savedBalance) setZermBalance(parseInt(savedBalance));

    const savedPhone = localStorage.getItem('Bambeh_vendor_phone');
    if (savedPhone) setPhoneNumber(savedPhone);
  }, [planId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CM', { style: 'decimal', minimumFractionDigits: 0 }).format(price);
  };

  const generateTransactionRef = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BMB-${timestamp}-${random}`;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, '');
    const mtnPattern = /^(237)?(6[5-9]\d{7})$/;
    const orangePattern = /^(237)?(6[9]\d{7})$/;
    if (paymentMethod === 'mtn') return mtnPattern.test(cleanPhone);
    if (paymentMethod === 'orange') return orangePattern.test(cleanPhone);
    return true;
  };

  const handlePayment = async () => {
    setError('');

    if (!selectedPlan) { setError('Please select a subscription plan'); return; }

    if (paymentMethod !== 'zerm' && !phoneNumber.trim()) {
      setError('Please enter your mobile money number');
      return;
    }

    if (paymentMethod !== 'zerm' && !validatePhoneNumber(phoneNumber)) {
      setError(`Invalid ${paymentMethod === 'mtn' ? 'MTN' : 'Orange'} phone number`);
      return;
    }

    if (paymentMethod === 'zerm' && zermBalance < selectedPlan.zermPrice) {
      setError(`Insufficient Zerm balance. You need ${selectedPlan.zermPrice} Zerm but have ${zermBalance}.`);
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const ref = generateTransactionRef();
    setTransactionRef(ref);

    if (paymentMethod === 'zerm') {
      const newBalance = zermBalance - selectedPlan.zermPrice;
      setZermBalance(newBalance);
      localStorage.setItem('Bambeh_zerm_balance', String(newBalance));
    }

    const subscriptionData = {
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      price: paymentMethod === 'zerm' ? selectedPlan.zermPrice : selectedPlan.price,
      currency: paymentMethod === 'zerm' ? 'ZERM' : 'XAF',
      paymentMethod,
      transactionRef: ref,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };
    localStorage.setItem('Bambeh_vendor_subscription', JSON.stringify(subscriptionData));
    localStorage.setItem('Bambeh_vendor_phone', phoneNumber);

    setIsProcessing(false);
    setPaymentSuccess(true);
  };

  const copyTransactionRef = () => {
    navigator.clipboard.writeText(transactionRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    if (!selectedPlan) return;
    const receiptContent = `
BAMBEH MARKETPLACE - PAYMENT RECEIPT
======================================
Transaction Reference: ${transactionRef}
Plan: ${selectedPlan.name} Subscription
Period: 1 ${selectedPlan.period}
Amount: ${paymentMethod === 'zerm' ? `${selectedPlan.zermPrice} ZERM` : `${formatPrice(selectedPlan.price)} XAF`}
Payment Method: ${paymentMethod.toUpperCase()}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
Time: ${new Date().toLocaleTimeString('en-GB')}
Status: PAID

Thank you for subscribing to Bambeh Vendor Services!
Support: support@bambeh.cm
======================================
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bambeh_Receipt_${transactionRef}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (paymentSuccess && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 text-center border-b border-white/10">
              <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-emerald-400">Your subscription is now active</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Plan</span>
                  <span className="text-white font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Amount Paid</span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {paymentMethod === 'zerm' ? `${selectedPlan.zermPrice} ZERM` : `${formatPrice(selectedPlan.price)} XAF`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Valid Until</span>
                  <span className="text-white font-semibold">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Transaction Ref</span>
                    <div className="flex items-center gap-2">
                      <code className="text-teal-400 font-mono text-sm">{transactionRef}</code>
                      <button onClick={copyTransactionRef} className="p-1 hover:bg-white/10 rounded transition-colors">
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-400" /> Features Unlocked
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPlan.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-white/80 bg-white/5 rounded-lg p-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={downloadReceipt}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all">
                  <Download className="w-5 h-5" /> Download Receipt
                </button>
                <button onClick={() => navigate('/vendor/home')}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/30">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/vendor/subscription')}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Complete Payment</h1>
                <p className="text-sm text-teal-400">Secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-3 space-y-6">
            {selectedPlan && (
              <div className={`bg-gradient-to-br ${selectedPlan.color} p-[1px] rounded-2xl`}>
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedPlan.color} text-white`}>
                        {selectedPlan.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedPlan.name} Plan</h2>
                        <p className="text-white/60">Billed monthly</p>
                      </div>
                    </div>
                    {selectedPlan.popular && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-semibold rounded-full">Most Popular</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{formatPrice(selectedPlan.price)}</span>
                    <span className="text-white/60">XAF/month</span>
                  </div>
                  <p className="text-teal-400 text-sm mt-1">or {selectedPlan.zermPrice} Zerm Coins</p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-400" /> Select Payment Method
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {([
                  { id: 'mtn' as PaymentMethod, label: 'MTN MoMo', sub: 'Mobile Money', bg: 'bg-amber-500', borderActive: 'border-amber-500 bg-amber-500/10', borderIdle: 'border-white/20 bg-white/5' },
                  { id: 'orange' as PaymentMethod, label: 'Orange', sub: 'Mobile Money', bg: 'bg-orange-500', borderActive: 'border-orange-500 bg-orange-500/10', borderIdle: 'border-white/20 bg-white/5' },
                  { id: 'zerm' as PaymentMethod, label: 'Zerm Coins', sub: `Balance: ${zermBalance} Z`, bg: 'bg-gradient-to-br from-teal-500 to-emerald-500', borderActive: 'border-teal-500 bg-teal-500/10', borderIdle: 'border-white/20 bg-white/5' },
                ] as const).map((method) => (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${paymentMethod === method.id ? method.borderActive : method.borderIdle + ' hover:border-white/40'}`}>
                    {paymentMethod === method.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`w-12 h-12 ${method.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white font-semibold text-center">{method.label}</p>
                    <p className="text-xs text-white/60 text-center mt-1">{method.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Input */}
            {paymentMethod !== 'zerm' && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-teal-400" />
                  {paymentMethod === 'mtn' ? 'MTN' : 'Orange'} Phone Number
                </h3>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-white/60">+237</span>
                    <div className="w-px h-6 bg-white/20"/>
                  </div>
                  <input type="tel" value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="6XX XXX XXX"
                    className="w-full pl-20 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white text-lg font-mono placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500" />
                </div>
                <p className="mt-2 text-sm text-white/60">You will receive a payment prompt on this number</p>
              </div>
            )}

            {paymentMethod === 'zerm' && selectedPlan && zermBalance < selectedPlan.zermPrice && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 font-semibold">Insufficient Balance</p>
                    <p className="text-white/70 text-sm mt-1">
                      You need {selectedPlan.zermPrice} Zerm but only have {zermBalance}.
                      <button onClick={() => navigate('/zerm')} className="text-teal-400 hover:underline ml-1">
                        Buy more Zerm
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}

            <button onClick={handlePayment} disabled={isProcessing || !selectedPlan}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50 flex items-center justify-center gap-3">
              {isProcessing ? (
                <><Loader2 className="w-6 h-6 animate-spin" />Processing Payment...</>
              ) : (
                <><Lock className="w-5 h-5" />Pay {selectedPlan && (paymentMethod === 'zerm' ? `${selectedPlan.zermPrice} ZERM` : `${formatPrice(selectedPlan.price)} XAF`)}</>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-400" /> Order Summary
              </h3>

              {selectedPlan && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/60">{selectedPlan.name} Plan</span>
                    <span className="text-white">{formatPrice(selectedPlan.price)} XAF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Billing Period</span>
                    <span className="text-white">Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Discount</span>
                    <span className="text-emerald-400">-0 XAF</span>
                  </div>
                  <div className="h-px bg-white/10"/>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {paymentMethod === 'zerm' ? `${selectedPlan.zermPrice} ZERM` : `${formatPrice(selectedPlan.price)} XAF`}
                      </p>
                      {paymentMethod !== 'zerm' && (
                        <p className="text-teal-400 text-sm">or {selectedPlan.zermPrice} Zerm</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedPlan && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white/80 mb-4">What you'll get:</h4>
                  <ul className="space-y-3">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-white/60">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div className="text-sm">
                    <p className="text-white/80 font-medium">Secure Payment</p>
                    <p>256-bit SSL encryption</p>
                  </div>
                </div>
              </div>

              <button onClick={() => navigate('/vendor/subscription')}
                className="mt-4 w-full py-3 text-center text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
                ? Change Plan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorSubscriptionPayment;





