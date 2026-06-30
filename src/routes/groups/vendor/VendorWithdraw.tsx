/**
 * ---------------------------------------------------------------------------
 * VendorWithdraw.tsx ? BAMBEH VENDOR PORTAL
 * ? 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Smartphone, CreditCard, Building2, CheckCircle,
  AlertCircle, Shield, Clock, ChevronRight, Wallet, Lock,
  Info, Eye, EyeOff, Zap, Check
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

type PaymentMethod = 'mtn' | 'orange' | 'card' | 'bank';
type Step = 'method' | 'details' | 'confirm' | 'success';

interface MethodConfig {
  id: PaymentMethod;
  label: string;
  shortLabel: string;
  logo: string;
  color: string;
  bg: string;
  gradient: string;
  description: string;
  fee: string;
  time: string;
  minAmount: number;
  maxAmount: number;
  popular?: boolean;
}

const METHODS: MethodConfig[] = [
  {
    id: 'mtn', label: 'MTN Mobile Money', shortLabel: 'MTN MoMo', logo: '??',
    color: 'border-yellow-400 text-yellow-700', bg: 'bg-yellow-50',
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    description: 'Instant transfer to your MTN MoMo wallet',
    fee: 'Free', time: 'Instant ? 5 min', minAmount: 1000, maxAmount: 500000, popular: true,
  },
  {
    id: 'orange', label: 'Orange Money', shortLabel: 'Orange Money', logo: '??',
    color: 'border-orange-400 text-orange-700', bg: 'bg-orange-50',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    description: 'Transfer to your Orange Money account',
    fee: 'Free', time: 'Instant ? 10 min', minAmount: 1000, maxAmount: 300000, popular: true,
  },
  {
    id: 'card', label: 'Visa / Mastercard', shortLabel: 'Card', logo: '??',
    color: 'border-blue-400 text-blue-700', bg: 'bg-blue-50',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    description: 'Withdraw directly to your debit or credit card',
    fee: '1.5%', time: '1 ? 3 business days', minAmount: 5000, maxAmount: 2000000,
  },
  {
    id: 'bank', label: 'Bank Transfer', shortLabel: 'Bank', logo: '??',
    color: 'border-emerald-400 text-emerald-700', bg: 'bg-emerald-50',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    description: 'Direct transfer to your bank account in ',
    fee: '500 XAF flat', time: '24 ? 48 hours', minAmount: 10000, maxAmount: 5000000,
  },
];

const _BANKS = [
  'Afriland First Bank', 'Soci?t? G?n?rale Cameroun (SGC)',
  'Standard Chartered Bank ', 'UBA ',
  'Ecobank ', 'BICEC (Banque Internationale du Cameroun)',
  'CCA Bank', 'CBC Bank', 'Atlantic Bank ',
  'BGFI Bank ', 'NFC Bank', 'AMITY Bank', 'Autre (Other)',
];

const formatXAF = (n: number) => `${n.toLocaleString('fr-CM')} XAF`;

const validate = (method: PaymentMethod, fields: Record<string, string>, amount: string): Record<string, string> => {
  const errs: Record<string, string> = {};
  const amt = parseInt(amount || '0');
  const cfg = METHODS.find(m => m.id === method)!;

  if (!amount) { errs.amount = 'Please enter an amount'; }
  else if (isNaN(amt) || amt < cfg.minAmount) { errs.amount = `Minimum is ${formatXAF(cfg.minAmount)}`; }
  else if (amt > cfg.maxAmount) { errs.amount = `Maximum is ${formatXAF(cfg.maxAmount)}`; }

  if (method === 'mtn' || method === 'orange') {
    if (!fields.phone) errs.phone = 'Phone number is required';
    else if (!/^(6[5-9]\d{7}|6[0-4]\d{7})$/.test(fields.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid  number (e.g. 677 000 000)';
    if (method === 'mtn' && fields.phone && !fields.phone.replace(/\s/g, '').startsWith('67') && !fields.phone.replace(/\s/g, '').startsWith('68'))
      errs.phone = 'MTN numbers start with 67 or 68';
    if (method === 'orange' && fields.phone && !fields.phone.replace(/\s/g, '').startsWith('69') && !fields.phone.replace(/\s/g, '').startsWith('65'))
      errs.phone = 'Orange numbers start with 69 or 65';
  }
  if (method === 'card') {
    if (!fields.cardName) errs.cardName = 'Cardholder name is required';
    if (!fields.cardNumber) errs.cardNumber = 'Card number is required';
    else if (fields.cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Enter 16-digit card number';
    if (!fields.expiry) errs.expiry = 'Expiry date is required';
    if (!fields.cvv) errs.cvv = 'CVV is required';
  }
  if (method === 'bank') {
    if (!fields.bankName) errs.bankName = 'Select your bank';
    if (!fields.accountName) errs.accountName = 'Account name is required';
    if (!fields.accountNo) errs.accountNo = 'Account number is required';
    else if (fields.accountNo.length < 10) errs.accountNo = 'Enter a valid account number';
  }
  return errs;
};

const VendorWithdraw: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCVV, setShowCVV] = useState(false);

  const BALANCE = 151750;
  const cfg = METHODS.find(m => m.id === selectedMethod);

  const computeFee = (): string => {
    if (!cfg || !amount) return '?';
    const amt = parseInt(amount);
    if (isNaN(amt)) return '?';
    if (cfg.id === 'card') return formatXAF(Math.round(amt * 0.015));
    if (cfg.id === 'bank') return '500 XAF';
    return 'Free';
  };

  const computeReceive = (): number => {
    if (!cfg || !amount) return 0;
    const amt = parseInt(amount);
    if (isNaN(amt)) return 0;
    if (cfg.id === 'card') return Math.round(amt * 0.985);
    if (cfg.id === 'bank') return amt - 500;
    return amt;
  };

  const setField = (key: string, val: string) => {
    setFields(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const goToDetails = () => {
    if (!selectedMethod) return;
    setStep('details');
  };

  const goToConfirm = () => {
    const errs = validate(selectedMethod!, fields, amount);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep('confirm');
  };

  const goToSuccess = () => setStep('success');

  const reset = () => {
    setStep('method');
    setSelectedMethod(null);
    setAmount('');
    setFields({});
    setErrors({});
  };

  const STEPS = ['Select Method', 'Enter Details', 'Confirm', 'Done'];
  const stepIndex = { method: 0, details: 1, confirm: 2, success: 3 }[step];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fc' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => {
              if (step === 'method') navigate('/vendor/payments');
              else if (step === 'details') setStep('method');
              else if (step === 'confirm') setStep('details');
              else setStep('method');
            }}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Withdraw Funds</h1>
            <p className="text-xs text-gray-500">Available: <span className="font-bold text-green-600">{formatXAF(BALANCE)}</span></p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="flex items-center gap-1">
            {STEPS.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < stepIndex ? 'bg-green-500 text-white' :
                    i === stepIndex ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-[9px] font-medium whitespace-nowrap ${i === stepIndex ? 'text-teal-700' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 rounded-full transition-all ${i < stepIndex ? 'bg-green-400' : 'bg-gray-200'}`}/>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-20">

        {/* STEP 1 ? SELECT METHOD */}
        {step === 'method' && (
          <>
            <div className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0369a1 100%)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
              <p className="text-green-100 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-black">{formatXAF(BALANCE)}</p>
              <p className="text-green-200 text-xs mt-2">?? Minimum withdrawal: 1,000 XAF</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">How much do you want to withdraw?</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">XAF</span>
                <input type="number" value={amount}
                  onChange={e => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors(p => { const n = { ...p }; delete n.amount; return n; });
                  }}
                  placeholder="0"
                  className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 text-2xl font-black text-gray-900" />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.amount}
                </p>
              )}
              <div className="flex gap-2 mt-3 flex-wrap">
                {[10000, 25000, 50000, 100000].map(q => (
                  <button key={q} onClick={() => setAmount(String(q))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      amount === String(q) ? 'bg-teal-600 text-white border-teal-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-300'
                    }`}>
                    {formatXAF(q)}
                  </button>
                ))}
                <button onClick={() => setAmount(String(BALANCE))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-green-50 text-green-700 border-green-200 hover:border-green-400 transition-all">
                  All ({formatXAF(BALANCE)})
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-3">Choose withdrawal method</h2>
              <div className="space-y-3">
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedMethod === m.id ? 'border-teal-500 bg-teal-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: m.gradient }}>
                      {m.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">{m.label}</p>
                        {m.popular && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">Popular</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-teal-500" /> {m.time}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500">
                          Fee: <span className={m.fee === 'Free' ? 'text-green-600' : 'text-gray-700'}>{m.fee}</span>
                        </span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedMethod === m.id ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                    }`}>
                      {selectedMethod === m.id && <div className="w-2 h-2 bg-white rounded-full"/>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedMethod && cfg && (
              <div className={`${cfg.bg} rounded-xl p-3 flex items-start gap-2`}>
                <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  Limits for {cfg.label}: min <strong>{formatXAF(cfg.minAmount)}</strong> ? max <strong>{formatXAF(cfg.maxAmount)}</strong>
                </p>
              </div>
            )}

            <button
              onClick={() => {
                const errs: Record<string, string> = {};
                if (!amount) errs.amount = 'Please enter an amount';
                if (!selectedMethod) { alert('Please select a payment method'); return; }
                const amt = parseInt(amount);
                if (isNaN(amt) || amt < cfg!.minAmount) errs.amount = `Minimum is ${formatXAF(cfg!.minAmount)}`;
                if (amt > BALANCE) errs.amount = `Amount exceeds your balance of ${formatXAF(BALANCE)}`;
                setErrors(errs);
                if (Object.keys(errs).length === 0) goToDetails();
              }}
              disabled={!selectedMethod || !amount}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
              Continue <ChevronRight className="inline w-5 h-5 ml-1" />
            </button>
          </>
        )}

        {/* STEP 2 ? ENTER DETAILS */}
        {step === 'details' && cfg && (
          <>
            <div className="rounded-2xl p-4 text-white flex items-center gap-3" style={{ background: cfg.gradient }}>
              <span className="text-3xl">{cfg.logo}</span>
              <div>
                <p className="font-bold">{cfg.label}</p>
                <p className="text-sm opacity-90">{formatXAF(parseInt(amount || '0'))} withdrawal</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              {selectedMethod === 'mtn' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">MTN Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm font-semibold text-gray-600">+237</span>
                      <input type="tel" value={fields.phone || ''}
                        onChange={e => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="677 000 000"
                        className={`flex-1 px-4 py-3 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                    <p className="text-xs text-gray-400 mt-1">MTN numbers: 67x or 68x</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Account Name (MoMo registered name)</label>
                    <input type="text" value={fields.accountName || ''}
                      onChange={e => setField('accountName', e.target.value)}
                      placeholder="e.g. Jean-Paul Mbarga"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm" />
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800">Make sure your MTN MoMo account is active and linked to this phone number.</p>
                  </div>
                </>
              )}

              {selectedMethod === 'orange' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Orange Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm font-semibold text-gray-600">+237</span>
                      <input type="tel" value={fields.phone || ''}
                        onChange={e => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="699 000 000"
                        className={`flex-1 px-4 py-3 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                    <p className="text-xs text-gray-400 mt-1">Orange numbers: 69x or 65x</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Account Name</label>
                    <input type="text" value={fields.accountName || ''}
                      onChange={e => setField('accountName', e.target.value)}
                      placeholder="e.g. Amina Ngono"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm" />
                  </div>
                </>
              )}

              {selectedMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Cardholder Name <span className="text-red-500">*</span></label>
                    <input type="text" value={fields.cardName || ''}
                      onChange={e => setField('cardName', e.target.value)}
                      placeholder="e.g. NGONO JEAN PIERRE"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm uppercase ${errors.cardName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                    {errors.cardName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cardName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Card Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" value={fields.cardNumber || ''}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
                          setField('cardNumber', formatted);
                        }}
                        placeholder="0000 0000 0000 0000"
                        className={`w-full px-4 py-3 pr-20 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm tracking-widest ${errors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">VISA ? MC</div>
                    </div>
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Expiry <span className="text-red-500">*</span></label>
                      <input type="text" value={fields.expiry || ''}
                        onChange={e => {
                          let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (raw.length >= 3) raw = raw.slice(0, 2) + '/' + raw.slice(2);
                          setField('expiry', raw);
                        }}
                        placeholder="MM/YY"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${errors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                      {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">CVV <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input type={showCVV ? 'text' : 'password'} value={fields.cvv || ''}
                          onChange={e => setField('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="???"
                          className={`w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm ${errors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                        <button type="button" onClick={() => setShowCVV(!showCVV)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">Your card data is encrypted with 256-bit SSL.</p>
                  </div>
                </>
              )}

              {selectedMethod === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Bank Name <span className="text-red-500">*</span></label>
                    <select value={fields.bankName || ''}
                      onChange={e => setField('bankName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm ${errors.bankName ? 'border-red-400 bg-red-50' : 'border-gray-200'} bg-white`}>
                      <option value="">-- Select your bank --</option>
                      {_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.bankName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.bankName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Account Holder Name <span className="text-red-500">*</span></label>
                    <input type="text" value={fields.accountName || ''}
                      onChange={e => setField('accountName', e.target.value)}
                      placeholder="As it appears on your bank account"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm ${errors.accountName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                    {errors.accountName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.accountName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Account Number (RIB) <span className="text-red-500">*</span></label>
                    <input type="text" value={fields.accountNo || ''}
                      onChange={e => setField('accountNo', e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 10005 00001 00000000000 00"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm tracking-widest ${errors.accountNo ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                    {errors.accountNo && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.accountNo}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Account Type</label>
                    <div className="flex gap-3">
                      {['Savings', 'Current'].map(t => (
                        <button key={t} onClick={() => setField('accountType', t)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                            fields.accountType === t ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800">Bank transfers process in 24?48 hours. A flat fee of <strong>500 XAF</strong> applies.</p>
                  </div>
                </>
              )}
            </div>

            <button onClick={goToConfirm}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:shadow-lg hover:scale-[1.01]"
              style={{ background: cfg ? cfg.gradient : 'linear-gradient(135deg,#059669,#0d9488)' }}>
              Review Withdrawal <ChevronRight className="inline w-5 h-5 ml-1" />
            </button>
          </>
        )}

        {/* STEP 3 ? CONFIRM */}
        {step === 'confirm' && cfg && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 text-white" style={{ background: cfg.gradient }}>
                <span className="text-2xl">{cfg.logo}</span>
                <div>
                  <p className="font-bold">{cfg.label}</p>
                  <p className="text-sm opacity-90">Review your withdrawal</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { label: 'Withdrawal Amount', value: formatXAF(parseInt(amount || '0')), bold: true },
                  { label: 'Processing Fee', value: computeFee(), color: 'text-orange-600' },
                  { label: 'You Will Receive', value: formatXAF(computeReceive()), bold: true, color: 'text-green-700 text-lg' },
                  { label: 'Payment Method', value: cfg.label },
                  { label: 'To', value: fields.phone ? `+237 ${fields.phone}` : fields.accountName || fields.cardName || '?' },
                  ...(fields.bankName ? [{ label: 'Bank', value: fields.bankName }] : []),
                  { label: 'Processing Time', value: cfg.time, color: 'text-teal-600' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className={`text-sm ${row.bold ? 'font-black' : 'font-semibold'} ${(row as any).color || 'text-gray-900'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-800">This transaction is protected by Bambeh's secure payment infrastructure.</p>
            </div>

            <button onClick={goToSuccess}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:shadow-xl hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
              ? Confirm Withdrawal
            </button>
            <button onClick={() => setStep('details')}
              className="w-full py-3 rounded-2xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">
              ? Go back and edit
            </button>
          </>
        )}

        {/* STEP 4 ? SUCCESS */}
        {step === 'success' && cfg && (
          <div className="text-center py-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Withdrawal Requested!</h2>
            <p className="text-gray-500 text-sm mb-1">
              <span className="font-bold text-green-600">{formatXAF(computeReceive())}</span> will arrive in your {cfg.shortLabel} account.
            </p>
            <p className="text-gray-400 text-xs mb-8">Expected in: <span className="font-semibold text-teal-600">{cfg.time}</span></p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs text-gray-400 mb-1">Reference Number</p>
              <p className="font-mono font-bold text-gray-800 text-lg tracking-widest">BWD-{Date.now().toString().slice(-8)}</p>
              <p className="text-xs text-gray-400 mt-1">Keep this for your records</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left mb-6">
              <p className="font-bold text-gray-800 text-sm mb-3">What happens next?</p>
              {[
                'Your withdrawal request has been received ?',
                'Our team will process it within the stated time',
                `Funds will be sent to your ${cfg.shortLabel} account`,
                'You will receive an SMS/email confirmation',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-gray-600">{item}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <button onClick={() => navigate('/vendor/payments')}
                className="w-full py-4 rounded-2xl text-white font-bold transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                Back to Payments
              </button>
              <button onClick={reset}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">
                Make Another Withdrawal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorWithdraw;






