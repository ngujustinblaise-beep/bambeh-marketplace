import React, { useState } from "react";
import { ThumbsUp, Star, CheckCircle } from "lucide-react";
import "./ReviewCard.css";

const ReviewCard = ({ review, currentUserId, onMarkHelpful }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(
    review.likedBy?.includes(currentUserId) || false,
  );
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);

  const handleHelpful = async () => {
    try {
      const newLikedState = await onMarkHelpful(review.id, currentUserId);
      setIsLiked(newLikedState);
      setHelpfulCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Just now";
    const reviewDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return reviewDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          {review.userAvatar ? (
            <img
              src={review.userAvatar}
              alt={review.userName}
              className="reviewer-avatar"
            />
          ) : (
            <div className="reviewer-avatar-placeholder">
              {review.userName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div className="reviewer-details">
            <div className="reviewer-name-row">
              <span className="reviewer-name">{review.userName}</span>
              {review.verified && (
                <div className="verified-badge" title="Verified Purchase">
                  <CheckCircle size={16} />
                </div>
              )}
            </div>
            <div className="review-date">{formatDate(review.createdAt)}</div>
          </div>
        </div>

        <div className="review-rating">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < review.rating ? "star-filled" : "star-empty"}
              fill={i < review.rating ? "#fbbf24" : "none"}
            />
          ))}
        </div>
      </div>

      {review.title && <h4 className="review-title">{review.title}</h4>}

      <div
        className={`review-content ${isExpanded ? "expanded" : "collapsed"}`}
      >
        {review.comment}
      </div>

      {review.comment && review.comment.length > 200 && (
        <button
          className="read-more-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}

      {review.images && review.images.length > 0 && (
        <div className="review-images">
          {review.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Review ${index + 1}`}
              className="review-image"
              loading="lazy"
            />
          ))}
        </div>
      )}

      <div className="review-actions">
        <button
          className={`helpful-btn ${isLiked ? "liked" : ""}`}
          onClick={handleHelpful}
        >
          <ThumbsUp size={16} />
          <span>Helpful ({helpfulCount})</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
