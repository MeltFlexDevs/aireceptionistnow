import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Single ElevenLabs SDK client for all Conversational AI management calls (create
// / update / delete agents, upload knowledge base documents). The SDK encodes the
// exact request/response schemas, so field paths are checked at compile time —
// preferred over hand-rolled fetch against an API we can't type-check.
//
// Server-side only: it uses ELEVENLABS_API_KEY, never exposed to the client.

let cached: ElevenLabsClient | null = null;

export function elevenClient(): ElevenLabsClient {
  if (cached) return cached;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");
  cached = new ElevenLabsClient({ apiKey });
  return cached;
}
