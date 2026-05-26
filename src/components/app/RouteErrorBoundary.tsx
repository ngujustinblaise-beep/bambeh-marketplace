/**
 * RouteErrorBoundary.tsx — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * Per-route error boundary so a single broken page never takes down the
 * entire app. Wraps each lazy route inside <Routes> so errors are contained.
 *
 * Usage in App.tsx:
 *   <RouteErrorBoundary routeName="Chat">
 *     <Chat />
 *   </RouteErrorBoundary>
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home, ChevronLeft } from "lucide-react";

// ─── ERROR STATE TYPES ────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
  routeName?: string;
  fallback?: React.ReactNode;
}

// ─── ERROR FALLBACK UI ────────────────────────────────────────────────────────

/**
 * Friendly error page that renders when a route throws.
 * Uses a function component so hooks (useNavigate) work.
 */
const ErrorFallback: React.FC<{
  error: Error | null;
  routeName?: string;
  onRetry: () => void;
}> = ({ error, routeName, onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 text-sm mb-1">
          {routeName
            ? `The ${routeName} page encountered an error.`
            : "This page encountered an unexpected error."}
        </p>
        <p className="text-gray-400 text-xs mb-6">
          The rest of the app is working fine.
        </p>

        {/* Error detail (dev only) */}
        {import.meta.env.DEV && error && (
          <details className="text-left mb-5 bg-gray-50 rounded-xl border border-gray-200 p-3">
            <summary className="text-xs font-semibold text-gray-600 cursor-pointer mb-1">
              Error Details (dev only)
            </summary>
            <pre className="text-xs text-red-600 overflow-auto whitespace-pre-wrap break-all">
              {error.message}
            </pre>
          </details>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full text-teal-600 hover:text-teal-700 font-semibold py-2 flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ERROR BOUNDARY CLASS ─────────────────────────────────────────────────────

/**
 * Class-based error boundary (required by React — hooks cannot catch errors).
 * Renders <ErrorFallback> when a child component throws during rendering.
 */
export class RouteErrorBoundary extends React.Component<
  RouteErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(
        `[RouteErrorBoundary:${this.props.routeName ?? "unknown"}]`,
        error,
        errorInfo
      );
    }

    // In production: could send to Sentry / Supabase error log here
    // Example:
    // supabase.from('error_logs').insert({
    //   route: this.props.routeName,
    //   message: error.message,
    //   stack: error.stack,
    //   component_stack: errorInfo.componentStack,
    //   timestamp: new Date().toISOString(),
    // });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <ErrorFallback
          error={this.state.error}
          routeName={this.props.routeName}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

export default RouteErrorBoundary;
