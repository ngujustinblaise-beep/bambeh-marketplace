/**
 * AppProviders.tsx — Bambeh Marketplace
 * Wraps the entire app in all required context providers.
 * Order matters: providers that depend on others must be nested inside them.
 */

import React, { ReactNode } from "react";

import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";
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
    </SupabaseAuthProvider>
  );
}
