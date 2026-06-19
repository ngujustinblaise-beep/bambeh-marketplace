/**
 * AppProviders.tsx Ã¢â‚¬â€ Bambeh Marketplace
 * Wraps the entire app in all required context providers.
 * Order matters: providers that depend on others must be nested inside them.
 *
 * Provider hierarchy (outermost Ã¢â€ â€™ innermost):
 *   SupabaseAuthProvider  Ã¢â‚¬â€ Supabase session cache (must be first)
 *   LanguageProvider      Ã¢â‚¬â€ Language/translation (second, so ALL children can translate)
 *   AuthProvider          Ã¢â‚¬â€ App-level auth context
 *   SubscriptionProvider  Ã¢â‚¬â€ Subscription state
 *   NotificationProvider  Ã¢â‚¬â€ Push + in-app notifications
 *   CartProvider          Ã¢â‚¬â€ Shopping cart state
 *   VendorProvider        Ã¢â‚¬â€ Vendor-specific context
 *   AdminProvider         Ã¢â‚¬â€ Admin panel context
 *   ChatProvider          Ã¢â‚¬â€ Real-time chat state
 *   ThemeProvider         Ã¢â‚¬â€ UI theme (light/dark)
 *   ReportProvider        Ã¢â‚¬â€ Issue reporting context
 *   AccountStatusProvider Ã¢â‚¬â€ Account suspension / verification banners
 *
 * Ã‚Â© 2026 Bambeh Marketplace. All rights reserved.
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ IMPORTANT Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// We import from @/App (PLURAL Ã¢â‚¬â€ the full version).
// If you have a file at src/context/LanguageContext.tsx (SINGULAR), DELETE IT.
// There must be only ONE LanguageContext file: src/contexts/LanguageContext.tsx
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    // SupabaseAuthProvider must be outermost so every child can call
    // useSupabaseAuth() Ã¢â‚¬â€ including AuthContext, AuthGate, etc.
    <SupabaseAuthProvider>
      {/*
        LanguageProvider is second so that EVERY page, header, footer,
        and component inside can call useLanguage() and get translations.
        Previously it was buried deep inside ChatProvider Ã¢â‚¬â€ moved up here.
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
