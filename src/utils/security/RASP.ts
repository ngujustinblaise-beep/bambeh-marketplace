/**
 * src/utils/security/RASP.ts
 * Bambeh Marketplace â€” Runtime Application Self-Protection
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import { logger } from "@/utils/logger";

// â”€â”€â”€ Threat Level â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type ThreatLevel = "low" | "medium" | "high" | "critical";

export interface ThreatEvent {
  type: string;
  level: ThreatLevel;
  detail: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

// â”€â”€â”€ Internal state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const threatLog: ThreatEvent[] = [];
let isMonitoring = false;

function recordThreat(type: string, level: ThreatLevel, detail: string): void {
  const event: ThreatEvent = {
    type,
    level,
    detail,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  threatLog.push(event);

  if (threatLog.length > 100) {
    threatLog.splice(0, threatLog.length - 100);
  }

  if (level === "high" || level === "critical") {
    logger.warn(`[RASP] ${level.toUpperCase()} threat detected: ${type} â€” ${detail}`);
  }
}

// â”€â”€â”€ XSS Detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function detectXSSPatterns(input: string): boolean {
  const xssPatterns = [
    /<script[\s\S]*?>/i,
    /javascript\s*:/i,
    /on\w+\s*=\s*["']/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /document\.write/i,
    /window\.location\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

// â”€â”€â”€ SQL Injection Detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /('|")\s*(or|and)\s*('|"|\d)/i,
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /--\s*$/,
    /;\s*(drop|insert|delete|update|select)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

// â”€â”€â”€ Path Traversal Detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function detectPathTraversal(input: string): boolean {
  const traversalPatterns = [/\.\.[/\\]/g, /%2e%2e[/\\]/gi, /\.\.%2f/gi];
  return traversalPatterns.some((pattern) => pattern.test(input));
}

// â”€â”€â”€ Validate User Input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function validateInput(
  input: string,
  context: "search" | "form" | "url" | "general" = "general"
): { isSafe: boolean; reason?: string } {
  if (detectXSSPatterns(input)) {
    recordThreat("XSS_ATTEMPT", "high", `Context: ${context}, Input: ${input.slice(0, 50)}`);
    return { isSafe: false, reason: "Input contains potentially unsafe content" };
  }

  if (detectSQLInjection(input)) {
    recordThreat("SQL_INJECTION", "high", `Context: ${context}, Input: ${input.slice(0, 50)}`);
    return { isSafe: false, reason: "Input contains potentially unsafe content" };
  }

  if (context === "url" && detectPathTraversal(input)) {
    recordThreat("PATH_TRAVERSAL", "medium", `Input: ${input.slice(0, 50)}`);
    return { isSafe: false, reason: "URL contains unsafe path sequences" };
  }

  return { isSafe: true };
}

// â”€â”€â”€ Sanitize String â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// â”€â”€â”€ Detect DevTools â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function setupDevToolsDetection(): void {
  if (import.meta.env.DEV) return;

  const threshold = 160;
  let devtoolsOpen = false;

  const check = () => {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        recordThreat("DEVTOOLS_OPENED", "low", "Browser developer tools detected");
      }
    } else {
      devtoolsOpen = false;
    }
  };

  window.addEventListener("resize", check, { passive: true });
}

// â”€â”€â”€ Monitor Console Tampering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function setupConsoleTamperDetection(): void {
  if (import.meta.env.DEV) return;

  const originalConsoleLog = console.log;

  try {
    Object.defineProperty(console, "_bambehCheck", {
      get() {
        recordThreat("CONSOLE_PROBE", "low", "Console probed via property access");
        return undefined;
      },
      configurable: true,
    });
  } catch {
    // Property definition may fail in some environments â€” ignore
  }

  // Restore original in case it was tampered with
  if (typeof console.log !== "function") {
    console.log = originalConsoleLog;
    recordThreat("CONSOLE_TAMPERED", "medium", "console.log was replaced");
  }
}

// â”€â”€â”€ Monitor Prototype Pollution â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function setupPrototypePollutionDetection(): void {
  const dangerousKeys = ["__proto__", "constructor", "prototype"];

  const originalAssign = Object.assign;

  Object.assign = function (target: object, ...sources: object[]): object {
    for (const source of sources) {
      if (source && typeof source === "object") {
        for (const key of Object.keys(source)) {
          if (dangerousKeys.includes(key)) {
            recordThreat(
              "PROTOTYPE_POLLUTION",
              "critical",
              `Attempted to set key: ${key}`
            );
            throw new Error("Prototype pollution attempt blocked");
          }
        }
      }
    }
    return originalAssign.call(Object, target, ...sources);
  };
}

// â”€â”€â”€ Monitor Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function setupNavigationMonitoring(): void {
  window.addEventListener(
    "click",
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor) {
        const href = anchor.getAttribute("href") ?? "";
        if (href.toLowerCase().startsWith("javascript:")) {
          event.preventDefault();
          event.stopPropagation();
          recordThreat("JAVASCRIPT_HREF", "high", `Blocked javascript: href: ${href.slice(0, 100)}`);
        }
      }
    },
    true
  );
}

// â”€â”€â”€ Initialize RASP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function initializeRASP(): void {
  if (isMonitoring) return;
  isMonitoring = true;

  try {
    setupDevToolsDetection();
  } catch {
    // Non-fatal
  }

  try {
    setupConsoleTamperDetection();
  } catch {
    // Non-fatal
  }

  try {
    setupPrototypePollutionDetection();
  } catch {
    // Non-fatal
  }

  try {
    setupNavigationMonitoring();
  } catch {
    // Non-fatal
  }

  logger.log("[RASP] Runtime protection initialized");
}

// â”€â”€â”€ Get Threat Log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getThreatLog(): readonly ThreatEvent[] {
  return Object.freeze([...threatLog]);
}

// â”€â”€â”€ Clear Threat Log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function clearThreatLog(): void {
  threatLog.length = 0;
}

// â”€â”€â”€ Get Threat Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getThreatSummary(): Record<ThreatLevel, number> {
  return threatLog.reduce(
    (acc, event) => {
      acc[event.level] = (acc[event.level] ?? 0) + 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0, critical: 0 }
  );
}
