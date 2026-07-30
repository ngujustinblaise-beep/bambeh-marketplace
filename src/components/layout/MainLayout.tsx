// BAMBEH_DEPLOY_TOKEN__MAINLAYOUT_FIX176_CLEAN
/**
 * src/components/layout/MainLayout.tsx — Bambeh Marketplace
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
    </div>
  );
};

export default MainLayout;
// BAMBEH_END_TOKEN__MAINLAYOUT__COMPLETE
