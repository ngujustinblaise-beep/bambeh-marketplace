/**
 * SUBSCRIPTION GATE
 * FILE LOCATION: src/components/security/SubscriptionGate.tsx
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Crown, Sparkles, CheckCircle, ArrowRight, ShoppingBag, Briefcase, Home, Car, Wrench, ArrowLeftRight } from 'lucide-react';

interface SubscriptionData { isActive: boolean; plan: string; expiresAt: string; daysRemaining: number; }

const checkSubscription = (): SubscriptionData => {
  try {
    const userData = localStorage.getItem('Bambeh_user');
    if (!userData) return { isActive: false, plan: 'none', expiresAt: '', daysRemaining: 0 };

    const user = JSON.parse(userData);

    if (user.subscription?.isActive) {
      const expiryDate     = new Date(user.subscription.expiresAt);
      const daysRemaining  = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);
      if (daysRemaining > 0) {
        return { isActive: true, plan: user.subscription.plan || 'daily', expiresAt: user.subscription.expiresAt, daysRemaining };
      }
    }

    if (user.subscriptionPlan && user.subscriptionExpiry) {
      const expiryDate    = new Date(user.subscriptionExpiry);
      const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);
      if (daysRemaining > 0) {
        return { isActive: true, plan: user.subscriptionPlan, expiresAt: user.subscriptionExpiry, daysRemaining };
      }
    }

    return { isActive: false, plan: 'none', expiresAt: '', daysRemaining: 0 };
  } catch (e) {
    console.error('Error checking subscription:', e);
    return { isActive: false, plan: 'none', expiresAt: '', daysRemaining: 0 };
  }
};

interface SubscriptionRequiredProps { category?: string; returnUrl?: string; }

const SubscriptionRequiredPage = ({ category = 'listing', returnUrl }: SubscriptionRequiredProps) => {
  const navigate = useNavigate();

  const getCategoryIcon = () => {
    switch (category?.toLowerCase()) {
      case 'job': case 'jobs':                return <Briefcase className="w-8 h-8 text-blue-500" />;
      case 'marketplace': case 'item':        return <ShoppingBag className="w-8 h-8 text-teal-500" />;
      case 'rental': case 'rentals':          return <Home className="w-8 h-8 text-purple-500" />;
      case 'vehicle': case 'vehicles':        return <Car className="w-8 h-8 text-orange-500" />;
      case 'service': case 'services':        return <Wrench className="w-8 h-8 text-green-500" />;
      case 'exchange':                        return <ArrowLeftRight className="w-8 h-8 text-pink-500" />;
      default:                                return <ShoppingBag className="w-8 h-8 text-teal-500" />;
    }
  };

  const handleSubscribe = () => {
    if (returnUrl) { localStorage.setItem('Bambeh_subscription_return', returnUrl); }
    navigate('/subscription');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Subscription Required</h1>
            <p className="text-teal-100">Unlock full access to view details</p>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
              <div className="w-14 h-14 bg-white rounded-xl shadow flex items-center justify-center">{getCategoryIcon()}</div>
              <div>
                <p className="text-gray-600 text-sm">You're trying to view</p>
                <p className="text-gray-900 font-semibold capitalize">{category} Details</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1"><Crown className="w-5 h-5 text-yellow-600" /><span className="text-yellow-800 font-bold">Daily Access</span></div>
                  <p className="text-gray-600 text-sm">Full access to all listings</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">100 <span className="text-lg">XAF</span></p>
                  <p className="text-yellow-700 text-sm font-medium">per day</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-teal-500" />What you get:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['View all job details','View marketplace items','View rental listings','View vehicle details','View service providers','View exchange offers','Contact sellers directly','Apply to jobs'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-gray-700"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span className="text-sm">{b}</span></div>
                ))}
              </div>
            </div>
            <button onClick={handleSubscribe} className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />Subscribe for 100 XAF/day<ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="text-center mt-6">
          <button onClick={() => window.history.back()} className="text-gray-600 hover:text-gray-800 font-medium">← Go Back to Browsing</button>
        </div>
      </div>
    </div>
  );
};

interface SubscriptionGateProps { children: React.ReactNode; category?: string; }

export default function SubscriptionGate({ children, category = 'listing' }: SubscriptionGateProps) {
  const [isChecking, setIsChecking]       = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const subscription = checkSubscription();
    setHasSubscription(subscription.isActive);
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasSubscription) {
    return <SubscriptionRequiredPage category={category} returnUrl={location.pathname} />;
  }

  return <>{children}</>;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData>({ isActive: false, plan: 'none', expiresAt: '', daysRemaining: 0 });
  useEffect(() => { setSubscription(checkSubscription()); }, []);
  const refresh = () => { setSubscription(checkSubscription()); };
  return { ...subscription, refresh };
};

export { checkSubscription, SubscriptionRequiredPage };
