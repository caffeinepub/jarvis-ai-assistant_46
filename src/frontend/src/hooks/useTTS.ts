import { useCallback, useRef } from "react";

const ELEVENLABS_API_KEY =
  "sk_1853e3d4a1ec41c56279c03db0562e18b735421652302533";

// Hindi voice IDs — always use language_code="hi" for these
const HINDI_VOICE_IDS = new Set([
  "mttGjNqgkgo5cciwsyoc",
  "RXe6OFmxoC0nlSWpuCDy",
  "WeK8ylKjTV2trMlayizC",
  "QO2wwSVI9F7DwU5uUXDX",
]);

// Cache for voice name → ID lookups (avoids repeated API calls)
const voiceIdCache: Record<string, string> = {};

async function resolveVoiceId(
  voiceId: string,
  voiceName: string,
): Promise<string> {
  // If a hardcoded ID is provided, use it directly
  if (voiceId && voiceId.trim() !== "") return voiceId;

  // Check cache first
  const cacheKey = voiceName.toLowerCase();
  if (voiceIdCache[cacheKey]) return voiceIdCache[cacheKey];

  // Fetch voice list and find by name
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
    });
    if (!res.ok) throw new Error(`Voices list fetch failed: ${res.status}`);
    const data = await res.json();
    const match = (data.voices as { voice_id: string; name: string }[]).find(
      (v) => v.name.toLowerCase() === voiceName.toLowerCase(),
    );
    if (match) {
      voiceIdCache[cacheKey] = match.voice_id;
      return match.voice_id;
    }
    throw new Error(`Voice "${voiceName}" not found in ElevenLabs library`);
  } catch (err) {
    throw new Error(`Could not resolve voice ID for "${voiceName}": ${err}`);
  }
}

// ── Hinglish phonetic dictionary (110+ words) ──────────────────────────────
const HINGLISH_REPLACEMENTS: [RegExp, string][] = [
  // Question words
  [/\bkya\b/gi, "kyaa"],
  [/\bkyun\b/gi, "kyoon"],
  [/\bkaise\b/gi, "kae-se"],
  [/\bkaisa\b/gi, "kae-saa"],
  [/\bkaisi\b/gi, "kae-see"],
  [/\bkab\b/gi, "kab"],
  [/\bkahan\b/gi, "ka-haan"],
  [/\bkitna\b/gi, "kit-naa"],
  [/\bkitni\b/gi, "kit-nee"],
  [/\bkitne\b/gi, "kit-ne"],
  [/\bkaun\b/gi, "kow-n"],
  // Pronouns
  [/\bmai\b/gi, "main"],
  [/\bmain\b/gi, "main"],
  [/\btu\b/gi, "too"],
  [/\btum\b/gi, "tum"],
  [/\baap\b/gi, "aap"],
  [/\bvo\b/gi, "woh"],
  [/\bwoh\b/gi, "woh"],
  [/\bham\b/gi, "hum"],
  [/\bhum\b/gi, "hum"],
  [/\bise\b/gi, "i-se"],
  [/\buse\b/gi, "u-se"],
  [/\bunhe\b/gi, "un-he"],
  [/\binhe\b/gi, "in-he"],
  // To be / verbs
  [/\bhai\b/gi, "hae"],
  [/\bhain\b/gi, "haen"],
  [/\btha\b/gi, "thaa"],
  [/\bthi\b/gi, "thee"],
  [/\bthe\b/gi, "the"],
  [/\bho\b/gi, "ho"],
  [/\bhoga\b/gi, "ho-gaa"],
  [/\bhogi\b/gi, "ho-gee"],
  [/\bhoge\b/gi, "ho-ge"],
  [/\bhona\b/gi, "ho-naa"],
  [/\bkarna\b/gi, "kar-naa"],
  [/\bkarta\b/gi, "kar-taa"],
  [/\bkarti\b/gi, "kar-tee"],
  [/\bkaro\b/gi, "karo"],
  [/\bkiya\b/gi, "ki-yaa"],
  [/\bbol\b/gi, "bol"],
  [/\bbolta\b/gi, "bol-taa"],
  [/\bbolti\b/gi, "bol-tee"],
  [/\bbolna\b/gi, "bol-naa"],
  [/\bja\b/gi, "jaa"],
  [/\bjaana\b/gi, "jaa-naa"],
  [/\bjao\b/gi, "jao"],
  [/\baa\b/gi, "aa"],
  [/\baana\b/gi, "aa-naa"],
  [/\baao\b/gi, "aa-o"],
  [/\bdekh\b/gi, "dekh"],
  [/\bdekhna\b/gi, "dekh-naa"],
  [/\bsun\b/gi, "sun"],
  [/\bsunna\b/gi, "sun-naa"],
  [/\bsuno\b/gi, "su-no"],
  [/\bsamajh\b/gi, "sa-majh"],
  [/\bsamjha\b/gi, "sam-jhaa"],
  [/\bpata\b/gi, "pa-taa"],
  [/\bpata nahi\b/gi, "pa-taa na-heen"],
  // Negation
  [/\bnahi\b/gi, "na-heen"],
  [/\bnahin\b/gi, "na-heen"],
  [/\bnhin\b/gi, "na-heen"],
  [/\bmat\b/gi, "mat"],
  [/\bna\b/gi, "naa"],
  // Common adjectives
  [/\bacha\b/gi, "a-chaa"],
  [/\bachi\b/gi, "a-chee"],
  [/\bache\b/gi, "a-che"],
  [/\btheek\b/gi, "theek"],
  [/\bsahi\b/gi, "sa-hee"],
  [/\bgalat\b/gi, "ga-lat"],
  [/\bbura\b/gi, "bu-raa"],
  [/\bsundar\b/gi, "sun-dar"],
  [/\bbada\b/gi, "ba-daa"],
  [/\bchhota\b/gi, "chho-taa"],
  [/\bnaya\b/gi, "na-yaa"],
  [/\bpurana\b/gi, "pu-raa-naa"],
  [/\bthoda\b/gi, "tho-daa"],
  [/\bthodi\b/gi, "tho-dee"],
  [/\bzyada\b/gi, "zyaa-daa"],
  [/\bkam\b/gi, "kam"],
  // Common nouns / address
  [/\bbhai\b/gi, "bhaa-ee"],
  [/\byaar\b/gi, "yaar"],
  [/\bsir\b/gi, "sir"],
  [/\bboss\b/gi, "boss"],
  [/\bdost\b/gi, "dost"],
  [/\bbhai sahab\b/gi, "bhaa-ee saa-hab"],
  [/\bsaab\b/gi, "saa-hab"],
  // Conjunctions / misc
  [/\baur\b/gi, "aur"],
  [/\bya\b/gi, "yaa"],
  [/\bpar\b/gi, "par"],
  [/\bpe\b/gi, "pe"],
  [/\bse\b/gi, "se"],
  [/\bko\b/gi, "ko"],
  [/\bka\b/gi, "kaa"],
  [/\bki\b/gi, "kee"],
  [/\bke\b/gi, "ke"],
  [/\bmein\b/gi, "mein"],
  [/\bme\b/gi, "mein"],
  [/\bnei\b/gi, "ne"],
  [/\btoh\b/gi, "toh"],
  [/\bto\b/gi, "toh"],
  [/\bab\b/gi, "ab"],
  [/\bphir\b/gi, "phir"],
  [/\bfir\b/gi, "phir"],
  [/\bjab\b/gi, "jab"],
  [/\btab\b/gi, "tab"],
  [/\bsab\b/gi, "sab"],
  [/\bkuch\b/gi, "kuch"],
  [/\bkoi\b/gi, "ko-ee"],
  [/\bsirf\b/gi, "sirf"],
  [/\bbas\b/gi, "bas"],
  [/\bruk\b/gi, "ruk"],
  [/\bji\b/gi, "jee"],
  [/\bahh\b/gi, "ah"],
  // Verb suffixes / words
  [/\bwala\b/gi, "waa-laa"],
  [/\bwali\b/gi, "waa-lee"],
  [/\bwale\b/gi, "waa-le"],
  [/\bwaala\b/gi, "waa-laa"],
  [/\bwaali\b/gi, "waa-lee"],
  // Numbers in Hinglish context
  [/\bek\b/gi, "ek"],
  [/\bdono\b/gi, "do-no"],
  [/\bteen\b/gi, "teen"],
  [/\bchar\b/gi, "chaar"],
  [/\bpaanch\b/gi, "paanch"],
  // Affirmations
  [/\bhaan\b/gi, "haan"],
  [/\bhan\b/gi, "haan"],
  [/\bok\b/gi, "o-ke"],
  [/\bchalo\b/gi, "cha-lo"],
  [/\bbadhiya\b/gi, "badh-i-yaa"],
  [/\bshukriya\b/gi, "shuk-ri-yaa"],
];

function preprocessText(
  text: string,
  language: "english" | "hindi" | "hinglish",
): string {
  if (language === "english") return text;

  if (language === "hinglish") {
    let out = text;
    for (const [pattern, replacement] of HINGLISH_REPLACEMENTS) {
      out = out.replace(pattern, replacement);
    }
    return out;
  }

  // Hindi (Devanagari): ElevenLabs multilingual v2 handles natively with language_code="hi"
  return text;
}

export function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      const a = audioRef.current;
      audioRef.current = null;
      try {
        a.pause();
        a.src = "";
      } catch {
        /* ignore */
      }
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
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
      voiceName: string,
      speed = 1.0,
      language: "english" | "hindi" | "hinglish" = "english",
      voiceStability = 0.5,
      voiceSimilarityBoost = 0.75,
      voiceStyle = 0,
    ): Promise<{ audio: HTMLAudioElement; url: string }> => {
      const processedText = preprocessText(text, language);

      // Resolve voice ID (supports name-based dynamic lookup for voices without hardcoded IDs)
      const resolvedId = await resolveVoiceId(voiceId, voiceName);

      const bodyPayload: Record<string, unknown> = {
        text: processedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: voiceStability,
          similarity_boost: voiceSimilarityBoost,
          style: voiceStyle,
          use_speaker_boost: true,
          speed: speed,
        },
      };

      if (language === "hindi" || HINDI_VOICE_IDS.has(resolvedId)) {
        bodyPayload.language_code = "hi";
      }

      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${resolvedId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify(bodyPayload),
        },
      );

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        console.error(
          `[JARVIS TTS] ElevenLabs failed — voice ID: ${resolvedId}, status: ${res.status}, response: ${errorText.slice(0, 300)}`,
        );
        throw new Error(
          `ElevenLabs API error ${res.status}: ${errorText.slice(0, 120)}`,
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.preload = "auto";
      // No onended here — caller handles cleanup and URL revocation
      return { audio, url };
    },
    [],
  );

  const speak = useCallback(
    async (
      text: string,
      speed = 1.0,
      elevenLabsVoiceName = "",
      onEnd?: () => void,
      browserPitch = 0.9,
      preferFemale = false,
      elevenLabsVoiceId = "dtSEyYGNJqjrtBArPCVZ",
      language: "english" | "hindi" | "hinglish" = "english",
      voiceStability = 0.75,
      voiceSimilarityBoost = 0.88,
      voiceStyle = 0.12,
    ): Promise<void> => {
      stopSpeaking();

      try {
        const { audio, url } = await speakWithElevenLabs(
          text,
          elevenLabsVoiceId,
          elevenLabsVoiceName,
          speed,
          language,
          voiceStability,
          voiceSimilarityBoost,
          voiceStyle,
        );
        audioRef.current = audio;

        const cleanup = () => {
          URL.revokeObjectURL(url);
          if (audioRef.current === audio) audioRef.current = null;
        };

        audio.onended = () => {
          cleanup();
          onEnd?.();
        };
        audio.onerror = () => {
          cleanup();
          onEnd?.();
        };
        await audio.play();
      } catch (err) {
        console.warn(
          `[JARVIS TTS] ElevenLabs failed for voice "${elevenLabsVoiceName}", falling back to browser TTS.`,
          err,
        );
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
      elevenLabsVoiceName: string,
      browserPitch: number,
      browserRate: number,
      preferFemale: boolean,
      onEnd?: () => void,
      elevenLabsVoiceId = "dtSEyYGNJqjrtBArPCVZ",
      voiceStability = 0.75,
      voiceSimilarityBoost = 0.88,
      voiceStyle = 0.12,
    ): Promise<void> => {
      stopSpeaking();

      try {
        const { audio, url } = await speakWithElevenLabs(
          text,
          elevenLabsVoiceId,
          elevenLabsVoiceName,
          1.0,
          "english",
          voiceStability,
          voiceSimilarityBoost,
          voiceStyle,
        );
        audioRef.current = audio;

        const cleanup = () => {
          URL.revokeObjectURL(url);
          if (audioRef.current === audio) audioRef.current = null;
        };

        audio.onended = () => {
          cleanup();
          onEnd?.();
        };
        audio.onerror = () => {
          cleanup();
          onEnd?.();
        };
        await audio.play();
      } catch (err) {
        console.warn(
          `[JARVIS TTS] ElevenLabs sample failed for "${elevenLabsVoiceName}", falling back to browser TTS.`,
          err,
        );
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
