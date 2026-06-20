import React, { useState } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonSearchbar, IonChip } from '@ionic/react';
import './FilterBar.css';

interface FilterBarProps {
  onCategoryChange: (category: string) => void;
  onSearchChange: (searchTerm: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  priceRange?: { min: number; max: number };
  condition?: string;
  location?: string;
  sortBy?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  onCategoryChange, 
  onSearchChange,
  onFilterChange 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Books' },
    { value: 'other', label: 'Other' }
  ];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const handleSearchChange = (e: CustomEvent) => {
    const value = e.detail.value || '';
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className="filter-bar">
      <IonSearchbar
        value={searchTerm}
        onIonInput={handleSearchChange}
        placeholder="Search marketplace..."
        debounce={300}
      />
      
      <IonSegment 
        value={selectedCategory} 
        onIonChange={e => handleCategoryChange(e.detail.value as string)}
        scrollable
      >
        {categories.map(cat => (
          <IonSegmentButton key={cat.value} value={cat.value}>
            <IonLabel>{cat.label}</IonLabel>
          </IonSegmentButton>
        ))}
      </IonSegment>
    </div>
  );
};

export default FilterBar;


