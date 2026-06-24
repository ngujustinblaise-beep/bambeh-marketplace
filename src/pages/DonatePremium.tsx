import { useMemo, useState } from 'react';
import {
  Heart,
  CreditCard,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Award,
  Sparkles,
  Target,
  Calendar
} from 'lucide-react';

const MIN_DONATION = 500;
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const DONATION_TIERS = [
  { name: 'Supporter', icon: '💚', min: 500, max: 4999, color: 'from-green-400 to-emerald-600', perks: ['Bronze badge', 'Thank you email', 'Recognition on website'] },
  { name: 'Champion', icon: '⭐', min: 5000, max: 14999, color: 'from-blue-400 to-indigo-600', perks: ['Silver badge', 'Quarterly newsletter', 'Special mention', 'Early feature access'] },
  { name: 'Hero', icon: '🏆', min: 15000, max: 49999, color: 'from-purple-400 to-pink-600', perks: ['Gold badge', 'Monthly updates', 'VIP support', 'Name in credits', 'Beta features'] },
  { name: 'Legend', icon: '👑', min: 50000, max: 999999, color: 'from-yellow-400 to-orange-600', perks: ['Diamond badge', 'Direct access to team', 'Feature voting rights', 'Annual recognition', 'Lifetime VIP'] },
];

type PayMethod = 'mtn' | 'orange' | 'card';

export default function DonatePremium() {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>('mtn');
  const [donationType, setDonationType] = useState<'once' | 'monthly'>('once');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+237');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  const selectedAmount = Number(amount || customAmount || 0);
  const isValidAmount = selectedAmount >= MIN_DONATION;
  const selectedTier = useMemo(
    () => DONATION_TIERS.find(tier => selectedAmount >= tier.min && selectedAmount <= tier.max),
    [selectedAmount]
  );

  const impactStats = {
    goal: 5000000,
    raised: 3247000,
    donors: 1247,
    avgDonation: 2600
  };

  const progressPercent = (impactStats.raised / impactStats.goal) * 100;

  const normalizePhone = (value: string) => {
    const cleaned = value.replace(/\s+/g, '');
    if (cleaned.startsWith('6') && cleaned.length === 9) return `+237${cleaned}`;
    return cleaned;
  };

  const canPay = isValidAmount && phone.trim().length >= 8 && (isAnonymous || name.trim()) && (isAnonymous || email.trim());

  const handleAmountSelect = (value: number) => {
    setAmount(String(value));
    setCustomAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount) return alert('Minimum donation is 500 XAF');
    if (!phone.trim()) return alert('Please enter your phone number');

    setIsProcessing(true);
    setServerMessage('');

    try {
      const payload = {
        amount: selectedAmount,
        currency: 'XAF',
        paymentMethod,
        donationType,
        donorName: isAnonymous ? 'Anonymous' : name.trim(),
        email: isAnonymous ? '' : email.trim(),
        phone: normalizePhone(phone),
        anonymous: isAnonymous,
        source: 'donation-page'
      };

      const res = await fetch('https://bambeh-payment-server.onrender.com/api/payments/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Payment initiation failed');
      }

      if (data?.message) setServerMessage(data.message);

      if (data?.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }

      if (data?.reference || data?.transactionId) {
        setShowThankYou(true);
        return;
      }

      throw new Error('No payment reference returned by server');
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Payment prompt failed to reach the phone');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <div className="mb-8 animate-bounce">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Payment Started 🎉</h1>
          <p className="text-2xl text-purple-100 mb-8">
            Check your phone and approve the payment prompt.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <p className="text-lg mb-2">Donation:</p>
            <div className="flex items-center justify-center gap-3 text-3xl">
              {selectedTier?.icon} <span className="font-bold">{selectedTier?.name}</span>
            </div>
          </div>
          <p className="text-purple-200">{serverMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 md:p-12 mb-8 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Support Bambeh</h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Help us keep Bambeh free and accessible for all users worldwide
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2"><TrendingUp className="w-5 h-5" /><span className="text-sm">Total Raised</span></div>
                <p className="text-3xl font-bold">{(impactStats.raised / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-purple-200">XAF</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2"><Users className="w-5 h-5" /><span className="text-sm">Donors</span></div>
                <p className="text-3xl font-bold">{impactStats.donors.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2"><Target className="w-5 h-5" /><span className="text-sm">Goal Progress</span></div>
                <p className="text-3xl font-bold">{progressPercent.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Donation Frequency
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setDonationType('once')} className={`px-6 py-4 rounded-2xl font-bold transition-all ${donationType === 'once' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <Zap className="w-5 h-5 inline mr-2" /> One-Time
                </button>
                <button type="button" onClick={() => setDonationType('monthly')} className={`px-6 py-4 rounded-2xl font-bold transition-all ${donationType === 'monthly' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <TrendingUp className="w-5 h-5 inline mr-2" /> Monthly
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">Select Amount (XAF)</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {QUICK_AMOUNTS.map((amt) => (
                  <button key={amt} type="button" onClick={() => handleAmountSelect(amt)} className={`px-4 py-4 rounded-2xl font-bold transition-all ${amount === String(amt) ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Or Enter Custom Amount</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount('');
                }}
                placeholder="Enter amount..."
                min={MIN_DONATION}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 font-semibold text-lg"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button type="button" onClick={() => setPaymentMethod('mtn')} className={`p-4 rounded-2xl font-bold transition-all ${paymentMethod === 'mtn' ? 'bg-yellow-500 text-black ring-4 ring-yellow-300 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'}`}>
                  <Smartphone className="w-6 h-6 mx-auto mb-2" /> MTN MoMo
                </button>
                <button type="button" onClick={() => setPaymentMethod('orange')} className={`p-4 rounded-2xl font-bold transition-all ${paymentMethod === 'orange' ? 'bg-orange-500 text-white ring-4 ring-orange-300 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-orange-50'}`}>
                  <Smartphone className="w-6 h-6 mx-auto mb-2" /> Orange Money
                </button>
                <button type="button" onClick={() => setPaymentMethod('card')} className={`p-4 rounded-2xl font-bold transition-all ${paymentMethod === 'card' ? 'bg-blue-600 text-white ring-4 ring-blue-300 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}>
                  <CreditCard className="w-6 h-6 mx-auto mb-2" /> Card
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="anonymous" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">Donate anonymously</label>
              </div>

              {!isAnonymous && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500" required />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 6XXXXXXXX"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canPay || isProcessing}
              className={`w-full px-8 py-5 rounded-2xl font-bold text-xl transition-all ${canPay && !isProcessing ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-2xl hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <Heart className="w-6 h-6 inline mr-3" />
              {isProcessing ? 'Sending payment prompt...' : `Pay ${selectedAmount ? selectedAmount.toLocaleString() : ''} XAF`}
            </button>
            {serverMessage && <p className="mt-3 text-center text-sm text-gray-600">{serverMessage}</p>}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="font-bold text-gray-900 text-xl mb-4">Why Donate?</h3>
              <div className="space-y-3">
                {[
                  { icon: '🚀', text: 'Keep Bambeh free for all users' },
                  { icon: '⚡', text: 'Maintain platform operations' },
                  { icon: '💪', text: 'Support local entrepreneurs' },
                  { icon: '🎨', text: 'Fund new features' },
                  { icon: '🛡️', text: 'Improve security & safety' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}