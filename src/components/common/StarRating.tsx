/**
 * STAR RATING (RatingStars variant)
 * FILE LOCATION: src/components/common/StarRating.tsx
 */

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; maxRating?: number; size?: 'sm' | 'md' | 'lg';
  readonly?: boolean; showNumber?: boolean; onChange?: (rating: number) => void; className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating, maxRating = 5, size = 'md', readonly = true, showNumber = true, onChange, className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[...Array(maxRating)].map((_, index) => {
          const starValue    = index + 1;
          const isFilled     = starValue <= displayRating;
          const isHalfFilled = !Number.isInteger(displayRating) && starValue === Math.ceil(displayRating) && starValue > displayRating;
          return (
            <button key={index} type="button" disabled={readonly}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}>
              {isHalfFilled ? (
                <div className="relative">
                  <Star className={`${sizeClasses[size]} text-gray-300`} />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`} />
                  </div>
                </div>
              ) : (
                <Star className={`${sizeClasses[size]} ${isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              )}
            </button>
          );
        })}
      </div>
      {showNumber && <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>}
    </div>
  );
};

export default RatingStars;

interface CompactRatingProps { rating: number; reviewCount?: number; size?: 'sm' | 'md'; className?: string; }

export const CompactRating: React.FC<CompactRatingProps> = ({ rating, reviewCount, size = 'sm', className = '' }) => {
  const sizeClasses = { sm: 'text-xs', md: 'text-sm' };
  const starSize    = { sm: 'h-3 w-3', md: 'h-4 w-4' };
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star className={`${starSize[size]} text-yellow-400 fill-yellow-400`} />
      <span className={`font-medium ${sizeClasses[size]}`}>{rating.toFixed(1)}</span>
      {reviewCount !== undefined && <span className={`text-gray-500 ${sizeClasses[size]}`}>({reviewCount})</span>}
    </div>
  );
};

interface RatingDistributionProps {
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  totalReviews: number; className?: string;
}

export const RatingDistribution: React.FC<RatingDistributionProps> = ({ distribution, totalReviews, className = '' }) => {
  const getPercentage = (count: number) => totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  return (
    <div className={`space-y-2 ${className}`}>
      {[5, 4, 3, 2, 1].map(stars => (
        <div key={stars} className="flex items-center gap-3">
          <div className="flex items-center gap-1 w-16">
            <span className="text-sm font-medium">{stars}</span>
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-yellow-400 h-full transition-all duration-300"
              style={{ width: `${getPercentage(distribution[stars as keyof typeof distribution])}%` }} />
          </div>
          <span className="text-sm text-gray-600 w-12 text-right">{distribution[stars as keyof typeof distribution]}</span>
        </div>
      ))}
    </div>
  );
};

interface CategoryRatingsProps {
  categories: { [key: string]: string };
  ratings: { [key: string]: number };
  readonly?: boolean;
  onChange?: (category: string, rating: number) => void;
  className?: string;
}

export const CategoryRatings: React.FC<CategoryRatingsProps> = ({ categories, ratings, readonly = true, onChange, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Object.entries(categories).map(([key, label]) => (
      <div key={key} className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex-1">{label}</label>
        <RatingStars rating={ratings[key] || 0} readonly={readonly} showNumber={false} size="sm" onChange={(value) => onChange?.(key, value)} />
      </div>
    ))}
  </div>
);
