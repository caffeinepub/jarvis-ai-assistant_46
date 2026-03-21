export interface Message {
  id: string;
  role: "user" | "jarvis";
  content: string;
  timestamp: Date;
}

export interface AppSettings {
  language: "english" | "hindi" | "hinglish";
  ttsEnabled: boolean;
  voiceInputEnabled: boolean;
  voiceSpeed: number;
  voiceName: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: "english",
  ttsEnabled: true,
  voiceInputEnabled: true,
  voiceSpeed: 1.0,
  voiceName: "en-US-Neural2-D",
};

export type AppStatus = "idle" | "listening" | "processing" | "speaking";
