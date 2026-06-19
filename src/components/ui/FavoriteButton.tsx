/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * FAVORITE BUTTON - Toggle Favorites
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * 
 * âœ… Heart icon that fills when favorited
 * âœ… Click to add/remove from favorites
 * âœ… Persists across sessions
 * âœ… Shows in favorites page
 * 
 * FILE LOCATION: src/components/ui/FavoriteButton.tsx
 * 
 * Â© 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { 
  addToFavorites, 
  removeFromFavorites, 
  isFavorite, 
  FavoriteItem 
} from '@/utils/favoritesSystem';

interface FavoriteButtonProps {
  item: FavoriteItem;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({ 
  item,
  className = '',
  size = 'md'
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(item.id));
  }, [item.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent onClick
    e.preventDefault();

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (favorited) {
      if (removeFromFavorites(item.id)) {
        setFavorited(false);
    } else {
      if (addToFavorites(item)) {
        setFavorited(true);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={`p-2 hover:bg-gray-100 rounded-lg transition-all ${className} ${
        animating ? 'scale-125' : 'scale-100'
      }`}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`${sizeClasses[size]} transition-all duration-200 ${
          favorited 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-600 hover:text-red-500'
        }`}
      />
    </button>
  );

/* 
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
USAGE EXAMPLE IN DETAIL PAGES:
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import FavoriteButton from '@/components/ui/FavoriteButton';

// In header actions:
<div className="flex gap-2">
  <FavoriteButton
    item={{
      id: service.id,
      title: service.title,
      type: 'service',
      price: `${service.pricing.min} - ${service.pricing.max} XAF`,
      location: service.location,
      image: service.images[0],
      addedAt: new Date().toISOString(),
    }}
    size="md"
  />
  <SocialShareButton title={service.title} />
</div>

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
USAGE IN ITEM CARDS:
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

<FavoriteButton
  item={{
    id: item.id,
    title: item.title,
    type: 'marketplace',
    price: `${item.price} XAF`,
    location: item.location,
    image: item.images[0],
    addedAt: new Date().toISOString(),
  }}
  size="sm"
      className="absolute top-2 right-2"
/>

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
*/
}
}
}
