import { useCallback, useRef } from "react";

const ELEVENLABS_API_KEY =
  "sk_1853e3d4a1ec41c56279c03db0562e18b735421652302533";

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

  const speakWithElevenLabs = useCallback(
    async (
      text: string,
      voiceId: string,
      speed = 1.0,
    ): Promise<HTMLAudioElement> => {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              speed: speed,
            },
          }),
        },
      );

      if (!res.ok) throw new Error(`ElevenLabs API error: ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => URL.revokeObjectURL(url);
      return audio;
    },
    [],
  );

  const speak = useCallback(
    async (
      text: string,
      speed = 1.0,
      _elevenLabsVoiceName = "",
      onEnd?: () => void,
      browserPitch = 0.9,
      preferFemale = false,
      elevenLabsVoiceId = "pNInz6obpgDQGcFmaJgB",
    ): Promise<void> => {
      stopSpeaking();

      try {
        const audio = await speakWithElevenLabs(text, elevenLabsVoiceId, speed);
        audioRef.current = audio;
        audio.onended = () => {
          audioRef.current = null;
          onEnd?.();
        };
        audio.onerror = () => {
          audioRef.current = null;
          onEnd?.();
        };
        await audio.play();
      } catch {
        // Fallback to browser TTS
        try {
          await speakWithBrowserTTS(text, speed, browserPitch, preferFemale);
        } catch {
          // silent
        } finally {
          onEnd?.();
        }
      }
    },
    [stopSpeaking, speakWithBrowserTTS, speakWithElevenLabs],
  );

  const playSample = useCallback(
    async (
      text: string,
      _elevenLabsVoiceName: string,
      browserPitch: number,
      browserRate: number,
      preferFemale: boolean,
      onEnd?: () => void,
      elevenLabsVoiceId = "pNInz6obpgDQGcFmaJgB",
    ): Promise<void> => {
      stopSpeaking();

      try {
        const audio = await speakWithElevenLabs(text, elevenLabsVoiceId);
        audioRef.current = audio;
        audio.onended = () => {
          audioRef.current = null;
          onEnd?.();
        };
        audio.onerror = () => {
          audioRef.current = null;
          onEnd?.();
        };
        await audio.play();
      } catch {
        try {
          await speakWithBrowserTTS(
            text,
            browserRate,
            browserPitch,
            preferFemale,
          );
        } catch {
          // silent
        } finally {
          onEnd?.();
        }
      }
    },
    [stopSpeaking, speakWithBrowserTTS, speakWithElevenLabs],
  );

  return { speak, stopSpeaking, playSample };
}
