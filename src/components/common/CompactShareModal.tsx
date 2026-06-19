/**
 * COMPACT SHARE MODAL
 * FILE LOCATION: src/components/common/CompactShareModal.tsx
 */

import { useState, useEffect } from 'react';
import { X, MessageCircle, Send, Facebook, Twitter, Linkedin, Mail, Copy, Check } from 'lucide-react';

interface CompactShareModalProps {
  isOpen: boolean; onClose: () => void; shareUrl: string;
  shareTitle?: string; shareText?: string;
}

const useSwipeToClose = (onSwipe: () => void, threshold = 100) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd]     = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance    = touchEnd - touchStart;
    const isDownSwipe = distance > threshold;
    if (isDownSwipe) { onSwipe(); }
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

export default function CompactShareModal({
  isOpen, onClose, shareUrl,
  shareTitle = 'Join Bambeh Marketplace!',
  shareText  = "Check out Bambeh Marketplace - Online Marketplace with only 1% transaction fee!",
}: CompactShareModalProps) {
  const [copied, setCopied] = useState(false);
  const swipeHandlers       = useSwipeToClose(onClose);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank'); onClose(); };
  const shareToFacebook = () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'); onClose(); };
  const shareToTwitter  = () => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank'); onClose(); };
  const shareToTelegram = () => { window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank'); onClose(); };
  const shareToLinkedIn = () => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank'); onClose(); };
  const shareToEmail    = () => { window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`; onClose(); };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && target.classList.contains('share-modal-overlay')) {
        onClose();
      }
    };
    if (isOpen) { document.addEventListener('click', handleClickOutside); }
    return () => { document.removeEventListener('click', handleClickOutside); };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="share-modal-overlay fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50"
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md transform transition-all"
        {...swipeHandlers}
        style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', maxWidth: '400px', maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Share with Friends</h3>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
            style={{ touchAction: 'auto', WebkitTapHighlightColor: 'transparent', minWidth: '44px', minHeight: '44px' }}
            aria-label="Close">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Swipe indicator */}
        <div className="flex justify-center py-2 bg-white sticky top-[73px] z-10">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* URL display */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-2">
            <code className="text-teal-600 font-mono text-xs flex-1 truncate">{shareUrl}</code>
            <button onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
              style={{ touchAction: 'auto', WebkitTapHighlightColor: 'transparent', minHeight: '40px' }}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Share grid */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">Choose a platform to share:</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'WhatsApp', onClick: shareToWhatsApp, bg: 'bg-green-500',   icon: <MessageCircle className="w-7 h-7 text-white" /> },
              { label: 'Facebook', onClick: shareToFacebook, bg: 'bg-blue-600',    icon: <Facebook className="w-7 h-7 text-white" /> },
              { label: 'Twitter',  onClick: shareToTwitter,  bg: 'bg-black',       icon: <Twitter className="w-7 h-7 text-white" /> },
              { label: 'Telegram', onClick: shareToTelegram, bg: 'bg-blue-500',    icon: <Send className="w-7 h-7 text-white" /> },
              { label: 'LinkedIn', onClick: shareToLinkedIn, bg: 'bg-blue-700',    icon: <Linkedin className="w-7 h-7 text-white" /> },
              { label: 'Email',    onClick: shareToEmail,    bg: 'bg-gray-600',    icon: <Mail className="w-7 h-7 text-white" /> },
            ].map(({ label, onClick, bg, icon }) => (
              <button key={label} onClick={onClick}
                className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
                style={{ touchAction: 'auto', WebkitTapHighlightColor: 'transparent' }}>
                <div className={`w-14 h-14 ${bg} rounded-full flex items-center justify-center shadow-md`}>{icon}</div>
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          <p className="text-xs text-gray-400 text-center">Swipe down to close â†“</p>
          <button onClick={onClose}
            className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            style={{ touchAction: 'auto', WebkitTapHighlightColor: 'transparent', minHeight: '48px' }}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-fadeIn  { animation: fadeIn  0.3s ease-in-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out;    }
      `}</style>
    </div>
  );
}

