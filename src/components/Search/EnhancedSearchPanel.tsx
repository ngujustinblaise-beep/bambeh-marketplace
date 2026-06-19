/**
 * ENHANCED SEARCH PANEL
 * FILE LOCATION: src/components/search/EnhancedSearchPanel.tsx
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Mic, Camera, Filter, Clock, TrendingUp, Star, MapPin, Tag, ChevronDown, Sparkles, Zap, Lock, ArrowRight, History, Trash2, ShoppingBag, Briefcase, Home, Car, Wrench } from 'lucide-react';

interface SearchSuggestion { id: string; text: string; type: 'recent' | 'trending' | 'category'; icon?: React.ElementType; }

interface SearchFilters { category: string; priceMin: number; priceMax: number; location: string; sortBy: string; condition: string; }

const trendingSearches: SearchSuggestion[] = [
  { id: '1', text: 'iPhone 14',         type: 'trending' },
  { id: '2', text: 'Toyota Camry',      type: 'trending' },
  { id: '3', text: 'Apartment Douala',  type: 'trending' },
  { id: '4', text: 'Web Developer',     type: 'trending' },
  { id: '5', text: 'Samsung TV',        type: 'trending' },
];

const categories = [
  { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag, color: 'bg-blue-500'   },
  { id: 'jobs',        name: 'Jobs',        icon: Briefcase,  color: 'bg-green-500'  },
  { id: 'rentals',     name: 'Rentals',     icon: Home,       color: 'bg-orange-500' },
  { id: 'vehicles',    name: 'Vehicles',    icon: Car,        color: 'bg-purple-500' },
  { id: 'services',    name: 'Services',    icon: Wrench,     color: 'bg-pink-500'   },
];

const comingSoonFeatures = [
  { id: 'voice',  title: 'Voice Search',          description: 'Search using your voice',       icon: Mic,      color: 'from-blue-500 to-cyan-500'   },
  { id: 'image',  title: 'Image Search',           description: 'Find products by photo',        icon: Camera,   color: 'from-purple-500 to-pink-500' },
  { id: 'ai',     title: 'AI Recommendations',    description: 'Smart suggestions for you',     icon: Sparkles, color: 'from-yellow-500 to-orange-500'},
  { id: 'saved',  title: 'Saved Searches',         description: 'Get alerts for new matches',    icon: Star,     color: 'from-green-500 to-teal-500'  },
];

interface EnhancedSearchPanelProps { isOpen: boolean; onClose: () => void; }

export default function EnhancedSearchPanel({ isOpen, onClose }: EnhancedSearchPanelProps) {
  const navigate  = useNavigate();
  const inputRef  = useRef<HTMLInputElement>(null);
  const [query, setQuery]                   = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters]       = useState(false);
  const [filters, setFilters]               = useState<SearchFilters>({ category: 'all', priceMin: 0, priceMax: 1000000, location: '', sortBy: 'relevance', condition: 'all' });

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      const saved = localStorage.getItem('Bambeh_enhanced_searches');
      if (saved) {
        try { setRecentSearches(JSON.parse(saved).slice(0, 5)); } catch {}
      }
    }
  }, [isOpen]);

  const saveSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('Bambeh_enhanced_searches', JSON.stringify(updated));
  };

  const handleSearch = (q: string = query) => {
    if (!q.trim()) return;
    saveSearch(q.trim());
    const cat = selectedCategory || filters.category;
    const base = cat && cat !== 'all' ? `/${cat}` : '/search';
    navigate(`${base}?q=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('Bambeh_enhanced_searches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Enter')  { handleSearch(); }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-0 top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl mx-auto overflow-hidden">
            {/* Input */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input ref={inputRef} type="text" value={query} placeholder="Search Bambeh..."
                  onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
                  className="flex-1 text-lg outline-none placeholder-gray-400 text-gray-900" />
                {query && <button onClick={() => setQuery('')}><X className="w-5 h-5 text-gray-400" /></button>}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 px-4 py-3 border-b overflow-x-auto">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat.id ? `${cat.color} text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <Icon className="w-4 h-4" />{cat.name}
                  </button>
                );
              })}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* Recent searches */}
              {recentSearches.length > 0 && !query && (
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><History className="w-4 h-4" />Recent Searches</h3>
                    <button onClick={clearRecent} className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" />Clear</button>
                  </div>
                  {recentSearches.map((s, i) => (
                    <button key={i} onClick={() => handleSearch(s)} className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-left">
                      <Clock className="w-4 h-4 text-gray-400" />{s}
                    </button>
                  ))}
                </div>
              )}

              {/* Trending */}
              {!query && (
                <div className="p-4 border-b">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-teal-500" />Trending</h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map(s => (
                      <button key={s.id} onClick={() => handleSearch(s.text)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-full text-sm font-medium transition-colors">
                        <TrendingUp className="w-3 h-3" />{s.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Coming Soon */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-yellow-500" />Coming Soon</h3>
                <div className="grid grid-cols-2 gap-3">
                  {comingSoonFeatures.map(f => {
                    const Icon = f.icon;
                    return (
                      <div key={f.id} className="relative p-3 border border-gray-200 rounded-xl opacity-75">
                        <div className={`absolute top-2 right-2 bg-gradient-to-r ${f.color} text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1`}>
                          <Lock className="w-2.5 h-2.5" />Soon
                        </div>
                        <Icon className="w-5 h-5 text-gray-400 mb-2" />
                        <p className="text-sm font-semibold text-gray-700">{f.title}</p>
                        <p className="text-xs text-gray-500">{f.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="px-4 py-3 bg-gray-50 border-t">
              <button onClick={() => handleSearch()}
                className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />Search Bambeh
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
