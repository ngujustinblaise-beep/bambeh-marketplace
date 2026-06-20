/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * ESCROW PAGE - BAMBEH MARKETPLACE
 * Zerm Coins Escrow / Buyer Protection System
 * 
 * How it works:
 * 1. Buyer places order → Zerm Coins held in escrow (frozen)
 * 2. Seller ships / delivers
 * 3. Buyer confirms receipt → Zerm Coins released to seller
 * 4. If dispute → Admin adjudicates within 48h
 * 
 * This is the #1 trust-building feature for Cameroon's market.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
type EscrowStatus = 'pending' | 'funded' | 'in_transit' | 'delivered' | 'completed' | 'disputed' | 'refunded';

interface EscrowTransaction {
  id: string;
  orderId: string;
  itemName: string;
  itemImage: string;
  sellerName: string;
  sellerTrustScore: number;
  buyerName: string;
  amountXAF: number;
  amountZerm: number;
  status: EscrowStatus;
  createdAt: string;
  deadlineDate: string;
  steps: EscrowStep[];
}

interface EscrowStep {
  id: number;
  label: string;
  sublabel: string;
  completed: boolean;
  active: boolean;
  date?: string;
}

// ─────────────────────────────────────────────────────────────────
// Mock escrow data (replace with Firebase fetch in production)
// ─────────────────────────────────────────────────────────────────
const MOCK_ESCROW: EscrowTransaction = {
  id: 'ESC-2026-00142',
  orderId: 'ORD-2026-00892',
  itemName: 'Samsung Galaxy S24 Ultra - 256GB',
  itemImage: 'https://via.placeholder.com/120x120/0d9488/ffffff?text=📱',
  sellerName: 'TechZone Yaoundé',
  sellerTrustScore: 4.8,
  buyerName: 'You',
  amountXAF: 350000,
  amountZerm: 3500,
  status: 'funded',
  createdAt: '2026-02-19',
  deadlineDate: '2026-02-26',
  steps: [
    { id: 1, label: 'Order Placed', sublabel: 'Buyer confirmed order', completed: true, active: false, date: 'Feb 19, 2026' },
    { id: 2, label: 'Zerm Held in Escrow', sublabel: '3,500 Zerm frozen safely', completed: true, active: false, date: 'Feb 19, 2026' },
    { id: 3, label: 'Seller Notified', sublabel: 'Seller preparing item', completed: true, active: true, date: 'Feb 19, 2026' },
    { id: 4, label: 'Item Shipped / Ready', sublabel: 'Awaiting delivery confirmation', completed: false, active: false },
    { id: 5, label: 'Buyer Confirms Receipt', sublabel: 'Zerm released to seller', completed: false, active: false },
    { id: 6, label: 'Transaction Complete', sublabel: 'Both parties protected', completed: false, active: false },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Status badge colour
// ─────────────────────────────────────────────────────────────────
const statusConfig: Record<EscrowStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending',     color: 'text-yellow-700', bg: 'bg-yellow-100' },
  funded:      { label: 'Funds Held',  color: 'text-blue-700',   bg: 'bg-blue-100' },
  in_transit:  { label: 'In Transit',  color: 'text-purple-700', bg: 'bg-purple-100' },
  delivered:   { label: 'Delivered',   color: 'text-teal-700',   bg: 'bg-teal-100' },
  completed:   { label: 'Completed',   color: 'text-green-700',  bg: 'bg-green-100' },
  disputed:    { label: 'Disputed',    color: 'text-red-700',    bg: 'bg-red-100' },
  refunded:    { label: 'Refunded',    color: 'text-gray-700',   bg: 'bg-gray-100' },
};

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
const EscrowPage: React.FC = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // In production: fetch escrow by orderId from Firebase
  const escrow = MOCK_ESCROW;
  const status = statusConfig[escrow.status];

  const handleConfirmReceipt = () => {
    setConfirmed(true);
    setShowConfirmModal(false);
    // TODO: Call Firebase function to release Zerm Coins to seller
  };

  const handleRaiseDispute = () => {
    if (!disputeReason.trim()) return;
    setShowDisputeModal(false);
    // TODO: Create dispute record in Firebase, notify admin
    alert('✅ Your dispute has been raised. Our team will respond within 48 hours.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6">
          <Link to="/orders" className="flex items-center gap-2 text-teal-600 hover:text-teal-800 text-sm font-medium mb-4 transition-colors">
            <span>â†</span> Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔒 Escrow Protection</h1>
              <p className="text-gray-500 text-sm mt-1">Order #{escrow.orderId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* ── What Is Escrow Banner ── */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl p-5 mb-6 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🛡ï¸</span>
            <div>
              <h2 className="font-bold text-lg">Your Money Is Safe</h2>
              <p className="text-teal-100 text-sm mt-1">
                Your Zerm Coins are locked in escrow — the seller <strong>cannot</strong> access them
                until you confirm you received your item. If anything goes wrong, we refund you in full.
              </p>
            </div>
          </div>
        </div>

        {/* ── Item Card ── */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 bg-teal-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              📱
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{escrow.itemName}</h3>
              <p className="text-gray-500 text-sm mt-1">Sold by <span className="font-semibold text-teal-600">{escrow.sellerName}</span></p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm font-medium text-gray-700">{escrow.sellerTrustScore}</span>
                <span className="text-gray-400 text-xs">Trust Score</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-teal-600">{escrow.amountZerm.toLocaleString()} Ƶ</div>
              <div className="text-gray-500 text-xs mt-1">{escrow.amountXAF.toLocaleString()} XAF</div>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Escrow ID</span>
              <p className="font-semibold text-gray-700 font-mono text-xs">{escrow.id}</p>
            </div>
            <div>
              <span className="text-gray-400">Deadline</span>
              <p className="font-semibold text-gray-700">{escrow.deadlineDate}</p>
            </div>
          </div>
        </div>

        {/* ── Progress Steps ── */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-5">Transaction Progress</h3>
          <div className="space-y-4">
            {escrow.steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    step.completed ? 'bg-teal-500 text-white' :
                    step.active    ? 'bg-blue-500 text-white ring-4 ring-blue-100' :
                                     'bg-gray-100 text-gray-400'
                  }`}>
                    {step.completed ? '✓' : step.id}
                  </div>
                  {index < escrow.steps.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 ${step.completed ? 'bg-teal-400' : 'bg-gray-200'}`} />
                  )}
                </div>
                {/* Step text */}
                <div className="pt-1">
                  <p className={`font-semibold text-sm ${step.completed || step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{step.sublabel}</p>
                  {step.date && <p className="text-teal-600 text-xs mt-0.5 font-medium">{step.date}</p>}
                  {step.active && <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Current Step</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        {!confirmed && (
          <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Your Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl font-bold text-base hover:from-teal-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg"
              >
                ✅ Confirm I Received My Item
              </button>
              <p className="text-gray-400 text-xs text-center">
                This releases your Zerm Coins to the seller permanently.
              </p>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold text-sm hover:bg-red-100 transition-all"
              >
                ⚠ï¸ I Have a Problem — Raise Dispute
              </button>
            </div>
          </div>
        )}

        {confirmed && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold text-green-800 text-lg">Transaction Completed!</h3>
            <p className="text-green-600 text-sm mt-1">
              Zerm Coins have been released to the seller. Thank you for using Bambeh's secure escrow.
            </p>
          </div>
        )}

        {/* ── How Escrow Protects You ── */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">How Bambeh Protects You</h3>
          <div className="space-y-3">
            {[
              { icon: '🔒', title: 'Funds Always Frozen', desc: 'Your Zerm Coins are locked the moment you order. The seller gets nothing until you confirm receipt.' },
              { icon: 'â±ï¸', title: '7-Day Window', desc: 'You have 7 days to confirm delivery. If you don\'t respond, we contact you to verify.' },
              { icon: '⚖ï¸', title: 'Fair Dispute Resolution', desc: 'Disputes are reviewed by a Bambeh admin within 48 hours. We examine chat history and evidence.' },
              { icon: '💯', title: 'Full Refund if Scammed', desc: 'If the seller is found fraudulent, 100% of your Zerm Coins are returned immediately.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 items-start">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Safe Meeting Prompt ── */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <p className="text-orange-800 font-semibold text-sm">ðŸ“ Meeting in person?</p>
          <p className="text-orange-700 text-xs mt-1">
            Always meet in a public place. Use our verified safe exchange locations.
          </p>
          <Link to="/meet-safely" className="inline-block mt-2 text-orange-600 font-semibold text-xs underline">
            View Safe Meeting Points Near You →
          </Link>
        </div>

      </div>

      {/* ── Confirm Receipt Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Receipt?</h3>
              <p className="text-gray-600 text-sm mt-2">
                By confirming, you release <strong>{escrow.amountZerm.toLocaleString()} Zerm</strong> ({escrow.amountXAF.toLocaleString()} XAF) 
                to <strong>{escrow.sellerName}</strong>. This cannot be undone.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleConfirmReceipt}
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
              >
                Yes, Release Payment
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dispute Modal ── */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">⚖ï¸</div>
              <h3 className="text-xl font-bold text-gray-900">Raise a Dispute</h3>
              <p className="text-gray-600 text-sm mt-2">
                Describe your problem. Our admin team will review and respond within 48 hours.
                Your Zerm Coins remain frozen until resolved.
              </p>
            </div>
            <textarea
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="Describe the problem in detail (e.g. 'Item never arrived', 'Item is different from listing', 'Item is damaged')..."
              className="w-full p-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              rows={4}
            />
            <div className="space-y-3 mt-4">
              <button
                onClick={handleRaiseDispute}
                disabled={!disputeReason.trim()}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Dispute
              </button>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowPage;


