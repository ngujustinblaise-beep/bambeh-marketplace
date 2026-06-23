/**
 * VendorLayout.tsx — PREMIUM REDESIGN
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Crown,
  Store,
  Home,
  Star,
  Users,
  Search,
  ChevronDown,
  HelpCircle,
  Sparkles,
  ShoppingBag,
  Wallet,
  CheckSquare,
  Boxes,
} from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";

const BambehLogo = ({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const [currentPath, setCurrentPath] = useState(0);
  const logoPaths = [
    "/bambeh-logo.png",
    "/logo.png",
    "/logo192.png",
    "/assets/bambeh-logo.png",
  ];

  const handleError = () => {
    if (currentPath < logoPaths.length - 1) setCurrentPath((p) => p + 1);
    else setImgError(true);
  };

  if (imgError) {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
        <text
          x="50%"
          y="54%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="bold"
          fontFamily="system-ui"
        >
          B
        </text>
      </svg>
    );
  }
  return (
    <img
      src={logoPaths[currentPath]}
      alt="Bambeh"
      width={size}
      height={size}
      className={`rounded-xl object-cover ${className}`}
      onError={handleError}
    />
  );
};

const navTabs = [
  { label: "Dashboard", path: "/vendor/dashboard", icon: LayoutDashboard, group: 1 },
  { label: "Products", path: "/vendor/products", icon: Boxes, group: 2 },
  { label: "Listings", path: "/vendor/listings", icon: Package, group: 2 },
  { label: "Orders", path: "/vendor/orders", icon: ShoppingBag, group: 2 },
  { label: "Payments", path: "/vendor/payments", icon: Wallet, group: 2 },
  { label: "Analytics", path: "/vendor/analytics", icon: BarChart3, group: 3 },
  { label: "Premium Tools", path: "/vendor/premium-tools", icon: Sparkles, group: 3 },
  { label: "Reviews", path: "/vendor/reviews", icon: Star, group: 4 },
  { label: "Messages", path: "/vendor/messages", icon: MessageSquare, group: 4 },
  { label: "Customers", path: "/vendor/customers", icon: Users, group: 4 },
];

const mobileBottomNav = [
  { label: "Dashboard", path: "/vendor/dashboard", icon: LayoutDashboard },
  { label: "Orders", path: "/vendor/orders", icon: ShoppingBag },
  { label: "Messages", path: "/vendor/messages", icon: MessageSquare },
  { label: "Payments", path: "/vendor/payments", icon: Wallet },
  { label: "Profile", path: "/vendor/profile", icon: User },
];

interface VendorLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [vendorName, setVendorName] = useState("Vendor");
  const [vendorInitial, setVendorInitial] = useState("V");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Bambeh Marketplace | Vendor Portal";
  }, []);

  useEffect(() => {
    try {
      const vd = localStorage.getItem("Bambeh_vendor");
      if (vd) {
        const v = JSON.parse(vd);
        const n = v.businessName || v.fullName || v.name || v.username || "Vendor";
        setVendorName(n);
        setVendorInitial(n.charAt(0).toUpperCase());
        return;
      }
      const ud = localStorage.getItem("bambe_current_user");
      if (ud) {
        const u = JSON.parse(ud);
        const n = u.displayName || u.username || "Vendor";
        setVendorName(n);
        setVendorInitial(n.charAt(0).toUpperCase());
      }
    } catch (e) {
      /* skip */
    }
  }, []);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  const isActivePath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    try {
      [
        "Bambeh_vendor",
        "Bambeh_current_vendor",
        "Bambeh_vendor_redirect",
        "Bambeh_vendor_authenticated",
        "Bambeh_vendor_auth_token",
        "Bambeh_is_authenticated",
        "Bambeh_auth_token",
        "Bambeh_user",
        "Bambeh_current_user",
        "authToken",
      ].forEach((k) => localStorage.removeItem(k));
    } finally {
      window.location.href = "/vendor/signin";
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        "/vendor/listings?search=" + encodeURIComponent(searchQuery.trim()),
      );
      setSearchQuery("");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f8f9fc" }}>
      {/* FIXED HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          isScrolled
            ? "bg-white/96 backdrop-blur-xl shadow-lg"
            : "bg-white shadow-sm"
        }`}
      >
        {/* ROW 1 */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/vendor/dashboard"
                  className="flex items-center gap-2.5 group"
                  title="Vendor Dashboard"
                >
                  <BambehLogo
                    size={36}
                    className="transform group-hover:scale-105 transition-transform shadow-sm"
                  />
                  <span
                    className="text-xl font-bold hidden sm:block"
                    style={{
                      background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Bambeh
                  </span>
                </Link>
                <Link
                  to="/vendor/dashboard"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-white text-xs font-bold rounded-full transition-all hover:shadow-lg hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
                >
                  <Store className="w-3 h-3" />
                  <span className="hidden sm:inline">Vendor Portal</span>
                  <span className="sm:hidden">Vendor</span>
                </Link>
              </div>

              <form
                onSubmit={handleSearch}
                className="hidden md:flex flex-1 max-w-xl mx-6"
              >
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search listings, orders, customers..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300 focus:bg-white transition-all"
                  />
                </div>
              </form>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to="/"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Marketplace</span>
                </Link>
                <Link
                  to="/vendor/settings"
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                <Link
                  to="/vendor/notifications"
                  className="relative p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu((p) => !p);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                      {vendorInitial}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${showProfileMenu ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen((p) => !p);
                    setShowProfileMenu(false);
                  }}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all ml-1"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2 — Desktop nav */}
        <div className="hidden lg:block bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center h-10 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab, i) => {
                const Icon = tab.icon;
                const isActive = isActivePath(tab.path);
                const newGroup = i > 0 && navTabs[i - 1].group !== tab.group;
                return (
                  <React.Fragment key={tab.path}>
                    {newGroup && <div className="w-px h-4 bg-gray-200 mx-1"/>}
                    <Link
                      to={tab.path}
                      className={`flex items-center gap-1.5 px-3 h-full text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                        isActive
                          ? "border-amber-500 text-amber-700 bg-amber-50/50"
                          : "border-transparent text-gray-500 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50/30"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-600" : ""}`} />
                      {tab.label}
                    </Link>
                  </React.Fragment>
                );
              })}
              <div className="ml-auto">
                <Link
                  to="/vendor/subscription"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white transition-all hover:shadow-lg hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#db2777)" }}
                >
                  <Sparkles className="w-3 h-3" />
                  Upgrade
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden bg-white border-t border-gray-100 max-h-[70vh] overflow-y-auto"
            style={{ zIndex: 9999, boxShadow: "0 20px 60px rgba(124,58,237,0.15)" }}>
            <div className="px-4 py-3">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>
              </form>
              <div className="space-y-0.5">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = isActivePath(tab.path);
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-amber-600" : "text-gray-400"}`} />
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 space-y-0.5">
                <Link to="/vendor/onboarding" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                  <CheckSquare className="w-5 h-5 text-green-500" />
                  Setup Checklist
                </Link>
                <Link to="/vendor/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                  <User className="w-5 h-5 text-gray-400" />
                  Profile
                </Link>
                <Link
                  to="/vendor/subscription"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#92400e" }}
                >
                  <Crown className="w-5 h-5 text-amber-500" />
                  Upgrade Plan
                </Link>
                <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                  <Home className="w-5 h-5 text-gray-400" />
                  Back to Marketplace
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* GOLD ACCENT LINES */}
      <div
        className="fixed z-[59] left-0 right-0"
        style={{
          top: "59px",
          height: "3px",
          background: "linear-gradient(to right,#d97706,#fbbf24,#f59e0b,#fbbf24,#d97706)",
        }}/>
      <div
        className="hidden lg:block fixed z-[59] left-0 right-0"
        style={{
          top: "99px",
          height: "3px",
          background: "linear-gradient(to right,#d97706,#fbbf24,#f59e0b,#fbbf24,#d97706)",
        }}/>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-[62px] lg:pt-[102px] pb-16 md:pb-8 min-h-screen">
        {children}
      </main>

      {/* FOOTER */}
      <footer
        className="hidden md:block py-6"
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f172a 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BambehLogo size={32} />
              <span
                className="text-lg font-bold"
                style={{
                  background: "linear-gradient(135deg,#34d399,#818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Bambeh Vendor
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/help" className="hover:text-amber-400 transition-colors">Help Center</Link>
              <Link to="/privacy-policy" className="hover:text-amber-400 transition-colors">Privacy</Link>
              <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
              <Link to="/help/contact" className="hover:text-amber-400 transition-colors">Contact</Link>
            </div>
            <p className="text-xs text-gray-500">
              &copy; 2026 Bambeh Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAV */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
        style={{ boxShadow: "0 -4px 20px rgba(124,58,237,0.12)" }}
      >
        <div className="flex items-center justify-around px-1 py-1">
          {mobileBottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 relative"
              >
                {isActive && (
                  <span
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full"
                    style={{ background: "linear-gradient(to right,#f59e0b,#7c3aed)" }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-all ${isActive ? "text-amber-600 scale-110" : "text-gray-400"}`}
                />
                <span className={`text-[10px] font-medium ${isActive ? "text-amber-700" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* PROFILE DROPDOWN */}
      {showProfileMenu && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setShowProfileMenu(false)}
          />
          <div
            className="fixed right-4 w-60 rounded-2xl shadow-2xl overflow-hidden"
            style={{ top: "62px", zIndex: 9999, border: "1px solid rgba(124,58,237,0.15)" }}>
            <div
              className="px-4 py-3"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              <p className="font-bold text-white text-sm truncate">{vendorName}</p>
              <p className="text-xs text-purple-200 mt-0.5">✦ Vendor Account</p>
            </div>
            <div className="bg-white p-1.5 space-y-0.5">
              {[
                { to: "/vendor/profile", icon: User, label: "Profile", style: "hover:bg-purple-50 hover:text-purple-700" },
                { to: "/vendor/settings", icon: Settings, label: "Settings", style: "hover:bg-purple-50 hover:text-purple-700" },
                { to: "/vendor/subscription", icon: Crown, label: "Subscription", style: "hover:bg-amber-50 hover:text-amber-700" },
                { to: "/vendor/onboarding", icon: CheckSquare, label: "Setup Checklist", style: "hover:bg-green-50 hover:text-green-700" },
                { to: "/help", icon: HelpCircle, label: "Help Center", style: "hover:bg-purple-50 hover:text-purple-700" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowProfileMenu(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 rounded-xl transition-all ${item.style}`}
                >
                  <item.icon className="w-4 h-4 text-gray-400" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VendorLayout;






