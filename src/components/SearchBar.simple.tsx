/**
 * src/components/SearchBar.tsx
 * Bambeh Marketplace â€” Simple Search Bar Component
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXES:
 * â€” handleSearch was missing its closing brace â€” caused a TypeScript compile error
 *   because the function body leaked into the JSX return statement.
 * â€” handleClear was missing its closing brace â€” same issue.
 *
 * NEW:
 * â€” Compact scope selector (Cameroon / Central / West Africa) shown below the input.
 *   The selected scope is appended to the /search URL as ?scope=...
 */

import React, { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SearchScope } from "@/services/searchService";
import { SCOPE_CONFIG } from "@/services/searchService";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SearchBarProps {
  placeholder?:    string;
  className?:      string;
  showScopeSelect?: boolean; // set false to hide the scope row in compact contexts
}

const SCOPES: { value: SearchScope; label: string; emoji: string }[] = [
  { value: "cameroon",       label: "Cameroon",       emoji: "ðŸ‡¨ðŸ‡²" },
  { value: "central_africa", label: "Central Africa", emoji: "ðŸŒ" },
  { value: "west_africa",    label: "West Africa",    emoji: "ðŸŒ" },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SearchBar({
  placeholder    = "Search for jobs, items, services...",
  className      = "",
  showScopeSelect = true,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scope,       setScope]       = useState<SearchScope>("cameroon");
  const navigate = useNavigate();

  // FIX: was missing closing brace â€” leaked into the return statement
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams({ q: searchQuery.trim() });
    if (scope !== "cameroon") params.set("scope", scope);
    navigate(`/search?${params.toString()}`);
  };

  // FIX: was missing closing brace â€” leaked into the return statement
  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className={className}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scope selector */}
        {showScopeSelect && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs text-gray-400">Search in:</span>
            {SCOPES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setScope(s.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                  scope === s.value
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}






