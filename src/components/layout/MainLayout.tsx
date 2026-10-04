// BAMBEH_DEPLOY_TOKEN__MAINLAYOUT_FIX621_CLEAN
/**
 * src/components/layout/MainLayout.tsx - Bambeh Marketplace
 *
 * FIX621 - THE PLAY APP SHOWS NO PAYWALL, NO SPONSOR BANNER AND NO FULL-SCREEN ADVERT.
 * In the browser nothing changes. Inside the Android app (IS_STORE_APP, FIX620):
 *   - no SubscriptionGuard: everything a member could open is open. Google
 *     requires its own billing for digital features sold inside a Play app, so
 *     the Play app sells none;
 *   - no SponsorBanner: there is nothing to announce when nothing is locked;
 *   - no AdInterstitial: full-screen adverts are where Play's disruptive-ads rules
 *     bite, and the store listing must then declare "contains ads".
 *
 * Everything below is the FIX465b layout, unchanged:
 * Header (top) -> page content -> Footer. The fixed bottom bar stays removed
 * (FIX186) because it covered "Apply now", "Book site visit" and "Add to cart".
 * AdInterstitial sits outside SubscriptionGuard (FIX465) so it can appear over
 * any page the user may reach; it renders nothing until it decides to show one.
 */
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SubscriptionGuard from '@/components/security/SubscriptionGuard';
import AdInterstitial from '@/components/ads/AdInterstitial';          // FIX465
import { SponsorBanner } from '@/components/subscription/SponsorBanner';  // FIX541
import { useLang } from '@/hooks/useAppLang';                            // FIX540
import { IS_STORE_APP } from '@/config/storeMode';                       // FIX620

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const lang = useLang();   // FIX540 - the sponsor line in the user's language
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" data-fix="FIX621">
      <Header />

      <main className="flex-1">
        {IS_STORE_APP ? null : (
          <div className="px-4 pt-3"><SponsorBanner lang={lang as string} /></div>
        )}
        {IS_STORE_APP ? children : <SubscriptionGuard>{children}</SubscriptionGuard>}
      </main>

      <Footer />

      {IS_STORE_APP ? null : <AdInterstitial />}
    </div>
  );
};

export default MainLayout;
// BAMBEH_END_TOKEN__MAINLAYOUT_FIX621__COMPLETE
