/**
 * src/providers/AppProviders.tsx
 * Mounts the single AuthProvider (from @/contexts/AuthContext) at the top, so
 * every useAuth() in the app resolves correctly.
 */
import React, { ReactNode } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CartProvider } from "@/contexts/CartContext";
import { VendorProvider } from "@/contexts/VendorContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ReportProvider } from "@/contexts/ReportContext";
import { AccountStatusProvider } from "@/contexts/AccountStatusContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <NotificationProvider>
          <CartProvider>
            <VendorProvider>
                <ChatProvider>
                  <ThemeProvider>
                    <ReportProvider>
                      <AccountStatusProvider>
                        {children}
                      </AccountStatusProvider>
                    </ReportProvider>
                  </ThemeProvider>
                </ChatProvider>
            </VendorProvider>
          </CartProvider>
        </NotificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}