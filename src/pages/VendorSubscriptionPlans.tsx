import { useState } from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

export default function VendorSubscriptionPlans() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'basic',
      name: 'Vendor Basic',
      price: 'Free',
      priceValue: 0,
      icon: Star,
      color: 'from-gray-400 to-gray-500',
      badge: null,
      features: [
        '5 product listings',
        'Basic storefront',
        'Standard support',
        'Access to marketplace',
        'Customer messaging'
      ]
    },
    {
      id: 'standard',
      name: 'Vendor Standard',
      price: '5,000 XAF/month',
      priceValue: 5000,
      icon: Zap,
      color: 'from-teal-500 to-blue-500',
      badge: 'Popular',
      features: [
        '50 product listings',
        'Priority placement',
        'Advanced analytics dashboard',
        'Priority support',
        'Bulk listing upload',
        'Featured badge'
      ]
    },
    {
      id: 'premium',
      name: 'Vendor Premium',
      price: '12,000 XAF/month',
      priceValue: 12000,
      icon: Crown,
      color: 'from-purple-600 to-pink-600',
      badge: 'Best Value',
      features: [
        'Unlimited product listings',
        'Top search placement',
        'Full analytics + custom reports',
        'Dedicated support (4h response)',
        'All Standard features',
        'Verified vendor badge',
        'API access',
        'Custom storefront branding'
      ]
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    alert(`You selected the ${plans.find(p => p.id === planId)?.name} plan. Payment flow coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Vendor Subscription Plans</h1>
          <p className="text-lg text-gray-600">Choose the plan that fits your business. Upgrade or downgrade anytime.</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isPremium = plan.id === 'premium';

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl p-8 flex flex-col transition-all duration-300 ${
                  isPremium
                    ? 'ring-4 ring-purple-500 transform scale-105'
                    : 'hover:shadow-2xl hover:-translate-y-1'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold bg-gradient-to-r ${plan.color}`}>
                    {plan.badge}
                  </div>
                )}
                {/* Icon + Name */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className={`text-3xl font-bold mb-6 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                  {plan.price}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all bg-gradient-to-r ${plan.color} hover:shadow-lg hover:scale-105 active:scale-95`}
                >
                  {plan.priceValue === 0 ? 'Get Started Free' : 'Choose Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-10">
          All plans include MTN Mobile Money and Orange Money payment options.
          Prices are in XAF (Central African Franc).
        </p>
      </div>
    </div>
  );
}





