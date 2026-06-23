/**
 * ═══════════════════════════════════════════════════════════════════════════
 * APP ERROR BOUNDARY - MILITARY-GRADE ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════
 * Features:
 * ✅ Catches React errors
 * ✅ Logs to monitoring service
 * ✅ Beautiful fallback UI
 * ✅ Auto-recovery attempts
 * ✅ Error reporting
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, AlertTriangle, Home, Mail } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class AppErrorBoundary extends Component<Props, State> {
  private resetTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }


  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service (Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Auto-recovery after 5 seconds (if not too many errors)
    if (this.state.errorCount < 3) {
      this.resetTimeout = setTimeout(() => {
        this.handleReset();
      }, 5000);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // TODO: Replace with your error tracking service
    console.error("🚨 Error caught by boundary:", {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Send to backend
    try {
      fetch("/api/log-error", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("Failed to log error:", e);
    }
  }

  handleReset = () => {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorReport = `
Error: ${error?.toString()}
Stack: ${error?.stack},
Component: ${errorInfo?.componentStack},
URL: ${window.location.href},
Time: ${new Date().toISOString()}
    `.trim();

    const mailtoLink = `mailto:support@bambeh.com?subject=Error%20Report&body=${encodeURIComponent(errorReport)}`;
    window.location.href = mailtoLink;
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-6">
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            {/* Error Message */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Please refresh or contact support.
            </h1>
            <p className="text-gray-600 text-center mb-8">
              We're sorry for the inconvenience. Our team has been notified and
              is working on a fix.
            </p>
            {/* Error Details (Development) */}
            {import.meta.env.MODE === "development" && this.state.error && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6 overflow-auto max-h-64">
                <p className="text-sm font-mono text-red-600 mb-2">
                  {this.state.error.toString()}
                </p>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </div>
            )}
            {/* Error Count Warning */}
            {this.state.errorCount >= 3 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  ⚠ï¸ Multiple errors detected. Please try clearing your cache or
                  contact support.
                </p>
              </div>
            )}
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-semibold transition-all shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Reload App
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-all"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>

              <button
                onClick={this.handleReportError}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all"
              >
                <Mail className="w-5 h-5" />
                Report Error
              </button>
            </div>
            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Need help? Contact us at{" "}
                <a
                  href="mailto:support@bambeh.com"
      className="text-teal-600 hover:underline"
                >
                  support@bambeh.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;


