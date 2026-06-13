/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAIN.TSX - APPLICATION ENTRY POINT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ✅ Vite + React + TypeScript
 * ✅ i18n initialization
 * ✅ Subscription context
 * ✅ Auth store initialization
 * ✅ Capacitor compatible
 * ✅ LanguageProvider — fixes blank screen caused by useLanguage() crash
 * ✅ ErrorBoundary — shows readable crash screen instead of blank page
 *
 * © 2025–2026 BAMBEH SARL. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import "@/i18n/registerRentalsNamespace";
import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n"; // Initialize i18n FIRST
import App from "./App";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { LanguageProvider } from "./context/LanguageContext";  // ✅ ADDED
import { ErrorBoundary } from "./components/ErrorBoundary";    // ✅ ADDED
import { useAuthStore } from "@/store/authStore";
import "./index.css";

import { Capacitor } from "@capacitor/core";

/**
 * Initialize the application
 */
const initializeApp = async () => {
  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🚀 BAMBÉ MARKETPLACE - INITIALIZING");
    console.log("═══════════════════════════════════════════════════════");
    console.log("Platform:", Capacitor.getPlatform());
    console.log("Native Platform:", Capacitor.isNativePlatform());
    console.log("App URL:", Capacitor.convertFileSrc(""));
    console.log("═══════════════════════════════════════════════════════");

    // Initialize Supabase auth session before rendering
    await useAuthStore.getState().initialize();

    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error(
        "Root element not found. Please check your index.html file.",
      );
    }

    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        {/* ✅ ErrorBoundary: outermost — catches any crash and shows readable error */}
        <ErrorBoundary>
          {/* ✅ LanguageProvider: must wrap App so useLanguage() works everywhere */}
          <LanguageProvider>
            <SubscriptionProvider>
              <App />
            </SubscriptionProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </React.StrictMode>,
    );

    console.log("✅ Bambé Marketplace initialized successfully!");

  } catch (error) {
    console.error("❌ Fatal error during app initialization:", error);

    // Show a readable error screen if React itself fails to mount
    const rootElement = document.getElementById("root");
    if (rootElement) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #0f172a;
          color: white;
          padding: 2rem;
          text-align: center;
          font-family: monospace;
        ">
          <div style="font-size:3rem;margin-bottom:1rem;">💥</div>
          <h1 style="font-size: 1.5rem; margin-bottom: 1rem; color:#f87171;">
            Bambeh Failed to Start
          </h1>
          <div style="
            background:#1e293b;
            border:1px solid #334155;
            border-radius:8px;
            padding:1rem;
            max-width:500px;
            word-break:break-word;
            margin-bottom:2rem;
            font-size:0.85rem;
            color:#fde68a;
          ">
            ${msg}
          </div>
          <button
            onclick="window.location.reload()"
            style="
              padding: 1rem 2rem;
              font-size: 1rem;
              background: #0d9488;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              margin-bottom:1rem;
            "
          >
            🔄 Reload App
          </button>
          <button
            onclick="localStorage.clear();sessionStorage.clear();window.location.reload()"
            style="
              padding: 0.75rem 1.5rem;
              font-size: 0.875rem;
              background: #7c3aed;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            "
          >
            🗑️ Clear Data &amp; Reload
          </button>
          <p style="margin-top:2rem;font-size:0.75rem;color:#475569;">
            © 2025–2026 BAMBEH SARL — send the error above to your developer
          </p>
        </div>
      `;
    }
  }
};

// Start the application
initializeApp();
