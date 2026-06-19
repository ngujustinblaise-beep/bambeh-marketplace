/**
 * ADVANCED SEARCH COMPONENT
 * FILE LOCATION: src/components/search/AdvancedSearch.tsx
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Filter, MapPin, DollarSign, Calendar, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchFilters {
  keyword: string; category: string; location: string;
  priceMin: number; priceMax: number; rating: number; datePosted: string; sortBy: string;
  condition?: 'new' | 'used' | 'refurbished'; verified?: boolean; featured?: boolean;
  availability?: 'available' | 'sold' | 'all'; propertyType?: string[];
  bedrooms?: number; bathrooms?: number;
  jobType?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  experienceLevel?: 'entry' | 'mid' | 'senior';
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  searchType: 'products' | 'jobs' | 'services' | 'properties' | 'all';
  initialFilters?: Partial<SearchFilters>;
  isOpen?: boolean; onClose?: () => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch, searchType, initialFilters = {}, isOpen = true, onClose,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '', category: 'all', location: '', priceMin: 0, priceMax: 1000000,
    rating: 0, datePosted: 'all', sortBy: 'relevance', verified: false, featured: false,
    availability: 'all', ...initialFilters,
  });
  const [showAdvanced, setShowAdvanced]     = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const categories = {
    products:   ['Electronics','Fashion','Home & Garden','Sports','Automotive','Books','Toys','Beauty','Food & Beverages','Other'],
    jobs:       ['Technology','Healthcare','Education','Finance','Marketing','Sales','Engineering','Construction','Hospitality','Other'],
    services:   ['Home Services','Professional Services','Personal Services','Event Services','Automotive Services','Beauty Services','Education & Training','Health & Wellness','Other'],
    properties: ['Apartment','House','Condo','Land','Commercial','Office Space','Warehouse','Other'],
    all:        ['All Categories'],
  };

  const locations = ['All Locations','YaoundÃ©','Douala','Bamenda','Bafoussam','Garoua','Maroua','NgaoundÃ©rÃ©','Bertoua','Buea','Kribi','Limbe','Ebolowa','Kumba','EdÃ©a','Loum'];

  useEffect(() => {
    let count = 0;
    if (filters.keyword)                    count++;
    if (filters.category !== 'all')         count++;
    if (filters.location)                   count++;
    if (filters.priceMin > 0 || filters.priceMax < 1000000) count++;
    if (filters.rating > 0)                 count++;
    if (filters.datePosted !== 'all')       count++;
    if (filters.verified)                   count++;
    if (filters.featured)                   count++;
    if (filters.condition)                  count++;
    if (filters.availability !== 'all')     count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => { onSearch(filters); };

  const handleReset = () => {
    setFilters({ keyword: '', category: 'all', location: '', priceMin: 0, priceMax: 1000000, rating: 0, datePosted: 'all', sortBy: 'relevance', verified: false, featured: false, availability: 'all' });
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />Advanced Search
            {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount} active</Badge>}
          </CardTitle>
          {onClose && <button onClick={onClose}><X className="w-5 h-5" /></button>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Keyword */}
        <div>
          <Label htmlFor="keyword">Search Keywords</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input id="keyword" value={filters.keyword} onChange={(e) => handleFilterChange('keyword', e.target.value)}
              placeholder="What are you looking for?" className="pl-10" />
          </div>
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categories[searchType] || categories.all).map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <Select value={filters.location || 'all'} onValueChange={(v) => handleFilterChange('location', v === 'all' ? '' : v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{locations.map(l => <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Price Range (XAF)</Label>
          <div className="grid grid-cols-2 gap-4 mt-1">
            <Input type="number" placeholder="Min price" value={filters.priceMin || ''} onChange={(e) => handleFilterChange('priceMin', Number(e.target.value) || 0)} />
            <Input type="number" placeholder="Max price" value={filters.priceMax === 1000000 ? '' : filters.priceMax} onChange={(e) => handleFilterChange('priceMax', Number(e.target.value) || 1000000)} />
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label className="flex items-center gap-2"><Star className="w-4 h-4" />Minimum Rating</Label>
          <div className="flex gap-2 mt-2">
            {[0, 1, 2, 3, 4, 5].map(r => (
              <button key={r} onClick={() => handleFilterChange('rating', r)}
                className={`px-3 py-1 rounded-lg border text-sm transition-colors ${filters.rating === r ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-300 hover:border-teal-400'}`}>
                {r === 0 ? 'Any' : `${r}â˜…+`}
              </button>
            ))}
          </div>
        </div>

        {/* Date Posted */}
        <div>
          <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" />Date Posted</Label>
          <Select value={filters.datePosted} onValueChange={(v) => handleFilterChange('datePosted', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any time</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <Label>Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced filters toggle */}
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-teal-600 font-medium text-sm">
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAdvanced ? 'Less filters' : 'More filters'}
        </button>

        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            {(searchType === 'products' || searchType === 'all') && (
              <div>
                <Label>Condition</Label>
                <div className="flex gap-2 mt-2">
                  {['new', 'used', 'refurbished'].map(c => (
                    <button key={c} onClick={() => handleFilterChange('condition', filters.condition === c ? undefined : c)}
                      className={`px-3 py-1 rounded-lg border text-sm capitalize transition-colors ${filters.condition === c ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-300 hover:border-teal-400'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox id="verified" checked={!!filters.verified} onCheckedChange={(c) => handleFilterChange('verified', c)} />
                <Label htmlFor="verified">Verified Sellers Only</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="featured" checked={!!filters.featured} onCheckedChange={(c) => handleFilterChange('featured', c)} />
                <Label htmlFor="featured">Featured Listings Only</Label>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">Reset Filters</Button>
          <Button onClick={handleSearch} className="flex-1 bg-teal-600 hover:bg-teal-700">
            <Search className="w-4 h-4 mr-2" />Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
