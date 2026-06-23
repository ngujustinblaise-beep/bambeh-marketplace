/**
 * src/components/items/ItemCard.tsx
 * Bambeh Marketplace — Listing Item Card
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import { Heart, MapPin, Star, ShieldCheck, Zap, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MarketplaceItem } from "@/types/src_types_items";

interface ItemCardProps {
  item: MarketplaceItem;
  variant?: "grid" | "list" | "compact";
  onFavoriteToggle?: (itemId: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  showSeller?: boolean;
  className?: string;
}

function formatXAF(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M FCFA`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k FCFA`;
  return `${n.toLocaleString("fr-CM")} FCFA`;
}

const CONDITION_LABELS: Record<string, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon état",
  fair: "État correct",
  poor: "À réparer",
};

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  variant = "grid",
  onFavoriteToggle,
  isFavorite = false,
  showSeller = false,
  className = "",
}) => {
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState(isFavorite);
  const [imgError, setImgError] = useState(false);

  const mainImage = item.images.find((img) => img.isMain) ?? item.images[0];
  const imageUrl = imgError ? null : mainImage?.url;

  const handleClick = useCallback(() => {
    navigate(`/marketplace/${item.id}`);
  }, [navigate, item.id]);

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const next = !favorited;
      setFavorited(next);
      onFavoriteToggle?.(item.id, next);
    },
    [favorited, item.id, onFavoriteToggle]
  );

  if (variant === "list") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-full flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-teal-300 hover:shadow-sm transition-all text-left ${className}`}
      >
        {/* Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
          <p className="text-base font-bold text-teal-700 mt-0.5">{formatXAF(item.priceXAF)}</p>
          <div className="flex items-center gap-2 mt-1">
            {item.isNegotiable && (
              <span className="text-xs text-green-600 font-medium">Négociable</span>
            )}
            <span className="text-xs text-gray-400">{CONDITION_LABELS[item.condition] ?? item.condition}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">{item.location.city}</span>
            <span className="text-xs text-gray-300 mx-1">·</span>
            <Eye className="w-3 h-3 text-gray-300" />
            <span className="text-xs text-gray-400">{item.viewCount}</span>
          </div>
        </div>

        {/* Favorite */}
        <button
          type="button"
          onClick={handleFavorite}
          className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              favorited ? "text-red-500 fill-red-500" : "text-gray-300"
            }`}
          />
        </button>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`block bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-teal-300 hover:shadow-sm transition-all text-left ${className}`}
      >
        <div className="h-24 bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📦</div>
          )}
        </div>
        <div className="p-2">
          <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.title}</p>
          <p className="text-sm font-bold text-teal-700">{formatXAF(item.priceXAF)}</p>
        </div>
      </button>
    );
  }

  // Default: grid variant
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-teal-300 hover:shadow-md transition-all cursor-pointer ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={`Voir ${item.title}`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isFeatured && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold shadow-sm">
              <Zap className="w-3 h-3" />
              Mis en avant
            </span>
          )}
          {item.isSponsored && (
            <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium shadow-sm">
              Sponsorisé
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={handleFavorite}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? "text-red-500 fill-red-500" : "text-gray-400"
            }`}
          />
        </button>

        {/* Status badge */}
        {item.status !== "active" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold text-sm px-3 py-1 rounded-full">
              {item.status === "sold" ? "Vendu" : item.status === "reserved" ? "Réservé" : item.status}
            </span>
          </div>
        )}

        {/* Image count */}
        {item.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
            {item.images.length}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-snug">
          {item.title}
        </p>

        <div className="flex items-center justify-between mb-2">
          <p className="text-base font-bold text-teal-700">{formatXAF(item.priceXAF)}</p>
          {item.isNegotiable && (
            <span className="text-xs text-green-600 font-medium">Négociable</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
            {CONDITION_LABELS[item.condition] ?? item.condition}
          </span>
          <div className="flex items-center gap-0.5 flex-1 min-w-0">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{item.location.city}</span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Eye className="w-3 h-3" />
            <span>{item.viewCount}</span>
          </div>
        </div>

        {showSeller && item.seller && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
            <div className="w-5 h-5 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center">
              {item.seller.avatarUrl ? (
                <img src={item.seller.avatarUrl} alt={item.seller.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-teal-600 text-xs font-bold">{item.seller.displayName.charAt(0)}</span>
              )}
            </div>
            <span className="text-xs text-gray-500 truncate">{item.seller.displayName}</span>
            {item.seller.isVerified && <ShieldCheck className="w-3 h-3 text-teal-500 flex-shrink-0" />}
            {item.seller.rating > 0 && (
              <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-gray-500">{item.seller.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;




