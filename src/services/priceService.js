// priceService.js - AI-Powered Smart Price Suggestions
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";

class PriceService {
  // Get smart price suggestion based on historical data
  async getSuggestedPrice(productData) {
    try {
      const { category, condition, location, title, description } = productData;

      // Get similar products
      const similarProducts = await this.findSimilarProducts(
        category,
        condition,
        location,
        title,
      );

      if (similarProducts.length === 0) {
        return this.getDefaultPriceSuggestion(category);
      }

      // Calculate statistics
      const prices = similarProducts.map((p) => p.price).filter((p) => p > 0);
      const stats = this.calculatePriceStatistics(prices);

      // Generate AI-powered recommendation
      const suggestion = {
        recommended: Math.round(stats.median),
        min: Math.round(stats.percentile25),
        max: Math.round(stats.percentile75),
        average: Math.round(stats.mean),
        confidence: this.calculateConfidence(
          similarProducts.length,
          stats.stdDev,
        ),
        insights: this.generateInsights(stats, similarProducts, productData),
        competitorCount: similarProducts.length,
      };

      return suggestion;
    } catch (error) {
      console.error("Error getting price suggestion:", error);
      return this.getDefaultPriceSuggestion(productData.category);
    }
  }

  // Find similar products in the marketplace
  async findSimilarProducts(category, condition, location, title) {
    try {
      let q = query(
        collection(db, "products"),
        where("category", "==", category),
        where("status", "==", "active"),
        orderBy("createdAt", "desc"),
        limit(50),
      );

      const snapshot = await getDocs(q);
      let products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by condition if specified
      if (condition) {
        products = products.filter((p) => p.condition === condition);
      }

      // Prioritize same location
      if (location) {
        products.sort((a, b) => {
          const aLocal = a.location === location ? 1 : 0;
          const bLocal = b.location === location ? 1 : 0;
          return bLocal - aLocal;
        });
      }

      // Calculate similarity score based on title
      if (title) {
        products = products
          .map((p) => ({
            ...p,
            similarity: this.calculateTextSimilarity(title, p.title),
          }))
          .sort((a, b) => b.similarity - a.similarity);
      }

      return products.slice(0, 20); // Top 20 most similar
    } catch (error) {
      console.error("Error finding similar products:", error);
      return [];
    }
  }

  // Calculate price statistics
  calculatePriceStatistics(prices) {
    if (prices.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        percentile25: 0,
        percentile75: 0,
      };
    }

    const sorted = [...prices].sort((a, b) => a - b);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Median
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

    // Standard deviation
    const variance =
      prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    // Percentiles
    const percentile25 = sorted[Math.floor(sorted.length * 0.25)];
    const percentile75 = sorted[Math.floor(sorted.length * 0.75)];

    return { mean, median, stdDev, percentile25, percentile75 };
  }

  // Calculate confidence score
  calculateConfidence(sampleSize, stdDev) {
    // More samples = higher confidence
    // Lower standard deviation = higher confidence
    const sampleScore = Math.min(sampleSize / 20, 1) * 50; // Max 50 from sample size
    const consistencyScore = Math.max(0, 50 - stdDev / 1000); // Max 50 from consistency

    return Math.round(sampleScore + consistencyScore);
  }

  // Generate pricing insights
  generateInsights(stats, similarProducts, productData) {
    const insights = [];

    // Price positioning insight
    if (stats.mean > 0) {
      const avgPrice = Math.round(stats.mean);
      insights.push({
        type: "positioning",
        message: `Similar items average XAF ${avgPrice.toLocaleString()}`,
        icon: "💰",
      });
    }

    // Competition insight
    if (similarProducts.length > 10) {
      insights.push({
        type: "competition",
        message: `${similarProducts.length} similar listings found - competitive market`,
        icon: "📊",
      });
    } else if (similarProducts.length < 5) {
      insights.push({
        type: "opportunity",
        message: "Low competition - you can price higher!",
        icon: "🚀",
      });
    }

    // Condition insight
    if (productData.condition === "new") {
      const premium = Math.round(stats.percentile75);
      insights.push({
        type: "premium",
        message: `New items can command up to XAF ${premium.toLocaleString()}`,
        icon: "✨",
      });
    }

    // Quick sale insight
    const quickSale = Math.round(stats.percentile25);
    insights.push({
      type: "quicksale",
      message: `Price at XAF ${quickSale.toLocaleString()} for faster sale`,
      icon: "⚡",
    });

    return insights;
  }

  // Calculate text similarity (simple Jaccard similarity)
  calculateTextSimilarity(text1, text2) {
    const tokens1 = new Set(text1.toLowerCase().split(/\s+/));
    const tokens2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return intersection.size / union.size;
  }

  // Default price suggestion when no data available
  getDefaultPriceSuggestion(category) {
    const defaults = {
      electronics: { min: 10000, recommended: 50000, max: 200000 },
      fashion: { min: 5000, recommended: 15000, max: 50000 },
      home: { min: 10000, recommended: 30000, max: 100000 },
      vehicles: { min: 500000, recommended: 2000000, max: 10000000 },
      "real-estate": { min: 5000000, recommended: 20000000, max: 100000000 },
      services: { min: 5000, recommended: 25000, max: 100000 },
      default: { min: 5000, recommended: 20000, max: 100000 },
    };

    const suggestion = defaults[category] || defaults["default"];

    return {
      ...suggestion,
      average: suggestion.recommended,
      confidence: 30,
      insights: [
        {
          type: "info",
          message: "Not enough data yet. These are category averages.",
          icon: "ℹ️",
        },
      ],
      competitorCount: 0,
    };
  }

  // Track price performance
  async trackPricePerformance(productId, viewCount, inquiryCount) {
    // This helps improve future suggestions
    // Could be expanded to use ML in the future
    const performance = {
      views: viewCount,
      inquiries: inquiryCount,
      conversionRate: inquiryCount / Math.max(viewCount, 1),
    };

    return performance;
  }
}

export default new PriceService();
