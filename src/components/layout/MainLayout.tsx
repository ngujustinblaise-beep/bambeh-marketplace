// BAMBEH_DEPLOY_TOKEN__MAINLAYOUT_FIX465B_CLEAN
/**
 * src/components/layout/MainLayout.tsx — Bambeh Marketplace
 *
 * FIX465b — REPAIRS THE BROKEN BUILD FROM FIX465.
 * ───────────────────────────────────────────────
 * The FIX465 version of this file imported "@/lib/listingViewTracker", a file
 * that does not exist and was never written:
 *
 *     [UNLOADABLE_DEPENDENCY] Could not load src/lib/listingViewTracker
 *
 * That import came from an earlier plan where the route-view counter lived in
 * its own hook. The counter was then built INSIDE AdInterstitial instead — but
 * this file still carried the import for the hook that was never created. It
 * is removed here. Nothing else about FIX465 changes.
 *
 * FIX465 — THE ADVERT IS SWITCHED ON.
 * ───────────────────────────────────
 * AdInterstitial has existed and worked since FIX430, but no file in the app
 * ever imported it, so it had never displayed once. That is why `corporate_ads`
 * held a single row and no advertiser could ever be shown a number.
 *
 * It is mounted HERE, once, rather than in App.tsx, because:
 *   - it must be inside the Router (it reads the current path to know when a
 *     listing detail page has opened, and counts the view itself), and
 *   - every page a user browses passes through MainLayout.
 *
 * It sits OUTSIDE SubscriptionGuard on purpose. The guard decides what content
 * a user may see; the advert is not content, it is a fixed overlay that must be
 * able to appear over any page the user is allowed to reach. Putting it inside
 * would also mean it unmounted every time the guard swapped children.
 *
 * It renders null until it decides to show an advert, so it costs one component
 * instance and no layout space. Premium and staff accounts never see one.
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

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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

      {/* FIX465 - renders null until it decides to show an advert. It counts
          listing views itself from the route, so no detail page had to change. */}
      <AdInterstitial />
    </div>
  );
};

export default MainLayout;
// BAMBEH_END_TOKEN__MAINLAYOUT_FIX465B__COMPLETE
