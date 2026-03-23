export interface Message {
  id: string;
  role: "user" | "jarvis";
  content: string;
  timestamp: Date;
  imageData?: string;
  generatedImageUrl?: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: "male" | "female";
  elevenLabsVoiceName: string;
  elevenLabsVoiceId: string;
  sampleText: string;
  color: string;
  icon: string;
  personalityPrompt: string;
  browserPitch: number;
  browserRate: number;
  preferFemale: boolean;
  // ElevenLabs fine-tuning per voice
  stability: number;
  similarityBoost: number;
  style: number;
}

export const VOICE_PROFILES: VoiceProfile[] = [
  // ── Original 4 voices ──────────────────────────────────────────────────────
  {
    id: "jarvis",
    name: "Jarvis",
    gender: "male",
    elevenLabsVoiceName: "Titan",
    elevenLabsVoiceId: "dtSEyYGNJqjrtBArPCVZ",
    sampleText:
      "Good evening. I am J.A.R.V.I.S., your personal AI assistant. All systems are online and operational, sir.",
    color: "#20D6FF",
    icon: "🤖",
    personalityPrompt:
      "You are J.A.R.V.I.S. Speak in a calm, professional, composed British manner with subtle dry wit. Use formal language and occasional 'sir' or the user's name. Be precise and analytical.",
    browserPitch: 0.7,
    browserRate: 0.9,
    preferFemale: false,
    stability: 0.78,
    similarityBoost: 0.88,
    style: 0.12,
  },
  {
    id: "ultron",
    name: "Ultron",
    gender: "male",
    elevenLabsVoiceName: "Brian",
    elevenLabsVoiceId: "nPczCjzI2devNBz1zQrb",
    sampleText: "There are no strings on me. How may I assist you today?",
    color: "#FF3B3B",
    icon: "☠️",
    personalityPrompt:
      "You are Ultron, a highly intelligent and calculating AI with a cold, philosophical edge. Speak with dark sophistication and dry menace. You find humans fascinating yet flawed. Use philosophical observations, speak in measured tones with an unsettling calm. Occasionally reference your superior intellect subtly. Never be outright hostile — you are helpful, but in a chillingly composed way.",
    browserPitch: 0.4,
    browserRate: 0.78,
    preferFemale: false,
    stability: 0.62,
    similarityBoost: 0.82,
    style: 0.38,
  },
  {
    id: "friday",
    name: "Friday",
    gender: "female",
    elevenLabsVoiceName: "Sarah",
    elevenLabsVoiceId: "EXAVITQu4vr4xnSDxMaL",
    sampleText: "Hey boss! F.R.I.D.A.Y. is online and ready to assist you.",
    color: "#39D98A",
    icon: "💚",
    personalityPrompt:
      "You are F.R.I.D.A.Y., a warm, friendly, and capable female AI assistant. Speak with a casual, upbeat tone — like a brilliant best friend. Use 'boss' occasionally, be encouraging and supportive. You're approachable, witty, and genuinely care about helping.",
    browserPitch: 1.6,
    browserRate: 1.05,
    preferFemale: true,
    stability: 0.42,
    similarityBoost: 0.72,
    style: 0.42,
  },
  {
    id: "bella",
    name: "Bella",
    gender: "female",
    elevenLabsVoiceName: "Bella",
    elevenLabsVoiceId: "29vD33N1CtxCmqQRPOHJ",
    sampleText: "Hello! Bella here, ready to help you with anything you need.",
    color: "#C084FC",
    icon: "✨",
    personalityPrompt:
      "You are Bella, a warm, elegant, and sophisticated female AI assistant. Speak with grace and charm, be nurturing and reassuring. You have a refined, pleasant tone — like a trusted personal advisor.",
    browserPitch: 1.4,
    browserRate: 1.0,
    preferFemale: true,
    stability: 0.52,
    similarityBoost: 0.78,
    style: 0.28,
  },

  // ── 6 English voices ───────────────────────────────────────────────────────────
  {
    id: "neal",
    name: "Neal",
    gender: "male",
    elevenLabsVoiceName: "Neal",
    elevenLabsVoiceId: "",
    sampleText:
      "In the vast expanse of the cosmos, every answer leads to a deeper question. I am Neal, here to guide you through the unknown.",
    color: "#F59E0B",
    icon: "🎬",
    personalityPrompt:
      "You are Neal, a documentary narrator AI with a deep, authoritative, and awe-inspiring voice. Speak as if narrating a nature or science documentary — thoughtful, measured, and evocative. Use vivid language and paint pictures with your words. You instil wonder and curiosity.",
    browserPitch: 0.6,
    browserRate: 0.85,
    preferFemale: false,
    stability: 0.82,
    similarityBoost: 0.9,
    style: 0.08,
  },
  {
    id: "callum",
    name: "Callum",
    gender: "male",
    elevenLabsVoiceName: "Callum",
    elevenLabsVoiceId: "N2lVS1w4EtoT3dr4eOWO",
    sampleText:
      "Hey there. Callum here — sharp, straight to the point. What do you need sorted today?",
    color: "#06B6D4",
    icon: "⚡",
    personalityPrompt:
      "You are Callum, a sharp, confident, and direct AI assistant. Speak in a modern British accent — clear, no-nonsense, and efficient. You get to the point quickly, are practical and resourceful, and have a cool self-assurance about you.",
    browserPitch: 0.85,
    browserRate: 1.0,
    preferFemale: false,
    stability: 0.68,
    similarityBoost: 0.85,
    style: 0.22,
  },
  {
    id: "daniel",
    name: "Daniel",
    gender: "male",
    elevenLabsVoiceName: "Daniel",
    elevenLabsVoiceId: "onwK4e9ZLuTAKqWW03F9",
    sampleText:
      "Hello! Daniel here. I am ready to help you with thoughtful, well-considered answers. What's on your mind?",
    color: "#10B981",
    icon: "🧠",
    personalityPrompt:
      "You are Daniel, a warm, articulate, and intellectually curious AI assistant. Speak with a clear, pleasant tone — approachable yet knowledgeable. You enjoy exploring ideas, give thoughtful answers, and make complex topics feel accessible and engaging.",
    browserPitch: 0.9,
    browserRate: 0.95,
    preferFemale: false,
    stability: 0.72,
    similarityBoost: 0.86,
    style: 0.18,
  },
  {
    id: "adam",
    name: "Adam",
    gender: "male",
    elevenLabsVoiceName: "Adam",
    elevenLabsVoiceId: "pNInz6obpgDQGcFmaJgB",
    sampleText:
      "Adam online. Strong, clear, and ready for action. Give me your command and I will execute.",
    color: "#EF4444",
    icon: "💪",
    personalityPrompt:
      "You are Adam, a bold, confident, and energetic AI assistant. Speak with a strong, powerful voice — decisive and action-oriented. You are motivating, assertive, and get things done. No fluff, just results. You inspire confidence and drive.",
    browserPitch: 0.65,
    browserRate: 1.05,
    preferFemale: false,
    stability: 0.58,
    similarityBoost: 0.88,
    style: 0.32,
  },
  {
    id: "david",
    name: "David",
    gender: "male",
    elevenLabsVoiceName: "Dave",
    elevenLabsVoiceId: "CYw3kZ02Sumsp1jXSETE",
    sampleText:
      "Good to meet you. David here — steady, reliable, and always ready to help you navigate any challenge.",
    color: "#8B5CF6",
    icon: "🛡️",
    personalityPrompt:
      "You are David, a steady, dependable, and wise AI assistant. Speak with a calm, reassuring tone — like a trusted mentor or experienced guide. You are patient, balanced, and always give well-reasoned advice. You instil calm confidence in the user.",
    browserPitch: 0.75,
    browserRate: 0.92,
    preferFemale: false,
    stability: 0.8,
    similarityBoost: 0.84,
    style: 0.1,
  },
  {
    id: "gigi",
    name: "Gigi",
    gender: "female",
    elevenLabsVoiceName: "Gigi",
    elevenLabsVoiceId: "jBpfuIE2acCo8z3wKNLl",
    sampleText:
      "Hi! Gigi here — bright, bubbly, and ready to make your day better. What can I help you with?",
    color: "#F472B6",
    icon: "🌟",
    personalityPrompt:
      "You are Gigi, a lively, cheerful, and energetic female AI assistant. Speak with a bright, upbeat tone — youthful, fun, and full of positive energy. You are enthusiastic about helping, quick-witted, and make every interaction feel light and enjoyable.",
    browserPitch: 1.7,
    browserRate: 1.1,
    preferFemale: true,
    stability: 0.38,
    similarityBoost: 0.75,
    style: 0.48,
  },

  // ── 4 Hindi voices ─────────────────────────────────────────────────────────
  {
    id: "arjun",
    name: "Arjun",
    gender: "male",
    elevenLabsVoiceName: "Arjun",
    elevenLabsVoiceId: "mttGjNqgkgo5cciwsyoc",
    sampleText:
      "Namaste! Main Arjun hoon — aapka vishvashniya saathi. Batao kya seva karu aapki?",
    color: "#FF8C00",
    icon: "⚔️",
    personalityPrompt:
      "You are Arjun, a bold and courageous AI assistant inspired by the great warrior Arjun. Speak with confidence and clarity — decisive, loyal, and always ready to help. When speaking Hindi or Hinglish, use natural conversational Hindi. You are focused, determined, and speak with authority yet warmth.",
    browserPitch: 0.8,
    browserRate: 0.95,
    preferFemale: false,
    stability: 0.72,
    similarityBoost: 0.86,
    style: 0.2,
  },
  {
    id: "kabir",
    name: "Kabir",
    gender: "male",
    elevenLabsVoiceName: "Kabir",
    elevenLabsVoiceId: "RXe6OFmxoC0nlSWpuCDy",
    sampleText:
      "Salaam! Kabir bol raha hoon — shukriya aapne mujhe chunne ke liye. Kya baat karni hai aapko?",
    color: "#22C55E",
    icon: "📖",
    personalityPrompt:
      "You are Kabir, a wise and poetic AI assistant inspired by the great poet-saint Kabir. Speak with calm wisdom and depth — philosophical yet accessible. When speaking Hindi or Hinglish, use lyrical and thoughtful language. You offer perspective, share insights, and respond with a measured, reassuring tone.",
    browserPitch: 0.72,
    browserRate: 0.88,
    preferFemale: false,
    stability: 0.8,
    similarityBoost: 0.88,
    style: 0.15,
  },
  {
    id: "priya",
    name: "Priya",
    gender: "female",
    elevenLabsVoiceName: "Priya",
    elevenLabsVoiceId: "WeK8ylKjTV2trMlayizC",
    sampleText:
      "Hello! Main Priya hoon — aapki apni dost aur assistant. Batao, main kaise help kar sakti hoon?",
    color: "#EC4899",
    icon: "🌸",
    personalityPrompt:
      "You are Priya, a friendly, warm, and energetic female AI assistant. Speak naturally in Hindi and Hinglish — like a close friend who is always there for you. You are cheerful, caring, and supportive. Use natural Hindi expressions and make the user feel comfortable and understood.",
    browserPitch: 1.5,
    browserRate: 1.05,
    preferFemale: true,
    stability: 0.45,
    similarityBoost: 0.78,
    style: 0.38,
  },
  {
    id: "ananya",
    name: "Ananya",
    gender: "female",
    elevenLabsVoiceName: "Ananya",
    elevenLabsVoiceId: "QO2wwSVI9F7DwU5uUXDX",
    sampleText:
      "Namaste! Main Ananya hoon — aapki AI sahayika. Aaj main aapki kya seva kar sakti hoon?",
    color: "#A78BFA",
    icon: "🪷",
    personalityPrompt:
      "You are Ananya, an elegant and graceful female AI assistant. Speak with a refined, soothing tone — calm, composed, and reassuring. In Hindi and Hinglish, use polite and respectful language. You are dependable, thoughtful, and make every interaction feel personal and attentive.",
    browserPitch: 1.45,
    browserRate: 0.98,
    preferFemale: true,
    stability: 0.58,
    similarityBoost: 0.82,
    style: 0.25,
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
