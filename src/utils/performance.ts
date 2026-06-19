// @ts-nocheck
export const measurePageLoad = (): void => {
  if (typeof window === "undefined") return;
  const nav = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  if (!nav.length) return;
  const loadTime = nav[0].loadEventEnd - nav[0].startTime;
  console.debug(`[Perf] Page load: ${loadTime.toFixed(0)}ms`);
};

const sendToAnalytics = (metric: { name: string; value: number }): void => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (!w.gtag) return;
  w.gtag("event", metric.name, {
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    event_category: "Web Vitals",
    non_interaction: true,
  });
};

export const reportWebVitals = (metric: { name: string; value: number }): void => {
  if (import.meta.env.DEV) {
    console.debug(`[WebVital] ${metric.name}: ${metric.value.toFixed(2)}`);
  }
  sendToAnalytics(metric);
};
