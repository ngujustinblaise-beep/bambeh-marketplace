/**
 * src/contexts/AuthProvider.tsx
 * Bridge to the single auth source in @/contexts/AuthContext, plus the async
 * protected-route wrappers. Everything uses the unified useAuth().
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Re-export so any file importing AuthProvider from here keeps working.
export { AuthProvider } from "@/contexts/AuthContext";

const AuthLoadingScreen: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0f172a" }} aria-busy="true">
    <div style={{ width: 48, height: 48, border: "4px solid rgba(20,184,166,0.2)", borderTop: "4px solid #14b8a6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const VendorProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, isVendor, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!user || !isVendor) {
    const safe = location.pathname.startsWith("/vendor/") ? location.pathname : "/vendor/dashboard";
    localStorage.setItem("Bambeh_vendor_redirect", safe);
    return <Navigate to="/vendor/login" replace />;
  }
  return <>{children}</>;
};

export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!user || !isAdmin) {
    const safe = location.pathname.startsWith("/admin/") ? location.pathname : "/admin/dashboard";
    localStorage.setItem("Bambeh_admin_redirect", safe);
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export const UserProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!user) {
    localStorage.setItem("Bambeh_user_redirect", location.pathname);
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};