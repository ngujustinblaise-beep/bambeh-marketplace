import { onCLS, onFCP, onLCP, onTTFB } from "web-vitals";

function sendToAnalytics(metric: any) {
  console.log(metric);

}
export function initPerformanceMonitoring() {
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);

}
export function getOptimizedImageUrl(url: string, width: number): string {
  return url;
}

