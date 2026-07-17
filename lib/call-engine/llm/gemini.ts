import type { GoogleGenAI } from "@google/genai";
import { getEnv } from "../env";

// Loaded lazily: the agent tool routes import this module transitively, and
// parsing the SDK on cold start would tax the caller-audible hot path.
let clientPromise: Promise<GoogleGenAI> | null = null;

export function getGemini(): Promise<GoogleGenAI> {
  clientPromise ??= import("@google/genai").then(
    ({ GoogleGenAI }) => new GoogleGenAI({ apiKey: getEnv().GEMINI_API_KEY ?? "" }),
  );
  return clientPromise;
}
