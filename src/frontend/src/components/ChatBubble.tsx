import { motion } from "motion/react";
import { useState } from "react";
import type { Message } from "../types";

interface ChatBubbleProps {
  message: Message;
  index: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function GeneratedImage({ url, alt }: { url: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = () => {
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount((c) => c + 1);
        setError(false);
      }, 2000);
    } else {
      setError(true);
    }
  };

  // Add retry cache-bust param
  const src = retryCount > 0 ? `${url}&retry=${retryCount}` : url;

  return (
    <div className="mt-3">
      {!loaded && !error && (
        <div
          className="rounded-xl w-full max-w-sm flex items-center justify-center"
          style={{
            height: "200px",
            background: "rgba(8,20,26,0.7)",
            border: "1px solid rgba(32,214,255,0.2)",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: "rgba(32,214,255,0.6)",
                borderTopColor: "transparent",
              }}
            />
            <span
              className="text-[10px] font-orbitron uppercase tracking-widest"
              style={{ color: "rgba(32,214,255,0.5)" }}
            >
              Generating...
            </span>
          </div>
        </div>
      )}
      {error && (
        <div
          className="rounded-xl w-full max-w-sm flex items-center justify-center"
          style={{
            height: "100px",
            background: "rgba(8,20,26,0.7)",
            border: "1px solid rgba(255,59,59,0.3)",
          }}
        >
          <span
            className="text-[10px] font-orbitron uppercase tracking-widest"
            style={{ color: "rgba(255,59,59,0.7)" }}
          >
            Image load failed
          </span>
        </div>
      )}
      <img
        key={src}
        src={src}
        alt={alt}
        className="rounded-xl w-full max-w-sm object-cover"
        style={{
          border: "1px solid rgba(32,214,255,0.3)",
          boxShadow: "0 0 16px rgba(32,214,255,0.15)",
          maxHeight: "320px",
          display: loaded && !error ? "block" : "none",
        }}
        loading="eager"
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
      {(loaded || error) && (
        <p
          className="text-[9px] font-orbitron uppercase tracking-widest mt-1.5 opacity-50"
          style={{ color: "#20D6FF" }}
        >
          AI Generated · Pollinations
        </p>
      )}
    </div>
  );
}

export function ChatBubble({ message, index }: ChatBubbleProps) {
  const isJarvis = message.role === "jarvis";

  if (isJarvis) {
    return (
      <motion.div
        className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        data-ocid={`chat.item.${index + 1}`}
      >
        {/* Reactor icon */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
          style={{
            background: "rgba(8,20,26,0.9)",
            border: "1px solid rgba(32,214,255,0.5)",
            boxShadow: "0 0 8px rgba(32,214,255,0.3)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="7"
              stroke="rgba(32,214,255,0.6)"
              strokeWidth="1"
            />
            <circle
              cx="8"
              cy="8"
              r="4"
              stroke="rgba(32,214,255,0.8)"
              strokeWidth="1"
            />
            <circle cx="8" cy="8" r="2" fill="rgba(32,214,255,0.9)" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <span
            className="text-[10px] font-orbitron uppercase tracking-widest"
            style={{ color: "rgba(32,214,255,0.7)" }}
          >
            J.A.R.V.I.S.
          </span>
          <div
            className="rounded-2xl rounded-tl-sm px-4 py-3"
            style={{
              background: "rgba(8,20,26,0.85)",
              border: "1px solid rgba(32,214,255,0.3)",
              boxShadow:
                "0 0 12px rgba(32,214,255,0.1), inset 0 0 20px rgba(32,214,255,0.03)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.94 0.015 220)" }}
            >
              {message.content}
            </p>
            {message.generatedImageUrl && (
              <GeneratedImage url={message.generatedImageUrl} alt="Generated" />
            )}
          </div>
          <span
            className="text-[10px] pl-1"
            style={{ color: "rgba(143,167,183,0.6)" }}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-end justify-end gap-2 max-w-[85%] sm:max-w-[70%] ml-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      data-ocid={`chat.item.${index + 1}`}
    >
      <div className="flex flex-col items-end gap-1">
        <div
          className="rounded-2xl rounded-tr-sm overflow-hidden"
          style={{
            background: "rgba(20,40,55,0.9)",
            border: "1px solid rgba(32,214,255,0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Show image if present */}
          {message.imageData && (
            <div className="relative">
              <img
                src={message.imageData}
                alt="Sent"
                className="max-w-[200px] sm:max-w-[260px] w-full object-cover"
                style={{
                  maxHeight: "200px",
                  display: "block",
                }}
              />
              <div
                className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(8,20,26,0.8)",
                  border: "1px solid rgba(32,214,255,0.3)",
                }}
              >
                <span
                  className="font-orbitron text-[8px] uppercase tracking-widest"
                  style={{ color: "rgba(32,214,255,0.8)" }}
                >
                  📷
                </span>
              </div>
            </div>
          )}
          {/* Show text content if present */}
          {message.content &&
            message.content !== "What do you see in this image?" && (
              <p
                className="text-sm leading-relaxed px-4 py-3"
                style={{ color: "oklch(0.92 0.012 220)" }}
              >
                {message.content}
              </p>
            )}
          {/* If only image with default caption, don't show text */}
          {message.imageData && !message.content && (
            <p
              className="text-sm leading-relaxed px-4 py-3"
              style={{ color: "oklch(0.92 0.012 220)" }}
            >
              What do you see in this image?
            </p>
          )}
        </div>
        <span
          className="text-[10px] pr-1"
          style={{ color: "rgba(143,167,183,0.6)" }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-5"
        style={{
          background: "rgba(20,40,55,0.9)",
          border: "1px solid rgba(143,167,183,0.3)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="5" r="3" fill="rgba(143,167,183,0.7)" />
          <path
            d="M1 13c0-3.314 2.686-5 6-5s6 1.686 6 5"
            stroke="rgba(143,167,183,0.7)"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      </div>
    </motion.div>
  );
}
