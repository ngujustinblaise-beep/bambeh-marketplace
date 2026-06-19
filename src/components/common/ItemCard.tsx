// @ts-nocheck
/**
 * ItemCard.tsx â€” Military Grade Item Display Component
 * FILE LOCATION: src/components/common/ItemCard.tsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Heart, Share2, MessageCircle, Star, Clock, Building, Home, Briefcase, Lock, Crown, Tag } from 'lucide-react';
import { AnyItem } from '@/types/items';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useFavorites } from '@/hooks/useFavorites';
import { formatCurrency } from '@/utils/currency';
import { formatDistanceToNow } from 'date-fns';

interface ItemCardProps {
  item: AnyItem;
  onContact?: (item: AnyItem) => void;
  onShare?: (item: AnyItem) => void;
  variant?: 'grid' | 'list';
  showActions?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onContact, onShare, variant = 'grid', showActions = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const subscriptionCtx = useSubscription();
  const subscription = (subscriptionCtx as any).subscription;
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);

  const isPremiumUser    = subscription?.tier === 'premium' || subscription?.tier === 'gold';
  const isJobItem        = item.type === 'job';
  const isMarketplaceItem = item.type === 'marketplace';
  const isRentalItem     = item.type === 'rental';
  const isServiceItem    = item.type === 'service';

  const getItemPrice = (): string => {
    if (isMarketplaceItem && (item as any).price) {
      return formatCurrency((item as any).price, (item as any).currency || 'XAF');
    }
    if (isRentalItem && (item as any).pricing) {
      const p = (item as any).pricing;
      return `${formatCurrency(p.amount, p.currency || 'XAF')}/${p.unit}`;
    }
    if (isServiceItem && (item as any).pricing) {
      const p = (item as any).pricing;
      if (p.type === 'fixed') return formatCurrency(p.amount, p.currency || 'XAF');
      if (p.type === 'hourly') return `${formatCurrency(p.amount, p.currency || 'XAF')}/hr`;
      if (p.type === 'range') return `${formatCurrency(p.min || 0, p.currency || 'XAF')} - ${formatCurrency(p.max || 0, p.currency || 'XAF')}`;
    }
    if (isJobItem && (item as any).salary) {
      const s = (item as any).salary;
      return `${formatCurrency(s.min, s.currency || 'XAF')} - ${formatCurrency(s.max, s.currency || 'XAF')}`;
    }
    return t('price_on_request');
  };

  const getItemImage = (): string => {
    if (imageError) return '/placeholder-item.jpg';
    if ((item as any).images?.length > 0) return (item as any).images[0];
    if ((item as any).image) return (item as any).image;
    return '/placeholder-item.jpg';
  };

  const getItemRating      = () => (item as any).averageRating || (item as any).rating || 0;
  const getItemReviewCount = () => (item as any).reviewCount || (item as any).reviews?.length || 0;

  const getLocationDisplay = (): string => {
    if (!item.location) return t('location_not_specified');
    const loc = item.location;
    if (isPremiumUser) {
      return [loc.village, loc.subdivision, loc.division, loc.region].filter(Boolean).join(', ') || t('location_not_specified');
    }
    return [loc.division, loc.region].filter(Boolean).join(', ') || t('location_not_specified');
  };

  const handleContactClick = () => {
    if (!isPremiumUser && isMarketplaceItem) { navigate('/subscription'); return; }
    if (onContact) {
      onContact(item);
    } else {
      navigate(`/items/${item.id}`);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) { navigate('/login'); return; }
    if (isFavorite(item.id)) {
      await removeFavorite(item.id);
    } else {
      await addFavorite(item.id);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(item);
    } else if (navigator.share) {
      navigator.share({ title: item.title, text: item.description, url: `${window.location.origin}/items/${item.id}` });
    }
  };

  const handleCardClick = () => { navigate(`/items/${item.id}`); };

  // â”€â”€ GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (variant === 'grid') {
    return (
      <div onClick={handleCardClick}
        className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 cursor-pointer hover:shadow-xl overflow-hidden">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img src={getItemImage()} alt={item.title} onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {item.featured && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />{t('featured')}
              </span>
            )}
            {(item as any).condition && (
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">{(item as any).condition}</span>
            )}
          </div>
          {showActions && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleFavoriteClick}
                className={`p-2 rounded-full backdrop-blur-md transition-all ${isFavorite(item.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'}`}>
                <Heart className={`w-4 h-4 ${isFavorite(item.id) ? 'fill-current' : ''}`} />
              </button>
              <button onClick={handleShareClick}
                className="p-2 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:bg-blue-500 hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <div className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full border-2 border-blue-500 font-bold text-blue-600">{getItemPrice()}</div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          {getItemRating() > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(getItemRating()) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">({getItemReviewCount()})</span>
            </div>
          )}
          {(item as any).keywords?.slice(0, 3).map((kw: string, i: number) => (
            <span key={i} className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full mr-1 mb-2">{kw}</span>
          ))}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="truncate">{getLocationDisplay()}</span>
            {!isPremiumUser && <Lock className="w-3 h-3 text-gray-400" />}
          </div>
          <div className="space-y-2 mb-4">
            {isJobItem && (item as any).company && (
              <div className="flex items-center gap-2 text-sm text-gray-600"><Building className="w-4 h-4 text-blue-500" /><span>{(item as any).company}</span></div>
            )}
            {isRentalItem && (item as any).propertyType && (
              <div className="flex items-center gap-2 text-sm text-gray-600"><Home className="w-4 h-4 text-blue-500" /><span>{(item as any).propertyType}</span></div>
            )}
            {isMarketplaceItem && (item as any).category && (
              <div className="flex items-center gap-2 text-sm text-gray-600"><Tag className="w-4 h-4 text-blue-500" /><span>{(item as any).category}</span></div>
            )}
          </div>
          {item.createdAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <Clock className="w-3 h-3" /><span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleContactClick(); }}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${!isPremiumUser && isMarketplaceItem ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'}`}>
            {!isPremiumUser && isMarketplaceItem ? (
              <span className="flex items-center justify-center gap-2"><Lock className="w-4 h-4" />{t('upgrade_to_contact')}</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" />{t('contact_seller')}</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // â”€â”€ LIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div onClick={handleCardClick}
      className="group bg-white rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 cursor-pointer hover:shadow-lg overflow-hidden flex">
      <div className="relative w-48 h-48 bg-gray-100 flex-shrink-0">
        <img src={getItemImage()} alt={item.title} onError={() => setImageError(true)} className="w-full h-full object-cover" />
        {item.featured && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" />{t('featured')}
          </span>
        )}
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors flex-1">{item.title}</h3>
            {showActions && (
              <div className="flex gap-2 ml-4">
                <button onClick={handleFavoriteClick}
                  className={`p-2 rounded-full transition-all ${isFavorite(item.id) ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500'}`}>
                  <Heart className={`w-4 h-4 ${isFavorite(item.id) ? 'fill-current' : ''}`} />
                </button>
                <button onClick={handleShareClick} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="text-2xl font-bold text-blue-600">{getItemPrice()}</div>
            {getItemRating() > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{getItemRating().toFixed(1)}</span>
                <span className="text-sm text-gray-500">({getItemReviewCount()})</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-500" /><span>{getLocationDisplay()}</span>
            {!isPremiumUser && <Lock className="w-3 h-3 text-gray-400" />}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          {item.createdAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" /><span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleContactClick(); }}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${!isPremiumUser && isMarketplaceItem ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {!isPremiumUser && isMarketplaceItem ? (
              <span className="flex items-center gap-2"><Lock className="w-4 h-4" />{t('upgrade')}</span>
            ) : t('contact')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
