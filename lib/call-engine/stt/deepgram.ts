import WebSocket from "ws";
import { getEnv } from "../env";
import type { SttOptions, SttSession } from "./types";

// Deepgram streaming STT over a raw WebSocket. We talk to the listen endpoint
// directly (rather than the SDK) so the transport is stable across SDK rewrites
// and stays the lowest-latency path: μ-law 8 kHz in, partial + final transcripts
// and endpointing events out.

interface DgMessage {
  type?: string; // "Results" | "SpeechStarted" | "UtteranceEnd"
  is_final?: boolean;
  speech_final?: boolean;
  channel?: {
    detected_language?: string;
    alternatives?: { transcript?: string; languages?: string[] }[];
  };
}

/** Pull whatever language Deepgram reports (multilingual nova-3 / detect mode).
 *  Best-effort: the field location differs across models, so check both. */
function detectedLanguageOf(msg: DgMessage): string | null {
  const fromChannel = msg.channel?.detected_language;
  const fromAlt = msg.channel?.alternatives?.[0]?.languages?.[0];
  const lang = (fromChannel || fromAlt || "").trim();
  return lang ? lang : null;
}

export function openDeepgramStt(opts: SttOptions): SttSession {
  const env = getEnv();
  const query = new URLSearchParams({
    model: env.DEEPGRAM_MODEL,
    language: opts.language,
    encoding: "mulaw",
    sample_rate: "8000",
    channels: "1",
    interim_results: "true",
    smart_format: "true",
    vad_events: "true",
    endpointing: "250",
    utterance_end_ms: "1000",
  });
  const url = `wss://api.deepgram.com/v1/listen?${query.toString()}`;

  const ws = new WebSocket(url, {
    headers: { Authorization: `Token ${env.DEEPGRAM_API_KEY}` },
  });

  let open = false;
  let lastLanguage = "";
  const queue: Buffer[] = [];
  const segments: string[] = [];

  const flushUtterance = () => {
    const text = segments.join(" ").trim();
    segments.length = 0;
    if (text) opts.onUtterance(text);
  };

  ws.on("open", () => {
    open = true;
    for (const buf of queue) ws.send(buf);
    queue.length = 0;
  });

  ws.on("message", (raw: WebSocket.RawData) => {
    let msg: DgMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (msg.type === "SpeechStarted") {
      opts.onSpeechStarted();
      return;
    }
    if (msg.type === "UtteranceEnd") {
      flushUtterance();
      return;
    }
    const lang = detectedLanguageOf(msg);
    if (lang && lang !== lastLanguage) {
      lastLanguage = lang;
      opts.onLanguageDetected?.(lang);
    }
    const text = msg.channel?.alternatives?.[0]?.transcript?.trim() ?? "";
    if (!text) return;
    opts.onTranscript({ text, isFinal: Boolean(msg.is_final) });
    if (msg.is_final) segments.push(text);
    if (msg.speech_final) flushUtterance();
  });

  ws.on("error", (err) => console.error("[stt] deepgram error", err));

  return {
    send(audio: Buffer) {
      if (open) ws.send(audio);
      else queue.push(audio);
    },
    close() {
      flushUtterance();
      try {
        if (open) ws.send(JSON.stringify({ type: "CloseStream" }));
      } catch {
        // socket already closing
      }
      ws.close();
    },
  };
}
