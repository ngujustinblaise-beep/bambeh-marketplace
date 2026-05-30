/**
 * APP ENHANCERS - Performance & Security Wrappers
 */

import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/analytics/AnalyticsInit';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 App Error:', error, errorInfo);
    try {
      import('@sentry/react').then(({ captureException }) => { captureException(error, { extra: { errorInfo } }); }).catch(() => {});
    } catch {}
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-center mb-6"><div className="bg-red-100 rounded-full p-6"><AlertTriangle className="w-16 h-16 text-red-600" /></div></div>
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 text-center mb-8">We're sorry for the inconvenience. Please try refreshing the page.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold"><RefreshCw className="w-5 h-5" />Reload</button>
              <button onClick={this.handleReset} className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"><Home className="w-5 h-5" />Go Home</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const RouteTracker: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
    const routeTitles: Record<string, string> = {
      '/': "Bambeh - Online Marketplace",
      '/marketplace': 'Shop Products - Bambeh',
      '/jobs': 'Find Jobs - Bambeh',
      '/services': 'Professional Services - Bambeh',
      '/rentals': 'Property Rentals - Bambeh',
      '/vehicles': 'Vehicles for Sale - Bambeh',
    };
    document.title = routeTitles[location.pathname] || 'Bambeh Marketplace';
  }, [location]);
  return <>{children}</>;
};

export const PerformanceMonitor: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') console.log('📊 LCP:', Math.round(entry.startTime), 'ms');
            if (entry.entryType === 'first-input') console.log('📊 FID:', Math.round((entry as any).processingStart - entry.startTime), 'ms');
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch {}
    }
    const logPageLoadTime = () => {
      try {
        const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntry) {
          if (navEntry.loadEventEnd > 0) console.log('📊 Page Load Time:', Math.round(navEntry.loadEventEnd - navEntry.startTime), 'ms');
          else console.log('📊 Page Load Time (approx):', Math.round(performance.now()), 'ms');
        }
      } catch {}
    };
    if (document.readyState === 'complete') setTimeout(logPageLoadTime, 0);
    else window.addEventListener('load', () => setTimeout(logPageLoadTime, 0), { once: true });
  }, []);
  return <>{children}</>;
};

export default { AppErrorBoundary, RouteTracker, PerformanceMonitor };

