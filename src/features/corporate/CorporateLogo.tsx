// BAMBEH_DEPLOY_TOKEN__CORPORATELOGO_FIX143_CLEAN
/**
 * CorporateLogo.tsx — Bambeh Corporate (FIX143)
 * FILE LOCATION: src/features/corporate/CorporateLogo.tsx
 *
 * A single reusable, CLICKABLE Bambeh logo used across every corporate page.
 * Tapping it always returns the user to the corporate homepage (/corporate).
 *
 * Self-contained inline SVG wordmark — no external image file, so it can
 * never 404 on a slow connection. Sits on the dark/teal corporate heroes.
 * RTL-aware. Drop <CorporateLogo /> into any corporate header.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useNavigate } from 'react-router-dom';

export default function CorporateLogo({
  className = '',
  onHome,
}: {
  className?: string;
  /** optional override; defaults to navigating to /corporate */
  onHome?: () => void;
}) {
  const navigate = useNavigate();
  const go = () => (onHome ? onHome() : navigate('/corporate'));

  return (
    <button
      type="button"
      onClick={go}
      aria-label="Bambeh Corporate — home"
      className={`inline-flex items-center gap-2 active:scale-95 transition-transform ${className}`}
    >
      {/* Mark */}
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400 shrink-0">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H12a4 4 0 0 1 1.6 7.66A4.2 4.2 0 0 1 12.5 20H6.5A2.5 2.5 0 0 1 4 17.5v-11Z"
                fill="#0f172a" />
          <path d="M7.5 7.5H12a1.6 1.6 0 0 1 0 3.2H7.5V7.5Zm0 5.3h5a1.7 1.7 0 0 1 0 3.4h-5v-3.4Z"
                fill="#fbbf24" />
        </svg>
      </span>
      {/* Wordmark */}
      <span className="font-extrabold text-base leading-none tracking-tight">
        Bambeh<span className="text-amber-400"> Corporate</span>
      </span>
    </button>
  );
}
// BAMBEH_END_TOKEN__CORPORATELOGO__COMPLETE
