/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMMISSION TRACKER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Displays vendor's commission breakdown:
 * ✅ Commission summary by transaction type
 * ✅ 1% rate on products, services, rentals
 * ✅ 1,000 XAF flat fee for job postings
 * ✅ Recent commission history
 * ✅ Commission calculator preview
 * 
 * FILE LOCATION: src/components/vendor/CommissionTracker.tsx
 * 
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingDown,
  ShoppingBag,
  Briefcase,
  Home,
  FileText,
  ChevronRight,
  Info,
  PieChart,
  Calendar,
  DollarSign,
  ArrowDown,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface CommissionRecord {
  vendorId?: string;
  id: string;
  transactionType: 'product_sale' | 'service_booking' | 'rental' | 'job_posting';
  transactionAmount: number;
  commissionAmount: number;
  status: 'pending' | 'deducted' | 'refunded';
  createdAt: string;
}

interface CommissionSummary {
  totalCommissionsPaid: number;
  commissionsThisMonth: number;
  commissionsLastMonth: number;
  pendingCommissions: number;
  transactionCount: number;
  byType: {
    product_sale: number;
    service_booking: number;
    rental: number;
    job_posting: number;
  };
}

interface CommissionTrackerProps {
  vendorId: string;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMISSION RATES (1% for all, 1000 XAF for jobs)
// ═══════════════════════════════════════════════════════════════════════════

const COMMISSION_RATES = {
  product_sale: { rate: 0.01, flatFee: 0, label: 'Product Sales', icon: ShoppingBag, color: 'teal' },
  service_booking: { rate: 0.01, flatFee: 0, label: 'Services', icon: Briefcase, color: 'blue' },
  rental: { rate: 0.01, flatFee: 0, label: 'Rentals', icon: Home, color: 'purple' },
  job_posting: { rate: 0, flatFee: 1000, label: 'Job Posts', icon: FileText, color: 'orange' },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════

export default function CommissionTracker({ vendorId, compact = false }: CommissionTrackerProps) {
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [recentCommissions, setRecentCommissions] = useState<CommissionRecord[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcType, setCalcType] = useState<keyof typeof COMMISSION_RATES>('product_sale');
  const [calcAmount, setCalcAmount] = useState<string>('');

  // Load commission data
  useEffect(() => {
    loadCommissionData();
    
    const handleUpdate = () => loadCommissionData();
    window.addEventListener('commissionsUpdated', handleUpdate);
    
    return () => window.removeEventListener('commissionsUpdated', handleUpdate);
  }, [vendorId]);

  const loadCommissionData = () => {
    try {
      // Load from localStorage (in production, from backend)
      const stored = localStorage.getItem('Bambeh_vendor_commissions');
      const allRecords: CommissionRecord[] = stored ? JSON.parse(stored) : [];
      const vendorRecords = allRecords.filter(r => r.vendorId === vendorId);
      
      // Calculate summary
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
      
      const calculatedSummary: CommissionSummary = {
        totalCommissionsPaid: vendorRecords
          .filter(r => r.status === 'deducted')
          .reduce((sum, r) => sum + r.commissionAmount, 0),
        commissionsThisMonth: vendorRecords
          .filter(r => r.createdAt >= startOfThisMonth)
          .reduce((sum, r) => sum + r.commissionAmount, 0),
        commissionsLastMonth: vendorRecords
          .filter(r => r.createdAt >= startOfLastMonth && r.createdAt <= endOfLastMonth)
          .reduce((sum, r) => sum + r.commissionAmount, 0),
        pendingCommissions: vendorRecords
          .filter(r => r.status === 'pending')
          .reduce((sum, r) => sum + r.commissionAmount, 0),
        transactionCount: vendorRecords.length,
        byType: {
          product_sale: vendorRecords
            .filter(r => r.transactionType === 'product_sale')
            .reduce((sum, r) => sum + r.commissionAmount, 0),
          service_booking: vendorRecords
            .filter(r => r.transactionType === 'service_booking')
            .reduce((sum, r) => sum + r.commissionAmount, 0),
          rental: vendorRecords
            .filter(r => r.transactionType === 'rental')
            .reduce((sum, r) => sum + r.commissionAmount, 0),
          job_posting: vendorRecords
            .filter(r => r.transactionType === 'job_posting')
            .reduce((sum, r) => sum + r.commissionAmount, 0),
        },
      };
      
      setSummary(calculatedSummary);
      setRecentCommissions(vendorRecords.slice(0, 10));
    } catch (error) {
      console.error('Error loading commission data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', { style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' XAF';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateCommission = () => {
    const amount = parseFloat(calcAmount) || 0;
    const config = COMMISSION_RATES[calcType];
    
    if (config.flatFee > 0) {
      return config.flatFee;
    }
    return Math.round(amount * config.rate);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deducted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'refunded': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'deducted': return 'Deducted';
      case 'pending': return 'Pending';
      case 'refunded': return 'Refunded';
      default: return status;
    }
  };

  // Demo data if no records
  const demoSummary: CommissionSummary = summary || {
    totalCommissionsPaid: 0,
    commissionsThisMonth: 0,
    commissionsLastMonth: 0,
    pendingCommissions: 0,
    transactionCount: 0,
    byType: {
      product_sale: 0,
      service_booking: 0,
      rental: 0,
      job_posting: 0,
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COMPACT VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-900">Commissions</h3>
          </div>
          <span className="text-xs text-gray-500">1% rate</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">This Month</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(demoSummary.commissionsThisMonth)}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-yellow-700">Pending</p>
            <p className="text-lg font-bold text-yellow-700">{formatCurrency(demoSummary.pendingCommissions)}</p>
          </div>
        </div>
      </div>
    );
  }

  // FULL VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Commission Tracker</h2>
              <p className="text-white/80 text-sm">Track your platform fees</p>
            </div>
          </div>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
          >
            <Calculator className="w-5 h-5" />
            <span className="text-sm font-medium">Calculator</span>
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-xs">This Month</p>
            <p className="text-2xl font-bold">{formatCurrency(demoSummary.commissionsThisMonth)}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-xs">Last Month</p>
            <p className="text-2xl font-bold">{formatCurrency(demoSummary.commissionsLastMonth)}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-xs">Pending</p>
            <p className="text-2xl font-bold">{formatCurrency(demoSummary.pendingCommissions)}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-xs">Total Paid</p>
            <p className="text-2xl font-bold">{formatCurrency(demoSummary.totalCommissionsPaid)}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Commission Calculator */}
        {showCalculator && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Commission Calculator
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  value={calcType}
                  onChange={(e) => setCalcType(e.target.value as keyof typeof COMMISSION_RATES)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="product_sale">Product Sale (1%)</option>
                  <option value="service_booking">Service Booking (1%)</option>
                  <option value="rental">Rental (1%)</option>
                  <option value="job_posting">Job Posting (1,000 XAF/month)</option>
                </select>
              </div>
              
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Amount (XAF)
                </label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="Enter amount..."
                  disabled={calcType === 'job_posting'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              
              {/* Result */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Amount
                </label>
                <div className="bg-white rounded-lg px-4 py-3 border-2 border-red-300">
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(calculateCommission())}
                  </p>
                  <p className="text-xs text-gray-500">
                    {calcType === 'job_posting' 
                      ? 'Flat fee per month' 
                      : `You receive: ${formatCurrency((parseFloat(calcAmount) || 0) - calculateCommission())}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )},
        {/* Commission Rates Info */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-600" />
            Bambeh Commission Rates
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(COMMISSION_RATES).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className={`w-10 h-10 rounded-lg bg-${config.color}-100 flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 text-${config.color}-600`} />
                  </div>
                  <p className="font-semibold text-gray-900">{config.label}</p>
                  <p className="text-lg font-bold text-red-600">
                    {config.flatFee > 0 
                      ? `${formatCurrency(config.flatFee)}/mo`
                      : `${config.rate * 100}%`
                    }
                  </p>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <strong>Lowest in !</strong> Only 1% commission on all transactions.
            </p>
          </div>
        </div>

        {/* Commission Breakdown by Type */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gray-600" />
            Breakdown by Type
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(COMMISSION_RATES).map(([key, config]) => {
              const Icon = config.icon;
              const amount = demoSummary.byType[key as keyof typeof demoSummary.byType];
              
              return (
                <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{config.label}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Commission History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Recent Commissions
            </h3>
          </div>

          {recentCommissions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No commission records yet</p>
              <p className="text-sm text-gray-400">Commissions will appear here after transactions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCommissions.map((record) => {
                const config = COMMISSION_RATES[record.transactionType];
                const Icon = config.icon;
                
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${config.color}-600`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{config.label}</p>
                        <p className="text-sm text-gray-500">
                          Transaction: {formatCurrency(record.transactionAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">-{formatCurrency(record.commissionAmount)}</p>
                      <div className="flex items-center gap-1 text-xs">
                        {getStatusIcon(record.status)}
                        <span className="text-gray-500">{getStatusLabel(record.status)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* How Commissions Work */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4">How Commissions Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Transaction Completes</p>
                <p className="text-gray-600">When a buyer completes a purchase, booking, or rental</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Commission Calculated</p>
                <p className="text-gray-600">1% is automatically calculated from the transaction amount</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Deducted on Withdrawal</p>
                <p className="text-gray-600">Commission is deducted when you withdraw your earnings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
