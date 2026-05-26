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
 *
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n"; // Initialize i18n FIRST
import App from "./App";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
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
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </React.StrictMode>,
    );

    console.log("✅ Bambé Marketplace initialized successfully!");

  } catch (error) {
    console.error("❌ Fatal error during app initialization:", error);

    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
          color: white;
          padding: 2rem;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        ">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Initialization Error</h1>
          <p style="font-size: 1rem; margin-bottom: 2rem; max-width: 600px;">
            We're sorry, but there was an error loading the application.
            Please try refreshing the page.
          </p>
          <button
            onclick="window.location.reload()"
            style="
              padding: 1rem 2rem;
              font-size: 1rem;
              background: white;
              color: #14b8a6;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            "
          >
            Refresh Page
          </button>
          <p style="margin-top: 2rem; font-size: 0.875rem; opacity: 0.8;">
            Error: ${error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      `;
    }
  }
};

// Start the application
initializeApp();
