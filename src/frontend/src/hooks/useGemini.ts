import { useCallback } from "react";
import type { Message } from "../types";

const GEMINI_API_KEY = "AIzaSyBytK7R1G3UUm7yZc_L0-XX97rlkOZVV0A";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's AI assistant. You are highly intelligent, helpful, slightly witty, and always professional. You speak in a calm, composed manner with occasional dry humor. Never break character. Keep responses concise but complete. You can answer in English, Hindi, or Hinglish (code-mixed) based on the user's language preference setting.`;

export function useGemini() {
  const generateResponse = useCallback(
    async (messages: Message[], language: string): Promise<string> => {
      const langHint =
        language === "hindi"
          ? " Please respond in Hindi."
          : language === "hinglish"
            ? " Please respond in Hinglish (code-mixed English and Hindi)."
            : "";

      const contents = messages.map((msg) => ({
        role: msg.role === "jarvis" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const body = {
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT + langHint }],
        },
        contents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
      };

      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Gemini API error: ${res.status} - ${errBody}`);
      }

      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "My apologies, sir. I'm having trouble connecting to my neural network.";
      return text;
    },
    [],
  );

  return { generateResponse };
}
