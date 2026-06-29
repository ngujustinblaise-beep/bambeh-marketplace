/**
 * src/components/ErrorBoundary.tsx — Bambeh Marketplace
 *
 * Wraps the entire app. When anything crashes at startup you get a
 * readable error screen instead of a blank white page.
 *
 * Place this at the TOP of main.tsx wrapping <App /> like:
 *
 *   import { ErrorBoundary } from "@/components/ErrorBoundary";
 *
 *   ReactDOM.createRoot(document.getElementById("root")!).render(
 *     <ErrorBoundary>
 *       <App />
 *     </ErrorBoundary>
 *   );
 */

import React from "react";

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: "" };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ componentStack: info.componentStack || "" });

    // Also log to console for ADB logcat
    console.error("═══ BAMBEH CRASH ═══");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("Component:", info.componentStack);
  }

  handleReload = () => {
    window.location.href = "/";
  };

  handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, componentStack } = this.state;
    const msg = error?.message || "Unknown error";
    const stack = error?.stack || "";

    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "#f1f5f9",
          fontFamily: "monospace",
          padding: "24px 16px",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#dc2626",
            borderRadius: 12,
            padding: "16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>💥</span>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 18 }}>Bambeh Crashed</div>
            <div style={{ fontSize: 12, color: "#fecaca", marginTop: 2 }}>
              An unexpected error stopped the app from loading
            </div>
          </div>
        </div>

        {/* Error message */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
            border: "1px solid #334155",
          }}
        >
          <div style={{ color: "#f87171", fontWeight: "bold", marginBottom: 6, fontSize: 13 }}>
            ERROR MESSAGE:
          </div>
          <div style={{ color: "#fde68a", fontSize: 14, wordBreak: "break-word" }}>
            {msg}
          </div>
        </div>

        {/* Stack trace */}
        {stack && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: 8,
              padding: 14,
              marginBottom: 16,
              border: "1px solid #334155",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <div style={{ color: "#94a3b8", fontWeight: "bold", marginBottom: 6, fontSize: 12 }}>
              STACK TRACE:
            </div>
            <pre style={{ fontSize: 11, color: "#cbd5e1", margin: 0, whiteSpace: "pre-wrap" }}>
              {stack}
            </pre>
          </div>
        )}

        {/* Component stack */}
        {componentStack && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: 8,
              padding: 14,
              marginBottom: 24,
              border: "1px solid #334155",
              maxHeight: 160,
              overflowY: "auto",
            }}
          >
            <div style={{ color: "#94a3b8", fontWeight: "bold", marginBottom: 6, fontSize: 12 }}>
              COMPONENT THAT CRASHED:
            </div>
            <pre style={{ fontSize: 11, color: "#cbd5e1", margin: 0, whiteSpace: "pre-wrap" }}>
              {componentStack}
            </pre>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={this.handleReload}
            style={{
              background: "#0d9488",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "14px 24px",
              fontSize: 15,
              fontWeight: "bold",
              cursor: "pointer",
              flex: 1,
              minWidth: 140,
            }}
          >
            🔄 Reload App
          </button>
          <button
            onClick={this.handleClearStorage}
            style={{
              background: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "14px 24px",
              fontSize: 15,
              fontWeight: "bold",
              cursor: "pointer",
              flex: 1,
              minWidth: 140,
            }}
          >
            🗑ï¸ Clear Data & Reload
          </button>
        </div>

        <div
          style={{
            marginTop: 20,
            color: "#64748b",
            fontSize: 11,
            textAlign: "center",
          }}
        >
          Copy the error message above and send to your developer.
          {"\n"}© 2025–2026 BAMBEH SARL
        </div>
      </div>
    );
  }
}



