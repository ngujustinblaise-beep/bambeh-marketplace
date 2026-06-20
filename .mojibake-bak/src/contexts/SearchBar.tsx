/**
 * src/contexts/SearchBar.tsx
 * Bambeh Marketplace â€” Search Bar Context & Provider
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useEffect, 
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface SearchBarState {
  query: string;
  isOpen: boolean;
  isFocused: boolean;
  suggestions: string[];
  recentSearches: string[];
  isLoading: boolean;
}

export interface SearchBarActions {
  setQuery: (query: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
  submitSearch: (query?: string) => void;
  clearQuery: () => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (term: string) => void;
}

type SearchBarContextValue = SearchBarState & SearchBarActions;

// â”€â”€â”€ Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SearchBarContext = createContext<SearchBarContextValue | null>(null);

const RECENT_KEY = "bambeh_recent_searches";
const MAX_RECENT = 8;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveRecent(searches: string[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(searches));
  } catch {
    // Ignore
  }
}

// â”€â”€â”€ Provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const SearchBarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQueryState] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecent);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!q.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const { getSearchSuggestions } = await import("@/services/searchService");
        const results = await getSearchSuggestions(q);
        setSuggestions(results.map((r) => r.text));
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
    setIsFocused(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setIsFocused(false);
    setSuggestions([]);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState("");
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  const addToRecent = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
      saveRecent(updated);
      return updated;
    });
  }, []);

  const submitSearch = useCallback(
    (overrideQuery?: string) => {
      const term = (overrideQuery ?? query).trim();
      if (!term) return;

      addToRecent(term);
      closeSearch();
      navigate(`/search?q=${encodeURIComponent(term)}`);
    },
    [query, addToRecent, closeSearch, navigate]
  );

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    saveRecent([]);
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      saveRecent(updated);
      return updated;
    });
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const value: SearchBarContextValue = {
    query,
    isOpen,
    isFocused,
    suggestions,
    recentSearches,
    isLoading,
    setQuery,
    openSearch,
    closeSearch,
    submitSearch,
    clearQuery,
    clearRecentSearches,
    removeRecentSearch,
  };

  return (
    <SearchBarContext.Provider value={value}>
      {children}
    </SearchBarContext.Provider>
  );
};

// â”€â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useSearchBar(): SearchBarContextValue {
  const ctx = useContext(SearchBarContext);
  if (!ctx) {
    throw new Error("useSearchBar must be used inside <SearchBarProvider>");
  }
  return ctx;
}

export default SearchBarContext;




