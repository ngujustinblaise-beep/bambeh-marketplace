/**
 * REVIEW SYSTEM COMPONENT
 * FILE LOCATION: src/components/reviews/ReviewSystem.tsx
 */

import { Input } from '@/components/ui/input';
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, MoreVertical, Edit, Trash2, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Review {
  id: string; userId: string; userName: string; userAvatar?: string;
  rating: number; title: string; comment: string;
  createdAt: Date; updatedAt?: Date;
  helpful: number; notHelpful: number; verified: boolean;
  images?: string[];
  response?: { text: string; date: Date; responderName: string };
}

interface RatingDistribution { 5: number; 4: number; 3: number; 2: number; 1: number; }

interface ReviewSystemProps {
  itemId: string; itemType: 'product' | 'service' | 'property' | 'job';
  currentUserId?: string; currentUserName?: string; currentUserAvatar?: string;
  averageRating?: number; totalReviews?: number;
  onReviewSubmit?: (review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'notHelpful'>) => Promise<void>;
  onReviewUpdate?: (reviewId: string, updates: Partial<Review>) => Promise<void>;
  onReviewDelete?: (reviewId: string) => Promise<void>;
  canReview?: boolean;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  itemId, itemType, currentUserId, currentUserName = 'Guest User', currentUserAvatar,
  averageRating: propAverageRating, totalReviews: propTotalReviews,
  onReviewSubmit, onReviewUpdate, onReviewDelete, canReview = true,
}) => {
  const [reviews, setReviews]               = useState<Review[]>([]);
  const [rating, setRating]                 = useState(0);
  const [hoverRating, setHoverRating]       = useState(0);
  const [reviewTitle, setReviewTitle]       = useState('');
  const [reviewComment, setReviewComment]   = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [sortBy, setSortBy]                 = useState<'recent' | 'helpful' | 'rating-high' | 'rating-low'>('recent');
  const [filterRating, setFilterRating]     = useState<number | 'all'>('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [averageRating, setAverageRating]   = useState(propAverageRating || 0);
  const [totalReviews, setTotalReviews]     = useState(propTotalReviews || 0);
  const { toast } = useToast();

  useEffect(() => { loadReviews(); }, [itemId, sortBy, filterRating]);

  const loadReviews = async () => {
    try {
      const mockReviews: Review[] = [
        {
          id: '1', userId: 'user1', userName: 'John Doe',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          rating: 5, title: 'Excellent product!',
          comment: 'This product exceeded my expectations. The quality is top-notch and delivery was fast. Highly recommended!',
          createdAt: new Date(Date.now() - 86400000 * 2), helpful: 12, notHelpful: 1, verified: true,
        },
        {
          id: '2', userId: 'user2', userName: 'Marie Nguema',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
          rating: 4, title: 'Very good quality',
          comment: 'Good product overall. Delivery took a bit longer than expected but the quality makes up for it.',
          createdAt: new Date(Date.now() - 86400000 * 5), helpful: 8, notHelpful: 2, verified: true,
        },
        {
          id: '3', userId: 'user3', userName: 'Paul Biya Jr.',
          rating: 3, title: 'Average experience',
          comment: 'Product is okay. Not quite what I expected from the photos. Could be better.',
          createdAt: new Date(Date.now() - 86400000 * 10), helpful: 4, notHelpful: 3, verified: false,
        },
      ];

      let filtered = [...mockReviews];
      if (filterRating !== 'all') { filtered = filtered.filter(r => r.rating === filterRating); }

      switch (sortBy) {
        case 'helpful':      filtered.sort((a, b) => b.helpful - a.helpful); break;
        case 'rating-high':  filtered.sort((a, b) => b.rating - a.rating);   break;
        case 'rating-low':   filtered.sort((a, b) => a.rating - b.rating);   break;
        default:             filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      setReviews(filtered);

      const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      mockReviews.forEach(r => { distribution[r.rating as keyof RatingDistribution]++; });
      setRatingDistribution(distribution);
      setTotalReviews(mockReviews.length);
      setAverageRating(mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) { toast({ title: 'Please select a rating', variant: 'destructive' }); return; }
    if (!reviewComment.trim()) { toast({ title: 'Please write a review', variant: 'destructive' }); return; }
    setIsSubmitting(true);
    try {
      const newReview: Review = {
        id: `review-${Date.now()}`, userId: currentUserId || 'guest',
        userName: currentUserName, userAvatar: currentUserAvatar,
        rating, title: reviewTitle, comment: reviewComment,
        createdAt: new Date(), helpful: 0, notHelpful: 0, verified: false,
      };
      if (onReviewSubmit) {
        await onReviewSubmit({ userId: newReview.userId, userName: newReview.userName, userAvatar: newReview.userAvatar, rating, title: reviewTitle, comment: reviewComment, verified: false });
      }
      setReviews(prev => [newReview, ...prev]);
      setRating(0); setReviewTitle(''); setReviewComment(''); setShowReviewForm(false);
      toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
    } catch (error) {
      toast({ title: 'Error submitting review', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
  };

  const handleNotHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, notHelpful: r.notHelpful + 1 } : r));
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      if (onReviewDelete) { await onReviewDelete(reviewId); }
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast({ title: 'Review deleted' });
    } catch {
      toast({ title: 'Error deleting review', variant: 'destructive' });
    }
  };

  const renderStars = (count: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i}
          className={`${interactive ? 'w-8 h-8 cursor-pointer' : 'w-4 h-4'} transition-colors ${
            i <= (interactive ? (hoverRating || rating) : count) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
          onClick={interactive ? () => setRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader><CardTitle>Customer Reviews</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
              {renderStars(averageRating)}
              <p className="text-gray-600 mt-2">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratingDistribution[stars as keyof RatingDistribution];
                const pct   = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium">{stars}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    </div>
                    <Progress value={pct} className="flex-1 h-2" />
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {canReview && !showReviewForm && (
            <Button onClick={() => setShowReviewForm(true)} className="mt-6 bg-teal-600 hover:bg-teal-700">Write a Review</Button>
          )}
        </CardContent>
      </Card>

      {/* Write review form */}
      {showReviewForm && canReview && (
        <Card>
          <CardHeader><CardTitle>Write Your Review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
              {renderStars(rating, true)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input placeholder="Summary of your experience" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review *</label>
              <Textarea placeholder="Share your detailed experience..." rows={5} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
              <Button onClick={handleSubmitReview} disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
            <SelectItem value="rating-high">Highest Rating</SelectItem>
            <SelectItem value="rating-low">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(filterRating)} onValueChange={(v) => setFilterRating(v === 'all' ? 'all' : Number(v))}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5, 4, 3, 2, 1].map(r => <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={review.userAvatar} alt={review.userName} />
                  <AvatarFallback>{review.userName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{review.userName}</span>
                        {review.verified && <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    {review.userId === currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingReviewId(review.id)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteReview(review.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {review.title && <h4 className="font-semibold mt-2">{review.title}</h4>}
                  <p className="text-gray-700 mt-1">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">{review.createdAt.toLocaleDateString()}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-500">Helpful?</span>
                    <button onClick={() => handleHelpful(review.id)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-teal-600">
                      <ThumbsUp className="w-4 h-4" />{review.helpful}
                    </button>
                    <button onClick={() => handleNotHelpful(review.id)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
                      <ThumbsDown className="w-4 h-4" />{review.notHelpful}
                    </button>
                  </div>
                  {review.response && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3 border-l-4 border-teal-500">
                      <p className="text-sm font-semibold text-teal-700 mb-1">Response from {review.response.responderName}</p>
                      <p className="text-sm text-gray-700">{review.response.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {reviews.length === 0 && (
          <div className="text-center py-12 text-gray-500">No reviews yet. Be the first to review!</div>
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
