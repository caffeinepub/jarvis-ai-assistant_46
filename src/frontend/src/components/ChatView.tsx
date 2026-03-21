import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { AppSettings, AppStatus, Message } from "../types";
import { ChatBubble } from "./ChatBubble";
import { WaveformBar } from "./WaveformBar";

interface ChatViewProps {
  messages: Message[];
  status: AppStatus;
  settings: AppSettings;
  onSendMessage: (text: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  transcript: string;
  speechSupported: boolean;
  isVoiceMode: boolean;
}

export function ChatView({
  messages,
  status,
  settings,
  onSendMessage,
  onStartListening,
  onStopListening,
  transcript,
  speechSupported,
  isVoiceMode,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/status changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || status === "processing") return;
    onSendMessage(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMic = () => {
    if (status === "listening") {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const statusConfig = {
    idle: null,
    listening: {
      label: isVoiceMode ? "Hands-Free Mode..." : "Listening...",
      color: "#20D6FF",
    },
    processing: { label: "Processing...", color: "#20D6FF" },
    speaking: { label: "Speaking...", color: "#FF3B3B" },
  };

  const currentStatus = statusConfig[status];

  // Mic button visual state
  const micIsActive = status === "listening";
  const micBg = isVoiceMode
    ? "rgba(32,214,255,0.25)"
    : micIsActive
      ? "rgba(32,214,255,0.2)"
      : "rgba(32,214,255,0.05)";
  const micBorder = isVoiceMode
    ? "rgba(32,214,255,0.8)"
    : micIsActive
      ? "rgba(32,214,255,0.7)"
      : "rgba(32,214,255,0.3)";
  const micGlow = isVoiceMode
    ? "0 0 16px rgba(32,214,255,0.6)"
    : micIsActive
      ? "0 0 10px rgba(32,214,255,0.4)"
      : "none";
  const micColor =
    micIsActive || isVoiceMode ? "#20D6FF" : "rgba(143,167,183,0.8)";

  return (
    <div className="flex flex-col h-full">
      {/* Status banner */}
      <AnimatePresence>
        {currentStatus && (
          <motion.div
            className="flex items-center justify-center gap-3 py-2 px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {status === "listening" && (
              <WaveformBar isActive color="cyan" barCount={16} />
            )}
            {status === "speaking" && (
              <WaveformBar isActive color="red" barCount={16} />
            )}
            {status === "processing" && (
              <Loader2
                size={14}
                className="animate-spin"
                style={{ color: currentStatus.color }}
              />
            )}
            <span
              className="text-xs font-orbitron uppercase tracking-widest"
              style={{
                color: currentStatus.color,
                textShadow: `0 0 8px ${currentStatus.color}`,
                animation: "status-pulse 1.2s ease-in-out infinite",
              }}
            >
              {currentStatus.label}
            </span>
            {status === "listening" && (
              <WaveformBar isActive color="cyan" barCount={16} />
            )}
            {status === "speaking" && (
              <WaveformBar isActive color="red" barCount={16} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg, i) => (
          <ChatBubble key={msg.id} message={msg} index={i} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Hands-free mode indicator */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div
            className="mx-4 mb-2 flex items-center justify-center gap-2 py-1.5 rounded-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "rgba(32,214,255,0.07)",
              border: "1px solid rgba(32,214,255,0.25)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#20D6FF",
                boxShadow: "0 0 6px #20D6FF",
                animation: "status-pulse 1s ease-in-out infinite",
              }}
            />
            <span
              className="font-orbitron text-[9px] uppercase tracking-widest"
              style={{ color: "rgba(32,214,255,0.7)" }}
            >
              Hands-Free Active · Say "stop" to exit
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div
        className="px-4 pb-4 pt-2"
        style={{ borderTop: "1px solid rgba(32,214,255,0.1)" }}
      >
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2"
          style={{
            background: "rgba(8,20,26,0.85)",
            border: "1px solid rgba(32,214,255,0.25)",
            boxShadow: "0 0 12px rgba(32,214,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak or type your query..."
            disabled={status === "processing"}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{
              color: "oklch(0.94 0.015 220)",
              caretColor: "#20D6FF",
            }}
            data-ocid="chat.input"
          />

          {/* Mic button */}
          {settings.voiceInputEnabled &&
            (speechSupported ? (
              <button
                type="button"
                onClick={handleMic}
                disabled={status === "processing" || status === "speaking"}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
                style={{
                  background: micBg,
                  border: `1px solid ${micBorder}`,
                  boxShadow: micGlow,
                  color: micColor,
                  animation: isVoiceMode
                    ? "status-pulse 2s ease-in-out infinite"
                    : "none",
                }}
                aria-label={
                  status === "listening" ? "Stop listening" : "Start listening"
                }
                data-ocid="chat.toggle"
              >
                {status === "listening" ? (
                  <MicOff size={15} />
                ) : (
                  <Mic size={15} />
                )}
              </button>
            ) : null)}

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || status === "processing"}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
            style={{
              background:
                input.trim() && status !== "processing"
                  ? "rgba(32,214,255,0.2)"
                  : "rgba(32,214,255,0.05)",
              border: `1px solid ${
                input.trim() && status !== "processing"
                  ? "rgba(32,214,255,0.6)"
                  : "rgba(32,214,255,0.2)"
              }`,
              boxShadow:
                input.trim() && status !== "processing"
                  ? "0 0 10px rgba(32,214,255,0.35)"
                  : "none",
              color:
                input.trim() && status !== "processing"
                  ? "#20D6FF"
                  : "rgba(143,167,183,0.4)",
            }}
            aria-label="Send message"
            data-ocid="chat.submit_button"
          >
            {status === "processing" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
