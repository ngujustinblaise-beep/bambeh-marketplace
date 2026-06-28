/**
 * ---------------------------------------------------------------------------
 * VendorPayments.tsx � BAMBEH VENDOR PORTAL
 * Earnings tracker, withdrawal requests, payment history
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Download,
  Clock, CheckCircle, AlertCircle, Smartphone, ArrowUpRight,
  BarChart2, Wallet, Send, ChevronRight, Shield, ArrowUp,
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface Transaction {
  id: string;
  type: 'sale' | 'withdrawal' | 'refund' | 'commission';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  method?: string;
}

const mockTransactions: Transaction[] = [
  { id: 'TXN-001', type: 'sale',       description: 'Samsung Galaxy A54 � Order ORD-001', amount: 185000, status: 'completed', date: '2026-02-20', method: 'MTN Mobile Money' },
  { id: 'TXN-002', type: 'commission', description: 'Bambeh platform fee (5%)',           amount: -9250,  status: 'completed', date: '2026-02-20' },
  { id: 'TXN-003', type: 'sale',       description: 'Wireless Headphones � 2 � ORD-002', amount: 50000,  status: 'completed', date: '2026-02-19', method: 'Orange Money' },
  { id: 'TXN-004', type: 'withdrawal', description: 'Withdrawal to MTN Mobile Money',      amount: -100000, status: 'completed', date: '2026-02-18', method: 'MTN Mobile Money' },
  { id: 'TXN-005', type: 'sale',       description: 'Traditional Boubou � 3 � ORD-004',  amount: 54000,  status: 'pending',   date: '2026-02-20', method: 'MTN Mobile Money' },
  { id: 'TXN-006', type: 'refund',     description: 'Refund � Order ORD-005',             amount: -28000, status: 'completed', date: '2026-02-17' },
];

const formatXAF = (amount: number) => {
  const abs = Math.abs(amount);
  return `${amount < 0 ? '-' : ''}${abs.toLocaleString('fr-CM')} XAF`;
};

const VendorPayments: React.FC = () => {
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Show back-to-top button after scrolling down 300px
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const balance = 151750;
  const pending = 54000;
  const totalEarned = 289000;
  const totalWithdrawn = 100000;

  const typeConfig = {
    sale:       { label: 'Sale',       color: 'text-green-600',  bg: 'bg-green-50',  icon: TrendingUp    },
    withdrawal: { label: 'Withdrawal', color: 'text-blue-600',   bg: 'bg-blue-50',   icon: ArrowUpRight  },
    refund:     { label: 'Refund',     color: 'text-red-600',    bg: 'bg-red-50',    icon: TrendingDown  },
    commission: { label: 'Fee',        color: 'text-orange-600', bg: 'bg-orange-50', icon: BarChart2     },
  };

  const statusConfig = {
    completed: { label: 'Completed', color: 'text-green-700 bg-green-100', icon: CheckCircle },
    pending:   { label: 'Pending',   color: 'text-amber-700 bg-amber-100', icon: Clock       },
    failed:    { label: 'Failed',    color: 'text-red-700 bg-red-100',     icon: AlertCircle },
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-teal-50/10 p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-green-600" />
            Payments & Earnings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your income and manage withdrawals</p>
        </div>
        <button
          onClick={() => navigate('/vendor/payments/withdraw')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-green-200 hover:from-green-700 hover:to-teal-700 transition-all hover:scale-105"
        >
          <Send className="w-4 h-4" />
          Withdraw Funds
        </button>
      </div>

      {/* Balance Hero */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"/>
        <p className="text-green-100 text-sm mb-1 relative">Available Balance</p>
        <p className="text-4xl font-black relative">{formatXAF(balance)}</p>
        <div className="flex gap-6 mt-4 relative">
          <div>
            <p className="text-green-200 text-xs">Pending</p>
            <p className="font-bold text-lg">{formatXAF(pending)}</p>
          </div>
          <div className="w-px bg-white/20"/>
          <div>
            <p className="text-green-200 text-xs">Total Earned</p>
            <p className="font-bold text-lg">{formatXAF(totalEarned)}</p>
          </div>
          <div className="w-px bg-white/20"/>
          <div>
            <p className="text-green-200 text-xs">Withdrawn</p>
            <p className="font-bold text-lg">{formatXAF(totalWithdrawn)}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'This Month',   value: '239,000 XAF', icon: TrendingUp,  color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'Transactions', value: mockTransactions.length, icon: CreditCard, color: 'text-blue-600',  bg: 'bg-blue-50'  },
          { label: 'Avg Order',    value: '78,500 XAF', icon: BarChart2,   color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Security Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 flex items-center gap-3">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          All transactions are secured with 256-bit encryption. Withdrawals typically process within 24 hours.
        </p>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Transaction History</h2>
          <button className="flex items-center gap-1.5 text-xs text-green-600 font-semibold hover:text-green-700">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {mockTransactions.map(txn => {
            const tc = typeConfig[txn.type];
            const sc = statusConfig[txn.status];
            const Icon = tc.icon;
            const StatusIcon = sc.icon;

            return (
              <div key={txn.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className={`w-10 h-10 ${tc.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${tc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{txn.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400">{txn.date}</p>
                    {txn.method && (
                      <>
                        <span className="text-gray-200">�</span>
                        <p className="text-xs text-gray-400">{txn.method}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${txn.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {txn.amount > 0 ? '+' : ''}{formatXAF(txn.amount)}
                  </p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {sc.label}
                  </span>
                </div>
              </div>
            );
            }
              )}
        </div>
      </div>

      {/* --------------------------------------------------------------------
          BACK TO TOP BUTTON � centred below transaction list
          Visible and easy to tap on mobile and desktop
          -------------------------------------------------------------------- */}
      <div className="flex justify-center py-8">
        <button
          onClick={scrollToTop}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm shadow-lg transition-all duration-300 ${
            showBackToTop
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-40 translate-y-2 pointer-events-none'
          }`}
          style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', boxShadow: '0 8px 24px rgba(5,150,105,0.35)' }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
          Back to Top
        </button>
      </div>

    </div>
  );
}

export default VendorPayments;





