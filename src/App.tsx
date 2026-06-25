import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Pages Imports
import AuthPage from "./pages/auth/AuthPage";
import BiometricLogin from "./pages/auth/BiometricLogin";
import BiometricSetup from "./pages/auth/BiometricSetup";
import ForgotCredentials from "./pages/auth/ForgotCredentials";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Verify from "./pages/auth/Verify";
import ResetPassword from "./pages/auth/ResetPassword";

export default function App() {
  return (
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
  );
}