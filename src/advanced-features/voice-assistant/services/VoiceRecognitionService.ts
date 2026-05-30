/**
 * BAMBÉ MARKETPLACE - VOICE RECOGNITION SERVICE
 * Speech recognition and synthesis using Web Speech API
 * Version: 1.0.0
 */

import {
  VoiceRecognitionResult,
  Language,
  VoiceSettings
} from "../types/voice.types";

class VoiceRecognitionService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private language: Language = "fr";
  private callbacks: {
    onResult: ((result: VoiceRecognitionResult) => void)[];
    onStart: (() => void)[];
    onEnd: (() => void)[];
    onError: ((error: string) => void)[];
  } = {
    onResult: [],
    onStart: [],
    onEnd: [],
    onError: [],
  };

  constructor() {
    this.initializeSpeechRecognition();
    this.synthesis = window.speechSynthesis;
  }

  /**
   * ========================================
   * SPEECH RECOGNITION
   * ========================================
   */

  /**
   * Initialize speech recognition
   */
  private initializeSpeechRecognition(): void {
    // Check if speech recognition is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.setLanguage(this.language);

    this.setupRecognitionListeners();
  }

  /**
   * Setup recognition event listeners
   */
  private setupRecognitionListeners(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onStart.forEach((cb) => cb());
    };

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      const voiceResult: VoiceRecognitionResult = {
        transcript: transcript.trim(),
        confidence,
        isFinal,
        language: this.language,
      };

      this.callbacks.onResult.forEach((cb) => cb(voiceResult));
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd.forEach((cb) => cb());
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      this.isListening = false;

      let errorMessage = "Speech recognition error";
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage =
            "Microphone not available. Please check your microphone.";
          break;
        case "not-allowed":
          errorMessage =
            "Microphone permission denied. Please allow microphone access.";
          break;
        case "network":
          errorMessage = "Network error. Please check your connection.";
          break;
      }

      this.callbacks.onError.forEach((cb) => cb(errorMessage));
    };
  }

  /**
   * Start listening
   */
  startListening(): void {
    if (!this.recognition) {
      this.callbacks.onError.forEach((cb) =>
        cb("Speech recognition not supported on this browser"),
      );
      return;
    }

    if (this.isListening) {
      console.log("Already listening");
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      this.callbacks.onError.forEach((cb) =>
        cb("Failed to start speech recognition"),
      );
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Set recognition language
   */
  setLanguage(language: Language): void {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language === "fr" ? "fr-FR" : "en-US";
    }
  }

  /**
   * Check if listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * ========================================
   * SPEECH SYNTHESIS (TEXT-TO-SPEECH)
   * ========================================
   */

  /**
   * Speak text
   */
  speak(text: string, settings?: Partial<VoiceSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language === "fr" ? "fr-FR" : "en-US";
      utterance.rate = settings?.voiceSpeed || 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Get appropriate voice
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find((voice) =>
        voice.lang.startsWith(this.language === "fr" ? "fr" : "en"),
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Check if speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * ========================================
   * EVENT CALLBACKS
   * ========================================
   */

  /**
   * Register result callback
   */
  onResult(callback: (result: VoiceRecognitionResult) => void): () => void {
    this.callbacks.onResult.push(callback);
    return () => {
      this.callbacks.onResult = this.callbacks.onResult.filter(
        (cb) => cb !== callback,
      );
    };
  }

  /**
   * Register start callback
   */
  onStart(callback: () => void): () => void {
    this.callbacks.onStart.push(callback);
    return () => {
      this.callbacks.onStart = this.callbacks.onStart.filter(
        (cb) => cb !== callback,
      );
    };
  }

  /**
   * Register end callback
   */
  onEnd(callback: () => void): () => void {
    this.callbacks.onEnd.push(callback);
    return () => {
      this.callbacks.onEnd = this.callbacks.onEnd.filter(
        (cb) => cb !== callback,
      );
    };
  }

  /**
   * Register error callback
   */
  onError(callback: (error: string) => void): () => void {
    this.callbacks.onError.push(callback);
    return () => {
      this.callbacks.onError = this.callbacks.onError.filter(
        (cb) => cb !== callback,
      );
    };
  }

  /**
   * ========================================
   * UTILITY METHODS
   * ========================================
   */

  /**
   * Request microphone permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      return false;
    }
  }

  /**
   * Play feedback sound
   */
  playFeedbackSound(type: "start" | "end" | "error" | "success"): void {
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sounds for different types
    switch (type) {
      case "start":
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.1,
        );
        break;
      case "end":
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.15,
        );
        break;
      case "error":
        oscillator.frequency.value = 300;
        oscillator.type = "square";
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2,
        );
        break;
      case "success":
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2,
        );
        break;
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopListening();
    this.stopSpeaking();
    this.callbacks = { onResult: [],
      onStart: [],
      onEnd: [],
      onError: [],
    };
  }
}

export default new VoiceRecognitionService();
