/**
 * RouteErrorBoundary.tsx
 * Path: src/components/app/RouteErrorBoundary.tsx
 * ---------------------------------------------------------------------------
 * Per-route error boundary — catches JS crashes in a single page/route
 * and shows a friendly "Something went wrong" UI instead of a blank screen.
 *
 * Already referenced in App.tsx:
 *   import { RouteErrorBoundary } from "@/components/app/RouteErrorBoundary";
 *
 * Usage (already in App.tsx for /chat, add to other routes as needed):
 *   <RouteErrorBoundary routeName="Marketplace">
 *     <Marketplace />
 *   </RouteErrorBoundary>
 * ---------------------------------------------------------------------------
 */

import React from "react";
import { Link } from "react-router-dom";

// --- Types -------------------------------------------------------------------
interface Props {
  /** Human-readable name for this route — shown in the error UI */
  routeName?: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// --- Component ----------------------------------------------------------------
export class RouteErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`[RouteErrorBoundary] Error in "${this.props.routeName ?? "unknown"}"`);
      console.error(error);
      console.error("Component stack:", errorInfo.componentStack);
      console.groupEnd();
    }

    // TODO: In production, send to your error-tracking service here
    // e.g. Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { routeName = "this page" } = this.props;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-5 bg-orange-50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Please refresh or contact support.
          </h2>
          <p className="text-sm text-gray-500 mb-1">
            We had trouble loading <strong>{routeName}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This is usually a temporary issue. Please try again.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors text-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Go Home
            </Link>
          </div>

          {/* Dev-only error detail */}
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 text-left">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                Developer details
              </summary>
              <pre className="mt-2 text-xs bg-gray-50 rounded-lg p-3 overflow-auto text-red-600 border border-red-100 max-h-48">
                {this.state.error.message}
                {"\n\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default RouteErrorBoundary;




