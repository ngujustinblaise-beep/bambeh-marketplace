/**
 * AppProviders.tsx — Bambeh Marketplace
 * Wraps the entire app in all required context providers.
 * Order matters: providers that depend on others must be nested inside them.
 *
 * Provider hierarchy (outermost → innermost):
 *   SupabaseAuthProvider  — Supabase session cache (must be first; everything
 *                            that does auth reads from here)
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

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    // SupabaseAuthProvider must be outermost so every child can call
    // useSupabaseAuth() — including AuthContext, AuthGate, and any
    // provider that needs to know if the user is authenticated.
    <SupabaseAuthProvider>
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
