/**
 * SEARCH CONTEXT - Multi-Parameter Search System
 */

import { createContext, useContext, useState, ReactNode } from "react";

export interface SearchFilters {
  keywords: string;
  category?: string;
  region?: string;
  division?: string;
  neighbourhood?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: Date;
  dateTo?: Date;
  verifiedOnly?: boolean;
  sortBy?: "date" | "price-asc" | "price-desc" | "popularity";
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
}

interface SearchContextType {
  isSearching?: boolean;
  performSearch?: (q: string) => void;
  addRecentSearch?: (q: string) => void;
  clearRecentSearches?: () => void;
  clearHistory?: () => void;
  recentSearches?: string[];
  searchHistory?: string[];
  setSearchQuery?: (q: string) => void;
  searchQuery?: string;
  currentFilters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  savedSearches: SavedSearch[];
  saveSearch: (name: string, filters: SearchFilters) => void;
  deleteSavedSearch: (id: string) => void;
  applySavedSearch: (id: string) => void;
  clearFilters: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const defaultFilters: SearchFilters = {
  keywords: "",
  sortBy: "date",
};

export function SearchProvider({ children }: { children: ReactNode }) {
  const [currentFilters, setCurrentFilters] =
    useState<SearchFilters>(defaultFilters);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem("Bambeh_saved_searches");
    return saved ? JSON.parse(saved) : [];
  });

  const setFilters = (filters: SearchFilters) => {
    setCurrentFilters(filters);

  const saveSearch = (name: string, filters: SearchFilters) => {
    const newSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name,
      filters,
      createdAt: new Date(),
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem("Bambeh_saved_searches", JSON.stringify(updated));

  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem("Bambeh_saved_searches", JSON.stringify(updated));

  const applySavedSearch = (id: string) => {
    const search = savedSearches.find((s) => s.id === id);
    if (search) {
      setCurrentFilters(search.filters);
  };

  const clearFilters = () => {
    setCurrentFilters(defaultFilters);

  const value: SearchContextType = {
    currentFilters,
    setFilters,
    savedSearches,
    saveSearch,
    deleteSavedSearch,
    applySavedSearch,
    clearFilters
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );

}
}
}
}
}
}
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  return context;
}
}