// BAMBEH_DEPLOY_TOKEN__SPONSORBANNER_FIX541_CLEAN
/**
 * src/components/subscription/SponsorBanner.tsx - Bambeh Marketplace
 *
 * FIX541 - the banner, standing on its own.
 *
 * WHY IT MOVED OUT OF FeatureGate
 *   FIX540 mounted the banner and the build died:
 *
 *     [UNRESOLVED_IMPORT] Could not resolve '../../config/subscription'
 *       in src/components/subscription/FeatureGate.tsx
 *
 *   That import is wrong and always has been. tierBridge.ts reads
 *   "../config/subscriptionPlans"; FeatureGate reads "../../config/
 *   subscription". One of those files does not exist.
 *
 *   The build never complained because NOTHING IMPORTED FeatureGate. Vite
 *   tree-shook the whole file away every time. The error's own import chain
 *   proves it - FeatureGate <- MainLayout <- App <- main <- index.html - a
 *   chain that only came into existence when FIX540 added the first link.
 *
 *   So the FeatureGate paywall was never gating anything. It could not have
 *   been: the module was never in the bundle.
 *
 * WHAT THAT MEANS FOR THIS FILE
 *   The banner has no business inheriting a broken dependency graph to show
 *   one line of text. It needs the paywall state and nothing else. Now it
 *   imports exactly that, and FeatureGate can go back to being unused until
 *   somebody decides what to do with it.
 *
 * IT RENDERS NOTHING WHEN THE WALL STANDS
 *   Safe to leave mounted forever. No layout space, no flicker, no cost.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React from 'react';
import { usePaywall, paywallMessage } from '@/hooks/usePaywall';

interface SponsorBannerProps {
  /** user's language code - en, fr, pcm, ar, ff */
  lang?: string;
  className?: string;
}

export function SponsorBanner({ lang, className = '' }: SponsorBannerProps) {
  const paywall = usePaywall();

  // nothing to say until the switch has answered, and nothing to say when
  // the wall still stands
  if (!paywall.ready || !paywall.free) return null;

  const text = paywallMessage(paywall.message, lang);
  if (!text) return null;

  const rtl = String(lang || '').toLowerCase().startsWith('ar');

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      role="status"
      className={
        'flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 ' +
        'px-4 py-3 text-sm text-emerald-900 ' + className
      }
    >
      <span aria-hidden="true" className="shrink-0">&#127873;</span>
      <span>{text}</span>
    </div>
  );
}

export default SponsorBanner;
// BAMBEH_END_TOKEN__SPONSORBANNER_FIX541__COMPLETE
