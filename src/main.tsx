// BAMBEH_DEPLOY_TOKEN__MAIN_FIX462_CLEAN
import "./lib/tokenGuard";     // FIX462 - MUST stay first: drops a session token too large for Cloudflare, before Supabase reads storage
import "./lib/recovery-hash";  // FIX378 - MUST stay second: runs before Supabase initialises
import React from "react";
import "./i18n"; // initialize react-i18next engine once at startup
import ReactDOM from "react-dom/client";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import "./index.css";
import { startAppUpdates } from "./lib/appUpdate"; // FIX981 - the Android app keeps itself up to date (FIX977)

// FIX981 - first thing, once every file above has loaded: inside the Android app, tell the updater that this version
// opened (a version that never gets this far is thrown away, and the phone goes back to the one that worked), then
// look for a newer one. On the website it does nothing.
startAppUpdates();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
// BAMBEH_END_TOKEN__MAIN_FIX462__COMPLETE
