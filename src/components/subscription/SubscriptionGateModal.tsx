/**
 * SUBSCRIPTION GATE MODAL
 * FILE LOCATION: src/components/subscription/SubscriptionGateModal.tsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, X, Phone, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

const SUBSCRIPTION_MESSAGES = [
  { headline: 'ðŸž At the price of a loaf of bread, everything can change.', sub: "Subscribe now â€” you wouldn't regret it.", color: 'from-amber-500 to-orange-500' },
  { headline: 'âš¡ Subscribe quick with that wonderful CFA 100 and secure your place all over .', sub: 'Your competitors are already moving. Will you?', color: 'from-teal-500 to-blue-600' },
  { headline: 'ðŸ›ï¸ At CFA 100, you can secure anything from the comfort of your bed.', sub: 'No need to go out. Everything comes to you.', color: 'from-purple-500 to-pink-600' },
  { headline: 'ðŸ‘‘ No need to rush â€” with that CFA 100... yes that one, you are king.', sub: 'One subscription. Unlimited Bambeh power.', color: 'from-rose-500 to-red-600' },
];

const BENEFITS = [
  'View full client contact details',
  'See exact customer count per listing',
  'Post unlimited items & services',
  'Access analytics and performance data',
  'Priority placement in search results',
  'Direct messaging with verified buyers',
];

let _messageIndex = 0;

export function useSubscriptionGate() {
  const [isOpen, setIsOpen] = useState(false);
  const open  = useCallback(() => { _messageIndex = (_messageIndex + 1) % SUBSCRIPTION_MESSAGES.length; setIsOpen(true); }, []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
}

interface SubscriptionGateModalProps {
  isOpen: boolean; onClose: () => void; blockedFeature?: string;
}

const SubscriptionGateModal: React.FC<SubscriptionGateModalProps> = ({ isOpen, onClose, blockedFeature }) => {
  const navigate = useNavigate();
  const [phone, setPhone]   = useState('');
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMsgIdx(_messageIndex);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) { document.addEventListener('keydown', handler); }
    return () => { document.removeEventListener('keydown', handler); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const msg = SUBSCRIPTION_MESSAGES[msgIdx];

  const handleSubscribe = () => {
    const params = phone.trim() ? `?phone=${encodeURIComponent(phone.trim())}&amount=100` : '';
    navigate(`/subscription${params}`);
    onClose();
  };

  const handleFullPlans = () => {
    navigate('/subscription');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <div className={`bg-gradient-to-r ${msg.color} px-6 py-6 text-white`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all" aria-label="Close">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Crown className="w-7 h-7 text-white" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Bambeh Premium</p>
              <p className="text-2xl font-black">CFA 100 only</p>
            </div>
          </div>
          <p className="text-lg font-bold leading-snug">{msg.headline}</p>
          <p className="text-sm mt-1 opacity-90">{msg.sub}</p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {blockedFeature && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-800">
              <Zap className="w-4 h-4 text-orange-500 shrink-0" />
              <span>To <strong>{blockedFeature}</strong>, you need a subscription.</span>
            </div>
          )}
          <div className="space-y-2">
            {BENEFITS.map(b => (
              <div key={b} className="flex items-center gap-2.5 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{b}
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-200">
            <p className="text-sm font-semibold text-gray-800">Quick activate with Mobile Money:</p>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237 6XX XXX XXX"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all bg-white" />
            </div>
            <button onClick={handleSubscribe}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-base shadow-lg transition-all active:scale-[0.98] bg-gradient-to-r ${msg.color} hover:opacity-90`}>
              <Crown className="w-5 h-5" />Subscribe Now â€” CFA 100<ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleFullPlans} className="w-full text-sm text-gray-500 hover:text-teal-600 transition-colors py-2 underline underline-offset-2">
            View all subscription plans â†’
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGateModal;





