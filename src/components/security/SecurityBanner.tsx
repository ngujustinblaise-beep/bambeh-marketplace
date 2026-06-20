/**
 * SECURITY BANNER COMPONENT
 * FILE LOCATION: src/components/security/SecurityBanner.tsx
 */

import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const SecurityBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('Bambeh_security_banner_dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('Bambeh_security_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg z-[9999]"
      style={{ height: '48px' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium truncate">
            <span className="hidden sm:inline">
              🔒 Secure your account: Never share your password or verification codes with anyone!
            </span>
            <span className="sm:hidden">🔒 Keep your account secure!</span>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss security banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SecurityBanner;


