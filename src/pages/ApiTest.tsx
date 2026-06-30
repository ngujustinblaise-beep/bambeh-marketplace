// @ts-nocheck
import React, { useState } from "react";
import type {
  PaginatedItemsResponse,
  JobListing,
  MarketplaceItem,
  ItemFilters,
} from "../types/items";
import { useLang, t } from "@/hooks/useAppLang";

// Use a named function ? avoids the <T> jsx-ambiguity in .tsx files
function emptyPage<T extends object>(): PaginatedItemsResponse<T> {
  const lang = useLang();
  const isRtl = lang === "ar";
  return { data: [], total: 0, page: 1, pageSize: 3, hasMore: false };
}

const ApiTest: React.FC = () => {
  const [jobs,    setJobs]    = useState<JobListing[]>([]);
  const [market,  setMarket]  = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters use pageSize (not limit) ? matches ItemFilters interface
  const filters: Partial<ItemFilters> = { page: 1, pageSize: 3 };

  const testJobs = async () => {
    setLoading(true);
    try {
      const res = emptyPage<JobListing>();
      console.debug("Jobs filters:", filters, "total:", res.total);
      setJobs(res.data);
    } finally {
      setLoading(false);
    }
  };

  const testMarket = async () => {
    setLoading(true);
    try {
      const res = emptyPage<MarketplaceItem>();
      console.debug("Market filters:", filters, "total:", res.total);
      setMarket(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">API Test</h1>
      <div className="flex gap-3 mb-4">
        <button
          onClick={testJobs}
          disabled={loading}
          className="bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Jobs
        </button>
        <button
          onClick={testMarket}
          disabled={loading}
          className="bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Marketplace
        </button>
      </div>
      <pre className="bg-gray-100 p-3 rounded text-xs whitespace-pre-wrap overflow-auto">
        {JSON.stringify({ jobs, market }, null, 2)}
      </pre>
    </div>
  );
};

export default ApiTest;





