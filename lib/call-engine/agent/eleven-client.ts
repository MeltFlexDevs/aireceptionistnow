import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

let cached: ElevenLabsClient | null = null;

export function elevenClient(): ElevenLabsClient {
  if (cached) return cached;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");
  cached = new ElevenLabsClient({ apiKey });
  return cached;
}
