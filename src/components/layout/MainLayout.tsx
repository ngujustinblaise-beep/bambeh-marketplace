/**
 * MainLayout.tsx
 * Main Layout Component for Bambeh Marketplace
 * Copyright © 2026 ETS BUSHENERGY. All rights reserved.
 */

import React from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, ShoppingBag, MessageCircle, Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";

interface MainLayoutProps {
  children?: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
}

const mobileNavItems: NavItem[] = [
  { label: "home", path: "/", icon: Home },
  { label: "marketplace", path: "/marketplace", icon: ShoppingBag },
  { label: "messages", path: "/chat", icon: MessageCircle, requiresAuth: true },
  {
    label: "notifications",
    path: "/notifications",
    icon: Bell,
    requiresAuth: true,
  },
  { label: "profile", path: "/profile", icon: User, requiresAuth: true },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { unreadCount } = useNotification();

  const isActivePath = (path: string): boolean => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !currentUser) {
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const renderMobileBottomNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-2xl">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          if (item.requiresAuth && !currentUser) return null;

          const Icon = item.icon;
          const isActive = isActivePath(item.path);

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path, item.requiresAuth)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform`}
                />
                {item.path === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-medium ${isActive ? "text-blue-600" : "text-gray-600"}`}
              >
                {t(item.label)}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-0 pb-20 md:pb-8">
        {children || <Outlet />}
      </main>

      <Footer />

      {renderMobileBottomNav()}
    </div>
  );
};

export default MainLayout;
