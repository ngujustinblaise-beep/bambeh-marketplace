// chatbotService.js - AI-Powered Customer Support Chatbot
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

class ChatbotService {
  constructor() {
    // Pre-trained responses for common questions (works offline!)
    this.knowledgeBase = {
      // Greetings
      greetings: {
        patterns: [
          "hello",
          "hi",
          "hey",
          "good morning",
          "good afternoon",
          "greetings",
          "bonjour",
          "salut",
        ],
        responses: [
          "Hello! 👋 Welcome to Bambé! I'm Mama, your AI shopping assistant. How can I help you today?",
          "Hi there! 😊 I'm Mama, here to make your shopping experience amazing. What can I do for you?",
          "Hey! Welcome to Bambé! I'm Mama, your personal shopping guide. Ask me anything!",
        ],
      },

      // Product search
      productSearch: {
        patterns: [
          "find",
          "search",
          "looking for",
          "show me",
          "where can i find",
          "do you have",
        ],
        responses: [
          "I can help you find that! 🔍 What category are you interested in? We have Electronics, Fashion, Home & Garden, Vehicles, Real Estate, and Services.",
          "Let me search for you! What type of product are you looking for? Be as specific as you'd like.",
          "Great! I'll help you find it. Can you tell me more about what you're searching for?",
        ],
      },

      // Pricing questions
      pricing: {
        patterns: [
          "price",
          "cost",
          "how much",
          "expensive",
          "cheap",
          "afford",
          "budget",
        ],
        responses: [
          "💰 Prices on Bambé vary by seller and product condition. I can help you find items within your budget! What's your price range?",
          "Our marketplace has competitive prices! What's your budget, and I'll show you the best options available.",
          "Looking for the best deal? Tell me your budget and what you're shopping for, and I'll find great options!",
        ],
      },

      // Payment questions
      payment: {
        patterns: [
          "payment",
          "pay",
          "momo",
          "orange money",
          "mtn",
          "cash",
          "card",
          "mobile money",
        ],
        responses: [
          "💳 We accept MTN Mobile Money, Orange Money, and Cash on Delivery! You can also set up installment payments for larger purchases.",
          "Payment is easy! Choose from MTN MoMo, Orange Money, or pay cash when your item arrives. Safe and secure!",
          "We support: 📱 MTN Mobile Money, 📱 Orange Money, 💵 Cash on Delivery, and 💳 Installment Plans!",
        ],
      },

      // Delivery questions
      delivery: {
        patterns: [
          "delivery",
          "shipping",
          "deliver",
          "ship",
          "transport",
          "receive",
          "arrive",
        ],
        responses: [
          "🚚 We deliver across Cameroon! Delivery time depends on your location. Yaoundé & Douala: 1-2 days. Other cities: 3-5 days.",
          "Delivery is fast and tracked! You can follow your order in real-time. Where are you located?",
          "We offer same-day delivery in major cities! Track your package from pickup to your doorstep with our GPS tracking.",
        ],
      },

      // Selling questions
      selling: {
        patterns: [
          "sell",
          "post",
          "listing",
          "upload",
          "advertise",
          "list item",
        ],
        responses: [
          "Want to sell on Bambé? Great! 🎉 Click the '+' button to create a listing. Add photos, set your price, and reach thousands of buyers!",
          "Selling is easy! Take photos, write a description, set your price, and publish. Our AI will even suggest the best price for you!",
          "List your item in 3 easy steps: 1) Upload photos 📸, 2) Add details ✍️, 3) Set price 💰. It's free to list!",
        ],
      },

      // Account/Login
      account: {
        patterns: [
          "account",
          "login",
          "sign up",
          "register",
          "password",
          "profile",
          "logout",
        ],
        responses: [
          "🔐 Tap the profile icon to sign in or create an account. It only takes 30 seconds! You can also continue as guest.",
          "Create your free Bambé account to save favorites, track orders, and message sellers instantly!",
          "Account issues? I can help! Are you trying to sign in, reset password, or create a new account?",
        ],
      },

      // Safety/Trust
      safety: {
        patterns: [
          "safe",
          "trust",
          "scam",
          "secure",
          "legit",
          "real",
          "fake",
          "verify",
        ],
        responses: [
          "✅ Your safety is our priority! All sellers are verified, payments are secure, and we have buyer protection. Shop with confidence!",
          "Bambé is 100% safe! We verify sellers, protect payments, and offer money-back guarantee on eligible items.",
          "We've got your back! Verified sellers ✓, Secure payments ✓, Buyer protection ✓, Real reviews ✓",
        ],
      },

      // Returns/Refunds
      returns: {
        patterns: [
          "return",
          "refund",
          "money back",
          "exchange",
          "wrong item",
          "damaged",
        ],
        responses: [
          "💯 Easy returns within 7 days! If item doesn't match description or arrives damaged, we'll refund you fully.",
          "Not satisfied? Return it! Contact the seller within 7 days. If they don't respond, we'll step in and help.",
          "Our return policy: 7-day return window, full refund for mismatched/damaged items, free return shipping.",
        ],
      },

      // Subscription/Zerm Coins
      subscription: {
        patterns: [
          "subscription",
          "premium",
          "zerm",
          "coins",
          "membership",
          "upgrade",
        ],
        responses: [
          "🌟 Upgrade to Premium! Get: Free delivery, Exclusive deals, Early access to sales, and 500 Zerm Coins monthly!",
          "Zerm Coins are our reward currency! Earn them by shopping, reviewing products, and referring friends. Use them for discounts!",
          "Join Bambé Premium: XAF 2,500/month. Benefits: Free delivery, 10% cashback, Priority support, and exclusive perks!",
        ],
      },

      // Voice feature (Mama)
      voice: {
        patterns: [
          "voice",
          "speak",
          "talk",
          "mama",
          "assistant",
          "audio",
          "listen",
        ],
        responses: [
          "🎤 Tap the mic icon to use voice commands! Say things like 'Find me a phone' or 'Show electronics under 50,000 XAF'",
          "I can hear you! Just tap the microphone and speak naturally. I understand English, French, and even Pidgin!",
          "Voice search is super fast! Tap 🎤, say what you want, and I'll find it instantly. Try it now!",
        ],
      },

      // Contact support
      support: {
        patterns: [
          "help",
          "support",
          "contact",
          "customer service",
          "problem",
          "issue",
          "complaint",
        ],
        responses: [
          "📞 Need human support? Call: +237 6XX XX XX XX (Mon-Sat, 8AM-6PM) or email: support@bambe.cm",
          "I'm here to help! What's the issue? I can assist with orders, payments, accounts, or connect you with our team.",
          "Having trouble? Describe your issue and I'll guide you through it step-by-step. Or connect with live support!",
        ],
      },

      // Thanks
      thanks: {
        patterns: [
          "thank",
          "thanks",
          "appreciate",
          "merci",
          "cool",
          "awesome",
          "great",
        ],
        responses: [
          "You're very welcome! 😊 Happy shopping on Bambé!",
          "My pleasure! Let me know if you need anything else!",
          "Glad I could help! Enjoy your shopping experience! 🎉",
        ],
      },

      // Goodbye
      goodbye: {
        patterns: ["bye", "goodbye", "see you", "later", "exit", "close"],
        responses: [
          "Goodbye! 👋 Come back anytime. Happy shopping!",
          "See you later! Don't forget to check out our daily deals! 🛍️",
          "Bye! I'm always here if you need me. Shop safe! ✨",
        ],
      },
    };

    // Fallback responses
    this.fallbackResponses = [
      "🤔 I'm not sure about that yet, but I'm learning! Can you try asking in a different way?",
      "Hmm, that's a great question! Let me connect you with our support team for a detailed answer. Would you like that?",
      "I'm still learning about that topic. Meanwhile, try browsing our Help Center or chat with a human agent!",
      "Interesting question! While I figure that out, is there something else I can help you with right now?",
    ];
  }

  // Main chat function
  async chat(userMessage, userId, conversationHistory = []) {
    try {
      // Clean and normalize message
      const normalizedMessage = userMessage.toLowerCase().trim();

      // Find matching response
      const response = this.findBestResponse(normalizedMessage);

      // Save conversation to Firebase
      await this.saveConversation(userId, userMessage, response);

      // Add suggested quick replies
      const quickReplies = this.getQuickReplies(normalizedMessage);

      return {
        message: response,
        quickReplies,
        timestamp: new Date(),
        sender: "mama",
      };
    } catch (error) {
      console.error("Chat error:", error);
      return {
        message: "Oops! I'm having a moment. Can you try again? 😅",
        quickReplies: [],
        timestamp: new Date(),
        sender: "mama",
      };
    }
  }

  // Find best matching response
  findBestResponse(message) {
    let bestMatch = null;
    let highestScore = 0;

    // Check each category
    for (const [category, data] of Object.entries(this.knowledgeBase)) {
      const score = this.calculateMatchScore(message, data.patterns);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = data.responses;
      }
    }

    // If good match found (score > 0.3)
    if (highestScore > 0.3 && bestMatch) {
      // Return random response from matches
      return bestMatch[Math.floor(Math.random() * bestMatch.length)];
    }

    // Fallback response
    return this.fallbackResponses[
      Math.floor(Math.random() * this.fallbackResponses.length)
    ];
  }

  // Calculate match score
  calculateMatchScore(message, patterns) {
    let score = 0;
    const words = message.split(/\s+/);

    for (const pattern of patterns) {
      if (message.includes(pattern)) {
        score += 1;
      }

      // Check individual words
      for (const word of words) {
        if (pattern.includes(word) && word.length > 3) {
          score += 0.5;
        }
      }
    }

    return score / patterns.length;
  }

  // Get contextual quick replies
  getQuickReplies(message) {
    if (message.includes("price") || message.includes("cost")) {
      return ["Show me budget phones", "Electronics under 50k", "Best deals"];
    }

    if (message.includes("delivery") || message.includes("ship")) {
      return ["Track my order", "Delivery areas", "Shipping costs"];
    }

    if (message.includes("payment") || message.includes("pay")) {
      return ["Payment methods", "Installment plans", "How to pay"];
    }

    if (message.includes("sell") || message.includes("list")) {
      return ["Create listing", "Pricing tips", "Upload photos"];
    }

    // Default quick replies
    return ["Browse categories", "Today's deals", "Contact support"];
  }

  // Save conversation to Firebase
  async saveConversation(userId, userMessage, botResponse) {
    try {
      await addDoc(collection(db, "chatbot_conversations"), {
        userId,
        userMessage,
        botResponse,
        timestamp: serverTimestamp(),
        platform: "mobile",
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  }

  // Get conversation history
  async getConversationHistory(userId, limitCount = 20) {
    try {
      const q = query(
        collection(db, "chatbot_conversations"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse();
    } catch (error) {
      console.error("Error getting history:", error);
      return [];
    }
  }

  // Analyze user intent (for future ML improvements)
  analyzeIntent(message) {
    const intents = {
      search: ["find", "search", "looking", "show", "where"],
      buy: ["buy", "purchase", "order", "get"],
      sell: ["sell", "list", "post", "upload"],
      support: ["help", "problem", "issue", "support"],
      info: ["what", "how", "when", "why", "who"],
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        return intent;
      }
    }

    return "general";
  }
}

export default new ChatbotService();
