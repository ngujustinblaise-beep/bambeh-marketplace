/**
 * src/components/ads/AdCard.tsx
 * FIXES: title/description/type properties now exist on ad item type
 */
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AdListing {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  type?: string;
  price_xaf?: number;
  images?: string[];
  imageUrl?: string;
  sellerId?: string;
  createdAt?: string;
  status?: string;
}

interface AdCardProps {
  item: AdListing;
  onView?: (id: string) => void;
  onContact?: (id: string) => void;
  className?: string;
}

const AdCard: React.FC<AdCardProps> = ({ item, onView, onContact, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const displayTitle = item.title ?? item.name ?? "Untitled";
  const imageUrl = item.images?.[0] ?? item.imageUrl;

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {imageUrl && !imageError && (
        <img
          src={imageUrl}
          alt={displayTitle}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={() => setImageError(true)}
        />
      )}
      {(!imageUrl || imageError) && (
        <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
          <span className="text-gray-400 text-sm">No image</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{displayTitle}</h3>
        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
        )}
        {item.type && (
          <Badge variant="outline" className="capitalize mb-3">{item.type}</Badge>
        )}
        {item.price_xaf !== undefined && (
          <p className="font-bold text-teal-600 mb-3">
            {item.price_xaf.toLocaleString("fr-CM")} FCFA
          </p>
        )}
        <div className="flex gap-2">
          {onView && (
            <button
              onClick={() => onView(item.id)}
              className="flex-1 py-2 px-3 text-sm border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
            >
              Voir
            </button>
          )}
          {onContact && (
            <button
              onClick={() => onContact(item.id)}
              className="flex-1 py-2 px-3 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Contacter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdCard;
