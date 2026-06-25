/**
 * src/components/voice/MovableVoiceControl.tsx
 * FIXES: Removes duplicate isFinal/length/transcript/confidence declarations (TS2687)
 * Rebuilt clean with proper interface merging
 */
import React, { useState, useRef, useCallback, useEffect } from "react";

// --- Types --------------------------------------------------------------------
interface SpeechResultItem {
  transcript: string;   // single declaration
  confidence: number;   // single declaration
  isFinal: boolean;     // single declaration
  length: number;       // single declaration
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: SpeechResultItem;
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface MovableVoiceControlProps {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onCommand?: (command: string) => void;
  lang?: string;
  className?: string;
}

// --- Component ---------------------------------------------------------------
const MovableVoiceControl: React.FC<MovableVoiceControlProps> = ({
  onTranscript,
  onCommand,
  lang = "fr-CM",
  className = "",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognitionClass));
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) { setError("Voice not supported"); return; }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); setError(null); };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(e.error);
      setIsListening(false);
    };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const text = result[0].transcript;
        if (result.isFinal) final += text;
        else interim += text;
      }
      const combined = final || interim;
      setTranscript(combined);
      onTranscript?.(combined, Boolean(final));
      if (final && onCommand) onCommand(final.trim().toLowerCase());
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [lang, onTranscript, onCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 60, dragStartRef.current.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 60, dragStartRef.current.py + dy)),
      });
    };
    const handleMouseUp = () => { setIsDragging(false); dragStartRef.current = null; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!isSupported) return null;

  return (
    <div
      ref={widgetRef}
      className={`fixed z-50 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"} ${className}`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1 flex flex-col items-center gap-1 min-w-[52px]">
        <button
          onClick={toggleListening}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-teal-600 hover:bg-teal-700"
          }`}
          title={isListening ? "Arr�ter" : "Parler"}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            {isListening ? (
              <rect x="4" y="4" width="12" height="12" rx="1" />
            ) : (
              <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm-1 9.93A7.001 7.001 0 0017 9a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7.001 7.001 0 006 6.93V18H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" />
            )}
          </svg>
        </button>

        {transcript && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded max-w-[200px] text-center whitespace-nowrap overflow-hidden text-ellipsis">
            {transcript.slice(0, 60)}{transcript.length > 60 ? "�" : ""}
          </div>
        )}

        {error && (
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded whitespace-nowrap">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovableVoiceControl;





