import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  Globe,
  Info,
  Mic,
  Save,
  User,
  Volume2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTTS } from "../hooks/useTTS";
import type { AppSettings } from "../types";
import { VOICE_PROFILES } from "../types";

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const capabilities = [
  {
    category: "Voice & Chat",
    icon: "🎙️",
    items: [
      "Voice conversation via microphone",
      "Text-based chat input",
      "Hands-free mode — auto-listens after each reply",
      "Text-to-Speech output (JARVIS voice)",
      'Say "stop" to halt voice without ending the session',
    ],
  },
  {
    category: "Language Support",
    icon: "🌐",
    items: [
      "English — default response language",
      'Hindi — say "speak Hindi"',
      'Hinglish — say "speak Hinglish"',
      'Switch back anytime — say "speak in English"',
    ],
  },
  {
    category: "AI Intelligence",
    icon: "🤖",
    items: [
      "Powered by Groq (llama-3.1-8b-instant) as primary AI",
      "Auto-switches to Gemini, OpenAI, DeepSeek if quota runs out",
      "Announces API switch in chat for transparency",
      "Responds to general questions, advice, and conversations",
    ],
  },
  {
    category: "Customization",
    icon: "⚙️",
    items: [
      "Adjust voice speed in settings",
      "Change response language from settings",
      "Toggle speech recognition on or off",
      "Toggle Text-to-Speech on or off",
    ],
  },
  {
    category: "About JARVIS",
    icon: "ℹ️",
    items: [
      "Built by Rohit Yadav",
      "Product of Yadav Industries",
      "Inspired by Iron Man's J.A.R.V.I.S. AI assistant",
      "Accessible to all users — no login required",
      "Can be added to phone home screen for app-like experience",
    ],
  },
];

export function SettingsView({ settings, onSave }: SettingsViewProps) {
  const [local, setLocal] = useState<AppSettings>({ ...settings });
  const [saved, setSaved] = useState(false);
  const [capOpen, setCapOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const { playSample, stopSpeaking } = useTTS();

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePlaySample = async (profileId: string) => {
    if (playingVoiceId === profileId) {
      stopSpeaking();
      setPlayingVoiceId(null);
      return;
    }
    stopSpeaking();
    const profile = VOICE_PROFILES.find((p) => p.id === profileId);
    if (!profile) return;

    setPlayingVoiceId(profileId);
    await playSample(
      profile.sampleText,
      profile.elevenLabsVoiceName,
      profile.browserPitch,
      profile.browserRate,
      profile.preferFemale,
      () => setPlayingVoiceId(null),
    );
  };

  const cardStyle = {
    background: "rgba(8,20,26,0.8)",
    border: "1px solid rgba(32,214,255,0.2)",
    backdropFilter: "blur(12px)",
  };

  return (
    <motion.div
      className="max-w-lg mx-auto px-4 py-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6">
        <h2
          className="text-lg font-orbitron uppercase tracking-widest mb-1"
          style={{
            color: "#20D6FF",
            textShadow: "0 0 10px rgba(32,214,255,0.5)",
          }}
        >
          System Configuration
        </h2>
        <p className="text-xs" style={{ color: "rgba(143,167,183,0.7)" }}>
          Adjust J.A.R.V.I.S. operational parameters
        </p>
      </div>

      {/* What Jarvis Can Do */}
      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <button
          type="button"
          onClick={() => setCapOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 transition-all duration-200"
          style={{
            background: capOpen ? "rgba(32,214,255,0.08)" : "transparent",
          }}
        >
          <div className="flex items-center gap-2">
            <Info size={14} style={{ color: "#20D6FF" }} />
            <span
              className="text-xs font-orbitron uppercase tracking-wider"
              style={{ color: "#20D6FF" }}
            >
              What Jarvis Can Do
            </span>
          </div>
          <motion.div
            animate={{ rotate: capOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown size={14} style={{ color: "#20D6FF" }} />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {capOpen && (
            <motion.div
              key="cap-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="px-4 pb-4 space-y-4"
                style={{
                  borderTop: "1px solid rgba(32,214,255,0.12)",
                  paddingTop: "16px",
                }}
              >
                {capabilities.map((cap) => (
                  <div key={cap.category}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{cap.icon}</span>
                      <span
                        className="text-xs font-orbitron uppercase tracking-wider"
                        style={{ color: "rgba(32,214,255,0.85)" }}
                      >
                        {cap.category}
                      </span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {cap.items.map((item) => (
                        <li
                          key={item}
                          className="text-xs flex items-start gap-2"
                          style={{ color: "rgba(143,167,183,0.9)" }}
                        >
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ background: "rgba(32,214,255,0.5)" }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Character Selection */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <User size={14} style={{ color: "#20D6FF" }} />
          <span
            className="text-xs font-orbitron uppercase tracking-wider"
            style={{ color: "#20D6FF" }}
          >
            Voice Character
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {VOICE_PROFILES.map((profile) => {
            const isSelected = local.selectedVoice === profile.id;
            const isPlaying = playingVoiceId === profile.id;
            return (
              <motion.div
                key={profile.id}
                onClick={() =>
                  setLocal((prev) => ({ ...prev, selectedVoice: profile.id }))
                }
                className="relative rounded-xl p-3 cursor-pointer flex flex-col gap-2 transition-all duration-200"
                style={{
                  background: "rgba(8,20,26,0.8)",
                  border: `1px solid ${
                    isSelected ? profile.color : `${profile.color}40`
                  }`,
                  boxShadow: isSelected
                    ? `0 0 16px ${profile.color}40, inset 0 0 12px ${profile.color}10`
                    : "none",
                  backdropFilter: "blur(12px)",
                }}
                whileHover={{
                  boxShadow: `0 0 10px ${profile.color}30`,
                  borderColor: `${profile.color}99`,
                }}
                data-ocid={`settings.voice.${profile.id}.card`}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{
                      background: profile.color,
                      boxShadow: `0 0 6px ${profile.color}`,
                    }}
                  />
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-2">
                  <span className="text-xl">{profile.icon}</span>
                  <div>
                    <p
                      className="text-xs font-orbitron font-bold tracking-wider leading-tight"
                      style={{
                        color: isSelected
                          ? profile.color
                          : "oklch(0.94 0.015 220)",
                        textShadow: isSelected
                          ? `0 0 8px ${profile.color}80`
                          : "none",
                      }}
                    >
                      {profile.name}
                    </p>
                    <span
                      className="text-[9px] font-orbitron uppercase tracking-widest"
                      style={{
                        color:
                          profile.gender === "female"
                            ? "rgba(57,217,138,0.7)"
                            : "rgba(32,214,255,0.5)",
                      }}
                    >
                      {profile.gender}
                    </span>
                  </div>
                </div>

                {/* Sample button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySample(profile.id);
                  }}
                  className="w-full text-[10px] font-orbitron uppercase tracking-wider py-1.5 rounded-lg transition-all duration-200"
                  style={{
                    background: isPlaying
                      ? `${profile.color}25`
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${
                      isPlaying
                        ? `${profile.color}80`
                        : "rgba(255,255,255,0.08)"
                    }`,
                    color: isPlaying ? profile.color : "rgba(143,167,183,0.7)",
                    boxShadow: isPlaying
                      ? `0 0 8px ${profile.color}30`
                      : "none",
                  }}
                  data-ocid={`settings.voice.${profile.id}.button`}
                >
                  {isPlaying ? "⏹ Stop" : "▶ Sample"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <Globe size={14} style={{ color: "#20D6FF" }} />
          <span
            className="text-xs font-orbitron uppercase tracking-wider"
            style={{ color: "#20D6FF" }}
          >
            Language Module
          </span>
        </div>
        <div className="space-y-1">
          <Label className="text-xs" style={{ color: "rgba(143,167,183,0.8)" }}>
            Response Language
          </Label>
          <Select
            value={local.language}
            onValueChange={(v) =>
              setLocal((prev) => ({
                ...prev,
                language: v as AppSettings["language"],
              }))
            }
          >
            <SelectTrigger
              className="w-full text-sm"
              style={{
                background: "rgba(8,20,26,0.6)",
                border: "1px solid rgba(32,214,255,0.25)",
                color: "oklch(0.94 0.015 220)",
              }}
              data-ocid="settings.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                background: "rgba(8,20,26,0.95)",
                border: "1px solid rgba(32,214,255,0.3)",
              }}
            >
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">Hindi (हिन्दी)</SelectItem>
              <SelectItem value="hinglish">Hinglish (Mixed)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Voice Output */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <Volume2 size={14} style={{ color: "#20D6FF" }} />
          <span
            className="text-xs font-orbitron uppercase tracking-wider"
            style={{ color: "#20D6FF" }}
          >
            Voice Output
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="tts-toggle"
              className="text-sm"
              style={{ color: "oklch(0.94 0.015 220)" }}
            >
              Text-to-Speech
            </Label>
            <Switch
              id="tts-toggle"
              checked={local.ttsEnabled}
              onCheckedChange={(v) =>
                setLocal((prev) => ({ ...prev, ttsEnabled: v }))
              }
              data-ocid="settings.switch"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label
                className="text-xs"
                style={{ color: "rgba(143,167,183,0.8)" }}
              >
                Voice Speed
              </Label>
              <span
                className="text-xs font-orbitron"
                style={{ color: "#20D6FF" }}
              >
                {local.voiceSpeed.toFixed(1)}x
              </span>
            </div>
            <Slider
              min={0.5}
              max={2.0}
              step={0.1}
              value={[local.voiceSpeed]}
              onValueChange={([v]) =>
                setLocal((prev) => ({ ...prev, voiceSpeed: v }))
              }
              disabled={!local.ttsEnabled}
              data-ocid="settings.toggle"
            />
          </div>
        </div>
      </div>

      {/* Voice Input */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <Mic size={14} style={{ color: "#20D6FF" }} />
          <span
            className="text-xs font-orbitron uppercase tracking-wider"
            style={{ color: "#20D6FF" }}
          >
            Voice Input
          </span>
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="voice-input-toggle"
            className="text-sm"
            style={{ color: "oklch(0.94 0.015 220)" }}
          >
            Speech Recognition
          </Label>
          <Switch
            id="voice-input-toggle"
            checked={local.voiceInputEnabled}
            onCheckedChange={(v) =>
              setLocal((prev) => ({ ...prev, voiceInputEnabled: v }))
            }
            data-ocid="settings.switch"
          />
        </div>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-orbitron text-sm uppercase tracking-widest transition-all duration-300"
        style={{
          background: saved ? "rgba(57,217,138,0.15)" : "rgba(32,214,255,0.12)",
          border: `1px solid ${
            saved ? "rgba(57,217,138,0.6)" : "rgba(32,214,255,0.5)"
          }`,
          color: saved ? "#39D98A" : "#20D6FF",
          boxShadow: saved
            ? "0 0 15px rgba(57,217,138,0.25)"
            : "0 0 12px rgba(32,214,255,0.2)",
        }}
        data-ocid="settings.save_button"
      >
        {saved ? (
          <>
            <Zap size={14} />
            Configuration Saved
          </>
        ) : (
          <>
            <Save size={14} />
            Save Configuration
          </>
        )}
      </button>
    </motion.div>
  );
}
