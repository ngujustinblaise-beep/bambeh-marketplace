import React, { createContext, useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Pages Dynamic Sanitized Scan Imports
import AuthPage from "./pages/auth/AuthPage";
import BiometricLogin from "./pages/auth/BiometricLogin";
import BiometricSetup from "./pages/auth/BiometricSetup";
import ForgotCredentials from "./pages/auth/ForgotCredentials";
import ForgotPassword from "./pages/auth/ForgotPassword";
import login from "./pages/auth/login";
import ResetPassword from "./pages/auth/ResetPassword";
import Verify from "./pages/auth/Verify";

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
                {/* Dynamic Clean Auth Scan Routes Layout Tree */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/auth/biometriclogin" element={<BiometricLogin />} />
                <Route path="/enable-biometrics" element={<BiometricSetup />} />
                <Route path="/biometric-setup" element={<Navigate to="/enable-biometrics" replace />} />
                <Route path="/auth/forgotcredentials" element={<ForgotCredentials />} />
                <Route path="/auth/forgotpassword" element={<ForgotPassword />} />
                <Route path="/auth/login" element={<login />} />
                <Route path="/resetpassword" element={<ResetPassword />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/auth/register" element={<div style={{ padding: '2rem' }}>Registration Page Template</div>} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </AppProviders>
        </NetworkProvider>
      </CartProvider>
    </LanguageProvider>
  );
}