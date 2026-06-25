import { openDeepgramStt } from "./deepgram";
import { openElevenLabsStt } from "./elevenlabs";
import type { SttProvider } from "./types";

export type SttProviderName = "deepgram" | "elevenlabs";

// Selects the streaming STT implementation. Deepgram is the telephony default
// (native μ-law, dedicated endpointing); ElevenLabs consolidates STT+TTS onto
// one vendor and is the budget option for lower tiers. Anything unrecognized
// falls back to Deepgram.
export function selectStt(name?: string): SttProvider {
  return name === "elevenlabs" ? openElevenLabsStt : openDeepgramStt;
}

export type { SttProvider, SttSession, SttOptions } from "./types";
