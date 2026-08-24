/**
 * FILTERBAR.TSX - Universal Filter Component
 * Can be used for Jobs, Marketplace, Services, Rentals
 */

import { useState } from 'react';
import { Search, SlidersHorizontal, Grid3x3, List, X } from 'lucide-react';

interface FilterBarProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: any) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: 'grid' | 'list';
  filterType: 'jobs' | 'marketplace' | 'services' | 'rentals';
}

export default function FilterBar({
  onSearchChange,
  onFilterChange,
  onViewChange,
  currentView,
  filterType
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [category, setCategory] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Category options based on filter type
  const getCategoryOptions = () => {
    switch (filterType) {
      case 'jobs':
        return [
          { value: 'all', label: 'All Categories' },
          { value: 'technology', label: 'Technology' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'education', label: 'Education' },
          { value: 'construction', label: 'Construction' },
          { value: 'hospitality', label: 'Hospitality' },
          { value: 'retail', label: 'Retail' },
          { value: 'transportation', label: 'Transportation' },
          { value: 'agriculture', label: 'Agriculture' },
        ];
      case 'marketplace':
        return [
          { value: 'all', label: 'All Items' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'fashion', label: 'Fashion & Clothing' },
          { value: 'home', label: 'Home & Garden' },
          { value: 'sports', label: 'Sports & Outdoors' },
          { value: 'books', label: 'Books & Media' },
          { value: 'toys', label: 'Toys & Games' },
          { value: 'vehicles', label: 'Vehicles' },
          { value: 'furniture', label: 'Furniture' },
        ];
      case 'services':
        return [
          { value: 'all', label: 'All Services' },
          { value: 'cleaning', label: 'Cleaning' },
          { value: 'repair', label: 'Repair & Maintenance' },
          { value: 'beauty', label: 'Beauty & Wellness' },
          { value: 'tutoring', label: 'Tutoring' },
          { value: 'photography', label: 'Photography' },
          { value: 'catering', label: 'Catering & Events' },
          { value: 'transport', label: 'Transportation' },
          { value: 'legal', label: 'Legal Services' },
        ];
      case 'rentals':
        return [
          { value: 'all', label: 'All Properties' },
          { value: 'apartment', label: 'Apartments' },
          { value: 'house', label: 'Houses' },
          { value: 'studio', label: 'Studios' },
          { value: 'commercial', label: 'Commercial' },
          { value: 'land', label: 'Land' },
          { value: 'room', label: 'Rooms' },
        ];
      default:
        return [];
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);

  const applyFilters = () => {
    onFilterChange({
      category,
      priceMin,
      priceMax,
      location,
      sortBy
    });
    setShowFilters(false);

  const resetFilters = () => {
    setCategory('all');
    setPriceMin('');
    setPriceMax('');
    setLocation('');
    setSortBy('newest');
    onFilterChange({ category: 'all',
      priceMin: '',
      priceMax: '',
      location: '',
      sortBy: 'newest'
    });

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* Main Filter Bar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${filterType}...`}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange('grid')}
              className={`p-2 rounded ${
                currentView === 'grid'
                  ? 'bg-white shadow-sm text-teal-600'
                  : 'text-gray-600'
              }`}
              title="Grid View"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`p-2 rounded ${
                currentView === 'list'
                  ? 'bg-white shadow-sm text-teal-600'
                  : 'text-gray-600'
              }`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {getCategoryOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range (XAF)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  <option value="yaounde">Yaoundé</option>
                  <option value="douala">Douala</option>
                  <option value="bamenda">Bamenda</option>
                  <option value="garoua">Garoua</option>
                  <option value="bafoussam">Bafoussam</option>
                  <option value="ngaoundere">Ngaoundéré</option>
                  <option value="maroua">Maroua</option>
                  <option value="buea">Buea</option>
                  <option value="limbe">Limbe</option>
                  <option value="kribi">Kribi</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
}
}
}





