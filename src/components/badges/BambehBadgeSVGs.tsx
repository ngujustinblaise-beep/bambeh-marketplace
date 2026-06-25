/**
 * BambehBadgeSVGs.tsx — All 5 Bambeh badge tier SVG assets.
 * USAGE: import { GoldenBambehBadge, BadgeDisplay } from '@/components/badges/BambehBadgeSVGs';
 */

import React from 'react';

interface BadgeProps { size?: number; className?: string; }

export function FirstLoadBadge({ size = 56, className }: BadgeProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="First Load Badge">
      <defs>
        <radialGradient id="fl-bg" cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#E8A96A" /><stop offset="100%" stopColor="#8B4513" /></radialGradient>
        <radialGradient id="fl-shine" cx="40%" cy="30%" r="50%"><stop offset="0%" stopColor="rgba(255,255,255,0.35)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></radialGradient>
      </defs>
      <path d="M28 4 L50 13 L50 30 C50 42 28 52 28 52 C28 52 6 42 6 30 L6 13 Z" fill="url(#fl-bg)" stroke="#6B3410" strokeWidth="1.5" />
      <path d="M28 4 L50 13 L50 30 C50 42 28 52 28 52 C28 52 6 42 6 30 L6 13 Z" fill="url(#fl-shine)" />
      <g fill="#FFF8E7" opacity="0.9">
        <circle cx="28" cy="19" r="4" />
        <rect x="25" y="24" width="6" height="10" rx="2" />
        <rect x="21" y="13" width="14" height="6" rx="1.5" fill="#F4C87A" stroke="#6B3410" strokeWidth="0.8" />
        <rect x="24" y="34" width="3" height="7" rx="1.5" /><rect x="29" y="34" width="3" height="7" rx="1.5" />
      </g>
      <circle cx="28" cy="46" r="3.5" fill="#F4C87A" stroke="#6B3410" strokeWidth="0.8" />
      <text x="28" y="49" textAnchor="middle" fontSize="5" fill="#6B3410" fontFamily="Arial" fontWeight="bold">1</text>
    </svg>
  );
}

export function SteadyCarryBadge({ size = 56, className }: BadgeProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Steady Carry Badge">
      <defs>
        <linearGradient id="sc-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#C8D8E8" /><stop offset="100%" stopColor="#6889AA" /></linearGradient>
        <radialGradient id="sc-shine" cx="35%" cy="25%" r="55%"><stop offset="0%" stopColor="rgba(255,255,255,0.5)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></radialGradient>
      </defs>
      <polygon points="28,3 51,15.5 51,40.5 28,53 5,40.5 5,15.5" fill="url(#sc-bg)" stroke="#4A6882" strokeWidth="1.5" />
      <polygon points="28,3 51,15.5 51,40.5 28,53 5,40.5 5,15.5" fill="url(#sc-shine)" />
      <polygon points="28,7 47,17.5 47,38.5 28,49 9,38.5 9,17.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <g fill="#FFF8E7" opacity="0.92">
        <circle cx="28" cy="21" r="3.5" />
        <rect x="25.5" y="25" width="5" height="8" rx="1.5" />
        <rect x="20" y="10" width="16" height="5" rx="1.2" fill="#A8C4DC" stroke="#4A6882" strokeWidth="0.7" />
        <rect x="21" y="15" width="14" height="5" rx="1.2" fill="#C8D8E8" stroke="#4A6882" strokeWidth="0.7" />
        <line x1="25.5" y1="26" x2="21" y2="15" stroke="#FFF8E7" strokeWidth="2" strokeLinecap="round" />
        <line x1="30.5" y1="26" x2="35" y2="15" stroke="#FFF8E7" strokeWidth="2" strokeLinecap="round" />
        <rect x="24.5" y="33" width="2.5" height="7" rx="1.2" /><rect x="29" y="33" width="2.5" height="7" rx="1.2" />
      </g>
      <circle cx="28" cy="49" r="4" fill="#A8C4DC" stroke="#4A6882" strokeWidth="0.8" />
      <text x="28" y="52" textAnchor="middle" fontSize="5.5" fill="#2C4A65" fontFamily="Arial" fontWeight="bold">10</text>
    </svg>
  );
}

export function StrongBackBadge({ size = 56, className }: BadgeProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Strong Back Badge">
      <defs>
        <radialGradient id="sb-bg" cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#FFD700" /><stop offset="100%" stopColor="#B8960C" /></radialGradient>
        <radialGradient id="sb-center" cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#FFF3B0" /><stop offset="100%" stopColor="#D4A017" /></radialGradient>
        <radialGradient id="sb-shine" cx="30%" cy="20%" r="50%"><stop offset="0%" stopColor="rgba(255,255,255,0.5)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></radialGradient>
      </defs>
      <path d="M28 2 L31.5 10.5 L40 7 L36.5 15.5 L45 17 L38.5 23 L42 31 L33.5 29.5 L32 38 L28 31.5 L24 38 L22.5 29.5 L14 31 L17.5 23 L11 17 L19.5 15.5 L16 7 L24.5 10.5 Z" fill="url(#sb-bg)" stroke="#8B6F0A" strokeWidth="1" />
      <path d="M28 2 L31.5 10.5 L40 7 L36.5 15.5 L45 17 L38.5 23 L42 31 L33.5 29.5 L32 38 L28 31.5 L24 38 L22.5 29.5 L14 31 L17.5 23 L11 17 L19.5 15.5 L16 7 L24.5 10.5 Z" fill="url(#sb-shine)" />
      <circle cx="28" cy="20" r="13" fill="url(#sb-center)" stroke="#8B6F0A" strokeWidth="1" />
      <g fill="#3D2800" opacity="0.85">
        <circle cx="28" cy="15" r="3" />
        <rect x="25.5" y="18.5" width="5" height="7" rx="1.5" />
        <rect x="19" y="7" width="18" height="4" rx="1" fill="#8B6F0A" opacity="0.7" />
        <rect x="20" y="11" width="16" height="4" rx="1" fill="#B8960C" opacity="0.8" />
        <line x1="25.5" y1="20" x2="20" y2="11" stroke="#3D2800" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="30.5" y1="20" x2="36" y2="11" stroke="#3D2800" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="24.5" y="25.5" width="2.5" height="6" rx="1.2" /><rect x="29" y="25.5" width="2.5" height="6" rx="1.2" />
      </g>
      <rect x="16" y="40" width="24" height="10" rx="5" fill="url(#sb-bg)" stroke="#8B6F0A" strokeWidth="1" />
      <text x="28" y="48" textAnchor="middle" fontSize="6" fill="#3D2800" fontFamily="Arial" fontWeight="bold">50+</text>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return <circle key={i} cx={28 + 25 * Math.cos(rad)} cy={28 + 25 * Math.sin(rad)} r="1.2" fill="#FFD700" opacity="0.6" />;
      })}
    </svg>
  );
}

export function BambehPartnerBadgeSVG({ size = 56, className }: BadgeProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Bambeh Partner Badge">
      <defs>
        <linearGradient id="bp-bg" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stopColor="#FFD700" /><stop offset="40%" stopColor="#D4A017" /><stop offset="100%" stopColor="#7A5500" /></linearGradient>
        <linearGradient id="bp-inner" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFF3B0" /><stop offset="100%" stopColor="#B8960C" /></linearGradient>
        <radialGradient id="bp-shine" cx="35%" cy="20%" r="55%"><stop offset="0%" stopColor="rgba(255,255,255,0.6)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></radialGradient>
        <filter id="bp-glow"><feGaussianBlur stdDeviation="2" result="blur" /><feFlood floodColor="#FFD700" floodOpacity="0.4" result="color" /><feComposite in="color" in2="blur" operator="in" result="shadow" /><feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <circle cx="28" cy="28" r="27" fill="none" stroke="#FFD700" strokeWidth="0.5" opacity="0.4" />
      <path d="M28 3 L52 13 L52 31 C52 44 28 53 28 53 C28 53 4 44 4 31 L4 13 Z" fill="url(#bp-bg)" stroke="#7A5500" strokeWidth="1.5" filter="url(#bp-glow)" />
      <path d="M28 3 L52 13 L52 31 C52 44 28 53 28 53 C28 53 4 44 4 31 L4 13 Z" fill="url(#bp-shine)" />
      <path d="M28 8 L47 16.5 L47 30 C47 40.5 28 48 28 48 C28 48 9 40.5 9 30 L9 16.5 Z" fill="url(#bp-inner)" stroke="rgba(255,215,0,0.5)" strokeWidth="0.8" />
      <g fill="#3D2800">
        <circle cx="28" cy="16" r="4" fill="#D4A017" />
        <path d="M24 20 Q28 22 32 20 L33 33 Q28 35 23 33 Z" fill="#B8960C" />
        <rect x="18" y="6" width="20" height="5" rx="1.5" fill="#7A5500" opacity="0.7" />
        <rect x="19" y="11" width="18" height="4.5" rx="1.2" fill="#9A6B00" opacity="0.8" />
        <path d="M24 21 L19 11" stroke="#3D2800" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 21 L37 11" stroke="#3D2800" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M25 33 L23 44" stroke="#3D2800" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M31 33 L33 44" stroke="#3D2800" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="22" cy="44.5" rx="3.5" ry="1.8" fill="#7A5500" />
        <ellipse cx="34" cy="44.5" rx="3.5" ry="1.8" fill="#7A5500" />
      </g>
      <g stroke="#7A5500" strokeWidth="0.8" fill="#B8960C" opacity="0.8">
        <ellipse cx="10" cy="28" rx="3.5" ry="2" transform="rotate(-30 10 28)" />
        <ellipse cx="8" cy="34" rx="3.5" ry="2" transform="rotate(-10 8 34)" />
        <ellipse cx="9" cy="40" rx="3.5" ry="2" transform="rotate(15 9 40)" />
      </g>
      <g stroke="#7A5500" strokeWidth="0.8" fill="#B8960C" opacity="0.8">
        <ellipse cx="46" cy="28" rx="3.5" ry="2" transform="rotate(30 46 28)" />
        <ellipse cx="48" cy="34" rx="3.5" ry="2" transform="rotate(10 48 34)" />
        <ellipse cx="47" cy="40" rx="3.5" ry="2" transform="rotate(-15 47 40)" />
      </g>
      <circle cx="28" cy="51" r="5.5" fill="#FFD700" stroke="#7A5500" strokeWidth="1" />
      <path d="M24.5 51 L27 53.5 L31.5 48.5" stroke="#3D2800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function GoldenBambehBadge({ size = 56, className }: BadgeProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Golden Bambeh Badge" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="gb-core" cx="50%" cy="45%" r="55%"><stop offset="0%" stopColor="#FFFACC" /><stop offset="50%" stopColor="#FFD700" /><stop offset="100%" stopColor="#8B6F0A" /></radialGradient>
        <radialGradient id="gb-center" cx="50%" cy="40%" r="50%"><stop offset="0%" stopColor="#FFF9E0" /><stop offset="100%" stopColor="#D4A017" /></radialGradient>
        <radialGradient id="gb-shine" cx="30%" cy="20%" r="55%"><stop offset="0%" stopColor="rgba(255,255,255,0.7)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></radialGradient>
        <filter id="gb-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feFlood floodColor="#FFD700" floodOpacity="0.7" result="color" /><feComposite in="color" in2="blur" operator="in" result="shadow" /><feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <style>{`
          @keyframes gb-rotate{from{transform:rotate(0deg);transform-origin:28px 28px}to{transform:rotate(360deg);transform-origin:28px 28px}}
          @keyframes gb-pulse{0%,100%{opacity:0.6}50%{opacity:1}}
          .gb-rays{animation:gb-rotate 12s linear infinite}
          .gb-glow-ring{animation:gb-pulse 2.5s ease-in-out infinite}
        `}</style>
      </defs>
      <circle cx="28" cy="28" r="27" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="4 3" className="gb-glow-ring" opacity="0.7" />
      <g className="gb-rays">
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const x1 = 28 + 20 * Math.cos(angle); const y1 = 28 + 20 * Math.sin(angle);
          const x2 = 28 + 27 * Math.cos(angle); const y2 = 28 + 27 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD700" strokeWidth={i % 2 === 0 ? "1.5" : "0.8"} opacity={i % 2 === 0 ? "0.9" : "0.5"} />;
        })}
      </g>
      <circle cx="28" cy="28" r="19" fill="url(#gb-core)" stroke="#8B6F0A" strokeWidth="1.5" filter="url(#gb-glow)" />
      <circle cx="28" cy="28" r="19" fill="url(#gb-shine)" />
      <circle cx="28" cy="28" r="16" fill="url(#gb-center)" stroke="rgba(255,215,0,0.4)" strokeWidth="0.8" />
      <path d="M19 15 L19 10 L22 13 L25 8 L28 11 L31 8 L34 13 L37 10 L37 15 Z" fill="#FFD700" stroke="#8B6F0A" strokeWidth="0.8" strokeLinejoin="round" />
      <g>
        <circle cx="28" cy="21" r="3.8" fill="#FFD700" stroke="#8B6F0A" strokeWidth="0.6" />
        <path d="M24.5 24.5 Q28 26.5 31.5 24.5 L32.5 35 Q28 37 23.5 35 Z" fill="#D4A017" stroke="#8B6F0A" strokeWidth="0.5" />
        <rect x="16" y="12" width="24" height="5" rx="2" fill="#8B6F0A" opacity="0.75" />
        <rect x="17" y="17" width="22" height="4" rx="1.5" fill="#B8960C" opacity="0.85" />
        <path d="M24.5 25.5 L17 17" stroke="#8B6F0A" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M31.5 25.5 L39 17" stroke="#8B6F0A" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M25.5 35 L23 43" stroke="#8B6F0A" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M30.5 35 L33 43" stroke="#8B6F0A" strokeWidth="2.8" strokeLinecap="round" />
        <ellipse cx="21.5" cy="43.5" rx="4" ry="2" fill="#8B6F0A" />
        <ellipse cx="34.5" cy="43.5" rx="4" ry="2" fill="#8B6F0A" />
      </g>
      <circle cx="28" cy="51.5" r="5" fill="#FFD700" stroke="#8B6F0A" strokeWidth="1" filter="url(#gb-glow)" />
      <text x="28" y="54" textAnchor="middle" fontSize="5.5" fill="#3D2800" fontFamily="Arial" fontWeight="bold">?1</text>
    </svg>
  );
}

export type BadgeTier = 'first_load' | 'steady_carry' | 'strong_back' | 'bambeh_partner' | 'golden_bambeh';

export const BADGE_META: Record<BadgeTier, { label: string; description: string; criteria: string; color: string; Component: React.FC<BadgeProps> }> = {
  first_load:      { label: 'First Load',      description: 'You took your first step. The journey begins.', criteria: 'Complete first transaction',       color: '#C87941', Component: FirstLoadBadge       },
  steady_carry:    { label: 'Steady Carry',    description: 'The market knows your name.',                   criteria: '10 successful transactions',        color: '#6889AA', Component: SteadyCarryBadge    },
  strong_back:     { label: 'Strong Back',     description: 'You carry with strength and honor.',            criteria: '50 transactions, 4.5+ rating',      color: '#D4A017', Component: StrongBackBadge     },
  bambeh_partner:  { label: 'Bambeh Partner',  description: "The community's most trusted carrier.",         criteria: '100+ transactions, verified',        color: '#B8960C', Component: BambehPartnerBadgeSVG},
  golden_bambeh:   { label: 'Golden Bambeh',   description: 'The legend. The one who carries all loads.',   criteria: 'Top 1% seller of the month',        color: '#FFD700', Component: GoldenBambehBadge    },
};

export function BadgeDisplay({ tier, size = 56, showLabel = false, showTooltip = false, className }: BadgeProps & { tier: BadgeTier; showLabel?: boolean; showTooltip?: boolean }) {
  const meta = BADGE_META[tier];
  const { Component } = meta;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}
      title={showTooltip ? `${meta.label}: ${meta.description}` : undefined} className={className}>
      <Component size={size} />
      {showLabel && (
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Georgia', serif", color: meta.color, letterSpacing: '0.5px', textAlign: 'center', maxWidth: (size ?? 56) + 16 }}>
          {meta.label}
        </span>
      )}
    </div>
  );
}




