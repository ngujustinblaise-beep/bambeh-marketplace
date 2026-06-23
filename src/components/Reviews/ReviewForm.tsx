// @ts-nocheck
/**
 * REVIEW FORM COMPONENT
 * FILE LOCATION: src/components/reviews/ReviewForm.tsx
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RatingSelector } from './StarRating';
import { StarRating as StarRatingType, ReviewFormData, REVIEW_LIMITS } from '@/types/reviews';
import { ItemType } from '@/types/items';

interface ReviewFormProps {
  itemId: string; itemType: ItemType; itemTitle?: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
  existingReview?: { rating: StarRatingType; comment: string };
  className?: string;
}

export default function ReviewForm({ itemId, itemType, itemTitle, onSubmit, onCancel, existingReview, className = '' }: ReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating]               = useState<StarRatingType | 0>(existingReview?.rating || 0);
  const [comment, setComment]             = useState(existingReview?.comment || '');
  const [images, setImages]               = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [error, setError]                 = useState<string>('');
  const [success, setSuccess]             = useState(false);
  const [ratingError, setRatingError]     = useState('');
  const [commentError, setCommentError]   = useState('');

  const characterCount = comment.length;
  const characterLimit = REVIEW_LIMITS.MAX_COMMENT_LENGTH;
  const isOverLimit    = characterCount > characterLimit;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > REVIEW_LIMITS.MAX_IMAGES) {
      setError(`You can only upload up to ${REVIEW_LIMITS.MAX_IMAGES} images`);
      return;
    }
    const validFiles = files.filter(file => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > REVIEW_LIMITS.MAX_IMAGE_SIZE_MB) {
        setError(`Image "${file.name}" is too large. Maximum size is ${REVIEW_LIMITS.MAX_IMAGE_SIZE_MB}MB`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;
    setImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setError('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setRatingError(''); setCommentError(''); setError('');
    if (rating === 0) { setRatingError(t('reviews.errors.ratingRequired')); isValid = false; }
    if (comment.trim().length < REVIEW_LIMITS.MIN_COMMENT_LENGTH) {
      setCommentError(t('reviews.errors.commentTooShort', { min: REVIEW_LIMITS.MIN_COMMENT_LENGTH }));
      isValid = false;
    }
    if (comment.length > REVIEW_LIMITS.MAX_COMMENT_LENGTH) {
      setCommentError(t('reviews.errors.commentTooLong', { max: REVIEW_LIMITS.MAX_COMMENT_LENGTH }));
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setError('');
    try {
      const formData: ReviewFormData = { itemId, itemType, rating: rating as StarRatingType, comment: comment.trim(), images: images.length > 0 ? images : undefined };
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => { setRating(0); setComment(''); setImages([]); setImagePreviews([]); setSuccess(false); }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reviews.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {itemTitle && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('reviews.writeReview')}</h3>
          <p className="text-sm text-gray-600 mt-1">{t('reviews.reviewingItem')}: <span className="font-medium">{itemTitle}</span></p>
        </div>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{t('reviews.success.submitted')}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div>
        <RatingSelector value={rating} onChange={setRating} required error={ratingError} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">{t('reviews.yourReview')} <span className="text-red-500">*</span></Label>
        <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('reviews.commentPlaceholder')} rows={5} className={`resize-none ${commentError ? 'border-red-500' : ''}`} />
        <div className="flex justify-between items-center text-sm">
          <span className={commentError ? 'text-red-500' : 'text-gray-500'}>{commentError || `${t('reviews.minLength')}: ${REVIEW_LIMITS.MIN_COMMENT_LENGTH} ${t('reviews.characters')}`}</span>
          <span className={isOverLimit ? 'text-red-500 font-semibold' : 'text-gray-500'}>{characterCount} / {characterLimit}</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="images">{t('reviews.addPhotos')} ({t('reviews.optional')})</Label>
        <p className="text-sm text-gray-600">{t('reviews.photoHelp', { max: REVIEW_LIMITS.MAX_IMAGES })}</p>
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-300" />
                <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < REVIEW_LIMITS.MAX_IMAGES && (
          <div>
            <input type="file" id="images" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            <label htmlFor="images" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4" /><span className="text-sm font-medium">{t('reviews.uploadPhotos')}</span>
            </label>
          </div>
        )}
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">{t('reviews.guidelines.title')}</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>{t('reviews.guidelines.honest')}</li>
          <li>{t('reviews.guidelines.specific')}</li>
          <li>{t('reviews.guidelines.respectful')}</li>
          <li>{t('reviews.guidelines.relevant')}</li>
        </ul>
      </div>
      <div className="flex gap-3 pt-4 border-t">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">{t('common.cancel')}</Button>}
        <Button type="submit" disabled={isSubmitting || isOverLimit} className="flex-1 bg-teal-600 hover:bg-teal-700">
          {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('reviews.submitting')}</>) : t('reviews.submitReview')}
        </Button>
      </div>
    </form>
  );
}

interface ReviewEditFormProps {
  reviewId: string; itemId: string; itemType: ItemType;
  currentRating: StarRatingType; currentComment: string;
  onUpdate: (reviewId: string, data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
}

export function ReviewEditForm({ reviewId, itemId, itemType, currentRating, currentComment, onUpdate, onCancel }: ReviewEditFormProps) {
  const handleSubmit = async (data: ReviewFormData) => {
    await onUpdate(reviewId, data);
  };
  return (
    <ReviewForm itemId={itemId} itemType={itemType} existingReview={{ rating: currentRating, comment: currentComment }} onSubmit={handleSubmit} onCancel={onCancel} />
  );
}






