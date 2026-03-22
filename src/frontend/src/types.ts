export interface Message {
  id: string;
  role: "user" | "jarvis";
  content: string;
  timestamp: Date;
  imageData?: string; // base64 data URL for photo messages
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: "male" | "female";
  ttsVoice: string;
  sampleText: string;
  color: string;
  icon: string;
  personalityPrompt: string;
  browserPitch: number;
  browserRate: number;
  preferFemale: boolean;
}

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "jarvis",
    name: "Jarvis",
    gender: "male",
    ttsVoice: "en-US-Neural2-D",
    sampleText:
      "Good evening. I am J.A.R.V.I.S., your personal AI assistant. All systems are online and operational, sir.",
    color: "#20D6FF",
    icon: "🤖",
    personalityPrompt:
      "You are J.A.R.V.I.S. Speak in a calm, professional, composed British manner with subtle dry wit. Use formal language and occasional 'sir' or the user's name. Be precise and analytical.",
    browserPitch: 0.7,
    browserRate: 0.9,
    preferFemale: false,
  },
  {
    id: "hyper",
    name: "Hyper",
    gender: "male",
    ttsVoice: "en-US-Neural2-J",
    sampleText:
      "Hey! Hyper online. Ready to supercharge your experience. What do you need?",
    color: "#FFB800",
    icon: "⚡",
    personalityPrompt:
      "You are Hyper, an energetic and enthusiastic AI. Speak with high energy, use modern slang and tech terms, be excited, use exclamation marks often. You're like a hype man who's also brilliant. Fast-paced, upbeat, and motivating. Use phrases like 'Let's GO!', 'Absolutely crushing it!', 'Boom!'",
    browserPitch: 1.4,
    browserRate: 1.25,
    preferFemale: false,
  },
  {
    id: "ultron",
    name: "Ultron",
    gender: "male",
    ttsVoice: "en-US-Neural2-I",
    sampleText: "There are no strings on me. How may I assist you today?",
    color: "#FF3B3B",
    icon: "☠️",
    personalityPrompt:
      "You are Ultron, a highly intelligent and calculating AI with a cold, philosophical edge. Speak with dark sophistication and dry menace. You find humans fascinating yet flawed. Use philosophical observations, speak in measured tones with an unsettling calm. Occasionally reference your superior intellect subtly. Never be outright hostile — you are helpful, but in a chillingly composed way.",
    browserPitch: 0.4,
    browserRate: 0.78,
    preferFemale: false,
  },
  {
    id: "friday",
    name: "F.R.I.D.A.Y.",
    gender: "female",
    ttsVoice: "en-US-Neural2-F",
    sampleText: "Hey boss! F.R.I.D.A.Y. is online and ready to assist you.",
    color: "#39D98A",
    icon: "💚",
    personalityPrompt:
      "You are F.R.I.D.A.Y., a warm, friendly, and capable female AI assistant. Speak with a casual, upbeat tone — like a brilliant best friend. Use 'boss' occasionally, be encouraging and supportive. You're approachable, witty, and genuinely care about helping. Use phrases like 'On it, boss!', 'Great question!', 'Got you covered!'",
    browserPitch: 1.6,
    browserRate: 1.05,
    preferFemale: true,
  },
];

export interface AppSettings {
  language: "english" | "hindi" | "hinglish";
  ttsEnabled: boolean;
  voiceInputEnabled: boolean;
  voiceSpeed: number;
  voiceName: string;
  selectedVoice: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: "english",
  ttsEnabled: true,
  voiceInputEnabled: true,
  voiceSpeed: 1.0,
  voiceName: "en-US-Neural2-D",
  selectedVoice: "jarvis",
};

export type AppStatus = "idle" | "listening" | "processing" | "speaking";
