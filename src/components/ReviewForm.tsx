// @ts-nocheck
import React, { useState } from "react";

interface ReviewFormProps {
  propertyId?: string;
  onSubmit?: (data: { rating: number; comment: string }) => void;
  onClose?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onClose }) => {
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit?.({ rating, comment });
    onClose?.();
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Leave a Review</h2>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} onClick={() => setRating(s)}
            className={`text-2xl ${s <= rating ? "text-yellow-400" : "text-gray-300"}`}>
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="w-full border rounded p-2 min-h-[100px]"
        placeholder="Share your experience..."
      />
      <button onClick={handleSubmit}
        className="mt-3 bg-teal-600 text-white px-4 py-2 rounded w-full">
        Submit Review
      </button>
    </div>
  );
};

export default ReviewForm;


