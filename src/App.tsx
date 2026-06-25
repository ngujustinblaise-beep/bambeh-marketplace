import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Verify from "./pages/auth/Verify";
import ResetPassword from "./pages/auth/ResetPassword";
import BiometricSetup from "./pages/auth/BiometricSetup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verify" element={<Verify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/enable-biometrics" element={<BiometricSetup />} />
        <Route path="/biometric-setup" element={<Navigate to="/enable-biometrics" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
