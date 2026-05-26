/**
 * SOCIAL SHARE BUTTON - COMPACT WITH FLOATING X
 * FILE LOCATION: src/components/common/SocialShareButton.tsx
 */

import { useState } from 'react';
import { Share2, X, Check, Copy, MessageCircle, Mail, Link2 } from 'lucide-react';

interface SocialShareButtonProps {
  title: string; description: string;
  itemType: 'job' | 'marketplace' | 'service' | 'rental' | 'vehicle' | 'app';
  url?: string; className?: string; children?: React.ReactNode;
}

export default function SocialShareButton({ title, description, itemType, url, className, children }: SocialShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied]       = useState(false);

  const shareUrl     = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareMessage = `${title}\n\n${description}\n\n🔗 ${shareUrl}\n\n📱 Bambeh - Cameroon's Premier Marketplace!\n💚 Only 1% Transaction Fee!`;
  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedTitle   = encodeURIComponent(title);
  const encodedUrl     = encodeURIComponent(shareUrl);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter:  `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=bambehtheapp`,
    gmail:    `https://mail.google.com/mail/?view=cm&su=${encodedTitle}&body=${encodedMessage}`,
    yahoo:    `https://compose.mail.yahoo.com/?subject=${encodedTitle}&body=${encodedMessage}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareMessage;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const handleClose = () => { setShowModal(false); };

  // Inline styles
  const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' };
  const floatingCloseStyle: React.CSSProperties = { position: 'fixed', top: '16px', right: '16px', zIndex: 100001, width: '56px', height: '56px', backgroundColor: '#dc2626', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' };
  const modalStyle: React.CSSProperties = { position: 'relative', width: '100%', maxWidth: '400px', maxHeight: '60vh', backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' };
  const headerStyle: React.CSSProperties = { background: 'linear-gradient(135deg, #0d9488, #0284c7)', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 };
  const contentStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '16px' };
  const footerStyle: React.CSSProperties = { borderTop: '1px solid #e5e7eb', padding: '12px 16px', backgroundColor: '#f9fafb', flexShrink: 0 };
  const buttonStyle = (bgColor: string): React.CSSProperties => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', backgroundColor: bgColor, border: 'none', borderRadius: '12px', cursor: 'pointer', gap: '6px', width: '100%' });
  const iconCircleStyle = (bgColor: string): React.CSSProperties => ({ width: '44px', height: '44px', backgroundColor: bgColor, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' });

  const shareButtons = [
    { key: 'whatsapp', label: 'WhatsApp', bg: '#dcfce7', iconBg: '#22c55e', icon: <MessageCircle size={22} color="white" />, textColor: '#166534' },
    { key: 'facebook', label: 'Facebook', bg: '#dbeafe', iconBg: '#2563eb', icon: <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>f</span>, textColor: '#1e40af' },
    { key: 'twitter',  label: 'Twitter/X', bg: '#f3f4f6', iconBg: '#000',    icon: <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>𝕏</span>, textColor: '#1f2937' },
    { key: 'gmail',    label: 'Gmail',    bg: '#fee2e2', iconBg: '#ef4444', icon: <Mail size={22} color="white" />,        textColor: '#991b1b' },
    { key: 'yahoo',    label: 'Yahoo',    bg: '#ede9fe', iconBg: '#7c3aed', icon: <Mail size={22} color="white" />,        textColor: '#5b21b6' },
  ] as const;

  return (
    <>
      <button onClick={() => setShowModal(true)} className={className || 'p-2 hover:bg-gray-100 rounded-lg transition-colors'} aria-label="Share">
        {children || <Share2 className="w-5 h-5 text-gray-600" />}
      </button>

      {showModal && (
        <>
          <button onClick={handleClose} style={floatingCloseStyle} aria-label="Close">
            <X size={32} color="white" strokeWidth={3} />
          </button>

          <div style={overlayStyle} onClick={handleClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Share2 size={22} />
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Share {itemType === 'app' ? 'Bambeh' : `this ${itemType}`}</span>
                </div>
                <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                  <X size={20} color="white" />
                </button>
              </div>

              <div style={contentStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {shareButtons.map(({ key, label, bg, iconBg, icon, textColor }) => (
                    <button key={key} onClick={() => handleShare(key as keyof typeof shareLinks)} style={buttonStyle(bg)}>
                      <div style={iconCircleStyle(iconBg)}>{icon}</div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: textColor }}>{label}</span>
                    </button>
                  ))}

                  {/* Instagram — copies link */}
                  <button onClick={copyToClipboard} style={{ ...buttonStyle('#fce7f3'), background: 'linear-gradient(135deg, #fae8ff, #fce7f3)' }}>
                    <div style={{ ...iconCircleStyle('#ec4899'), background: 'linear-gradient(135deg, #9333ea, #ec4899, #f97316)' }}>
                      <span style={{ fontSize: '18px' }}>📷</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#9d174d' }}>{copied ? '✓ Copied!' : 'Instagram'}</span>
                  </button>

                  {/* Copy link */}
                  <button onClick={copyToClipboard} style={buttonStyle(copied ? '#dcfce7' : '#f3f4f6')}>
                    <div style={iconCircleStyle(copied ? '#22c55e' : '#6b7280')}>
                      {copied ? <Check size={22} color="white" /> : <Link2 size={22} color="white" />}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: copied ? '#166534' : '#374151' }}>
                      {copied ? 'Copied!' : 'Copy Link'}
                    </span>
                  </button>
                </div>
              </div>

              <div style={footerStyle}>
                <button onClick={handleClose} style={{ width: '100%', padding: '12px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', color: '#374151' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
