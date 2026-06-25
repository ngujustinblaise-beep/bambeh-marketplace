// @ts-nocheck
import React from "react";
import { Navigate } from "react-router-dom";
import type { AuthUser } from "@/types/auth";

interface ProtectedRouteProps {
  user: AuthUser | null;
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  user, children, redirectTo = "/login",
}) => {
  if (!user) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};

export default ProtectedRoute;





