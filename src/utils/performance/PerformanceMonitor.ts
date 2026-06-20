/**
 * src/utils/performance/PerformanceMonitor.ts
 * Bambeh Marketplace — Performance Monitor + singleton + formatBytes
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { logger } from "@/utils/logger";

export interface PerformanceMark {
  name: string;
  startTime: number;
  duration?: number;
}

export interface PerformanceReport {
  marks: PerformanceMark[];
  lcp?: number;
  fcp?: number;
  ttfb?: number;
  cls?: number;
  fid?: number;
  generatedAt: string;
}

// ─── formatBytes — exported for PerformanceTest.tsx ──────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ─── Manager Class ────────────────────────────────────────────────────────────
class PerformanceMonitorClass {
  private marks = new Map<string, number>();
  private completedMarks: PerformanceMark[] = [];

  markStart(name: string): void {
    this.marks.set(name, performance.now());
    try { performance.mark(`bambeh_start_${name}`); } catch { /* ignore */ }
  }

  markEnd(name: string): number | null {
    const start = this.marks.get(name);
    if (start === undefined) return null;
    const duration = performance.now() - start;
    this.marks.delete(name);
    this.completedMarks.push({ name, startTime: start, duration });
    try { performance.measure(`bambeh_${name}`, `bambeh_start_${name}`); } catch { /* ignore */ }
    if (import.meta.env.DEV) logger.log(`[Perf] ${name}: ${duration.toFixed(1)}ms`);
    return duration;
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.markStart(name);
    try { const result = await fn(); this.markEnd(name); return result; }
    catch (err) { this.markEnd(name); throw err; }
  }

  measureSync<T>(name: string, fn: () => T): T {
    this.markStart(name);
    try { const result = fn(); this.markEnd(name); return result; }
    catch (err) { this.markEnd(name); throw err; }
  }

  generateReport(): PerformanceReport {
    let ttfb: number | undefined;
    try {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (nav) ttfb = nav.responseStart - nav.requestStart;
    } catch { /* ignore */ }
    return { marks: [...this.completedMarks], ttfb, generatedAt: new Date().toISOString() };
  }

  clearMarks(): void {
    this.marks.clear();
    this.completedMarks.length = 0;
    try { performance.clearMarks(); performance.clearMeasures(); } catch { /* ignore */ }
  }

  // Expose formatBytes on instance too
  formatBytes(bytes: number): string { return formatBytes(bytes); }
}

// ─── Singleton instance expected by PerformanceProvider.tsx ──────────────────
export const performanceMonitor = new PerformanceMonitorClass();

// ─── Standalone function aliases ─────────────────────────────────────────────
export function markStart(name: string): void { performanceMonitor.markStart(name); }
export function markEnd(name: string): number | null { return performanceMonitor.markEnd(name); }

export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return performanceMonitor.measureAsync(name, fn);
}

export function measureSync<T>(name: string, fn: () => T): T {
  return performanceMonitor.measureSync(name, fn);
}

export function generatePerformanceReport(): PerformanceReport {
  return performanceMonitor.generateReport();
}

export function clearMarks(): void { performanceMonitor.clearMarks(); }

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T, limitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limitMs) { lastCall = now; fn(...args); }
  };
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T, delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

export function requestIdleOrTimeout(callback: () => void, timeoutMs = 2000): void {
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => void })
      .requestIdleCallback(callback, { timeout: timeoutMs });
  } else {
    setTimeout(callback, 0);
  }
}
