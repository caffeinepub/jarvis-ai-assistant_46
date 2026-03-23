import { useCallback, useRef, useState } from "react";

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

type SpeechRecognitionErrorEvent = {
  error: string;
};

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const isActiveRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentLangRef = useRef<"english" | "hindi" | "hinglish">("english");

  const isSupported = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  const startListening = useCallback(
    (lang: "english" | "hindi" | "hinglish" = "english") => {
      if (!isSupported) {
        setError("Speech recognition is not supported in this browser.");
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      // Clear any pending restart
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      // Stop any existing recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }

      isActiveRef.current = true;
      currentLangRef.current = lang;

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      finalTranscriptRef.current = "";

      const langMap = {
        english: "en-US",
        hindi: "hi-IN",
        hinglish: "en-IN",
      };

      recognition.lang = langMap[lang];
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (e: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const result = e.results[i];
          if (result[0]) {
            if (result.isFinal) {
              finalTranscriptRef.current += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }
        }
        setTranscript(finalTranscriptRef.current + interimTranscript);
      };

      recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
        if (e.error !== "no-speech" && e.error !== "aborted") {
          setError(e.error);
        }
        // Don't set isListening false here — onend will fire after onerror
      };

      recognition.onend = () => {
        // If user explicitly started and hasn't stopped, auto-restart (Chrome mobile fix)
        if (isActiveRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (!isActiveRef.current) return;
            const SR =
              window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR) return;
            const newRecognition = new SR();
            recognitionRef.current = newRecognition;
            newRecognition.lang = langMap[currentLangRef.current];
            newRecognition.continuous = true;
            newRecognition.interimResults = true;

            newRecognition.onresult = recognition.onresult;
            newRecognition.onerror = recognition.onerror;
            newRecognition.onend = recognition.onend;

            try {
              newRecognition.start();
            } catch {
              /* ignore */
            }
          }, 200);
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      setIsListening(true);
      setTranscript("");
      setError(null);
    },
    [isSupported],
  );

  const stopListening = useCallback(() => {
    isActiveRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    error,
    isSupported,
    clearTranscript,
  };
}
