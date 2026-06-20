/**
 * src/test/PerformanceTest.tsx
 * Bambeh Marketplace — Performance Test Component (Dev Only)
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import { markStart, markEnd, generatePerformanceReport, formatBytes } from "@/utils/performance/PerformanceMonitor";
import { Zap, Play, RefreshCw, CheckCircle } from "lucide-react";

interface TestResult {
  name: string;
  durationMs: number;
  passed: boolean;
}

const PerformanceTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const runTests = useCallback(async () => {
    if (!import.meta.env.DEV) return;

    setRunning(true);
    setResults([]);
    const newResults: TestResult[] = [];

    // Test 1: Supabase ping
    markStart("supabase_ping");
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("profiles").select("id").limit(1);
      const duration = markEnd("supabase_ping") ?? 0;
      newResults.push({ name: "Supabase ping", durationMs: duration, passed: duration < 2000 });
    } catch {
      markEnd("supabase_ping");
      newResults.push({ name: "Supabase ping", durationMs: 0, passed: false });
    }

    // Test 2: localStorage read/write
    markStart("localstorage_rw");
    try {
      const key = "__bambeh_test__";
      localStorage.setItem(key, "ok");
      const val = localStorage.getItem(key);
      localStorage.removeItem(key);
      const duration = markEnd("localstorage_rw") ?? 0;
      newResults.push({ name: "localStorage R/W", durationMs: duration, passed: val === "ok" });
    } catch {
      markEnd("localstorage_rw");
      newResults.push({ name: "localStorage R/W", durationMs: 0, passed: false });
    }

    // Test 3: Performance API
    markStart("perf_report");
    const report = generatePerformanceReport();
    const duration = markEnd("perf_report") ?? 0;
    newResults.push({
      name: "Performance report generation",
      durationMs: duration,
      passed: Boolean(report.generatedAt),
    });

    // Test 4: Image optimizer import
    markStart("image_optimizer_import");
    try {
      await import("@/utils/performance/ImageOptimizer");
      const imgDuration = markEnd("image_optimizer_import") ?? 0;
      newResults.push({ name: "ImageOptimizer import", durationMs: imgDuration, passed: imgDuration < 500 });
    } catch {
      markEnd("image_optimizer_import");
      newResults.push({ name: "ImageOptimizer import", durationMs: 0, passed: false });
    }

    setResults(newResults);
    setRunning(false);
  }, []);

  if (!import.meta.env.DEV) {
    return null;
  }

  const allPassed = results.length > 0 && results.every((r) => r.passed);

  return (
    <div className="bg-gray-900 text-green-400 font-mono p-4 rounded-xl text-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-bold">Bambeh Performance Tests</span>
          <span className="text-gray-500">(DEV only)</span>
        </div>
        <button
          type="button"
          onClick={runTests}
          disabled={running}
          className="flex items-center gap-1 px-3 py-1 bg-green-800 hover:bg-green-700 text-green-300 rounded-lg transition-colors"
        >
          {running ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          {running ? "Running..." : "Run Tests"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-1.5 border-t border-gray-700 pt-3">
          {results.map((result) => (
            <div key={result.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={result.passed ? "text-green-400" : "text-red-400"}>
                  {result.passed ? "✓" : "✗"}
                </span>
                <span className="text-gray-300">{result.name}</span>
              </div>
              <span className={result.passed ? "text-green-400" : "text-red-400"}>
                {result.durationMs.toFixed(1)}ms
              </span>
            </div>
          ))}

          <div className="border-t border-gray-700 pt-2 flex items-center gap-2">
            {allPassed ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold">All tests passed ✦</span>
              </>
            ) : (
              <span className="text-red-400 font-bold">Some tests failed</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTest;


