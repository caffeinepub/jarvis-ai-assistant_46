import { useCallback, useRef } from "react";

const ELEVENLABS_API_KEY =
  "sk_1853e3d4a1ec41c56279c03db0562e18b735421652302533";

// Module-level cache for ElevenLabs voice IDs (name -> id)
let voiceCache: Record<string, string> | null = null;
let voiceCacheFetching: Promise<Record<string, string>> | null = null;

async function fetchElevenLabsVoices(): Promise<Record<string, string>> {
  if (voiceCache) return voiceCache;
  if (voiceCacheFetching) return voiceCacheFetching;

  voiceCacheFetching = fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch voices");
      return res.json();
    })
    .then((data) => {
      const cache: Record<string, string> = {};
      for (const v of data.voices ?? []) {
        cache[v.name.toLowerCase()] = v.voice_id;
      }
      voiceCache = cache;
      voiceCacheFetching = null;
      return cache;
    })
    .catch(() => {
      voiceCacheFetching = null;
      return {};
    });

  return voiceCacheFetching;
}

async function getElevenLabsVoiceId(name: string): Promise<string | null> {
  const cache = await fetchElevenLabsVoices();
  return cache[name.toLowerCase()] ?? null;
}

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

  const speak = useCallback(
    async (
      text: string,
      speed = 1.0,
      elevenLabsVoiceName = "Titan",
      onEnd?: () => void,
      browserPitch = 0.9,
      preferFemale = false,
    ): Promise<void> => {
      stopSpeaking();

      try {
        const voiceId = await getElevenLabsVoiceId(elevenLabsVoiceName);
        if (!voiceId) throw new Error("Voice ID not found");

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
              model_id: "eleven_monolingual_v1",
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

  // Separate function for playing sample using ElevenLabs
  const playSample = useCallback(
    async (
      text: string,
      elevenLabsVoiceName: string,
      browserPitch: number,
      browserRate: number,
      preferFemale: boolean,
      onEnd?: () => void,
    ): Promise<void> => {
      stopSpeaking();

      try {
        const voiceId = await getElevenLabsVoiceId(elevenLabsVoiceName);
        if (!voiceId) throw new Error("Voice not found");

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
              model_id: "eleven_monolingual_v1",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          },
        );

        if (!res.ok) throw new Error("ElevenLabs error");

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
        // Fallback to browser TTS for sample
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
    [stopSpeaking, speakWithBrowserTTS],
  );

  return { speak, stopSpeaking, playSample };
}
