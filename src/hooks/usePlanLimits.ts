// BAMBEH_DEPLOY_TOKEN__USEPLANLIMITS_FIX447B_CLEAN
/**
 * src/hooks/usePlanLimits.ts - Bambeh Marketplace
 *
 * FIX447b (supersedes FIX412b): one place that answers "is this user premium,
 * and what are they allowed to do?". Everything that limits a free user reads
 * from here, so the rules can never drift apart between screens.
 *
 * ===================================================================
 * THE STRATEGY THIS FILE ENCODES
 * ===================================================================
 * Bambeh has about a dozen live listings. A marketplace dies from the SUPPLY
 * side first: no listings, no buyers, no reason for sellers, nothing. So the
 * free tier is deliberately generous on everything that ENCOURAGES POSTING,
 * and premium sells what a serious seller wants once the place is busy.
 *
 *   FREE gets 8 photos, 30 day listings, and the rich WhatsApp share card.
 *   PREMIUM sells Buyer Protection, boosting, the verified badge, corporate,
 *   analytics, alerts, advanced filters and the exact address.
 *
 * Sell people a BETTER listing. Never sell permission to make one.
 *
 * ===================================================================
 * THREE RULES THAT MUST NOT BE BROKEN
 * ===================================================================
 *
 * 1. THE FAIL-OPEN RULE.
 *    If the subscription lookup is slow, errors, or returns something we do
 *    not understand, treat the user as PREMIUM. A free user briefly getting
 *    a premium feature costs nothing. A PAYING user blocked costs a customer,
 *    a refund and a one-star review. When in doubt, let them through.
 *
 * 2. SAFETY IS NEVER SOLD.
 *    No safety feature appears in this file and none ever should. Reporting a
 *    listing, seller ratings, the meet-safely guidance, scam warnings and the
 *    help pages are free for every user, signed in or not, for ever. If you
 *    are ever asked to put a safety feature behind the paywall: no.
 *
 * 3. PHONE NUMBERS ARE NEVER DISPLAYED. TO ANYONE. AT ANY TIER.
 *    There is deliberately no canSeePhone flag here, because there is no tier
 *    that grants it. Sellers GIVE their number so they can be paid; nobody
 *    SEES it. Contact happens inside Bambeh or it does not happen. That is
 *    also what stops people taking a deal off-platform and then losing their
 *    money with no record and no recourse.
 *
 * ===================================================================
 * THE ONE DECISION LEFT: canMessage
 * ===================================================================
 * Phone numbers are never shown. So in-app messaging is the ONLY way a buyer
 * can reach a seller. If canMessage stays false for free users, a free buyer
 * cannot contact anybody at all, and the free sellers we just attracted with
 * 8 photos and 30 day listings will get no enquiries and leave.
 *
 * Set FREE canMessage to true and premium still has plenty to sell.
 * It is one word, on the line marked below.
 *
 * It does NOT query the database itself. It asks useSubscription, the same
 * hook AuthGate and SubscriptionGuard use. One question, one hook, one answer.
 *
 * (c) 2025-2026 BAMBEH SARL. All rights reserved.
 */

import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * THE WEEKLY POSTING LIMIT SWITCH.
 *
 * false = not applied. Everybody may post as often as they like.
 * true  = free accounts are held to FREE_LIMITS.maxPostsPerWeek.
 *
 * Leave FALSE until Bambeh has a few THOUSAND live listings.
 */
export const ENFORCE_WEEKLY_POST_LIMIT = false;

/** What a FREE account may do. Change these numbers here and nowhere else. */
export const FREE_LIMITS = {
  maxImagesPerListing:    8,     // same as premium, on purpose - pulls sellers in
  maxPostsPerWeek:        1,     // not applied while the switch above is false
  listingLifespanDays:    30,    // same as premium, on purpose
  hasRichSharePreview:    true,  // same as premium - every share is a free advert
  canMessage:             false, // <<< THE ONE DECISION. See the note above.
  canUseAdvancedFilters:  false,
  canSearchOtherRegions:  false,
  canSeeExactLocation:    false,
  canBoostListing:        false,
  hasVerifiedBadge:       false,
  canSeeListingAnalytics: false,
  canSaveSearchAlerts:    false,
  canUseCorporate:        false,
  hasBuyerProtection:     false,
  canUseAiAssistant:      false,
} as const;

/** What a PREMIUM account may do. */
export const PREMIUM_LIMITS = {
  maxImagesPerListing:    8,
  maxPostsPerWeek:        999,
  listingLifespanDays:    30,
  hasRichSharePreview:    true,
  canMessage:             true,
  canUseAdvancedFilters:  true,
  canSearchOtherRegions:  true,
  canSeeExactLocation:    true,
  canBoostListing:        true,
  hasVerifiedBadge:       true,
  canSeeListingAnalytics: true,
  canSaveSearchAlerts:    true,
  canUseCorporate:        true,
  hasBuyerProtection:     true,
  canUseAiAssistant:      true,
} as const;

/**
 * GIVING IS ALWAYS OPEN. SEEING IS WHAT PREMIUM BUYS.
 *
 * A free seller still enters their phone number and their full address when
 * they post, and nothing here blocks that. If we cannot reach a seller we
 * cannot pay a seller, and an unpaid seller never comes back. What a free
 * account cannot do is SEE somebody else's exact address.
 */

export type PlanLimits = typeof PREMIUM_LIMITS;

export interface PlanState extends PlanLimits {
  loading:   boolean;
  isPremium: boolean;
  isAdmin:   boolean;
}

/**
 * Defers entirely to useSubscription + useAuth, exactly as AuthGate does,
 * including the two rules AuthGate already learned the hard way:
 *   FIX397 - an admin is NEVER held at the paywall
 *   FIX320 - "no answer yet" means WAIT, never NO
 */
export function usePlanLimits(): PlanState {
  const { user, isAdmin } = useAuth();
  const { isActive, isLoading } = useSubscription(user?.id ?? null);

  // FAIL OPEN. While the answer is still coming, treat the user as premium.
  const isPremium = isAdmin === true || isActive === true || isLoading === true;

  const limits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  return {
    ...limits,
    // The weekly cap only applies when the switch above is on.
    maxPostsPerWeek: ENFORCE_WEEKLY_POST_LIMIT ? limits.maxPostsPerWeek : 999,
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

/**
 * FIX447b rewrote this. It used to say "go premium for more photos", which
 * stopped being true the moment free accounts got 8 photos too. It now names
 * what premium actually buys. Never advertise a benefit both tiers have.
 *
 * The escapes below were generated programmatically, not typed by hand -
 * that is how the mojibake in FIX377 happened. The 'from' lines are left
 * exactly as they were; note the Fulfulde one still carries a stray Cyrillic
 * character from before FIX377 and wants a proper translation pass.
 */
export const UPGRADE_COPY: Record<string, {
  title: string; body: string; cta: string; from: string;
}> = {
  en: {
    title: 'Get more from Bambeh',
    body:  'Message sellers directly, get Buyer Protection, and push your advert to the top.',
    cta:   'Upgrade',
    from:  'from 100 XAF a day',
  },
  fr: {
    title: 'Profitez pleinement de Bambeh',
    body:  'Contactez les vendeurs directement, b\u00E9n\u00E9ficiez de la Protection Acheteur et placez votre annonce en t\u00EAte.',
    cta:   'Passer au premium',
    from:  '\u00E0 partir de 100 XAF par jour',
  },
  pidgin: {
    title: 'Get more for Bambeh',
    body:  'Talk to seller direct, get Buyer Protection, and push your advert go top.',
    cta:   'Go premium',
    from:  'start for 100 XAF each day',
  },
  ar: {
    title: '\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0628\u0627\u0645\u0628\u064A\u0647',
    body:  '\u0631\u0627\u0633\u0644 \u0627\u0644\u0628\u0627\u0626\u0639\u064A\u0646 \u0645\u0628\u0627\u0634\u0631\u0629\u060C \u0648\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u060C \u0648\u0627\u0631\u0641\u0639 \u0625\u0639\u0644\u0627\u0646\u0643 \u0625\u0644\u0649 \u0627\u0644\u0623\u0639\u0644\u0649.',
    cta:   '\u0627\u0634\u062A\u0631\u0643 \u0627\u0644\u0622\u0646',
    from:  '\u0627\u0628\u062A\u062F\u0627\u0621 \u0645\u0646 100 \u0641\u0631\u0646\u0643 \u064A\u0648\u0645\u064A\u0627',
  },
  ff: {
    title: 'He\u0253u ko \u0253uri e Bambeh',
    body:  'Winndu njeeyoo\u0253e to woni, he\u0253u Ndeenka Coodoowo, \u0253amtaa bayyinaango maa dow.',
    cta:   'Naatu premium',
    from:  'gila 100 XAF \u04531 \u00F1alawma',
  },
};
// BAMBEH_END_TOKEN__USEPLANLIMITS_FIX447B__COMPLETE
