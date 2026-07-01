// Re-export the single auth source so every import path resolves to the same context.
export { useAuth, AuthContext, AuthProvider } from "@/contexts/AuthContext";
export type { AuthUser, AuthContextValue } from "@/contexts/AuthContext";
export { useAuth as default } from "@/contexts/AuthContext";