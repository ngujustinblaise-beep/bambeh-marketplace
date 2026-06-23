/**
 * src/components/Search/SearchBar.tsx
 * Bambeh Marketplace — Search Bar Component
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useRef, useCallback } from "react";
import { Search, X, Clock, TrendingUp, Loader2 } from "lucide-react";
import { useSearchBar } from "@/contexts/SearchBar";

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Rechercher sur Bambeh...",
  autoFocus = false,
  compact = false,
  className = "",
  onSearch,
}) => {
  const {
    query,
    isOpen,
    isLoading,
    suggestions,
    recentSearches,
    setQuery,
    openSearch,
    closeSearch,
    submitSearch,
    clearQuery,
    removeRecentSearch,
    clearRecentSearches,
  } = useSearchBar();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    openSearch();
  }, [openSearch]);

  const handleBlur = useCallback(() => {
    // Delay close so clicks on suggestions register first
    setTimeout(() => closeSearch(), 150);
  }, [closeSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [setQuery]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (onSearch) {
          onSearch(query);
        } else {
          submitSearch();
        }
      }
      if (e.key === "Escape") {
        closeSearch();
        inputRef.current?.blur();
      }
    },
    [query, onSearch, submitSearch, closeSearch]
  );

  const handleSuggestionClick = useCallback(
    (term: string) => {
      setQuery(term);
      if (onSearch) {
        onSearch(term);
      } else {
        submitSearch(term);
      }
    },
    [setQuery, onSearch, submitSearch]
  );

  const handleClear = useCallback(() => {
    clearQuery();
    inputRef.current?.focus();
  }, [clearQuery]);

  const showDropdown = isOpen && (suggestions.length > 0 || recentSearches.length > 0 || isLoading);

  return (
    <div className={`relative ${className}`}>
      {/* Input row */}
      <div
        className={`flex items-center gap-2 bg-white border rounded-xl shadow-sm transition-shadow ${
          isOpen ? "border-teal-500 shadow-md ring-2 ring-teal-100" : "border-gray-300"
        } ${compact ? "px-3 py-2" : "px-4 py-3"}`}
      >
        {isLoading ? (
          <Loader2 className={`flex-shrink-0 text-teal-500 animate-spin ${compact ? "w-4 h-4" : "w-5 h-5"}`} />
        ) : (
          <Search className={`flex-shrink-0 text-gray-400 ${compact ? "w-4 h-4" : "w-5 h-5"}`} />
        )}

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 ${
            compact ? "text-sm" : "text-base"
          }`}
          aria-label="Rechercher"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Effacer la recherche"
          >
            <X className={`text-gray-400 ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
          </button>
        )}

        {!compact && (
          <button
            type="button"
            onClick={() => onSearch ? onSearch(query) : submitSearch()}
            disabled={!query.trim()}
            className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:text-gray-400"
          >
            Chercher
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Suggestions de recherche"
        >
          {/* Live suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggestions</p>
              </div>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => handleSuggestionClick(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                  role="option"
                >
                  <Search className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {recentSearches.length > 0 && !query && (
            <div className="py-2 border-t border-gray-100">
              <div className="flex items-center justify-between px-4 py-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Récents</p>
                <button
                  type="button"
                  onMouseDown={clearRecentSearches}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Tout effacer
                </button>
              </div>
              {recentSearches.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 group"
                >
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <button
                    type="button"
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="flex-1 text-left text-sm text-gray-700"
                    role="option"
                  >
                    {s}
                  </button>
                  <button
                    type="button"
                    onMouseDown={() => removeRecentSearch(s)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-gray-200 transition-all"
                    aria-label={`Supprimer ${s}`}
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Trending placeholder */}
          {!query && recentSearches.length === 0 && (
            <div className="py-3 px-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-teal-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tendances</p>
              </div>
              {["Téléphones", "Emplois Yaoundé", "Appartements", "Motos"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onMouseDown={() => handleSuggestionClick(t)}
                  className="inline-block mr-2 mb-2 px-3 py-1 bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-700 rounded-full text-sm transition-colors"
                  role="option"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;




