/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VENDOR SUBSCRIPTION PLANS EXCLUSIVE - VENDOR-ONLY PAGE
 * ROUTE: /vendor/manage-plan
 * FILE LOCATION: src/pages/vendor/VendorSubscriptionPlansExclusive.tsx
 * © 2025 Bambeh. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Crown, Star, Zap, Building, Check, X, Coins, Phone, Shield,
  ChevronRight, Gift, TrendingUp, Users, BarChart3, Headphones, Loader2,
  CheckCircle, AlertCircle, Lock, RefreshCw, CreditCard, Smartphone, Receipt,
  Download, Copy, Sparkles, Clock, BadgeCheck, Settings, Bell, LogOut,
  HelpCircle, User, ChevronDown, Store, MessageSquare, Package, Eye
} from 'lucide-react';

import BambehLogo from '@/assets/images/bambeh-logo.png';
import { useLang, t } from "@/hooks/useAppLang";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface SubscriptionPlan {
  tier: 'starter' | 'professional' | 'business' | 'enterprise';
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  annualSavings: number;
  zermCoinsMonthly: number;
  renewalBonus: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  darkGradient: string;
  icon: React.ElementType;
  popular: boolean;
  features: PlanFeature[];
}

interface VendorData {
  id?: string;
  username?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  tier?: string;
  zermCoins?: number;
}

type PaymentMethod = 'mtn' | 'orange' | 'card' | 'zerm';
type PaymentStep = 'select' | 'details' | 'processing' | 'success';
type BillingPeriod = 'monthly' | 'annual';

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION PLANS DATA
// ═══════════════════════════════════════════════════════════════════════════

const PLANS: SubscriptionPlan[] = [
  {
    tier: 'starter',
    name: 'Starter',
    description: 'Perfect for new vendors starting their business',
    priceMonthly: 2000, priceAnnual: 20000, annualSavings: 4000,
    zermCoinsMonthly: 20, renewalBonus: 5,
    color: 'blue', gradientFrom: 'from-blue-500', gradientTo: 'to-cyan-500',
    darkGradient: 'from-blue-600 to-cyan-600',
    icon: Star, popular: false,
    features: [
      { text: '20 product listings', included: true },
      { text: '2 featured listings/month', included: true },
      { text: '1% commission rate', included: true },
      { text: 'Standard support (24h response)', included: true },
      { text: 'Basic analytics dashboard', included: true },
      { text: 'Unlimited chat with buyers', included: true },
      { text: 'Community support forum', included: true },
      { text: '5 ZC renewal bonus', included: true, highlight: true },
      { text: 'Featured badge', included: false },
      { text: 'Priority placement', included: false },
      { text: 'Bulk upload', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    tier: 'professional',
    name: 'Professional',
    description: 'Best for growing businesses wanting more visibility',
    priceMonthly: 5000, priceAnnual: 50000, annualSavings: 10000,
    zermCoinsMonthly: 50, renewalBonus: 10,
    color: 'purple', gradientFrom: 'from-purple-500', gradientTo: 'to-pink-500',
    darkGradient: 'from-purple-600 to-pink-600',
    icon: Crown, popular: true,
    features: [
      { text: '50 product listings', included: true },
      { text: '10 featured listings/month', included: true },
      { text: '1% commission rate', included: true },
      { text: 'Priority support (12h response)', included: true },
      { text: 'Advanced analytics + insights', included: true },
      { text: 'Unlimited chat + priority messaging', included: true },
      { text: 'Social media integration', included: true },
      { text: '10 ZC renewal bonus', included: true, highlight: true },
      { text: 'Featured badge ✓', included: true },
      { text: 'Priority placement ✓', included: true },
      { text: 'Bulk upload (CSV/Excel)', included: true },
      { text: 'Ad-free experience', included: true },
    ],
  },
  {
    tier: 'business',
    name: 'Business',
    description: 'For established businesses needing advanced features',
    priceMonthly: 15000, priceAnnual: 150000, annualSavings: 30000,
    zermCoinsMonthly: 150, renewalBonus: 15,
    color: 'teal', gradientFrom: 'from-teal-500', gradientTo: 'to-emerald-500',
    darkGradient: 'from-teal-600 to-emerald-600',
    icon: Zap, popular: false,
    features: [
      { text: 'Unlimited product listings', included: true },
      { text: '50 featured listings/month', included: true },
      { text: '1% commission rate', included: true },
      { text: 'Dedicated support (4h response)', included: true },
      { text: 'Pro analytics + custom reports', included: true },
      { text: 'Team collaboration (10 members)', included: true },
      { text: 'Advanced inventory management', included: true },
      { text: '15 ZC renewal bonus', included: true, highlight: true },
      { text: 'All Professional features', included: true },
      { text: 'API access', included: true },
      { text: 'Custom storefront', included: true },
      { text: 'Fast-track verification', included: true },
    ],
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Full-featured solution for large businesses',
    priceMonthly: 35000, priceAnnual: 350000, annualSavings: 70000,
    zermCoinsMonthly: 350, renewalBonus: 20,
    color: 'yellow', gradientFrom: 'from-yellow-500', gradientTo: 'to-orange-500',
    darkGradient: 'from-yellow-600 to-orange-600',
    icon: Building, popular: false,
    features: [
      { text: 'Unlimited everything', included: true },
      { text: 'Unlimited featured listings', included: true },
      { text: '1% commission rate', included: true },
      { text: 'VIP support (1h response)', included: true },
      { text: 'Enterprise analytics suite', included: true },
      { text: 'Team collaboration (50 members)', included: true },
      { text: 'Multi-location store management', included: true },
      { text: '20 ZC renewal bonus', included: true, highlight: true },
      { text: 'All Business features', included: true },
      { text: 'White-label option', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations', included: true },
    ],
  },
];

const tierConfig: Record<string, { name: string; level: number; color: string; bgColor: string }> = {
  starter: { name: 'Starter', level: 1, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  professional: { name: 'Professional', level: 2, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  business: { name: 'Business', level: 3, color: 'text-teal-400', bgColor: 'bg-teal-500/20' },
  enterprise: { name: 'Enterprise', level: 4, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  basic: { name: 'Basic', level: 1, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  premium: { name: 'Premium', level: 2, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  gold: { name: 'Gold', level: 3, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  free: { name: 'Free', level: 0, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
};

const getTierConfig = (tier: string | undefined) => {
  if (!tier) return tierConfig.free;
  return tierConfig[tier.toLowerCase()] || tierConfig.free;
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function VendorSubscriptionPlansExclusive() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [zermBalance, setZermBalance] = useState(0);

  useEffect(() => {
    const vendorData = localStorage.getItem('Bambeh_vendor');
    const userData = localStorage.getItem('Bambeh_user');

    if (vendorData) {
      try {
        const parsed = JSON.parse(vendorData);
        setVendor({ ...parsed, tier: parsed.tier || 'free' });
        if (parsed.phone) setPhoneNumber(parsed.phone);
      } catch (e) {
        console.error('Error loading vendor data:', e);
      }
    } else if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.isVendor) {
          setVendor({
            id: user.id,
            username: user.name,
            businessName: user.name,
            email: user.email,
            phone: user.phone,
            tier: user.vendorTier || 'free',
            zermCoins: user.zermCoins || 0,
          });
          if (user.phone) setPhoneNumber(user.phone);
        }
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    }

    const savedBalance = localStorage.getItem('Bambeh_zerm_balance');
    if (savedBalance) setZermBalance(parseInt(savedBalance) || 0);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CM').format(price);
  };

  const generateTransactionRef = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BMB-SUB-${timestamp}-${random}`;
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setPaymentStep('select');
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('Bambeh_vendor');
    localStorage.removeItem('Bambeh_vendor_token');
    localStorage.removeItem('Bambeh_user');
    navigate('/vendor/portal', { replace: true });
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (paymentMethod === 'mtn') {
      return /^(6[5-8]\d{7})$/.test(cleanPhone);
    } else if (paymentMethod === 'orange') {
      return /^(69\d{7})$/.test(cleanPhone);
    }
    return true;
  };

  const validateCard = (): boolean => {
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length !== 16) return false;
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return false;
    if (!/^\d{3,4}$/.test(cardCVC)) return false;
    if (cardName.length < 3) return false;
    return true;
  };

  const handlePayment = async () => {
    setError('');

    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }

    if (paymentMethod === 'mtn' || paymentMethod === 'orange') {
      if (!phoneNumber.trim()) {
        setError('Please enter your mobile money number');
        return;
      }
      if (!validatePhoneNumber(phoneNumber)) {
        setError(`Invalid ${paymentMethod === 'mtn' ? 'MTN' : 'Orange'} phone number`);
        return;
      }
    }

    if (paymentMethod === 'card') {
      if (!validateCard()) {
        setError('Please enter valid card details');
        return;
      }
    }

    if (paymentMethod === 'zerm') {
      const planZermCost = Math.round(price / 100);
      if (zermBalance < planZermCost) {
        setError(`Insufficient Zerm balance. You need ${planZermCost} Zerm but have ${zermBalance}.`);
        return;
      }
    }

    setPaymentStep('processing');
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const ref = generateTransactionRef();
    setTransactionRef(ref);

    const subscriptionData = {
      planId: selectedPlan.tier,
      planName: selectedPlan.name,
      price: billingPeriod === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceAnnual,
      billingPeriod,
      paymentMethod,
      transactionRef: ref,
      subscribedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
    };

    localStorage.setItem('Bambeh_vendor_subscription', JSON.stringify(subscriptionData));

    if (vendor) {
      const updatedVendor = { ...vendor, tier: selectedPlan.tier };
      localStorage.setItem('Bambeh_vendor', JSON.stringify(updatedVendor));
      setVendor(updatedVendor);
    }

    const currentCoins = vendor?.zermCoins || 0;
    const newCoins = currentCoins + selectedPlan.zermCoinsMonthly + selectedPlan.renewalBonus;
    localStorage.setItem('Bambeh_zerm_balance', newCoins.toString());
    setZermBalance(newCoins);

    setIsProcessing(false);
    setPaymentStep('success');
  };

  const currentTier = getTierConfig(vendor?.tier);
  const price = billingPeriod === 'monthly'
    ? selectedPlan?.priceMonthly || 0
    : selectedPlan?.priceAnnual || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* VENDOR-EXCLUSIVE HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/vendor/home')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>

              <Link to="/vendor/home" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <img
                  src={BambehLogo}
                  alt="Bambeh"
                  className="w-10 h-10 rounded-xl object-cover shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40x40/14b8a6/ffffff?text=B';
                  }}
                />
                <div>
                  <h1 className="font-bold text-lg text-white">Subscription Plans</h1>
                  <p className="text-xs text-white/60">Vendor Portal</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/zerm/purchase"
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
              >
                <Coins className="w-4 h-4" />
                <span className="font-medium text-sm">{zermBalance} ZC</span>
              </Link>

              <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg ${currentTier.bgColor}`}>
                <Crown className={`w-4 h-4 ${currentTier.color}`} />
                <span className={`font-medium text-sm ${currentTier.color}`}>{currentTier.name}</span>
              </div>

              <Link
                to="/vendor/settings"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Settings className="w-5 h-5 text-white" />
              </Link>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <User className="w-5 h-5 text-white" />
                  <ChevronDown className={`w-4 h-4 text-white transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="p-4 border-b border-white/10">
                        <p className="text-white font-medium truncate">{vendor?.businessName || vendor?.username}</p>
                        <p className={`text-sm ${currentTier.color}`}>{currentTier.name} Plan</p>
                      </div>
                      <div className="p-2">
                        <Link to="/vendor/home" className="flex items-center gap-3 px-3 py-2 text-white/80 hover:bg-white/10 rounded-lg">
                          <Store className="w-4 h-4" /><span>Dashboard</span>
                        </Link>
                        <Link to="/vendor/profile" className="flex items-center gap-3 px-3 py-2 text-white/80 hover:bg-white/10 rounded-lg">
                          <User className="w-4 h-4" /><span>Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <LogOut className="w-4 h-4" /><span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-400 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Grow Your Business</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Choose Your Perfect Plan</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Unlock premium features and reach more customers with our flexible subscription plans
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >Monthly</button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Annual
              <span className="text-xs bg-green-500/30 text-green-400 px-2 py-0.5 rounded-full">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const planPrice = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
            const isCurrentPlan = vendor?.tier?.toLowerCase() === plan.tier;

            return (
              <div
                key={plan.tier}
                className={`relative bg-white/5 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all hover:scale-105 ${
                  plan.popular ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-white/10 hover:border-white/20'
                } ${isCurrentPlan ? 'ring-2 ring-teal-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                    MOST POPULAR
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-teal-500 text-white text-xs font-bold px-4 py-1 rounded-br-xl">
                    CURRENT PLAN
                  </div>
                )}

                <div className={`p-6 bg-gradient-to-br ${plan.darkGradient}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{formatPrice(planPrice)}</span>
                    <span className="text-white/70">XAF</span>
                  </div>
                  <p className="text-sm text-white/70 mt-1">per {billingPeriod === 'monthly' ? 'month' : 'year'}</p>
                  {billingPeriod === 'annual' && (
                    <div className="mt-3 inline-block bg-white/20 rounded-full px-3 py-1 text-sm text-white">
                      Save {formatPrice(plan.annualSavings)} XAF!
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <p className="text-sm text-white/60 mb-4">{plan.description}</p>

                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Coins className="w-5 h-5" />
                      <span className="font-semibold">{plan.zermCoinsMonthly} ZC/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-teal-400 mt-1">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm">+{plan.renewalBonus} ZC renewal bonus</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrentPlan}
                    className={`w-full px-6 py-3 rounded-xl font-bold mb-6 transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo} text-white hover:shadow-lg hover:opacity-90`
                    }`}
                  >
                    {isCurrentPlan ? (
                      <><CheckCircle className="w-5 h-5" />Current Plan</>
                    ) : (
                      <><Crown className="w-5 h-5" />Subscribe Now</>
                    )}
                  </button>

                  <div className="space-y-2">
                    {plan.features.slice(0, 8).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? 'text-yellow-400' : 'text-teal-400'}`} />
                        ) : (
                          <X className="w-5 h-5 text-white/20 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          feature.included
                            ? feature.highlight ? 'text-yellow-400 font-medium' : 'text-white/80'
                            : 'text-white/30'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Methods Section */}
        <div className="mb-16">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
              <CreditCard className="w-8 h-8 text-teal-400" />
              Accepted Payment Methods
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-900 font-bold text-xl">MTN</span>
                </div>
                <p className="font-bold text-yellow-400">MTN MoMo</p>
                <p className="text-xs text-white/50 mt-1">Mobile Money</p>
              </div>
              <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">OM</span>
                </div>
                <p className="font-bold text-orange-400">Orange Money</p>
                <p className="text-xs text-white/50 mt-1">Mobile Money</p>
              </div>
              <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-blue-400">Credit Card</p>
                <p className="text-xs text-white/50 mt-1">Visa / Mastercard</p>
              </div>
              <div className="p-6 bg-teal-500/10 border border-teal-500/30 rounded-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-teal-400">Zerm Coins</p>
                <p className="text-xs text-white/50 mt-1">Digital Currency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="mb-16">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
              <Gift className="w-8 h-8 text-purple-400" />
              Earn Zerm Coins as You Grow!
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-teal-500/10 border border-teal-500/20 rounded-xl text-center">
                <RefreshCw className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-white mb-3">Renewal Rewards</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-white/70"><span className="text-blue-400 font-semibold">Starter:</span> 5 ZC</p>
                  <p className="text-white/70"><span className="text-purple-400 font-semibold">Professional:</span> 10 ZC</p>
                  <p className="text-white/70"><span className="text-teal-400 font-semibold">Business:</span> 15 ZC</p>
                  <p className="text-white/70"><span className="text-yellow-400 font-semibold">Enterprise:</span> 20 ZC</p>
                </div>
              </div>
              <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-white mb-3">Referral Rewards</h3>
                <p className="text-4xl font-bold text-purple-400 mb-2">10 ZC</p>
                <p className="text-sm text-white/60">Refer 2 vendors who complete registration</p>
              </div>
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-white mb-3">Review Rewards</h3>
                <p className="text-4xl font-bold text-yellow-400 mb-2">20 ZC</p>
                <p className="text-sm text-white/60">Receive 5 positive reviews from clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl text-white/60 mb-8">Join thousands of successful vendors on Bambeh today!</p>
          <button
            onClick={() => handleSelectPlan(PLANS[1])}
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all"
          >
            <Crown className="w-6 h-6" />
            Get Started with Professional
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </main>

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPlan.darkGradient} flex items-center justify-center`}>
                  {(() => { const Icon = selectedPlan.icon; return <Icon className="w-6 h-6 text-white" />; })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedPlan.name} Plan</h2>
                  <p className="text-white/60 text-sm">
                    {formatPrice(price)} XAF / {billingPeriod === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowPaymentModal(false); setPaymentStep('select'); }}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">

              {/* Step: Select Payment Method */}
              {paymentStep === 'select' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Select Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* MTN MoMo */}
                    <button onClick={() => setPaymentMethod('mtn')}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${paymentMethod === 'mtn' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                      <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-yellow-900 font-bold">MTN</span>
                      </div>
                      <p className="text-white font-semibold">MTN MoMo</p>
                      <p className="text-xs text-white/50">Mobile Money</p>
                    </button>

                    {/* Orange Money */}
                    <button onClick={() => setPaymentMethod('orange')}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${paymentMethod === 'orange' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                      <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">OM</span>
                      </div>
                      <p className="text-white font-semibold">Orange Money</p>
                      <p className="text-xs text-white/50">Mobile Money</p>
                    </button>

                    {/* Credit Card */}
                    <button onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-semibold">Credit Card</p>
                      <p className="text-xs text-white/50">Visa / Mastercard</p>
                    </button>

                    {/* Zerm Coins */}
                    <button onClick={() => setPaymentMethod('zerm')}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${paymentMethod === 'zerm' ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-semibold">Zerm Coins</p>
                      <p className="text-xs text-teal-400">Balance: {zermBalance} ZC</p>
                    </button>
                  </div>

                  <button
                    onClick={() => setPaymentStep('details')}
                    className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Continue <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              )}

              {/* Step: Payment Details */}
              {paymentStep === 'details' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {paymentMethod === 'mtn' && 'MTN Mobile Money'}
                    {paymentMethod === 'orange' && 'Orange Money'}
                    {paymentMethod === 'card' && 'Credit Card Details'}
                    {paymentMethod === 'zerm' && 'Zerm Coins Payment'}
                  </h3>

                  {/* Mobile Money Form */}
                  {(paymentMethod === 'mtn' || paymentMethod === 'orange') && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Phone Number</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-white/60">+237</span>
                            <div className="w-px h-6 bg-white/20"/>
                          </div>
                          <input type="tel" value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                            placeholder="6XX XXX XXX"
                            className="w-full pl-20 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white text-lg font-mono placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                          />
                        </div>
                        <p className="mt-2 text-sm text-white/50">You will receive a payment prompt on this number</p>
                      </div>
                    </div>
                  )}

                  {/* Credit Card Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Card Number</label>
                        <input type="text" value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setCardNumber(val.replace(/(\d{4})/g, '$1 ').trim());
                          }}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white font-mono placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Cardholder Name</label>
                        <input type="text" value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="JOHN DOE"
                          className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white uppercase placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/70 mb-2">Expiry</label>
                          <input type="text" value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                              if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                              setCardExpiry(val);
                            }}
                            placeholder="MM/YY"
                            className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white font-mono placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/70 mb-2">CVC</label>
                          <input type="text" value={cardCVC}
                            onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white font-mono placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zerm Coins */}
                  {paymentMethod === 'zerm' && (
                    <div className="p-6 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/70">Your Balance</span>
                        <span className="text-teal-400 font-bold text-xl">{zermBalance} ZC</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/70">Plan Cost</span>
                        <span className="text-white font-bold text-xl">{Math.round(price / 100)} ZC</span>
                      </div>
                      <div className="h-px bg-white/10 my-4"/>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">Remaining</span>
                        <span className={`font-bold ${zermBalance - Math.round(price / 100) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                          {zermBalance - Math.round(price / 100)} ZC
                        </span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="text-white font-semibold mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">{selectedPlan.name} Plan</span>
                        <span className="text-white">{formatPrice(price)} XAF</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Billing</span>
                        <span className="text-white">{billingPeriod === 'monthly' ? 'Monthly' : 'Annual'}</span>
                      </div>
                      <div className="h-px bg-white/10 my-2"/>
                      <div className="flex justify-between font-semibold">
                        <span className="text-white">Total</span>
                        <span className="text-teal-400 text-lg">{formatPrice(price)} XAF</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setPaymentStep('select')}
                      className="flex-1 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                    >Back</button>
                    <button onClick={handlePayment}
                      className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-5 h-5" /> Pay Now
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Processing */}
              {paymentStep === 'processing' && (
                <div className="py-12 text-center">
                  <Loader2 className="w-16 h-16 text-teal-500 animate-spin mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
                  <p className="text-white/60">Please wait while we process your payment...</p>
                  {(paymentMethod === 'mtn' || paymentMethod === 'orange') && (
                    <p className="text-yellow-400 mt-4">Check your phone for payment prompt</p>
                  )}
                </div>
              )}

              {/* Step: Success */}
              {paymentStep === 'success' && (
                <div className="py-8 text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                  <p className="text-white/60 mb-6">
                    Welcome to {selectedPlan.name} plan! You've earned {selectedPlan.zermCoinsMonthly + selectedPlan.renewalBonus} Zerm coins.
                  </p>

                  <div className="p-4 bg-white/5 rounded-xl mb-6">
                    <p className="text-sm text-white/60 mb-1">Transaction Reference</p>
                    <p className="text-lg font-mono text-teal-400">{transactionRef}</p>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => navigate('/vendor/home')}
                      className="flex-1 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                    >Go to Dashboard</button>
                    <button onClick={() => { setShowPaymentModal(false); setPaymentStep('select'); }}
                      className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >Done</button>
                  </div>
                </div>
              )}
            </div>

            {/* Security Badge */}
            {paymentStep !== 'success' && (
              <div className="p-4 border-t border-white/10 flex items-center justify-center gap-3 text-white/50 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span>256-bit SSL encrypted. Your payment is secure.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
