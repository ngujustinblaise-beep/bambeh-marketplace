// @ts-nocheck
import type { ItemFilters, PaginatedItemsResponse, JobItem, MarketplaceItem } from "../types/items";
/** @deprecated use JobItem */ export type JobListing = JobItem;

function emptyPage<T extends object>(): PaginatedItemsResponse<T> {
  return { data: [], total: 0, page: 1, pageSize: 10, hasMore: false };
}

export const testJobsApi = async (filters?: Partial<ItemFilters>): Promise<PaginatedItemsResponse<JobItem>> => {
  console.debug("[test-api] Jobs:", filters);
  return emptyPage<JobItem>();
};

export const testMarketApi = async (filters?: Partial<ItemFilters>): Promise<PaginatedItemsResponse<MarketplaceItem>> => {
  console.debug("[test-api] Market:", filters);
  return emptyPage<MarketplaceItem>();
};

export const testAllServices = async (): Promise<{ jobs: boolean; market: boolean }> => {
  try { await testJobsApi(); await testMarketApi(); return { jobs: true, market: true }; }
  catch { return { jobs: false, market: false }; }
};

