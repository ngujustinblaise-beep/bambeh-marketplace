/**
 * SOCIAL SHARE MODAL
 * FILE LOCATION: src/components/common/SocialShareModal.tsx
 */

import { useState } from 'react';
import { X, Share2, Check, MessageCircle, Mail, Link2 } from 'lucide-react';

interface ShareOptions { title: string; description: string; url: string; type: string; }

interface SocialShareModalProps { shareOptions: ShareOptions; onClose: () => void; }

export default function SocialShareModal({ shareOptions, onClose }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { title, description, url } = shareOptions;
  const fullUrl   = url.startsWith('http') ? url : `https://bambeh.cm${url}`;
  const shareText = `${title}\n${description}\n\nCheck it out on Bambeh:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = fullUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareViaWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${fullUrl}`)}`, '_blank'); };
  const shareViaFacebook = () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, '_blank'); };
  const shareViaTwitter  = () => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`, '_blank'); };
  const shareViaGmail    = () => {
    const s = encodeURIComponent(`Check this out: ${title}`);
    const b = encodeURIComponent(`${shareText}\n\n${fullUrl}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${s}&body=${b}`, '_blank');
  };
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: fullUrl });
      } catch {
        console.log('Share cancelled');
      }
    }
  };

  const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 99990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
  const floatingCloseStyle: React.CSSProperties = { position: 'fixed', top: '20px', right: '20px', zIndex: 99999, width: '60px', height: '60px', backgroundColor: '#dc2626', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' };
  const modalStyle: React.CSSProperties = { position: 'relative', width: '100%', maxWidth: '360px', maxHeight: '500px', backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' };
  const sbBtn = (bg: string): React.CSSProperties => ({ padding: '14px 10px', backgroundColor: bg, border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' });
  const icon  = (bg: string): React.CSSProperties => ({ width: '44px', height: '44px', backgroundColor: bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' });

  return (
    <>
      <button onClick={onClose} style={floatingCloseStyle} aria-label="Close">
        <X size={36} color="white" strokeWidth={3} />
      </button>
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ background: 'linear-gradient(135deg,#0d9488,#0284c7)', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Share2 size={24} /><span style={{ fontWeight: 'bold', fontSize: '18px' }}>Share Bambeh</span>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
              <X size={22} color="white" />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <div style={{ backgroundColor: '#f0fdfa', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</p>
            </div>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button onClick={handleNativeShare} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#0d9488,#0284c7)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Share2 size={20} />Share Now
              </button>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <button onClick={shareViaWhatsApp} style={sbBtn('#dcfce7')}>
                <div style={icon('#22c55e')}><MessageCircle size={22} color="white" /></div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>WhatsApp</span>
              </button>
              <button onClick={shareViaFacebook} style={sbBtn('#dbeafe')}>
                <div style={icon('#2563eb')}><span style={{ color: 'white', fontWeight: 'bold', fontSize: '22px' }}>f</span></div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Facebook</span>
              </button>
              <button onClick={shareViaTwitter} style={sbBtn('#f3f4f6')}>
                <div style={icon('#000000')}><span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>𝕏</span></div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Twitter</span>
              </button>
              <button onClick={shareViaGmail} style={sbBtn('#fee2e2')}>
                <div style={icon('#ef4444')}><Mail size={22} color="white" /></div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Gmail</span>
              </button>
              <button onClick={() => { handleCopyLink(); alert('Link copied! Paste in Instagram.'); }} style={sbBtn('#fae8ff')}>
                <div style={{ ...icon('#ec4899'), background: 'linear-gradient(135deg,#9333ea,#ec4899,#f97316)' }}>
                  <span style={{ fontSize: '18px' }}>📷</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Instagram</span>
              </button>
              <button onClick={handleCopyLink} style={sbBtn(copied ? '#dcfce7' : '#f3f4f6')}>
                <div style={icon(copied ? '#22c55e' : '#6b7280')}>
                  {copied ? <Check size={22} color="white" /> : <Link2 size={22} color="white" />}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="text" value={fullUrl} readOnly style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px 10px', fontSize: '11px', color: '#4b5563', backgroundColor: 'white', minWidth: 0 }} />
              <button onClick={handleCopyLink} style={{ backgroundColor: copied ? '#22c55e' : '#0d9488', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px', backgroundColor: '#f9fafb', flexShrink: 0 }}>
            <button onClick={onClose} style={{ width: '100%', padding: '14px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


