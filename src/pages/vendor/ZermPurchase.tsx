/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ZERM PURCHASE PAGE
 * © 2025 Bambé. All rights reserved.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins, CreditCard, Smartphone, Gift, Check, ArrowRight,
  Clock, ShieldCheck, AlertCircle, Info, ChevronDown, Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang, t } from "@/hooks/useAppLang";

// ─── Packages ────────────────────────────────────────────────────────────────

const ZERM_COIN_PACKAGES = [
  { id: 'starter', name: 'Starter Pack', amount: 10, bonus: 0, priceXAF: 1000 },
  { id: 'basic', name: 'Basic Pack', amount: 50, bonus: 5, priceXAF: 5000, popular: true },
  { id: 'standard', name: 'Standard Pack', amount: 100, bonus: 15, priceXAF: 10000 },
  { id: 'premium', name: 'Premium Pack', amount: 250, bonus: 50, priceXAF: 25000 },
];

const getTotalZermCoins = (pkgId: string): number => {
  const pkg = ZERM_COIN_PACKAGES.find(p => p.id === pkgId);
  if (!pkg) return 0;
  return pkg.amount + (pkg.bonus || 0);
};

// ─── Payment Methods ──────────────────────────────────────────────────────────

const paymentMethods = [
  { id: 'mtn', name: 'MTN Mobile Money', icon: '📱', color: 'bg-yellow-500', description: 'Pay with MTN MoMo' },
  { id: 'orange', name: 'Orange Money', icon: '🟠', color: 'bg-orange-500', description: 'Pay with Orange Money' },
];

// ─── Package Card ─────────────────────────────────────────────────────────────

interface PackageCardProps {
  pkg: typeof ZERM_COIN_PACKAGES[0];
  isSelected: boolean;
  onSelect: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, isSelected, onSelect }) => {
  const pricePerCoin = pkg.priceXAF / pkg.amount;
  const totalCoins = pkg.amount + (pkg.bonus || 0);

  return (
    <button
      onClick={onSelect}
      className={`relative w-full p-4 rounded-xl border-2 transition-all text-left ${
        isSelected ? 'border-teal-600 bg-teal-50 shadow-lg' : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
          <Coins className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{pkg.amount}</div>
          <div className="text-sm text-gray-500">Zerm Coins</div>
        </div>
      </div>
      {pkg.bonus > 0 && (
        <div className="mb-3 flex items-center gap-2 text-green-600">
          <Gift className="w-4 h-4" />
          <span className="text-sm font-semibold">+{pkg.bonus} bonus coins!</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold text-gray-900">{pkg.priceXAF.toLocaleString()} XAF</div>
          <div className="text-xs text-gray-500">{pricePerCoin.toFixed(0)} XAF/coin</div>
        </div>
        {pkg.bonus > 0 && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Total:</div>
            <div className="font-bold text-green-600">{totalCoins} coins</div>
          </div>
        )}
      </div>
    </button>
  );
};

// ─── Payment Method Card ──────────────────────────────────────────────────────

interface PaymentMethodCardProps {
  method: typeof paymentMethods[0];
  isSelected: boolean;
  onSelect: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ method, isSelected, onSelect }) => (
  <button onClick={onSelect}
    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
      isSelected ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-300'
    }`}>
    <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-2xl`}>
      {method.icon}
    </div>
    <div className="flex-1 text-left">
      <div className="font-semibold text-gray-900">{method.name}</div>
      <div className="text-sm text-gray-500">{method.description}</div>
    </div>
    {isSelected && (
      <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
        <Check className="w-4 h-4 text-white" />
      </div>
    )}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ZermPurchase() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const { currentUser } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const currentBalance = 0;

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedPayment || !phoneNumber) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowSuccess(true);
  };

  const pkg = ZERM_COIN_PACKAGES.find(p => p.id === selectedPackage);
  const totalCoins = pkg ? getTotalZermCoins(pkg.id) : 0;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h1>
          <p className="text-gray-600 mb-6">{totalCoins} Zerm coins have been added to your wallet.</p>
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl mb-6">
            <div className="flex items-center justify-center gap-3">
              <Coins className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">{totalCoins}</span>
              <span className="text-gray-600">Zerm</span>
            </div>
          </div>
          <div className="space-y-3">
            <Link to="/profile"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">
              View Wallet <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/marketplace"
              className="w-full block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buy Zerm Coins</h1>
          <p className="text-gray-600 mb-4">1 Zerm = 100 XAF • Use coins for purchases, ads, and premium features</p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-lg">
            <Wallet className="w-6 h-6 text-yellow-600" />
            <div className="text-left">
              <div className="text-sm text-gray-500">Your Balance</div>
              <div className="text-xl font-bold text-gray-900">{currentBalance} Zerm</div>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-800 mb-1">No Free Coins Policy</h3>
            <p className="text-sm text-blue-700">
              Zerm coins are not given free to any subscription tier. All coins must be purchased.
              However, higher tier packages include bonus coins for better value!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Packages */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Package</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ZERM_COIN_PACKAGES.map((p) => (
                  <PackageCard key={p.id} pkg={p}
                    isSelected={selectedPackage === p.id}
                    onSelect={() => setSelectedPackage(p.id)} />
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard key={method.id} method={method}
                    isSelected={selectedPayment === method.id}
                    onSelect={() => setSelectedPayment(method.id)} />
                ))}
              </div>

              {selectedPayment && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedPayment === 'mtn' ? 'MTN' : 'Orange'} Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+237</span>
                    <input type="tel" value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="6XX XXX XXX"
                      className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">You will receive a payment prompt on this number</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {selectedPackage && pkg ? (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base coins</span>
                      <span className="font-medium">{pkg.amount} Zerm</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Bonus coins</span>
                        <span className="font-medium">+{pkg.bonus} Zerm</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-bold text-gray-900">Total coins</span>
                      <span className="font-bold text-gray-900">{totalCoins} Zerm</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount to pay</span>
                      <span className="text-2xl font-bold text-gray-900">{pkg.priceXAF.toLocaleString()} XAF</span>
                    </div>
                  </div>

                  <button onClick={handlePurchase}
                    disabled={!selectedPayment || !phoneNumber || isProcessing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {isProcessing ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Processing...</>
                    ) : (
                      <><CreditCard className="w-5 h-5" />Buy Now</>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a package to continue</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Instant coin delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <button onClick={() => setShowFAQ(!showFAQ)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform ${showFAQ ? 'rotate-180' : ''}`} />
          </button>

          {showFAQ && (
            <div className="px-6 pb-6 space-y-4">
              {[
                { q: 'What are Zerm coins?', a: "Zerm coins are Bambé's digital currency. 1 Zerm = 100 XAF. Use them for purchases, promoting listings, and premium features." },
                { q: 'Do I get free coins with my subscription?', a: 'No. Zerm coins are not included in any subscription tier. All coins must be purchased separately. However, larger packages include bonus coins.' },
                { q: 'How do I receive my coins?', a: "Once your payment is confirmed, coins are instantly added to your wallet. You'll receive a confirmation notification." },
                { q: 'Do Zerm coins expire?', a: 'No, your Zerm coins never expire. Use them whenever you want!' },
                { q: 'Can I get a refund?', a: 'Zerm coin purchases are non-refundable once the coins are added to your account. Please review your purchase before confirming.' },
              ].map(({ q, a }, i) => (
                <div key={i} className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                  <p className="text-gray-600 text-sm">{a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
