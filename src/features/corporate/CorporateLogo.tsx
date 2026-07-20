// BAMBEH_DEPLOY_TOKEN__CORPORATELOGO_FIX146_REALLOGO_CLEAN
/**
 * CorporateLogo.tsx — Bambeh Corporate (FIX146)
 * FILE LOCATION: src/features/corporate/CorporateLogo.tsx
 *
 * The REAL Bambeh logo (man carrying loads + "Bambeh — we carry all loads"),
 * used across every corporate page. Tapping it always returns the user to the
 * corporate homepage (/corporate).
 *
 * The image is imported from src/assets so Vite bundles + fingerprints it
 * (cannot 404, cache-busted on deploy). RTL-aware. Drop <CorporateLogo />
 * into any corporate header.
 *
 * REQUIRED ASSET: src/assets/bambeh-logo.png  (the round glossy logo)
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useNavigate } from 'react-router-dom';
import bambehLogo from '@/assets/bambeh-logo.png'; // FIX146: real logo asset

export default function CorporateLogo({
  className = '',
  onHome,
  size = 40,
}: {
  className?: string;
  /** optional override; defaults to navigating to /corporate */
  onHome?: () => void;
  /** logo height in px (width auto). Default 40. */
  size?: number;
}) {
  const navigate = useNavigate();
  const go = () => (onHome ? onHome() : navigate('/corporate'));

  return (
    <button
      type="button"
      onClick={go}
      aria-label="Bambeh — home"
      className={`inline-flex items-center active:scale-95 transition-transform ${className}`}
    >
      <img
        src={bambehLogo}
        alt="Bambeh — we carry all loads"
        style={{ height: size, width: 'auto' }}
        className="object-contain select-none"
        draggable={false}
      />
    </button>
  );
}
// BAMBEH_END_TOKEN__CORPORATELOGO_FIX146__COMPLETE
