// @ts-nocheck
/**
 * GlobalSearchBar.tsx ? UNIVERSAL SEARCH
 * FILE LOCATION: src/components/search/GlobalSearchBar.tsx
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Tag, Briefcase, Home, Car, Wrench, ShoppingBag, TrendingUp } from 'lucide-react';
import { useSearch } from '@/hooks/useAllListings';
import { recordAdView } from '@/utils/BambehStore';
import type { SearchResult } from '@/utils/BambehStore';

const TYPE_ROUTES: Record<string, string> = {
  marketplace: '/marketplace', service: '/services', property: '/rentals',
  vehicle: '/vehicles', job: '/jobs', exchange: '/exchange',
};
const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  marketplace: ShoppingBag, service: Wrench, property: Home,
  vehicle: Car, job: Briefcase, exchange: TrendingUp,
};
const TYPE_COLORS: Record<string, string> = {
  marketplace: 'bg-green-100 text-green-700',  service:  'bg-purple-100 text-purple-700',
  property:    'bg-orange-100 text-orange-700', vehicle:  'bg-red-100 text-red-700',
  job:         'bg-blue-100 text-blue-700',     exchange: 'bg-teal-100 text-teal-700',
};

interface GlobalSearchBarProps {
  placeholder?: string; autoFocus?: boolean; className?: string;
  onResultSelect?: (result: SearchResult) => void;
}

const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  placeholder = 'Search jobs, items, rentals, services...',
  autoFocus = false, className = '', onResultSelect,
}) => {
  const navigate      = useNavigate();
  const inputRef      = useRef<HTMLInputElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const { query, setQuery, results, isSearching } = useSearch();
  const [isOpen, setIsOpen]   = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => { document.removeEventListener('mousedown', handler); };
  }, []);

  const handleSelect = useCallback((result: SearchResult) => {
    const route = TYPE_ROUTES[result.type] || '/marketplace';
    recordAdView(result.id, result.type);
    onResultSelect?.(result);
    navigate(`${route}/${result.id}`);
    setIsOpen(false);
    setQuery('');
  }, [navigate, onResultSelect, setQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    } else if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && query.length > 1;
  const formatPrice  = (price: number) => price > 0 ? `${price.toLocaleString('fr-CM')} XAF` : 'Free / Negotiable';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className={`flex items-center bg-white border-2 rounded-2xl transition-all shadow-sm ${focused ? 'border-teal-400 shadow-teal-100' : 'border-gray-200'}`}>
        <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
        <input ref={inputRef} type="text" value={query} placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { setFocused(true); setIsOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400" />
        {query && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="p-2 mr-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-[420px] overflow-y-auto">
          {isSearching && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              Searching Bambeh...
            </div>
          )}
          {!isSearching && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              No listings found for <strong>"{query}"</strong>
              <p className="mt-1 text-xs">Try a different keyword</p>
            </div>
          )}
          {!isSearching && results.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  {results.length} listing{results.length !== 1 ? 's' : ''} found
                </p>
              </div>
              {results.map((result) => {
                const Icon  = TYPE_ICONS[result.type] || Tag;
                const color = TYPE_COLORS[result.type] || 'bg-gray-100 text-gray-700';
                return (
                  <button key={result.id} onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left border-b border-gray-50 last:border-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {result.primaryPhoto ? <img src={result.primaryPhoto} alt="" className="w-full h-full object-cover" /> : <Icon className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{result.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                          <Icon className="w-3 h-3" />{result.type}
                        </span>
                        {result.location && result.location !== '?' && (
                          <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{result.location}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-teal-600">{formatPrice(result.price)}</p>
                    </div>
                  </button>
                );
              })}
              <button onClick={() => { navigate(`/search?q=${encodeURIComponent(query.trim())}`); setIsOpen(false); }}
                className="w-full px-4 py-3 text-center text-sm text-teal-600 font-semibold hover:bg-teal-50 transition-colors border-t border-gray-100">
                See all results for "{query}" ?
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;





