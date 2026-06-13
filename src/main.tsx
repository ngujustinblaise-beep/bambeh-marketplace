/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAIN.TSX - APPLICATION ENTRY POINT — Bambeh Marketplace
 * ═══════════════════════════════════════════════════════════════════════════
 * FIXES APPLIED:
 *  ✅ i18n initialized FIRST, then registerRentalsNamespace (was reversed)
 *  ✅ LanguageProvider added — fixes blank screen from useLanguage() crash
 *  ✅ ErrorBoundary added — shows readable error instead of blank page
 *  ✅ i18n awaited before auth init so hasResourceBundle exists in time
 *  ✅ Capacitor compatible
 * © 2025–2026 BAMBEH SARL. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from "react";
import ReactDOM from "react-dom/client";

// ─── i18n MUST be the very first import — before everything else ──────────────
// This ensures the i18next instance exists before any namespace registration
import "./i18n";

// ─── Register extra namespaces AFTER i18n is imported ────────────────────────
import "@/i18n/registerRentalsNamespace";

// ─── App and providers ────────────────────────────────────────────────────────
import App from "./App";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAuthStore } from "@/store/authStore";
import "./index.css";

import { Capacitor } from "@capacitor/core";

/**
 * Initialize the application
 */
const initializeApp = async () => {
  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🚀 BAMBEH MARKETPLACE - INITIALIZING");
    console.log("═══════════════════════════════════════════════════════");
    console.log("Platform:", Capacitor.getPlatform());
    console.log("Native:", Capacitor.isNativePlatform());
    console.log("═══════════════════════════════════════════════════════");

    // Initialize Supabase auth session before rendering
    await useAuthStore.getState().initialize();

    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found. Check your index.html.");
    }

    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        {/* ErrorBoundary: outermost — catches any crash, shows readable screen */}
        <ErrorBoundary>
          {/* LanguageProvider: makes useLanguage() work everywhere in the app */}
          <LanguageProvider>
            <SubscriptionProvider>
              <App />
            </SubscriptionProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </React.StrictMode>,
    );

    console.log("✅ Bambeh Marketplace initialized successfully!");

  } catch (error) {
    console.error("❌ Fatal error during app initialization:", error);

    // Fallback UI when React itself fails to mount
    const rootElement = document.getElementById("root");
    if (rootElement) {
      const msg = error instanceof Error ? error.message : String(error);
      rootElement.innerHTML = `
        <div style="
          display:flex;flex-direction:column;justify-content:center;
          align-items:center;min-height:100vh;background:#0f172a;
          color:white;padding:2rem;text-align:center;font-family:monospace;
        ">
          <div style="font-size:3rem;margin-bottom:1rem;">💥</div>
          <h1 style="font-size:1.5rem;margin-bottom:1rem;color:#f87171;">
            Bambeh Failed to Start
          </h1>
          <div style="
            background:#1e293b;border:1px solid #334155;border-radius:8px;
            padding:1rem;max-width:500px;word-break:break-word;
            margin-bottom:2rem;font-size:0.85rem;color:#fde68a;
          ">${msg}</div>
          <button
            onclick="window.location.reload()"
            style="padding:1rem 2rem;font-size:1rem;background:#0d9488;
              color:white;border:none;border-radius:8px;cursor:pointer;
              font-weight:600;margin-bottom:0.75rem;width:200px;"
          >🔄 Reload App</button>
          <button
            onclick="localStorage.clear();sessionStorage.clear();window.location.reload()"
            style="padding:0.75rem 1.5rem;font-size:0.875rem;background:#7c3aed;
              color:white;border:none;border-radius:8px;cursor:pointer;
              font-weight:600;width:200px;"
          >🗑️ Clear Data &amp; Reload</button>
          <p style="margin-top:2rem;font-size:0.7rem;color:#475569;">
            © 2025–2026 BAMBEH SARL — copy the error above and send to your developer
          </p>
        </div>
      `;
    }
  }
};

// Start the application
initializeApp();
