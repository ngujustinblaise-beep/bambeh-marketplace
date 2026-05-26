import React, { useState } from "react";
import ReactStars from "react-rating-stars-component";
import "./ReviewCard.css";

const ReviewCard = ({ review, currentUserId, onMarkHelpful }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(
    review.likedBy?.includes(currentUserId) || false,
  );

  const handleHelpful = async () => {
    try {
      const newLikedState = await onMarkHelpful(review.id);
      setIsLiked(newLikedState);
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
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
              {review.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="reviewer-name">
              {review.userName}
              {review.verified && (
                <span className="verified-badge" title="Verified Purchase">
                  ✓
                </span>
              )}
            </div>
            <div className="review-date">{formatDate(review.createdAt)}</div>
          </div>
        </div>
        <ReactStars
          count={5}
          value={review.rating}
          size={20}
          edit={false}
          activeColor="#ffd700"
        />
      </div>

      {review.title && <h4 className="review-title">{review.title}</h4>}

      <div
        className={`review-content ${isExpanded ? "expanded" : "collapsed"}`}
      >
        {review.comment}
      </div>

      {review.comment.length > 200 && (
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
            />
          ))}
        </div>
      )}

      <div className="review-actions">
        <button
          className={`helpful-btn ${isLiked ? "liked" : ""}`}
          onClick={handleHelpful}
        >
          <span className="thumbs-up-icon">👍</span>
          Helpful ({review.helpful})
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
