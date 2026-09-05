// BAMBEH_DEPLOY_TOKEN__MAIN_FIX462_CLEAN
import "./lib/tokenGuard";     // FIX462 - MUST stay first: drops a session token too large for Cloudflare, before Supabase reads storage
import "./lib/recovery-hash";  // FIX378 - MUST stay second: runs before Supabase initialises
import React from "react";
import "./i18n"; // initialize react-i18next engine once at startup
import ReactDOM from "react-dom/client";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
// BAMBEH_END_TOKEN__MAIN_FIX462__COMPLETE
