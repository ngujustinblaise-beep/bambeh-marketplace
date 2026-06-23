// @ts-nocheck
/**
 * ACTION GUARD - PROTECT PREMIUM ACTIONS
 * FILE LOCATION: src/components/security/ActionGuard.tsx
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown, X } from 'lucide-react';
import { canApplyForJob, canBuyItem, canContactSeller, canPostAd, getUpgradeMessage } from '@/utils/subscriptionUtils';

interface ActionGuardProps {
  action: 'apply' | 'buy' | 'contact' | 'post';
  onProceed: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function ActionGuard({ action, onProceed, children, className = '' }: ActionGuardProps) {
  const [showModal, setShowModal] = useState(false);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('Bambeh_current_user') || 'null'); } catch { return null; }
  })();

  const canProceed = () => {
    switch (action) {
      case 'apply':   return canApplyForJob(currentUser as any);
      case 'buy':     return canBuyItem(currentUser as any);
      case 'contact': return canContactSeller(currentUser as any);
      case 'post':    return canPostAd(currentUser as any);
      default:        return false;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canProceed()) {
      onProceed();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div onClick={handleClick} className={className}>{children}</div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-scale-in">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {action === 'apply'   && '🔒 Apply Locked'}
              {action === 'buy'     && '🔒 Purchase Locked'}
              {action === 'contact' && '🔒 Contact Locked'}
              {action === 'post'    && '🔒 Posting Locked'}
            </h2>
            <p className="text-gray-600 text-center mb-6">{getUpgradeMessage(action)}</p>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Crown className="w-5 h-5 text-purple-600" />Premium Benefits:</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {['Apply for unlimited jobs','Buy items instantly','Contact sellers directly','See exact locations','Post unlimited ads'].map(b => (
                  <li key={b} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span><span>{b}</span></li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/subscription" className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold text-center transition-all shadow-lg">
                View Subscription Plans
              </Link>
              <button onClick={() => setShowModal(false)} className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all">Maybe Later</button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">Plans start from 500 XAF/day</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </>
  );
}




