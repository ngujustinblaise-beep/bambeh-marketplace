/**
 * src/utils/monitoring/ErrorMonitoring.ts
 * Bambeh Marketplace â€” Error Monitoring
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXES: exports both errorMonitor (canonical) and errorMonitoring (alias)
 */

import { logger } from "@/utils/logger";

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface CapturedError {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  handled: boolean;
}

class ErrorMonitor {
  private errors: CapturedError[] = [];
  private listeners: ((error: CapturedError) => void)[] = [];
  private maxErrors = 100;

  capture(
    error: Error | unknown,
    context: ErrorContext = {},
    severity: CapturedError["severity"] = "medium"
  ): string {
    const id = `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    const captured: CapturedError = {
      id,
      message,
      stack,
      context,
      severity,
      timestamp: new Date().toISOString(),
      handled: false,
    };

    this.errors = [captured, ...this.errors].slice(0, this.maxErrors);
    this.listeners.forEach((fn) => { try { fn(captured); } catch { /* ignore */ } });

    if (severity === "critical" || severity === "high") {
      logger.error(`[ErrorMonitor] ${severity.toUpperCase()}: ${message}`, { context });
    } else {
      logger.warn(`[ErrorMonitor] ${severity}: ${message}`);
    }

    return id;
  }

  captureMessage(message: string, context: ErrorContext = {}): string {
    return this.capture(new Error(message), context, "low");
  }

  markHandled(id: string): void {
    const err = this.errors.find((e) => e.id === id);
    if (err) err.handled = true;
  }

  getErrors(): CapturedError[] { return [...this.errors]; }
  getUnhandled(): CapturedError[] { return this.errors.filter((e) => !e.handled); }
  clear(): void { this.errors.length = 0; }

  subscribe(fn: (error: CapturedError) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter((l) => l !== fn); };
  }

  // React error boundary helper
  captureComponentError(error: Error, componentStack: string, componentName?: string): string {
    return this.capture(error, { component: componentName, metadata: { componentStack } }, "high");
  }
}

// â”€â”€â”€ Singleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const errorMonitor = new ErrorMonitor();

/** @alias â€” useAnalytics.ts imports as 'errorMonitoring' */
export const errorMonitoring = errorMonitor;

// Install global error handler
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    errorMonitor.capture(event.reason, { action: "unhandledrejection" }, "high");
  });
  window.addEventListener("error", (event) => {
    errorMonitor.capture(event.error ?? new Error(event.message), { action: "globalerror" }, "high");
  });
}

export default errorMonitor;
