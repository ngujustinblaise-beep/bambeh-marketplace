/**
 * BambehPartnerBadge.tsx — Reusable partner badge display component.
 * Determines tier from transaction count + rating, renders the badge.
 */

import React, { useState } from 'react';
import { BadgeTier, BADGE_META, FirstLoadBadge, SteadyCarryBadge, StrongBackBadge, BambehPartnerBadgeSVG, GoldenBambehBadge } from './BambehBadgeSVGs';

interface TierResult {
  tier: BadgeTier;
  nextTier: BadgeTier | null;
  progressToNext: number;
  transactionsToNext: number | null;
}

export function resolveTier(transactionCount: number, rating: number, isVerified: boolean, isTopSeller: boolean): TierResult {
  if (isTopSeller) {
    return { tier: 'golden_bambeh', nextTier: null, progressToNext: 1, transactionsToNext: null };
  }
  if (isVerified && transactionCount >= 100) {
    return { tier: 'bambeh_partner', nextTier: 'golden_bambeh', progressToNext: 1, transactionsToNext: null };
  }
  if (transactionCount >= 50 && rating >= 4.5) {
    return { tier: 'strong_back', nextTier: 'bambeh_partner', progressToNext: Math.min(1, transactionCount / 100), transactionsToNext: Math.max(0, 100 - transactionCount) };
  }
  if (transactionCount >= 10) {
    return { tier: 'steady_carry', nextTier: 'strong_back', progressToNext: Math.min(1, transactionCount / 50), transactionsToNext: Math.max(0, 50 - transactionCount) };
  }
  if (transactionCount >= 1) {
    return { tier: 'first_load', nextTier: 'steady_carry', progressToNext: Math.min(1, transactionCount / 10), transactionsToNext: Math.max(0, 10 - transactionCount) };
  }
  return { tier: 'first_load', nextTier: 'steady_carry', progressToNext: 0, transactionsToNext: 10 };
}

interface BambehPartnerBadgeProps {
  transactionCount: number;
  rating?: number;
  isVerified?: boolean;
  isTopSeller?: boolean;
  size?: number;
  showLabel?: boolean;
  showProgress?: boolean;
  showDescription?: boolean;
  expanded?: boolean;
  className?: string;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ width: `${Math.round(value * 100)}%`, height: '100%', background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: 3, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </div>
  );
}

function TierLadder({ currentTier }: { currentTier: BadgeTier }) {
  const tiers: BadgeTier[] = ['first_load', 'steady_carry', 'strong_back', 'bambeh_partner', 'golden_bambeh'];
  const currentIdx = tiers.indexOf(currentTier);
  const COMPONENTS: Record<BadgeTier, React.FC<{ size?: number }>> = {
    first_load: FirstLoadBadge, steady_carry: SteadyCarryBadge, strong_back: StrongBackBadge,
    bambeh_partner: BambehPartnerBadgeSVG, golden_bambeh: GoldenBambehBadge,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(184,150,12,0.15)' }}>
      {tiers.map((tier, i) => {
        const BadgeCmp = COMPONENTS[tier];
        const isCurrent = i === currentIdx;
        const isAchieved = i < currentIdx;
        const isLocked = i > currentIdx;
        return (
          <React.Fragment key={tier}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, opacity: isLocked ? 0.3 : 1, filter: isCurrent ? 'drop-shadow(0 0 6px rgba(212,160,23,0.8))' : 'none', transform: isCurrent ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.3s ease' }}>
              <BadgeCmp size={28} />
            </div>
            {i < tiers.length - 1 && (
              <div style={{ flex: 1, height: 2, background: isAchieved ? 'linear-gradient(90deg,#D4A017,#B8960C)' : 'rgba(255,255,255,0.1)', borderRadius: 1, minWidth: 8 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function BambehPartnerBadge({
  transactionCount, rating = 0, isVerified = false, isTopSeller = false,
  size = 48, showLabel = false, showProgress = false, showDescription = false, expanded = false, className,
}: BambehPartnerBadgeProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const { tier, nextTier, progressToNext, transactionsToNext } = resolveTier(transactionCount, rating, isVerified, isTopSeller);
  const meta = BADGE_META[tier];
  const nextMeta = nextTier ? BADGE_META[nextTier] : null;
  const { Component } = meta;

  if (!expanded) {
    return (
      <div className={className} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative', cursor: 'pointer' }}
        onMouseEnter={() => setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)}
        onTouchStart={() => setTooltipVisible(v => !v)}>
        <Component size={size} />
        {showLabel && (
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Georgia', serif", color: meta.color, letterSpacing: '0.3px', textAlign: 'center' }}>
            {meta.label}
          </span>
        )}
        {showProgress && nextMeta && (
          <div style={{ width: size + 8 }}>
            <ProgressBar value={progressToNext} color={meta.color} />
            {transactionsToNext != null && (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 3, fontFamily: 'Arial,sans-serif' }}>
                {transactionsToNext} more to {nextMeta.label}
              </div>
            )}
          </div>
        )}
        {tooltipVisible && (
          <div style={{ position: 'absolute', bottom: size + 12, left: '50%', transform: 'translateX(-50%)', background: '#1a1200', border: '1px solid rgba(184,150,12,0.4)', borderRadius: 10, padding: '8px 12px', width: 180, zIndex: 100, pointerEvents: 'none' }}>
            <div style={{ fontFamily: "'Georgia', serif", fontSize: 12, fontWeight: 700, color: meta.color, marginBottom: 3 }}>{meta.label}</div>
            <div style={{ fontFamily: 'Arial,sans-serif', fontSize: 11, color: 'rgba(255,248,231,0.8)', fontStyle: 'italic' }}>"{meta.description}"</div>
            <div style={{ fontFamily: 'Arial,sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{meta.criteria}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={{ background: 'linear-gradient(160deg,#1a1200,#0f0a00)', border: `1px solid ${meta.color}44`, borderRadius: 16, padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle,${meta.color}22 0%,transparent 70%)`, pointerEvents: 'none' }} />
      <Component size={size} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 700, color: meta.color, letterSpacing: '0.5px' }}>{meta.label}</div>
        {showDescription && (
          <div style={{ fontFamily: 'Arial,sans-serif', fontSize: 12, color: 'rgba(255,248,231,0.7)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5 }}>"{meta.description}"</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: meta.color, fontFamily: 'Arial' }}>{transactionCount}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial' }}>Loads carried</div>
        </div>
        {rating > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: meta.color, fontFamily: 'Arial' }}>★ {rating.toFixed(1)}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial' }}>Rating</div>
          </div>
        )}
        {isVerified && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#22C55E', fontFamily: 'Arial' }}>✓</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial' }}>Verified</div>
          </div>
        )}
      </div>
      {showProgress && nextMeta && (
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial', marginBottom: 2 }}>
            <span>{meta.label}</span><span>{nextMeta.label}</span>
          </div>
          <ProgressBar value={progressToNext} color={meta.color} />
          {transactionsToNext != null && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 4, fontFamily: 'Arial' }}>
              {transactionsToNext} more {transactionsToNext === 1 ? 'transaction' : 'transactions'} to reach {nextMeta.label}
            </div>
          )}
        </div>
      )}
      <TierLadder currentTier={tier} />
    </div>
  );
}




