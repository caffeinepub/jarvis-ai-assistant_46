import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArcReactor } from "./components/ArcReactor";
import { ChatView } from "./components/ChatView";
import { NameEntryScreen } from "./components/NameEntryScreen";
import { SettingsView } from "./components/SettingsView";
import { useGemini } from "./hooks/useGemini";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useTTS } from "./hooks/useTTS";
import type { AppSettings, AppStatus, Message } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const SETTINGS_KEY = "jarvis_settings";
const USERNAME_KEY = "jarvis_username";

type LangCommand = { lang: "hindi" | "hinglish" | "english" } | null;

function detectLangCommand(text: string): LangCommand {
  const t = text.trim().toLowerCase();
  if (
    [
      "speak hindi",
      "speak in hindi",
      "hindi mein bolo",
      "hindi me bolo",
      "ab hindi mein bolo",
      "ab hindi me bolo",
    ].includes(t)
  )
    return { lang: "hindi" };
  if (
    [
      "speak hinglish",
      "speak in hinglish",
      "hinglish mein bolo",
      "hinglish me bolo",
      "ab hinglish mein bolo",
      "ab hinglish me bolo",
    ].includes(t)
  )
    return { lang: "hinglish" };
  if (
    [
      "speak english",
      "speak in english",
      "english mein bolo",
      "english me bolo",
      "ab english mein bolo",
      "ab english me bolo",
    ].includes(t)
  )
    return { lang: "english" };
  return null;
}

const LANG_CONFIRM: Record<string, string> = {
  hindi: "Bilkul, ab main Hindi mein baat karunga. Aap kya jaanna chahte hain?",
  hinglish: "Sure boss, ab main Hinglish mein bolunga. Batao kya kaam hai?",
  english: "Switching back to English. How may I assist you, sir?",
};

const LANG_BADGE: Record<string, string> = {
  hindi: "HI",
  hinglish: "HG",
  english: "EN",
};

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const salutation = name ? `, ${name}` : ", sir";
  if (hour >= 5 && hour < 12) return `Good morning${salutation}.`;
  if (hour >= 12 && hour < 17) return `Good afternoon${salutation}.`;
  if (hour >= 17 && hour < 21) return `Good evening${salutation}.`;
  return `Good night${salutation}. Working late, I see.`;
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export default function App() {
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem(USERNAME_KEY) || "",
  );
  const [view, setView] = useState<"chat" | "settings">("chat");
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<AppStatus>("idle");

  // Voice mode state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const isVoiceModeRef = useRef(false);

  // Settings ref to avoid stale closures in lang command handler
  const settingsRef = useRef<AppSettings>(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Keep ref in sync with state
  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  const { generateResponse } = useGemini();
  const { speak, stopSpeaking } = useTTS();
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported: speechSupported,
    clearTranscript,
  } = useSpeechRecognition();

  // When userName changes, start a fresh session (no persisted chat loaded)
  useEffect(() => {
    if (!userName) return;
    setMessages([
      {
        id: makeId(),
        role: "jarvis",
        content: `${getGreeting(userName)} I am J.A.R.V.I.S., your personal AI assistant. All systems are online and operational. How may I be of service?`,
        timestamp: new Date(),
      },
    ]);
  }, [userName]);

  // Sync listening status
  useEffect(() => {
    if (isListening) {
      setStatus("listening");
    } else if (status === "listening") {
      setStatus("idle");
    }
  }, [isListening, status]);

  // Refs for auto-send logic (avoid stale closures)
  const prevListeningRef = useRef(false);
  const transcriptRef = useRef("");
  const handleSendMessageRef = useRef<(text: string) => void>(() => {});

  // Keep transcript ref in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Auto-send transcript when voice mode and speech ends
  useEffect(() => {
    const wasListening = prevListeningRef.current;
    prevListeningRef.current = isListening;

    // Transition: listening -> not listening
    if (
      wasListening &&
      !isListening &&
      transcriptRef.current.trim() &&
      isVoiceModeRef.current
    ) {
      handleSendMessageRef.current(transcriptRef.current.trim());
    }
  }, [isListening]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Stop command: just stop voice, don't send to AI
      if (text.trim().toLowerCase() === "stop") {
        stopSpeaking();
        setIsVoiceMode(false);
        isVoiceModeRef.current = false;
        clearTranscript();
        return;
      }

      // Language command detection
      const langCmd = detectLangCommand(text.trim());
      if (langCmd) {
        stopListening();
        clearTranscript();

        // Add user message bubble
        const userMsg: Message = {
          id: makeId(),
          role: "user",
          content: text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);

        // Update settings with new language
        const newSettings: AppSettings = {
          ...settingsRef.current,
          language: langCmd.lang,
        };
        setSettings(newSettings);
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        } catch {
          // ignore
        }

        // Add JARVIS confirmation bubble
        const confirmText = LANG_CONFIRM[langCmd.lang];
        const jarvisMsg: Message = {
          id: makeId(),
          role: "jarvis",
          content: confirmText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, jarvisMsg]);

        // Speak confirmation then resume listening
        if (newSettings.ttsEnabled) {
          setStatus("speaking");
          await speak(
            confirmText,
            newSettings.voiceSpeed,
            newSettings.voiceName,
            () => {
              setStatus("idle");
              if (isVoiceModeRef.current) {
                setTimeout(() => {
                  if (isVoiceModeRef.current) {
                    startListening(langCmd.lang);
                  }
                }, 300);
              }
            },
          );
        } else {
          setStatus("idle");
          if (isVoiceModeRef.current) {
            setTimeout(() => {
              if (isVoiceModeRef.current) {
                startListening(langCmd.lang);
              }
            }, 300);
          }
        }
        return;
      }

      stopListening();
      clearTranscript();

      const userMsg: Message = {
        id: makeId(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setStatus("processing");

      try {
        const history = [...messages, userMsg];
        const response = await generateResponse(history, settings.language);

        const jarvisMsg: Message = {
          id: makeId(),
          role: "jarvis",
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, jarvisMsg]);

        if (settings.ttsEnabled) {
          setStatus("speaking");
          await speak(response, settings.voiceSpeed, settings.voiceName, () => {
            setStatus("idle");
            // Auto-restart listening in voice mode after JARVIS finishes speaking
            if (isVoiceModeRef.current) {
              setTimeout(() => {
                if (isVoiceModeRef.current) {
                  startListening(settings.language);
                }
              }, 300);
            }
          });
        } else {
          setStatus("idle");
          // Auto-restart listening in voice mode when TTS disabled
          if (isVoiceModeRef.current) {
            setTimeout(() => {
              if (isVoiceModeRef.current) {
                startListening(settings.language);
              }
            }, 300);
          }
        }
      } catch {
        const errMsg: Message = {
          id: makeId(),
          role: "jarvis",
          content:
            "My apologies. I'm having trouble connecting to my neural network. Please try again in a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
        setStatus("idle");
      }
    },
    [
      messages,
      settings,
      generateResponse,
      speak,
      stopListening,
      clearTranscript,
      stopSpeaking,
      startListening,
    ],
  );

  // Keep ref current so the isListening effect always calls latest version
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleStartListening = useCallback(() => {
    if (status !== "idle") return;
    stopSpeaking();
    setIsVoiceMode(true);
    isVoiceModeRef.current = true;
    startListening(settings.language);
  }, [status, settings.language, startListening, stopSpeaking]);

  const handleStopListening = useCallback(() => {
    setIsVoiceMode(false);
    isVoiceModeRef.current = false;
    stopListening();
  }, [stopListening]);

  const handleTextSend = useCallback(
    (text: string) => {
      setIsVoiceMode(false);
      isVoiceModeRef.current = false;
      handleSendMessage(text);
    },
    [handleSendMessage],
  );

  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  }, []);

  const handleSetName = useCallback((name: string) => {
    localStorage.setItem(USERNAME_KEY, name);
    setUserName(name);
  }, []);

  const handleChangeName = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    setMessages([]);
    setUserName("");
  }, []);

  const isReactorActive =
    status === "processing" || status === "speaking" || isListening;
  const isSpeaking = status === "speaking";

  // Show name entry if no user
  if (!userName) {
    return <NameEntryScreen onEnter={handleSetName} />;
  }

  return (
    <div
      className="circuit-bg flex flex-col"
      style={{
        height: "100dvh",
        background:
          "radial-gradient(ellipse at 50% 0%, oklch(0.13 0.03 225) 0%, oklch(0.08 0.022 230) 50%, oklch(0.05 0.015 235) 100%)",
      }}
    >
      {/* Nav bar */}
      <header className="flex-shrink-0 px-4 py-3 flex justify-center z-50">
        <div
          className="w-full max-w-3xl flex items-center justify-between px-5 py-2.5 rounded-full"
          style={{
            background: "rgba(8,20,26,0.85)",
            border: "1px solid rgba(32,214,255,0.2)",
            backdropFilter: "blur(16px)",
            boxShadow:
              "0 0 20px rgba(32,214,255,0.08), 0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(32,214,255,0.1)",
                border: "1px solid rgba(32,214,255,0.4)",
                boxShadow: "0 0 8px rgba(32,214,255,0.3)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#20D6FF", boxShadow: "0 0 6px #20D6FF" }}
              />
            </div>
            <span
              className="font-orbitron text-sm font-bold tracking-widest uppercase text-glow-cyan"
              style={{ color: "#20D6FF" }}
            >
              J.A.R.V.I.S.
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {(["chat", "settings"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className="px-4 py-1.5 rounded-full text-xs font-orbitron uppercase tracking-wider transition-all duration-200"
                style={{
                  background:
                    view === v ? "rgba(32,214,255,0.15)" : "transparent",
                  border:
                    view === v
                      ? "1px solid rgba(32,214,255,0.4)"
                      : "1px solid transparent",
                  color: view === v ? "#20D6FF" : "rgba(143,167,183,0.7)",
                  boxShadow:
                    view === v ? "0 0 10px rgba(32,214,255,0.2)" : "none",
                }}
                data-ocid={`nav.${v}.link`}
              >
                {v}
              </button>
            ))}
          </nav>

          {/* User + Status + Lang Badge */}
          <div className="flex items-center gap-3">
            {/* Language badge */}
            <div
              className="font-orbitron text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full hidden sm:flex items-center"
              style={{
                background: "rgba(32,214,255,0.1)",
                border: "1px solid rgba(32,214,255,0.35)",
                color: "#20D6FF",
                boxShadow: "0 0 8px rgba(32,214,255,0.25)",
              }}
              title={`Language: ${settings.language}`}
              data-ocid="nav.language.toggle"
            >
              {LANG_BADGE[settings.language] ?? "EN"}
            </div>

            {/* User name */}
            <div className="flex items-center gap-1.5">
              <span
                className="font-orbitron text-[10px] uppercase tracking-wider hidden sm:inline"
                style={{ color: "rgba(32,214,255,0.7)" }}
              >
                {userName}
              </span>
              <button
                type="button"
                onClick={handleChangeName}
                className="font-orbitron text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full transition-all duration-200"
                style={{
                  border: "1px solid rgba(32,214,255,0.2)",
                  color: "rgba(143,167,183,0.5)",
                  background: "transparent",
                }}
                data-ocid="nav.change_name.button"
              >
                Change
              </button>
            </div>

            {/* Status dot */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    status === "idle"
                      ? "#39D98A"
                      : status === "listening"
                        ? "#20D6FF"
                        : status === "speaking"
                          ? "#FF3B3B"
                          : "#FFB800",
                  boxShadow:
                    status === "idle"
                      ? "0 0 6px #39D98A"
                      : status === "listening"
                        ? "0 0 6px #20D6FF"
                        : status === "speaking"
                          ? "0 0 6px #FF3B3B"
                          : "0 0 6px #FFB800",
                  animation:
                    status !== "idle"
                      ? "status-pulse 1s ease-in-out infinite"
                      : "none",
                }}
              />
              <span
                className="text-[10px] font-orbitron uppercase tracking-wider hidden sm:inline"
                style={{ color: "rgba(143,167,183,0.6)" }}
              >
                {status === "idle" ? "Online" : status}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        className="flex-1 flex flex-col items-center px-4 pb-2 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <AnimatePresence mode="wait">
          {view === "chat" ? (
            <motion.div
              key="chat"
              className="w-full max-w-3xl flex flex-col flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ minHeight: 0 }}
            >
              {/* Arc Reactor hero */}
              <div className="flex-shrink-0 flex justify-center py-3 sm:py-4">
                <ArcReactor
                  isActive={isReactorActive}
                  isSpeaking={isSpeaking}
                  size={
                    typeof window !== "undefined" && window.innerWidth < 640
                      ? 140
                      : 200
                  }
                />
              </div>

              {/* Chat panel */}
              <div
                className="flex-1 rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "rgba(8,20,26,0.65)",
                  border: "1px solid rgba(32,214,255,0.15)",
                  backdropFilter: "blur(16px)",
                  boxShadow:
                    "0 0 30px rgba(32,214,255,0.05), 0 8px 32px rgba(0,0,0,0.4)",
                  minHeight: 0,
                }}
              >
                <ChatView
                  messages={messages}
                  status={status}
                  settings={settings}
                  onSendMessage={handleTextSend}
                  onStartListening={handleStartListening}
                  onStopListening={handleStopListening}
                  transcript={transcript}
                  speechSupported={speechSupported}
                  isVoiceMode={isVoiceMode}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              className="w-full max-w-3xl flex-1 overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsView settings={settings} onSave={handleSaveSettings} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 text-center py-2 px-4">
        <p
          className="text-[10px] font-orbitron"
          style={{ color: "rgba(143,167,183,0.35)" }}
        >
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
            style={{ color: "rgba(32,214,255,0.4)" }}
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
