/**
 * GLOBAL SEARCH PANEL
 * FILE LOCATION: src/components/search/GlobalSearch.tsx
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, X, Clock, TrendingUp, ArrowRight, Star, MapPin,
  ShoppingBag, Briefcase, Home, Car, Wrench, RefreshCw, Heart,
  Bell, User, Settings, HelpCircle, Shield, CreditCard, Crown,
  Package, BarChart3, MessageSquare, FileText, Phone, Mail,
  Users, Zap, BadgeCheck, ShoppingCart, Gift, AlertCircle, Info,
  Lock, Globe, ChevronRight, Headphones,
} from 'lucide-react';

// Inline Store icon (not in lucide-react v0.383 used here)
const Store = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l1-6h16l1 6" /><path d="M3 9h18v12H3z" /><path d="M9 21V12h6v9" />
  </svg>
);

interface SearchResult { id: string; title: string; description: string; path: string; icon: any; category: string; keywords: string[]; }

const allPages: SearchResult[] = [
  { id: 'home',        title: 'Home',            description: 'Main landing page',          path: '/',                     icon: Home,         category: 'Main',    keywords: ['home','main','landing','start'] },
  { id: 'jobs',        title: 'Jobs',            description: 'Find job opportunities',     path: '/jobs',                 icon: Briefcase,    category: 'Main',    keywords: ['jobs','work','employment','career','hiring','vacancy'] },
  { id: 'marketplace', title: 'Marketplace',     description: 'Buy and sell products',      path: '/marketplace',          icon: ShoppingBag,  category: 'Main',    keywords: ['marketplace','shop','buy','sell','products','items','store'] },
  { id: 'services',    title: 'Services',        description: 'Find professional services', path: '/services',             icon: Wrench,       category: 'Main',    keywords: ['services','professionals','repair','fix','help'] },
  { id: 'rentals',     title: 'Rentals',         description: 'Property rentals',           path: '/rentals',              icon: Home,         category: 'Main',    keywords: ['rentals','rent','property','apartment','house','real estate'] },
  { id: 'vehicles',    title: 'Car Rentals',     description: 'Rent vehicles',              path: '/vehicles',             icon: Car,          category: 'Main',    keywords: ['car','vehicle','rental','automobile','transport'] },
  { id: 'exchange',    title: 'Exchange',         description: 'Trade items',               path: '/exchange',             icon: RefreshCw,    category: 'Main',    keywords: ['exchange','trade','swap','barter'] },
  { id: 'cart',        title: 'Cart',            description: 'Your shopping cart',         path: '/cart',                 icon: ShoppingCart, category: 'User',    keywords: ['cart','basket','checkout','buy'] },
  { id: 'alerts',      title: 'Notifications',   description: 'Your alerts',                path: '/notifications',        icon: Bell,         category: 'User',    keywords: ['alerts','notifications','messages','updates'] },
  { id: 'favorites',   title: 'Favorites',       description: 'Your saved items',           path: '/favorites',            icon: Heart,        category: 'User',    keywords: ['favorites','saved','liked','wishlist','bookmarks'] },
  { id: 'profile',     title: 'Profile',         description: 'Your profile settings',      path: '/profile',              icon: User,         category: 'User',    keywords: ['profile','account','settings','personal'] },
  { id: 'referral',    title: 'Referral Program',description: 'Invite friends and earn',    path: '/referral',             icon: Gift,         category: 'User',    keywords: ['referral','invite','friends','earn','bonus'] },
  { id: 'terms',       title: 'Terms of Service',description: 'Terms and conditions',       path: '/terms',                icon: FileText,     category: 'Legal',   keywords: ['terms','conditions','legal','agreement','policy'] },
  { id: 'privacy',     title: 'Privacy Policy',  description: 'How we handle your data',   path: '/privacy-policy',       icon: Lock,         category: 'Legal',   keywords: ['privacy','policy','data','protection','gdpr'] },
  { id: 'about',       title: 'About Us',        description: 'Learn about Bambeh',         path: '/about',                icon: Info,         category: 'Legal',   keywords: ['about','company','team','mission','story'] },
  { id: 'help',        title: 'Help Center',     description: 'Get help and support',       path: '/help',                 icon: HelpCircle,   category: 'Support', keywords: ['help','support','faq','questions','assistance'] },
  { id: 'support',     title: 'Contact Support', description: 'Get in touch with us',      path: '/help/contact',         icon: Headphones,   category: 'Support', keywords: ['support','contact','help','customer service'] },
  { id: 'safety',      title: 'Safety & Security',description: 'Stay safe on Bambeh',      path: '/help/safety-security', icon: Shield,       category: 'Support', keywords: ['safety','security','scam','fraud','protect'] },
  { id: 'guides',      title: 'Seller Guides',   description: 'Learn how to sell',          path: '/help/guides',          icon: FileText,     category: 'Support', keywords: ['guides','tutorial','how to','selling'] },
  { id: 'vendor-home', title: 'Vendor Dashboard',description: 'Vendor home page',          path: '/vendor/home',          icon: Store,        category: 'Vendor',  keywords: ['vendor','seller','dashboard','business'] },
  { id: 'vendor-listings',title: 'Manage Listings',description:'Manage your products',    path: '/vendor/manage-listings',icon: Package,     category: 'Vendor',  keywords: ['listings','products','inventory','manage'] },
  { id: 'vendor-analytics',title:'Analytics',    description: 'View your statistics',      path: '/vendor/analytics',     icon: BarChart3,    category: 'Vendor',  keywords: ['analytics','statistics','data','reports','insights'] },
  { id: 'subscription', title: 'Subscription Plans',description:'Upgrade your account',   path: '/vendor/subscription',  icon: Crown,        category: 'Vendor',  keywords: ['subscription','plans','upgrade','premium','pricing'] },
  { id: 'verification', title: 'Verification',   description: 'Get verified badge',         path: '/vendor/verification',  icon: BadgeCheck,   category: 'Vendor',  keywords: ['verification','verified','badge','trust'] },
];

const trendingSearches = ['iPhone','Apartments in Douala','Electronics','Jobs Yaoundé','Car rental','Services'];

interface GlobalSearchProps { isOpen: boolean; onClose: () => void; }

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate  = useNavigate();
  const inputRef  = useRef<HTMLInputElement>(null);
  const [query, setQuery]                   = useState('');
  const [results, setResults]               = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex]   = useState(-1);

  useEffect(() => {
    const saved = localStorage.getItem('Bambeh_recent_searches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved).slice(0, 5)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const matched = allPages.filter(page =>
      page.title.toLowerCase().includes(q) ||
      page.description.toLowerCase().includes(q) ||
      page.keywords.some(k => k.includes(q))
    ).slice(0, 8);
    setResults(matched);
    setSelectedIndex(-1);
  }, [query]);

  const saveSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('Bambeh_recent_searches', JSON.stringify(updated));
  };

  const handleSelect = (result: SearchResult) => {
    saveSearch(result.title);
    navigate(result.path);
    onClose();
  };

  const handleTrending = (term: string) => {
    saveSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('Bambeh_recent_searches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { setSelectedIndex(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) { handleSelect(results[selectedIndex]); }
      else if (query.trim()) {
        saveSearch(query);
        navigate(`/search?q=${encodeURIComponent(query)}`);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="Search pages, features, help..."
              className="flex-1 text-lg outline-none placeholder-gray-400 text-gray-900" />
            {query && <button onClick={() => setQuery('')}><X className="w-5 h-5 text-gray-400" /></button>}
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {/* Results */}
            {results.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-3 py-2">{results.length} results</p>
                {results.map((result, i) => {
                  const Icon = result.icon;
                  return (
                    <button key={result.id} onClick={() => handleSelect(result)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${i === selectedIndex ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{result.title}</p>
                        <p className="text-sm text-gray-500 truncate">{result.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{result.category}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {query.trim() && results.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No pages found for "<strong>{query}</strong>"</p>
              </div>
            )}

            {/* Empty state */}
            {!query && (
              <>
                {recentSearches.length > 0 && (
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" />Recent</p>
                      <button onClick={clearRecent} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
                    </div>
                    {recentSearches.map((s, i) => (
                      <button key={i} onClick={() => { setQuery(s); }} className="flex items-center gap-3 w-full px-2 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />{s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Trending</p>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map(t => (
                      <button key={t} onClick={() => handleTrending(t)}
                        className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm hover:bg-teal-100 transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
            <kbd className="px-1.5 py-0.5 bg-white border rounded">↑↓</kbd> navigate · <kbd className="px-1.5 py-0.5 bg-white border rounded">↵</kbd> select · <kbd className="px-1.5 py-0.5 bg-white border rounded">Esc</kbd> close
          </div>
        </div>
      </div>
    </>
  );
}
