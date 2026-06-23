/**
 * AppProviders.tsx Ã¢â‚¬Ã¢â‚¬Â Bambeh Marketplace
 * Wraps the entire app in all required context providers.
 * Order matters: providers that depend on others must be nested inside them.
 *
 * Provider hierarchy (outermost â†’ innermost):
 *   SupabaseAuthProvider  Ã¢â‚¬Ã¢â‚¬Â Supabase session cache (must be first)
 *   LanguageProvider      Ã¢â‚¬Ã¢â‚¬Â Language/translation (second, so ALL children can translate)
 *   AuthProvider          Ã¢â‚¬Ã¢â‚¬Â App-level auth context
 *   SubscriptionProvider  Ã¢â‚¬Ã¢â‚¬Â Subscription state
 *   NotificationProvider  Ã¢â‚¬Ã¢â‚¬Â Push + in-app notifications
 *   CartProvider          Ã¢â‚¬Ã¢â‚¬Â Shopping cart state
 *   VendorProvider        Ã¢â‚¬Ã¢â‚¬Â Vendor-specific context
 *   AdminProvider         Ã¢â‚¬Ã¢â‚¬Â Admin panel context
 *   ChatProvider          Ã¢â‚¬Ã¢â‚¬Â Real-time chat state
 *   ThemeProvider         Ã¢â‚¬Ã¢â‚¬Â UI theme (light/dark)
 *   ReportProvider        Ã¢â‚¬Ã¢â‚¬Â Issue reporting context
 *   AccountStatusProvider Ã¢â‚¬Ã¢â‚¬Â Account suspension / verification banners
 *
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { ReactNode } from "react";

import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CartProvider } from "@/contexts/CartContext";
import { VendorProvider } from "@/contexts/VendorContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ReportProvider } from "@/contexts/ReportContext";
import { AccountStatusProvider } from "@/contexts/AccountStatusContext";

// Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬ IMPORTANT Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬
// We import from @/App (PLURAL Ã¢â‚¬Ã¢â‚¬Â the full version).
// If you have a file at src/context/LanguageContext.tsx (SINGULAR), DELETE IT.
// There must be only ONE LanguageContext file: src/contexts/LanguageContext.tsx
// Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬Ã¢Ã¢â‚¬Ââ‚¬
interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    // SupabaseAuthProvider must be outermost so every child can call
    // useSupabaseAuth() Ã¢â‚¬Ã¢â‚¬Â including AuthContext, AuthGate, etc.
    <SupabaseAuthProvider>
      {/*
        LanguageProvider is second so that EVERY page, header, footer,
        and component inside can call useLanguage() and get translations.
        Previously it was buried deep inside ChatProvider Ã¢â‚¬Ã¢â‚¬Â moved up here.
      */}
      
        <AuthProvider>
          <SubscriptionProvider>
            <NotificationProvider>
              <CartProvider>
                <VendorProvider>
                  <AdminProvider>
                    <ChatProvider>
                      <ThemeProvider>
                        <ReportProvider>
                          <AccountStatusProvider>
                            {children}
                          </AccountStatusProvider>
                        </ReportProvider>
                      </ThemeProvider>
                    </ChatProvider>
                  </AdminProvider>
                </VendorProvider>
              </CartProvider>
            </NotificationProvider>
          </SubscriptionProvider>
        </AuthProvider>
      
    </SupabaseAuthProvider>
  );
}






