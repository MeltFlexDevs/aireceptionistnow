import { GoogleGenAI } from "@google/genai";
import { getEnv } from "../env";

// Gemini client. The call brain runs entirely inside ElevenLabs now; Gemini is
// our backend LLM only — post-call summarization (summary/summarize.ts) and
// greeting localization (greeting.ts). Both are non-latency-sensitive.

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: getEnv().GEMINI_API_KEY ?? "" });
  return client;
}
