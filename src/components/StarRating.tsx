/**
 * src/components/StarRating.tsx
 * Bambeh Marketplace — Star Rating Component
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showValue?: boolean;
  reviewCount?: number;
  onChange?: (rating: number) => void;
  className?: string;
}

const SIZE_MAP = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const TEXT_SIZE_MAP = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  size = "md",
  readOnly = true,
  showValue = false,
  reviewCount,
  onChange,
  className = "",
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered ?? value;

  const handleClick = useCallback(
    (rating: number) => {
      if (!readOnly && onChange) {
        onChange(rating);
      }
    },
    [readOnly, onChange]
  );

  const handleMouseEnter = useCallback(
    (rating: number) => {
      if (!readOnly) {
        setHovered(rating);
      }
    },
    [readOnly]
  );

  const handleMouseLeave = useCallback(() => {
    if (!readOnly) {
      setHovered(null);
    }
  }, [readOnly]);

  const getStarFill = (index: number): "full" | "half" | "empty" => {
    const starValue = index + 1;
    if (displayValue >= starValue) return "full";
    if (displayValue >= starValue - 0.5) return "half";
    return "empty";
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
        role={readOnly ? "img" : "group"}
        aria-label={`Rating: ${value} out of ${max}`}
      >
        {Array.from({ length: max }).map((_, idx) => {
          const fill = getStarFill(idx);

          return (
            <button
              key={idx}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(idx + 1)}
              onMouseEnter={() => handleMouseEnter(idx + 1)}
              className={`
                ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}
                focus:outline-none disabled:pointer-events-none
              `}
              aria-label={`${idx + 1} star${idx !== 0 ? "s" : ""}`}
            >
              <Star
                className={`
                  ${SIZE_MAP[size]}
                  ${fill === "full" ? "text-yellow-400 fill-yellow-400" : ""}
                  ${fill === "half" ? "text-yellow-400 fill-yellow-200" : ""}
                  ${fill === "empty" ? "text-gray-300 fill-gray-100" : ""}
                  transition-colors
                `}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={`font-semibold text-gray-700 ${TEXT_SIZE_MAP[size]}`}>
          {value.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={`text-gray-500 ${TEXT_SIZE_MAP[size]}`}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default StarRating;


