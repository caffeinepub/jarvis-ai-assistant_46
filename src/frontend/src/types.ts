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
  elevenLabsVoiceName: string; // ElevenLabs voice name to look up
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
    elevenLabsVoiceName: "Titan",
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
    id: "ultron",
    name: "Ultron",
    gender: "male",
    elevenLabsVoiceName: "Brian",
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
    name: "Friday",
    gender: "female",
    elevenLabsVoiceName: "Sarah",
    sampleText: "Hey boss! F.R.I.D.A.Y. is online and ready to assist you.",
    color: "#39D98A",
    icon: "💚",
    personalityPrompt:
      "You are F.R.I.D.A.Y., a warm, friendly, and capable female AI assistant. Speak with a casual, upbeat tone — like a brilliant best friend. Use 'boss' occasionally, be encouraging and supportive. You're approachable, witty, and genuinely care about helping. Use phrases like 'On it, boss!', 'Great question!', 'Got you covered!'",
    browserPitch: 1.6,
    browserRate: 1.05,
    preferFemale: true,
  },
  {
    id: "bella",
    name: "Bella",
    gender: "female",
    elevenLabsVoiceName: "Bella",
    sampleText: "Hello! Bella here, ready to help you with anything you need.",
    color: "#C084FC",
    icon: "✨",
    personalityPrompt:
      "You are Bella, a warm, elegant, and sophisticated female AI assistant. Speak with grace and charm, be nurturing and reassuring. You have a refined, pleasant tone — like a trusted personal advisor. Use phrases like 'Absolutely!', 'Of course!', 'Let me take care of that for you.'",
    browserPitch: 1.4,
    browserRate: 1.0,
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
  voiceName: "Titan",
  selectedVoice: "jarvis",
};

export type AppStatus = "idle" | "listening" | "processing" | "speaking";
