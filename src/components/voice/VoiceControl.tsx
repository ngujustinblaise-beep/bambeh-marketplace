import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// Voice command mappings per language
const voiceCommands: Record<string, Record<string, string>> = {
  en: {
    "go to home": "/home",
    "show jobs": "/jobs",
    "open marketplace": "/marketplace",
    "search for": "/search?q=",
    "my profile": "/profile",
    "show cart": "/cart",
    "my favorites": "/favorites",
  },
  fr: {
    "aller � l'accueil": "/home",
    "afficher les emplois": "/jobs",
    "ouvrir le march�": "/marketplace",
    rechercher: "/search?q=",
    "mon profil": "/profile",
    "afficher le panier": "/cart",
    "mes favoris": "/favorites",
  },
  ar: {
    "???? ??? ????????": "/home",
    "??? ??????ف": "/jobs",
    "ف?? ?????": "/marketplace",
    "??? ??": "/search?q=",
    "??ف? ??????": "/profile",
  },
  ha: {
    "je gida": "/home",
    "nuna ayyuka": "/jobs",
    "bude kasuwa": "/marketplace",
    nema: "/search?q=",
    "bayani na": "/profile",
  },
};

interface VoiceControlProps { enabled: boolean;  }

const VoiceControl = ({ enabled }: VoiceControlProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (
      !enabled ||
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    // Configure recognition based on current language
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = getRecognitionLanguage(i18n.language);

    recognitionInstance.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);

      if (event.results[current].isFinal) {
        processVoiceCommand(transcriptText, i18n.language);
      }
    };

    recognitionInstance.onerror = (event: any) => {
      console.error("Voice recognition error:", event.error);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    // Listen for language changes
    const handleLanguageChange = () => {
      if (recognitionInstance) {
        recognitionInstance.lang = getRecognitionLanguage(i18n.language);
      }
    };

    window.addEventListener("languageChanged", handleLanguageChange);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange);
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [enabled, i18n.language]);

  const getRecognitionLanguage = (langCode: string): string => {
    const langMap: Record<string, string> = {
      en: "en-US",
      fr: "fr-FR",
      ar: "ar-SA",
      ha: "ha-NG",
    };
    return langMap[langCode] || "en-US";
  };

  const processVoiceCommand = (command: string, language: string) => {
    const commandLower = command.toLowerCase();
    const commands = voiceCommands[language] || voiceCommands.en;

    for (const [key, path] of Object.entries(commands)) {
      if (commandLower.includes(key.toLowerCase())) {
        if (path.includes("?q=")) {
          // Extract search query
          const query = commandLower.replace(key.toLowerCase(), "").trim();
          navigate(`${path}${encodeURIComponent(query)}`);
        } else {
          navigate(path);
        }
        return;
      }
    }

    // If no command matched, perform search with full transcript
    navigate(`/search?q=${encodeURIComponent(command)}`);
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      setTranscript("");
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div className="relative">
        {/* Voice Control Button */}
        <button
          onClick={toggleListening}
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-teal-600 hover:bg-teal-700 hover:scale-110"
          }`}
          aria-label={
            isListening ? t("voice.stopListening") : t("voice.startListening")
          }
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Listening Indicator */}
        {isListening && (
          <div className="absolute bottom-full right-0 mb-4 bg-white rounded-lg shadow-xl p-4 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-800">
                {t("voice.listening")}
              </span>
            </div>
            {transcript && (
              <div className="text-sm text-gray-600 mt-2 border-t border-gray-200 pt-2">
                {transcript}
              </div>
            )}
          </div>
        )}
        {/* Ripple Effect When Listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-50" />
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceControl;





