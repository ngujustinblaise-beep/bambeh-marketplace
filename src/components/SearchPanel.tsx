/**
 * src/components/SearchPanel.tsx
 * Bambeh Marketplace — Full-Screen Search Panel
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, Clock, TrendingUp, Filter, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SearchCategory } from "@/services/searchService";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const CATEGORIES: { id: SearchCategory; label: string; emoji: string }[] = [
  { id: "all", label: "Tout", emoji: "🌍" },
  { id: "marketplace", label: "Produits", emoji: "🛍️" },
  { id: "jobs", label: "Emplois", emoji: "💼" },
  { id: "services", label: "Services", emoji: "🔧" },
  { id: "rentals", label: "Locations", emoji: "🏠" },
  { id: "vehicles", label: "Véhicules", emoji: "🚗" },
  { id: "vendors", label: "Boutiques", emoji: "🏪" },
];

const TRENDING = ["iPhone", "Moto", "Appartement Yaoundé", "Ingénieur", "Coiffure", "Rizière"];

const SearchPanel: React.FC<SearchPanelProps> = ({ isOpen, onClose, initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>("all");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // Load recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bambeh_recent_searches");
      if (raw) setRecentSearches(JSON.parse(raw) as string[]);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Block body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { getSearchSuggestions } = await import("@/services/searchService");
      const results = await getSearchSuggestions(q);
      setSuggestions(results.map((r) => r.text).slice(0, 6));
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setQuery(q);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => fetchSuggestions(q), 300);
    },
    [fetchSuggestions]
  );

  const doSearch = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      // Save to recent
      try {
        const prev = JSON.parse(localStorage.getItem("bambeh_recent_searches") ?? "[]") as string[];
        const updated = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 8);
        localStorage.setItem("bambeh_recent_searches", JSON.stringify(updated));
      } catch {
        // Ignore
      }

      onClose();
      navigate(`/search?q=${encodeURIComponent(trimmed)}&category=${category}`);
    },
    [navigate, onClose, category]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doSearch(query);
      }
    },
    [query, doSearch]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  }, []);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("bambeh_recent_searches");
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Search input row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-teal-500 animate-spin flex-shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher sur Bambeh..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-gray-200"
              aria-label="Effacer"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-teal-600 font-medium text-sm whitespace-nowrap"
        >
          Annuler
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === cat.id
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="py-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => doSearch(s)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <Search className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="text-sm text-gray-800">{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* Recent searches */}
        {!query && recentSearches.length > 0 && (
          <div className="py-2">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-500">Recherches récentes</p>
              </div>
              <button
                type="button"
                onClick={clearRecent}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Effacer
              </button>
            </div>
            {recentSearches.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => doSearch(s)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700">{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* Trending */}
        {!query && (
          <div className="py-4 px-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <p className="text-sm font-semibold text-gray-500">Tendances au Cameroun</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => doSearch(t)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-700 rounded-full text-sm transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters hint */}
        {query.trim().length > 0 && (
          <div className="px-4 py-3">
            <button
              type="button"
              onClick={() => doSearch(query)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors"
            >
              <Search className="w-4 h-4" />
              Rechercher "{query}"
            </button>
            <button
              type="button"
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <Filter className="w-4 h-4" />
              Recherche avancée
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
