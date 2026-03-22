import { ImagePlus, Loader2, Mic, MicOff, Send, Trash2 } from "lucide-react";
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
  onSendPhoto: (file: File, caption: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  transcript: string;
  speechSupported: boolean;
  isVoiceMode: boolean;
  onClearChat?: () => void;
  photosUsedToday: number;
  maxPhotosPerDay: number;
}

export function ChatView({
  messages,
  status,
  settings,
  onSendMessage,
  onSendPhoto,
  onStartListening,
  onStopListening,
  transcript,
  speechSupported,
  isVoiceMode,
  onClearChat,
  photosUsedToday,
  maxPhotosPerDay,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const [userScrolled, setUserScrolled] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/status changes
  useEffect(() => {
    if (!userScrolled) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status, userScrolled]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setUserScrolled(!atBottom);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on new messages
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (atBottom) setUserScrolled(false);
  }, [messages.length]);

  const scrollToBottom = () => {
    setUserScrolled(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (photoPreview) {
      // Send photo with optional caption
      onSendPhoto(
        photoPreview.file,
        input.trim() || "What do you see in this image?",
      );
      URL.revokeObjectURL(photoPreview.url);
      setPhotoPreview(null);
      setInput("");
      setUserScrolled(false);
      return;
    }
    const text = input.trim();
    if (!text || status === "processing") return;
    onSendMessage(text);
    setInput("");
    setUserScrolled(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && photoPreview) {
      URL.revokeObjectURL(photoPreview.url);
      setPhotoPreview(null);
      setInput("");
    }
  };

  const handleMic = () => {
    if (status === "listening") {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const handlePhotoClick = () => {
    if (photosUsedToday >= maxPhotosPerDay) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset file input
    e.target.value = "";
    const url = URL.createObjectURL(file);
    setPhotoPreview({ file, url });
    setInput("");
    inputRef.current?.focus();
  };

  const photosRemaining = maxPhotosPerDay - photosUsedToday;
  const photoLimitReached = photosUsedToday >= maxPhotosPerDay;

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

  const showClearButton = messages.length > 1 && !!onClearChat;

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

      {/* Messages scroll area */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        {/* Clear chat button */}
        <AnimatePresence>
          {showClearButton && (
            <motion.button
              type="button"
              onClick={onClearChat}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200"
              style={{
                background: "rgba(255,59,59,0.15)",
                border: "1px solid rgba(255,59,59,0.4)",
                boxShadow: "0 0 8px rgba(255,59,59,0.2)",
                color: "#FF3B3B",
              }}
              aria-label="Clear chat history"
              data-ocid="chat.delete_button"
            >
              <Trash2 size={11} />
              <span className="font-orbitron text-[9px] uppercase tracking-widest hidden sm:inline">
                Clear
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto px-4 py-4 space-y-4 jarvis-scrollbar"
        >
          {messages.map((msg, i) => (
            <ChatBubble key={msg.id} message={msg} index={i} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {userScrolled && (
            <motion.button
              type="button"
              onClick={scrollToBottom}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{
                background: "rgba(8,20,26,0.9)",
                border: "1px solid rgba(32,214,255,0.5)",
                boxShadow: "0 0 12px rgba(32,214,255,0.3)",
                color: "#20D6FF",
              }}
              aria-label="Scroll to latest"
            >
              <svg
                role="img"
                aria-label="Scroll to latest"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M6 9L1 4h10L6 9z" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
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

      {/* Photo preview strip */}
      <AnimatePresence>
        {photoPreview && (
          <motion.div
            className="mx-4 mb-2 flex items-center gap-3 px-3 py-2 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "rgba(32,214,255,0.07)",
              border: "1px solid rgba(32,214,255,0.25)",
            }}
          >
            <img
              src={photoPreview.url}
              alt="Preview"
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              style={{ border: "1px solid rgba(32,214,255,0.3)" }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="font-orbitron text-[9px] uppercase tracking-widest mb-0.5"
                style={{ color: "rgba(32,214,255,0.6)" }}
              >
                Photo ready · Add a caption or send as-is
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: "rgba(143,167,183,0.5)" }}
              >
                {photoPreview.file.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(photoPreview.url);
                setPhotoPreview(null);
                setInput("");
              }}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                color: "rgba(255,59,59,0.7)",
                border: "1px solid rgba(255,59,59,0.3)",
              }}
              aria-label="Remove photo"
            >
              <span className="text-xs">✕</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div
        className="px-4 pb-4 pt-2"
        style={{ borderTop: "1px solid rgba(32,214,255,0.1)" }}
      >
        {/* Photo counter */}
        <div className="flex justify-end mb-1.5">
          <span
            className="font-orbitron text-[9px] uppercase tracking-widest"
            style={{
              color: photoLimitReached
                ? "rgba(255,59,59,0.6)"
                : "rgba(32,214,255,0.35)",
            }}
          >
            {photoLimitReached
              ? "Photo limit reached (5/day)"
              : `📷 ${photosRemaining} photo${photosRemaining !== 1 ? "s" : ""} remaining today`}
          </span>
        </div>

        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2"
          style={{
            background: "rgba(8,20,26,0.85)",
            border: `1px solid ${
              photoPreview ? "rgba(32,214,255,0.5)" : "rgba(32,214,255,0.25)"
            }`,
            boxShadow: photoPreview
              ? "0 0 16px rgba(32,214,255,0.2)"
              : "0 0 12px rgba(32,214,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Photo button */}
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={photoLimitReached || status === "processing"}
            title={
              photoLimitReached
                ? "Daily photo limit reached"
                : `Send photo (${photosRemaining} left today)`
            }
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 flex-shrink-0"
            style={{
              background: photoPreview
                ? "rgba(32,214,255,0.2)"
                : photoLimitReached
                  ? "rgba(255,59,59,0.05)"
                  : "rgba(32,214,255,0.05)",
              border: `1px solid ${
                photoPreview
                  ? "rgba(32,214,255,0.6)"
                  : photoLimitReached
                    ? "rgba(255,59,59,0.2)"
                    : "rgba(32,214,255,0.3)"
              }`,
              color: photoPreview
                ? "#20D6FF"
                : photoLimitReached
                  ? "rgba(255,59,59,0.4)"
                  : "rgba(143,167,183,0.6)",
              boxShadow: photoPreview
                ? "0 0 10px rgba(32,214,255,0.35)"
                : "none",
            }}
            aria-label="Attach photo"
            data-ocid="chat.photo_button"
          >
            <ImagePlus size={15} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              photoPreview
                ? "Add a caption (optional)..."
                : 'Speak or type · Try "search for..."'
            }
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
            !photoPreview &&
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
            disabled={
              (!input.trim() && !photoPreview) || status === "processing"
            }
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
            style={{
              background:
                (input.trim() || photoPreview) && status !== "processing"
                  ? "rgba(32,214,255,0.2)"
                  : "rgba(32,214,255,0.05)",
              border: `1px solid ${
                (input.trim() || photoPreview) && status !== "processing"
                  ? "rgba(32,214,255,0.6)"
                  : "rgba(32,214,255,0.2)"
              }`,
              boxShadow:
                (input.trim() || photoPreview) && status !== "processing"
                  ? "0 0 10px rgba(32,214,255,0.35)"
                  : "none",
              color:
                (input.trim() || photoPreview) && status !== "processing"
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
