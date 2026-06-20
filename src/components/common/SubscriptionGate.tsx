/**
 * SubscriptionGate.tsx â€” Subscription enforcement component.
 * FILE LOCATION: src/components/common/SubscriptionGate.tsx
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, X, Star, Check, Zap } from 'lucide-react';
import { isCurrentUserSubscribed } from '@/utils/BambehStore';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  listingTitle?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe, listingTitle }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleSubscribe = (plan: string) => {
    onClose();
    navigate(`/subscription?plan=${plan}&highlight=100`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 px-6 pt-8 pb-10 text-white text-center">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-yellow-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Subscribe to Continue</h2>
          {listingTitle ? (
            <p className="text-teal-100 text-sm">To view <strong>"{listingTitle}"</strong> and all full details, you need an active subscription.</p>
          ) : (
            <p className="text-teal-100 text-sm">Subscribe to post listings and view full advert details across Bambeh.</p>
          )}
        </div>

        <div className="-mt-6 mx-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-lg text-center">
            <p className="text-white text-xs font-semibold uppercase tracking-wider mb-1">ðŸ”¥ Best Value â€” Most Popular</p>
            <p className="text-white font-black text-3xl">100 XAF</p>
            <p className="text-yellow-100 text-sm font-medium">per month Â· Full Access</p>
          </div>
        </div>

        <div className="px-6 pt-4 pb-2">
          <p className="text-gray-600 text-sm font-semibold mb-3 text-center">What you get:</p>
          <div className="space-y-2">
            {['View full details of any listing', 'Post ads in Jobs, Marketplace, Rentals & more', 'Contact sellers and service providers', 'Receive messages from interested buyers', 'Priority listing visibility'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-teal-600" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-4 pt-3 grid grid-cols-3 gap-2">
          {[
            { key: 'bronze', label: 'Bronze', price: '100',   color: 'border-orange-300 bg-orange-50', accent: 'text-orange-600', icon: Star   },
            { key: 'silver', label: 'Silver', price: '500',   color: 'border-gray-300 bg-gray-50',     accent: 'text-gray-600',   icon: Star   },
            { key: 'gold',   label: 'Gold',   price: '1,000', color: 'border-yellow-400 bg-yellow-50', accent: 'text-yellow-600', icon: Crown  },
          ].map(plan => {
            const Icon = plan.icon;
            const isHighlighted = plan.key === 'bronze';
            return (
              <button key={plan.key} onClick={() => handleSubscribe(plan.key)}
                className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all hover:scale-105 ${plan.color} ${isHighlighted ? 'ring-2 ring-orange-400 ring-offset-1' : ''}`}
              >
                {isHighlighted && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">â­ START HERE</span>
                )}
                <Icon className={`w-5 h-5 ${plan.accent} mb-1`} />
                <p className={`font-black text-sm ${plan.accent}`}>{plan.price} XAF</p>
                <p className="text-gray-500 text-[10px]">/mo</p>
                <p className={`font-bold text-xs mt-1 ${plan.accent}`}>{plan.label}</p>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6">
          <button onClick={() => handleSubscribe('bronze')}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-bold rounded-2xl hover:from-teal-600 hover:to-teal-800 transition-all shadow-lg flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            Get Full Access â€” From 100 XAF
          </button>
          <p className="text-center text-gray-400 text-xs mt-2">Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
};

interface SubscriptionGateProps {
  children: React.ReactNode;
  listingTitle?: string;
  onProceed?: () => void;
  forceShow?: boolean;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children, listingTitle, onProceed, forceShow = false }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const subscribed = !forceShow && isCurrentUserSubscribed();
    if (subscribed) {
      onProceed?.();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  }, [forceShow, onProceed]);

  return (
    <>
      <div onClick={handleClick} style={{ display: 'contents' }}>{children}</div>
      <SubscriptionModal isOpen={showModal} onClose={() => setShowModal(false)} onSubscribe={() => setShowModal(false)} listingTitle={listingTitle} />
    </>
  );
};

export function useSubscriptionGate() {
  const [showModal, setShowModal]   = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [pendingFn, setPendingFn]   = useState<(() => void) | null>(null);

  const checkAndProceed = useCallback((fn: () => void, listingTitle = '') => {
    if (isCurrentUserSubscribed()) { fn(); return; }
    setModalTitle(listingTitle);
    setPendingFn(() => fn);
    setShowModal(true);
  }, []);

  const modal = (
    <SubscriptionModal
      isOpen={showModal}
      onClose={() => { setShowModal(false); setPendingFn(null); }}
      onSubscribe={() => { setShowModal(false); pendingFn?.(); setPendingFn(null); }}
      listingTitle={modalTitle}
    />
  );

  return { checkAndProceed, modal };
}

export default SubscriptionGate;


