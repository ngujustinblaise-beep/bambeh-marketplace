/**
 * src/components/listings/DemoBadge.tsx
 * Shared yellow DEMO badge used on all sample/placeholder listing cards.
 *
 * Usage:
 *   <div className="relative">
 *     <img ... />
 *     {product.isDemo && <DemoBadge />}
 *   </div>
 *
 * The parent must have `position: relative` (className="relative")
 * so the badge positions correctly in the top-left corner.
 */

import React from "react";

interface DemoBadgeProps {
  label?: string;
}

export function DemoBadge({ label = "DEMO" }: DemoBadgeProps) {
  return (
    <span
      className="absolute top-2 left-2 z-10 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
      aria-label="This is a demo/sample item"
    >
      {label}
    </span>
  );
}

export default DemoBadge;
