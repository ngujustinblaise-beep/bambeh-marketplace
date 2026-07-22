// BAMBEH_DEPLOY_TOKEN__MAINLAYOUT_FIX176_CLEAN
/**
 * src/components/layout/MainLayout.tsx — Bambeh Marketplace
 *
 * FIX176 — RESTORE HEADER + FOOTER
 * ─────────────────────────────────
 * A prior edit stripped this layout down to just <BottomNav>, which is why
 * the Header and Footer disappeared from EVERY page wrapped in <MainLayout>
 * (Home, Marketplace, Jobs, Services, Rentals, Vehicles, Corporate, …).
 * The Header (FIX127) and Footer components were fine all along — they simply
 * were not being rendered. This puts them back in one place, so all those
 * pages get the header and footer again at once.
 *
 * Layout order:  Header (top)  →  page content  →  Footer  →  BottomNav (fixed)
 * The spacer below the Footer clears the fixed BottomNav so the footer's last
 * line is never hidden behind it.
 */
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      {/* Spacer so the fixed BottomNav never covers the footer's bottom row */}
      <div className="h-20" aria-hidden="true" />

      <BottomNav />
    </div>
  );
};

export default MainLayout;
// BAMBEH_END_TOKEN__MAINLAYOUT__COMPLETE
