import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, ShoppingBag, Wrench, User, Coins, Building2 } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/",           icon: Home,        label: "Home"     },
    { path: "/jobs",       icon: Briefcase,   label: "Jobs"     },
    { path: "/marketplace",icon: ShoppingBag, label: "Shop"     },
    { path: "/rentals",    icon: Building2,   label: "Rentals"  },
    { path: "/services",   icon: Wrench,      label: "Services" },
    { path: "/coins",      icon: Coins,       label: "Coins"    },
    { path: "/profile",    icon: User,        label: "Profile"  },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="grid grid-cols-7 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-indigo-600" : "text-gray-600 hover:text-indigo-500"
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ); // FIX: was `);)}` — moved the stray ) out, closing is now correct
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
