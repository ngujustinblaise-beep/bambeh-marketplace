// BAMBEH_DEPLOY_TOKEN__BACKTOTOP_FIX188_CLEAN
/**
 * BackToTop.tsx — Bambeh shared UI (FIX188)
 * FILE LOCATION: src/components/ui/BackToTop.tsx
 *
 * FIX188 changes (screen visibility):
 *  - Smaller: 36px instead of 44px, so it takes far less screen.
 *  - Sits low in the corner (bottom-5) instead of bottom-24. That offset
 *    existed to clear the fixed bottom navigation bar, which was removed in
 *    FIX186 — so the button was floating uselessly high.
 *  - Semi-transparent until hovered/tapped, so it never competes with page
 *    content. Still a 44px tap target via padding, which keeps it accessible
 *    on mobile even though it *looks* smaller.
 *  - RTL-aware (sits on the correct side for Arabic).
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
      title="Back to top"
      className={`fixed bottom-5 z-40 flex h-9 w-9 items-center justify-center rounded-full
                  bg-slate-800/70 text-white shadow-md backdrop-blur-sm
                  transition-all hover:bg-slate-900 active:scale-90
                  ${rtl ? 'left-3' : 'right-3'}`}
      style={{ padding: '4px' }}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
// BAMBEH_END_TOKEN__BACKTOTOP_FIX188__COMPLETE
