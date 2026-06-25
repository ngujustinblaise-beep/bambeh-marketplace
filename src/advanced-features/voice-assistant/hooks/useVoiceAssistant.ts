/**
 * BAMBÉ MARKETPLACE - VOICE ASSISTANT CUSTOM HOOKS
 * Version: 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from "react";
import VoiceRecognitionService from "../services/VoiceRecognitionService";
import VoiceAssistantService from "../services/VoiceAssistantService";
import {
  VoiceRecognitionResult, ParsedCommand, VoiceResponse,
  Language, VoiceSettings, ConversationContext,
} from "../types/voice.types";

export const useVoiceAssistant = (userId: string, initialLanguage: Language = "fr") => {
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript]     = useState("");
  const [response, setResponse]         = useState<VoiceResponse | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationContext["history"]>([]);
  const [settings, setSettings]         = useState<VoiceSettings>(VoiceAssistantService.getSettings());

  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      VoiceAssistantService.initializeConversation(userId, initialLanguage);
      isInitialized.current = true;
    }

    const unsubscribeResult = VoiceRecognitionService.onResult(handleRecognitionResult);
    const unsubscribeStart  = VoiceRecognitionService.onStart(handleRecognitionStart);
    const unsubscribeEnd    = VoiceRecognitionService.onEnd(handleRecognitionEnd);
    const unsubscribeError  = VoiceRecognitionService.onError(handleRecognitionError);

    return () => {
      unsubscribeResult();
      unsubscribeStart();
      unsubscribeEnd();
      unsubscribeError();
    };
  }, [userId, initialLanguage]);

  const handleRecognitionResult = useCallback(
    async (result: VoiceRecognitionResult) => {
      setTranscript(result.transcript);
      if (result.isFinal && result.transcript.trim()) {
        setIsProcessing(true);
        try {
          const voiceResponse = await VoiceAssistantService.processVoiceInput(result.transcript);
          setResponse(voiceResponse);
          const context = VoiceAssistantService.getContext();
          if (context) setConversationHistory([...context.history]);
          if (settings.feedbackSounds) {
            await speakResponse(voiceResponse.text);
            VoiceRecognitionService.playFeedbackSound("success");
          }
        } catch (err) {
          setError("Failed to process voice input");
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      }
    },
    [settings.feedbackSounds],
  );

  const handleRecognitionStart = useCallback(() => {
    setIsListening(true);
    setTranscript("");
    setError(null);
    if (settings.feedbackSounds) VoiceRecognitionService.playFeedbackSound("start");
  }, [settings.feedbackSounds]);

  const handleRecognitionEnd = useCallback(() => {
    setIsListening(false);
    if (settings.feedbackSounds) VoiceRecognitionService.playFeedbackSound("end");
  }, [settings.feedbackSounds]);

  const handleRecognitionError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage);
      setIsListening(false);
      if (settings.feedbackSounds) VoiceRecognitionService.playFeedbackSound("error");
    },
    [settings.feedbackSounds],
  );

  const startListening = useCallback(async () => {
    const hasPermission = await VoiceRecognitionService.requestPermission();
    if (!hasPermission) { setError("Microphone permission denied"); return; }
    VoiceRecognitionService.startListening();
  }, []);

  const stopListening = useCallback(() => {
    VoiceRecognitionService.stopListening();
  }, []);

  const speakResponse = useCallback(
    async (text: string) => {
      setIsSpeaking(true);
      try {
        await VoiceRecognitionService.speak(text, settings);
      } catch (err) {
        console.error("Error speaking:", err);
      } finally {
        setIsSpeaking(false);
      }
    },
    [settings],
  );

  const stopSpeaking = useCallback(() => {
    VoiceRecognitionService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<VoiceSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      VoiceAssistantService.updateSettings(updatedSettings);
    },
    [settings],
  );

  const clearConversation = useCallback(() => {
    VoiceAssistantService.clearConversation();
    VoiceAssistantService.initializeConversation(userId, settings.language);
    setConversationHistory([]);
    setTranscript("");
    setResponse(null);
    setError(null);
  }, [userId, settings.language]);

  const isSupported = VoiceRecognitionService.isSupported();

  return {
    isListening, isSpeaking, isProcessing, transcript, response,
    error, conversationHistory, settings, isSupported,
    startListening, stopListening, speakResponse, stopSpeaking,
    updateSettings, clearConversation,
  };
};

export const useVoiceStats = () => {
  const [stats, setStats]       = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await VoiceAssistantService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, refreshStats: loadStats };
};
