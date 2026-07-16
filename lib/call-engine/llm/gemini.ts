import { GoogleGenAI } from "@google/genai";
import { getEnv } from "../env";

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: getEnv().GEMINI_API_KEY ?? "" });
  return client;
}
