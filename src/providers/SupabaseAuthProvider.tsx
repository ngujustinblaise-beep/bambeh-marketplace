/**
 * src/providers/SupabaseAuthProvider.tsx
 * The real provider is AuthProvider in @/contexts/AuthContext (mounted in
 * AppProviders). This passthrough remains so any code importing
 * SupabaseAuthProvider still compiles; it just renders its children.
 */
import React from "react";
export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export default SupabaseAuthProvider;