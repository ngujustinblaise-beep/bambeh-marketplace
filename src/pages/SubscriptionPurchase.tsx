import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang, t } from "@/hooks/useAppLang";

interface SubscriptionTier {
  id?: any; name?: any; popular?: any; bgGradient?: any;
  icon?: any; billing?: any; priceXAF?: any; priceZerm?: any; features?: any;
}

const SubscriptionPurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string>('silver');
  const [isProcessing, setIsProcessing] = useState(false);

  const tiers: SubscriptionTier[] = [
    {
      id: 'bronze', name: 'Basic (Bronze)', icon: <Star className="h-8 w-8" />,
      priceXAF: 100, priceZerm: 1, billing: 'Daily',
      bgGradient: 'from-amber-600 to-amber-800',
      features: ['View rental property prices', 'Basic job search access', 'Contact 3 sellers per day', 'Standard support', 'Basic marketplace listings']
    },
    {
      id: 'silver', name: 'Premium (Silver)', icon: <Zap className="h-8 w-8" />,
      priceXAF: 500, priceZerm: 5, billing: 'Weekly',
      bgGradient: 'from-slate-400 to-slate-600', popular: true,
      features: ['All Bronze features', 'Unlimited seller contacts', 'Premium job applications', 'Priority support', 'Featured marketplace listings', 'Advanced search filters', '10% discount on services']
    },
    {
      id: 'gold', name: 'Gold', icon: <Crown className="h-8 w-8" />,
      priceXAF: 1500, priceZerm: 15, billing: 'Monthly',
      bgGradient: 'from-yellow-400 to-yellow-600',
      features: ['All Premium features', 'Direct landlord contact info', 'Exclusive job postings', 'VIP support (24/7)', 'Unlimited featured listings', 'AI-powered job matching', '20% discount on all services', 'Early access to new features', 'Ad-free experience']
    }
  ];

  const handleSubscribe = async (tierId: string) => {
    setIsProcessing(true);
    try {
      toast({ title: "Processing Subscription", description: "Please wait while we process your payment..." });
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: "Subscription Successful! 🎉", description: `You are now subscribed to ${tiers.find(t => t.id === tierId)?.name}` });
      const subscriptionData = { tier: tierId, startDate: new Date().toISOString(), status: 'active' };
      localStorage.setItem('Bambeh_subscription', JSON.stringify(subscriptionData));
      setTimeout(() => { navigate('/profile'); }, 1500);
    } catch (error) {
      toast({ title: "Payment Failed", description: "There was an error processing your payment. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Unlock premium features and get the most out of Bambeh marketplace</p>
          <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-indigo-900">🪙 <strong>Exchange Rate:</strong> 1 Zerm Coin = 100 XAF</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier) => (
            <Card key={tier.id}
              className={`relative overflow-hidden transition-all cursor-pointer ${selectedTier === tier.id ? 'ring-4 ring-indigo-600 shadow-2xl scale-105' : 'hover:shadow-xl hover:scale-102'}`}
              onClick={() => setSelectedTier(tier.id)}>
              {tier.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-indigo-600 text-white rounded-bl-lg rounded-tr-lg px-4 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader className={`bg-gradient-to-r ${tier.bgGradient} text-white pb-8`}>
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 p-4 rounded-full">{tier.icon}</div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">{tier.name}</CardTitle>
                <CardDescription className="text-white/90 text-center mt-2">{tier.billing} Subscription</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900">{tier.priceXAF?.toLocaleString()}</span>
                    <span className="text-xl text-gray-600">XAF</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">or {tier.priceZerm} Zerm Coin</div>
                  <div className="text-xs text-gray-400 mt-1">Billed {tier.billing?.toLowerCase()}</div>
                </div>
                <div className="space-y-3 mb-6">
                  {tier.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => handleSubscribe(tier.id)} disabled={isProcessing}
                  className={`w-full ${selectedTier === tier.id ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 hover:bg-gray-900'} text-white py-6 text-lg font-semibold`}>
                  {isProcessing && selectedTier === tier.id ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-3xl mx-auto bg-white shadow-lg">
          <CardHeader><CardTitle className="text-center">Payment Methods</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{emoji:'📱',label:'MTN MoMo'},{emoji:'🟠',label:'Orange Money'},{emoji:'💳',label:'Credit Card'},{emoji:'🪙',label:'Zerm Coins'}].map(m => (
                <div key={m.label} className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="text-3xl mb-2">{m.emoji}</div>
                  <p className="text-sm font-semibold">{m.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-6">All payments are processed securely through our trusted payment partners</p>
          </CardContent>
        </Card>

        <div className="mt-12 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription at any time from your profile settings. Your access will continue until the end of your current billing period.' },
              { q: 'Can I upgrade or downgrade?', a: 'Absolutely! You can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle.' },
              { q: 'What payment methods do you accept?', a: 'We accept MTN Mobile Money, Orange Money, credit/debit cards, and Zerm Coins for subscription payments.' },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">{faq.q}</h4>
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPurchase;




