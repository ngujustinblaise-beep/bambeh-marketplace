/**
 * src/contexts/SearchContext.tsx
 * Bambeh Marketplace â€” Search Context & Provider
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXES:
 * â€” CRITICAL: setFilters, saveSearch, deleteSavedSearch, applySavedSearch, clearFilters
 *   were ALL nested inside each other (missing closing braces) â€” catastrophic compile error.
 *   All are now proper sibling functions.
 * â€” useSearch() hook had a mismatched extra closing brace â€” fixed.
 * â€” localStorage.getItem had no try/catch â€” could crash in SSR or storage-restricted envs.
 *   Now uses a safe loadSavedSearches() helper with try/catch.
 * â€” All localStorage.setItem calls now wrapped in try/catch.
 *
 * NEW:
 * â€” SearchFilters now includes `scope?: SearchScope` for region-aware search.
 */

import { createContext, useContext, useState, ReactNode } from "react";
import type { SearchScope } from "@/services/searchService";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SearchFilters {
  keywords:       string;
  category?:      string;
  scope?:         SearchScope;   // NEW: "cameroon" | "central_africa" | "west_africa"
  region?:        string;
  division?:      string;
  neighbourhood?: string;
  minPrice?:      number;
  maxPrice?:      number;
  dateFrom?:      Date;
  dateTo?:        Date;
  verifiedOnly?:  boolean;
  sortBy?:        "date" | "price-asc" | "price-desc" | "popularity";
}

export interface SavedSearch {
  id:        string;
  name:      string;
  filters:   SearchFilters;
  createdAt: Date;
}

interface SearchContextType {
  isSearching?:         boolean;
  performSearch?:       (q: string) => void;
  addRecentSearch?:     (q: string) => void;
  clearRecentSearches?: () => void;
  clearHistory?:        () => void;
  recentSearches?:      string[];
  searchHistory?:       string[];
  setSearchQuery?:      (q: string) => void;
  searchQuery?:         string;
  currentFilters:       SearchFilters;
  setFilters:           (filters: SearchFilters) => void;
  savedSearches:        SavedSearch[];
  saveSearch:           (name: string, filters: SearchFilters) => void;
  deleteSavedSearch:    (id: string) => void;
  applySavedSearch:     (id: string) => void;
  clearFilters:         () => void;
}

// â”€â”€â”€ Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const defaultFilters: SearchFilters = {
  keywords: "",
  scope:    "cameroon",
  sortBy:   "date",
};

const STORAGE_KEY = "Bambeh_saved_searches";

// FIX: safe localStorage read â€” was previously a bare JSON.parse without try/catch
function loadSavedSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedSearch[]) : [];
  } catch {
    // Storage blocked (incognito mode, SSR, or quota error)
    return [];
  }
}

// FIX: safe localStorage write â€” all writes now use this helper
function persistSavedSearches(searches: SavedSearch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // Storage blocked or quota exceeded â€” fail silently
  }
}

// â”€â”€â”€ Provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function SearchProvider({ children }: { children: ReactNode }) {
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(defaultFilters);
  const [savedSearches,  setSavedSearches]  = useState<SavedSearch[]>(loadSavedSearches);

  // FIX: was the outermost function that had everyone else nested inside it.
  // Now a standalone sibling function.
  const setFilters = (filters: SearchFilters): void => {
    setCurrentFilters(filters);
  };

  // FIX: was nested inside setFilters â€” now a proper sibling.
  const saveSearch = (name: string, filters: SearchFilters): void => {
    const newSearch: SavedSearch = {
      id:        `search_${Date.now()}`,
      name,
      filters,
      createdAt: new Date(),
    };
    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    persistSavedSearches(updated);
  };

  // FIX: was nested inside saveSearch â€” now a proper sibling.
  const deleteSavedSearch = (id: string): void => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    persistSavedSearches(updated);
  };

  // FIX: was nested inside deleteSavedSearch â€” now a proper sibling.
  const applySavedSearch = (id: string): void => {
    const found = savedSearches.find(s => s.id === id);
    if (found) {
      setCurrentFilters(found.filters);
    }
  };

  // FIX: was nested inside applySavedSearch â€” now a proper sibling.
  const clearFilters = (): void => {
    setCurrentFilters(defaultFilters);
  };

  const value: SearchContextType = {
    currentFilters,
    setFilters,
    savedSearches,
    saveSearch,
    deleteSavedSearch,
    applySavedSearch,
    clearFilters,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

// â”€â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FIX: had a mismatched extra closing brace that broke the export entirely.

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}


