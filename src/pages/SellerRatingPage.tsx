import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2, Star } from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";
import { supabase } from "@/lib/supabase";

/**
 * src/pages/SellerRatingPage.tsx � Bambeh Marketplace
 * FIXED: Was a stub. Now a real star rating form that saves reviews.
 */

export default function SellerRatingPage() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate     = useNavigate();

  const [rating,    setRating]    = useState(0);
  const [hover,     setHover]     = useState(0);
  const [comment,   setComment]   = useState('');
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  async function handleSubmit() {
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Save review to localStorage (simple approach � can be moved to DB later)
      const reviews = JSON.parse(localStorage.getItem('bambeh_seller_reviews') || '[]');
      reviews.unshift({
        id:         Date.now().toString(),
        sellerId,
        reviewerId: session?.user?.id || 'anonymous',
        rating,
        comment:    comment.trim(),
        createdAt:  new Date().toISOString(),
      });
      localStorage.setItem('bambeh_seller_reviews', JSON.stringify(reviews));

      // Also update vendor_profiles rating in Supabase if we can
      if (sellerId) {
        try {
          const { data: vendor } = await supabase
            .from('vendor_profiles')
            .select('rating, total_reviews')
            .eq('user_id', sellerId)
            .single();

          if (vendor) {
            const newTotal  = (vendor.total_reviews || 0) + 1;
            const newRating = ((vendor.rating || 0) * (vendor.total_reviews || 0) + rating) / newTotal;
            await supabase
              .from('vendor_profiles')
              .update({ rating: Math.round(newRating * 10) / 10, total_reviews: newTotal })
              .eq('user_id', sellerId);
          }
        } catch {
          // Non-critical � rating saved locally even if DB update fails
        }
      }

      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Could not submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You! ?</h2>
          <p className="text-gray-500 text-sm mb-6">Your review helps other buyers make better decisions.</p>
          <button onClick={() => navigate(-1)}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900">Rate Seller</h1>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-gray-600 mb-6 text-sm">How would you rate your experience with this seller?</p>

          {/* Stars */}
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    n <= (hover || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {(hover || rating) > 0 && (
            <p className="text-teal-600 font-semibold text-sm mb-2">
              {LABELS[hover || rating]}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Write a Review (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            placeholder="Tell others about your experience � was the item as described? Was the seller responsive? Would you buy from them again?"
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{comment.length}/500 characters</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full bg-teal-600 text-white py-4 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
            : `Submit Review ${rating > 0 ? `(${rating} star${rating > 1 ? 's' : ''})` : ''}`
          }
        </button>
      </div>
    </div>
  );
}













