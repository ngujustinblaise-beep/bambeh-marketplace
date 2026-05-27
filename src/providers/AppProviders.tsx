/**
 * AppProviders.tsx — Bambeh Marketplace
 * Wraps the entire app in all required context providers.
 * Order matters: providers that depend on others must be nested inside them.
 *
 * Provider hierarchy (outermost → innermost):
 *   SupabaseAuthProvider  — Supabase session cache (must be first)
 *   LanguageProvider      — Language/translation (second, so ALL children can translate)
 *   AuthProvider          — App-level auth context
 *   SubscriptionProvider  — Subscription state
 *   NotificationProvider  — Push + in-app notifications
 *   CartProvider          — Shopping cart state
 *   VendorProvider        — Vendor-specific context
 *   AdminProvider         — Admin panel context
 *   ChatProvider          — Real-time chat state
 *   ThemeProvider         — UI theme (light/dark)
 *   ReportProvider        — Issue reporting context
 *   AccountStatusProvider — Account suspension / verification banners
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
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

// ─── IMPORTANT ────────────────────────────────────────────────────────────────
// We import from @/contexts/LanguageContext (PLURAL — the full version).
// If you have a file at src/context/LanguageContext.tsx (SINGULAR), DELETE IT.
// There must be only ONE LanguageContext file: src/contexts/LanguageContext.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { LanguageProvider } from "@/contexts/LanguageContext";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    // SupabaseAuthProvider must be outermost so every child can call
    // useSupabaseAuth() — including AuthContext, AuthGate, etc.
    <SupabaseAuthProvider>
      {/*
        LanguageProvider is second so that EVERY page, header, footer,
        and component inside can call useLanguage() and get translations.
        Previously it was buried deep inside ChatProvider — moved up here.
      */}
      <LanguageProvider>
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
      </LanguageProvider>
    </SupabaseAuthProvider>
  );
}
