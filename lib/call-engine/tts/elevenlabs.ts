import WebSocket from "ws";
import { getEnv } from "../env";
import type { TtsOptions, TtsSession } from "./types";

// ElevenLabs streaming input API. We open one socket per assistant turn, stream
// text in as the model produces it, and stream μ-law audio back out. Requesting
// output_format=ulaw_8000 means the audio is already in Twilio's format — no
// resampling, the lowest-latency path. Barge-in just closes the socket.

interface ElevenAudioMessage {
  audio?: string; // base64 μ-law
  isFinal?: boolean;
}

export function openElevenLabsTts(opts: TtsOptions): TtsSession {
  const env = getEnv();
  const url =
    `wss://api.elevenlabs.io/v1/text-to-speech/${opts.voiceId}/stream-input` +
    `?model_id=${env.ELEVENLABS_MODEL}&output_format=ulaw_8000`;

  let ws: WebSocket | null = null;
  let open = false;
  let stopped = false;
  const outbox: string[] = [];

  const enqueue = (msg: object) => {
    const json = JSON.stringify(msg);
    if (open && ws) ws.send(json);
    else outbox.push(json);
  };

  const connect = () => {
    if (ws) return;
    ws = new WebSocket(url, { headers: { "xi-api-key": env.ELEVENLABS_API_KEY } });

    ws.on("open", () => {
      open = true;
      // Initialize the stream with voice settings before any text.
      ws?.send(
        JSON.stringify({
          text: " ",
          voice_settings: { stability: 0.5, similarity_boost: 0.8, speed: 1.0 },
        }),
      );
      for (const json of outbox) ws?.send(json);
      outbox.length = 0;
    });

    ws.on("message", (raw: WebSocket.RawData) => {
      if (stopped) return;
      let data: ElevenAudioMessage;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (data.audio) opts.onAudio(Buffer.from(data.audio, "base64"));
      if (data.isFinal) opts.onDone?.();
    });

    ws.on("error", (err) => console.error("[tts] elevenlabs error", err));
    ws.on("close", () => {
      open = false;
      ws = null;
    });
  };

  return {
    speak(text: string) {
      if (stopped || !text) return;
      connect();
      enqueue({ text: `${text} `, try_trigger_generation: true });
    },
    flush() {
      if (stopped) return;
      enqueue({ text: "" }); // empty string flushes + ends generation
    },
    stop() {
      stopped = true;
      outbox.length = 0;
      ws?.close();
      ws = null;
    },
    close() {
      this.stop();
    },
  };
}
