/**
 * src/components/SearchPanel.tsx
 * Bambeh Marketplace — Full-Screen Search Panel
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXES:
 * — "Recherche avancée" button had NO onClick — dead button. Now navigates to
 *   /search?q=...&category=...&scope=...&filters=open so the user lands on
 *   SearchResults with the filter panel already open.
 * — All localStorage accesses now wrapped in try/catch.
 *
 * NEW:
 * — Scope selector row: Cameroon 🇨🇲 | Central Africa 🌍 | West Africa 🌍
 *   User picks the region before searching; it's passed as a URL param.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, Clock, TrendingUp, Filter, Loader2, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SearchCategory, SearchScope } from "@/services/searchService";
import { SCOPE_CONFIG } from "@/services/searchService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchPanelProps {
  isOpen:        boolean;
  onClose:       () => void;
  initialQuery?: string;
}

// ─── Static config ────────────────────────────────────────────────────────────

const CATEGORIES: { id: SearchCategory; label: string; emoji: string }[] = [
  { id: "all",         label: "All",        emoji: "🔍" },
  { id: "marketplace", label: "Items",      emoji: "🛍️" },
  { id: "jobs",        label: "Jobs",       emoji: "💼" },
  { id: "services",    label: "Services",   emoji: "🔧" },
  { id: "rentals",     label: "Rentals",    emoji: "🏠" },
  { id: "vehicles",    label: "Vehicles",   emoji: "🚗" },
  { id: "exchange",    label: "Exchange",   emoji: "🔄" },
  { id: "vendors",     label: "Shops",      emoji: "🏪" },
];

const SCOPES: { value: SearchScope; label: string; emoji: string }[] = [
  { value: "cameroon",       label: "Cameroon",      emoji: "🇨🇲" },
  { value: "central_africa", label: "Central Africa", emoji: "🌍" },
  { value: "west_africa",    label: "West Africa",   emoji: "🌍" },
];

const TRENDING_BY_SCOPE: Record<SearchScope, string[]> = {
  cameroon:       ["iPhone", "Moto", "Appartement Yaoundé", "Ingénieur", "Coiffure", "Rizière"],
  central_africa: ["Pétrole", "Pharmacien Libreville", "Import Export", "Visa Congo", "Générateur"],
  west_africa:    ["Developer Lagos", "Kente Cloth", "Fintech", "Abidjan Appartement", "Solar Panel"],
};

const RECENT_KEY = "bambeh_recent_searches";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(searches: string[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(searches));
  } catch {
    // Ignore storage errors
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const SearchPanel: React.FC<SearchPanelProps> = ({ isOpen, onClose, initialQuery = "" }) => {
  const [query,         setQuery]         = useState(initialQuery);
  const [category,      setCategory]      = useState<SearchCategory>("all");
  const [scope,         setScope]         = useState<SearchScope>("cameroon");
  const [suggestions,   setSuggestions]   = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading,     setIsLoading]     = useState(false);

  const inputRef      = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate      = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    setRecentSearches(loadRecent());
  }, []);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Escape key closes panel
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  // Block body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Suggestions ─────────────────────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const { getSearchSuggestions } = await import("@/services/searchService");
      const results = await getSearchSuggestions(q);
      setSuggestions(results.map(r => r.text).slice(0, 6));
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(q), 300);
  }, [fetchSuggestions]);

  // ── Navigation helpers ───────────────────────────────────────────────────────
  const buildSearchUrl = useCallback((searchQuery: string, openFilters = false): string => {
    const params = new URLSearchParams();
    const trimmed = searchQuery.trim();
    if (trimmed)             params.set("q",        trimmed);
    if (category !== "all")  params.set("category", category);
    if (scope !== "cameroon") params.set("scope",   scope);
    if (openFilters)         params.set("filters",  "open");
    return `/search?${params.toString()}`;
  }, [category, scope]);

  const doSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Save to recent
    const prev = loadRecent();
    saveRecent([trimmed, ...prev.filter(s => s !== trimmed)].slice(0, 8));

    onClose();
    navigate(buildSearchUrl(trimmed));
  }, [navigate, onClose, buildSearchUrl]);

  // FIX: "Recherche avancée" button now actually navigates somewhere — was dead before.
  const doAdvancedSearch = useCallback(() => {
    onClose();
    navigate(buildSearchUrl(query, true)); // true = open filters panel
  }, [navigate, onClose, buildSearchUrl, query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); doSearch(query); }
  }, [query, doSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  }, []);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
  }, []);

  const trending = TRENDING_BY_SCOPE[scope];
  const scopeLabel = SCOPE_CONFIG[scope].label;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">

      {/* ── Search input row ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          {isLoading
            ? <Loader2 className="w-5 h-5 text-teal-500 animate-spin flex-shrink-0" />
            : <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`Search in ${scopeLabel}...`}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base"
          />
          {query && (
            <button type="button" onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-gray-200" aria-label="Clear">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        <button type="button" onClick={onClose}
          className="text-teal-600 font-medium text-sm whitespace-nowrap">
          Cancel
        </button>
      </div>

      {/* ── Scope selector ──────────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 font-medium flex-shrink-0">Search in:</span>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {SCOPES.map(s => (
              <button key={s.value} type="button" onClick={() => setScope(s.value)}
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                  scope === s.value
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}>
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category pills ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 py-2.5 border-b border-gray-100 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              category === cat.id
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ── Scrollable content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Live suggestions */}
        {suggestions.length > 0 && (
          <div className="py-2">
            {suggestions.map(s => (
              <button key={s} type="button" onClick={() => doSearch(s)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
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
                <p className="text-sm font-semibold text-gray-500">Recent searches</p>
              </div>
              <button type="button" onClick={clearRecent}
                className="text-xs text-red-500 hover:text-red-700">
                Clear
              </button>
            </div>
            {recentSearches.map(s => (
              <button key={s} type="button" onClick={() => doSearch(s)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700">{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* Trending — changes based on scope */}
        {!query && (
          <div className="py-4 px-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <p className="text-sm font-semibold text-gray-500">
                Trending in {scopeLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {trending.map(t => (
                <button key={t} type="button" onClick={() => doSearch(t)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-700 rounded-full text-sm transition">
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons when query is typed */}
        {query.trim().length > 0 && (
          <div className="px-4 py-3 space-y-2">
            <button type="button" onClick={() => doSearch(query)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition">
              <Search className="w-4 h-4" />
              Search "{query}" in {scopeLabel}
            </button>

            {/* FIX: was a dead button with no onClick — now navigates to /search with filters=open */}
            <button type="button" onClick={doAdvancedSearch}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition">
              <Filter className="w-4 h-4" />
              Advanced Search (with filters)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;


