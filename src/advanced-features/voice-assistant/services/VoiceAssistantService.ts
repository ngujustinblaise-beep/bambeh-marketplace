/**
 * BAMBÉ MARKETPLACE - VOICE ASSISTANT SERVICE
 * Version: 1.0.0
 */

import axios, { AxiosInstance } from "axios";
import VoiceRecognitionService from "./VoiceRecognitionService";
import NLPService from "./NLPService";
import {
  ParsedCommand, VoiceResponse, ConversationContext, ConversationTurn,
  Language, VoiceSettings, ProductSearchResult, VoiceOrderRequest, VoiceStats,
} from "../types/voice.types";
import ENV_CONFIG from "../../../config/env.config";

class VoiceAssistantService {
  private apiAxios: AxiosInstance;
  private context: ConversationContext | null = null;
  private settings: VoiceSettings;

  constructor() {
    this.apiAxios = axios.create({
      baseURL: ENV_CONFIG.API.BASE_URL,
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
    });

    this.settings = {
      language: "fr", voiceSpeed: 1.0, autoListen: false,
      continuousMode: false, wakeWord: "hey mama",
      feedbackSounds: true, visualFeedback: true,
    };

    this.apiAxios.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // ── CONVERSATION ──────────────────────────────────────────────────────────

  initializeConversation(userId: string, language: Language): void {
    this.context = {
      userId,
      conversationId: this.generateConversationId(),
      language,
      history: [],
      entities: {},
      awaitingConfirmation: false,
    };
    this.settings.language = language;
    VoiceRecognitionService.setLanguage(language);
  }

  async processVoiceInput(transcript: string): Promise<VoiceResponse> {
    if (!this.context) throw new Error("Conversation not initialized");
    try {
      const parsedCommand = NLPService.parseCommand(transcript, this.context.language, this.context);
      const response = await this.generateResponse(parsedCommand);
      const turn: ConversationTurn = {
        timestamp: new Date().toISOString(),
        userInput: transcript,
        parsedCommand,
        response,
      };
      this.context.history.push(turn);
      this.context.lastCommand = parsedCommand;
      await this.updateStats(parsedCommand);
      return response;
    } catch (error) {
      console.error("Error processing voice input:", error);
      return this.getErrorResponse(this.context.language);
    }
  }

  private async generateResponse(command: ParsedCommand): Promise<VoiceResponse> {
    if (!this.context) throw new Error("Context not available");
    switch (command.intent) {
      case "search_product":   return await this.handleProductSearch(command);
      case "search_category":  return await this.handleCategorySearch(command);
      case "create_order":     return await this.handleCreateOrder(command);
      case "track_order":      return await this.handleTrackOrder(command);
      case "show_help":        return this.handleHelp();
      case "navigate_to_page": return this.handleNavigation(command);
      case "confirm_action":   return await this.handleConfirmation();
      case "cancel_action":    return this.handleCancellation();
      case "repeat_last":      return this.handleRepeat();
      default:                 return this.handleUnknownCommand(command);
    }
  }

  // ── COMMAND HANDLERS ──────────────────────────────────────────────────────

  private async handleProductSearch(command: ParsedCommand): Promise<VoiceResponse> {
    const productEntity = command.entities.find((e) => e.type === "product");
    if (!productEntity) {
      return {
        text: this.context?.language === "fr"
          ? "Quel produit voulez-vous chercher?"
          : "What product would you like to search for?",
        suggestions: NLPService.generateSuggestions(command, this.context!.language),
      };
    }
    try {
      const results = await this.searchProducts(productEntity.value);
      if (results.length === 0) {
        return {
          text: this.context?.language === "fr"
            ? `Désolé, je n'ai pas trouvé de ${productEntity.value}. Voulez-vous chercher autre chose?`
            : `Sorry, I couldn't find any ${productEntity.value}. Would you like to search for something else?`,
          suggestions: NLPService.generateSuggestions(command, this.context!.language),
        };
      }
      const responseText = this.context?.language === "fr"
        ? `J'ai trouvé ${results.length} produit${results.length > 1 ? "s" : ""} pour ${productEntity.value}. Le premier coûte ${results[0].price} XAF. Voulez-vous voir les résultats?`
        : `I found ${results.length} product${results.length > 1 ? "s" : ""} for ${productEntity.value}. The first one costs ${results[0].price} XAF. Would you like to see the results?`;
      return {
        text: responseText,
        action: { type: "show_results", data: { results, query: productEntity.value } },
        suggestions: [
          this.context?.language === "fr" ? "Oui, montre moi" : "Yes, show me",
          this.context?.language === "fr" ? "Commander le premier" : "Order the first one",
          this.context?.language === "fr" ? "Cherche autre chose" : "Search something else",
        ],
        requiresConfirmation: true,
      };
    } catch (error) {
      return this.getErrorResponse(this.context!.language);
    }
  }

  private async handleCategorySearch(command: ParsedCommand): Promise<VoiceResponse> {
    const categoryEntity = command.entities.find((e) => e.type === "category");
    if (!categoryEntity) {
      return {
        text: this.context?.language === "fr" ? "Quelle catégorie voulez-vous explorer?" : "Which category would you like to explore?",
        suggestions: [
          this.context?.language === "fr" ? "Nourriture" : "Food",
          this.context?.language === "fr" ? "Électronique" : "Electronics",
          this.context?.language === "fr" ? "Mode" : "Fashion",
        ],
      };
    }
    const responseText = this.context?.language === "fr"
      ? `D'accord, je vais vous montrer la catégorie ${categoryEntity.value}.`
      : `Okay, I'll show you the ${categoryEntity.value} category.`;
    return {
      text: responseText,
      action: { type: "navigate", data: { category: categoryEntity.value } },
    };
  }

  private async handleCreateOrder(command: ParsedCommand): Promise<VoiceResponse> {
    const productEntity = command.entities.find((e) => e.type === "product");
    const quantityEntity = command.entities.find((e) => e.type === "quantity");
    if (!productEntity) {
      return {
        text: this.context?.language === "fr" ? "Quel produit voulez-vous commander?" : "What product would you like to order?",
        suggestions: NLPService.generateSuggestions(command, this.context!.language),
      };
    }
    const quantity = quantityEntity ? quantityEntity.value : "1";
    if (this.context) {
      this.context.entities["pendingOrder"] = { product: productEntity.value, quantity };
      this.context.awaitingConfirmation = true;
    }
    const responseText = this.context?.language === "fr"
      ? `Vous voulez commander ${quantity} ${productEntity.value}. Dois-je confirmer cette commande?`
      : `You want to order ${quantity} ${productEntity.value}. Should I confirm this order?`;
    return {
      text: responseText,
      suggestions: [
        this.context?.language === "fr" ? "Oui, confirme" : "Yes, confirm",
        this.context?.language === "fr" ? "Non, annule" : "No, cancel",
        this.context?.language === "fr" ? "Change la quantité" : "Change quantity",
      ],
      requiresConfirmation: true,
    };
  }

  private async handleTrackOrder(command: ParsedCommand): Promise<VoiceResponse> {
    const orderIdEntity = command.entities.find((e) => e.type === "order_id");
    try {
      let orderId: string;
      if (orderIdEntity) {
        orderId = orderIdEntity.value;
      } else {
        const recentOrder = await this.getMostRecentOrder();
        if (!recentOrder) {
          return {
            text: this.context?.language === "fr"
              ? "Je n'ai pas trouvé de commande récente. Pouvez-vous me donner le numéro de commande?"
              : "I couldn't find a recent order. Can you provide the order number?",
            suggestions: [],
          };
        }
        orderId = recentOrder.id;
      }
      const orderStatus = await this.getOrderStatus(orderId);
      const responseText = this.context?.language === "fr"
        ? `Votre commande ${orderId} est ${orderStatus}. Voulez-vous voir plus de détails?`
        : `Your order ${orderId} is ${orderStatus}. Would you like to see more details?`;
      return {
        text: responseText,
        action: { type: "navigate", data: { page: "order-tracking", orderId } },
        suggestions: [
          this.context?.language === "fr" ? "Oui, montre les détails" : "Yes, show details",
          this.context?.language === "fr" ? "Contacter le vendeur" : "Contact vendor",
        ],
      };
    } catch (error) {
      return this.getErrorResponse(this.context!.language);
    }
  }

  private handleHelp(): VoiceResponse {
    const helpText = this.context?.language === "fr"
      ? "Je suis Mama, votre assistante vocale Bambé. Je peux vous aider à chercher des produits, passer des commandes, suivre vos livraisons et bien plus. Essayez de dire 'cherche des tomates' ou 'où est ma commande'."
      : "I'm Mama, your Bambé voice assistant. I can help you search for products, place orders, track deliveries and more. Try saying 'search for tomatoes' or 'where is my order'.";
    return {
      text: helpText,
      suggestions: [
        this.context?.language === "fr" ? "Cherche des produits" : "Search for products",
        this.context?.language === "fr" ? "Passer une commande" : "Place an order",
        this.context?.language === "fr" ? "Suivre ma commande" : "Track my order",
      ],
    };
  }

  private handleNavigation(command: ParsedCommand): VoiceResponse {
    const pages: { [key: string]: string } = {
      home: "home", maison: "home", cart: "cart", panier: "cart",
      orders: "orders", commandes: "orders", profile: "profile", profil: "profile",
    };
    for (const [keyword, page] of Object.entries(pages)) {
      if (command.rawText.toLowerCase().includes(keyword)) {
        return {
          text: this.context?.language === "fr" ? `D'accord, je vous emmène à la page ${page}.` : `Okay, taking you to the ${page} page.`,
          action: { type: "navigate", data: { page } },
        };
      }
    }
    return {
      text: this.context?.language === "fr" ? "Où voulez-vous aller?" : "Where would you like to go?",
      suggestions: [
        this.context?.language === "fr" ? "Accueil" : "Home",
        this.context?.language === "fr" ? "Panier" : "Cart",
        this.context?.language === "fr" ? "Commandes" : "Orders",
      ],
    };
  }

  private async handleConfirmation(): Promise<VoiceResponse> {
    if (!this.context?.awaitingConfirmation) {
      return {
        text: this.context?.language === "fr" ? "Il n'y a rien à confirmer pour le moment." : "There's nothing to confirm right now.",
        suggestions: NLPService.generateSuggestions({ command: "unknown", intent: "", entities: [], confidence: 0, rawText: "" }, this.context!.language),
      };
    }
    if (this.context.entities["pendingOrder"]) {
      try {
        const order = this.context.entities["pendingOrder"];
        await this.createOrder(order);
        this.context.awaitingConfirmation = false;
        delete this.context.entities["pendingOrder"];
        return {
          text: this.context.language === "fr"
            ? `Parfait! Votre commande de ${order.quantity} ${order.product} a été confirmée. Vous recevrez une notification quand elle sera prête.`
            : `Perfect! Your order for ${order.quantity} ${order.product} has been confirmed. You'll receive a notification when it's ready.`,
          action: { type: "navigate", data: { page: "orders" } },
        };
      } catch (error) {
        return this.getErrorResponse(this.context.language);
      }
    }
    return { text: this.context.language === "fr" ? "Action confirmée!" : "Action confirmed!", suggestions: [] };
  }

  private handleCancellation(): VoiceResponse {
    if (this.context) {
      this.context.awaitingConfirmation = false;
      this.context.entities = {};
    }
    return {
      text: this.context?.language === "fr" ? "D'accord, annulé. Comment puis-je vous aider?" : "Okay, cancelled. How can I help you?",
      suggestions: NLPService.generateSuggestions({ command: "unknown", intent: "", entities: [], confidence: 0, rawText: "" }, this.context!.language),
    };
  }

  private handleRepeat(): VoiceResponse {
    if (!this.context || this.context.history.length === 0) {
      return { text: this.context?.language === "fr" ? "Il n'y a rien à répéter." : "There's nothing to repeat.", suggestions: [] };
    }
    const lastTurn = this.context.history[this.context.history.length - 1];
    return lastTurn.response;
  }

  private handleUnknownCommand(command: ParsedCommand): VoiceResponse {
    return {
      text: this.context?.language === "fr" ? "Désolé, je n'ai pas compris. Pouvez-vous reformuler?" : "Sorry, I didn't understand. Could you rephrase that?",
      suggestions: NLPService.generateSuggestions(command, this.context!.language),
    };
  }

  // ── API ───────────────────────────────────────────────────────────────────

  private async searchProducts(query: string): Promise<ProductSearchResult[]> {
    try {
      const response = await this.apiAxios.get("/products/search", { params: { q: query, limit: 10 } });
      return response.data.results || [];
    } catch (error) { console.error("Error searching products:", error); return []; }
  }

  private async getMostRecentOrder(): Promise<any> {
    try {
      const response = await this.apiAxios.get("/orders/recent", { params: { limit: 1 } });
      return response.data[0] || null;
    } catch (error) { console.error("Error getting recent order:", error); return null; }
  }

  private async getOrderStatus(orderId: string): Promise<string> {
    try {
      const response = await this.apiAxios.get(`/orders/${orderId}/status`);
      return response.data.status || "unknown";
    } catch (error) { console.error("Error getting order status:", error); return "unknown"; }
  }

  private async createOrder(orderData: any): Promise<void> {
    try { await this.apiAxios.post("/orders", orderData); }
    catch (error) { console.error("Error creating order:", error); throw error; }
  }

  // ── SETTINGS & STATS ──────────────────────────────────────────────────────

  updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
    if (settings.language) {
      VoiceRecognitionService.setLanguage(settings.language);
      if (this.context) this.context.language = settings.language;
    }
  }

  getSettings(): VoiceSettings { return { ...this.settings }; }

  private async updateStats(command: ParsedCommand): Promise<void> {
    try {
      await this.apiAxios.post("/voice-assistant/stats", {
        command: command.command,
        confidence: command.confidence,
        success: command.command !== "unknown",
      });
    } catch (error) { console.error("Error updating stats:", error); }
  }

  async getStats(): Promise<VoiceStats | null> {
    try { const response = await this.apiAxios.get("/voice-assistant/stats"); return response.data; }
    catch (error) { console.error("Error getting stats:", error); return null; }
  }

  // ── UTILITY ───────────────────────────────────────────────────────────────

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getErrorResponse(language: Language): VoiceResponse {
    return {
      text: language === "fr"
        ? "Désolé, une erreur s'est produite. Pouvez-vous réessayer?"
        : "Sorry, an error occurred. Can you try again?",
      suggestions: [],
    };
  }

  getContext(): ConversationContext | null { return this.context; }
  clearConversation(): void { this.context = null; }
}

export default new VoiceAssistantService();
