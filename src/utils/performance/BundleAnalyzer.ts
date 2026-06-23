/**
 * src/utils/performance/BundleAnalyzer.ts
 * Bambeh Marketplace — Bundle Analysis Utilities
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { logger } from "@/utils/logger";

export interface ChunkInfo {
  name: string;
  sizeBytes: number;
  gzipEstimateBytes: number;
  modules: string[];
}

export interface BundleReport {
  totalSizeBytes: number;
  totalGzipEstimateBytes: number;
  chunks: ChunkInfo[];
  generatedAt: string;
  warnings: string[];
}

const GZIP_RATIO = 0.35;
const SIZE_WARN_BYTES = 500 * 1024;
const CHUNK_WARN_BYTES = 200 * 1024;

export function estimateGzipSize(rawBytes: number): number {
  return Math.round(rawBytes * GZIP_RATIO);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function analyzeBundleReport(chunks: ChunkInfo[]): BundleReport {
  const warnings: string[] = [];
  const totalSizeBytes = chunks.reduce((sum, c) => sum + c.sizeBytes, 0);
  const totalGzipEstimateBytes = estimateGzipSize(totalSizeBytes);

  if (totalGzipEstimateBytes > SIZE_WARN_BYTES) {
    warnings.push(
      `Total bundle gzip estimate (${formatBytes(totalGzipEstimateBytes)}) exceeds ${formatBytes(SIZE_WARN_BYTES)}`
    );
  }

  for (const chunk of chunks) {
    if (chunk.sizeBytes > CHUNK_WARN_BYTES) {
      warnings.push(`Chunk "${chunk.name}" is ${formatBytes(chunk.sizeBytes)} — consider splitting`);
    }
  }

  return {
    totalSizeBytes,
    totalGzipEstimateBytes,
    chunks,
    generatedAt: new Date().toISOString(),
    warnings,
  };
}

export function logBundleReport(report: BundleReport): void {
  if (!import.meta.env.DEV) return;

  logger.log(
    `[BundleAnalyzer] Total: ${formatBytes(report.totalSizeBytes)} raw / ${formatBytes(report.totalGzipEstimateBytes)} gzip est.`
  );

  for (const chunk of report.chunks) {
    logger.log(
      `  ${chunk.name}: ${formatBytes(chunk.sizeBytes)} (${chunk.modules.length} modules)`
    );
  }

  for (const warning of report.warnings) {
    logger.warn(`[BundleAnalyzer] ⚠ ${warning}`);
  }
}

export async function measureAssetSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const cl = response.headers.get("content-length");
    return cl ? parseInt(cl, 10) : 0;
  } catch {
    return 0;
  }
}

