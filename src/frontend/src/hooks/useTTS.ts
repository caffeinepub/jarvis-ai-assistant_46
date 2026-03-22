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
    (
      text: string,
      speed: number,
      pitch: number,
      preferFemale: boolean,
    ): Promise<void> => {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.pitch = pitch;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const enVoices = voices.filter((v) => v.lang.startsWith("en"));

        let selectedVoice: SpeechSynthesisVoice | undefined;

        if (preferFemale) {
          // Try to find a female voice
          selectedVoice =
            enVoices.find(
              (v) =>
                v.name.toLowerCase().includes("female") ||
                v.name.toLowerCase().includes("woman") ||
                v.name.toLowerCase().includes("zira") ||
                v.name.toLowerCase().includes("samantha") ||
                v.name.toLowerCase().includes("victoria") ||
                v.name.toLowerCase().includes("karen") ||
                v.name.toLowerCase().includes("moira") ||
                v.name.toLowerCase().includes("tessa") ||
                v.name.toLowerCase().includes("fiona"),
            ) ||
            enVoices.find(
              (v) =>
                !v.name.toLowerCase().includes("male") &&
                !v.name.toLowerCase().includes("man"),
            ) ||
            enVoices[0];
        } else {
          // Try to find a male voice
          selectedVoice =
            enVoices.find(
              (v) =>
                v.name.toLowerCase().includes("male") ||
                v.name.toLowerCase().includes("man") ||
                v.name.toLowerCase().includes("daniel") ||
                v.name.toLowerCase().includes("david") ||
                v.name.toLowerCase().includes("james") ||
                v.name.toLowerCase().includes("alex"),
            ) || enVoices[0];
        }

        if (selectedVoice) utterance.voice = selectedVoice;
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
      browserPitch = 0.9,
      preferFemale = false,
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
        // Fallback to browser TTS with character-specific pitch/gender
        try {
          await speakWithBrowserTTS(text, speed, browserPitch, preferFemale);
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
