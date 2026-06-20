// @ts-nocheck
/**
 * STAR RATING COMPONENT
 * FILE LOCATION: src/components/reviews/StarRating.tsx
 */

import { useState } from 'react';
import { Star } from 'lucide-react';
import { StarRating as StarRatingType } from '@/types/reviews';

interface StarRatingProps {
  value: number;
  onChange?: (rating: StarRatingType) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showValue?: boolean;
  count?: number;
  className?: string;
}

export default function StarRating({
  value = 0, onChange, readonly = false, size = 'md',
  showValue = false, count, className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const isInteractive = !readonly && onChange !== undefined;
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6', xl: 'w-8 h-8' };
  const textSizeClasses = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
  const iconSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  const handleClick = (rating: StarRatingType) => {
    if (isInteractive && onChange) {
      onChange(rating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: StarRatingType) => {
    if (!isInteractive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(rating);
    }
  };

  const renderStar = (index: number) => {
    const starValue    = index + 1;
    const displayRating = hoverRating || value;
    const isFilled     = displayRating >= starValue;
    const isHalfFilled = !isFilled && displayRating >= starValue - 0.5;
    return (
      <button key={index} type="button" disabled={!isInteractive}
        onClick={() => handleClick(starValue as StarRatingType)}
        onMouseEnter={() => isInteractive && setHoverRating(starValue)}
        onMouseLeave={() => isInteractive && setHoverRating(0)}
        onKeyDown={(e) => handleKeyDown(e, starValue as StarRatingType)}
        className={`relative inline-block ${isInteractive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 rounded`}
        aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
      >
        <Star className={`${iconSize} text-gray-300`} strokeWidth={1.5} />
        <div className="absolute inset-0 overflow-hidden" style={{ width: isHalfFilled ? '50%' : isFilled ? '100%' : '0%' }}>
          <Star className={`${iconSize} ${hoverRating >= starValue ? 'text-yellow-400' : 'text-yellow-500'} fill-current`} strokeWidth={1.5} />
        </div>
      </button>
    );
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
        {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
      </div>
      {showValue && <span className={`ml-2 font-semibold text-gray-700 ${textSize}`}>{value.toFixed(1)}</span>}
      {count !== undefined && count > 0 && <span className={`ml-1 text-gray-500 ${textSize}`}>({count.toLocaleString()})</span>}
    </div>
  );
}

interface CompactStarRatingProps { value: number; count?: number; className?: string; }

export function CompactStarRating({ value, count, className = '' }: CompactStarRatingProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star className="w-4 h-4 text-yellow-500 fill-current" />
      <span className="text-sm font-semibold text-gray-700">{value.toFixed(1)}</span>
      {count !== undefined && count > 0 && <span className="text-sm text-gray-500">({count})</span>}
    </div>
  );
}

interface RatingSelectorProps {
  value: StarRatingType | 0;
  onChange: (rating: StarRatingType) => void;
  required?: boolean;
  error?: string;
}

export function RatingSelector({ value, onChange, required, error }: RatingSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Rating {required && <span className="text-red-500">*</span>}</label>
      </div>
      <StarRating value={value} onChange={onChange} size="lg" />
      {value > 0 && <p className="text-sm text-gray-600">You selected {value} star{value !== 1 ? 's' : ''}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface RatingDistributionProps {
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  total: number; className?: string;
}

export function RatingDistribution({ distribution, total, className = '' }: RatingDistributionProps) {
  const getPercentage = (count: number) => total > 0 ? (count / total) * 100 : 0;
  const rows = [5, 4, 3, 2, 1].map(stars => ({ stars, count: distribution[stars as keyof typeof distribution] }));
  return (
    <div className={`space-y-2 ${className}`}>
      {rows.map(({ stars, count }) => (
        <div key={stars} className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 w-8">{stars} ★</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${getPercentage(count)}%` }} />
          </div>
          <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

interface AverageRatingDisplayProps {
  average: number; total: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  className?: string;
}

export function AverageRatingDisplay({ average, total, distribution, className = '' }: AverageRatingDisplayProps) {
  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-gray-900 mb-2">{average.toFixed(1)}</div>
        <StarRating value={average} readonly size="lg" />
        <p className="text-sm text-gray-600 mt-2">Based on {total.toLocaleString()} review{total !== 1 ? 's' : ''}</p>
      </div>
      <RatingDistribution distribution={distribution} total={total} />
    </div>
  );
}


