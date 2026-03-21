import { motion } from "motion/react";
import { useRef } from "react";
import { useState } from "react";

interface NameEntryScreenProps {
  onEnter: (name: string) => void;
}

export function NameEntryScreen({ onEnter }: NameEntryScreenProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onEnter(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, oklch(0.13 0.03 225) 0%, oklch(0.08 0.022 230) 50%, oklch(0.05 0.015 235) 100%)",
      }}
    >
      {/* Animated rings */}
      <div className="relative flex items-center justify-center mb-10">
        {[120, 90, 60].map((size, i) => (
          <div
            key={size}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              border: "1px solid rgba(32,214,255,0.2)",
              animation: `spin-slow ${8 + i * 4}s linear infinite`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
            }}
          />
        ))}
        {/* Core */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, rgba(32,214,255,0.3) 0%, rgba(32,214,255,0.05) 70%)",
            border: "2px solid rgba(32,214,255,0.6)",
            boxShadow:
              "0 0 30px rgba(32,214,255,0.4), 0 0 60px rgba(32,214,255,0.15), inset 0 0 20px rgba(32,214,255,0.1)",
          }}
        >
          <div
            className="w-5 h-5 rounded-full"
            style={{
              background: "#20D6FF",
              boxShadow: "0 0 12px #20D6FF, 0 0 24px rgba(32,214,255,0.6)",
              animation: "status-pulse 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Title */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1
          className="font-orbitron text-3xl sm:text-5xl font-bold tracking-widest mb-3"
          style={{
            color: "#20D6FF",
            textShadow:
              "0 0 20px rgba(32,214,255,0.6), 0 0 40px rgba(32,214,255,0.3)",
          }}
        >
          J.A.R.V.I.S.
        </h1>
        <p
          className="font-orbitron text-xs sm:text-sm tracking-widest uppercase"
          style={{ color: "rgba(32,214,255,0.6)" }}
        >
          Just A Rather Very Intelligent System
        </p>
      </motion.div>

      {/* Input card */}
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p
          className="font-orbitron text-xs uppercase tracking-widest text-center mb-6"
          style={{ color: "rgba(32,214,255,0.7)" }}
        >
          — Identify yourself —
        </p>

        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(8,20,26,0.85)",
            border: "1px solid rgba(32,214,255,0.2)",
            backdropFilter: "blur(16px)",
            boxShadow:
              "0 0 30px rgba(32,214,255,0.08), 0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name..."
            className="w-full bg-transparent outline-none text-sm text-center mb-5"
            style={{
              color: "oklch(0.94 0.015 220)",
              caretColor: "#20D6FF",
              borderBottom: "1px solid rgba(32,214,255,0.3)",
              paddingBottom: "10px",
              letterSpacing: "0.1em",
            }}
            data-ocid="name_entry.input"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl font-orbitron text-xs uppercase tracking-widest transition-all duration-300"
            style={{
              background: name.trim()
                ? "rgba(32,214,255,0.15)"
                : "rgba(32,214,255,0.04)",
              border: `1px solid ${
                name.trim() ? "rgba(32,214,255,0.5)" : "rgba(32,214,255,0.15)"
              }`,
              color: name.trim() ? "#20D6FF" : "rgba(32,214,255,0.3)",
              boxShadow: name.trim() ? "0 0 15px rgba(32,214,255,0.2)" : "none",
            }}
            data-ocid="name_entry.submit_button"
          >
            Initialize
          </button>
        </div>
      </motion.div>
    </div>
  );
}
