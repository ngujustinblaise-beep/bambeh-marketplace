import React, { useState } from 'react';
import { Share2, Copy, Check, Gift, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralButtonProps {
  variant?: 'default' | 'compact' | 'floating';
  className?: string;
}

const ReferralButton: React.FC<ReferralButtonProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Generate referral code from user ID or email
  const referralCode = currentUser?.id 
    ? (currentUser.id || currentUser.id).substring(0, 8).toUpperCase()
    : 'GUEST001';

  // Generate referral link
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Share via Web Share API (if available)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BambÃ© Marketplace',
          text: `Use my referral code ${referralCode} to join BambÃ© and get bonus Zerm Coins!`,
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowModal(true);
    }
  };

  // Compact variant (small button)
  if (variant === 'compact') {
    return (
      <button
        onClick={handleShare}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg ${className}`}
      >
        <Share2 className="w-4 h-4" />
        <span className="font-medium">Refer & Earn</span>
      </button>
    );
  }

  // Floating variant (fixed position)
  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl ${className}`}
        >
          <Gift className="w-5 h-5" />
          <span className="font-semibold">Earn Zerm</span>
        </button>
        {showModal && <ReferralModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // Default variant (full card)
  return (
    <>
      <div className={`bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Refer Friends & Earn Zerm Coins
            </h3>
            <p className="text-blue-100 text-sm">
              Share your referral code and get 100 Zerm Coins for each friend who signs up!
            </p>
          </div>
          <Users className="w-8 h-8 text-blue-200" />
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
          <p className="text-xs text-blue-100 mb-2 font-medium">Your Referral Code</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold tracking-wider">{referralCode}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-purple-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
          >
            <Share2 className="w-5 h-5" />
            Share Now
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-semibold"
          >
            Details
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-100">Referrals:</span>
            <span className="font-bold">0</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-blue-100">Total Earned:</span>
            <span className="font-bold">0 Zerm Coins</span>
          </div>
        </div>
      </div>

      {/* Referral Details Modal */}
      {showModal && (
        <ReferralModal
          referralCode={referralCode}
          referralLink={referralLink}
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
};

// Referral Details Modal Component
interface ReferralModalProps {
  referralCode?: string;
  referralLink?: string;
  onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ 
  referralCode = 'GUEST001',
  referralLink = window.location.origin,
  onClose 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-600" />
              Referral Program
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Share and earn rewards!
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            âœ•
          </button>
        </div>

        {/* Referral Code */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
            Your Referral Code
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-wider">
              {referralCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white">How it works:</h3>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 dark:text-purple-400 font-bold">1</span>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Share your referral code
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Send to friends via WhatsApp, SMS, or social media
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                They sign up using your code
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                New users get 50 bonus Zerm Coins
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 font-bold">3</span>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                You both earn rewards!
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get 100 Zerm Coins for each successful referral
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
          >
            Copy Link
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralButton;




