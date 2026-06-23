// @ts-nocheck
import { useState, useEffect } from "react";

export interface UnifiedListing {
  id: string;
  type: "marketplace" | "job" | "service" | "rental" | "vehicle";
  title: string;
  priceXAF?: number;
  imageUrl?: string;
  createdAt?: string;
}

async function fetchAll(): Promise<UnifiedListing[]> { return []; }

export const useAllListings = (pageSize = 20) => {
  const [listings,  setListings]  = useState<UnifiedListing[]>([]);
  const [page,      setPage]      = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchAll()
      .then((data: UnifiedListing[]) => {
        if (cancelled) return;
        const start = (page - 1) * pageSize;
        setListings(data.slice(start, start + pageSize));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize]);

  return { listings, page, setPage, isLoading, error };
};

// useSearch exported here so GlobalSearchBar can import it
export const useSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnifiedListing[]>([]);

  const search = (q: string) => {
    setQuery(q);
    // TODO: connect to real search API
    setResults([]);
  };

  return { query, results, search };
};
