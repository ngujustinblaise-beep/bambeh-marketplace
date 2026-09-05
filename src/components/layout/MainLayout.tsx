// BAMBEH_DEPLOY_TOKEN__MAINLAYOUT_FIX465_CLEAN
/**
 * src/components/layout/MainLayout.tsx — Bambeh Marketplace
 *
 * FIX465 — THE ADVERTISING STACK IS SWITCHED ON.
 * ─────────────────────────────────────────────
 * AdInterstitial.tsx has existed, finished and store-policy-compliant, since
 * FIX430. A repo-wide search on 05 Sep 2026 found that NO FILE IMPORTED IT.
 * It had never rendered once. That is why `corporate_ads` held a single row
 * and no advert had ever been shown to anybody.
 *
 * Two lines fix that:
 *   - useListingViewTracker() counts a view whenever the route becomes a
 *     listing detail page, for all seven detail routes at once
 *   - <AdInterstitial /> renders the advert when the rules allow it
 *
 * It sits AFTER <Footer /> deliberately. The interstitial is a fixed overlay
 * with its own z-index, so its position in the tree does not affect layout,
 * but keeping it last means it can never push page content around if the
 * component is ever changed to render inline.
 *
 * It is OUTSIDE <SubscriptionGuard>. The guard blocks page content for users
 * without a subscription — and those are precisely the users who should see
 * adverts. Putting the interstitial inside the guard would have shown adverts
 * only to the paying users who are exempt from them.
 *
 * FIX186 — HEADER + FOOTER, fixed bottom nav removed
 * ───────────────────────────────────────────────────
 * The fixed bottom navigation bar overlapped page content on every screen
 * that puts an action button at the bottom: "Apply now" on Jobs, "Book site
 * visit" and "Message client" on Rentals, and "Add to cart" on product
 * pages. Its collapse handle only folded it partway, so the buttons stayed
 * unreachable. It is now removed — navigation lives in the Header (hamburger
 * menu on mobile, full nav on desktop), which reaches every destination the
 * bottom bar did.
 *
 * The h-20 spacer that existed purely to clear the bottom bar is gone too,
 * so pages no longer end with a strip of dead space.
 *
 * Layout order:  Header (top)  →  page content  →  Footer
 *
 * To restore the bar: re-add the BottomNav import and render it after
 * <Footer />, together with a spacer div of at least h-20.
 */
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SubscriptionGuard from '@/components/security/SubscriptionGuard';
import AdInterstitial from '@/components/ads/AdInterstitial';          // FIX465
import { useListingViewTracker } from '@/lib/listingViewTracker';      // FIX465

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // FIX465 - counts one listing view per detail-page visit, for every
  // category at once. See src/lib/listingViewTracker.ts for why this is
  // here and not repeated across seven detail pages.
  useListingViewTracker();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* FIX229 - the paywall. Posting, /subscription and /donate stay open;
            everything else needs an active subscription verified in Supabase. */}
        <SubscriptionGuard>
          {children}
        </SubscriptionGuard>
      </main>

      <Footer />

      {/* FIX465 - outside the paywall on purpose: free users are the ones who
          should see adverts, and premium users are exempt inside the
          component itself. Renders nothing at all until the rules allow it. */}
      <AdInterstitial />
    </div>
  );
};

export default MainLayout;
// BAMBEH_END_TOKEN__MAINLAYOUT_FIX465__COMPLETE
