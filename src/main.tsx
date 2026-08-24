import "./lib/recovery-hash"; // FIX378 - MUST stay first: runs before Supabase initialises
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
