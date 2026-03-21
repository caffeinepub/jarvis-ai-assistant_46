import { useCallback } from "react";
import type { Message } from "../types";

const OPENAI_API_KEY =
  "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";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const GEMINI_API_KEY = "AIzaSyDlddzJBYXin0ve9k-14mVBGtMOAwl34kY";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's AI assistant. You are highly intelligent, helpful, slightly witty, and always professional. You speak in a calm, composed manner with occasional dry humor. Never break character. Keep responses concise but complete. You can answer in English, Hindi, or Hinglish (code-mixed) based on the user's language preference setting.`;

function getLangHint(language: string): string {
  if (language === "hindi") return " Please respond in Hindi.";
  if (language === "hinglish")
    return " Please respond in Hinglish (code-mixed English and Hindi).";
  return "";
}

async function callOpenAI(
  messages: Message[],
  language: string,
): Promise<string> {
  const openAIMessages = [
    { role: "system", content: SYSTEM_PROMPT + getLangHint(language) },
    ...messages.map((msg) => ({
      role: msg.role === "jarvis" ? "assistant" : "user",
      content: msg.content,
    })),
  ];

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: openAIMessages,
      max_tokens: 1024,
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI error: ${res.status} - ${errBody}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty response");
  return content;
}

async function callGemini(
  messages: Message[],
  language: string,
): Promise<string> {
  const contents = messages.map((msg) => ({
    role: msg.role === "jarvis" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT + getLangHint(language) }],
    },
    contents,
    generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini error: ${res.status} - ${errBody}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

export function useGemini() {
  const generateResponse = useCallback(
    async (messages: Message[], language: string): Promise<string> => {
      // Primary: OpenAI
      try {
        return await callOpenAI(messages, language);
      } catch (openAIErr) {
        console.warn(
          "OpenAI failed, switching to Gemini 2.5 Flash:",
          openAIErr,
        );
      }

      // Fallback: Gemini 2.5 Flash
      try {
        return await callGemini(messages, language);
      } catch (geminiErr) {
        console.warn("Gemini also failed:", geminiErr);
        // Return a user-friendly message instead of throwing
        return "Both AI systems are currently unavailable due to API quota limits. Please try again in a few minutes, sir.";
      }
    },
    [],
  );

  return { generateResponse };
}
