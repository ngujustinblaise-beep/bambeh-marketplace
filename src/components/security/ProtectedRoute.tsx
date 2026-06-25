/**
 * PROTECTED ROUTE — Fixed to use currentUser from AuthContext
 * FILE LOCATION: src/components/security/ProtectedRoute.tsx
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps { children: ReactNode; }

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const hasCurrentUser = !!currentUser;
  const hasToken = !!localStorage.getItem('authToken');
  const hasStoredUser = (() => { try { const s = localStorage.getItem('user'); return s ? !!JSON.parse(s) : false; } catch { return false; } })();
  const hasBambehUser = (() => { try { const u = localStorage.getItem('Bambeh_users'); if (!u) return false; const p = JSON.parse(u); return Array.isArray(p) && p.length > 0; } catch { return false; } })();
  const isAuthenticated = hasCurrentUser || hasToken || hasStoredUser || hasBambehUser;

  if (!isAuthenticated) {
    console.log('Redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;




