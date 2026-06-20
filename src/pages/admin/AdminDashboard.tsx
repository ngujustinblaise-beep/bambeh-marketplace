/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADMIN DASHBOARD - ADMIN PANEL INTEGRATION EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This page demonstrates how to integrate the Admin Panel
 * for managing orders, users, and viewing analytics.
 * 
 * FEATURES:
 * ✅ Dashboard with real-time statistics
 * ✅ Order management
 * ✅ User management
 * ✅ Analytics and charts
 * ✅ Dispute resolution
 * 
 * SECURITY:
 * ⚠️ This page should be protected with admin-only access
 * 
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanelADVANCED from '@/advanced-features/admin-panel/AdminPanel-ADVANCED';
import { useLang, t } from "@/hooks/useAppLang";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin' | 'moderator';
}

export default function AdminDashboard() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      setIsLoading(true);

      // In production, verify admin credentials with your backend
      // const response = await fetch('/api/auth/verify-admin', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // });
      // const data = await response.json();

      // For demo purposes, checking localStorage
      const userRole = localStorage.getItem('Bambeh_user_role');
      const userId = localStorage.getItem('Bambeh_user_id');
      const userName = localStorage.getItem('Bambeh_user_name');

      // Check if user has admin role
      const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator';

      if (!isAdmin) {
        // User doesn't have admin access
        alert('⛔ Access Denied\n\nYou do not have permission to access the admin panel.');
        navigate('/', { replace: true });
        return;
      }

      // Set admin user data
      const admin: AdminUser = {
        id: userId || 'ADMIN_DEFAULT',
        name: userName || 'Admin User',
        email: 'admin@bambeh.cm',
        role: (userRole as AdminUser['role']) || 'admin'
      };

      setAdminUser(admin);
      setHasAdminAccess(true);

      console.log('✅ Admin access verified:', admin);
    } catch (error) {
      console.error('Error checking admin access:', error);
      alert('Error verifying admin access. Please try again.');
      navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout from the admin panel?');
    
    if (confirmLogout) {
      // Clear admin session
      // localStorage.removeItem('auth_token');
      
      // Navigate to login
      navigate('/login', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"/>
          <p className="text-white font-semibold">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess || !adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to access the admin panel.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-semibold transition-all"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h1 className="text-2xl font-bold">Bambé Admin Panel</h1>
                <p className="text-teal-100 text-sm">
                  Welcome back, {adminUser.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-semibold uppercase">
                  {adminUser.role.replace('_', ' ')}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all backdrop-blur-sm"
              >
                Logout
              </button>

              {/* Back to Site */}
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white text-teal-600 hover:bg-gray-100 rounded-lg font-semibold transition-all"
              >
                Back to Site →
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Panel Component */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-teal-50 hover:bg-teal-100 rounded-lg text-center transition-colors">
              <div className="text-3xl mb-2">📦</div>
              <div className="text-sm font-semibold text-gray-900">View Orders</div>
            </button>

            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm font-semibold text-gray-900">Manage Users</div>
            </button>

            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-semibold text-gray-900">View Analytics</div>
            </button>

            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-sm font-semibold text-gray-900">Disputes</div>
            </button>
          </div>
        </div>

        {/* Advanced Admin Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <AdminPanelADVANCED
            adminId={adminUser.id}
            adminName={adminUser.name}
          />
        </div>

        {/* Footer Note */}
        <div className="mt-8 bg-blue-50 rounded-2xl shadow-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Admin Panel Features</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>✅ Real-time dashboard with live statistics</li>
                <li>✅ Order management with status updates</li>
                <li>✅ User management and moderation</li>
                <li>✅ Analytics with interactive charts</li>
                <li>✅ Dispute resolution system</li>
                <li>✅ Export data and generate reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
}


