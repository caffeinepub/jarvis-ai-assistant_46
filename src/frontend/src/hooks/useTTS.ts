import { useCallback, useRef } from "react";

const TTS_API_KEY = "sk-tts-473045180c7b4ce88c8d35dad59e5517";

export function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
  }, []);

  const speakWithBrowserTTS = useCallback(
    (text: string, speed: number): Promise<void> => {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.pitch = 0.9;
        utterance.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find(
            (v) => v.lang === "en-US" && v.name.toLowerCase().includes("male"),
          ) ||
          voices.find((v) => v.lang === "en-US") ||
          voices[0];
        if (preferred) utterance.voice = preferred;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    },
    [],
  );

  const speak = useCallback(
    async (
      text: string,
      speed = 1.0,
      voiceName = "en-US-Neural2-D",
      onEnd?: () => void,
    ): Promise<void> => {
      stopSpeaking();

      try {
        const res = await fetch("https://api.tts.ai/v1/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TTS_API_KEY}`,
          },
          body: JSON.stringify({ text, voice: voiceName, speed }),
        });

        if (!res.ok) throw new Error("TTS API failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          onEnd?.();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          onEnd?.();
        };
        await audio.play();
      } catch {
        // Fallback to browser TTS
        try {
          await speakWithBrowserTTS(text, speed);
        } catch {
          // silent
        } finally {
          onEnd?.();
        }
      }
    },
    [stopSpeaking, speakWithBrowserTTS],
  );

  return { speak, stopSpeaking };
}
