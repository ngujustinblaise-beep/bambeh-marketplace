import React, { createContext, useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Pages Imports
import AuthPage from "./pages/auth/AuthPage";
import BiometricLogin from "./pages/auth/BiometricLogin";
import BiometricSetup from "./pages/auth/BiometricSetup";
import ForgotCredentials from "./pages/auth/ForgotCredentials";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Verify from "./pages/auth/Verify";
import ResetPassword from "./pages/auth/ResetPassword";

// Strictly Typed Context Mocks to satisfy internal UI dependencies
interface ProviderProps {
  children: React.ReactNode;
}

const LanguageContext = createContext({ 
  language: "en", 
  setLanguage: (lang: string) => {}, 
  t: (k: string) => k, 
  isRtl: false 
});

function LanguageProvider({ children }: ProviderProps) {
  return (
    <LanguageContext.Provider value={{ language: "en", setLanguage: () => {}, t: (k: string) => k, isRtl: false }}>
      {children}
    </LanguageContext.Provider>
  );
}

const CartContext = createContext({});
function CartProvider({ children }: ProviderProps) { 
  return <CartContext.Provider value={{}}>{children}</CartContext.Provider>; 
}

const NetworkContext = createContext({ isOnline: true });
function NetworkProvider({ children }: ProviderProps) { 
  return <NetworkContext.Provider value={{ isOnline: true }}>{children}</NetworkContext.Provider>; 
}

function AppProviders({ children }: ProviderProps) { 
  return <>{children}</>; 
}

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <NetworkProvider>
          <AppProviders>
            <BrowserRouter>
              <Routes>
                {/* Core Entry Point: Redirect to onboarding gateway */}
                <Route path="/" element={<Navigate to="/auth/login" replace />} />

                {/* Authentication Router Tree Matrix */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/auth/login" element={<BiometricLogin />} />
                <Route path="/auth/register" element={<div style={{ padding: '2rem' }}>Registration Page Template</div>} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/forgot-credentials" element={<ForgotCredentials />} />
                
                {/* Verification & Lifecycle Management */}
                <Route path="/verify" element={<Verify />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/enable-biometrics" element={<BiometricSetup />} />
                <Route path="/biometric-setup" element={<Navigate to="/enable-biometrics" replace />} />

                {/* Safety Net Wildcard Catch-All to prevent empty screen failures */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </AppProviders>
        </NetworkProvider>
      </CartProvider>
    </LanguageProvider>
  );
}