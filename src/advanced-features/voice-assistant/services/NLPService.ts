/**
 * BAMBÉ MARKETPLACE - NATURAL LANGUAGE PROCESSING SERVICE
 * Parse voice commands and extract intent
 * Version: 1.0.0
 */

import {
  ParsedCommand,
  VoiceCommand,
  CommandEntity,
  Language,
  ConversationContext
} from "../types/voice.types";

class NLPService {
  /**
   * Parse voice command
   */
  parseCommand(
    text: string,
    language: Language,
    context?: ConversationContext,
  ): ParsedCommand {
    const normalizedText = text.toLowerCase().trim();

    // Detect command type
    const command = this.detectCommand(normalizedText, language);

    // Extract entities
    const entities = this.extractEntities(normalizedText, language);

    // Determine intent
    const intent = this.determineIntent(
      command,
      entities,
      normalizedText,
      language,
    );

    // Calculate confidence
    const confidence = this.calculateConfidence(
      command,
      entities,
      normalizedText,
    );

    return {
      command,
      intent,
      entities,
      confidence,
      rawText: text,
    };
  }

  /**
   * Detect command type
   */
  private detectCommand(text: string, language: Language): VoiceCommand {
    const patterns = this.getCommandPatterns(language);

    for (const [command, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        if (regex.test(text)) {
          return command as VoiceCommand;
        }
      }
    }

    return "unknown";
  }

  /**
   * Get command patterns for language
   */
  private getCommandPatterns(language: Language): {
    [key in VoiceCommand]?: RegExp[];
  } {
    if (language === "fr") {
      return {
        search: [
          /cherche|recherche|trouve|trouver|chercher/i,
          /je veux|j'ai besoin|j'aimerais/i,
          /montre moi|affiche/i,
        ],
        order: [
          /commande|commander|achète|acheter|prends|prendre/i,
          /je veux commander|je voudrais commander/i,
          /ajouter au panier|mettre dans le panier/i,
        ],
        track: [
          /où est|suivre|traquer|localiser/i,
          /ma commande|mon colis/i,
          /statut de/i,
        ],
        help: [
          /aide|aider|comment|qu'est-ce que/i,
          /peux-tu|pouvez-vous|est-ce que tu peux/i,
        ],
        navigate: [
          /va à|aller à|ouvre|ouvrir|affiche|afficher/i,
          /montre moi la page|emmène moi/i,
        ],
        cancel: [
          /annule|annuler|arrête|arrêter|stop/i,
          /non merci|laisse tomber/i,
        ],
        confirm: [/oui|d'accord|ok|confirme|confirmer/i, /vas-y|go|allez-y/i],
        repeat: [
          /répète|répéter|redis|redire|encore/i,
          /je n'ai pas compris|pardon/i,
        ],
      };
    } else {
      return {
        search: [
          /search|find|look for|looking for/i,
          /i want|i need|i would like/i,
          /show me|display/i,
        ],
        order: [
          /order|buy|purchase|get/i,
          /i want to order|i'd like to order/i,
          /add to cart|put in cart/i,
        ],
        track: [
          /where is|track|locate|find/i,
          /my order|my package/i,
          /status of/i,
        ],
        help: [/help|how|what can/i, /can you|could you/i],
        navigate: [/go to|open|show|display/i, /take me to|navigate to/i],
        cancel: [/cancel|stop|nevermind/i, /no thanks|forget it/i],
        confirm: [/yes|okay|ok|confirm|sure/i, /go ahead|proceed/i],
        repeat: [
          /repeat|say again|pardon|what/i,
          /i didn't understand|i didn't catch that/i,
        ],
      };
    }
  }

  /**
   * Extract entities from text
   */
  private extractEntities(text: string, language: Language): CommandEntity[] {
    const entities: CommandEntity[] = [];

    // Extract products
    entities.push(...this.extractProducts(text, language));

    // Extract categories
    entities.push(...this.extractCategories(text, language));

    // Extract quantities
    entities.push(...this.extractQuantities(text, language));

    // Extract prices
    entities.push(...this.extractPrices(text, language));

    // Extract order IDs
    entities.push(...this.extractOrderIds(text));

    // Extract locations
    entities.push(...this.extractLocations(text, language));

    return entities;
  }

  /**
   * Extract product names
   */
  private extractProducts(text: string, language: Language): CommandEntity[] {
    const products: CommandEntity[] = [];

    // Common products in both languages
    const productKeywords =
      language === "fr"
        ? [
            "tomate",
            "pain",
            "riz",
            "huile",
            "savon",
            "téléphone",
            "ordinateur",
            "chaussure",
            "robe",
            "chemise",
          ]
        : [
            "tomato",
            "bread",
            "rice",
            "oil",
            "soap",
            "phone",
            "computer",
            "shoe",
            "dress",
            "shirt",
          ];

    for (const product of productKeywords) {
      if (text.includes(product)) {
        products.push({
          type: "product",
          value: product,
          confidence: 0.8,
        });
      }
    }

    return products;
  }

  /**
   * Extract categories
   */
  private extractCategories(text: string, language: Language): CommandEntity[] {
    const categories: CommandEntity[] = [];

    const categoryKeywords =
      language === "fr"
        ? {
            food: ["nourriture", "alimentation", "aliment", "manger"],
            electronics: ["électronique", "appareil", "gadget"],
            fashion: ["mode", "vêtement", "habit"],
            beauty: ["beauté", "cosmétique", "maquillage"],
            home: ["maison", "jardin", "décoration"],
            services: ["service", "prestation"],
          }
        : {
            food: ["food", "eat", "meal", "grocery"],
            electronics: ["electronic", "gadget", "device"],
            fashion: ["fashion", "clothing", "wear"],
            beauty: ["beauty", "cosmetic", "makeup"],
            home: ["home", "garden", "decoration"],
            services: ["service", "professional"],
          };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          categories.push({
            type: "category",
            value: category,
            confidence: 0.8,
          });
          break;
        }
      }
    }

    return categories;
  }

  /**
   * Extract quantities
   */
  private extractQuantities(text: string, language: Language): CommandEntity[] {
    const quantities: CommandEntity[] = [];

    // Match numbers
    const numberPattern = /(\d+)\s*(kilo|kg|litre|l|pièce|piece|unit|unité)?/gi;
    const matches = text.matchAll(numberPattern);

    for (const match of matches) {
      quantities.push({
        type: "quantity",
        value: match[1] + (match[2] ? " " + match[2] : ""),
        confidence: 0.9,
      });
    }

    // Match written numbers (French)
    if (language === "fr") {
      const writtenNumbers: { [key: string]: string } = {
        un: "1",
        deux: "2",
        trois: "3",
        quatre: "4",
        cinq: "5",
        six: "6",
        sept: "7",
        huit: "8",
        neuf: "9",
        dix: "10",
      };

      for (const [word, num] of Object.entries(writtenNumbers)) {
        if (text.includes(word)) {
          quantities.push({
            type: "quantity",
            value: num,
            confidence: 0.8,
          });
        }
      }
    }

    return quantities;
  }

  /**
   * Extract prices
   */
  private extractPrices(text: string, language: Language): CommandEntity[] {
    const prices: CommandEntity[] = [];

    // Match prices with currency
    const pricePattern = /(\d+)\s*(franc|francs|xaf|cfa|fcfa)/gi;
    const matches = text.matchAll(pricePattern);

    for (const match of matches) {
      prices.push({
        type: "price",
        value: match[1],
        confidence: 0.9,
      });
    }

    return prices;
  }

  /**
   * Extract order IDs
   */
  private extractOrderIds(text: string): CommandEntity[] {
    const orderIds: CommandEntity[] = [];

    // Match order number patterns
    const orderPattern = /(order|commande)?\s*#?([A-Z0-9]{6,})/gi;
    const matches = text.matchAll(orderPattern);

    for (const match of matches) {
      orderIds.push({
        type: "order_id",
        value: match[2],
        confidence: 0.85,
      });
    }

    return orderIds;
  }

  /**
   * Extract locations
   */
  private extractLocations(text: string, language: Language): CommandEntity[] {
    const locations: CommandEntity[] = [];

    // Common  locations
    const locationKeywords = [
      "yaoundé",
      "yaounde",
      "douala",
      "bafoussam",
      "bamenda",
      "garoua",
      "maroua",
      "ngaoundéré",
      "bertoua",
      "ebolowa",
    ];

    for (const location of locationKeywords) {
      if (text.toLowerCase().includes(location)) {
        locations.push({
          type: "location",
          value: location,
          confidence: 0.9,
        });
      }
    }

    return locations;
  }

  /**
   * Determine intent
   */
  private determineIntent(
    command: VoiceCommand,
    entities: CommandEntity[],
    text: string,
    language: Language,
  ): string {
    switch (command) {
      case "search":
        if (entities.some((e) => e.type === "product")) {
          return "search_product";
        } else if (entities.some((e) => e.type === "category")) {
          return "search_category";
        }
        return "general_search";

      case "order":
        return "create_order";

      case "track":
        return "track_order";

      case "help":
        return "show_help";

      case "navigate":
        return "navigate_to_page";

      case "cancel":
        return "cancel_action";

      case "confirm":
        return "confirm_action";

      case "repeat":
        return "repeat_last";

      default:
        return "unknown_intent";
    }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    command: VoiceCommand,
    entities: CommandEntity[],
    text: string,
  ): number {
    let confidence = 0.5;

    // Known command boosts confidence
    if (command !== "unknown") {
      confidence += 0.2;
    }

    // Entities boost confidence
    if (entities.length > 0) {
      confidence += Math.min(entities.length * 0.1, 0.3);
    }

    // Clear, short commands have higher confidence
    if (text.split(" ").length <= 5) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate response suggestions
   */
  generateSuggestions(command: ParsedCommand, language: Language): string[] {
    if (language === "fr") {
      switch (command.command) {
        case "search":
          return [
            "Cherche des tomates",
            "Trouve des téléphones",
            "Montre moi des vêtements",
          ];
        case "order":
          return [
            "Commander du pain",
            "Acheter 2 kg de riz",
            "Ajouter au panier",
          ];
        case "track":
          return [
            "Où est ma commande?",
            "Suivre ma commande",
            "Statut de ma commande",
          ];
        default:
          return [
            "Cherche des produits",
            "Commander quelque chose",
            "Aide moi",
          ];
      }
    } else {
      switch (command.command) {
        case "search":
          return ["Search for tomatoes", "Find phones", "Show me clothes"];
        case "order":
          return ["Order bread", "Buy 2 kg of rice", "Add to cart"];
        case "track":
          return ["Where is my order?", "Track my order", "Order status"];
        default:
          return ["Search for products", "Order something", "Help me"];
      }
    }
  }
}

export default new NLPService();

