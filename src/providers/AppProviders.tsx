/**
 * AppProviders.tsx - Bambeh Marketplace
 * Wraps the entire app in all required context providers.
 * Order matters: providers that depend on others must be nested inside them.
 *
 * FIX (useAuth crash): Added <AuthProvider> from @/contexts/AuthContext, nested
 * directly inside <SupabaseAuthProvider> (which it depends on via useSupabaseAuth).
 * Without it, useAuth() - called by AuthGate and ~60 components - had no matching
 * provider and threw "useAuth must be used inside <AuthProvider>", blanking the app.
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