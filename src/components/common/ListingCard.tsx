// FILE: src/components/common/ListingCard.tsx
import { Heart, MapPin, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ListingCardProps {
  id: string;
  type: string;
  title: string;
  description: string;
  price?: number;
  priceUnit?: string;
  images: string[];
  location: { division: string; region: string };
  publisherTier: 'bronze' | 'silver' | 'gold' | 'free';
  views: number;
  favorites: number;
  createdAt: Date;
  category: string;
  onFavorite?: () => void;
}

export function ListingCard({
  id, type, title, description, price, priceUnit = 'XAF',
  images, location, publisherTier, views, favorites, createdAt, category, onFavorite,
}: ListingCardProps) {
  const tierColors = {
    bronze: 'border-amber-600 bg-amber-50',
    silver: 'border-gray-400 bg-gray-50',
    gold:   'border-yellow-500 bg-yellow-50',
    free:   'border-gray-300 bg-white',
  };
  const tierBadges = {
    bronze: 'bg-amber-600 text-white',
    silver: 'bg-gray-500 text-white',
    gold:   'bg-yellow-500 text-white',
    free:   'bg-gray-400 text-white',
  };

  const formatPrice = () => {
    if (!price) return null;
    return `${new Intl.NumberFormat('fr-FR').format(price)} ${priceUnit}`;
  };

  const getTypeLabel = () => {
    return ({ job: 'Job', item: 'Item', property: 'Property', service: 'Service' } as Record<string, string>)[type] || type;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${tierColors[publisherTier]} hover:shadow-xl transition-shadow duration-300`}>
      <Link to={`/${type}s/${id}`} className="block relative h-48 overflow-hidden bg-gray-200">
        {images.length > 0 ? (
          <img src={images[0]} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No image available</span>
          </div>
        )}
        {publisherTier !== 'free' && (
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${tierBadges[publisherTier]}`}>
            {publisherTier.toUpperCase()}
          </div>
        )}
        <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium">
          {getTypeLabel()}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/${type}s/${id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-teal-600 transition line-clamp-2">{title}</h3>
        </Link>
        <p className="text-sm text-teal-600 font-medium mb-2">{category}</p>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{location.division}, {location.region}</span>
        </div>
        {price && (
          <div className="mb-3">
            <span className="text-2xl font-bold text-teal-600">{formatPrice()}</span>
            {type === 'job' && <span className="text-sm text-gray-500 ml-1">/month</span>}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1"><Eye className="h-4 w-4" /><span>{views}</span></div>
            <div className="flex items-center gap-1"><Heart className="h-4 w-4" /><span>{favorites}</span></div>
          </div>
          {onFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onFavorite(); }}
              className="p-2 rounded-full hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition"
              aria-label="Add to favorites"
            >
              <Heart className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-400 mt-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>Posted {formatDistanceToNow(createdAt, { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
}
