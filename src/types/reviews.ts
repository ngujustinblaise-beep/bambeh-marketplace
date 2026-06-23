export type StarRating = 1 | 2 | 3 | 4 | 5;

export interface ReviewFormData {
  rating: StarRating;
  comment: string;
  title?: string;
  images?: string[];
  itemId?: string;
}

export const REVIEW_LIMITS = {
  minComment:         10,
  maxComment:         1000,
  maxTitle:           100,
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 1000,
  MAX_IMAGES:         5,
  MAX_IMAGE_SIZE_MB:  5,
} as const;

export interface ReviewFilters {
  rating?:   StarRating;
  verified?: boolean;
  sortBy?:   "newest" | "oldest" | "highest" | "lowest" | "helpful";
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: StarRating;
  comment: string;
  title?: string;
  images?: string[];
  verified?: boolean;
  likedBy: string[];
  dislikedBy: string[];
  helpfulCount?: number;
  notHelpfulCount?: number;
  createdAt: string;
}

export interface ReviewWithResponse extends Review {
  vendorResponse?: {
    comment: string;
    text?: string;
    respondedAt: string;
  };
  response?: {
    comment: string;
    text?: string;
    respondedAt: string;
  };
}

export type ReviewStatus = "all" | "replied" | "pending" | "flagged";

