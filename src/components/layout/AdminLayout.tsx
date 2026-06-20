import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Settings,
  BarChart2,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    path: '/admin',           icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Users',        path: '/admin/users',      icon: <Users className="w-5 h-5" /> },
  { label: 'Vendors',      path: '/admin/vendors',    icon: <Store className="w-5 h-5" /> },
  { label: 'Orders',       path: '/admin/orders',     icon: <ShoppingBag className="w-5 h-5" /> },
  { label: 'Analytics',    path: '/admin/analytics',  icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Moderation',   path: '/admin/moderation', icon: <Shield className="w-5 h-5" /> },
  { label: 'Notifications',path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
  { label: 'Settings',     path: '/admin/settings',   icon: <Settings className="w-5 h-5" /> },
];

export default function AdminLayout() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-gray-900 text-white w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
          B
        </div>
        <div>
          <p className="font-bold text-white text-sm">Bambeh Admin</p>
          <p className="text-xs text-gray-400">Management Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-sm font-medium ${
              isActive(item.path)
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {isActive(item.path) && (
              <ChevronRight className="w-4 h-4 opacity-60" />
            )}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
              B
            </div>
            <span className="font-semibold text-gray-900 text-sm">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


