// BAMBEH_DEPLOY_TOKEN__BOTTOMNAV_FIX103_CLEAN
/**
 * BottomNav.tsx — Bambeh Marketplace (FIX103)
 * FILE LOCATION: src/components/layout/BottomNav.tsx
 *
 * CHANGES:
 * - Collapsible: a small chevron handle folds the bar down so it never blocks
 *   buttons or content at the bottom of a page; tap again to bring it back.
 * - Keeps useLanguage() so labels translate when language changes.
 */

import React, { useState } from "react";
import { useLanguage } from '@/App';
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, ShoppingBag, Wrench, User, Building2, ChevronDown, ChevronUp } from "lucide-react";

const BottomNav = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

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
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-200 ${
        collapsed ? "translate-y-16" : "translate-y-0"
      }`}
    >
      {/* Fold handle — always visible, sits just above the bar */}
      <div className="flex justify-center pointer-events-none">
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Show navigation" : "Hide navigation"}
          className="pointer-events-auto -mb-px bg-white border border-gray-200 border-b-0 rounded-t-xl px-4 py-0.5 shadow-sm text-gray-400"
        >
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="bg-white border-t border-gray-200 safe-area-bottom">
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
      </div>
    </nav>
  );
};

export default BottomNav;
// BAMBEH_END_TOKEN__BOTTOMNAV__COMPLETE
