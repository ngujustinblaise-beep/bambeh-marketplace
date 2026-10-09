// BAMBEH_DEPLOY_TOKEN__USEPLANLIMITS_FIX674_CLEAN
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
 * FIX674 - CHAT FOLLOWS THE COMMAND CENTER (Members-only sections, FIX671). canMessage
 *          is true for members as before, for everyone signed in when chat is switched
 *          to free, and for anyone with an active advert while "Sellers answering" is
 *          free - so a seller can always reply to a paying member. The limits are now
 *          typed as numbers and true/false (the old literal types made FREE_LIMITS fail
 *          strict type checks), and the Fulfulde "from 100 XAF a day" lost a Cyrillic
 *          letter that had slipped into it.
 *
 * (c) 2025-2026 BAMBEH SARL. All rights reserved.
 */

import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useSectionGates } from '@/hooks/useSectionGates'; // FIX674

/** Everything a plan allows. */
export interface PlanLimits {
  maxImagesPerListing: number;
  maxPostsPerWeek: number;
  canMessage: boolean;
  canUseAdvancedFilters: boolean;
  canSearchOtherRegions: boolean;
  canSeeExactLocation: boolean;
}

/** What a FREE account may do. Change these numbers here and nowhere else. */
export const FREE_LIMITS: Readonly<PlanLimits> = {
  maxImagesPerListing: 1,
  maxPostsPerWeek:     1,
  canMessage:          false,
  canUseAdvancedFilters: false,
  canSearchOtherRegions: false,
  canSeeExactLocation:   false,
};

/** What a PREMIUM account may do. */
export const PREMIUM_LIMITS: Readonly<PlanLimits> = {
  maxImagesPerListing: 5,
  maxPostsPerWeek:     999,
  canMessage:          true,
  canUseAdvancedFilters: true,
  canSearchOtherRegions: true,
  canSeeExactLocation:   true,
};

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
  const uid = user?.id ?? null;
  const { isActive, isLoading } = useSubscription(uid);
  const sections = useSectionGates(uid); // FIX674

  // FAIL OPEN. While the answer is still coming, treat the user as premium.
  // A free user briefly getting 5 photos costs nothing. A PAYING user blocked
  // at 1 photo costs a customer, a refund and a one-star review.
  const isPremium = isAdmin === true || isActive === true || isLoading === true;

  const base = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  // FIX674 - chat: switched to free in the Command Center, everyone signed in may
  // message; and anyone with an active advert may always answer (Sellers answering).
  const chatFree = sections.gates.chat === false;
  const sellerPass = sections.gates.chat_sellers === false && sections.advertiser === true;

  return {
    ...base,
    canMessage: base.canMessage || (uid !== null && (chatFree || sellerPass)),
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
    from:  'gila 100 XAF e \u00f1alawma',
  },
};
// BAMBEH_END_TOKEN__USEPLANLIMITS_FIX674__COMPLETE
