/**
 * DONATE PAGE - SUPPORT BAMBEH
 */

import { useState } from 'react';
import { Heart, CreditCard, DollarSign } from 'lucide-react';

export default function Donate() {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mtn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const predefinedAmounts = ['1000', '5000', '10000', '25000', '50000'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = amount || customAmount;
    console.log('Donation:', { amount: donationAmount, paymentMethod, name, email, phone });
    alert(`Thank you for your donation of ${donationAmount} XAF! Redirecting to payment...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl p-8 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12" />
            <h1 className="text-5xl font-bold">Support Bambeh</h1>
          </div>
          <p className="text-xl text-pink-100 max-w-2xl mx-auto">
            Your donation helps us keep Bambeh free and accessible for all Cameroonians
          </p>
        </div>

        {/* Why Donate */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Donate?</h2>
          <div className="space-y-4 text-gray-700">
            <p className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">•</span>
              <span>Help us maintain and improve the platform</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">•</span>
              <span>Keep Bambeh free for all users</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">•</span>
              <span>Support local entrepreneurship in Cameroon</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">•</span>
              <span>Enable new features and better service</span>
            </p>
          </div>
        </div>

        {/* Donation Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>

          {/* Predefined Amounts */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Amount (XAF)
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    amount === amt
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {parseInt(amt).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Or Enter Custom Amount (XAF)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount('');
                }}
                placeholder="Enter amount..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('mtn')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  paymentMethod === 'mtn'
                    ? 'bg-yellow-500 text-black ring-2 ring-yellow-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                MTN Mobile Money
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('orange')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  paymentMethod === 'orange'
                    ? 'bg-orange-500 text-white ring-2 ring-orange-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Orange Money
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CreditCard className="w-5 h-5 inline mr-2" />
                Card
              </button>
            </div>
          </div>

          {/* Donor Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 XXX XXX XXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={(!amount && !customAmount) || !name || !email || !phone}
            className="w-full px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Donate {amount || customAmount ? `${(amount || customAmount).toLocaleString()} XAF` : ''}
          </button>
        </form>

        {/* Thank You Message */}
        <div className="mt-8 bg-pink-50 border border-pink-200 rounded-xl p-6 text-center">
          <Heart className="w-12 h-12 text-pink-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-2 text-lg">
            Thank You for Your Support! 💖
          </h3>
          <p className="text-gray-700">
            Every contribution helps us build a better Bambeh for all Cameroonians
          </p>
        </div>
      </div>
    </div>
  );
}
