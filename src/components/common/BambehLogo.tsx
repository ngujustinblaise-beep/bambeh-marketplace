/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * BambehLogo.tsx — SMART CLICKABLE LOGO
 *
 * FILE LOCATION: src/components/common/BambehLogo.tsx
 *
 * Behaviour:
 *  • On the regular side  (any path NOT starting with /vendor)  → links to /
 *  • On the vendor side   (any path starting with /vendor)      → links to /vendor/home
 *
 * Usage (drop-in replacement for every existing logo Link):
 *   import BambehLogo from '@/components/common/BambehLogo';
 *   <BambehLogo />
 *
 * Optional props:
 *   <BambehLogo size="sm" />   → 40×40 image
 *   <BambehLogo size="md" />   → 64×64 image  (default)
 *   <BambehLogo size="lg" />   → 80×80 image
 *   <BambehLogo className="mb-4" />   → extra wrapper classes
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BambehLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Override the auto-detected destination (rarely needed) */
  forceTo?: string;
}

const SIZE_MAP = {
  sm: { img: 'h-10 w-10', fallback: 'h-10 w-10', text: 'text-xl' },
  md: { img: 'h-16 w-16', fallback: 'h-16 w-16', text: 'text-3xl' },
  lg: { img: 'h-20 w-20', fallback: 'h-20 w-20', text: 'text-4xl' },
};

const BambehLogo: React.FC<BambehLogoProps> = ({
  size = 'md',
  className = '',
  forceTo
}) => {
  const { pathname } = useLocation();

  // Detect which side we are on
  const isVendorSide = pathname.startsWith('/vendor');
  const destination  = forceTo ?? (isVendorSide ? '/vendor/home' : '/');

  const s = SIZE_MAP[size];

  return (
    <Link
      to={destination}
      aria-label={isVendorSide ? 'Go to Vendor Home' : 'Go to Home'}
      className={`inline-flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-xl ${className}`}
    >
      <img
        src="/bambeh-logo.png"
        alt="Bambeh Logo"
      className={`${s.img} object-contain bg-white rounded-full p-2 flex-shrink-0`}
        onError={(e) => {
          // Hide broken image, show text fallback
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      {/* Text fallback shown only when image fails to load */}
      <div
        style={{ display: 'none' }}
        className={`${s.fallback} bg-white rounded-full items-center justify-center flex-shrink-0`}
      >
        <span className={`text-teal-600 font-black ${s.text}`}>B</span>
      </div>
    </Link>
  );

}
export default BambehLogo;


