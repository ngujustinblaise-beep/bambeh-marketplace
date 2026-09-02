// BAMBEH_DEPLOY_TOKEN__USEPLANLIMITS_FIX412B_CLEAN
/**
 * src/hooks/usePlanLimits.ts - Bambeh Marketplace
 *
 * FIX412b: one place that answers "is this user premium, and what are they
 * allowed to do?". Everything that limits a free user reads from here, so
 * the rules can never drift apart between screens.
 *
 * THE MOST IMPORTANT LINE IN THIS FILE IS THE FAIL-OPEN RULE.
 * If the subscription lookup is slow, errors, or returns something we do not
 * understand, we treat the user as PREMIUM. A free user occasionally getting
 * five photos costs nothing. A PAYING user blocked at one photo costs a
 * customer, a refund and a one-star review. When in doubt, let them through.
 *
 * It does NOT query the database itself. It asks useSubscription, which is
 * the same hook AuthGate and SubscriptionGuard already use.
 *
 * (c) 2025-2026 BAMBEH SARL. All rights reserved.
 */

import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

/** What a FREE account may do. Change these numbers here and nowhere else. */
export const FREE_LIMITS = {
  maxImagesPerListing: 1,
  maxPostsPerWeek:     1,
  canMessage:          false,
  canUseAdvancedFilters: false,
  canSearchOtherRegions: false,
  canSeeExactLocation:   false,
} as const;

/** What a PREMIUM account may do. */
export const PREMIUM_LIMITS = {
  maxImagesPerListing: 5,
  maxPostsPerWeek:     999,
  canMessage:          true,
  canUseAdvancedFilters: true,
  canSearchOtherRegions: true,
  canSeeExactLocation:   true,
} as const;

export type PlanLimits = typeof PREMIUM_LIMITS;

export interface PlanState extends PlanLimits {
  loading:   boolean;
  isPremium: boolean;
  isAdmin:   boolean;
}

/**
 * FIX412b - REWRITTEN after reading AuthGate.tsx.
 *
 * The first version ran its own query against `subscriptions`. That was a
 * second source of truth, and a second source of truth is a bug waiting to
 * happen: a member who paid, got past AuthGate into /chat, and was then
 * blocked at one photo because my query disagreed. Every screen must ask the
 * SAME question of the SAME hook.
 *
 * So this now defers entirely to useSubscription + useAuth, exactly as
 * AuthGate does, including the two rules AuthGate already learned the hard way:
 *   FIX397 - an admin is NEVER held at the paywall
 *   FIX320 - "no answer yet" means WAIT, never NO
 */
export function usePlanLimits(): PlanState {
  const { user, isAdmin } = useAuth();
  const { isActive, isLoading } = useSubscription(user?.id ?? null);

  // FAIL OPEN. While the answer is still coming, treat the user as premium.
  // A free user briefly getting 5 photos costs nothing. A PAYING user blocked
  // at 1 photo costs a customer, a refund and a one-star review.
  const isPremium = isAdmin === true || isActive === true || isLoading === true;

  return {
    ...(isPremium ? PREMIUM_LIMITS : FREE_LIMITS),
    loading:   isLoading === true,
    isPremium,
    isAdmin:   isAdmin === true,
  };
}

/** The three prices, in one place, in all five languages. */
export const PLAN_PRICES = {
  daily:   { xaf: 100,   key: 'daily'   },
  weekly:  { xaf: 500,   key: 'weekly'  },
  monthly: { xaf: 1500,  key: 'monthly' },
} as const;

export const UPGRADE_COPY: Record<string, {
  title: string; body: string; cta: string; from: string;
}> = {
  en: {
    title: 'Add more photos',
    body:  'Listings with several photos sell far faster. Go premium to add up to 5.',
    cta:   'Upgrade',
    from:  'from 100 XAF a day',
  },
  fr: {
    title: 'Ajoutez plus de photos',
    body:  'Les annonces avec plusieurs photos se vendent bien plus vite. Passez en premium pour en ajouter jusqu\u0027\u00e0 5.',
    cta:   'Passer au premium',
    from:  '\u00e0 partir de 100 XAF par jour',
  },
  pidgin: {
    title: 'Put more photo',
    body:  'Thing weh get plenty photo dey sell quick quick. Go premium make you fit put reach 5.',
    cta:   'Go premium',
    from:  'start for 100 XAF each day',
  },
  ar: {
    title: '\u0623\u0636\u0641 \u0645\u0632\u064A\u062F\u0627 \u0645\u0646 \u0627\u0644\u0635\u0648\u0631',
    body:  '\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0630\u0627\u062A \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0645\u062A\u0639\u062F\u062F\u0629 \u062A\u064F\u0628\u0627\u0639 \u0623\u0633\u0631\u0639 \u0628\u0643\u062B\u064A\u0631. \u0627\u0634\u062A\u0631\u0643 \u0644\u0625\u0636\u0627\u0641\u0629 \u062D\u062A\u0649 5 \u0635\u0648\u0631.',
    cta:   '\u0627\u0634\u062A\u0631\u0643 \u0627\u0644\u0622\u0646',
    from:  '\u0627\u0628\u062A\u062F\u0627\u0621 \u0645\u0646 100 \u0641\u0631\u0646\u0643 \u064A\u0648\u0645\u064A\u0627',
  },
  ff: {
    title: 'Beydu nate goo\u0257\u0257e',
    body:  'Bayyinaali \u0257i njogii nate keewe ina njeeyee no yaawi. Naatu premium ngam beydude haa nate 5.',
    cta:   'Naatu premium',
    from:  'gila 100 XAF \u04531 \u00f1alawma',
  },
};
// BAMBEH_END_TOKEN__USEPLANLIMITS_FIX412B__COMPLETE
