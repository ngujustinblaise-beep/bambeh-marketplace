/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * ADVANCED FILTER SYSTEM - WORLD-CLASS
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * âœ… Price range slider
 * âœ… Category & subcategory filters
 * âœ… Condition filters
 * âœ… Date posted filters
 * âœ… Sort options (newest, price, popular)
 * âœ… Save filter presets
 * âœ… Filter count badges
 * âœ… Mobile responsive drawer
 *
 * Â© 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw, Save, Check } from 'lucide-react';

export interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  category?: string;
  subcategory?: string;
  condition?: string[];
  datePosted?: 'today' | 'last-7-days' | 'last-30-days' | 'all';
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular' | 'nearest';
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  [key: string]: any;
}

interface AdvancedFilterSystemProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  onClose?: () => void;
  categories?: { id: string; name: string; subcategories?: string[] }[];
  priceRange?: { min: number; max: number };
  showCondition?: boolean;
  showDateFilter?: boolean;
  showTypeFilter?: boolean;
  typeOptions?: string[];
  customFilters?: React.ReactNode;
  className?: string;
}

export default function AdvancedFilterSystem({
  filters,
  onChange,
  onClose,
  categories = [],
  priceRange = { min: 0, max: 10000000 },
  showCondition = true,
  showDateFilter = true,
  showTypeFilter = false,
  typeOptions = [],
  customFilters,
  className = '',
}: AdvancedFilterSystemProps) {
  const [localFilters, setLocalFilters]       = useState<FilterOptions>(filters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [savedPresets, setSavedPresets]       = useState<any[]>([]);
  const [showSavePreset, setShowSavePreset]   = useState(false);
  const [presetName, setPresetName]           = useState('');

  const conditionOptions = [
    { id: 'new',         name: 'New'         },
    { id: 'like-new',   name: 'Like New'    },
    { id: 'used',        name: 'Used'        },
    { id: 'refurbished', name: 'Refurbished' },
  ];

  const dateOptions = [
    { id: 'today',        name: 'Today'        },
    { id: 'last-7-days',  name: 'Last 7 Days'  },
    { id: 'last-30-days', name: 'Last 30 Days' },
    { id: 'all',          name: 'All Time'     },
  ];

  const sortOptions = [
    { id: 'newest',     name: 'Newest First'         },
    { id: 'price-low',  name: 'Price: Low to High'   },
    { id: 'price-high', name: 'Price: High to Low'   },
    { id: 'popular',    name: 'Most Popular'          },
    { id: 'nearest',    name: 'Nearest to Me'         },
  ];

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.category) count++;
    if (localFilters.condition && localFilters.condition.length > 0) count++;
    if (localFilters.datePosted && localFilters.datePosted !== 'all') count++;
    if (localFilters.type) count++;
    setActiveFilterCount(count);
  }, [localFilters]);

  // Load saved presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('Bambeh_filter_presets');
    if (saved) {
      setSavedPresets(JSON.parse(saved));
    }
  }, []);

  const updateFilter = (key: string, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onChange(localFilters);
    if (onClose) onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      sortBy: 'newest',
      datePosted: 'all',
      currency: 'XAF',
    };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }
    const newPreset = {
      id: `preset_${Date.now()}`,
      name: presetName,
      filters: localFilters,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem('Bambeh_filter_presets', JSON.stringify(updated));
    setPresetName('');
    setShowSavePreset(false);
    alert('âœ… Filter preset saved!');
  };

  const handleLoadPreset = (preset: any) => {
    setLocalFilters(preset.filters);
    onChange(preset.filters);
  };

  const handleDeletePreset = (presetId: string) => {
    const updated = savedPresets.filter(p => p.id !== presetId);
    setSavedPresets(updated);
    localStorage.setItem('Bambeh_filter_presets', JSON.stringify(updated));
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
            {activeFilterCount > 0 && (
              <p className="text-sm text-gray-500">{activeFilterCount} filter(s) active</p>
            )}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">

        {/* SAVED PRESETS */}
        {savedPresets.length > 0 && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">ðŸ’¾ Saved Filter Presets</h3>
            <div className="space-y-2">
              {savedPresets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between bg-white p-2 rounded-lg">
                  <button
                    onClick={() => handleLoadPreset(preset)}
                    className="flex-1 text-left font-medium text-gray-900 hover:text-blue-600"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRICE RANGE */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">ðŸ’° Price Range (XAF)</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min Price</label>
              <input
                type="number"
                value={localFilters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || undefined)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Price</label>
              <input
                type="number"
                value={localFilters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || undefined)}
                placeholder={priceRange.max.toString()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={10000}
            value={localFilters.maxPrice || priceRange.max}
            onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* CATEGORY */}
        {categories.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">ðŸ“‚ Category</h3>
            <select
              value={localFilters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {localFilters.category && categories.find(c => c.id === localFilters.category)?.subcategories && (
              <select
                value={localFilters.subcategory || ''}
                onChange={(e) => updateFilter('subcategory', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-3"
              >
                <option value="">All Subcategories</option>
                {categories.find(c => c.id === localFilters.category)?.subcategories?.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* TYPE FILTER */}
        {showTypeFilter && typeOptions.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">ðŸ·ï¸ Type</h3>
            <select
              value={localFilters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        {/* CONDITION */}
        {showCondition && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">âœ¨ Condition</h3>
            <div className="grid grid-cols-2 gap-2">
              {conditionOptions.map((condition) => {
                const isSelected = localFilters.condition?.includes(condition.id);
                return (
                  <button
                    key={condition.id}
                    onClick={() => {
                      const current = localFilters.condition || [];
                      const updated = isSelected
                        ? current.filter(c => c !== condition.id)
                        : [...current, condition.id];
                      updateFilter('condition', updated);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                    {condition.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DATE POSTED */}
        {showDateFilter && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">ðŸ“… Date Posted</h3>
            <div className="grid grid-cols-2 gap-2">
              {dateOptions.map((date) => (
                <button
                  key={date.id}
                  onClick={() => updateFilter('datePosted', date.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    localFilters.datePosted === date.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {date.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SORT BY */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">ðŸ”„ Sort By</h3>
          <select
            value={localFilters.sortBy || 'newest'}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((sort) => (
              <option key={sort.id} value={sort.id}>{sort.name}</option>
            ))}
          </select>
        </div>

        {/* CUSTOM FILTERS */}
        {customFilters}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="border-t border-gray-200 p-6 space-y-3">
        {!showSavePreset ? (
          <button
            onClick={() => setShowSavePreset(true)}
            className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save as Preset
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <button onClick={handleSavePreset} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Save
            </button>
            <button onClick={() => setShowSavePreset(false)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleResetFilters}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Check className="w-5 h-5" />
            Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}




