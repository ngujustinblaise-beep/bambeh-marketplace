/**
 * AppProviders.tsx â€â€ Bambeh Marketplace
 * Wraps the entire app in all required context providers.
 * Order matters: providers that depend on others must be nested inside them.
 *
 * Provider hierarchy (outermost â†’ innermost):
 *   SupabaseAuthProvider  â€â€ Supabase session cache (must be first)
 *   LanguageProvider      â€â€ Language/translation (second, so ALL children can translate)
 *   AuthProvider          â€â€ App-level auth context
 *   SubscriptionProvider  â€â€ Subscription state
 *   NotificationProvider  â€â€ Push + in-app notifications
 *   CartProvider          â€â€ Shopping cart state
 *   VendorProvider        â€â€ Vendor-specific context
 *   AdminProvider         â€â€ Admin panel context
 *   ChatProvider          â€â€ Real-time chat state
 *   ThemeProvider         â€â€ UI theme (light/dark)
 *   ReportProvider        â€â€ Issue reporting context
 *   AccountStatusProvider â€â€ Account suspension / verification banners
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

// ââ€€ââ€€ââ€€ IMPORTANT ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€
// We import from @/App (PLURAL â€â€ the full version).
// If you have a file at src/context/LanguageContext.tsx (SINGULAR), DELETE IT.
// There must be only ONE LanguageContext file: src/contexts/LanguageContext.tsx
// ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€
interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    // SupabaseAuthProvider must be outermost so every child can call
    // useSupabaseAuth() â€â€ including AuthContext, AuthGate, etc.
    <SupabaseAuthProvider>
      {/*
        LanguageProvider is second so that EVERY page, header, footer,
        and component inside can call useLanguage() and get translations.
        Previously it was buried deep inside ChatProvider â€â€ moved up here.
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


