import { useState } from "react";

export function useVoiceSearch(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);

  function start() {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = document.documentElement.lang || "en";
    recognition.continuous = false;

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };

    recognition.onstart = () => setListening(true);
    recognition.onend   = () => setListening(false);

    recognition.start();
  }

  return { start, listening };
}

