/**
 * CATEGORY PAGE TEMPLATE
 * FILE LOCATION: src/components/templates/CategoryPageTemplate.tsx
 */

import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, DollarSign } from 'lucide-react';

interface FilterOptions {
  categories: string[];
  priceRanges: { label: string; min: number; max: number }[];
  locations: string[];
  conditions?: string[];
}

interface CategoryPageProps {
  title: string; subtitle: string; accentColor: string;
  filters: FilterOptions; items: any[];
  ItemCard: React.ComponentType<{ item: any }>;
}

export default function CategoryPageTemplate({
  title, subtitle, accentColor, filters, items, ItemCard,
}: CategoryPageProps) {
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [priceRange, setPriceRange]           = useState('All');

  const colors = {
    green:  { bg: 'from-green-600 to-green-800',   button: 'bg-green-600 hover:bg-green-700',   text: 'text-green-600',   border: 'border-green-500'  },
    blue:   { bg: 'from-blue-600 to-blue-800',     button: 'bg-blue-600 hover:bg-blue-700',     text: 'text-blue-600',    border: 'border-blue-500'   },
    purple: { bg: 'from-purple-600 to-purple-800', button: 'bg-purple-600 hover:bg-purple-700', text: 'text-purple-600',  border: 'border-purple-500' },
    orange: { bg: 'from-orange-600 to-orange-800', button: 'bg-orange-600 hover:bg-orange-700', text: 'text-orange-600',  border: 'border-orange-500' },
  };

  const theme = colors[accentColor as keyof typeof colors] || colors.green;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className={`bg-gradient-to-r ${theme.bg} text-white py-16`}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-xl opacity-90 mb-8">{subtitle}</p>
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className={`w-5 h-5 ${theme.text}`} />
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="All">All Categories</option>
                  {filters.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" />Location</h3>
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="All">All Locations</option>
                  {filters.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              {/* Price */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" />Price Range</h3>
                <div className="space-y-2">
                  {filters.priceRanges.map(range => (
                    <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="price" value={range.label} checked={priceRange === range.label}
                        onChange={() => setPriceRange(range.label)} className={`w-4 h-4 ${theme.text}`} />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition */}
              {filters.conditions && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Condition</h3>
                  <div className="space-y-2">
                    {filters.conditions.map(cond => (
                      <label key={cond} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className={`w-4 h-4 ${theme.text}`} />
                        <span className="text-sm text-gray-700">{cond}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setSelectedCategory('All'); setSelectedLocation('All'); setPriceRange('All'); }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Reset Filters
              </button>
            </div>
          </div>

          {/* Listings */}
          <div className="flex-1">
            <div className="mb-4 text-gray-600">Showing {items.length} results</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
            {items.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





