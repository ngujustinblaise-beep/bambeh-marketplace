/**
 * BAMBÉ MARKETPLACE - VOICE ASSISTANT TYPES
 * TypeScript interfaces for Mama voice assistant
 * Version: 1.0.0
 */

export type Language = "en" | "fr";

export type VoiceCommand =
  | "search"
  | "order"
  | "track"
  | "help"
  | "navigate"
  | "cancel"
  | "confirm"
  | "repeat"
  | "unknown";

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language: Language;
}

export interface ParsedCommand {
  command: VoiceCommand;
  intent: string;
  entities: CommandEntity[];
  confidence: number;
  rawText: string;
}

export interface CommandEntity {
  type:
    | "product"
    | "category"
    | "location"
    | "quantity"
    | "price"
    | "order_id"
    | "time";
  value: string;
  confidence: number;
}

export interface VoiceResponse {
  text: string;
  action?: VoiceAction;
  suggestions?: string[];
  requiresConfirmation?: boolean;
}

export interface VoiceAction {
  type:
    | "search"
    | "navigate"
    | "order"
    | "show_results"
    | "open_chat"
    | "call_vendor";
  data: any;
}

export interface ConversationContext {
  userId: string;
  conversationId: string;
  language: Language;
  history: ConversationTurn[];
  currentIntent?: string;
  entities: { [key: string]: any };
  awaitingConfirmation: boolean;
  lastCommand?: ParsedCommand;
}

export interface ConversationTurn {
  timestamp: string;
  userInput: string;
  parsedCommand: ParsedCommand;
  response: VoiceResponse;
}

export interface VoiceSettings {
  language: Language;
  voiceSpeed: number; // 0.5 to 2.0,
  autoListen: boolean;
  continuousMode: boolean;
  wakeWord: "hey mama" | "bonjour mama";
  feedbackSounds: boolean;
  visualFeedback: boolean;
}

export interface ProductSearchResult {
  id: string;
  name: string;
  price: number;
  image?: string;
  vendor: string;
  rating?: number;
  inStock: boolean;
}

export interface VoiceOrderRequest {
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface VoiceStats {
  totalCommands: number;
  successfulCommands: number;
  failedCommands: number;
  averageConfidence: number;
  mostUsedCommands: { [key: string]: number };
  lastUsed: string;
}
