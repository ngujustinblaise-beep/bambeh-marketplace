/**
 * src/components/Header.tsx
 * Bambeh Marketplace — Main App Header
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useBambehStore } from "@/utils/BambehStore";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const unread = useBambehStore((s) => s.unreadNotificationCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-teal-700 text-lg hidden sm:block">Bambeh</span>
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
              title="Panier"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Notifications */}
            {user && (
              <button
                onClick={() => navigate("/notifications")}
                className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20 py-1">
                      <button onClick={() => { navigate("/profile"); setMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Mon profil</button>
                      <button onClick={() => { navigate("/orders"); setMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Mes commandes</button>
                      <button onClick={() => { navigate("/favorites"); setMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Favoris</button>
                      <button onClick={() => { navigate("/vendor/dashboard"); setMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Espace vendeur</button>
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={async () => { await logout(); setMenuOpen(false); navigate("/"); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Déconnexion</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors font-medium"
              >
                Connexion
              </button>
            )}
          </div>
        </div>

        {/* Bottom nav tabs */}
        <nav className="flex gap-0 -mb-px overflow-x-auto scrollbar-hide">
          {[
            { path: "/marketplace", label: "Boutique" },
            { path: "/jobs", label: "Emplois" },
            { path: "/services", label: "Services" },
            { path: "/rentals", label: "Location" },
            { path: "/exchange", label: "Troc" },
            { path: "/tontine", label: "Tontine" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive(item.path)
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
