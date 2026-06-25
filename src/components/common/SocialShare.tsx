/**
 * SOCIAL SHARE COMPONENT - COMPACT DROPDOWN VERSION
 * FILE LOCATION: src/components/common/SocialShare.tsx
 */

import { useState, useRef, useEffect } from 'react';
import { Share2, X, Mail, MessageCircle, Check, Link2 } from 'lucide-react';

interface SocialShareProps {
  url: string; title: string; description?: string; className?: string;
}

const BAMBEH_SOCIAL = {
  facebook:  'https://www.facebook.com/profile.php?id=61585316773462',
  instagram: 'https://www.instagram.com/bambehtheapp',
  twitter:   'https://x.com/BambehtheApp',
};

export default function SocialShare({ url, title, description = '', className = '' }: SocialShareProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied]     = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [showMenu]);

  const fullUrl = url.startsWith('http') ? url : `https://bambeh.cm${url}`;

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${fullUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(title)}`,
    twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}&via=BambehtheApp`,
    gmail:    `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\nView on Bambeh: ${fullUrl}`)}`,
    yahoo:    `http://compose.mail.yahoo.com/?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\nView on Bambeh: ${fullUrl}`)}`,
  };

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
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    console.log(`Shared to ${platform}:`, { url: fullUrl, title });
    setShowMenu(false);
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', right: 0, marginTop: '8px',
    backgroundColor: 'white', borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb',
    padding: '12px', zIndex: 9999, minWidth: '280px', maxHeight: '400px', overflowY: 'auto',
  };
  const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' };
  const shareItemStyle = (bgColor: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: bgColor, borderRadius: '10px', cursor: 'pointer', marginBottom: '6px', textDecoration: 'none', transition: 'background-color 0.2s' });
  const iconStyle = (bgColor: string): React.CSSProperties => ({ width: '36px', height: '36px', backgroundColor: bgColor, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button onClick={() => setShowMenu(!showMenu)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#374151', fontSize: '14px' }}
        aria-label="Share">
        <Share2 size={18} /><span>Share</span>
      </button>

      {showMenu && (
        <div style={menuStyle}>
          <div style={headerStyle}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Share via</p>
            <button onClick={() => setShowMenu(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
              <X size={16} color="#6b7280" />
            </button>
          </div>

          <div>
            <a href={shareUrls.whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => setShowMenu(false)} style={shareItemStyle('#dcfce7')}>
              <div style={iconStyle('#22c55e')}><MessageCircle size={18} color="white" /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>WhatsApp</span>
            </a>
            <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer" onClick={() => setShowMenu(false)} style={shareItemStyle('#dbeafe')}>
              <div style={iconStyle('#2563eb')}><span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>f</span></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>Facebook</span>
            </a>
            <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer" onClick={() => setShowMenu(false)} style={shareItemStyle('#f3f4f6')}>
              <div style={iconStyle('#000000')}><span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>𝕏</span></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>X (Twitter)</span>
            </a>
            <a href={BAMBEH_SOCIAL.instagram} target="_blank" rel="noopener noreferrer" onClick={() => { handleCopyLink(); setShowMenu(false); }}
              style={{ ...shareItemStyle('#fce7f3'), background: 'linear-gradient(135deg, #fae8ff, #fce7f3)' }}>
              <div style={{ ...iconStyle('#ec4899'), background: 'linear-gradient(135deg, #9333ea, #ec4899, #f97316)' }}>
                <span style={{ fontSize: '16px' }}>📷</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#9d174d' }}>Instagram</span>
            </a>
            <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
            <a href={shareUrls.gmail} onClick={() => setShowMenu(false)} style={shareItemStyle('#fee2e2')}>
              <div style={iconStyle('#ef4444')}><Mail size={18} color="white" /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#b91c1c' }}>Gmail</span>
            </a>
            <a href={shareUrls.yahoo} target="_blank" rel="noopener noreferrer" onClick={() => setShowMenu(false)} style={shareItemStyle('#ede9fe')}>
              <div style={iconStyle('#7c3aed')}><Mail size={18} color="white" /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#5b21b6' }}>Yahoo Mail</span>
            </a>
            <button onClick={handleCopyLink}
              style={{ ...shareItemStyle(copied ? '#dcfce7' : '#f3f4f6'), width: '100%', border: 'none' }}>
              <div style={iconStyle(copied ? '#22c55e' : '#6b7280')}>
                {copied ? <Check size={18} color="white" /> : <Link2 size={18} color="white" />}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: copied ? '#166534' : '#374151' }}>
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </button>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Share and help grow Bambeh! 💚</p>
          </div>
        </div>
      )}
    </div>
  );
}



