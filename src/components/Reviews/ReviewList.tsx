// @ts-nocheck
/**
 * REVIEW LIST COMPONENT
 * FILE LOCATION: src/components/reviews/ReviewList.tsx
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, ThumbsDown, Flag, ChevronDown, CheckCircle, MessageSquare, MoreVertical, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';
import { Review, ReviewFilters, ReviewWithResponse } from '@/types/reviews';
import { formatDistanceToNow } from 'date-fns';

interface ReviewListProps {
  itemId: string; reviews: ReviewWithResponse[];
  currentUserId?: string; onLoadMore?: () => void;
  hasMore?: boolean; isLoading?: boolean;
  onLike?: (reviewId: string) => void; onUnlike?: (reviewId: string) => void;
  onDislike?: (reviewId: string) => void; onUndislike?: (reviewId: string) => void;
  onReport?: (reviewId: string, reason: string) => void;
  onEdit?: (review: Review) => void; onDelete?: (reviewId: string) => void;
  canModerate?: boolean; className?: string;
}

export default function ReviewList({
  itemId, reviews: initialReviews, currentUserId, onLoadMore,
  hasMore = false, isLoading = false, onLike, onUnlike, onDislike, onUndislike,
  onReport, onEdit, onDelete, canModerate = false, className = '',
}: ReviewListProps) {
  const { t } = useTranslation();
  const [reviews, setReviews]             = useState<ReviewWithResponse[]>(initialReviews);
  const [filters, setFilters]             = useState<ReviewFilters>({ sortBy: 'newest' });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  useEffect(() => { setReviews(initialReviews); }, [initialReviews]);

  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLike = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    if (review.likedBy?.includes(currentUserId || '')) {
      onUnlike?.(reviewId);
    } else {
      onLike?.(reviewId);
    }
  };

  const handleDislike = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    if (review.dislikedBy?.includes(currentUserId || '')) {
      onUndislike?.(reviewId);
    } else {
      onDislike?.(reviewId);
    }
  };

  const openImageViewer = (images: string[], startIndex: number) => {
    setSelectedImages(images);
    setImageViewerOpen(true);
  };

  if (reviews.length === 0 && !isLoading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('reviews.noReviews')}</h3>
        <p className="text-gray-600">{t('reviews.beFirst')}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
            <SelectItem value="most_helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(filters.rating || 'all')} onValueChange={(v) => handleFilterChange('rating', v === 'all' ? undefined : Number(v))}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter by rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5, 4, 3, 2, 1].map(r => <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const isOwner    = review.userId === currentUserId;
          const hasLiked   = review.likedBy?.includes(currentUserId || '');
          const hasDisliked = review.dislikedBy?.includes(currentUserId || '');
          return (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={review.userAvatar} alt={review.userName} />
                  <AvatarFallback>{review.userName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{review.userName}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={review.rating} readonly size="sm" />
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {(isOwner || canModerate) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isOwner && onEdit && <DropdownMenuItem onClick={() => onEdit(review)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>}
                          {(isOwner || canModerate) && onDelete && (
                            <DropdownMenuItem onClick={() => onDelete(review.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {(review as any).title && <h4 className="font-semibold text-gray-900 mt-2">{(review as any).title}</h4>}
                  <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, idx) => (
                        <button key={idx} onClick={() => openImageViewer(review.images!, idx)}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80">
                          <img src={img} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-xs text-gray-500">Helpful?</span>
                    <button onClick={() => handleLike(review.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${hasLiked ? 'text-teal-600' : 'text-gray-500 hover:text-teal-600'}`}>
                      <ThumbsUp className="w-4 h-4" />{review.helpfulCount || 0}
                    </button>
                    <button onClick={() => handleDislike(review.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${hasDisliked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}>
                      <ThumbsDown className="w-4 h-4" />{review.notHelpfulCount || 0}
                    </button>
                    {onReport && (
                      <button onClick={() => onReport(review.id, 'inappropriate')}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-600 transition-colors ml-auto">
                        <Flag className="w-4 h-4" />Report
                      </button>
                    )}
                  </div>

                  {review.response && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-teal-500">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-semibold text-teal-700">Seller Response</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(review.response.respondedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{review.response.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" />
        </div>
      )}

      {hasMore && !isLoading && onLoadMore && (
        <Button variant="outline" onClick={onLoadMore} className="w-full flex items-center gap-2">
          <ChevronDown className="w-4 h-4" />Load More Reviews
        </Button>
      )}
    </div>
  );
}






