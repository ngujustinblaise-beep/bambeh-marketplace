// Re-exports useAuth from AuthContext for components that import from hooks/useAuth
export { useAuth } from '../contexts/AuthContext';
export type { AuthUser, AuthContextValue } from '../contexts/AuthContext';