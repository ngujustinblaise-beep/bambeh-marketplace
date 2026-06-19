/**
 * Review and Rating System Type Definitions
 */

export type ReviewCategory =
  | "property"
  | "vendor"
  | "service"
  | "job"
  | "platform";

export type ReviewSubject =
  | "rental-property"
  | "sale-property"
  | "marketplace-vendor"
  | "marketplace-product"
  | "service-provider"
  | "job-posting"
  | "employer"
  | "platform-experience";

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userVerified: boolean;

  // What is being reviewed
  subjectId: string; // ID of property, vendor, service, etc.,
  subjectType: ReviewSubject;
  category: ReviewCategory;

  // Rating
  overallRating: number; // 1-5 stars,
  categoryRatings?: {
    [key: string]: number; // Specific category ratings
  };

  // Review content
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[]; // URLs to review images

  // Metadata
  transactionId?: string; // Link to actual transaction,
  verifiedPurchase: boolean; // Did they actually use this service/buy product?,
  createdAt: string;
  updatedAt?: string;

  // Engagement
  helpfulCount: number; // How many found this helpful,
  reportCount: number; // How many reported as inappropriate

  // Status
  status: "pending" | "approved" | "rejected" | "flagged";
  moderationNotes?: string;

  // Response from owner/vendor
  response?: {
    text: string;
    respondedAt: string;
    responderName: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedReviewsCount: number;
  responseRate: number; // Percentage of reviews that got responses,
  averageResponseTime?: number; // In hours
}

export interface ReviewFormData {
  subjectId: string;
  subjectType: ReviewSubject;
  overallRating: number;
  categoryRatings?: {
    [key: string]: number;
  };
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: File[];
  transactionId?: string;
}

export interface ReviewFilters {
  minRating?: number;
  maxRating?: number;
  verifiedOnly?: boolean;
  withImages?: boolean;
  withResponse?: boolean;
  sortBy?: "recent" | "helpful" | "rating-high" | "rating-low";
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Category-specific rating criteria
 */

export const PropertyRatingCriteria = {
  accuracy: "Accuracy of listing",
  communication: "Landlord communication",
  location: "Location quality",
  value: "Value for money",
  condition: "Property condition",
};

export const VendorRatingCriteria = {
  quality: "Product quality",
  delivery: "Delivery speed",
  service: "Customer service",
  value: "Value for money",
  accuracy: "Description accuracy",
};

export const ServiceRatingCriteria = {
  quality: "Service quality",
  professionalism: "Professionalism",
  punctuality: "Punctuality",
  communication: "Communication",
  value: "Value for money",
};

export const JobRatingCriteria = {
  accuracy: "Job description accuracy",
  communication: "Employer communication",
  environment: "Work environment",
  payment: "Payment reliability",
  treatment: "Professional treatment",
};

/**
 * Get rating criteria for a review subject
 */
export function getRatingCriteria(subjectType: ReviewSubject): {
  [key: string]: string;
} {
  switch (subjectType) {
    case "rental-property":
    case "sale-property":
      return PropertyRatingCriteria;

    case "marketplace-vendor":
    case "marketplace-product":
      return VendorRatingCriteria;

    case "service-provider":
      return ServiceRatingCriteria;

    case "job-posting":
    case "employer":
      return JobRatingCriteria;

    default:
      return {};
  }
}

/**
 * Ranking algorithm weights
 */
export const RankingWeights = {
  averageRating: 0.6, // 60% weight on rating,
  reviewCount: 0.2, // 20% weight on number of reviews,
  responseRate: 0.1, // 10% weight on response rate,
  verificationStatus: 0.1, // 10% weight on verification
};

/**
 * Calculate ranking score for sorting
 */
export function calculateRankingScore(
  averageRating: number,
  reviewCount: number,
  responseRate: number,
  isVerified: boolean,
  isTrusted: boolean,
): number {
  // Normalize review count (cap at 100 for calculation)
  const normalizedReviewCount = Math.min(reviewCount / 100, 1);

  // Normalize response rate (0-1)
  const normalizedResponseRate = responseRate / 100;

  // Verification bonus
  let verificationBonus = 0;
  if (isVerified) verificationBonus += 0.5;
  if (isTrusted) verificationBonus += 0.5;

  // Calculate weighted score
  const score =
    (averageRating / 5) * RankingWeights.averageRating +
    normalizedReviewCount * RankingWeights.reviewCount +
    normalizedResponseRate * RankingWeights.responseRate +
    verificationBonus * RankingWeights.verificationStatus;

  return score * 100; // Return score out of 100
}

/**
 * Minimum requirements for ranking/featuring
 */
export const RankingRequirements = {
  minimumReviews: 3,
  minimumRating: 3.0,
  minimumResponseRate: 50, // percentage,
  recencyWeightDays: 90, // Recent reviews weighted more heavily
};
