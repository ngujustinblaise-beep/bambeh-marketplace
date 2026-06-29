/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOBILE PAYMENT MODAL - MTN MoMo & Orange Money Integration
 * ═══════════════════════════════════════════════════════════════════════════
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Smartphone
} from 'lucide-react';

interface MobilePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: (transactionId: string) => void;
  onError?: (error: string) => void;
}

type PaymentStep = 'phone' | 'confirm' | 'pin' | 'processing' | 'success' | 'error';
type Carrier = 'mtn' | 'orange' | 'unknown';

const MTN_PREFIXES = ['67', '650', '651', '652', '653', '654', '680', '681', '682', '683'];
const ORANGE_PREFIXES = ['69', '655', '656', '657', '658', '659'];

export default function MobilePaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  onSuccess,
  onError
}: MobilePaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [carrier, setCarrier] = useState<Carrier>('unknown');
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhoneNumber('');
      setPin('');
      setCarrier('unknown');
      setError('');
      setTransactionId('');
    }
  }, [isOpen]);

  const detectCarrier = (phone: string): Carrier => {
    const cleanPhone = phone.replace(/\D/g, '');
    const localPhone = cleanPhone.startsWith('237') ? cleanPhone.slice(3) : cleanPhone;
    for (const prefix of MTN_PREFIXES) {
      if (localPhone.startsWith(prefix)) return 'mtn';
    }
    for (const prefix of ORANGE_PREFIXES) {
      if (localPhone.startsWith(prefix)) return 'orange';
    }
    return 'unknown';
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 9);
    setPhoneNumber(cleaned);
    setCarrier(detectCarrier(cleaned));
    setError('');
  };

  const validatePhone = (): boolean => {
    if (phoneNumber.length < 9) {
      setError('Please enter a valid 9-digit phone number');
      return false;
    }
    if (carrier === 'unknown') {
      setError('Please enter a valid MTN or Orange number');
      return false;
    }
    return true;
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const pinLength = carrier === 'mtn' ? 5 : 4;
    const newPin = pin.split('');
    newPin[index] = value;
    const updatedPin = newPin.join('').slice(0, pinLength);
    setPin(updatedPin);

    if (value && index < pinLength - 1) {
      pinInputRefs.current[index + 1]?.focus();
    }

    if (updatedPin.length === pinLength) {
      setTimeout(() => processPayment(updatedPin), 300);
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const processPayment = async (finalPin: string) => {
    setStep('processing');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const txId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const transaction = {
        id: txId,
        amount,
        carrier,
        phoneNumber: `+237${phoneNumber}`,
        description,
        status: 'success',
        timestamp: new Date().toISOString()
      };

      const transactions = JSON.parse(localStorage.getItem('Bambeh_transactions') || '[]');
      transactions.push(transaction);
      localStorage.setItem('Bambeh_transactions', JSON.stringify(transactions));

      setTransactionId(txId);
      setStep('success');

      setTimeout(() => {
        onSuccess(txId);
      }, 1500);
    } catch (err) {
      setError('Payment failed. Please try again.');
      setStep('error');
      onError?.('Payment failed');
    }
  };

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
          <Phone className="w-8 h-8 text-teal-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Your Phone Number</h3>
        <p className="text-gray-600">We'll detect your mobile money provider automatically</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">+237</span>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="6XXXXXXXX"
            className="w-full pl-16 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            maxLength={9}
          />
        </div>

        {carrier !== 'unknown' && (
          <div className={`mt-3 p-3 rounded-lg flex items-center gap-3 ${
            carrier === 'mtn' ? 'bg-yellow-50 border border-yellow-200' : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              carrier === 'mtn' ? 'bg-yellow-500' : 'bg-orange-500'
            }`}>
              {carrier === 'mtn' ? 'MTN' : 'OR'}
            </div>
            <div>
              <p className={`font-semibold ${carrier === 'mtn' ? 'text-yellow-800' : 'text-orange-800'}`}>
                {carrier === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}
              </p>
              <p className="text-sm text-gray-600">Detected automatically</p>
            </div>
            <CheckCircle className={`w-5 h-5 ml-auto ${carrier === 'mtn' ? 'text-yellow-600' : 'text-orange-600'}`} />
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => validatePhone() && setStep('confirm')}
        disabled={phoneNumber.length < 9 || carrier === 'unknown'}
        className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
          carrier === 'mtn' ? 'bg-yellow-100' : 'bg-orange-100'
        }`}>
          <Smartphone className={`w-8 h-8 ${carrier === 'mtn' ? 'text-yellow-600' : 'text-orange-600'}`} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h3>
        <p className="text-gray-600">Review your payment details</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount</span>
          <span className="text-2xl font-bold text-gray-900">{amount.toLocaleString()} XAF</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Description</span>
          <span className="font-semibold text-gray-900">{description}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Phone Number</span>
          <span className="font-semibold text-gray-900">+237 {phoneNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Provider</span>
          <span className={`font-bold ${carrier === 'mtn' ? 'text-yellow-600' : 'text-orange-600'}`}>
            {carrier === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}
          </span>
        </div>
      </div>

      <div className={`p-4 rounded-xl border-2 ${
        carrier === 'mtn' ? 'bg-yellow-50 border-yellow-300' : 'bg-orange-50 border-orange-300'
      }`}>
        <p className="text-sm text-gray-700 text-center">
          By clicking "Pay Now", you authorise Bambeh to deduct{' '}
          <strong>{amount.toLocaleString()} XAF</strong> from your{' '}
          {carrier === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'} account.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('phone')}
          className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button
          onClick={() => setStep('pin')}
          className={`flex-1 py-4 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            carrier === 'mtn'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
          }`}
        >
          Pay Now <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderPinStep = () => {
    const pinLength = carrier === 'mtn' ? 5 : 4;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            carrier === 'mtn' ? 'bg-yellow-100' : 'bg-orange-100'
          }`}>
            <Lock className={`w-8 h-8 ${carrier === 'mtn' ? 'text-yellow-600' : 'text-orange-600'}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Enter Your {carrier === 'mtn' ? 'MTN MoMo' : 'Orange Money'} PIN
          </h3>
          <p className="text-gray-600">
            {pinLength}-digit PIN for {carrier === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {Array.from({ length: pinLength }).map((_, index) => (
            <input
              key={index}
              ref={(el) => (pinInputRefs.current[index] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={pin[index] || ''}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handlePinKeyDown(index, e)}
              className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                carrier === 'mtn'
                  ? 'border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
                  : 'border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Your PIN is encrypted and secure</span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        <button
          onClick={() => setStep('confirm')}
          className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </div>
    );
  };

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
        carrier === 'mtn' ? 'bg-yellow-100' : 'bg-orange-100'
      }`}>
        <Loader2 className={`w-10 h-10 animate-spin ${
          carrier === 'mtn' ? 'text-yellow-600' : 'text-orange-600'
        }`} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
      <p className="text-gray-600 mb-4">
        Please wait while we process your {carrier === 'mtn' ? 'MTN MoMo' : 'Orange Money'} payment...
      </p>
      <p className="text-sm text-gray-500">Do not close this window</p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
      <p className="text-gray-600 mb-4">
        Your payment of <strong>{amount.toLocaleString()} XAF</strong> has been processed.
      </p>
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-600">Transaction ID</p>
        <p className="font-mono font-bold text-teal-600">{transactionId}</p>
      </div>
      <p className="text-sm text-green-600 font-semibold">✅ Access granted! Redirecting...</p>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h3>
      <p className="text-gray-600 mb-6">{error || 'Something went wrong. Please try again.'}</p>
      <button
        onClick={() => {
          setError('');
          setPin('');
          setStep('phone');
        }}
        className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold hover:from-teal-700 hover:to-teal-800 transition-all"
      >
        Try Again
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && step !== 'processing' && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${
          carrier === 'mtn'
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
            : carrier === 'orange'
            ? 'bg-gradient-to-r from-orange-400 to-orange-500'
            : 'bg-gradient-to-r from-teal-500 to-teal-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">
                  {carrier === 'mtn' ? 'MTN Mobile Money' : carrier === 'orange' ? 'Orange Money' : 'Mobile Payment'}
                </h2>
                <p className="text-white/80 text-sm">{amount.toLocaleString()} XAF</p>
              </div>
            </div>
            {step !== 'processing' && (
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'phone' && renderPhoneStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'pin' && renderPinStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'success' && renderSuccessStep()}
          {step === 'error' && renderErrorStep()}
        </div>

        {/* Footer */}
        {step !== 'processing' && step !== 'success' && (
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Secured by Bambeh Payment Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



