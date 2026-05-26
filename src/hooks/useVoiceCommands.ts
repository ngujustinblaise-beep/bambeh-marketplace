/**
 * USE VOICE COMMANDS HOOK
 *
 * Custom hook for voice recognition and command processing
 *
 * Features:
 * - Wake word detection ("Mama")
 * - Command parsing
 * - Navigation commands
 * - Search commands
 * - Action commands
 * - Feedback synthesis
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition
} from "react-speech-recognition";

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
  category: "navigation" | "search" | "action" | "info";
}

export interface VoiceCommandResult {
  isListening: boolean;
  isWakeWordActive: boolean;
  transcript: string;
  lastCommand: string;
  confidence: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  speak: (text: string) => void;
  executeCommand: (command: string) => boolean;
  availableCommands: VoiceCommand[];
}

export function useVoiceCommands(): VoiceCommandResult {
  const navigate = useNavigate();
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  /**
   * Text-to-speech function
   */
  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  }, []);

  /**
   * Define voice commands
   */
  const availableCommands: VoiceCommand[] = [
    // Navigation Commands
    {
      command: "go home",
      action: () => {
        navigate("/");
        speak("Going to home page");
      },
      description: "Navigate to home page",
      category: "navigation",
    },
    {
      command: "show jobs",
      action: () => {
        navigate("/jobs");
        speak("Showing job listings");
      },
      description: "View job listings",
      category: "navigation",
    },
    {
      command: "show marketplace",
      action: () => {
        navigate("/marketplace");
        speak("Opening marketplace");
      },
      description: "View marketplace items",
      category: "navigation",
    },
    {
      command: "show services",
      action: () => {
        navigate("/services");
        speak("Showing services");
      },
      description: "View available services",
      category: "navigation",
    },
    {
      command: "show rentals",
      action: () => {
        navigate("/rentals");
        speak("Showing rental properties");
      },
      description: "View rental listings",
      category: "navigation",
    },
    {
      command: "open chat",
      action: () => {
        navigate("/chat");
        speak("Opening messages");
      },
      description: "Open chat messages",
      category: "navigation",
    },
    {
      command: "open cart",
      action: () => {
        navigate("/cart");
        speak("Opening shopping cart");
      },
      description: "View shopping cart",
      category: "navigation",
    },
    {
      command: "my profile",
      action: () => {
        navigate("/profile");
        speak("Opening your profile");
      },
      description: "View your profile",
      category: "navigation",
    },
    {
      command: "my ads",
      action: () => {
        navigate("/advertisements");
        speak("Showing your advertisements");
      },
      description: "View your advertisements",
      category: "navigation",
    },

    // Search Commands
    {
      command: "search",
      action: () => {
        const searchQuery = transcript.replace(/mama\s+search\s+/i, "").trim();
        if (searchQuery) {
          navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
          speak(`Searching for ${searchQuery}`);
        } else {
          speak("What would you like to search for?");
        }
      },
      description: 'Search for items (e.g., "search laptop")',
      category: "search",
    },
    {
      command: "find jobs",
      action: () => {
        const query = transcript.replace(/mama\s+find\s+jobs\s+/i, "").trim();
        navigate(`/jobs?q=${encodeURIComponent(query)}`);
        speak(`Finding ${query} jobs`);
      },
      description: 'Search for jobs (e.g., "find jobs in technology")',
      category: "search",
    },

    // Action Commands
    {
      command: "post job",
      action: () => {
        navigate("/post-job");
        speak("Opening job posting form");
      },
      description: "Create a new job listing",
      category: "action",
    },
    {
      command: "sell item",
      action: () => {
        navigate("/sell");
        speak("Opening item listing form");
      },
      description: "List an item for sale",
      category: "action",
    },
    {
      command: "offer service",
      action: () => {
        navigate("/offer-service");
        speak("Opening service listing form");
      },
      description: "Offer a service",
      category: "action",
    },
    {
      command: "list property",
      action: () => {
        navigate("/list-property");
        speak("Opening property listing form");
      },
      description: "List a property for rent",
      category: "action",
    },

    // Info Commands
    { command: "help",
      action: () => {
        speak(
          'You can say commands like: go home, show jobs, search for items, post job, open chat, or my profile. Say "what can you do" to hear all available commands.',
        );
      },
      description: "Get help with voice commands",
      category: "info",
    },
    {
      command: "what can you do",
      action: () => {
        const categories = {
          navigation: "Navigate to pages",
          search: "Search for items and jobs",
          action: "Post listings and items",
          info: "Get information and help",
        };
        const commandList = Object.entries(categories)
          .map(([_, desc]) => desc)
          .join(", ");
        speak(
          `I can help you with: ${commandList}. Try saying "help" for examples.`,
        );
      },
      description: "List all capabilities",
      category: "info",
    },
    {
      command: "stop",
      action: () => {
        setIsWakeWordActive(false);
        SpeechRecognition.stopListening();
        speak("Voice control stopped");
      },
      description: "Stop voice control",
      category: "action",
    },
  ];

  /**
   * Parse and execute command
   */
  const executeCommand = useCallback(
    (commandText: string): boolean => {
      const normalizedCommand = commandText.toLowerCase().trim();

      // Find matching command
      const matchedCommand = availableCommands.find((cmd) =>
        normalizedCommand.includes(cmd.command),
      );

      if (matchedCommand) {
        setLastCommand(matchedCommand.command);
        matchedCommand.action();
        return true;
      }

      // No command found
      setError("Command not recognized");
      speak(
        "I didn't understand that command. Say 'help' to hear what I can do.",
      );
      return false;
    },
    [availableCommands, speak],
  );

  /**
   * Check for wake word and commands
   */
  useEffect(() => {
    if (!transcript) return;

    const normalizedTranscript = transcript.toLowerCase().trim();

    // Check for wake word "Mama"
    if (normalizedTranscript.includes("mama") && !isWakeWordActive) {
      setIsWakeWordActive(true);
      speak("Yes? How can I help you?");
      resetTranscript();
      return;
    }

    // Process commands if wake word is active
    if (isWakeWordActive) {
      // Remove "mama" from transcript for command processing
      const command = normalizedTranscript.replace(/mama/gi, "").trim();

      if (command.length > 0) {
        const executed = executeCommand(command);
        if (executed) {
          resetTranscript();
          // Auto-deactivate after command (or keep active based on preference)
          setTimeout(() => {
            setIsWakeWordActive(false);
          }, 2000);
        }
      }
    }
  }, [transcript, isWakeWordActive, executeCommand, resetTranscript, speak]);

  /**
   * Start listening
   */
  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      setError("Browser does not support speech recognition");
      return;
    }

    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
    setError(null);
  }, [browserSupportsSpeechRecognition]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
    setIsWakeWordActive(false);
  }, []);

  // Auto-start listening on mount (optional)
  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      // Uncomment to auto-start
      // startListening();
    }

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [browserSupportsSpeechRecognition]);

  return { isListening: listening,
    isWakeWordActive,
    transcript,
    lastCommand,
    confidence: 0, // Can be enhanced with confidence scores
    error,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    executeCommand,
    availableCommands
  };
}

/**
 * COMMAND CATEGORIES
 */
export const VOICE_COMMAND_CATEGORIES = {
  navigation: "Navigation",
  search: "Search",
  action: "Actions",
  info: "Information",
} as const;

/**
 * EXAMPLE COMMANDS
 */
export const EXAMPLE_COMMANDS = [
  "Mama, go home",
  "Mama, show jobs",
  "Mama, search laptop",
  "Mama, open chat",
  "Mama, post job",
  "Mama, help",
  "Mama, what can you do",
];
