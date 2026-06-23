/**
 * BottomNav.tsx â€” Bambeh Marketplace
 * FILE LOCATION: src/components/layout/BottomNav.tsx
 *
 * CHANGES FROM ORIGINAL:
 * - Now uses useLanguage() so bottom nav labels translate when language changes
 */

import React from "react";
import { useLanguage } from '@/App';
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, ShoppingBag, Wrench, User, Building2 } from "lucide-react";

const BottomNav = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: "/",            icon: Home,        labelKey: "nav.home"        },
    { path: "/jobs",        icon: Briefcase,   labelKey: "nav.jobs"        },
    { path: "/marketplace", icon: ShoppingBag, labelKey: "nav.marketplace" },
    { path: "/rentals",     icon: Building2,   labelKey: "nav.rentals"     },
    { path: "/services",    icon: Wrench,      labelKey: "nav.services"    },
    { path: "/profile",     icon: User,        labelKey: "common.profile"  },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const Icon   = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-teal-600" : "text-gray-500 hover:text-teal-500"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;






