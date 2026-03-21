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
import { Globe, Mic, Save, Volume2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { AppSettings } from "../types";

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function SettingsView({ settings, onSave }: SettingsViewProps) {
  const [local, setLocal] = useState<AppSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          <div className="space-y-1">
            <Label
              className="text-xs"
              style={{ color: "rgba(143,167,183,0.8)" }}
            >
              Voice Profile
            </Label>
            <input
              type="text"
              value={local.voiceName}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, voiceName: e.target.value }))
              }
              disabled={!local.ttsEnabled}
              placeholder="e.g. en-US-Neural2-D"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
              style={{
                background: "rgba(8,20,26,0.6)",
                border: "1px solid rgba(32,214,255,0.2)",
                color: "oklch(0.94 0.015 220)",
                caretColor: "#20D6FF",
              }}
              data-ocid="settings.input"
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
