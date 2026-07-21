// BAMBEH_DEPLOY_TOKEN__BACKTOTOP_FIX152_CLEAN
/**
 * BackToTop.tsx — Bambeh shared UI (FIX152)
 * FILE LOCATION: src/components/ui/BackToTop.tsx
 *
 * A floating "scroll to top" button. Appears after the user scrolls down
 * past `threshold` px, smooth-scrolls to top on tap. Drop <BackToTop /> at
 * the bottom of any page. RTL-aware (sits on the correct side). No deps.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop({
  threshold = 320,
  rtl = false,
}: {
  threshold?: number;
  rtl?: boolean;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-24 z-40 w-11 h-11 rounded-full bg-slate-800 text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform ${rtl ? 'left-4' : 'right-4'}`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
// BAMBEH_END_TOKEN__BACKTOTOP_FIX152__COMPLETE
